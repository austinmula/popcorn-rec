"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import MovieGrid from "@/components/MovieGrid";
import RefreshButton from "./RefreshButton";
import { useWatchlistStore } from "@/store/watchlist-store";
import { NormalizedMedia } from "@/types/movie";

export default function RecommendationsPage() {
  const entries = useWatchlistStore((s) => s.entries);
  const likedEntries = entries.filter((e) => e.status === "liked");

  const [recommendations, setRecommendations] = useState<NormalizedMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likedEntries, allEntries: entries }),
      });
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  const hasLiked = likedEntries.length > 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-[#f5c518] text-sm hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
      <div className="flex items-center justify-between mt-4 mb-2">
        <h1 className="text-3xl font-bold text-white">For You</h1>
        {hasLiked && <RefreshButton onRefresh={fetchRecs} />}
      </div>
      <p className="text-gray-400 mb-8">
        Personalized picks based on your liked movies and shows
      </p>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4 animate-pulse">🍿</p>
          <p className="text-xl">Finding picks for you…</p>
        </div>
      ) : !hasLiked ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">❤️</p>
          <p className="text-xl">Like some movies or shows first.</p>
          <p className="text-sm mt-2">
            Tap any card and press ❤️ to get personalized recommendations.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2 border border-[#f5c518] text-[#f5c518] rounded-full hover:bg-[#f5c518]/10 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">No new recommendations found.</p>
          <p className="text-sm mt-2">Try liking more movies or shows.</p>
        </div>
      ) : (
        <MovieGrid movies={recommendations} />
      )}
    </main>
  );
}
