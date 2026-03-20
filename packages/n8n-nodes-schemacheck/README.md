# n8n-nodes-schemacheck

An n8n community node for [SchemaCheck](https://www.schemacheck.dev) — validate JSON-LD schema markup, check rich result eligibility, and manage recurring monitors directly from your n8n workflows.

## Installation

In your n8n instance, go to **Settings → Community Nodes → Install** and enter:

```
n8n-nodes-schemacheck
```

Or install manually:

```bash
npm install n8n-nodes-schemacheck
```

## Credentials

Create a **SchemaCheck API** credential and paste your API key. Get a free key at [schemacheck.dev](https://www.schemacheck.dev/dashboard).

## Operations

### Validate URL

Fetches a live page and validates all schema markup found on it.

- **Input:** Page URL
- **Returns:** `schemas_found`, per-schema `errors`, `warnings`, `rich_result_eligible`, fix suggestions, and a `summary.score`

### Validate JSON-LD

Validates a raw JSON-LD object without fetching any URL. Useful for validating schema you generate inside n8n before publishing.

- **Input:** JSON-LD object
- **Returns:** Same shape as Validate URL — `errors`, `warnings`, `rich_result_eligible`, fix suggestions

### Batch Validate

Validates schema markup on multiple URLs in a single call.

- **Input:** Comma-separated list of URLs
- **Returns:** Array of per-URL validation results with a combined summary

### List Monitors

Retrieves all active schema monitors associated with your account.

- **Input:** None
- **Returns:** Array of monitor objects with `id`, `url`, `frequency`, `last_checked`, and `last_score`

### Create Monitor

Creates a new recurring schema monitor that checks a URL on a schedule and alerts you when errors appear.

- **Input:** URL, check frequency (`daily` | `weekly` | `monthly`)
- **Returns:** The created monitor object including its `id`

### Delete Monitor

Permanently removes a schema monitor.

- **Input:** Monitor ID
- **Returns:** Confirmation of deletion

## Example Workflows

### 1. WordPress publish — validate — Slack alert on errors

Automatically validate schema every time you publish a new post, and get a Slack message if anything is broken.

```
WordPress Trigger (On Post Published)
  → SchemaCheck: Validate URL  [url = {{ $json.link }}]
  → IF: {{ $json.summary.score < 80 OR $json.schemas[0].errors.length > 0 }}
    → Slack: Send Message  [channel = #seo-alerts, text = "Schema errors on {{ $json.url }}: {{ $json.schemas[0].errors | join(', ') }}"]
```

**Why it helps:** Catches structured data regressions the moment a post goes live, before Google re-crawls the page.

---

### 2. Weekly sitemap audit — batch validate — results to Google Sheets

Pull all URLs from your sitemap every week, batch-validate their schema, and log the scores to a spreadsheet for trend tracking.

```
Schedule Trigger (Every Monday 09:00)
  → HTTP Request: GET https://your-site.com/sitemap.xml
  → XML: Parse sitemap  [extract all <loc> values]
  → Code: Build comma-separated URL list
  → SchemaCheck: Batch Validate  [urls = {{ $json.urlList }}]
  → Split Out: Split results array into individual items
  → Google Sheets: Append Row  [columns: url, score, errors_count, checked_at]
```

**Why it helps:** Gives you a historical audit trail so you can spot when a template change broke schema across a whole page type.

---

### 3. Monitor alert webhook — format message — Slack

When SchemaCheck detects an error on a monitored page, receive the webhook and post a formatted Slack alert.

```
Webhook Trigger  [path = /schemacheck-alert]
  → Code: Format message
      "Schema error on {{ $json.url }}\n
       Score: {{ $json.score }}/100\n
       Errors: {{ $json.errors.map(e => e.message).join('\n') }}"
  → Slack: Send Message  [channel = #seo-alerts, text = {{ $json.formattedMessage }}]
```

**Why it helps:** Turns passive monitoring into an active alert without polling — you only get notified when something actually breaks.

## Resources

- [SchemaCheck API Docs](https://www.schemacheck.dev/docs)
- [Authentication](https://www.schemacheck.dev/docs/authentication)
- [API Parameters & Response](https://www.schemacheck.dev/docs/options)
- [Error Codes](https://www.schemacheck.dev/docs/errors)

## License

MIT
