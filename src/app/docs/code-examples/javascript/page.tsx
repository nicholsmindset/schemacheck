import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "JavaScript / TypeScript Examples",
  description:
    "Node.js, Bun, Deno, and browser examples for the SchemaCheck schema validation API. Includes TypeScript types, error handling, and retry logic.",
};

const INSTALL = `# No dependencies required — uses the native fetch API
# Node 18+, Bun, Deno, or any modern browser`;

const TYPES = `// TypeScript types for the SchemaCheck API
export interface SchemaCheckResult {
  success: boolean;
  url?: string;
  schemas_found: number;
  schemas: Schema[];
  summary: Summary;
  meta: Meta;
}

export interface Schema {
  type: string;
  valid: boolean;
  rich_result_eligible: boolean;
  deprecated: boolean;
  deprecation_note: string | null;
  errors: Issue[];
  warnings: Issue[];
  properties_found: string[];
  properties_missing_required: string[];
  properties_missing_recommended: string[];
  rich_result: RichResult;
}

export interface Issue {
  severity: "error" | "warning";
  property: string;
  message: string;
  fix: string;
  google_docs_url: string;
}

export interface RichResult {
  eligible: boolean;
  reason: string;
  google_docs_url: string;
}

export interface Summary {
  total_schemas: number;
  valid_schemas: number;
  invalid_schemas: number;
  total_errors: number;
  total_warnings: number;
  rich_result_eligible: number;
  score: number;
}

export interface Meta {
  api_version: string;
  validated_at: string;
  cached: boolean;
  credits_used: number;
  credits_remaining: number;
  response_time_ms: number;
}

export interface SchemaCheckError {
  success: false;
  error: {
    code: string;
    message: string;
    docs_url: string;
    upgrade_url?: string;
    retry_after_seconds?: number;
  };
}`;

const VALIDATE_URL = `import type { SchemaCheckResult, SchemaCheckError } from "./types";

const API_KEY = process.env.SCHEMACHECK_API_KEY!;
const BASE_URL = "https://schemacheck.dev/api/v1";

// Validate a URL — pass access_key as query param (no headers needed for GET)
export async function validateUrl(url: string): Promise<SchemaCheckResult> {
  const endpoint = \`\${BASE_URL}/validate?url=\${encodeURIComponent(url)}&access_key=\${API_KEY}\`;
  const res = await fetch(endpoint);
  const data: SchemaCheckResult | SchemaCheckError = await res.json();

  if (!res.ok || !data.success) {
    const err = (data as SchemaCheckError).error;
    throw new Error(\`[\${err.code}] \${err.message}\`);
  }

  return data as SchemaCheckResult;
}

// Example usage
const result = await validateUrl("https://stripe.com");

console.log(\`Score: \${result.summary.score}/100\`);
console.log(\`Schemas found: \${result.schemas_found}\`);

for (const schema of result.schemas) {
  console.log(\`\\n[\${schema.type}] valid=\${schema.valid} richResult=\${schema.rich_result_eligible}\`);

  for (const error of schema.errors) {
    console.log(\`  ✗ \${error.property}: \${error.message}\`);
    console.log(\`    Fix: \${error.fix}\`);
  }

  for (const warning of schema.warnings) {
    console.log(\`  ⚠ \${warning.property}: \${warning.message}\`);
  }
}`;

const VALIDATE_JSONLD = `import type { SchemaCheckResult } from "./types";

const API_KEY = process.env.SCHEMACHECK_API_KEY!;

// Validate raw JSON-LD — useful during development before publishing
export async function validateJsonLd(jsonld: object): Promise<SchemaCheckResult> {
  const res = await fetch("https://schemacheck.dev/api/v1/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ jsonld }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(\`[\${data.error.code}] \${data.error.message}\`);
  }

  return data;
}

// Example: validate Article schema before publishing a blog post
const result = await validateJsonLd({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to validate Schema.org structured data",
  author: { "@type": "Person", name: "Jane Doe" },
  datePublished: "2026-03-18",
  image: "https://example.com/photo.jpg",
});

if (!result.schemas[0].valid) {
  console.error("Schema has errors — fix before publishing:");
  result.schemas[0].errors.forEach((e) => console.error(\`  \${e.property}: \${e.fix}\`));
  process.exit(1);
}

console.log("Schema is valid and rich-result eligible:", result.schemas[0].rich_result_eligible);`;

const BATCH = `import type { SchemaCheckResult } from "./types";

const API_KEY = process.env.SCHEMACHECK_API_KEY!;

async function validateUrl(url: string): Promise<SchemaCheckResult> {
  const res = await fetch(
    \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(url)}&access_key=\${API_KEY}\`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(\`[\${data.error?.code}] \${data.error?.message}\`);
  return data;
}

// Validate multiple URLs with concurrency control
async function validateBatch(
  urls: string[],
  concurrency = 5
): Promise<Map<string, SchemaCheckResult | Error>> {
  const results = new Map<string, SchemaCheckResult | Error>();

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map((url) => validateUrl(url)));

    for (let j = 0; j < batch.length; j++) {
      const s = settled[j];
      results.set(batch[j], s.status === "fulfilled" ? s.value : s.reason);
    }
  }

  return results;
}

// Example
const urls = [
  "https://stripe.com",
  "https://github.com",
  "https://shopify.com",
  "https://airbnb.com",
];

const results = await validateBatch(urls);

for (const [url, result] of results) {
  if (result instanceof Error) {
    console.log(\`\${url} → ERROR: \${result.message}\`);
  } else {
    console.log(\`\${url} → score \${result.summary.score}/100\`);
  }
}`;

const RETRY = `async function validateWithRetry(
  url: string,
  apiKey: string,
  maxRetries = 3
): Promise<SchemaCheckResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(
      \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(url)}&access_key=\${apiKey}\`
    );
    const data = await res.json();

    if (res.ok) return data;

    const code = data.error?.code;

    // Never retry client errors (except rate limits)
    if (res.status >= 400 && res.status < 500 && code !== "rate_limit_exceeded") {
      throw new Error(\`[\${code}] \${data.error.message}\`);
    }

    if (code === "rate_limit_exceeded") {
      const retryAfter = Number(res.headers.get("Retry-After") ?? 60);
      console.warn(\`Rate limited. Waiting \${retryAfter}s…\`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    // Exponential backoff for 5xx: 1s, 2s, 4s
    if (attempt < maxRetries) {
      const delay = 2 ** (attempt - 1) * 1000;
      console.warn(\`Attempt \${attempt} failed. Retrying in \${delay}ms…\`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error("Max retries exceeded");
}`;

const NEXT_EXAMPLE = `// app/api/schema-check/route.ts — server-side proxy for Next.js
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const res = await fetch(
    \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(url)}&access_key=\${process.env.SCHEMACHECK_API_KEY}\`
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}`;

export default function JavaScriptPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          SDK Examples
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">JavaScript / TypeScript</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Works in Node.js 18+, Bun, Deno, and modern browsers. Uses the native{" "}
          <code className="text-indigo-400">fetch</code> API — no dependencies required.
        </p>
      </div>

      {/* Install */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Installation</h2>
        <CodeBlock language="bash" code={INSTALL} />
      </section>

      {/* TypeScript types */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">TypeScript types</h2>
        <p className="text-gray-400 mb-4">
          Copy these into a <code className="text-indigo-400 text-sm">types.ts</code> file in your
          project for full type safety.
        </p>
        <CodeBlock language="typescript" code={TYPES} />
      </section>

      {/* Validate URL */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate a URL</h2>
        <p className="text-gray-400 mb-4">
          Fetch and validate all JSON-LD on any public URL. Results are cached for 1 hour — the
          second call for the same URL is free.
        </p>
        <CodeBlock language="typescript" code={VALIDATE_URL} />
      </section>

      {/* Validate JSON-LD */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate raw JSON-LD</h2>
        <p className="text-gray-400 mb-4">
          POST the JSON-LD object directly — perfect for CI pipelines or validating markup before
          publishing. Raw JSON-LD is never cached.
        </p>
        <CodeBlock language="typescript" code={VALIDATE_JSONLD} />
      </section>

      {/* Batch */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Batch validation</h2>
        <p className="text-gray-400 mb-4">
          Validate many URLs in parallel with a configurable concurrency limit so you don&apos;t
          hit rate limits.
        </p>
        <CodeBlock language="typescript" code={BATCH} />
      </section>

      {/* Retry */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Retry with backoff</h2>
        <p className="text-gray-400 mb-4">
          Production-ready wrapper with exponential backoff for server errors and automatic
          Retry-After handling for rate limits.
        </p>
        <CodeBlock language="typescript" code={RETRY} />
      </section>

      {/* Next.js */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Next.js server route</h2>
        <p className="text-gray-400 mb-4">
          Keep your API key server-side by proxying requests through a Next.js route handler.
        </p>
        <CodeBlock language="typescript" code={NEXT_EXAMPLE} />
      </section>

      {/* Next steps */}
      <section className="pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Next steps</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/docs/options", label: "Parameters & Response", desc: "Full API reference" },
            { href: "/docs/errors", label: "Error Codes", desc: "Handle every error case" },
            { href: "/docs/code-examples/python", label: "Python Examples", desc: "requests library" },
            { href: "/docs/authentication", label: "Authentication", desc: "Header vs query param" },
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
