import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { getPost, getAllSlugs, CATEGORY_COLORS } from "@/lib/blog";
import { Prose } from "@/components/blog/Prose";
import { BlogToc } from "@/components/blog/BlogToc";
import { BlogCta } from "@/components/blog/BlogCta";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const ogUrl = `https://schemacheck.dev/blog/${slug}`;

  return {
    title: `${post.title} | SchemaCheck Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: ogUrl,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "SchemaCheck",
      url: "https://schemacheck.dev",
    },
    url: `https://schemacheck.dev/blog/${slug}`,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    isPartOf: {
      "@type": "WebSite",
      name: "SchemaCheck",
      url: "https://schemacheck.dev",
    },
  });

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleJsonLd }}
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        <div className="flex gap-16">

          {/* Main content */}
          <article className="flex-1 min-w-0 max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
              <Link href="/" className="hover:text-gray-400">SchemaCheck</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-gray-400">Blog</Link>
              <span>/</span>
              <span className="text-gray-400 truncate">{post.title}</span>
            </nav>

            {/* Post header */}
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category]}`}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-600">{post.readingTime}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                {post.title}
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-gray-800">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">
                    {post.author.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{post.author}</p>
                  <time className="text-xs text-gray-500">{formatDate(post.date)}</time>
                </div>
              </div>
            </header>

            {/* MDX content */}
            <Prose>
              <MDXRemote
                source={post.content}
                options={{
                  mdxOptions: {
                    rehypePlugins: [rehypeSlug],
                  },
                }}
              />
            </Prose>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-800">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono text-gray-500 bg-gray-800/60 border border-gray-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <BlogCta />

            {/* Back to blog */}
            <div className="mt-8">
              <Link
                href="/blog"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                ← Back to blog
              </Link>
            </div>
          </article>

          {/* Sticky TOC sidebar — hidden on mobile */}
          {post.headings.length >= 2 && (
            <aside className="hidden xl:block w-56 shrink-0">
              <BlogToc headings={post.headings} />
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}
