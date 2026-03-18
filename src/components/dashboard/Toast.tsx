"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "welcome";
}

export function Toast({ message, type }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const colors =
    type === "success"
      ? "bg-green-900/60 border-green-700 text-green-300"
      : "bg-indigo-900/60 border-indigo-700 text-indigo-300";

  return (
    <div className={`border rounded-lg px-4 py-3 flex items-center justify-between gap-4 ${colors}`}>
      <span className="text-sm">{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity shrink-0"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
