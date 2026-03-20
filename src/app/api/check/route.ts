import { NextRequest, NextResponse } from "next/server";
import { validate, FetchError } from "@/lib/validator/index";
import { supabase } from "@/lib/supabase";
import { createHash } from "crypto";

export const maxDuration = 30;
const HANDLER_TIMEOUT_MS = 25_000;
const DAILY_LIMIT = 3;

// ============================================================
// IP hash helper — never store raw IPs
// ============================================================
function hashIp(ip: string): string {
  return createHash("sha256").update(ip + (process.env.IP_HASH_SALT ?? "schemacheck-salt")).digest("hex").slice(0, 32);
}

function getTodayUtc(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ============================================================
// Rate-limit helpers using Supabase for persistence
// ============================================================
async function getRemainingChecks(ipHash: string, date: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("check_usage")
      .select("count")
      .eq("ip_hash", ipHash)
      .eq("date", date)
      .single();

    if (error || !data) return DAILY_LIMIT;
    return Math.max(0, DAILY_LIMIT - (data.count as number));
  } catch {
    // If Supabase fails, allow the request (fail open)
    return DAILY_LIMIT;
  }
}

async function incrementCheckCount(ipHash: string, date: string): Promise<number> {
  try {
    // Try to upsert: if row exists increment count, otherwise insert with count=1
    const { data: existing } = await supabase
      .from("check_usage")
      .select("count")
      .eq("ip_hash", ipHash)
      .eq("date", date)
      .single();

    const newCount = ((existing?.count as number) ?? 0) + 1;

    await supabase
      .from("check_usage")
      .upsert(
        { ip_hash: ipHash, date, count: newCount },
        { onConflict: "ip_hash,date" }
      );

    return Math.max(0, DAILY_LIMIT - newCount);
  } catch {
    // Fail open
    return DAILY_LIMIT - 1;
  }
}

// ============================================================
// POST /api/check
// Body: { url: string }
// ============================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  // Resolve IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const ipHash = hashIp(ip);
  const today = getTodayUtc();

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const { url } = body as Record<string, unknown>;

  if (!url || typeof url !== "string" || !url.trim()) {
    return NextResponse.json(
      { error: "invalid_request", message: "The 'url' field is required." },
      { status: 400 }
    );
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.trim());
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "invalid_url", message: "URL must use http:// or https://." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "invalid_url", message: `'${url}' is not a valid URL.` },
      { status: 400 }
    );
  }

  // Check rate limit BEFORE running validation
  const remaining = await getRemainingChecks(ipHash, today);

  if (remaining <= 0) {
    return NextResponse.json(
      {
        error: "rate_limit",
        message:
          "You've used your 3 free checks today. Sign up for a free API key to get 100 validations/month.",
        remaining: 0,
      },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  // Run validation
  let result: Awaited<ReturnType<typeof validate>>;
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new FetchError("fetch_timeout", "Validation timed out after 25 seconds.")),
        HANDLER_TIMEOUT_MS
      )
    );
    result = await Promise.race([validate({ url: parsedUrl.toString() }), timeoutPromise]);
  } catch (err) {
    if (err instanceof FetchError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        {
          status: err.code === "fetch_timeout" ? 504 : 422,
          headers: { "X-RateLimit-Remaining": String(remaining) },
        }
      );
    }
    console.error("[/api/check] Unexpected error:", err);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred during validation." },
      {
        status: 500,
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  }

  // Decrement quota after successful validation
  const newRemaining = await incrementCheckCount(ipHash, today);
  const responseTimeMs = Date.now() - start;

  return NextResponse.json(
    {
      ...result,
      remaining: newRemaining,
      meta: {
        validated_at: new Date().toISOString(),
        response_time_ms: responseTimeMs,
      },
    },
    {
      headers: { "X-RateLimit-Remaining": String(newRemaining) },
    }
  );
}
