import fs from 'fs';
import path from 'path';
import { validateBatch, ValidationResponse } from '../utils/api.js';
import {
  printBatchTable,
  printBatchSummary,
  printJson,
  resolveBatchExitCode,
  OutputFormat,
  ExitOptions,
} from '../utils/output.js';
import { red, dim } from '../utils/colors.js';

export interface BatchOptions {
  apiKey:         string;
  format:         OutputFormat;
  failOnErrors:   boolean;
  failOnWarnings: boolean;
  minScore:       number | null;
}

function readUrlsFromFile(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    console.error(red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(red(`Error reading file: ${msg}`));
    process.exit(1);
  }

  const urls = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  if (urls.length === 0) {
    console.error(red('Error: No URLs found in file (empty or all lines are comments).'));
    process.exit(1);
  }

  return urls;
}

export async function runBatch(urlsFile: string | undefined, opts: BatchOptions): Promise<void> {
  const apiKey = opts.apiKey || process.env['SCHEMACHECK_API_KEY'] || '';

  if (!apiKey) {
    console.error(red('Error: API key is required. Use --api-key or set SCHEMACHECK_API_KEY.'));
    process.exit(1);
  }

  if (!urlsFile) {
    console.error(red('Error: A URLs file is required. Usage: schemacheck batch <urls-file>'));
    process.exit(1);
  }

  const filePath = path.resolve(urlsFile);
  const urls = readUrlsFromFile(filePath);

  // Validate each URL format before sending
  const invalidUrls: string[] = [];
  for (const url of urls) {
    try {
      new URL(url);
    } catch {
      invalidUrls.push(url);
    }
  }

  if (invalidUrls.length > 0) {
    console.error(red('Error: The following entries are not valid URLs:'));
    for (const u of invalidUrls) {
      console.error(`  ${dim(u)}`);
    }
    process.exit(1);
  }

  if (opts.format !== 'json') {
    console.log(dim(`Running batch validation for ${urls.length} URL${urls.length !== 1 ? 's' : ''}...`));
  }

  let batchResponse;
  try {
    batchResponse = await validateBatch(urls, apiKey);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(red(`Error: ${msg}`));
    process.exit(1);
  }

  // Normalise results — ensure schemas array exists on each result
  const results: ValidationResponse[] = (batchResponse.results ?? []).map((r) => ({
    ...r,
    schemas: Array.isArray(r.schemas) ? r.schemas : [],
  }));

  const labels = results.map((r) => r.url ?? '(unknown)');

  const exitOpts: ExitOptions = {
    failOnErrors:   opts.failOnErrors,
    failOnWarnings: opts.failOnWarnings,
    minScore:       opts.minScore,
  };

  switch (opts.format) {
    case 'json':
      printJson(batchResponse);
      break;
    case 'summary':
      console.log('');
      printBatchSummary(results, labels);
      break;
    default:
      printBatchTable(results, labels);
      console.log('');
  }

  process.exit(resolveBatchExitCode(results, exitOpts));
}
