import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Google Rich Results Test Alternative — SchemaCheck",
  description:
    "Looking for a Google Rich Results Test alternative with an API? SchemaCheck validates structured data at scale — batch validation, CI/CD integration, and monitoring. Free tier available.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Google Rich Results Test Alternative — SchemaCheck",
    description:
      "SchemaCheck validates structured data at scale — batch validation, CI/CD integration, and monitoring. The programmatic alternative to Google's Rich Results Test.",
    url: "https://schemacheck.dev/comparisons/google-rich-results-test-alternative",
    isPartOf: { "@type": "WebSite", name: "SchemaCheck", url: "https://schemacheck.dev" },
  },
  null,
  2
);

const comparison = [
  {
    feature: "No-code web checker",
    schemacheck: "✓",
    google: "✓",
    note: "Both offer a no-code URL checker for quick one-off validation.",
  },
  {
    feature: "URL monitoring",
    schemacheck: "✓",
    google: "—",
    note: "SchemaCheck monitors URLs continuously. Google's tool is manual-only.",
  },
  {
    feature: "Bulk / batch validation",
    schemacheck: "✓",
    google: "—",
    note: "Validate thousands of URLs programmatically. Not possible with Google's tool.",
  },
  {
    feature: "REST API",
    schemacheck: "✓",
    google: "—",
    note: "SchemaCheck is API-first. Google's tool is web-only.",
  },
  {
    feature: "CI / CD integration",
    schemacheck: "✓",
    google: "—",
    note: "Block deploys with schema errors via GitHub Actions.",
  },
  {
    feature: "Validate before publish",
    schemacheck: "✓",
    google: "—",
    note: "Submit raw JSON-LD — no live page needed.",
  },
  {
    feature: "Fix suggestions",
    schemacheck: "✓",
    google: "—",
    note: "Each error includes a specific fix with documentation link.",
  },
  {
    feature: "Rich result eligibility",
    schemacheck: "✓",
    google: "✓",
    note: "Both check eligibility. SchemaCheck returns a machine-readable result.",
  },
  {
    feature: "Deprecation warnings",
    schemacheck: "✓",
    google: "Partial",
    note: "SchemaCheck flags HowTo and restricted FAQPage schemas explicitly.",
  },
  {
    feature: "0–100 health score",
    schemacheck: "✓",
    google: "—",
    note: "Machine-readable quality score for tracking and monitoring.",
  },
  {
    feature: "Free tier",
    schemacheck: "✓ 100/mo",
    google: "✓ Unlimited",
    note: "Google's tool is free for manual use. SchemaCheck free tier covers automation.",
  },
  {
    feature: "JavaScript-rendered schemas",
    schemacheck: "Partial",
    google: "✓",
    note: "SchemaCheck fetches server-side HTML. Google renders JS via Googlebot.",
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
          <Link href="/comparisons" className="hover:text-gray-400">Comparisons</Link>
          <span>/</span>
          <span className="text-gray-400">vs Google Rich Results Test</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Comparison
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            The Best Google Rich Results Test Alternative
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            Google&apos;s Rich Results Test is the right tool for checking one URL manually.
            SchemaCheck is for when you need to validate at scale, programmatically, or
            continuously — with a REST API, batch mode, and monitoring built in.
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

        {/* When Google's tool isn't enough */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            When Google&apos;s tool stops being enough
          </h2>
          <p className="text-gray-400 mb-4">
            Google&apos;s Rich Results Test is excellent for what it does: check a single URL in a
            browser and see whether Google can render rich results. It&apos;s the industry standard
            for one-off debugging. But it has a hard ceiling. It can&apos;t be automated, can&apos;t
            be called from a script, and can&apos;t watch your pages over time. If any of the
            following sounds familiar, you need something more:
          </p>
          <div className="space-y-2">
            {[
              "You have hundreds or thousands of pages to audit and can't check them one by one",
              "A developer removed a required schema field and it shipped to production undetected",
              "You want to validate schema on staging before the page is live",
              "You need schema validation in your CI pipeline or deploy workflow",
              "You want to know when a page's rich result eligibility changes — without manually checking",
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
          <h2 className="text-2xl font-semibold text-white mb-4">
            SchemaCheck vs Google Rich Results Test
          </h2>
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
                          row.schemacheck === "✓" || row.schemacheck === "✓ 100/mo"
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
                          row.google === "✓" || row.google === "✓ Unlimited"
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

        {/* Three differentiators */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">
            What SchemaCheck adds on top
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Validate at scale, not one URL at a time
              </h3>
              <p className="text-sm text-gray-400">
                SchemaCheck&apos;s REST API lets you validate any number of URLs in a loop — from
                a sitemap, a product feed, or a database export. Run a nightly audit across
                your entire content archive and surface pages that have dropped out of rich
                result eligibility, without opening a browser.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Catch schema regressions before they deploy
              </h3>
              <p className="text-sm text-gray-400">
                Add SchemaCheck to your GitHub Actions workflow and block deploys when schema
                errors are introduced. Google&apos;s tool requires a live page and a browser — it
                has no way to be called from a terminal or CI pipeline. SchemaCheck also
                accepts raw JSON-LD, so you can validate schemas that don&apos;t yet exist on a
                live URL.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
              <h3 className="text-base font-semibold text-white mb-2">
                Monitor pages continuously, not just on demand
              </h3>
              <p className="text-sm text-gray-400">
                Google&apos;s tool only checks when you open it. SchemaCheck can re-validate URLs
                on a schedule and alert you when a page&apos;s schema health score drops or its
                rich result eligibility changes — useful for CMS-driven sites where a template
                change can silently break structured data across thousands of pages.
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
                Use <span className="text-green-400">Google Rich Results Test</span> when:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Verifying a single page before launch</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Debugging a rich result that isn&apos;t showing in Search</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>Checking pages that rely on JavaScript rendering</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span>You need Google&apos;s ground-truth Googlebot render</li>
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
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Monitoring pages continuously for schema changes</li>
                <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span>Building tools or agents that need a schema API</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">
            Start validating for free
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            100 validations/month, no credit card required. API key in under a minute.
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
              { href: "/comparisons/schema-markup-validator-alternative", label: "vs Schema Markup Validators", desc: "Compare with schema.org validator and other web-based tools" },
              { href: "/comparisons/screaming-frog-schema-validation", label: "vs Screaming Frog", desc: "Schema validation beyond periodic site crawls" },
              { href: "/comparisons/ahrefs-schema-validation", label: "vs Ahrefs", desc: "Purpose-built schema depth vs. broad site audits" },
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
