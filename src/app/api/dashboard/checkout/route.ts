/**
 * POST /api/dashboard/checkout
 *
 * Cookie-authenticated checkout session creation.
 * Accepts { plan, billing } and returns { url } — the Stripe Checkout URL.
 *
 * This keeps the raw API key off the client entirely. The browser only
 * holds the sc_session cookie; the server looks up the key and calls Stripe.
 *
 * Authentication: sc_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware";
import { createCheckoutSession, PLAN_PRICE_IDS } from "@/lib/stripe";
import type { ApiKeyRow } from "@/lib/validator/types";

const VALID_PLANS = ["basic", "growth", "scale"] as const;
const VALID_BILLING = ["monthly", "annual"] as const;

type Plan = (typeof VALID_PLANS)[number];
type Billing = (typeof VALID_BILLING)[number];

function getSessionKey(request: NextRequest): string {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/sc_session=([^;]+)/);
  return decodeURIComponent(match?.[1] ?? "");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let apiKey: ApiKeyRow;
  try {
    apiKey = await authenticate(getSessionKey(request));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      { error: { code: "invalid_plan", message: `'plan' must be one of: ${VALID_PLANS.join(", ")}.` } },
      { status: 400 }
    );
  }

  if (!billing || !VALID_BILLING.includes(billing as Billing)) {
    return NextResponse.json(
      { error: { code: "invalid_billing", message: `'billing' must be one of: ${VALID_BILLING.join(", ")}.` } },
      { status: 400 }
    );
  }

  if (apiKey.plan === (plan as string)) {
    return NextResponse.json(
      { error: { code: "invalid_plan", message: `You are already on the ${plan} plan.` } },
      { status: 400 }
    );
  }

  const priceId = PLAN_PRICE_IDS[plan as Plan]?.[billing as Billing];
  if (!priceId) {
    console.error(`[dashboard/checkout] Missing price ID for ${plan}/${billing}`);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Checkout is temporarily unavailable. Please try again shortly." } },
      { status: 500 }
    );
  }

  try {
    const session = await createCheckoutSession({
      plan: plan as Plan,
      billing: billing as Billing,
      email: apiKey.email,
      stripeCustomerId: apiKey.stripe_customer_id ?? undefined,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[dashboard/checkout] Stripe session creation failed:", err);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Failed to create checkout session. Please try again." } },
      { status: 500 }
    );
  }
}
