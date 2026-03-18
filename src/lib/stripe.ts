import Stripe from "stripe";

// ============================================================
// Lazy Stripe client (avoids build-time env var throw)
// ============================================================

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    _stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ============================================================
// Plan configuration — limits, overage, rate limits
// ============================================================

export const PLAN_CONFIG: Record<
  string,
  { requests_limit: number; overage_rate: number; rate_limit_per_min: number }
> = {
  free:   { requests_limit: 100,    overage_rate: 0,     rate_limit_per_min: 10  },
  basic:  { requests_limit: 3_000,  overage_rate: 0.008, rate_limit_per_min: 30  },
  growth: { requests_limit: 15_000, overage_rate: 0.005, rate_limit_per_min: 60  },
  scale:  { requests_limit: 75_000, overage_rate: 0.003, rate_limit_per_min: 120 },
};

// ============================================================
// Pricing amounts (in cents) — monthly and annual
// Annual pricing saves the customer ~2 months vs monthly × 12
// ============================================================

export const PLAN_PRICING: Record<
  string,
  { monthly_cents: number; annual_cents: number; label: string }
> = {
  basic:  { monthly_cents: 1_900,  annual_cents: 19_000, label: "Basic"  },
  growth: { monthly_cents: 7_900,  annual_cents: 79_000, label: "Growth" },
  scale:  { monthly_cents: 19_900, annual_cents: 199_000, label: "Scale" },
};

// ============================================================
// Price ID mapping — set via environment variables
// ============================================================

export const PLAN_PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY  ?? "",
    annual:  process.env.STRIPE_PRICE_BASIC_ANNUAL   ?? "",
  },
  growth: {
    monthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY ?? "",
    annual:  process.env.STRIPE_PRICE_GROWTH_ANNUAL  ?? "",
  },
  scale: {
    monthly: process.env.STRIPE_PRICE_SCALE_MONTHLY  ?? "",
    annual:  process.env.STRIPE_PRICE_SCALE_ANNUAL   ?? "",
  },
};

// ============================================================
// Checkout session factory
// ============================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://schemacheck.dev";

export interface CheckoutSessionOptions {
  plan:    "basic" | "growth" | "scale";
  billing: "monthly" | "annual";
  /** Customer's email — pre-fills Stripe checkout and used by webhook to match api_keys row */
  email:   string;
  /** Stripe customer ID if the user has already been created in Stripe */
  stripeCustomerId?: string;
}

export async function createCheckoutSession(
  opts: CheckoutSessionOptions
): Promise<Stripe.Checkout.Session> {
  const priceId = PLAN_PRICE_IDS[opts.plan]?.[opts.billing];

  if (!priceId) {
    throw new Error(
      `No Stripe price ID configured for plan "${opts.plan}" / billing "${opts.billing}". ` +
      "Set the corresponding STRIPE_PRICE_* environment variable."
    );
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode:                "subscription",
    line_items:          [{ price: priceId, quantity: 1 }],
    customer_email:      opts.stripeCustomerId ? undefined : opts.email,
    customer:            opts.stripeCustomerId,
    success_url:         `${APP_URL}/dashboard?success=true&plan=${opts.plan}`,
    cancel_url:          `${APP_URL}/pricing`,
    allow_promotion_codes: true,
    metadata: {
      email:   opts.email,
      plan:    opts.plan,
      billing: opts.billing,
    },
    subscription_data: {
      metadata: {
        email:   opts.email,
        plan:    opts.plan,
        billing: opts.billing,
      },
    },
  };

  return getStripe().checkout.sessions.create(sessionParams);
}
