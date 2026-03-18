"use client";

import { useRouter } from "next/navigation";

export function AdminSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
    >
      Sign out
    </button>
  );
}
