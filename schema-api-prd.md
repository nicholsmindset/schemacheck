# SchemaCheck API — Product Requirements Document & Claude Code Build Guide (v2)

**Product Name:** SchemaCheck (working title — also consider: SchemaLint, MarkupCheck, StructuredCheck)
**Tagline:** "Validate structured data in one API call."
**One-liner:** Send a URL or JSON-LD → get back errors, warnings, rich result eligibility, and fix suggestions.
**Positioning:** The ScreenshotOne of structured data — one focused API, done exceptionally well.

---

## 1. THE OPPORTUNITY

There is no commercial API for validating Schema.org structured data. Zero.

- Google's Rich Results Test → web UI only, no public REST API
- Schema.org's validator → web UI only, no hosted API
- W3C's JSON-LD Playground → web UI only, no hosted API
- Nuxt SEO's Schema Validator → web UI only, no hosted API

Every AI agent that gets asked to "audit this website's SEO" or "check my structured data" hits a dead end. There is nothing to call. Every developer building an SEO tool in Cursor or Lovable has to roll their own validation logic from scratch.

**You are building the Resend of structured data validation** — the one API endpoint that every SEO tool, content platform, and AI coding agent will default to.

### The ScreenshotOne Model (our blueprint)

ScreenshotOne is a solo-founder API at $25K+ MRR with 3,700+ active developers. The playbook:
- **One thing done well** — takes screenshots via API, nothing else
- **Usage-based pricing** with generous free tier (100/mo) that hooks developers
- **SDKs in 7 languages** — signals "real developer tool"
- **SEO pages for every use case and language** — each SDK, integration, and use case is its own landing page
- **No-code integrations** (Zapier, Make, n8n, Bubble, Clay) — each one is a distribution channel AND SEO page
- **llms.txt** shipped for AI tool discovery
- **Customer stories** as content marketing — case studies that double as testimonials
- **Changelog** showing constant product updates — signals active maintenance
- **"Failed requests don't count"** — trust-building billing policy

We replicate this exact playbook for structured data validation.

---

## 2. WHAT IT DOES

### Primary endpoint: `POST /api/v1/validate`

Also supports `GET /api/v1/validate?url=https://example.com` for simplicity (like ScreenshotOne's GET-based API).

**Input option A — URL (GET or POST):**
```
GET https://api.schemacheck.dev/v1/validate?url=https://stripe.com&access_key=<key>
```
```json
POST /api/v1/validate
{ "url": "https://example.com/article" }
```

**Input option B — Raw JSON-LD (POST only):**
```json
{
  "jsonld": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "My Article",
    "author": { "@type": "Person", "name": "John" }
  }
}
```

**Output:**
```json
{
  "success": true,
  "url": "https://example.com/article",
  "schemas_found": 2,
  "schemas": [
    {
      "type": "Article",
      "valid": false,
      "rich_result_eligible": false,
      "errors": [
        {
          "severity": "error",
          "property": "datePublished",
          "message": "Required property 'datePublished' is missing",
          "fix": "Add \"datePublished\": \"2026-03-18\" to your Article schema",
          "google_docs_url": "https://developers.google.com/search/docs/appearance/structured-data/article"
        }
      ],
      "warnings": [
        {
          "severity": "warning",
          "property": "image",
          "message": "Recommended property 'image' is missing — required for rich results",
          "fix": "Add \"image\": \"https://example.com/photo.jpg\" for rich result eligibility"
        }
      ],
      "properties_found": ["headline", "author"],
      "properties_missing_required": ["datePublished"],
      "properties_missing_recommended": ["image", "datePublished", "author.url"],
      "raw_jsonld": { ... }
    },
    {
      "type": "Organization",
      "valid": true,
      "rich_result_eligible": true,
      "errors": [],
      "warnings": [],
      "properties_found": ["name", "url", "logo"],
      "properties_missing_required": [],
      "properties_missing_recommended": ["sameAs"],
      "raw_jsonld": { ... }
    }
  ],
  "summary": {
    "total_schemas": 2,
    "valid_schemas": 1,
    "invalid_schemas": 1,
    "total_errors": 1,
    "total_warnings": 1,
    "rich_result_eligible": 1,
    "score": 65
  },
  "meta": {
    "api_version": "1.0",
    "validated_at": "2026-03-18T10:30:00Z",
    "cached": false,
    "credits_used": 1,
    "credits_remaining": 499
  }
}
```

### Billing policy (from ScreenshotOne playbook)
- **Cached results don't count** against quota
- **Malformed URLs** (400 errors) don't consume credits
- **Only successful validations** count toward monthly limit
- Users get email alerts at 90% and 100% usage

---

## 3. GOOGLE RICH RESULT TYPES TO VALIDATE (MVP)

Google retired 7 types in 2025 (HowTo for most sites, FAQPage for non-gov/health, Course Info, Claim Review, Learning Video, Special Announcement, Vehicle Listing). Focus on what's ACTIVE:

### Tier 1 — Ship in MVP (highest demand)
- **Article** (`Article`, `NewsArticle`, `BlogPosting`)
- **Product** (`Product`) — with offers, pricing, availability
- **LocalBusiness** (`LocalBusiness` and subtypes)
- **Organization** (`Organization`)
- **BreadcrumbList** (`BreadcrumbList`)
- **WebSite** (`WebSite`) — for sitelinks searchbox
- **FAQPage** (`FAQPage`) — restricted to gov/health but still valid schema

### Tier 2 — Ship in v1.1 (high demand)
- **Review / AggregateRating** (`Review`, `AggregateRating`)
- **Recipe** (`Recipe`)
- **Event** (`Event`)
- **VideoObject** (`VideoObject`)
- **SoftwareApplication** (`SoftwareApplication`)
- **JobPosting** (`JobPosting`)
- **Course** (`Course`)

### Tier 3 — Ship in v1.2 (niche but valuable)
- **Dataset** (`Dataset`)
- **Book** (`Book`)
- **MusicRecording** / `MusicAlbum`
- **EmployerAggregateRating**
- **ProfilePage** (`ProfilePage`)
- **DiscussionForumPosting**

### For each type, validate:
1. **JSON syntax** — is it valid JSON?
2. **JSON-LD structure** — has `@context`, `@type`, proper nesting?
3. **Required properties** — per Google's documentation for that type
4. **Recommended properties** — flag missing ones as warnings
5. **Property value types** — dates in ISO 8601, URLs as absolute URLs, numbers as numbers
6. **Google-specific rules** — e.g., `image` must be crawlable, `author` should have `url`, self-serving review restrictions
7. **Rich result eligibility** — would this pass Google's Rich Results Test?
8. **Deprecated type warnings** — flag if using retired types (HowTo, etc.)

---

## 4. TECH STACK

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | Next.js 14+ (App Router) | Best Vercel integration, API routes built-in |
| Language | TypeScript | Type safety for schema validation logic |
| Hosting | Vercel | Free hobby tier, auto-scaling, edge functions |
| Database | Supabase | Free tier generous, auth built-in, Postgres |
| Payments | Stripe | Industry standard, Checkout + webhooks |
| HTML fetching | `node-fetch` + `cheerio` | Extract JSON-LD from URLs (no Puppeteer needed!) |
| JSON-LD parsing | Custom parser + `schema-dts` types | Google's official Schema.org TypeScript definitions |
| Rate limiting | Upstash Redis (optional) | Free tier, or just use Supabase counters |
| Docs site | Astro or static pages | ScreenshotOne uses Astro — fast, SEO-friendly |
| MCP Server | `@modelcontextprotocol/sdk` | Ship as MCP server from day one |
| Status page | BetterStack or Instatus | Show uptime % like ScreenshotOne does (99.672%) |

**Critical architecture insight:** You do NOT need Puppeteer for this API. JSON-LD lives in `<script type="application/ld+json">` tags in the HTML source. A simple HTTP fetch + cheerio HTML parse extracts it. This keeps your infrastructure costs near zero and makes Vercel's serverless functions perfectly viable (no headless browser needed).

**Estimated monthly infrastructure cost: $0–25**

---

## 5. DATABASE SCHEMA

### Table: `api_keys`
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  requests_used INTEGER NOT NULL DEFAULT 0,
  requests_limit INTEGER NOT NULL DEFAULT 100,
  overage_rate DECIMAL(6,4) DEFAULT 0.0100, -- per-extra cost
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notified_90 BOOLEAN NOT NULL DEFAULT false,
  notified_100 BOOLEAN NOT NULL DEFAULT false
);
```

### Table: `usage_logs`
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  input_type TEXT NOT NULL, -- 'url' or 'jsonld'
  schemas_found INTEGER DEFAULT 0,
  errors_found INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  cached BOOLEAN NOT NULL DEFAULT false,
  credited BOOLEAN NOT NULL DEFAULT true, -- false for cache hits and errors
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Table: `validation_cache`
```sql
CREATE TABLE validation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_hash TEXT UNIQUE NOT NULL, -- SHA256 of the URL
  url TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL -- cache for 1 hour
);
```

---

## 6. PRICING (Updated — modeled on ScreenshotOne)

ScreenshotOne charges $17 / $79 / $259 with declining per-extra rates. Their middle tier at $79 is the anchor "recommended" plan. We adapt this for our lower infrastructure costs:

| Plan | Price | Monthly Validations | Per Extra | Rate Limit | Features |
|------|-------|-------------------|-----------|------------|----------|
| **Free** | $0 | 100 | — | 10 req/min | Basic validation, 7 schema types |
| **Basic** | $19/mo | 3,000 | $0.008 | 30 req/min | + Fix suggestions, rich result checks, caching |
| **Growth** ⭐ | $79/mo | 15,000 | $0.005 | 60 req/min | + Batch validation, webhook alerts, priority |
| **Scale** | $199/mo | 75,000 | $0.003 | 120 req/min | + Priority support, SLA, custom rules |
| **Enterprise** | Contact | Unlimited | Custom | Custom | + Dedicated infra, on-prem, custom integrations |

**Annual billing: 2 months free** (like ScreenshotOne)

### Billing rules (from ScreenshotOne playbook):
- Only successful validations count toward quota
- Cached results are free
- 400/401/429 errors don't consume credits
- Email alerts at 90% and 100% usage
- Overage is automatic (no hard cutoff) — user pays per-extra rate
- No credit card required for free tier
- 30-day refund policy, no questions asked

### Why this pricing works:
- Free tier (100/mo) hooks developers — same as ScreenshotOne
- $19 Basic is impulse-buy territory for solo devs
- $79 Growth is the anchor — where the revenue concentrates
- $199 Scale catches agencies and SaaS builders
- Declining per-extra rates incentivize upgrading to higher tiers
- Overage billing (instead of hard limits) prevents churn at plan boundaries

---

## 7. FILE STRUCTURE (Updated)

```
schemacheck/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Landing page (hero + code example + social proof + pricing)
│   │   ├── layout.tsx                   # Root layout with nav + footer
│   │   ├── pricing/
│   │   │   └── page.tsx                 # Pricing page with FAQ (like ScreenshotOne)
│   │   ├── docs/
│   │   │   ├── getting-started/
│   │   │   │   └── page.tsx             # Getting started guide
│   │   │   ├── options/
│   │   │   │   └── page.tsx             # Full API options reference
│   │   │   ├── errors/
│   │   │   │   └── page.tsx             # Error codes reference
│   │   │   └── page.tsx                 # Docs index
│   │   ├── docs/code-examples/          # SDK pages (each is SEO landing page)
│   │   │   ├── javascript/page.tsx      # "JavaScript Schema Validation API"
│   │   │   ├── python/page.tsx          # "Python Schema Validation API"
│   │   │   ├── php/page.tsx             # "PHP Schema Validation API"
│   │   │   ├── go/page.tsx              # "Go Schema Validation API"
│   │   │   ├── ruby/page.tsx            # "Ruby Schema Validation API"
│   │   │   └── csharp/page.tsx          # "C# Schema Validation API"
│   │   ├── integrations/                # No-code integration pages (SEO + distribution)
│   │   │   ├── zapier/page.tsx
│   │   │   ├── make/page.tsx
│   │   │   ├── n8n/page.tsx
│   │   │   └── page.tsx                 # Integrations index
│   │   ├── use-cases/                   # Use case pages (SEO landing pages)
│   │   │   ├── seo-audit/page.tsx       # "Schema validation for SEO audits"
│   │   │   ├── ai-agents/page.tsx       # "Schema validation for AI agents"
│   │   │   ├── cms-plugins/page.tsx     # "Schema validation for CMS plugins"
│   │   │   ├── ecommerce/page.tsx       # "Product schema validation for e-commerce"
│   │   │   └── page.tsx                 # Use cases index
│   │   ├── customers/
│   │   │   └── page.tsx                 # Testimonials + customer stories
│   │   ├── changelog/
│   │   │   └── page.tsx                 # Changelog (ship from day one)
│   │   ├── blog/
│   │   │   └── [...slug]/page.tsx       # Blog posts (SEO content)
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # User dashboard (API key, usage stats)
│   │   └── api/
│   │       ├── v1/
│   │       │   └── validate/
│   │       │       └── route.ts         # Main validation endpoint (GET + POST)
│   │       ├── auth/
│   │       │   ├── signup/
│   │       │   │   └── route.ts
│   │       │   └── login/
│   │       │       └── route.ts
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── middleware.ts                # API key auth + rate limiting + credit tracking
│   │   ├── validator/
│   │   │   ├── index.ts                 # Main validation orchestrator
│   │   │   ├── extractor.ts             # Fetch URL → extract JSON-LD
│   │   │   ├── json-ld-parser.ts        # Parse and normalize JSON-LD
│   │   │   ├── schema-rules.ts          # Validation rules per schema type
│   │   │   ├── rich-results.ts          # Google rich result eligibility checks
│   │   │   └── types.ts                 # TypeScript types
│   │   ├── cache.ts
│   │   ├── stripe.ts
│   │   └── notifications.ts            # Usage alert emails (90%, 100%)
│   └── data/
│       └── schema-rules/
│           ├── article.json
│           ├── product.json
│           ├── local-business.json
│           ├── organization.json
│           ├── breadcrumb-list.json
│           ├── website.json
│           └── faq-page.json
├── mcp-server/
│   ├── index.ts
│   └── package.json
├── public/
│   ├── llms.txt                         # AI tool discovery (like ScreenshotOne)
│   ├── llms-full.txt                    # Extended version for deeper context
│   └── openapi.json                     # OpenAPI 3.1 spec
├── package.json
├── tsconfig.json
├── next.config.js
├── CLAUDE.md
├── .env.local
└── README.md
```

---

## 8. CLAUDE CODE BUILD PROMPTS

Use these prompts sequentially in Claude Code. Each prompt builds on the previous one.

---

### PROMPT 1: Project Scaffolding
```
I want to build a Schema Markup Validation API called "SchemaCheck" using Next.js and Vercel. I'm modeling it after ScreenshotOne (screenshotone.com) — a solo-founder API at $25K+ MRR.

The API does one thing: you send a URL or raw JSON-LD, and it returns a complete structured data validation report — errors, warnings, rich result eligibility, and fix suggestions.

Tech stack:
- Next.js 14+ with App Router
- TypeScript (strict mode)
- Vercel for deployment
- Supabase for database (API keys, usage tracking, caching)
- Stripe for billing
- cheerio for HTML parsing (NOT Puppeteer — JSON-LD is in page source)

I need:
1. A Next.js project with the main API route at /api/v1/validate supporting both GET and POST
2. API key authentication via x-api-key header OR access_key query parameter (like ScreenshotOne supports both)
3. Supabase tables:
   - "api_keys": id (uuid), key (text unique), email (text), plan (text default 'free'), requests_used (int default 0), requests_limit (int default 100), overage_rate (decimal default 0.01), created_at (timestamptz), stripe_customer_id (text), stripe_subscription_id (text), is_active (bool default true), notified_90 (bool default false), notified_100 (bool default false)
   - "usage_logs": id (uuid), api_key_id (uuid FK), endpoint (text), input_type (text), schemas_found (int), errors_found (int), response_time_ms (int), cached (bool default false), credited (bool default true), created_at (timestamptz)
   - "validation_cache": id (uuid), url_hash (text unique), url (text), result (jsonb), created_at (timestamptz), expires_at (timestamptz)
4. Middleware that checks the API key, increments usage only for successful non-cached requests, allows overage with per-extra billing, and sends usage alerts at 90% and 100%
5. The validation endpoint logic
6. A clean developer-focused landing page modeled after ScreenshotOne's homepage structure:
   - Hero with live API call example showing URL params
   - Social proof stats (schemas supported, uptime, validations served)
   - Tabbed SDK code examples (JavaScript, Python, curl)
   - Feature sections with before/after examples
   - Pricing table with "recommended" badge on middle tier
   - FAQ section
   - Footer with links to docs, integrations, use cases, SDK pages, blog, changelog, customers, legal

Do NOT write any code yet. First, outline the complete file structure and confirm the database schema. I will review before you proceed.
```

---

### PROMPT 2: Supabase SQL Setup
```
Generate the complete SQL for my Supabase setup. I need:

1. CREATE TABLE statements for api_keys, usage_logs, and validation_cache
2. Row Level Security policies that allow the service_role to read/write but block public/anon access
3. Indexes:
   - api_keys.key (unique, for fast auth lookups)
   - validation_cache.url_hash (unique, for fast cache checks)
   - usage_logs.api_key_id + usage_logs.created_at (for usage queries)
   - usage_logs.created_at (for analytics)
4. A function to clean expired cache entries (validation_cache where expires_at < now())
5. A function to reset monthly usage counters (requests_used = 0, notified_90 = false, notified_100 = false) — to be called on billing cycle reset
6. A pg_cron job to run cache cleanup daily

Output the SQL so I can paste it directly into Supabase's SQL Editor.
```

---

### PROMPT 3: API Key Middleware
```
Implement the API key authentication middleware at src/lib/middleware.ts.

Requirements:
- Support TWO auth methods (like ScreenshotOne):
  a. x-api-key header
  b. access_key query parameter
- Look up the key in the api_keys Supabase table
- If key not found or is_active is false → 401 {"error": {"code": "invalid_api_key", "message": "Invalid or inactive API key"}}
- If requests_used >= requests_limit AND plan is 'free' → 429 with upgrade message
- If requests_used >= requests_limit AND plan is paid → allow but flag as overage (we'll bill per-extra)
- For successful non-cached requests: increment requests_used by 1
- For cached requests: do NOT increment (cached results are free)
- For 400 errors (bad input): do NOT increment (errors don't cost credits)
- Check usage thresholds and set notified_90/notified_100 flags (we'll send emails separately)
- Add CORS headers (allow all origins)
- Return structured errors following ScreenshotOne's pattern: {"error": {"code": "...", "message": "..."}}

Make it a reusable wrapper function for API route handlers.
```

---

### PROMPT 4: JSON-LD Extractor
```
Implement src/lib/validator/extractor.ts — the module that fetches a URL and extracts all JSON-LD blocks.

Requirements:
- Accept a URL string as input
- Fetch the HTML using node-fetch with a 10-second timeout
- Set User-Agent to "SchemaCheck/1.0 (+https://schemacheck.dev/bot)"
- Use cheerio to parse the HTML
- Find all <script type="application/ld+json"> tags
- Parse each one as JSON
- Handle @graph arrays (flatten into individual schema objects)
- Handle arrays of schemas (some sites output [...] instead of {...})
- Return an array of parsed JSON-LD objects plus metadata:
  { schemas: JsonLd[], parse_errors: string[], fetch_time_ms: number }
- Handle errors gracefully:
  - URL not reachable → specific error with status code
  - Invalid JSON in script tag → include parse error but continue with other tags
  - No JSON-LD found → return empty array with helpful message
  - Redirect chains → follow up to 5 redirects
  - Non-HTML content type → return specific error
  - Timeout → return specific error

Do NOT use Puppeteer or any headless browser. JSON-LD is in the HTML source.

Install cheerio as a dependency.
```

---

### PROMPT 5: Validation Rules Engine
```
Implement the core validation engine at src/lib/validator/schema-rules.ts and the rule files in src/data/schema-rules/.

Each rule file (e.g., article.json) has this structure:
{
  "type": "Article",
  "also_matches": ["NewsArticle", "BlogPosting", "TechArticle", "ScholarlyArticle"],
  "google_docs_url": "https://developers.google.com/search/docs/appearance/structured-data/article",
  "required_properties": [
    {
      "property": "headline",
      "type": "string",
      "max_length": 110,
      "description": "The headline of the article. Maximum 110 characters."
    },
    {
      "property": "datePublished",
      "type": "date",
      "format": "ISO8601",
      "description": "The date the article was published in ISO 8601 format."
    }
  ],
  "recommended_properties": [
    {
      "property": "image",
      "type": "url",
      "description": "Image URL. Must be crawlable and indexable.",
      "rich_result_required": true
    },
    {
      "property": "author",
      "type": "object",
      "expected_type": ["Person", "Organization"],
      "description": "Author of the article.",
      "nested_recommended": ["name", "url"]
    }
  ],
  "deprecated": false,
  "deprecation_note": null
}

Create rule files for MVP Tier 1 types:
1. Article (including NewsArticle, BlogPosting)
2. Product (with Offer, AggregateOffer)
3. LocalBusiness
4. Organization
5. BreadcrumbList
6. WebSite
7. FAQPage (note: restricted to gov/health for rich results since 2024)

Then implement the validation engine that:
- Takes a parsed JSON-LD object
- Identifies its @type
- Loads the matching rule file
- Checks all required properties exist and have correct types
- Checks recommended properties and flags missing as warnings
- Validates date formats (ISO 8601), URL formats (absolute), string lengths
- Checks nested objects (e.g., author should be Person/Organization with name)
- Returns structured validation result with errors, warnings, fix suggestions
- Calculates a validation score (0-100)
- For unknown @type values: validate basic JSON-LD structure and return partial result
```

---

### PROMPT 6: Rich Result Eligibility Checker
```
Implement src/lib/validator/rich-results.ts — determines if a schema qualifies for Google Rich Results.

For each schema type, rich result eligibility requires ALL required properties plus certain "rich result required" recommended properties. For example:
- Article: headline + at least one image
- Product: name + offers (with price and availability)
- LocalBusiness: name + address
- Review/AggregateRating: itemReviewed + ratingValue

The module should:
1. Take the validation result from schema-rules.ts
2. Check if all required properties are present (no errors)
3. Check if "rich result required" recommended properties are present
4. Return { eligible: true/false, reason: string, google_docs_url: string }

Also flag deprecated rich result types with specific messages:
- HowTo → "Google retired HowTo rich results in 2024. This markup will not generate rich results."
- FAQPage → "FAQPage rich results are restricted to government and health authority sites since 2024."
- SpecialAnnouncement → "Deprecated in 2025."
- Course Info → "Deprecated in 2025."
- Claim Review → "Deprecated in 2025."
- Learning Video → "Deprecated in 2025."
- Vehicle Listing → "Deprecated in 2025."
```

---

### PROMPT 7: Main Validation Orchestrator + API Route
```
Wire everything together.

Implement src/lib/validator/index.ts as the main orchestrator:
1. Accept { url: string } or { jsonld: object } or URL query params
2. If URL: check validation_cache by SHA256 hash. If cached and not expired (1hr TTL), return cached result with "cached": true in meta — do NOT count against credits
3. If URL: call extractor.ts to fetch and extract JSON-LD
4. For each JSON-LD object found:
   a. Run schema-rules validation
   b. Run rich-results eligibility check
   c. Compile errors and warnings with fix suggestions
5. Calculate summary (total schemas, valid count, error count, score)
6. If URL: cache result in validation_cache
7. Return complete response

Then implement the API route at src/app/api/v1/validate/route.ts:
1. Support BOTH GET and POST (like ScreenshotOne)
   - GET: read url and access_key from query params
   - POST: read from JSON body, auth from header or body
2. Apply API key middleware
3. Validate input: 400 if no url or jsonld provided (don't consume credit)
4. Call validation orchestrator
5. Log to usage_logs with credited=true for successful, credited=false for cached/error
6. Return JSON with structured error format: {"error": {"code": "...", "message": "..."}} on failure
7. Include response_time_ms in meta
8. Set 25-second timeout (Vercel limit is 30s on hobby)

Handle edge cases:
- URL returns non-HTML → 400, no credit consumed
- URL unreachable → 400, no credit consumed
- No JSON-LD found → 200 with empty schemas and helpful message, credit consumed
- Parse errors → include in response, continue with valid blocks
```

---

### PROMPT 8: Landing Page (Modeled on ScreenshotOne)
```
Create a developer-focused landing page at src/app/page.tsx modeled after ScreenshotOne's homepage.

Design: Tailwind CSS, dark/light mode, blue/indigo primary. Clean, minimal, professional.

Section 1 — Hero:
- Headline: "The schema validation API for developers"
- Subhead: "Validate structured data in one simple API call, instead of manually checking with Google's tools."
- Show a LIVE API call with visible URL: 
  https://api.schemacheck.dev/v1/validate?url=https://stripe.com&access_key=...
- Show a truncated JSON response next to it (like ScreenshotOne shows the screenshot)
- Two CTAs: "Start validating for free →" and "View documentation"
- "No credit card required." below

Section 2 — Social Proof Bar (3 stats like ScreenshotOne):
- "7 Schema types" (grows over time)
- "99.9% Uptime"
- "Free tier: 100 validations/month"

Section 3 — Feature: "Catch every error"
- Required properties missing → error
- Recommended properties missing → warning
- Fix suggestions with Google docs links
- Show before/after: broken schema → validated schema with fixes

Section 4 — Feature: "Check rich result eligibility"
- Validates against Google's current requirements
- Flags deprecated types (HowTo, FAQPage restrictions)
- Shows which properties are needed for rich results

Section 5 — Feature: "Use the language you love"
- Tabbed code examples: curl, JavaScript, Python (add more later)
- Real, working code that developers can copy-paste
- Similar to ScreenshotOne's 7-language tabbed display

Section 6 — No-code integrations (placeholder for v1.1):
- Logos: Zapier, Make, n8n
- "Coming soon — get notified"

Section 7 — Pricing:
- 4 tiers: Free / Basic $19 / Growth $79 (recommended badge) / Scale $199
- Monthly/Annual toggle (annual = 2 months free)
- Feature comparison
- "No credit card required" and "30-day refund policy"
- Per-extra overage rates shown

Section 8 — FAQ:
- Do failed validations count? (No)
- Do cached results count? (No)
- What schema types do you support? (List)
- Is it free? (Yes, 100/month free forever)
- How fast is it? (Average <2 seconds)
- Do you support Microdata or RDFa? (Not yet, JSON-LD only for now)
- Can I cancel anytime? (Yes)
- Refund policy? (30 days, no questions)
- Is SchemaCheck the best schema validation API? (Yes — link to comparison page)

Section 9 — CTA:
- "Validate your structured data" with email signup
- Returns API key immediately on page

Section 10 — Footer (like ScreenshotOne's comprehensive footer):
- Columns: Integrations, Use Cases, Resources, SDK Pages, Product, Legal
- Social links: Twitter/X, GitHub, LinkedIn, Product Hunt
- Status page link
```

---

### PROMPT 9: Authentication + Stripe Billing
```
Implement auth and billing routes:

1. POST /api/auth/signup:
   - Accept { email: string }
   - Generate API key: "sc_live_" + 32 random hex chars
   - Insert into api_keys with plan='free', requests_limit=100
   - Return { api_key, plan, requests_limit, dashboard_url }
   - Send welcome email via Resend (or log for now)

2. POST /api/auth/login:
   - Accept { email: string }
   - Look up by email, return key + usage stats
   - (MVP: no password, just email lookup. Add proper auth later.)

3. POST /api/webhooks/stripe:
   - Verify Stripe webhook signature
   - Handle checkout.session.completed:
     * Update api_keys: plan, requests_limit, overage_rate, stripe IDs
   - Handle customer.subscription.updated:
     * Update plan, limits, overage_rate
   - Handle customer.subscription.deleted:
     * Reset to plan='free', requests_limit=100
   - Handle invoice.payment_succeeded:
     * Reset requests_used to 0 for new billing period
     * Reset notified_90 and notified_100 flags

4. Stripe checkout (src/lib/stripe.ts):
   - Plan configs:
     * basic: $19/mo, 3000 requests, $0.008 overage, 30 req/min
     * growth: $79/mo, 15000 requests, $0.005 overage, 60 req/min
     * scale: $199/mo, 75000 requests, $0.003 overage, 120 req/min
   - Annual pricing: basic $190/yr, growth $790/yr, scale $1990/yr
   - Success URL: /dashboard?success=true
   - Cancel URL: /pricing
```

---

### PROMPT 10: API Documentation (Critical for distribution)
```
Create comprehensive API documentation pages under src/app/docs/.

This is the MOST IMPORTANT set of pages for distribution. Model after ScreenshotOne's docs structure (they use Starlight/Astro, we'll use Next.js pages styled similarly).

Docs index page (src/app/docs/page.tsx):
- Sidebar navigation matching ScreenshotOne's pattern
- Search functionality

Getting Started (src/app/docs/getting-started/page.tsx):
- 3-line quickstart: signup → get key → make first request
- Show the simplest possible GET request:
  GET https://api.schemacheck.dev/v1/validate?url=https://apple.com&access_key=YOUR_KEY
- Show the response
- "Sign up to get your access key"

API Options Reference (src/app/docs/options/page.tsx):
- Every parameter documented: url, jsonld, access_key, format
- Request/response schemas with full examples

Error Reference (src/app/docs/errors/page.tsx):
- Every error code: invalid_api_key, rate_limit_exceeded, invalid_url, no_jsonld_found, parse_error, timeout, internal_error
- HTTP status codes: 400, 401, 429, 500, 504
- Example error responses

SDK pages (src/app/docs/code-examples/*.tsx):
- Each language gets its OWN page (critical for SEO — "Python schema validation API" etc.)
- JavaScript/TypeScript, Python, PHP, Go, Ruby, C# (.NET)
- Each page has: install command, full working example, link to GitHub SDK repo
- These pages should be individually indexable with unique meta titles and descriptions

IMPORTANT: Also create these files in public/:
- llms.txt — concise API overview for AI tools (~800 tokens)
- llms-full.txt — detailed API docs for deeper AI context (~3000 tokens)
- openapi.json — complete OpenAPI 3.1 spec

Every docs page should have clean, syntax-highlighted code. The docs ARE the marketing.
```

---

### PROMPT 11: SEO Landing Pages (The ScreenshotOne Growth Engine)
```
Create SEO-optimized landing pages that will drive organic traffic. This is how ScreenshotOne gets most of its revenue — individual pages for every use case, language, and comparison.

Use Case Pages (src/app/use-cases/):
1. /use-cases/seo-audit — "Schema Validation for SEO Audits"
   - H1: "Automate schema validation in your SEO audit workflow"
   - How SEO tools use the API, code example, testimonial placeholder
   
2. /use-cases/ai-agents — "Schema Validation for AI Agents"
   - H1: "Let AI agents validate structured data programmatically"
   - MCP server integration, Cursor/Lovable workflow examples

3. /use-cases/ecommerce — "Product Schema Validation for E-commerce"
   - H1: "Validate Product and Offer schemas for Google Shopping"
   - Shopify/WooCommerce workflow examples

4. /use-cases/cms-plugins — "Schema Validation for CMS Plugins"
   - H1: "Build schema validation into WordPress, Shopify, and Webflow plugins"

Comparison Pages (src/app/comparisons/):
5. /comparisons/google-rich-results-test-alternative — "SchemaCheck vs Google Rich Results Test"
   - H1: "The programmatic alternative to Google's Rich Results Test"
   - Feature comparison table

6. /comparisons/schema-markup-validator-alternative — "SchemaCheck vs Schema Markup Validator"
   - H1: "Why developers choose an API over web-based validators"

Each page must have:
- Unique meta title and description (SEO optimized)
- H1 with target keyword
- Code example showing the API in action for that use case
- CTA to sign up
- Internal links to docs, pricing, and related use cases
- Schema.org structured data (meta — we should eat our own dog food!)
```

---

### PROMPT 12: Changelog + Customer Stories + Blog Framework
```
Set up the content infrastructure that signals "this product is alive and maintained."

1. Changelog Page (src/app/changelog/page.tsx):
   - Simple reverse-chronological list of product updates
   - Each entry: date, title, description, optional tag (feature/fix/improvement)
   - Seed with initial entries:
     * "March 2026: SchemaCheck API launched"
     * "March 2026: 7 schema types supported — Article, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, FAQPage"
     * "March 2026: MCP server published to npm"
     * "March 2026: llms.txt published for AI tool discovery"
   - RSS feed at /changelog/rss.xml

2. Customers Page (src/app/customers/page.tsx):
   - Testimonial grid (start with placeholder structure, fill as customers come)
   - Layout: avatar, name, title, company, quote
   - Like ScreenshotOne's testimonials page

3. Blog Framework (src/app/blog/):
   - MDX-based blog with syntax highlighting
   - Categories: Engineering, Guides, Customer Stories, Product Updates
   - Seed with first posts (we'll write these):
     * "Why there's no API for schema validation (until now)"
     * "How to validate JSON-LD structured data with an API"
     * "Building SchemaCheck: a solo founder's journey"

Each blog post should have:
- SEO meta tags
- Open Graph / Twitter Card meta
- Schema.org Article structured data (eat our own dog food!)
- Table of contents for long posts
- CTA at the bottom
```

---

### PROMPT 13: MCP Server + AI Discoverability
```
Create the MCP server and AI discoverability files.

1. MCP Server (mcp-server/):
   - Use @modelcontextprotocol/sdk
   - Tool name: "validate_schema"
   - Description: "Validate Schema.org structured data (JSON-LD) on any URL. Returns errors, warnings, rich result eligibility, and fix suggestions."
   - Input schema:
     * url (string, optional): URL to validate
     * jsonld (object, optional): Raw JSON-LD to validate
   - Calls our REST API with configured base URL and API key
   - Returns the validation result
   - Package as npm package: "schemacheck-mcp"
   - Include README with setup instructions for:
     * Claude Desktop (claude_desktop_config.json)
     * Cursor
     * VS Code (via GitHub Copilot)
     * Windsurf

2. public/llms.txt (~800 tokens):
   - Project name and one-line description
   - Authentication: x-api-key header or access_key param
   - Main endpoint: GET/POST /api/v1/validate
   - Input options: url or jsonld
   - Output structure (abbreviated)
   - Error codes
   - Example request/response
   - Link to full docs

3. public/llms-full.txt (~3000 tokens):
   - Everything in llms.txt plus:
   - All supported schema types with required/recommended properties
   - All error codes with descriptions
   - Rate limits per plan
   - SDK install commands for all languages
   - Multiple example requests/responses
   
4. public/openapi.json — complete OpenAPI 3.1 spec
```

---

### PROMPT 14: Testing
```
Write comprehensive tests using Vitest.

1. tests/extractor.test.ts:
   - Extract JSON-LD from mock HTML with 1 schema
   - Extract multiple schemas from one page
   - Handle @graph arrays
   - Handle invalid JSON in script tags (continue with others)
   - Handle pages with no JSON-LD
   - Handle non-HTML content type
   - Handle redirect chains

2. tests/schema-rules.test.ts:
   - Article with all required properties → valid
   - Article missing datePublished → error
   - Product with valid Offer → valid
   - Product missing price in Offer → error
   - Unknown @type → partial validation
   - Nested object validation (author must be Person/Organization)
   - Date format validation (ISO 8601)
   - URL format validation (absolute URLs)
   - String length validation (headline max 110 chars)

3. tests/rich-results.test.ts:
   - Article eligible for rich results → true
   - Article missing image → not eligible
   - Deprecated HowTo → flagged
   - FAQPage → flagged as restricted

4. tests/api.test.ts:
   - Valid GET request with access_key param
   - Valid POST request with x-api-key header
   - Missing API key → 401
   - Invalid API key → 401
   - Rate limit exceeded (free tier) → 429
   - Missing input → 400 (no credit consumed)
   - Cached result → credit not consumed
   - Invalid URL → 400 (no credit consumed)

5. tests/middleware.test.ts:
   - Auth via header
   - Auth via query param
   - Credit tracking (only successful non-cached requests)
   - Overage allowed for paid plans
```

---

### PROMPT 15: Deploy to Vercel
```
Help me deploy to Vercel.

1. Initialize git repo with proper .gitignore
2. Create .env.local.example:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_ANON_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - NEXT_PUBLIC_BASE_URL
   - NEXT_PUBLIC_APP_NAME=SchemaCheck
3. Vercel project configuration if needed
4. Walk me through:
   a. Creating GitHub repo
   b. Connecting to Vercel
   c. Adding env vars in Vercel dashboard
   d. Deploying
   e. Custom domain setup (schemacheck.dev)
   f. Stripe webhook URL configuration
   g. Setting up BetterStack or Instatus for status page (status.schemacheck.dev)

Post-deployment verification:
- Landing page loads with correct meta tags
- /api/v1/validate returns 401 without API key
- GET with access_key param works
- POST with x-api-key header works
- Signup creates API key
- Validation endpoint returns correct results for https://stripe.com
- Cached results return faster and don't consume credits
- Stripe checkout flow works
- llms.txt is accessible at /llms.txt
- openapi.json is accessible at /openapi.json
```

---

## 9. DISTRIBUTION PLAN (FIRST 60 DAYS)

### Week 1: Ship + Seed
- [ ] Deploy MVP to Vercel with custom domain
- [ ] Publish MCP server to npm as "schemacheck-mcp"
- [ ] Register on MCP directories: PulseMCP, Glama, MCP.so, official registry
- [ ] Create GitHub repo with README + SDK examples
- [ ] Submit to RapidAPI marketplace
- [ ] Set up BetterStack status page (status.schemacheck.dev)
- [ ] Publish changelog with launch entries
- [ ] Verify llms.txt and openapi.json are live

### Week 2: Launch
- [ ] Post "Show HN: SchemaCheck — API for validating Schema.org structured data" on Hacker News
- [ ] Post on r/SEO, r/webdev, r/SaaS, r/Entrepreneur, r/bigseo
- [ ] Tweet build-in-public thread with demo
- [ ] Post on Product Hunt
- [ ] Offer 500 free API calls to first 50 signups
- [ ] Post in Indie Hackers

### Week 3: Content + SEO
- [ ] Publish blog: "Why there's no API for schema validation (until now)"
- [ ] Publish blog: "How to validate JSON-LD structured data with an API"
- [ ] Publish all SDK pages (JavaScript, Python, PHP, Go, Ruby, C#)
- [ ] Publish all use case pages (SEO audit, AI agents, e-commerce, CMS plugins)
- [ ] Publish comparison pages (vs Google Rich Results Test, vs web validators)
- [ ] Add SchemaCheck structured data to every page (eat own dog food)

### Week 4: Outreach
- [ ] Cold email 20 SEO tool builders (offer free pro tier for integration)
- [ ] DM 10 AI coding tool creators on Twitter/X
- [ ] Submit to developer newsletters (TLDR, Bytes, JavaScript Weekly)
- [ ] Create npm SDK package (schemacheck-js)
- [ ] Create PyPI package (schemacheck-python)

### Weeks 5-8: Compound
- [ ] Publish first customer stories (even small users count)
- [ ] Add Zapier/Make/n8n integration pages
- [ ] Publish "Building a $X MRR API as a solo founder" blog post
- [ ] Add Tier 2 schema types (Review, Recipe, Event, Video, etc.)
- [ ] Add batch validation endpoint
- [ ] Guest post on SEO blogs about structured data validation
- [ ] Start affiliate program (like ScreenshotOne's)

---

## 10. SUCCESS METRICS

| Metric | 30 Days | 90 Days | 180 Days |
|--------|---------|---------|----------|
| Signups | 100 | 500 | 2,000 |
| Active developers | 30 | 200 | 800 |
| Paying customers | 5 | 30 | 120 |
| MRR | $150 | $1,500 | $5,000 |
| API calls/month | 5,000 | 75,000 | 500,000 |
| MCP server installs | 50 | 200 | 1,000 |
| Uptime | 99.9%+ | 99.9%+ | 99.9%+ |

### The ScreenshotOne benchmark:
- Dmytro took ~3 years to reach $25K MRR with 800+ paying customers
- But he was one of the first. Your market (structured data validation) has ZERO competitors
- Realistic 12-month target: $3K-10K MRR

---

## 11. FUTURE ROADMAP

### v1.1 (Month 2)
- Batch validation (POST array of URLs)
- Webhook alerts (notify when a monitored URL's schema breaks)
- Tier 2 schema types (Review, Recipe, Event, Video, Job, Course)
- Zapier + Make + n8n integrations
- npm SDK (schemacheck-js) + PyPI package (schemacheck-python)

### v1.2 (Month 3)
- Schema generator (input page content → output recommended JSON-LD)
- Monitoring mode (check URLs daily, alert on changes)
- WordPress plugin
- Affiliate program

### v2.0 (Month 6)
- WCAG Accessibility checking (natural product extension — same URL input, different validation)
- Full site crawl mode (crawl entire site, validate all pages)
- Dashboard with historical tracking + charts
- Competitive comparison (your schema vs competitor's)
- Shopify app

### v3.0 (Month 12)
- Unified website audit API (schema + accessibility + meta tags + Core Web Vitals)
- Agency dashboard (multi-client management)
- White-label option
