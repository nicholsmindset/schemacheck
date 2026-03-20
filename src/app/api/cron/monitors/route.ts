/**
 * Vercel Cron Worker — /api/cron/monitors
 *
 * Scheduled: every hour (0 * * * * in vercel.json)
 * Auth:      Bearer <CRON_SECRET> header required
 *
 * For each monitor due for a check:
 *   1. Run the validator against the URL
 *   2. Diff against the previous result (detectChanges)
 *   3. Persist events + update the monitor row
 *   4. Send an email alert if the user's alert_on setting warrants it
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validate } from "@/lib/validator/index";
import {
  buildStoredResult,
  detectChanges,
  shouldSendAlert,
  type StoredResult,
  type MonitorEvent,
} from "@/lib/monitors";
import { sendMonitorAlert } from "@/lib/email";

// Vercel hobby: 30s max; we give ourselves 28s for all processing
export const maxDuration = 60;

const BATCH_SIZE      = 20;
const CRON_SECRET     = process.env.CRON_SECRET;

// ============================================================
// Auth guard
// ============================================================

function isAuthorized(request: Request): boolean {
  // Vercel sends its own cron signature header — accept it directly
  if (request.headers.get("x-vercel-cron-signature")) return true;

  const auth = request.headers.get("authorization") ?? "";
  if (!CRON_SECRET) {
    // If no secret is configured, only allow in development
    return process.env.NODE_ENV === "development";
  }
  return auth === `Bearer ${CRON_SECRET}`;
}

// ============================================================
// GET /api/cron/monitors
// ============================================================

export async function GET(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();

  // Fetch monitors due for a check.
  // Due conditions (using RPC-friendly UTC comparisons):
  //   daily  → last_checked_at IS NULL OR last_checked_at < now - 23h
  //   weekly → last_checked_at IS NULL OR last_checked_at < now - (6d 23h)
  //
  // We fetch both and filter in JS to keep the query simple and compatible
  // with Supabase's filter API without raw SQL.

  const dailyCutoff  = new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString();
  const weeklyCutoff = new Date(now.getTime() - (6 * 24 + 23) * 60 * 60 * 1000).toISOString();

  // Fetch all unpaused monitors and pick the due ones
  const { data: allMonitors, error: fetchError } = await supabase
    .from("monitors")
    .select(`
      id,
      url,
      frequency,
      last_checked_at,
      last_result,
      alert_on,
      user_id,
      api_keys ( email )
    `)
    .eq("paused", false)
    .limit(200); // defensive cap — we'll slice to BATCH_SIZE below

  if (fetchError) {
    console.error("[cron/monitors] Failed to fetch monitors:", fetchError);
    return NextResponse.json({ error: "Failed to fetch monitors." }, { status: 500 });
  }

  const due = (allMonitors ?? []).filter((m) => {
    if (!m.last_checked_at) return true; // never checked
    if (m.frequency === "daily")  return m.last_checked_at < dailyCutoff;
    if (m.frequency === "weekly") return m.last_checked_at < weeklyCutoff;
    return false;
  }).slice(0, BATCH_SIZE);

  console.log(`[cron/monitors] ${due.length} monitors due for check (of ${(allMonitors ?? []).length} total)`);

  let processed    = 0;
  let eventsFired  = 0;

  for (const monitor of due) {
    try {
      const email = extractEmail(monitor);
      const events = await checkMonitor(monitor, email);
      eventsFired += events;
      processed++;
    } catch (err) {
      // Log but continue processing remaining monitors
      console.error(`[cron/monitors] Unhandled error for monitor ${monitor.id}:`, err);
    }
  }

  return NextResponse.json({
    ok:           true,
    processed,
    events_fired: eventsFired,
    checked_at:   now.toISOString(),
  });
}

// ============================================================
// Per-monitor check
// ============================================================

async function checkMonitor(
  monitor: {
    id: string;
    url: string;
    frequency: string;
    last_checked_at: string | null;
    last_result: unknown;
    alert_on: string;
    user_id: string;
  },
  userEmail: string | null
): Promise<number> {
  const checkedAt = new Date().toISOString();
  let result: StoredResult;
  try {
    const validation = await validate({ url: monitor.url });
    result = buildStoredResult(monitor.url, validation.schemas, validation.summary);
  } catch (err) {
    console.error(`[cron/monitors] Validation failed for ${monitor.url}:`, err);

    // Record a check_failed event and update the monitor's last_checked_at
    // so we don't hammer a broken URL every hour.
    const { error: eventErr } = await supabase
      .from("monitor_events")
      .insert({
        monitor_id: monitor.id,
        event_type: "check_failed",
        details:    { error: String(err), url: monitor.url, checked_at: checkedAt },
      });

    if (eventErr) console.error("[cron/monitors] Failed to insert check_failed event:", eventErr);

    await supabase
      .from("monitors")
      .update({ last_checked_at: checkedAt, updated_at: checkedAt })
      .eq("id", monitor.id);

    return 1; // count the check_failed event
  }

  // Compare with previous result
  const prev = monitor.last_result as StoredResult | null;
  const changeEvents = detectChanges(prev, result);

  // Always record a check_result event for history
  const checkResultEvent: MonitorEvent = {
    event_type:  "check_result",
    new_value:   {
      score:         result.score,
      status:        result.status,
      schemas_found: result.schemas_found,
      errors:        result.summary.total_errors,
      warnings:      result.summary.total_warnings,
      checked_at:    checkedAt,
    },
  };

  const allEvents: MonitorEvent[] = [checkResultEvent, ...changeEvents];

  // Persist events
  if (allEvents.length > 0) {
    const rows = allEvents.map((e) => ({
      monitor_id:     monitor.id,
      event_type:     e.event_type,
      previous_value: e.previous_value ?? null,
      new_value:      e.new_value ?? null,
      details:        e.details ?? null,
    }));

    const { error: insertErr } = await supabase
      .from("monitor_events")
      .insert(rows);

    if (insertErr) {
      console.error("[cron/monitors] Failed to insert events:", insertErr);
    }
  }

  // Update the monitor row
  const { error: updateErr } = await supabase
    .from("monitors")
    .update({
      last_checked_at: checkedAt,
      last_score:      result.score,
      last_status:     result.status,
      last_result:     result,
      updated_at:      checkedAt,
    })
    .eq("id", monitor.id);

  if (updateErr) {
    console.error("[cron/monitors] Failed to update monitor:", updateErr);
  }

  // Send alert if warranted
  if (
    userEmail &&
    changeEvents.length > 0 &&
    shouldSendAlert(monitor.alert_on, changeEvents)
  ) {
    await sendMonitorAlert(userEmail, monitor.url, result, changeEvents);
  }

  return allEvents.length;
}

// ============================================================
// Helpers
// ============================================================

function extractEmail(monitor: Record<string, unknown>): string | null {
  // Supabase join returns api_keys as object or array depending on cardinality
  const joined = monitor["api_keys"];
  if (!joined) return null;
  if (Array.isArray(joined)) return (joined[0] as { email?: string })?.email ?? null;
  return (joined as { email?: string })?.email ?? null;
}
