import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";
import { extractApiKey, authenticate } from "@/lib/middleware";

/** GET /api/auth/keys — return current key info */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const key = extractApiKey(request);
  let apiKey: Awaited<ReturnType<typeof authenticate>>;

  try {
    apiKey = await authenticate(key);
  } catch (err) {
    return NextResponse.json(err, { status: 401 });
  }

  return NextResponse.json({
    id: apiKey.id,
    email: apiKey.email,
    plan: apiKey.plan,
    requests_used: apiKey.requests_used,
    requests_limit: apiKey.requests_limit,
    created_at: apiKey.created_at,
    is_active: apiKey.is_active,
  });
}

/** POST /api/auth/keys/rotate — generate a new key (invalidates old one) */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const key = extractApiKey(request);
  let apiKey: Awaited<ReturnType<typeof authenticate>>;

  try {
    apiKey = await authenticate(key);
  } catch (err) {
    return NextResponse.json(err, { status: 401 });
  }

  const newKey = `sc_live_${randomBytes(16).toString("hex")}`;

  const { error } = await supabase
    .from("api_keys")
    .update({ key: newKey })
    .eq("id", apiKey.id);

  if (error) {
    return NextResponse.json(
      { error: { code: "internal_error", message: "Failed to rotate key." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    api_key: newKey,
    message: "Your API key has been rotated. Update all integrations using the old key.",
  });
}
