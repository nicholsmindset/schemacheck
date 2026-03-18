import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "NOT_SET",
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT_SET",
    RESEND: process.env.RESEND_API_KEY ? "SET" : "NOT_SET",
    NODE_ENV: process.env.NODE_ENV,
  });
}
