"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) setMode("signup");
  }, [plan]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          setError(signupData.error?.message ?? "Signup failed. Please try again.");
          setLoading(false);
          return;
        }
        // Redirect to verify-email page — key is NOT created yet
        router.push(`/dashboard/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      const loginRes = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setError(loginData.error?.message ?? "No account found for that email.");
        setLoading(false);
        return;
      }

      if (plan) {
        const checkoutRes = await fetch("/api/dashboard/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, billing: "monthly" }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-xl font-bold text-white">
            ⬡ Schema<span className="text-indigo-400">Check</span>
          </Link>
        </div>

        <div className="bg-[#16161f] border border-gray-800 rounded-xl p-8">
          {plan && (
            <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg px-4 py-2.5 mb-6">
              <p className="text-sm text-indigo-300 text-center">
                {mode === "signup"
                  ? `Create an account to start your ${capitalize(plan)} plan`
                  : `Sign in to upgrade to ${capitalize(plan)}`}
              </p>
            </div>
          )}

          <h1 className="text-lg font-semibold text-white mb-1 text-center">
            {mode === "signup" ? "Create your account" : "Sign in to dashboard"}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {mode === "signup"
              ? "Your API key will be emailed to you"
              : "Enter the email you signed up with"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs text-gray-400 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0a0a0f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading
                ? mode === "signup"
                  ? plan
                    ? "Creating account & opening checkout…"
                    : "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                  ? plan
                    ? `Create account & upgrade to ${capitalize(plan)}`
                    : "Create account"
                  : plan
                    ? `Sign in & upgrade to ${capitalize(plan)}`
                    : "Sign in"}
            </button>
          </form>

          <div className="mt-5 text-center">
            {mode === "login" ? (
              <p className="text-sm text-gray-500">
                No account?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(null); }}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(null); }}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          By continuing you agree to our{" "}
          <Link href="/legal/terms" className="hover:text-gray-500 transition-colors">Terms</Link>
          {" & "}
          <Link href="/legal/privacy" className="hover:text-gray-500 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
