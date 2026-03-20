import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDashboardSession } from "@/lib/dashboard-auth";
import { supabase } from "@/lib/supabase";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { MonitorDetail } from "@/components/dashboard/monitors/MonitorDetail";
import type { MonitorRow } from "@/components/dashboard/monitors/MonitorsList";
import type { MonitorEventRow } from "@/components/dashboard/monitors/MonitorDetail";

interface MonitorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MonitorDetailPage({ params }: MonitorDetailPageProps) {
  const { id } = await params;
  const apiKey = await getDashboardSession();

  if (!apiKey) {
    redirect("/dashboard/login");
  }

  // Fetch monitor, verify ownership
  const { data: monitor, error: monitorError } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", apiKey.id)
    .single();

  if (monitorError || !monitor) {
    notFound();
  }

  // Fetch last 30 events
  const { data: historyData } = await supabase
    .from("monitor_events")
    .select("*")
    .eq("monitor_id", id)
    .order("created_at", { ascending: false })
    .limit(30);

  const history = (historyData ?? []) as MonitorEventRow[];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-gray-800 bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-white">
              ⬡ Schema<span className="text-indigo-400">Check</span>
            </Link>
            <Link
              href="/docs"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/monitors"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Monitors
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">{apiKey.email}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/monitors"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span aria-hidden>←</span>
          <span>All Monitors</span>
        </Link>

        <MonitorDetail
          monitor={monitor as MonitorRow}
          history={history}
        />
      </main>
    </div>
  );
}
