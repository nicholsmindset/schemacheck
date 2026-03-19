import type { Metadata } from "next";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Pricing — Schema Markup Validation Tool Plans",
  description: "Affordable structured data validator plans. Free schema checker tool with 100 validations/month — no credit card required. Paid plans from $19/mo with overage billing.",
};

const APP_URL = "https://schemacheck.dev";

const breadcrumbJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.schemacheck.dev" },
    { "@type": "ListItem", position: 2, name: "Pricing", item: "https://www.schemacheck.dev/pricing" },
  ],
});

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${APP_URL}/#software`,
  name: "SchemaCheck API",
  url: APP_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "100 validations/month. No credit card required.",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        value: 100,
        unitText: "validations per month",
      },
    },
    {
      "@type": "Offer",
      name: "Basic",
      price: "19",
      priceCurrency: "USD",
      description: "3,000 validations/month. $0.008 per validation over limit.",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        value: 3000,
        unitText: "validations per month",
      },
    },
    {
      "@type": "Offer",
      name: "Growth",
      price: "79",
      priceCurrency: "USD",
      description: "15,000 validations/month. $0.005 per validation over limit.",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        value: 15000,
        unitText: "validations per month",
      },
    },
    {
      "@type": "Offer",
      name: "Scale",
      price: "199",
      priceCurrency: "USD",
      description: "75,000 validations/month. $0.003 per validation over limit.",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        value: 75000,
        unitText: "validations per month",
      },
    },
  ],
});

export default function PricingPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <div className="max-w-6xl mx-auto px-4 pt-16">
        <h1 className="text-4xl font-bold text-white text-center mb-4">Schema Checker Tool — Plans & Pricing</h1>
        <p className="text-gray-400 text-center mb-2">
          Start free. Only pay for successful validations. Cached results are always free.
        </p>
        <p className="text-center text-sm text-indigo-400 font-medium mb-2">Professional Schema Validation Tool</p>
        <p className="text-center text-sm text-gray-500 mb-12">
          Annual billing available — get 2 months free.
        </p>
      </div>
      <Pricing />
      <Footer />
    </main>
  );
}
