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

  // Invalidate any existing unused tokens for this email
  await supabase
    .from("email_verifications")
    .update({ used_at: new Date().toISOString() })
    .eq("email", normalizedEmail)
    .is("used_at", null);

  // Generate a new verification token (32 hex chars = 64 character string)
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase
    .from("email_verifications")
    .insert({
      email: normalizedEmail,
      token,
      expires_at: expiresAt,
    });

  if (insertError) {
    console.error("[signup] Failed to create verification token:", insertError);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Failed to send verification email. Please try again." } },
      { status: 500 }
    );
  }

  // Send verification email — fire-and-forget
  void sendVerificationEmail(normalizedEmail, token);

  return NextResponse.json(
    { ok: true, email: normalizedEmail },
    { status: 200 }
  );
}
