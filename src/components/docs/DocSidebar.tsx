"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_NAV } from "@/lib/doc-nav";

export { DOC_NAV };

// ─── Sidebar content (used in both desktop + mobile) ──────────────────────────

function SidebarContent({
  query,
  setQuery,
  pathname,
  onNavigate,
}: {
  query: string;
  setQuery: (q: string) => void;
  pathname: string;
  onNavigate?: () => void;
}) {
  const filtered = useMemo(() => {
    if (!query.trim()) return DOC_NAV;
    const q = query.toLowerCase();
    return DOC_NAV.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q)
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      {/* Logo + home link */}
      <div className="px-4 py-4 border-b border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-white hover:text-indigo-300 transition-colors"
        >
          <span className="text-indigo-400 text-base leading-none">⬡</span>
          <span>Schema<span className="text-indigo-400">Check</span></span>
          <span className="ml-1 text-xs text-gray-600 font-normal">Docs</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-800">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
            fill="none" viewBox="0 0 16 16"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search docs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded-md text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-600 px-2">No results for &ldquo;{query}&rdquo;</p>
        ) : (
          filtered.map((group) => (
            <div key={group.group} className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={`block px-2 py-1.5 rounded-md text-sm transition-colors ${
                          active
                            ? "bg-indigo-500/15 text-indigo-300 font-medium"
                            : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/60"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </nav>

      {/* Footer links */}
      <div className="px-4 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-2"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </Link>
        <a
          href="/openapi.json"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
            <path d="M8 1v10M4 7l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          openapi.json
        </a>
        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
            <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          llms.txt
        </a>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function DocSidebar() {
  const pathname    = usePathname();
  const [query,     setQuery]     = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-gray-800 bg-[#0d0d14]">
        <SidebarContent
          query={query}
          setQuery={setQuery}
          pathname={pathname}
        />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 h-12 bg-[#0a0a0f]/95 backdrop-blur border-b border-gray-800">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open docs menu"
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <Link href="/" className="flex items-center gap-1.5 font-semibold text-sm text-white">
          <span className="text-indigo-400">⬡</span>
          <span>Schema<span className="text-indigo-400">Check</span></span>
          <span className="text-gray-600 font-normal">/ Docs</span>
        </Link>
        <Link href="/dashboard" className="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
          Dashboard
        </Link>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#0d0d14] border-r border-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <span className="text-sm font-medium text-white">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent
                query={query}
                setQuery={setQuery}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
