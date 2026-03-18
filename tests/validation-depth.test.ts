import { describe, it, expect } from "vitest";
import { validateSchema } from "@/lib/validator/schema-rules";

// ──────────────────────────────────────────────────────────────
// Helper — minimal schema objects per type
// ──────────────────────────────────────────────────────────────
function schema(type: string, extra: Record<string, unknown> = {}) {
  return { "@context": "https://schema.org", "@type": type, ...extra };
}

// ──────────────────────────────────────────────────────────────
// Tier 1 — validation_depth: "full"
// ──────────────────────────────────────────────────────────────
describe("validation_depth — Tier 1 (full)", () => {
  const tier1Types = ["Article", "Product", "LocalBusiness", "Organization", "BreadcrumbList", "WebSite", "FAQPage"];

  for (const type of tier1Types) {
    it(`${type} has validation_depth "full"`, () => {
      const result = validateSchema(schema(type));
      expect(result.validation_depth).toBe("full");
    });
  }

  it("NewsArticle (also_matches Article) has validation_depth 'full'", () => {
    // NewsArticle has its own rule file with validation_depth: "full"
    const result = validateSchema(schema("NewsArticle", { headline: "Test" }));
    expect(result.validation_depth).toBe("full");
  });

  it("BlogPosting (also_matches Article) has validation_depth 'full'", () => {
    const result = validateSchema(schema("BlogPosting", { headline: "Test" }));
    expect(result.validation_depth).toBe("full");
  });

  it("Restaurant (also_matches LocalBusiness) resolves to full depth", () => {
    const result = validateSchema(schema("Restaurant", { name: "Mario's" }));
    expect(result.validation_depth).toBe("full");
  });
});

// ──────────────────────────────────────────────────────────────
// Tier 2 — validation_depth: "standard"
// ──────────────────────────────────────────────────────────────
describe("validation_depth — Tier 2 (standard)", () => {
  const tier2Types = [
    "Review",
    "Recipe",
    "Event",
    "VideoObject",
    "SoftwareApplication",
    "JobPosting",
    "Course",
    "ItemList",
    "QAPage",
    "ProductGroup",
  ];

  for (const type of tier2Types) {
    it(`${type} has validation_depth "standard"`, () => {
      const result = validateSchema(schema(type));
      expect(result.validation_depth).toBe("standard");
    });
  }

  it("AggregateRating (also_matches Review) has validation_depth 'standard'", () => {
    const result = validateSchema(schema("AggregateRating"));
    expect(result.validation_depth).toBe("standard");
  });

  it("MusicEvent (also_matches Event) has validation_depth 'standard'", () => {
    const result = validateSchema(schema("MusicEvent"));
    expect(result.validation_depth).toBe("standard");
  });

  it("WebApplication (also_matches SoftwareApplication) has validation_depth 'standard'", () => {
    const result = validateSchema(schema("WebApplication"));
    expect(result.validation_depth).toBe("standard");
  });
});

// ──────────────────────────────────────────────────────────────
// Tier 3 — validation_depth: "basic"
// ──────────────────────────────────────────────────────────────
describe("validation_depth — Tier 3 (basic)", () => {
  const tier3Types = [
    "Book",
    "Dataset",
    "DiscussionForumPosting",
    "EmployerAggregateRating",
    "Movie",
    "ImageObject",
    "ProfilePage",
    "MerchantReturnPolicy",
    "OfferShippingDetails",
    "ClaimReview",
  ];

  for (const type of tier3Types) {
    it(`${type} has validation_depth "basic"`, () => {
      const result = validateSchema(schema(type));
      expect(result.validation_depth).toBe("basic");
    });
  }

  it("ClaimReview is NOT deprecated (Tier 3, not retired)", () => {
    const result = validateSchema(schema("ClaimReview"));
    expect(result.deprecated).toBe(false);
    expect(result.validation_depth).toBe("basic");
  });

  it("Audiobook (also_matches Book) has validation_depth 'basic'", () => {
    const result = validateSchema(schema("Audiobook"));
    expect(result.validation_depth).toBe("basic");
  });
});

// ──────────────────────────────────────────────────────────────
// Tier 4 — validation_depth: "basic"
// ──────────────────────────────────────────────────────────────
describe("validation_depth — Tier 4 (basic)", () => {
  const tier4Types = ["MathSolver", "Quiz", "LoyaltyProgram", "VacationRental", "CreativeWork"];

  for (const type of tier4Types) {
    it(`${type} has validation_depth "basic"`, () => {
      const result = validateSchema(schema(type));
      expect(result.validation_depth).toBe("basic");
    });
  }
});

// ──────────────────────────────────────────────────────────────
// Deprecated types — validation_depth: "basic"
// ──────────────────────────────────────────────────────────────
describe("validation_depth — deprecated types (basic)", () => {
  it("HowTo has validation_depth 'basic' and deprecated=true", () => {
    const result = validateSchema(schema("HowTo", { name: "T" }));
    expect(result.validation_depth).toBe("basic");
    expect(result.deprecated).toBe(true);
  });

  it("SpecialAnnouncement has validation_depth 'basic' and deprecated=true", () => {
    const result = validateSchema(schema("SpecialAnnouncement", { name: "T" }));
    expect(result.validation_depth).toBe("basic");
    expect(result.deprecated).toBe(true);
  });

  it("Vehicle has validation_depth 'basic' and deprecated=true", () => {
    const result = validateSchema(schema("Vehicle", { name: "T" }));
    expect(result.validation_depth).toBe("basic");
    expect(result.deprecated).toBe(true);
  });

  it("Car (also_matches Vehicle) inherits deprecated=true", () => {
    const result = validateSchema(schema("Car", { name: "T" }));
    expect(result.deprecated).toBe(true);
    expect(result.validation_depth).toBe("basic");
  });
});

// ──────────────────────────────────────────────────────────────
// Unknown types — defaults to "basic"
// ──────────────────────────────────────────────────────────────
describe("validation_depth — unknown types", () => {
  it("unknown type has validation_depth 'basic'", () => {
    const result = validateSchema(schema("UnknownType"));
    expect(result.validation_depth).toBe("basic");
  });

  it("unknown type has deprecated=false", () => {
    const result = validateSchema(schema("CustomSchemaType"));
    expect(result.deprecated).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// validation_depth is independent of validity
// ──────────────────────────────────────────────────────────────
describe("validation_depth is always present regardless of validity", () => {
  it("invalid Article (missing headline) still has validation_depth 'full'", () => {
    const result = validateSchema(schema("Article", {
      // missing required: headline, author, datePublished, image
    }));
    expect(result.valid).toBe(false);
    expect(result.validation_depth).toBe("full");
  });

  it("invalid Recipe (missing all required) still has validation_depth 'standard'", () => {
    const result = validateSchema(schema("Recipe"));
    expect(result.valid).toBe(false);
    expect(result.validation_depth).toBe("standard");
  });

  it("invalid ClaimReview (missing required) still has validation_depth 'basic'", () => {
    const result = validateSchema(schema("ClaimReview"));
    expect(result.valid).toBe(false);
    expect(result.validation_depth).toBe("basic");
  });

  it("deprecated HowTo missing required fields has valid=false and validation_depth 'basic'", () => {
    const result = validateSchema(schema("HowTo")); // missing name and step
    expect(result.valid).toBe(false);
    expect(result.validation_depth).toBe("basic");
    expect(result.deprecated).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────
// Tier 1 validates more properties than Tier 3 (full vs basic)
// ──────────────────────────────────────────────────────────────
describe("validation depth differences across tiers", () => {
  it("Tier 1 Article produces warnings for missing recommended properties", () => {
    // All tiers check recommended properties (generate warnings for missing ones)
    const result = validateSchema(schema("Article", {
      headline:      "Test",
      author:        { "@type": "Person", name: "Jane" },
      datePublished: "2026-01-01",
      image:         "https://example.com/img.jpg",
      // missing recommended: dateModified, publisher, description, url
    }));
    expect(result.validation_depth).toBe("full");
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("Tier 3 Movie with name only is valid (required met) despite missing recommended props", () => {
    // "basic" validation_depth still checks recommended properties (produces warnings),
    // but valid=true as long as all required properties are present.
    const result = validateSchema(schema("Movie", { name: "Inception" }));
    expect(result.validation_depth).toBe("basic");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    // Warnings may exist for missing recommended properties — that's expected even at basic depth
  });
});
