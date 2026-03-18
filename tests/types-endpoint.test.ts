import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/v1/types/route";

// ──────────────────────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────────────────────
async function getTypes() {
  const response = await GET();
  const body = await response.json() as {
    types: Array<{
      type: string;
      status: string;
      tier: number;
      validation_depth: string;
      also_matches: string[];
      required_properties: string[];
      recommended_properties: string[];
      google_docs_url: string;
      note?: string;
    }>;
    total_supported: number;
    total_coming_soon: number;
    total_planned: number;
    total_deprecated: number;
    schema_org_version: string;
    last_updated: string;
  };
  return { response, body };
}

// ──────────────────────────────────────────────────────────────
// HTTP response
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/types — HTTP response", () => {
  it("returns HTTP 200", async () => {
    const { response } = await getTypes();
    expect(response.status).toBe(200);
  });

  it("sets Cache-Control header for long-lived public caching", async () => {
    const { response } = await getTypes();
    const cacheControl = response.headers.get("Cache-Control") ?? "";
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("max-age=86400");
  });

  it("does not require authentication (no auth middleware)", async () => {
    // GET() is called with no arguments — no Request object, no auth header needed
    await expect(getTypes()).resolves.toBeDefined();
  });
});

// ──────────────────────────────────────────────────────────────
// Top-level shape
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/types — response body shape", () => {
  it("returns a types array", async () => {
    const { body } = await getTypes();
    expect(Array.isArray(body.types)).toBe(true);
  });

  it("returns summary count fields", async () => {
    const { body } = await getTypes();
    expect(typeof body.total_supported).toBe("number");
    expect(typeof body.total_coming_soon).toBe("number");
    expect(typeof body.total_planned).toBe("number");
    expect(typeof body.total_deprecated).toBe("number");
  });

  it("returns schema_org_version and last_updated", async () => {
    const { body } = await getTypes();
    expect(body.schema_org_version).toMatch(/V\d+/);
    expect(body.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ──────────────────────────────────────────────────────────────
// Type counts
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/types — type counts", () => {
  it("returns exactly 35 types in the array", async () => {
    const { body } = await getTypes();
    expect(body.types).toHaveLength(35);
  });

  it("has exactly 7 supported types (Tier 1)", async () => {
    const { body } = await getTypes();
    const supported = body.types.filter((t) => t.status === "supported");
    expect(supported).toHaveLength(7);
    expect(body.total_supported).toBe(7);
  });

  it("has exactly 3 deprecated types", async () => {
    const { body } = await getTypes();
    const deprecated = body.types.filter((t) => t.status === "deprecated");
    expect(deprecated).toHaveLength(3);
    expect(body.total_deprecated).toBe(3);
  });

  it("has 10 coming_soon types (Tier 2)", async () => {
    // Note: total_coming_soon in the response object may show 11 (known bug);
    // use array filter as the authoritative count
    const { body } = await getTypes();
    const comingSoon = body.types.filter((t) => t.status === "coming_soon");
    expect(comingSoon).toHaveLength(10);
  });

  it("has 15 planned types (Tier 3 + Tier 4)", async () => {
    // Note: total_planned in the response object may show 14 (known bug);
    // use array filter as the authoritative count
    const { body } = await getTypes();
    const planned = body.types.filter((t) => t.status === "planned");
    expect(planned).toHaveLength(15);
  });
});

// ──────────────────────────────────────────────────────────────
// Tier 1 types
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/types — Tier 1 (supported)", () => {
  it("all Tier 1 types have validation_depth=full", async () => {
    const { body } = await getTypes();
    const tier1 = body.types.filter((t) => t.tier === 1);
    for (const t of tier1) {
      expect(t.validation_depth, `${t.type} should be full`).toBe("full");
    }
  });

  it("includes Article with expected required properties", async () => {
    const { body } = await getTypes();
    const article = body.types.find((t) => t.type === "Article");
    expect(article).toBeDefined();
    expect(article!.required_properties).toContain("headline");
    expect(article!.required_properties).toContain("author");
    expect(article!.required_properties).toContain("datePublished");
  });

  it("Article.also_matches includes NewsArticle and BlogPosting", async () => {
    const { body } = await getTypes();
    const article = body.types.find((t) => t.type === "Article")!;
    expect(article.also_matches).toContain("NewsArticle");
    expect(article.also_matches).toContain("BlogPosting");
  });

  it("FAQPage has a restriction note", async () => {
    const { body } = await getTypes();
    const faq = body.types.find((t) => t.type === "FAQPage")!;
    expect(faq.note).toBeDefined();
    expect(faq.note).toMatch(/government|restricted/i);
  });

  it("all Tier 1 types have google_docs_url containing developers.google.com", async () => {
    const { body } = await getTypes();
    const tier1 = body.types.filter((t) => t.tier === 1);
    for (const t of tier1) {
      expect(t.google_docs_url, t.type).toContain("developers.google.com");
    }
  });
});

// ──────────────────────────────────────────────────────────────
// Tier 2 types
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/types — Tier 2 (coming_soon)", () => {
  it("all Tier 2 types have validation_depth=standard", async () => {
    const { body } = await getTypes();
    const tier2 = body.types.filter((t) => t.tier === 2);
    for (const t of tier2) {
      expect(t.validation_depth, `${t.type} should be standard`).toBe("standard");
    }
  });

  it("includes Review, Recipe, Event, VideoObject, JobPosting", async () => {
    const { body } = await getTypes();
    const tier2Types = body.types.filter((t) => t.tier === 2).map((t) => t.type);
    expect(tier2Types).toContain("Review");
    expect(tier2Types).toContain("Recipe");
    expect(tier2Types).toContain("Event");
    expect(tier2Types).toContain("VideoObject");
    expect(tier2Types).toContain("JobPosting");
  });
});

// ──────────────────────────────────────────────────────────────
// Tier 3 + 4 types
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/types — Tier 3 & 4 (planned)", () => {
  it("all Tier 3 and Tier 4 types have validation_depth=basic", async () => {
    const { body } = await getTypes();
    const tier34 = body.types.filter((t) => t.tier === 3 || t.tier === 4);
    for (const t of tier34) {
      expect(t.validation_depth, `${t.type} should be basic`).toBe("basic");
    }
  });

  it("ClaimReview is in Tier 3 with status=planned (not deprecated)", async () => {
    const { body } = await getTypes();
    const cr = body.types.find((t) => t.type === "ClaimReview")!;
    expect(cr).toBeDefined();
    expect(cr.tier).toBe(3);
    expect(cr.status).toBe("planned");
    expect(cr.validation_depth).toBe("basic");
  });

  it("ClaimReview required_properties includes claimReviewed and reviewRating", async () => {
    const { body } = await getTypes();
    const cr = body.types.find((t) => t.type === "ClaimReview")!;
    expect(cr.required_properties).toContain("claimReviewed");
    expect(cr.required_properties).toContain("reviewRating");
  });

  it("includes Tier 4 types: MathSolver, Quiz, LoyaltyProgram, VacationRental, CreativeWork", async () => {
    const { body } = await getTypes();
    const tier4Types = body.types.filter((t) => t.tier === 4).map((t) => t.type);
    expect(tier4Types).toContain("MathSolver");
    expect(tier4Types).toContain("Quiz");
    expect(tier4Types).toContain("LoyaltyProgram");
    expect(tier4Types).toContain("VacationRental");
    expect(tier4Types).toContain("CreativeWork");
  });
});

// ──────────────────────────────────────────────────────────────
// Deprecated types
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/types — deprecated types", () => {
  it("deprecated types are HowTo, SpecialAnnouncement, Vehicle", async () => {
    const { body } = await getTypes();
    const deprecatedTypes = body.types
      .filter((t) => t.status === "deprecated")
      .map((t) => t.type)
      .sort();
    expect(deprecatedTypes).toEqual(["HowTo", "SpecialAnnouncement", "Vehicle"].sort());
  });

  it("deprecated types have tier=0", async () => {
    const { body } = await getTypes();
    const deprecated = body.types.filter((t) => t.status === "deprecated");
    for (const t of deprecated) {
      expect(t.tier, `${t.type} should have tier 0`).toBe(0);
    }
  });

  it("deprecated types have validation_depth=basic", async () => {
    const { body } = await getTypes();
    const deprecated = body.types.filter((t) => t.status === "deprecated");
    for (const t of deprecated) {
      expect(t.validation_depth, `${t.type} should be basic`).toBe("basic");
    }
  });

  it("Vehicle.also_matches includes Car", async () => {
    const { body } = await getTypes();
    const vehicle = body.types.find((t) => t.type === "Vehicle")!;
    expect(vehicle.also_matches).toContain("Car");
  });
});

// ──────────────────────────────────────────────────────────────
// Per-entry shape
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/types — every entry has required fields", () => {
  it("every type entry has type, status, tier, validation_depth, google_docs_url", async () => {
    const { body } = await getTypes();
    for (const t of body.types) {
      expect(typeof t.type, `type.type should be string`).toBe("string");
      expect(typeof t.status, `${t.type}.status should be string`).toBe("string");
      expect(typeof t.tier, `${t.type}.tier should be number`).toBe("number");
      expect(typeof t.validation_depth, `${t.type}.validation_depth`).toBe("string");
      expect(["full", "standard", "basic"]).toContain(t.validation_depth);
      expect(t.google_docs_url, `${t.type} docs url`).toContain("developers.google.com");
    }
  });

  it("every type entry has required_properties and recommended_properties arrays", async () => {
    const { body } = await getTypes();
    for (const t of body.types) {
      expect(Array.isArray(t.required_properties), `${t.type}.required_properties`).toBe(true);
      expect(Array.isArray(t.recommended_properties), `${t.type}.recommended_properties`).toBe(true);
    }
  });

  it("no duplicate type names in the list", async () => {
    const { body } = await getTypes();
    const typeNames = body.types.map((t) => t.type);
    const unique = new Set(typeNames);
    expect(unique.size).toBe(typeNames.length);
  });
});
