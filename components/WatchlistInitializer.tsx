"use client";

import { useEffect } from "react";
import { useWatchlistStore } from "@/store/watchlist-store";

export default function WatchlistInitializer() {
  const { initialized, initialize } = useWatchlistStore();

  useEffect(() => {
    if (initialized) return;
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then(({ entries }) => initialize(entries))
      .catch(console.error);
  }, [initialized, initialize]);

  return null;
}
