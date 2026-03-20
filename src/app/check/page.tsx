"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { SchemaValidationResult, ValidationSummary } from "@/lib/validator/types";

// ─── palette helpers ──────────────────────────────────────────────────────────
const BG      = "bg-[#0a0a0f]";
const SURFACE = "bg-[#111118]";
const CARD    = "bg-[#16161f]";
const BORDER  = "border-gray-800";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── API shape ────────────────────────────────────────────────────────────────
interface CheckResponse {
  success: true;
  url?: string;
  schemas_found: number;
  schemas: SchemaValidationResult[];
  summary: ValidationSummary;
  parse_errors?: string[];
  message?: string;
  remaining: number;
  meta: { validated_at: string; response_time_ms: number };
}

interface CheckErrorResponse {
  error: string;
  message: string;
  remaining?: number;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = "sc_check_count";
const STORAGE_DATE_KEY = "sc_check_date";
const LOCAL_LIMIT = 3;

function getLocalCheckCount(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  const storedDate = localStorage.getItem(STORAGE_DATE_KEY);
  if (storedDate !== today) {
    localStorage.setItem(STORAGE_DATE_KEY, today);
    localStorage.setItem(STORAGE_KEY, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
}

function incrementLocalCheckCount(): number {
  const count = getLocalCheckCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(count));
  return count;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className={cn("sticky top-0 z-50 border-b", BORDER, "bg-[#0a0a0f]/90 backdrop-blur-md")}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-white tracking-tight"
          aria-label="SchemaCheck home"
        >
          <span className="text-indigo-400 text-lg leading-none">⬡</span>
          <span>Schema<span className="text-indigo-400">Check</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/check" className="text-white transition-colors">Check a URL</Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/schema-types" className="hover:text-white transition-colors">Schema Types</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/login"
            className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/#signup"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
          >
            Get API Key →
          </Link>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            className="sm:hidden flex flex-col gap-1.5 p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <span className={cn("block w-5 h-0.5 bg-current transition-transform origin-center", mobileOpen ? "rotate-45 translate-y-2" : "")} />
            <span className={cn("block w-5 h-0.5 bg-current transition-opacity", mobileOpen ? "opacity-0" : "")} />
            <span className={cn("block w-5 h-0.5 bg-current transition-transform origin-center", mobileOpen ? "-rotate-45 -translate-y-2" : "")} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={cn("sm:hidden border-t px-4 py-4 space-y-3", BORDER, "bg-[#0a0a0f]")}>
          <Link href="/docs" className="block text-sm text-gray-400 hover:text-white transition-colors py-1">Docs</Link>
          <Link href="/check" className="block text-sm text-white transition-colors py-1">Check a URL</Link>
          <Link href="/#pricing" className="block text-sm text-gray-400 hover:text-white transition-colors py-1" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/blog" className="block text-sm text-gray-400 hover:text-white transition-colors py-1">Blog</Link>
          <Link href="/schema-types" className="block text-sm text-gray-400 hover:text-white transition-colors py-1">Schema Types</Link>
          <Link href="/dashboard/login" className="block text-sm text-gray-400 hover:text-white transition-colors py-1">Sign in</Link>
        </div>
      )}
    </nav>
  );
}

// ─── Score Gauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const dashOffset = circumference * (1 - clampedScore / 100);

  const color =
    clampedScore >= 70 ? "#22c55e" :
    clampedScore >= 40 ? "#f59e0b" :
    "#ef4444";

  const label =
    clampedScore >= 70 ? "Good" :
    clampedScore >= 40 ? "Fair" :
    "Poor";

  const labelColor =
    clampedScore >= 70 ? "text-green-400" :
    clampedScore >= 40 ? "text-amber-400" :
    "text-red-400";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white leading-none">{clampedScore}</span>
          <span className="text-xs text-gray-500 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className={cn("text-sm font-medium", labelColor)}>{label}</span>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({
  variant,
  children,
}: {
  variant: "green" | "red" | "yellow" | "blue" | "gray";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    green:  "bg-green-950/60 text-green-400 border border-green-800/50",
    red:    "bg-red-950/60 text-red-400 border border-red-800/50",
    yellow: "bg-amber-950/60 text-amber-400 border border-amber-800/50",
    blue:   "bg-indigo-950/60 text-indigo-400 border border-indigo-800/50",
    gray:   "bg-gray-900/60 text-gray-400 border border-gray-700/50",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", styles[variant])}>
      {children}
    </span>
  );
}

// ─── Schema Card ──────────────────────────────────────────────────────────────
function SchemaCard({ schema }: { schema: SchemaValidationResult }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn("rounded-xl border overflow-hidden", BORDER, CARD)}>
      {/* Card header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white font-semibold text-sm">{schema.type}</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={schema.valid ? "green" : "red"}>
              {schema.valid ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Valid
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M3 3l4 4M7 3L3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Invalid
                </>
              )}
            </Badge>
            <Badge variant={schema.rich_result_eligible ? "green" : "gray"}>
              {schema.rich_result_eligible ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M5 1l1.2 2.4L9 4.1 7 6l.5 3L5 7.7 2.5 9 3 6 1 4.1l2.8-.7z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                  Rich Result Eligible
                </>
              ) : (
                <>Not Eligible</>
              )}
            </Badge>
            {schema.deprecated && (
              <Badge variant="yellow">Deprecated</Badge>
            )}
          </div>
        </div>
        <svg
          className={cn("flex-shrink-0 text-gray-600 transition-transform ml-2", open ? "rotate-180" : "")}
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Card body */}
      {open && (
        <div className="px-5 pb-5 border-t border-gray-800/50 pt-4 space-y-4">
          {/* Rich result reason */}
          {schema.rich_result && !schema.rich_result_eligible && (
            <p className="text-xs text-amber-400/80 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2">
              {schema.rich_result.reason}
            </p>
          )}

          {/* Deprecation note */}
          {schema.deprecated && schema.deprecation_note && (
            <p className="text-xs text-amber-400/80 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2">
              {schema.deprecation_note}
            </p>
          )}

          {/* Errors */}
          {schema.errors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wide">
                Errors ({schema.errors.length})
              </p>
              <ul className="space-y-2">
                {schema.errors.map((issue, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true">●</span>
                    <div className="min-w-0">
                      <span className="text-gray-300">{issue.message}</span>
                      {issue.fix && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Fix: <span className="text-gray-400">{issue.fix}</span>
                        </p>
                      )}
                      {issue.property && issue.property !== "unknown" && (
                        <code className="text-xs text-indigo-400/70 font-mono mt-0.5 block">
                          {issue.property}
                        </code>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {schema.warnings.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-400 mb-2 uppercase tracking-wide">
                Warnings ({schema.warnings.length})
              </p>
              <ul className="space-y-2">
                {schema.warnings.map((issue, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true">●</span>
                    <div className="min-w-0">
                      <span className="text-gray-400">{issue.message}</span>
                      {issue.fix && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Fix: <span className="text-gray-400">{issue.fix}</span>
                        </p>
                      )}
                      {issue.property && issue.property !== "unknown" && (
                        <code className="text-xs text-indigo-400/70 font-mono mt-0.5 block">
                          {issue.property}
                        </code>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No issues */}
          {schema.errors.length === 0 && schema.warnings.length === 0 && (
            <p className="text-sm text-green-400/80">No issues found — schema looks good.</p>
          )}

          {/* Google docs link */}
          {schema.rich_result?.google_docs_url && (
            <a
              href={schema.rich_result.google_docs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Google docs →
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 8L8 2M4 2h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Soft Gate Modal ──────────────────────────────────────────────────────────
function SoftGateModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
    >
      <div className={cn("relative w-full max-w-md rounded-2xl border p-8 shadow-2xl", CARD, BORDER)}>
        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-indigo-400 text-xl" aria-hidden="true">⬡</span>
          </div>
          <h2 id="gate-title" className="text-white font-semibold text-lg mb-2">
            You&apos;ve used your 3 free checks today
          </h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Sign up for a free API key and get{" "}
            <span className="text-white font-medium">100 validations/month</span>{" "}
            free. Takes 30 seconds — no credit card needed.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/#signup"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/30"
            >
              Sign Up Free →
            </Link>
            <button
              onClick={onDismiss}
              className="w-full text-sm text-gray-600 hover:text-gray-400 transition-colors py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main check page content ──────────────────────────────────────────────────
function CheckPageContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") ?? "";

  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const hasAutoSubmitted = useRef(false);

  // Auto-submit when url is in query params
  useEffect(() => {
    if (initialUrl && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      runCheck(initialUrl);
    }
  }, [initialUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  async function runCheck(targetUrl: string) {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setUrlError("Please enter a URL.");
      return;
    }

    // Normalize URL
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;

    // Basic format check client-side
    try {
      const parsed = new URL(normalized);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setUrlError("URL must start with http:// or https://");
        return;
      }
    } catch {
      setUrlError("Please enter a valid URL (e.g. https://example.com).");
      return;
    }

    setUrlError(null);
    setErrorMsg(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      const data = await res.json() as CheckResponse | CheckErrorResponse;

      if (!res.ok) {
        const errData = data as CheckErrorResponse;

        if (res.status === 429) {
          // Server-side rate limit hit — show gate
          setRemaining(0);
          setShowGate(true);
          setLoading(false);
          return;
        }

        setErrorMsg(errData.message ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const success = data as CheckResponse;
      setResult(success);
      setRemaining(success.remaining ?? null);

      // Increment local count and show soft gate after 3 checks
      const localCount = incrementLocalCheckCount();
      if (localCount >= LOCAL_LIMIT && success.remaining === 0) {
        setShowGate(true);
      }
    } catch {
      setErrorMsg("Failed to connect to the validation service. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runCheck(url);
  }

  const noSchemas = result && result.schemas_found === 0;

  return (
    <div className={cn("min-h-screen", BG)}>
      <Nav />

      {/* Soft gate */}
      {showGate && <SoftGateModal onDismiss={() => setShowGate(false)} />}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Page heading */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Check a URL for{" "}
            <span className="text-indigo-400">structured data</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Validate JSON-LD schemas and check rich result eligibility — no account needed.
          </p>
          {remaining !== null && remaining > 0 && (
            <p className="mt-3 text-xs text-gray-600">
              {remaining} free check{remaining !== 1 ? "s" : ""} remaining today
            </p>
          )}
        </div>

        {/* URL input form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(null); }}
                placeholder="https://yoursite.com/product-page"
                aria-label="URL to validate"
                aria-describedby={urlError ? "url-error" : undefined}
                className={cn(
                  "w-full px-4 py-3.5 rounded-xl border text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors",
                  CARD,
                  urlError
                    ? "border-red-700 focus:border-red-500"
                    : cn(BORDER, "focus:border-indigo-600")
                )}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-indigo-900/30 whitespace-nowrap"
            >
              {loading ? "Validating…" : "Validate →"}
            </button>
          </div>
          {urlError && (
            <p id="url-error" className="mt-2 text-sm text-red-400">
              {urlError}
            </p>
          )}
        </form>

        {/* Loading state */}
        {loading && (
          <div className={cn("rounded-xl border p-8 text-center", CARD, BORDER)}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg
                className="animate-spin text-indigo-400"
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <span className="text-gray-400 text-sm">Fetching and validating…</span>
            </div>
            {url && (
              <p className="text-xs text-gray-600 font-mono truncate max-w-md mx-auto">{url}</p>
            )}
          </div>
        )}

        {/* Error state */}
        {errorMsg && !loading && (
          <div className={cn("rounded-xl border border-red-900/50 p-5", "bg-red-950/20")}>
            <div className="flex gap-3">
              <svg className="flex-shrink-0 text-red-400 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 5v5M9 12.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-red-400 mb-1">Validation failed</p>
                <p className="text-sm text-gray-400">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* No schemas found */}
        {noSchemas && !loading && (
          <div className={cn("rounded-xl border p-8 text-center", CARD, BORDER)}>
            <div className="w-12 h-12 rounded-xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-gray-400" aria-hidden="true">
                <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 7v5M11 15v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-white font-semibold mb-2">No structured data found</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              No JSON-LD schema markup was detected on this page. Many sites don&apos;t use
              schema markup — this is actually an opportunity to stand out in search results.
            </p>
            {result?.message && (
              <p className="mt-4 text-xs text-gray-600 max-w-sm mx-auto">{result.message}</p>
            )}
            <a
              href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Learn how to add structured data →
            </a>
          </div>
        )}

        {/* Results */}
        {result && !noSchemas && !loading && (
          <div className="space-y-6">
            {/* Score + summary bar */}
            <div className={cn("rounded-xl border p-6", CARD, BORDER)}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Score gauge */}
                <div className="flex-shrink-0">
                  <ScoreGauge score={result.summary.score} />
                </div>

                {/* Summary */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold mb-1 text-center sm:text-left">
                    Validation complete
                  </h2>
                  {result.url && (
                    <p className="text-xs text-gray-600 font-mono truncate mb-4 text-center sm:text-left">
                      {result.url}
                    </p>
                  )}

                  {/* Summary badges */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge variant="blue">
                      {result.schemas_found} schema{result.schemas_found !== 1 ? "s" : ""} found
                    </Badge>
                    {result.summary.valid_schemas > 0 && (
                      <Badge variant="green">
                        {result.summary.valid_schemas} valid
                      </Badge>
                    )}
                    {result.summary.invalid_schemas > 0 && (
                      <Badge variant="red">
                        {result.summary.invalid_schemas} invalid
                      </Badge>
                    )}
                    {result.summary.total_errors > 0 && (
                      <Badge variant="red">
                        {result.summary.total_errors} error{result.summary.total_errors !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {result.summary.total_warnings > 0 && (
                      <Badge variant="yellow">
                        {result.summary.total_warnings} warning{result.summary.total_warnings !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {result.summary.rich_result_eligible > 0 && (
                      <Badge variant="green">
                        {result.summary.rich_result_eligible} rich result eligible
                      </Badge>
                    )}
                  </div>

                  {/* Parse errors note */}
                  {result.parse_errors && result.parse_errors.length > 0 && (
                    <p className="mt-3 text-xs text-amber-400/80">
                      {result.parse_errors.length} JSON parse error{result.parse_errors.length !== 1 ? "s" : ""} encountered in raw schema blocks.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Per-schema cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide px-1">
                Schema Details
              </h3>
              {result.schemas.map((schema, i) => (
                <SchemaCard key={`${schema.type}-${i}`} schema={schema} />
              ))}
            </div>

            {/* CTA after results */}
            <div className={cn("rounded-xl border p-6 text-center", SURFACE, BORDER)}>
              <p className="text-white font-semibold mb-1">Want to validate more?</p>
              <p className="text-gray-400 text-sm mb-5">
                Get a free API key — 100 validations/month, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/#signup"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/30"
                >
                  Get Free API Key →
                </Link>
                <Link
                  href="/docs"
                  className={cn("text-sm border px-5 py-2.5 rounded-xl font-medium transition-colors text-gray-400 hover:text-white hover:border-gray-600", BORDER)}
                >
                  View API docs
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty state — no interaction yet */}
        {!loading && !result && !errorMsg && !initialUrl && (
          <div className={cn("rounded-xl border p-8 text-center", CARD, BORDER)}>
            <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-900/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-400 text-xl" aria-hidden="true">⬡</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              Enter any URL above to check its structured data markup. We&apos;ll look for
              JSON-LD schemas and tell you exactly what&apos;s valid, what&apos;s broken, and
              whether you qualify for Google rich results.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function CheckPage() {
  return (
    <Suspense
      fallback={
        <div className={cn("min-h-screen flex items-center justify-center", BG)}>
          <div className="text-gray-600 text-sm">Loading…</div>
        </div>
      }
    >
      <CheckPageContent />
    </Suspense>
  );
}
