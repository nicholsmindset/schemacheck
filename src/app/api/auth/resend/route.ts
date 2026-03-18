/**
 * POST /api/auth/resend
 *
 * Body: { email }
 * Throttle: can only resend if the last token was created > 60 seconds ago.
 * Invalidates the old token and issues a fresh one (24h expiry).
 */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email";

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

  const { email } = (body ?? {}) as Record<string, unknown>;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { error: { code: "invalid_email", message: "A valid email address is required." } },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // If they already have a verified API key, no need to resend
  const { data: existingKey } = await supabase
    .from("api_keys")
    .select("id")
    .eq("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (existingKey) {
    return NextResponse.json(
      { error: { code: "already_verified", message: "This email is already verified. Sign in instead." } },
      { status: 409 }
    );
  }

  // Find the most recent unused token
  const { data: pending } = await supabase
    .from("email_verifications")
    .select("id, created_at")
    .eq("email", normalizedEmail)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Throttle: if a token was created < 60s ago, reject
  if (pending) {
    const createdAt = new Date(pending.created_at).getTime();
    const secondsSince = (Date.now() - createdAt) / 1000;
    if (secondsSince < 60) {
      return NextResponse.json(
        {
          error: {
            code: "too_soon",
            message: `Please wait ${Math.ceil(60 - secondsSince)} seconds before requesting another email.`,
          },
        },
        { status: 429 }
      );
    }
  }

  // Invalidate all existing unused tokens
  await supabase
    .from("email_verifications")
    .update({ used_at: new Date().toISOString() })
    .eq("email", normalizedEmail)
    .is("used_at", null);

  // Issue new token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase
    .from("email_verifications")
    .insert({ email: normalizedEmail, token, expires_at: expiresAt });

  if (insertError) {
    console.error("[resend] Failed to create token:", insertError);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Failed to resend verification email." } },
      { status: 500 }
    );
  }

  void sendVerificationEmail(normalizedEmail, token);

  return NextResponse.json({ ok: true });
}
