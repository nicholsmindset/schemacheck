import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog | SchemaCheck",
  description:
    "SchemaCheck product updates — new schema types, API improvements, and bug fixes. All changes listed newest first.",
};

type Tag = "launch" | "feature" | "improvement" | "fix" | "docs";

interface ChangelogEntry {
  date: string;
  title: string;
  description: string;
  tag: Tag;
}

const TAG_STYLES: Record<Tag, string> = {
  launch:      "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30",
  feature:     "bg-green-500/15 text-green-300 ring-1 ring-green-500/30",
  improvement: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30",
  fix:         "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
  docs:        "bg-gray-500/15 text-gray-300 ring-1 ring-gray-500/30",
};

const entries: ChangelogEntry[] = [
  {
    date: "March 2026",
    title: "35 schema types now validated",
    description:
      "Expanded coverage from 7 to 35 Schema.org types across 4 validation tiers. New types include Recipe, Event, VideoObject, JobPosting, Course, Review, ItemList, QAPage, ProductGroup (Tier 2 — standard validation), plus Book, Dataset, Movie, DiscussionForumPosting, EmployerAggregateRating, ProfilePage, ImageObject, MerchantReturnPolicy, OfferShippingDetails, ClaimReview (Tier 3), MathSolver, Quiz, LoyaltyProgram, VacationRental, CreativeWork (Tier 4), and HowTo, SpecialAnnouncement, Vehicle (deprecated — validated with warnings). Each type returns validation_depth in the API response.",
    tag: "feature",
  },
  {
    date: "March 2026",
    title: "llms.txt published for AI tool discovery",
    description:
      "Added /llms.txt and /llms-full.txt — concise and full-length API references optimized for LLM context windows. AI tools and code assistants can now discover and understand the SchemaCheck API without scraping HTML.",
    tag: "docs",
  },
  {
    date: "March 2026",
    title: "MCP server published to npm",
    description:
      "The SchemaCheck MCP (Model Context Protocol) server is now available on npm. Add it to your Claude Desktop or Cursor config and AI assistants can call the validation API natively — no tool registration code required.",
    tag: "feature",
  },
  {
    date: "March 2026",
    title: "9 schema types supported at launch",
    description:
      "Article, NewsArticle, BlogPosting, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, and FAQPage — each with required/recommended property validation, rich result eligibility checking, and Google deprecation warnings.",
    tag: "feature",
  },
  {
    date: "March 2026",
    title: "SchemaCheck API launched",
    description:
      "Public launch of the SchemaCheck REST API. Validate Schema.org JSON-LD structured data via GET (URL) or POST (raw JSON-LD). Returns per-property error messages, fix suggestions, rich result eligibility, and a 0–100 health score. Free plan: 100 validations/month.",
    tag: "launch",
  },
];

function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TAG_STYLES[tag]}`}>
      {tag.charAt(0).toUpperCase() + tag.slice(1)}
    </span>
  );
}

export default function ChangelogPage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-white">Changelog</h1>
            <a
              href="/changelog/rss.xml"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors"
              title="Subscribe to RSS feed"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="3" cy="13" r="1.5" />
                <path d="M3 8.5A5.5 5.5 0 0 1 8.5 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M3 4A10 10 0 0 1 13 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              RSS
            </a>
          </div>
          <p className="text-gray-400">
            All product updates, listed newest first.{" "}
            <Link href="/#signup" className="text-indigo-400 hover:text-indigo-300">
              Subscribe for updates →
            </Link>
          </p>
        </div>

        {/* Entries */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-800" />

          <div className="space-y-10 pl-8">
            {entries.map((entry, i) => (
              <div key={i} className="relative">
                {/* Dot on timeline */}
                <div className="absolute -left-[2.125rem] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#0a0a0f]" />

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <time className="text-xs text-gray-500 font-medium">{entry.date}</time>
                  <TagBadge tag={entry.tag} />
                </div>
                <h2 className="text-base font-semibold text-white mb-1.5">{entry.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{entry.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe CTA */}
        <div className="mt-16 p-5 rounded-xl border border-gray-800 bg-[#111118]">
          <p className="text-sm font-medium text-white mb-1">Get notified of updates</p>
          <p className="text-xs text-gray-500 mb-3">
            New schema types, API improvements, and breaking change notices.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/#signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Sign up free →
            </Link>
            <a
              href="/changelog/rss.xml"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300 text-xs rounded-lg transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="3" cy="13" r="1.5" />
                <path d="M3 8.5A5.5 5.5 0 0 1 8.5 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M3 4A10 10 0 0 1 13 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              RSS feed
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
