"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "sc_onboarding_complete";

interface Props {
  apiKey: string;
}

export function OnboardingChecklist({ apiKey }: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  async function copySnippet() {
    const snippet = `curl -X POST "https://www.schemacheck.dev/api/v1/validate" \\\n  -H "x-api-key: ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"jsonld":{"@context":"https://schema.org","@type":"Article","headline":"My Test Article","author":{"@type":"Person","name":"Jane Doe"},"datePublished":"2024-01-15"}}'`;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!visible) return null;

  return (
    <div className="rounded-xl border border-indigo-800/50 bg-indigo-950/30 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold text-sm">Get started in 3 steps</h2>
          <p className="text-gray-500 text-xs mt-0.5">Make your first validation to complete setup</p>
        </div>
        <button
          onClick={dismiss}
          className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
        >
          Dismiss
        </button>
      </div>

      <ol className="space-y-3">
        {/* Step 1 — done */}
        <li className="flex items-start gap-3">
          <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <p className="text-sm text-gray-300 font-medium">Get your API key</p>
            <p className="text-xs text-gray-600">Your key is shown above — save it somewhere safe.</p>
          </div>
        </li>

        {/* Step 2 — copy curl */}
        <li className="flex items-start gap-3">
          <span className="mt-0.5 w-5 h-5 rounded-full border border-gray-700 flex items-center justify-center shrink-0 text-gray-500 text-xs font-bold">2</span>
          <div className="flex-1">
            <p className="text-sm text-gray-300 font-medium mb-1.5">Make your first validation</p>
            <div className="rounded-lg border border-gray-800 bg-[#0f0f16] px-3 py-2 font-mono text-xs text-gray-500 mb-2 leading-relaxed">
              curl -X POST &quot;.../api/v1/validate&quot; \<br />
              &nbsp;&nbsp;-H &quot;x-api-key: <span className="text-indigo-400">{apiKey.slice(0, 20)}…</span>&quot; \<br />
              &nbsp;&nbsp;-d &apos;&#123;&quot;jsonld&quot;: &#123;&quot;@type&quot;: &quot;Article&quot;, ...&#125;&#125;&apos;
            </div>
            <button
              onClick={copySnippet}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? "Copied!" : "Copy full example →"}
            </button>
          </div>
        </li>

        {/* Step 3 — docs */}
        <li className="flex items-start gap-3">
          <span className="mt-0.5 w-5 h-5 rounded-full border border-gray-700 flex items-center justify-center shrink-0 text-gray-500 text-xs font-bold">3</span>
          <div>
            <p className="text-sm text-gray-300 font-medium">Read the quickstart guide</p>
            <Link
              href="/docs/quickstart"
              className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              View quickstart docs →
            </Link>
          </div>
        </li>
      </ol>
    </div>
  );
}
