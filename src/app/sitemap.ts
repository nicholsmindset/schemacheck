import type { MetadataRoute } from "next";

const BASE = "https://www.schemacheck.dev";

const SCHEMA_TYPE_SLUGS = [
  // Tier 1
  "article", "product", "local-business", "organization",
  "breadcrumb-list", "website", "faq",
  // Tier 2
  "review", "recipe", "event", "video-object", "software-application",
  "job-posting", "course", "item-list", "qa-page", "product-group",
  // Tier 3
  "book", "dataset", "discussion-forum-posting", "employer-aggregate-rating",
  "movie", "image-object", "profile-page", "merchant-return-policy",
  "offer-shipping-details", "claim-review",
  // Tier 4
  "math-solver", "quiz", "loyalty-program", "vacation-rental", "creative-work",
  // Deprecated (still indexed)
  "how-to", "special-announcement", "vehicle",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ── Homepage ────────────────────────────────────────────────────────────
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },

    // ── High-value landing pages ─────────────────────────────────────────
    { url: `${BASE}/schema-types`,  lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/docs`,          lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/pricing`,       lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${BASE}/comparisons/google-rich-results-test-alternative`,
      lastModified: now, changeFrequency: "monthly", priority: 0.9,
    },
    {
      url: `${BASE}/comparisons/schema-markup-validator-alternative`,
      lastModified: now, changeFrequency: "monthly", priority: 0.8,
    },

    // ── Schema-type detail pages ──────────────────────────────────────────
    ...SCHEMA_TYPE_SLUGS.map((slug) => ({
      url: `${BASE}/schema-types/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    // ── Use cases ────────────────────────────────────────────────────────
    { url: `${BASE}/use-cases/seo-audit`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/use-cases/ai-agents`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/use-cases/cms-validation`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/use-cases/ecommerce`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // ── Docs sub-pages ───────────────────────────────────────────────────
    { url: `${BASE}/docs/quickstart`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/authentication`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/getting-started`,    lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/options`,            lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/errors`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/mcp`,                lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/code-examples/javascript`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/code-examples/python`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/code-examples/php`,        lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/code-examples/go`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/code-examples/ruby`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/code-examples/csharp`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // ── Integrations ─────────────────────────────────────────────────────
    { url: `${BASE}/integrations/zapier`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/integrations/make`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/integrations/n8n`,    lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // ── Blog & content ───────────────────────────────────────────────────
    { url: `${BASE}/blog`,      lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/changelog`, lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/customers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // ── Legal ─────────────────────────────────────────────────────────────
    { url: `${BASE}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/legal/terms`,   lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
