import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/dashboard-auth";

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

  // Already has a verified API key — redirect to login
  const { data: existing } = await supabase
    .from("api_keys")
    .select("id")
    .eq("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: {
          code: "email_exists",
          message:
            "An account already exists for this email. Sign in below to access your dashboard.",
        },
      },
      { status: 409 }
    );
  }

  // Create API key immediately — users get instant access without waiting for email
  const apiKey = `sc_live_${randomBytes(16).toString("hex")}`;

  const { error: keyError } = await supabase
    .from("api_keys")
    .insert({
      key: apiKey,
      email: normalizedEmail,
      plan: "free",
      requests_used: 0,
      requests_limit: 100,
      overage_rate: 0,
      is_active: true,
      notified_90: false,
      notified_100: false,
    });

  if (keyError) {
    console.error("[signup] Failed to create API key:", keyError);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Failed to create account. Please try again." } },
      { status: 500 }
    );
  }

  // Invalidate any existing unused verification tokens for this email
  await supabase
    .from("email_verifications")
    .update({ used_at: new Date().toISOString() })
    .eq("email", normalizedEmail)
    .is("used_at", null);

  // Generate verification token for email confirmation (optional but good hygiene)
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("email_verifications")
    .insert({ email: normalizedEmail, token, expires_at: expiresAt });

  // Send verification email — fire-and-forget
  void sendVerificationEmail(normalizedEmail, token);

  // Set session cookie so user lands on dashboard on next load
  const response = NextResponse.json(
    { ok: true, email: normalizedEmail, api_key: apiKey },
    { status: 200 }
  );
  response.cookies.set(SESSION_COOKIE, apiKey, SESSION_COOKIE_OPTIONS);
  return response;
}
