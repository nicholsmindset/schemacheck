import type { Metadata } from "next";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "MCP Server — SchemaCheck Docs",
  description:
    "Use SchemaCheck as an MCP tool inside Claude, Cursor, Windsurf, Zed, Firebase Studio, Gemini CLI, and other AI coding assistants.",
};

// ── Config snippets ──────────────────────────────────────────────────────────

const claudeConfig = `{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}`;

const cursorConfig = `{
  "mcp": {
    "servers": {
      "schemacheck": {
        "command": "npx",
        "args": ["-y", "schemacheck-mcp"],
        "env": {
          "SCHEMACHECK_API_KEY": "YOUR_API_KEY"
        }
      }
    }
  }
}`;

const windsurfConfig = `{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}`;

const clineConfig = `{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "YOUR_API_KEY"
      },
      "disabled": false,
      "alwaysAllow": ["validate_schema", "list_supported_types"]
    }
  }
}`;

const continueConfig = `name: schemacheck
command: npx
args:
  - "-y"
  - schemacheck-mcp
env:
  SCHEMACHECK_API_KEY: YOUR_API_KEY`;

const zedConfig = `{
  "context_servers": {
    "schemacheck": {
      "source": "custom",
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}`;

const firebaseConfig = `{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "\${env:SCHEMACHECK_API_KEY}"
      }
    }
  }
}`;

const geminiConfig = `{
  "mcpServers": {
    "schemacheck": {
      "command": "npx",
      "args": ["-y", "schemacheck-mcp"],
      "env": {
        "SCHEMACHECK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}`;

// ── Usage examples ────────────────────────────────────────────────────────────

const validateUrl = `// Ask your AI assistant:
"Validate the schema markup on https://example.com"

// The MCP tool call looks like:
validate_schema({ url: "https://example.com" })`;

const validateJsonld = `// Ask your AI assistant:
"Check if this schema is valid for rich results"

// The MCP tool call looks like:
validate_schema({
  jsonld: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "My Article",
    "author": { "@type": "Person", "name": "Jane Doe" },
    "datePublished": "2024-01-01"
  }
})`;

const listTypes = `// Ask your AI assistant:
"What schema types does SchemaCheck support?"

// The MCP tool call looks like:
list_supported_types()`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-gray-300 text-xs bg-gray-800 px-1.5 py-0.5 rounded">
      {children}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function McpPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
          Integrations
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">MCP Server</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Use SchemaCheck natively inside any{" "}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Model Context Protocol
          </a>
          {" "}compatible AI tool. Validate URLs and raw JSON-LD without leaving your editor.
        </p>
      </div>

      {/* Supported tools pill row */}
      <div className="flex flex-wrap gap-2 mb-10">
        {[
          "Claude Desktop",
          "Cursor",
          "Windsurf",
          "VS Code + Cline",
          "VS Code + Continue",
          "Zed",
          "Firebase Studio",
          "Gemini CLI",
        ].map((tool) => (
          <span
            key={tool}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-700 text-gray-400"
          >
            {tool}
          </span>
        ))}
      </div>

      {/* What it does */}
      <div className="mb-10 p-5 rounded-xl border border-gray-800 bg-[#111118]">
        <h2 className="text-sm font-semibold text-white mb-3">Two tools, one integration</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-indigo-400 font-mono text-sm shrink-0 mt-0.5">validate_schema</span>
            <p className="text-sm text-gray-400">
              Validate any URL or raw JSON-LD object. Returns errors, warnings, rich result
              eligibility, fix suggestions, and links to Google&apos;s documentation.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-indigo-400 font-mono text-sm shrink-0 mt-0.5">list_supported_types</span>
            <p className="text-sm text-gray-400">
              Returns all 35+ schema types with their validation status and Google docs links.
            </p>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Prerequisites</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-green-500 shrink-0 mt-0.5">✓</span>
            Node.js 18+ installed
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 shrink-0 mt-0.5">✓</span>
            A SchemaCheck API key —{" "}
            <a href="/dashboard/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              get one free
            </a>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 shrink-0 mt-0.5">✓</span>
            Any MCP-compatible AI client (see list above)
          </li>
        </ul>
      </div>

      {/* ── Claude Desktop ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">Claude Desktop</h2>
        <p className="text-sm text-gray-400 mb-4">
          Open <Mono>~/Library/Application Support/Claude/claude_desktop_config.json</Mono> and add:
        </p>
        <CodeBlock code={claudeConfig} language="json" />
        <p className="text-sm text-gray-500 mt-3">
          Replace <Mono>YOUR_API_KEY</Mono> with your key from the{" "}
          <a href="/dashboard" className="text-indigo-400 hover:text-indigo-300 transition-colors">dashboard</a>.
          Restart Claude Desktop to activate.
        </p>
      </div>

      {/* ── Cursor ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">Cursor</h2>
        <p className="text-sm text-gray-400 mb-4">
          Add to <Mono>.cursor/mcp.json</Mono> (project) or <Mono>~/.cursor/mcp.json</Mono> (global):
        </p>
        <CodeBlock code={cursorConfig} language="json" />
      </div>

      {/* ── Windsurf ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">Windsurf</h2>
        <p className="text-sm text-gray-400 mb-4">
          Add to <Mono>~/.codeium/windsurf/mcp_config.json</Mono>:
        </p>
        <CodeBlock code={windsurfConfig} language="json" />
        <p className="text-sm text-gray-500 mt-3">
          Windsurf&apos;s Cascade agent picks up MCP servers automatically after saving. No restart required.
        </p>
      </div>

      {/* ── VS Code + Cline ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">VS Code + Cline</h2>
        <p className="text-sm text-gray-400 mb-4">
          Open the Cline panel → click <strong className="text-gray-300">MCP Servers</strong> →{" "}
          <strong className="text-gray-300">Configure MCP Servers</strong>. This opens{" "}
          <Mono>cline_mcp_settings.json</Mono>. Add:
        </p>
        <CodeBlock code={clineConfig} language="json" />
        <p className="text-sm text-gray-500 mt-3">
          <Mono>alwaysAllow</Mono> auto-approves these tools so Cline won&apos;t prompt on every call.
        </p>
      </div>

      {/* ── VS Code + Continue ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">VS Code + Continue</h2>
        <p className="text-sm text-gray-400 mb-4">
          Create <Mono>.continue/mcpServers/schemacheck.yaml</Mono> in your project root:
        </p>
        <CodeBlock code={continueConfig} language="yaml" />
        <p className="text-sm text-gray-500 mt-3">
          Continue auto-detects any YAML or JSON file placed in the <Mono>.continue/mcpServers/</Mono> directory.
        </p>
      </div>

      {/* ── Zed ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">Zed</h2>
        <p className="text-sm text-gray-400 mb-4">
          Open <Mono>~/.config/zed/settings.json</Mono> and add a <Mono>context_servers</Mono> key:
        </p>
        <CodeBlock code={zedConfig} language="json" />
        <p className="text-sm text-gray-500 mt-3">
          Zed restarts the context server automatically whenever you save <Mono>settings.json</Mono>.
        </p>
      </div>

      {/* ── Firebase Studio ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">Firebase Studio</h2>
        <p className="text-sm text-gray-400 mb-4">
          Create <Mono>.idx/mcp.json</Mono> at your project root. Use <Mono>{"${env:VAR}"}</Mono> syntax
          to reference environment variables from your <Mono>.env</Mono> file:
        </p>
        <CodeBlock code={firebaseConfig} language="json" />
        <p className="text-sm text-gray-500 mt-3">
          Add <Mono>SCHEMACHECK_API_KEY=your_key</Mono> to your <Mono>.env</Mono> file at the project root.
          MCP support in Firebase Studio is currently in preview.
        </p>
      </div>

      {/* ── Gemini CLI ── */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-2">Gemini CLI</h2>
        <p className="text-sm text-gray-400 mb-4">
          Add to <Mono>~/.gemini/settings.json</Mono> (global) or <Mono>.gemini/settings.json</Mono> (project):
        </p>
        <CodeBlock code={geminiConfig} language="json" />
        <p className="text-sm text-gray-500 mt-3">
          Manage servers from the CLI with{" "}
          <Mono>gemini mcp enable schemacheck</Mono> /{" "}
          <Mono>gemini mcp status</Mono>.
        </p>
      </div>

      {/* Usage examples */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Usage examples</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Validate a live URL</p>
            <CodeBlock code={validateUrl} language="javascript" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Validate raw JSON-LD</p>
            <CodeBlock code={validateJsonld} language="javascript" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">List supported types</p>
            <CodeBlock code={listTypes} language="javascript" />
          </div>
        </div>
      </div>

      {/* What the AI can do */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">What your AI assistant can do</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { title: "Audit any page", desc: "\"Check the schema markup on our homepage and list all errors\"" },
            { title: "Fix schema inline", desc: "\"Validate this JSON-LD I wrote and fix any missing required fields\"" },
            { title: "Pre-publish checks", desc: "\"Before I deploy this product page, validate its schema against Google's requirements\"" },
            { title: "Bulk audits", desc: "\"Validate all 10 URLs from this list and summarize the errors\"" },
            { title: "Rich result debugging", desc: "\"Why isn't this Article schema eligible for rich results?\"" },
            { title: "Schema generation", desc: "\"Generate valid Article schema for this blog post and confirm it passes\"" },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl border border-gray-800 bg-[#111118]">
              <p className="text-sm font-medium text-white mb-1">{item.title}</p>
              <p className="text-sm text-gray-500 italic">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom API base */}
      <div className="mb-10 p-5 rounded-xl border border-gray-800 bg-[#111118]">
        <h2 className="text-sm font-semibold text-white mb-2">Point to a custom API base</h2>
        <p className="text-sm text-gray-400 mb-3">
          By default the server calls{" "}
          <Mono>https://schemacheck.dev/api/v1</Mono>.
          Override it for self-hosted or local instances:
        </p>
        <CodeBlock
          code={`"env": {
  "SCHEMACHECK_API_KEY": "YOUR_API_KEY",
  "SCHEMACHECK_API_BASE": "http://localhost:3000/api/v1"
}`}
          language="json"
        />
      </div>

      {/* Rate limits note */}
      <div className="p-5 rounded-xl border border-yellow-800/40 bg-yellow-950/10">
        <p className="text-sm text-yellow-300 font-medium mb-1">Plan limits apply</p>
        <p className="text-sm text-gray-400">
          Each <Mono>validate_schema</Mono> call counts as one validation against your monthly quota.
          Cached results (same URL within 1 hour) are free and don&apos;t count.{" "}
          <a href="/pricing" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            View plans →
          </a>
        </p>
      </div>
    </>
  );
}
