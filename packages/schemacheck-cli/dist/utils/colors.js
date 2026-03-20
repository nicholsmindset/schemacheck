"use strict";
// Minimal ANSI color helpers — no external deps required.
// Checks NO_COLOR and non-TTY environments to disable automatically.
Object.defineProperty(exports, "__esModule", { value: true });
exports.dim = exports.bold = exports.cyan = exports.yellow = exports.red = exports.green = void 0;
const enabled = process.env.NO_COLOR === undefined &&
    process.env.TERM !== 'dumb' &&
    (process.stdout.isTTY ?? false);
function wrap(code, reset) {
    return (text) => enabled ? `\x1b[${code}m${text}\x1b[${reset}m` : text;
}
exports.green = wrap('32', '39');
exports.red = wrap('31', '39');
exports.yellow = wrap('33', '39');
exports.cyan = wrap('36', '39');
exports.bold = wrap('1', '22');
exports.dim = wrap('2', '22');
//# sourceMappingURL=colors.js.map