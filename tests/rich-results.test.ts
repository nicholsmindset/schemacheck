import { describe, it, expect } from "vitest";
import { enrichRichResultEligibility } from "@/lib/validator/rich-results";
import { validateSchema } from "@/lib/validator/rules-engine";

// ============================================================
// Helpers
// ============================================================

function enrich(schema: object) {
  return enrichRichResultEligibility([validateSchema(schema as Record<string, unknown>)])[0];
}

const baseArticle = {
  "@context":    "https://schema.org",
  "@type":       "Article",
  headline:      "My Article",
  author:        { "@type": "Person", name: "Jane Doe" },
  datePublished: "2026-03-18",
  image:         "https://example.com/photo.jpg",
};

// ============================================================
// BreadcrumbList structural checks
// ============================================================

describe("enrichRichResultEligibility — BreadcrumbList", () => {
  it("marks BreadcrumbList ineligible when itemListElement is empty array", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [],
    });
    expect(result.rich_result_eligible).toBe(false);
  });

  it("keeps BreadcrumbList eligible when itemListElement has entries", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com" },
      ],
    });
    expect(result.rich_result_eligible).toBe(true);
    expect(result.rich_result?.eligible).toBe(true);
  });
});

// ============================================================
// Deprecated schemas — pass-through + no structural modification
// ============================================================

describe("enrichRichResultEligibility — deprecated types pass-through", () => {
  it("does not alter deprecated schemas structurally", () => {
    const result = enrich({ "@context": "https://schema.org", "@type": "HowTo", name: "Test" });
    expect(result.deprecated).toBe(true);
  });
});

// ============================================================
// rich_result field — presence and shape
// ============================================================

describe("enrichRichResultEligibility — rich_result field shape", () => {
  it("attaches rich_result object to all results", () => {
    const result = enrich(baseArticle);
    expect(result.rich_result).toBeDefined();
    expect(typeof result.rich_result?.eligible).toBe("boolean");
    expect(typeof result.rich_result?.reason).toBe("string");
    expect(result.rich_result?.reason.length).toBeGreaterThan(0);
    expect(typeof result.rich_result?.google_docs_url).toBe("string");
  });

  it("google_docs_url contains developers.google.com for known types", () => {
    const result = enrich(baseArticle);
    expect(result.rich_result?.google_docs_url).toContain("developers.google.com");
  });

  it("google_docs_url is present even for deprecated types", () => {
    const result = enrich({ "@context": "https://schema.org", "@type": "HowTo", name: "Test" });
    expect(result.rich_result?.google_docs_url).toContain("developers.google.com");
  });
});

// ============================================================
// rich_result — eligible schemas
// ============================================================

describe("enrichRichResultEligibility — eligible schemas", () => {
  it("eligible Article has eligible=true with type name in reason", () => {
    const result = enrich(baseArticle);
    expect(result.rich_result?.eligible).toBe(true);
    expect(result.rich_result?.reason).toContain("Article");
  });

  it("eligible Product (with image, full offers) has eligible=true", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "Product",
      name:       "Widget",
      image:      "https://example.com/widget.jpg",
      offers:     {
        "@type":       "Offer",
        price:         "9.99",
        priceCurrency: "USD",
        availability:  "https://schema.org/InStock",
      },
    });
    expect(result.rich_result_eligible).toBe(true);
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("eligible LocalBusiness (Restaurant alias) has eligible=true", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "Restaurant",
      name:       "Mario's Bistro",
      address:    {
        "@type":          "PostalAddress",
        streetAddress:    "123 Main St",
        addressLocality:  "Springfield",
      },
    });
    expect(result.rich_result?.eligible).toBe(true);
  });
});

// ============================================================
// rich_result — ineligible schemas
// ============================================================

describe("enrichRichResultEligibility — ineligible schemas", () => {
  it("Article missing image is ineligible with reason mentioning image", () => {
    const { image: _i, ...schema } = baseArticle;
    const result = enrich(schema);
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.rich_result?.reason).toContain("image");
  });

  it("Article missing required headline has reason mentioning headline", () => {
    const result = enrich({
      "@context":    "https://schema.org",
      "@type":       "Article",
      author:        { "@type": "Person", name: "Jane" },
      datePublished: "2026-03-18",
    });
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.rich_result?.reason).toContain("headline");
  });

  it("Product with no image or offers has eligible=false", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "Product",
      name:       "Widget",
    });
    expect(result.rich_result?.eligible).toBe(false);
  });
});

// ============================================================
// Deprecated type messages
// ============================================================

describe("enrichRichResultEligibility — deprecated type messages", () => {
  it("HowTo gets specific retirement message mentioning 2024", () => {
    const result = enrich({ "@context": "https://schema.org", "@type": "HowTo", name: "Test" });
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.rich_result?.reason).toContain("retired");
    expect(result.rich_result?.reason).toContain("2024");
  });

  it("SpecialAnnouncement gets deprecated-in-2025 message", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "SpecialAnnouncement",
      name:       "Test",
    });
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.rich_result?.reason).toContain("2025");
  });

  it("Vehicle gets a deprecated/retired message", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "Vehicle",
      name:       "Test Car",
    });
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.deprecated).toBe(true);
  });
});

// ============================================================
// FAQPage restriction message
// ============================================================

describe("enrichRichResultEligibility — FAQPage restriction", () => {
  it("FAQPage with valid mainEntity gets government-restriction message", () => {
    const result = enrich({
      "@context":  "https://schema.org",
      "@type":     "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } },
      ],
    });
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.rich_result?.reason).toContain("government");
    expect(result.rich_result?.reason).toContain("2024");
  });

  it("FAQPage with empty mainEntity is also ineligible", () => {
    const result = enrich({
      "@context":  "https://schema.org",
      "@type":     "FAQPage",
      mainEntity:  [],
    });
    expect(result.rich_result?.eligible).toBe(false);
  });
});

// ============================================================
// Product offers depth check
// ============================================================

describe("enrichRichResultEligibility — Product offers depth check", () => {
  const baseProduct = {
    "@context": "https://schema.org",
    "@type":    "Product",
    name:       "Widget",
    image:      "https://example.com/widget.jpg",
  };

  it("offers missing availability becomes ineligible with warning", () => {
    const result = enrich({
      ...baseProduct,
      offers: { "@type": "Offer", price: "9.99", priceCurrency: "USD" },
    });
    expect(result.rich_result_eligible).toBe(false);
    expect(result.rich_result?.eligible).toBe(false);
    const warn = result.warnings.find((w) => w.property === "offers");
    expect(warn).toBeDefined();
    expect(warn?.message).toContain("availability");
  });

  it("offers missing price becomes ineligible with warning", () => {
    const result = enrich({
      ...baseProduct,
      offers: {
        "@type":       "Offer",
        priceCurrency: "USD",
        availability:  "https://schema.org/InStock",
      },
    });
    expect(result.rich_result_eligible).toBe(false);
    const warn = result.warnings.find((w) => w.property === "offers");
    expect(warn?.message).toContain("price");
  });

  it("offers missing both price and availability warns about both", () => {
    const result = enrich({
      ...baseProduct,
      offers: { "@type": "Offer", priceCurrency: "USD" },
    });
    const warn = result.warnings.find((w) => w.property === "offers");
    expect(warn?.message).toContain("price");
    expect(warn?.message).toContain("availability");
  });

  it("offers with priceRange instead of price is accepted", () => {
    const result = enrich({
      ...baseProduct,
      offers: {
        "@type":       "Offer",
        priceRange:    "$9–$19",
        priceCurrency: "USD",
        availability:  "https://schema.org/InStock",
      },
    });
    expect(result.rich_result_eligible).toBe(true);
    expect(result.rich_result?.eligible).toBe(true);
    const offersWarn = result.warnings.find((w) => w.property === "offers");
    expect(offersWarn).toBeUndefined();
  });

  it("complete offers (price + availability) stays eligible", () => {
    const result = enrich({
      ...baseProduct,
      offers: {
        "@type":       "Offer",
        price:         "9.99",
        priceCurrency: "USD",
        availability:  "https://schema.org/InStock",
      },
    });
    expect(result.rich_result_eligible).toBe(true);
    expect(result.rich_result?.eligible).toBe(true);
  });
});

// ============================================================
// WebSite urlTemplate check
// ============================================================

describe("enrichRichResultEligibility — WebSite urlTemplate", () => {
  const baseWebSite = {
    "@context": "https://schema.org",
    "@type":    "WebSite",
    name:       "Example",
    url:        "https://example.com",
  };

  it("WebSite without potentialAction is not rich-result eligible", () => {
    const result = enrich(baseWebSite);
    // No potentialAction → not eligible (potentialAction is rich_result_required)
    expect(result.rich_result_eligible).toBe(false);
    expect(result.rich_result?.eligible).toBe(false);
  });

  it("WebSite with potentialAction missing urlTemplate becomes ineligible", () => {
    const result = enrich({
      ...baseWebSite,
      potentialAction: { "@type": "SearchAction", "query-input": "required name=search_term_string" },
    });
    expect(result.rich_result_eligible).toBe(false);
    const warn = result.warnings.find((w) => w.property === "potentialAction.urlTemplate");
    expect(warn).toBeDefined();
    expect(warn?.message).toContain("urlTemplate");
  });

  it("WebSite with urlTemplate in target is eligible", () => {
    const result = enrich({
      ...baseWebSite,
      potentialAction: {
        "@type":      "SearchAction",
        "query-input": "required name=search_term_string",
        target:       {
          "@type":      "EntryPoint",
          urlTemplate: "https://example.com/search?q={search_term_string}",
        },
      },
    });
    expect(result.rich_result_eligible).toBe(true);
    expect(result.rich_result?.eligible).toBe(true);
  });
});

// ============================================================
// Unknown type pass-through
// ============================================================

describe("enrichRichResultEligibility — unknown type", () => {
  it("attaches rich_result to unknown types with eligible=false", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "UnknownCustomType",
      name:       "Test",
    });
    expect(result.rich_result).toBeDefined();
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.rich_result?.google_docs_url).toContain("developers.google.com");
  });
});

// ============================================================
// Tier 2 — standard validation types (not deprecated)
// ============================================================

describe("enrichRichResultEligibility — Tier 2 types", () => {
  it("valid Review (all required props) is eligible", () => {
    const result = enrich({
      "@context":    "https://schema.org",
      "@type":       "Review",
      itemReviewed:  { "@type": "Product", name: "Widget" },
      reviewRating:  { "@type": "Rating", ratingValue: "4" },
      author:        { "@type": "Person", name: "Jane" },
    });
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("Review missing required author is ineligible", () => {
    const result = enrich({
      "@context":   "https://schema.org",
      "@type":      "Review",
      itemReviewed: { "@type": "Product", name: "Widget" },
      reviewRating: { "@type": "Rating", ratingValue: "4" },
    });
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.rich_result?.reason).toContain("author");
  });

  it("valid Recipe (with name + recipeIngredient + instructions) is eligible", () => {
    const result = enrich({
      "@context":         "https://schema.org",
      "@type":            "Recipe",
      name:               "Chocolate Cake",
      recipeIngredient:   ["2 cups flour", "1 cup sugar"],
      recipeInstructions: "Mix and bake.",
      image:              "https://example.com/cake.jpg",
      author:             { "@type": "Person", name: "Chef" },
    });
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("valid Event is eligible", () => {
    const result = enrich({
      "@context":  "https://schema.org",
      "@type":     "Event",
      name:        "Annual Gala",
      startDate:   "2026-06-01T18:00",
      location:    { "@type": "Place", name: "Grand Hall", address: "123 Main St" },
      eventStatus: "https://schema.org/EventScheduled",
    });
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("valid JobPosting is eligible", () => {
    const result = enrich({
      "@context":       "https://schema.org",
      "@type":          "JobPosting",
      title:            "Software Engineer",
      description:      "Build great software.",
      hiringOrganization: { "@type": "Organization", name: "Acme Corp" },
      jobLocation:      { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "SF" } },
      datePosted:       "2026-03-01",
    });
    expect(result.rich_result?.eligible).toBe(true);
  });
});

// ============================================================
// Tier 3 — basic validation types
// ============================================================

describe("enrichRichResultEligibility — Tier 3 types", () => {
  it("ClaimReview is NOT deprecated — ineligible due to missing required props", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "ClaimReview",
      name:       "A fact-check article",
    });
    // ClaimReview is Tier 3, deprecated=false — should be ineligible because
    // required properties (claimReviewed, reviewRating, author, itemReviewed) are missing
    expect(result.deprecated).toBe(false);
    expect(result.rich_result?.eligible).toBe(false);
    expect(result.rich_result?.reason).not.toContain("deprecated");
    expect(result.rich_result?.reason).not.toContain("retired");
    expect(result.rich_result?.reason).toContain("claimReviewed");
  });

  it("ClaimReview with all required props is eligible", () => {
    const result = enrich({
      "@context":     "https://schema.org",
      "@type":        "ClaimReview",
      claimReviewed:  "The earth is flat.",
      reviewRating:   { "@type": "Rating", alternateName: "False", ratingValue: "1" },
      author:         { "@type": "Organization", name: "FactCheck.org", url: "https://factcheck.org" },
      itemReviewed:   { "@type": "Claim", author: { "@type": "Person", name: "Unknown" } },
    });
    expect(result.deprecated).toBe(false);
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("valid Book is eligible", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "Book",
      name:       "Clean Code",
      author:     { "@type": "Person", name: "Robert Martin" },
    });
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("valid Movie is eligible", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "Movie",
      name:       "Inception",
      director:   { "@type": "Person", name: "Christopher Nolan" },
    });
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("valid Dataset is eligible", () => {
    const result = enrich({
      "@context":   "https://schema.org",
      "@type":      "Dataset",
      name:         "Climate Data 2025",
      description:  "Annual temperature readings.",
    });
    expect(result.rich_result?.eligible).toBe(true);
  });
});

// ============================================================
// Tier 4 — basic validation types
// ============================================================

describe("enrichRichResultEligibility — Tier 4 types", () => {
  it("valid MathSolver is eligible", () => {
    const result = enrich({
      "@context":      "https://schema.org",
      "@type":         "MathSolver",
      name:            "Quadratic Formula Solver",
      potentialAction: { "@type": "SolveMathAction", target: "https://example.com/solve?q={math_expression_string}" },
    });
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("valid Quiz is eligible", () => {
    const result = enrich({
      "@context": "https://schema.org",
      "@type":    "Quiz",
      name:       "General Knowledge Quiz",
      hasPart:    [{ "@type": "Question", name: "What is 2+2?" }],
    });
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("valid LoyaltyProgram is eligible", () => {
    const result = enrich({
      "@context":             "https://schema.org",
      "@type":                "LoyaltyProgram",
      name:                   "Frequent Flyer Miles",
      hasMembershipDataType:  ["MilesEarned", "TierStatus"],
    });
    expect(result.rich_result?.eligible).toBe(true);
  });

  it("valid VacationRental is eligible", () => {
    const result = enrich({
      "@context":  "https://schema.org",
      "@type":     "VacationRental",
      name:        "Beach Cottage",
      description: "A cozy beachside cottage in Malibu.",
      address:     { "@type": "PostalAddress", addressLocality: "Malibu" },
    });
    expect(result.rich_result?.eligible).toBe(true);
  });
});

// ============================================================
// enrichRichResultEligibility — multiple results at once
// ============================================================

describe("enrichRichResultEligibility — batch processing", () => {
  it("enriches multiple results in a single call", () => {
    const results = enrichRichResultEligibility([
      validateSchema({ "@context": "https://schema.org", "@type": "Article", headline: "T", author: { "@type": "Person", name: "A" }, datePublished: "2026-01-01", image: "https://example.com/i.jpg" }),
      validateSchema({ "@context": "https://schema.org", "@type": "HowTo", name: "T" }),
      validateSchema({ "@context": "https://schema.org", "@type": "WebSite", name: "MySite", url: "https://example.com" }),
    ]);
    expect(results).toHaveLength(3);
    expect(results[0].rich_result?.eligible).toBe(true);
    expect(results[1].rich_result?.eligible).toBe(false);
    expect(results[2].rich_result?.eligible).toBe(false);
    results.forEach((r) => {
      expect(r.rich_result).toBeDefined();
      expect(typeof r.rich_result?.eligible).toBe("boolean");
    });
  });
});
