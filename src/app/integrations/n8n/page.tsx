import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SchemaCheck + n8n Integration",
  description: "Automate Schema.org structured data validation with n8n. Use the HTTP Request node to call SchemaCheck in self-hosted or cloud n8n workflows.",
};

export default function N8nPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">SchemaCheck + n8n</h1>
      <p className="text-gray-400 mb-10">
        Add schema validation to your n8n workflows using the HTTP Request node. Works with self-hosted and n8n Cloud.
      </p>
      <div className="space-y-6 text-sm text-gray-400">
        <p>Configure the <strong className="text-white">HTTP Request</strong> node with:</p>
        <ul className="space-y-2">
          <li><strong className="text-gray-300">URL:</strong> <code className="text-indigo-400">https://schemacheck.dev/api/v1/validate</code></li>
          <li><strong className="text-gray-300">Method:</strong> GET</li>
          <li><strong className="text-gray-300">Authentication:</strong> Generic Credential (header: x-api-key)</li>
          <li><strong className="text-gray-300">Parameters:</strong> url ={`{{ $json.url }}`}</li>
        </ul>
        <p>
          Use an <strong className="text-white">IF</strong> node to branch on <code className="text-indigo-400">summary.total_errors &gt; 0</code> and route to Slack, email, or a database update.
        </p>
      </div>
    </div>
  );
}
