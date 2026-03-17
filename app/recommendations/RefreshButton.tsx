"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    router.refresh();
    // Give the server a moment to revalidate, then stop the spinner
    setTimeout(() => setLoading(false), 1200);
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
    >
      <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
      {loading ? "Refreshing…" : "Refresh"}
    </button>
  );
}
