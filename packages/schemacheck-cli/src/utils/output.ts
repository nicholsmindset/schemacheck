import { ValidationResponse, SchemaResult } from './api.js';
import { green, red, yellow, cyan, bold, dim } from './colors.js';

export type OutputFormat = 'table' | 'summary' | 'json';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function checkMark(ok: boolean): string {
  return ok ? green('✓') : red('✗');
}

function eligibilityLabel(eligible: boolean): string {
  return eligible ? green('rich result eligible ✓') : yellow('not eligible for rich results');
}

function validLabel(valid: boolean): string {
  return valid ? green('valid ✓') : red('invalid ✗');
}

function errorCount(schemas: SchemaResult[]): number {
  return schemas.reduce((sum, s) => sum + s.errors.length, 0);
}

function warningCount(schemas: SchemaResult[]): number {
  return schemas.reduce((sum, s) => sum + s.warnings.length, 0);
}

// ─── Table format ─────────────────────────────────────────────────────────────

function formatSchemaTable(schema: SchemaResult): string {
  const lines: string[] = [];

  const header = `${cyan(schema.type)} (${validLabel(schema.valid)}, ${eligibilityLabel(schema.richResultEligible)})`;
  lines.push(`  ${header}`);

  if (schema.errors.length === 0) {
    lines.push(`    ${dim('No errors')}`);
  } else {
    for (const err of schema.errors) {
      lines.push(`    ${red('✗')} ${err}`);
    }
  }

  if (schema.warnings.length === 0) {
    lines.push(`    ${dim('No warnings')}`);
  } else {
    for (const warn of schema.warnings) {
      lines.push(`    ${yellow('⚠')} ${warn}`);
    }
  }

  return lines.join('\n');
}

export function printTable(response: ValidationResponse, label: string): void {
  const totalErrors   = errorCount(response.schemas);
  const totalWarnings = warningCount(response.schemas);
  const ok = totalErrors === 0;

  console.log('');
  console.log(`${checkMark(ok)} ${bold('SchemaCheck')} — ${cyan(label)}`);
  console.log(`${bold('Score:')} ${response.score}/100`);

  if (response.schemas.length === 0) {
    console.log(dim('  No schemas found'));
  } else {
    console.log('');
    for (const schema of response.schemas) {
      console.log(formatSchemaTable(schema));
    }
  }
  console.log('');
}

// ─── Summary format ───────────────────────────────────────────────────────────

export function printSummary(response: ValidationResponse, label: string): void {
  const totalErrors   = errorCount(response.schemas);
  const totalWarnings = warningCount(response.schemas);
  const ok = totalErrors === 0;

  const parts = [
    `Score: ${response.score}`,
    `${response.schemas.length} schema${response.schemas.length !== 1 ? 's' : ''}`,
    totalErrors === 0   ? green(`0 errors`)    : red(`${totalErrors} error${totalErrors !== 1 ? 's' : ''}`),
    totalWarnings === 0 ? dim(`0 warnings`)    : yellow(`${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`),
  ];

  console.log(`${checkMark(ok)} ${cyan(label)} — ${parts.join(' | ')}`);
}

// ─── JSON format ──────────────────────────────────────────────────────────────

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

// ─── Exit code helpers ────────────────────────────────────────────────────────

export interface ExitOptions {
  failOnErrors:   boolean;
  failOnWarnings: boolean;
  minScore:       number | null;
}

export function resolveExitCode(response: ValidationResponse, opts: ExitOptions): number {
  if (opts.failOnErrors && errorCount(response.schemas) > 0) return 1;
  if (opts.failOnWarnings && warningCount(response.schemas) > 0) return 1;
  if (opts.minScore !== null && response.score < opts.minScore) return 1;
  return 0;
}

// ─── Batch output helpers ─────────────────────────────────────────────────────

export function printBatchTable(results: ValidationResponse[], labels: string[]): void {
  for (let i = 0; i < results.length; i++) {
    printTable(results[i], labels[i]);
  }
}

export function printBatchSummary(results: ValidationResponse[], labels: string[]): void {
  for (let i = 0; i < results.length; i++) {
    printSummary(results[i], labels[i]);
  }
  console.log('');
  const total   = results.length;
  const passed  = results.filter(r => errorCount(r.schemas) === 0).length;
  const failed  = total - passed;
  const avgScore = total > 0
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / total)
    : 0;

  console.log(bold(`Batch complete: ${passed}/${total} passed | avg score ${avgScore}`));
  if (failed > 0) {
    console.log(red(`${failed} URL${failed !== 1 ? 's' : ''} had errors`));
  }
}

export function resolveBatchExitCode(
  results: ValidationResponse[],
  opts: ExitOptions
): number {
  for (const result of results) {
    if (resolveExitCode(result, opts) === 1) return 1;
  }
  return 0;
}
