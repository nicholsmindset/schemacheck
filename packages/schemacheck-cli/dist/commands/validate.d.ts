import { OutputFormat } from '../utils/output.js';
export interface ValidateOptions {
    file?: string;
    apiKey: string;
    format: OutputFormat;
    failOnErrors: boolean;
    failOnWarnings: boolean;
    minScore: number | null;
}
export declare function runValidate(target: string | undefined, opts: ValidateOptions): Promise<void>;
//# sourceMappingURL=validate.d.ts.map