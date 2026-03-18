/**
 * POST /api/auth/checkout
 *
 * Creates a Stripe Checkout session for plan upgrades.
 * Requires the caller's API key (x-api-key header or access_key query param)
 * so we know which api_keys row to upgrade when the webhook fires.
 *
 * Request body:
 *   { plan: "basic" | "growth" | "scale", billing: "monthly" | "annual" }
 *
 * Response:
 *   { url: string }  — redirect the user to this Stripe-hosted checkout URL
 */

import { NextResponse } from "next/server";
import { withAuth, handleCors } from "@/lib/middleware";
import { createCheckoutSession, PLAN_PRICE_IDS } from "@/lib/stripe";

const VALID_PLANS   = ["basic", "growth", "scale"] as const;
const VALID_BILLING = ["monthly", "annual"] as const;

type Plan    = typeof VALID_PLANS[number];
type Billing = typeof VALID_BILLING[number];

export const OPTIONS = handleCors;

export const POST = withAuth(async (request, { apiKey }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Request body must be a JSON object." } },
      { status: 400 }
    );
  }

  const { plan, billing } = body as Record<string, unknown>;

  if (!plan || !VALID_PLANS.includes(plan as Plan)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_plan",
          message: `'plan' must be one of: ${VALID_PLANS.join(", ")}.`,
        },
      },
      { status: 400 }
    );
  }

  if (!billing || !VALID_BILLING.includes(billing as Billing)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_billing",
          message: `'billing' must be one of: ${VALID_BILLING.join(", ")}.`,
        },
      },
      { status: 400 }
    );
  }

  // Prevent downgrade or same-plan checkout
  if (apiKey.plan === (plan as string)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_plan",
          message: `You are already on the ${plan} plan.`,
        },
      },
      { status: 400 }
    );
  }

  // Sanity check: price IDs must be configured
  const priceId = PLAN_PRICE_IDS[plan as Plan]?.[billing as Billing];
  if (!priceId) {
    console.error(`[checkout] Missing price ID for ${plan}/${billing}`);
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: "Checkout is temporarily unavailable. Please try again shortly.",
        },
      },
      { status: 500 }
    );
  }

  let session: Awaited<ReturnType<typeof createCheckoutSession>>;
  try {
    session = await createCheckoutSession({
      plan:             plan as Plan,
      billing:          billing as Billing,
      email:            apiKey.email,
      stripeCustomerId: apiKey.stripe_customer_id ?? undefined,
    });
  } catch (err) {
    console.error("[checkout] Stripe session creation failed:", err);
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: "Failed to create checkout session. Please try again.",
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
});
