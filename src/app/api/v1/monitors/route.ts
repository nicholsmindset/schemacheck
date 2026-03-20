import { NextResponse } from "next/server";
import { withAuth, handleCors, errorResponse } from "@/lib/middleware";
import { supabase } from "@/lib/supabase";
import { MONITOR_LIMITS } from "@/lib/monitors";

export const OPTIONS = handleCors;

// ============================================================
// GET /api/v1/monitors
// Returns all monitors for the authenticated user.
// ============================================================

export const GET = withAuth(async (_request, { apiKey }) => {
  const { data, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("user_id", apiKey.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[monitors] GET failed:", error);
    return errorResponse("internal_error", "Failed to retrieve monitors.");
  }

  return NextResponse.json({
    monitors: data ?? [],
    total:    (data ?? []).length,
  });
});

// ============================================================
// POST /api/v1/monitors
// Create a new monitor for the authenticated user.
// Body: { url, frequency?, alert_on? }
// ============================================================

export const POST = withAuth(async (request, { apiKey }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("missing_input", "Request body must be valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("missing_input", "Request body must be a JSON object.");
  }

  const { url, frequency, alert_on } = body as Record<string, unknown>;

  // Validate url
  if (!url || typeof url !== "string") {
    return errorResponse("missing_input", "The 'url' field is required and must be a string.");
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return errorResponse("invalid_url", "URL must use http:// or https://.");
    }
  } catch {
    return errorResponse("invalid_url", `'${url}' is not a valid URL.`);
  }

  // Validate frequency
  const validFrequencies = ["daily", "weekly"] as const;
  type Frequency = typeof validFrequencies[number];
  const resolvedFrequency: Frequency =
    frequency === undefined ? "daily" :
    validFrequencies.includes(frequency as Frequency)
      ? (frequency as Frequency)
      : null!;

  if (
    frequency !== undefined &&
    !validFrequencies.includes(frequency as Frequency)
  ) {
    return errorResponse(
      "missing_input",
      "The 'frequency' field must be 'daily' or 'weekly'."
    );
  }

  // Validate alert_on
  const validAlertOn = ["all", "errors", "digest"] as const;
  type AlertOn = typeof validAlertOn[number];
  const resolvedAlertOn: AlertOn =
    alert_on === undefined ? "all" :
    validAlertOn.includes(alert_on as AlertOn)
      ? (alert_on as AlertOn)
      : null!;

  if (
    alert_on !== undefined &&
    !validAlertOn.includes(alert_on as AlertOn)
  ) {
    return errorResponse(
      "missing_input",
      "The 'alert_on' field must be 'all', 'errors', or 'digest'."
    );
  }

  // Enforce plan monitor limit
  const limit = MONITOR_LIMITS[apiKey.plan] ?? 1;

  const { count, error: countError } = await supabase
    .from("monitors")
    .select("id", { count: "exact", head: true })
    .eq("user_id", apiKey.id);

  if (countError) {
    console.error("[monitors] count failed:", countError);
    return errorResponse("internal_error", "Failed to check monitor count.");
  }

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      {
        error: {
          code:    "monitor_limit_reached",
          message: `Your ${apiKey.plan} plan allows a maximum of ${limit} monitor${limit === 1 ? "" : "s"}. ` +
                   `Upgrade your plan at https://www.schemacheck.dev/pricing to add more.`,
        },
      },
      { status: 429 }
    );
  }

  // Insert the monitor
  const { data, error: insertError } = await supabase
    .from("monitors")
    .insert({
      user_id:   apiKey.id,
      url:       url.trim(),
      frequency: resolvedFrequency,
      alert_on:  resolvedAlertOn,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[monitors] insert failed:", insertError);
    return errorResponse("internal_error", "Failed to create monitor.");
  }

  return NextResponse.json({ monitor: data }, { status: 201 });
});
