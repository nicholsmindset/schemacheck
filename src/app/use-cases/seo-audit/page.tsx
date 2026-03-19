import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Schema Markup Checker for SEO Audits",
  description:
    "Include structured data in your SEO audit workflow. Use SchemaCheck as your schema markup checker to catch missing required properties, deprecated types, and rich result gaps across thousands of pages — via REST API.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Schema Validation for SEO Audits",
    description:
      "Automate Schema.org structured data validation in your SEO audit workflow. Catch missing required properties, deprecated types, and rich result gaps across thousands of pages.",
    url: "https://schemacheck.dev/use-cases/seo-audit",
    isPartOf: { "@type": "WebSite", name: "SchemaCheck", url: "https://schemacheck.dev" },
  },
  null,
  2
);

const SITEMAP_AUDIT_CODE = `import requests
import xml.etree.ElementTree as ET

API_KEY = "YOUR_KEY"

# Step 1: Pull all URLs from a sitemap
def get_sitemap_urls(sitemap_url: str) -> list[str]:
    r = requests.get(sitemap_url, timeout=10)
    root = ET.fromstring(r.text)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [loc.text for loc in root.findall("sm:url/sm:loc", ns)]

# Step 2: Validate each URL and collect issues
urls = get_sitemap_urls("https://example.com/sitemap.xml")
report = []

for url in urls:
    resp = requests.get(
        "https://schemacheck.dev/api/v1/validate",
        params={"url": url, "access_key": API_KEY},
        timeout=30,
    )
    data = resp.json()
    if not data.get("success"):
        continue

    summary = data["summary"]
    if summary["total_errors"] > 0 or summary["total_warnings"] > 0:
        report.append({
            "url": url,
            "score": summary["score"],
            "errors": summary["total_errors"],
            "warnings": summary["total_warnings"],
            "rich_result_eligible": summary["rich_result_eligible"],
        })

# Step 3: Sort by worst score first
report.sort(key=lambda x: x["score"])

for item in report[:10]:
    print(f"{item['score']:3}/100  {item['errors']}err {item['warnings']}warn  {item['url']}")`;

const CI_CODE = `# .github/workflows/schema-audit.yml
name: Schema Audit

on:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate schemas
        run: |
          # Check key pages — fail CI if any have errors
          PAGES=(
            "https://example.com/"
            "https://example.com/blog/latest-post"
            "https://example.com/products/best-seller"
          )
          for url in "\${PAGES[@]}"; do
            RESULT=$(curl -s "https://schemacheck.dev/api/v1/validate?url=$url&access_key=\${{ secrets.SCHEMACHECK_API_KEY }}")
            ERRORS=$(echo $RESULT | jq '.summary.total_errors')
            SCORE=$(echo $RESULT | jq '.summary.score')
            echo "$url — score: $SCORE/100, errors: $ERRORS"
            if [ "$ERRORS" -gt 0 ]; then
              echo "❌ Schema errors found on $url"
              echo $RESULT | jq '.schemas[].errors[]'
              exit 1
            fi
          done
          echo "✓ All schema checks passed"`;

const SCREAMING_FROG_CODE = `// Export Screaming Frog URLs → validate → import back as custom column

const fs = require("fs");
const urls = fs.readFileSync("crawl-export.txt", "utf8").trim().split("\\n");

async function auditUrls(urls, concurrency = 5) {
  const results = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map(async (url) => {
        const res = await fetch(
          \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(url)}&access_key=\${process.env.SCHEMACHECK_API_KEY}\`
        );
        return res.json();
      })
    );

    for (let j = 0; j < batch.length; j++) {
      const s = settled[j];
      if (s.status === "fulfilled" && s.value.success) {
        const d = s.value;
        results.push({
          url: batch[j],
          score: d.summary.score,
          errors: d.summary.total_errors,
          warnings: d.summary.total_warnings,
          schemas: d.schemas.map((s) => s.type).join(", "),
          rich_eligible: d.summary.rich_result_eligible,
          cached: d.meta.cached,
        });
      }
    }

    process.stdout.write(\`\${Math.min(i + concurrency, urls.length)}/\${urls.length} validated\\r\`);
  }

  return results;
}

const results = await auditUrls(urls);
const csv = [
  "URL,Score,Errors,Warnings,Schema Types,Rich Results Eligible,Cached",
  ...results.map((r) =>
    [\`"\${r.url}"\`, r.score, r.errors, r.warnings, \`"\${r.schemas}"\`, r.rich_eligible, r.cached].join(",")
  ),
].join("\\n");

fs.writeFileSync("schema-audit-results.csv", csv);
console.log(\`\\nDone. Results saved to schema-audit-results.csv\`);`;

export default function SeoAuditPage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* JSON-LD structured data — eating our own dog food */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSONLD }}
      />

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-400">SchemaCheck</Link>
          <span>/</span>
          <Link href="/#use-cases" className="hover:text-gray-400">Use Cases</Link>
          <span>/</span>
          <span className="text-gray-400">SEO Audits</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Use Case
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Structured Data in SEO Audits
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            Most SEO audit tools skip structured data entirely. SchemaCheck gives you a REST API
            to validate every Schema.org block across your entire site — catch errors before Google
            does.
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
              View API docs
            </Link>
          </div>
        </div>

        {/* Problem */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">The problem with manual schema audits</h2>
          <p className="text-gray-400 mb-4">
            Google&apos;s Rich Results Test is the industry standard — but it&apos;s a web UI with
            no API, no bulk mode, and no CI integration. Auditing 50,000 pages means 50,000 manual
            checks. It&apos;s impossible to scale.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { stat: "0", label: "APIs offered by Google's Rich Results Test" },
              { stat: "~40%", label: "of pages with schema have at least one error" },
              { stat: "−10pts", label: "typical score penalty per missing recommended property" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl border border-gray-800 bg-[#111118]">
                <p className="text-2xl font-bold text-indigo-400 mb-1">{s.stat}</p>
                <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What it catches */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Schema Markup Tool for Audits — What SchemaCheck Catches</h2>
          <div className="space-y-2">
            {[
              { title: "Missing required properties", desc: "datePublished, author, and image on Article; name and offers on Product. Each missing property is a hard blocker for rich results." },
              { title: "Deprecated schema types", desc: "HowTo was retired by Google in August 2024. FAQPage is now restricted to government and health sites. SchemaCheck flags both automatically." },
              { title: "Rich result ineligibility", desc: "A schema can be technically valid JSON but still not qualify for rich results. SchemaCheck checks the full Google eligibility criteria, not just JSON syntax." },
              { title: "@graph arrays with broken children", desc: "JSON-LD @graph blocks often contain multiple schemas. SchemaCheck flattens and validates each child individually." },
              { title: "Empty and null property values", desc: "Tools like Yoast generate schemas with empty strings or null values for optional properties, which can confuse Google's parsers." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-4 rounded-lg bg-[#111118] border border-gray-800/60">
                <span className="text-green-400 text-sm shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Code: sitemap audit */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Bulk audit from a sitemap</h2>
          <p className="text-gray-400 mb-4">
            Pull every URL from your sitemap, validate each one, and sort by worst score. Run this
            nightly and pipe results into your reporting dashboard.
          </p>
          <CodeBlock language="python" code={SITEMAP_AUDIT_CODE} />
        </section>

        {/* Code: CI */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Fail CI on schema errors</h2>
          <p className="text-gray-400 mb-4">
            Add a GitHub Actions step that validates key pages on every deploy. Merge is blocked if
            any required properties are missing.
          </p>
          <CodeBlock language="yaml" code={CI_CODE} />
        </section>

        {/* Code: Screaming Frog */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Enrich Screaming Frog exports</h2>
          <p className="text-gray-400 mb-4">
            Export URLs from Screaming Frog, validate in bulk, and import schema scores back as a
            custom column. Your entire site in a single spreadsheet.
          </p>
          <CodeBlock language="javascript" code={SCREAMING_FROG_CODE} />
        </section>

        {/* Testimonial placeholder */}
        <section className="mb-12">
          <blockquote className="border-l-2 border-indigo-500 pl-5 py-1">
            <p className="text-gray-300 text-lg italic leading-relaxed">
              &ldquo;We run SchemaCheck against our sitemap every night. It caught a Yoast update
              that silently removed datePublished from 3,000 article pages before Google noticed.&rdquo;
            </p>
            <footer className="mt-3 text-sm text-gray-500">
              — SEO Lead at a B2B SaaS company (name withheld)
            </footer>
          </blockquote>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">Start validating in 2 minutes</h2>
          <p className="text-gray-400 text-sm mb-4">
            Free plan includes 100 validations per month. No credit card required.
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Related
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: "/use-cases/ecommerce", label: "E-commerce", desc: "Validate Product schemas for Google Shopping" },
              { href: "/use-cases/cms-plugins", label: "CMS Plugins", desc: "Validate at publish time in WordPress and Shopify" },
              { href: "/comparisons/google-rich-results-test-alternative", label: "vs Google Rich Results Test", desc: "Feature comparison and when to use each" },
              { href: "/docs/code-examples/python", label: "Python Examples", desc: "Full sitemap audit code with retry logic" },
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
