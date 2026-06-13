import { NextRequest, NextResponse } from "next/server";
import { getAllEntries, getEntriesByStatus, upsertEntry } from "@/lib/watchlist-repo";
import { WatchStatus } from "@/types/watchlist";
import { getSessionId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const status = req.nextUrl.searchParams.get("status") as WatchStatus | null;
    const entries = status
      ? await getEntriesByStatus(sessionId, status)
      : await getAllEntries(sessionId);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const body = await req.json();
    const { tmdb_id, media_type, status, title, poster_path, genre_ids, vote_average } = body;

    if (!tmdb_id || !media_type || !status || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const entry = await upsertEntry({
      session_id: sessionId,
      tmdb_id,
      media_type,
      status,
      title,
      poster_path: poster_path ?? null,
      genre_ids: genre_ids ?? [],
      vote_average: vote_average ?? 0,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to upsert entry" }, { status: 500 });
  }
}
