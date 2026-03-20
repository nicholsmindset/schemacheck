export interface SchemaResult {
    type: string;
    valid: boolean;
    richResultEligible: boolean;
    errors: string[];
    warnings: string[];
}
export interface ValidationResponse {
    url?: string;
    score: number;
    schemas: SchemaResult[];
    error?: string;
}
export interface BatchValidationResponse {
    results: Array<{
        url: string;
        score: number;
        schemas: SchemaResult[];
        error?: string;
    }>;
}
export declare function validateUrl(url: string, apiKey: string): Promise<ValidationResponse>;
export declare function validateFile(jsonld: unknown, apiKey: string): Promise<ValidationResponse>;
export declare function validateBatch(urls: string[], apiKey: string): Promise<BatchValidationResponse>;
//# sourceMappingURL=api.d.ts.map