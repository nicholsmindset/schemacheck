"use client";

import { useState } from "react";
import type { ApiKeyRow } from "@/lib/validator/types";

// Static plan data — do NOT import from stripe.ts (server-only)
const PLANS = {
  free: {
    label: "Free",
    price: "$0",
    features: [
      "100 validations / month",
      "10 requests / minute",
      "GET + POST endpoints",
      "URL + raw JSON-LD input",
      "All 35+ schema types",
      "Rich result eligibility",
      "Fix suggestions",
    ],
  },
  basic: {
    label: "Basic",
    price: "$19 / mo",
    features: [
      "3,000 validations / month",
      "30 requests / minute",
      "Everything in Free",
      "Overage billing (no cutoffs)",
      "Email usage alerts",
      "$0.008 per extra validation",
    ],
  },
  growth: {
    label: "Growth",
    price: "$79 / mo",
    features: [
      "15,000 validations / month",
      "60 requests / minute",
      "Everything in Basic",
      "Lower overage rate",
      "Annual billing (2 months free)",
      "$0.005 per extra validation",
    ],
  },
  scale: {
    label: "Scale",
    price: "$199 / mo",
    features: [
      "75,000 validations / month",
      "120 requests / minute",
      "Everything in Growth",
      "Lowest overage rate",
      "Volume discounts available",
      "$0.003 per extra validation",
    ],
  },
};

const UPGRADE_ORDER: Array<keyof typeof PLANS> = ["free", "basic", "growth", "scale"];

const PLAN_BADGE: Record<string, string> = {
  free:   "bg-gray-700 text-gray-300",
  basic:  "bg-blue-900/60 text-blue-300",
  growth: "bg-indigo-900/60 text-indigo-300",
  scale:  "bg-purple-900/60 text-purple-300",
};

interface PlanBillingProps {
  apiKey: ApiKeyRow;
}

export function PlanBilling({ apiKey }: PlanBillingProps) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = apiKey.plan as keyof typeof PLANS;
  const planData = PLANS[currentPlan] ?? PLANS.free;
  const currentIndex = UPGRADE_ORDER.indexOf(currentPlan);
  const nextPlan = UPGRADE_ORDER[currentIndex + 1] as keyof typeof PLANS | undefined;
  const isPaid = currentPlan !== "free";

  async function handleUpgrade(plan: string) {
    setLoading("checkout");
    setError(null);
    try {
      const res = await fetch("/api/dashboard/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error?.message ?? "Failed to start checkout. Please try again.");
        setLoading(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/dashboard/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Failed to open billing portal. Please try again.");
        setLoading(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Plan & Billing
        </h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PLAN_BADGE[currentPlan] ?? PLAN_BADGE.free}`}>
          {planData.label} — {planData.price}
        </span>
      </div>

      {/* Current plan features */}
      <ul className="space-y-1.5 mb-6">
        {planData.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-green-500 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-sm text-red-400 mb-3">{error}</p>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {nextPlan && (
          <button
            onClick={() => handleUpgrade(nextPlan)}
            disabled={loading !== null}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading === "checkout"
              ? "Opening checkout…"
              : `Upgrade to ${PLANS[nextPlan].label} →`}
          </button>
        )}

        {isPaid && (
          <button
            onClick={handlePortal}
            disabled={loading !== null}
            className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading === "portal" ? "Opening portal…" : "Manage Subscription"}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-5">
        Cached results and failed requests don&apos;t count toward your quota.
      </p>
    </div>
  );
}
