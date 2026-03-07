import Link from "next/link";
import { getRecommendations } from "@/lib/recommendations";
import MovieGrid from "@/components/MovieGrid";

export const revalidate = 300;

export default async function RecommendationsPage() {
  const recommendations = await getRecommendations();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-[#f5c518] text-sm hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">For You</h1>
      <p className="text-gray-400 mb-8">
        Personalized picks based on your liked movies and shows
      </p>

      {recommendations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">❤️</p>
          <p className="text-xl">Like some movies or shows first.</p>
          <p className="text-sm mt-2">
            Hover over any card and press ❤️ to get personalized recommendations.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2 border border-[#f5c518] text-[#f5c518] rounded-full hover:bg-[#f5c518]/10 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <MovieGrid movies={recommendations} />
      )}
    </main>
  );
}
