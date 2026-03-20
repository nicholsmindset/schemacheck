"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runValidate = runValidate;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const api_js_1 = require("../utils/api.js");
const output_js_1 = require("../utils/output.js");
const colors_js_1 = require("../utils/colors.js");
async function runValidate(target, opts) {
    const apiKey = opts.apiKey || process.env['SCHEMACHECK_API_KEY'] || '';
    if (!apiKey) {
        console.error((0, colors_js_1.red)('Error: API key is required. Use --api-key or set SCHEMACHECK_API_KEY.'));
        process.exit(1);
    }
    let response;
    let label;
    try {
        if (opts.file) {
            // File-based validation
            const filePath = path_1.default.resolve(opts.file);
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
            let jsonld;
            try {
                jsonld = JSON.parse(raw);
            }
            catch {
                console.error((0, colors_js_1.red)(`Error: ${opts.file} does not contain valid JSON.`));
                process.exit(1);
            }
            label = path_1.default.basename(opts.file);
            response = await (0, api_js_1.validateFile)(jsonld, apiKey);
        }
        else {
            // URL-based validation
            if (!target) {
                console.error((0, colors_js_1.red)('Error: A URL is required. Usage: schemacheck validate <url>'));
                process.exit(1);
            }
            // Basic URL sanity check
            try {
                new URL(target);
            }
            catch {
                console.error((0, colors_js_1.red)(`Error: "${target}" is not a valid URL.`));
                process.exit(1);
            }
            label = target;
            response = await (0, api_js_1.validateUrl)(target, apiKey);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error((0, colors_js_1.red)(`Error: ${msg}`));
        process.exit(1);
    }
    if (response.error) {
        console.error((0, colors_js_1.red)(`API error: ${response.error}`));
        process.exit(1);
    }
    // Normalise — API may omit schemas array on some responses
    if (!Array.isArray(response.schemas)) {
        response.schemas = [];
    }
    const exitOpts = {
        failOnErrors: opts.failOnErrors,
        failOnWarnings: opts.failOnWarnings,
        minScore: opts.minScore,
    };
    switch (opts.format) {
        case 'json':
            (0, output_js_1.printJson)(response);
            break;
        case 'summary':
            (0, output_js_1.printSummary)(response, label);
            break;
        default:
            (0, output_js_1.printTable)(response, label);
    }
    process.exit((0, output_js_1.resolveExitCode)(response, exitOpts));
}
//# sourceMappingURL=validate.js.map