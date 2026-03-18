/**
 * GET /api/dashboard/activity?page=1&limit=20
 *
 * Returns paginated usage_logs for the authenticated user, newest first.
 * Authentication: sc_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticate } from "@/lib/middleware";
import type { ApiKeyRow } from "@/lib/validator/types";

function getSessionKey(request: NextRequest): string {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/sc_session=([^;]+)/);
  return decodeURIComponent(match?.[1] ?? "");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  let apiKey: ApiKeyRow;
  try {
    apiKey = await authenticate(getSessionKey(request));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10))
  );
  const offset = (page - 1) * limit;

  const { data: rows, count, error } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact" })
    .eq("api_key_id", apiKey.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[dashboard/activity] Supabase error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({
    rows: rows ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
