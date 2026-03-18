import { PLAN_CONFIG } from "@/lib/stripe";
import type { ApiKeyRow } from "@/lib/validator/types";

const PLAN_BADGE: Record<string, string> = {
  free:   "bg-gray-700 text-gray-300",
  basic:  "bg-blue-900/60 text-blue-300",
  growth: "bg-indigo-900/60 text-indigo-300",
  scale:  "bg-purple-900/60 text-purple-300",
};

function getResetDate(): string {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return first.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

interface UsageOverviewProps {
  apiKey: ApiKeyRow;
}

export function UsageOverview({ apiKey }: UsageOverviewProps) {
  const { plan, requests_used, requests_limit, overage_rate } = apiKey;
  const pct = Math.min(100, requests_limit > 0 ? (requests_used / requests_limit) * 100 : 0);
  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-green-500";

  const isOverage = plan !== "free" && requests_used > requests_limit;
  const overageCount = isOverage ? requests_used - requests_limit : 0;
  const overageCost = isOverage ? (overageCount * Number(overage_rate)).toFixed(2) : "0.00";

  const rateLimit = PLAN_CONFIG[plan]?.rate_limit_per_min ?? 10;
  const badgeClass = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl p-6 h-full">
      {/* Plan badge */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Usage
        </h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${badgeClass}`}>
          {plan}
        </span>
      </div>

      {/* Usage bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white font-medium">
            {requests_used.toLocaleString()} / {requests_limit.toLocaleString()}
          </span>
          <span className="text-gray-400">{pct.toFixed(0)}%</span>
        </div>
        <div className="bg-gray-800 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          validations used this month
        </p>
      </div>

      {/* Credits remaining */}
      <div className="flex justify-between text-sm py-2 border-t border-gray-800">
        <span className="text-gray-400">Credits remaining</span>
        <span className="text-white font-medium">
          {Math.max(0, requests_limit - requests_used).toLocaleString()}
        </span>
      </div>

      {/* Overage */}
      {isOverage && (
        <div className="flex justify-between text-sm py-2 border-t border-gray-800">
          <span className="text-gray-400">Overage</span>
          <span className="text-yellow-400 font-medium">
            {overageCount.toLocaleString()} × ${overage_rate} ≈ ${overageCost}
          </span>
        </div>
      )}

      {/* Resets */}
      <div className="flex justify-between text-sm py-2 border-t border-gray-800">
        <span className="text-gray-400">Resets</span>
        <span className="text-white">{getResetDate()}</span>
      </div>

      {/* Rate limit */}
      <div className="flex justify-between text-sm py-2 border-t border-gray-800">
        <span className="text-gray-400">Rate limit</span>
        <span className="text-white">{rateLimit} req / min</span>
      </div>
    </div>
  );
}
