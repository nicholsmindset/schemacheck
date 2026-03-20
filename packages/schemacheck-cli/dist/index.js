#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const validate_js_1 = require("./commands/validate.js");
const batch_js_1 = require("./commands/batch.js");
const program = new commander_1.Command();
// ─── Shared options factory ───────────────────────────────────────────────────
function addSharedOptions(cmd) {
    return cmd
        .addOption(new commander_1.Option('--api-key <key>', 'SchemaCheck API key')
        .env('SCHEMACHECK_API_KEY'))
        .addOption(new commander_1.Option('--format <format>', 'Output format')
        .choices(['table', 'summary', 'json'])
        .default('table'))
        .option('--fail-on-errors', 'Exit with code 1 if any errors are found')
        .option('--fail-on-warnings', 'Exit with code 1 if any warnings are found')
        .option('--min-score <n>', 'Exit with code 1 if score is below this threshold', parseFloat);
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
addSharedOptions(validateCmd).action(async (url, opts) => {
    await (0, validate_js_1.runValidate)(url, {
        file: opts.file,
        apiKey: opts.apiKey ?? '',
        format: opts.format ?? 'table',
        failOnErrors: opts.failOnErrors ?? false,
        failOnWarnings: opts.failOnWarnings ?? false,
        minScore: opts.minScore != null ? Number(opts.minScore) : null,
    });
});
// ─── batch command ────────────────────────────────────────────────────────────
const batchCmd = program
    .command('batch <urls-file>')
    .description('Validate multiple URLs listed in a file (one URL per line)');
addSharedOptions(batchCmd).action(async (urlsFile, opts) => {
    await (0, batch_js_1.runBatch)(urlsFile, {
        apiKey: opts.apiKey ?? '',
        format: opts.format ?? 'table',
        failOnErrors: opts.failOnErrors ?? false,
        failOnWarnings: opts.failOnWarnings ?? false,
        minScore: opts.minScore != null ? Number(opts.minScore) : null,
    });
});
// ─── Parse ────────────────────────────────────────────────────────────────────
program.parseAsync(process.argv).catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${msg}`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map