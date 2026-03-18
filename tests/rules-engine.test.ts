import { describe, it, expect } from "vitest";
import { validateSchema } from "@/lib/validator/rules-engine";

// ============================================================
// Article — core behaviour
// ============================================================

describe("validateSchema — Article", () => {
  const baseArticle = {
    "@context":    "https://schema.org",
    "@type":       "Article",
    headline:      "My Article",
    author:        { "@type": "Person", name: "Jane Doe" },
    datePublished: "2026-03-18",
    image:         "https://example.com/photo.jpg",
  };

  it("returns valid=true when all required properties present", () => {
    const result = validateSchema(baseArticle);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.type).toBe("Article");
  });

  it("returns error when headline is missing", () => {
    const { headline: _h, ...schema } = baseArticle;
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    const error = result.errors.find((e) => e.property === "headline");
    expect(error).toBeDefined();
    expect(error?.severity).toBe("error");
  });

  it("returns error when author is missing", () => {
    const { author: _a, ...schema } = baseArticle;
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "author");
    expect(error).toBeDefined();
  });

  it("returns rich_result_eligible=true when all rich result props present", () => {
    const result = validateSchema(baseArticle);
    expect(result.rich_result_eligible).toBe(true);
  });

  it("returns rich_result_eligible=false when image missing", () => {
    const { image: _i, ...schema } = baseArticle;
    const result = validateSchema(schema);
    expect(result.rich_result_eligible).toBe(false);
  });

  it("returns warnings for missing recommended properties", () => {
    const result = validateSchema(baseArticle);
    // dateModified is recommended — should be flagged
    const warning = result.warnings.find((w) => w.property === "dateModified");
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe("warning");
  });

  it("includes fix suggestions with each error", () => {
    const { headline: _h, ...schema } = baseArticle;
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "headline");
    expect(error?.fix).toBeTruthy();
    expect(error?.google_docs_url).toContain("developers.google.com");
  });
});

// ============================================================
// Article — string type validation (max_length)
// ============================================================

describe("validateSchema — Article string type checks", () => {
  it("returns error when headline exceeds 110 characters", () => {
    const longHeadline = "A".repeat(111);
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      longHeadline,
      author:        { "@type": "Person", name: "Jane Doe" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "headline");
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/110/);
  });

  it("accepts a headline at exactly 110 characters", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "A".repeat(110),
      author:        { "@type": "Person", name: "Jane Doe" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "headline");
    expect(error).toBeUndefined();
  });

  it("returns error when headline is not a string", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      42,
      author:        { "@type": "Person", name: "Jane Doe" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "headline");
    expect(error).toBeDefined();
  });
});

// ============================================================
// Article — date type validation (ISO 8601)
// ============================================================

describe("validateSchema — Article date type checks", () => {
  it("accepts a valid ISO 8601 date (YYYY-MM-DD)", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane Doe" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "datePublished");
    expect(error).toBeUndefined();
  });

  it("accepts a valid ISO 8601 datetime with timezone", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane Doe" },
      datePublished: "2026-03-18T09:30:00Z",
    };
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "datePublished");
    expect(error).toBeUndefined();
  });

  it("returns error for an invalid date format (e.g. MM/DD/YYYY)", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane Doe" },
      datePublished: "03/18/2026",
    };
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "datePublished");
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/ISO 8601/);
  });

  it("returns error for a plain year string", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane Doe" },
      datePublished: "2026",
    };
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "datePublished");
    expect(error).toBeDefined();
  });
});

// ============================================================
// Article — URL type validation
// ============================================================

describe("validateSchema — Article URL type checks", () => {
  it("accepts an absolute https:// image URL without producing a URL warning", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane" },
      datePublished: "2026-03-18",
      image:         "https://example.com/photo.jpg",
    };
    const result = validateSchema(schema);
    // No warning about the image URL being invalid
    const urlWarn = result.warnings.find(
      (w) => w.property === "image" && w.message.includes("absolute URL"),
    );
    expect(urlWarn).toBeUndefined();
  });

  it("returns warning when image URL is a relative path", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane" },
      datePublished: "2026-03-18",
      image:         "/images/photo.jpg",
    };
    const result = validateSchema(schema);
    // image is recommended — type error produces a warning
    const warn = result.warnings.find((w) => w.property === "image");
    expect(warn).toBeDefined();
    expect(warn?.message).toMatch(/absolute URL/);
  });

  it("accepts an ImageObject in place of a URL string", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane" },
      datePublished: "2026-03-18",
      image:         { "@type": "ImageObject", url: "https://example.com/img.jpg", width: 1200, height: 630 },
    };
    const result = validateSchema(schema);
    const urlWarn = result.warnings.find(
      (w) => w.property === "image" && w.message.includes("absolute URL"),
    );
    expect(urlWarn).toBeUndefined();
  });
});

// ============================================================
// Article — also_matches (NewsArticle / BlogPosting → Article rules)
// ============================================================

describe("validateSchema — also_matches aliasing", () => {
  it("validates NewsArticle using Article rules", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "NewsArticle",
      headline:      "Breaking News",
      author:        { "@type": "Person", name: "Reporter" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    // Should resolve to Article rules — type echoed as-is
    expect(result.type).toBe("NewsArticle");
    // headline/author/datePublished are all present → valid
    expect(result.valid).toBe(true);
    // image missing → rich result not eligible
    expect(result.rich_result_eligible).toBe(false);
  });

  it("validates BlogPosting using Article rules", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "BlogPosting",
      headline:      "My Blog Post",
      author:        { "@type": "Person", name: "Blogger" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    expect(result.type).toBe("BlogPosting");
    expect(result.valid).toBe(true);
  });

  it("returns error when NewsArticle headline is missing (same as Article)", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "NewsArticle",
      author:        { "@type": "Person", name: "Reporter" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    const error = result.errors.find((e) => e.property === "headline");
    expect(error).toBeDefined();
  });

  it("returns error when NewsArticle headline exceeds 110 characters (same as Article)", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "NewsArticle",
      headline:      "X".repeat(115),
      author:        { "@type": "Person", name: "Reporter" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    const error = result.errors.find((e) => e.property === "headline");
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/110/);
  });
});

// ============================================================
// Article — nested object warnings
// ============================================================

describe("validateSchema — nested object property warnings", () => {
  it("warns about missing url on author object", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane Doe" }, // url is missing
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    const warn = result.warnings.find((w) => w.property === "author.url");
    expect(warn).toBeDefined();
    expect(warn?.severity).toBe("warning");
  });

  it("does not warn about nested url when it is present on author", () => {
    const schema = {
      "@context":    "https://schema.org",
      "@type":       "Article",
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane Doe", url: "https://example.com/jane" },
      datePublished: "2026-03-18",
    };
    const result = validateSchema(schema);
    const warn = result.warnings.find((w) => w.property === "author.url");
    expect(warn).toBeUndefined();
  });
});

// ============================================================
// Deprecated types
// ============================================================

describe("validateSchema — deprecated types", () => {
  it("flags HowTo as deprecated", () => {
    const schema = { "@context": "https://schema.org", "@type": "HowTo", name: "Test" };
    const result = validateSchema(schema);
    expect(result.deprecated).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.rich_result_eligible).toBe(false);
  });

  it("flags SpecialAnnouncement as deprecated", () => {
    const schema = { "@context": "https://schema.org", "@type": "SpecialAnnouncement", name: "Test" };
    const result = validateSchema(schema);
    expect(result.deprecated).toBe(true);
  });
});

// ============================================================
// Unknown types
// ============================================================

describe("validateSchema — unknown types", () => {
  it("returns partial result with info warning for unknown @type", () => {
    const schema = { "@context": "https://schema.org", "@type": "UnknownCustomType", name: "Test" };
    const result = validateSchema(schema);
    expect(result.valid).toBe(true);
    expect(result.rich_result_eligible).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].severity).toBe("info");
  });
});

// ============================================================
// Product
// ============================================================

describe("validateSchema — Product", () => {
  it("validates required properties for Product", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type":    "Product",
      name:       "Acme Widget",
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(true); // name is the only required prop
    // image + offers are needed for rich results
    expect(result.rich_result_eligible).toBe(false);
  });

  it("is rich_result_eligible when name, image, and offers are present", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type":    "Product",
      name:       "Acme Widget",
      image:      "https://example.com/widget.jpg",
      offers:     { "@type": "Offer", price: "9.99", priceCurrency: "USD" },
    };
    const result = validateSchema(schema);
    expect(result.rich_result_eligible).toBe(true);
  });
});

// ============================================================
// LocalBusiness — also_matches for common subtypes
// ============================================================

describe("validateSchema — LocalBusiness also_matches", () => {
  it("validates Restaurant using LocalBusiness rules", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type":    "Restaurant",
      name:       "Mario's Bistro",
      address:    { "@type": "PostalAddress", streetAddress: "123 Main St", addressLocality: "Springfield" },
    };
    const result = validateSchema(schema);
    expect(result.type).toBe("Restaurant");
    expect(result.valid).toBe(true);
    expect(result.rich_result_eligible).toBe(true);
  });
});

// ============================================================
// FAQPage — deprecation note
// ============================================================

describe("validateSchema — FAQPage deprecation note", () => {
  it("adds deprecation warning for FAQPage but does not mark deprecated=true", () => {
    const schema = {
      "@context":  "https://schema.org",
      "@type":     "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } },
      ],
    };
    const result = validateSchema(schema);
    expect(result.deprecated).toBe(false); // not fully deprecated
    const warning = result.warnings.find((w) => w.property === "@type");
    expect(warning).toBeDefined();
  });

  it("is rich_result_eligible when mainEntity is a non-empty array", () => {
    const schema = {
      "@context":  "https://schema.org",
      "@type":     "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } },
      ],
    };
    const result = validateSchema(schema);
    expect(result.rich_result_eligible).toBe(true);
  });

  it("is not rich_result_eligible when mainEntity is an empty array", () => {
    const schema = {
      "@context":  "https://schema.org",
      "@type":     "FAQPage",
      mainEntity:  [],
    };
    const result = validateSchema(schema);
    // empty array fails array type check + fails rich result check
    expect(result.rich_result_eligible).toBe(false);
  });
});
