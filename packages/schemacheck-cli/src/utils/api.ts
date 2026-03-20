import https from 'https';
import http from 'http';
import { URL } from 'url';

const BASE_URL = 'https://www.schemacheck.dev/api/v1';

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

function post(endpoint: string, body: Record<string, unknown>, apiKey: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const parsed = new URL(`${BASE_URL}${endpoint}`);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': apiKey,
        'User-Agent': 'schemacheck-cli/0.1.0',
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        if (!res.statusCode) {
          return reject(new Error('No response status code received'));
        }
        if (res.statusCode === 401) {
          return reject(new Error('Invalid or missing API key. Set SCHEMACHECK_API_KEY or pass --api-key.'));
        }
        if (res.statusCode === 429) {
          return reject(new Error('Rate limit exceeded. Please try again later.'));
        }
        if (res.statusCode >= 400) {
          let message = `API error (HTTP ${res.statusCode})`;
          try {
            const parsed = JSON.parse(data) as { error?: string; message?: string };
            message = parsed.error ?? parsed.message ?? message;
          } catch {
            // Use default message
          }
          return reject(new Error(message));
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Failed to parse API response as JSON'));
        }
      });
    });

    req.on('error', (err: Error) => reject(new Error(`Network error: ${err.message}`)));
    req.setTimeout(30_000, () => {
      req.destroy();
      reject(new Error('Request timed out after 30 seconds'));
    });

    req.write(payload);
    req.end();
  });
}

export async function validateUrl(url: string, apiKey: string): Promise<ValidationResponse> {
  const result = await post('/validate', { url }, apiKey);
  return result as ValidationResponse;
}

export async function validateFile(jsonld: unknown, apiKey: string): Promise<ValidationResponse> {
  const result = await post('/validate', { jsonld }, apiKey);
  return result as ValidationResponse;
}

export async function validateBatch(urls: string[], apiKey: string): Promise<BatchValidationResponse> {
  const result = await post('/validate/batch', { urls }, apiKey);
  return result as BatchValidationResponse;
}
