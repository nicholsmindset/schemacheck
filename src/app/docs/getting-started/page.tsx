import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Getting Started",
  description:
    "Get your SchemaCheck API key and validate your first Schema.org structured data in under 2 minutes.",
};

const FIRST_RESPONSE = `{
  "success": true,
  "url": "https://apple.com",
  "schemas_found": 3,
  "schemas": [
    {
      "type": "WebSite",
      "valid": true,
      "rich_result_eligible": true,
      "deprecated": false,
      "deprecation_note": null,
      "errors": [],
      "warnings": [
        {
          "severity": "warning",
          "property": "potentialAction",
          "message": "Recommended property 'potentialAction' is missing",
          "fix": "Add potentialAction with SearchAction for Sitelinks Searchbox",
          "google_docs_url": "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox"
        }
      ],
      "properties_found": ["name", "url"],
      "properties_missing_required": [],
      "properties_missing_recommended": ["potentialAction"],
      "rich_result": {
        "eligible": true,
        "reason": "All required properties are present for WebSite rich results.",
        "google_docs_url": "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox"
      }
    }
  ],
  "summary": {
    "total_schemas": 3,
    "valid_schemas": 2,
    "invalid_schemas": 1,
    "total_errors": 2,
    "total_warnings": 3,
    "rich_result_eligible": 2,
    "score": 73
  },
  "meta": {
    "api_version": "1.0",
    "validated_at": "2026-03-18T10:30:00.000Z",
    "cached": false,
    "credits_used": 1,
    "credits_remaining": 99,
    "response_time_ms": 812
  }
}`;

export default function GettingStartedPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          Getting Started
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">Getting Started</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          SchemaCheck validates Schema.org JSON-LD structured data via a simple REST API. Send a URL
          or raw JSON-LD, get back errors, warnings, rich result eligibility, and fix suggestions.
        </p>
      </div>

      {/* Step 1 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold shrink-0">
            1
          </span>
          <h2 className="text-xl font-semibold text-white">Get your free API key</h2>
        </div>
        <p className="text-gray-400 mb-4 ml-10">
          Sign up with your email — no password, no credit card. You get 100 validations free every
          month.
        </p>
        <div className="ml-10">
          <CodeBlock
            language="bash"
            code={`curl -X POST https://schemacheck.dev/api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"email": "you@example.com"}'`}
          />
          <div className="mt-3 p-4 rounded-lg bg-[#111118] border border-gray-800">
            <p className="text-xs text-gray-500 font-mono mb-1">Response</p>
            <CodeBlock
              language="json"
              showCopy={false}
              code={`{
  "api_key": "sc_live_a1b2c3d4e5f6...",
  "email": "you@example.com",
  "plan": "free",
  "requests_limit": 100,
  "dashboard_url": "https://schemacheck.dev/dashboard",
  "message": "Your API key has been created. Keep it safe."
}`}
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Prefer a form?{" "}
            <Link href="/#signup" className="text-indigo-400 hover:text-indigo-300">
              Sign up on the homepage
            </Link>{" "}
            and your key will be emailed to you.
          </p>
        </div>
      </section>

      {/* Step 2 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold shrink-0">
            2
          </span>
          <h2 className="text-xl font-semibold text-white">Make your first request</h2>
        </div>
        <p className="text-gray-400 mb-4 ml-10">
          Paste your key into this GET request. Replace{" "}
          <code className="text-indigo-400 text-sm">YOUR_KEY</code> with the{" "}
          <code className="text-indigo-400 text-sm">api_key</code> from step 1.
        </p>
        <div className="ml-10">
          <CodeBlock
            language="bash"
            code={`curl "https://schemacheck.dev/api/v1/validate?url=https://apple.com&access_key=YOUR_KEY"`}
          />
          <p className="mt-3 text-sm text-gray-500">
            That&apos;s it. One URL, one call, structured results. No headers required for GET
            requests when using{" "}
            <code className="text-indigo-400">access_key</code>.
          </p>
        </div>
      </section>

      {/* Step 3 — Response */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold shrink-0">
            3
          </span>
          <h2 className="text-xl font-semibold text-white">Read the response</h2>
        </div>
        <p className="text-gray-400 mb-4 ml-10">
          Here&apos;s what you&apos;ll get back (abbreviated — real responses include every schema found
          on the page):
        </p>
        <div className="ml-10">
          <CodeBlock language="json" code={FIRST_RESPONSE} />

          {/* Field callouts */}
          <div className="mt-6 space-y-3">
            {[
              {
                field: "schemas_found",
                color: "text-emerald-400",
                desc: "How many JSON-LD blocks were found on the page.",
              },
              {
                field: "schemas[].valid",
                color: "text-emerald-400",
                desc: "true if all required properties are present and correctly typed.",
              },
              {
                field: "schemas[].rich_result_eligible",
                color: "text-blue-400",
                desc: "true if this schema qualifies for Google Rich Results.",
              },
              {
                field: "schemas[].errors",
                color: "text-red-400",
                desc: "Required property missing or invalid. Prevents rich results.",
              },
              {
                field: "schemas[].warnings",
                color: "text-amber-400",
                desc: "Recommended property missing. Won't prevent rich results but improves quality.",
              },
              {
                field: "summary.score",
                color: "text-indigo-400",
                desc: "0–100 health score. 100 = no errors, penalised for errors (−40) and warnings (−10).",
              },
              {
                field: "meta.cached",
                color: "text-gray-400",
                desc: "true if result was served from cache (1-hour TTL). cached results cost 0 credits.",
              },
            ].map((f) => (
              <div
                key={f.field}
                className="flex gap-3 p-3 rounded-lg bg-[#111118] border border-gray-800/60"
              >
                <code className={`text-xs shrink-0 mt-0.5 ${f.color}`}>{f.field}</code>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus — POST raw JSON-LD */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Validate raw JSON-LD</h2>
        <p className="text-gray-400 mb-4">
          Don&apos;t have a public URL? Pass the JSON-LD object directly in the request body. Useful for
          validating during development before publishing.
        </p>
        <CodeBlock
          language="bash"
          code={`curl -X POST https://schemacheck.dev/api/v1/validate \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonld": {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "My Article Title",
      "author": { "@type": "Person", "name": "Jane Doe" },
      "datePublished": "2026-03-18",
      "image": "https://example.com/photo.jpg"
    }
  }'`}
        />
        <p className="mt-3 text-sm text-gray-500">
          JSON-LD requests are <strong className="text-gray-300">never cached</strong> — useful for
          testing changes in real time.
        </p>
      </section>

      {/* Next steps */}
      <section className="pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Next steps</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              href: "/docs/authentication",
              label: "Authentication",
              desc: "Header vs query param — which to use and when",
            },
            {
              href: "/docs/options",
              label: "Parameters & Response",
              desc: "Every field in the request and response documented",
            },
            {
              href: "/docs/errors",
              label: "Error Codes",
              desc: "Handle every error case gracefully",
            },
            {
              href: "/docs/code-examples/javascript",
              label: "JavaScript Examples",
              desc: "Copy-paste Node.js and browser examples",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-[#111118] hover:bg-[#13131c] transition-all"
            >
              <p className="font-medium text-white mb-1 group-hover:text-indigo-300 transition-colors">
                {link.label} →
              </p>
              <p className="text-sm text-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
