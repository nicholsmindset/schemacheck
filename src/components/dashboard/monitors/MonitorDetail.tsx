"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MonitorStatus, MonitorEventType } from "@/lib/monitors";
import type { MonitorRow } from "./MonitorsList";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MonitorEventRow {
  id: string;
  monitor_id: string;
  event_type: MonitorEventType;
  previous_value: unknown;
  new_value: unknown;
  details: unknown;
  created_at: string;
}

interface MonitorDetailProps {
  monitor: MonitorRow;
  history: MonitorEventRow[];
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

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }) + " " + d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

// ─── StatusDot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: MonitorStatus | null }) {
  const color =
    status === "healthy"  ? "bg-green-500" :
    status === "degraded" ? "bg-yellow-500" :
    status === "broken"   ? "bg-red-500" :
    "bg-gray-600";

  const label =
    status === "healthy"  ? "Healthy" :
    status === "degraded" ? "Degraded" :
    status === "broken"   ? "Broken" :
    "Never checked";

  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
      <span className={
        status === "healthy"  ? "text-green-400" :
        status === "degraded" ? "text-yellow-400" :
        status === "broken"   ? "text-red-400" :
        "text-gray-500"
      }>
        {label}
      </span>
    </span>
  );
}

// ─── EventTypeBadge ──────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: MonitorEventType }) {
  const config: Record<MonitorEventType, { label: string; cls: string }> = {
    score_drop:       { label: "Score drop",       cls: "bg-red-900/50 text-red-300" },
    new_error:        { label: "New error",         cls: "bg-red-900/50 text-red-300" },
    eligibility_lost: { label: "Eligibility lost",  cls: "bg-red-900/50 text-red-300" },
    schema_removed:   { label: "Schema removed",    cls: "bg-orange-900/50 text-orange-300" },
    recovered:        { label: "Recovered",         cls: "bg-green-900/50 text-green-300" },
    check_failed:     { label: "Check failed",      cls: "bg-red-900/50 text-red-300" },
    check_result:     { label: "Check result",      cls: "bg-gray-800 text-gray-400" },
  };
  const { label, cls } = config[type] ?? { label: type, cls: "bg-gray-800 text-gray-400" };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

// ─── EventDetails ─────────────────────────────────────────────────────────────

function EventDetails({ event }: { event: MonitorEventRow }) {
  const nv = event.new_value as Record<string, unknown> | null;
  const pv = event.previous_value as Record<string, unknown> | null;
  const det = event.details as Record<string, unknown> | null;

  switch (event.event_type) {
    case "score_drop":
      return (
        <span className="text-gray-400">
          Score dropped from{" "}
          <span className="text-white font-mono">{String(pv?.score ?? "?")}</span>
          {" "}to{" "}
          <span className="text-red-400 font-mono">{String(nv?.score ?? "?")}</span>
          {det?.drop ? ` (−${det.drop})` : ""}
        </span>
      );
    case "new_error":
      return (
        <span className="text-gray-400">
          New error on{" "}
          <span className="text-white">{String(nv?.type ?? "?")}</span>
          {nv?.property ? (
            <> — <span className="font-mono text-xs text-red-300">{String(nv.property)}</span></>
          ) : null}
        </span>
      );
    case "eligibility_lost":
      return (
        <span className="text-gray-400">
          <span className="text-white">{String(det?.schema_type ?? nv?.type ?? "?")}</span>
          {" "}lost rich result eligibility
        </span>
      );
    case "schema_removed":
      return (
        <span className="text-gray-400">
          Schema type <span className="text-white">{String(pv?.type ?? det?.schema_type ?? "?")}</span> was removed
        </span>
      );
    case "recovered":
      return (
        <span className="text-gray-400">
          Recovered — score{" "}
          <span className="text-white font-mono">{String(pv?.score ?? "?")}</span>
          {" "}→{" "}
          <span className="text-green-400 font-mono">{String(nv?.score ?? "?")}</span>
        </span>
      );
    case "check_failed":
      return <span className="text-gray-400">Check failed — could not reach URL</span>;
    case "check_result":
      return (
        <span className="text-gray-400">
          Routine check
          {typeof nv?.score === "number" ? (
            <> — score <span className="text-white font-mono">{nv.score}</span></>
          ) : null}
        </span>
      );
    default:
      return <span className="text-gray-500 text-xs font-mono">{JSON.stringify(event.new_value)}</span>;
  }
}

// ─── SettingsPanel ────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  monitor: MonitorRow;
  onUpdate: (updated: MonitorRow) => void;
}

function SettingsPanel({ monitor, onUpdate }: SettingsPanelProps) {
  const [frequency, setFrequency] = useState<"daily" | "weekly">(monitor.frequency);
  const [alertOn, setAlertOn] = useState<"all" | "errors" | "digest">(monitor.alert_on);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/v1/monitors/${monitor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency, alert_on: alertOn }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Failed to save settings.");
        setSaving(false);
        return;
      }
      onUpdate(data.monitor as MonitorRow);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePauseToggle() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/monitors/${monitor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: !monitor.paused }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Failed to update monitor.");
        setSaving(false);
        return;
      }
      onUpdate(data.monitor as MonitorRow);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5">
        Settings
      </h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="detail-frequency" className="block text-xs text-gray-400 mb-1.5">
            Check frequency
          </label>
          <select
            id="detail-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
            className="w-full bg-[#0a0a0f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div>
          <label htmlFor="detail-alert" className="block text-xs text-gray-400 mb-1.5">
            Alert preference
          </label>
          <select
            id="detail-alert"
            value={alertOn}
            onChange={(e) => setAlertOn(e.target.value as "all" | "errors" | "digest")}
            className="w-full bg-[#0a0a0f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
          >
            <option value="all">All changes</option>
            <option value="errors">Errors only</option>
            <option value="digest">Weekly digest</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">
              {monitor.paused ? "Monitor paused" : "Monitor active"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {monitor.paused
                ? "No checks will run until resumed."
                : "Checks run on schedule."}
            </p>
          </div>
          <button
            onClick={handlePauseToggle}
            disabled={saving}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              monitor.paused
                ? "bg-green-700 hover:bg-green-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            {monitor.paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DeleteMonitorButton ──────────────────────────────────────────────────────

function DeleteMonitorButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/monitors/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/monitors");
      } else {
        const data = await res.json();
        setError(data.error?.message ?? "Failed to delete monitor.");
        setLoading(false);
        setConfirm(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Danger Zone
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Permanently delete this monitor and all its history. This cannot be undone.
      </p>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
        >
          Delete Monitor
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Deleting…" : "Yes, delete permanently"}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MonitorDetail (main export) ─────────────────────────────────────────────

export function MonitorDetail({ monitor: initialMonitor, history }: MonitorDetailProps) {
  const [monitor, setMonitor] = useState<MonitorRow>(initialMonitor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <StatusDot status={monitor.last_status} />
        </div>
        <h1
          className="text-lg font-bold text-white font-mono break-all"
          title={monitor.url}
        >
          {monitor.url}
        </h1>
        {monitor.paused && (
          <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-400 font-medium">
            Paused
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#16161f] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
            Current Score
          </p>
          {monitor.last_score !== null ? (
            <p className={`text-2xl font-bold ${
              monitor.last_score >= 70 ? "text-green-400" :
              monitor.last_score >= 40 ? "text-yellow-400" :
              "text-red-400"
            }`}>
              {monitor.last_score}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-600">—</p>
          )}
        </div>

        <div className="bg-[#16161f] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
            Last Checked
          </p>
          <p className="text-sm font-semibold text-white">
            {relativeTime(monitor.last_checked_at)}
          </p>
        </div>

        <div className="bg-[#16161f] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
            Status
          </p>
          <StatusDot status={monitor.last_status} />
        </div>

        <div className="bg-[#16161f] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
            Frequency
          </p>
          <p className="text-sm font-semibold text-white capitalize">{monitor.frequency}</p>
        </div>
      </div>

      {/* History table + Settings — two-column on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-[#16161f] border border-gray-800 rounded-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Event History
              </h2>
              <span className="text-xs text-gray-500">{history.length} events</span>
            </div>

            {history.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-gray-500 text-sm">No events yet.</p>
                <p className="text-gray-600 text-sm mt-1">
                  Events will appear here after the first check runs.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">
                        Time
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">
                        Event
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-widest">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                      >
                        <td className="px-6 py-3 text-gray-400 whitespace-nowrap font-mono text-xs">
                          {formatTimestamp(event.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <EventTypeBadge type={event.event_type} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <EventDetails event={event} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Settings (1/3 width) */}
        <div className="space-y-4">
          <SettingsPanel monitor={monitor} onUpdate={setMonitor} />
        </div>
      </div>

      {/* Delete */}
      <DeleteMonitorButton id={monitor.id} />
    </div>
  );
}
