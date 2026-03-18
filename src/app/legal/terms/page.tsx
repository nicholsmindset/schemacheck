import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "SchemaCheck terms of service.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-10">Last updated: March 18, 2026</p>

      <div className="space-y-8 text-gray-400 text-sm">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance</h2>
          <p>By using SchemaCheck, you agree to these terms. If you do not agree, do not use the service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. API key security</h2>
          <p>You are responsible for keeping your API key secure. Do not expose it in client-side code or public repositories. You are responsible for all activity under your API key.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Acceptable use</h2>
          <p>You may not use SchemaCheck to validate URLs you do not have permission to access, conduct denial of service attacks, or attempt to circumvent rate limiting or quota systems.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Billing</h2>
          <p>Free plans are limited to 100 successful validations per month. Paid plans include overage billing at the rate specified in your plan. Cached requests and failed requests are not billed.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">5. Uptime and SLA</h2>
          <p>We target 99.9% uptime. SchemaCheck is provided &quot;as is&quot; without warranty of any kind. We are not liable for damages arising from service interruptions.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">6. Contact</h2>
          <p>legal@schemacheck.dev</p>
        </section>
      </div>
    </div>
  );
}
