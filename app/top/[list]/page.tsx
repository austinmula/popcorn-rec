import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTrending, fetchTopRated, fetchHiddenGems, normalizeMedia } from "@/lib/tmdb";
import { TOP_LISTS } from "@/lib/categories";
import { TMDBResponse } from "@/types/movie";
import MovieGrid from "@/components/MovieGrid";

interface Props {
  params: Promise<{ list: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getData(list: string, page: number): Promise<TMDBResponse> {
  if (list === "trending") return fetchTrending(page);
  if (list === "all-time") return fetchTopRated(page);
  if (list === "hidden-gems") return fetchHiddenGems(page);
  notFound();
}

export default async function TopPage({ params, searchParams }: Props) {
  const { list } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1", 10);

  const topList = TOP_LISTS.find((t) => t.list === list);
  if (!topList) notFound();

  const data = await getData(list, page);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-[#f5c518] text-sm hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">{topList.label}</h1>
      <p className="text-gray-400 mb-8">{topList.description}</p>
      <MovieGrid movies={data.results.map((m) => normalizeMedia(m, "movie"))} />
      <div className="flex justify-center gap-4 mt-10">
        {page > 1 && (
          <Link
            href={`/top/${list}?page=${page - 1}`}
            className="px-6 py-2 border border-white/20 rounded-full text-gray-300 hover:border-[#f5c518] hover:text-[#f5c518] transition-colors"
          >
            Previous
          </Link>
        )}
        {page < data.total_pages && (
          <Link
            href={`/top/${list}?page=${page + 1}`}
            className="px-6 py-2 border border-white/20 rounded-full text-gray-300 hover:border-[#f5c518] hover:text-[#f5c518] transition-colors"
          >
            Next
          </Link>
        )}
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  return TOP_LISTS.map((t) => ({ list: t.list }));
}
