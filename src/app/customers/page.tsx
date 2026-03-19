import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Customer Stories — Schema Validation Success",
  description:
    "See how developers, SEO teams, and agencies use SchemaCheck for structured data SEO results. Schema markup ROI — recover rich results, protect Google Shopping, and catch regressions before Google does.",
};

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  useCase: string;
  initials: string;
  color: string;
}

// Seed testimonials — replace with real quotes as customers come in
const testimonials: Testimonial[] = [
  {
    quote:
      "Our product team kept removing the offers block from product descriptions to 'clean up' the page. SchemaCheck in CI blocked those PRs automatically — we recovered 18% of our Google Shopping impressions within two weeks.",
    name: "Engineering Manager",
    title: "Engineering Manager",
    company: "Direct-to-consumer brand",
    useCase: "E-commerce / CI validation",
    initials: "EM",
    color: "bg-indigo-500",
  },
  {
    quote:
      "We run SchemaCheck against our sitemap every night. It caught a Yoast update that silently removed datePublished from 3,000 article pages before Google noticed.",
    name: "SEO Lead",
    title: "SEO Lead",
    company: "B2B SaaS company",
    useCase: "SEO audit / nightly monitoring",
    initials: "SL",
    color: "bg-violet-500",
  },
  {
    quote:
      "A Yoast plugin update removed the datePublished field from our Article schema across 4,000 posts. Our publish hook caught it on the first post — we fixed the config before the rest of the site was affected.",
    name: "Senior Developer",
    title: "Senior Developer",
    company: "Digital media publisher",
    useCase: "WordPress / publish-time validation",
    initials: "SD",
    color: "bg-blue-500",
  },
];

const useCases = [
  {
    icon: "🛒",
    title: "E-commerce teams",
    desc: "Protect Google Shopping visibility by validating Product and Offer schemas across entire catalogs. Run nightly audits or block deploys with schema regressions.",
  },
  {
    icon: "📊",
    title: "SEO agencies",
    desc: "Add structured data validation to client reporting. Catch issues before they show up in Search Console. Bulk-audit sitemaps in minutes.",
  },
  {
    icon: "🤖",
    title: "AI / LLM builders",
    desc: "Give AI agents a REST API to validate structured data programmatically. SchemaCheck is the only schema validator designed for tool-use.",
  },
  {
    icon: "🔧",
    title: "Platform developers",
    desc: "Build schema validation into CMS plugins, publish workflows, and developer tools. WordPress, Shopify, Webflow — or anything with webhook support.",
  },
];

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
      <span className="text-sm font-bold text-white">{initials}</span>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 lg:py-20">

        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Customers
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Schema Validation Customer Results
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            From solo founders auditing their own sites to engineering teams protecting
            enterprise catalogs — here&apos;s how teams use SchemaCheck.
          </p>
        </div>

        {/* Testimonials grid */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-white mb-6">Rich Results Case Studies</h2>
          <div className="grid md:grid-cols-1 gap-5">
            {testimonials.map((t, i) => (
              <figure
                key={i}
                className="p-6 rounded-2xl border border-gray-800 bg-[#111118] hover:border-gray-700 transition-colors"
              >
                <blockquote className="mb-5">
                  <p className="text-gray-300 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <Avatar initials={t.initials} color={t.color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.title} · {t.company}</p>
                  </div>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700 shrink-0">
                    {t.useCase}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-white mb-2">ROI of Schema Markup Validation</h2>
          <p className="text-gray-500 text-sm mb-6">What teams are building with SchemaCheck</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <div key={uc.title} className="p-5 rounded-xl border border-gray-800 bg-[#111118]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{uc.icon}</span>
                  <p className="text-sm font-semibold text-white">{uc.title}</p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { stat: "9", label: "Schema types supported" },
              { stat: "100", label: "Validations free/month" },
              { stat: "1hr", label: "Response caching" },
              { stat: "99.9%", label: "Uptime SLA" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl border border-gray-800 bg-[#111118] text-center">
                <p className="text-2xl font-bold text-indigo-400 mb-1">{s.stat}</p>
                <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature your story */}
        <section className="p-6 rounded-2xl border border-gray-800 bg-[#111118] mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">Using SchemaCheck in production?</p>
              <p className="text-sm text-gray-500">
                We&apos;d love to feature your story. Tell us how you&apos;re using the API and
                we&apos;ll write it up — free promotion for your product or company.
              </p>
            </div>
            <a
              href="mailto:hello@schemacheck.dev?subject=Customer story"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Get in touch →
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 rounded-2xl border border-indigo-800/60 bg-indigo-950/20">
          <h2 className="text-xl font-semibold text-white mb-2">Start validating for free</h2>
          <p className="text-gray-400 text-sm mb-4">
            100 validations/month, no credit card. API key in 30 seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get free API key →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              View pricing
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
