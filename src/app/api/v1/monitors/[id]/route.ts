import { NextResponse } from "next/server";
import { withAuth, handleCors, errorResponse } from "@/lib/middleware";
import { supabase } from "@/lib/supabase";

export const OPTIONS = handleCors;

// ============================================================
// GET /api/v1/monitors/[id]
// Returns the monitor and its last 10 events.
// ============================================================

export const GET = withAuth(async (request, { apiKey }) => {
  const id = extractId(request.url);
  if (!id) return errorResponse("missing_input", "Monitor ID is required.");

  const { data: monitor, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", apiKey.id)
    .single();

  if (error || !monitor) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Monitor not found." } },
      { status: 404 }
    );
  }

  const { data: events } = await supabase
    .from("monitor_events")
    .select("*")
    .eq("monitor_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    monitor,
    recent_events: events ?? [],
  });
});

// ============================================================
// PATCH /api/v1/monitors/[id]
// Update frequency, alert_on, or paused. Owner only.
// ============================================================

export const PATCH = withAuth(async (request, { apiKey }) => {
  const id = extractId(request.url);
  if (!id) return errorResponse("missing_input", "Monitor ID is required.");

  // Ownership check
  const { data: existing, error: fetchError } = await supabase
    .from("monitors")
    .select("id")
    .eq("id", id)
    .eq("user_id", apiKey.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Monitor not found." } },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("missing_input", "Request body must be valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("missing_input", "Request body must be a JSON object.");
  }

  const allowed = ["frequency", "alert_on", "paused"] as const;
  type PatchKey = typeof allowed[number];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    const raw = body as Record<string, unknown>;
    if (!(key in raw)) continue;
    const val = raw[key];

    if (key === "frequency") {
      if (val !== "daily" && val !== "weekly") {
        return errorResponse("missing_input", "The 'frequency' field must be 'daily' or 'weekly'.");
      }
      updates[key] = val;
    } else if (key === "alert_on") {
      if (val !== "all" && val !== "errors" && val !== "digest") {
        return errorResponse("missing_input", "The 'alert_on' field must be 'all', 'errors', or 'digest'.");
      }
      updates[key] = val;
    } else if (key === "paused") {
      if (typeof val !== "boolean") {
        return errorResponse("missing_input", "The 'paused' field must be a boolean.");
      }
      updates[key] = val;
    }
  }

  if (Object.keys(updates).length === 0) {
    return errorResponse(
      "missing_input",
      "Provide at least one of: frequency, alert_on, paused."
    );
  }

  updates.updated_at = new Date().toISOString();

  const { data, error: updateError } = await supabase
    .from("monitors")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("[monitors] PATCH failed:", updateError);
    return errorResponse("internal_error", "Failed to update monitor.");
  }

  return NextResponse.json({ monitor: data });
});

// ============================================================
// DELETE /api/v1/monitors/[id]
// Deletes the monitor. Owner only.
// ============================================================

export const DELETE = withAuth(async (request, { apiKey }) => {
  const id = extractId(request.url);
  if (!id) return errorResponse("missing_input", "Monitor ID is required.");

  // Ownership check + delete in one query
  const { error, count } = await supabase
    .from("monitors")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", apiKey.id);

  if (error) {
    console.error("[monitors] DELETE failed:", error);
    return errorResponse("internal_error", "Failed to delete monitor.");
  }

  if (!count || count === 0) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Monitor not found." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ deleted: true });
});

// ============================================================
// Helpers
// ============================================================

/**
 * Extract the [id] segment from the URL.
 * e.g. "/api/v1/monitors/abc-123" → "abc-123"
 */
function extractId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const idx      = segments.indexOf("monitors");
  const id       = idx !== -1 ? segments[idx + 1] : null;
  return id || null;
}
