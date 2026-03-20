"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBatch = runBatch;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const api_js_1 = require("../utils/api.js");
const output_js_1 = require("../utils/output.js");
const colors_js_1 = require("../utils/colors.js");
function readUrlsFromFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        console.error((0, colors_js_1.red)(`Error: File not found: ${filePath}`));
        process.exit(1);
    }
    let raw;
    try {
        raw = fs_1.default.readFileSync(filePath, 'utf-8');
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error((0, colors_js_1.red)(`Error reading file: ${msg}`));
        process.exit(1);
    }
    const urls = raw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'));
    if (urls.length === 0) {
        console.error((0, colors_js_1.red)('Error: No URLs found in file (empty or all lines are comments).'));
        process.exit(1);
    }
    return urls;
}
async function runBatch(urlsFile, opts) {
    const apiKey = opts.apiKey || process.env['SCHEMACHECK_API_KEY'] || '';
    if (!apiKey) {
        console.error((0, colors_js_1.red)('Error: API key is required. Use --api-key or set SCHEMACHECK_API_KEY.'));
        process.exit(1);
    }
    if (!urlsFile) {
        console.error((0, colors_js_1.red)('Error: A URLs file is required. Usage: schemacheck batch <urls-file>'));
        process.exit(1);
    }
    const filePath = path_1.default.resolve(urlsFile);
    const urls = readUrlsFromFile(filePath);
    // Validate each URL format before sending
    const invalidUrls = [];
    for (const url of urls) {
        try {
            new URL(url);
        }
        catch {
            invalidUrls.push(url);
        }
    }
    if (invalidUrls.length > 0) {
        console.error((0, colors_js_1.red)('Error: The following entries are not valid URLs:'));
        for (const u of invalidUrls) {
            console.error(`  ${(0, colors_js_1.dim)(u)}`);
        }
        process.exit(1);
    }
    if (opts.format !== 'json') {
        console.log((0, colors_js_1.dim)(`Running batch validation for ${urls.length} URL${urls.length !== 1 ? 's' : ''}...`));
    }
    let batchResponse;
    try {
        batchResponse = await (0, api_js_1.validateBatch)(urls, apiKey);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error((0, colors_js_1.red)(`Error: ${msg}`));
        process.exit(1);
    }
    // Normalise results — ensure schemas array exists on each result
    const results = (batchResponse.results ?? []).map((r) => ({
        ...r,
        schemas: Array.isArray(r.schemas) ? r.schemas : [],
    }));
    const labels = results.map((r) => r.url ?? '(unknown)');
    const exitOpts = {
        failOnErrors: opts.failOnErrors,
        failOnWarnings: opts.failOnWarnings,
        minScore: opts.minScore,
    };
    switch (opts.format) {
        case 'json':
            (0, output_js_1.printJson)(batchResponse);
            break;
        case 'summary':
            console.log('');
            (0, output_js_1.printBatchSummary)(results, labels);
            break;
        default:
            (0, output_js_1.printBatchTable)(results, labels);
            console.log('');
    }
    process.exit((0, output_js_1.resolveBatchExitCode)(results, exitOpts));
}
//# sourceMappingURL=batch.js.map