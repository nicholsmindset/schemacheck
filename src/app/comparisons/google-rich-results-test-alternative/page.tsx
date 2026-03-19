import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Google Rich Results Test Alternative — SchemaCheck",
  description:
    "Looking for a Google Rich Results Test tool alternative? SchemaCheck is the programmatic alternative with a REST API. Automate schema validation in CI, bulk-audit sitemaps, and power AI agents.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Google Rich Results Test Alternative",
    description:
      "SchemaCheck is the programmatic alternative to Google's Rich Results Test. Automate schema validation with a REST API.",
    url: "https://schemacheck.dev/comparisons/google-rich-results-test-alternative",
    isPartOf: { "@type": "WebSite", name: "SchemaCheck", url: "https://schemacheck.dev" },
  },
  null,
  2
);

const API_EXAMPLE = `// SchemaCheck API — what Google's Rich Results Test can't do
const result = await fetch(
  \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(url)}&access_key=\${API_KEY}\`
).then(r => r.json());

// Structured, machine-readable response
console.log(result.summary.score);              // 0-100 health score
console.log(result.summary.rich_result_eligible); // true / false
console.log(result.schemas[0].errors);           // per-property error list
console.log(result.schemas[0].errors[0].fix);    // actionable fix suggestion`;

const comparison = [
  {
    feature: "REST API",
    schemacheck: "✓",
    google: "—",
    note: "SchemaCheck is API-first. Google's tool is web-only.",
  },
  {
    feature: "GET + POST requests",
    schemacheck: "✓",
    google: "—",
    note: "Validate a URL (GET) or raw JSON-LD (POST).",
  },
  {
    feature: "Raw JSON-LD input",
    schemacheck: "✓",
    google: "—",
    note: "Validate schema before publishing — no live page needed.",
  },
  {
    feature: "Bulk / batch validation",
    schemacheck: "✓",
    google: "—",
    note: "Validate thousands of URLs programmatically.",
  },
  {
    feature: "CI / CD integration",
    schemacheck: "✓",
    google: "—",
    note: "Block deploys with schema errors via GitHub Actions.",
  },
  {
    feature: "AI agent friendly",
    schemacheck: "✓",
    google: "—",
    note: "JSON out — designed for LLM tool use.",
  },
  {
    feature: "Fix suggestions",
    schemacheck: "✓",
    google: "—",
    note: "Each error includes a specific fix with documentation link.",
  },
  {
    feature: "Deprecation warnings",
    schemacheck: "✓",
    google: "Partial",
    note: "SchemaCheck flags HowTo and restricted FAQPage schemas.",
  },
  {
    feature: "Response caching",
    schemacheck: "✓",
    google: "—",
    note: "Re-validate the same URL for free within 1 hour.",
  },
  {
    feature: "0–100 health score",
    schemacheck: "✓",
    google: "—",
    note: "Machine-readable quality score for monitoring.",
  },
  {
    feature: "Google's official rendering",
    schemacheck: "—",
    google: "✓",
    note: "Google uses Googlebot's actual renderer — the ground truth.",
  },
  {
    feature: "JavaScript-rendered schemas",
    schemacheck: "Partial",
    google: "✓",
    note: "SchemaCheck fetches server-side HTML; Google renders JS.",
  },
];

export default function GoogleRichResultsAlternativePage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSONLD }}
      />

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-400">SchemaCheck</Link>
          <span>/</span>
          <Link href="/" className="hover:text-gray-400">Comparisons</Link>
          <span>/</span>
          <span className="text-gray-400">vs Google Rich Results Test</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Comparison
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Best Rich Results Test Alternative
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            Google&apos;s Rich Results Test is the industry standard for manual schema validation.
            It has no API, no bulk mode, and no CI path. SchemaCheck is what you use when you
            need to automate what Google&apos;s tool can only do by hand.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get free API key →
            </Link>
            <Link
              href="/docs/options"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              API reference
            </Link>
          </div>
        </div>

        {/* The core limitation */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Why Google&apos;s Rich Results Test isn&apos;t enough for developers
          </h2>
          <p className="text-gray-400 mb-4">
            Unlike the Google rich snippet tool, SchemaCheck exposes a REST API — so you can automate what the Rich Results Test can only do by hand. The Rich Results Test gives you a pass/fail result for a single URL in a browser tab.
            That&apos;s exactly what you need for a pre-launch sanity check. It&apos;s not what
            you need for any of the following:
          </p>
          <div className="space-y-2">
            {[
              "Auditing 50,000 product pages for missing schema fields",
              "Blocking a deploy when a developer accidentally removes an Article's datePublished",
              "Giving an AI agent a way to programmatically check structured data",
              "Validating schema in a staging environment before the page exists publicly",
              "Monitoring rich result eligibility across your content archive",
            ].map((item) => (
              <div key={item} className="flex gap-3 p-3 rounded-lg bg-[#111118] border border-gray-800/60">
                <span className="text-red-500 text-sm shrink-0 mt-0.5 font-bold">✗</span>
                <p className="text-sm text-gray-400">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Rich Results Test vs Google Search Console</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0d0d14]">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Feature</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-28">SchemaCheck</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-28">Google RRT</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-800/50 ${i % 2 === 0 ? "bg-[#111118]" : "bg-[#0d0d14]"}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm text-white font-medium">{row.feature}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{row.note}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-base font-semibold ${
                          row.schemacheck === "✓"
                            ? "text-indigo-400"
                            : row.schemacheck === "Partial"
                            ? "text-amber-500"
                            : "text-gray-700"
                        }`}
                      >
                        {row.schemacheck}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-base font-semibold ${
                          row.google === "✓"
                            ? "text-green-500"
                            : row.google === "Partial"
                            ? "text-amber-500"
                            : "text-gray-700"
                        }`}
                      >
                        {row.google}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Code example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">What the API looks like</h2>
          <p className="text-gray-400 mb-4">
            One GET request. Structured JSON back. Everything you need to automate what
            Google&apos;s tool does manually.
          </p>
          <CodeBlock language="javascript" code={API_EXAMPLE} />
        </section>

        {/* When to use each */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">When to use each tool</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <p className="text-sm font-semibold text-white mb-3">
                Use <span className="text-green-400">Google Rich Results Test</span> when:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Verifying a specific page before launch</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Debugging a rich result that Google is not showing</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Checking JavaScript-rendered schemas (Google executes JS)</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>You need Google&apos;s ground-truth render result</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-indigo-800/60 bg-indigo-950/10">
              <p className="text-sm font-semibold text-white mb-3">
                Use <span className="text-indigo-400">SchemaCheck</span> when:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Validating hundreds or thousands of URLs</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Blocking deploys with schema regressions in CI</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Validating raw JSON-LD before publishing</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Building AI agents that audit structured data</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Running nightly monitors across your content archive</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">Automate what Google&apos;s tool can only do manually</h2>
          <p className="text-gray-400 text-sm mb-4">
            Free plan — 100 validations/month. API key in 30 seconds. No credit card.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get free API key →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              View pricing
            </Link>
          </div>
        </section>

        {/* Internal links */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Related</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: "/use-cases/seo-audit", label: "SEO Audits", desc: "Bulk validate sitemaps and monitor at scale" },
              { href: "/use-cases/ai-agents", label: "AI Agents", desc: "Let LLMs validate structured data programmatically" },
              { href: "/comparisons/schema-markup-validator-alternative", label: "vs Schema Markup Validator", desc: "Compare with other web-based validators" },
              { href: "/docs/options", label: "Response reference", desc: "Full API response object documentation" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-[#111118] hover:bg-[#13131c] transition-all"
              >
                <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors mb-0.5">
                  {link.label} →
                </p>
                <p className="text-xs text-gray-500">{link.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
