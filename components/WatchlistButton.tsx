"use client";

import { useState } from "react";
import { useWatchlistStore } from "@/store/watchlist-store";
import { WatchStatus, MediaType } from "@/types/watchlist";

interface WatchlistButtonProps {
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

const STATUS_OPTIONS: { status: WatchStatus; icon: string; label: string }[] = [
  { status: "liked", icon: "❤️", label: "Liked" },
  { status: "disliked", icon: "👎", label: "Disliked" },
  { status: "want_to_watch", icon: "🔖", label: "Want to Watch" },
  { status: "watching", icon: "👀", label: "Watching" },
  { status: "waiting_for_season", icon: "⏳", label: "Waiting for Season" },
];

export default function WatchlistButton({
  tmdb_id,
  media_type,
  title,
  poster_path,
  genre_ids,
  vote_average,
}: WatchlistButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const { getStatus, setStatus, removeEntry } = useWatchlistStore();
  const currentStatus = getStatus(tmdb_id, media_type);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((v) => !v);
  }

  async function handleSelect(e: React.MouseEvent, status: WatchStatus) {
    e.preventDefault();
    e.stopPropagation();
    if (currentStatus === status) {
      await removeEntry(tmdb_id, media_type);
    } else {
      await setStatus(tmdb_id, media_type, status, {
        title,
        poster_path,
        genre_ids,
        vote_average,
      });
    }
    setExpanded(false);
  }

  const currentIcon = currentStatus
    ? (STATUS_OPTIONS.find((o) => o.status === currentStatus)?.icon ?? "🔖")
    : "+";

  return (
    <div className="relative flex flex-col items-center">
      {expanded && (
        <div className="absolute bottom-8 flex gap-1 bg-black/90 rounded-full px-2 py-1 border border-white/20">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.status}
              onClick={(e) => handleSelect(e, opt.status)}
              title={opt.label}
              className={`text-base px-1 rounded transition-transform hover:scale-125 ${
                currentStatus === opt.status ? "ring-2 ring-[#f5c518] rounded-full" : ""
              }`}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={handleToggle}
        title={currentStatus ? `Status: ${currentStatus}` : "Add to watchlist"}
        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all
          ${
            currentStatus
              ? "bg-[#f5c518] text-black"
              : "bg-black/70 text-white border border-white/30 hover:border-[#f5c518]"
          }`}
      >
        {currentIcon}
      </button>
    </div>
  );
}
