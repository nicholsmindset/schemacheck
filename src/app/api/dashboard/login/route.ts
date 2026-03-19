/**
 * POST /api/dashboard/login
 *
 * Accepts { email }, looks up the active API key, and sets an httpOnly
 * sc_session cookie. Returns { ok: true } on success.
 *
 * This is intentionally separate from /api/auth/login, which returns the raw
 * API key in the response body for API consumers. This route sets a cookie
 * instead — the key never appears in the client-side response.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/dashboard-auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Guard against missing Supabase env vars — prevents HTML 500 from crashing the client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[dashboard/login] Missing Supabase env vars");
    return NextResponse.json(
      { error: { code: "internal_error", message: "Service configuration error. Please contact support." } },
      { status: 500 }
    );
  }

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
    .select("key, email, plan")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[dashboard/login] Supabase error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "An unexpected error occurred. Please try again." } },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        error: {
          code: "not_found",
          message:
            "No account found for that email. Sign up below to get a free API key.",
        },
      },
      { status: 404 }
    );
  }

  const response = NextResponse.json({ ok: true, plan: data.plan });
  response.cookies.set(SESSION_COOKIE, data.key, SESSION_COOKIE_OPTIONS);
  return response;
}
