"use client";

import { useState } from "react";
import Image from "next/image";
import { WatchlistEntry, WatchStatus } from "@/types/watchlist";
import { useWatchlistStore } from "@/store/watchlist-store";
import { getPosterUrl, getReleaseYear } from "@/lib/tmdb";

const GROUPS: { status: WatchStatus; label: string; icon: string }[] = [
  { status: "liked", label: "Liked", icon: "❤️" },
  { status: "want_to_watch", label: "Want to Watch", icon: "🔖" },
  { status: "watching", label: "Watching", icon: "👀" },
  { status: "waiting_for_season", label: "Waiting for Season", icon: "⏳" },
  { status: "disliked", label: "Disliked", icon: "👎" },
];

const STATUS_OPTIONS: { status: WatchStatus; icon: string; label: string }[] = [
  { status: "liked", icon: "❤️", label: "Liked" },
  { status: "disliked", icon: "👎", label: "Disliked" },
  { status: "want_to_watch", icon: "🔖", label: "Want to Watch" },
  { status: "watching", icon: "👀", label: "Watching" },
  { status: "waiting_for_season", icon: "⏳", label: "Waiting for Season" },
];

interface Props {
  initialEntries: WatchlistEntry[];
}

export default function WatchlistClient({ initialEntries }: Props) {
  const { entries: storeEntries, initialized, setStatus, removeEntry } = useWatchlistStore();
  const entries = initialized ? storeEntries : initialEntries;

  const [dislikedExpanded, setDislikedExpanded] = useState(false);

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: entries.filter((e) => e.status === g.status),
  }));

  const total = entries.length;

  if (total === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">🍿</p>
        <p className="text-xl">Your watchlist is empty.</p>
        <p className="text-sm mt-2">Hover over any movie or show card to add it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {grouped.map((group) => {
        if (group.items.length === 0) return null;
        const isDisliked = group.status === "disliked";
        const showItems = isDisliked ? dislikedExpanded : true;

        return (
          <section key={group.status}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{group.icon}</span>
              <h2 className="text-xl font-semibold text-white">{group.label}</h2>
              <span className="text-sm text-gray-400">({group.items.length})</span>
              {isDisliked && (
                <button
                  onClick={() => setDislikedExpanded((v) => !v)}
                  className="ml-2 text-xs text-gray-400 hover:text-white transition-colors border border-white/20 rounded px-2 py-0.5"
                >
                  {dislikedExpanded ? "Collapse" : "Show"}
                </button>
              )}
            </div>

            {showItems && (
              <div className="flex flex-col gap-3">
                {group.items.map((entry) => (
                  <EntryRow
                    key={`${entry.tmdb_id}-${entry.media_type}`}
                    entry={entry}
                    onStatusChange={(status) =>
                      setStatus(entry.tmdb_id, entry.media_type, status, {
                        title: entry.title,
                        poster_path: entry.poster_path,
                        genre_ids: entry.genre_ids,
                        vote_average: entry.vote_average,
                      })
                    }
                    onRemove={() => removeEntry(entry.tmdb_id, entry.media_type)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function EntryRow({
  entry,
  onStatusChange,
  onRemove,
}: {
  entry: WatchlistEntry;
  onStatusChange: (status: WatchStatus) => void;
  onRemove: () => void;
}) {
  const posterUrl = getPosterUrl(entry.poster_path);
  const year = entry.added_at ? getReleaseYear(new Date(entry.added_at).toISOString()) : "";

  return (
    <div className="flex items-center gap-4 bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-colors">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={entry.title}
          width={48}
          height={72}
          className="rounded object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-[72px] bg-white/10 rounded flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{entry.title}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {entry.media_type === "tv" ? "TV Show" : "Movie"}{year ? ` · ${year}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.status}
            onClick={() => onStatusChange(opt.status)}
            title={opt.label}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110 ${
              entry.status === opt.status
                ? "bg-[#f5c518] shadow-[0_0_8px_rgba(245,197,24,0.5)]"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {opt.icon}
          </button>
        ))}
        <button
          onClick={onRemove}
          title="Remove"
          className="ml-2 w-7 h-7 rounded-full flex items-center justify-center text-xs text-gray-400 bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
