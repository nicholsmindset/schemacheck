import type { Metadata } from "next";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Quickstart",
  description: "Get your SchemaCheck API key and validate your first schema in under 5 minutes.",
};

export default function QuickstartPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Quickstart</h1>
      <p className="text-gray-400 mb-10">Get running in under 5 minutes.</p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">1. Get your free API key</h2>
          <p className="text-gray-400 mb-4">
            Sign up with your email to receive 100 free validations per month.
          </p>
          <CodeBlock
            language="bash"
            code={`curl -X POST https://schemacheck.dev/api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"email": "you@example.com"}'`}
          />
          <p className="text-sm text-gray-500 mt-2">
            Response includes your API key: <code className="text-indigo-400">sc_live_...</code>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">2. Validate a URL</h2>
          <CodeBlock
            language="bash"
            code={`curl "https://schemacheck.dev/api/v1/validate?url=https://stripe.com&access_key=YOUR_KEY"`}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">3. Validate raw JSON-LD</h2>
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
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Response shape</h2>
          <CodeBlock
            language="json"
            code={`{
  "success": true,
  "schemas_found": 1,
  "schemas": [
    {
      "type": "Article",
      "valid": true,
      "rich_result_eligible": true,
      "errors": [],
      "warnings": [...]
    }
  ],
  "summary": { "score": 100, "rich_result_eligible": 1 },
  "meta": { "cached": false, "credits_used": 1, "credits_remaining": 99 }
}`}
          />
        </section>
      </div>
    </div>
  );
}
