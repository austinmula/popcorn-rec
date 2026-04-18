"use client";

import { useState } from "react";
import Image from "next/image";
import { NormalizedMedia } from "@/types/movie";
import { getPosterUrl, getReleaseYear } from "@/lib/tmdb";
import WatchlistButton from "./WatchlistButton";
import MovieDetailModal from "./MovieDetailModal";

interface AIPickCardProps {
  movie: NormalizedMedia;
  reason: string;
}

function AIPickCard({ movie, reason }: AIPickCardProps) {
  const [showModal, setShowModal] = useState(false);
  const posterUrl = getPosterUrl(movie.poster_path);
  const year = getReleaseYear(movie.release_date);

  return (
    <>
      <div className="group flex flex-col gap-2">
        <div
          className="relative flex-shrink-0 w-full cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all duration-300 group-hover:scale-105 group-hover:border-[#f5c518]/50 group-hover:shadow-[0_0_20px_rgba(245,197,24,0.2)]">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movie.title}
                width={160}
                height={240}
                className="w-full h-[240px] object-cover"
              />
            ) : (
              <div className="w-full h-[240px] bg-white/10 flex items-center justify-center text-gray-500 text-sm text-center px-2">
                No Image
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/80 text-[#f5c518] text-xs font-bold px-1.5 py-0.5 rounded">
              {movie.vote_average.toFixed(1)}
            </div>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <WatchlistButton
                tmdb_id={movie.id}
                media_type={movie.media_type}
                title={movie.title}
                poster_path={movie.poster_path}
                genre_ids={movie.genre_ids}
                vote_average={movie.vote_average}
              />
            </div>
          </div>
          <div className="mt-2 px-0.5">
            <p className="text-white text-sm font-medium leading-tight line-clamp-2 group-hover:text-[#f5c518] transition-colors">
              {movie.title}
            </p>
            {year && <p className="text-gray-400 text-xs mt-0.5">{year}</p>}
          </div>
        </div>
        <p className="text-gray-400 text-xs leading-snug px-0.5 line-clamp-3">
          <span className="text-[#f5c518] font-medium">Why: </span>
          {reason}
        </p>
      </div>

      {showModal && (
        <MovieDetailModal movie={movie} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

interface AIPicksSectionProps {
  tasteProfile: string;
  picks: { media: NormalizedMedia; reason: string }[];
}

export default function AIPicksSection({ tasteProfile, picks }: AIPicksSectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">✨</span>
        <h2 className="text-xl font-semibold text-white">AI Top Picks</h2>
        <span className="text-xs text-[#f5c518] border border-[#f5c518]/40 rounded-full px-2 py-0.5">
          Claude
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-6 max-w-2xl">{tasteProfile}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {picks.map(({ media, reason }) => (
          <AIPickCard key={`${media.id}:${media.media_type}`} movie={media} reason={reason} />
        ))}
      </div>
    </section>
  );
}
