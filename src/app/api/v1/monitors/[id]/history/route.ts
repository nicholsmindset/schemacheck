import { NextResponse } from "next/server";
import { withAuth, handleCors, errorResponse } from "@/lib/middleware";
import { supabase } from "@/lib/supabase";

export const OPTIONS = handleCors;

// ============================================================
// GET /api/v1/monitors/[id]/history
// Returns the last 30 events for the monitor. Owner only.
// ============================================================

export const GET = withAuth(async (request, { apiKey }) => {
  const id = extractId(request.url);
  if (!id) return errorResponse("missing_input", "Monitor ID is required.");

  // Verify ownership
  const { data: monitor, error: monitorError } = await supabase
    .from("monitors")
    .select("id")
    .eq("id", id)
    .eq("user_id", apiKey.id)
    .single();

  if (monitorError || !monitor) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Monitor not found." } },
      { status: 404 }
    );
  }

  const { data: events, error: eventsError } = await supabase
    .from("monitor_events")
    .select("*")
    .eq("monitor_id", id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (eventsError) {
    console.error("[monitors/history] query failed:", eventsError);
    return errorResponse("internal_error", "Failed to retrieve monitor history.");
  }

  return NextResponse.json({
    monitor_id: id,
    history:    events ?? [],
    total:      (events ?? []).length,
  });
});

// ============================================================
// Helpers
// ============================================================

/**
 * Extract the [id] segment from the URL.
 * e.g. "/api/v1/monitors/abc-123/history" → "abc-123"
 */
function extractId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const idx      = segments.indexOf("monitors");
  const id       = idx !== -1 ? segments[idx + 1] : null;
  return id || null;
}
