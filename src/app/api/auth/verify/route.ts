/**
 * GET /api/auth/verify?token=XXX
 *
 * Consumes an email verification token, creates the API key, sets the
 * sc_session cookie, and redirects to /dashboard?welcome=1.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/dashboard-auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://schemacheck.dev";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get("token");

  if (!token || typeof token !== "string" || token.length < 10) {
    return NextResponse.redirect(`${APP_URL}/dashboard/login?error=invalid_token`);
  }

  // Look up the token
  const { data: verification, error: lookupError } = await supabase
    .from("email_verifications")
    .select("id, email, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (lookupError || !verification) {
    return NextResponse.redirect(`${APP_URL}/dashboard/login?error=invalid_token`);
  }

  // Check if already used
  if (verification.used_at) {
    return NextResponse.redirect(`${APP_URL}/dashboard/login?error=token_used`);
  }

  // Check if expired
  if (new Date(verification.expires_at) < new Date()) {
    return NextResponse.redirect(`${APP_URL}/dashboard/login?error=token_expired`);
  }

  // Mark token as used
  await supabase
    .from("email_verifications")
    .update({ used_at: new Date().toISOString() })
    .eq("id", verification.id);

  // Guard: email might already have a key (double-submit / race)
  const { data: existingKey } = await supabase
    .from("api_keys")
    .select("key")
    .eq("email", verification.email)
    .limit(1)
    .maybeSingle();

  let apiKey: string;

  if (existingKey) {
    apiKey = existingKey.key;
  } else {
    // Create the API key now that email is verified
    apiKey = `sc_live_${randomBytes(16).toString("hex")}`;

    const { error: insertError } = await supabase
      .from("api_keys")
      .insert({
        key: apiKey,
        email: verification.email,
        plan: "free",
        requests_used: 0,
        requests_limit: 100,
        overage_rate: 0,
        is_active: true,
        notified_90: false,
        notified_100: false,
      });

    if (insertError) {
      console.error("[verify] Failed to create API key:", insertError);
      return NextResponse.redirect(`${APP_URL}/dashboard/login?error=server_error`);
    }

    // Send welcome email — fire-and-forget
    void sendWelcomeEmail(verification.email, apiKey);
  }

  // Set session cookie and redirect to dashboard
  const response = NextResponse.redirect(`${APP_URL}/dashboard?welcome=1`);
  response.cookies.set(SESSION_COOKIE, apiKey, SESSION_COOKIE_OPTIONS);
  return response;
}
