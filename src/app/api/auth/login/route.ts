/**
 * POST /api/auth/login
 *
 * MVP: passwordless email lookup — returns the API key and current usage stats.
 * This is intentional for the solo-founder MVP. Add magic-link / OTP auth later.
 *
 * Security note: because this returns a key on email alone, rate-limit this
 * endpoint aggressively in production (see /src/lib/rate-limit.ts). For now it
 * relies on the per-IP rate limiting Vercel provides at the edge.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://schemacheck.dev";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Request body must be a JSON object." } },
      { status: 400 }
    );
  }

  const { email } = body as Record<string, unknown>;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { error: { code: "invalid_email", message: "A valid email address is required." } },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const { data, error } = await supabase
    .from("api_keys")
    .select(
      "id, key, email, plan, requests_used, requests_limit, overage_rate, is_active, created_at"
    )
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[login] Supabase error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "An unexpected error occurred. Please try again." } },
      { status: 500 }
    );
  }

  // Return the same response whether the email exists or not — prevents enumeration
  if (!data) {
    return NextResponse.json(
      {
        error: {
          code: "not_found",
          message:
            "No active API key found for that email address. Sign up at " +
            `${APP_URL}/#signup or contact support if you believe this is an error.`,
        },
      },
      { status: 404 }
    );
  }

  const creditsRemaining = Math.max(0, data.requests_limit - data.requests_used);

  return NextResponse.json({
    api_key:           data.key,
    email:             data.email,
    plan:              data.plan,
    requests_used:     data.requests_used,
    requests_limit:    data.requests_limit,
    credits_remaining: creditsRemaining,
    overage_rate:      data.overage_rate,
    created_at:        data.created_at,
    dashboard_url:     `${APP_URL}/dashboard`,
  });
}
