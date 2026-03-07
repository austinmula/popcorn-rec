import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchMoodMovies, normalizeMedia } from "@/lib/tmdb";
import { MOODS } from "@/lib/categories";
import MovieGrid from "@/components/MovieGrid";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function MoodPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1", 10);

  const mood = MOODS.find((m) => m.slug === slug);
  if (!mood) notFound();

  const data = await fetchMoodMovies(mood.genreIds, page);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-[#f5c518] text-sm hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">{mood.name}</h1>
      <p className="text-gray-400 mb-8">{mood.description}</p>
      <MovieGrid movies={data.results.map((m) => normalizeMedia(m, "movie"))} />
      <div className="flex justify-center gap-4 mt-10">
        {page > 1 && (
          <Link
            href={`/mood/${slug}?page=${page - 1}`}
            className="px-6 py-2 border border-white/20 rounded-full text-gray-300 hover:border-[#f5c518] hover:text-[#f5c518] transition-colors"
          >
            Previous
          </Link>
        )}
        {page < data.total_pages && (
          <Link
            href={`/mood/${slug}?page=${page + 1}`}
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
  return MOODS.map((m) => ({ slug: m.slug }));
}
