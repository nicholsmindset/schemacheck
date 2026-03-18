/**
 * extractor.ts
 *
 * Fetches a URL's HTML source and extracts all JSON-LD <script> blocks.
 *
 * Uses the Node.js 18+ built-in fetch (available in all Next.js 15 / Vercel
 * environments) — functionally identical to node-fetch v3 but avoids the
 * ESM-only packaging issue of that library in a TypeScript/bundler context.
 *
 * cheerio is used for HTML parsing. JSON-LD is always in the raw HTML source,
 * so no headless browser is required.
 */

import * as cheerio from "cheerio";
import type { JsonLdObject } from "./types";

// ============================================================
// Constants
// ============================================================

const FETCH_TIMEOUT_MS = 10_000; // 10 seconds
const MAX_REDIRECTS    = 5;
const USER_AGENT       = "SchemaCheck/1.0 (+https://schemacheck.dev/bot)";
const ACCEPT_HEADER    = "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8";

// ============================================================
// Public types
// ============================================================

/** Result of parsing HTML for JSON-LD blocks (no network I/O). */
export interface ParseResult {
  schemas:      JsonLdObject[];
  parse_errors: string[];
}

/** Result of fetching a URL and extracting JSON-LD. Extends ParseResult with timing. */
export interface ExtractionResult extends ParseResult {
  fetch_time_ms: number;
}

// ============================================================
// Public API
// ============================================================

/**
 * Fetch a URL's HTML and extract all JSON-LD schema objects.
 *
 * Throws a FetchError when:
 *   - The URL is unreachable or returns a non-2xx status
 *   - The response Content-Type is not HTML
 *   - The request times out after 10 seconds
 *   - More than 5 redirects are followed
 *
 * JSON parse errors within individual <script> blocks are non-fatal:
 * they appear in `parse_errors` and the remaining blocks are still returned.
 */
export async function extractFromUrl(url: string): Promise<ExtractionResult> {
  const { html, fetch_time_ms } = await fetchHtml(url);
  const { schemas, parse_errors } = extractFromHtml(html);
  return { schemas, parse_errors, fetch_time_ms };
}

/**
 * Parse an HTML string and return all JSON-LD objects found in
 * <script type="application/ld+json"> tags.
 *
 * Handles:
 *   - Multiple script blocks per page
 *   - Top-level JSON arrays  (some CMSs emit [...] instead of {...})
 *   - @graph containers      (expanded into individual schema objects)
 *   - Invalid JSON           (collected in parse_errors, processing continues)
 */
export function extractFromHtml(html: string): ParseResult {
  const $            = cheerio.load(html);
  const schemas:      JsonLdObject[] = [];
  const parse_errors: string[]       = [];

  $('script[type="application/ld+json"]').each((blockIndex, el) => {
    const raw = $(el).html();
    if (!raw?.trim()) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.trim());
    } catch (err) {
      parse_errors.push(
        `Block ${blockIndex + 1}: ${err instanceof Error ? err.message : String(err)}`
      );
      return; // skip this block, continue with next
    }

    if (Array.isArray(parsed)) {
      // Top-level array — treat each item as its own block
      parsed.forEach((item, itemIndex) => {
        if (isPlainObject(item)) {
          schemas.push(...expandGraphBlock(item, `Block ${blockIndex + 1}[${itemIndex}]`, parse_errors));
        }
      });
    } else if (isPlainObject(parsed)) {
      schemas.push(...expandGraphBlock(parsed, `Block ${blockIndex + 1}`, parse_errors));
    }
    // Primitive values (string, number, null) are ignored — not valid JSON-LD
  });

  return { schemas, parse_errors };
}

// ============================================================
// @graph expansion
// ============================================================

/**
 * Expand a JSON-LD block that may contain an @graph array.
 *
 * If the block has an @graph key, each item in the array is returned as its
 * own object. The parent's @context is inherited by children that don't
 * declare their own.
 *
 * Non-@graph objects are returned as-is in a single-element array.
 */
function expandGraphBlock(
  block: JsonLdObject,
  label: string,
  parse_errors: string[]
): JsonLdObject[] {
  const graph = block["@graph"];

  if (!Array.isArray(graph)) {
    return [block];
  }

  const parentContext = block["@context"];
  const expanded: JsonLdObject[] = [];

  graph.forEach((item, i) => {
    if (!isPlainObject(item)) {
      parse_errors.push(`${label} @graph[${i}]: expected an object, got ${typeof item}`);
      return;
    }
    const child: JsonLdObject = { ...item };
    // Inherit parent @context if the child doesn't declare its own
    if (child["@context"] === undefined && parentContext !== undefined) {
      child["@context"] = parentContext;
    }
    expanded.push(child);
  });

  return expanded;
}

// ============================================================
// HTTP fetch with timeout + redirect cap
// ============================================================

async function fetchHtml(url: string): Promise<{ html: string; fetch_time_ms: number }> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const fetchStart = Date.now();

  try {
    const response = await followRedirects(url, controller.signal, MAX_REDIRECTS);

    if (!response.ok) {
      throw new FetchError(
        "fetch_failed",
        `Remote server returned HTTP ${response.status} for ${url}`
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      const type = contentType.split(";")[0].trim() || "unknown";
      throw new FetchError(
        "fetch_failed",
        `Expected HTML response but received '${type}'. JSON-LD is only present in HTML pages.`
      );
    }

    const html         = await response.text();
    const fetch_time_ms = Date.now() - fetchStart;
    return { html, fetch_time_ms };
  } catch (err) {
    if (err instanceof FetchError) throw err;

    // AbortController fires when the 10 s timer expires
    if (
      (err instanceof Error && err.name === "AbortError") ||
      (err instanceof DOMException && err.name === "AbortError")
    ) {
      throw new FetchError(
        "fetch_timeout",
        `Request timed out after ${FETCH_TIMEOUT_MS / 1000}s. The server may be slow or unreachable.`
      );
    }

    throw new FetchError("fetch_failed", `Network error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Recursive redirect follower — enforces MAX_REDIRECTS hard cap.
 *
 * Uses redirect:"manual" so we control the chain rather than delegating to
 * the runtime. The AbortController signal is threaded through every hop so
 * the single 10 s timeout covers the entire redirect chain, not each hop.
 */
async function followRedirects(
  url: string,
  signal: AbortSignal,
  remaining: number
): Promise<Response> {
  const response = await fetch(url, {
    signal,
    redirect: "manual",
    headers: {
      "User-Agent": USER_AGENT,
      Accept:       ACCEPT_HEADER,
    },
  });

  const isRedirect = response.status >= 300 && response.status < 400;

  if (!isRedirect) {
    return response;
  }

  if (remaining === 0) {
    throw new FetchError(
      "fetch_failed",
      `Exceeded maximum redirect limit (${MAX_REDIRECTS}). Check that the URL does not have a redirect loop.`
    );
  }

  const location = response.headers.get("location");
  if (!location) {
    throw new FetchError(
      "fetch_failed",
      `Server sent a ${response.status} redirect but no Location header.`
    );
  }

  // Resolve relative redirect targets (e.g. /new-path) against the current URL
  const nextUrl = new URL(location, url).href;
  return followRedirects(nextUrl, signal, remaining - 1);
}

// ============================================================
// Helpers
// ============================================================

function isPlainObject(value: unknown): value is JsonLdObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ============================================================
// FetchError — thrown for all HTTP/network failures
// ============================================================

export class FetchError extends Error {
  constructor(
    public readonly code: "fetch_failed" | "fetch_timeout",
    message: string
  ) {
    super(message);
    this.name = "FetchError";
  }
}
