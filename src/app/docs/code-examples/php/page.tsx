import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "PHP Examples",
  description:
    "PHP code examples for the SchemaCheck schema validation API using cURL and Guzzle. Includes error handling and batch validation.",
};

const INSTALL = `# cURL is built into PHP — no composer package needed
# To use Guzzle instead:
composer require guzzlehttp/guzzle`;

const VALIDATE_URL_CURL = `<?php

$apiKey = getenv('SCHEMACHECK_API_KEY');
$url    = 'https://stripe.com';

function validateUrl(string $url, string $apiKey): array {
    $endpoint = 'https://schemacheck.dev/api/v1/validate?' . http_build_query([
        'url'        => $url,
        'access_key' => $apiKey,
    ]);

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
    ]);

    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($body, true);

    if ($status >= 400 || !($data['success'] ?? false)) {
        $code    = $data['error']['code']    ?? 'unknown';
        $message = $data['error']['message'] ?? 'Unknown error';
        throw new RuntimeException("[{$code}] {$message}");
    }

    return $data;
}

$result = validateUrl($url, $apiKey);

printf("Score: %d/100\\n", $result['summary']['score']);
printf("Schemas found: %d\\n", $result['schemas_found']);

foreach ($result['schemas'] as $schema) {
    printf("\\n[%s] valid=%s rich_result=%s\\n",
        $schema['type'],
        $schema['valid'] ? 'true' : 'false',
        $schema['rich_result_eligible'] ? 'true' : 'false',
    );

    foreach ($schema['errors'] as $error) {
        printf("  ✗ %s: %s\\n", $error['property'], $error['message']);
        printf("    Fix: %s\\n", $error['fix']);
    }
}`;

const VALIDATE_JSONLD_CURL = `<?php

function validateJsonLd(array $jsonld, string $apiKey): array {
    $ch = curl_init('https://schemacheck.dev/api/v1/validate');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(['jsonld' => $jsonld]),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'x-api-key: ' . $apiKey,
        ],
        CURLOPT_TIMEOUT        => 30,
    ]);

    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($body, true);

    if ($status >= 400 || !($data['success'] ?? false)) {
        $code    = $data['error']['code']    ?? 'unknown';
        $message = $data['error']['message'] ?? 'Unknown error';
        throw new RuntimeException("[{$code}] {$message}");
    }

    return $data;
}

$result = validateJsonLd([
    '@context'      => 'https://schema.org',
    '@type'         => 'Article',
    'headline'      => 'How to validate Schema.org structured data',
    'author'        => ['@type' => 'Person', 'name' => 'Jane Doe'],
    'datePublished' => '2026-03-18',
    'image'         => 'https://example.com/photo.jpg',
], getenv('SCHEMACHECK_API_KEY'));

$schema = $result['schemas'][0];
if (!$schema['valid']) {
    foreach ($schema['errors'] as $e) {
        echo "Error: {$e['property']}: {$e['fix']}\\n";
    }
    exit(1);
}

echo 'Valid! Rich result eligible: ' . ($schema['rich_result_eligible'] ? 'yes' : 'no') . "\\n";`;

const GUZZLE = `<?php

use GuzzleHttp\\Client;
use GuzzleHttp\\Exception\\ClientException;

$client = new Client([
    'base_uri' => 'https://schemacheck.dev/api/v1/',
    'timeout'  => 30,
]);

$apiKey = getenv('SCHEMACHECK_API_KEY');

try {
    $response = $client->get('validate', [
        'query' => [
            'url'        => 'https://stripe.com',
            'access_key' => $apiKey,
        ],
    ]);

    $data = json_decode($response->getBody(), true);

    printf("Score: %d/100\\n", $data['summary']['score']);
    printf("Cached: %s\\n", $data['meta']['cached'] ? 'yes' : 'no');

} catch (ClientException $e) {
    $data = json_decode($e->getResponse()->getBody(), true);
    $code = $data['error']['code'] ?? 'unknown';
    echo "API error [{$code}]: {$data['error']['message']}\\n";
}`;

export default function PhpPage() {
  return (
    <>
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          SDK Examples
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">PHP</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Uses the built-in cURL extension (no composer required) or Guzzle for a more
          object-oriented style. Compatible with PHP 7.4+.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Installation</h2>
        <CodeBlock language="bash" code={INSTALL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate a URL (cURL)</h2>
        <CodeBlock language="php" code={VALIDATE_URL_CURL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate raw JSON-LD (cURL)</h2>
        <CodeBlock language="php" code={VALIDATE_JSONLD_CURL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Using Guzzle</h2>
        <CodeBlock language="php" code={GUZZLE} />
      </section>

      <section className="pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Next steps</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/docs/options", label: "Parameters & Response", desc: "Full API reference" },
            { href: "/docs/errors", label: "Error Codes", desc: "Handle every error case" },
            { href: "/docs/code-examples/python", label: "Python Examples", desc: "requests library" },
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
