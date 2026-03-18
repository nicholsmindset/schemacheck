import { NextResponse } from "next/server";
import { validate, hashUrl, FetchError } from "@/lib/validator/index";
import {
  withAuth,
  handleCors,
  chargeCredit,
  logNonCreditedRequest,
  errorResponse,
} from "@/lib/middleware";
import { supabase } from "@/lib/supabase";
import type { AuthResult, ValidateInput, ValidationResponse } from "@/lib/validator/types";

// Vercel hobby plan: 30s max execution; we abort at 25s to leave time for response flushing
export const maxDuration = 30;
const HANDLER_TIMEOUT_MS = 25_000;

// ============================================================
// OPTIONS — CORS preflight (no auth required)
// ============================================================
export const OPTIONS = handleCors;

// ============================================================
// GET /api/v1/validate?url=https://example.com&access_key=...
// ============================================================
export const GET = withAuth(async (request, auth) => {
  const start     = Date.now();
  const targetUrl = new URL(request.url).searchParams.get("url");

  if (!targetUrl) {
    return errorResponse("missing_input", "The 'url' query parameter is required.");
  }

  return handleValidation(auth, { url: targetUrl }, start, "url");
});

// ============================================================
// POST /api/v1/validate
// Body: { "url": "https://..." } or { "jsonld": { ... } }
// ============================================================
export const POST = withAuth(async (request, auth) => {
  const start = Date.now();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("missing_input", "Request body must be valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("missing_input", "Request body must be a JSON object.");
  }

  const { url, jsonld } = body as Record<string, unknown>;

  if (!url && !jsonld) {
    return errorResponse(
      "missing_input",
      "Provide either 'url' or 'jsonld' in the request body."
    );
  }

  if (url !== undefined && typeof url !== "string") {
    return errorResponse("invalid_url", "The 'url' field must be a string.");
  }

  const input: ValidateInput = url
    ? { url: url as string }
    : { jsonld: jsonld as ValidateInput["jsonld"] };

  return handleValidation(auth, input, start, url ? "url" : "jsonld");
});

// ============================================================
// Shared validation pipeline
// ============================================================
async function handleValidation(
  auth:      AuthResult,
  input:     ValidateInput,
  start:     number,
  inputType: "url" | "jsonld"
): Promise<NextResponse> {
  const { apiKey, creditsRemaining } = auth;

  // 1. Validate URL format
  if (input.url) {
    try {
      const parsed = new URL(input.url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return errorResponse("invalid_url", "URL must use http:// or https://.");
      }
    } catch {
      return errorResponse("invalid_url", `'${input.url}' is not a valid URL.`);
    }
  }

  // 2. Cache check (URL requests only)
  if (input.url) {
    const urlHash          = hashUrl(input.url);
    const { data: cached } = await supabase
      .from("validation_cache")
      .select("result, expires_at")
      .eq("url_hash", urlHash)
      .single();

    if (cached && new Date(cached.expires_at) > new Date()) {
      const responseTimeMs  = Date.now() - start;
      const cachedResult    = cached.result as ValidationResponse;

      // Log cache hit — not credited, never increments requests_used
      void logNonCreditedRequest(apiKey, {
        endpoint:         "/api/v1/validate",
        input_type:       "url",
        schemas_found:    cachedResult.schemas_found,
        errors_found:     cachedResult.summary.total_errors,
        response_time_ms: responseTimeMs,
        cached:           true,
      });

      return NextResponse.json({
        ...cachedResult,
        meta: {
          api_version:       "1.0",
          validated_at:      new Date().toISOString(),
          cached:            true,
          credits_used:      0,
          credits_remaining: Math.max(0, apiKey.requests_limit - apiKey.requests_used),
          response_time_ms:  responseTimeMs,
        },
      });
    }
  }

  // 3. Run validation with a 25-second hard timeout
  let result: Awaited<ReturnType<typeof validate>>;
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new FetchError("fetch_timeout", "Validation timed out after 25 seconds.")),
        HANDLER_TIMEOUT_MS
      )
    );
    result = await Promise.race([validate(input), timeoutPromise]);
  } catch (err) {
    if (err instanceof FetchError) {
      return errorResponse(err.code, err.message);
    }
    console.error("[validate] Unexpected error:", err);
    return errorResponse("internal_error", "An unexpected error occurred during validation.");
  }

  const responseTimeMs = Date.now() - start;

  // 4. Cache the result (URL requests only, fire-and-forget)
  if (input.url) {
    const urlHash   = hashUrl(input.url);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    void supabase.from("validation_cache").upsert(
      { url_hash: urlHash, url: input.url, result, expires_at: expiresAt },
      { onConflict: "url_hash" }
    );
  }

  // 5. Charge credit + log (increment awaited; threshold alerts fire-and-forget)
  await chargeCredit(apiKey, {
    endpoint:         "/api/v1/validate",
    input_type:       inputType,
    schemas_found:    result.schemas_found,
    errors_found:     result.summary.total_errors,
    response_time_ms: responseTimeMs,
  });

  // 6. Return
  return NextResponse.json({
    ...result,
    meta: {
      api_version:       "1.0",
      validated_at:      new Date().toISOString(),
      cached:            false,
      credits_used:      1,
      credits_remaining: creditsRemaining,
      response_time_ms:  responseTimeMs,
    },
  });
}
