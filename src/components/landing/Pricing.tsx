import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying the API",
    requests: "100 validations/mo",
    rateLimit: "10 req/min",
    overage: "No overage — hard limit",
    features: [
      "GET + POST endpoints",
      "URL + raw JSON-LD input",
      "All 9 schema types",
      "Rich result eligibility",
      "Fix suggestions",
      "1-hour response cache",
    ],
    cta: "Get started free",
    ctaHref: "/docs/quickstart",
    recommended: false,
    highlight: false,
  },
  {
    name: "Basic",
    price: "$19",
    period: "/month",
    description: "For active SEO tools",
    requests: "3,000 validations/mo",
    rateLimit: "30 req/min",
    overage: "$0.008 per extra",
    features: [
      "Everything in Free",
      "Overage billing (no cutoffs)",
      "Email usage alerts",
      "Priority support",
    ],
    cta: "Start Basic",
    ctaHref: "/pricing?plan=basic",
    recommended: false,
    highlight: false,
  },
  {
    name: "Growth",
    price: "$79",
    period: "/month",
    description: "For agencies and platforms",
    requests: "15,000 validations/mo",
    rateLimit: "60 req/min",
    overage: "$0.005 per extra",
    features: [
      "Everything in Basic",
      "Lower overage rate",
      "Annual billing (2 months free)",
    ],
    cta: "Start Growth",
    ctaHref: "/pricing?plan=growth",
    recommended: true,
    highlight: true,
  },
  {
    name: "Scale",
    price: "$199",
    period: "/month",
    description: "For high-volume use cases",
    requests: "75,000 validations/mo",
    rateLimit: "120 req/min",
    overage: "$0.003 per extra",
    features: [
      "Everything in Growth",
      "Lowest overage rate",
      "Volume discounts available",
    ],
    cta: "Start Scale",
    ctaHref: "/pricing?plan=scale",
    recommended: false,
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section className="py-20 px-4" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Simple, usage-based pricing</h2>
          <p className="text-gray-400">
            Start free. Only pay for successful validations. Cached results are always free.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 flex flex-col ${
                plan.highlight
                  ? "border-indigo-500 bg-indigo-950/20"
                  : "border-gray-800 bg-gray-950/60"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium">
                    Recommended
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm text-gray-400">
                <p>
                  <span className="text-white font-medium">{plan.requests}</span>
                </p>
                <p>{plan.rateLimit}</p>
                <p>{plan.overage}</p>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`w-full py-2.5 rounded-lg text-sm font-medium text-center transition-colors ${
                  plan.highlight
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          All plans include: failed requests don&apos;t count · cached results are free · email alerts at 90% and 100% usage
        </p>
      </div>
    </section>
  );
}
