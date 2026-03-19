export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const keys = Object.keys(process.env).filter(k =>
    ["ADMIN_PASSWORD","RESEND_API_KEY","SUPABASE_SERVICE_ROLE_KEY","NODE_ENV","VERCEL","VERCEL_ENV"].includes(k)
  );
  const result: Record<string, string> = {};
  for (const k of keys) result[k] = k === "NODE_ENV" || k === "VERCEL" || k === "VERCEL_ENV" ? (process.env[k] ?? "") : "SET";
  result["total_env_keys"] = String(Object.keys(process.env).length);
  return NextResponse.json(result);
}
