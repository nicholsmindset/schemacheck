#!/usr/bin/env node

import { Command, Option } from 'commander';
import { runValidate } from './commands/validate.js';
import { runBatch } from './commands/batch.js';
import { OutputFormat } from './utils/output.js';

const program = new Command();

// ─── Shared options factory ───────────────────────────────────────────────────

function addSharedOptions(cmd: Command): Command {
  return cmd
    .addOption(
      new Option('--api-key <key>', 'SchemaCheck API key')
        .env('SCHEMACHECK_API_KEY')
    )
    .addOption(
      new Option('--format <format>', 'Output format')
        .choices(['table', 'summary', 'json'])
        .default('table')
    )
    .option('--fail-on-errors',   'Exit with code 1 if any errors are found')
    .option('--fail-on-warnings', 'Exit with code 1 if any warnings are found')
    .option('--min-score <n>',    'Exit with code 1 if score is below this threshold', parseFloat);
}

// ─── Root program ─────────────────────────────────────────────────────────────

program
  .name('schemacheck')
  .description('Validate schema markup (JSON-LD) via the SchemaCheck API')
  .version('0.1.0');

// ─── validate command ─────────────────────────────────────────────────────────

const validateCmd = program
  .command('validate [url]')
  .description('Validate a live URL or a local JSON-LD file')
  .option('--file <path>', 'Path to a local JSON-LD file to validate');

addSharedOptions(validateCmd).action(async (url: string | undefined, opts) => {
  await runValidate(url, {
    file:           opts.file,
    apiKey:         opts.apiKey ?? '',
    format:         (opts.format as OutputFormat) ?? 'table',
    failOnErrors:   opts.failOnErrors  ?? false,
    failOnWarnings: opts.failOnWarnings ?? false,
    minScore:       opts.minScore != null ? Number(opts.minScore) : null,
  });
});

// ─── batch command ────────────────────────────────────────────────────────────

const batchCmd = program
  .command('batch <urls-file>')
  .description('Validate multiple URLs listed in a file (one URL per line)');

addSharedOptions(batchCmd).action(async (urlsFile: string, opts) => {
  await runBatch(urlsFile, {
    apiKey:         opts.apiKey ?? '',
    format:         (opts.format as OutputFormat) ?? 'table',
    failOnErrors:   opts.failOnErrors  ?? false,
    failOnWarnings: opts.failOnWarnings ?? false,
    minScore:       opts.minScore != null ? Number(opts.minScore) : null,
  });
});

// ─── Parse ────────────────────────────────────────────────────────────────────

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${msg}`);
  process.exit(1);
});
