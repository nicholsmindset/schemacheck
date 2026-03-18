import { describe, it, expect, vi, afterEach } from "vitest";
import { extractFromHtml, extractFromUrl, FetchError } from "@/lib/validator/extractor";

// ============================================================
// extractFromHtml — HTML parsing
// ============================================================

describe("extractFromHtml", () => {
  it("extracts a single JSON-LD script block", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"Article","headline":"Test"}
        </script>
      </head></html>
    `;
    const { schemas, parse_errors } = extractFromHtml(html);
    expect(schemas).toHaveLength(1);
    expect(schemas[0]["@type"]).toBe("Article");
    expect(parse_errors).toHaveLength(0);
  });

  it("extracts multiple JSON-LD blocks", () => {
    const html = `
      <html><body>
        <script type="application/ld+json">{"@type":"Article","headline":"A"}</script>
        <script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>
      </body></html>
    `;
    const { schemas } = extractFromHtml(html);
    expect(schemas).toHaveLength(2);
    expect(schemas[0]["@type"]).toBe("Article");
    expect(schemas[1]["@type"]).toBe("Organization");
  });

  it("collects parse errors without throwing, and still returns valid blocks", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">this is not json {</script>
        <script type="application/ld+json">{"@type":"WebSite","name":"Test"}</script>
      </head></html>
    `;
    const { schemas, parse_errors } = extractFromHtml(html);
    expect(schemas).toHaveLength(1);
    expect(schemas[0]["@type"]).toBe("WebSite");
    expect(parse_errors).toHaveLength(1);
    expect(parse_errors[0]).toMatch(/Block 1/);
  });

  it("handles a top-level JSON array in a single script block", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          [{"@type":"Article","headline":"A"},{"@type":"Organization","name":"B"}]
        </script>
      </head></html>
    `;
    const { schemas, parse_errors } = extractFromHtml(html);
    expect(schemas).toHaveLength(2);
    expect(parse_errors).toHaveLength(0);
  });

  it("returns empty schemas array when no JSON-LD blocks are present", () => {
    const html = `<html><body><p>No schemas here.</p></body></html>`;
    const { schemas, parse_errors } = extractFromHtml(html);
    expect(schemas).toHaveLength(0);
    expect(parse_errors).toHaveLength(0);
  });

  it("ignores non-application/ld+json script tags", () => {
    const html = `
      <html><head>
        <script type="text/javascript">var x = {a: 1};</script>
        <script type="application/ld+json">{"@type":"WebSite","name":"Real"}</script>
      </head></html>
    `;
    const { schemas } = extractFromHtml(html);
    expect(schemas).toHaveLength(1);
    expect(schemas[0]["@type"]).toBe("WebSite");
  });

  it("flattens @graph into individual schema objects", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@graph": [
              {"@type": "WebSite", "name": "Acme"},
              {"@type": "Organization", "name": "Acme Inc"}
            ]
          }
        </script>
      </head></html>
    `;
    const { schemas, parse_errors } = extractFromHtml(html);
    expect(schemas).toHaveLength(2);
    expect(schemas[0]["@type"]).toBe("WebSite");
    expect(schemas[1]["@type"]).toBe("Organization");
    expect(schemas[0]["@context"]).toBe("https://schema.org");
    expect(schemas[1]["@context"]).toBe("https://schema.org");
    expect(parse_errors).toHaveLength(0);
  });

  it("preserves child @context when the child already has one", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@graph": [
              {"@context": "https://example.com/ctx", "@type": "Article", "headline": "Hi"}
            ]
          }
        </script>
      </head></html>
    `;
    const { schemas } = extractFromHtml(html);
    expect(schemas).toHaveLength(1);
    expect(schemas[0]["@context"]).toBe("https://example.com/ctx");
  });

  it("collects @graph item errors without stopping other items", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@graph": [
              "not an object",
              {"@type": "WebSite", "name": "OK"}
            ]
          }
        </script>
      </head></html>
    `;
    const { schemas, parse_errors } = extractFromHtml(html);
    expect(schemas).toHaveLength(1);
    expect(schemas[0]["@type"]).toBe("WebSite");
    expect(parse_errors).toHaveLength(1);
    expect(parse_errors[0]).toMatch(/@graph/);
  });

  it("handles empty script block gracefully", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">   </script>
        <script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>
      </head></html>
    `;
    const { schemas, parse_errors } = extractFromHtml(html);
    expect(schemas).toHaveLength(1);
    expect(parse_errors).toHaveLength(0);
  });

  it("ignores primitive JSON-LD values (not objects or arrays)", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">"just a string"</script>
        <script type="application/ld+json">42</script>
        <script type="application/ld+json">{"@type":"Organization","name":"OK"}</script>
      </head></html>
    `;
    const { schemas } = extractFromHtml(html);
    expect(schemas).toHaveLength(1);
  });

  it("extracts schema.org namespace prefix correctly via parser", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"Article","headline":"Test"}
        </script>
      </head></html>
    `;
    const { schemas } = extractFromHtml(html);
    expect(schemas[0]["@context"]).toBe("https://schema.org");
  });
});

// ============================================================
// extractFromUrl — network fetch (mocked)
// ============================================================

describe("extractFromUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeFetchResponse(opts: {
    status?: number;
    ok?: boolean;
    contentType?: string;
    body?: string;
    locationHeader?: string;
  }) {
    const status = opts.status ?? 200;
    const ok = opts.ok ?? (status >= 200 && status < 300);
    return {
      ok,
      status,
      headers: {
        get: (name: string) => {
          if (name === "content-type") return opts.contentType ?? "text/html; charset=utf-8";
          if (name === "location") return opts.locationHeader ?? null;
          return null;
        },
      },
      text: () => Promise.resolve(opts.body ?? "<html></html>"),
    };
  }

  it("fetches a URL and extracts JSON-LD from the response HTML", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse({
          body: `<html><head>
            <script type="application/ld+json">
              {"@context":"https://schema.org","@type":"Organization","name":"Acme Corp"}
            </script>
          </head></html>`,
        })
      )
    );
    const result = await extractFromUrl("https://example.com");
    expect(result.schemas).toHaveLength(1);
    expect(result.schemas[0]["@type"]).toBe("Organization");
    expect(result.fetch_time_ms).toBeGreaterThanOrEqual(0);
    expect(result.parse_errors).toHaveLength(0);
  });

  it("throws FetchError with code fetch_failed on HTTP 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeFetchResponse({ status: 404, ok: false }))
    );
    await expect(extractFromUrl("https://example.com/notfound")).rejects.toMatchObject({
      code: "fetch_failed",
      name: "FetchError",
    });
  });

  it("throws FetchError with code fetch_failed on HTTP 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeFetchResponse({ status: 500, ok: false }))
    );
    await expect(extractFromUrl("https://example.com")).rejects.toMatchObject({
      code: "fetch_failed",
    });
  });

  it("throws FetchError with code fetch_failed for non-HTML content type", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse({ contentType: "application/json" })
      )
    );
    await expect(extractFromUrl("https://api.example.com/data")).rejects.toMatchObject({
      code: "fetch_failed",
    });
    await expect(extractFromUrl("https://api.example.com/data")).rejects.toThrow(/HTML/);
  });

  it("throws FetchError with code fetch_timeout on AbortError", async () => {
    const abortErr = Object.assign(new Error("The operation was aborted."), {
      name: "AbortError",
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortErr));
    await expect(extractFromUrl("https://slow.example.com")).rejects.toMatchObject({
      code: "fetch_timeout",
      name: "FetchError",
    });
  });

  it("throws FetchError with code fetch_failed on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    await expect(extractFromUrl("https://unreachable.example.com")).rejects.toMatchObject({
      code: "fetch_failed",
    });
  });

  it("follows a single redirect to the final URL", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        calls++;
        if (calls === 1) {
          return Promise.resolve(
            makeFetchResponse({ status: 301, ok: false, locationHeader: "https://www.example.com/" })
          );
        }
        return Promise.resolve(
          makeFetchResponse({
            body: `<html><head>
              <script type="application/ld+json">{"@type":"WebSite","name":"Example","url":"https://www.example.com"}</script>
            </head></html>`,
          })
        );
      })
    );
    const result = await extractFromUrl("https://example.com/");
    expect(result.schemas).toHaveLength(1);
    expect(result.schemas[0]["@type"]).toBe("WebSite");
    expect(calls).toBe(2);
  });

  it("throws FetchError when redirect limit (5) is exceeded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse({ status: 301, ok: false, locationHeader: "https://loop.example.com/" })
      )
    );
    await expect(extractFromUrl("https://loop.example.com/")).rejects.toMatchObject({
      code: "fetch_failed",
    });
    await expect(extractFromUrl("https://loop.example.com/")).rejects.toThrow(/redirect/i);
  });

  it("throws FetchError when redirect has no Location header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeFetchResponse({ status: 301, ok: false }))
    );
    await expect(extractFromUrl("https://example.com/")).rejects.toMatchObject({
      code: "fetch_failed",
    });
    await expect(extractFromUrl("https://example.com/")).rejects.toThrow(/Location/);
  });

  it("returns empty schemas for a page with no JSON-LD markup", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse({ body: "<html><body><p>No structured data here.</p></body></html>" })
      )
    );
    const result = await extractFromUrl("https://example.com/plain");
    expect(result.schemas).toHaveLength(0);
    expect(result.parse_errors).toHaveLength(0);
    expect(result.fetch_time_ms).toBeGreaterThanOrEqual(0);
  });

  it("FetchError is instanceof FetchError and Error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeFetchResponse({ status: 403, ok: false }))
    );
    let err: unknown;
    try {
      await extractFromUrl("https://example.com/forbidden");
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(FetchError);
    expect(err).toBeInstanceOf(Error);
  });
});
