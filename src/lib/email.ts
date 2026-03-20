/**
 * Email notifications for usage alerts and account events.
 * Uses Resend (https://resend.com) for transactional email.
 * Falls back to console.log in development if RESEND_API_KEY is not set.
 */

import type { StoredResult, MonitorEvent } from "./monitors";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM     = process.env.EMAIL_FROM ?? "noreply@schemacheck.dev";
const APP_URL        = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.schemacheck.dev";

// ============================================================
// Internal send helper
// ============================================================

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[email] To: ${to}`);
    console.log(`[email] Subject: ${subject}`);
    console.log(`[email] Body:\n${text}`);
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, text }),
    });

    if (!response.ok) {
      console.error(`[email] Resend API error: ${response.status}`);
    }
  } catch (err) {
    // Non-fatal — log and continue
    console.error("[email] Failed to send email:", err);
  }
}

// ============================================================
// Verification email (sent before API key is created)
// ============================================================

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;
  const subject = "Confirm your SchemaCheck email";

  const text = `
Welcome to SchemaCheck!

Please verify your email address to get your free API key.

Click this link to confirm:
  ${verifyUrl}

This link expires in 24 hours.

If you didn't sign up for SchemaCheck, you can safely ignore this email.

Thanks,
SchemaCheck
  `.trim();

  await sendEmail(email, subject, text);
}

// ============================================================
// Welcome email (sent on signup)
// ============================================================

export async function sendWelcomeEmail(
  email: string,
  apiKey: string
): Promise<void> {
  const subject = "Your SchemaCheck API key";

  const text = `
Welcome to SchemaCheck!

Your API key is:

  ${apiKey}

Keep it safe — treat it like a password. Anyone with this key can make validation requests on your behalf.

Quick start
-----------
Validate a URL:
  curl "${APP_URL}/api/v1/validate?url=https://example.com&access_key=${apiKey}"

Validate raw JSON-LD:
  curl -X POST "${APP_URL}/api/v1/validate" \\
    -H "Content-Type: application/json" \\
    -H "x-api-key: ${apiKey}" \\
    -d '{"jsonld": {"@context": "https://schema.org", "@type": "Organization", "name": "Example"}}'

Your free plan includes 100 validations per month.
Upgrade anytime at ${APP_URL}/pricing

Documentation: ${APP_URL}/docs

Thanks,
SchemaCheck
  `.trim();

  await sendEmail(email, subject, text);
}

// ============================================================
// Usage threshold alerts (90% and 100%)
// ============================================================

export async function sendUsageAlert(
  email: string,
  percentUsed: 90 | 100,
  requestsUsed: number,
  requestsLimit: number,
  plan: string
): Promise<void> {
  const subject =
    percentUsed === 90
      ? `[SchemaCheck] You've used 90% of your monthly validations`
      : `[SchemaCheck] You've reached your monthly validation limit`;

  const body =
    percentUsed === 90
      ? `
Hi there,

You've used ${requestsUsed} of your ${requestsLimit} monthly validations on the ${plan} plan (90% used).

You have ${requestsLimit - requestsUsed} validations remaining this month.

Upgrade your plan to get more validations and higher rate limits:
${APP_URL}/pricing

Thanks,
SchemaCheck
      `.trim()
      : `
Hi there,

You've used all ${requestsLimit} of your monthly validations on the ${plan} plan.

${plan === "free"
  ? `Your account is now paused until the next billing cycle. Upgrade to a paid plan to continue validating without interruption:`
  : `Additional validations are now billed at your overage rate ($${getOverageRate(plan)}/validation).`
}

${APP_URL}/pricing

Thanks,
SchemaCheck
      `.trim();

  await sendEmail(email, subject, body);
}

// ============================================================
// Monitor alert (schema change detected)
// ============================================================

export async function sendMonitorAlert(
  email: string,
  url: string,
  result: StoredResult,
  events: MonitorEvent[]
): Promise<void> {
  const subject = `[SchemaCheck] Schema change detected: ${url}`;
  const checkUrl = `${APP_URL}/check?url=${encodeURIComponent(url)}`;

  const eventLines = events
    .filter((e) => e.event_type !== "check_result")
    .map((e) => formatEventLine(e))
    .filter(Boolean)
    .join("\n");

  const text = `
Schema change detected on your monitored URL.

URL:    ${url}
Score:  ${result.score}/100 (${result.status})

What changed:
${eventLines || "See the details below."}

View the full report:
  ${checkUrl}

You're receiving this because you have an active monitor set up for this URL.
Manage your monitors at ${APP_URL}/dashboard

Thanks,
SchemaCheck
  `.trim();

  await sendEmail(email, subject, text);
}

// ============================================================
// Private helpers
// ============================================================

function formatEventLine(event: MonitorEvent): string {
  switch (event.event_type) {
    case "score_drop": {
      const prev = (event.previous_value as { score?: number })?.score ?? "?";
      const curr = (event.new_value as { score?: number })?.score ?? "?";
      return `- Score dropped from ${prev} to ${curr}`;
    }
    case "new_error": {
      const nv   = event.new_value as { type?: string; property?: string; message?: string } | null;
      const type = nv?.type ?? "Unknown";
      const prop = nv?.property ?? "unknown";
      const msg  = nv?.message ?? "";
      return `- New error on ${type}.${prop}: ${msg}`;
    }
    case "eligibility_lost": {
      const d = event.details as { schema_type?: string } | null;
      return `- ${d?.schema_type ?? "Schema"} lost rich result eligibility`;
    }
    case "schema_removed": {
      const pv = event.previous_value as { type?: string } | null;
      return `- Schema type removed: ${pv?.type ?? "unknown"}`;
    }
    case "recovered": {
      const nv = event.new_value as { score?: number } | null;
      return `- All errors resolved. Score: ${nv?.score ?? "?"}`;
    }
    case "check_failed":
      return `- Validation check failed (site may be unreachable)`;
    default:
      return "";
  }
}

function getOverageRate(plan: string): string {
  const rates: Record<string, string> = {
    basic:  "0.008",
    growth: "0.005",
    scale:  "0.003",
  };
  return rates[plan] ?? "0.01";
}
