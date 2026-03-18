const stats = [
  { value: "35", label: "Schema types validated" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<200ms", label: "Median response time" },
  { value: "Free", label: "100 validations / month" },
];

export function Stats() {
  return (
    <section className="border-y border-gray-800 py-10 px-4 bg-gray-950/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
