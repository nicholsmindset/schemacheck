import { NextResponse } from "next/server";
import { supabase } from "./supabase";
import { checkRateLimit, getRateLimitReset } from "./rate-limit";
import { sendUsageAlert } from "./email";
import type {
  ApiKeyRow,
  AuthResult,
  UsageLogInsert,
  ApiError,
  ErrorCode,
} from "./validator/types";

// ============================================================
// CORS
// ============================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
} as const;

function addCors(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/** Handle OPTIONS preflight. Export as your route's OPTIONS handler. */
export function handleCors(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ============================================================
// Error code → HTTP status map
// ============================================================

const ERROR_STATUS: Record<ErrorCode, number> = {
  missing_api_key:     401,
  invalid_api_key:     401,
  inactive_api_key:    401,
  quota_exceeded:      429,
  rate_limit_exceeded: 429,
  missing_input:       400,
  invalid_url:         400,
  fetch_failed:        422,
  fetch_timeout:       422,
  no_schemas_found:    200,
  invalid_jsonld:      400,
  internal_error:      500,
};

/**
 * Build a structured error NextResponse.
 * CORS is added automatically by `withAuth` on the way out.
 * Use `handleCors()` for responses produced outside `withAuth` (e.g. OPTIONS).
 */
export function errorResponse(code: ErrorCode, message: string): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status: ERROR_STATUS[code] ?? 500 }
  );
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiError).error === "object"
  );
}

function createError(code: ErrorCode, message: string): ApiError {
  return { error: { code, message } };
}

// ============================================================
// withAuth — primary route handler wrapper
// ============================================================

type AuthedHandler = (request: Request, auth: AuthResult) => Promise<NextResponse>;

/**
 * Wraps a Next.js App Router route handler with the full auth middleware
 * pipeline and adds CORS headers to every response.
 *
 * Pipeline (in order):
 *   1. OPTIONS preflight  → 204 + CORS (no auth required)
 *   2. Extract API key    → x-api-key header preferred, access_key query param fallback
 *   3. Authenticate       → 401 if key not found or is_active is false
 *   4. Rate limit         → 429 if per-minute limit exceeded
 *   5. Quota              → 429 for free plan at limit; paid plans pass with isOverage=true
 *   6. Call handler       → receives (request, { apiKey, creditsRemaining, isOverage })
 *   7. CORS               → added to the handler's response (and all error responses)
 *
 * The handler is responsible for calling chargeCredit() or logNonCreditedRequest()
 * once it knows whether the result was cached, successful, or an error.
 *
 * @example
 * export const GET = withAuth(async (request, { apiKey, creditsRemaining }) => {
 *   // ... validate, check cache, etc. ...
 *   await chargeCredit(apiKey, logData);
 *   return NextResponse.json({ ...result, meta: { credits_remaining: creditsRemaining } });
 * });
 *
 * export const OPTIONS = handleCors;
 */
export function withAuth(handler: AuthedHandler) {
  return async function (request: Request): Promise<NextResponse> {
    // OPTIONS preflight — respond immediately without auth
    if (request.method === "OPTIONS") {
      return handleCors();
    }

    try {
      const key = extractApiKey(request);
      const apiKey = await authenticate(key);
      enforceRateLimit(apiKey);
      const isOverage = enforceQuota(apiKey);

      const creditsRemaining = Math.max(
        0,
        apiKey.requests_limit - apiKey.requests_used - 1
      );

      const auth: AuthResult = { apiKey, creditsRemaining, isOverage };
      const response = await handler(request, auth);
      return addCors(response);
    } catch (err) {
      if (isApiError(err)) {
        return addCors(
          NextResponse.json(err, { status: ERROR_STATUS[err.error.code] ?? 500 })
        );
      }
      console.error("[withAuth] Unhandled error:", err);
      return addCors(
        NextResponse.json(
          { error: { code: "internal_error", message: "An unexpected error occurred." } },
          { status: 500 }
        )
      );
    }
  };
}

// ============================================================
// Authentication
// ============================================================

/**
 * Look up the API key in Supabase.
 * Both "key not found" and "is_active = false" return the same error code
 * so callers cannot enumerate whether a key exists but is disabled.
 */
export async function authenticate(key: string): Promise<ApiKeyRow> {
  if (!key) {
    throw createError(
      "missing_api_key",
      "API key is required. Pass it via the x-api-key header or access_key query parameter."
    );
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key", key)
    .single();

  // Treat missing, DB error, and is_active=false identically to the client
  if (error || !data || !data.is_active) {
    throw createError("invalid_api_key", "Invalid or inactive API key.");
  }

  return data as ApiKeyRow;
}

// ============================================================
// Rate limiting
// ============================================================

const RATE_LIMIT_PER_PLAN: Record<string, number> = {
  free:   10,
  basic:  30,
  growth: 60,
  scale:  120,
};

export function enforceRateLimit(apiKey: ApiKeyRow): void {
  const allowed = checkRateLimit(apiKey.id, apiKey.plan);
  if (!allowed) {
    const resetMs  = getRateLimitReset(apiKey.id);
    const resetIso = new Date(Math.ceil(resetMs / 1000) * 1000).toISOString();
    throw createError(
      "rate_limit_exceeded",
      `Rate limit exceeded. Your ${apiKey.plan} plan allows ${RATE_LIMIT_PER_PLAN[apiKey.plan] ?? 10} requests per minute. Retry after ${resetIso}.`
    );
  }
}

// ============================================================
// Quota enforcement
// ============================================================

/**
 * Check the monthly request quota.
 *
 * - Under limit            → returns false (no overage)
 * - Free plan at limit     → throws 429 (hard stop)
 * - Paid plan at limit     → returns true (overage billing applies; request continues)
 */
export function enforceQuota(apiKey: ApiKeyRow): boolean {
  if (apiKey.requests_used < apiKey.requests_limit) return false;

  if (apiKey.plan === "free") {
    throw createError(
      "quota_exceeded",
      `You've used all ${apiKey.requests_limit} free validations this month. ` +
        "Upgrade at https://schemacheck.dev/pricing to continue."
    );
  }

  // Paid plan exceeded limit — allow through, flag for overage billing
  return true;
}

// ============================================================
// Credit charging & usage logging
// ============================================================

/**
 * Record a successful non-cached validation:
 *   - Increments requests_used by 1
 *   - Inserts a credited row into usage_logs
 *   - Asynchronously sets notified_90 / notified_100 flags (fire-and-forget)
 *
 * Call this only after a 200 response that consumed real work (not cached).
 * Do NOT call for error responses (4xx) or cache hits.
 */
export async function chargeCredit(
  apiKey: ApiKeyRow,
  logData: Omit<UsageLogInsert, "api_key_id" | "credited" | "cached">
): Promise<void> {
  const { error } = await supabase
    .from("api_keys")
    .update({ requests_used: apiKey.requests_used + 1 })
    .eq("id", apiKey.id);

  if (error) {
    console.error("[middleware] Failed to increment requests_used:", error);
  }

  await insertUsageLog({
    ...logData,
    api_key_id: apiKey.id,
    cached:     false,
    credited:   true,
  });

  // Check thresholds after incrementing — fire-and-forget, never blocks the response
  void setUsageThresholdFlags(apiKey);
}

/**
 * Log a non-credited request (cache hit or error path).
 * Does NOT touch requests_used.
 */
export async function logNonCreditedRequest(
  apiKey: ApiKeyRow,
  logData: Omit<UsageLogInsert, "api_key_id" | "credited">
): Promise<void> {
  await insertUsageLog({
    ...logData,
    api_key_id: apiKey.id,
    credited:   false,
  });
}

// ============================================================
// Private helpers
// ============================================================

async function insertUsageLog(data: UsageLogInsert): Promise<void> {
  const { error } = await supabase.from("usage_logs").insert(data);
  if (error) {
    console.error("[middleware] Failed to insert usage log:", error);
  }
}

/**
 * Set notified_90 / notified_100 flags and dispatch alert emails.
 * Idempotent — only fires if the flag isn't already set.
 * Called with `void` so the outer response is never delayed.
 */
async function setUsageThresholdFlags(apiKey: ApiKeyRow): Promise<void> {
  const used = apiKey.requests_used + 1; // reflect the increment just applied
  const pct  = (used / apiKey.requests_limit) * 100;

  if (pct >= 100 && !apiKey.notified_100) {
    await supabase.from("api_keys").update({ notified_100: true }).eq("id", apiKey.id);
    await sendUsageAlert(apiKey.email, 100, used, apiKey.requests_limit, apiKey.plan);
  } else if (pct >= 90 && !apiKey.notified_90) {
    await supabase.from("api_keys").update({ notified_90: true }).eq("id", apiKey.id);
    await sendUsageAlert(apiKey.email, 90, used, apiKey.requests_limit, apiKey.plan);
  }
}

// ============================================================
// Exported utilities
// ============================================================

/**
 * Extract the API key from the request.
 * x-api-key header is checked first; access_key query param is the fallback.
 * Returns an empty string (not null) so callers can pass it directly to authenticate().
 */
export function extractApiKey(request: Request): string {
  const headerKey = request.headers.get("x-api-key");
  if (headerKey) return headerKey;
  return new URL(request.url).searchParams.get("access_key") ?? "";
}
