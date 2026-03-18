import { createHash } from "crypto";
import { extractFromUrl, extractFromHtml, FetchError } from "./extractor";
import { parseSchemas } from "./parser";
import { validateSchema } from "./rules-engine";
import { enrichRichResultEligibility } from "./rich-results";
import type {
  ValidateInput,
  ValidationResponse,
  ValidationSummary,
  SchemaValidationResult,
  JsonLdObject,
} from "./types";

export { FetchError };

const NO_SCHEMAS_MESSAGE =
  "No JSON-LD structured data was found on this page. " +
  "Add schema markup to enable rich results in Google Search. " +
  "See https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data";

/**
 * Core validate function.
 * Returns the full validation response (without meta — caller adds credits/timing).
 */
export async function validate(
  input: ValidateInput
): Promise<Omit<ValidationResponse, "meta">> {
  let rawBlocks: JsonLdObject[];
  let parse_errors: string[] = [];
  let targetUrl: string | undefined;

  if (input.url) {
    targetUrl = input.url;
    const extracted = await extractFromUrl(input.url);
    rawBlocks    = extracted.schemas;
    parse_errors = extracted.parse_errors;
  } else if (input.jsonld) {
    const jsonld = input.jsonld;
    rawBlocks = Array.isArray(jsonld) ? jsonld : [jsonld];
  } else {
    throw new Error("missing_input");
  }

  // Flatten @graph blocks and filter to typed schemas
  const schemas = parseSchemas(rawBlocks);

  // Validate each schema against rules
  let results: SchemaValidationResult[] = schemas.map(validateSchema);

  // Enrich with additional rich result checks
  results = enrichRichResultEligibility(results);

  const summary = computeSummary(results);

  return {
    success:      true,
    ...(targetUrl ? { url: targetUrl } : {}),
    schemas_found: results.length,
    schemas:       results,
    summary,
    ...(parse_errors.length > 0 ? { parse_errors } : {}),
    ...(results.length === 0     ? { message: NO_SCHEMAS_MESSAGE } : {}),
  };
}

/**
 * Extract all JSON-LD from raw HTML string (used for testing and direct HTML input).
 */
export function validateHtml(html: string): Omit<ValidationResponse, "meta"> {
  const { schemas: rawBlocks, parse_errors } = extractFromHtml(html);
  const schemas = parseSchemas(rawBlocks);
  let results: SchemaValidationResult[] = schemas.map(validateSchema);
  results = enrichRichResultEligibility(results);
  const summary = computeSummary(results);

  return {
    success:       true,
    schemas_found: results.length,
    schemas:       results,
    summary,
    ...(parse_errors.length > 0 ? { parse_errors } : {}),
    ...(results.length === 0    ? { message: NO_SCHEMAS_MESSAGE } : {}),
  };
}

function computeSummary(results: SchemaValidationResult[]): ValidationSummary {
  const validCount    = results.filter((r) => r.valid).length;
  const totalErrors   = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const richEligible  = results.filter((r) => r.rich_result_eligible).length;

  // Score: start at 100, deduct for errors and warnings
  const total = results.length;
  let score   = 100;
  if (total > 0) {
    const errorPenalty   = (totalErrors   / total) * 40;
    const warningPenalty = (totalWarnings / total) * 10;
    score = Math.max(0, Math.round(100 - errorPenalty - warningPenalty));
  }

  return {
    total_schemas:        total,
    valid_schemas:        validCount,
    invalid_schemas:      total - validCount,
    total_errors:         totalErrors,
    total_warnings:       totalWarnings,
    rich_result_eligible: richEligible,
    score,
  };
}

/**
 * Compute SHA-256 hash of a normalized URL for cache keying.
 * Normalization: lowercase, strip trailing slash.
 */
export function hashUrl(url: string): string {
  const normalized = url.trim().toLowerCase().replace(/\/$/, "");
  return createHash("sha256").update(normalized).digest("hex");
}

// Re-export types for convenience
export type { ValidateInput, ValidationResponse };
