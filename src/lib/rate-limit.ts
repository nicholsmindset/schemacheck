/**
 * In-memory sliding window rate limiter.
 * Each Vercel serverless function instance has its own memory,
 * so this is "good enough" for burst protection without Redis.
 * For strict rate limiting at scale, use Upstash Redis.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

// key → { count, resetAt }
const windows = new Map<string, WindowEntry>();

// Plan → requests per minute
const RATE_LIMITS: Record<string, number> = {
  free:   10,
  basic:  30,
  growth: 60,
  scale:  120,
};

/**
 * Returns true if the request should be allowed, false if rate limited.
 */
export function checkRateLimit(apiKeyId: string, plan: string): boolean {
  const limit = RATE_LIMITS[plan] ?? 10;
  const now = Date.now();
  const windowMs = 60_000; // 1 minute

  const entry = windows.get(apiKeyId);

  if (!entry || now >= entry.resetAt) {
    // New window
    windows.set(apiKeyId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Get the reset timestamp for the current window (ms).
 */
export function getRateLimitReset(apiKeyId: string): number {
  return windows.get(apiKeyId)?.resetAt ?? Date.now() + 60_000;
}

/**
 * Periodically clean up expired entries to prevent memory leak.
 * Call this from a background process or route handler.
 */
export function purgeExpiredWindows(): void {
  const now = Date.now();
  for (const [key, entry] of windows.entries()) {
    if (now >= entry.resetAt) {
      windows.delete(key);
    }
  }
}
