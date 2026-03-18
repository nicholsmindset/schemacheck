import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Go Examples",
  description:
    "Go code examples for the SchemaCheck schema validation API using the net/http standard library. No external dependencies required.",
};

const INSTALL = `# Uses the Go standard library only — no go get required
# Go 1.18+ recommended`;

const TYPES = `package schemacheck

// Result is the top-level response from the validate endpoint.
type Result struct {
	Success      bool      \`json:"success"\`
	URL          string    \`json:"url,omitempty"\`
	SchemasFound int       \`json:"schemas_found"\`
	Schemas      []Schema  \`json:"schemas"\`
	Summary      Summary   \`json:"summary"\`
	Meta         Meta      \`json:"meta"\`
}

type Schema struct {
	Type                      string      \`json:"type"\`
	Valid                     bool        \`json:"valid"\`
	RichResultEligible        bool        \`json:"rich_result_eligible"\`
	Deprecated                bool        \`json:"deprecated"\`
	DeprecationNote           *string     \`json:"deprecation_note"\`
	Errors                    []Issue     \`json:"errors"\`
	Warnings                  []Issue     \`json:"warnings"\`
	PropertiesFound           []string    \`json:"properties_found"\`
	PropertiesMissingRequired []string    \`json:"properties_missing_required"\`
	RichResult                RichResult  \`json:"rich_result"\`
}

type Issue struct {
	Severity      string \`json:"severity"\`
	Property      string \`json:"property"\`
	Message       string \`json:"message"\`
	Fix           string \`json:"fix"\`
	GoogleDocsURL string \`json:"google_docs_url"\`
}

type RichResult struct {
	Eligible      bool   \`json:"eligible"\`
	Reason        string \`json:"reason"\`
	GoogleDocsURL string \`json:"google_docs_url"\`
}

type Summary struct {
	TotalSchemas       int \`json:"total_schemas"\`
	ValidSchemas       int \`json:"valid_schemas"\`
	InvalidSchemas     int \`json:"invalid_schemas"\`
	TotalErrors        int \`json:"total_errors"\`
	TotalWarnings      int \`json:"total_warnings"\`
	RichResultEligible int \`json:"rich_result_eligible"\`
	Score              int \`json:"score"\`
}

type Meta struct {
	APIVersion      string \`json:"api_version"\`
	ValidatedAt     string \`json:"validated_at"\`
	Cached          bool   \`json:"cached"\`
	CreditsUsed     int    \`json:"credits_used"\`
	CreditsRemaining int   \`json:"credits_remaining"\`
	ResponseTimeMs  int    \`json:"response_time_ms"\`
}

type APIError struct {
	Code    string \`json:"code"\`
	Message string \`json:"message"\`
	DocsURL string \`json:"docs_url"\`
}

type ErrorResponse struct {
	Success bool     \`json:"success"\`
	Error   APIError \`json:"error"\`
}`;

const VALIDATE_URL = `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
)

const baseURL = "https://schemacheck.dev/api/v1"

func validateURL(targetURL, apiKey string) (*Result, error) {
	endpoint := baseURL + "/validate?" + url.Values{
		"url":        {targetURL},
		"access_key": {apiKey},
	}.Encode()

	resp, err := http.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var errResp ErrorResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
			return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
		}
		return nil, fmt.Errorf("[%s] %s", errResp.Error.Code, errResp.Error.Message)
	}

	var result Result
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	return &result, nil
}

func main() {
	apiKey := os.Getenv("SCHEMACHECK_API_KEY")
	result, err := validateURL("https://stripe.com", apiKey)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\\n", err)
		os.Exit(1)
	}

	fmt.Printf("Score: %d/100\\n", result.Summary.Score)
	fmt.Printf("Schemas found: %d\\n", result.SchemasFound)

	for _, schema := range result.Schemas {
		fmt.Printf("\\n[%s] valid=%v richResult=%v\\n",
			schema.Type, schema.Valid, schema.RichResultEligible)

		for _, e := range schema.Errors {
			fmt.Printf("  ✗ %s: %s\\n", e.Property, e.Message)
			fmt.Printf("    Fix: %s\\n", e.Fix)
		}
	}
}`;

const VALIDATE_JSONLD = `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func validateJSONLD(jsonld map[string]any, apiKey string) (*Result, error) {
	body, err := json.Marshal(map[string]any{"jsonld": jsonld})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", "https://schemacheck.dev/api/v1/validate", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var errResp ErrorResponse
		json.NewDecoder(resp.Body).Decode(&errResp)
		return nil, fmt.Errorf("[%s] %s", errResp.Error.Code, errResp.Error.Message)
	}

	var result Result
	json.NewDecoder(resp.Body).Decode(&result)
	return &result, nil
}

func main() {
	apiKey := os.Getenv("SCHEMACHECK_API_KEY")
	result, err := validateJSONLD(map[string]any{
		"@context":      "https://schema.org",
		"@type":         "Article",
		"headline":      "How to validate Schema.org structured data",
		"author":        map[string]any{"@type": "Person", "name": "Jane Doe"},
		"datePublished": "2026-03-18",
		"image":         "https://example.com/photo.jpg",
	}, apiKey)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\\n", err)
		os.Exit(1)
	}

	schema := result.Schemas[0]
	if !schema.Valid {
		for _, e := range schema.Errors {
			fmt.Printf("Error: %s: %s\\n", e.Property, e.Fix)
		}
		os.Exit(1)
	}
	fmt.Printf("Valid! Rich result eligible: %v\\n", schema.RichResultEligible)
}`;

export default function GoPage() {
  return (
    <>
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          SDK Examples
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">Go</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Uses the <code className="text-indigo-400">net/http</code> standard library — no
          external dependencies required. Compatible with Go 1.18+.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Installation</h2>
        <CodeBlock language="bash" code={INSTALL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Types</h2>
        <p className="text-gray-400 mb-4">
          Add these structs to a <code className="text-indigo-400 text-sm">schemacheck.go</code>{" "}
          file for strongly-typed responses.
        </p>
        <CodeBlock language="go" code={TYPES} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate a URL</h2>
        <CodeBlock language="go" code={VALIDATE_URL} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Validate raw JSON-LD</h2>
        <CodeBlock language="go" code={VALIDATE_JSONLD} />
      </section>

      <section className="pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Next steps</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/docs/options", label: "Parameters & Response", desc: "Full API reference" },
            { href: "/docs/errors", label: "Error Codes", desc: "Handle every error case" },
            { href: "/docs/code-examples/python", label: "Python Examples", desc: "requests library" },
            { href: "/docs/code-examples/csharp", label: "C# Examples", desc: "HttpClient (.NET 6+)" },
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
