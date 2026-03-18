import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Schema Validation for CMS Plugins | SchemaCheck API",
  description:
    "Build schema validation into WordPress, Shopify, and Webflow plugins. Catch missing structured data before it reaches Google — validate at publish time, not after the fact.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Schema Validation for CMS Plugins",
    description:
      "Build schema validation into WordPress, Shopify, and Webflow plugins. Catch missing structured data at publish time.",
    url: "https://schemacheck.dev/use-cases/cms-plugins",
    isPartOf: { "@type": "WebSite", name: "SchemaCheck", url: "https://schemacheck.dev" },
  },
  null,
  2
);

const WP_PLUGIN_CODE = `<?php
/**
 * Plugin Name: SchemaCheck Validator
 * Description: Validate Schema.org structured data on post publish/update
 */

define('SCHEMACHECK_API_KEY', get_option('schemacheck_api_key'));
define('SCHEMACHECK_ENDPOINT', 'https://schemacheck.dev/api/v1/validate');

// Hook into post publish and update
add_action('publish_post', 'schemacheck_validate_on_publish', 10, 2);
add_action('publish_page', 'schemacheck_validate_on_publish', 10, 2);
add_action('woocommerce_update_product', 'schemacheck_validate_product');

function schemacheck_validate_on_publish($post_id, $post) {
    $permalink = get_permalink($post_id);
    $result    = schemacheck_validate_url($permalink);

    if (!$result || !$result['success']) return;

    $errors = array_merge(
        ...array_map(fn($s) => $s['errors'], $result['schemas'])
    );

    if (count($errors) > 0) {
        // Store validation result as post meta for admin notices
        update_post_meta($post_id, '_schemacheck_errors', $errors);
        update_post_meta($post_id, '_schemacheck_score', $result['summary']['score']);

        // Optionally notify via email
        $admin_email = get_option('admin_email');
        wp_mail(
            $admin_email,
            "Schema errors on: {$post->post_title}",
            "Found " . count($errors) . " schema error(s) on {$permalink}\\n\\n" .
            implode("\\n", array_map(fn($e) => "• {$e['property']}: {$e['message']}", $errors))
        );
    }
}

function schemacheck_validate_url($url) {
    $response = wp_remote_get(
        SCHEMACHECK_ENDPOINT . '?url=' . urlencode($url) . '&access_key=' . SCHEMACHECK_API_KEY,
        ['timeout' => 30]
    );

    if (is_wp_error($response)) return null;
    return json_decode(wp_remote_retrieve_body($response), true);
}

// Admin notice on post edit screen
add_action('admin_notices', function() {
    $screen = get_current_screen();
    if (!in_array($screen->base, ['post', 'page'])) return;

    $post_id = get_the_ID();
    $errors  = get_post_meta($post_id, '_schemacheck_errors', true);
    $score   = get_post_meta($post_id, '_schemacheck_score', true);

    if (!$errors || count($errors) === 0) return;

    echo '<div class="notice notice-warning">
        <p><strong>Schema issues detected</strong> (score: ' . esc_html($score) . '/100)</p>
        <ul>' .
        implode('', array_map(
            fn($e) => '<li>' . esc_html($e['property']) . ': ' . esc_html($e['message']) . '</li>',
            $errors
        )) .
        '</ul></div>';
});`;

const SHOPIFY_APP_CODE = `// Shopify app extension — validate schema on product create/update
// Uses Shopify webhooks + SchemaCheck API

import { json } from "@remix-run/node";
import crypto from "crypto";

const SCHEMACHECK_KEY = process.env.SCHEMACHECK_API_KEY!;
const SHOPIFY_SECRET  = process.env.SHOPIFY_WEBHOOK_SECRET!;

// Verify Shopify webhook signature
function verifyWebhook(body: string, hmacHeader: string): boolean {
  const digest = crypto
    .createHmac("sha256", SHOPIFY_SECRET)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

export async function action({ request }: { request: Request }) {
  const body     = await request.text();
  const hmac     = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const topic    = request.headers.get("x-shopify-topic") ?? "";
  const shopDomain = request.headers.get("x-shopify-shop-domain") ?? "";

  if (!verifyWebhook(body, hmac)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  // Handle products/create and products/update
  if (!["products/create", "products/update"].includes(topic)) {
    return json({ skipped: true });
  }

  const product = JSON.parse(body);
  const productUrl = \`https://\${shopDomain}/products/\${product.handle}\`;

  // Give Shopify time to publish before fetching
  await new Promise((r) => setTimeout(r, 2000));

  const result = await fetch(
    \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(productUrl)}&access_key=\${SCHEMACHECK_KEY}\`
  ).then((r) => r.json());

  if (!result.success) return json({ validated: false });

  const productSchema = result.schemas.find(
    (s: { type: string }) => s.type === "Product"
  );

  if (productSchema?.errors.length > 0) {
    // Create a metafield on the product with the schema health score
    // so it's visible in the Shopify admin
    await setProductMetafield(shopDomain, product.id, {
      namespace: "schemacheck",
      key: "score",
      value: String(result.summary.score),
      type: "number_integer",
    });

    console.log(\`Schema issues on \${productUrl}:\`, productSchema.errors);
  }

  return json({ score: result.summary.score, errors: productSchema?.errors ?? [] });
}

async function setProductMetafield(
  shop: string,
  productId: number,
  metafield: { namespace: string; key: string; value: string; type: string }
) {
  // Use Shopify Admin API to write metafield
  const endpoint = \`https://\${shop}/admin/api/2024-01/products/\${productId}/metafields.json\`;
  await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
    },
    body: JSON.stringify({ metafield }),
  });
}`;

const WEBFLOW_CODE = `// Webflow CMS integration — validate on publish via Webflow webhook
// Deploy as a serverless function (Vercel, Netlify, or Cloudflare Workers)

export async function POST(request: Request) {
  const payload = await request.json();

  // Webflow sends { site, items } on cms_item_published
  const { site, items } = payload;

  if (!items || items.length === 0) {
    return Response.json({ skipped: true });
  }

  const results = await Promise.all(
    items.map(async (item: { slug: string; url: string }) => {
      const pageUrl = item.url ?? \`https://\${site.shortName}.webflow.io/\${item.slug}\`;

      const res = await fetch(
        \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(pageUrl)}&access_key=\${process.env.SCHEMACHECK_API_KEY}\`
      );
      const data = await res.json();

      return {
        url: pageUrl,
        score: data.summary?.score ?? 0,
        errors: data.schemas?.flatMap((s: { errors: unknown[] }) => s.errors) ?? [],
        richResultEligible: data.summary?.rich_result_eligible ?? false,
      };
    })
  );

  // Post summary to Slack if any items have errors
  const itemsWithErrors = results.filter((r) => r.errors.length > 0);

  if (itemsWithErrors.length > 0 && process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: \`⚠️ Schema issues detected on \${itemsWithErrors.length} newly published page(s)\`,
        attachments: itemsWithErrors.map((item) => ({
          color: "warning",
          title: item.url,
          text: \`Score: \${item.score}/100 — \${item.errors.length} error(s)\\n\` +
            item.errors
              .slice(0, 3)
              .map((e: { property: string; message: string }) => \`• \${e.property}: \${e.message}\`)
              .join("\\n"),
        })),
      }),
    });
  }

  return Response.json({ validated: results.length, errors: itemsWithErrors.length });
}`;

export default function CmsPluginsPage() {
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
          <span className="text-gray-400">CMS Plugins</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Use Case
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Build schema validation into WordPress, Shopify, and Webflow plugins
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            Schema errors created at publish time don&apos;t surface until Google drops your rich
            results — sometimes weeks later. SchemaCheck gives you an API to catch them
            the moment content is published, not after.
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

        {/* Why at publish time */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Why validate at publish time?</h2>
          <p className="text-gray-400 mb-4">
            Most schema errors are introduced by CMS updates, theme changes, or content editors
            removing structured data blocks. By the time you notice a drop in rich results, the
            damage has already been done. Validating on publish catches issues within seconds —
            before they reach Google.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { stat: "Hours", label: "to notice a schema regression from Google Search Console" },
              { stat: "Seconds", label: "to catch the same error with a publish-time webhook" },
              { stat: "100%", label: "of schema errors are preventable with CI or publish hooks" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl border border-gray-800 bg-[#111118]">
                <p className="text-2xl font-bold text-indigo-400 mb-1">{s.stat}</p>
                <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CMS support grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Supported platforms</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                name: "WordPress + WooCommerce",
                desc: "Hook into publish_post, publish_page, and woocommerce_update_product. Display schema health scores in the admin editor.",
              },
              {
                name: "Shopify Apps",
                desc: "Verify HMAC-signed webhooks on products/create and products/update. Write schema scores back as metafields.",
              },
              {
                name: "Webflow CMS",
                desc: "Receive cms_item_published webhooks and validate every newly published collection item.",
              },
              {
                name: "Any CMS with webhooks",
                desc: "The API is platform-agnostic. If your CMS can fire an HTTP request on publish, SchemaCheck can validate it.",
              },
            ].map((item) => (
              <div key={item.name} className="p-4 rounded-xl border border-gray-800 bg-[#111118]">
                <p className="text-sm font-semibold text-white mb-1">{item.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WordPress */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">WordPress plugin integration</h2>
          <p className="text-gray-400 mb-4">
            Hook into WordPress publish actions to validate schema on every post, page, or
            WooCommerce product update. Shows schema score and errors directly in the admin editor.
          </p>
          <CodeBlock language="php" code={WP_PLUGIN_CODE} />
        </section>

        {/* Shopify */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Shopify app extension</h2>
          <p className="text-gray-400 mb-4">
            Build a Shopify app that validates product schema on every create or update webhook.
            Writes the schema health score back as a product metafield so it&apos;s visible in the
            Shopify admin.
          </p>
          <CodeBlock language="typescript" code={SHOPIFY_APP_CODE} />
        </section>

        {/* Webflow */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Webflow CMS webhook handler</h2>
          <p className="text-gray-400 mb-4">
            Receive Webflow&apos;s <code className="text-indigo-400 text-sm">cms_item_published</code>{" "}
            webhook, validate each page, and post a Slack alert if required properties are missing.
            Deploy as a Vercel function or Cloudflare Worker.
          </p>
          <CodeBlock language="typescript" code={WEBFLOW_CODE} />
        </section>

        {/* Integration pattern summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Common integration patterns</h2>
          <div className="space-y-2">
            {[
              {
                label: "Publish webhook → validate → admin notice",
                desc: "Trigger validation immediately after publish. Show schema errors inline in the CMS editor so authors can fix them before the page is live for long.",
              },
              {
                label: "Validate → write score back as metadata",
                desc: "Store the schema health score as a custom field or metafield. Query pages with scores below 80 for targeted remediation.",
              },
              {
                label: "Validate → Slack or email alert",
                desc: "Route schema errors to the team who can fix them — SEO leads, developers, or content managers — without requiring anyone to manually check.",
              },
              {
                label: "Nightly cron across full content archive",
                desc: "Re-validate your entire content library weekly. Catch regressions introduced by theme updates, plugin upgrades, or third-party schema injectors.",
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

        {/* Testimonial */}
        <section className="mb-12">
          <blockquote className="border-l-2 border-indigo-500 pl-5 py-1">
            <p className="text-gray-300 text-lg italic leading-relaxed">
              &ldquo;A Yoast plugin update removed the <code className="text-indigo-400 not-italic text-base">datePublished</code> field
              from our Article schema across 4,000 posts. Our publish hook caught it on the
              first post — we fixed the config before the rest of the site was affected.&rdquo;
            </p>
            <footer className="mt-3 text-sm text-gray-500">
              — Senior developer at a digital media publisher (name withheld)
            </footer>
          </blockquote>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">Add publish-time validation in an afternoon</h2>
          <p className="text-gray-400 text-sm mb-4">
            Free plan — 100 validations/month. No credit card. The webhook handler above takes
            about 30 minutes to deploy.
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
              { href: "/use-cases/ecommerce", label: "E-commerce", desc: "Validate Product schemas for Google Shopping" },
              { href: "/use-cases/seo-audit", label: "SEO Audits", desc: "Bulk validate your full sitemap" },
              { href: "/docs/code-examples/php", label: "PHP Examples", desc: "WordPress and PHP integration code" },
              { href: "/docs/options", label: "API reference", desc: "Full response object documentation" },
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
