import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardSession } from "@/lib/dashboard-auth";
import { supabase } from "@/lib/supabase";
import { ApiKeyCard } from "@/components/dashboard/ApiKeyCard";
import { UsageOverview } from "@/components/dashboard/UsageOverview";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { PlanBilling } from "@/components/dashboard/PlanBilling";
import { NotifPrefs } from "@/components/dashboard/NotifPrefs";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { Toast } from "@/components/dashboard/Toast";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";

interface DashboardPageProps {
  searchParams: Promise<{ success?: string; welcome?: string }>;
}

interface UsageLogRow {
  id: string;
  api_key_id: string;
  endpoint: string;
  input_type: "url" | "jsonld";
  schemas_found: number;
  errors_found: number;
  response_time_ms: number;
  cached: boolean;
  credited: boolean;
  created_at: string;
}

interface StatsRow {
  schemas_found: number;
  response_time_ms: number;
  cached: boolean;
}

function computeStats(rows: StatsRow[]) {
  const total_validations = rows.length;
  const total_schemas = rows.reduce((s, r) => s + r.schemas_found, 0);
  const avg_response_ms = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.response_time_ms, 0) / rows.length)
    : 0;
  const cache_hit_rate = rows.length
    ? Math.round((rows.filter((r) => r.cached).length / rows.length) * 100)
    : 0;
  return { total_validations, total_schemas, avg_response_ms, cache_hit_rate };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const apiKey = await getDashboardSession();

  if (!apiKey) {
    redirect("/dashboard/login");
  }

  // Fetch stats (all rows, aggregated in TS)
  const { data: statsRows } = await supabase
    .from("usage_logs")
    .select("schemas_found, response_time_ms, cached")
    .eq("api_key_id", apiKey.id);

  const stats = computeStats((statsRows ?? []) as StatsRow[]);

  // Fetch first page of activity
  const { data: activityRows, count: activityTotal } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact" })
    .eq("api_key_id", apiKey.id)
    .order("created_at", { ascending: false })
    .range(0, 19);

  const showWelcome = params.welcome === "1";
  const showSuccess = params.success === "1";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Toast notifications */}
      {showWelcome && (
        <Toast message="Welcome to SchemaCheck! Your API key is ready." type="welcome" />
      )}
      {showSuccess && (
        <Toast message="Subscription activated! Your plan has been upgraded." type="success" />
      )}

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
            <span className="text-sm text-white font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">{apiKey.email}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Onboarding checklist — shown until dismissed via localStorage */}
        <OnboardingChecklist apiKey={apiKey.key} />

        {/* Row 1: API Key (2/3) + Usage Overview (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ApiKeyCard apiKey={apiKey} />
          </div>
          <div>
            <UsageOverview apiKey={apiKey} />
          </div>
        </div>

        {/* Row 2: Quick Stats */}
        <QuickStats stats={stats} />

        {/* Row 3: Activity Table */}
        <ActivityTable
          initialRows={(activityRows ?? []) as UsageLogRow[]}
          initialTotal={activityTotal ?? 0}
        />

        {/* Row 4: Plan & Billing + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlanBilling apiKey={apiKey} />
          <NotifPrefs apiKey={apiKey} />
        </div>
      </main>
    </div>
  );
}
