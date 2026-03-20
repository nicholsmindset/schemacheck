import { NextResponse } from "next/server";
import { validate, hashUrl, FetchError } from "@/lib/validator/index";
import {
  withAuth,
  handleCors,
  chargeCredit,
  errorResponse,
} from "@/lib/middleware";
import { supabase } from "@/lib/supabase";
import type { AuthResult, ValidationResponse } from "@/lib/validator/types";

// Vercel hobby plan: 30s max execution; we process within 25s to leave room for response flushing
export const maxDuration = 30;

const MAX_URLS           = 50;
const PER_URL_TIMEOUT_MS = 10_000;
// Reserve ~3s for overhead (auth, response serialization). Remaining budget is processing time.
const BATCH_TIMEOUT_MS   = 22_000;

// ============================================================
// OPTIONS — CORS preflight (no auth required)
// ============================================================
export const OPTIONS = handleCors;

// ============================================================
// POST /api/v1/validate/batch
// Body: { "urls": ["https://...", ...] }   — up to 50 URLs
// ============================================================
export const POST = withAuth(async (request: Request, auth: AuthResult) => {
  const batchStart = Date.now();

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("missing_input", "Request body must be valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("missing_input", "Request body must be a JSON object.");
  }

  const { urls } = body as Record<string, unknown>;

  if (!urls) {
    return errorResponse("missing_input", "The 'urls' field is required.");
  }

  if (!Array.isArray(urls)) {
    return errorResponse("missing_input", "The 'urls' field must be an array of strings.");
  }

  if (urls.length === 0) {
    return errorResponse("missing_input", "The 'urls' array must contain at least one URL.");
  }

  if (urls.length > MAX_URLS) {
    return errorResponse(
      "missing_input",
      `Maximum ${MAX_URLS} URLs per batch request. You submitted ${urls.length}.`
    );
  }

  // ── Classify URLs upfront — valid vs invalid ─────────────────────────────────
  type UrlTask = {
    index:    number;
    url:      string;
    valid:    boolean;
    errorMsg: string | null;
  };

  const tasks: UrlTask[] = urls.map((rawUrl, index) => {
    if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
      return { index, url: String(rawUrl), valid: false, errorMsg: "URL must be a non-empty string." };
    }
    try {
      const parsed = new URL(rawUrl.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { index, url: rawUrl.trim(), valid: false, errorMsg: "URL must use http:// or https://." };
      }
      return { index, url: rawUrl.trim(), valid: true, errorMsg: null };
    } catch {
      return { index, url: rawUrl.trim(), valid: false, errorMsg: `'${rawUrl.trim()}' is not a valid URL.` };
    }
  });

  const validTasks   = tasks.filter((t) => t.valid);
  const invalidTasks = tasks.filter((t) => !t.valid);

  // ── Process valid URLs concurrently ──────────────────────────────────────────
  // Each URL gets its own 10-second timeout. We also enforce a total batch
  // budget so we don't approach Vercel's 25s hard limit.

  type PerUrlResult =
    | { url: string; success: true;  data: Omit<ValidationResponse, "meta">; fromCache: boolean }
    | { url: string; success: false; error: string };

  // Wrap a single URL validation with cache check + per-URL timeout
  async function processUrl(url: string, remainingMs: number): Promise<PerUrlResult> {
    const perUrlDeadline = Math.min(PER_URL_TIMEOUT_MS, remainingMs);
    if (perUrlDeadline <= 0) {
      return { url, success: false, error: "Skipped — batch time budget exhausted." };
    }

    // Cache check
    try {
      const urlHash          = hashUrl(url);
      const { data: cached } = await supabase
        .from("validation_cache")
        .select("result, expires_at")
        .eq("url_hash", urlHash)
        .single();

      if (cached && new Date(cached.expires_at) > new Date()) {
        return { url, success: true, data: cached.result as Omit<ValidationResponse, "meta">, fromCache: true };
      }
    } catch {
      // Cache failure is non-fatal — proceed to live fetch
    }

    // Live validation with per-URL timeout
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new FetchError("fetch_timeout", `Timeout after ${Math.round(perUrlDeadline / 1000)}s`)),
          perUrlDeadline
        )
      );
      const data = await Promise.race([validate({ url }), timeoutPromise]);
      return { url, success: true, data, fromCache: false };
    } catch (err) {
      if (err instanceof FetchError) {
        return { url, success: false, error: err.message };
      }
      return { url, success: false, error: "An unexpected error occurred during validation." };
    }
  }

  // Build settlement promises for all valid tasks; the overall batch deadline
  // is checked inside processUrl so late tasks self-report as skipped.
  const settlementPromises = validTasks.map((task) => {
    const elapsed = Date.now() - batchStart;
    return processUrl(task.url, BATCH_TIMEOUT_MS - elapsed);
  });

  const settled = await Promise.allSettled(settlementPromises);

  // ── Cache new results and charge credits ─────────────────────────────────────
  // We charge one credit per successful, non-cached validation.
  // If the user runs out of quota mid-batch we keep going (overage billing applies
  // for paid plans; free plan callers would have been stopped by withAuth already).

  const { apiKey, creditsRemaining } = auth;

  let creditsUsed    = 0;
  let successCount   = 0;
  let failCount      = invalidTasks.length; // pre-seed with URL-format failures

  // Results indexed by original URL order
  type BatchResult =
    | {
        url:          string;
        success:      true;
        schemas_found: number;
        schemas:       ValidationResponse["schemas"];
        summary:       ValidationResponse["summary"];
        parse_errors?: string[];
        message?:      string;
      }
    | {
        url:     string;
        success: false;
        error:   string;
      };

  // We'll merge valid-task results and invalid-task errors into one ordered array
  const resultMap = new Map<string, BatchResult>();

  for (let i = 0; i < settled.length; i++) {
    const task      = validTasks[i];
    const settlement = settled[i];

    if (settlement.status === "rejected") {
      // Unexpected promise rejection (should not happen — processUrl catches internally)
      resultMap.set(task.url, { url: task.url, success: false, error: "Unexpected internal error." });
      failCount++;
      continue;
    }

    const outcome = settlement.value;

    if (!outcome.success) {
      resultMap.set(task.url, { url: outcome.url, success: false, error: outcome.error });
      failCount++;
      continue;
    }

    // Successful validation — cache and charge
    const { data, fromCache } = outcome;
    successCount++;

    if (!fromCache) {
      // Write to cache (fire-and-forget)
      const urlHash   = hashUrl(outcome.url);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      supabase.from("validation_cache").upsert(
        { url_hash: urlHash, url: outcome.url, result: data, expires_at: expiresAt },
        { onConflict: "url_hash" }
      ).then(({ error }) => {
        if (error) console.error("[batch/cache] upsert failed:", error.message);
      });

      // Charge one credit
      creditsUsed++;
      void chargeCredit(apiKey, {
        endpoint:         "/api/v1/validate/batch",
        input_type:       "url",
        schemas_found:    data.schemas_found,
        errors_found:     data.summary.total_errors,
        response_time_ms: Date.now() - batchStart,
      });
    }

    const entry: BatchResult = {
      url:           outcome.url,
      success:       true,
      schemas_found: data.schemas_found,
      schemas:       data.schemas,
      summary:       data.summary,
    };
    if (data.parse_errors && data.parse_errors.length > 0) {
      entry.parse_errors = data.parse_errors;
    }
    if ((data as { message?: string }).message) {
      entry.message = (data as { message?: string }).message;
    }
    resultMap.set(outcome.url, entry);
  }

  // Merge invalid URL entries
  for (const t of invalidTasks) {
    resultMap.set(t.url, { url: t.url, success: false, error: t.errorMsg! });
  }

  // Reconstruct results in original submission order
  const results: BatchResult[] = tasks.map((t) => {
    const found = resultMap.get(t.url);
    if (found) return found;
    // Fallback (should never be reached)
    return { url: t.url, success: false, error: "Result not recorded." };
  });

  const totalResponseTimeMs = Date.now() - batchStart;
  const truncated           = totalResponseTimeMs >= BATCH_TIMEOUT_MS;

  return NextResponse.json({
    success: true,
    results,
    meta: {
      total_urls:          tasks.length,
      successful:          successCount,
      failed:              failCount,
      credits_used:        creditsUsed,
      credits_remaining:   Math.max(0, creditsRemaining - creditsUsed),
      total_response_time_ms: totalResponseTimeMs,
      ...(truncated ? { truncated: true, truncated_reason: "Batch time budget (22s) exhausted before all URLs were processed." } : {}),
    },
  });
});
