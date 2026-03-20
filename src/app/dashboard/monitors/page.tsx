import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardSession } from "@/lib/dashboard-auth";
import { supabase } from "@/lib/supabase";
import { MONITOR_LIMITS } from "@/lib/monitors";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { MonitorsList } from "@/components/dashboard/monitors/MonitorsList";
import type { MonitorRow } from "@/components/dashboard/monitors/MonitorsList";

export default async function MonitorsPage() {
  const apiKey = await getDashboardSession();

  if (!apiKey) {
    redirect("/dashboard/login");
  }

  // Fetch all monitors for this user
  const { data: monitorsData } = await supabase
    .from("monitors")
    .select("*")
    .eq("user_id", apiKey.id)
    .order("created_at", { ascending: false });

  const monitors = (monitorsData ?? []) as MonitorRow[];
  const planMonitorLimit = MONITOR_LIMITS[apiKey.plan] ?? 1;

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
            <span className="text-sm text-white font-medium">Monitors</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">{apiKey.email}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <MonitorsList
          initialMonitors={monitors}
          planMonitorLimit={planMonitorLimit}
        />
      </main>
    </div>
  );
}
