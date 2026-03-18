# schemacheck-mcp

MCP server for [SchemaCheck](https://schemacheck.dev) — validate Schema.org structured data (JSON-LD) directly from Claude, Cursor, VS Code, Windsurf, and any other MCP-compatible AI tool.

## What it does

Adds a single `validate_schema` tool to your AI assistant. Give it a URL or a raw JSON-LD object and it returns:

- Errors (missing required properties, malformed values)
- Warnings (missing recommended properties)
- Rich result eligibility for Google Search
- Per-error fix suggestions with links to Google's documentation
- A 0–100 health score

## Requirements

- Node.js 18+
- A SchemaCheck API key — [get one free at schemacheck.dev](https://schemacheck.dev/docs/getting-started) (100 validations/month, no credit card)

## Setup

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "sc_live_YOUR_KEY_HERE"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see `validate_schema` available in the tool list.

---

### Cursor

Edit `~/.cursor/mcp.json` (create it if it doesn't exist):

```json
{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "sc_live_YOUR_KEY_HERE"
      }
    }
  }
}
```

Restart Cursor. The `validate_schema` tool will be available in Cursor's AI chat and Composer.

---

### VS Code (GitHub Copilot)

1. Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
2. Search for **MCP** or navigate to **Extensions → GitHub Copilot → MCP Servers**
3. Click **Edit in settings.json** and add:

```json
{
  "github.copilot.mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "sc_live_YOUR_KEY_HERE"
      }
    }
  }
}
```

Alternatively, add it to `.vscode/mcp.json` in your project root for team-shared config:

```json
{
  "servers": {
    "schemacheck": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "sc_live_YOUR_KEY_HERE"
      }
    }
  }
}
```

---

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json` (create it if it doesn't exist):

```json
{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "sc_live_YOUR_KEY_HERE"
      }
    }
  }
}
```

Restart Windsurf. The tool will appear in Cascade's tool list.

---

## Tool reference

### `validate_schema`

Validate Schema.org structured data on a live URL or as raw JSON-LD.

**Inputs** (provide one):

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | URL of the page to validate. The page must be publicly accessible. |
| `jsonld` | object | Raw JSON-LD schema object to validate without fetching a URL. |

**Example prompts:**

> "Validate the schema markup on https://example.com/product/my-widget"

> "Check if this JSON-LD is valid for Google rich results: `{"@context":"https://schema.org","@type":"Product","name":"Widget"}`"

> "Audit the structured data on these three URLs and tell me which ones have errors"

**Response fields:**

- `schemas[]` — one entry per JSON-LD block found on the page
  - `type` — schema type (Article, Product, etc.)
  - `errors[]` — required properties missing or malformed; each includes `property`, `message`, `fix`, `docs_url`
  - `warnings[]` — recommended properties missing
  - `rich_result_eligible` — whether this schema type qualifies for enhanced Google Search results
  - `properties_missing_required[]` — quick list for programmatic checks
- `summary` — aggregate stats: `score` (0–100), `total_errors`, `rich_result_eligible`
- `meta` — `cached`, `credits_used`, `response_time_ms`

## Local development

```bash
cd mcp-server
npm install
npm run build
SCHEMACHECK_API_KEY=sc_live_... node dist/index.js
```

The server communicates over stdio and will output `[schemacheck-mcp] Server running on stdio` to stderr when ready.

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SCHEMACHECK_API_KEY` | Yes | — | Your SchemaCheck API key |
| `SCHEMACHECK_API_BASE` | No | `https://schemacheck.dev/api/v1` | Override the API base URL (useful for self-hosted or staging) |

## Links

- [SchemaCheck API docs](https://schemacheck.dev/docs)
- [Quickstart](https://schemacheck.dev/docs/getting-started)
- [Error code reference](https://schemacheck.dev/docs/errors)
- [Supported schema types](https://schemacheck.dev/docs/options)
