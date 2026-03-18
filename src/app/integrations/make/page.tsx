import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SchemaCheck + Make (Integromat) Integration",
  description: "Automate Schema.org structured data validation with Make. Use HTTP modules to call SchemaCheck in any Make scenario.",
};

export default function MakePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">SchemaCheck + Make</h1>
      <p className="text-gray-400 mb-10">
        Connect SchemaCheck to thousands of apps using Make&apos;s HTTP module. Build powerful automation scenarios without writing code.
      </p>
      <div className="space-y-6 text-sm text-gray-400">
        <p>
          In Make, use the <strong className="text-white">HTTP → Make a request</strong> module with:
        </p>
        <ul className="space-y-2">
          <li><strong className="text-gray-300">URL:</strong> <code className="text-indigo-400">https://schemacheck.dev/api/v1/validate</code></li>
          <li><strong className="text-gray-300">Method:</strong> GET</li>
          <li><strong className="text-gray-300">Query string:</strong> url={`{{url}}`}, access_key=YOUR_KEY</li>
          <li><strong className="text-gray-300">Parse response:</strong> Yes (returns JSON automatically)</li>
        </ul>
        <p>
          Map <code className="text-indigo-400">summary.score</code> and <code className="text-indigo-400">summary.total_errors</code> to downstream modules for conditional routing.
        </p>
      </div>
    </div>
  );
}
