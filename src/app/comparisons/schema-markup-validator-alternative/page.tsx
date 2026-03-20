import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Schema Markup Validator Alternative — SchemaCheck",
  description:
    "Better schema markup validator tool with a REST API. SchemaCheck checks Google rich result eligibility, not just syntax — with fix suggestions and monitoring.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Schema Markup Validator Alternative — SchemaCheck",
    description:
      "SchemaCheck checks Google rich result eligibility, not just syntax — with fix suggestions, deprecation warnings, and continuous monitoring.",
    url: "https://schemacheck.dev/comparisons/schema-markup-validator-alternative",
    isPartOf: { "@type": "WebSite", name: "SchemaCheck", url: "https://schemacheck.dev" },
  },
  null,
  2
);

const comparison = [
  {
    feature: "Rich result eligibility check",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
    note: "SchemaCheck reports whether your schema qualifies for Google rich results.",
  },
  {
    feature: "Google deprecation warnings",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
    note: "Flags HowTo, restricted FAQPage, and other deprecated schema patterns.",
  },
  {
    feature: "Fix suggestions",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
    note: "Each error includes a specific remediation and documentation link.",
  },
  {
    feature: "Validate by URL",
    schemacheck: "✓",
    schema_org: "✓",
    other: "✓",
    note: "All tools support URL-based validation.",
  },
  {
    feature: "Validate raw JSON-LD",
    schemacheck: "✓",
    schema_org: "✓",
    other: "Varies",
    note: "Validate schema before publishing — no live page needed.",
  },
  {
    feature: "REST API",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
    note: "SchemaCheck is the only option with a machine-readable API.",
  },
  {
    feature: "Bulk / batch validation",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
    note: "Validate entire sitemaps programmatically.",
  },
  {
    feature: "CI / CD integration",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
    note: "Block deploys with schema errors via GitHub Actions.",
  },
  {
    feature: "URL monitoring",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
    note: "Re-validate on a schedule and alert on changes.",
  },
  {
    feature: "0–100 health score",
    schemacheck: "✓",
    schema_org: "—",
    other: "—",
    note: "Machine-readable quality score for tracking over time.",
  },
  {
    feature: "Full Schema.org spec coverage",
    schemacheck: "35+ types",
    schema_org: "Full",
    other: "Varies",
    note: "Schema.org validator covers the full spec. SchemaCheck covers Google's supported types.",
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
          <Link href="/comparisons" className="hover:text-gray-400">Comparisons</Link>
          <span>/</span>
          <span className="text-gray-400">vs Schema Markup Validators</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Comparison
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            The Best Schema Markup Validator Alternative
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            General validators check whether your schema is syntactically correct. SchemaCheck
            checks what Google actually requires for rich results — including current
            deprecations, property-level restrictions, and eligibility rules. Syntax is the
            floor, not the goal.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Start for free →
            </Link>
            <Link
              href="/docs/options"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              API reference
            </Link>
          </div>
        </div>

        {/* The syntax vs eligibility gap */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Syntax-valid is not the same as rich-result eligible
          </h2>
          <p className="text-gray-400 mb-4">
            Most schema markup validators confirm that your JSON-LD is well-formed and
            matches the Schema.org specification. That&apos;s genuinely useful — but it answers
            the wrong question. The question that matters for SEO is not &ldquo;is this
            valid JSON-LD?&rdquo; It&apos;s &ldquo;will Google use this for rich results?&rdquo;
          </p>
          <p className="text-gray-400 mb-4">
            Google maintains its own set of requirements that differ from the Schema.org spec.
            It restricts which properties qualify, it deprecates entire schema types (HowTo
            rich results were deprecated in 2023), and it imposes content policies that a
            spec validator has no visibility into. SchemaCheck validates against Google&apos;s
            current requirements — not just the spec.
          </p>
          <div className="space-y-2">
            {[
              {
                label: "FAQPage restrictions",
                desc: "Google restricted FAQPage rich results to authoritative government and health sites in 2023. A spec validator marks your FAQPage schema as valid. SchemaCheck flags that it won't generate rich results for most sites.",
              },
              {
                label: "HowTo deprecation",
                desc: "HowTo rich results were deprecated by Google. Schema.org still defines the type as valid. Only a Google-aware validator will warn you that the schema is a dead end.",
              },
              {
                label: "Required vs recommended properties",
                desc: "Google requires specific properties that the Schema.org spec marks as optional. Missing them produces a syntactically valid schema that Google can't use for rich results.",
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 p-4 rounded-lg bg-[#111118] border border-gray-800/60">
                <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠</span>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            How the tools compare
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {[
              {
                tool: "Schema.org Validator",
                url: "validator.schema.org",
                highlight: false,
                note: "Most comprehensive spec coverage. Validates against the full Schema.org spec. No Google eligibility checks, no API.",
              },
              {
                tool: "Google Rich Results Test",
                url: "search.google.com/test/rich-results",
                highlight: false,
                note: "Google's official renderer. Checks eligibility using Googlebot. Manual, web-only, one URL at a time.",
              },
              {
                tool: "Merkle Schema Markup Validator",
                url: "technicalseo.com/tools/schema-markup-validator",
                highlight: false,
                note: "Popular SEO tool. Web-based, no API, one URL at a time.",
              },
              {
                tool: "SchemaCheck",
                url: "schemacheck.dev/api/v1/validate",
                highlight: true,
                note: "Google eligibility checks, fix suggestions, deprecation warnings, REST API, and monitoring.",
              },
            ].map((item) => (
              <div
                key={item.tool}
                className={`p-4 rounded-xl border ${
                  item.highlight
                    ? "border-indigo-800/60 bg-indigo-950/10"
                    : "border-gray-800 bg-[#111118]"
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span className={`font-bold shrink-0 mt-0.5 ${item.highlight ? "text-indigo-400" : "text-gray-600"}`}>
                    {item.highlight ? "✓" : "✗"}
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
                    <td className="px-4 py-3">
                      <p className="text-sm text-white font-medium">{row.feature}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{row.note}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${
                        row.schemacheck === "✓" ? "text-indigo-400" :
                        row.schemacheck === "—" ? "text-gray-700" : "text-gray-400"
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

        {/* Three differentiators */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">
            What SchemaCheck checks that other validators miss
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Google&apos;s current deprecations and restrictions
              </h3>
              <p className="text-sm text-gray-400">
                Schema.org validators are spec validators — they reflect what the specification
                defines, not what Google currently supports. SchemaCheck tracks Google&apos;s
                documented changes to rich result eligibility, including schema types that have
                been deprecated or restricted for most sites. You get warned before your schema
                becomes a dead end.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Property-level fix suggestions, not just error counts
              </h3>
              <p className="text-sm text-gray-400">
                Most validators tell you something is wrong and point at the spec. SchemaCheck
                tells you exactly which property is missing or malformed, why it matters for
                rich results, and what the correct value or format should be. Each error links
                directly to the relevant Google documentation.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Automation and monitoring that web tools can&apos;t provide
              </h3>
              <p className="text-sm text-gray-400">
                Every web-based validator requires a browser, a person, and a single URL at a
                time. SchemaCheck&apos;s REST API lets you validate at scale — in CI pipelines,
                on a schedule, across thousands of URLs, or from any tool that can make an HTTP
                request. Free tier covers 100 validations/month.
              </p>
            </div>
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
                Checking schema types that SchemaCheck doesn&apos;t yet support
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500 shrink-0">→</span>
                Validating against the full Schema.org specification rather than Google&apos;s subset
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500 shrink-0">→</span>
                Debugging a page with complex client-side JavaScript rendering
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500 shrink-0">→</span>
                Getting Google&apos;s ground-truth Googlebot render result for a specific URL
              </li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              Use both. Web validators for one-off debugging against the spec;
              SchemaCheck for Google eligibility checks, automation, and monitoring.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">
            Check what Google actually requires
          </h2>
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
              { href: "/comparisons/google-rich-results-test-alternative", label: "vs Google Rich Results Test", desc: "Detailed comparison with Google's official manual tool" },
              { href: "/comparisons/screaming-frog-schema-validation", label: "vs Screaming Frog", desc: "Schema validation beyond periodic site crawls" },
              { href: "/comparisons/ahrefs-schema-validation", label: "vs Ahrefs", desc: "Purpose-built schema depth vs. broad SEO audits" },
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
