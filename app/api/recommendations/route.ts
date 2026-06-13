import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";
import { getAIRecommendations } from "@/lib/ai-recommendations";
import { WatchlistEntry } from "@/types/watchlist";

export async function POST(req: NextRequest) {
  try {
    const { likedEntries, allEntries } = (await req.json()) as {
      likedEntries: WatchlistEntry[];
      allEntries: WatchlistEntry[];
    };

    const recommendations = await getRecommendations(likedEntries ?? [], allEntries ?? []);

    const aiResult =
      recommendations.length > 0
        ? await getAIRecommendations(recommendations, likedEntries ?? []).catch((err) => {
            console.error("[AI Recommendations] failed:", err);
            return null;
          })
        : null;

    return NextResponse.json({ recommendations, aiResult });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
