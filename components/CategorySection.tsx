import Link from "next/link";
import { NormalizedMedia } from "@/types/movie";
import MovieCard from "./MovieCard";

interface CategorySectionProps {
  title: string;
  movies: NormalizedMedia[];
  seeAllHref?: string;
}

export default function CategorySection({ title, movies, seeAllHref }: CategorySectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm text-[#f5c518] hover:text-[#f5c518]/80 transition-colors"
          >
            See all →
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
