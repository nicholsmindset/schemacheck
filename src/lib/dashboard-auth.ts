import { cookies } from "next/headers";
import { authenticate } from "@/lib/middleware";
import type { ApiKeyRow } from "@/lib/validator/types";

export const SESSION_COOKIE = "sc_session";

/**
 * Read the sc_session cookie and validate it against the database.
 * Returns the ApiKeyRow if the session is valid, null otherwise.
 * Used in Server Components and Server Actions only.
 */
export async function getDashboardSession(): Promise<ApiKeyRow | null> {
  // Next.js 15: cookies() returns a Promise
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return await authenticate(raw);
  } catch {
    // Invalid or inactive key — treat as logged out
    return null;
  }
}

/** Cookie options shared by login and logout routes */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
