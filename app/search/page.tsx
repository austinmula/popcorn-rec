import Link from "next/link";
import { fetchSearchMulti } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1", 10);
  const query = q.trim();

  if (!query) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-4">Search</h1>
        <p className="text-gray-400">Enter a movie or TV show name to get started.</p>
      </main>
    );
  }

  const { results, total_pages, total_results } = await fetchSearchMulti(query, page);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-[#f5c518] text-sm hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-bold text-white mt-4 mb-1">
        Results for &ldquo;{query}&rdquo;
      </h1>
      <p className="text-gray-400 mb-8">
        {total_results} result{total_results !== 1 ? "s" : ""} found
      </p>

      {results.length === 0 ? (
        <p className="text-gray-400">No movies or TV shows found. Try a different search.</p>
      ) : (
        <>
          <MovieGrid movies={results} />
          <div className="flex justify-center gap-4 mt-10">
            {page > 1 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="px-6 py-2 border border-white/20 rounded-full text-gray-300 hover:border-[#f5c518] hover:text-[#f5c518] transition-colors"
              >
                Previous
              </Link>
            )}
            {page < total_pages && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="px-6 py-2 border border-white/20 rounded-full text-gray-300 hover:border-[#f5c518] hover:text-[#f5c518] transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}
