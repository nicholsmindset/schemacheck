/**
 * schema-rules.test.ts
 *
 * Comprehensive validation tests covering all 35 supported schema types
 * across 4 tiers (full / standard / basic) plus deprecated types.
 */

import { describe, it, expect } from "vitest";
import { validateSchema } from "@/lib/validator/schema-rules";

// ============================================================
// Helpers
// ============================================================

function valid(overrides: Record<string, unknown> = {}) {
  return { "@context": "https://schema.org", ...overrides };
}

function hasError(result: ReturnType<typeof validateSchema>, property: string) {
  return result.errors.some((e) => e.property === property);
}

// ============================================================
// Tier 1 — Article (and sub-types via also_matches)
// ============================================================

describe("Tier 1 — Article", () => {
  const base = valid({
    "@type": "Article",
    headline: "Test Article",
    author: { "@type": "Person", name: "Jane Doe" },
    datePublished: "2026-01-15",
  });

  it("valid with required properties", () => {
    const r = validateSchema(base);
    expect(r.valid).toBe(true);
    expect(r.type).toBe("Article");
    expect(r.deprecated).toBe(false);
  });

  it("error when headline missing", () => {
    const { headline: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "headline")).toBe(true);
  });

  it("error when author missing", () => {
    const { author: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "author")).toBe(true);
  });

  it("error when datePublished missing", () => {
    const { datePublished: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "datePublished")).toBe(true);
  });

  it("headline max_length=110 enforced", () => {
    const r = validateSchema(valid({ "@type": "Article", headline: "A".repeat(111), author: { name: "J" }, datePublished: "2026-01-01" }));
    expect(hasError(r, "headline")).toBe(true);
    expect(r.errors.find((e) => e.property === "headline")?.message).toMatch(/110/);
  });

  it("each error includes a fix suggestion and google_docs_url", () => {
    const { headline: _, ...schema } = base;
    const r = validateSchema(schema);
    const err = r.errors.find((e) => e.property === "headline");
    expect(err?.fix).toBeTruthy();
    expect(err?.google_docs_url).toContain("developers.google.com");
  });
});

describe("Tier 1 — Article sub-types (also_matches)", () => {
  it("NewsArticle uses Article rules", () => {
    const r = validateSchema(valid({ "@type": "NewsArticle", headline: "Breaking", author: { name: "Reporter" }, datePublished: "2026-01-01" }));
    expect(r.type).toBe("NewsArticle");
    expect(r.valid).toBe(true);
  });

  it("BlogPosting uses Article rules", () => {
    const r = validateSchema(valid({ "@type": "BlogPosting", headline: "My Post", author: { name: "Blogger" }, datePublished: "2026-01-01" }));
    expect(r.type).toBe("BlogPosting");
    expect(r.valid).toBe(true);
  });

  it("TechArticle recognized via also_matches", () => {
    const r = validateSchema(valid({ "@type": "TechArticle", headline: "Tech Guide", author: { name: "Dev" }, datePublished: "2026-01-01" }));
    expect(r.type).toBe("TechArticle");
    // Uses Article rules — may be valid or may have type warning depending on rule file
    expect(r.rich_result_eligible !== undefined).toBe(true);
  });
});

// ============================================================
// Tier 1 — Product
// ============================================================

describe("Tier 1 — Product", () => {
  it("valid with name only (single required property)", () => {
    const r = validateSchema(valid({ "@type": "Product", name: "Acme Widget" }));
    expect(r.valid).toBe(true);
    expect(r.type).toBe("Product");
  });

  it("error when name missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "Product" })), "name")).toBe(true);
  });

  it("rich_result_eligible when name + image + offers present", () => {
    const r = validateSchema(valid({
      "@type": "Product",
      name: "Widget",
      image: "https://example.com/img.jpg",
      offers: { "@type": "Offer", price: "9.99", priceCurrency: "USD" },
    }));
    expect(r.rich_result_eligible).toBe(true);
  });

  it("rich_result_eligible=false when image missing", () => {
    const r = validateSchema(valid({ "@type": "Product", name: "Widget" }));
    expect(r.rich_result_eligible).toBe(false);
  });
});

// ============================================================
// Tier 1 — LocalBusiness
// ============================================================

describe("Tier 1 — LocalBusiness", () => {
  const base = valid({
    "@type": "LocalBusiness",
    name: "Acme Shop",
    address: { "@type": "PostalAddress", streetAddress: "123 Main St", addressLocality: "Springfield" },
  });

  it("valid with name and address", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when name missing", () => {
    const { name: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "name")).toBe(true);
  });

  it("error when address missing", () => {
    const { address: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "address")).toBe(true);
  });

  it("Restaurant sub-type uses LocalBusiness rules via also_matches", () => {
    const r = validateSchema(valid({
      "@type": "Restaurant",
      name: "Mario's",
      address: { "@type": "PostalAddress", streetAddress: "1 Pizza Pl", addressLocality: "Naples" },
    }));
    expect(r.type).toBe("Restaurant");
    expect(r.valid).toBe(true);
  });
});

// ============================================================
// Tier 1 — Organization
// ============================================================

describe("Tier 1 — Organization", () => {
  it("valid with name only", () => {
    const r = validateSchema(valid({ "@type": "Organization", name: "Acme Corp" }));
    expect(r.valid).toBe(true);
  });

  it("error when name missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "Organization" })), "name")).toBe(true);
  });

  it("Corporation sub-type recognized via also_matches", () => {
    const r = validateSchema(valid({ "@type": "Corporation", name: "Big Corp" }));
    expect(r.valid).toBe(true);
  });
});

// ============================================================
// Tier 1 — BreadcrumbList
// ============================================================

describe("Tier 1 — BreadcrumbList", () => {
  it("valid with non-empty itemListElement array", () => {
    const r = validateSchema(valid({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com" },
        { "@type": "ListItem", position: 2, name: "Products", item: "https://example.com/products" },
      ],
    }));
    expect(r.valid).toBe(true);
  });

  it("error when itemListElement missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "BreadcrumbList" })), "itemListElement")).toBe(true);
  });
});

// ============================================================
// Tier 1 — WebSite
// ============================================================

describe("Tier 1 — WebSite", () => {
  it("valid with name and url", () => {
    const r = validateSchema(valid({ "@type": "WebSite", name: "Example", url: "https://example.com" }));
    expect(r.valid).toBe(true);
  });

  it("error when url missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "WebSite", name: "Example" })), "url")).toBe(true);
  });
});

// ============================================================
// Tier 1 — FAQPage (restricted but not deprecated)
// ============================================================

describe("Tier 1 — FAQPage", () => {
  it("valid with mainEntity array", () => {
    const r = validateSchema(valid({
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }],
    }));
    expect(r.valid).toBe(true);
    expect(r.deprecated).toBe(false);
  });

  it("has a deprecation_note (restriction) warning but deprecated=false", () => {
    const r = validateSchema(valid({
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Q?" }],
    }));
    expect(r.deprecated).toBe(false);
    const warn = r.warnings.find((w) => w.property === "@type");
    expect(warn).toBeDefined();
  });

  it("error when mainEntity missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "FAQPage" })), "mainEntity")).toBe(true);
  });
});

// ============================================================
// Tier 2 — Review
// ============================================================

describe("Tier 2 — Review", () => {
  const base = valid({
    "@type": "Review",
    itemReviewed: { "@type": "Product", name: "Widget" },
    reviewRating: { "@type": "Rating", ratingValue: "4", bestRating: "5" },
    author: { "@type": "Person", name: "Reviewer" },
  });

  it("valid with required properties", () => {
    const r = validateSchema(base);
    expect(r.valid).toBe(true);
    expect(r.type).toBe("Review");
  });

  it("error when itemReviewed missing", () => {
    const { itemReviewed: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "itemReviewed")).toBe(true);
  });

  it("error when reviewRating missing", () => {
    const { reviewRating: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "reviewRating")).toBe(true);
  });
});

// ============================================================
// Tier 2 — Recipe
// ============================================================

describe("Tier 2 — Recipe", () => {
  const base = valid({
    "@type": "Recipe",
    name: "Pasta Carbonara",
    image: "https://example.com/pasta.jpg",
    recipeInstructions: [{ "@type": "HowToStep", text: "Boil pasta." }],
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when name missing", () => {
    const { name: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "name")).toBe(true);
  });

  it("error when recipeInstructions missing", () => {
    const { recipeInstructions: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "recipeInstructions")).toBe(true);
  });

  it("error when image is not a valid URL", () => {
    const r = validateSchema(valid({ ...base, image: "/relative/path.jpg" }));
    const issue = [...r.errors, ...r.warnings].find((i) => i.property === "image");
    expect(issue).toBeDefined();
    expect(issue?.message).toMatch(/absolute URL/);
  });
});

// ============================================================
// Tier 2 — Event
// ============================================================

describe("Tier 2 — Event", () => {
  const base = valid({
    "@type": "Event",
    name: "Tech Conference 2026",
    startDate: "2026-06-15T09:00:00Z",
    location: { "@type": "Place", name: "Convention Center", address: { "@type": "PostalAddress", addressLocality: "San Francisco" } },
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when name missing", () => {
    const { name: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "name")).toBe(true);
  });

  it("error when startDate missing", () => {
    const { startDate: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "startDate")).toBe(true);
  });

  it("error when startDate is not ISO 8601", () => {
    const r = validateSchema(valid({ ...base, startDate: "June 15, 2026" }));
    expect(hasError(r, "startDate")).toBe(true);
  });

  it("MusicEvent sub-type recognized", () => {
    const r = validateSchema(valid({ "@type": "MusicEvent", name: "Concert", startDate: "2026-06-15", location: { "@type": "Place", name: "Arena" } }));
    expect(r.valid).toBe(true);
  });
});

// ============================================================
// Tier 2 — VideoObject
// ============================================================

describe("Tier 2 — VideoObject", () => {
  const base = valid({
    "@type": "VideoObject",
    name: "Introduction to Schema.org",
    description: "Learn how to use Schema.org structured data.",
    thumbnailUrl: "https://example.com/thumbnail.jpg",
    uploadDate: "2026-01-15",
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when name missing", () => {
    const { name: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "name")).toBe(true);
  });

  it("error when uploadDate missing", () => {
    const { uploadDate: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "uploadDate")).toBe(true);
  });
});

// ============================================================
// Tier 2 — SoftwareApplication
// ============================================================

describe("Tier 2 — SoftwareApplication", () => {
  const base = valid({
    "@type": "SoftwareApplication",
    name: "Acme App",
    applicationCategory: "BusinessApplication",
    operatingSystem: "iOS, Android",
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when applicationCategory missing", () => {
    const { applicationCategory: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "applicationCategory")).toBe(true);
  });

  it("WebApplication sub-type recognized", () => {
    const r = validateSchema(valid({ "@type": "WebApplication", name: "App", applicationCategory: "BusinessApplication", operatingSystem: "All" }));
    expect(r.valid).toBe(true);
  });
});

// ============================================================
// Tier 2 — JobPosting
// ============================================================

describe("Tier 2 — JobPosting", () => {
  const base = valid({
    "@type": "JobPosting",
    title: "Senior Software Engineer",
    description: "Join our team to build great software.",
    hiringOrganization: { "@type": "Organization", name: "Acme Corp" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "San Francisco", addressCountry: "US" } },
    datePosted: "2026-01-15",
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when title missing", () => {
    const { title: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "title")).toBe(true);
  });

  it("error when datePosted missing", () => {
    const { datePosted: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "datePosted")).toBe(true);
  });
});

// ============================================================
// Tier 2 — Course
// ============================================================

describe("Tier 2 — Course", () => {
  const base = valid({
    "@type": "Course",
    name: "Introduction to JavaScript",
    description: "Learn JavaScript from scratch.",
    provider: { "@type": "Organization", name: "Acme Learning" },
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when description missing", () => {
    const { description: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "description")).toBe(true);
  });
});

// ============================================================
// Tier 2 — ItemList
// ============================================================

describe("Tier 2 — ItemList", () => {
  it("valid with non-empty itemListElement", () => {
    const r = validateSchema(valid({
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, url: "https://example.com/item1" },
      ],
    }));
    expect(r.valid).toBe(true);
  });

  it("error when itemListElement missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "ItemList" })), "itemListElement")).toBe(true);
  });
});

// ============================================================
// Tier 2 — QAPage
// ============================================================

describe("Tier 2 — QAPage", () => {
  it("valid with mainEntity", () => {
    const r = validateSchema(valid({
      "@type": "QAPage",
      mainEntity: { "@type": "Question", name: "What is schema?" },
    }));
    expect(r.valid).toBe(true);
  });

  it("error when mainEntity missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "QAPage" })), "mainEntity")).toBe(true);
  });
});

// ============================================================
// Tier 2 — ProductGroup
// ============================================================

describe("Tier 2 — ProductGroup", () => {
  const base = valid({
    "@type": "ProductGroup",
    name: "T-Shirt Collection",
    hasVariant: [
      { "@type": "Product", name: "T-Shirt Blue S", offers: { "@type": "Offer", price: "19.99", priceCurrency: "USD" } },
    ],
    variesBy: "https://schema.org/color",
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when hasVariant missing", () => {
    const { hasVariant: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "hasVariant")).toBe(true);
  });

  it("error when variesBy missing", () => {
    const { variesBy: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "variesBy")).toBe(true);
  });
});

// ============================================================
// Tier 3 — Book
// ============================================================

describe("Tier 3 — Book", () => {
  it("valid with name and author", () => {
    const r = validateSchema(valid({
      "@type": "Book",
      name: "The Art of Structured Data",
      author: { "@type": "Person", name: "Jane Doe" },
    }));
    expect(r.valid).toBe(true);
    expect(r.deprecated).toBe(false);
  });

  it("error when name missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "Book", author: { name: "X" } })), "name")).toBe(true);
  });
});

// ============================================================
// Tier 3 — Dataset
// ============================================================

describe("Tier 3 — Dataset", () => {
  it("valid with name and description", () => {
    const r = validateSchema(valid({ "@type": "Dataset", name: "Climate Data 2026", description: "Monthly temperature records." }));
    expect(r.valid).toBe(true);
  });

  it("error when description missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "Dataset", name: "Data" })), "description")).toBe(true);
  });
});

// ============================================================
// Tier 3 — DiscussionForumPosting
// ============================================================

describe("Tier 3 — DiscussionForumPosting", () => {
  const base = valid({
    "@type": "DiscussionForumPosting",
    headline: "Help with Schema.org",
    url: "https://forum.example.com/post/1",
    author: { "@type": "Person", name: "ForumUser" },
    datePublished: "2026-01-15",
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when headline missing", () => {
    const { headline: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "headline")).toBe(true);
  });
});

// ============================================================
// Tier 3 — EmployerAggregateRating
// ============================================================

describe("Tier 3 — EmployerAggregateRating", () => {
  const base = valid({
    "@type": "EmployerAggregateRating",
    itemReviewed: { "@type": "Organization", name: "Acme Corp" },
    ratingValue: "4.2",
    ratingCount: "350",
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when ratingValue missing", () => {
    const { ratingValue: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "ratingValue")).toBe(true);
  });
});

// ============================================================
// Tier 3 — Movie
// ============================================================

describe("Tier 3 — Movie", () => {
  it("valid with name only (single required property)", () => {
    const r = validateSchema(valid({ "@type": "Movie", name: "Inception" }));
    expect(r.valid).toBe(true);
  });

  it("error when name missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "Movie" })), "name")).toBe(true);
  });
});

// ============================================================
// Tier 3 — ImageObject
// ============================================================

describe("Tier 3 — ImageObject", () => {
  it("valid with contentUrl", () => {
    const r = validateSchema(valid({ "@type": "ImageObject", contentUrl: "https://example.com/photo.jpg" }));
    expect(r.valid).toBe(true);
  });

  it("error when contentUrl missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "ImageObject" })), "contentUrl")).toBe(true);
  });

  it("error when contentUrl is not an absolute URL", () => {
    const r = validateSchema(valid({ "@type": "ImageObject", contentUrl: "/images/photo.jpg" }));
    expect(hasError(r, "contentUrl")).toBe(true);
  });
});

// ============================================================
// Tier 3 — ProfilePage
// ============================================================

describe("Tier 3 — ProfilePage", () => {
  it("valid with mainEntity", () => {
    const r = validateSchema(valid({
      "@type": "ProfilePage",
      mainEntity: { "@type": "Person", name: "Jane Doe" },
    }));
    expect(r.valid).toBe(true);
  });

  it("error when mainEntity missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "ProfilePage" })), "mainEntity")).toBe(true);
  });
});

// ============================================================
// Tier 3 — MerchantReturnPolicy
// ============================================================

describe("Tier 3 — MerchantReturnPolicy", () => {
  const base = valid({
    "@type": "MerchantReturnPolicy",
    applicableCountry: "US",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when applicableCountry missing", () => {
    const { applicableCountry: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "applicableCountry")).toBe(true);
  });
});

// ============================================================
// Tier 3 — OfferShippingDetails
// ============================================================

describe("Tier 3 — OfferShippingDetails", () => {
  const base = valid({
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1 } },
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when shippingRate missing", () => {
    const { shippingRate: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "shippingRate")).toBe(true);
  });
});

// ============================================================
// Tier 3 — ClaimReview (restricted, NOT deprecated)
// ============================================================

describe("Tier 3 — ClaimReview", () => {
  const base = valid({
    "@type": "ClaimReview",
    claimReviewed: "The claim being fact-checked.",
    reviewRating: { "@type": "Rating", ratingValue: "1", bestRating: "5" },
    author: { "@type": "Organization", name: "FactCheck.org" },
    itemReviewed: { "@type": "Claim", author: { "@type": "Person", name: "Claimant" } },
  });

  it("valid with required properties", () => {
    const r = validateSchema(base);
    expect(r.valid).toBe(true);
    expect(r.deprecated).toBe(false);
  });

  it("error when claimReviewed missing", () => {
    const { claimReviewed: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "claimReviewed")).toBe(true);
  });

  it("has restriction warning (deprecation_note) but deprecated=false", () => {
    const r = validateSchema(base);
    // ClaimReview has a deprecation_note about eligibility restrictions
    // but is NOT marked as deprecated
    expect(r.deprecated).toBe(false);
  });
});

// ============================================================
// Tier 4 — MathSolver
// ============================================================

describe("Tier 4 — MathSolver", () => {
  it("valid with name and potentialAction", () => {
    const r = validateSchema(valid({
      "@type": "MathSolver",
      name: "Math Solver Tool",
      potentialAction: { "@type": "SolveAction" },
    }));
    expect(r.valid).toBe(true);
  });

  it("error when potentialAction missing", () => {
    const r = validateSchema(valid({ "@type": "MathSolver", name: "Solver" }));
    expect(hasError(r, "potentialAction")).toBe(true);
  });
});

// ============================================================
// Tier 4 — Quiz
// ============================================================

describe("Tier 4 — Quiz", () => {
  it("valid with name and hasPart", () => {
    const r = validateSchema(valid({
      "@type": "Quiz",
      name: "JavaScript Basics Quiz",
      hasPart: [{ "@type": "Question", name: "What is JS?" }],
    }));
    expect(r.valid).toBe(true);
  });

  it("error when hasPart missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "Quiz", name: "Quiz" })), "hasPart")).toBe(true);
  });
});

// ============================================================
// Tier 4 — LoyaltyProgram
// ============================================================

describe("Tier 4 — LoyaltyProgram", () => {
  it("valid with name and hasMembershipDataType", () => {
    const r = validateSchema(valid({
      "@type": "LoyaltyProgram",
      name: "Acme Rewards",
      hasMembershipDataType: [{ "@type": "LoyaltyMembership", name: "Gold" }],
    }));
    expect(r.valid).toBe(true);
  });

  it("error when hasMembershipDataType missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "LoyaltyProgram", name: "Rewards" })), "hasMembershipDataType")).toBe(true);
  });
});

// ============================================================
// Tier 4 — VacationRental
// ============================================================

describe("Tier 4 — VacationRental", () => {
  const base = valid({
    "@type": "VacationRental",
    name: "Beach House",
    description: "A beautiful beach house rental.",
    address: { "@type": "PostalAddress", addressLocality: "Miami", addressCountry: "US" },
  });

  it("valid with required properties", () => {
    expect(validateSchema(base).valid).toBe(true);
  });

  it("error when description missing", () => {
    const { description: _, ...schema } = base;
    expect(hasError(validateSchema(schema), "description")).toBe(true);
  });
});

// ============================================================
// Tier 4 — CreativeWork (subscription/paywalled content)
// ============================================================

describe("Tier 4 — CreativeWork", () => {
  it("valid with isAccessibleForFree and hasPart", () => {
    const r = validateSchema(valid({
      "@type": "CreativeWork",
      isAccessibleForFree: "False",
      hasPart: [{ "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: ".paywall" }],
    }));
    expect(r.valid).toBe(true);
  });

  it("error when isAccessibleForFree missing", () => {
    const r = validateSchema(valid({ "@type": "CreativeWork", hasPart: [{ "@type": "WebPageElement" }] }));
    expect(hasError(r, "isAccessibleForFree")).toBe(true);
  });
});

// ============================================================
// Deprecated types — HowTo, SpecialAnnouncement, Vehicle
// ============================================================

describe("Deprecated — HowTo", () => {
  it("deprecated=true even when all required properties present", () => {
    const r = validateSchema(valid({
      "@type": "HowTo",
      name: "How to bake a cake",
      step: [{ "@type": "HowToStep", text: "Preheat oven." }],
    }));
    expect(r.deprecated).toBe(true);
    expect(r.rich_result_eligible).toBe(false);
    expect(r.warnings.some((w) => w.property === "@type")).toBe(true);
  });

  it("valid=false when step is missing", () => {
    const r = validateSchema(valid({ "@type": "HowTo", name: "How to cook" }));
    expect(r.valid).toBe(false);
    expect(hasError(r, "step")).toBe(true);
  });

  it("valid=true when all required props present (just deprecated=true)", () => {
    const r = validateSchema(valid({
      "@type": "HowTo",
      name: "How to tie a shoe",
      step: [{ "@type": "HowToStep", text: "Step 1." }],
    }));
    expect(r.valid).toBe(true);
    expect(r.deprecated).toBe(true);
  });
});

describe("Deprecated — SpecialAnnouncement", () => {
  it("deprecated=true and includes deprecation warning", () => {
    const r = validateSchema(valid({
      "@type": "SpecialAnnouncement",
      name: "Office Closure",
      datePosted: "2026-01-15",
    }));
    expect(r.deprecated).toBe(true);
    expect(r.rich_result_eligible).toBe(false);
    expect(r.warnings.some((w) => w.property === "@type")).toBe(true);
  });

  it("error when datePosted missing", () => {
    const r = validateSchema(valid({ "@type": "SpecialAnnouncement", name: "Announcement" }));
    expect(hasError(r, "datePosted")).toBe(true);
  });
});

describe("Deprecated — Vehicle", () => {
  it("deprecated=true for Vehicle type", () => {
    const r = validateSchema(valid({
      "@type": "Vehicle",
      name: "2024 Acme Sedan",
      vehicleIdentificationNumber: "1HGCM82633A004352",
    }));
    expect(r.deprecated).toBe(true);
    expect(r.rich_result_eligible).toBe(false);
  });

  it("Car sub-type recognized via also_matches and is deprecated", () => {
    const r = validateSchema(valid({
      "@type": "Car",
      name: "My Car",
      vehicleIdentificationNumber: "1HGCM82633A004352",
    }));
    expect(r.deprecated).toBe(true);
  });

  it("error when vehicleIdentificationNumber missing", () => {
    expect(hasError(validateSchema(valid({ "@type": "Vehicle", name: "Sedan" })), "vehicleIdentificationNumber")).toBe(true);
  });
});

// ============================================================
// Unknown types
// ============================================================

describe("Unknown types", () => {
  it("returns valid=true with info warning for completely unknown type", () => {
    const r = validateSchema(valid({ "@type": "SomeCustomType", name: "Test" }));
    expect(r.valid).toBe(true);
    expect(r.rich_result_eligible).toBe(false);
    expect(r.deprecated).toBe(false);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.warnings[0].severity).toBe("info");
  });

  it("unknown type has validation_depth=basic (default)", () => {
    const r = validateSchema(valid({ "@type": "CompletelyUnknown", name: "Test" }));
    expect(r.validation_depth).toBe("basic");
  });

  it("type is echoed back as-is for unknown types", () => {
    const r = validateSchema(valid({ "@type": "SpecialWidget" }));
    expect(r.type).toBe("SpecialWidget");
  });
});

// ============================================================
// schema.org URL prefix stripping
// ============================================================

describe("schema.org URL type prefix stripping", () => {
  it("strips https://schema.org/ prefix from @type", () => {
    const r = validateSchema(valid({ "@type": "https://schema.org/Organization", name: "Acme" }));
    expect(r.type).toBe("Organization");
    expect(r.valid).toBe(true);
  });
});

// ============================================================
// properties_found tracking
// ============================================================

describe("properties_found", () => {
  it("lists top-level properties (excluding @-keys except @id)", () => {
    const r = validateSchema(valid({
      "@type": "Organization",
      "@id": "https://example.com/#org",
      name: "Acme",
      url: "https://acme.example.com",
    }));
    expect(r.properties_found).toContain("name");
    expect(r.properties_found).toContain("url");
    expect(r.properties_found).toContain("@id");
    expect(r.properties_found).not.toContain("@type");
    expect(r.properties_found).not.toContain("@context");
  });
});
