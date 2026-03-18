import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Python Examples",
  description:
    "Python code examples for the SchemaCheck schema validation API using the requests library. Includes error handling, batch validation, and retry logic.",
};

const INSTALL = `pip install requests`;

const VALIDATE_URL = `import os
import requests

API_KEY = os.environ["SCHEMACHECK_API_KEY"]
BASE_URL = "https://schemacheck.dev/api/v1"


def validate_url(url: str) -> dict:
    """Validate all JSON-LD schemas on a public URL."""
    response = requests.get(
        f"{BASE_URL}/validate",
        params={"url": url, "access_key": API_KEY},
        timeout=30,
    )
    data = response.json()

    if not response.ok or not data.get("success"):
        error = data.get("error", {})
        raise ValueError(f"[{error.get('code')}] {error.get('message')}")

    return data


# Example usage
result = validate_url("https://stripe.com")

print(f"Score: {result['summary']['score']}/100")
print(f"Schemas found: {result['schemas_found']}")

for schema in result["schemas"]:
    print(f"\\n[{schema['type']}] valid={schema['valid']} rich_result={schema['rich_result_eligible']}")

    for error in schema["errors"]:
        print(f"  ✗ {error['property']}: {error['message']}")
        print(f"    Fix: {error['fix']}")

    for warning in schema["warnings"]:
        print(f"  ⚠ {warning['property']}: {warning['message']}")`;

const VALIDATE_JSONLD = `import os
import requests

API_KEY = os.environ["SCHEMACHECK_API_KEY"]


def validate_jsonld(jsonld: dict) -> dict:
    """Validate a raw JSON-LD object. Useful before publishing."""
    response = requests.post(
        "https://schemacheck.dev/api/v1/validate",
        headers={
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
        },
        json={"jsonld": jsonld},
        timeout=30,
    )
    data = response.json()

    if not response.ok or not data.get("success"):
        error = data.get("error", {})
        raise ValueError(f"[{error.get('code')}] {error.get('message')}")

    return data


# Example: validate Article schema before publishing
result = validate_jsonld({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to validate Schema.org structured data",
    "author": {"@type": "Person", "name": "Jane Doe"},
    "datePublished": "2026-03-18",
    "image": "https://example.com/photo.jpg",
})

schema = result["schemas"][0]
if not schema["valid"]:
    print("Schema has errors:")
    for e in schema["errors"]:
        print(f"  {e['property']}: {e['fix']}")
    raise SystemExit(1)

print("Valid! Rich result eligible:", schema["rich_result_eligible"])`;

const BATCH = `import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

API_KEY = os.environ["SCHEMACHECK_API_KEY"]


def validate_url(url: str) -> tuple[str, dict | Exception]:
    try:
        response = requests.get(
            "https://schemacheck.dev/api/v1/validate",
            params={"url": url, "access_key": API_KEY},
            timeout=30,
        )
        data = response.json()
        if not response.ok:
            raise ValueError(data.get("error", {}).get("message", "Unknown error"))
        return url, data
    except Exception as e:
        return url, e


def validate_batch(urls: list[str], max_workers: int = 5) -> dict:
    results = {}
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(validate_url, url): url for url in urls}
        for future in as_completed(futures):
            url, result = future.result()
            results[url] = result
    return results


urls = [
    "https://stripe.com",
    "https://github.com",
    "https://shopify.com",
]

results = validate_batch(urls)

for url, result in results.items():
    if isinstance(result, Exception):
        print(f"{url} → ERROR: {result}")
    else:
        print(f"{url} → score {result['summary']['score']}/100")`;

const RETRY = `import os
import time
import requests

API_KEY = os.environ["SCHEMACHECK_API_KEY"]


def validate_with_retry(url: str, max_retries: int = 3) -> dict:
    for attempt in range(1, max_retries + 1):
        response = requests.get(
            "https://schemacheck.dev/api/v1/validate",
            params={"url": url, "access_key": API_KEY},
            timeout=30,
        )
        data = response.json()

        if response.ok:
            return data

        code = data.get("error", {}).get("code", "")

        # Never retry client errors (except rate limits)
        if 400 <= response.status_code < 500 and code != "rate_limit_exceeded":
            raise ValueError(f"[{code}] {data['error']['message']}")

        if code == "rate_limit_exceeded":
            retry_after = int(response.headers.get("Retry-After", 60))
            print(f"Rate limited. Waiting {retry_after}s…")
            time.sleep(retry_after)
            continue

        # Exponential backoff for 5xx
        if attempt < max_retries:
            delay = 2 ** (attempt - 1)
            print(f"Attempt {attempt} failed. Retrying in {delay}s…")
            time.sleep(delay)

    raise RuntimeError("Max retries exceeded")`;

export default function PythonPage() {
  return (
    <>
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          SDK Examples
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">Python</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Uses the <code className="text-indigo-400">requests</code> library. Compatible with
          Python 3.8+ and works in Django, Flask, FastAPI, or plain scripts.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Installation</h2>
        <CodeBlock language="bash" code={INSTALL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate a URL</h2>
        <CodeBlock language="python" code={VALIDATE_URL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate raw JSON-LD</h2>
        <CodeBlock language="python" code={VALIDATE_JSONLD} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Batch validation</h2>
        <p className="text-gray-400 mb-4">
          Validate multiple URLs in parallel using{" "}
          <code className="text-indigo-400 text-sm">ThreadPoolExecutor</code>.
        </p>
        <CodeBlock language="python" code={BATCH} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Retry with backoff</h2>
        <CodeBlock language="python" code={RETRY} />
      </section>

      <section className="pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Next steps</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/docs/options", label: "Parameters & Response", desc: "Full API reference" },
            { href: "/docs/errors", label: "Error Codes", desc: "Handle every error case" },
            { href: "/docs/code-examples/javascript", label: "JavaScript Examples", desc: "Node.js and browser" },
            { href: "/docs/code-examples/go", label: "Go Examples", desc: "net/http standard library" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-[#111118] hover:bg-[#13131c] transition-all"
            >
              <p className="font-medium text-white mb-1 group-hover:text-indigo-300 transition-colors">
                {link.label} →
              </p>
              <p className="text-sm text-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
