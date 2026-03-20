import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ahrefs Schema Validation Alternative — SchemaCheck",
  description:
    "Ahrefs flags schema issues in site audits. SchemaCheck specializes in schema validation — 35+ schema types, fix suggestions, rich result eligibility, and continuous monitoring.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SchemaCheck",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    description:
      "SchemaCheck specializes in schema validation — 35+ schema types, property-level fix suggestions, rich result eligibility, and continuous monitoring.",
    url: "https://schemacheck.dev",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier — 100 validations per month",
    },
    featureList: [
      "35+ schema type coverage",
      "Rich result eligibility checks",
      "Property-level fix suggestions",
      "REST API",
      "CI/CD integration",
      "Continuous URL monitoring",
      "Deprecation warnings",
      "No-code web checker",
    ],
  },
  null,
  2
);

const comparison = [
  {
    feature: "Schema-specific validation",
    schemacheck: "✓ Deep",
    ahrefs: "✓ Surface-level",
    note: "SchemaCheck validates per Google's rich result rules. Ahrefs catches obvious errors.",
  },
  {
    feature: "Rich result eligibility",
    schemacheck: "✓",
    ahrefs: "—",
    note: "SchemaCheck checks whether each schema type meets Google's eligibility requirements.",
  },
  {
    feature: "Fix suggestions",
    schemacheck: "✓ Property-level",
    ahrefs: "—",
    note: "SchemaCheck provides specific fixes per property. Ahrefs flags issues without guidance.",
  },
  {
    feature: "REST API",
    schemacheck: "✓",
    ahrefs: "—",
    note: "SchemaCheck exposes a REST API for automation. Ahrefs has no schema validation API.",
  },
  {
    feature: "Validate before deploy",
    schemacheck: "✓",
    ahrefs: "—",
    note: "SchemaCheck works in CI pipelines and accepts raw JSON-LD before pages are live.",
  },
  {
    feature: "Continuous URL monitoring",
    schemacheck: "✓",
    ahrefs: "✓ (periodic crawl)",
    note: "SchemaCheck monitors continuously. Ahrefs re-crawls on a schedule.",
  },
  {
    feature: "35+ schema types",
    schemacheck: "✓",
    ahrefs: "Partial",
    note: "SchemaCheck covers Google's full set of rich result types. Ahrefs covers common ones.",
  },
  {
    feature: "Deprecation warnings",
    schemacheck: "✓",
    ahrefs: "—",
    note: "SchemaCheck flags deprecated types like HowTo and restricted FAQPage.",
  },
  {
    feature: "No-code web checker",
    schemacheck: "✓",
    ahrefs: "—",
    note: "SchemaCheck has a no-code interface. Ahrefs schema data requires an account and crawl.",
  },
  {
    feature: "Full SEO platform",
    schemacheck: "—",
    ahrefs: "✓",
    note: "Ahrefs covers backlinks, keywords, rank tracking, and site audits.",
  },
  {
    feature: "Free tier",
    schemacheck: "✓",
    ahrefs: "—",
    note: "SchemaCheck free tier covers 100 validations/month. Ahrefs is paid-only.",
  },
];

export default function AhrefsSchemaValidationPage() {
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
          <span className="text-gray-400">vs Ahrefs</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Comparison
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            SchemaCheck vs Ahrefs for Schema Validation
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            Ahrefs is a comprehensive SEO platform. Its site audit catches obvious schema
            errors. But for teams who need to go deep on structured data — with property-level
            fix suggestions, rich result eligibility, and real-time validation — SchemaCheck
            is purpose-built for this.
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

        {/* Feature comparison table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Feature comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0d0d14]">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Feature</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-32">SchemaCheck</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-32">Ahrefs Site Audit</th>
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
                        className={`text-sm font-semibold ${
                          row.schemacheck === "✓" ||
                          row.schemacheck === "✓ Deep" ||
                          row.schemacheck === "✓ Property-level"
                            ? "text-indigo-400"
                            : "text-gray-700"
                        }`}
                      >
                        {row.schemacheck}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          row.ahrefs === "✓"
                            ? "text-green-500"
                            : row.ahrefs === "✓ (periodic crawl)" ||
                              row.ahrefs === "✓ Surface-level" ||
                              row.ahrefs === "Partial"
                            ? "text-amber-500"
                            : "text-gray-700"
                        }`}
                      >
                        {row.ahrefs}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Three key differentiators */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Where SchemaCheck goes deeper
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Schema depth, not schema breadth
              </h3>
              <p className="text-sm text-gray-400">
                Ahrefs audits schema as one signal among hundreds — it surfaces errors but
                doesn&apos;t go deep. SchemaCheck validates against Google&apos;s specific rich result
                requirements for each of 35+ schema types, flags deprecated patterns, and
                checks property-level compliance. You get the kind of detail you&apos;d otherwise
                have to cross-reference manually against Google&apos;s developer documentation.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Fix suggestions at the property level
              </h3>
              <p className="text-sm text-gray-400">
                When Ahrefs flags a schema issue, it tells you there&apos;s a problem. SchemaCheck
                tells you exactly which property is missing or incorrect, what value is expected,
                and links you directly to the relevant Google documentation. For teams managing
                schema at scale, the difference between &ldquo;something is wrong&rdquo; and &ldquo;here&apos;s
                exactly what to fix&rdquo; is hours of developer time.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                An API built for developer workflows
              </h3>
              <p className="text-sm text-gray-400">
                Ahrefs exposes an API for rank tracking and backlink data, but not for schema
                validation. SchemaCheck&apos;s REST API is built for exactly this: validate a URL
                or raw JSON-LD, get a structured JSON response, integrate into CI/CD, and
                automate audits across thousands of pages. No browser, no manual steps.
              </p>
            </div>
          </div>
        </section>

        {/* When to use each */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">When to use each tool</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <p className="text-sm font-semibold text-white mb-3">
                Use <span className="text-green-400">Ahrefs</span> when:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>You need backlink analysis, keyword research, or rank tracking</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Running a broad technical SEO audit across your site</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>You want schema issues in context with other SEO signals</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>You&apos;re already an Ahrefs subscriber and want a quick overview</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-indigo-800/60 bg-indigo-950/10">
              <p className="text-sm font-semibold text-white mb-3">
                Use <span className="text-indigo-400">SchemaCheck</span> when:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>You need Google rich result eligibility, not just error counts</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>You want property-level fix suggestions with documentation links</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>You need schema validation in CI or automated workflows</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>You want to monitor pages continuously between crawls</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>You need a schema API without an Ahrefs subscription</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">
            Start validating for free — 100 validations/month, no credit card
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            35+ schema types. Rich result eligibility. Property-level fix suggestions.
            API key in under a minute.
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
              { href: "/comparisons/screaming-frog-schema-validation", label: "vs Screaming Frog", desc: "Real-time validation vs. periodic crawl-based checks" },
              { href: "/comparisons/google-rich-results-test-alternative", label: "vs Google Rich Results Test", desc: "Manual validation gold standard, compared" },
              { href: "/comparisons/schema-markup-validator-alternative", label: "vs Schema Markup Validators", desc: "Google eligibility vs. spec-only syntax validation" },
              { href: "/docs/options", label: "API reference", desc: "Full response object and parameter documentation" },
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
