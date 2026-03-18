interface Stats {
  total_validations: number;
  total_schemas: number;
  avg_response_ms: number;
  cache_hit_rate: number;
}

interface QuickStatsProps {
  stats: Stats;
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Validations"
        value={stats.total_validations.toLocaleString()}
        sub="all time"
      />
      <StatCard
        label="Schemas Validated"
        value={stats.total_schemas.toLocaleString()}
        sub="individual schemas checked"
      />
      <StatCard
        label="Avg Response Time"
        value={`${stats.avg_response_ms}ms`}
        sub="across all requests"
      />
      <StatCard
        label="Cache Hit Rate"
        value={`${stats.cache_hit_rate.toFixed(1)}%`}
        sub="cached results are free"
      />
    </div>
  );
}
