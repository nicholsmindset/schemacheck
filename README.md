# SchemaCheck

**Schema markup validation API for developers and AI agents.**

Validate Schema.org JSON-LD structured data in a single API call. Get errors,
warnings, rich result eligibility, and fix suggestions — programmatically.

[![npm](https://img.shields.io/npm/v/schemacheck-mcp)](https://www.npmjs.com/package/schemacheck-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()
[![API Status](https://img.shields.io/badge/status-live-brightgreen)](https://www.schemacheck.dev)

## Why SchemaCheck?

Google's Rich Results Test is a browser tool — no API, no batch processing, no automation.
SchemaCheck exposes the same validation logic as a REST API.

| | SchemaCheck | Google Rich Results Test |
|---|---|---|
| API access | ✅ | ❌ |
| Batch validation | ✅ | ❌ |
| Raw JSON-LD input | ✅ | ❌ |
| Fix suggestions | ✅ | Limited |
| 35+ schema types | ✅ | ✅ |
| Free tier | 100/mo | Unlimited (manual) |

## Quick Start

```bash
curl "https://www.schemacheck.dev/api/v1/validate" \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Returns: validation score, errors with fix suggestions, rich result eligibility.

**Get a free API key (100 validations/month, no card):**
→ https://www.schemacheck.dev

## For AI Agents — MCP Server

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

Works in: Claude Desktop, Cursor, Windsurf, VS Code (Cline/Continue), Zed

## Documentation

- [Quickstart](https://www.schemacheck.dev/docs/quickstart)
- [Authentication](https://www.schemacheck.dev/docs/authentication)
- [MCP Server](https://www.schemacheck.dev/docs/mcp)
- [Error Reference](https://www.schemacheck.dev/docs/errors)
- [OpenAPI Spec](https://www.schemacheck.dev/openapi.json)
- [35+ Supported Schema Types](https://www.schemacheck.dev/schema-types)

## Pricing

| Plan | Price | Validations/mo |
|------|-------|----------------|
| Free | $0 | 100 |
| Basic | $19/mo | 3,000 |
| Growth | $79/mo | 15,000 |
| Scale | $199/mo | 75,000 |

No credit card for free tier. 30-day refund on paid plans.
