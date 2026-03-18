import { NextResponse } from "next/server";

const SITE_URL = "https://schemacheck.dev";

interface ChangelogEntry {
  date: string;
  isoDate: string;
  title: string;
  description: string;
  tag: string;
}

// Kept in sync with changelog/page.tsx entries
const entries: ChangelogEntry[] = [
  {
    date: "March 2026",
    isoDate: "2026-03-18T00:00:00Z",
    title: "llms.txt published for AI tool discovery",
    description:
      "Added /llms.txt and /llms-full.txt — concise and full-length API references optimized for LLM context windows. AI tools and code assistants can now discover and understand the SchemaCheck API without scraping HTML.",
    tag: "docs",
  },
  {
    date: "March 2026",
    isoDate: "2026-03-17T00:00:00Z",
    title: "MCP server published to npm",
    description:
      "The SchemaCheck MCP (Model Context Protocol) server is now available on npm. Add it to your Claude Desktop or Cursor config and AI assistants can call the validation API natively — no tool registration code required.",
    tag: "feature",
  },
  {
    date: "March 2026",
    isoDate: "2026-03-16T00:00:00Z",
    title: "9 schema types supported at launch",
    description:
      "Article, NewsArticle, BlogPosting, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, and FAQPage — each with required/recommended property validation, rich result eligibility checking, and Google deprecation warnings.",
    tag: "feature",
  },
  {
    date: "March 2026",
    isoDate: "2026-03-15T00:00:00Z",
    title: "SchemaCheck API launched",
    description:
      "Public launch of the SchemaCheck REST API. Validate Schema.org JSON-LD structured data via GET (URL) or POST (raw JSON-LD). Returns per-property error messages, fix suggestions, rich result eligibility, and a 0-100 health score. Free plan: 100 validations/month.",
    tag: "launch",
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const lastBuildDate = entries[0].isoDate;

  const items = entries
    .map(
      (entry) => `
    <item>
      <title>${escapeXml(`[${entry.tag.toUpperCase()}] ${entry.title}`)}</title>
      <link>${SITE_URL}/changelog</link>
      <guid isPermaLink="false">${SITE_URL}/changelog#${entry.isoDate}</guid>
      <pubDate>${new Date(entry.isoDate).toUTCString()}</pubDate>
      <category>${escapeXml(entry.tag)}</category>
      <description>${escapeXml(entry.description)}</description>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SchemaCheck Changelog</title>
    <link>${SITE_URL}/changelog</link>
    <description>SchemaCheck product updates — new schema types, API improvements, and bug fixes.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/changelog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
