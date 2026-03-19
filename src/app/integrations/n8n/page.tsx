import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "n8n Integration — Automate Schema Validation",
  description: "Automate schema validation in n8n workflows. Use the HTTP Request node to call SchemaCheck — n8n JSON schema validation node for self-hosted and cloud n8n SEO automation.",
};

export default function N8nPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Schema Validation with n8n</h1>
      <p className="text-gray-400 mb-10">
        Add schema validation to your n8n workflows using the HTTP Request node. Works with self-hosted and n8n Cloud.
      </p>
      <div className="space-y-6 text-sm text-gray-400">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">SEO Automation with n8n</h2>
          <p>Configure the <strong className="text-white">HTTP Request</strong> node with:</p>
          <ul className="space-y-2 mt-2">
            <li><strong className="text-gray-300">URL:</strong> <code className="text-indigo-400">https://schemacheck.dev/api/v1/validate</code></li>
            <li><strong className="text-gray-300">Method:</strong> GET</li>
            <li><strong className="text-gray-300">Authentication:</strong> Generic Credential (header: x-api-key)</li>
            <li><strong className="text-gray-300">Parameters:</strong> url ={`{{ $json.url }}`}</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">JSON Schema Validation in n8n Workflows</h2>
          <p>
            Use an <strong className="text-white">IF</strong> node to branch on{" "}
            <code className="text-indigo-400">summary.total_errors &gt; 0</code> and route to Slack,
            email, or a database update. Map <code className="text-indigo-400">summary.score</code> back
            to a spreadsheet column for ongoing schema health tracking across your site.
          </p>
        </section>
      </div>
    </div>
  );
}
