/**
 * Monitor helpers shared between API routes and the cron worker.
 * No Next.js imports — this file is pure business logic.
 */

import type { SchemaValidationResult, ValidationSummary } from "./validator/types";

// ============================================================
// Plan limits
// ============================================================

export const MONITOR_LIMITS: Record<string, number> = {
  free:   1,
  basic:  10,
  growth: 50,
  scale:  200,
} as const;

// ============================================================
// Types
// ============================================================

/** Subset of the validation response shape we persist in last_result / monitor_events */
export interface StoredResult {
  url: string;
  score: number;
  status: MonitorStatus;
  schemas_found: number;
  schemas: Array<{
    type: string;
    valid: boolean;
    rich_result_eligible: boolean;
    errors: Array<{ property: string; message: string }>;
    warnings: Array<{ property: string; message: string }>;
  }>;
  summary: ValidationSummary;
  checked_at: string;
}

export type MonitorStatus = "healthy" | "degraded" | "broken";

export type MonitorEventType =
  | "score_drop"
  | "new_error"
  | "eligibility_lost"
  | "schema_removed"
  | "recovered"
  | "check_failed"
  | "check_result";

export interface MonitorEvent {
  event_type: MonitorEventType;
  previous_value?: unknown;
  new_value?: unknown;
  details?: unknown;
}

// ============================================================
// computeStatus
// ============================================================

/**
 * Map a numeric score to a monitor health status.
 *   score >= 70 → healthy
 *   score 40–69 → degraded
 *   score < 40  → broken
 */
export function computeStatus(score: number): MonitorStatus {
  if (score >= 70) return "healthy";
  if (score >= 40) return "degraded";
  return "broken";
}

// ============================================================
// buildStoredResult
// ============================================================

/**
 * Converts a raw validation response into the compact shape we persist
 * in monitors.last_result and monitor_events.
 */
export function buildStoredResult(
  url: string,
  schemas: SchemaValidationResult[],
  summary: ValidationSummary
): StoredResult {
  const score  = summary.score;
  const status = computeStatus(score);

  return {
    url,
    score,
    status,
    schemas_found: schemas.length,
    schemas: schemas.map((s) => ({
      type:                 s.type,
      valid:                s.valid,
      rich_result_eligible: s.rich_result_eligible,
      errors:   s.errors.map((e) => ({ property: e.property, message: e.message })),
      warnings: s.warnings.map((w) => ({ property: w.property, message: w.message })),
    })),
    summary,
    checked_at: new Date().toISOString(),
  };
}

// ============================================================
// detectChanges
// ============================================================

/**
 * Compare the previous stored result against the current one and return
 * an array of MonitorEvent objects to insert into monitor_events.
 *
 * Events emitted:
 *   score_drop        — score fell by more than 10 points
 *   new_error         — an error message appeared that was not in prev
 *   eligibility_lost  — a schema type lost rich_result_eligible
 *   schema_removed    — a schema type present in prev is absent in curr
 *   recovered         — all previous errors are gone AND score improved >= 10
 *
 * If prev is null (first check) no change events are emitted.
 */
export function detectChanges(
  prev: StoredResult | null,
  curr: StoredResult
): MonitorEvent[] {
  if (!prev) return [];

  const events: MonitorEvent[] = [];

  // --- recovered (check first so it can short-circuit the rest) ---
  const prevErrors = collectAllErrors(prev);
  const currErrors = collectAllErrors(curr);
  const scoreImproved = curr.score - prev.score >= 10;
  const errorsGone    = prevErrors.size > 0 && currErrors.size === 0;

  if (errorsGone && scoreImproved) {
    events.push({
      event_type:    "recovered",
      previous_value: { score: prev.score, error_count: prevErrors.size },
      new_value:      { score: curr.score, error_count: 0 },
    });
    // If fully recovered we still want to report score_drop / new issues
    // that appeared in the same check, but in practice a recovery check
    // shouldn't also have drops. Return early to avoid noise.
    return events;
  }

  // --- score_drop ---
  const scoreDrop = prev.score - curr.score;
  if (scoreDrop > 10) {
    events.push({
      event_type:    "score_drop",
      previous_value: { score: prev.score },
      new_value:      { score: curr.score },
      details:        { drop: scoreDrop },
    });
  }

  // --- schema_removed ---
  const prevTypes = new Set(prev.schemas.map((s) => s.type));
  const currTypes = new Set(curr.schemas.map((s) => s.type));
  for (const t of prevTypes) {
    if (!currTypes.has(t)) {
      events.push({
        event_type:    "schema_removed",
        previous_value: { type: t },
        new_value:      null,
        details:        { schema_type: t },
      });
    }
  }

  // --- new_error and eligibility_lost (per schema type still present) ---
  for (const currSchema of curr.schemas) {
    const prevSchema = prev.schemas.find((s) => s.type === currSchema.type);

    // eligibility_lost
    if (prevSchema && prevSchema.rich_result_eligible && !currSchema.rich_result_eligible) {
      events.push({
        event_type:    "eligibility_lost",
        previous_value: { type: currSchema.type, eligible: true },
        new_value:      { type: currSchema.type, eligible: false },
        details:        { schema_type: currSchema.type },
      });
    }

    // new_error — any error message now present that wasn't before
    const prevErrorMessages = new Set(
      (prevSchema?.errors ?? []).map((e) => `${e.property}:${e.message}`)
    );
    for (const err of currSchema.errors) {
      const key = `${err.property}:${err.message}`;
      if (!prevErrorMessages.has(key)) {
        events.push({
          event_type: "new_error",
          previous_value: null,
          new_value:      { type: currSchema.type, property: err.property, message: err.message },
          details:        { schema_type: currSchema.type, property: err.property },
        });
      }
    }
  }

  return events;
}

// ============================================================
// shouldSendAlert
// ============================================================

/**
 * Given the user's alert_on preference and the list of events fired,
 * determine whether an email alert should be sent.
 *
 *   alert_on = 'all'    → send if any events
 *   alert_on = 'errors' → send only if events include errors/eligibility issues
 *   alert_on = 'digest' → never send individual alerts (digest only)
 */
export function shouldSendAlert(
  alertOn: string,
  events: MonitorEvent[]
): boolean {
  if (events.length === 0) return false;
  if (alertOn === "digest") return false;
  if (alertOn === "all") return true;

  // errors: send only for error-severity events
  const errorEventTypes: MonitorEventType[] = [
    "new_error",
    "eligibility_lost",
    "schema_removed",
    "score_drop",
    "check_failed",
  ];
  return events.some((e) => errorEventTypes.includes(e.event_type));
}

// ============================================================
// Private helpers
// ============================================================

function collectAllErrors(result: StoredResult): Set<string> {
  const keys = new Set<string>();
  for (const schema of result.schemas) {
    for (const err of schema.errors) {
      keys.add(`${schema.type}:${err.property}:${err.message}`);
    }
  }
  return keys;
}
