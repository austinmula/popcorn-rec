import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";
import { WatchlistEntry } from "@/types/watchlist";

export async function POST(req: NextRequest) {
  try {
    const { likedEntries, allEntries } = (await req.json()) as {
      likedEntries: WatchlistEntry[];
      allEntries: WatchlistEntry[];
    };
    const recommendations = await getRecommendations(likedEntries ?? [], allEntries ?? []);
    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
