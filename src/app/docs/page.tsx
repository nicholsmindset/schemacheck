import type { Metadata } from "next";
import Link from "next/link";
import { DOC_NAV } from "@/lib/doc-nav";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "SchemaCheck API documentation — authentication, parameters, error codes, and SDK examples for JavaScript, Python, PHP, Go, Ruby, and C#.",
};

export default function DocsPage() {
  return (
    <>
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          SchemaCheck API
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">Documentation</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Everything you need to integrate schema validation into your stack — from a simple cURL
          call to production-ready SDK usage.
        </p>
      </div>

      {/* Quick-start banner */}
      <div className="mb-10 p-5 rounded-xl border border-indigo-800/60 bg-indigo-950/20">
        <p className="text-sm font-semibold text-indigo-300 mb-2">New here?</p>
        <p className="text-sm text-gray-400 mb-3">
          Get your free API key and validate your first schema in under 2 minutes.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started →
          </Link>
          <Link
            href="/#signup"
            className="inline-flex items-center gap-1.5 text-sm border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get free API key
          </Link>
        </div>
      </div>

      {/* Nav sections as cards */}
      {DOC_NAV.map((section) => (
        <div key={section.group} className="mb-10">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            {section.group}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-[#111118] hover:bg-[#13131c] transition-all"
              >
                <p className="font-medium text-white mb-1 group-hover:text-indigo-300 transition-colors">
                  {item.label}
                </p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Resources */}
      <div className="mt-2 pt-8 border-t border-gray-800">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Resources
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              href: "/openapi.json",
              label: "OpenAPI 3.1 Spec",
              desc: "Import into Postman, Insomnia, or any REST client",
            },
            {
              href: "/llms.txt",
              label: "llms.txt",
              desc: "Concise API overview for AI tools and copilots",
            },
            {
              href: "/llms-full.txt",
              label: "llms-full.txt",
              desc: "Full reference for deep AI context",
            },
          ].map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-[#111118] hover:bg-[#13131c] transition-all"
            >
              <p className="font-medium text-sm text-white mb-1 group-hover:text-indigo-300 transition-colors">
                {r.label} ↗
              </p>
              <p className="text-xs text-gray-500">{r.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
