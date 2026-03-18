import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Ruby Examples",
  description:
    "Ruby code examples for the SchemaCheck schema validation API using Net::HTTP and Faraday. Compatible with Rails and plain Ruby scripts.",
};

const INSTALL = `# Net::HTTP is built into Ruby — no gems required
# To use Faraday instead:
gem install faraday`;

const VALIDATE_URL = `require 'net/http'
require 'uri'
require 'json'

API_KEY = ENV.fetch('SCHEMACHECK_API_KEY')
BASE_URL = 'https://schemacheck.dev/api/v1'

def validate_url(url)
  uri = URI("#{BASE_URL}/validate")
  uri.query = URI.encode_www_form(url: url, access_key: API_KEY)

  response = Net::HTTP.get_response(uri)
  data = JSON.parse(response.body)

  unless response.is_a?(Net::HTTPSuccess) && data['success']
    error = data.fetch('error', {})
    raise "[#{error['code']}] #{error['message']}"
  end

  data
end

result = validate_url('https://stripe.com')

puts "Score: #{result['summary']['score']}/100"
puts "Schemas found: #{result['schemas_found']}"

result['schemas'].each do |schema|
  puts "\\n[#{schema['type']}] valid=#{schema['valid']} rich_result=#{schema['rich_result_eligible']}"

  schema['errors'].each do |error|
    puts "  ✗ #{error['property']}: #{error['message']}"
    puts "    Fix: #{error['fix']}"
  end

  schema['warnings'].each do |warning|
    puts "  ⚠ #{warning['property']}: #{warning['message']}"
  end
end`;

const VALIDATE_JSONLD = `require 'net/http'
require 'uri'
require 'json'

API_KEY = ENV.fetch('SCHEMACHECK_API_KEY')

def validate_jsonld(jsonld)
  uri = URI('https://schemacheck.dev/api/v1/validate')
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true

  request = Net::HTTP::Post.new(uri)
  request['Content-Type'] = 'application/json'
  request['x-api-key'] = API_KEY
  request.body = JSON.generate({ jsonld: jsonld })

  response = http.request(request)
  data = JSON.parse(response.body)

  unless response.is_a?(Net::HTTPSuccess) && data['success']
    error = data.fetch('error', {})
    raise "[#{error['code']}] #{error['message']}"
  end

  data
end

result = validate_jsonld({
  '@context'      => 'https://schema.org',
  '@type'         => 'Article',
  'headline'      => 'How to validate Schema.org structured data',
  'author'        => { '@type' => 'Person', 'name' => 'Jane Doe' },
  'datePublished' => '2026-03-18',
  'image'         => 'https://example.com/photo.jpg'
})

schema = result['schemas'].first
if !schema['valid']
  schema['errors'].each { |e| puts "Error: #{e['property']}: #{e['fix']}" }
  exit 1
end

puts "Valid! Rich result eligible: #{schema['rich_result_eligible']}"`;

const FARADAY = `require 'faraday'
require 'json'

API_KEY = ENV.fetch('SCHEMACHECK_API_KEY')

conn = Faraday.new(url: 'https://schemacheck.dev/api/v1') do |f|
  f.response :raise_error
end

# GET request with access_key query param
response = conn.get('validate') do |req|
  req.params['url']        = 'https://stripe.com'
  req.params['access_key'] = API_KEY
end

data = JSON.parse(response.body)
puts "Score: #{data['summary']['score']}/100"
puts "Cached: #{data['meta']['cached']}"`;

export default function RubyPage() {
  return (
    <>
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          SDK Examples
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">Ruby</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Uses Ruby&apos;s built-in <code className="text-indigo-400">Net::HTTP</code> library or
          Faraday for a cleaner interface. Works with Rails, Sinatra, or plain scripts.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Installation</h2>
        <CodeBlock language="bash" code={INSTALL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate a URL</h2>
        <CodeBlock language="ruby" code={VALIDATE_URL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate raw JSON-LD</h2>
        <CodeBlock language="ruby" code={VALIDATE_JSONLD} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Using Faraday</h2>
        <CodeBlock language="ruby" code={FARADAY} />
      </section>

      <section className="pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Next steps</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/docs/options", label: "Parameters & Response", desc: "Full API reference" },
            { href: "/docs/errors", label: "Error Codes", desc: "Handle every error case" },
            { href: "/docs/code-examples/python", label: "Python Examples", desc: "requests library" },
            { href: "/docs/code-examples/php", label: "PHP Examples", desc: "cURL and Guzzle" },
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
