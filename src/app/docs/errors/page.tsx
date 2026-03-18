import type { Metadata } from "next";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Error Codes",
  description:
    "Complete reference for SchemaCheck API error codes, HTTP status codes, and how to handle each error case in your integration.",
};

interface ErrorEntry {
  code: string;
  status: number;
  title: string;
  when: string;
  fix: string;
  example: string;
}

const ERRORS: ErrorEntry[] = [
  {
    code: "missing_api_key",
    status: 401,
    title: "Missing API Key",
    when: "Request has no x-api-key header and no access_key query parameter.",
    fix: "Add your API key as a header (x-api-key: sc_live_…) or query param (?access_key=sc_live_…).",
    example: `{
  "success": false,
  "error": {
    "code": "missing_api_key",
    "message": "API key is required. Pass it as x-api-key header or access_key query param.",
    "docs_url": "https://schemacheck.dev/docs/authentication"
  }
}`,
  },
  {
    code: "invalid_api_key",
    status: 401,
    title: "Invalid API Key",
    when: "The key was provided but doesn't exist in the database, is malformed, or belongs to a deactivated account.",
    fix: "Double-check the key value. Keys follow the pattern sc_live_[32 hex chars]. Get a new key at /docs/getting-started.",
    example: `{
  "success": false,
  "error": {
    "code": "invalid_api_key",
    "message": "API key not found or has been deactivated.",
    "docs_url": "https://schemacheck.dev/docs/authentication"
  }
}`,
  },
  {
    code: "quota_exceeded",
    status: 429,
    title: "Monthly Quota Exceeded",
    when: "Your account has used all included validations for the current billing period. Free plan accounts are blocked at the limit.",
    fix: "Upgrade to a paid plan or wait until your quota resets at the next billing cycle. Cached responses don't count against your quota.",
    example: `{
  "success": false,
  "error": {
    "code": "quota_exceeded",
    "message": "Monthly validation quota of 100 exceeded. Upgrade your plan to continue.",
    "upgrade_url": "https://schemacheck.dev/pricing",
    "docs_url": "https://schemacheck.dev/docs/errors"
  }
}`,
  },
  {
    code: "rate_limit_exceeded",
    status: 429,
    title: "Rate Limit Exceeded",
    when: "Too many requests in a short window. Limits are per-plan: free 10/min, basic 30/min, growth 60/min, scale 120/min.",
    fix: "Slow your request rate or implement exponential backoff. The Retry-After header tells you how many seconds to wait.",
    example: `{
  "success": false,
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Free plan allows 10 requests per minute.",
    "retry_after_seconds": 42,
    "docs_url": "https://schemacheck.dev/docs/errors"
  }
}`,
  },
  {
    code: "missing_input",
    status: 400,
    title: "Missing Input",
    when: "POST request body contains neither a url field nor a jsonld field, or both are empty.",
    fix: "Include either url (string, valid URL) or jsonld (object) in the request body — not both, not neither.",
    example: `{
  "success": false,
  "error": {
    "code": "missing_input",
    "message": "Request body must include either 'url' or 'jsonld', not both and not neither.",
    "docs_url": "https://schemacheck.dev/docs/options"
  }
}`,
  },
  {
    code: "invalid_url",
    status: 400,
    title: "Invalid URL",
    when: "The url parameter is present but not a valid, publicly reachable URL (e.g. missing scheme, localhost, IP address).",
    fix: "Pass a fully qualified URL including scheme: https://example.com. Private or localhost URLs are not supported.",
    example: `{
  "success": false,
  "error": {
    "code": "invalid_url",
    "message": "Invalid URL. Must be a fully qualified HTTP or HTTPS URL.",
    "docs_url": "https://schemacheck.dev/docs/options"
  }
}`,
  },
  {
    code: "no_jsonld_found",
    status: 422,
    title: "No JSON-LD Found",
    when: "The URL was fetched successfully but no <script type=\"application/ld+json\"> blocks were found on the page.",
    fix: "Check the page source to confirm JSON-LD is present. If you're validating raw markup, use the jsonld body field instead of url.",
    example: `{
  "success": false,
  "error": {
    "code": "no_jsonld_found",
    "message": "No JSON-LD structured data found on this page.",
    "docs_url": "https://schemacheck.dev/docs/errors"
  }
}`,
  },
  {
    code: "parse_error",
    status: 422,
    title: "JSON-LD Parse Error",
    when: "A JSON-LD block was found but could not be parsed as valid JSON, or the @type field is missing or unrecognised.",
    fix: "Run the raw JSON through a JSON linter to find the syntax error. Ensure every schema block has a valid @type.",
    example: `{
  "success": false,
  "error": {
    "code": "parse_error",
    "message": "Failed to parse JSON-LD block: Unexpected token } at position 142.",
    "docs_url": "https://schemacheck.dev/docs/errors"
  }
}`,
  },
  {
    code: "fetch_failed",
    status: 422,
    title: "URL Fetch Failed",
    when: "SchemaCheck attempted to fetch the URL but received a non-2xx HTTP response (e.g. 404, 403, 500).",
    fix: "Verify the URL is publicly accessible. If the page requires authentication or blocks bots, use the jsonld field with the raw markup instead.",
    example: `{
  "success": false,
  "error": {
    "code": "fetch_failed",
    "message": "Failed to fetch URL. Server responded with HTTP 403.",
    "docs_url": "https://schemacheck.dev/docs/errors"
  }
}`,
  },
  {
    code: "timeout",
    status: 504,
    title: "Fetch Timeout",
    when: "The target URL did not respond within 10 seconds.",
    fix: "Check that the URL is reachable. If the page is slow to load, consider extracting the JSON-LD and sending it via the jsonld field instead.",
    example: `{
  "success": false,
  "error": {
    "code": "timeout",
    "message": "Request to target URL timed out after 10 seconds.",
    "docs_url": "https://schemacheck.dev/docs/errors"
  }
}`,
  },
  {
    code: "internal_error",
    status: 500,
    title: "Internal Server Error",
    when: "An unexpected error occurred on SchemaCheck's servers. This is not caused by your request.",
    fix: "Retry after a short delay. If the error persists, check the status page or contact support.",
    example: `{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "An unexpected error occurred. Please try again or contact support.",
    "docs_url": "https://schemacheck.dev/docs/errors"
  }
}`,
  },
];

const STATUS_COLOR: Record<number, string> = {
  400: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  401: "bg-red-500/10 text-red-400 border-red-500/20",
  422: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  429: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  500: "bg-red-500/10 text-red-400 border-red-500/20",
  504: "bg-red-500/10 text-red-400 border-red-500/20",
};

const RETRY_CODE = `async function validateWithRetry(url: string, apiKey: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(
      \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(url)}&access_key=\${apiKey}\`
    );
    const data = await res.json();

    if (res.ok) return data;

    const { code } = data.error ?? {};

    // Don't retry client errors
    if (res.status >= 400 && res.status < 500 && code !== "rate_limit_exceeded") {
      throw new Error(\`[SchemaCheck] \${code}: \${data.error.message}\`);
    }

    // For rate limits, respect Retry-After header
    if (code === "rate_limit_exceeded") {
      const retryAfter = Number(res.headers.get("Retry-After") ?? 60);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    // Exponential backoff for 5xx
    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 500));
    }
  }

  throw new Error("Max retries exceeded");
}`;

export default function ErrorsPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          API Reference
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">Error Codes</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Every error the SchemaCheck API can return, its HTTP status, and how to fix it. All
          errors follow the same shape so you can handle them with a single catch block.
        </p>
      </div>

      {/* Error shape */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-3">Error response shape</h2>
        <p className="text-gray-400 mb-4">
          All error responses set{" "}
          <code className="text-indigo-400 text-sm">success: false</code> and include an{" "}
          <code className="text-indigo-400 text-sm">error</code> object. The{" "}
          <code className="text-indigo-400 text-sm">code</code> field is machine-readable and
          stable — safe to switch on in your code.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "success": false,
  "error": {
    "code": "invalid_api_key",       // stable machine-readable string
    "message": "Human-readable explanation.",
    "docs_url": "https://schemacheck.dev/docs/errors"
    // some errors include extra fields: upgrade_url, retry_after_seconds
  }
}`}
        />
      </section>

      {/* Quick reference table */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Quick reference</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0d0d14]">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Code</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">HTTP</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {ERRORS.map((e, i) => (
                <tr
                  key={e.code}
                  className={`border-b border-gray-800/50 ${
                    i % 2 === 0 ? "bg-[#111118]" : "bg-[#0d0d14]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <a
                      href={`#${e.code}`}
                      className="font-mono text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      {e.code}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        STATUS_COLOR[e.status] ?? "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{e.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Individual error entries */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-8">Error details</h2>
        <div className="space-y-10">
          {ERRORS.map((e) => (
            <div key={e.code} id={e.code} className="scroll-mt-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <code className="text-base font-mono font-semibold text-white">{e.code}</code>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    STATUS_COLOR[e.status] ?? "bg-gray-800 text-gray-400 border-gray-700"
                  }`}
                >
                  HTTP {e.status}
                </span>
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#111118] border border-gray-800/60">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                      When
                    </p>
                    <p className="text-sm text-gray-400">{e.when}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#111118] border border-gray-800/60">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                      Fix
                    </p>
                    <p className="text-sm text-gray-400">{e.fix}</p>
                  </div>
                </div>
                <CodeBlock language="json" code={e.example} showCopy={false} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Retry logic */}
      <section className="mb-12 pt-8 border-t border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-3">Retry logic</h2>
        <p className="text-gray-400 mb-4">
          Use exponential backoff for <code className="text-indigo-400 text-sm">5xx</code> errors
          and respect the <code className="text-indigo-400 text-sm">Retry-After</code> header on{" "}
          <code className="text-indigo-400 text-sm">rate_limit_exceeded</code>. Never retry{" "}
          <code className="text-indigo-400 text-sm">4xx</code> errors (except rate limits) — they
          indicate a problem with the request itself.
        </p>
        <CodeBlock language="typescript" code={RETRY_CODE} />
      </section>

      {/* Tips */}
      <section className="pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Tips</h2>
        <div className="space-y-3">
          {[
            {
              label: "Switch on code, not message",
              desc: "The code field is stable across API versions. The message field is for humans and may change.",
            },
            {
              label: "Credits are never charged on errors",
              desc: "4xx and 5xx errors never consume a validation credit. Only successful non-cached validations count.",
            },
            {
              label: "Use jsonld to bypass fetch issues",
              desc: "If a URL is behind a firewall, returns 403 to bots, or is slow — extract the JSON-LD yourself and POST it in the jsonld field.",
            },
            {
              label: "Cached responses never error",
              desc: "If a URL was validated in the last hour and is cached, the cached response is returned immediately without fetching the page.",
            },
          ].map((t) => (
            <div
              key={t.label}
              className="flex gap-3 p-3 rounded-lg bg-[#111118] border border-gray-800/60"
            >
              <span className="text-indigo-400 text-sm shrink-0 mt-0.5">→</span>
              <div>
                <p className="text-sm font-medium text-white">{t.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
