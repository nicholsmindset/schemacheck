import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ──────────────────────────────────────────────────────────────
// Hoisted mocks
// ──────────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => {
  const defaultApiKey = {
    id:                     "key-id-1",
    key:                    "sc_live_test",
    email:                  "test@example.com",
    plan:                   "free" as const,
    requests_used:          0,
    requests_limit:         100,
    overage_rate:           0,
    created_at:             "2026-01-01T00:00:00Z",
    stripe_customer_id:     null,
    stripe_subscription_id: null,
    is_active:              true,
    notified_90:            false,
    notified_100:           false,
  };

  const validateFn              = vi.fn();
  const chargeCredit            = vi.fn<[], Promise<void>>();
  const logNonCreditedRequest   = vi.fn<[], Promise<void>>();
  const mockSupabaseSingle      = vi.fn();
  const mockSupabaseUpsert      = vi.fn(() => Promise.resolve({ error: null }));

  return {
    defaultApiKey,
    validateFn,
    chargeCredit,
    logNonCreditedRequest,
    mockSupabaseSingle,
    mockSupabaseUpsert,
  };
});

// Mock the validator
vi.mock("@/lib/validator/index", () => ({
  validate: mocks.validateFn,
  validateHtml: vi.fn(),
  hashUrl: (url: string) => `hash::${url.toLowerCase().replace(/\/$/, "")}`,
  FetchError: class FetchError extends Error {
    code: string;
    constructor(code: string, message: string) { super(message); this.code = code; }
  },
}));

// Mock middleware — withAuth always succeeds with defaultApiKey, errorResponse works correctly
vi.mock("@/lib/middleware", () => {
  const statusMap: Record<string, number> = {
    missing_input:       400,
    invalid_url:         400,
    missing_api_key:     401,
    invalid_api_key:     401,
    quota_exceeded:      429,
    rate_limit_exceeded: 429,
    fetch_failed:        422,
    fetch_timeout:       422,
    internal_error:      500,
  };
  return {
    withAuth: (handler: Function) => async (request: Request) =>
      handler(request, { apiKey: mocks.defaultApiKey, creditsRemaining: 99, isOverage: false }),
    handleCors: () => new Response(null, { status: 204 }),
    chargeCredit: mocks.chargeCredit,
    logNonCreditedRequest: mocks.logNonCreditedRequest,
    errorResponse: (code: string, message: string) =>
      NextResponse.json({ error: { code, message } }, { status: statusMap[code] ?? 500 }),
  };
});

// Mock supabase for cache lookups
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (_table: string) => ({
      select: () => ({ eq: () => ({ single: mocks.mockSupabaseSingle }) }),
      upsert: mocks.mockSupabaseUpsert,
    }),
  },
}));

// ──────────────────────────────────────────────────────────────
// Imports (after mocks)
// ──────────────────────────────────────────────────────────────
import { GET, POST } from "@/app/api/v1/validate/route";

// ──────────────────────────────────────────────────────────────
// Helper — canned validation result
// ──────────────────────────────────────────────────────────────
const cannedResult = {
  success:      true,
  schemas_found: 1,
  schemas:      [],
  summary: {
    total_schemas: 1, valid_schemas: 1, invalid_schemas: 0,
    total_errors: 0, total_warnings: 0, rich_result_eligible: 1, score: 100,
  },
  parse_errors: [],
};

function makeGetRequest(url: string, apiKey = "sc_live_test"): Request {
  return new Request(url, { headers: { "x-api-key": apiKey } });
}

function makePostRequest(body: unknown, apiKey = "sc_live_test"): Request {
  return new Request("https://api.example.com/api/v1/validate", {
    method:  "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

// ──────────────────────────────────────────────────────────────
// GET — input validation
// ──────────────────────────────────────────────────────────────
describe("GET /api/v1/validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.chargeCredit.mockResolvedValue(undefined);
    mocks.logNonCreditedRequest.mockResolvedValue(undefined);
    // Default: no cache hit
    mocks.mockSupabaseSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
  });

  it("returns 400 missing_input when url param is absent", async () => {
    const request = makeGetRequest("https://api.example.com/api/v1/validate");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: { code: string } };
    expect(body.error.code).toBe("missing_input");
  });

  it("returns 400 invalid_url for non-http protocol", async () => {
    const request = makeGetRequest(
      "https://api.example.com/api/v1/validate?url=ftp%3A%2F%2Fexample.com"
    );
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: { code: string } };
    expect(body.error.code).toBe("invalid_url");
  });

  it("returns 400 invalid_url for a malformed URL string", async () => {
    const request = makeGetRequest(
      "https://api.example.com/api/v1/validate?url=not-a-url"
    );
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: { code: string } };
    expect(body.error.code).toBe("invalid_url");
  });

  it("calls validate() and returns 200 with credits_used=1 on fresh validation", async () => {
    mocks.validateFn.mockResolvedValueOnce(cannedResult);
    const request = makeGetRequest(
      "https://api.example.com/api/v1/validate?url=https%3A%2F%2Fexample.com"
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json() as { meta: { credits_used: number } };
    expect(body.meta.credits_used).toBe(1);
    expect(mocks.chargeCredit).toHaveBeenCalledOnce();
    expect(mocks.logNonCreditedRequest).not.toHaveBeenCalled();
  });

  it("returns cached result with credits_used=0 on cache hit", async () => {
    const cachedResult = {
      ...cannedResult,
      meta: {
        api_version: "1.0", validated_at: "2026-01-01T00:00:00Z",
        cached: true, credits_used: 0, credits_remaining: 99, response_time_ms: 1,
      },
      summary: {
        total_schemas: 1, valid_schemas: 1, invalid_schemas: 0,
        total_errors: 0, total_warnings: 0, rich_result_eligible: 1, score: 100,
      },
    };
    mocks.mockSupabaseSingle.mockResolvedValueOnce({
      data: {
        result:     cachedResult,
        expires_at: new Date(Date.now() + 3600_000).toISOString(),
      },
      error: null,
    });
    const request = makeGetRequest(
      "https://api.example.com/api/v1/validate?url=https%3A%2F%2Fexample.com"
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json() as { meta: { credits_used: number; cached: boolean } };
    expect(body.meta.credits_used).toBe(0);
    expect(body.meta.cached).toBe(true);
    expect(mocks.chargeCredit).not.toHaveBeenCalled();
    expect(mocks.logNonCreditedRequest).toHaveBeenCalledOnce();
  });

  it("ignores expired cache entries and performs fresh validation", async () => {
    mocks.mockSupabaseSingle.mockResolvedValueOnce({
      data: {
        result:     cannedResult,
        expires_at: new Date(Date.now() - 1000).toISOString(), // already expired
      },
      error: null,
    });
    mocks.validateFn.mockResolvedValueOnce(cannedResult);
    const request = makeGetRequest(
      "https://api.example.com/api/v1/validate?url=https%3A%2F%2Fstale.example.com"
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json() as { meta: { credits_used: number; cached: boolean } };
    expect(body.meta.cached).toBe(false);
    expect(body.meta.credits_used).toBe(1);
    expect(mocks.validateFn).toHaveBeenCalledOnce();
  });

  it("returns 422 fetch_failed when validate throws FetchError", async () => {
    const { FetchError } = await import("@/lib/validator/index");
    mocks.validateFn.mockRejectedValueOnce(new (FetchError as unknown as new(code: string, msg: string) => Error)("fetch_failed", "Could not reach URL."));
    const request = makeGetRequest(
      "https://api.example.com/api/v1/validate?url=https%3A%2F%2Fexample.com"
    );
    const response = await GET(request);
    expect(response.status).toBe(422);
    const body = await response.json() as { error: { code: string } };
    expect(body.error.code).toBe("fetch_failed");
    expect(mocks.chargeCredit).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────
// POST — body parsing and input routing
// ──────────────────────────────────────────────────────────────
describe("POST /api/v1/validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.chargeCredit.mockResolvedValue(undefined);
    mocks.logNonCreditedRequest.mockResolvedValue(undefined);
    mocks.mockSupabaseSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
  });

  it("returns 400 when body is not valid JSON", async () => {
    const request = new Request("https://api.example.com/api/v1/validate", {
      method:  "POST",
      headers: { "x-api-key": "sc_live_test", "Content-Type": "application/json" },
      body:    "this is not json",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: { code: string } };
    expect(body.error.code).toBe("missing_input");
  });

  it("returns 400 when body has neither url nor jsonld", async () => {
    const response = await POST(makePostRequest({}));
    expect(response.status).toBe(400);
    const body = await response.json() as { error: { code: string } };
    expect(body.error.code).toBe("missing_input");
  });

  it("returns 400 when url field is not a string", async () => {
    const response = await POST(makePostRequest({ url: 12345 }));
    expect(response.status).toBe(400);
    const body = await response.json() as { error: { code: string } };
    expect(body.error.code).toBe("invalid_url");
  });

  it("returns 400 invalid_url for non-http URL in body", async () => {
    const response = await POST(makePostRequest({ url: "ftp://example.com" }));
    expect(response.status).toBe(400);
    const body = await response.json() as { error: { code: string } };
    expect(body.error.code).toBe("invalid_url");
  });

  it("validates a URL from body and returns credits_used=1", async () => {
    mocks.validateFn.mockResolvedValueOnce(cannedResult);
    const response = await POST(makePostRequest({ url: "https://example.com" }));
    expect(response.status).toBe(200);
    const body = await response.json() as { meta: { credits_used: number } };
    expect(body.meta.credits_used).toBe(1);
    expect(mocks.chargeCredit).toHaveBeenCalledOnce();
  });

  it("validates raw jsonld and returns credits_used=1", async () => {
    mocks.validateFn.mockResolvedValueOnce(cannedResult);
    const response = await POST(makePostRequest({
      jsonld: {
        "@context":    "https://schema.org",
        "@type":       "Article",
        headline:      "Test Article",
        author:        { "@type": "Person", name: "Jane" },
        datePublished: "2026-03-18",
        image:         "https://example.com/img.jpg",
      },
    }));
    expect(response.status).toBe(200);
    const body = await response.json() as { meta: { credits_used: number } };
    expect(body.meta.credits_used).toBe(1);
    expect(mocks.chargeCredit).toHaveBeenCalledOnce();
  });

  it("returns 400 when body is a JSON array instead of object", async () => {
    const request = new Request("https://api.example.com/api/v1/validate", {
      method:  "POST",
      headers: { "x-api-key": "sc_live_test", "Content-Type": "application/json" },
      body:    JSON.stringify([{ "@type": "Article" }]),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("does not cache jsonld-only requests (no url provided)", async () => {
    mocks.validateFn.mockResolvedValueOnce(cannedResult);
    await POST(makePostRequest({
      jsonld: { "@context": "https://schema.org", "@type": "Organization", name: "Acme" },
    }));
    // supabase.from called for api_keys mock during chargeCredit, NOT for cache upsert on jsonld
    expect(mocks.mockSupabaseUpsert).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────
// Response shape
// ──────────────────────────────────────────────────────────────
describe("validation response shape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.chargeCredit.mockResolvedValue(undefined);
    mocks.logNonCreditedRequest.mockResolvedValue(undefined);
    mocks.mockSupabaseSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
  });

  it("response includes required meta fields", async () => {
    mocks.validateFn.mockResolvedValueOnce(cannedResult);
    const response = await POST(makePostRequest({
      jsonld: { "@context": "https://schema.org", "@type": "WebSite", name: "Test", url: "https://example.com" },
    }));
    const body = await response.json() as {
      meta: {
        api_version: string; validated_at: string; cached: boolean;
        credits_used: number; credits_remaining: number; response_time_ms: number;
      }
    };
    expect(body.meta.api_version).toBe("1.0");
    expect(typeof body.meta.validated_at).toBe("string");
    expect(body.meta.cached).toBe(false);
    expect(typeof body.meta.credits_remaining).toBe("number");
    expect(typeof body.meta.response_time_ms).toBe("number");
  });
});
