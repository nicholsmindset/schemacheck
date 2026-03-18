"use client";

import { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

const tabs = [
  {
    label: "curl",
    language: "bash",
    code: `curl "https://schemacheck.dev/api/v1/validate?url=https://example.com&access_key=YOUR_KEY"`,
  },
  {
    label: "JavaScript",
    language: "javascript",
    code: `const response = await fetch(
  'https://schemacheck.dev/api/v1/validate',
  {
    method: 'POST',
    headers: {
      'x-api-key': 'YOUR_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: 'https://example.com' }),
  }
);

const data = await response.json();
console.log(data.summary.score); // 0–100
console.log(data.schemas[0].rich_result_eligible); // true|false`,
  },
  {
    label: "Python",
    language: "python",
    code: `import requests

response = requests.post(
    'https://schemacheck.dev/api/v1/validate',
    headers={'x-api-key': 'YOUR_KEY'},
    json={'url': 'https://example.com'}
)

data = response.json()
print(data['summary']['score'])          # 0–100
print(data['schemas'][0]['valid'])       # True|False`,
  },
  {
    label: "PHP",
    language: "php",
    code: `<?php
$ch = curl_init('https://schemacheck.dev/api/v1/validate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'x-api-key: YOUR_KEY',
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'url' => 'https://example.com',
]));
$data = json_decode(curl_exec($ch), true);
echo $data['summary']['score']; // 0–100`,
  },
];

export function CodeTabs() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Integrate in minutes
        </h2>
        <p className="text-gray-400 text-center mb-10">
          One endpoint. Two auth methods. Works with any language.
        </p>

        <div className="border border-gray-800 rounded-xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-800 bg-gray-950">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === i
                    ? "text-white border-b-2 border-indigo-500 -mb-px"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code */}
          <div className="bg-gray-950 p-1">
            <CodeBlock
              code={tabs[activeTab].code}
              language={tabs[activeTab].language}
            />
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Also supports{" "}
          <Link href="/docs/code-examples/go" className="text-indigo-400 hover:underline">Go</Link>,{" "}
          <Link href="/docs/code-examples/ruby" className="text-indigo-400 hover:underline">Ruby</Link>,{" "}
          <Link href="/docs/code-examples/csharp" className="text-indigo-400 hover:underline">C#</Link>{" "}
          and any language that speaks HTTP.
        </p>
      </div>
    </section>
  );
}
