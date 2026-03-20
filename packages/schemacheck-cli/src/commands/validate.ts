import fs from 'fs';
import path from 'path';
import { validateUrl, validateFile } from '../utils/api.js';
import {
  printTable,
  printSummary,
  printJson,
  resolveExitCode,
  OutputFormat,
  ExitOptions,
} from '../utils/output.js';
import { red } from '../utils/colors.js';

export interface ValidateOptions {
  file?:           string;
  apiKey:          string;
  format:          OutputFormat;
  failOnErrors:    boolean;
  failOnWarnings:  boolean;
  minScore:        number | null;
}

export async function runValidate(target: string | undefined, opts: ValidateOptions): Promise<void> {
  const apiKey = opts.apiKey || process.env['SCHEMACHECK_API_KEY'] || '';

  if (!apiKey) {
    console.error(red('Error: API key is required. Use --api-key or set SCHEMACHECK_API_KEY.'));
    process.exit(1);
  }

  let response;
  let label: string;

  try {
    if (opts.file) {
      // File-based validation
      const filePath = path.resolve(opts.file);
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

      let jsonld: unknown;
      try {
        jsonld = JSON.parse(raw);
      } catch {
        console.error(red(`Error: ${opts.file} does not contain valid JSON.`));
        process.exit(1);
      }

      label = path.basename(opts.file);
      response = await validateFile(jsonld, apiKey);
    } else {
      // URL-based validation
      if (!target) {
        console.error(red('Error: A URL is required. Usage: schemacheck validate <url>'));
        process.exit(1);
      }

      // Basic URL sanity check
      try {
        new URL(target);
      } catch {
        console.error(red(`Error: "${target}" is not a valid URL.`));
        process.exit(1);
      }

      label = target;
      response = await validateUrl(target, apiKey);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(red(`Error: ${msg}`));
    process.exit(1);
  }

  if (response.error) {
    console.error(red(`API error: ${response.error}`));
    process.exit(1);
  }

  // Normalise — API may omit schemas array on some responses
  if (!Array.isArray(response.schemas)) {
    response.schemas = [];
  }

  const exitOpts: ExitOptions = {
    failOnErrors:  opts.failOnErrors,
    failOnWarnings: opts.failOnWarnings,
    minScore:      opts.minScore,
  };

  switch (opts.format) {
    case 'json':
      printJson(response);
      break;
    case 'summary':
      printSummary(response, label);
      break;
    default:
      printTable(response, label);
  }

  process.exit(resolveExitCode(response, exitOpts));
}
