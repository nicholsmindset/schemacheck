import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sc_admin";

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8, // 8 hours
};

/**
 * Returns true if the sc_admin cookie matches the hashed/signed session value.
 * We store a simple signed token: "admin:<timestamp>" hashed with ADMIN_PASSWORD.
 * Used in Server Components and API routes.
 */
export async function getAdminSession(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!value) return false;

  // Value format: "admin_session_<password-hash>"
  const expected = `admin_session_${simpleHash(password)}`;
  return value === expected;
}

/** Create the cookie value for a valid admin session */
export function makeAdminSessionValue(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return `admin_session_${simpleHash(password)}`;
}

/** Deterministic hash — not cryptographic, just obfuscation for the cookie value */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash.toString(16).padStart(8, "0");
}
