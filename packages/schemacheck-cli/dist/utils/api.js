"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUrl = validateUrl;
exports.validateFile = validateFile;
exports.validateBatch = validateBatch;
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const BASE_URL = 'https://www.schemacheck.dev/api/v1';
function post(endpoint, body, apiKey) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const parsed = new url_1.URL(`${BASE_URL}${endpoint}`);
        const isHttps = parsed.protocol === 'https:';
        const lib = isHttps ? https_1.default : http_1.default;
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
            res.on('data', (chunk) => { data += chunk.toString(); });
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
                        const parsed = JSON.parse(data);
                        message = parsed.error ?? parsed.message ?? message;
                    }
                    catch {
                        // Use default message
                    }
                    return reject(new Error(message));
                }
                try {
                    resolve(JSON.parse(data));
                }
                catch {
                    reject(new Error('Failed to parse API response as JSON'));
                }
            });
        });
        req.on('error', (err) => reject(new Error(`Network error: ${err.message}`)));
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timed out after 30 seconds'));
        });
        req.write(payload);
        req.end();
    });
}
async function validateUrl(url, apiKey) {
    const result = await post('/validate', { url }, apiKey);
    return result;
}
async function validateFile(jsonld, apiKey) {
    const result = await post('/validate', { jsonld }, apiKey);
    return result;
}
async function validateBatch(urls, apiKey) {
    const result = await post('/validate/batch', { urls }, apiKey);
    return result;
}
//# sourceMappingURL=api.js.map