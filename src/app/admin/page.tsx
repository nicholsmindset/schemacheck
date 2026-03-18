import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

// ── Types ──────────────────────────────────────────────────────────────────

interface KPI {
  total_users: number;
  mrr: number;
  total_validations: number;
  validations_this_month: number;
  cache_rate: number;
}

interface PlanDistribution {
  free: number;
  basic: number;
  growth: number;
  scale: number;
}

interface RecentSignup {
  email: string;
  plan: string;
  requests_used: number;
  requests_limit: number;
  has_stripe: boolean;
  created_at: string;
}

interface TopUser {
  email: string;
  plan: string;
  requests_used: number;
  requests_limit: number;
  percent_used: number;
}

interface SystemHealth {
  avg_response_time_ms: number;
  total_schemas_found: number;
  error_rate_percent: number;
  active_users_this_month: number;
}

interface StatsResponse {
  kpi: KPI;
  plan_distribution: PlanDistribution;
  recent_signups: RecentSignup[];
  top_users: TopUser[];
  system_health: SystemHealth;
}

// ── Data fetch ─────────────────────────────────────────────────────────────

async function fetchStats(): Promise<StatsResponse | null> {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    // Server-side fetch — include cookies manually via absolute URL
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("sc_admin")?.value;

    const res = await fetch(`${APP_URL}/api/admin/stats`, {
      headers: {
        Cookie: `sc_admin=${adminCookie}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function planColor(plan: string) {
  const map: Record<string, string> = {
    free: "text-gray-400",
    basic: "text-blue-400",
    growth: "text-indigo-400",
    scale: "text-purple-400",
  };
  return map[plan] ?? "text-gray-400";
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const stats = await fetchStats();

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-red-400 text-sm">Failed to load stats. Check server logs.</p>
      </div>
    );
  }

  const { kpi, plan_distribution, recent_signups, top_users, system_health } = stats;
  const totalUsers = kpi.total_users || 1; // avoid divide-by-zero

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">⬡ Schema<span className="text-indigo-400">Check</span></span>
          <span className="text-xs px-2 py-0.5 bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 rounded-full">Admin</span>
        </div>
        <AdminSignOutButton />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ── KPI Row ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KpiCard label="Total users" value={kpi.total_users.toLocaleString()} />
            <KpiCard label="MRR" value={`$${kpi.mrr.toLocaleString()}`} sub="paid plans" />
            <KpiCard label="Total validations" value={kpi.total_validations.toLocaleString()} />
            <KpiCard label="Validations this month" value={kpi.validations_this_month.toLocaleString()} />
            <KpiCard label="Cache hit rate" value={`${kpi.cache_rate}%`} sub="same URL within 1h" />
          </div>
        </div>

        {/* ── Plan Distribution ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Plan distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["free", "basic", "growth", "scale"] as const).map((plan) => {
              const count = plan_distribution[plan] ?? 0;
              const pct = Math.round((count / totalUsers) * 100);
              return (
                <div key={plan} className="bg-[#16161f] border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium capitalize ${planColor(plan)}`}>{plan}</span>
                    <span className="text-xs text-gray-600">{pct}%</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{count.toLocaleString()}</p>
                  <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Signups ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Recent signups</h2>
          <div className="bg-[#16161f] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Email</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Plan</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Usage</th>
                  <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">Stripe</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recent_signups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-600 py-8">No users yet</td>
                  </tr>
                )}
                {recent_signups.map((u, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs truncate max-w-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`capitalize text-xs font-medium ${planColor(u.plan)}`}>{u.plan}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">
                      {u.requests_used.toLocaleString()} / {u.requests_limit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.has_stripe
                        ? <span className="text-green-500 text-xs">✓</span>
                        : <span className="text-gray-700 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Top Users ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Top users by usage</h2>
          <div className="bg-[#16161f] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">#</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Email</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Plan</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Used</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Limit</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">% used</th>
                </tr>
              </thead>
              <tbody>
                {top_users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-600 py-8">No usage data</td>
                  </tr>
                )}
                {top_users.map((u, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gray-600 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs truncate max-w-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`capitalize text-xs font-medium ${planColor(u.plan)}`}>{u.plan}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300 text-xs">{u.requests_used.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">{u.requests_limit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium ${u.percent_used >= 90 ? "text-red-400" : u.percent_used >= 70 ? "text-yellow-400" : "text-gray-400"}`}>
                        {u.percent_used}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── System Health ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">System health</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Avg response time"
              value={`${system_health.avg_response_time_ms}ms`}
            />
            <KpiCard
              label="Schemas validated"
              value={system_health.total_schemas_found.toLocaleString()}
            />
            <KpiCard
              label="Error rate"
              value={`${system_health.error_rate_percent}%`}
              sub="requests with errors"
            />
            <KpiCard
              label="Active users (month)"
              value={system_health.active_users_this_month.toLocaleString()}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
