import { describe, it, expect } from "vitest";
import { validate, hashUrl, validateHtml } from "@/lib/validator/index";

// Unit tests for the validator orchestrator (index.ts) without hitting network or Supabase.
// The API route itself (auth, caching, credit logic) is covered by middleware.test.ts
// and manual / integration testing.

// ============================================================
// validate() — raw JSON-LD input
// ============================================================

describe("validate — raw JSON-LD input", () => {
  it("validates a valid Article JSON-LD", async () => {
    const result = await validate({
      jsonld: {
        "@context":    "https://schema.org",
        "@type":       "Article",
        headline:      "Test Article",
        author:        { "@type": "Person", name: "Jane Doe" },
        datePublished: "2026-03-18",
        image:         "https://example.com/photo.jpg",
      },
    });

    expect(result.success).toBe(true);
    expect(result.schemas_found).toBe(1);
    expect(result.schemas[0].valid).toBe(true);
    expect(result.schemas[0].type).toBe("Article");
    expect(result.summary.total_errors).toBe(0);
  });

  it("returns errors for missing required properties", async () => {
    const result = await validate({
      jsonld: {
        "@context": "https://schema.org",
        "@type":    "Article",
        headline:   "Missing author and date",
      },
    });

    expect(result.schemas[0].valid).toBe(false);
    expect(result.summary.total_errors).toBeGreaterThan(0);
  });

  it("handles @graph arrays", async () => {
    const result = await validate({
      jsonld: {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", name: "Acme" },
          { "@type": "WebSite", name: "Acme Site", url: "https://acme.example.com" },
        ],
      },
    });

    expect(result.schemas_found).toBe(2);
  });

  it("handles array of JSON-LD objects", async () => {
    const result = await validate({
      jsonld: [
        { "@context": "https://schema.org", "@type": "Organization", name: "Org" },
        { "@context": "https://schema.org", "@type": "WebSite", name: "Site", url: "https://example.com" },
      ] as unknown as Record<string, unknown>,
    });
    expect(result.schemas_found).toBe(2);
  });

  it("returns score 0–100 in summary", async () => {
    const result = await validate({
      jsonld: {
        "@context": "https://schema.org",
        "@type":    "Article",
        headline:   "Only headline",
      },
    });
    expect(result.summary.score).toBeGreaterThanOrEqual(0);
    expect(result.summary.score).toBeLessThanOrEqual(100);
  });

  it("does not include parse_errors when there are none", async () => {
    const result = await validate({
      jsonld: { "@context": "https://schema.org", "@type": "Organization", name: "Test" },
    });
    expect(result.parse_errors).toBeUndefined();
  });
});

// ============================================================
// validate() — no schemas found
// ============================================================

describe("validate — no schemas found", () => {
  it("returns schemas_found=0 and a helpful message when jsonld has no @type", async () => {
    const result = await validate({
      // An object with no @type is not valid JSON-LD and gets filtered out
      jsonld: { "@context": "https://schema.org", name: "No type here" },
    });
    expect(result.schemas_found).toBe(0);
    expect(result.schemas).toHaveLength(0);
    expect(result.message).toBeDefined();
    expect(result.message).toContain("No JSON-LD");
  });

  it("summary has zero counts when no schemas found", async () => {
    const result = await validate({
      jsonld: { "@context": "https://schema.org", name: "No type" },
    });
    expect(result.summary.total_schemas).toBe(0);
    expect(result.summary.total_errors).toBe(0);
    expect(result.summary.score).toBe(100); // no errors → perfect score
  });

  it("does not include message when schemas are found", async () => {
    const result = await validate({
      jsonld: { "@context": "https://schema.org", "@type": "Organization", name: "Acme" },
    });
    expect(result.message).toBeUndefined();
  });
});

// ============================================================
// validate() — rich_result field propagated
// ============================================================

describe("validate — rich_result field", () => {
  it("schemas include rich_result object from enrichRichResultEligibility", async () => {
    const result = await validate({
      jsonld: {
        "@context":    "https://schema.org",
        "@type":       "Article",
        headline:      "Test",
        author:        { "@type": "Person", name: "Jane" },
        datePublished: "2026-03-18",
        image:         "https://example.com/img.jpg",
      },
    });
    expect(result.schemas[0].rich_result).toBeDefined();
    expect(result.schemas[0].rich_result?.eligible).toBe(true);
  });

  it("deprecated schemas have eligible=false in rich_result", async () => {
    const result = await validate({
      jsonld: { "@context": "https://schema.org", "@type": "HowTo", name: "Test" },
    });
    expect(result.schemas[0].rich_result?.eligible).toBe(false);
    expect(result.schemas[0].rich_result?.reason).toContain("retired");
  });
});

// ============================================================
// validateHtml()
// ============================================================

describe("validateHtml", () => {
  it("extracts and validates schemas from HTML string", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Test Corp",
            "url": "https://test.example.com",
            "logo": "https://test.example.com/logo.png"
          }
        </script>
      </head></html>
    `;
    const result = validateHtml(html);
    expect(result.schemas_found).toBe(1);
    expect(result.schemas[0].type).toBe("Organization");
  });

  it("returns schemas_found=0 and message when no JSON-LD in HTML", () => {
    const result = validateHtml("<html><body><p>No schemas.</p></body></html>");
    expect(result.schemas_found).toBe(0);
    expect(result.message).toBeDefined();
    expect(result.message).toContain("No JSON-LD");
  });

  it("captures parse_errors from malformed JSON-LD blocks", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">{ this is not valid json }</script>
        <script type="application/ld+json">
          { "@context": "https://schema.org", "@type": "Organization", "name": "Good Corp" }
        </script>
      </head></html>
    `;
    const result = validateHtml(html);
    // Parse error captured from first block
    expect(result.parse_errors).toBeDefined();
    expect(result.parse_errors!.length).toBe(1);
    // Valid second block still processed
    expect(result.schemas_found).toBe(1);
    expect(result.schemas[0].type).toBe("Organization");
  });

  it("does not include parse_errors field when all blocks parse cleanly", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          { "@context": "https://schema.org", "@type": "Organization", "name": "Clean Corp" }
        </script>
      </head></html>
    `;
    const result = validateHtml(html);
    expect(result.parse_errors).toBeUndefined();
  });
});

// ============================================================
// hashUrl()
// ============================================================

describe("hashUrl", () => {
  it("produces consistent SHA-256 hash", () => {
    const h1 = hashUrl("https://example.com/page");
    const h2 = hashUrl("https://example.com/page");
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it("normalizes trailing slashes", () => {
    const h1 = hashUrl("https://example.com/page/");
    const h2 = hashUrl("https://example.com/page");
    expect(h1).toBe(h2);
  });

  it("is case-insensitive for domain", () => {
    const h1 = hashUrl("HTTPS://EXAMPLE.COM/page");
    const h2 = hashUrl("https://example.com/page");
    expect(h1).toBe(h2);
  });

  it("produces different hashes for different URLs", () => {
    const h1 = hashUrl("https://example.com/page-1");
    const h2 = hashUrl("https://example.com/page-2");
    expect(h1).not.toBe(h2);
  });
});
