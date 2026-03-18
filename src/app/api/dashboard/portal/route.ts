/**
 * POST /api/dashboard/portal
 *
 * Creates a Stripe Customer Portal session for paid subscribers.
 * Returns { url } — redirect the user there to manage their subscription.
 *
 * Authentication: sc_session cookie.
 * Prerequisite: Stripe Customer Portal must be configured in the Stripe Dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware";
import { createPortalSession } from "@/lib/stripe";
import type { ApiKeyRow } from "@/lib/validator/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://schemacheck.dev";

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

  if (!apiKey.stripe_customer_id) {
    return NextResponse.json(
      {
        error:
          "No billing account found. Upgrade to a paid plan to access the customer portal.",
      },
      { status: 400 }
    );
  }

  try {
    const url = await createPortalSession(
      apiKey.stripe_customer_id,
      `${APP_URL}/dashboard`
    );
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[dashboard/portal] Stripe portal session failed:", err);
    return NextResponse.json(
      { error: "Failed to open the billing portal. Please try again." },
      { status: 500 }
    );
  }
}
