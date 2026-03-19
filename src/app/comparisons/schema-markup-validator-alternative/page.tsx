import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Schema Markup Validator Alternative — SchemaCheck",
  description:
    "Better schema markup validator tool with a REST API. Compare SchemaCheck vs schema.org validator, JSON-LD validator, and schema markup checker tools. Automate validation in CI/CD, bulk-audit sitemaps, and power AI agents.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Schema Markup Validator Alternative",
    description:
      "Why developers choose a REST API over web-based schema markup validators. Compare SchemaCheck vs Schema.org validator and other tools.",
    url: "https://schemacheck.dev/comparisons/schema-markup-validator-alternative",
    isPartOf: { "@type": "WebSite", name: "SchemaCheck", url: "https://schemacheck.dev" },
  },
  null,
  2
);

const CI_EXAMPLE = `# GitHub Actions — fails CI if schema errors are found
# No web-based validator can do this
- name: Validate schema markup
  run: |
    RESULT=$(curl -s "https://schemacheck.dev/api/v1/validate?url=https://example.com&access_key=$SCHEMACHECK_KEY")
    ERRORS=$(echo $RESULT | jq '.summary.total_errors')
    if [ "$ERRORS" -gt 0 ]; then
      echo "Schema errors found:"
      echo $RESULT | jq '.schemas[].errors[] | "  \\(.property): \\(.message)"'
      exit 1
    fi
    echo "Schema valid — score: $(echo $RESULT | jq '.summary.score')/100"`;

const comparison = [
  {
    feature: "REST API",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
  },
  {
    feature: "Validate raw JSON-LD (no live page)",
    schemacheck: "✓",
    schema_org: "✓",
    other: "Varies",
  },
  {
    feature: "Validate by URL",
    schemacheck: "✓",
    schema_org: "✓",
    other: "✓",
  },
  {
    feature: "Bulk / batch validation",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
  },
  {
    feature: "CI / CD integration",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
  },
  {
    feature: "Fix suggestions",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
  },
  {
    feature: "Rich result eligibility check",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
  },
  {
    feature: "Google deprecation warnings",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
  },
  {
    feature: "0–100 health score",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
  },
  {
    feature: "Response caching",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
  },
  {
    feature: "Full Schema.org spec coverage",
    schemacheck: "9 types",
    schema_org: "Full",
    other: "Varies",
  },
];

export default function SchemaMarkupValidatorAlternativePage() {
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
          <span className="text-gray-400">vs Schema Markup Validators</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Comparison
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Best Schema Markup Checker Alternative
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            Web-based schema validators are useful for one-off checks. They&apos;re useless for
            automation. SchemaCheck gives you the REST API that existing validators don&apos;t —
            so you can validate at scale, in CI, and in your own tools.
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

        {/* The problem with web-only validators */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            JSON-LD Validator Comparison
          </h2>
          <p className="text-gray-400 mb-4">
            Compared to the schema.org validator (validator.schema.org) — which is the most comprehensive
            structured data checker available — SchemaCheck adds the REST API that existing schema markup checker tools lack. Every web-based validator has the same
            constraint: no API, no automation path.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                tool: "Schema.org Validator",
                url: "validator.schema.org",
                hasApi: false,
                note: "Most comprehensive spec coverage. No API, no automation path.",
              },
              {
                tool: "Google Rich Results Test",
                url: "search.google.com/test/rich-results",
                hasApi: false,
                note: "Google's official renderer. No API, web UI only.",
              },
              {
                tool: "Merkle Schema Markup Validator",
                url: "technicalseo.com/tools/schema-markup-validator",
                hasApi: false,
                note: "Popular SEO tool. No API, one URL at a time.",
              },
              {
                tool: "SchemaCheck API",
                url: "schemacheck.dev/api/v1/validate",
                hasApi: true,
                note: "REST API. Built for automation, CI, and agent workflows.",
              },
            ].map((item) => (
              <div
                key={item.tool}
                className={`p-4 rounded-xl border ${
                  item.hasApi
                    ? "border-indigo-800/60 bg-indigo-950/10"
                    : "border-gray-800 bg-[#111118]"
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span className={`font-bold shrink-0 mt-0.5 ${item.hasApi ? "text-indigo-400" : "text-gray-600"}`}>
                    {item.hasApi ? "✓" : "✗"}
                  </span>
                  <p className="text-sm font-medium text-white">{item.tool}</p>
                </div>
                <p className="text-xs font-mono text-gray-600 mb-2 pl-5">{item.url}</p>
                <p className="text-xs text-gray-500 pl-5">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Feature comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0d0d14]">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Feature</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-28">SchemaCheck</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-28">Schema.org</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-24">Others</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-800/50 ${i % 2 === 0 ? "bg-[#111118]" : "bg-[#0d0d14]"}`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-300">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${
                        row.schemacheck === "✓" ? "text-indigo-400" : "text-gray-500"
                      }`}>
                        {row.schemacheck}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${
                        row.schema_org === "✓" ? "text-green-500" :
                        row.schema_org === "—" ? "text-gray-700" : "text-gray-400"
                      }`}>
                        {row.schema_org}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${
                        row.other === "✓" ? "text-green-500" :
                        row.other === "—" ? "text-gray-700" : "text-gray-500"
                      }`}>
                        {row.other}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* The thing no validator does */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">
            What only SchemaCheck can do
          </h2>
          <p className="text-gray-400 mb-4">
            No web-based validator can be embedded in a GitHub Actions workflow. This means
            schema regressions ship to production silently, and developers find out weeks
            later when rich results disappear.
          </p>
          <CodeBlock language="yaml" code={CI_EXAMPLE} />
        </section>

        {/* Use cases where an API is required */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            When you need an API instead of a web tool
          </h2>
          <div className="space-y-2">
            {[
              {
                label: "Bulk sitemap audits",
                desc: "Auditing 10,000 pages manually is impossible. With SchemaCheck's API you can pull all URLs from a sitemap, validate each one, and sort by worst score — in minutes.",
              },
              {
                label: "Publish-time validation",
                desc: "WordPress, Shopify, and Webflow all support webhooks on publish. You can call the SchemaCheck API from those webhooks and alert before the page has been cached by Google.",
              },
              {
                label: "CI/CD schema gates",
                desc: "Block a deploy when a developer removes a required schema property. Web validators can't do this — they have no way to be called from a terminal.",
              },
              {
                label: "AI agent tool use",
                desc: "When a user asks an LLM to audit their site's structured data, the agent needs an API endpoint to call. Every existing validator requires a browser.",
              },
              {
                label: "Monitoring dashboards",
                desc: "Track schema health score over time. Visualize which pages are rich-result eligible. Build a schema health dashboard inside your existing observability stack.",
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 p-4 rounded-lg bg-[#111118] border border-gray-800/60">
                <span className="text-indigo-400 text-sm shrink-0 mt-0.5">→</span>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* When to use web validators */}
        <section className="mb-12">
          <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
            <h2 className="text-base font-semibold text-white mb-3">
              When should you still use a web-based validator?
            </h2>
            <p className="text-sm text-gray-400 mb-3">
              Web validators are still the right tool for some jobs:
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-gray-500 shrink-0">→</span>
                Manually debugging a single page that&apos;s not showing rich results in Google
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500 shrink-0">→</span>
                Validating schemas on pages that rely on client-side JavaScript rendering
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500 shrink-0">→</span>
                Checking types that SchemaCheck doesn&apos;t yet support (Event, Recipe, etc.)
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500 shrink-0">→</span>
                Getting Google&apos;s official ground-truth render result for a specific URL
              </li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              Use both tools. SchemaCheck for automation and scale; Google&apos;s Rich Results
              Test for ground-truth verification.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">Start automating schema validation</h2>
          <p className="text-gray-400 text-sm mb-4">
            Free plan — 100 validations/month. No credit card. Works with any language or
            platform that can make an HTTP request.
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
              { href: "/comparisons/google-rich-results-test-alternative", label: "vs Google Rich Results Test", desc: "Detailed comparison with Google's official tool" },
              { href: "/use-cases/seo-audit", label: "SEO Audit use case", desc: "Bulk validate sitemaps with the API" },
              { href: "/use-cases/ai-agents", label: "AI Agents", desc: "Let LLMs call the SchemaCheck API" },
              { href: "/docs/getting-started", label: "Getting started", desc: "API key in 30 seconds" },
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
