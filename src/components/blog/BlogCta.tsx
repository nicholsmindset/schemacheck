import Link from "next/link";

export function BlogCta() {
  return (
    <div className="mt-14 p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
        SchemaCheck API
      </p>
      <h2 className="text-xl font-semibold text-white mb-2">
        Validate structured data programmatically
      </h2>
      <p className="text-gray-400 text-sm mb-5 leading-relaxed">
        REST API for Schema.org JSON-LD validation. Validate by URL or raw JSON-LD. Returns
        per-property errors, fix suggestions, rich result eligibility, and a 0–100 health score.
        Free plan: 100 validations/month.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/docs/getting-started"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Get free API key →
        </Link>
        <Link
          href="/docs/options"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
        >
          API reference
        </Link>
      </div>
    </div>
  );
}
