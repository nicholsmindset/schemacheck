import type { Metadata } from "next";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "CI/CD Integration — SchemaCheck API Docs",
  description:
    "Integrate schema markup validation into your CI/CD pipeline. GitHub Actions, GitLab CI, and Bitbucket Pipelines templates for SchemaCheck.",
};

// ── Code snippets ─────────────────────────────────────────────────────────────

const githubActionsYaml = `name: Schema Validation
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  schema-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Schema Markup
        run: |
          npx schemacheck-cli validate \${{ env.SITE_URL }} \\
            --api-key \${{ secrets.SCHEMACHECK_API_KEY }} \\
            --fail-on-errors \\
            --min-score 70 \\
            --format table
        env:
          SITE_URL: https://your-site.com`;

const gitlabCiYaml = `schema-validation:
  stage: test
  image: node:20-slim
  script:
    - npx schemacheck-cli validate $SITE_URL
        --api-key $SCHEMACHECK_API_KEY
        --fail-on-errors
        --format table
  variables:
    SITE_URL: https://your-site.com`;

const bitbucketYaml = `image: node:20-slim

pipelines:
  default:
    - step:
        name: Validate Schema Markup
        script:
          - npx schemacheck-cli validate $SITE_URL
              --api-key $SCHEMACHECK_API_KEY
              --fail-on-errors
              --format table
        variables:
          SITE_URL: https://your-site.com`;

const batchValidateYaml = `- name: Batch Schema Validation
  run: npx schemacheck-cli batch urls.txt --api-key \${{ secrets.SCHEMACHECK_API_KEY }} --fail-on-errors`;

const urlsTxt = `https://your-site.com/
https://your-site.com/about
https://your-site.com/blog/post-1
https://your-site.com/products/widget`;

// ── Table helpers ─────────────────────────────────────────────────────────────

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/60">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-800/60 last:border-0 hover:bg-gray-900/30 transition-colors"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-300 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-gray-300 text-xs bg-gray-800 px-1.5 py-0.5 rounded">
      {children}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CiCdPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          Integrations
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">CI/CD Integration</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Validate schema markup in your deployment pipeline. Catch structured data errors before
          they reach production.
        </p>
      </div>

      {/* Platform pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {["GitHub Actions", "GitLab CI", "Bitbucket Pipelines"].map((p) => (
          <span
            key={p}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-700 text-gray-400"
          >
            {p}
          </span>
        ))}
      </div>

      {/* ── GitHub Actions ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">GitHub Actions</h2>
        <p className="text-gray-400 text-sm mb-4">
          Validates schema on every push to main. Fails the workflow if errors are found.
        </p>
        <CodeBlock language="yaml" code={githubActionsYaml} />
        <div className="mt-3 p-3.5 rounded-lg border border-gray-800 bg-[#111118] flex gap-3">
          <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
          <p className="text-sm text-gray-400">
            Add <Mono>SCHEMACHECK_API_KEY</Mono> to your repository&apos;s{" "}
            <strong className="text-gray-300">Settings → Secrets and variables → Actions</strong>.
            Never commit your API key directly to the workflow file.
          </p>
        </div>
      </div>

      {/* ── GitLab CI ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">GitLab CI</h2>
        <p className="text-gray-400 text-sm mb-4">
          Add this job to your <Mono>.gitlab-ci.yml</Mono>. Set{" "}
          <Mono>SCHEMACHECK_API_KEY</Mono> under{" "}
          <strong className="text-gray-300">Settings → CI/CD → Variables</strong>.
        </p>
        <CodeBlock language="yaml" code={gitlabCiYaml} />
        <p className="text-sm text-gray-500 mt-3">
          The <Mono>test</Mono> stage runs after <Mono>build</Mono> by default. Move the job to a
          later stage (e.g. <Mono>validate</Mono>) if you prefer to check the deployed URL rather
          than the source.
        </p>
      </div>

      {/* ── Bitbucket Pipelines ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">Bitbucket Pipelines</h2>
        <p className="text-gray-400 text-sm mb-4">
          Add to <Mono>bitbucket-pipelines.yml</Mono> at the project root. Store{" "}
          <Mono>SCHEMACHECK_API_KEY</Mono> in{" "}
          <strong className="text-gray-300">Repository settings → Repository variables</strong>.
        </p>
        <CodeBlock language="yaml" code={bitbucketYaml} />
      </div>

      {/* ── Batch Validate ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">Batch Validate Multiple URLs</h2>
        <p className="text-gray-400 text-sm mb-4">
          Create a <Mono>urls.txt</Mono> file with one URL per line, then pass it to the{" "}
          <Mono>batch</Mono> command. Useful for validating all key pages in one pipeline step.
        </p>
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-2">urls.txt</p>
          <CodeBlock language="text" code={urlsTxt} />
        </div>
        <CodeBlock language="yaml" code={batchValidateYaml} />
        <p className="text-sm text-gray-500 mt-3">
          The batch command returns a non-zero exit code if any URL has schema errors, failing the
          pipeline step automatically when <Mono>--fail-on-errors</Mono> is set.
        </p>
      </div>

      {/* ── Environment Variables ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Environment Variables</h2>
        <Table
          headers={["Variable", "Required", "Description"]}
          rows={[
            [
              <Mono key="key">SCHEMACHECK_API_KEY</Mono>,
              <span key="req" className="text-green-400 text-xs font-medium">
                Required
              </span>,
              "Your SchemaCheck API key. Get one free from the dashboard.",
            ],
            [
              <Mono key="url">SITE_URL</Mono>,
              <span key="req2" className="text-gray-500 text-xs">
                Optional
              </span>,
              "The URL to validate. Can also be passed directly as a CLI argument.",
            ],
          ]}
        />
      </div>

      {/* ── Exit Codes ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Exit Codes</h2>
        <Table
          headers={["Code", "Meaning"]}
          rows={[
            [
              <span key="0" className="font-mono text-green-400">
                0
              </span>,
              "Validation passed. No errors found (warnings may be present).",
            ],
            [
              <span key="1" className="font-mono text-red-400">
                1
              </span>,
              "Validation failed. One or more schema errors were found (requires --fail-on-errors).",
            ],
            [
              <span key="2" className="font-mono text-yellow-400">
                2
              </span>,
              "Score below threshold. The --min-score value was not met.",
            ],
            [
              <span key="3" className="font-mono text-red-400">
                3
              </span>,
              "API error. Invalid API key, quota exceeded, or network failure.",
            ],
          ]}
        />
      </div>

      {/* ── CLI Flags Reference ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">CLI Flags Reference</h2>
        <Table
          headers={["Flag", "Type", "Default", "Description"]}
          rows={[
            [
              <Mono key="f1">--api-key</Mono>,
              <span key="t1" className="text-gray-500 text-xs font-mono">
                string
              </span>,
              <span key="d1" className="text-gray-600 text-xs">
                env
              </span>,
              "Your SchemaCheck API key. Falls back to SCHEMACHECK_API_KEY env var.",
            ],
            [
              <Mono key="f2">--fail-on-errors</Mono>,
              <span key="t2" className="text-gray-500 text-xs font-mono">
                boolean
              </span>,
              <span key="d2" className="text-gray-600 text-xs">
                false
              </span>,
              "Exit with code 1 if any schema errors are found.",
            ],
            [
              <Mono key="f3">--min-score</Mono>,
              <span key="t3" className="text-gray-500 text-xs font-mono">
                number
              </span>,
              <span key="d3" className="text-gray-600 text-xs">
                0
              </span>,
              "Fail if the validation score is below this threshold (0–100).",
            ],
            [
              <Mono key="f4">--format</Mono>,
              <span key="t4" className="text-gray-500 text-xs font-mono">
                string
              </span>,
              <span key="d4" className="text-gray-600 text-xs">
                json
              </span>,
              <>
                Output format. One of <Mono>json</Mono>, <Mono>table</Mono>, <Mono>summary</Mono>.
              </>,
            ],
            [
              <Mono key="f5">--timeout</Mono>,
              <span key="t5" className="text-gray-500 text-xs font-mono">
                number
              </span>,
              <span key="d5" className="text-gray-600 text-xs">
                30000
              </span>,
              "Request timeout in milliseconds.",
            ],
            [
              <Mono key="f6">--output</Mono>,
              <span key="t6" className="text-gray-500 text-xs font-mono">
                string
              </span>,
              <span key="d6" className="text-gray-600 text-xs">
                stdout
              </span>,
              "Write output to a file instead of stdout.",
            ],
          ]}
        />
      </div>

      {/* Tip callout */}
      <div className="p-5 rounded-xl border border-indigo-800/50 bg-indigo-950/20">
        <p className="text-sm text-indigo-300 font-medium mb-1">Validate the deployed URL, not the source</p>
        <p className="text-sm text-gray-400">
          For best results, trigger schema validation after your deployment step completes so the
          CLI checks the live, rendered page. Structured data injected by JavaScript won&apos;t be
          visible in static source files.
        </p>
      </div>
    </>
  );
}
