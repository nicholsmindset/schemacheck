import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zapier Integration — Automate Schema Validation",
  description: "Automate schema validation with Zapier SEO automation. Trigger SchemaCheck validations from any Zapier workflow — validate structured data on publish, update spreadsheets, and alert on errors without code.",
};

export default function ZapierPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Automate Schema Validation with Zapier</h1>
      <p className="text-gray-400 mb-10">
        Validate structured data automatically as part of your no-code workflows. Trigger schema validation when a page is published, a spreadsheet is updated, or a CMS entry goes live.
      </p>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Schema Markup Automation with Zapier</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            {[
              "WordPress post published → validate schema → Slack alert if errors found",
              "Airtable row updated with URL → validate schema → write results back to row",
              "Google Sheets URL list → batch validate → email report",
              "New Contentful entry → validate schema → create Linear ticket if invalid",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-indigo-400">→</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">SEO Automation Workflows</h2>
          <p className="text-gray-400 text-sm">
            Use Zapier&apos;s built-in Webhooks action to call SchemaCheck. Set the URL to{" "}
            <code className="text-indigo-400">https://schemacheck.dev/api/v1/validate</code>,
            method to GET, and add your <code className="text-indigo-400">access_key</code> as a query parameter.
            Map <code className="text-indigo-400">summary.score</code> and{" "}
            <code className="text-indigo-400">summary.total_errors</code> to downstream Zapier steps for
            conditional alerting, logging, or CMS updates.
          </p>
        </section>
      </div>
    </div>
  );
}
