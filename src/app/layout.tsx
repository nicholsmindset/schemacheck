import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.schemacheck.dev";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "SchemaCheck — Schema Markup Validation API",
    template: "%s | SchemaCheck",
  },
  description:
    "Validate Schema.org structured data via REST API. Send a URL or JSON-LD, get back errors, warnings, rich result eligibility, and fix suggestions.",
  keywords: [
    "schema markup validation",
    "structured data API",
    "JSON-LD validator",
    "rich results test API",
    "Schema.org validation",
    "SEO audit API",
  ],
  authors: [{ name: "SchemaCheck" }],
  creator: "SchemaCheck",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "SchemaCheck",
    title: "SchemaCheck — Schema Markup Validation API",
    description:
      "Validate Schema.org structured data via REST API. Errors, warnings, rich result eligibility, and fix suggestions in one call.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SchemaCheck — Schema Markup Validation API",
    description:
      "Validate Schema.org structured data via REST API. Errors, warnings, rich result eligibility, and fix suggestions.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "Ar1ecZMjoIpQFhdJ6uYDQdHqfIRHVHGTSqN02kWAleI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${APP_URL}/#organization`,
                  name: "SchemaCheck",
                  url: APP_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${APP_URL}/logo.png`,
                    width: 200,
                    height: 200,
                  },
                  sameAs: [],
                  description:
                    "SchemaCheck provides a REST API for validating Schema.org structured data. Developers and AI agents use SchemaCheck to audit JSON-LD markup, check rich result eligibility, and get actionable fix suggestions.",
                },
                {
                  "@type": "WebSite",
                  "@id": `${APP_URL}/#website`,
                  url: APP_URL,
                  name: "SchemaCheck",
                  description:
                    "Schema markup validation API. Send a URL or JSON-LD, get errors, warnings, rich result eligibility, and fix suggestions.",
                  publisher: { "@id": `${APP_URL}/#organization` },
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": `${APP_URL}/#software`,
                  name: "SchemaCheck API",
                  url: APP_URL,
                  description:
                    "REST API for validating Schema.org JSON-LD structured data. Checks against Google's current rich result requirements for 35+ schema types. Returns errors, warnings, rich result eligibility, and fix suggestions.",
                  applicationCategory: "DeveloperApplication",
                  operatingSystem: "Web",
                  offers: [
                    {
                      "@type": "Offer",
                      price: "0",
                      priceCurrency: "USD",
                      name: "Free",
                      description: "100 validations/month",
                    },
                    {
                      "@type": "Offer",
                      price: "19",
                      priceCurrency: "USD",
                      name: "Basic",
                      description: "3,000 validations/month",
                    },
                    {
                      "@type": "Offer",
                      price: "79",
                      priceCurrency: "USD",
                      name: "Growth",
                      description: "15,000 validations/month",
                    },
                    {
                      "@type": "Offer",
                      price: "199",
                      priceCurrency: "USD",
                      name: "Scale",
                      description: "75,000 validations/month",
                    },
                  ],
                  provider: { "@id": `${APP_URL}/#organization` },
                  isPartOf: { "@id": `${APP_URL}/#website` },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-gray-100" suppressHydrationWarning>{children}</body>
    </html>
  );
}
