"use client";

import { useEffect } from "react";
import Image from "next/image";
import { NormalizedMedia } from "@/types/movie";
import { getPosterUrl, getBackdropUrl, getReleaseYear } from "@/lib/tmdb";
import { useWatchlistStore } from "@/store/watchlist-store";
import { WatchStatus } from "@/types/watchlist";

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure",
  10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy",
  10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};

const STATUS_OPTIONS: { status: WatchStatus; icon: string; label: string }[] = [
  { status: "liked", icon: "❤️", label: "Liked" },
  { status: "want_to_watch", icon: "🔖", label: "Want to watch" },
  { status: "watching", icon: "👀", label: "Watching" },
  { status: "waiting_for_season", icon: "⏳", label: "Waiting for season" },
  { status: "disliked", icon: "👎", label: "Disliked" },
];

interface Props {
  movie: NormalizedMedia;
  onClose: () => void;
}

export default function MovieDetailModal({ movie, onClose }: Props) {
  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getPosterUrl(movie.poster_path);
  const year = getReleaseYear(movie.release_date);
  const rating = movie.vote_average.toFixed(1);
  const genres = movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean);

  const { getStatus, setStatus, removeEntry } = useWatchlistStore();
  const currentStatus = getStatus(movie.id, movie.media_type);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSelect(status: WatchStatus) {
    if (currentStatus === status) {
      await removeEntry(movie.id, movie.media_type);
    } else {
      await setStatus(movie.id, movie.media_type, status, {
        title: movie.title,
        poster_path: movie.poster_path,
        genre_ids: movie.genre_ids,
        vote_average: movie.vote_average,
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg bg-[#0f0f18] sm:rounded-2xl overflow-hidden border-t sm:border border-white/10 shadow-2xl max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 text-gray-300 flex items-center justify-center hover:text-white hover:bg-black/90 transition-all"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Backdrop image */}
        {backdropUrl && (
          <div className="relative h-44 flex-shrink-0 w-full">
            <Image
              src={backdropUrl}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f18] via-[#0f0f18]/30 to-transparent" />
          </div>
        )}

        {/* Header row: poster + title */}
        <div className={`flex gap-4 px-5 flex-shrink-0 ${backdropUrl ? "-mt-14 relative" : "pt-12"}`}>
          {posterUrl && (
            <Image
              src={posterUrl}
              alt={movie.title}
              width={76}
              height={114}
              className="rounded-lg border border-white/10 shadow-lg flex-shrink-0 object-cover"
            />
          )}
          <div className="flex-1 min-w-0 pt-2 pb-1">
            <h2 className="text-white font-bold text-lg leading-snug">{movie.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {year && <span className="text-gray-400 text-sm">{year}</span>}
              <span className="bg-[#f5c518]/15 text-[#f5c518] px-2 py-0.5 rounded text-xs font-semibold">
                ★ {rating}
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-500 border border-white/15 px-1.5 py-0.5 rounded">
                {movie.media_type === "tv" ? "TV" : "Film"}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-6 pt-4 space-y-4">
          {/* Overview */}
          {movie.overview ? (
            <p className="text-gray-300 text-sm leading-relaxed">{movie.overview}</p>
          ) : (
            <p className="text-gray-500 text-sm italic">No overview available.</p>
          )}

          {/* Genre tags */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/8 text-gray-300 border border-white/10"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Watchlist actions */}
          <div className="pt-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2.5">
              Add to watchlist
            </p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = currentStatus === opt.status;
                return (
                  <button
                    key={opt.status}
                    onClick={() => handleSelect(opt.status)}
                    title={opt.label}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all ${
                      active
                        ? "bg-[#f5c518]/20 border border-[#f5c518]/50 text-[#f5c518]"
                        : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-base leading-none">{opt.icon}</span>
                    <span className="leading-tight text-center" style={{ fontSize: "10px" }}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
