import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS, makeAdminSessionValue } from "@/lib/admin-auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try { body = await request.json(); } catch { body = {}; }

  const { password } = (body ?? {}) as Record<string, unknown>;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Same error message for wrong password and missing password (no enumeration)
  if (!adminPassword || !password || typeof password !== "string" || password !== adminPassword) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Invalid credentials." } },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, makeAdminSessionValue(), ADMIN_COOKIE_OPTIONS);
  return response;
}
