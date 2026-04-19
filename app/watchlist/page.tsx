import Link from "next/link";
import { getAllEntries } from "@/lib/watchlist-repo";
import { getSessionId } from "@/lib/session";
import WatchlistClient from "./WatchlistClient";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const sessionId = await getSessionId();
  const entries = await getAllEntries(sessionId);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-[#f5c518] text-sm hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">My Watchlist</h1>
      <p className="text-gray-400 mb-8">
        {entries.length} {entries.length === 1 ? "title" : "titles"} tracked
      </p>
      <WatchlistClient initialEntries={entries} />
    </main>
  );
}
