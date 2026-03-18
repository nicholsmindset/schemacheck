"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/dashboard/logout", { method: "POST" });
    router.push("/dashboard/login");
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-gray-400 hover:text-white transition-colors"
    >
      Sign out
    </button>
  );
}
