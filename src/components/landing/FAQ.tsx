"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Do failed requests count against my quota?",
    a: "No. Only successful validations consume credits. If your request returns a 400, 401, or 422 error — nothing is deducted. Cached results are also always free.",
  },
  {
    q: "What schema types are supported?",
    a: "MVP supports 9 types: Article, NewsArticle, BlogPosting, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, and FAQPage. Unknown types get basic JSON-LD structure validation with no credit charge.",
  },
  {
    q: "How does the 1-hour cache work?",
    a: "URL-based requests are cached by SHA-256 hash of the URL for 1 hour. If the same URL is requested again within that window, you receive the cached result instantly with credits_used: 0. Cache busting is not currently supported.",
  },
  {
    q: "Can I pass raw JSON-LD instead of a URL?",
    a: 'Yes. POST to /api/v1/validate with a "jsonld" field containing your schema object. This bypasses the URL fetch entirely and is never cached.',
  },
  {
    q: "How do I authenticate?",
    a: 'Two methods: x-api-key header (recommended for server-side calls) or access_key query parameter (useful for quick testing). Both work on all endpoints.',
  },
  {
    q: "What happens when I hit my limit?",
    a: "Free plans are hard-stopped at 100 validations/month. Paid plans (Basic, Growth, Scale) continue with overage billing at your plan's per-request rate. You'll receive email alerts at 90% and 100% usage.",
  },
  {
    q: "Does SchemaCheck use a headless browser?",
    a: "No. JSON-LD is always in HTML source, so we fetch the raw HTML with a standard HTTP request (10s timeout). This is faster, cheaper, and more reliable than running Puppeteer or Playwright.",
  },
  {
    q: "Is annual billing available?",
    a: "Yes — annual billing is available on Basic, Growth, and Scale plans, giving you 2 months free. Contact us or select annual on the pricing page.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-gray-950/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently asked questions
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className="border border-gray-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-900/50 transition-colors"
              >
                <span className="font-medium text-white text-sm">{faq.q}</span>
                <span className="text-gray-400 shrink-0 text-lg">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
