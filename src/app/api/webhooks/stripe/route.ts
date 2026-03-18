import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_CONFIG } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// ============================================================
// Price ID → plan name mapping
// ============================================================

function getPlanFromPriceId(priceId: string): string | null {
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_BASIC_MONTHLY  ?? ""]: "basic",
    [process.env.STRIPE_PRICE_BASIC_ANNUAL   ?? ""]: "basic",
    [process.env.STRIPE_PRICE_GROWTH_MONTHLY ?? ""]: "growth",
    [process.env.STRIPE_PRICE_GROWTH_ANNUAL  ?? ""]: "growth",
    [process.env.STRIPE_PRICE_SCALE_MONTHLY  ?? ""]: "scale",
    [process.env.STRIPE_PRICE_SCALE_ANNUAL   ?? ""]: "scale",
  };
  return priceMap[priceId] ?? null;
}

// ============================================================
// POST handler — verify signature then dispatch
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        // Safely ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ============================================================
// checkout.session.completed
// Fires when a user completes the Stripe checkout flow.
// Upgrades the api_keys row to the purchased plan.
// ============================================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const customerId     = session.customer as string;
  const subscriptionId = session.subscription as string;
  const email          = session.customer_details?.email ?? session.customer_email;

  if (!email) {
    console.error("[stripe webhook] checkout.session.completed missing email");
    return;
  }

  // Retrieve subscription to find the price ID
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId      = subscription.items.data[0]?.price.id;
  const plan         = priceId ? getPlanFromPriceId(priceId) : null;

  if (!plan) {
    console.error("[stripe webhook] Unknown price ID in checkout:", priceId);
    return;
  }

  const config = PLAN_CONFIG[plan];

  const { error } = await supabase
    .from("api_keys")
    .update({
      plan,
      requests_limit:          config.requests_limit,
      overage_rate:            config.overage_rate,
      stripe_customer_id:      customerId,
      stripe_subscription_id:  subscriptionId,
      notified_90:             false,
      notified_100:            false,
    })
    .eq("email", email.toLowerCase());

  if (error) {
    console.error("[stripe webhook] Failed to update api_keys on checkout:", error);
  }
}

// ============================================================
// customer.subscription.updated
// Fires on plan change (upgrade / downgrade).
// ============================================================

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string;
  const priceId    = subscription.items.data[0]?.price.id;
  const plan       = priceId ? getPlanFromPriceId(priceId) : null;

  if (!plan) {
    console.error("[stripe webhook] Unknown price ID in subscription update:", priceId);
    return;
  }

  const config = PLAN_CONFIG[plan];

  const { error } = await supabase
    .from("api_keys")
    .update({
      plan,
      requests_limit:         config.requests_limit,
      overage_rate:           config.overage_rate,
      stripe_subscription_id: subscription.id,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("[stripe webhook] Failed to update api_keys on subscription update:", error);
  }
}

// ============================================================
// customer.subscription.deleted
// Fires when a subscription is cancelled. Downgrades to free.
// ============================================================

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string;
  const config     = PLAN_CONFIG["free"];

  const { error } = await supabase
    .from("api_keys")
    .update({
      plan:                   "free",
      requests_limit:         config.requests_limit,
      overage_rate:           0,
      stripe_subscription_id: null,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("[stripe webhook] Failed to downgrade api_keys on subscription delete:", error);
  }
}

// ============================================================
// invoice.payment_succeeded
// Fires at the start of each new billing period.
// Resets monthly usage counter and alert flags.
// ============================================================

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  // Only reset on subscription renewals, not one-time payments
  if (!invoice.subscription) return;

  const customerId = invoice.customer as string;
  if (!customerId) return;

  const { error } = await supabase
    .from("api_keys")
    .update({
      requests_used: 0,
      notified_90:   false,
      notified_100:  false,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("[stripe webhook] Failed to reset usage on invoice payment:", error);
  }
}
