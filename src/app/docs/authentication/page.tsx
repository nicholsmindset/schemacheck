import type { Metadata } from "next";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authenticate SchemaCheck API requests via x-api-key header or access_key query parameter.",
};

export default function AuthenticationPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Authentication</h1>
      <p className="text-gray-400 mb-10">Two ways to authenticate — use whichever fits your integration.</p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Method 1: x-api-key header (recommended)</h2>
          <p className="text-gray-400 mb-4">Best for server-side calls where you control the request headers.</p>
          <CodeBlock
            language="bash"
            code={`curl -X POST https://schemacheck.dev/api/v1/validate \\
  -H "x-api-key: sc_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Method 2: access_key query parameter</h2>
          <p className="text-gray-400 mb-4">Useful for quick browser testing and GET requests.</p>
          <CodeBlock
            language="bash"
            code={`curl "https://schemacheck.dev/api/v1/validate?url=https://example.com&access_key=sc_live_your_key_here"`}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">API key format</h2>
          <p className="text-gray-400 mb-4">
            All API keys follow the pattern: <code className="text-indigo-400">sc_live_</code> followed by 32 hex characters.
          </p>
          <div className="p-4 rounded-lg border border-yellow-800 bg-yellow-950/20">
            <p className="text-sm text-yellow-300">
              Keep your API key secret. Treat it like a password. If exposed, rotate it immediately via{" "}
              <code>POST /api/auth/keys</code>.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Authentication errors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="pb-2 pr-4 text-gray-400 font-medium">Code</th>
                  <th className="pb-2 pr-4 text-gray-400 font-medium">HTTP</th>
                  <th className="pb-2 text-gray-400 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[
                  ["missing_api_key", "401", "No key provided"],
                  ["invalid_api_key", "401", "Key not found"],
                  ["inactive_api_key", "403", "Key has been deactivated"],
                  ["quota_exceeded", "429", "Free plan at 100/month limit"],
                  ["rate_limit_exceeded", "429", "Too many requests per minute"],
                ].map(([code, http, meaning]) => (
                  <tr key={code} className="border-b border-gray-900">
                    <td className="py-2 pr-4 font-mono text-indigo-400">{code}</td>
                    <td className="py-2 pr-4">{http}</td>
                    <td className="py-2">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
