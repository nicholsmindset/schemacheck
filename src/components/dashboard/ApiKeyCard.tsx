"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/shared/CodeBlock";
import type { ApiKeyRow } from "@/lib/validator/types";

function maskKey(key: string): string {
  if (key.length <= 16) return key;
  return key.slice(0, 12) + "..." + key.slice(-4);
}

interface ApiKeyCardProps {
  apiKey: ApiKeyRow;
}

export function ApiKeyCard({ apiKey }: ApiKeyCardProps) {
  const [currentKey, setCurrentKey] = useState(apiKey.key);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  const displayKey = showKey ? currentKey : maskKey(currentKey);

  async function handleCopy() {
    await navigator.clipboard.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch("/api/auth/keys", {
        method: "POST",
        headers: { "x-api-key": currentKey },
      });
      const data = await res.json();
      if (!res.ok) {
        setRegenError(data.error?.message ?? "Failed to regenerate key.");
      } else {
        setCurrentKey(data.api_key);
        setShowKey(true);
        setShowModal(false);
      }
    } catch {
      setRegenError("Network error. Please try again.");
    } finally {
      setRegenerating(false);
    }
  }

  const curlSnippet = `curl "https://api.schemacheck.dev/v1/validate?url=https://example.com&access_key=${displayKey}"`;

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5">
        API Key
      </h2>

      {/* Key display */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2.5 font-mono text-sm text-white overflow-hidden">
          <span className="select-all">{displayKey}</span>
        </div>
        <button
          onClick={() => setShowKey((v) => !v)}
          className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg whitespace-nowrap"
          title={showKey ? "Hide key" : "Show full key"}
        >
          {showKey ? "Hide" : "Show"}
        </button>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Auth methods */}
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Header auth</p>
          <div className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-300 overflow-x-auto whitespace-nowrap">
            x-api-key: {displayKey}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Query param</p>
          <div className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-300 overflow-x-auto whitespace-nowrap">
            ?access_key={displayKey}
          </div>
        </div>
      </div>

      {/* Quick start */}
      <div className="mb-5">
        <p className="text-xs text-gray-500 mb-1.5">Quick start</p>
        <CodeBlock code={curlSnippet} language="bash" />
      </div>

      {/* Regenerate */}
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-red-400 hover:text-red-300 transition-colors"
      >
        Regenerate key
      </button>

      {/* Regenerate modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#16161f] border border-gray-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-white mb-2">Regenerate API key?</h3>
            <p className="text-sm text-gray-400 mb-5">
              This will immediately invalidate your current key. Any integrations
              using the old key will stop working.
            </p>
            {regenError && (
              <p className="text-sm text-red-400 mb-3">{regenError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {regenerating ? "Regenerating…" : "Yes, regenerate"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setRegenError(null);
                }}
                disabled={regenerating}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
