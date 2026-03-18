import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/CodeBlock";

export const metadata: Metadata = {
  title: "Schema Validation for AI Agents & LLM Tools | SchemaCheck API",
  description:
    "Let AI agents validate Schema.org structured data programmatically. SchemaCheck is the only REST API built for LLM workflows — MCP server included for Claude, Cursor, and Copilot.",
};

const JSONLD = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Schema Validation for AI Agents",
    description:
      "Let AI agents validate Schema.org structured data programmatically. SchemaCheck is the only REST API built for LLM workflows.",
    url: "https://schemacheck.dev/use-cases/ai-agents",
    isPartOf: { "@type": "WebSite", name: "SchemaCheck", url: "https://schemacheck.dev" },
  },
  null,
  2
);

const TOOL_DEF_CODE = `// Register SchemaCheck as a tool in any LLM framework
const tools = [
  {
    name: "validate_schema",
    description: \`Validate Schema.org JSON-LD structured data on a URL or raw JSON-LD object.
Returns: errors (required properties missing), warnings (recommended missing),
rich_result_eligible (boolean), and a 0-100 health score.
Use this when the user asks about structured data, rich results, or schema markup.\`,
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The public URL to fetch and validate. Use this if the schema is on a live page.",
        },
        jsonld: {
          type: "object",
          description: "Raw JSON-LD object to validate directly. Use this for inline schema review.",
        },
      },
    },
    execute: async ({ url, jsonld }) => {
      const endpoint = "https://schemacheck.dev/api/v1/validate";
      const apiKey = process.env.SCHEMACHECK_API_KEY;

      if (url) {
        const res = await fetch(\`\${endpoint}?url=\${encodeURIComponent(url)}&access_key=\${apiKey}\`);
        return res.json();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ jsonld }),
      });
      return res.json();
    },
  },
];`;

const ANTHROPIC_CODE = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "validate_schema",
    description: "Validate Schema.org structured data on a URL. Returns errors, warnings, rich result eligibility, and a health score.",
    input_schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Public URL to validate" },
      },
      required: ["url"],
    },
  },
];

async function runSchemaAgent(userMessage: string) {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      tools,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      return response.content.find((b) => b.type === "text")?.text;
    }

    // Handle tool use
    const toolUses = response.content.filter((b) => b.type === "tool_use");
    const toolResults: Anthropic.MessageParam = {
      role: "user",
      content: await Promise.all(
        toolUses.map(async (toolUse) => {
          if (toolUse.type !== "tool_use") return null!;
          const { url } = toolUse.input as { url: string };
          const res = await fetch(
            \`https://schemacheck.dev/api/v1/validate?url=\${encodeURIComponent(url)}&access_key=\${process.env.SCHEMACHECK_API_KEY}\`
          );
          const data = await res.json();
          return {
            type: "tool_result" as const,
            tool_use_id: toolUse.id,
            content: JSON.stringify(data),
          };
        })
      ),
    };

    messages.push({ role: "assistant", content: response.content }, toolResults);
  }
}

// Example usage
const result = await runSchemaAgent(
  "Audit the structured data on https://stripe.com and tell me what's preventing rich results."
);
console.log(result);`;

const MCP_CONFIG = `// ~/.cursor/mcp.json  (or Claude Desktop config)
{
  "mcpServers": {
    "schemacheck": {
      "command": "node",
      "args": ["/path/to/schemacheck-mcp/dist/index.js"],
      "env": {
        "SCHEMACHECK_API_KEY": "sc_live_your_key_here"
      }
    }
  }
}

// Once installed, your AI assistant can call it natively:
// User: "Validate the schema on stripe.com"
// Claude: <calls validate_schema tool> → returns full analysis`;

const LANGCHAIN_CODE = `from langchain.tools import tool
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
import requests
import os

@tool
def validate_schema(url: str) -> dict:
    """Validate Schema.org structured data on a URL.
    Returns errors, warnings, rich result eligibility, and a 0-100 score."""
    resp = requests.get(
        "https://schemacheck.dev/api/v1/validate",
        params={"url": url, "access_key": os.environ["SCHEMACHECK_API_KEY"]},
        timeout=30,
    )
    return resp.json()

llm = ChatAnthropic(model="claude-opus-4-6")
tools = [validate_schema]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an SEO expert. When asked about structured data, use the validate_schema tool."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({
    "input": "Check if https://shopify.com has valid Product schema markup for Google Shopping."
})
print(result["output"])`;

export default function AiAgentsPage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSONLD }}
      />

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-400">SchemaCheck</Link>
          <span>/</span>
          <Link href="/#use-cases" className="hover:text-gray-400">Use Cases</Link>
          <span>/</span>
          <span className="text-gray-400">AI Agents</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Use Case
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Let AI agents validate structured data programmatically
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            When a user asks an AI agent to audit a website&apos;s schema markup, the agent needs
            a REST API to call. SchemaCheck is that API — JSON in, structured analysis out, with
            an MCP server for zero-config tool registration.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get free API key →
            </Link>
            <Link
              href="/docs/options"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              View API reference
            </Link>
          </div>
        </div>

        {/* The AI gap */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Why AI agents need this</h2>
          <p className="text-gray-400 mb-4">
            Google&apos;s Rich Results Test has no API. Schema.org&apos;s validator has no API.
            Every existing tool requires a browser. When a user asks an LLM to &ldquo;audit my
            site&apos;s structured data,&rdquo; the agent hits a dead end.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: "✗", label: "Google Rich Results Test", desc: "Web UI only. No API, no automation path." },
              { icon: "✗", label: "Schema.org validator", desc: "Web UI only. No programmatic access." },
              { icon: "✓", label: "SchemaCheck API", desc: "REST API. JSON out. Designed for agents." },
              { icon: "✓", label: "SchemaCheck MCP server", desc: "Zero-config tool for Claude and Cursor." },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex gap-3 p-4 rounded-xl border ${
                  item.icon === "✓"
                    ? "border-indigo-800/60 bg-indigo-950/10"
                    : "border-gray-800 bg-[#111118]"
                }`}
              >
                <span className={`font-bold shrink-0 ${item.icon === "✓" ? "text-indigo-400" : "text-gray-600"}`}>
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Generic tool definition */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Register as a tool in any framework</h2>
          <p className="text-gray-400 mb-4">
            Drop this tool definition into OpenAI, Anthropic, Vercel AI SDK, or any framework that
            supports function calling. The description is written to trigger the tool for
            schema-related user requests.
          </p>
          <CodeBlock language="javascript" code={TOOL_DEF_CODE} />
        </section>

        {/* Anthropic SDK */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Full agentic loop with Claude</h2>
          <p className="text-gray-400 mb-4">
            A complete agent using the Anthropic SDK with tool use. The model decides when to call
            SchemaCheck and synthesizes the JSON response into a natural language explanation.
          </p>
          <CodeBlock language="typescript" code={ANTHROPIC_CODE} />
        </section>

        {/* MCP */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">MCP server for Claude &amp; Cursor</h2>
          <p className="text-gray-400 mb-4">
            SchemaCheck ships an{" "}
            <a
              href="https://modelcontextprotocol.io"
              className="text-indigo-400 hover:text-indigo-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              MCP (Model Context Protocol)
            </a>{" "}
            server. Add it to your config once — no tool registration needed. Claude Desktop,
            Cursor, and any MCP-compatible client can call it immediately.
          </p>
          <CodeBlock language="json" code={MCP_CONFIG} />
        </section>

        {/* LangChain */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">LangChain agent (Python)</h2>
          <p className="text-gray-400 mb-4">
            Use the <code className="text-indigo-400 text-sm">@tool</code> decorator to wrap
            SchemaCheck in a LangChain agent. Compatible with LangGraph for multi-step workflows.
          </p>
          <CodeBlock language="python" code={LANGCHAIN_CODE} />
        </section>

        {/* Why JSON-clean matters for agents */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Designed for LLM consumption</h2>
          <div className="space-y-2">
            {[
              { label: "Structured JSON output", desc: "Every response is a consistent JSON shape. No scraping HTML, no parsing free text." },
              { label: "Actionable fix suggestions", desc: "Each error includes a fix field — ready to be included in an LLM prompt or shown directly to users." },
              { label: "Google docs URLs", desc: "Every issue links to the relevant Google structured data documentation for grounded citations." },
              { label: "0–100 health score", desc: "Machine-readable quality score. Easy to use in conditions: if score < 70, flag for review." },
              { label: "1-hour response caching", desc: "Repeated validations of the same URL are free. Agents can call the API aggressively without burning credits." },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 p-4 rounded-lg bg-[#111118] border border-gray-800/60">
                <span className="text-indigo-400 text-sm shrink-0 mt-0.5">→</span>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20 mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">Add schema validation to your agent today</h2>
          <p className="text-gray-400 text-sm mb-4">
            Free plan — 100 validations/month. No credit card. API key in 30 seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get free API key →
            </Link>
            <Link
              href="/docs/options"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              API reference
            </Link>
          </div>
        </section>

        {/* Internal links */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Related</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: "/use-cases/seo-audit", label: "SEO Audits", desc: "Bulk validate sitemaps and catch regressions in CI" },
              { href: "/docs/code-examples/javascript", label: "JavaScript Examples", desc: "Full TypeScript examples with types" },
              { href: "/comparisons/google-rich-results-test-alternative", label: "vs Google Rich Results Test", desc: "Why the API beats the web UI for automation" },
              { href: "/pricing", label: "Pricing", desc: "100 free/month, scale to 75K+" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-[#111118] hover:bg-[#13131c] transition-all"
              >
                <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors mb-0.5">
                  {link.label} →
                </p>
                <p className="text-xs text-gray-500">{link.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
