export const DOC_NAV = [
  {
    group: "Getting Started",
    items: [
      { href: "/docs/getting-started", label: "Getting Started",   desc: "Make your first API call" },
      { href: "/docs/authentication",  label: "Authentication",    desc: "API key setup and methods" },
    ],
  },
  {
    group: "API Reference",
    items: [
      { href: "/docs/options", label: "Parameters & Response", desc: "Every field documented" },
      { href: "/docs/errors",  label: "Error Codes",           desc: "All errors, HTTP statuses, and fixes" },
    ],
  },
  {
    group: "SDK Examples",
    items: [
      { href: "/docs/code-examples/javascript", label: "JavaScript / TypeScript", desc: "Node.js, Bun, Deno, browser" },
      { href: "/docs/code-examples/python",     label: "Python",                  desc: "requests library" },
      { href: "/docs/code-examples/php",        label: "PHP",                     desc: "cURL and Guzzle" },
      { href: "/docs/code-examples/go",         label: "Go",                      desc: "net/http standard library" },
      { href: "/docs/code-examples/ruby",       label: "Ruby",                    desc: "Net::HTTP and Faraday" },
      { href: "/docs/code-examples/csharp",     label: "C# / .NET",               desc: "HttpClient (.NET 6+)" },
    ],
  },
];
