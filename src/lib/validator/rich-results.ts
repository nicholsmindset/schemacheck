import type { RichResultStatus, SchemaValidationResult } from "./types";

// ============================================================
// Google documentation URLs per type
// ============================================================

const FALLBACK_DOCS =
  "https://developers.google.com/search/docs/appearance/structured-data";

const RICH_RESULT_DOCS: Record<string, string> = {
  Article:             "https://developers.google.com/search/docs/appearance/structured-data/article",
  NewsArticle:         "https://developers.google.com/search/docs/appearance/structured-data/article",
  BlogPosting:         "https://developers.google.com/search/docs/appearance/structured-data/article",
  TechArticle:         "https://developers.google.com/search/docs/appearance/structured-data/article",
  ScholarlyArticle:    "https://developers.google.com/search/docs/appearance/structured-data/article",
  Product:             "https://developers.google.com/search/docs/appearance/structured-data/product",
  LocalBusiness:       "https://developers.google.com/search/docs/appearance/structured-data/local-business",
  Restaurant:          "https://developers.google.com/search/docs/appearance/structured-data/local-business",
  FoodEstablishment:   "https://developers.google.com/search/docs/appearance/structured-data/local-business",
  Store:               "https://developers.google.com/search/docs/appearance/structured-data/local-business",
  Hotel:               "https://developers.google.com/search/docs/appearance/structured-data/local-business",
  LodgingBusiness:     "https://developers.google.com/search/docs/appearance/structured-data/local-business",
  Organization:        "https://developers.google.com/search/docs/appearance/structured-data/organization",
  BreadcrumbList:      "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb",
  WebSite:             "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox",
  FAQPage:             "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
  HowTo:               "https://developers.google.com/search/docs/appearance/structured-data/how-to",
  SpecialAnnouncement: "https://developers.google.com/search/docs/appearance/structured-data/special-announcements",
};

// ============================================================
// Deprecated / restricted type messages
// ============================================================

/** Types where deprecated=true in the validation result */
const DEPRECATED_MESSAGES: Record<string, string> = {
  HowTo:               "Google retired HowTo rich results in 2024. This markup will not generate rich results.",
  SpecialAnnouncement: "Deprecated in 2025.",
  CourseInfo:          "Deprecated in 2025.",
  ClaimReview:         "Deprecated in 2025.",
  LearningVideo:       "Deprecated in 2025.",
  VehicleListing:      "Deprecated in 2025.",
};

const FAQPAGE_RESTRICTION =
  "FAQPage rich results are restricted to government and health authority sites since 2024.";

// ============================================================
// Public API
// ============================================================

export function enrichRichResultEligibility(
  results: SchemaValidationResult[],
): SchemaValidationResult[] {
  return results.map((result) => enrichSingle(result));
}

// ============================================================
// Internal helpers
// ============================================================

function enrichSingle(result: SchemaValidationResult): SchemaValidationResult {
  const updated = applyStructuralChecks(result);
  return { ...updated, rich_result: computeRichResult(updated) };
}

function applyStructuralChecks(
  result: SchemaValidationResult,
): SchemaValidationResult {
  if (result.deprecated) return result;

  if (result.type === "BreadcrumbList") return checkBreadcrumbList(result);
  if (result.type === "WebSite")        return checkWebSite(result);
  if (result.type === "Product")        return checkProductOffers(result);

  return result;
}

function getDocsUrl(type: string): string {
  return RICH_RESULT_DOCS[type] ?? FALLBACK_DOCS;
}

function computeRichResult(result: SchemaValidationResult): RichResultStatus {
  const docsUrl = getDocsUrl(result.type);

  // Fully deprecated types
  if (result.deprecated) {
    const reason =
      DEPRECATED_MESSAGES[result.type] ??
      "This schema type is deprecated and will not generate rich results.";
    return { eligible: false, reason, google_docs_url: docsUrl };
  }

  // FAQPage: not deprecated=true but functionally restricted to gov/health sites
  if (result.type === "FAQPage") {
    return { eligible: false, reason: FAQPAGE_RESTRICTION, google_docs_url: docsUrl };
  }

  if (result.rich_result_eligible) {
    return {
      eligible:        true,
      reason:          `Eligible for ${result.type} rich results in Google Search.`,
      google_docs_url: docsUrl,
    };
  }

  return {
    eligible:        false,
    reason:          buildIneligibleReason(result),
    google_docs_url: docsUrl,
  };
}

function buildIneligibleReason(result: SchemaValidationResult): string {
  if (result.properties_missing_required.length > 0) {
    return `Missing required properties: ${result.properties_missing_required.join(", ")}.`;
  }
  if (result.errors.length > 0) {
    return "Schema has validation errors that prevent rich result eligibility.";
  }
  // Look for a warning that mentions a property required for rich results
  const richWarn = result.warnings.find((w) =>
    w.message.includes("required for rich results"),
  );
  if (richWarn) {
    return `Missing properties required for rich results: ${richWarn.property}.`;
  }
  return "Rich result criteria not met. See documentation for requirements.";
}

// ============================================================
// Structural checks
// ============================================================

function checkBreadcrumbList(
  result: SchemaValidationResult,
): SchemaValidationResult {
  const items = result.raw_jsonld["itemListElement"];
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ...result,
      rich_result_eligible: false,
      errors: [
        ...result.errors,
        {
          severity:        "error" as const,
          property:        "itemListElement",
          message:         "itemListElement must be a non-empty array of ListItem objects",
          fix:             `"itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" }]`,
          google_docs_url: getDocsUrl("BreadcrumbList"),
        },
      ],
    };
  }
  return result;
}

function checkWebSite(result: SchemaValidationResult): SchemaValidationResult {
  const action = result.raw_jsonld["potentialAction"];
  if (!action) return result; // already flagged as warning by rules-engine

  const hasUrlTemplate =
    typeof action === "object" &&
    action !== null &&
    !Array.isArray(action) &&
    (
      "urlTemplate" in (action as Record<string, unknown>) ||
      (
        typeof (action as Record<string, unknown>)["target"] === "object" &&
        (action as Record<string, unknown>)["target"] !== null &&
        "urlTemplate" in (
          (action as Record<string, unknown>)["target"] as Record<string, unknown>
        )
      )
    );

  if (!hasUrlTemplate) {
    return {
      ...result,
      rich_result_eligible: false,
      warnings: [
        ...result.warnings,
        {
          severity:        "warning" as const,
          property:        "potentialAction.urlTemplate",
          message:         "SearchAction must include a urlTemplate for Sitelinks Searchbox eligibility",
          fix:             `"potentialAction": { "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "https://example.com/search?q={search_term_string}" }, "query-input": "required name=search_term_string" }`,
          google_docs_url: getDocsUrl("WebSite"),
        },
      ],
    };
  }

  return result;
}

function checkProductOffers(
  result: SchemaValidationResult,
): SchemaValidationResult {
  const offers = result.raw_jsonld["offers"];
  // No offers at all → already captured as missing recommended by rules-engine
  if (!offers || typeof offers !== "object" || Array.isArray(offers)) {
    return result;
  }

  const offersObj = offers as Record<string, unknown>;
  const missing: string[] = [];
  if (!offersObj["price"] && !offersObj["priceRange"]) missing.push("price");
  if (!offersObj["availability"]) missing.push("availability");

  if (missing.length === 0) return result;

  return {
    ...result,
    rich_result_eligible: false,
    warnings: [
      ...result.warnings,
      {
        severity:        "warning" as const,
        property:        "offers",
        message:         `Offers is missing properties required for rich results: ${missing.join(", ")}.`,
        fix:             `"offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "availability": "https://schema.org/InStock" }`,
        google_docs_url: getDocsUrl("Product"),
      },
    ],
  };
}
