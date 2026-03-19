"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 lg:py-20">

        <div className="mb-10">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Contact
          </p>
          <h1 className="text-3xl font-bold text-white mb-3">Get in touch</h1>
          <p className="text-gray-400">
            Questions about the API, billing, or integrations? We typically respond within one business day.
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded-xl border border-green-800/50 bg-green-950/20 text-center">
            <p className="text-green-400 font-medium mb-1">Message sent!</p>
            <p className="text-sm text-gray-400 mb-4">
              Thanks for reaching out. We&apos;ll get back to you shortly.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-xs text-gray-400 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#16161f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs text-gray-400 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#16161f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-xs text-gray-400 mb-1.5">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this about?"
                className="w-full bg-[#16161f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs text-gray-400 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you need..."
                className="w-full bg-[#16161f] border border-gray-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors resize-none"
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
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-gray-800 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Email</p>
            <a
              href="mailto:hello@schemacheck.dev"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              hello@schemacheck.dev
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Response time</p>
            <p className="text-sm text-gray-400">Within 1 business day</p>
          </div>
        </div>

      </div>
    </div>
  );
}
