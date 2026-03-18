#!/usr/bin/env node
/**
 * SchemaCheck MCP Server
 *
 * Exposes the SchemaCheck validation API as a single MCP tool so AI agents
 * (Claude, Cursor, etc.) can validate Schema.org structured data natively.
 *
 * Usage: Set SCHEMACHECK_API_KEY env var, then run the server.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.SCHEMACHECK_API_KEY;
const API_BASE = process.env.SCHEMACHECK_API_BASE ?? "https://schemacheck.dev/api/v1";

if (!API_KEY) {
  console.error("[schemacheck-mcp] Error: SCHEMACHECK_API_KEY environment variable is required.");
  process.exit(1);
}

const server = new Server(
  {
    name: "schemacheck",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================
// Supported types data (used by list_supported_types tool)
// ============================================================

const SUPPORTED_TYPES = [
  // Tier 1 — Supported now
  { type: "Article", also_matches: ["NewsArticle", "BlogPosting", "TechArticle", "ScholarlyArticle"], status: "supported", tier: 1, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/article" },
  { type: "Product", also_matches: ["ProductGroup"], status: "supported", tier: 1, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/product" },
  { type: "LocalBusiness", also_matches: ["Restaurant", "Store", "Hotel", "LodgingBusiness", "MedicalBusiness", "FoodEstablishment"], status: "supported", tier: 1, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/local-business" },
  { type: "Organization", also_matches: ["Corporation", "EducationalOrganization", "GovernmentOrganization", "NGO", "SportsOrganization"], status: "supported", tier: 1, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/organization" },
  { type: "BreadcrumbList", also_matches: [], status: "supported", tier: 1, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb" },
  { type: "WebSite", also_matches: [], status: "supported", tier: 1, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox" },
  { type: "FAQPage", also_matches: [], status: "supported", tier: 1, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/faqpage", note: "Restricted to government and health websites since 2024; still validated with deprecation warning" },
  // Tier 2 — Coming soon
  { type: "Review", also_matches: ["AggregateRating"], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/review-snippet" },
  { type: "Recipe", also_matches: [], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/recipe" },
  { type: "Event", also_matches: ["MusicEvent", "SportsEvent", "EducationEvent"], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/event" },
  { type: "VideoObject", also_matches: ["Clip"], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/video" },
  { type: "SoftwareApplication", also_matches: ["WebApplication", "MobileApplication", "VideoGame"], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/software-app" },
  { type: "JobPosting", also_matches: [], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/job-posting" },
  { type: "Course", also_matches: ["CourseInstance"], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/course-info" },
  { type: "ItemList", also_matches: [], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/carousel" },
  { type: "QAPage", also_matches: [], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/qapage" },
  { type: "ProductGroup", also_matches: [], status: "coming_soon", tier: 2, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/product-variants" },
  // Tier 3 — Planned
  { type: "Book", also_matches: ["Audiobook"], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/book" },
  { type: "Dataset", also_matches: ["DataCatalog"], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/dataset" },
  { type: "DiscussionForumPosting", also_matches: [], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/discussion-forum" },
  { type: "EmployerAggregateRating", also_matches: [], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/employer-aggregate-rating" },
  { type: "Movie", also_matches: [], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/movie" },
  { type: "ImageObject", also_matches: [], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata" },
  { type: "ProfilePage", also_matches: [], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/profile-page" },
  { type: "MerchantReturnPolicy", also_matches: [], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing" },
  { type: "OfferShippingDetails", also_matches: [], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing" },
  { type: "ClaimReview", also_matches: [], status: "planned", tier: 3, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/factcheck", note: "Restricted to approved fact-checking organizations" },
  // Tier 4 — Future
  { type: "MathSolver", also_matches: [], status: "planned", tier: 4, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/math-solvers" },
  { type: "Quiz", also_matches: [], status: "planned", tier: 4, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/education-qa" },
  { type: "LoyaltyProgram", also_matches: [], status: "planned", tier: 4, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/loyalty-program" },
  { type: "VacationRental", also_matches: ["LodgingBusiness", "Accommodation"], status: "planned", tier: 4, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/vacation-rental" },
  { type: "CreativeWork", also_matches: [], status: "planned", tier: 4, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/subscription-and-paywalled-content", note: "Used for subscription/paywalled content markup" },
  // Deprecated — validated with warnings
  { type: "HowTo", also_matches: [], status: "deprecated", tier: 0, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/how-to", note: "Retired by Google in August 2024" },
  { type: "SpecialAnnouncement", also_matches: [], status: "deprecated", tier: 0, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/special-announcements", note: "Retired by Google in 2025" },
  { type: "Vehicle", also_matches: ["Car"], status: "deprecated", tier: 0, google_docs_url: "https://developers.google.com/search/docs/appearance/structured-data/vehicle-listing", note: "Vehicle Listing rich results retired by Google in 2025" },
];

// ============================================================
// Tool definitions
// ============================================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "validate_schema",
      description:
        "Validate Schema.org structured data (JSON-LD) for any URL or raw markup. Checks against Google Search's current rich result requirements for 35 schema types across 4 validation tiers: Tier 1 full validation (Article, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, FAQPage), Tier 2 standard validation (Review, Recipe, Event, VideoObject, SoftwareApplication, JobPosting, Course, ItemList, QAPage, ProductGroup), Tier 3 basic validation (Book, Dataset, Movie, DiscussionForumPosting, EmployerAggregateRating, ProfilePage, ImageObject, MerchantReturnPolicy, OfferShippingDetails, ClaimReview), Tier 4 (MathSolver, Quiz, LoyaltyProgram, VacationRental, CreativeWork), and deprecated types validated with warnings (HowTo, SpecialAnnouncement, Vehicle). Returns errors, warnings, rich result eligibility, fix suggestions, and links to Google's official documentation. JSON-LD format only. Based on Schema.org vocabulary V29.4 (827 types, 1,528 properties).",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description:
              "URL of the page to validate. The page must be publicly accessible. SchemaCheck fetches the HTML server-side and extracts all <script type=\"application/ld+json\"> blocks.",
          },
          jsonld: {
            type: "object",
            description:
              "Raw JSON-LD schema object to validate. Use this to validate schema before it is published to a live URL (e.g. in a CMS, code review, or schema generation pipeline).",
          },
        },
      },
    },
    {
      name: "list_supported_types",
      description:
        "Returns all schema types currently supported by SchemaCheck, their validation status, and links to Google's rich result documentation. Call this before validate_schema to check if a given type is supported. Returns types grouped by status: supported (validates now), coming_soon (next releases), planned (roadmap), and deprecated (validated with warnings).",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

// ============================================================
// Tool handler
// ============================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_supported_types") {
    const summary = {
      types: SUPPORTED_TYPES,
      total_supported: SUPPORTED_TYPES.filter(t => t.status === "supported").length,
      total_coming_soon: SUPPORTED_TYPES.filter(t => t.status === "coming_soon").length,
      total_planned: SUPPORTED_TYPES.filter(t => t.status === "planned").length,
      total_deprecated: SUPPORTED_TYPES.filter(t => t.status === "deprecated").length,
      schema_org_version: "V29.4",
      last_updated: "2026-03-18",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      isError: false,
    };
  }

  if (name !== "validate_schema") {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const url = args?.url as string | undefined;
  const jsonld = args?.jsonld as object | undefined;

  if (!url && !jsonld) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: {
              code: "missing_input",
              message: "Provide either 'url' (string) or 'jsonld' (object) — exactly one is required.",
            },
          }),
        },
      ],
      isError: true,
    };
  }

  try {
    let response: Response;

    if (url) {
      response = await fetch(
        `${API_BASE}/validate?url=${encodeURIComponent(url)}&access_key=${API_KEY}`
      );
    } else {
      response = await fetch(`${API_BASE}/validate`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jsonld }),
      });
    }

    const data = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      isError: !response.ok,
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: { code: "internal_error", message: String(err) } }),
        },
      ],
      isError: true,
    };
  }
});

// ============================================================
// Start server
// ============================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[schemacheck-mcp] Server running on stdio");
}

main().catch((err) => {
  console.error("[schemacheck-mcp] Fatal error:", err);
  process.exit(1);
});
