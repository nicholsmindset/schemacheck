import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Supported Schema Types | SchemaCheck",
  description:
    "All 35 Schema.org structured data types supported by SchemaCheck's validation API. Validates against Google's current rich result requirements — Article, Product, LocalBusiness, Recipe, Event, and 30 more.",
  openGraph: {
    title: "Supported Schema Types | SchemaCheck",
    description:
      "All 35 Schema.org types supported by SchemaCheck. Validates against Google's rich result requirements.",
  },
};

const APP_URL = "https://schemacheck.dev";

type TypeStatus = "supported" | "coming_soon" | "planned" | "deprecated";

interface SchemaTypeEntry {
  type: string;
  slug?: string;
  alsoMatches?: string[];
  status: TypeStatus;
  tier: number;
  richResult: string;
  googleDocsUrl: string;
  note?: string;
}

const TYPES: SchemaTypeEntry[] = [
  // ── Tier 1: Supported ────────────────────────────────────────────────────────
  {
    type: "Article",
    slug: "article",
    alsoMatches: ["NewsArticle", "BlogPosting", "TechArticle", "ScholarlyArticle"],
    status: "supported",
    tier: 1,
    richResult: "Article rich result",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/article",
  },
  {
    type: "Product",
    slug: "product",
    alsoMatches: [],
    status: "supported",
    tier: 1,
    richResult: "Product snippet, merchant listing",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/product",
  },
  {
    type: "LocalBusiness",
    slug: "local-business",
    alsoMatches: ["Restaurant", "Store", "Hotel", "MedicalBusiness"],
    status: "supported",
    tier: 1,
    richResult: "Business info panel",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/local-business",
  },
  {
    type: "Organization",
    slug: "organization",
    alsoMatches: ["Corporation", "EducationalOrganization", "NGO"],
    status: "supported",
    tier: 1,
    richResult: "Knowledge panel",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/organization",
  },
  {
    type: "BreadcrumbList",
    slug: "breadcrumb",
    alsoMatches: [],
    status: "supported",
    tier: 1,
    richResult: "Breadcrumb trail in search results",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb",
  },
  {
    type: "WebSite",
    slug: "website",
    alsoMatches: [],
    status: "supported",
    tier: 1,
    richResult: "Sitelinks Searchbox",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox",
  },
  {
    type: "FAQPage",
    slug: "faq",
    alsoMatches: [],
    status: "supported",
    tier: 1,
    richResult: "FAQ dropdown (gov/health only since 2024)",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
    note: "Restricted to gov/health since 2024",
  },
  // ── Tier 2: Coming Soon ───────────────────────────────────────────────────────
  {
    type: "Review",
    slug: "review",
    alsoMatches: ["AggregateRating"],
    status: "coming_soon",
    tier: 2,
    richResult: "Star ratings in search",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/review-snippet",
  },
  {
    type: "Recipe",
    slug: "recipe",
    alsoMatches: [],
    status: "coming_soon",
    tier: 2,
    richResult: "Recipe rich card",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/recipe",
  },
  {
    type: "Event",
    slug: "event",
    alsoMatches: ["MusicEvent", "SportsEvent", "EducationEvent"],
    status: "coming_soon",
    tier: 2,
    richResult: "Event listing",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/event",
  },
  {
    type: "VideoObject",
    slug: "video",
    alsoMatches: ["Clip"],
    status: "coming_soon",
    tier: 2,
    richResult: "Video rich result",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/video",
  },
  {
    type: "SoftwareApplication",
    slug: "software-app",
    alsoMatches: ["WebApplication", "MobileApplication", "VideoGame"],
    status: "coming_soon",
    tier: 2,
    richResult: "App rich result",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/software-app",
  },
  {
    type: "JobPosting",
    slug: "job-posting",
    alsoMatches: [],
    status: "coming_soon",
    tier: 2,
    richResult: "Job listing",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/job-posting",
  },
  {
    type: "Course",
    slug: "course",
    alsoMatches: ["CourseInstance"],
    status: "coming_soon",
    tier: 2,
    richResult: "Course info in search",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/course-info",
  },
  {
    type: "ItemList",
    slug: "carousel",
    alsoMatches: [],
    status: "coming_soon",
    tier: 2,
    richResult: "Carousel rich result",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/carousel",
  },
  {
    type: "QAPage",
    slug: "qa-page",
    alsoMatches: [],
    status: "coming_soon",
    tier: 2,
    richResult: "Q&A rich result",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/qapage",
  },
  {
    type: "ProductGroup",
    slug: "product-variants",
    alsoMatches: [],
    status: "coming_soon",
    tier: 2,
    richResult: "Product variants",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/product-variants",
  },
  // ── Tier 3: Planned ──────────────────────────────────────────────────────────
  {
    type: "Book",
    slug: "book",
    alsoMatches: ["Audiobook"],
    status: "planned",
    tier: 3,
    richResult: "Book actions",
    googleDocsUrl: "https://developers.google.com/search/docs/appearance/structured-data/book",
  },
  {
    type: "Dataset",
    slug: "dataset",
    alsoMatches: ["DataCatalog"],
    status: "planned",
    tier: 3,
    richResult: "Dataset snippet",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/dataset",
  },
  {
    type: "DiscussionForumPosting",
    slug: "discussion-forum",
    alsoMatches: [],
    status: "planned",
    tier: 3,
    richResult: "Discussion forum",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/discussion-forum",
  },
  {
    type: "EmployerAggregateRating",
    slug: "employer-rating",
    alsoMatches: [],
    status: "planned",
    tier: 3,
    richResult: "Employer rating",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/employer-aggregate-rating",
  },
  {
    type: "Movie",
    slug: "movie",
    alsoMatches: [],
    status: "planned",
    tier: 3,
    richResult: "Movie carousel",
    googleDocsUrl: "https://developers.google.com/search/docs/appearance/structured-data/movie",
  },
  {
    type: "ImageObject",
    slug: "image-metadata",
    alsoMatches: [],
    status: "planned",
    tier: 3,
    richResult: "Image license metadata",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata",
  },
  {
    type: "ProfilePage",
    slug: "profile-page",
    alsoMatches: [],
    status: "planned",
    tier: 3,
    richResult: "Profile page",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/profile-page",
  },
  {
    type: "MerchantReturnPolicy",
    slug: "merchant-return",
    alsoMatches: [],
    status: "planned",
    tier: 3,
    richResult: "Merchant return policy",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing",
  },
  {
    type: "OfferShippingDetails",
    slug: "shipping",
    alsoMatches: [],
    status: "planned",
    tier: 3,
    richResult: "Merchant shipping info",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing",
  },
  {
    type: "ClaimReview",
    slug: "fact-check",
    alsoMatches: [],
    status: "planned",
    tier: 3,
    richResult: "Fact check (restricted)",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/factcheck",
    note: "Restricted to eligible fact-checking organizations",
  },
  // ── Tier 4: Planned ──────────────────────────────────────────────────────────
  {
    type: "MathSolver",
    slug: "math-solver",
    alsoMatches: [],
    status: "planned",
    tier: 4,
    richResult: "Math solver",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/math-solvers",
  },
  {
    type: "Quiz",
    slug: "education-qa",
    alsoMatches: [],
    status: "planned",
    tier: 4,
    richResult: "Education Q&A",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/education-qa",
  },
  {
    type: "LoyaltyProgram",
    slug: "loyalty-program",
    alsoMatches: [],
    status: "planned",
    tier: 4,
    richResult: "Loyalty program",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/loyalty-program",
  },
  {
    type: "VacationRental",
    slug: "vacation-rental",
    alsoMatches: ["LodgingBusiness", "Accommodation"],
    status: "planned",
    tier: 4,
    richResult: "Vacation rental",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/vacation-rental",
  },
  {
    type: "CreativeWork",
    slug: "subscription-content",
    alsoMatches: [],
    status: "planned",
    tier: 4,
    richResult: "Subscription/paywalled content",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/subscription-and-paywalled-content",
    note: "Used for subscription/paywalled content markup",
  },
  // ── Deprecated ───────────────────────────────────────────────────────────────
  {
    type: "HowTo",
    slug: "how-to",
    alsoMatches: [],
    status: "deprecated",
    tier: 0,
    richResult: "Retired (Aug 2024)",
    googleDocsUrl: "https://developers.google.com/search/docs/appearance/structured-data/how-to",
    note: "Retired by Google in August 2024",
  },
  {
    type: "SpecialAnnouncement",
    slug: "special-announcement",
    alsoMatches: [],
    status: "deprecated",
    tier: 0,
    richResult: "Retired (2025)",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/special-announcements",
    note: "Retired by Google in 2025",
  },
  {
    type: "Vehicle",
    slug: "vehicle-listing",
    alsoMatches: ["Car"],
    status: "deprecated",
    tier: 0,
    richResult: "Retired (2025)",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/vehicle-listing",
    note: "Vehicle Listing rich results retired by Google in 2025",
  },
];

const STATUS_LABELS: Record<TypeStatus, string> = {
  supported: "Supported",
  coming_soon: "Coming Soon",
  planned: "Planned",
  deprecated: "Deprecated",
};

const STATUS_STYLES: Record<TypeStatus, string> = {
  supported:
    "bg-green-500/10 text-green-400 ring-1 ring-green-500/30",
  coming_soon:
    "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30",
  planned:
    "bg-gray-700/40 text-gray-400 ring-1 ring-gray-600/40",
  deprecated:
    "bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/30",
};

const STATUS_ORDER: TypeStatus[] = ["supported", "coming_soon", "planned", "deprecated"];

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SchemaCheck",
  url: APP_URL,
  description:
    "REST API for validating Schema.org structured data against Google's rich result requirements. Supports 35 schema types including Article, Product, LocalBusiness, Recipe, Event, and more.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});

export default function SchemaTypesPage() {
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    types: TYPES.filter((t) => t.status === status),
  }));

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
            <a href="/" className="hover:text-gray-400">SchemaCheck</a>
            <span>/</span>
            <span className="text-gray-400">Schema Types</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Supported Schema Types
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            SchemaCheck validates structured data against{" "}
            <a
              href="https://schema.org/docs/full.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Schema.org V29.4
            </a>{" "}
            (827 types, 1,528 properties) and Google&apos;s current rich result requirements. We
            currently validate{" "}
            <span className="text-white font-medium">35 schema types</span> across 4 tiers of
            validation depth.
          </p>
        </div>

        {grouped.map(({ status, types }) => (
          types.length === 0 ? null : (
            <section key={status} className="mb-12">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {STATUS_LABELS[status]}
                <span className="ml-2 text-gray-600 font-normal normal-case tracking-normal">
                  ({types.length} types)
                </span>
              </h2>

              <div className="rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-[#111118]">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Schema Type
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                        Google Rich Result
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">
                        Google Docs
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {types.map((t, i) => (
                      <tr
                        key={i}
                        className="hover:bg-[#111118] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            {t.slug ? (
                              <Link
                                href={`/schema-types/${t.slug}`}
                                className="font-medium text-white hover:text-indigo-300 transition-colors"
                              >
                                {t.type}
                              </Link>
                            ) : (
                              <span className="font-medium text-gray-300">{t.type}</span>
                            )}
                            {t.alsoMatches && t.alsoMatches.length > 0 && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                also: {t.alsoMatches.join(", ")}
                              </p>
                            )}
                            {t.note && (
                              <p className="text-xs text-yellow-600 mt-0.5">{t.note}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 hidden sm:table-cell">
                          {t.richResult}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[t.status]}`}
                          >
                            {STATUS_LABELS[t.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <a
                            href={t.googleDocsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-600 hover:text-indigo-400 transition-colors"
                          >
                            Google Docs →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        ))}

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-gray-800 bg-[#111118] p-8 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">
            Need a type we don&apos;t support yet?
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            We add new schema types based on demand. Let us know which ones you need and we&apos;ll
            prioritize accordingly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:support@schemacheck.dev?subject=Schema type request"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Request a type
            </a>
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-300 text-sm font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
