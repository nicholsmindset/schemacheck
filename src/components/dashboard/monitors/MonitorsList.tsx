"use client";

import { useState } from "react";
import Link from "next/link";
import type { MonitorStatus } from "@/lib/monitors";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MonitorRow {
  id: string;
  user_id: string;
  url: string;
  frequency: "daily" | "weekly";
  alert_on: "all" | "errors" | "digest";
  paused: boolean;
  last_checked_at: string | null;
  last_score: number | null;
  last_status: MonitorStatus | null;
  created_at: string;
}

interface MonitorsListProps {
  initialMonitors: MonitorRow[];
  planMonitorLimit: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function truncateUrl(url: string, max = 52): string {
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    if (display.length <= max) return display;
    return display.slice(0, max - 1) + "…";
  } catch {
    if (url.length <= max) return url;
    return url.slice(0, max - 1) + "…";
  }
}

// ─── StatusDot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: MonitorStatus | null }) {
  const color =
    status === "healthy"  ? "bg-green-500" :
    status === "degraded" ? "bg-yellow-500" :
    status === "broken"   ? "bg-red-500" :
    "bg-gray-600";

  const title =
    status === "healthy"  ? "Healthy" :
    status === "degraded" ? "Degraded" :
    status === "broken"   ? "Broken" :
    "Never checked";

  return (
    <span
      title={title}
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${color}`}
    />
  );
}

// ─── ScoreBadge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-gray-600 text-xs">—</span>;
  }
  const color =
    score >= 70 ? "bg-green-900/50 text-green-300" :
    score >= 40 ? "bg-yellow-900/50 text-yellow-300" :
                  "bg-red-900/50 text-red-300";
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}
    </span>
  );
}

// ─── AddMonitorForm ───────────────────────────────────────────────────────────

interface AddMonitorFormProps {
  onAdd: (monitor: MonitorRow) => void;
  onCancel: () => void;
  atLimit: boolean;
}

function AddMonitorForm({ onAdd, onCancel, atLimit }: AddMonitorFormProps) {
  const [url, setUrl] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [alertOn, setAlertOn] = useState<"all" | "errors" | "digest">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (atLimit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, frequency, alert_on: alertOn }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Failed to create monitor. Please try again.");
        setLoading(false);
        return;
      }
      onAdd(data.monitor as MonitorRow);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#16161f] border border-gray-700 rounded-xl p-6 mb-4">
      <h3 className="text-sm font-semibold text-white mb-5">Add Monitor</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="monitor-url" className="block text-xs text-gray-400 mb-1.5">
            URL to monitor
          </label>
          <input
            id="monitor-url"
            type="url"
            required
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/product-page"
            className="w-full bg-[#0a0a0f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="monitor-frequency" className="block text-xs text-gray-400 mb-1.5">
              Check frequency
            </label>
            <select
              id="monitor-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
              className="w-full bg-[#0a0a0f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label htmlFor="monitor-alert" className="block text-xs text-gray-400 mb-1.5">
              Alert preference
            </label>
            <select
              id="monitor-alert"
              value={alertOn}
              onChange={(e) => setAlertOn(e.target.value as "all" | "errors" | "digest")}
              className="w-full bg-[#0a0a0f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
            >
              <option value="all">All changes</option>
              <option value="errors">Errors only</option>
              <option value="digest">Weekly digest</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || atLimit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Adding…" : "Add Monitor"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── DeleteButton ─────────────────────────────────────────────────────────────

function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/monitors/${id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted();
      } else {
        setLoading(false);
        setConfirm(false);
      }
    } catch {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading ? "Deleting…" : "Confirm"}
        </button>
        <span className="text-gray-700">·</span>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
    >
      Delete
    </button>
  );
}

// ─── MonitorsList (main export) ───────────────────────────────────────────────

export function MonitorsList({ initialMonitors, planMonitorLimit }: MonitorsListProps) {
  const [monitors, setMonitors] = useState<MonitorRow[]>(initialMonitors);
  const [showForm, setShowForm] = useState(false);

  const atLimit = monitors.length >= planMonitorLimit;

  function handleAdd(monitor: MonitorRow) {
    setMonitors((prev) => [monitor, ...prev]);
    setShowForm(false);
  }

  function handleDeleted(id: string) {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Schema Monitors</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">
            {monitors.length} of {planMonitorLimit} used
          </span>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          disabled={atLimit && !showForm}
          title={atLimit ? `Upgrade your plan to add more than ${planMonitorLimit} monitors` : undefined}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Monitor"}
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Track schema changes on your most important URLs.
      </p>

      {/* Limit warning */}
      {atLimit && !showForm && (
        <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-4 py-3">
          <p className="text-sm text-yellow-300">
            You&apos;ve reached your plan limit of {planMonitorLimit} monitor{planMonitorLimit === 1 ? "" : "s"}.{" "}
            <a href="/pricing" className="underline hover:no-underline">Upgrade your plan</a> to add more.
          </p>
        </div>
      )}

      {/* Add monitor form */}
      {showForm && (
        <AddMonitorForm
          onAdd={handleAdd}
          onCancel={() => setShowForm(false)}
          atLimit={atLimit && monitors.length >= planMonitorLimit}
        />
      )}

      {/* Monitors table */}
      {monitors.length === 0 ? (
        <div className="bg-[#16161f] border border-gray-800 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No monitors yet.</p>
          <p className="text-gray-600 text-sm mt-1">
            Add your first URL to start tracking schema changes.
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add your first monitor
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#16161f] border border-gray-800 rounded-xl">
          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap w-6">
                    <span className="sr-only">Status</span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest">
                    URL
                  </th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">
                    Score
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">
                    Last Checked
                  </th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">
                    Frequency
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {monitors.map((monitor) => (
                  <tr
                    key={monitor.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                  >
                    {/* Status dot */}
                    <td className="px-6 py-4">
                      <StatusDot status={monitor.last_status} />
                    </td>

                    {/* URL */}
                    <td className="px-4 py-4 max-w-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-gray-200 font-mono text-xs"
                          title={monitor.url}
                        >
                          {truncateUrl(monitor.url)}
                        </span>
                        {monitor.paused && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 font-medium">
                            Paused
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-4 text-center">
                      <ScoreBadge score={monitor.last_score} />
                    </td>

                    {/* Last checked */}
                    <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {relativeTime(monitor.last_checked_at)}
                    </td>

                    {/* Frequency */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 font-medium capitalize">
                        {monitor.frequency === "daily" ? "Daily" : "Weekly"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/monitors/${monitor.id}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
                        >
                          View →
                        </Link>
                        <DeleteButton
                          id={monitor.id}
                          onDeleted={() => handleDeleted(monitor.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
