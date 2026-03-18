import { describe, it, expect } from "vitest";
import { flattenJsonLd, parseSchemas, resolveType } from "@/lib/validator/parser";

describe("flattenJsonLd", () => {
  it("returns a single schema as-is when no @graph", () => {
    const obj = { "@type": "Article", headline: "Test" };
    expect(flattenJsonLd(obj)).toEqual([obj]);
  });

  it("flattens @graph into individual schemas", () => {
    const obj = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Article", headline: "A" },
        { "@type": "Organization", name: "B" },
      ],
    };
    const result = flattenJsonLd(obj);
    expect(result).toHaveLength(2);
    expect(result[0]["@type"]).toBe("Article");
    expect(result[1]["@type"]).toBe("Organization");
  });

  it("inherits @context from parent in @graph items", () => {
    const obj = {
      "@context": "https://schema.org",
      "@graph": [{ "@type": "Article", headline: "A" }],
    };
    const result = flattenJsonLd(obj);
    expect(result[0]["@context"]).toBe("https://schema.org");
  });

  it("does not override @context if already set on child", () => {
    const obj = {
      "@context": "https://schema.org",
      "@graph": [
        { "@context": "https://other.org", "@type": "Article", headline: "A" },
      ],
    };
    const result = flattenJsonLd(obj);
    expect(result[0]["@context"]).toBe("https://other.org");
  });
});

describe("parseSchemas", () => {
  it("filters out blocks with no @type", () => {
    const blocks = [
      { "@context": "https://schema.org", headline: "No type" },
      { "@type": "Article", headline: "Has type" },
    ];
    const result = parseSchemas(blocks);
    expect(result).toHaveLength(1);
    expect(result[0]["@type"]).toBe("Article");
  });
});

describe("resolveType", () => {
  it("returns plain type name as-is", () => {
    expect(resolveType("Article")).toBe("Article");
  });

  it("strips schema.org namespace from full URL", () => {
    expect(resolveType("https://schema.org/Article")).toBe("Article");
    expect(resolveType("http://schema.org/Product")).toBe("Product");
  });

  it("takes first element from array types", () => {
    expect(resolveType(["Article", "NewsArticle"])).toBe("Article");
  });
});
