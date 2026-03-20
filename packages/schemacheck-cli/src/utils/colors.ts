// Minimal ANSI color helpers — no external deps required.
// Checks NO_COLOR and non-TTY environments to disable automatically.

const enabled =
  process.env.NO_COLOR === undefined &&
  process.env.TERM !== 'dumb' &&
  (process.stdout.isTTY ?? false);

function wrap(code: string, reset: string) {
  return (text: string): string =>
    enabled ? `\x1b[${code}m${text}\x1b[${reset}m` : text;
}

export const green  = wrap('32', '39');
export const red    = wrap('31', '39');
export const yellow = wrap('33', '39');
export const cyan   = wrap('36', '39');
export const bold   = wrap('1',  '22');
export const dim    = wrap('2',  '22');
