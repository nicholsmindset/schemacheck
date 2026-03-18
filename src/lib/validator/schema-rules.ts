/**
 * schema-rules.ts
 *
 * Core validation engine (v3). Supports 35 Google Rich Result schema types
 * across four tiers (full / standard / basic) plus deprecated types.
 *
 * validation_depth is read from each rule file and passed through to the
 * API response so developers know how thorough the validation is for each type:
 *   "full"     — Tier 1: deep nested checks, format validation, rich fix suggestions
 *   "standard" — Tier 2: required + recommended checks with type validation
 *   "basic"    — Tier 3–4 + deprecated: required property checks only
 */

import { resolveType } from "./parser";
import type { JsonLdObject, SchemaValidationResult, ValidationIssue } from "./types";

// ── Tier 1: Full validation ────────────────────────────────────────────────
import ArticleRuleRaw           from "@/data/schema-rules/Article.json";
import NewsArticleRuleRaw       from "@/data/schema-rules/NewsArticle.json";
import BlogPostingRuleRaw       from "@/data/schema-rules/BlogPosting.json";
import ProductRuleRaw           from "@/data/schema-rules/Product.json";
import LocalBizRuleRaw          from "@/data/schema-rules/LocalBusiness.json";
import OrgRuleRaw               from "@/data/schema-rules/Organization.json";
import BreadcrumbRuleRaw        from "@/data/schema-rules/BreadcrumbList.json";
import WebSiteRuleRaw           from "@/data/schema-rules/WebSite.json";
import FAQPageRuleRaw           from "@/data/schema-rules/FAQPage.json";

// ── Tier 2: Standard validation ───────────────────────────────────────────
import ReviewRuleRaw            from "@/data/schema-rules/Review.json";
import RecipeRuleRaw            from "@/data/schema-rules/Recipe.json";
import EventRuleRaw             from "@/data/schema-rules/Event.json";
import VideoObjectRuleRaw       from "@/data/schema-rules/VideoObject.json";
import SoftwareAppRuleRaw       from "@/data/schema-rules/SoftwareApplication.json";
import JobPostingRuleRaw        from "@/data/schema-rules/JobPosting.json";
import CourseRuleRaw            from "@/data/schema-rules/Course.json";
import ItemListRuleRaw          from "@/data/schema-rules/ItemList.json";
import QAPageRuleRaw            from "@/data/schema-rules/QAPage.json";
import ProductGroupRuleRaw      from "@/data/schema-rules/ProductGroup.json";

// ── Tier 3: Basic validation ──────────────────────────────────────────────
import BookRuleRaw              from "@/data/schema-rules/Book.json";
import DatasetRuleRaw           from "@/data/schema-rules/Dataset.json";
import DiscussionForumRuleRaw   from "@/data/schema-rules/DiscussionForumPosting.json";
import EmployerRatingRuleRaw    from "@/data/schema-rules/EmployerAggregateRating.json";
import MovieRuleRaw             from "@/data/schema-rules/Movie.json";
import ImageObjectRuleRaw       from "@/data/schema-rules/ImageObject.json";
import ProfilePageRuleRaw       from "@/data/schema-rules/ProfilePage.json";
import MerchantReturnRuleRaw    from "@/data/schema-rules/MerchantReturnPolicy.json";
import ShippingRuleRaw          from "@/data/schema-rules/OfferShippingDetails.json";
import ClaimReviewRuleRaw       from "@/data/schema-rules/ClaimReview.json";

// ── Tier 4: Basic validation ──────────────────────────────────────────────
import MathSolverRuleRaw        from "@/data/schema-rules/MathSolver.json";
import QuizRuleRaw              from "@/data/schema-rules/Quiz.json";
import LoyaltyProgramRuleRaw    from "@/data/schema-rules/LoyaltyProgram.json";
import VacationRentalRuleRaw    from "@/data/schema-rules/VacationRental.json";
import CreativeWorkRuleRaw      from "@/data/schema-rules/CreativeWork.json";

// ── Deprecated: validated with deprecation warnings ───────────────────────
import HowToRuleRaw             from "@/data/schema-rules/HowTo.json";
import SpecialAnnouncementRuleRaw from "@/data/schema-rules/SpecialAnnouncement.json";
import VehicleRuleRaw           from "@/data/schema-rules/Vehicle.json";

// ============================================================
// Rule data types
// ============================================================

interface PropertyRule {
  property:            string;
  type:                "string" | "date" | "url" | "object" | "array";
  max_length?:         number;
  format?:             string;
  description:         string;
  rich_result_required?: boolean;
  expected_type?:      string[];
  nested_recommended?: string[];
}

interface SchemaRuleV2 {
  type:                  string;
  also_matches?:         string[];
  validation_depth?:     "full" | "standard" | "basic";
  google_docs_url:       string;
  required_properties:   PropertyRule[];
  recommended_properties: PropertyRule[];
  deprecated:            boolean;
  deprecation_note:      string | null;
}

// ============================================================
// Rule registry — built once at module load
// ============================================================

const CANONICAL_RULES: SchemaRuleV2[] = [
  // Tier 1
  ArticleRuleRaw           as unknown as SchemaRuleV2,
  NewsArticleRuleRaw       as unknown as SchemaRuleV2,
  BlogPostingRuleRaw       as unknown as SchemaRuleV2,
  ProductRuleRaw           as unknown as SchemaRuleV2,
  LocalBizRuleRaw          as unknown as SchemaRuleV2,
  OrgRuleRaw               as unknown as SchemaRuleV2,
  BreadcrumbRuleRaw        as unknown as SchemaRuleV2,
  WebSiteRuleRaw           as unknown as SchemaRuleV2,
  FAQPageRuleRaw           as unknown as SchemaRuleV2,
  // Tier 2
  ReviewRuleRaw            as unknown as SchemaRuleV2,
  RecipeRuleRaw            as unknown as SchemaRuleV2,
  EventRuleRaw             as unknown as SchemaRuleV2,
  VideoObjectRuleRaw       as unknown as SchemaRuleV2,
  SoftwareAppRuleRaw       as unknown as SchemaRuleV2,
  JobPostingRuleRaw        as unknown as SchemaRuleV2,
  CourseRuleRaw            as unknown as SchemaRuleV2,
  ItemListRuleRaw          as unknown as SchemaRuleV2,
  QAPageRuleRaw            as unknown as SchemaRuleV2,
  ProductGroupRuleRaw      as unknown as SchemaRuleV2,
  // Tier 3
  BookRuleRaw              as unknown as SchemaRuleV2,
  DatasetRuleRaw           as unknown as SchemaRuleV2,
  DiscussionForumRuleRaw   as unknown as SchemaRuleV2,
  EmployerRatingRuleRaw    as unknown as SchemaRuleV2,
  MovieRuleRaw             as unknown as SchemaRuleV2,
  ImageObjectRuleRaw       as unknown as SchemaRuleV2,
  ProfilePageRuleRaw       as unknown as SchemaRuleV2,
  MerchantReturnRuleRaw    as unknown as SchemaRuleV2,
  ShippingRuleRaw          as unknown as SchemaRuleV2,
  ClaimReviewRuleRaw       as unknown as SchemaRuleV2,
  // Tier 4
  MathSolverRuleRaw        as unknown as SchemaRuleV2,
  QuizRuleRaw              as unknown as SchemaRuleV2,
  LoyaltyProgramRuleRaw    as unknown as SchemaRuleV2,
  VacationRentalRuleRaw    as unknown as SchemaRuleV2,
  CreativeWorkRuleRaw      as unknown as SchemaRuleV2,
  // Deprecated
  HowToRuleRaw             as unknown as SchemaRuleV2,
  SpecialAnnouncementRuleRaw as unknown as SchemaRuleV2,
  VehicleRuleRaw           as unknown as SchemaRuleV2,
];

/** Direct type → rule (e.g. "Article" → ArticleRule) */
export const RULE_MAP = new Map<string, SchemaRuleV2>();

/** Alias type → canonical type (e.g. "NewsArticle" → "Article") */
const ALSO_MATCHES_MAP = new Map<string, string>();

for (const rule of CANONICAL_RULES) {
  RULE_MAP.set(rule.type, rule);
  for (const alias of (rule.also_matches ?? [])) {
    ALSO_MATCHES_MAP.set(alias, rule.type);
  }
}

function findRule(type: string): SchemaRuleV2 | undefined {
  return RULE_MAP.get(type) ?? RULE_MAP.get(ALSO_MATCHES_MAP.get(type) ?? "");
}

// ============================================================
// Type validators
// ============================================================

/** ISO 8601: YYYY-MM-DD with optional T time and timezone */
const ISO8601_RE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function isAbsoluteUrl(val: string): boolean {
  try {
    const u = new URL(val);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate a single property value against its PropertyRule.
 */
function validatePropertyValue(
  value:    unknown,
  rule:     PropertyRule,
  severity: "error" | "warning",
  docsUrl:  string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { property, type } = rule;

  switch (type) {
    case "string": {
      if (typeof value !== "string" || value.trim() === "") {
        issues.push({
          severity,
          property,
          message: `'${property}' must be a non-empty string`,
          fix:     `Add "${property}": "your value" to your schema. See ${docsUrl}`,
          google_docs_url: docsUrl,
        });
      } else if (rule.max_length !== undefined && value.length > rule.max_length) {
        issues.push({
          severity,
          property,
          message: `'${property}' exceeds the maximum length of ${rule.max_length} characters (${value.length} found)`,
          fix:     `Shorten '${property}' to ${rule.max_length} characters or fewer. See ${docsUrl}`,
          google_docs_url: docsUrl,
        });
      }
      break;
    }

    case "date": {
      if (typeof value !== "string" || !ISO8601_RE.test(value.trim())) {
        issues.push({
          severity,
          property,
          message: `'${property}' must be a valid ISO 8601 date (e.g. "2024-01-15" or "2024-01-15T10:00:00Z")`,
          fix:     `Use ISO 8601 format: "${property}": "${new Date().toISOString().split("T")[0]}". See ${docsUrl}`,
          google_docs_url: docsUrl,
        });
      }
      break;
    }

    case "url": {
      if (Array.isArray(value)) {
        // Arrays of URL strings / objects are valid
      } else if (typeof value === "object" && value !== null) {
        // Object value (ImageObject, etc.) — acceptable
      } else if (typeof value === "string") {
        if (!isAbsoluteUrl(value)) {
          issues.push({
            severity,
            property,
            message: `'${property}' must be an absolute URL starting with https:// or http://`,
            fix:     `Update '${property}' to a full absolute URL, e.g. "https://example.com/image.jpg". See ${docsUrl}`,
            google_docs_url: docsUrl,
          });
        }
      } else {
        issues.push({
          severity,
          property,
          message: `'${property}' must be a URL string or image object`,
          fix:     `Provide an absolute URL or ImageObject for '${property}'. See ${docsUrl}`,
          google_docs_url: docsUrl,
        });
      }
      break;
    }

    case "object": {
      if (Array.isArray(value) || typeof value !== "object" || value === null) {
        issues.push({
          severity,
          property,
          message: `'${property}' must be an object${rule.expected_type?.length ? ` (e.g. { "@type": "${rule.expected_type[0]}", ... })` : ""}`,
          fix:     buildObjectFix(property, rule, docsUrl),
          google_docs_url: docsUrl,
        });
      } else {
        const obj = value as Record<string, unknown>;

        if (rule.expected_type && rule.expected_type.length > 0 && obj["@type"]) {
          const objType = resolveType(obj["@type"]);
          const matchesAny = rule.expected_type.some(
            (et) => objType === et || objType.startsWith(et),
          );
          if (!matchesAny) {
            issues.push({
              severity:        "warning",
              property:        `${property}.@type`,
              message:         `'${property}' has @type "${objType}" but expected one of: ${rule.expected_type.join(", ")}`,
              fix:             `Set "@type" on '${property}' to one of: ${rule.expected_type.join(", ")}. See ${docsUrl}`,
              google_docs_url: docsUrl,
            });
          }
        }

        for (const nested of (rule.nested_recommended ?? [])) {
          const nestedVal = obj[nested];
          if (nestedVal === undefined || nestedVal === null || nestedVal === "") {
            issues.push({
              severity:        "warning",
              property:        `${property}.${nested}`,
              message:         `Recommended nested property '${nested}' is missing from '${property}'`,
              fix:             `Add "${nested}": "..." inside your ${property} object. See ${docsUrl}`,
              google_docs_url: docsUrl,
            });
          }
        }
      }
      break;
    }

    case "array": {
      if (!Array.isArray(value) || value.length === 0) {
        issues.push({
          severity,
          property,
          message: `'${property}' must be a non-empty array`,
          fix:     `Provide at least one item in the '${property}' array. See ${docsUrl}`,
          google_docs_url: docsUrl,
        });
      }
      break;
    }
  }

  return issues;
}

function buildObjectFix(
  property: string,
  rule:     PropertyRule,
  docsUrl:  string,
): string {
  const typeName    = (rule.expected_type ?? ["Object"])[0];
  const nestedProps = (rule.nested_recommended ?? [])
    .slice(0, 2)
    .map((p) => `"${p}": "..."`)
    .join(", ");
  const inner = nestedProps
    ? `"@type": "${typeName}", ${nestedProps}`
    : `"@type": "${typeName}"`;
  return `Add "${property}": { ${inner} } to your schema. See ${docsUrl}`;
}

// ============================================================
// Main validator
// ============================================================

export function validateSchema(schema: JsonLdObject): SchemaValidationResult {
  const rawType       = resolveType(schema["@type"]);
  const errors:   ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const propertiesFound              = getTopLevelProperties(schema);

  // ── 1. Unknown type ───────────────────────────────────────
  const rule = findRule(rawType);
  if (!rule) {
    return {
      type:                         rawType,
      validation_depth:             "basic",
      valid:                        true,
      rich_result_eligible:         false,
      deprecated:                   false,
      deprecation_note:             null,
      errors:                       [],
      warnings: [{
        severity: "info",
        property: "@type",
        message:  `Schema type '${rawType}' is not in SchemaCheck's supported type list. Basic JSON-LD structure looks valid.`,
        fix:      "See https://schema.org/docs/full.html for the full Schema.org type list.",
      }],
      properties_found:             propertiesFound,
      properties_missing_required:  [],
      properties_missing_recommended: [],
      raw_jsonld:                   schema,
    };
  }

  const validationDepth = rule.validation_depth ?? "basic";

  // ── 2. Deprecation warning ────────────────────────────────
  if (rule.deprecated || rule.deprecation_note) {
    warnings.push({
      severity:        "warning",
      property:        "@type",
      message:         rule.deprecation_note ?? `Schema type '${rawType}' is deprecated or restricted.`,
      fix:             "Check Google's structured data documentation to confirm eligibility for your site.",
      google_docs_url: rule.google_docs_url,
    });
  }

  // ── 3. Required properties ────────────────────────────────
  const missingRequired: string[] = [];

  for (const propRule of rule.required_properties) {
    if (!hasProperty(schema, propRule.property)) {
      missingRequired.push(propRule.property);
      errors.push({
        severity:        "error",
        property:        propRule.property,
        message:         `Required property '${propRule.property}' is missing`,
        fix:             buildRequiredFix(propRule, rawType, rule.google_docs_url),
        google_docs_url: rule.google_docs_url,
      });
    } else {
      const typeIssues = validatePropertyValue(
        schema[propRule.property],
        propRule,
        "error",
        rule.google_docs_url,
      );
      for (const issue of typeIssues) {
        if (issue.severity === "error") {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }
  }

  // ── 4. Recommended properties ─────────────────────────────
  const missingRecommended: string[] = [];

  for (const propRule of rule.recommended_properties) {
    if (!hasProperty(schema, propRule.property)) {
      missingRecommended.push(propRule.property);
      warnings.push({
        severity:        "warning",
        property:        propRule.property,
        message:         `Recommended property '${propRule.property}' is missing${propRule.rich_result_required ? " — required for rich results" : ""}`,
        fix:             buildRequiredFix(propRule, rawType, rule.google_docs_url),
        google_docs_url: rule.google_docs_url,
      });
    } else {
      const typeIssues = validatePropertyValue(
        schema[propRule.property],
        propRule,
        "warning",
        rule.google_docs_url,
      );
      warnings.push(...typeIssues);
    }
  }

  // ── 5. Rich result eligibility ────────────────────────────
  const richResultProps = [
    ...rule.required_properties.filter((p) => p.rich_result_required),
    ...rule.recommended_properties.filter((p) => p.rich_result_required),
  ];
  const richResultEligible =
    !rule.deprecated &&
    richResultProps.every((p) => hasProperty(schema, p.property));

  return {
    type:                         rawType,
    validation_depth:             validationDepth,
    valid:                        errors.length === 0,
    rich_result_eligible:         richResultEligible,
    deprecated:                   rule.deprecated,
    deprecation_note:             rule.deprecation_note,
    errors,
    warnings,
    properties_found:             propertiesFound,
    properties_missing_required:  missingRequired,
    properties_missing_recommended: missingRecommended,
    raw_jsonld:                   schema,
  };
}

// ============================================================
// Helpers
// ============================================================

function getTopLevelProperties(schema: JsonLdObject): string[] {
  return Object.keys(schema).filter((k) => !k.startsWith("@") || k === "@id");
}

function hasProperty(schema: JsonLdObject, prop: string): boolean {
  const val = schema[prop];
  if (val === undefined || val === null || val === "") return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}

function buildRequiredFix(
  propRule:   PropertyRule,
  schemaType: string,
  docsUrl:    string,
): string {
  const examples: Record<string, string> = {
    headline:         `"headline": "Your Article Title Here"`,
    author:           `"author": { "@type": "Person", "name": "Author Name" }`,
    datePublished:    `"datePublished": "${new Date().toISOString().split("T")[0]}"`,
    datePosted:       `"datePosted": "${new Date().toISOString().split("T")[0]}"`,
    image:            `"image": "https://example.com/image.jpg"`,
    thumbnailUrl:     `"thumbnailUrl": "https://example.com/thumbnail.jpg"`,
    name:             `"name": "Your ${schemaType} Name"`,
    title:            `"title": "Job Title"`,
    url:              `"url": "https://example.com"`,
    logo:             `"logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }`,
    offers:           `"offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" }`,
    address:          `"address": { "@type": "PostalAddress", "streetAddress": "123 Main St", "addressLocality": "City", "addressRegion": "ST", "postalCode": "12345", "addressCountry": "US" }`,
    mainEntity:       `"mainEntity": [{ "@type": "Question", "name": "Your question?", "acceptedAnswer": { "@type": "Answer", "text": "Your answer." } }]`,
    itemListElement:  `"itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" }]`,
    potentialAction:  `"potentialAction": { "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "https://example.com/search?q={search_term_string}" }, "query-input": "required name=search_term_string" }`,
    recipeInstructions: `"recipeInstructions": [{ "@type": "HowToStep", "text": "Step 1 description." }]`,
    startDate:        `"startDate": "${new Date().toISOString()}"`,
    location:         `"location": { "@type": "Place", "name": "Venue Name", "address": { "@type": "PostalAddress", "addressLocality": "City" } }`,
    description:      `"description": "A description of your ${schemaType}."`,
    uploadDate:       `"uploadDate": "${new Date().toISOString().split("T")[0]}"`,
    hiringOrganization: `"hiringOrganization": { "@type": "Organization", "name": "Company Name" }`,
    jobLocation:      `"jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "City", "addressCountry": "US" } }`,
    provider:         `"provider": { "@type": "Organization", "name": "Provider Name" }`,
    itemReviewed:     `"itemReviewed": { "@type": "Product", "name": "Item Name" }`,
    reviewRating:     `"reviewRating": { "@type": "Rating", "ratingValue": "4", "bestRating": "5" }`,
    ratingValue:      `"ratingValue": "4.5"`,
    ratingCount:      `"ratingCount": "120"`,
    contentUrl:       `"contentUrl": "https://example.com/video.mp4"`,
    applicableCountry: `"applicableCountry": "US"`,
    returnPolicyCategory: `"returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow"`,
    shippingRate:     `"shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" }`,
    shippingDestination: `"shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" }`,
    deliveryTime:     `"deliveryTime": { "@type": "ShippingDeliveryTime", "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" } }`,
    claimReviewed:    `"claimReviewed": "The claim being fact-checked."`,
    hasVariant:       `"hasVariant": [{ "@type": "Product", "name": "Variant Name", "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" } }]`,
    variesBy:         `"variesBy": "https://schema.org/color"`,
    hasPart:          `"hasPart": [{ "@type": "WebPageElement", "isAccessibleForFree": false, "cssSelector": ".paywall" }]`,
    isAccessibleForFree: `"isAccessibleForFree": "False"`,
    vehicleIdentificationNumber: `"vehicleIdentificationNumber": "1HGCM82633A004352"`,
    step:             `"step": [{ "@type": "HowToStep", "text": "Step description." }]`,
    hasMembershipDataType: `"hasMembershipDataType": [{ "@type": "LoyaltyMembership", "name": "Silver" }]`,
  };

  const example = examples[propRule.property] ?? `"${propRule.property}": "..."`;
  return `Add ${example} to your ${schemaType} schema. See ${docsUrl}`;
}
