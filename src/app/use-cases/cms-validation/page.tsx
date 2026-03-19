import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS Schema Validation — WordPress, Shopify & More",
  description: "Validate schema markup for ecommerce websites and CMS platforms. Schema markup for WordPress, Shopify schema types, and WooCommerce product schema — catch errors at publish time using the SchemaCheck API.",
};

export default function CmsValidationPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Schema Markup Validation for CMS Platforms</h1>
      <p className="text-gray-400 mb-10">
        Content management systems often generate Schema.org markup automatically — but that markup can have bugs, missing properties, or deprecated types. SchemaCheck lets you validate it programmatically at publish time.
      </p>
      <div className="space-y-6 text-gray-400">
        <h2 className="text-xl font-semibold text-white">Shopify Schema Validation</h2>
        <p>
          Common CMS schema problems SchemaCheck catches — from how to add schema in WordPress to Shopify schema types:
        </p>
        <ul className="space-y-2 text-sm">
          {[
            "WordPress Yoast/RankMath schemas missing dateModified or publisher",
            "Contentful structured data templates with empty required fields",
            "Sanity schemas that generate FAQPage for non-gov/health sites",
            "Ghost blogs with BlogPosting schemas missing image",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-indigo-400">→</span>
              {item}
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold text-white">How to Add &amp; Validate Schema in WordPress</h2>
        <p>
          Integrate SchemaCheck into your CMS publish webhook to catch schema issues before they go live. Works with WooCommerce product schema, Yoast, RankMath, and custom implementations.
        </p>
      </div>
    </div>
  );
}
