/**
 * GET /api/dashboard/stats
 *
 * Returns aggregated all-time usage statistics for the authenticated user.
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

  // Fetch all log rows for this key (MVP — add date filter if volumes grow large)
  const { data, error } = await supabase
    .from("usage_logs")
    .select("schemas_found, response_time_ms, cached")
    .eq("api_key_id", apiKey.id);

  if (error) {
    console.error("[dashboard/stats] Supabase error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const rows = data ?? [];
  const total_validations = rows.length;
  const total_schemas = rows.reduce((s, r) => s + (r.schemas_found ?? 0), 0);
  const avg_response_ms =
    rows.length > 0
      ? rows.reduce((s, r) => s + (r.response_time_ms ?? 0), 0) / rows.length
      : 0;
  const cached_count = rows.filter((r) => r.cached).length;
  const cache_hit_rate =
    rows.length > 0 ? (cached_count / rows.length) * 100 : 0;

  return NextResponse.json({
    total_validations,
    total_schemas,
    avg_response_ms: Math.round(avg_response_ms),
    cache_hit_rate: parseFloat(cache_hit_rate.toFixed(1)),
  });
}
