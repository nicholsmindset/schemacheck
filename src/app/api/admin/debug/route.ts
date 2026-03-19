export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const result: Record<string, string> = {
    NODE_ENV: process.env.NODE_ENV ?? "NOT_SET",
    VERCEL: process.env.VERCEL ?? "NOT_SET",
    VERCEL_ENV: process.env.VERCEL_ENV ?? "NOT_SET",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? `SET(len=${process.env.ADMIN_PASSWORD.length})` : "NOT_SET",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `SET(len=${process.env.SUPABASE_SERVICE_ROLE_KEY.length})` : "NOT_SET",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? `SET(len=${process.env.NEXT_PUBLIC_SUPABASE_URL.length})` : "NOT_SET",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? `SET(len=${process.env.RESEND_API_KEY.length})` : "NOT_SET",
    all_keys: Object.keys(process.env).sort().join(","),
  };
  return NextResponse.json(result);
}
