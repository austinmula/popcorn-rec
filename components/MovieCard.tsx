import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types/movie";
import { getPosterUrl, getReleaseYear } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path);
  const year = getReleaseYear(movie.release_date);
  const rating = movie.vote_average.toFixed(1);

  return (
    <div className="group relative flex-shrink-0 w-[160px] cursor-pointer">
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
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-white text-sm font-medium leading-tight line-clamp-2 group-hover:text-[#f5c518] transition-colors">
          {movie.title}
        </p>
        {year && <p className="text-gray-400 text-xs mt-0.5">{year}</p>}
      </div>
    </div>
  );
}
