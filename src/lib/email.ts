/**
 * Email notifications for usage alerts and account events.
 * Uses Resend (https://resend.com) for transactional email.
 * Falls back to console.log in development if RESEND_API_KEY is not set.
 */

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

function getOverageRate(plan: string): string {
  const rates: Record<string, string> = {
    basic:  "0.008",
    growth: "0.005",
    scale:  "0.003",
  };
  return rates[plan] ?? "0.01";
}
