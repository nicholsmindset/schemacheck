// ============================================================
// SchemaCheck — Shared TypeScript Types
// ============================================================

// Raw JSON-LD object (unknown structure from the page)
export type JsonLdObject = Record<string, unknown>;

// ============================================================
// Schema Rule File (src/data/schema-rules/*.json)
// ============================================================

export interface SchemaRule {
  type: string;
  deprecated: boolean;
  deprecation_note: string | null;
  deprecated_since?: string;
  google_docs_url: string;
  required_properties: string[];
  recommended_properties: string[];
  rich_result_required: string[];
  property_types?: Record<string, string>;
}

// ============================================================
// Validation Output
// ============================================================

export type IssueSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  severity: IssueSeverity;
  property: string;
  message: string;
  fix: string;
  google_docs_url?: string;
}

export interface RichResultStatus {
  eligible:        boolean;
  reason:          string;
  google_docs_url: string;
}

export interface SchemaValidationResult {
  type: string;
  /** Indicates how thorough the validation is for this schema type.
   *  "full"     — Tier 1: deep nested checks, format validation, comprehensive fixes
   *  "standard" — Tier 2: required + recommended checks with type validation
   *  "basic"    — Tier 3–4 + deprecated: required property checks only
   */
  validation_depth: "full" | "standard" | "basic";
  valid: boolean;
  rich_result_eligible: boolean;
  deprecated: boolean;
  deprecation_note: string | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  properties_found: string[];
  properties_missing_required: string[];
  properties_missing_recommended: string[];
  raw_jsonld: JsonLdObject;
  rich_result?: RichResultStatus;
}

export interface ValidationSummary {
  total_schemas: number;
  valid_schemas: number;
  invalid_schemas: number;
  total_errors: number;
  total_warnings: number;
  rich_result_eligible: number;
  /** Overall score 0–100 */
  score: number;
}

export interface ValidationMeta {
  api_version: string;
  validated_at: string;
  cached: boolean;
  credits_used: number;
  credits_remaining: number;
  response_time_ms: number;
}

export interface ValidationResponse {
  success: true;
  url?: string;
  schemas_found: number;
  schemas: SchemaValidationResult[];
  summary: ValidationSummary;
  /** JSON parse errors from malformed <script type="application/ld+json"> blocks */
  parse_errors?: string[];
  /** Human-readable context message (e.g. when no schemas are found) */
  message?: string;
  meta: ValidationMeta;
}

// ============================================================
// API Error Response
// ============================================================

export type ErrorCode =
  | "missing_api_key"
  | "invalid_api_key"
  | "inactive_api_key"
  | "quota_exceeded"
  | "rate_limit_exceeded"
  | "missing_input"
  | "invalid_url"
  | "fetch_failed"
  | "fetch_timeout"
  | "no_schemas_found"
  | "invalid_jsonld"
  | "internal_error";

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
  };
}

// ============================================================
// Validator Input
// ============================================================

export interface ValidateInput {
  url?: string;
  jsonld?: JsonLdObject | JsonLdObject[];
}

// ============================================================
// Database Row Types
// ============================================================

export interface ApiKeyRow {
  id: string;
  key: string;
  email: string;
  plan: "free" | "basic" | "growth" | "scale";
  requests_used: number;
  requests_limit: number;
  overage_rate: number;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  is_active: boolean;
  notified_90: boolean;
  notified_100: boolean;
}

export interface UsageLogInsert {
  api_key_id: string;
  endpoint: string;
  input_type: "url" | "jsonld";
  schemas_found: number;
  errors_found: number;
  response_time_ms: number;
  cached: boolean;
  credited: boolean;
}

export interface CacheRow {
  id: string;
  url_hash: string;
  url: string;
  result: ValidationResponse;
  created_at: string;
  expires_at: string;
}

// ============================================================
// Middleware Result
// ============================================================

export interface AuthResult {
  apiKey: ApiKeyRow;
  creditsRemaining: number;
  /** true when a paid plan has exceeded its monthly limit and overage billing applies */
  isOverage: boolean;
}
