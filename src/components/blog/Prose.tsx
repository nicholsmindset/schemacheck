/**
 * Prose — applies consistent typographic styles to MDX rendered HTML.
 * No external @tailwindcss/typography dependency.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={[
        // Base text
        "text-gray-300 leading-relaxed",
        // Headings
        "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:leading-snug",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:leading-snug",
        // Paragraphs
        "[&_p]:my-5 [&_p]:leading-relaxed",
        // Links
        "[&_a]:text-indigo-400 [&_a:hover]:text-indigo-300 [&_a]:underline [&_a]:underline-offset-2",
        // Inline code
        "[&_:not(pre)>code]:bg-gray-800 [&_:not(pre)>code]:text-indigo-300 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:text-sm [&_:not(pre)>code]:font-mono",
        // Code blocks
        "[&_pre]:bg-gray-950 [&_pre]:border [&_pre]:border-gray-800 [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:my-6",
        "[&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:text-sm [&_pre_code]:font-mono [&_pre_code]:p-0",
        // Unordered lists
        "[&_ul]:my-5 [&_ul]:pl-5 [&_ul]:space-y-2",
        "[&_ul>li]:text-gray-300 [&_ul>li]:leading-relaxed [&_ul>li]:list-disc [&_ul>li]:marker:text-indigo-500",
        // Ordered lists
        "[&_ol]:my-5 [&_ol]:pl-5 [&_ol]:space-y-2",
        "[&_ol>li]:text-gray-300 [&_ol>li]:leading-relaxed [&_ol>li]:list-decimal [&_ol>li]:marker:text-indigo-400",
        // Blockquotes
        "[&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:my-6",
        "[&_blockquote>p]:text-gray-400 [&_blockquote>p]:italic",
        // Horizontal rule
        "[&_hr]:border-gray-800 [&_hr]:my-10",
        // Strong / em
        "[&_strong]:text-white [&_strong]:font-semibold",
        "[&_em]:text-gray-400 [&_em]:italic",
        // Tables
        "[&_table]:w-full [&_table]:text-sm [&_table]:my-6",
        "[&_th]:text-left [&_th]:px-4 [&_th]:py-2 [&_th]:text-gray-400 [&_th]:font-medium [&_th]:border-b [&_th]:border-gray-800",
        "[&_td]:px-4 [&_td]:py-3 [&_td]:border-b [&_td]:border-gray-800/50 [&_td]:text-gray-300",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
