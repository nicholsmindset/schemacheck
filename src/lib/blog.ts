import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export type Category = "Engineering" | "Guides" | "Customer Stories" | "Product Updates";

export interface PostFrontmatter {
  title: string;
  date: string;         // ISO date string: "2026-03-10"
  excerpt: string;
  category: Category;
  tags: string[];
  readingTime: string;  // "5 min read"
  author: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

export interface Post extends PostMeta {
  content: string;
  headings: Heading[];
}

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split("\n");
  const headings: Heading[] = [];

  for (const line of lines) {
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h2) {
      headings.push({ level: 2, text: h2[1], id: slugify(h2[1]) });
    } else if (h3) {
      headings.push({ level: 3, text: h3[1], id: slugify(h3[1]) });
    }
  }

  return headings;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
      const { data } = matter(raw);

      return {
        slug,
        ...(data as PostFrontmatter),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    content,
    headings: extractHeadings(content),
    ...(data as PostFrontmatter),
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostsByCategory(category: Category): PostMeta[] {
  return getAllPosts().filter((p) => p.category === category);
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Engineering:       "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30",
  Guides:            "bg-green-500/15 text-green-300 ring-1 ring-green-500/30",
  "Customer Stories": "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30",
  "Product Updates": "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30",
};
