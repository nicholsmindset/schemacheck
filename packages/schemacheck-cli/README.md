# schemacheck-cli

Command-line tool for validating schema markup (JSON-LD / structured data) via the [SchemaCheck](https://www.schemacheck.dev) API.

## Install

```bash
# Run without installing (recommended)
npx schemacheck-cli <command>

# Or install globally
npm install -g schemacheck-cli
```

## Quick Start

```bash
export SCHEMACHECK_API_KEY=your_api_key_here

# Validate a live URL
schemacheck validate https://example.com

# Validate a local JSON-LD file
schemacheck validate --file ./schema.json

# Validate multiple URLs from a file
schemacheck batch urls.txt
```

## Authentication

Every command requires an API key. Provide it in one of two ways:

| Method | Example |
|--------|---------|
| Environment variable | `SCHEMACHECK_API_KEY=sk_...` |
| Flag | `--api-key sk_...` |

The `--api-key` flag takes precedence over the environment variable.

Get an API key at [schemacheck.dev](https://www.schemacheck.dev).

---

## Commands

### `schemacheck validate <url>`

Validate schema markup on a live URL.

```bash
schemacheck validate https://example.com
schemacheck validate https://example.com/blog/post --format summary
schemacheck validate https://example.com --fail-on-errors --min-score 80
```

### `schemacheck validate --file <path>`

Validate a local JSON-LD file directly (no crawling required).

```bash
schemacheck validate --file ./structured-data.json
schemacheck validate --file ./schema.jsonld --format json
```

The file must contain valid JSON. Both single objects and arrays are accepted.

### `schemacheck batch <urls-file>`

Validate a list of URLs in one request. The file should contain one URL per line; blank lines and lines starting with `#` are ignored.

```bash
# urls.txt
# Homepage
https://example.com
https://example.com/about
https://example.com/blog/post-1
```

```bash
schemacheck batch urls.txt
schemacheck batch urls.txt --format summary --fail-on-errors
```

---

## Flags

All flags work with every command.

| Flag | Default | Description |
|------|---------|-------------|
| `--api-key <key>` | env var | SchemaCheck API key |
| `--format <format>` | `table` | Output format: `table`, `summary`, or `json` |
| `--fail-on-errors` | off | Exit code 1 if any schema errors are found |
| `--fail-on-warnings` | off | Exit code 1 if any schema warnings are found |
| `--min-score <n>` | none | Exit code 1 if the score is below this threshold |

---

## Output Formats

### `table` (default)

Full breakdown per schema type:

```
✓ SchemaCheck — https://example.com
Score: 87/100

  Article (valid ✓, rich result eligible ✓)
    No errors
    ⚠ Missing recommended: author

  Organization (valid ✓, rich result eligible ✓)
    No errors
    No warnings
```

### `summary`

One line per URL — ideal for batch runs and CI logs:

```
✓ https://example.com — Score: 87 | 2 schemas | 0 errors | 1 warning
```

### `json`

Raw JSON response from the API — pipe into `jq` or save for downstream processing:

```bash
schemacheck validate https://example.com --format json | jq '.score'
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Validation succeeded (within your thresholds) |
| `1` | Validation failed, or a flag threshold was exceeded |

Use exit codes to fail CI pipelines automatically.

---

## CI/CD Usage

### GitHub Actions

```yaml
name: Schema Validation

on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate production schema
        env:
          SCHEMACHECK_API_KEY: ${{ secrets.SCHEMACHECK_API_KEY }}
        run: |
          npx schemacheck-cli validate https://example.com \
            --fail-on-errors \
            --min-score 75 \
            --format summary

      - name: Batch validate key pages
        env:
          SCHEMACHECK_API_KEY: ${{ secrets.SCHEMACHECK_API_KEY }}
        run: |
          npx schemacheck-cli batch urls.txt \
            --fail-on-errors \
            --format summary
```

Add `SCHEMACHECK_API_KEY` as a repository secret in **Settings > Secrets and variables > Actions**.

### Validate on Deploy (Vercel / Netlify)

Run validation as a post-deploy health check by adding it to your deploy script:

```bash
#!/bin/bash
set -e

# Deploy...
vercel --prod

# Validate schema on the live site
npx schemacheck-cli validate https://example.com \
  --fail-on-errors \
  --min-score 80
```

---

## Local JSON-LD Testing Workflow

Generate or edit structured data locally and validate before pushing:

```bash
# 1. Create your JSON-LD
cat > schema.json << 'EOF'
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "My Article Title",
  "author": { "@type": "Person", "name": "Jane Doe" },
  "datePublished": "2025-01-01"
}
EOF

# 2. Validate
schemacheck validate --file schema.json --fail-on-errors
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SCHEMACHECK_API_KEY` | API key (can be overridden with `--api-key`) |
| `NO_COLOR` | Set to any value to disable colored output |
| `TERM=dumb` | Also disables colored output |

---

## Requirements

- Node.js 18 or later
- A SchemaCheck API key
