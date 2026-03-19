import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Ecommerce Schema — Validate Product & Shopping Structured Data",
  description:
    "Complete ecommerce schema validation for Shopify, WooCommerce, and custom storefronts. Validate schema markup for ecommerce — Product, Offer, price, availability, and aggregateRating at scale for Google Shopping rich results.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Product Schema Validation for E-commerce",
    description:
      "Validate Product and Offer schemas for Google Shopping rich results. Check name, image, offers, price, availability, and aggregateRating at scale.",
    url: "https://schemacheck.dev/use-cases/ecommerce",
    isPartOf: { "@type": "WebSite", name: "SchemaCheck", url: "https://schemacheck.dev" },
  },
  null,
  2
);

const SHOPIFY_CODE = `// Validate every product in your Shopify store via the Admin API
import Shopify from "@shopify/shopify-api";

const shop = "your-store.myshopify.com";
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const schemaKey = process.env.SCHEMACHECK_API_KEY;

// Fetch all product URLs from Shopify
async function getAllProductUrls(): Promise<string[]> {
  const response = await fetch(
    \`https://\${shop}/admin/api/2024-01/products.json?fields=handle&limit=250\`,
    { headers: { "X-Shopify-Access-Token": accessToken! } }
  );
  const { products } = await response.json();
  return products.map((p: { handle: string }) => \`https://\${shop}/products/\${p.handle}\`);
}

// Validate a single product URL
async function validateProduct(url: string) {
  const res = await fetch(
    \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(url)}&access_key=\${schemaKey}\`
  );
  return res.json();
}

// Run audit
const urls = await getAllProductUrls();
console.log(\`Validating \${urls.length} products...\`);

const issues: Array<{ url: string; errors: number; missingProps: string[] }> = [];

for (const url of urls) {
  const result = await validateProduct(url);
  if (!result.success) continue;

  const productSchema = result.schemas.find((s: { type: string }) => s.type === "Product");
  if (productSchema && productSchema.errors.length > 0) {
    issues.push({
      url,
      errors: productSchema.errors.length,
      missingProps: productSchema.properties_missing_required,
    });
  }
}

console.log(\`\\n\${issues.length} products with schema errors:\`);
issues.forEach((i) => console.log(\`  \${i.url} — missing: \${i.missingProps.join(", ")}\`));`;

const WEBHOOK_CODE = `// WordPress / WooCommerce publish webhook
// Validate schema every time a product is published or updated

addEventListener("fetch", (event) => {
  event.respondWith(handlePublishHook(event.request));
});

async function handlePublishHook(request: Request): Promise<Response> {
  const { post_id, post_type, permalink } = await request.json();

  // Only validate product and post types that have schema
  if (!["product", "post", "page"].includes(post_type)) {
    return new Response("skipped", { status: 200 });
  }

  // Give WordPress a moment to publish before fetching
  await new Promise((r) => setTimeout(r, 3000));

  const result = await fetch(
    \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(permalink)}&access_key=\${SCHEMACHECK_API_KEY}\`
  ).then((r) => r.json());

  if (!result.success) return new Response("validation skipped", { status: 200 });

  const errors = result.schemas.flatMap((s) => s.errors);

  if (errors.length > 0) {
    // Send Slack alert
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: \`⚠️ Schema errors on newly published \${post_type}: \${permalink}\`,
        attachments: errors.map((e) => ({
          color: "danger",
          text: \`\${e.property}: \${e.message}\\nFix: \${e.fix}\`,
        })),
      }),
    });
  }

  return new Response(JSON.stringify({ errors: errors.length, score: result.summary.score }));
}`;

const PRODUCT_SCHEMA_EXAMPLE = `// Before: incomplete Product schema (missing required properties for Google Shopping)
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wireless Noise-Cancelling Headphones",
  "description": "Premium audio with 30-hour battery life."
}

// SchemaCheck response:
// errors: ["name ✓", "offers ✗ — required for rich results", "image ✗ — required for rich results"]
// rich_result_eligible: false
// score: 20/100

// After: complete Product schema
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wireless Noise-Cancelling Headphones",
  "description": "Premium audio with 30-hour battery life.",
  "image": "https://example.com/headphones.jpg",
  "brand": { "@type": "Brand", "name": "SoundCo" },
  "offers": {
    "@type": "Offer",
    "price": "299.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/products/headphones"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "1284"
  }
}

// SchemaCheck response:
// errors: []
// rich_result_eligible: true
// score: 100/100`;

export default function EcommercePage() {
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
          <Link href="/#use-cases" className="hover:text-gray-400">Use Cases</Link>
          <span>/</span>
          <span className="text-gray-400">E-commerce</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Use Case
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Ecommerce Schema Markup Guide
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            Product rich results — with pricing, availability, and star ratings — require complete
            Schema.org markup. A single missing property costs you the feature snippet. SchemaCheck
            validates every required field across your entire catalog.
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

        {/* What Google requires */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">What Google requires for Product rich results</h2>
          <p className="text-gray-400 mb-4">
            Google&apos;s Product rich results (pricing, availability, ratings in search) require
            specific fields. SchemaCheck validates all of them with per-property error messages and
            fix suggestions.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0d0d14]">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Property</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Required?</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">What SchemaCheck checks</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["name", "Required", "Non-empty string"],
                  ["image", "Required", "Valid URL or ImageObject"],
                  ["offers", "Required for pricing", "Has price, priceCurrency, availability"],
                  ["offers.price", "Required", "Numeric string or number"],
                  ["offers.priceCurrency", "Required", "ISO 4217 currency code (USD, EUR, GBP…)"],
                  ["offers.availability", "Required", "Schema.org InStock / OutOfStock URL"],
                  ["aggregateRating", "Recommended", "Has ratingValue and reviewCount/ratingCount"],
                  ["brand", "Recommended", "Organization or Brand with name"],
                  ["description", "Recommended", "Non-empty string"],
                  ["sku", "Recommended", "String identifier"],
                ].map(([prop, req, check], i) => (
                  <tr key={prop} className={`border-b border-gray-800/50 ${i % 2 === 0 ? "bg-[#111118]" : "bg-[#0d0d14]"}`}>
                    <td className="px-4 py-3 font-mono text-xs text-indigo-400">{prop}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{req}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{check}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Before/after */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Before and after</h2>
          <p className="text-gray-400 mb-4">
            Here&apos;s a typical incomplete Product schema that fails rich results, and what the
            corrected version looks like.
          </p>
          <CodeBlock language="json" code={PRODUCT_SCHEMA_EXAMPLE} />
        </section>

        {/* Shopify code */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Shopify Product Schema — Audit Your Entire Catalog</h2>
          <p className="text-gray-400 mb-4">
            Pull every product URL from the Shopify Admin API and validate each one. Run weekly
            as a cron job and alert on new errors.
          </p>
          <CodeBlock language="typescript" code={SHOPIFY_CODE} />
        </section>

        {/* WordPress webhook */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Validate on WooCommerce publish</h2>
          <p className="text-gray-400 mb-4">
            Use a publish webhook to validate product schema the moment it goes live. Send a Slack
            alert if required properties are missing.
          </p>
          <CodeBlock language="typescript" code={WEBHOOK_CODE} />
        </section>

        {/* Testimonial */}
        <section className="mb-12">
          <blockquote className="border-l-2 border-indigo-500 pl-5 py-1">
            <p className="text-gray-300 text-lg italic leading-relaxed">
              &ldquo;Our product team kept removing the offers block from product descriptions to
              &apos;clean up&apos; the page. SchemaCheck in CI blocked those PRs automatically — we
              recovered 18% of our Google Shopping impressions within two weeks.&rdquo;
            </p>
            <footer className="mt-3 text-sm text-gray-500">
              — Engineering manager at a direct-to-consumer brand (name withheld)
            </footer>
          </blockquote>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">Protect your Google Shopping visibility</h2>
          <p className="text-gray-400 text-sm mb-4">
            Free plan — 100 validations/month. Enough to validate your top products daily.
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
              { href: "/use-cases/seo-audit", label: "SEO Audits", desc: "Bulk validate across your full sitemap" },
              { href: "/use-cases/cms-plugins", label: "CMS Plugins", desc: "Validate at publish time" },
              { href: "/docs/options", label: "Response reference", desc: "Full schema result object documentation" },
              { href: "/comparisons/google-rich-results-test-alternative", label: "vs Google Rich Results Test", desc: "API vs manual tool comparison" },
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
