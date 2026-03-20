"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── palette helpers ────────────────────────────────────────────────────────
const BG      = "bg-[#0a0a0f]";
const SURFACE = "bg-[#111118]";
const CARD    = "bg-[#16161f]";
const BORDER  = "border-gray-800";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── icons ──────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block flex-shrink-0 mt-px">
      <circle cx="8" cy="8" r="8" fill="#22c55e" fillOpacity=".15" />
      <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block flex-shrink-0 mt-px">
      <circle cx="8" cy="8" r="8" fill="#ef4444" fillOpacity=".15" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block flex-shrink-0 mt-px">
      <circle cx="8" cy="8" r="8" fill="#f59e0b" fillOpacity=".15" />
      <path d="M8 5v4M8 11v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function CopyIcon({ done }: { done: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      {done
        ? <path d="M3 8l3 3 7-7" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        : <>
            <rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 5h2v9h7v2H2z" fill="currentColor" opacity=".35" />
          </>
      }
    </svg>
  );
}

// ─── Nav ────────────────────────────────────────────────────────────────────
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
          <Link href="/check" className="hover:text-white transition-colors">Check a URL</Link>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
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
          <a
            href="#signup"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
          >
            Get API Key →
          </a>
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
          <Link href="/check" className="block text-sm text-gray-400 hover:text-white transition-colors py-1">Check a URL</Link>
          <a href="#pricing" className="block text-sm text-gray-400 hover:text-white transition-colors py-1" onClick={() => setMobileOpen(false)}>Pricing</a>
          <Link href="/blog" className="block text-sm text-gray-400 hover:text-white transition-colors py-1">Blog</Link>
          <Link href="/schema-types" className="block text-sm text-gray-400 hover:text-white transition-colors py-1">Schema Types</Link>
          <Link href="/dashboard/login" className="block text-sm text-gray-400 hover:text-white transition-colors py-1">Sign in</Link>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    const target = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    router.push(`/check?url=${encodeURIComponent(target)}`);
  }

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* badge */}
      <div className="flex justify-center mb-7">
        <span className="text-xs px-3 py-1.5 rounded-full border border-indigo-900/60 bg-indigo-950/40 text-indigo-400 font-medium">
          35+ schema types · Rich result eligibility · Fix suggestions included
        </span>
      </div>

      {/* headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-white leading-[1.1] tracking-tight mb-5 max-w-4xl mx-auto">
        Find out if your structured data actually qualifies for rich results —{" "}
        <span className="text-indigo-400">before Google tells you it doesn&apos;t.</span>
      </h1>

      <p className="text-center text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        No more copy-pasting URLs into Google&apos;s Rich Results Test one at a time.
        Validate one page or thousands — and get exact fix instructions.
      </p>

      {/* Primary: URL checker */}
      <form onSubmit={handleCheck} className="max-w-2xl mx-auto mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yoursite.com/product-page"
            className={cn(
              "flex-1 px-4 py-3.5 rounded-xl border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors",
              BORDER, CARD
            )}
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-indigo-900/30 whitespace-nowrap"
          >
            Check for free →
          </button>
        </div>
        <p className="text-center text-gray-700 text-xs mt-3">No account needed to check a URL.</p>
      </form>

      {/* Secondary: API key */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
        <a
          href="#signup"
          className={cn("text-sm border px-5 py-2.5 rounded-xl font-medium transition-colors text-gray-400 hover:text-white hover:border-gray-600", BORDER)}
        >
          Get API Key — validate at scale →
        </a>
        <Link
          href="/docs"
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          Read the docs
        </Link>
      </div>

      {/* validation result preview */}
      <div className="mt-14 grid lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {/* error card */}
        <div className={cn("rounded-2xl border overflow-hidden", "border-red-900/50")}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-red-900/30 bg-red-950/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-400 font-medium">2 errors found</span>
          </div>
          <div className="p-4 bg-red-950/10 space-y-3">
            <div className="flex items-start gap-2.5">
              <XIcon />
              <div>
                <p className="text-sm text-gray-200 font-medium">Missing author</p>
                <p className="text-xs text-gray-500 mt-0.5">Required for Article rich results</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <XIcon />
              <div>
                <p className="text-sm text-gray-200 font-medium">Missing datePublished</p>
                <p className="text-xs text-gray-500 mt-0.5">Required property not found</p>
              </div>
            </div>
          </div>
        </div>

        {/* warning card */}
        <div className={cn("rounded-2xl border overflow-hidden", "border-amber-900/50")}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-900/30 bg-amber-950/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-400 font-medium">1 warning</span>
          </div>
          <div className="p-4 bg-amber-950/10 space-y-3">
            <div className="flex items-start gap-2.5">
              <WarnIcon />
              <div>
                <p className="text-sm text-gray-200 font-medium">Image missing</p>
                <p className="text-xs text-gray-500 mt-0.5">Recommended for rich result display</p>
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-amber-950/30 border border-amber-900/30 px-3 py-2">
              <p className="text-xs text-amber-300/80">Fix: Add <span className="font-mono">&quot;image&quot;</span> with an absolute URL</p>
            </div>
          </div>
        </div>

        {/* eligible card */}
        <div className={cn("rounded-2xl border overflow-hidden", "border-emerald-900/50")}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-900/30 bg-emerald-950/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 font-medium">Rich result eligible</span>
          </div>
          <div className="p-4 bg-emerald-950/10 space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckIcon />
              <div>
                <p className="text-sm text-gray-200 font-medium">Organization · valid</p>
                <p className="text-xs text-gray-500 mt-0.5">All required properties present</p>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/30 px-3 py-2">
              <p className="text-xs text-emerald-300/80">Score: <span className="font-semibold">87</span> / 100</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Enter your URL or paste your schema",
      description: "Drop in any page URL or paste schema markup directly. No setup, no account required to get started.",
      icon: "🔗",
      detail: "Works with any public URL — product pages, articles, local business listings, and more.",
    },
    {
      number: "2",
      title: "Get instant validation results",
      description: "See every error, warning, and fix suggestion in seconds. Each issue includes an exact fix — not vague hints.",
      icon: "⚡",
      detail: "Errors block rich results. Warnings hurt them. We show you both, ranked by impact.",
    },
    {
      number: "3",
      title: "Check rich result eligibility",
      description: "Know exactly which rich result types your page qualifies for — based on Google's current rules, not last year's.",
      icon: "🎯",
      detail: "Google changes the rules regularly. We track every update so your data stays current.",
    },
  ];

  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">How it works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Three steps to knowing exactly where you stand
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            No reading Google documentation. No guessing. Just clear answers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className={cn("rounded-2xl border p-6 flex flex-col gap-4", BORDER, CARD)}
            >
              <div className="flex items-center gap-4">
                <span className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
                  {step.number}
                </span>
                <span className="text-2xl">{step.icon}</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2 leading-snug">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">{step.description}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/check"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-indigo-900/30"
          >
            Try it now — free →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── What We Catch ───────────────────────────────────────────────────────────
const CATCH_EXAMPLES = [
  {
    type: "Article",
    status: "broken",
    issue: "Missing author",
    explanation: "Google won't show the rich result. Author is required for Article snippets.",
    fixLabel: "Add author with @type Person and a name",
  },
  {
    type: "Product",
    status: "broken",
    issue: "Offers missing price",
    explanation: "No price means no rich snippet. Google requires both price and availability.",
    fixLabel: "Add offers.price and offers.availability",
  },
  {
    type: "HowTo",
    status: "deprecated",
    issue: "Deprecated schema type",
    explanation: "Google retired HowTo rich results in August 2024. This markup does nothing.",
    fixLabel: "Remove or replace with a supported type",
  },
  {
    type: "FAQPage",
    status: "restricted",
    issue: "No longer eligible for your site",
    explanation: "Since 2024, FAQPage rich results are restricted to government and health authority sites.",
    fixLabel: "Consider switching to a different schema type",
  },
  {
    type: "LocalBusiness",
    status: "warning",
    issue: "Phone number format invalid",
    explanation: "The phone number uses a non-standard format. Use E.164 format for reliable parsing.",
    fixLabel: 'Use "+1-555-000-0000" format',
  },
  {
    type: "Recipe",
    status: "broken",
    issue: "Headline exceeds 110 characters",
    explanation: "Google truncates headlines at 110 characters. The rich result may not display correctly.",
    fixLabel: "Shorten headline to 110 characters or fewer",
  },
];

const STATUS_COLORS = {
  broken:     { card: "border-red-900/40 bg-red-950/10", badge: "bg-red-950/50 border-red-900/50 text-red-400", dot: "bg-red-500" },
  deprecated: { card: "border-orange-900/40 bg-orange-950/10", badge: "bg-orange-950/50 border-orange-900/50 text-orange-400", dot: "bg-orange-500" },
  restricted: { card: "border-amber-900/40 bg-amber-950/10", badge: "bg-amber-950/50 border-amber-900/50 text-amber-400", dot: "bg-amber-500" },
  warning:    { card: "border-yellow-900/40 bg-yellow-950/10", badge: "bg-yellow-950/50 border-yellow-900/50 text-yellow-400", dot: "bg-yellow-500" },
};

const STATUS_LABELS = {
  broken: "Error",
  deprecated: "Deprecated",
  restricted: "Restricted",
  warning: "Warning",
};

function WhatWeCatch() {
  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">What we catch</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Real problems. Real explanations. Real fixes.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Most schema tools tell you something is wrong. We tell you exactly what it means and how to fix it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {CATCH_EXAMPLES.map((ex) => {
            const colors = STATUS_COLORS[ex.status as keyof typeof STATUS_COLORS];
            return (
              <div key={ex.type + ex.issue} className={cn("rounded-2xl border p-5 flex flex-col gap-3", colors.card)}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">{ex.type}</span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", colors.badge)}>
                    {STATUS_LABELS[ex.status as keyof typeof STATUS_LABELS]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{ex.issue}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{ex.explanation}</p>
                </div>
                <div className="mt-auto pt-2 border-t border-white/5">
                  <p className="text-xs text-gray-500">
                    <span className="text-indigo-400">Fix →</span> {ex.fixLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Before / After */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Before */}
          <div className={cn("rounded-2xl border overflow-hidden flex flex-col", "border-red-900/40")}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-red-900/30 bg-red-950/20">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-400">Before — missing required fields</span>
            </div>
            <div className="p-5 flex-1 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-950/20 border border-red-900/30">
                <XIcon />
                <div>
                  <p className="text-sm text-white font-medium">Article schema · not eligible</p>
                  <p className="text-xs text-gray-500 mt-0.5">Missing: author, datePublished, image</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-950/20 border border-red-900/30">
                <XIcon />
                <div>
                  <p className="text-sm text-white font-medium">Score: 12 / 100</p>
                  <p className="text-xs text-gray-500 mt-0.5">3 errors blocking rich results</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/20 border border-amber-900/30">
                <WarnIcon />
                <div>
                  <p className="text-sm text-white font-medium">HowTo schema present</p>
                  <p className="text-xs text-gray-500 mt-0.5">Deprecated — Google stopped showing these in Aug 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className={cn("rounded-2xl border overflow-hidden flex flex-col", "border-emerald-900/40")}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-900/30 bg-emerald-950/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-400">After — fully valid, rich result eligible</span>
            </div>
            <div className="p-5 flex-1 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                <CheckIcon />
                <div>
                  <p className="text-sm text-white font-medium">Article schema · eligible</p>
                  <p className="text-xs text-gray-500 mt-0.5">All required properties present</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                <CheckIcon />
                <div>
                  <p className="text-sm text-white font-medium">Score: 94 / 100</p>
                  <p className="text-xs text-gray-500 mt-0.5">0 errors · 1 optional recommendation</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                <CheckIcon />
                <div>
                  <p className="text-sm text-white font-medium">HowTo replaced with Article</p>
                  <p className="text-xs text-gray-500 mt-0.5">Eligible for Google rich result display</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Rich Result Eligibility ─────────────────────────────────────────────────
const SCHEMA_STATUS = [
  { type: "Article",            status: "eligible",   note: "headline + author + image + datePublished" },
  { type: "Product",            status: "eligible",   note: "name + image + offers (price + availability)" },
  { type: "LocalBusiness",      status: "eligible",   note: "name + PostalAddress" },
  { type: "BreadcrumbList",     status: "eligible",   note: "non-empty itemListElement" },
  { type: "WebSite",            status: "eligible",   note: "name + url + potentialAction with urlTemplate" },
  { type: "Organization",       status: "eligible",   note: "name + url + logo" },
  { type: "Recipe",             status: "eligible",   note: "name + image + recipeIngredient + instructions" },
  { type: "Event",              status: "eligible",   note: "name + startDate + location" },
  { type: "FAQPage",            status: "restricted", note: "Government & health authority sites only (2024)" },
  { type: "HowTo",              status: "deprecated", note: "Retired by Google — August 2024" },
  { type: "SpecialAnnouncement", status: "deprecated", note: "Retired by Google — 2025" },
];

const STATUS_BADGE: Record<string, string> = {
  eligible:   "bg-emerald-950/50 border-emerald-900/60 text-emerald-400",
  restricted: "bg-amber-950/50  border-amber-900/60  text-amber-400",
  deprecated: "bg-red-950/50    border-red-900/60    text-red-400",
};

function RichResultEligibility() {
  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          {/* table */}
          <div className={cn("rounded-2xl border overflow-hidden", BORDER)}>
            <div className={cn("flex items-center justify-between px-5 py-2.5 border-b text-xs text-gray-600 font-mono", SURFACE, BORDER)}>
              <span>schema_type</span>
              <span>rich_result_status</span>
            </div>
            {SCHEMA_STATUS.map((row) => (
              <div key={row.type} className={cn("px-5 py-3 border-b last:border-0 flex items-center justify-between gap-3", BORDER, CARD)}>
                <div>
                  <span className="text-sm font-mono text-gray-200">{row.type}</span>
                  <p className="text-xs text-gray-600 mt-0.5">{row.note}</p>
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize flex-shrink-0", STATUS_BADGE[row.status])}>
                  {row.status}
                </span>
              </div>
            ))}
            <div className={cn("px-5 py-3 text-center", SURFACE)}>
              <Link href="/schema-types" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                See all 35+ schema types →
              </Link>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Rich result eligibility</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
              Google changes the rules.<br />We track the changes.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              FAQPage was restricted in 2024 to government and health sites. HowTo was killed in August 2024. SpecialAnnouncement is gone. SchemaCheck reflects these changes so your audit results are accurate — not based on outdated information.
            </p>
            <ul className="space-y-3 text-sm mb-8">
              {[
                "Checks all current Google rich result requirements",
                "Deprecated types flagged with exact retirement dates",
                "FAQPage restriction applied for non-gov/health sites",
                "Product offers depth check — price and availability required",
                "Every issue links directly to Google's documentation",
                "Updated when Google changes the rules",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
            <div className={cn("rounded-xl border p-4 text-sm", BORDER, CARD)}>
              <p className="text-gray-400 leading-relaxed">
                <span className="text-white font-medium">Why this matters:</span> If your page still uses HowTo schema, it has zero chance of showing a rich result — even if it&apos;s perfectly formatted. Knowing this upfront saves hours of debugging.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── For Developers ──────────────────────────────────────────────────────────
const DEV_TABS: { key: string; label: string }[] = [
  { key: "curl",       label: "curl"       },
  { key: "javascript", label: "JavaScript" },
  { key: "python",     label: "Python"     },
  { key: "php",        label: "PHP"        },
  { key: "go",         label: "Go"         },
];

const DEV_CODE: Record<string, string> = {
  curl: `curl -s \\
  "https://api.schemacheck.dev/v1/validate\\
?url=https://example.com\\
&access_key=YOUR_KEY" | jq '.summary'

# Response:
# {
#   "score": 87,
#   "total_schemas": 3,
#   "valid_schemas": 3,
#   "total_errors": 0,
#   "rich_result_eligible": 2
# }`,

  javascript: `const res = await fetch(
  "https://api.schemacheck.dev/v1/validate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "YOUR_KEY",
    },
    body: JSON.stringify({
      url: "https://example.com",
    }),
  }
);

const data = await res.json();

console.log("Score:", data.summary.score);

data.schemas.forEach((schema) => {
  if (!schema.rich_result_eligible) {
    console.log(
      schema.type,
      schema.rich_result.reason
    );
  }
  schema.errors.forEach((err) => {
    console.log(\`Fix: \${err.fix}\`);
  });
});`,

  python: `import httpx

resp = httpx.post(
    "https://api.schemacheck.dev/v1/validate",
    headers={"x-api-key": "YOUR_KEY"},
    json={"url": "https://example.com"},
)
data = resp.json()

print(f"Score:   {data['summary']['score']}")
print(f"Schemas: {data['schemas_found']}")

for schema in data["schemas"]:
    if not schema["rich_result_eligible"]:
        print(
            f"[{schema['type']}] "
            f"{schema['rich_result']['reason']}"
        )
    for err in schema["errors"]:
        print(f"  ✗ {err['property']}: {err['message']}")
        print(f"    Fix: {err['fix']}")`,

  php: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->post(
    'https://api.schemacheck.dev/v1/validate',
    [
        'headers' => [
            'x-api-key'    => 'YOUR_KEY',
            'Content-Type' => 'application/json',
        ],
        'json' => ['url' => 'https://example.com'],
    ]
);

$data = json_decode($response->getBody(), true);

echo "Score: " . $data['summary']['score'] . "\\n";

foreach ($data['schemas'] as $schema) {
    foreach ($schema['errors'] as $err) {
        echo "[{$schema['type']}] {$err['property']}\\n";
        echo "Fix: {$err['fix']}\\n";
    }
}`,

  go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    body, _ := json.Marshal(map[string]string{
        "url": "https://example.com",
    })
    req, _ := http.NewRequest(
        "POST",
        "https://api.schemacheck.dev/v1/validate",
        bytes.NewBuffer(body),
    )
    req.Header.Set("x-api-key", "YOUR_KEY")
    req.Header.Set("Content-Type", "application/json")

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()

    var data map[string]any
    json.NewDecoder(resp.Body).Decode(&data)

    summary := data["summary"].(map[string]any)
    fmt.Printf("Score: %v\\n", summary["score"])
    fmt.Printf("Schemas: %v\\n", data["schemas_found"])
}`,
};

function ForDevelopers() {
  const [tab,    setTab]    = useState("javascript");
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(DEV_CODE[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">For developers</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
              Built API-first.<br />Plug in anywhere.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Validate structured data in CI/CD before shipping. Catch regressions in your CMS on every publish. Run batch audits across thousands of URLs programmatically.
            </p>
            <ul className="space-y-3 text-sm mb-8">
              {[
                "One endpoint — GET or POST, your choice",
                "Pass a URL or raw schema markup directly",
                "Returns errors, warnings, fixes, and eligibility in one call",
                "Sub-50ms for direct schema input, 1–3s for URL fetching",
                "Cached responses free — repeat checks don't burn credits",
                "SDKs for JavaScript, Python, PHP, Go, Ruby, C#",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs/quickstart"
                className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                Quickstart guide →
              </Link>
              <Link
                href="/openapi.json"
                className={cn("text-sm border px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors", BORDER)}
              >
                OpenAPI spec
              </Link>
            </div>
          </div>

          <div className={cn("rounded-2xl border overflow-hidden", BORDER)}>
            {/* tab bar */}
            <div className={cn("flex items-stretch border-b overflow-x-auto", BORDER, SURFACE)}>
              {DEV_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium border-r flex-shrink-0 transition-colors",
                    BORDER,
                    tab === key
                      ? "text-white bg-[#16161f]"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#16161f]/50"
                  )}
                >
                  {label}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={copy}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <CopyIcon done={copied} />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            {/* code */}
            <pre className={cn("p-6 text-sm font-mono overflow-auto max-h-80 leading-relaxed text-gray-300", CARD)}>
              {DEV_CODE[tab]}
            </pre>

            {/* endpoint hint */}
            <div className={cn("px-6 py-4 border-t text-xs text-gray-600 font-mono", BORDER, SURFACE)}>
              POST https://api.schemacheck.dev/v1/validate
              <span className="mx-2 text-gray-800">·</span>
              <span className="text-indigo-400">x-api-key</span>: YOUR_KEY
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Integrations ────────────────────────────────────────────────────────────
function Integrations() {
  const tools = [
    { name: "Zapier",         icon: "⚡", status: "soon",  desc: "Trigger validations from any Zap" },
    { name: "Make",           icon: "◎", status: "soon",  desc: "Schema checks in any automation" },
    { name: "n8n",            icon: "⬡", status: "soon",  desc: "Self-hosted workflow automation" },
    { name: "CLI Tool",       icon: "⌨", status: "soon",  desc: "Validate from your terminal" },
    { name: "GitHub Action",  icon: "🐙", status: "soon",  desc: "Block deploys on schema errors" },
  ];

  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Integrations</span>
          <h2 className="text-3xl font-bold text-white mt-3 mb-3">Works with your existing workflow</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Connect SchemaCheck to your CMS, CI/CD pipeline, or no-code automation tool.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {tools.map(({ name, icon, desc }) => (
            <div key={name} className={cn("flex items-start gap-4 border rounded-2xl px-5 py-4", BORDER, CARD)}>
              <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-200 text-sm">{name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded border border-indigo-900/60 text-indigo-500">Soon</span>
                </div>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
          {/* REST API — available now */}
          <div className={cn("flex items-start gap-4 border rounded-2xl px-5 py-4 border-emerald-900/40 bg-emerald-950/10")}>
            <span className="text-2xl flex-shrink-0 mt-0.5">🔌</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-200 text-sm">REST API</span>
                <span className="text-xs px-1.5 py-0.5 rounded border border-emerald-900/50 text-emerald-400">Available now</span>
              </div>
              <p className="text-xs text-gray-500">Integrate anywhere with HTTP</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="#signup"
            className={cn("inline-flex items-center gap-2 border text-sm px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors", BORDER)}
          >
            Get notified when integrations launch →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Use Cases ───────────────────────────────────────────────────────────────
const USE_CASES = [
  {
    persona: "SEO Manager",
    icon: "📊",
    description: "Managing structured data across 20 sites is impossible manually. SchemaCheck gives you a single API to audit all of them on a schedule — and alerts you when something breaks.",
    highlights: [
      "Batch validate hundreds of URLs at once",
      "Schedule recurring checks for monitoring",
      "Get alerts when schema errors appear",
      "Export results for client reports",
    ],
    badge: "For SEOs",
    badgeColor: "bg-blue-950/50 border-blue-900/50 text-blue-400",
  },
  {
    persona: "Developer",
    icon: "⚙️",
    description: "Schema bugs ship silently. A rich result that worked yesterday can break tomorrow after a template change. SchemaCheck plugs into CI/CD so you catch regressions before they reach production.",
    highlights: [
      "Validate in CI/CD with one API call",
      "POST raw schema markup directly",
      "Non-zero exit code on errors (blocks deploys)",
      "SDKs for every major language",
    ],
    badge: "For Devs",
    badgeColor: "bg-violet-950/50 border-violet-900/50 text-violet-400",
  },
  {
    persona: "Agency",
    icon: "🏢",
    description: "Client audits that used to take days now take minutes. Run a full schema audit across a client's entire site, export a clean report, and show exactly what needs fixing and why.",
    highlights: [
      "Audit entire sites programmatically",
      "Structured results ready for reports",
      "Catch deprecated schema before client review",
      "White-label API for your own tools",
    ],
    badge: "For Agencies",
    badgeColor: "bg-emerald-950/50 border-emerald-900/50 text-emerald-400",
  },
  {
    persona: "E-commerce",
    icon: "🛒",
    description: "Product rich results drive clicks. But with thousands of product pages, one template change can break rich results sitewide. SchemaCheck monitors your catalog continuously.",
    highlights: [
      "Validate Product schema at scale",
      "Catch missing price or availability instantly",
      "Monitor catalog pages on a schedule",
      "Trigger alerts on schema regressions",
    ],
    badge: "For E-commerce",
    badgeColor: "bg-orange-950/50 border-orange-900/50 text-orange-400",
  },
];

function UseCases() {
  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Use cases</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Built for everyone who cares about rich results
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Whether you manage one site or thousands, SchemaCheck fits into how you work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {USE_CASES.map((uc) => (
            <div key={uc.persona} className={cn("rounded-2xl border p-6", BORDER, CARD)}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{uc.icon}</span>
                  <h3 className="text-base font-semibold text-white">{uc.persona}</h3>
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0", uc.badgeColor)}>
                  {uc.badge}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">{uc.description}</p>
              <ul className="space-y-2">
                {uc.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm">
                    <CheckIcon />
                    <span className="text-gray-300">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
type Plan = {
  name:         string;
  monthly:      number;
  annual:       number;
  limit:        number;
  rate:         string;
  overage:      string;
  monitored:    string;
  cta:          string;
  href:         string;
  recommended?: boolean;
  features:     string[];
};

const PLANS: Plan[] = [
  {
    name: "Free", monthly: 0, annual: 0,
    limit: 100, rate: "10 req/min", overage: "—", monitored: "1 URL monitored",
    cta: "Get started free", href: "#signup",
    features: [
      "100 validations / month",
      "GET + POST endpoints",
      "All 35+ schema types",
      "Rich result eligibility",
      "Fix suggestions + google_docs_url",
      "1-hour response cache",
      "1 URL monitored",
    ],
  },
  {
    name: "Basic", monthly: 19, annual: 159,
    limit: 3_000, rate: "30 req/min", overage: "$0.008 / extra", monitored: "10 URLs monitored",
    cta: "Start with Basic", href: "/dashboard/login?plan=basic",
    features: [
      "3,000 validations / month",
      "Everything in Free",
      "Overage billing ($0.008 ea)",
      "Usage alerts at 90% + 100%",
      "Email support",
      "10 URLs monitored",
    ],
  },
  {
    name: "Growth", monthly: 79, annual: 659,
    limit: 15_000, rate: "60 req/min", overage: "$0.005 / extra", monitored: "50 URLs monitored",
    cta: "Start with Growth", href: "/dashboard/login?plan=growth",
    recommended: true,
    features: [
      "15,000 validations / month",
      "Everything in Basic",
      "Overage billing ($0.005 ea)",
      "60 req/min rate limit",
      "Priority email support",
      "50 URLs monitored",
    ],
  },
  {
    name: "Scale", monthly: 199, annual: 1_659,
    limit: 75_000, rate: "120 req/min", overage: "$0.003 / extra", monitored: "200 URLs monitored",
    cta: "Start with Scale", href: "/dashboard/login?plan=scale",
    features: [
      "75,000 validations / month",
      "Everything in Growth",
      "Overage billing ($0.003 ea)",
      "120 req/min rate limit",
      "SLA + priority support",
      "200 URLs monitored",
    ],
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Simple, usage-based pricing
          </h2>
          <p className="text-gray-400 mb-8">Start for free. Upgrade when you need more.</p>

          {/* toggle */}
          <div className="inline-flex items-center gap-3 text-sm">
            <span className={cn(annual ? "text-gray-600" : "text-white font-medium")}>Monthly</span>
            <button
              onClick={() => setAnnual((a) => !a)}
              aria-label="Toggle annual billing"
              className={cn("relative w-11 h-6 rounded-full transition-colors focus:outline-none", annual ? "bg-indigo-600" : "bg-gray-700")}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  annual ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn(annual ? "text-white font-medium" : "text-gray-600")}>
              Annual <span className="text-emerald-400 text-xs font-medium ml-1">2 months free</span>
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const displayMonthly = annual
              ? (plan.annual === 0 ? 0 : Math.round(plan.annual / 12))
              : plan.monthly;
            const savings = plan.monthly * 12 - plan.annual;

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl border p-6 flex flex-col",
                  plan.recommended
                    ? "border-indigo-600 bg-indigo-950/20"
                    : cn(BORDER, CARD)
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-indigo-600 px-3 py-1 rounded-full whitespace-nowrap shadow">
                    Most popular
                  </div>
                )}

                <div className="mb-5">
                  <div className="text-sm font-semibold text-gray-300 mb-2">{plan.name}</div>
                  <div className="flex items-end gap-1 mb-0.5">
                    <span className="text-4xl font-bold text-white">${displayMonthly}</span>
                    <span className="text-gray-600 text-sm mb-1.5">/mo</span>
                  </div>
                  {annual && plan.annual > 0 && (
                    <p className="text-xs text-gray-600">
                      ${plan.annual}/yr · saves ${savings}
                    </p>
                  )}
                  {plan.monthly === 0 && (
                    <p className="text-xs text-gray-700">forever free</p>
                  )}
                </div>

                <div className={cn("text-xs space-y-1 mb-5 pb-5 border-b", BORDER)}>
                  <div className="text-gray-500">
                    <span className="text-gray-300 font-medium">{plan.limit.toLocaleString()}</span> validations/mo
                  </div>
                  <div className="text-gray-500">
                    Rate limit: <span className="text-gray-300">{plan.rate}</span>
                  </div>
                  <div className="text-gray-500">
                    Overage: <span className="text-gray-300">{plan.overage}</span>
                  </div>
                  <div className="text-gray-500">
                    Monitoring: <span className="text-gray-300">{plan.monitored}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={cn(
                    "block w-full text-center text-sm py-2.5 rounded-xl font-medium transition-colors",
                    plan.recommended
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : cn("border hover:border-gray-700 text-gray-300 hover:text-white", BORDER)
                  )}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-700 text-xs mt-8">
          No credit card required to start · 30-day money-back guarantee · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
type FaqItem = { q: string; a: React.ReactNode };

const FAQS: FaqItem[] = [
  {
    q: "Do I need to know how to code?",
    a: "No. Use the web checker at /check — paste a URL and get results instantly, no account needed. If you want to automate or connect to other tools, you can also use Zapier or n8n (coming soon). The API is there when you need it.",
  },
  {
    q: "What's the difference between SchemaCheck and Google's Rich Results Test?",
    a: "Google's tool is for checking one URL manually in a browser. SchemaCheck is for checking at scale — programmatically, continuously, in CI/CD, or across hundreds of URLs at once. We also track Google's rule changes so your results stay accurate over time.",
  },
  {
    q: "Can I validate my entire site at once?",
    a: "Yes. Use batch validation via the API — POST a list of URLs and get results back in one call. You can also paste a list of URLs in the web checker at /check. For large sites, the API is the fastest path.",
  },
  {
    q: "Do failed validations count against my quota?",
    a: "No. Only successful 200 responses from real computation count. 4xx errors (bad API key, invalid URL, missing input, rate limit) never consume a credit.",
  },
  {
    q: "Do cached responses count against my quota?",
    a: "No. URL results are cached for 1 hour. Repeat requests for the same URL within that window return instantly and use zero credits.",
  },
  {
    q: "What schema types do you support?",
    a: "35+ types across 4 tiers: Article, Product, LocalBusiness, Organization, BreadcrumbList, WebSite, FAQPage (Tier 1 — full validation), plus Recipe, Event, VideoObject, JobPosting, Course, SoftwareApplication and more (Tiers 2–4). See the full list at /schema-types.",
  },
  {
    q: "Is there really a free tier — forever?",
    a: "Yes. 100 validations per month, no credit card, no trial period, no expiry. It's enough to check your own site or test the integration before committing to a paid plan.",
  },
  {
    q: "How fast is the API?",
    a: "Schema markup input is typically under 50ms. URL requests require fetching the target page — most return in 1–3 seconds. Cache hits are near-instant.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard at any time. You retain access until the end of the current billing period. No cancellation fees.",
  },
  {
    q: "What is the refund policy?",
    a: "30-day no-questions refund on all paid plans. Email us with your order and you'll be refunded within one business day.",
  },
  {
    q: "Is SchemaCheck the best schema validation tool?",
    a: (
      <>
        We think so — but you should decide for yourself.{" "}
        <Link href="/comparisons/google-rich-results-test-alternative" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
          See how we compare to Google&apos;s Rich Results Test →
        </Link>
      </>
    ),
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((item, i) => (
            <div key={i} className={cn("rounded-xl border overflow-hidden", BORDER)}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className={cn(
                  "w-full flex items-center justify-between text-left px-5 py-4 text-sm font-medium text-gray-200 hover:text-white transition-colors",
                  CARD
                )}
              >
                <span className="pr-4">{item.q}</span>
                <span className={cn("text-gray-600 text-lg leading-none transition-transform flex-shrink-0", open === i ? "rotate-45" : "")}>
                  +
                </span>
              </button>
              {open === i && (
                <div className={cn("px-5 pt-4 pb-5 text-sm text-gray-400 leading-relaxed border-t", SURFACE, BORDER)}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Signup CTA ──────────────────────────────────────────────────────────────
function SignupCta() {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle");
  const [apiKey,  setApiKey]  = useState("");
  const [errMsg,  setErrMsg]  = useState("");
  const [urlInput, setUrlInput] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res  = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.api_key) {
        setApiKey(data.api_key);
        setStatus("success");
      } else {
        setErrMsg(data?.error?.message ?? "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  function handleUrlCheck(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const target = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    router.push(`/check?url=${encodeURIComponent(target)}`);
  }

  return (
    <section id="signup" className={cn("py-24 border-t", BORDER)}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Get started</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-3">
            Check your structured data today
          </h2>
          <p className="text-gray-400">
            No account needed to check a URL. Free API key for automation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* URL checker */}
          <div className={cn("rounded-2xl border p-6", BORDER, CARD)}>
            <div className="mb-4">
              <p className="text-sm font-semibold text-white mb-1">Check a URL now</p>
              <p className="text-xs text-gray-500">No account required</p>
            </div>
            <form onSubmit={handleUrlCheck} className="space-y-3">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://yoursite.com/page"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors",
                  BORDER, SURFACE
                )}
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Validate for free →
              </button>
            </form>
          </div>

          {/* API key */}
          <div className={cn("rounded-2xl border p-6", BORDER, CARD)}>
            <div className="mb-4">
              <p className="text-sm font-semibold text-white mb-1">Get an API key</p>
              <p className="text-xs text-gray-500">100 validations/month free forever</p>
            </div>

            {status === "success" ? (
              <div>
                <p className="text-xs text-gray-400 mb-2">Your API key is ready. Save it somewhere safe.</p>
                <div className={cn("rounded-lg border p-3 font-mono text-xs break-all select-all cursor-text mb-3", BORDER, SURFACE)}>
                  <span className="text-indigo-300">{apiKey}</span>
                </div>
                <Link href="/docs/quickstart" className="text-xs text-indigo-400 underline underline-offset-2 hover:text-indigo-300">
                  Read the quickstart guide →
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors",
                      BORDER, SURFACE
                    )}
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition-colors border border-gray-700"
                  >
                    {status === "loading" ? "Creating..." : "Get API Key →"}
                  </button>
                </form>
                {status === "error" && (
                  <p className="text-red-400 text-xs mt-2">{errMsg}</p>
                )}
                <p className="text-gray-700 text-xs mt-3 text-center">No credit card · 30 seconds</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/60 border border-indigo-800/50 px-4 py-1.5">
            <span className="text-indigo-400 text-xs">Launch offer:</span>
            <span className="text-white text-xs font-medium">first 50 signups get 500 free validations/month</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
const FOOTER: Record<string, { label: string; href: string }[]> = {
  Integrations: [
    { label: "Zapier (soon)", href: "/integrations/zapier" },
    { label: "Make (soon)",   href: "/integrations/make"   },
    { label: "n8n (soon)",   href: "/integrations/n8n"    },
  ],
  "Use Cases": [
    { label: "SEO Audit",      href: "/use-cases/seo-audit"      },
    { label: "AI Agents",      href: "/use-cases/ai-agents"      },
    { label: "CMS Validation", href: "/use-cases/cms-validation"  },
    { label: "E-commerce",     href: "/use-cases/ecommerce"      },
  ],
  Resources: [
    { label: "Documentation",   href: "/docs"                   },
    { label: "Quickstart",      href: "/docs/quickstart"        },
    { label: "Authentication",  href: "/docs/authentication"    },
    { label: "Error Codes",     href: "/docs/errors"            },
    { label: "Schema Types",    href: "/schema-types"           },
    { label: "Changelog",       href: "/changelog"              },
    { label: "Blog",            href: "/blog"                   },
    { label: "Status",          href: "https://status.schemacheck.dev" },
  ],
  "Code Examples": [
    { label: "JavaScript",  href: "/docs/code-examples/javascript" },
    { label: "Python",      href: "/docs/code-examples/python"     },
    { label: "PHP",         href: "/docs/code-examples/php"        },
    { label: "Go",          href: "/docs/code-examples/go"         },
    { label: "Ruby",        href: "/docs/code-examples/ruby"       },
    { label: "C#",          href: "/docs/code-examples/csharp"     },
  ],
  Comparisons: [
    { label: "vs Google Rich Results Test", href: "/comparisons/google-rich-results-test-alternative" },
    { label: "Customers",                   href: "/customers"  },
    { label: "Pricing",                     href: "#pricing"    },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms"   },
    { label: "Contact",          href: "/contact"       },
  ],
};

function Footer() {
  return (
    <footer className={cn("border-t pt-16 pb-10", BORDER)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {Object.entries(FOOTER).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-gray-600 hover:text-gray-300 transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t", BORDER)}>
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-sm">⬡</span>
            <span className="text-sm font-semibold text-gray-500">SchemaCheck</span>
            <span className="text-gray-800 text-xs ml-2">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://x.com/schemacheck"
              target="_blank" rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="text-gray-700 hover:text-gray-300 transition-colors text-xs font-medium"
            >
              𝕏 Twitter
            </a>
            <a
              href="https://github.com/schemacheck"
              target="_blank" rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-gray-700 hover:text-gray-300 transition-colors text-xs font-medium"
            >
              GitHub
            </a>
            <a
              href="https://www.producthunt.com"
              target="_blank" rel="noopener noreferrer"
              aria-label="Product Hunt"
              className="text-gray-700 hover:text-gray-300 transition-colors text-xs font-medium"
            >
              Product Hunt
            </a>
          </div>

          <p className="text-xs text-gray-800">
            Structured data validation for SEOs and developers.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Do I need to know how to code?",
        acceptedAnswer: { "@type": "Answer", text: "No. Use the web checker at /check — paste a URL and get results instantly, no account needed. You can also use Zapier or n8n (coming soon) without writing code." } },
      { "@type": "Question", name: "What's the difference between SchemaCheck and Google's Rich Results Test?",
        acceptedAnswer: { "@type": "Answer", text: "Google's tool is for checking one URL manually in a browser. SchemaCheck is for checking at scale — programmatically, continuously, in CI/CD, or across hundreds of URLs at once." } },
      { "@type": "Question", name: "Can I validate my entire site at once?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Use batch validation via the API or paste a list of URLs in the web checker at /check." } },
      { "@type": "Question", name: "Do failed validations count against my quota?",
        acceptedAnswer: { "@type": "Answer", text: "No. Only successful 200 responses from real computation count. 4xx errors never consume a credit." } },
      { "@type": "Question", name: "Do cached responses count against my quota?",
        acceptedAnswer: { "@type": "Answer", text: "No. URL results are cached for 1 hour. Repeat requests for the same URL within that window return instantly and use zero credits." } },
      { "@type": "Question", name: "Is there really a free tier — forever?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. 100 validations per month, no credit card, no trial period, no expiry." } },
      { "@type": "Question", name: "Can I cancel anytime?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Cancel from your dashboard at any time. You retain access until the end of the current billing period. No cancellation fees." } },
      { "@type": "Question", name: "What is the refund policy?",
        acceptedAnswer: { "@type": "Answer", text: "30-day no-questions refund on all paid plans." } },
    ],
  };

  return (
    <div className={cn("min-h-screen", BG)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <WhatWeCatch />
        <RichResultEligibility />
        <ForDevelopers />
        <Integrations />
        <UseCases />
        <Pricing />
        <Faq />
        <SignupCta />
      </main>
      <Footer />
    </div>
  );
}
