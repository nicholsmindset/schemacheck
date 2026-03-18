import type { Metadata } from "next";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Parameters & Response",
  description:
    "Complete reference for all SchemaCheck API request parameters and response fields.",
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-white mt-12 mb-5 pt-10 border-t border-gray-800 first:pt-0 first:border-0 first:mt-0">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-200 mt-7 mb-3">{children}</h3>;
}

function ParamRow({
  name,
  type,
  required,
  desc,
}: {
  name: string;
  type: string;
  required?: boolean;
  desc: React.ReactNode;
}) {
  return (
    <tr className="border-b border-gray-900 align-top">
      <td className="py-3 pr-4">
        <code className="text-indigo-400 text-sm">{name}</code>
        {required && (
          <span className="ml-1.5 text-[10px] font-semibold text-red-400 uppercase tracking-wide">
            required
          </span>
        )}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500 whitespace-nowrap">{type}</td>
      <td className="py-3 text-sm text-gray-400 leading-relaxed">{desc}</td>
    </tr>
  );
}

function FieldRow({
  name,
  type,
  optional,
  desc,
}: {
  name: string;
  type: string;
  optional?: boolean;
  desc: React.ReactNode;
}) {
  return (
    <tr className="border-b border-gray-900 align-top">
      <td className="py-3 pr-4">
        <code className="text-emerald-400 text-sm">{name}</code>
        {optional && (
          <span className="ml-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
            optional
          </span>
        )}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500 whitespace-nowrap">{type}</td>
      <td className="py-3 text-sm text-gray-400 leading-relaxed">{desc}</td>
    </tr>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-[#111118]">
            <th className="py-2.5 px-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Field
            </th>
            <th className="py-2.5 px-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Type
            </th>
            <th className="py-2.5 px-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-900 [&>tr>td]:px-4">{children}</tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OptionsPage() {
  return (
    <>
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          API Reference
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">Parameters &amp; Response</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Complete reference for the <code className="text-indigo-400">/api/v1/validate</code>{" "}
          endpoint — every request parameter and every response field.
        </p>
      </div>

      {/* ── Base URL ── */}
      <div className="mb-10 p-4 rounded-xl border border-gray-800 bg-[#111118] font-mono text-sm">
        <span className="text-gray-500">Base URL</span>
        <br />
        <span className="text-white">https://schemacheck.dev/api/v1</span>
      </div>

      {/* ── GET ── */}
      <H2>GET /validate</H2>
      <p className="text-gray-400 mb-5">
        Validate all schemas on a public URL. Pass parameters as query strings — no request body
        needed.
      </p>
      <CodeBlock
        language="bash"
        code={`curl "https://schemacheck.dev/api/v1/validate?url=https://apple.com&access_key=YOUR_KEY"`}
      />

      <H3>Query parameters</H3>
      <Table>
        <ParamRow name="url"        type="string"  required desc="The URL to fetch and validate. Must start with http:// or https://. The page must be publicly accessible." />
        <ParamRow name="access_key" type="string"  required desc="Your API key. Alternative to the x-api-key header — use whichever is more convenient for GET requests." />
      </Table>

      {/* ── POST ── */}
      <H2>POST /validate</H2>
      <p className="text-gray-400 mb-5">
        Accepts either a URL or raw JSON-LD in the request body. Use the{" "}
        <code className="text-indigo-400">x-api-key</code> header for server-side calls.
      </p>

      <H3>Request body — URL input</H3>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://schemacheck.dev/api/v1/validate \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
      />

      <H3>Request body — JSON-LD input</H3>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://schemacheck.dev/api/v1/validate \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonld": {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "My Article",
      "author": { "@type": "Person", "name": "Jane Doe" },
      "datePublished": "2026-03-18",
      "image": "https://example.com/photo.jpg"
    }
  }'`}
      />

      <H3>Body fields</H3>
      <Table>
        <ParamRow name="url"    type="string"         desc={<>The URL to fetch and validate. Mutually exclusive with <code className="text-indigo-400">jsonld</code>. Cached for 1 hour.</>} />
        <ParamRow name="jsonld" type="object | array"  desc="A JSON-LD object or array of objects. Mutually exclusive with url. Supports @graph arrays. Never cached." />
      </Table>

      <H3>Headers</H3>
      <Table>
        <ParamRow name="x-api-key"     type="string" desc="Your API key. Recommended for server-side calls. Takes precedence over access_key query param." />
        <ParamRow name="Content-Type"  type="string" required desc="Must be application/json." />
      </Table>

      {/* ── Success response ── */}
      <H2>Success response (200)</H2>
      <p className="text-gray-400 mb-5">
        All successful responses share this shape. Fields marked <em>optional</em> are only present
        when applicable.
      </p>

      <H3>Top-level</H3>
      <Table>
        <FieldRow name="success"       type="true"    desc="Always true on a 200 response." />
        <FieldRow name="url"           type="string"  optional desc="Echoed back when the request was URL-based." />
        <FieldRow name="schemas_found" type="number"  desc="Count of JSON-LD schemas found (after @graph flattening)." />
        <FieldRow name="schemas"       type="Schema[]" desc="Validation results — one object per schema. Empty array when none found." />
        <FieldRow name="summary"       type="Summary" desc="Aggregate stats across all schemas." />
        <FieldRow name="parse_errors"  type="string[]" optional desc="JSON parse errors from malformed <script type='application/ld+json'> blocks. Present only when at least one block failed to parse." />
        <FieldRow name="message"       type="string"  optional desc="Human-readable note when schemas_found is 0, explaining how to add structured data." />
        <FieldRow name="meta"          type="Meta"    desc="Request metadata — timing, credits, cache status." />
      </Table>

      <H3>Schema object</H3>
      <Table>
        <FieldRow name="type"                          type="string"    desc="The @type value from the JSON-LD (e.g. Article, Product, Organization)." />
        <FieldRow name="valid"                         type="boolean"   desc="true if all required properties are present and correctly typed." />
        <FieldRow name="rich_result_eligible"          type="boolean"   desc="true if this schema meets Google's current rich result requirements." />
        <FieldRow name="deprecated"                    type="boolean"   desc="true for schema types Google has retired or restricted." />
        <FieldRow name="deprecation_note"              type="string|null" desc="Reason for deprecation (e.g. 'Google retired HowTo rich results in 2024.')." />
        <FieldRow name="errors"                        type="Issue[]"   desc="Validation errors — missing required properties, wrong types, etc." />
        <FieldRow name="warnings"                      type="Issue[]"   desc="Validation warnings — missing recommended properties, minor issues." />
        <FieldRow name="properties_found"              type="string[]"  desc="List of property names present in the schema." />
        <FieldRow name="properties_missing_required"   type="string[]"  desc="Required properties that are absent. Non-empty means valid=false." />
        <FieldRow name="properties_missing_recommended" type="string[]" desc="Recommended properties that are absent. Does not affect valid." />
        <FieldRow name="raw_jsonld"                    type="object"    desc="The original JSON-LD object as parsed from the page." />
        <FieldRow name="rich_result"                   type="RichResult" optional desc="Rich result status object. Present on all schemas." />
      </Table>

      <H3>Issue object (errors and warnings)</H3>
      <Table>
        <FieldRow name="severity"       type="string"  desc={'One of "error", "warning", or "info".'} />
        <FieldRow name="property"       type="string"  desc="The property name that triggered this issue (e.g. datePublished, author)." />
        <FieldRow name="message"        type="string"  desc="Human-readable description of the issue." />
        <FieldRow name="fix"            type="string"  desc="Specific, copy-paste fix suggestion." />
        <FieldRow name="google_docs_url" type="string" optional desc="Direct link to the relevant Google structured data documentation." />
      </Table>

      <H3>RichResult object</H3>
      <Table>
        <FieldRow name="eligible"        type="boolean" desc="Whether this schema qualifies for Google Rich Results." />
        <FieldRow name="reason"          type="string"  desc="Explanation — what makes it eligible or why it's not." />
        <FieldRow name="google_docs_url" type="string"  desc="Link to the Google docs for this schema type's rich result requirements." />
      </Table>

      <H3>Summary object</H3>
      <Table>
        <FieldRow name="total_schemas"        type="number" desc="Total schema objects found and validated." />
        <FieldRow name="valid_schemas"        type="number" desc="Count with valid=true." />
        <FieldRow name="invalid_schemas"      type="number" desc="Count with valid=false." />
        <FieldRow name="total_errors"         type="number" desc="Sum of errors across all schemas." />
        <FieldRow name="total_warnings"       type="number" desc="Sum of warnings across all schemas." />
        <FieldRow name="rich_result_eligible" type="number" desc="Count of schemas with rich_result_eligible=true." />
        <FieldRow name="score"               type="number"  desc="0–100 health score. Starts at 100, deducted for errors (÷schemas ×40) and warnings (÷schemas ×10)." />
      </Table>

      <H3>Meta object</H3>
      <Table>
        <FieldRow name="api_version"       type="string"  desc='Always "1.0".' />
        <FieldRow name="validated_at"      type="string"  desc="ISO 8601 timestamp of when validation ran." />
        <FieldRow name="cached"            type="boolean" desc="true if the result was served from cache. Cached results cost 0 credits." />
        <FieldRow name="credits_used"      type="number"  desc="0 (cached) or 1 (fresh validation)." />
        <FieldRow name="credits_remaining" type="number"  desc="Remaining credits this billing period after this request." />
        <FieldRow name="response_time_ms"  type="number"  desc="Total server-side time in milliseconds." />
      </Table>

      {/* ── Supported types ── */}
      <H2>Supported schema types</H2>
      <p className="text-gray-400 mb-5">
        All types are validated against Google&apos;s current structured data requirements. Unknown types
        are accepted but validated as generic JSON-LD.
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-[#111118]">
              <th className="py-2.5 px-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">Type</th>
              <th className="py-2.5 px-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">Rich Results</th>
              <th className="py-2.5 px-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900 [&>td]:px-4">
            {[
              ["Article",       "Yes", "Includes NewsArticle, BlogPosting subtypes"],
              ["Product",       "Yes", "Checks offers.price + offers.availability"],
              ["LocalBusiness", "Yes", "All subtypes (Restaurant, Store, etc.)"],
              ["Organization",  "Yes", "Logo, sameAs, contactPoint"],
              ["BreadcrumbList","Yes", "Validates itemListElement array structure"],
              ["WebSite",       "Yes", "Sitelinks Searchbox via potentialAction"],
              ["FAQPage",       "Restricted", "Government and health authority sites only (2024)"],
              ["HowTo",         "Retired", "Google retired HowTo rich results (Aug 2024)"],
            ].map(([type, eligible, notes]) => (
              <tr key={type} className="border-b border-gray-900">
                <td className="py-3 px-4 font-mono text-sm text-indigo-400">{type}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    eligible === "Yes"
                      ? "bg-emerald-900/40 text-emerald-400"
                      : eligible === "Restricted"
                      ? "bg-amber-900/40 text-amber-400"
                      : "bg-red-900/30 text-red-400"
                  }`}>
                    {eligible}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-400">{notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Caching ── */}
      <H2>Caching</H2>
      <div className="space-y-3">
        {[
          { label: "TTL",      value: "1 hour per URL" },
          { label: "Key",      value: "SHA-256 of lowercase, trailing-slash-stripped URL" },
          { label: "Scope",    value: "URL requests only — jsonld inputs are never cached" },
          { label: "Credits",  value: "Cache hits cost 0 credits (credits_used: 0 in meta)" },
          { label: "Bypass",   value: "Not supported — call again after TTL expiry" },
        ].map((row) => (
          <div key={row.label} className="flex gap-4 py-2 border-b border-gray-800/60">
            <span className="w-20 shrink-0 text-sm font-medium text-gray-500">{row.label}</span>
            <span className="text-sm text-gray-300">{row.value}</span>
          </div>
        ))}
      </div>

      {/* ── Rate limits ── */}
      <H2>Rate limits</H2>
      <p className="text-gray-400 mb-5">
        Limits are per API key, per minute (sliding window). Exceeded requests return{" "}
        <code className="text-red-400">rate_limit_exceeded</code> (HTTP 429).
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-[#111118]">
              {["Plan", "Req / min", "Req / month", "Overage"].map((h) => (
                <th key={h} className="py-2.5 px-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {[
              ["Free",   "10",  "100",    "Hard stop — upgrade required"],
              ["Basic",  "30",  "3,000",  "$0.008 / request"],
              ["Growth", "60",  "15,000", "$0.005 / request"],
              ["Scale",  "120", "75,000", "$0.003 / request"],
            ].map(([plan, rpm, rpm2, overage]) => (
              <tr key={plan} className="border-b border-gray-900">
                <td className="py-3 px-4 font-medium text-white">{plan}</td>
                <td className="py-3 px-4 text-gray-300">{rpm}</td>
                <td className="py-3 px-4 text-gray-300">{rpm2}</td>
                <td className="py-3 px-4 text-gray-400 text-sm">{overage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
