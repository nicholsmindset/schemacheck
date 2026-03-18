import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "C# / .NET Examples",
  description:
    "C# and .NET code examples for the SchemaCheck schema validation API using HttpClient. Compatible with .NET 6, .NET 8, and ASP.NET Core.",
};

const INSTALL = `# Uses System.Net.Http.HttpClient — built into .NET 6+
# No NuGet packages required
# For JSON serialisation: System.Text.Json (also built in)`;

const TYPES = `// Models/SchemaCheck.cs
using System.Text.Json.Serialization;

public record SchemaCheckResult(
    [property: JsonPropertyName("success")] bool Success,
    [property: JsonPropertyName("url")] string? Url,
    [property: JsonPropertyName("schemas_found")] int SchemasFound,
    [property: JsonPropertyName("schemas")] List<Schema> Schemas,
    [property: JsonPropertyName("summary")] Summary Summary,
    [property: JsonPropertyName("meta")] Meta Meta
);

public record Schema(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("valid")] bool Valid,
    [property: JsonPropertyName("rich_result_eligible")] bool RichResultEligible,
    [property: JsonPropertyName("deprecated")] bool Deprecated,
    [property: JsonPropertyName("errors")] List<Issue> Errors,
    [property: JsonPropertyName("warnings")] List<Issue> Warnings,
    [property: JsonPropertyName("properties_found")] List<string> PropertiesFound,
    [property: JsonPropertyName("properties_missing_required")] List<string> PropertiesMissingRequired,
    [property: JsonPropertyName("rich_result")] RichResult RichResult
);

public record Issue(
    [property: JsonPropertyName("severity")] string Severity,
    [property: JsonPropertyName("property")] string Property,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("fix")] string Fix,
    [property: JsonPropertyName("google_docs_url")] string GoogleDocsUrl
);

public record RichResult(
    [property: JsonPropertyName("eligible")] bool Eligible,
    [property: JsonPropertyName("reason")] string Reason
);

public record Summary(
    [property: JsonPropertyName("total_schemas")] int TotalSchemas,
    [property: JsonPropertyName("valid_schemas")] int ValidSchemas,
    [property: JsonPropertyName("invalid_schemas")] int InvalidSchemas,
    [property: JsonPropertyName("total_errors")] int TotalErrors,
    [property: JsonPropertyName("total_warnings")] int TotalWarnings,
    [property: JsonPropertyName("rich_result_eligible")] int RichResultEligible,
    [property: JsonPropertyName("score")] int Score
);

public record Meta(
    [property: JsonPropertyName("api_version")] string ApiVersion,
    [property: JsonPropertyName("validated_at")] string ValidatedAt,
    [property: JsonPropertyName("cached")] bool Cached,
    [property: JsonPropertyName("credits_used")] int CreditsUsed,
    [property: JsonPropertyName("credits_remaining")] int CreditsRemaining,
    [property: JsonPropertyName("response_time_ms")] int ResponseTimeMs
);`;

const VALIDATE_URL = `// Services/SchemaCheckService.cs
using System.Net.Http.Json;
using System.Text.Json;
using System.Web;

public class SchemaCheckService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public SchemaCheckService(HttpClient http, string apiKey)
    {
        _http   = http;
        _apiKey = apiKey;
    }

    public async Task<SchemaCheckResult> ValidateUrlAsync(string url)
    {
        var query = HttpUtility.ParseQueryString(string.Empty);
        query["url"]        = url;
        query["access_key"] = _apiKey;

        var endpoint = $"https://schemacheck.dev/api/v1/validate?{query}";
        var response = await _http.GetAsync(endpoint);
        var body     = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            var err = JsonDocument.Parse(body).RootElement
                .GetProperty("error");
            throw new Exception($"[{err.GetProperty("code")}] {err.GetProperty("message")}");
        }

        return JsonSerializer.Deserialize<SchemaCheckResult>(body)!;
    }
}

// Program.cs — example usage
var client  = new HttpClient();
var service = new SchemaCheckService(client, Environment.GetEnvironmentVariable("SCHEMACHECK_API_KEY")!);

var result = await service.ValidateUrlAsync("https://stripe.com");

Console.WriteLine($"Score: {result.Summary.Score}/100");
Console.WriteLine($"Schemas found: {result.SchemasFound}");

foreach (var schema in result.Schemas)
{
    Console.WriteLine($"\\n[{schema.Type}] valid={schema.Valid} richResult={schema.RichResultEligible}");

    foreach (var error in schema.Errors)
    {
        Console.WriteLine($"  ✗ {error.Property}: {error.Message}");
        Console.WriteLine($"    Fix: {error.Fix}");
    }
}`;

const VALIDATE_JSONLD = `using System.Net.Http.Json;
using System.Text.Json;

var apiKey = Environment.GetEnvironmentVariable("SCHEMACHECK_API_KEY")!;
var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key", apiKey);

var payload = new
{
    jsonld = new
    {
        @context      = "https://schema.org",
        @type         = "Article",
        headline      = "How to validate Schema.org structured data",
        author        = new { @type = "Person", name = "Jane Doe" },
        datePublished = "2026-03-18",
        image         = "https://example.com/photo.jpg",
    }
};

var response = await client.PostAsJsonAsync(
    "https://schemacheck.dev/api/v1/validate",
    payload
);

var body = await response.Content.ReadAsStringAsync();

if (!response.IsSuccessStatusCode)
{
    var err = JsonDocument.Parse(body).RootElement.GetProperty("error");
    throw new Exception($"[{err.GetProperty("code")}] {err.GetProperty("message")}");
}

var result = JsonSerializer.Deserialize<SchemaCheckResult>(body,
    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;

var schema = result.Schemas[0];
if (!schema.Valid)
{
    foreach (var e in schema.Errors)
        Console.WriteLine($"Error: {e.Property}: {e.Fix}");
    Environment.Exit(1);
}

Console.WriteLine($"Valid! Rich result eligible: {schema.RichResultEligible}");`;

const DI_EXAMPLE = `// Register as singleton in ASP.NET Core DI
// Program.cs
builder.Services.AddHttpClient<SchemaCheckService>(client =>
{
    client.DefaultRequestHeaders.Add(
        "x-api-key",
        builder.Configuration["SchemaCheck:ApiKey"]
    );
    client.BaseAddress = new Uri("https://schemacheck.dev/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// appsettings.json
{
  "SchemaCheck": {
    "ApiKey": "sc_live_your_key_here"
  }
}`;

export default function CSharpPage() {
  return (
    <>
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          SDK Examples
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">C# / .NET</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Uses <code className="text-indigo-400">HttpClient</code> and{" "}
          <code className="text-indigo-400">System.Text.Json</code> — both built into .NET 6+.
          Works with ASP.NET Core, console apps, and Azure Functions.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Installation</h2>
        <CodeBlock language="bash" code={INSTALL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Record types</h2>
        <p className="text-gray-400 mb-4">
          Add these records to a <code className="text-indigo-400 text-sm">Models/SchemaCheck.cs</code>{" "}
          file for strongly-typed responses.
        </p>
        <CodeBlock language="csharp" code={TYPES} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate a URL</h2>
        <CodeBlock language="csharp" code={VALIDATE_URL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate raw JSON-LD</h2>
        <CodeBlock language="csharp" code={VALIDATE_JSONLD} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">ASP.NET Core dependency injection</h2>
        <p className="text-gray-400 mb-4">
          Register <code className="text-indigo-400 text-sm">SchemaCheckService</code> as a typed
          HttpClient with the built-in DI container.
        </p>
        <CodeBlock language="csharp" code={DI_EXAMPLE} />
      </section>

      <section className="pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Next steps</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/docs/options", label: "Parameters & Response", desc: "Full API reference" },
            { href: "/docs/errors", label: "Error Codes", desc: "Handle every error case" },
            { href: "/docs/code-examples/go", label: "Go Examples", desc: "net/http standard library" },
            { href: "/docs/code-examples/javascript", label: "JavaScript Examples", desc: "Node.js and browser" },
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
