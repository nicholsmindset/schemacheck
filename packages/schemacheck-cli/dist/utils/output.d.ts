import { ValidationResponse } from './api.js';
export type OutputFormat = 'table' | 'summary' | 'json';
export declare function printTable(response: ValidationResponse, label: string): void;
export declare function printSummary(response: ValidationResponse, label: string): void;
export declare function printJson(data: unknown): void;
export interface ExitOptions {
    failOnErrors: boolean;
    failOnWarnings: boolean;
    minScore: number | null;
}
export declare function resolveExitCode(response: ValidationResponse, opts: ExitOptions): number;
export declare function printBatchTable(results: ValidationResponse[], labels: string[]): void;
export declare function printBatchSummary(results: ValidationResponse[], labels: string[]): void;
export declare function resolveBatchExitCode(results: ValidationResponse[], opts: ExitOptions): number;
//# sourceMappingURL=output.d.ts.map