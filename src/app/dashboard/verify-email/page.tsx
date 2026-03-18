"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Redirect if no email param
  useEffect(() => {
    if (!email) {
      window.location.href = "/dashboard/login";
    }
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleResend() {
    setStatus("sending");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error?.code === "already_verified") {
          window.location.href = "/dashboard/login";
          return;
        }
        setErrorMsg(data.error?.message ?? "Failed to resend. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("sent");
      setCooldown(60);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-xl font-bold text-white">
            ⬡ Schema<span className="text-indigo-400">Check</span>
          </Link>
        </div>

        <div className="bg-[#16161f] border border-gray-800 rounded-xl p-8 text-center">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-lg font-semibold text-white mb-2">Check your inbox</h1>
          <p className="text-sm text-gray-400 mb-1">We sent a verification link to</p>
          <p className="text-sm font-medium text-indigo-300 mb-6 break-all">{email}</p>

          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Click the link in the email to verify your address and get your free API key.
            The link expires in 24 hours.
          </p>

          {status === "sent" && (
            <p className="text-sm text-green-400 mb-4">
              A new link has been sent — check your inbox.
            </p>
          )}

          {errorMsg && (
            <p className="text-sm text-red-400 mb-4">{errorMsg}</p>
          )}

          <button
            onClick={handleResend}
            disabled={status === "sending" || cooldown > 0}
            className="w-full py-2.5 border border-gray-700 hover:border-gray-500 disabled:opacity-40 text-gray-300 rounded-lg text-sm transition-colors"
          >
            {status === "sending"
              ? "Sending…"
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend verification email"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Wrong email?{" "}
          <Link href="/dashboard/login" className="text-gray-500 hover:text-gray-300 transition-colors">
            Sign up again
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
