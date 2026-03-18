/**
 * POST /api/dashboard/logout
 *
 * Clears the sc_session cookie. No authentication required.
 */

import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/dashboard-auth";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
