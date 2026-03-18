import { describe, it, expect, vi, beforeEach } from "vitest";

// ──────────────────────────────────────────────────────────────
// Hoisted mocks — must be defined before any module imports
// ──────────────────────────────────────────────────────────────
const { mockSingle, mockInsert, mockUpdateEq, mockFrom, mockSendAlert } = vi.hoisted(() => {
  const mockSingle    = vi.fn<[], Promise<{ data: unknown; error: unknown }>>();
  const mockInsert    = vi.fn<[], Promise<{ error: unknown }>>();
  const mockUpdateEq  = vi.fn<[], Promise<{ error: unknown }>>();
  const mockFrom      = vi.fn((table: string) => {
    void table;
    return {
      select:  () => ({ eq: () => ({ single: mockSingle }) }),
      update:  () => ({ eq: mockUpdateEq }),
      insert:  mockInsert,
    };
  });
  const mockSendAlert = vi.fn<[], Promise<void>>();
  return { mockSingle, mockInsert, mockUpdateEq, mockFrom, mockSendAlert };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mockFrom },
}));

vi.mock("@/lib/email", () => ({
  sendUsageAlert: mockSendAlert,
}));

// ──────────────────────────────────────────────────────────────
// Imports (after mocks)
// ──────────────────────────────────────────────────────────────
import { checkRateLimit, purgeExpiredWindows } from "@/lib/rate-limit";
import {
  extractApiKey,
  authenticate,
  enforceQuota,
  chargeCredit,
  logNonCreditedRequest,
} from "@/lib/middleware";
import type { ApiKeyRow } from "@/lib/validator/types";

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function makeKey(overrides: Partial<ApiKeyRow> = {}): ApiKeyRow {
  return {
    id:                     "key-id-1",
    key:                    "sc_live_test",
    email:                  "test@example.com",
    plan:                   "free",
    requests_used:          0,
    requests_limit:         100,
    overage_rate:           0,
    created_at:             "2026-01-01T00:00:00Z",
    stripe_customer_id:     null,
    stripe_subscription_id: null,
    is_active:              true,
    notified_90:            false,
    notified_100:           false,
    ...overrides,
  };
}

// ──────────────────────────────────────────────────────────────
// Rate limiter
// ──────────────────────────────────────────────────────────────
describe("rate limiter", () => {
  it("allows requests up to the limit", () => {
    const id = `test-rl-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(id, "free")).toBe(true);
    }
    expect(checkRateLimit(id, "free")).toBe(false);
  });

  it("allows higher limit for paid plans", () => {
    const id = `test-paid-${Date.now()}`;
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(id, "basic")).toBe(true);
    }
    expect(checkRateLimit(id, "basic")).toBe(false);
  });

  it("tracks growth plan at 60/min", () => {
    const id = `test-growth-${Date.now()}`;
    for (let i = 0; i < 60; i++) {
      expect(checkRateLimit(id, "growth")).toBe(true);
    }
    expect(checkRateLimit(id, "growth")).toBe(false);
  });

  it("purgeExpiredWindows does not throw", () => {
    expect(() => purgeExpiredWindows()).not.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────
// extractApiKey
// ──────────────────────────────────────────────────────────────
describe("extractApiKey", () => {
  it("extracts key from x-api-key header", () => {
    const request = new Request("https://api.example.com/validate", {
      headers: { "x-api-key": "sc_live_abc123" },
    });
    expect(extractApiKey(request)).toBe("sc_live_abc123");
  });

  it("extracts key from access_key query parameter", () => {
    const request = new Request("https://api.example.com/validate?access_key=sc_live_qwerty");
    expect(extractApiKey(request)).toBe("sc_live_qwerty");
  });

  it("prefers x-api-key header over query parameter", () => {
    const request = new Request(
      "https://api.example.com/validate?access_key=from_query",
      { headers: { "x-api-key": "from_header" } }
    );
    expect(extractApiKey(request)).toBe("from_header");
  });

  it("returns empty string when no key provided", () => {
    const request = new Request("https://api.example.com/validate");
    expect(extractApiKey(request)).toBe("");
  });
});

// ──────────────────────────────────────────────────────────────
// authenticate
// ──────────────────────────────────────────────────────────────
describe("authenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendAlert.mockResolvedValue(undefined);
    mockInsert.mockResolvedValue({ error: null });
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  it("throws missing_api_key when key is empty string", async () => {
    await expect(authenticate("")).rejects.toMatchObject({
      error: { code: "missing_api_key" },
    });
    // Should not query DB for empty key
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns ApiKeyRow for a valid active key", async () => {
    const apiKey = makeKey();
    mockSingle.mockResolvedValueOnce({ data: apiKey, error: null });
    const result = await authenticate("sc_live_test");
    expect(result).toEqual(apiKey);
  });

  it("throws invalid_api_key when key not found in DB", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });
    await expect(authenticate("sc_live_notfound")).rejects.toMatchObject({
      error: { code: "invalid_api_key" },
    });
  });

  it("throws invalid_api_key when key exists but is_active=false", async () => {
    const inactiveKey = makeKey({ is_active: false });
    mockSingle.mockResolvedValueOnce({ data: inactiveKey, error: null });
    await expect(authenticate("sc_live_disabled")).rejects.toMatchObject({
      error: { code: "invalid_api_key" },
    });
  });
});

// ──────────────────────────────────────────────────────────────
// enforceQuota — pure function, no mocking required
// ──────────────────────────────────────────────────────────────
describe("enforceQuota", () => {
  it("returns false when well under limit", () => {
    const apiKey = makeKey({ requests_used: 10, requests_limit: 100 });
    expect(enforceQuota(apiKey)).toBe(false);
  });

  it("returns false when one request below limit", () => {
    const apiKey = makeKey({ requests_used: 99, requests_limit: 100 });
    expect(enforceQuota(apiKey)).toBe(false);
  });

  it("throws quota_exceeded for free plan at limit", () => {
    const apiKey = makeKey({ plan: "free", requests_used: 100, requests_limit: 100 });
    expect(() => enforceQuota(apiKey)).toThrow();
    try {
      enforceQuota(apiKey);
    } catch (err: unknown) {
      expect(err).toMatchObject({ error: { code: "quota_exceeded" } });
    }
  });

  it("quota_exceeded message mentions upgrade URL", () => {
    const apiKey = makeKey({ plan: "free", requests_used: 100, requests_limit: 100 });
    try {
      enforceQuota(apiKey);
    } catch (err: unknown) {
      expect((err as { error: { message: string } }).error.message).toContain("schemacheck.dev");
    }
  });

  it("returns true (overage) for paid plan at limit", () => {
    const apiKey = makeKey({ plan: "basic", requests_used: 3000, requests_limit: 3000 });
    expect(enforceQuota(apiKey)).toBe(true);
  });

  it("returns true (overage) for growth plan over limit", () => {
    const apiKey = makeKey({ plan: "growth", requests_used: 15001, requests_limit: 15000 });
    expect(enforceQuota(apiKey)).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────
// chargeCredit
// ──────────────────────────────────────────────────────────────
describe("chargeCredit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendAlert.mockResolvedValue(undefined);
    mockUpdateEq.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("inserts a usage log row with credited=true and cached=false", async () => {
    const apiKey = makeKey({ requests_used: 5 });
    await chargeCredit(apiKey, {
      endpoint:         "/api/v1/validate",
      input_type:       "url",
      schemas_found:    1,
      errors_found:     0,
      response_time_ms: 120,
    });
    expect(mockInsert).toHaveBeenCalledOnce();
    const insertArg = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(insertArg.credited).toBe(true);
    expect(insertArg.cached).toBe(false);
    expect(insertArg.api_key_id).toBe("key-id-1");
  });

  it("calls supabase update to increment requests_used", async () => {
    const apiKey = makeKey({ requests_used: 5 });
    await chargeCredit(apiKey, {
      endpoint:         "/api/v1/validate",
      input_type:       "jsonld",
      schemas_found:    2,
      errors_found:     1,
      response_time_ms: 80,
    });
    // update called on api_keys (requests_used++)
    expect(mockFrom).toHaveBeenCalledWith("api_keys");
  });

  it("fires threshold alert at 90% usage (not already notified)", async () => {
    // 90 of 100 used; incrementing to 91 → 91% ≥ 90%
    const apiKey = makeKey({ requests_used: 90, requests_limit: 100, notified_90: false });
    mockUpdateEq.mockResolvedValue({ error: null });
    await chargeCredit(apiKey, {
      endpoint:         "/api/v1/validate",
      input_type:       "url",
      schemas_found:    0,
      errors_found:     0,
      response_time_ms: 50,
    });
    // Allow setUsageThresholdFlags (fire-and-forget) to settle
    await new Promise((r) => setTimeout(r, 10));
    expect(mockSendAlert).toHaveBeenCalledWith(
      "test@example.com",
      90,
      expect.any(Number),
      100,
      "free"
    );
  });

  it("does not fire 90% alert when notified_90 is already true", async () => {
    const apiKey = makeKey({ requests_used: 91, requests_limit: 100, notified_90: true });
    await chargeCredit(apiKey, {
      endpoint:         "/api/v1/validate",
      input_type:       "url",
      schemas_found:    0,
      errors_found:     0,
      response_time_ms: 50,
    });
    await new Promise((r) => setTimeout(r, 10));
    expect(mockSendAlert).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────
// logNonCreditedRequest
// ──────────────────────────────────────────────────────────────
describe("logNonCreditedRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("inserts a usage log row with credited=false", async () => {
    const apiKey = makeKey();
    await logNonCreditedRequest(apiKey, {
      endpoint:         "/api/v1/validate",
      input_type:       "url",
      schemas_found:    1,
      errors_found:     0,
      response_time_ms: 5,
      cached:           true,
    });
    expect(mockInsert).toHaveBeenCalledOnce();
    const insertArg = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(insertArg.credited).toBe(false);
    expect(insertArg.cached).toBe(true);
    expect(insertArg.api_key_id).toBe("key-id-1");
  });

  it("does NOT call update on api_keys (requests_used unchanged)", async () => {
    const apiKey = makeKey();
    await logNonCreditedRequest(apiKey, {
      endpoint:         "/api/v1/validate",
      input_type:       "jsonld",
      schemas_found:    0,
      errors_found:     0,
      response_time_ms: 3,
      cached:           false,
    });
    // Only usage_logs should be touched; api_keys update should NOT be called
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });
});
