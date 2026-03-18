"use client";

import { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

const DEMO_RESPONSE = `{
  "success": true,
  "url": "https://stripe.com",
  "schemas_found": 2,
  "schemas": [
    {
      "type": "Organization",
      "valid": true,
      "rich_result_eligible": true,
      "errors": [],
      "warnings": [
        {
          "severity": "warning",
          "property": "sameAs",
          "message": "Recommended property 'sameAs' is missing"
        }
      ]
    },
    {
      "type": "WebSite",
      "valid": false,
      "rich_result_eligible": false,
      "errors": [
        {
          "severity": "error",
          "property": "potentialAction",
          "message": "SearchAction required for Sitelinks Searchbox",
          "fix": "Add potentialAction with SearchAction"
        }
      ]
    }
  ],
  "summary": {
    "total_schemas": 2,
    "valid_schemas": 1,
    "total_errors": 1,
    "total_warnings": 1,
    "rich_result_eligible": 1,
    "score": 72
  },
  "meta": {
    "api_version": "1.0",
    "cached": false,
    "credits_used": 1,
    "credits_remaining": 99
  }
}`;

export function Hero() {
  const [url, setUrl] = useState("https://stripe.com");

  const curlExample = `curl "https://schemacheck.dev/api/v1/validate?url=${url}&access_key=YOUR_KEY"`;

  return (
    <section className="pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Now in public beta — free tier available
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-white tracking-tight leading-tight mb-6">
          Validate structured data
          <br />
          <span className="text-indigo-400">in one API call.</span>
        </h1>

        <p className="text-center text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Send a URL or raw JSON-LD. Get back errors, warnings, rich result eligibility, and fix suggestions — instantly.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
          <Link
            href="/docs/quickstart"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-center transition-colors"
          >
            Get your free API key
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-center transition-colors"
          >
            View docs
          </Link>
        </div>

        {/* Live demo */}
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          {/* Request */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Request</p>
            <div className="rounded-lg bg-gray-950 border border-gray-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900">
                <span className="text-xs text-gray-500 font-mono">GET</span>
                <span className="text-xs text-gray-400 font-mono">/api/v1/validate</span>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">url</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">access_key</label>
                  <input
                    type="text"
                    defaultValue="YOUR_API_KEY"
                    readOnly
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-500 font-mono cursor-default"
                  />
                </div>
              </div>
              <div className="border-t border-gray-800 px-4 py-3">
                <CodeBlock code={curlExample} language="curl" />
              </div>
            </div>
          </div>

          {/* Response */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
              Response{" "}
              <span className="text-green-500 ml-2">200 OK</span>
            </p>
            <CodeBlock code={DEMO_RESPONSE} language="json" />
          </div>
        </div>
      </div>
    </section>
  );
}
