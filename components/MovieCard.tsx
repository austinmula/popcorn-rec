"use client";

import { useState } from "react";
import Image from "next/image";
import { NormalizedMedia } from "@/types/movie";
import { getPosterUrl, getReleaseYear } from "@/lib/tmdb";
import WatchlistButton from "./WatchlistButton";
import MovieDetailModal from "./MovieDetailModal";

interface MovieCardProps {
  movie: NormalizedMedia;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [showModal, setShowModal] = useState(false);
  const posterUrl = getPosterUrl(movie.poster_path);
  const year = getReleaseYear(movie.release_date);
  const rating = movie.vote_average.toFixed(1);

  return (
    <>
      <div
        className="group relative flex-shrink-0 w-[160px] cursor-pointer"
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
            {rating}
          </div>
          {/* Always visible on touch (mobile), hover-only on desktop */}
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

      {showModal && (
        <MovieDetailModal movie={movie} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
