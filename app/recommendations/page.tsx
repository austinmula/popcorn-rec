import Link from "next/link";
import { getRecommendations } from "@/lib/recommendations";
import { getAIRecommendations } from "@/lib/ai-recommendations";
import { getSessionId } from "@/lib/session";
import MovieGrid from "@/components/MovieGrid";
import AIPicksSection from "@/components/AIPicksSection";
import RefreshButton from "./RefreshButton";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const sessionId = await getSessionId();
  const recommendations = await getRecommendations(sessionId);
  const aiResult = recommendations.length > 0
    ? await getAIRecommendations(recommendations, sessionId).catch((err) => {
        console.error("[AI Recommendations] failed:", err);
        return null;
      })
    : null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-[#f5c518] text-sm hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
      <div className="flex items-center justify-between mt-4 mb-2">
        <h1 className="text-3xl font-bold text-white">For You</h1>
        <RefreshButton />
      </div>
      <p className="text-gray-400 mb-8">
        Personalized picks based on your liked movies and shows
      </p>

      {recommendations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">❤️</p>
          <p className="text-xl">Like some movies or shows first.</p>
          <p className="text-sm mt-2">
            Tap any card and press ❤️ to get personalized recommendations.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2 border border-[#f5c518] text-[#f5c518] rounded-full hover:bg-[#f5c518]/10 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <>
          {aiResult && aiResult.picks.length > 0 && (
            <AIPicksSection
              tasteProfile={aiResult.taste_profile}
              picks={aiResult.picks}
            />
          )}
          <h2 className="text-xl font-semibold text-white mb-4">All Recommendations</h2>
          <MovieGrid movies={recommendations} />
        </>
      )}
    </main>
  );
}
