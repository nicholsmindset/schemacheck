import { OutputFormat } from '../utils/output.js';
export interface BatchOptions {
    apiKey: string;
    format: OutputFormat;
    failOnErrors: boolean;
    failOnWarnings: boolean;
    minScore: number | null;
}
export declare function runBatch(urlsFile: string | undefined, opts: BatchOptions): Promise<void>;
//# sourceMappingURL=batch.d.ts.map