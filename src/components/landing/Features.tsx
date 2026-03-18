import { CodeBlock } from "@/components/shared/CodeBlock";

const BEFORE_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "10 Tips for Better SEO"
}`;

const AFTER_RESPONSE = `{
  "type": "Article",
  "valid": false,
  "rich_result_eligible": false,
  "errors": [
    {
      "property": "author",
      "message": "Required property 'author' is missing",
      "fix": "Add \\"author\\": { \\"@type\\": \\"Person\\", \\"name\\": \\"Author Name\\" }"
    },
    {
      "property": "datePublished",
      "message": "Required property 'datePublished' is missing",
      "fix": "Add \\"datePublished\\": \\"2026-03-18\\""
    },
    {
      "property": "image",
      "message": "Required property 'image' is missing",
      "fix": "Add \\"image\\": \\"https://example.com/photo.jpg\\""
    }
  ],
  "rich_result_eligible": false
}`;

const features = [
  {
    icon: "🔍",
    title: "Finds every schema on the page",
    description:
      "SchemaCheck extracts all JSON-LD blocks from a URL — including @graph arrays — and validates each one independently. Pass a URL or raw JSON-LD directly.",
  },
  {
    icon: "⚡",
    title: "Rich result eligibility, not just syntax",
    description:
      "Knowing your JSON is valid isn't enough. SchemaCheck checks Google's current rich result requirements and tells you exactly which schemas qualify — and why others don't.",
  },
  {
    icon: "🛠",
    title: "Fix suggestions with docs links",
    description:
      'Every error includes a copy-paste fix and a direct link to the relevant Google structured data documentation. No more hunting for what "required property" actually means.',
  },
  {
    icon: "💾",
    title: "1-hour cache, free",
    description:
      "Repeated URL checks are served from cache at no cost. Perfect for CI pipelines, scheduled audits, and bulk checks. Cached results don't consume credits.",
  },
  {
    icon: "📊",
    title: "Deprecation warnings built in",
    description:
      "Google retired 7 schema types in 2024–2025 (HowTo, FAQPage for most sites, and more). SchemaCheck flags deprecated types automatically so you know what to remove.",
  },
  {
    icon: "🔑",
    title: "Two auth methods",
    description:
      "Authenticate via x-api-key header (for server-side calls) or access_key query parameter (for quick browser testing). Both methods work on all endpoints.",
  },
];

export function Features() {
  return (
    <section className="py-20 px-4 bg-gray-950/30">
      <div className="max-w-6xl mx-auto">
        {/* Before/After */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              From broken schema to actionable fix
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Send us a schema. Get back exactly what&apos;s wrong and how to fix it.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Your JSON-LD
              </p>
              <CodeBlock code={BEFORE_SCHEMA} language="json" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                SchemaCheck response
              </p>
              <CodeBlock code={AFTER_RESPONSE} language="json" />
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything you need to get rich results
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-gray-800 bg-gray-950/60 hover:border-gray-700 transition-colors"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
