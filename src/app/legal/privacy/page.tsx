import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SchemaCheck privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-10">Last updated: March 18, 2026</p>

      <div className="prose prose-invert max-w-none space-y-8 text-gray-400">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Email address (required to create an API key)</li>
            <li>Usage logs: endpoint, input type, response time, schemas found, error count, cached/credited flags</li>
            <li>Stripe billing information (managed by Stripe — we do not store card numbers)</li>
            <li>Validated URLs (stored in cache table for 1 hour, then purged)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">What we do not collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>We do not store the content of pages we fetch</li>
            <li>We do not store your raw JSON-LD beyond the request lifecycle</li>
            <li>We do not sell your data to third parties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Data retention</h2>
          <p className="text-sm">Usage logs are retained for 12 months. API keys remain until you request deletion. Cached validation results expire after 1 hour.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
          <p className="text-sm">privacy@schemacheck.dev</p>
        </section>
      </div>
    </div>
  );
}
