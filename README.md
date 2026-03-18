# SchemaCheck

**Schema markup validation API for developers and AI agents.**

Validate Schema.org JSON-LD structured data in a single API call. Get errors,
warnings, rich result eligibility, and fix suggestions — programmatically.

[![npm](https://img.shields.io/npm/v/schemacheck-mcp)](https://www.npmjs.com/package/schemacheck-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()
[![API Status](https://img.shields.io/badge/status-live-brightgreen)](https://www.schemacheck.dev)

---

## Why SchemaCheck?

Google's Rich Results Test is a browser tool — no API, no batch processing, no automation.
SchemaCheck exposes the same validation logic as a REST API.

| | SchemaCheck | Google Rich Results Test |
|---|---|---|
| API access | ✅ | ❌ |
| Batch validation | ✅ | ❌ |
| Raw JSON-LD input | ✅ | ❌ |
| Fix suggestions | ✅ | Limited |
| CI/CD integration | ✅ | ❌ |
| 35+ schema types | ✅ | ✅ |
| Free tier | 100/mo | Unlimited (manual) |

---

## Features

**Validation**
- Validate any URL — SchemaCheck fetches the page and extracts all JSON-LD blocks automatically
- Validate raw JSON-LD objects directly without deploying to a live URL
- Validate multiple schemas in one call — all `<script type="application/ld+json">` blocks and `@graph` arrays are checked in a single request

**Rich Result Eligibility**
- Per-schema rich result eligibility check against Google's current requirements
- Human-readable eligibility reason (`"Missing required property: author"`)
- Links directly to Google's documentation for each schema type

**Error & Warning Detail**
- Property-level errors for missing required fields
- Warnings for missing recommended properties that improve performance
- Specific fix suggestions for every issue (`"Add a 'datePublished' property with an ISO 8601 date string"`)
- Deprecated type detection — flags HowTo (retired Aug 2024), FAQPage (restricted 2024), and others

**Scoring**
- Validation score 0–100 per schema and as a composite across the full page
- Useful for tracking structured data health over time or across a content library

**Performance**
- JSON-LD input returns in under 50ms
- URL validation typically 1–3 seconds (includes live page fetch)
- URL results cached for 1 hour by SHA-256 hash — repeat requests are free and instant
- Cached results never consume credits

**Authentication**
- Header-based: `x-api-key: YOUR_KEY` (recommended for server-side)
- Query param: `?access_key=YOUR_KEY` (useful for quick testing)

---

## Quick Start

```bash
# Validate a live URL
curl "https://www.schemacheck.dev/api/v1/validate?url=https://example.com" \
  -H "x-api-key: YOUR_KEY"

# Validate raw JSON-LD
curl -X POST "https://www.schemacheck.dev/api/v1/validate" \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonld": {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "My Article",
      "author": {"@type": "Person", "name": "Jane Doe"},
      "datePublished": "2024-01-15"
    }
  }'
```

**Example response:**
```json
{
  "schemas_found": 1,
  "validation_score": 82,
  "rich_result_eligible": true,
  "cached": false,
  "credits_used": 1,
  "schemas": [
    {
      "@type": "Article",
      "rich_result_eligible": true,
      "rich_result_type": "Article rich result",
      "errors": [],
      "warnings": [
        {
          "property": "image",
          "message": "Recommended property missing",
          "fix": "Add an 'image' property with a URL to the article's featured image",
          "google_docs_url": "https://developers.google.com/search/docs/appearance/structured-data/article"
        }
      ],
      "validation_score": 82
    }
  ]
}
```

**Get a free API key (100 validations/month, no card):**
→ https://www.schemacheck.dev

---

## Code Examples

**JavaScript**
```javascript
const res = await fetch("https://www.schemacheck.dev/api/v1/validate", {
  method: "POST",
  headers: { "x-api-key": "YOUR_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://example.com/product" }),
});
const data = await res.json();
console.log(data.rich_result_eligible); // true or false
console.log(data.schemas[0].errors);    // array of issues
```

**Python**
```python
import requests

data = requests.post(
    "https://www.schemacheck.dev/api/v1/validate",
    headers={"x-api-key": "YOUR_KEY"},
    json={"url": "https://example.com/article"},
).json()

print(data["validation_score"])
print(data["schemas"][0]["errors"])
```

---

## For AI Agents — MCP Server

Add to your Claude Desktop, Cursor, Windsurf, or VS Code config:

```json
{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": { "SCHEMACHECK_API_KEY": "YOUR_KEY" }
    }
  }
}
```

**MCP tools available:**
- `validate_schema` — validate a URL or raw JSON-LD object, returns full validation result
- `list_supported_types` — list all 35+ supported schema types with tier, required properties, and Google docs URLs

---

## Supported Schema Types (35+)

### Tier 1 — Full validation
Article, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, FAQPage

### Tier 2 — Standard validation
Review / AggregateRating, Recipe, Event, VideoObject, SoftwareApplication, JobPosting, Course, ItemList, QAPage, ProductGroup

### Tier 3 — Basic validation
Book, Dataset, DiscussionForumPosting, EmployerAggregateRating, Movie, ImageObject, ProfilePage, MerchantReturnPolicy, OfferShippingDetails, ClaimReview

### Tier 4 — Structure validation
MathSolver, Quiz, LoyaltyProgram, VacationRental, CreativeWork

### Deprecated (validated with warnings)
HowTo (retired Aug 2024), SpecialAnnouncement (2025), Vehicle/Car (2025)

Unknown types are validated for basic JSON-LD structure and are never charged credits.

Full list with required properties: https://www.schemacheck.dev/schema-types

---

## API Reference

### `GET /api/v1/validate?url={url}`
Fetch a live URL, extract its JSON-LD, and validate it. Cached for 1 hour.

### `POST /api/v1/validate`
Validate a URL or raw JSON-LD object. Body: `{ "url": "..." }` or `{ "jsonld": {...} }`.

### `GET /api/v1/types`
Returns all supported schema types with tier, required/recommended properties, and Google docs URLs. No authentication required.

Full reference: https://www.schemacheck.dev/docs

---

## Documentation

- [Quickstart](https://www.schemacheck.dev/docs/quickstart)
- [Authentication](https://www.schemacheck.dev/docs/authentication)
- [MCP Server](https://www.schemacheck.dev/docs/mcp)
- [Error Reference](https://www.schemacheck.dev/docs/errors)
- [OpenAPI Spec](https://www.schemacheck.dev/openapi.json)
- [35+ Supported Schema Types](https://www.schemacheck.dev/schema-types)

---

## Pricing

| Plan | Price | Validations/mo | Overage |
|------|-------|----------------|---------|
| Free | $0 | 100 | None |
| Basic | $19/mo | 3,000 | $0.008/validation |
| Growth | $79/mo | 15,000 | $0.005/validation |
| Scale | $199/mo | 75,000 | $0.003/validation |

- No credit card for free tier
- Credits only consumed on successful 200 responses from live computation
- Cached results and error responses never consume credits
- 30-day no-questions refund on all paid plans
