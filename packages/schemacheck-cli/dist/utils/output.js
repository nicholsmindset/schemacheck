"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTable = printTable;
exports.printSummary = printSummary;
exports.printJson = printJson;
exports.resolveExitCode = resolveExitCode;
exports.printBatchTable = printBatchTable;
exports.printBatchSummary = printBatchSummary;
exports.resolveBatchExitCode = resolveBatchExitCode;
const colors_js_1 = require("./colors.js");
// ─── Shared helpers ───────────────────────────────────────────────────────────
function checkMark(ok) {
    return ok ? (0, colors_js_1.green)('✓') : (0, colors_js_1.red)('✗');
}
function eligibilityLabel(eligible) {
    return eligible ? (0, colors_js_1.green)('rich result eligible ✓') : (0, colors_js_1.yellow)('not eligible for rich results');
}
function validLabel(valid) {
    return valid ? (0, colors_js_1.green)('valid ✓') : (0, colors_js_1.red)('invalid ✗');
}
function errorCount(schemas) {
    return schemas.reduce((sum, s) => sum + s.errors.length, 0);
}
function warningCount(schemas) {
    return schemas.reduce((sum, s) => sum + s.warnings.length, 0);
}
// ─── Table format ─────────────────────────────────────────────────────────────
function formatSchemaTable(schema) {
    const lines = [];
    const header = `${(0, colors_js_1.cyan)(schema.type)} (${validLabel(schema.valid)}, ${eligibilityLabel(schema.richResultEligible)})`;
    lines.push(`  ${header}`);
    if (schema.errors.length === 0) {
        lines.push(`    ${(0, colors_js_1.dim)('No errors')}`);
    }
    else {
        for (const err of schema.errors) {
            lines.push(`    ${(0, colors_js_1.red)('✗')} ${err}`);
        }
    }
    if (schema.warnings.length === 0) {
        lines.push(`    ${(0, colors_js_1.dim)('No warnings')}`);
    }
    else {
        for (const warn of schema.warnings) {
            lines.push(`    ${(0, colors_js_1.yellow)('⚠')} ${warn}`);
        }
    }
    return lines.join('\n');
}
function printTable(response, label) {
    const totalErrors = errorCount(response.schemas);
    const totalWarnings = warningCount(response.schemas);
    const ok = totalErrors === 0;
    console.log('');
    console.log(`${checkMark(ok)} ${(0, colors_js_1.bold)('SchemaCheck')} — ${(0, colors_js_1.cyan)(label)}`);
    console.log(`${(0, colors_js_1.bold)('Score:')} ${response.score}/100`);
    if (response.schemas.length === 0) {
        console.log((0, colors_js_1.dim)('  No schemas found'));
    }
    else {
        console.log('');
        for (const schema of response.schemas) {
            console.log(formatSchemaTable(schema));
        }
    }
    console.log('');
}
// ─── Summary format ───────────────────────────────────────────────────────────
function printSummary(response, label) {
    const totalErrors = errorCount(response.schemas);
    const totalWarnings = warningCount(response.schemas);
    const ok = totalErrors === 0;
    const parts = [
        `Score: ${response.score}`,
        `${response.schemas.length} schema${response.schemas.length !== 1 ? 's' : ''}`,
        totalErrors === 0 ? (0, colors_js_1.green)(`0 errors`) : (0, colors_js_1.red)(`${totalErrors} error${totalErrors !== 1 ? 's' : ''}`),
        totalWarnings === 0 ? (0, colors_js_1.dim)(`0 warnings`) : (0, colors_js_1.yellow)(`${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`),
    ];
    console.log(`${checkMark(ok)} ${(0, colors_js_1.cyan)(label)} — ${parts.join(' | ')}`);
}
// ─── JSON format ──────────────────────────────────────────────────────────────
function printJson(data) {
    console.log(JSON.stringify(data, null, 2));
}
function resolveExitCode(response, opts) {
    if (opts.failOnErrors && errorCount(response.schemas) > 0)
        return 1;
    if (opts.failOnWarnings && warningCount(response.schemas) > 0)
        return 1;
    if (opts.minScore !== null && response.score < opts.minScore)
        return 1;
    return 0;
}
// ─── Batch output helpers ─────────────────────────────────────────────────────
function printBatchTable(results, labels) {
    for (let i = 0; i < results.length; i++) {
        printTable(results[i], labels[i]);
    }
}
function printBatchSummary(results, labels) {
    for (let i = 0; i < results.length; i++) {
        printSummary(results[i], labels[i]);
    }
    console.log('');
    const total = results.length;
    const passed = results.filter(r => errorCount(r.schemas) === 0).length;
    const failed = total - passed;
    const avgScore = total > 0
        ? Math.round(results.reduce((s, r) => s + r.score, 0) / total)
        : 0;
    console.log((0, colors_js_1.bold)(`Batch complete: ${passed}/${total} passed | avg score ${avgScore}`));
    if (failed > 0) {
        console.log((0, colors_js_1.red)(`${failed} URL${failed !== 1 ? 's' : ''} had errors`));
    }
}
function resolveBatchExitCode(results, opts) {
    for (const result of results) {
        if (resolveExitCode(result, opts) === 1)
            return 1;
    }
    return 0;
}
//# sourceMappingURL=output.js.map