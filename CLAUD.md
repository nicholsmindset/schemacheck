# SchemaCheck — Schema Markup Validation API

A REST API that validates Schema.org structured data (JSON-LD). Send a URL or raw JSON-LD, get back errors, warnings, rich result eligibility, and fix suggestions. Modeled on the ScreenshotOne playbook (solo-founder API, $25K+ MRR).

## Tech Stack

- Next.js 14+ (App Router) with TypeScript (strict mode)
- Vercel for hosting (serverless functions, 30s timeout)
- Supabase for Postgres database and auth
- Stripe for billing (Checkout + webhooks)
- cheerio for HTML parsing (NOT Puppeteer — JSON-LD is in page source)
- Vitest for testing

## Commands

- `npm run dev` — local dev server on port 3000
- `npm run build` — production build
- `npm run test` — run Vitest suite
- `npm run lint` — ESLint check

## Architecture

```
src/app/                         → Pages + API routes (App Router)
src/app/api/v1/validate/         → Main validation endpoint (GET + POST)
src/app/api/auth/                → Signup/login routes
src/app/api/webhooks/            → Stripe webhook handler
src/app/docs/                    → Documentation pages (each is SEO page)
src/app/docs/code-examples/      → Per-language SDK pages (JS, Python, PHP, Go, Ruby, C#)
src/app/use-cases/               → SEO landing pages per use case
src/app/comparisons/             → Comparison pages (vs Google Rich Results Test, etc.)
src/app/integrations/            → No-code integration pages (Zapier, Make, n8n)
src/app/blog/                    → MDX blog
src/app/changelog/               → Product changelog
src/app/customers/               → Testimonials + customer stories
src/lib/validator/               → Core engine (extractor, parser, rules, rich-results)
src/lib/middleware.ts             → API key auth + rate limiting + credit tracking
src/data/schema-rules/           → JSON config per Schema.org type
mcp-server/                      → MCP server for AI tool integration
public/llms.txt                  → AI discoverability (concise, ~800 tokens)
public/llms-full.txt             → AI discoverability (detailed, ~3000 tokens)
public/openapi.json              → OpenAPI 3.1 spec
```

## Database Tables

- `api_keys` — key, email, plan, usage counters, overage_rate, Stripe IDs, notification flags
- `usage_logs` — per-request logging with cached and credited booleans
- `validation_cache` — cached URL results (1hr TTL, keyed by SHA256)

## API Authentication

Support TWO auth methods (like ScreenshotOne):
1. `x-api-key` header
2. `access_key` query parameter

API key format: `sc_live_` + 32 random hex chars.

## API Supports Both GET and POST

```
GET  /api/v1/validate?url=https://example.com&access_key=YOUR_KEY
POST /api/v1/validate  (body: { "url": "..." } or { "jsonld": {...} })
```

## Core Validation Flow

1. Receive URL or raw JSON-LD (via GET params or POST body)
2. If URL: check `validation_cache` by SHA256 → return cached if fresh (no credit consumed)
3. If URL: fetch HTML with node-fetch (10s timeout), parse with cheerio
4. Extract all `<script type="application/ld+json">` blocks
5. For each JSON-LD block:
   a. Identify `@type` → load matching rule file from `src/data/schema-rules/`
   b. Validate required + recommended properties per Google's current specs
   c. Check rich result eligibility
   d. Generate fix suggestions with Google docs links
6. Cache result (1hr), log usage, return response

## Billing Rules (from ScreenshotOne playbook)

- Only successful validations consume credits
- Cached results are FREE (credited=false in usage_logs)
- 400/401/429 errors do NOT consume credits
- Paid plans allow overage at per-extra rate (no hard cutoff)
- Free plan has hard limit at 100 (return 429 with upgrade message)
- Email alerts at 90% and 100% usage
- Annual billing = 2 months free

## Pricing

| Plan | Requests/mo | Price | Per Extra | Rate Limit |
|------|------------|-------|-----------|------------|
| free | 100 | $0 | — | 10 req/min |
| basic | 3,000 | $19/mo | $0.008 | 30 req/min |
| growth | 15,000 | $79/mo | $0.005 | 60 req/min |
| scale | 75,000 | $199/mo | $0.003 | 120 req/min |

## Validation Rules

Each schema type has a JSON config in `src/data/schema-rules/` with:
- `required_properties` — missing = error
- `recommended_properties` — missing = warning
- `rich_result_required` flag on properties needed for Google rich results
- `deprecated` flag for retired types

Tier 1 types (MVP): Article, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, FAQPage.

## Error Response Format

All errors follow ScreenshotOne's pattern:
```json
{ "error": { "code": "invalid_api_key", "message": "Human-readable message" } }
```

## Important Rules

- NEVER use Puppeteer or any headless browser. JSON-LD is in HTML source.
- NEVER use `any` type in TypeScript.
- Support both GET and POST on /api/v1/validate.
- Support auth via header AND query parameter.
- All error responses use {"error": {"code": "...", "message": "..."}} format.
- Cached results must NOT consume credits.
- Failed requests (400 errors) must NOT consume credits.
- Vercel timeout is 30s — set fetch timeout to 10s, total request timeout to 25s.
- Follow redirects up to 5 hops when fetching URLs.
- Handle @graph arrays by flattening into individual schema objects.
- For unknown @type values: validate basic JSON-LD structure, return partial result.
- Every docs/SDK/use-case/comparison page must have unique SEO meta tags.
- Add Schema.org structured data to our own pages (eat our own dog food).

## Deprecated Google Rich Result Types (2024-2026)

Flag with deprecation warnings:
- HowTo (retired 2024), FAQPage (restricted to gov/health 2024)
- SpecialAnnouncement, Course Info, Claim Review, Learning Video, Vehicle Listing (all retired 2025)

## SEO Page Strategy (from ScreenshotOne)

Every SDK, integration, use case, and comparison gets its own indexable page:
- /docs/code-examples/javascript → "JavaScript Schema Validation API"
- /docs/code-examples/python → "Python Schema Validation API"
- /use-cases/seo-audit → "Schema Validation for SEO Audits"
- /use-cases/ai-agents → "Schema Validation for AI Agents"
- /comparisons/google-rich-results-test-alternative → "vs Google Rich Results Test"

## Testing

Vitest. Test files in `tests/`. Key scenarios:
- Extraction: multi-schema, @graph arrays, invalid JSON, non-HTML responses
- Validation: required props, type checks, nested objects, deprecated types
- Rich results: eligibility logic, deprecated type flagging
- API: GET and POST, both auth methods, credit tracking, caching behavior
- Middleware: auth via header vs query param, overage for paid vs hard limit for free

## When Compacting

Always preserve: validation flow, schema type list, deprecated types, database tables, pricing tiers, billing rules (cached=free, errors=free), and that we support both GET and POST with two auth methods.

## Reference Docs

- Full PRD: see `docs/PRD-v2.md`
- ScreenshotOne (our model): https://screenshotone.com
- Google structured data docs: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- Schema.org types: https://schema.org/docs/full.html
- MCP SDK: https://github.com/modelcontextprotocol/typescript-sdk
- llms.txt standard: https://llmstxt.org
