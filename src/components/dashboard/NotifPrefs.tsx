import type { ApiKeyRow } from "@/lib/validator/types";

interface NotifPrefsProps {
  apiKey: ApiKeyRow;
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
        active ? "bg-green-500" : "bg-gray-600"
      }`}
    />
  );
}

export function NotifPrefs({ apiKey }: NotifPrefsProps) {
  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5">
        Notifications
      </h2>

      <p className="text-sm text-gray-400 mb-5">
        Alerts sent to{" "}
        <span className="text-white font-mono text-xs">{apiKey.email}</span>
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2.5 border-t border-gray-800">
          <div>
            <p className="text-sm text-white">90% usage alert</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {apiKey.notified_90
                ? "Triggered this period"
                : "Not yet triggered"}
            </p>
          </div>
          <span className="flex items-center text-xs text-gray-400">
            <StatusDot active />
            Active
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 border-t border-gray-800">
          <div>
            <p className="text-sm text-white">100% usage alert</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {apiKey.notified_100
                ? "Triggered this period"
                : "Not yet triggered"}
            </p>
          </div>
          <span className="flex items-center text-xs text-gray-400">
            <StatusDot active />
            Active
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-5">
        Contact support to change your notification email.
      </p>
    </div>
  );
}
