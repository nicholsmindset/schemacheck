import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Screaming Frog Schema Validation Alternative — SchemaCheck",
  description:
    "Screaming Frog finds schema issues during site crawls. SchemaCheck validates structured data before you deploy and monitors changes continuously — with fix suggestions and rich result eligibility checks.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SchemaCheck",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    description:
      "SchemaCheck validates structured data before you deploy and monitors changes continuously — with fix suggestions and rich result eligibility checks.",
    url: "https://schemacheck.dev",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier — 100 validations per month",
    },
    featureList: [
      "Real-time schema validation",
      "CI/CD integration",
      "Rich result eligibility checks",
      "Fix suggestions",
      "Continuous URL monitoring",
      "REST API",
      "Batch URL validation",
      "Deprecation warnings",
    ],
  },
  null,
  2
);

const comparison = [
  {
    feature: "Real-time validation",
    schemacheck: "✓",
    sf: "—",
    note: "SchemaCheck validates instantly via API. Screaming Frog requires a full site crawl.",
  },
  {
    feature: "Validate before deploy",
    schemacheck: "✓",
    sf: "—",
    note: "SchemaCheck accepts raw JSON-LD — no live URL required. CI/CD integration supported.",
  },
  {
    feature: "Rich result eligibility",
    schemacheck: "✓",
    sf: "—",
    note: "SchemaCheck checks Google's current eligibility requirements per schema type.",
  },
  {
    feature: "Fix suggestions",
    schemacheck: "✓",
    sf: "—",
    note: "Each error includes a specific remediation with a documentation link.",
  },
  {
    feature: "Continuous monitoring",
    schemacheck: "✓",
    sf: "—",
    note: "SchemaCheck re-validates URLs on a schedule and alerts on changes.",
  },
  {
    feature: "REST API",
    schemacheck: "✓",
    sf: "—",
    note: "SchemaCheck is API-first. Screaming Frog is a desktop application.",
  },
  {
    feature: "Batch URL validation",
    schemacheck: "✓",
    sf: "✓ (via crawl)",
    note: "Both support bulk validation. SchemaCheck via API; Screaming Frog via crawl.",
  },
  {
    feature: "No-code web checker",
    schemacheck: "✓",
    sf: "—",
    note: "SchemaCheck has a no-code web interface. Screaming Frog requires desktop install.",
  },
  {
    feature: "Deprecation warnings",
    schemacheck: "✓",
    sf: "—",
    note: "SchemaCheck flags deprecated and restricted schema types for Google.",
  },
  {
    feature: "Full site technical SEO audit",
    schemacheck: "—",
    sf: "✓",
    note: "Screaming Frog covers crawl budget, redirects, canonicals, and more.",
  },
  {
    feature: "Free tier",
    schemacheck: "✓ 100/mo",
    sf: "—",
    note: "SchemaCheck free tier covers automation and testing. Screaming Frog is paid.",
  },
];

export default function ScreamingFrogSchemaValidationPage() {
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
          <span className="text-gray-400">vs Screaming Frog</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Comparison
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            SchemaCheck vs Screaming Frog for Schema Validation
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            Screaming Frog is a powerful crawler. But it validates schema as part of a broader
            site audit — not in real-time, not before deploy, and not with rich result
            eligibility checks. SchemaCheck is purpose-built for structured data: validate
            before you publish, monitor continuously after.
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
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-28">SchemaCheck</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium w-36">Screaming Frog</th>
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
                          row.schemacheck === "✓" || row.schemacheck === "✓ 100/mo"
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
                          row.sf === "✓"
                            ? "text-green-500"
                            : row.sf === "✓ (via crawl)"
                            ? "text-amber-500"
                            : "text-gray-700"
                        }`}
                      >
                        {row.sf}
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
            Where SchemaCheck goes further
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Validate before the page is live
              </h3>
              <p className="text-sm text-gray-400">
                Screaming Frog crawls pages that already exist. SchemaCheck accepts raw JSON-LD
                via POST, so you can validate schema during development — in a CI pipeline, a
                pre-publish webhook, or a local build step. By the time Screaming Frog finds
                the issue, it&apos;s already in production.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Rich result eligibility, not just error detection
              </h3>
              <p className="text-sm text-gray-400">
                Screaming Frog flags structured data errors it can identify from the page source.
                SchemaCheck goes further: it checks whether your schema meets Google&apos;s current
                requirements for each rich result type, including recently deprecated types and
                property-level restrictions that don&apos;t show up as simple errors.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Continuous monitoring between crawls
              </h3>
              <p className="text-sm text-gray-400">
                A Screaming Frog crawl is a point-in-time snapshot. Between crawls, a CMS
                template change can silently break schema across thousands of pages. SchemaCheck
                monitors URLs continuously and alerts you when a page&apos;s schema health score
                drops or its rich result eligibility changes — no crawl schedule required.
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
                Use <span className="text-green-400">Screaming Frog</span> when:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Running a full technical SEO audit across your site</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Auditing redirects, canonicals, and crawl budget</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Getting a broad overview of schema coverage site-wide</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>You need schema issues in context with other SEO data</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-indigo-800/60 bg-indigo-950/10">
              <p className="text-sm font-semibold text-white mb-3">
                Use <span className="text-indigo-400">SchemaCheck</span> when:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Validating schema in CI before pages go live</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Checking Google rich result eligibility specifically</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Monitoring pages continuously between crawls</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Getting property-level fix suggestions per error</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Integrating schema validation into automated workflows</li>
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
            Validate before you deploy. Monitor after. Get fix suggestions with every error.
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
              { href: "/comparisons/ahrefs-schema-validation", label: "vs Ahrefs", desc: "Purpose-built schema depth vs. broad SEO platform audits" },
              { href: "/comparisons/google-rich-results-test-alternative", label: "vs Google Rich Results Test", desc: "The manual validation gold standard, compared" },
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
