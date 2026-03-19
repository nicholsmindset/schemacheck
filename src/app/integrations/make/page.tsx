import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make (Integromat) Integration — Schema Validation",
  description: "Automate schema markup validation with Make.com SEO automation. Use HTTP modules to call SchemaCheck in any Make scenario — validate structured data on publish without writing code.",
};

export default function MakePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Automate Schema Validation with Make</h1>
      <p className="text-gray-400 mb-10">
        Connect SchemaCheck to thousands of apps using Make&apos;s HTTP module. Build powerful automation scenarios without writing code.
      </p>
      <div className="space-y-6 text-sm text-gray-400">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Schema Markup Automation</h2>
          <p>
            In Make, use the <strong className="text-white">HTTP → Make a request</strong> module with:
          </p>
          <ul className="space-y-2 mt-2">
            <li><strong className="text-gray-300">URL:</strong> <code className="text-indigo-400">https://schemacheck.dev/api/v1/validate</code></li>
            <li><strong className="text-gray-300">Method:</strong> GET</li>
            <li><strong className="text-gray-300">Query string:</strong> url={`{{url}}`}, access_key=YOUR_KEY</li>
            <li><strong className="text-gray-300">Parse response:</strong> Yes (returns JSON automatically)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">SEO Validation Workflows</h2>
          <p>
            Map <code className="text-indigo-400">summary.score</code> and{" "}
            <code className="text-indigo-400">summary.total_errors</code> to downstream modules for
            conditional routing — send a Slack alert when errors are found, write scores back to a
            Google Sheet, or open a Notion task for pages below a score threshold.
          </p>
        </section>
      </div>
    </div>
  );
}
