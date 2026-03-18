"use client";

import { useState } from "react";

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

interface ActivityTableProps {
  initialRows: UsageLogRow[];
  initialTotal: number;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Check() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Dash() {
  return <span className="text-gray-600">—</span>;
}

export function ActivityTable({ initialRows, initialTotal }: ActivityTableProps) {
  const [rows, setRows] = useState<UsageLogRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  async function fetchPage(p: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/activity?page=${p}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows);
        setTotal(data.total);
        setPage(p);
      }
    } finally {
      setLoading(false);
    }
  }

  if (rows.length === 0 && !loading) {
    return (
      <div className="bg-[#16161f] border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-400 text-sm">No validation activity yet.</p>
        <p className="text-gray-600 text-sm mt-1">
          Start using your API key to see request history here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Recent Activity
        </h2>
        <span className="text-xs text-gray-500">{total.toLocaleString()} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">Time</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">Type</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">Schemas</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">Errors</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">Response</th>
              <th className="text-center px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">Cached</th>
              <th className="text-center px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">Credited</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                <td className="px-6 py-3 text-gray-400 whitespace-nowrap font-mono text-xs">
                  {relativeTime(row.created_at)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.input_type === "url"
                      ? "bg-blue-900/40 text-blue-300"
                      : "bg-gray-800 text-gray-300"
                  }`}>
                    {row.input_type === "url" ? "URL" : "JSON-LD"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-300">{row.schemas_found}</td>
                <td className="px-4 py-3 text-right">
                  {row.errors_found > 0 ? (
                    <span className="text-red-400">{row.errors_found}</span>
                  ) : (
                    <span className="text-gray-600">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-300 font-mono text-xs whitespace-nowrap">
                  {row.response_time_ms}ms
                </td>
                <td className="px-4 py-3 text-center">{row.cached ? <Check /> : <Dash />}</td>
                <td className="px-4 py-3 text-center">{row.credited ? <Check /> : <Dash />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || loading}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
