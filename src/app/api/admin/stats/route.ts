import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const PLAN_PRICE: Record<string, number> = {
  basic: 19,
  growth: 79,
  scale: 199,
};

export async function GET(): Promise<NextResponse> {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parallel fetches
  const [usersResult, logsResult] = await Promise.all([
    supabase
      .from("api_keys")
      .select("id, email, plan, requests_used, requests_limit, created_at, stripe_customer_id, is_active"),
    supabase
      .from("usage_logs")
      .select("schemas_found, errors_found, response_time_ms, cached, api_key_id, created_at"),
  ]);

  const users = usersResult.data ?? [];
  const logs = logsResult.data ?? [];

  // ── KPI cards ────────────────────────────────────────────────────────────
  const totalUsers = users.length;

  const mrr = users.reduce((sum, u) => {
    return sum + (PLAN_PRICE[u.plan] ?? 0);
  }, 0);

  const totalValidations = users.reduce((sum, u) => sum + (u.requests_used ?? 0), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const logsThisMonth = logs.filter((l) => new Date(l.created_at) >= startOfMonth);
  const validationsThisMonth = logsThisMonth.length;

  const cachedLogs = logs.filter((l) => l.cached);
  const cacheRate = logs.length > 0 ? Math.round((cachedLogs.length / logs.length) * 100) : 0;

  // ── Plan distribution ─────────────────────────────────────────────────────
  const planCounts: Record<string, number> = { free: 0, basic: 0, growth: 0, scale: 0 };
  for (const u of users) planCounts[u.plan] = (planCounts[u.plan] ?? 0) + 1;

  // ── System health ─────────────────────────────────────────────────────────
  const avgResponseTime =
    logs.length > 0
      ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms ?? 0), 0) / logs.length)
      : 0;

  const totalSchemasFound = logs.reduce((sum, l) => sum + (l.schemas_found ?? 0), 0);

  const logsWithErrors = logs.filter((l) => (l.errors_found ?? 0) > 0).length;
  const errorRate = logs.length > 0 ? Math.round((logsWithErrors / logs.length) * 100) : 0;

  const activeApiKeyIds = new Set(logsThisMonth.map((l) => l.api_key_id)).size;

  // ── Recent signups ────────────────────────────────────────────────────────
  const recentSignups = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map((u) => ({
      email: u.email,
      plan: u.plan,
      requests_used: u.requests_used,
      requests_limit: u.requests_limit,
      has_stripe: !!u.stripe_customer_id,
      created_at: u.created_at,
    }));

  // ── Top users by usage ────────────────────────────────────────────────────
  const topUsers = [...users]
    .sort((a, b) => (b.requests_used ?? 0) - (a.requests_used ?? 0))
    .slice(0, 10)
    .map((u) => ({
      email: u.email,
      plan: u.plan,
      requests_used: u.requests_used,
      requests_limit: u.requests_limit,
      percent_used:
        u.requests_limit > 0 ? Math.round((u.requests_used / u.requests_limit) * 100) : 0,
    }));

  return NextResponse.json({
    kpi: {
      total_users: totalUsers,
      mrr,
      total_validations: totalValidations,
      validations_this_month: validationsThisMonth,
      cache_rate: cacheRate,
    },
    plan_distribution: planCounts,
    recent_signups: recentSignups,
    top_users: topUsers,
    system_health: {
      avg_response_time_ms: avgResponseTime,
      total_schemas_found: totalSchemasFound,
      error_rate_percent: errorRate,
      active_users_this_month: activeApiKeyIds,
    },
  });
}
