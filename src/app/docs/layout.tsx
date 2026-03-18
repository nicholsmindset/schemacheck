import type { Metadata } from "next";
import { DocSidebar } from "@/components/docs/DocSidebar";

export const metadata: Metadata = {
  title: {
    default: "Documentation",
    template: "%s | SchemaCheck Docs",
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <DocSidebar />
      {/* Content — offset on mobile for the fixed top bar */}
      <main className="flex-1 min-w-0 pt-12 lg:pt-0">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
          {children}
        </div>
      </main>
    </div>
  );
}
