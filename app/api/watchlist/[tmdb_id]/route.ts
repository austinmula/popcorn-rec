import { NextRequest, NextResponse } from "next/server";
import { updateStatus, deleteEntry } from "@/lib/watchlist-repo";
import { MediaType, WatchStatus } from "@/types/watchlist";
import { getSessionId } from "@/lib/session";

interface Params {
  params: Promise<{ tmdb_id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const sessionId = await getSessionId();
    const { tmdb_id: tmdb_id_str } = await params;
    const tmdb_id = parseInt(tmdb_id_str, 10);
    const media_type = req.nextUrl.searchParams.get("media_type") as MediaType;
    const { status } = (await req.json()) as { status: WatchStatus };

    if (!media_type || !status) {
      return NextResponse.json({ error: "Missing media_type or status" }, { status: 400 });
    }

    const entry = await updateStatus(sessionId, tmdb_id, media_type, status);
    return NextResponse.json({ entry });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const sessionId = await getSessionId();
    const { tmdb_id: tmdb_id_str } = await params;
    const tmdb_id = parseInt(tmdb_id_str, 10);
    const media_type = req.nextUrl.searchParams.get("media_type") as MediaType;

    if (!media_type) {
      return NextResponse.json({ error: "Missing media_type" }, { status: 400 });
    }

    await deleteEntry(sessionId, tmdb_id, media_type);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
