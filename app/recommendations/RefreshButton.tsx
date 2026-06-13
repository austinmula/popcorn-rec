"use client";

import { useState } from "react";

interface Props {
  onRefresh: () => Promise<void>;
}

export default function RefreshButton({ onRefresh }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    await onRefresh();
    setLoading(false);
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
