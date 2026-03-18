import Link from "next/link";

const links = {
  Docs: [
    { label: "Quickstart", href: "/docs/quickstart" },
    { label: "Authentication", href: "/docs/authentication" },
    { label: "Error codes", href: "/docs/errors" },
    { label: "OpenAPI spec", href: "/openapi.json" },
  ],
  SDKs: [
    { label: "JavaScript", href: "/docs/code-examples/javascript" },
    { label: "Python", href: "/docs/code-examples/python" },
    { label: "PHP", href: "/docs/code-examples/php" },
    { label: "Go", href: "/docs/code-examples/go" },
    { label: "Ruby", href: "/docs/code-examples/ruby" },
    { label: "C#", href: "/docs/code-examples/csharp" },
  ],
  Integrations: [
    { label: "Zapier", href: "/integrations/zapier" },
    { label: "Make", href: "/integrations/make" },
    { label: "n8n", href: "/integrations/n8n" },
  ],
  "Use cases": [
    { label: "SEO audits", href: "/use-cases/seo-audit" },
    { label: "AI agents", href: "/use-cases/ai-agents" },
    { label: "CMS validation", href: "/use-cases/cms-validation" },
    { label: "E-commerce", href: "/use-cases/ecommerce" },
  ],
  Company: [
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/changelog" },
    { label: "Customers", href: "/customers" },
    { label: "vs Google Rich Results Test", href: "/comparisons/google-rich-results-test-alternative" },
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-800 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-3">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-bold">SchemaCheck</span>
            <span className="text-gray-600">·</span>
            <span className="text-sm text-gray-500">Validate structured data in one API call</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SchemaCheck. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
