import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

const APP_URL = "https://schemacheck.dev";

interface RequiredProp {
  property: string;
  type: string;
  description: string;
  richResultRequired?: boolean;
}

interface RecommendedProp {
  property: string;
  type: string;
  description: string;
  richResultRequired?: boolean;
}

interface TypeData {
  slug: string;
  type: string;
  title: string;
  h1?: string;
  metaDescription: string;
  intro: string;
  richResultType: string;
  richResultRequirements: string;
  googleDocsUrl: string;
  requiredProperties: RequiredProp[];
  recommendedProperties: RecommendedProp[];
  exampleJsonLd: object;
  note?: string;
}

const TYPES: Record<string, TypeData> = {
  article: {
    slug: "article",
    type: "Article",
    title: "Article Schema Markup — Validate & Test Article Structured Data",
    h1: "Article Structured Data Guide",
    metaDescription:
      "Validate your article schema markup against Google's rich result requirements. Check required properties (headline, author, datePublished), NewsArticle vs Article schema, and get fix suggestions via API.",
    intro:
      "Article schema markup tells Google what your content is — a news article, blog post, or general editorial piece. With valid Article structured data, Google can display enhanced rich results including headline, author, publication date, and image in Search. Article schema applies to NewsArticle, BlogPosting, TechArticle, and ScholarlyArticle as well.",
    richResultType: "Article rich result",
    richResultRequirements:
      "Required: headline, author, datePublished, image. Google also requires that the article content matches what the schema describes.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/article",
    requiredProperties: [
      {
        property: "headline",
        type: "string",
        description: "The headline of the article. Must not exceed 110 characters.",
        richResultRequired: true,
      },
      {
        property: "author",
        type: "Person or Organization",
        description:
          "The author of the article. Should include name and url nested properties.",
        richResultRequired: true,
      },
      {
        property: "datePublished",
        type: "ISO 8601 date",
        description: "The date the article was first published.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "image",
        type: "URL or ImageObject",
        description: "A representative image for the article. Required for rich results.",
        richResultRequired: true,
      },
      {
        property: "dateModified",
        type: "ISO 8601 date",
        description: "The most recent modification date.",
      },
      {
        property: "publisher",
        type: "Organization",
        description:
          "The publisher, with name and logo nested properties.",
      },
      {
        property: "description",
        type: "string",
        description: "A short description or summary of the article.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How to validate JSON-LD structured data with an API",
      author: { "@type": "Person", name: "Jane Smith", url: "https://example.com/authors/jane" },
      datePublished: "2026-03-18",
      dateModified: "2026-03-18",
      image: "https://example.com/images/article-hero.jpg",
      publisher: {
        "@type": "Organization",
        name: "Example Publishing",
        logo: { "@type": "ImageObject", url: "https://example.com/logo.png" },
      },
      description:
        "A practical guide to validating Schema.org JSON-LD structured data programmatically.",
    },
  },

  product: {
    slug: "product",
    type: "Product",
    title: "Product Schema Markup — Validate Product Structured Data",
    h1: "Product Schema Markup Guide",
    metaDescription:
      "Validate product schema markup with examples. What is product schema and how does it work? Check required properties, offers, pricing, availability, and product schema generator via API.",
    intro:
      "Product schema markup enables rich results in Google Search including pricing, availability, ratings, and review snippets. E-commerce sites, marketplaces, and product review pages use Product structured data to unlock enhanced listings. A Product schema with valid Offer and AggregateRating properties can display star ratings and pricing directly in search results.",
    richResultType: "Product snippet, merchant listing, product rich result",
    richResultRequirements:
      "Required for rich results: name, image, and offers (with price and priceCurrency). AggregateRating adds star ratings.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/product",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the product.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "image",
        type: "URL or ImageObject",
        description: "An image of the product. Required for rich results.",
        richResultRequired: true,
      },
      {
        property: "offers",
        type: "Offer",
        description:
          "Pricing and availability. Required for rich results. Include price, priceCurrency, and availability.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "string",
        description: "A description of the product.",
      },
      {
        property: "sku",
        type: "string",
        description: "The Stock Keeping Unit (SKU) identifier.",
      },
      {
        property: "brand",
        type: "Organization",
        description: "The brand of the product.",
      },
      {
        property: "aggregateRating",
        type: "AggregateRating",
        description:
          "The overall rating. Include ratingValue and reviewCount to enable star ratings in search.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Wireless Ergonomic Mouse",
      description: "A comfortable wireless mouse for long work sessions.",
      image: "https://example.com/images/mouse.jpg",
      brand: { "@type": "Organization", name: "ErgoTech" },
      sku: "ET-MOUSE-001",
      offers: {
        "@type": "Offer",
        price: "49.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://example.com/products/wireless-mouse",
      },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "238" },
    },
  },

  "local-business": {
    slug: "local-business",
    type: "LocalBusiness",
    title: "Local Business Schema — Validate LocalBusiness Structured Data",
    h1: "Local Business Schema Markup Guide",
    metaDescription:
      "Complete schema for local business — validate local business schema markup, schema markup for local SEO, and get fix suggestions via API. Check address, opening hours, and required properties.",
    intro:
      "LocalBusiness schema markup helps Google understand your physical location, hours, and contact details. It applies to all brick-and-mortar businesses including restaurants, stores, hotels, medical offices, and service providers. Valid LocalBusiness structured data can surface your hours, address, and phone number directly in search results and the Knowledge Panel.",
    richResultType: "Business info panel, local knowledge panel",
    richResultRequirements:
      "Required: name and address (PostalAddress with streetAddress, addressLocality, postalCode, addressCountry).",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/local-business",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the business.",
        richResultRequired: true,
      },
      {
        property: "address",
        type: "PostalAddress",
        description:
          "The physical address. Include streetAddress, addressLocality, addressRegion, postalCode, and addressCountry.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "telephone",
        type: "string",
        description: "The business phone number in international format.",
      },
      {
        property: "openingHoursSpecification",
        type: "OpeningHoursSpecification",
        description: "Opening hours. Include dayOfWeek, opens, and closes.",
      },
      {
        property: "url",
        type: "URL",
        description: "The business website URL.",
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "A photo of the business.",
      },
      {
        property: "priceRange",
        type: "string",
        description: 'Price range indicator (e.g. "$", "$$", "$$$").',
      },
      {
        property: "aggregateRating",
        type: "AggregateRating",
        description: "Overall rating from reviews.",
      },
      {
        property: "geo",
        type: "GeoCoordinates",
        description: "Latitude and longitude coordinates.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: "The Golden Fork",
      address: {
        "@type": "PostalAddress",
        streetAddress: "123 Main Street",
        addressLocality: "San Francisco",
        addressRegion: "CA",
        postalCode: "94102",
        addressCountry: "US",
      },
      telephone: "+14155551234",
      url: "https://example.com",
      image: "https://example.com/images/restaurant.jpg",
      priceRange: "$$",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "11:00",
          closes: "22:00",
        },
      ],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.5", reviewCount: "312" },
    },
  },

  organization: {
    slug: "organization",
    type: "Organization",
    title: "Organization Schema — Validate Organization Structured Data",
    h1: "Organization Schema Markup Guide",
    metaDescription:
      "Validate organization schema markup with examples. Check required properties, logo, and sameAs links for Knowledge Panel eligibility. Organization schema example and fix suggestions via API.",
    intro:
      "Organization schema markup tells Google about your company or institution — its name, logo, website, and authoritative links. Valid Organization structured data contributes to your Knowledge Panel appearance in Google Search. It applies to companies, nonprofits, educational institutions, government organizations, and any other type of organization.",
    richResultType: "Organization Knowledge Panel",
    richResultRequirements:
      "Required: name, url, and logo (ImageObject with url). sameAs with authoritative links (Wikipedia, Wikidata, social profiles) strengthens Knowledge Panel eligibility.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/organization",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The legal or commonly-used name of the organization.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "url",
        type: "URL",
        description: "The organization's official website.",
        richResultRequired: true,
      },
      {
        property: "logo",
        type: "ImageObject",
        description: "The organization's logo. Required for Knowledge Panel.",
        richResultRequired: true,
      },
      {
        property: "sameAs",
        type: "URL array",
        description:
          "URLs on authoritative sites that identify this organization (Wikipedia, LinkedIn, social profiles).",
      },
      {
        property: "contactPoint",
        type: "ContactPoint",
        description: "Contact information with telephone and contactType.",
      },
      {
        property: "address",
        type: "PostalAddress",
        description: "The organization's physical address.",
      },
      {
        property: "description",
        type: "string",
        description: "A short description of the organization.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Acme Corporation",
      url: "https://example.com",
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
        width: 200,
        height: 60,
      },
      sameAs: [
        "https://www.linkedin.com/company/acme",
        "https://twitter.com/acme",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-800-555-0100",
        contactType: "customer service",
      },
      description: "Acme Corporation makes innovative widgets for professionals.",
    },
  },

  breadcrumb: {
    slug: "breadcrumb",
    type: "BreadcrumbList",
    title: "Breadcrumb Schema — Validate BreadcrumbList Structured Data",
    h1: "Breadcrumb Schema Markup Guide",
    metaDescription:
      "Validate breadcrumb structured data against Google's rich result requirements. Check BreadcrumbList itemListElement structure, position values, and get fix suggestions via API.",
    intro:
      "BreadcrumbList schema markup enables Google to show your site's navigation path directly in search results — the URL line in a search result becomes a readable path like 'example.com > Products > Widgets'. This helps users understand where a page sits in your site hierarchy before they click. Valid BreadcrumbList structured data requires a correctly ordered itemListElement array.",
    richResultType: "Breadcrumb trail in search result URL",
    richResultRequirements:
      "Required: itemListElement array with ListItem objects, each containing position (integer), name (string), and item (URL).",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb",
    requiredProperties: [
      {
        property: "itemListElement",
        type: "ListItem array",
        description:
          "The ordered breadcrumb items. Each ListItem must have position (1, 2, 3…), name (text label), and item (URL).",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://example.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: "https://example.com/products",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Wireless Ergonomic Mouse",
          item: "https://example.com/products/wireless-mouse",
        },
      ],
    },
  },

  website: {
    slug: "website",
    type: "WebSite",
    title: "Website Schema — Validate WebSite Structured Data",
    h1: "WebSite Schema Markup Guide",
    metaDescription:
      "Validate website structured data against Google's Sitelinks Searchbox requirements. Check WebSite schema required properties, SearchAction configuration, and get fix suggestions via API.",
    intro:
      "WebSite schema markup on your homepage enables the Sitelinks Searchbox in Google Search — the search input that sometimes appears under your site listing, letting users search your site directly from the search results page. It also helps Google associate your site name with your domain. Every site should have a WebSite schema on its homepage.",
    richResultType: "Sitelinks Searchbox",
    richResultRequirements:
      "Required: name and url. For Sitelinks Searchbox: add potentialAction as a SearchAction with target URL template and query-input.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the website.",
        richResultRequired: true,
      },
      {
        property: "url",
        type: "URL",
        description: "The URL of the website's homepage.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "potentialAction",
        type: "SearchAction",
        description:
          "A SearchAction that enables the Sitelinks Searchbox. Requires target (URL template) and query-input.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "string",
        description: "A description of the website.",
      },
      {
        property: "sameAs",
        type: "URL array",
        description: "URLs that verify this website's identity on other platforms.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Example",
      url: "https://example.com",
      description: "The official website of Example.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://example.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  },

  faq: {
    slug: "faq",
    type: "FAQPage",
    title: "FAQ Schema — Validate FAQPage Structured Data",
    h1: "FAQ Schema Markup Guide",
    metaDescription:
      "Validate FAQPage structured data against Google's requirements. FAQ schema best practices — check mainEntity structure, Question and Answer format, and rich result eligibility via API.",
    intro:
      "FAQPage schema markup structures your question-and-answer content for Google Search. As of 2024, Google restricts FAQPage rich results to government and health websites — other sites may still use this schema for semantic markup but will not receive FAQ rich results. Valid FAQPage structured data requires a mainEntity array with properly formatted Question and Answer objects.",
    richResultType: "FAQ dropdown (restricted to gov/health since 2024)",
    richResultRequirements:
      "Required: mainEntity array with Question objects, each having name (question text) and acceptedAnswer with text. Rich results only for gov/health domains.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
    requiredProperties: [
      {
        property: "mainEntity",
        type: "Question array",
        description:
          "The list of Q&A pairs. Each Question must have name (the question) and acceptedAnswer with text (the answer). Answers can include HTML.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is SchemaCheck?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SchemaCheck is a REST API for validating Schema.org JSON-LD structured data against Google's rich result requirements.",
          },
        },
        {
          "@type": "Question",
          name: "How many validations are included in the free plan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The free plan includes 100 validations per month. No credit card required.",
          },
        },
      ],
    },
    note:
      "As of 2024, Google restricts FAQPage rich results to government and health websites. Other sites can still use FAQPage for semantic markup purposes.",
  },

  // ── Tier 2 ────────────────────────────────────────────────────────────────

  review: {
    slug: "review",
    type: "Review",
    title: "Review Schema — Validate Review Structured Data",
    h1: "Schema Markup for Reviews",
    metaDescription:
      "Validate review schema markup against Google's review snippet requirements. Check Review and AggregateRating structured data — required properties, rating values, and fix suggestions via API.",
    intro:
      "Review and AggregateRating schema markup enables star ratings to appear directly in Google Search results — one of the most impactful rich results for click-through rates. AggregateRating summarizes overall scores across many reviews, while individual Review objects describe a single reviewer's opinion. Both types require an itemReviewed subject (a Product, Book, Recipe, etc.).",
    richResultType: "Star rating snippet in search results",
    richResultRequirements:
      "Required: itemReviewed (the thing being reviewed), reviewRating with ratingValue, and author. AggregateRating requires ratingValue and reviewCount or ratingCount.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/review-snippet",
    requiredProperties: [
      {
        property: "itemReviewed",
        type: "Thing",
        description: "The item being reviewed (e.g. Product, Book, Recipe, LocalBusiness).",
        richResultRequired: true,
      },
      {
        property: "reviewRating",
        type: "Rating",
        description: "The rating given in this review. Include ratingValue (number).",
        richResultRequired: true,
      },
      {
        property: "author",
        type: "Person or Organization",
        description: "The author of the review.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "name",
        type: "string",
        description: "The title or headline of the review.",
      },
      {
        property: "reviewBody",
        type: "string",
        description: "The full text of the review.",
      },
      {
        property: "datePublished",
        type: "ISO 8601 date",
        description: "The date the review was published.",
      },
      {
        property: "publisher",
        type: "Organization",
        description: "The publisher of the review.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@type": "Product",
        name: "Wireless Ergonomic Mouse",
        image: "https://example.com/images/mouse.jpg",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
        worstRating: "1",
      },
      name: "Best mouse I've ever used",
      author: { "@type": "Person", name: "Jane Smith" },
      datePublished: "2026-03-18",
      reviewBody:
        "Incredibly comfortable for long work sessions. The battery life is excellent and the scroll wheel is precise.",
    },
  },

  recipe: {
    slug: "recipe",
    type: "Recipe",
    title: "Recipe Schema — Validate Recipe Structured Data",
    h1: "Recipe Structured Data Guide",
    metaDescription:
      "Validate recipe structured data for Google rich results. Check required properties (name, image, recipeInstructions), cooking times, ingredient lists. Recipe rich results guide via API.",
    intro:
      "Recipe schema markup unlocks rich recipe cards in Google Search — complete with images, star ratings, cook time, and calorie information. Recipe structured data is one of the most visually distinctive rich results in Google Search, making it highly valuable for food blogs and cooking websites. Valid Recipe schema requires a name, at least one image, and structured recipe instructions.",
    richResultType: "Recipe rich card with image, ratings, and cook time",
    richResultRequirements:
      "Required: name, image (URL or ImageObject array), and recipeInstructions. Google also recommends author, aggregateRating, and nutrition for full rich result display.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/recipe",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the recipe.",
        richResultRequired: true,
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "An image of the finished dish. Required for rich results.",
        richResultRequired: true,
      },
      {
        property: "recipeInstructions",
        type: "HowToStep array or string",
        description:
          "Step-by-step cooking instructions. Use HowToStep objects for best results.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "author",
        type: "Person or Organization",
        description: "The author or creator of the recipe.",
      },
      {
        property: "datePublished",
        type: "ISO 8601 date",
        description: "The date the recipe was published.",
      },
      {
        property: "description",
        type: "string",
        description: "A short description of the dish.",
      },
      {
        property: "prepTime",
        type: "ISO 8601 duration",
        description: "Preparation time (e.g. PT15M for 15 minutes).",
      },
      {
        property: "cookTime",
        type: "ISO 8601 duration",
        description: "Cook time (e.g. PT30M for 30 minutes).",
      },
      {
        property: "totalTime",
        type: "ISO 8601 duration",
        description: "Total time including prep and cook.",
      },
      {
        property: "recipeYield",
        type: "string",
        description: "The quantity produced (e.g. '4 servings').",
      },
      {
        property: "recipeIngredient",
        type: "string array",
        description: "List of ingredients with quantities.",
      },
      {
        property: "aggregateRating",
        type: "AggregateRating",
        description: "Overall recipe rating. Required for star ratings in rich results.",
        richResultRequired: true,
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: "Classic Spaghetti Carbonara",
      image: "https://example.com/images/carbonara.jpg",
      author: { "@type": "Person", name: "Maria Rossi" },
      datePublished: "2026-03-18",
      description: "A traditional Roman pasta dish made with eggs, cheese, and guanciale.",
      prepTime: "PT10M",
      cookTime: "PT20M",
      totalTime: "PT30M",
      recipeYield: "4 servings",
      recipeIngredient: [
        "400g spaghetti",
        "200g guanciale",
        "4 egg yolks",
        "100g Pecorino Romano",
        "Black pepper to taste",
      ],
      recipeInstructions: [
        { "@type": "HowToStep", text: "Cook spaghetti in salted boiling water until al dente." },
        { "@type": "HowToStep", text: "Fry guanciale until crispy. Remove from heat." },
        { "@type": "HowToStep", text: "Mix egg yolks and grated Pecorino Romano in a bowl." },
        {
          "@type": "HowToStep",
          text: "Drain pasta, toss with guanciale, then stir in egg mixture off heat.",
        },
      ],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "547" },
    },
  },

  event: {
    slug: "event",
    type: "Event",
    title: "Event Schema — Validate Event Structured Data",
    h1: "Event Structured Data Guide",
    metaDescription:
      "Validate Google event structured data against rich result requirements. Check Event schema required properties (name, startDate, location), eventStatus, and get fix suggestions via API.",
    intro:
      "Event schema markup enables Google to display your events in dedicated event rich results — including event name, date, time, and location directly in search. Events can also appear in Google Events search panels. Valid Event structured data requires a name, startDate, and location. Sub-types include MusicEvent, SportsEvent, and EducationEvent.",
    richResultType: "Event listing in Google Search and Google Events",
    richResultRequirements:
      "Required: name, startDate (ISO 8601 with time and timezone), and location (Place with name and address). eventStatus and eventAttendanceMode are strongly recommended.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/event",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the event.",
        richResultRequired: true,
      },
      {
        property: "startDate",
        type: "ISO 8601 datetime",
        description:
          "The start date and time (e.g. '2026-04-15T19:00:00-05:00'). Include timezone.",
        richResultRequired: true,
      },
      {
        property: "location",
        type: "Place or VirtualLocation",
        description: "Where the event takes place. Include name and address.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "endDate",
        type: "ISO 8601 datetime",
        description: "The end date and time of the event.",
      },
      {
        property: "eventStatus",
        type: "EventStatusType URL",
        description:
          "Event status (e.g. https://schema.org/EventScheduled, EventCancelled, EventPostponed).",
      },
      {
        property: "eventAttendanceMode",
        type: "EventAttendanceModeEnumeration URL",
        description:
          "Attendance mode: OfflineEventAttendanceMode, OnlineEventAttendanceMode, or MixedEventAttendanceMode.",
      },
      {
        property: "description",
        type: "string",
        description: "A description of the event.",
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "An image for the event.",
      },
      {
        property: "offers",
        type: "Offer",
        description: "Ticketing information including price and availability.",
      },
      {
        property: "performer",
        type: "Person or Organization",
        description: "A performer at the event.",
      },
      {
        property: "organizer",
        type: "Person or Organization",
        description: "The organizer of the event.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      name: "Jazz in the Park",
      startDate: "2026-07-04T18:00:00-05:00",
      endDate: "2026-07-04T22:00:00-05:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: "Riverside Park Amphitheater",
        address: {
          "@type": "PostalAddress",
          streetAddress: "456 Park Drive",
          addressLocality: "Chicago",
          addressRegion: "IL",
          postalCode: "60601",
          addressCountry: "US",
        },
      },
      image: "https://example.com/images/jazz-event.jpg",
      description: "An evening of live jazz music in Riverside Park.",
      offers: {
        "@type": "Offer",
        price: "25",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://example.com/events/jazz-in-the-park",
      },
      organizer: { "@type": "Organization", name: "Chicago Jazz Society", url: "https://example.com" },
    },
  },

  video: {
    slug: "video",
    type: "VideoObject",
    title: "Video Schema — Validate VideoObject Structured Data",
    h1: "Video Schema Markup Guide",
    metaDescription:
      "Validate video structured data markup against Google's rich result requirements. Check VideoObject required properties (name, thumbnailUrl, uploadDate), video schema markup, and get fix suggestions.",
    intro:
      "VideoObject schema markup helps Google understand and index your video content. With valid VideoObject structured data, your videos can appear in Google Video Search, video rich results in web search, and Google Discover. This is essential for any page that embeds or hosts video content. The Clip sub-type can mark specific key moments within a video.",
    richResultType: "Video rich result, video carousel, key moments",
    richResultRequirements:
      "Required: name, description, thumbnailUrl (URL accessible to Googlebot), and uploadDate. contentUrl or embedUrl is strongly recommended.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/video",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The title of the video.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "string",
        description: "A description of the video content.",
        richResultRequired: true,
      },
      {
        property: "thumbnailUrl",
        type: "URL",
        description:
          "URL of the video thumbnail image. Must be accessible to Googlebot (200x200px minimum).",
        richResultRequired: true,
      },
      {
        property: "uploadDate",
        type: "ISO 8601 date",
        description: "The date the video was first published.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "contentUrl",
        type: "URL",
        description: "Direct URL to the video file.",
      },
      {
        property: "embedUrl",
        type: "URL",
        description: "URL of the embedded video player.",
      },
      {
        property: "duration",
        type: "ISO 8601 duration",
        description: "Duration of the video (e.g. PT4M30S for 4 min 30 sec).",
      },
      {
        property: "expires",
        type: "ISO 8601 datetime",
        description: "The date after which the video is no longer available.",
      },
      {
        property: "interactionStatistic",
        type: "InteractionCounter",
        description: "View count. Use WatchAction with userInteractionCount.",
      },
      {
        property: "publisher",
        type: "Organization",
        description: "The publisher of the video.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "How to Validate Schema.org JSON-LD in 5 Minutes",
      description:
        "A step-by-step tutorial on validating structured data markup using the SchemaCheck API.",
      thumbnailUrl: "https://example.com/images/video-thumbnail.jpg",
      uploadDate: "2026-03-18",
      duration: "PT5M20S",
      contentUrl: "https://example.com/videos/schema-validation-tutorial.mp4",
      embedUrl: "https://example.com/embed/schema-validation-tutorial",
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: { "@type": "WatchAction" },
        userInteractionCount: 12450,
      },
      publisher: {
        "@type": "Organization",
        name: "SchemaCheck",
        logo: { "@type": "ImageObject", url: "https://schemacheck.dev/logo.png" },
      },
    },
  },

  "software-app": {
    slug: "software-app",
    type: "SoftwareApplication",
    title: "Software Application Schema — Validate SoftwareApplication Structured Data",
    metaDescription:
      "Validate SoftwareApplication structured data against Google's app rich result requirements. Check required properties (name, applicationCategory, operatingSystem), ratings, pricing via API.",
    intro:
      "SoftwareApplication schema markup enables app rich results in Google Search — showing your app's rating, price, and operating system compatibility directly in search results. This applies to web apps, mobile apps, video games, and desktop software. Sub-types include WebApplication, MobileApplication, and VideoGame. Valid markup can significantly improve click-through rates for app landing pages.",
    richResultType: "App rich result with rating and pricing",
    richResultRequirements:
      "Required: name, applicationCategory, and operatingSystem. offers and aggregateRating are needed for pricing and star ratings in rich results.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/software-app",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the application.",
        richResultRequired: true,
      },
      {
        property: "applicationCategory",
        type: "string",
        description:
          "The application category (e.g. GameApplication, BusinessApplication, EducationApplication).",
        richResultRequired: true,
      },
      {
        property: "operatingSystem",
        type: "string",
        description: "The OS required (e.g. 'Windows 10', 'Android 8+', 'iOS 15+', 'Web').",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "offers",
        type: "Offer",
        description: "Pricing information. Set price to '0' for free apps.",
        richResultRequired: true,
      },
      {
        property: "aggregateRating",
        type: "AggregateRating",
        description: "Overall user rating. Required for star ratings in rich results.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "string",
        description: "A description of the application.",
      },
      {
        property: "url",
        type: "URL",
        description: "The app's landing page or download page.",
      },
      {
        property: "downloadUrl",
        type: "URL",
        description: "Direct download or app store URL.",
      },
      {
        property: "softwareVersion",
        type: "string",
        description: "The current version of the application.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: "SchemaCheck",
      applicationCategory: "BusinessApplication",
      operatingSystem: "iOS 15+, Android 10+",
      description: "Validate Schema.org JSON-LD structured data from your mobile device.",
      url: "https://schemacheck.dev",
      downloadUrl: "https://apps.apple.com/app/schemacheck",
      softwareVersion: "2.1.0",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "1204" },
    },
  },

  "job-posting": {
    slug: "job-posting",
    type: "JobPosting",
    title: "Job Posting Schema — Validate JobPosting Structured Data",
    h1: "Job Schema Markup Guide",
    metaDescription:
      "Validate Google job posting schema against rich result requirements. Check JobPosting required properties (title, description, hiringOrganization, jobLocation), salary, and get fix suggestions.",
    intro:
      "JobPosting schema markup enables Google for Jobs — a rich job search experience integrated directly into Google Search. Valid JobPosting structured data can display your job listing with title, company, location, salary, and application deadline in Google's job search results. This is essential for any site that posts job listings, whether a company career page or a job board.",
    richResultType: "Google for Jobs listing",
    richResultRequirements:
      "Required: title, description (HTML allowed), hiringOrganization (with name), jobLocation (Place with address), and datePosted. directApply can increase visibility.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/job-posting",
    requiredProperties: [
      {
        property: "title",
        type: "string",
        description: "The job title. Avoid non-standard titles.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "HTML string",
        description: "Full job description. HTML is allowed.",
        richResultRequired: true,
      },
      {
        property: "hiringOrganization",
        type: "Organization",
        description: "The company offering the job. Must include name.",
        richResultRequired: true,
      },
      {
        property: "jobLocation",
        type: "Place",
        description: "Location of the job. Include address.",
        richResultRequired: true,
      },
      {
        property: "datePosted",
        type: "ISO 8601 date",
        description: "The date the job was posted.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "validThrough",
        type: "ISO 8601 datetime",
        description: "The date the job posting expires.",
      },
      {
        property: "employmentType",
        type: "string",
        description:
          "Employment type: FULL_TIME, PART_TIME, CONTRACTOR, TEMPORARY, INTERN, VOLUNTEER, PER_DIEM, OTHER.",
      },
      {
        property: "baseSalary",
        type: "MonetaryAmount",
        description:
          "Salary range. Include minValue, maxValue, currency, and unitText (HOUR, WEEK, MONTH, YEAR).",
      },
      {
        property: "jobLocationType",
        type: "string",
        description: "Set to TELECOMMUTE for remote work.",
      },
      {
        property: "applicantLocationRequirements",
        type: "AdministrativeArea",
        description: "Geographic restrictions for remote roles.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Senior Software Engineer",
      description:
        "<p>Join our team as a Senior Software Engineer. You will design and build scalable backend systems.</p><ul><li>5+ years of experience with TypeScript or Go</li><li>Experience with cloud infrastructure (AWS/GCP)</li></ul>",
      hiringOrganization: {
        "@type": "Organization",
        name: "Acme Corporation",
        sameAs: "https://example.com",
        logo: "https://example.com/logo.png",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: "100 Innovation Drive",
          addressLocality: "Austin",
          addressRegion: "TX",
          postalCode: "78701",
          addressCountry: "US",
        },
      },
      datePosted: "2026-03-18",
      validThrough: "2026-06-30",
      employmentType: "FULL_TIME",
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: { "@type": "QuantitativeValue", minValue: 140000, maxValue: 180000, unitText: "YEAR" },
      },
    },
  },

  course: {
    slug: "course",
    type: "Course",
    title: "Course Schema — Validate Course Structured Data",
    metaDescription:
      "Validate Course structured data against Google's course rich result requirements. Check required properties (name, description, provider), hasCourseInstance, and get fix suggestions via API.",
    intro:
      "Course schema markup helps your educational content appear in Google's course rich results — showing course name, provider, and key details in search. Course structured data is used by online learning platforms, universities, and anyone offering structured educational content. The CourseInstance sub-type adds scheduling and format details for specific course runs.",
    richResultType: "Course info rich result",
    richResultRequirements:
      "Required: name, description, and provider (Organization with name). Add hasCourseInstance for specific course runs with dates and format.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/course-info",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the course.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "string",
        description: "A description of the course content and objectives.",
        richResultRequired: true,
      },
      {
        property: "provider",
        type: "Organization",
        description: "The institution or platform offering the course.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "url",
        type: "URL",
        description: "The course enrollment or landing page URL.",
      },
      {
        property: "hasCourseInstance",
        type: "CourseInstance",
        description:
          "A specific scheduled run of the course. Include courseMode, startDate, endDate, and location.",
      },
      {
        property: "courseCode",
        type: "string",
        description: "The course identifier or code.",
      },
      {
        property: "educationalLevel",
        type: "string or URL",
        description: "Difficulty level (e.g. Beginner, Intermediate, Advanced).",
      },
      {
        property: "offers",
        type: "Offer",
        description: "Pricing information for the course.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Introduction to Structured Data and SEO",
      description:
        "Learn how to implement Schema.org structured data to improve your search visibility and unlock Google rich results.",
      provider: { "@type": "Organization", name: "SchemaCheck Academy", url: "https://schemacheck.dev" },
      url: "https://schemacheck.dev/courses/structured-data-seo",
      courseCode: "SD-101",
      educationalLevel: "Beginner",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
        courseWorkload: "PT5H",
      },
      offers: { "@type": "Offer", price: "49", priceCurrency: "USD" },
    },
  },

  carousel: {
    slug: "carousel",
    type: "ItemList",
    title: "ItemList Schema — Validate Carousel Structured Data",
    metaDescription:
      "Validate ItemList structured data for Google carousel rich results. Check itemListElement structure, ListItem position values, and get fix suggestions via API.",
    intro:
      "ItemList schema markup enables carousel-style rich results in Google Search — showing a horizontal list of items (articles, recipes, movies, etc.) for a single search query. Carousels are typically used on list pages or summary pages that link to individual item detail pages. Valid ItemList structured data requires an ordered itemListElement array.",
    richResultType: "Carousel rich result (horizontal list in search)",
    richResultRequirements:
      "Required: itemListElement array with ListItem objects, each containing position and url (or item with url). Each linked page should have its own schema markup for the full rich result.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/carousel",
    requiredProperties: [
      {
        property: "itemListElement",
        type: "ListItem array",
        description:
          "The ordered list of items. Each ListItem requires position (1, 2, 3…) and url or item (with @id or url).",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the list.",
      },
      {
        property: "description",
        type: "string",
        description: "A description of the list.",
      },
      {
        property: "numberOfItems",
        type: "number",
        description: "The total number of items in the list.",
      },
      {
        property: "url",
        type: "URL",
        description: "The URL of the page containing this list.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Top 5 Pasta Recipes",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          url: "https://example.com/recipes/carbonara",
        },
        {
          "@type": "ListItem",
          position: 2,
          url: "https://example.com/recipes/amatriciana",
        },
        {
          "@type": "ListItem",
          position: 3,
          url: "https://example.com/recipes/cacio-e-pepe",
        },
      ],
    },
  },

  "qa-page": {
    slug: "qa-page",
    type: "QAPage",
    title: "QAPage Schema — Validate Q&A Structured Data",
    metaDescription:
      "Validate QAPage structured data against Google's Q&A rich result requirements. Check mainEntity Question and Answer format, acceptedAnswer structure, and get fix suggestions via API.",
    intro:
      "QAPage schema markup is used on pages where a single question has been asked and answered by the community — such as Stack Overflow questions, Quora answers, or forum threads. Unlike FAQPage (which lists multiple Q&A pairs), QAPage is for a single question with one or more community answers. Valid QAPage structured data can generate Q&A rich results showing the top answer directly in search.",
    richResultType: "Q&A rich result with question and top answer",
    richResultRequirements:
      "Required: mainEntity as a Question with name (question text) and acceptedAnswer or suggestedAnswer with text.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/qapage",
    requiredProperties: [
      {
        property: "mainEntity",
        type: "Question",
        description:
          "The question being answered. Must be a Question with name (question text) and at least one answer.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "name",
        type: "string",
        description: "The page title.",
      },
      {
        property: "description",
        type: "string",
        description: "A brief description of the page.",
      },
      {
        property: "url",
        type: "URL",
        description: "The canonical URL of the Q&A page.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "QAPage",
      mainEntity: {
        "@type": "Question",
        name: "How do I validate Schema.org JSON-LD structured data?",
        text: "I need to check if my structured data is valid and eligible for Google rich results.",
        answerCount: 2,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the SchemaCheck API to validate your JSON-LD. Send a POST request with your schema and receive a detailed validation report including required properties, rich result eligibility, and fix suggestions.",
          upvoteCount: 42,
          url: "https://example.com/questions/validate-schema#answer-1",
        },
        suggestedAnswer: [
          {
            "@type": "Answer",
            text: "You can also use Google's Rich Results Test tool at search.google.com/test/rich-results for a visual preview.",
            upvoteCount: 28,
          },
        ],
      },
    },
  },

  "product-variants": {
    slug: "product-variants",
    type: "ProductGroup",
    title: "ProductGroup Schema Validation API",
    metaDescription:
      "Validate ProductGroup JSON-LD structured data against Google's product variants requirements. Check required properties, variants, and get fix suggestions via API.",
    intro:
      "ProductGroup schema markup enables product variant rich results in Google Shopping — allowing you to represent a product with multiple variants (different sizes, colors, or configurations) as a single structured entity. A ProductGroup links to individual Product variants via hasVariant and specifies which attributes vary via variesBy.",
    richResultType: "Product variants rich result in Google Shopping",
    richResultRequirements:
      "Required: name, hasVariant (array of Product schemas), and variesBy (the property that differs between variants, e.g. 'size', 'color').",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/product-variants",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the product group.",
        richResultRequired: true,
      },
      {
        property: "hasVariant",
        type: "Product array",
        description: "The individual product variants. Each variant is a Product.",
        richResultRequired: true,
      },
      {
        property: "variesBy",
        type: "string",
        description: "The property that differs between variants (e.g. 'size', 'color').",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "description",
        type: "string",
        description: "A description of the product group.",
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "A representative image for the product group.",
      },
      {
        property: "brand",
        type: "Organization",
        description: "The brand of the product.",
      },
      {
        property: "sku",
        type: "string",
        description: "A base SKU for the product group.",
      },
      {
        property: "url",
        type: "URL",
        description: "The canonical URL of the product group page.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      name: "Ergonomic Office Chair",
      description: "Adjustable office chair available in three colors.",
      url: "https://example.com/products/ergonomic-chair",
      variesBy: "color",
      hasVariant: [
        {
          "@type": "Product",
          name: "Ergonomic Office Chair — Black",
          color: "Black",
          sku: "CHAIR-BLK",
          offers: { "@type": "Offer", price: "299", priceCurrency: "USD", availability: "https://schema.org/InStock" },
        },
        {
          "@type": "Product",
          name: "Ergonomic Office Chair — Gray",
          color: "Gray",
          sku: "CHAIR-GRY",
          offers: { "@type": "Offer", price: "299", priceCurrency: "USD", availability: "https://schema.org/InStock" },
        },
      ],
    },
  },

  // ── Tier 3 ────────────────────────────────────────────────────────────────

  book: {
    slug: "book",
    type: "Book",
    title: "Book Schema Validation API",
    metaDescription:
      "Validate Book JSON-LD structured data against Google's book rich result requirements. Check required properties, author, ISBN, and get fix suggestions via API.",
    intro:
      "Book schema markup enables Google to display book rich results — allowing users to find a book across multiple retailers and formats (print, ebook, audiobook) directly in search. Valid Book structured data helps Google associate your page with a specific work and can trigger book-specific knowledge panels. The Audiobook sub-type extends Book for audio format editions.",
    richResultType: "Book actions — shop, borrow, or read",
    richResultRequirements:
      "Required: name and author. isbn (ISBN-13) is critical for Google to identify the specific edition. workExample links to specific editions.",
    googleDocsUrl: "https://developers.google.com/search/docs/appearance/structured-data/book",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The title of the book.",
        richResultRequired: true,
      },
      {
        property: "author",
        type: "Person or Organization",
        description: "The author of the book.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "isbn",
        type: "string",
        description: "The ISBN-13 of this edition. Critical for Google to identify the book.",
        richResultRequired: true,
      },
      {
        property: "url",
        type: "URL",
        description: "A URL about the book.",
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "The book cover image.",
      },
      {
        property: "description",
        type: "string",
        description: "A synopsis or description of the book.",
      },
      {
        property: "workExample",
        type: "Book array",
        description:
          "Specific editions of this work (print, ebook, audiobook). Each should have isbn, bookFormat, and potentialAction.",
      },
      {
        property: "potentialAction",
        type: "ReadAction",
        description: "A link to read or purchase the book.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Book",
      name: "The Structured Data Handbook",
      author: { "@type": "Person", name: "Jane Smith" },
      isbn: "978-3-16-148410-0",
      description: "A comprehensive guide to Schema.org structured data and SEO.",
      image: "https://example.com/images/book-cover.jpg",
      url: "https://example.com/books/structured-data-handbook",
      workExample: [
        {
          "@type": "Book",
          bookFormat: "https://schema.org/Paperback",
          isbn: "978-3-16-148410-0",
          potentialAction: {
            "@type": "ReadAction",
            target: { "@type": "EntryPoint", urlTemplate: "https://example.com/buy/paperback" },
          },
        },
        {
          "@type": "Book",
          bookFormat: "https://schema.org/EBook",
          isbn: "978-3-16-148411-7",
          potentialAction: {
            "@type": "ReadAction",
            target: { "@type": "EntryPoint", urlTemplate: "https://example.com/buy/ebook" },
          },
        },
      ],
    },
  },

  dataset: {
    slug: "dataset",
    type: "Dataset",
    title: "Dataset Schema Validation API",
    metaDescription:
      "Validate Dataset JSON-LD structured data against Google's dataset rich result requirements. Check required properties, description, distribution, and get fix suggestions via API.",
    intro:
      "Dataset schema markup enables your data to appear in Google Dataset Search — a specialized search tool for finding datasets. Scientists, researchers, journalists, and developers use Google Dataset Search to find public data. Valid Dataset structured data requires a name and description, with distribution details that help users access the actual data files.",
    richResultType: "Dataset listing in Google Dataset Search",
    richResultRequirements:
      "Required: name and description. distribution with DataDownload objects (contentUrl and encodingFormat) allows direct data access.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/dataset",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the dataset.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "string",
        description: "A summary describing the dataset's contents, purpose, and methodology.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "url",
        type: "URL",
        description: "The URL of the dataset landing page.",
      },
      {
        property: "creator",
        type: "Person or Organization",
        description: "The creator or author of the dataset.",
      },
      {
        property: "license",
        type: "URL",
        description: "The license under which the dataset is released.",
      },
      {
        property: "keywords",
        type: "string array",
        description: "Keywords or tags that describe the dataset.",
      },
      {
        property: "distribution",
        type: "DataDownload array",
        description:
          "How to access the dataset files. Each DataDownload should have contentUrl and encodingFormat.",
      },
      {
        property: "variableMeasured",
        type: "string or PropertyValue",
        description: "The variable(s) measured in the dataset.",
      },
      {
        property: "identifier",
        type: "URL or PropertyValue",
        description: "A DOI or other identifier for the dataset.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Global Structured Data Adoption Survey 2026",
      description:
        "A survey of 10,000 websites measuring Schema.org structured data adoption rates, type distribution, and rich result eligibility across industries.",
      url: "https://example.com/datasets/structured-data-survey-2026",
      creator: { "@type": "Organization", name: "SchemaCheck Research" },
      license: "https://creativecommons.org/licenses/by/4.0/",
      keywords: ["schema.org", "structured data", "SEO", "rich results", "JSON-LD"],
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: "text/csv",
          contentUrl: "https://example.com/datasets/structured-data-survey-2026.csv",
        },
        {
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: "https://example.com/datasets/structured-data-survey-2026.json",
        },
      ],
    },
  },

  "discussion-forum": {
    slug: "discussion-forum",
    type: "DiscussionForumPosting",
    title: "DiscussionForumPosting Schema Validation API",
    metaDescription:
      "Validate DiscussionForumPosting JSON-LD structured data against Google's discussion forum rich result requirements. Check required properties and get fix suggestions via API.",
    intro:
      "DiscussionForumPosting schema markup helps Google identify and index forum posts and community discussions. Valid structured data can surface your forum content in Google's Perspectives and Discussions features, increasing visibility for UGC content. This type is used on forum threads, Reddit-style posts, and community discussion pages.",
    richResultType: "Discussion forum in Google Search Perspectives",
    richResultRequirements:
      "Required: headline (post title), url (canonical URL), author, and datePublished. text content is strongly recommended.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/discussion-forum",
    requiredProperties: [
      {
        property: "headline",
        type: "string",
        description: "The title or subject of the forum post.",
        richResultRequired: true,
      },
      {
        property: "url",
        type: "URL",
        description: "The canonical URL of this forum post.",
        richResultRequired: true,
      },
      {
        property: "author",
        type: "Person or Organization",
        description: "The author who created the post.",
        richResultRequired: true,
      },
      {
        property: "datePublished",
        type: "ISO 8601 date",
        description: "The date the post was published.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "text",
        type: "string",
        description: "The full body text of the forum post.",
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "An image attached to or associated with the post.",
      },
      {
        property: "commentCount",
        type: "number",
        description: "The number of replies or comments on the post.",
      },
      {
        property: "interactionStatistic",
        type: "InteractionCounter",
        description: "Engagement metrics such as view count or like count.",
      },
      {
        property: "dateModified",
        type: "ISO 8601 date",
        description: "The most recent edit date.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
      headline: "How does Google handle duplicate structured data across paginated pages?",
      url: "https://example.com/forum/threads/duplicate-schema-pagination",
      author: { "@type": "Person", name: "DevUser42" },
      datePublished: "2026-03-18",
      dateModified: "2026-03-19",
      text: "I have a recipe index spread across 5 pages and I'm wondering if I should include the same ItemList schema on each paginated page or just the first one.",
      commentCount: 14,
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: { "@type": "ViewAction" },
        userInteractionCount: 892,
      },
    },
  },

  "employer-rating": {
    slug: "employer-rating",
    type: "EmployerAggregateRating",
    title: "EmployerAggregateRating Schema Validation API",
    metaDescription:
      "Validate EmployerAggregateRating JSON-LD structured data against Google's employer rating rich result requirements. Check required properties and get fix suggestions via API.",
    intro:
      "EmployerAggregateRating schema markup enables employer ratings to appear in Google Search — showing star ratings and review counts for companies in job search results. This structured data type is used by employer review platforms like Glassdoor and Indeed. Valid markup allows your employer rating data to surface alongside job listings.",
    richResultType: "Employer rating in job search results",
    richResultRequirements:
      "Required: itemReviewed (Organization being rated), ratingValue (numeric), and ratingCount (number of ratings).",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/employer-aggregate-rating",
    requiredProperties: [
      {
        property: "itemReviewed",
        type: "Organization",
        description: "The employer being rated. Must be an Organization with a name.",
        richResultRequired: true,
      },
      {
        property: "ratingValue",
        type: "number",
        description: "The aggregate rating value (e.g. 3.9).",
        richResultRequired: true,
      },
      {
        property: "ratingCount",
        type: "number",
        description: "The total number of ratings.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "bestRating",
        type: "number",
        description: "The highest possible rating (typically 5).",
      },
      {
        property: "worstRating",
        type: "number",
        description: "The lowest possible rating (typically 1).",
      },
      {
        property: "author",
        type: "Organization",
        description: "The review platform collecting these ratings.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "EmployerAggregateRating",
      itemReviewed: {
        "@type": "Organization",
        name: "Acme Corporation",
        sameAs: "https://example.com",
      },
      ratingValue: "3.9",
      bestRating: "5",
      worstRating: "1",
      ratingCount: 1847,
      author: { "@type": "Organization", name: "WorkReviews Platform" },
    },
  },

  movie: {
    slug: "movie",
    type: "Movie",
    title: "Movie Schema Validation API",
    metaDescription:
      "Validate Movie JSON-LD structured data against Google's movie rich result requirements. Check required properties, ratings, director, and get fix suggestions via API.",
    intro:
      "Movie schema markup enables movie carousel rich results in Google Search — showing film title, image, ratings, and director in visually prominent search results. Movie structured data is used by film databases, streaming platforms, and review sites. Valid Movie schema with aggregateRating can trigger star ratings alongside movie titles in search.",
    richResultType: "Movie carousel rich result",
    richResultRequirements:
      "Required: name. image and aggregateRating are needed for full rich results. director and dateCreated add context.",
    googleDocsUrl: "https://developers.google.com/search/docs/appearance/structured-data/movie",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The title of the movie.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "image",
        type: "URL or ImageObject",
        description: "Movie poster or promotional image. Required for carousel rich results.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "string",
        description: "A synopsis of the movie.",
      },
      {
        property: "dateCreated",
        type: "ISO 8601 date",
        description: "The release date of the movie.",
      },
      {
        property: "director",
        type: "Person",
        description: "The director of the movie.",
      },
      {
        property: "actor",
        type: "Person array",
        description: "The cast members.",
      },
      {
        property: "aggregateRating",
        type: "AggregateRating",
        description: "Overall audience or critic rating. Required for star ratings.",
        richResultRequired: true,
      },
      {
        property: "contentRating",
        type: "string",
        description: "The MPAA content rating (e.g. PG-13, R).",
      },
      {
        property: "url",
        type: "URL",
        description: "The canonical URL for this movie page.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: "The Data Architect",
      image: "https://example.com/images/movie-poster.jpg",
      description: "A thriller about a data scientist who discovers a global surveillance conspiracy.",
      dateCreated: "2026-01-15",
      director: { "@type": "Person", name: "Alex Chen" },
      actor: [
        { "@type": "Person", name: "Jordan Taylor" },
        { "@type": "Person", name: "Sam Rivera" },
      ],
      contentRating: "PG-13",
      aggregateRating: { "@type": "AggregateRating", ratingValue: "7.8", reviewCount: "4312", bestRating: "10" },
      url: "https://example.com/movies/the-data-architect",
    },
  },

  "image-metadata": {
    slug: "image-metadata",
    type: "ImageObject",
    title: "ImageObject (Image Metadata) Schema Validation API",
    metaDescription:
      "Validate ImageObject JSON-LD structured data for image license metadata. Check required properties, license URLs, credit text, and get fix suggestions via API.",
    intro:
      "ImageObject schema markup with license metadata helps photographers and publishers communicate image rights to Google. When Google can identify a publicly accessible image license, it displays a 'Licensable' badge in Google Images, linking back to your license page. Valid image metadata requires contentUrl and should include license, acquireLicensePage, and creator.",
    richResultType: "Licensable badge in Google Images",
    richResultRequirements:
      "Required: contentUrl (the image URL). license and acquireLicensePage are needed for the Licensable badge. creator and creditText support attribution.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata",
    requiredProperties: [
      {
        property: "contentUrl",
        type: "URL",
        description: "The URL of the image file itself.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "license",
        type: "URL",
        description:
          "A URL pointing to the license information for this image. Required for Licensable badge.",
        richResultRequired: true,
      },
      {
        property: "acquireLicensePage",
        type: "URL",
        description: "A URL where users can acquire a license for this image.",
        richResultRequired: true,
      },
      {
        property: "creditText",
        type: "string",
        description: "The credit line text for this image.",
      },
      {
        property: "creator",
        type: "Person or Organization",
        description: "The creator or photographer of the image.",
      },
      {
        property: "copyrightNotice",
        type: "string",
        description: "Copyright notice text.",
      },
      {
        property: "name",
        type: "string",
        description: "A title or name for the image.",
      },
      {
        property: "caption",
        type: "string",
        description: "A caption for the image.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      contentUrl: "https://example.com/images/golden-gate-bridge.jpg",
      license: "https://creativecommons.org/licenses/by/4.0/",
      acquireLicensePage: "https://example.com/licensing/golden-gate-bridge",
      creditText: "Photo by Jane Smith",
      creator: { "@type": "Person", name: "Jane Smith", url: "https://janesmithphotography.com" },
      copyrightNotice: "© 2026 Jane Smith Photography",
      name: "Golden Gate Bridge at Sunset",
      caption: "The Golden Gate Bridge photographed at sunset from Marin Headlands.",
    },
  },

  "profile-page": {
    slug: "profile-page",
    type: "ProfilePage",
    title: "ProfilePage Schema Validation API",
    metaDescription:
      "Validate ProfilePage JSON-LD structured data against Google's profile page requirements. Check mainEntity structure, person or organization details, and get fix suggestions via API.",
    intro:
      "ProfilePage schema markup is used on user profile and author pages to help Google understand the person or organization behind the content. Valid ProfilePage structured data with a Person mainEntity can link author profiles to their content, supporting E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals in Google Search.",
    richResultType: "Author profile linking and knowledge panel",
    richResultRequirements:
      "Required: mainEntity as a Person or Organization. Include name, url, and sameAs (authoritative external profile links) on the mainEntity.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/profile-page",
    requiredProperties: [
      {
        property: "mainEntity",
        type: "Person or Organization",
        description: "The person or organization whose profile this page represents.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "name",
        type: "string",
        description: "The page title.",
      },
      {
        property: "description",
        type: "string",
        description: "A description of the profile page.",
      },
      {
        property: "url",
        type: "URL",
        description: "The canonical URL of the profile page.",
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "A profile image.",
      },
      {
        property: "dateModified",
        type: "ISO 8601 date",
        description: "When the profile was last updated.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url: "https://example.com/authors/jane-smith",
      dateModified: "2026-03-18",
      mainEntity: {
        "@type": "Person",
        name: "Jane Smith",
        url: "https://example.com/authors/jane-smith",
        image: "https://example.com/images/jane-smith.jpg",
        description: "Jane Smith is a structured data specialist and SEO consultant.",
        sameAs: [
          "https://twitter.com/janesmith",
          "https://linkedin.com/in/janesmith",
          "https://github.com/janesmith",
        ],
        jobTitle: "Senior SEO Consultant",
        worksFor: { "@type": "Organization", name: "Digital Growth Agency" },
      },
    },
  },

  "merchant-return": {
    slug: "merchant-return",
    type: "MerchantReturnPolicy",
    title: "MerchantReturnPolicy Schema Validation API",
    metaDescription:
      "Validate MerchantReturnPolicy JSON-LD structured data against Google's merchant listing requirements. Check required properties, return categories, and get fix suggestions via API.",
    intro:
      "MerchantReturnPolicy schema markup enables Google to surface your return policy details directly in product rich results and Google Shopping. Showing a clear return policy increases buyer confidence and can improve click-through rates. Valid MerchantReturnPolicy structured data is nested within Product or Offer schemas on your product pages.",
    richResultType: "Return policy in merchant product listing",
    richResultRequirements:
      "Required: applicableCountry (ISO 3166 country code) and returnPolicyCategory (a schema.org URL defining the policy type).",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing",
    requiredProperties: [
      {
        property: "applicableCountry",
        type: "Country or ISO 3166 code",
        description: "The country where this return policy applies (e.g. 'US', 'GB').",
        richResultRequired: true,
      },
      {
        property: "returnPolicyCategory",
        type: "MerchantReturnEnumeration URL",
        description:
          "The type of return policy (e.g. https://schema.org/MerchantReturnFiniteReturnWindow).",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "merchantReturnDays",
        type: "number",
        description: "Number of days the return window is open.",
      },
      {
        property: "returnMethod",
        type: "ReturnMethodEnumeration URL",
        description:
          "How returns are made (e.g. https://schema.org/ReturnByMail, ReturnInStore).",
      },
      {
        property: "returnShippingFeesAmount",
        type: "MonetaryAmount",
        description: "The cost of return shipping.",
      },
      {
        property: "refundType",
        type: "RefundTypeEnumeration URL",
        description: "Type of refund offered (e.g. https://schema.org/FullRefund).",
      },
      {
        property: "itemCondition",
        type: "OfferItemCondition URL",
        description: "Condition in which items may be returned.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnShippingFeesAmount: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: "USD",
      },
      refundType: "https://schema.org/FullRefund",
      itemCondition: "https://schema.org/NewCondition",
    },
  },

  shipping: {
    slug: "shipping",
    type: "OfferShippingDetails",
    title: "OfferShippingDetails Schema Validation API",
    metaDescription:
      "Validate OfferShippingDetails JSON-LD structured data against Google's merchant listing requirements. Check shipping rate, destination, delivery time, and get fix suggestions via API.",
    intro:
      "OfferShippingDetails schema markup enables Google to display your shipping costs and estimated delivery times directly in product rich results and Google Shopping. Showing shipping information upfront reduces cart abandonment and improves listing quality scores. Valid OfferShippingDetails is nested within an Offer on your product pages.",
    richResultType: "Shipping details in merchant product listing",
    richResultRequirements:
      "Required: shippingRate (MonetaryAmount), shippingDestination (DefinedRegion with addressCountry), and deliveryTime (ShippingDeliveryTime with transit days).",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing",
    requiredProperties: [
      {
        property: "shippingRate",
        type: "MonetaryAmount",
        description:
          "The shipping cost. Include value and currency. Set value to 0 for free shipping.",
        richResultRequired: true,
      },
      {
        property: "shippingDestination",
        type: "DefinedRegion",
        description:
          "The destination for this shipping rate. Include addressCountry at minimum.",
        richResultRequired: true,
      },
      {
        property: "deliveryTime",
        type: "ShippingDeliveryTime",
        description:
          "Estimated delivery time. Include transitTime with minValue and maxValue (days).",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "transitTimeLabel",
        type: "string",
        description: "A label for the transit time (e.g. 'Standard', 'Express').",
      },
      {
        property: "doesNotShip",
        type: "boolean",
        description: "Set to true if the merchant does not ship to the specified destination.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: "USD",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "US",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 1,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 3,
          maxValue: 5,
          unitCode: "DAY",
        },
      },
      transitTimeLabel: "Standard Shipping",
    },
  },

  "fact-check": {
    slug: "fact-check",
    type: "ClaimReview",
    title: "ClaimReview Schema Validation API",
    metaDescription:
      "Validate ClaimReview JSON-LD structured data against Google's fact check rich result requirements. Check required properties, rating, and get fix suggestions via API.",
    intro:
      "ClaimReview schema markup enables fact-checking rich results in Google Search — allowing eligible fact-checking organizations to display their verdicts on specific claims directly in search results. Valid ClaimReview structured data includes the claim text, who made it, and the fact-checker's rating. Google restricts this rich result type to approved fact-checking organizations.",
    richResultType: "Fact check rich result (restricted to approved organizations)",
    richResultRequirements:
      "Required: claimReviewed (text of the claim), reviewRating (with ratingValue and bestRating), author (the fact-checking org), and itemReviewed (the Claim with author). Only available to approved organizations.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/factcheck",
    requiredProperties: [
      {
        property: "claimReviewed",
        type: "string",
        description: "A short summary of the claim being evaluated.",
        richResultRequired: true,
      },
      {
        property: "reviewRating",
        type: "Rating",
        description:
          "The fact-checker's verdict. Include ratingValue and alternateName (e.g. 'False', 'Mostly True').",
        richResultRequired: true,
      },
      {
        property: "author",
        type: "Organization",
        description: "The fact-checking organization authoring this review.",
        richResultRequired: true,
      },
      {
        property: "itemReviewed",
        type: "Claim",
        description:
          "The claim being reviewed. Include author (who made the claim) and appearance (URL where the claim appeared).",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "url",
        type: "URL",
        description: "The URL of the fact-check article.",
      },
      {
        property: "datePublished",
        type: "ISO 8601 date",
        description: "When the fact-check was published.",
      },
      {
        property: "name",
        type: "string",
        description: "The title of the fact-check article.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "ClaimReview",
      url: "https://example.com/fact-checks/claim-about-structured-data",
      claimReviewed: "Structured data guarantees a #1 ranking in Google Search",
      author: {
        "@type": "Organization",
        name: "TruthCheck Media",
        url: "https://example.com",
      },
      datePublished: "2026-03-18",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "1",
        bestRating: "5",
        worstRating: "1",
        alternateName: "False",
      },
      itemReviewed: {
        "@type": "Claim",
        author: { "@type": "Person", name: "Unknown SEO Guru" },
        appearance: { "@type": "OpinionNewsArticle", url: "https://source.example.com/seo-myths" },
      },
    },
    note: "ClaimReview rich results are restricted to approved fact-checking organizations. Sites must meet Google's eligibility requirements and follow ClaimReview guidelines.",
  },

  // ── Tier 4 ────────────────────────────────────────────────────────────────

  "math-solver": {
    slug: "math-solver",
    type: "MathSolver",
    title: "MathSolver Schema Validation API",
    metaDescription:
      "Validate MathSolver JSON-LD structured data against Google's math solver rich result requirements. Check required properties and get fix suggestions via API.",
    intro:
      "MathSolver schema markup enables your math solving tool to appear in Google's math solver rich results — surfaced when users search for math problems and equations. Valid MathSolver structured data marks up tools that can accept and solve mathematical expressions, displaying your solver directly in Google Search as an interactive tool.",
    richResultType: "Math solver rich result",
    richResultRequirements:
      "Required: name and potentialAction (SolveMathAction with acceptedMathExpression input). URL of the solver is required in the action.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/math-solvers",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the math solver tool.",
        richResultRequired: true,
      },
      {
        property: "potentialAction",
        type: "SolveMathAction",
        description:
          "The solve action. Include target (URL of the solver) and acceptedMathExpression.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "description",
        type: "string",
        description: "A description of the math solver's capabilities.",
      },
      {
        property: "url",
        type: "URL",
        description: "The URL of the math solver tool.",
      },
      {
        property: "educationalLevel",
        type: "string",
        description: "The educational level (e.g. 'High School', 'College', 'All levels').",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "MathSolver",
      name: "Equation Solver Pro",
      url: "https://example.com/math/solver",
      description: "Solve algebraic equations, calculus problems, and more.",
      potentialAction: {
        "@type": "SolveMathAction",
        target: "https://example.com/math/solver?q={math_expression_string}",
        "acceptedMathExpression-input": "required name=math_expression_string",
      },
      educationalLevel: "All levels",
    },
  },

  "education-qa": {
    slug: "education-qa",
    type: "Quiz",
    title: "Quiz (Education Q&A) Schema Validation API",
    metaDescription:
      "Validate Quiz JSON-LD structured data against Google's education Q&A rich result requirements. Check required properties and get fix suggestions via API.",
    intro:
      "Quiz schema markup enables education Q&A rich results in Google Search — surfacing educational quiz questions and flashcard-style content for students. Valid Quiz structured data marks up practice questions, assessments, and study materials. Each Quiz contains Question items with correct answers and distractors.",
    richResultType: "Education Q&A rich result for students",
    richResultRequirements:
      "Required: name and hasPart (array of Question items with text and acceptedAnswer).",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/education-qa",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name or title of the quiz.",
        richResultRequired: true,
      },
      {
        property: "hasPart",
        type: "Question array",
        description:
          "The quiz questions. Each Question needs text and acceptedAnswer with text.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "about",
        type: "Thing",
        description: "The subject or topic of the quiz.",
      },
      {
        property: "educationalLevel",
        type: "string",
        description: "Grade level or educational level (e.g. 'Grade 10', 'AP Chemistry').",
      },
      {
        property: "educationalAlignment",
        type: "AlignmentObject",
        description: "Alignment with educational frameworks or standards.",
      },
      {
        property: "description",
        type: "string",
        description: "A description of the quiz.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "JSON-LD and Schema.org Basics Quiz",
      educationalLevel: "Intermediate",
      about: { "@type": "Thing", name: "Structured Data" },
      hasPart: [
        {
          "@type": "Question",
          text: "What does JSON-LD stand for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "JavaScript Object Notation for Linked Data",
          },
          suggestedAnswer: [
            { "@type": "Answer", text: "JavaScript Object Notation for Linked Documents" },
            { "@type": "Answer", text: "JSON Language Definition" },
          ],
        },
        {
          "@type": "Question",
          text: "Which property is required for all Schema.org types?",
          acceptedAnswer: { "@type": "Answer", text: "@type" },
          suggestedAnswer: [
            { "@type": "Answer", text: "@context" },
            { "@type": "Answer", text: "name" },
          ],
        },
      ],
    },
  },

  "loyalty-program": {
    slug: "loyalty-program",
    type: "LoyaltyProgram",
    title: "LoyaltyProgram Schema Validation API",
    metaDescription:
      "Validate LoyaltyProgram JSON-LD structured data against Google's loyalty program rich result requirements. Check required properties and get fix suggestions via API.",
    intro:
      "LoyaltyProgram schema markup enables loyalty program details to appear in Google Search and Google Shopping — helping customers discover and compare rewards programs. Valid LoyaltyProgram structured data marks up your loyalty or rewards program with membership tiers, benefits, and enrollment details.",
    richResultType: "Loyalty program rich result in Google Shopping",
    richResultRequirements:
      "Required: name and hasMembershipDataType. Include membershipLevel for tier details.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/loyalty-program",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the loyalty program.",
        richResultRequired: true,
      },
      {
        property: "hasMembershipDataType",
        type: "MembershipDataType URL",
        description:
          "The type of membership data (e.g. https://schema.org/LoyaltyPoints, LoyaltyStatus).",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "url",
        type: "URL",
        description: "The URL to learn about or join the program.",
      },
      {
        property: "description",
        type: "string",
        description: "A description of the loyalty program benefits.",
      },
      {
        property: "programName",
        type: "string",
        description: "The name of the program (if different from name).",
      },
      {
        property: "membershipLevel",
        type: "MemberProgramTier array",
        description: "The tiers or levels of the loyalty program.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "LoyaltyProgram",
      name: "Acme Rewards",
      url: "https://example.com/rewards",
      description: "Earn points on every purchase and redeem for discounts and exclusive perks.",
      hasMembershipDataType: "https://schema.org/LoyaltyPoints",
      membershipLevel: [
        { "@type": "MemberProgramTier", name: "Silver", hasTierBenefit: "5% back on all purchases" },
        { "@type": "MemberProgramTier", name: "Gold", hasTierBenefit: "10% back + free shipping" },
        { "@type": "MemberProgramTier", name: "Platinum", hasTierBenefit: "15% back + dedicated support" },
      ],
    },
  },

  "vacation-rental": {
    slug: "vacation-rental",
    type: "VacationRental",
    title: "VacationRental Schema Validation API",
    metaDescription:
      "Validate VacationRental JSON-LD structured data against Google's vacation rental rich result requirements. Check required properties and get fix suggestions via API.",
    intro:
      "VacationRental schema markup enables short-term rental properties to appear in Google Travel search results. Valid VacationRental structured data marks up vacation homes, cabins, apartments, and other short-term rentals with location, amenities, pricing, and availability. This helps Google surface your property in travelers' search results.",
    richResultType: "Vacation rental listing in Google Travel",
    richResultRequirements:
      "Required: name, description, and address. image, offers, and amenityFeature significantly improve listing quality.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/vacation-rental",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the vacation rental property.",
        richResultRequired: true,
      },
      {
        property: "description",
        type: "string",
        description: "A description of the property.",
        richResultRequired: true,
      },
      {
        property: "address",
        type: "PostalAddress",
        description: "The property address. Include city and country at minimum.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "image",
        type: "URL or ImageObject array",
        description: "Photos of the rental property.",
        richResultRequired: true,
      },
      {
        property: "offers",
        type: "Offer",
        description: "Nightly pricing and availability.",
      },
      {
        property: "numberOfRooms",
        type: "number",
        description: "Number of bedrooms in the property.",
      },
      {
        property: "amenityFeature",
        type: "LocationFeatureSpecification array",
        description: "Amenities (WiFi, pool, kitchen, etc.).",
      },
      {
        property: "checkInTime",
        type: "time",
        description: "Standard check-in time (e.g. '15:00').",
      },
      {
        property: "checkOutTime",
        type: "time",
        description: "Standard check-out time (e.g. '11:00').",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "VacationRental",
      name: "Oceanfront Cottage — Big Sur",
      description: "A stunning 2-bedroom cottage with direct ocean views and a private deck.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Big Sur",
        addressRegion: "CA",
        addressCountry: "US",
      },
      image: [
        "https://example.com/images/cottage-exterior.jpg",
        "https://example.com/images/cottage-living-room.jpg",
      ],
      numberOfRooms: 2,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
        { "@type": "LocationFeatureSpecification", name: "Ocean View", value: true },
        { "@type": "LocationFeatureSpecification", name: "Private Deck", value: true },
      ],
      offers: {
        "@type": "Offer",
        price: "350",
        priceCurrency: "USD",
        description: "Per night",
      },
    },
  },

  "subscription-content": {
    slug: "subscription-content",
    type: "CreativeWork",
    title: "Subscription & Paywalled Content Schema Validation API",
    metaDescription:
      "Validate CreativeWork JSON-LD structured data for paywalled content against Google's requirements. Check isAccessibleForFree, hasPart, and get fix suggestions via API.",
    intro:
      "CreativeWork schema markup for subscription and paywalled content signals to Google which parts of your content are freely accessible and which require a subscription. This prevents Google from treating your content as cloaking (showing different content to Googlebot than to users). Valid paywalled content markup uses isAccessibleForFree and hasPart with cssSelector to identify the paywalled section.",
    richResultType: "Subscription/paywalled content — prevents cloaking penalties",
    richResultRequirements:
      "Required: isAccessibleForFree (boolean) and hasPart (WebPageElement with cssSelector identifying the paywalled element and isAccessibleForFree: false).",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/subscription-and-paywalled-content",
    requiredProperties: [
      {
        property: "isAccessibleForFree",
        type: "boolean",
        description:
          "Whether the full content is freely accessible. Set to false for paywalled content.",
        richResultRequired: true,
      },
      {
        property: "hasPart",
        type: "WebPageElement",
        description:
          "The paywalled section. Must include cssSelector and isAccessibleForFree: false.",
        richResultRequired: true,
      },
    ],
    recommendedProperties: [
      {
        property: "name",
        type: "string",
        description: "The title of the article or content piece.",
      },
      {
        property: "description",
        type: "string",
        description: "A description of the content.",
      },
      {
        property: "publisher",
        type: "Organization",
        description: "The publisher of the content.",
      },
      {
        property: "url",
        type: "URL",
        description: "The canonical URL of the content.",
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "A representative image.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "The Complete Guide to Schema.org Rich Results",
      isAccessibleForFree: false,
      hasPart: {
        "@type": "WebPageElement",
        isAccessibleForFree: false,
        cssSelector: ".paywall-content",
      },
      author: { "@type": "Person", name: "Jane Smith" },
      publisher: {
        "@type": "Organization",
        name: "Tech Media Inc",
        logo: { "@type": "ImageObject", url: "https://example.com/logo.png" },
      },
      datePublished: "2026-03-18",
      image: "https://example.com/images/schema-guide.jpg",
    },
    note: "Add isAccessibleForFree: false and hasPart to your Article or CreativeWork schema on paywalled pages to tell Google which section is behind the paywall.",
  },

  // ── Deprecated ────────────────────────────────────────────────────────────

  "how-to": {
    slug: "how-to",
    type: "HowTo",
    title: "HowTo Schema — Validate How-To Structured Data",
    h1: "HowTo Schema Markup Guide",
    metaDescription:
      "HowTo structured data retired by Google in August 2024. SchemaCheck validates HowTo schema with a deprecation warning. Learn what changed, what to use instead, and howto structured data history.",
    intro:
      "HowTo schema markup was used to enable step-by-step instructional rich results in Google Search — showing numbered steps, images, and tools directly in search results. Google retired HowTo rich results in August 2024. Pages with HowTo structured data no longer receive rich results, but the markup remains valid Schema.org and can still be validated. SchemaCheck returns a deprecation warning for HowTo schemas.",
    richResultType: "Retired — no longer generates rich results (as of August 2024)",
    richResultRequirements:
      "HowTo rich results are retired. Validation will pass but returns a deprecation warning. The structured data is still valid Schema.org.",
    googleDocsUrl: "https://developers.google.com/search/docs/appearance/structured-data/how-to",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The title of the how-to guide.",
      },
      {
        property: "step",
        type: "HowToStep array",
        description: "The ordered steps. Each HowToStep should have text.",
      },
    ],
    recommendedProperties: [
      {
        property: "description",
        type: "string",
        description: "A description of what the guide teaches.",
      },
      {
        property: "image",
        type: "URL or ImageObject",
        description: "An image for the guide.",
      },
      {
        property: "totalTime",
        type: "ISO 8601 duration",
        description: "Total time to complete the how-to.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to add JSON-LD to a web page",
      description: "Add Schema.org structured data to your page using a JSON-LD script tag.",
      totalTime: "PT5M",
      step: [
        {
          "@type": "HowToStep",
          text: "Open your HTML file in a text editor.",
        },
        {
          "@type": "HowToStep",
          text: "Add a <script type=\"application/ld+json\"> tag inside the <head>.",
        },
        {
          "@type": "HowToStep",
          text: "Paste your JSON-LD object inside the script tag and save.",
        },
      ],
    },
    note: "Google retired HowTo rich results in August 2024. This schema type will validate with a deprecation warning. Your structured data will not generate rich results in Google Search.",
  },

  "special-announcement": {
    slug: "special-announcement",
    type: "SpecialAnnouncement",
    title: "SpecialAnnouncement Schema (Retired) | SchemaCheck",
    metaDescription:
      "SpecialAnnouncement rich results were retired by Google in 2025. SchemaCheck validates SpecialAnnouncement schema with a deprecation warning. Learn what changed.",
    intro:
      "SpecialAnnouncement schema markup was created during the COVID-19 pandemic to enable a dedicated rich result for urgent public announcements — displaying announcement text, dates, and links directly in Google Search. Google retired the SpecialAnnouncement rich result in 2025. Pages with this markup no longer receive rich results. SchemaCheck validates SpecialAnnouncement with a deprecation warning.",
    richResultType: "Retired — no longer generates rich results (as of 2025)",
    richResultRequirements:
      "SpecialAnnouncement rich results are retired. Validation passes with a deprecation warning. The structured data is still valid Schema.org.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/special-announcements",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "A short summary of the announcement.",
      },
      {
        property: "datePosted",
        type: "ISO 8601 date",
        description: "The date the announcement was made.",
      },
    ],
    recommendedProperties: [
      {
        property: "expires",
        type: "ISO 8601 date",
        description: "The date the announcement expires.",
      },
      {
        property: "text",
        type: "string",
        description: "The full text of the announcement.",
      },
      {
        property: "url",
        type: "URL",
        description: "A URL with full details about the announcement.",
      },
      {
        property: "category",
        type: "URL",
        description: "The Wikidata URL for the announcement category.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "SpecialAnnouncement",
      name: "Office Closed for Holiday",
      datePosted: "2026-03-18",
      expires: "2026-03-22",
      text: "Our offices will be closed from March 20–21 for the holiday. Normal hours resume March 22.",
      url: "https://example.com/announcements/holiday-closure",
      category: "https://www.wikidata.org/wiki/Q17362920",
    },
    note: "Google retired SpecialAnnouncement rich results in 2025. Validation returns a deprecation warning. Your markup will not generate rich results in Google Search.",
  },

  "vehicle-listing": {
    slug: "vehicle-listing",
    type: "Vehicle",
    title: "Vehicle Listing Schema (Retired) | SchemaCheck",
    metaDescription:
      "Vehicle Listing rich results were retired by Google in 2025. SchemaCheck validates Vehicle schema with a deprecation warning. Learn what changed and what to use instead.",
    intro:
      "Vehicle schema markup was used to enable car dealer listing rich results in Google Search — displaying vehicle make, model, year, price, and VIN in dedicated vehicle search experiences. Google retired Vehicle Listing rich results in 2025. Pages with Vehicle structured data no longer receive rich results. SchemaCheck validates Vehicle schemas with a deprecation warning. Car and Auto are recognized sub-types.",
    richResultType: "Retired — no longer generates rich results (as of 2025)",
    richResultRequirements:
      "Vehicle Listing rich results are retired. Validation passes with a deprecation warning. The structured data is still valid Schema.org.",
    googleDocsUrl:
      "https://developers.google.com/search/docs/appearance/structured-data/vehicle-listing",
    requiredProperties: [
      {
        property: "name",
        type: "string",
        description: "The name of the vehicle (e.g. '2024 Honda Civic LX').",
      },
      {
        property: "vehicleIdentificationNumber",
        type: "string",
        description: "The 17-character Vehicle Identification Number (VIN).",
      },
    ],
    recommendedProperties: [
      {
        property: "description",
        type: "string",
        description: "A description of the vehicle.",
      },
      {
        property: "image",
        type: "URL",
        description: "An image of the vehicle.",
      },
      {
        property: "offers",
        type: "Offer",
        description: "Price and availability of the vehicle.",
      },
      {
        property: "brand",
        type: "Brand",
        description: "The make/brand of the vehicle.",
      },
      {
        property: "mileageFromOdometer",
        type: "QuantitativeValue",
        description: "The odometer reading.",
      },
      {
        property: "vehicleConfiguration",
        type: "string",
        description: "Trim level or configuration.",
      },
    ],
    exampleJsonLd: {
      "@context": "https://schema.org",
      "@type": "Car",
      name: "2024 Toyota Camry XSE",
      vehicleIdentificationNumber: "4T1BZ1HK5MU123456",
      description: "A sporty midsize sedan with V6 engine and panoramic sunroof.",
      image: "https://example.com/images/camry-xse.jpg",
      brand: { "@type": "Brand", name: "Toyota" },
      vehicleConfiguration: "XSE V6",
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: 0,
        unitCode: "SMI",
      },
      offers: {
        "@type": "Offer",
        price: "34450",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
    note: "Google retired Vehicle Listing rich results in 2025. Validation returns a deprecation warning. Your markup will not generate rich results in Google Search.",
  },
};

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return Object.keys(TYPES).map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type: slug } = await params;
  const data = TYPES[slug];
  if (!data) return {};

  return {
    title: `${data.title} | SchemaCheck`,
    description: data.metaDescription,
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url: `${APP_URL}/schema-types/${slug}`,
    },
  };
}

function PropRow({ prop, richResultRequired }: { prop: RequiredProp | RecommendedProp; richResultRequired?: boolean }) {
  return (
    <tr className="border-b border-gray-800/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <code className="text-indigo-300 text-sm font-mono">{prop.property}</code>
          {richResultRequired && (
            <span className="text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded font-medium ring-1 ring-green-500/20">
              rich result
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{prop.type}</td>
      <td className="px-4 py-3 text-sm text-gray-400">{prop.description}</td>
    </tr>
  );
}

export default async function SchemaTypePage({ params }: Props) {
  const { type: slug } = await params;
  const data = TYPES[slug];
  if (!data) notFound();

  const exampleJson = JSON.stringify(data.exampleJsonLd, null, 2);
  const apiCallExample = `curl "https://schemacheck.dev/api/v1/validate" \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ jsonld: data.exampleJsonLd })}'`;

  const pageJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${data.type} Schema Validation API — SchemaCheck`,
    url: `${APP_URL}/schema-types/${slug}`,
    description: data.metaDescription,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier: 100 validations/month",
    },
  });

  const breadcrumbJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.schemacheck.dev" },
      { "@type": "ListItem", position: 2, name: "Schema Types", item: "https://www.schemacheck.dev/schema-types" },
      { "@type": "ListItem", position: 3, name: data.type, item: `https://www.schemacheck.dev/schema-types/${slug}` },
    ],
  });

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-400">SchemaCheck</Link>
          <span>/</span>
          <Link href="/schema-types" className="hover:text-gray-400">Schema Types</Link>
          <span>/</span>
          <span className="text-gray-400">{data.type}</span>
        </nav>

        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{data.h1 ?? data.title}</h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-10">{data.intro}</p>

        {/* Note for deprecated/restricted types */}
        {data.note && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 mb-10">
            <p className="text-sm text-yellow-400">{data.note}</p>
          </div>
        )}

        {/* Required properties */}
        {data.requiredProperties.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">Required Properties</h2>
            <div className="rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#111118] border-b border-gray-800">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Property</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.requiredProperties.map((p) => (
                    <PropRow key={p.property} prop={p} richResultRequired={p.richResultRequired} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Recommended properties */}
        {data.recommendedProperties.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">Recommended Properties</h2>
            <p className="text-sm text-gray-500 mb-4">
              Missing recommended properties generate warnings. They won&apos;t block validation,
              but{" "}
              <span className="text-green-400 font-medium">rich result</span>-tagged properties are
              needed for full Google rich result eligibility.
            </p>
            <div className="rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#111118] border-b border-gray-800">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Property</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recommendedProperties.map((p) => (
                    <PropRow key={p.property} prop={p} richResultRequired={p.richResultRequired} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Rich result requirements */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-3">Rich Result Eligibility</h2>
          <div className="rounded-lg border border-gray-800 bg-[#111118] p-4">
            <p className="text-sm text-gray-400 mb-1">
              <span className="text-white font-medium">Rich result type: </span>
              {data.richResultType}
            </p>
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">Requirements: </span>
              {data.richResultRequirements}
            </p>
          </div>
        </section>

        {/* Example JSON-LD */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Example valid {data.type} JSON-LD
          </h2>
          <div className="rounded-xl bg-gray-950 border border-gray-800 overflow-x-auto">
            <pre className="p-5 text-sm text-gray-300 font-mono leading-relaxed whitespace-pre">
              {exampleJson}
            </pre>
          </div>
        </section>

        {/* API call example */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-2">Validate via API</h2>
          <p className="text-sm text-gray-500 mb-4">
            Validate this schema against Google&apos;s requirements in one API call:
          </p>
          <div className="rounded-xl bg-gray-950 border border-gray-800 overflow-x-auto">
            <pre className="p-5 text-sm text-gray-300 font-mono leading-relaxed whitespace-pre">
              {apiCallExample}
            </pre>
          </div>
        </section>

        {/* Google docs link */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-3">Official Documentation</h2>
          <a
            href={data.googleDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Google Structured Data: {data.type} →
          </a>
        </section>

        {/* CTA */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-7 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">
            Validate your {data.type} schema now
          </h2>
          <p className="text-sm text-gray-400 mb-5">
            100 free validations/month. No credit card required.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Get your free API key
            </Link>
            <Link
              href="/schema-types"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-300 text-sm font-medium transition-colors"
            >
              ← All schema types
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
