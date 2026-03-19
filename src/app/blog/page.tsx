import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, CATEGORY_COLORS, type Category } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | SchemaCheck",
  description:
    "Guides on structured data for SEO — what is structured data, how to get rich snippets, schema markup examples, and API tutorials from the team behind SchemaCheck.",
};

const CATEGORIES: Category[] = ["Engineering", "Guides", "Customer Stories", "Product Updates"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 lg:py-20">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Blog</h1>
          <p className="text-gray-400 text-lg">
            Guides on structured data, rich results, and API development.
          </p>
        </div>

        {/* Category filters — static for now, styled as pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
            All
          </span>
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 ring-1 ring-gray-700 hover:text-gray-300 cursor-default"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Post list */}
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-1">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block p-5 rounded-xl border border-gray-800/60 hover:border-gray-700 hover:bg-[#111118] transition-all"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <time className="text-xs text-gray-500">{formatDate(post.date)}</time>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category]}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-600">{post.readingTime}</span>
                </div>
                <h2 className="text-base font-semibold text-white mb-1.5 group-hover:text-indigo-300 transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs text-gray-600 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
