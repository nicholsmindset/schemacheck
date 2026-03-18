"use client";

import { useState } from "react";
import Link from "next/link";

// ─── palette helpers ───────────────────────────────────────────────────────────
const BG      = "bg-[#0a0a0f]";
const SURFACE = "bg-[#111118]";
const CARD    = "bg-[#16161f]";
const BORDER  = "border-gray-800";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── icons ─────────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block flex-shrink-0 mt-px">
      <circle cx="8" cy="8" r="8" fill="#22c55e" fillOpacity=".15" />
      <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block flex-shrink-0 mt-px">
      <circle cx="8" cy="8" r="8" fill="#ef4444" fillOpacity=".15" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block flex-shrink-0 mt-px">
      <circle cx="8" cy="8" r="8" fill="#f59e0b" fillOpacity=".15" />
      <path d="M8 5v4M8 11v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function CopyIcon({ done }: { done: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      {done
        ? <path d="M3 8l3 3 7-7" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        : <>
            <rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 5h2v9h7v2H2z" fill="currentColor" opacity=".35" />
          </>
      }
    </svg>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className={cn("sticky top-0 z-50 border-b", BORDER, "bg-[#0a0a0f]/90 backdrop-blur-md")}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white tracking-tight" aria-label="SchemaCheck home">
          <span className="text-indigo-400 text-lg leading-none">⬡</span>
          <span>Schema<span className="text-indigo-400">Check</span></span>
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/comparisons/google-rich-results-test-alternative" className="hover:text-white transition-colors">
            vs Google&apos;s Tool
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/login"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <a
            href="#signup"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
          >
            Get API Key →
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
const HERO_JSON = `{
  "success": true,
  "schemas_found": 3,
  "schemas": [
    {
      "type": "Organization",
      "valid": true,
      "rich_result_eligible": true,
      "errors": [],
      "warnings": [
        {
          "severity": "warning",
          "property": "sameAs",
          "message": "Recommended property
                      'sameAs' is missing",
          "fix": "Add sameAs with your
                  social profile URLs"
        }
      ],
      "rich_result": {
        "eligible": true,
        "reason": "Eligible for Organization
                   rich results in Google Search."
      }
    }
  ],
  "summary": {
    "score": 87,
    "total_schemas": 3,
    "valid_schemas": 3,
    "total_errors": 0,
    "total_warnings": 2,
    "rich_result_eligible": 2
  },
  "meta": {
    "cached": false,
    "credits_used": 1,
    "response_time_ms": 412
  }
}`;

function Hero() {
  const [copied, setCopied] = useState(false);
  const endpoint = "https://api.schemacheck.dev/v1/validate?url=https://stripe.com&access_key=sc_live_...";

  function copy() {
    navigator.clipboard.writeText(endpoint.replace("sc_live_...", "YOUR_KEY"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* badge */}
      <div className="flex justify-center mb-7">
        <span className="text-xs px-3 py-1 rounded-full border border-indigo-900/60 bg-indigo-950/40 text-indigo-400 font-medium">
          JSON-LD validation · REST API · 100 validations/month free forever
        </span>
      </div>

      {/* headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-white leading-[1.12] tracking-tight mb-5">
        The schema validation API
        <br />
        <span className="text-indigo-400">for developers</span>
      </h1>
      <p className="text-center text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        Validate structured data in one simple API call,
        <br className="hidden sm:block" />
        instead of manually checking with Google&apos;s tools.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
        <a
          href="#signup"
          className="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-indigo-900/30"
        >
          Start validating for free →
        </a>
        <a
          href="/docs"
          className={cn("w-full sm:w-auto text-center border px-7 py-3 rounded-xl font-medium text-base transition-colors text-gray-300 hover:text-white hover:border-gray-600", BORDER)}
        >
          View documentation
        </a>
      </div>
      <p className="text-center text-gray-700 text-sm mb-14">No credit card required.</p>

      {/* demo */}
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* request card */}
        <div className={cn("rounded-2xl border overflow-hidden", BORDER)}>
          <div className={cn("flex items-center justify-between px-4 py-2.5 border-b text-xs", SURFACE, BORDER)}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-gray-600 font-mono">GET /v1/validate</span>
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-300 transition-colors"
            >
              <CopyIcon done={copied} />
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          <div className={cn("p-5 font-mono text-sm", CARD)}>
            <div className="flex flex-wrap gap-y-0.5 leading-relaxed">
              <span className="text-emerald-400 mr-2">GET</span>
              <span className="text-gray-500 break-all">
                https://api.schemacheck.dev/v1/validate
                <span className="text-indigo-400">?url=</span>
                <span className="text-amber-300">https://stripe.com</span>
                <span className="text-indigo-400">&amp;access_key=</span>
                <span className="text-gray-600">sc_live_...</span>
              </span>
            </div>

            <div className="mt-5 border-t border-gray-800/80 pt-4 space-y-1 text-xs">
              <div className="flex gap-3">
                <span className="text-gray-700 w-16">Accept</span>
                <span className="text-gray-400">application/json</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-700 w-16">Status</span>
                <span className="text-emerald-400">200 OK</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-700 w-16">Time</span>
                <span className="text-gray-300">412ms</span>
              </div>
            </div>
          </div>

          <div className={cn("px-5 pb-5 pt-0 font-mono", CARD)}>
            <p className="text-gray-700 text-xs mb-2">— or POST with JSON-LD directly:</p>
            <pre className="text-xs text-gray-500 leading-relaxed">{`POST /v1/validate
x-api-key: sc_live_...

{
  "jsonld": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "My Post",
    "author": { "@type": "Person", ... }
  }
}`}</pre>
          </div>
        </div>

        {/* response card */}
        <div className={cn("rounded-2xl border overflow-hidden", BORDER)}>
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b text-xs", SURFACE, BORDER)}>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-600 font-mono">response.json</span>
            <span className="ml-auto text-emerald-400 font-mono text-xs">200 OK</span>
          </div>
          <pre className={cn("p-5 text-xs font-mono overflow-auto max-h-[400px] leading-relaxed", CARD)}>
            <JsonHighlight code={HERO_JSON} />
          </pre>
        </div>
      </div>
    </section>
  );
}

function JsonHighlight({ code }: { code: string }) {
  return (
    <>
      {code.split("\n").map((line, i) => {
        const h = line
          .replace(/("[@\w-]+")\s*:/g, (_, k) => `<span style="color:#a5b4fc">${k}</span>:`)
          .replace(/:\s*("(?:[^"\\]|\\.)*")/g, (_, v) => `: <span style="color:#fcd34d">${v}</span>`)
          .replace(/:\s*(true|false)/g, (_, v) => `: <span style="color:#34d399">${v}</span>`)
          .replace(/:\s*(\d+(?:\.\d+)?)\b/g, (_, v) => `: <span style="color:#67e8f9">${v}</span>`)
          .replace(/\[\.\.\.\]/g, '<span style="color:#4b5563">[...]</span>');
        return <div key={i} style={{ color: "#d1d5db" }} dangerouslySetInnerHTML={{ __html: h }} />;
      })}
    </>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: "35+",   label: "Schema types supported", sub: "across 4 validation tiers" },
    { value: "99.9%", label: "Uptime SLA",             sub: "monitored 24/7" },
    { value: "100",   label: "Free validations / month", sub: "forever, no card required" },
  ];
  return (
    <section className={cn("border-y py-12", BORDER)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm font-medium text-gray-300">{s.label}</div>
              <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature: Catch every error ───────────────────────────────────────────────
const BROKEN_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "A headline that is way too long and
               exceeds the 110-character Google limit
               for structured data markup on pages"
}`;

const VALIDATION_RESULT = `{
  "type": "Article",
  "valid": false,
  "rich_result_eligible": false,
  "errors": [
    {
      "severity": "error",
      "property": "author",
      "message": "Required property 'author' is missing",
      "fix": "Add \\"author\\": {\\"@type\\": \\"Person\\",
               \\"name\\": \\"Jane Doe\\"}",
      "google_docs_url": "developers.google.com/..."
    },
    {
      "severity": "error",
      "property": "datePublished",
      "message": "Required property 'datePublished'
                  is missing"
    },
    {
      "severity": "error",
      "property": "headline",
      "message": "'headline' exceeds 110 characters
                  (128 found)",
      "fix": "Shorten to 110 characters or fewer"
    }
  ],
  "warnings": [
    {
      "severity": "warning",
      "property": "image",
      "message": "Recommended — required for rich results"
    }
  ],
  "rich_result": {
    "eligible": false,
    "reason": "Missing required properties:
               author, datePublished."
  },
  "summary": { "score": 8, "total_errors": 3 }
}`;

function FeatureErrors() {
  return (
    <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Error detection</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
            Catch every error,<br />before Google does
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Get clear errors, warnings, and actionable fix suggestions with direct links to Google&apos;s documentation — no more guessing why your rich results aren&apos;t showing.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              [<XIcon key="x1" />,    "Required properties missing → error"],
              [<XIcon key="x2" />,    "String length violations (e.g. headline > 110 chars)"],
              [<XIcon key="x3" />,    "Invalid date formats — must be ISO 8601"],
              [<WarnIcon key="w1" />, "Relative URLs where absolute required"],
              [<WarnIcon key="w2" />, "Missing recommended properties flagged"],
              [<CheckIcon key="c1" />, "Fix suggestions + google_docs_url on every issue"],
              [<CheckIcon key="c2" />, "Nested property checks (e.g. author.url, offers.price)"],
            ].map(([icon, text], i) => (
              <li key={i} className="flex items-start gap-2.5">
                {icon}
                <span className="text-gray-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className={cn("rounded-xl border overflow-hidden", BORDER)}>
            <div className={cn("flex items-center gap-2 px-4 py-2 border-b text-xs font-mono", SURFACE, BORDER)}>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-600">broken-schema.json — input</span>
            </div>
            <pre className={cn("p-4 text-xs font-mono text-gray-400 overflow-auto leading-relaxed", CARD)}>
              {BROKEN_SCHEMA}
            </pre>
          </div>

          <div className="flex justify-center text-gray-700 text-sm font-mono">↓ POST /v1/validate →</div>

          <div className={cn("rounded-xl border overflow-hidden", BORDER)}>
            <div className={cn("flex items-center gap-2 px-4 py-2 border-b text-xs font-mono", SURFACE, BORDER)}>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-gray-600">response.json — output</span>
            </div>
            <pre className={cn("p-4 text-xs font-mono text-gray-400 overflow-auto max-h-72 leading-relaxed", CARD)}>
              {VALIDATION_RESULT}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature: Rich result eligibility ─────────────────────────────────────────
const SCHEMA_STATUS = [
  { type: "Article",            status: "eligible",   note: "headline + author + image + datePublished" },
  { type: "Product",            status: "eligible",   note: "name + image + offers (price + availability)" },
  { type: "LocalBusiness",      status: "eligible",   note: "name + PostalAddress" },
  { type: "BreadcrumbList",     status: "eligible",   note: "non-empty itemListElement" },
  { type: "WebSite",            status: "eligible",   note: "name + url + potentialAction with urlTemplate" },
  { type: "Organization",       status: "eligible",   note: "name + url + logo" },
  { type: "FAQPage",            status: "restricted", note: "Government & health authority sites only (2024)" },
  { type: "HowTo",              status: "deprecated", note: "Retired by Google — August 2024" },
  { type: "SpecialAnnouncement", status: "deprecated", note: "Retired by Google — 2025" },
];

const STATUS_BADGE: Record<string, string> = {
  eligible:   "bg-emerald-950/50 border-emerald-900/60 text-emerald-400",
  restricted: "bg-amber-950/50  border-amber-900/60  text-amber-400",
  deprecated: "bg-red-950/50    border-red-900/60    text-red-400",
};

function FeatureRichResults() {
  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          {/* table */}
          <div className={cn("rounded-2xl border overflow-hidden", BORDER)}>
            <div className={cn("flex items-center justify-between px-5 py-2.5 border-b text-xs text-gray-600 font-mono", SURFACE, BORDER)}>
              <span>schema_type</span>
              <span>rich_result_status</span>
            </div>
            {SCHEMA_STATUS.map((row) => (
              <div key={row.type} className={cn("px-5 py-3 border-b last:border-0 flex items-center justify-between gap-3", BORDER, CARD)}>
                <div>
                  <span className="text-sm font-mono text-gray-200">{row.type}</span>
                  <p className="text-xs text-gray-600 mt-0.5">{row.note}</p>
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize flex-shrink-0", STATUS_BADGE[row.status])}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>

          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Rich results</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
              Know exactly what<br />Google will show
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Rich result eligibility changes when Google updates their requirements. SchemaCheck reflects the current rules — including types they&apos;ve deprecated or restricted since 2024.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                "Checks all current Google rich result requirements",
                "Flags deprecated types with specific retirement messages",
                "FAQPage restriction flagged for non-gov/health sites",
                "Product offers depth check (price + availability required)",
                "Per-schema rich_result object with reason string",
                "google_docs_url on every error and warning",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature: Code examples ───────────────────────────────────────────────────
const TABS: { key: string; label: string }[] = [
  { key: "curl",       label: "curl"       },
  { key: "javascript", label: "JavaScript" },
  { key: "python",     label: "Python"     },
  { key: "php",        label: "PHP"        },
  { key: "go",         label: "Go"         },
];

const CODE: Record<string, string> = {
  curl: `curl -s \\
  "https://api.schemacheck.dev/v1/validate\\
?url=https://example.com\\
&access_key=YOUR_KEY" | jq '.summary'

# Response:
# {
#   "score": 87,
#   "total_schemas": 3,
#   "valid_schemas": 3,
#   "total_errors": 0,
#   "rich_result_eligible": 2
# }`,

  javascript: `const res = await fetch(
  "https://api.schemacheck.dev/v1/validate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "YOUR_KEY",
    },
    body: JSON.stringify({
      url: "https://example.com",
    }),
  }
);

const data = await res.json();

console.log("Score:", data.summary.score);

data.schemas.forEach((schema) => {
  if (!schema.rich_result_eligible) {
    console.log(
      schema.type,
      schema.rich_result.reason
    );
  }
  schema.errors.forEach((err) => {
    console.log(\`Fix: \${err.fix}\`);
  });
});`,

  python: `import httpx

resp = httpx.post(
    "https://api.schemacheck.dev/v1/validate",
    headers={"x-api-key": "YOUR_KEY"},
    json={"url": "https://example.com"},
)
data = resp.json()

print(f"Score:   {data['summary']['score']}")
print(f"Schemas: {data['schemas_found']}")

for schema in data["schemas"]:
    if not schema["rich_result_eligible"]:
        print(
            f"[{schema['type']}] "
            f"{schema['rich_result']['reason']}"
        )
    for err in schema["errors"]:
        print(f"  ✗ {err['property']}: {err['message']}")
        print(f"    Fix: {err['fix']}")`,

  php: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->post(
    'https://api.schemacheck.dev/v1/validate',
    [
        'headers' => [
            'x-api-key'    => 'YOUR_KEY',
            'Content-Type' => 'application/json',
        ],
        'json' => ['url' => 'https://example.com'],
    ]
);

$data = json_decode($response->getBody(), true);

echo "Score: " . $data['summary']['score'] . "\\n";

foreach ($data['schemas'] as $schema) {
    foreach ($schema['errors'] as $err) {
        echo "[{$schema['type']}] {$err['property']}\\n";
        echo "Fix: {$err['fix']}\\n";
    }
}`,

  go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    body, _ := json.Marshal(map[string]string{
        "url": "https://example.com",
    })
    req, _ := http.NewRequest(
        "POST",
        "https://api.schemacheck.dev/v1/validate",
        bytes.NewBuffer(body),
    )
    req.Header.Set("x-api-key", "YOUR_KEY")
    req.Header.Set("Content-Type", "application/json")

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()

    var data map[string]any
    json.NewDecoder(resp.Body).Decode(&data)

    summary := data["summary"].(map[string]any)
    fmt.Printf("Score: %v\\n", summary["score"])
    fmt.Printf("Schemas: %v\\n", data["schemas_found"])
}`,
};

function FeatureCode() {
  const [tab,    setTab]    = useState("javascript");
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(CODE[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Code examples</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Use the language you love
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            One endpoint, any language. Real, working code you can paste directly into your project.
          </p>
        </div>

        <div className={cn("rounded-2xl border overflow-hidden", BORDER)}>
          {/* tab bar */}
          <div className={cn("flex items-stretch border-b overflow-x-auto", BORDER, SURFACE)}>
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-r flex-shrink-0 transition-colors",
                  BORDER,
                  tab === key
                    ? "text-white bg-[#16161f]"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#16161f]/50"
                )}
              >
                {label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0"
            >
              <CopyIcon done={copied} />
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* code */}
          <pre className={cn("p-6 text-sm font-mono overflow-auto max-h-80 leading-relaxed text-gray-300", CARD)}>
            {CODE[tab]}
          </pre>
        </div>
      </div>
    </section>
  );
}

// ─── Integrations ─────────────────────────────────────────────────────────────
function Integrations() {
  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Coming in v1.1</span>
        <h2 className="text-3xl font-bold text-white mt-3 mb-3">Automate without code</h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          Connect SchemaCheck to your CMS or content workflow using popular automation platforms.
        </p>
        <div className="flex flex-wrap justify-center gap-5 mb-10">
          {[
            { name: "Zapier", icon: "⚡" },
            { name: "Make",   icon: "◎" },
            { name: "n8n",    icon: "⬡" },
          ].map(({ name, icon }) => (
            <div key={name} className={cn("flex items-center gap-3 border rounded-2xl px-7 py-5", BORDER, CARD)}>
              <span className="text-2xl">{icon}</span>
              <span className="font-semibold text-gray-300">{name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-indigo-900/60 text-indigo-500 ml-1">Soon</span>
            </div>
          ))}
        </div>
        <a
          href="#signup"
          className={cn("inline-flex items-center gap-2 border text-sm px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors", BORDER)}
        >
          Sign up to get notified when integrations launch →
        </a>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
type Plan = {
  name:        string;
  monthly:     number;
  annual:      number;
  limit:       number;
  rate:        string;
  overage:     string;
  cta:         string;
  href:        string;
  recommended?: boolean;
  features:    string[];
};

const PLANS: Plan[] = [
  {
    name: "Free", monthly: 0, annual: 0,
    limit: 100, rate: "10 req/min", overage: "—",
    cta: "Get started free", href: "#signup",
    features: [
      "100 validations / month",
      "GET + POST endpoints",
      "All 35+ schema types",
      "Rich result eligibility",
      "Fix suggestions + google_docs_url",
      "1-hour response cache",
    ],
  },
  {
    name: "Basic", monthly: 19, annual: 159,
    limit: 3_000, rate: "30 req/min", overage: "$0.008 / extra",
    cta: "Start with Basic", href: "/dashboard/login?plan=basic",
    features: [
      "3,000 validations / month",
      "Everything in Free",
      "Overage billing ($0.008 ea)",
      "Usage alerts at 90% + 100%",
      "Email support",
    ],
  },
  {
    name: "Growth", monthly: 79, annual: 659,
    limit: 15_000, rate: "60 req/min", overage: "$0.005 / extra",
    cta: "Start with Growth", href: "/dashboard/login?plan=growth",
    recommended: true,
    features: [
      "15,000 validations / month",
      "Everything in Basic",
      "Overage billing ($0.005 ea)",
      "60 req/min rate limit",
      "Priority email support",
    ],
  },
  {
    name: "Scale", monthly: 199, annual: 1_659,
    limit: 75_000, rate: "120 req/min", overage: "$0.003 / extra",
    cta: "Start with Scale", href: "/dashboard/login?plan=scale",
    features: [
      "75,000 validations / month",
      "Everything in Growth",
      "Overage billing ($0.003 ea)",
      "120 req/min rate limit",
      "SLA + priority support",
    ],
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Simple, usage-based pricing
          </h2>
          <p className="text-gray-400 mb-8">Start for free. Upgrade when you need more.</p>

          {/* toggle */}
          <div className="inline-flex items-center gap-3 text-sm">
            <span className={cn(annual ? "text-gray-600" : "text-white font-medium")}>Monthly</span>
            <button
              onClick={() => setAnnual((a) => !a)}
              aria-label="Toggle annual billing"
              className={cn("relative w-11 h-6 rounded-full transition-colors focus:outline-none", annual ? "bg-indigo-600" : "bg-gray-700")}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  annual ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn(annual ? "text-white font-medium" : "text-gray-600")}>
              Annual <span className="text-emerald-400 text-xs font-medium ml-1">2 months free</span>
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const displayMonthly = annual
              ? (plan.annual === 0 ? 0 : Math.round(plan.annual / 12))
              : plan.monthly;
            const savings = plan.monthly * 12 - plan.annual;

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl border p-6 flex flex-col",
                  plan.recommended
                    ? "border-indigo-600 bg-indigo-950/20"
                    : cn(BORDER, CARD)
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-indigo-600 px-3 py-1 rounded-full whitespace-nowrap shadow">
                    Most popular
                  </div>
                )}

                <div className="mb-5">
                  <div className="text-sm font-semibold text-gray-300 mb-2">{plan.name}</div>
                  <div className="flex items-end gap-1 mb-0.5">
                    <span className="text-4xl font-bold text-white">${displayMonthly}</span>
                    <span className="text-gray-600 text-sm mb-1.5">/mo</span>
                  </div>
                  {annual && plan.annual > 0 && (
                    <p className="text-xs text-gray-600">
                      ${plan.annual}/yr · saves ${savings}
                    </p>
                  )}
                  {plan.monthly === 0 && (
                    <p className="text-xs text-gray-700">forever free</p>
                  )}
                </div>

                <div className={cn("text-xs space-y-1 mb-5 pb-5 border-b", BORDER)}>
                  <div className="text-gray-500">
                    <span className="text-gray-300 font-medium">{plan.limit.toLocaleString()}</span> validations/mo
                  </div>
                  <div className="text-gray-500">
                    Rate limit: <span className="text-gray-300">{plan.rate}</span>
                  </div>
                  <div className="text-gray-500">
                    Overage: <span className="text-gray-300">{plan.overage}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={cn(
                    "block w-full text-center text-sm py-2.5 rounded-xl font-medium transition-colors",
                    plan.recommended
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : cn("border hover:border-gray-700 text-gray-300 hover:text-white", BORDER)
                  )}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-700 text-xs mt-8">
          No credit card required to start · 30-day money-back guarantee · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
type FaqItem = { q: string; a: React.ReactNode };

const FAQS: FaqItem[] = [
  {
    q: "Do failed validations count against my quota?",
    a: "No. Only successful 200 responses from real computation count. 4xx errors (bad API key, invalid URL, missing input, rate limit) never consume a credit.",
  },
  {
    q: "Do cached responses count against my quota?",
    a: "No. URL results are cached for 1 hour. Repeat requests for the same URL within that window return instantly and use zero credits.",
  },
  {
    q: "What schema types do you support?",
    a: "35+ types across 4 tiers: Article, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, FAQPage (Tier 1 — full validation), plus Recipe, Event, VideoObject, JobPosting, Course, SoftwareApplication and more (Tiers 2–4). See the full list at /schema-types.",
  },
  {
    q: "Is there really a free tier — forever?",
    a: "Yes. 100 validations per month, no credit card, no trial period, no expiry. It's enough to validate your own site or test the integration before committing to a paid plan.",
  },
  {
    q: "How fast is the API?",
    a: "JSON-LD input is typically < 50ms. URL requests require fetching the target page — most return in 1–3 seconds. Cache hits are near-instant.",
  },
  {
    q: "Do you support Microdata or RDFa?",
    a: "Not yet. SchemaCheck currently validates JSON-LD only — the format Google recommends and that covers the vast majority of structured data used in the wild.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard at any time. You retain access until the end of the current billing period. No cancellation fees.",
  },
  {
    q: "What is the refund policy?",
    a: "30-day no-questions refund on all paid plans. Email us with your order and you'll be refunded within one business day.",
  },
  {
    q: "Is SchemaCheck the best schema validation API?",
    a: (
      <>
        We think so — but you should decide for yourself.{" "}
        <Link href="/comparisons/google-rich-results-test-alternative" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
          See how we compare to Google&apos;s Rich Results Test →
        </Link>
      </>
    ),
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((item, i) => (
            <div key={i} className={cn("rounded-xl border overflow-hidden", BORDER)}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className={cn(
                  "w-full flex items-center justify-between text-left px-5 py-4 text-sm font-medium text-gray-200 hover:text-white transition-colors",
                  CARD
                )}
              >
                <span className="pr-4">{item.q}</span>
                <span className={cn("text-gray-600 text-lg leading-none transition-transform flex-shrink-0", open === i ? "rotate-45" : "")}>
                  +
                </span>
              </button>
              {open === i && (
                <div className={cn("px-5 pt-4 pb-5 text-sm text-gray-400 leading-relaxed border-t", SURFACE, BORDER)}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Signup CTA ────────────────────────────────────────────────────────────────
function SignupCta() {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle");
  const [apiKey,  setApiKey]  = useState("");
  const [errMsg,  setErrMsg]  = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res  = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.api_key) {
        setApiKey(data.api_key);
        setStatus("success");
      } else {
        setErrMsg(data?.error?.message ?? "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section id="signup" className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Get started</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-3">
          Validate your structured data
        </h2>
        <p className="text-gray-400 mb-8">
          Enter your email and get an API key instantly.
          <br />Free forever — no credit card required.
        </p>

        {status === "success" ? (
          <div className={cn("rounded-2xl border p-6 text-left", BORDER, CARD)}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="text-white font-semibold">Your API key is ready</p>
                <p className="text-gray-600 text-xs mt-0.5">Save it somewhere safe — treat it like a password</p>
              </div>
            </div>
            <div className={cn("rounded-lg border p-3 font-mono text-sm break-all select-all cursor-text mb-4", BORDER, SURFACE)}>
              <span className="text-indigo-300">{apiKey}</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                Next: read the{" "}
                <Link href="/docs/quickstart" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300">
                  quickstart guide →
                </Link>
              </p>
              <p>Your free plan includes 100 validations/month.</p>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-3">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors",
                  BORDER, CARD
                )}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
              >
                {status === "loading" ? "Creating..." : "Get API Key →"}
              </button>
            </form>

            {status === "error" && (
              <p className="text-red-400 text-sm mb-2">{errMsg}</p>
            )}
            <p className="text-gray-700 text-xs">
              No credit card · 100 validations/month · Instant access
            </p>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
const FOOTER: Record<string, { label: string; href: string }[]> = {
  Integrations: [
    { label: "Zapier (soon)", href: "/integrations/zapier" },
    { label: "Make (soon)",   href: "/integrations/make"   },
    { label: "n8n (soon)",   href: "/integrations/n8n"    },
  ],
  "Use Cases": [
    { label: "SEO Audit",      href: "/use-cases/seo-audit"      },
    { label: "AI Agents",      href: "/use-cases/ai-agents"      },
    { label: "CMS Validation", href: "/use-cases/cms-validation"  },
    { label: "E-commerce",     href: "/use-cases/ecommerce"      },
  ],
  Resources: [
    { label: "Documentation",   href: "/docs"                   },
    { label: "Quickstart",      href: "/docs/quickstart"        },
    { label: "Authentication",  href: "/docs/authentication"    },
    { label: "Error Codes",     href: "/docs/errors"            },
    { label: "Changelog",       href: "/changelog"              },
    { label: "Blog",            href: "/blog"                   },
    { label: "Status",          href: "https://status.schemacheck.dev" },
  ],
  "Code Examples": [
    { label: "JavaScript",  href: "/docs/code-examples/javascript" },
    { label: "Python",      href: "/docs/code-examples/python"     },
    { label: "PHP",         href: "/docs/code-examples/php"        },
    { label: "Go",          href: "/docs/code-examples/go"         },
    { label: "Ruby",        href: "/docs/code-examples/ruby"       },
    { label: "C#",          href: "/docs/code-examples/csharp"     },
  ],
  Comparisons: [
    { label: "vs Google Rich Results Test", href: "/comparisons/google-rich-results-test-alternative" },
    { label: "Customers",                   href: "/customers"  },
    { label: "Pricing",                     href: "#pricing"    },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms"   },
  ],
};

function Footer() {
  return (
    <footer className={cn("border-t pt-16 pb-10", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {Object.entries(FOOTER).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-gray-600 hover:text-gray-300 transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t", BORDER)}>
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-sm">⬡</span>
            <span className="text-sm font-semibold text-gray-500">SchemaCheck</span>
            <span className="text-gray-800 text-xs ml-2">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://x.com/schemacheck"
              target="_blank" rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="text-gray-700 hover:text-gray-300 transition-colors text-xs font-medium"
            >
              𝕏 Twitter
            </a>
            <a
              href="https://github.com/schemacheck"
              target="_blank" rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-gray-700 hover:text-gray-300 transition-colors text-xs font-medium"
            >
              GitHub
            </a>
            <a
              href="https://www.producthunt.com"
              target="_blank" rel="noopener noreferrer"
              aria-label="Product Hunt"
              className="text-gray-700 hover:text-gray-300 transition-colors text-xs font-medium"
            >
              Product Hunt
            </a>
          </div>

          <p className="text-xs text-gray-800">
            Made for developers who care about structured data.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Do failed validations count against my quota?",
        acceptedAnswer: { "@type": "Answer", text: "No. Only successful 200 responses from real computation count. 4xx errors never consume a credit." } },
      { "@type": "Question", name: "Do cached responses count against my quota?",
        acceptedAnswer: { "@type": "Answer", text: "No. URL results are cached for 1 hour. Repeat requests for the same URL within that window return instantly and use zero credits." } },
      { "@type": "Question", name: "What schema types do you support?",
        acceptedAnswer: { "@type": "Answer", text: "35+ schema types across 4 validation tiers including Article, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, FAQPage, Recipe, Event, VideoObject, JobPosting, Course, SoftwareApplication and more." } },
      { "@type": "Question", name: "Is there really a free tier — forever?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. 100 validations per month, no credit card, no trial period, no expiry." } },
      { "@type": "Question", name: "How fast is the API?",
        acceptedAnswer: { "@type": "Answer", text: "JSON-LD input is typically under 50ms. URL requests return in 1–3 seconds. Cache hits are near-instant." } },
      { "@type": "Question", name: "Do you support Microdata or RDFa?",
        acceptedAnswer: { "@type": "Answer", text: "Not yet. SchemaCheck currently validates JSON-LD only — the format Google recommends." } },
      { "@type": "Question", name: "Can I cancel anytime?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Cancel from your dashboard at any time. You retain access until the end of the current billing period. No cancellation fees." } },
      { "@type": "Question", name: "What is the refund policy?",
        acceptedAnswer: { "@type": "Answer", text: "30-day no-questions refund on all paid plans." } },
    ],
  };

  return (
    <div className={cn("min-h-screen", BG)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Nav />
      <main>
        <Hero />
        <StatsBar />
        <FeatureErrors />
        <FeatureRichResults />
        <FeatureCode />
        <Integrations />
        <Pricing />
        <Faq />
        <SignupCta />
      </main>
      <Footer />
    </div>
  );
}
