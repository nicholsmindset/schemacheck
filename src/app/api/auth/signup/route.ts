import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";

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

  // Check for any existing key with this email (any plan)
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
            "An API key already exists for this email. Check your inbox for your key, or contact support if you need it re-sent.",
        },
      },
      { status: 409 }
    );
  }

  // Generate API key: sc_live_ + 32 hex chars
  const key = `sc_live_${randomBytes(16).toString("hex")}`;

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      key,
      email: normalizedEmail,
      plan: "free",
      requests_used: 0,
      requests_limit: 100,
      overage_rate: 0,
      is_active: true,
      notified_90: false,
      notified_100: false,
    })
    .select("id, key, email, plan, requests_limit")
    .single();

  if (error || !data) {
    console.error("[signup] Supabase insert error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Failed to create API key. Please try again." } },
      { status: 500 }
    );
  }

  // Send welcome email — fire-and-forget; never block the response
  void sendWelcomeEmail(data.email, data.key);

  return NextResponse.json(
    {
      api_key:        data.key,
      email:          data.email,
      plan:           data.plan,
      requests_limit: data.requests_limit,
      dashboard_url:  `${APP_URL}/dashboard`,
      message:        "Your API key has been created. Keep it safe — treat it like a password.",
    },
    { status: 201 }
  );
}
