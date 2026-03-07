import { NormalizedMedia, Movie } from "@/types/movie";
import { getAllEntries, getLikedEntries } from "./watchlist-repo";
import { normalizeMedia } from "./tmdb";
import { fetchTVRecommendations, fetchTVByGenre } from "./tmdb-tv";

const BASE_URL = "https://api.themoviedb.org/3";

function getHeaders() {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status} ${url}`);
  return res.json();
}

async function fetchMovieRecommendations(movieId: number): Promise<NormalizedMedia[]> {
  try {
    const data = await tmdbFetch<{ results: Movie[] }>(`/movie/${movieId}/recommendations`);
    return data.results.map((m) => normalizeMedia(m, "movie"));
  } catch {
    return [];
  }
}

async function fetchDiscoverMovieByGenres(genreIds: number[]): Promise<NormalizedMedia[]> {
  try {
    const data = await tmdbFetch<{ results: Movie[] }>("/discover/movie", {
      with_genres: genreIds.join("|"),
      sort_by: "vote_average.desc",
      "vote_count.gte": "200",
      include_adult: "false",
    });
    return data.results.map((m) => normalizeMedia(m, "movie"));
  } catch {
    return [];
  }
}

export async function getRecommendations(): Promise<NormalizedMedia[]> {
  const likedEntries = await getLikedEntries();
  if (likedEntries.length === 0) return [];

  // Count genre frequency
  const genreCount: Record<number, number> = {};
  for (const entry of likedEntries) {
    for (const gid of entry.genre_ids) {
      genreCount[gid] = (genreCount[gid] ?? 0) + 1;
    }
  }

  const top3Genres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => Number(id));

  // Top 3 most recently liked items (by added_at)
  const recentLiked = [...likedEntries]
    .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
    .slice(0, 3);

  // Fetch recommendations for each recent liked item + genre-based discovery
  const [discoverMovies, discoverTV, ...itemRecs] = await Promise.all([
    fetchDiscoverMovieByGenres(top3Genres),
    fetchTVByGenre(top3Genres[0] ?? 18),
    ...recentLiked.map((entry) =>
      entry.media_type === "movie"
        ? fetchMovieRecommendations(entry.tmdb_id)
        : fetchTVRecommendations(entry.tmdb_id)
    ),
  ]);

  // Build set of already-tracked tmdb_ids
  const allEntries = await getAllEntries();
  const trackedKeys = new Set(allEntries.map((e) => `${e.tmdb_id}:${e.media_type}`));

  // Combine + deduplicate + filter already-tracked
  const seen = new Set<string>();
  const results: NormalizedMedia[] = [];

  const candidates = [...itemRecs.flat(), ...discoverMovies, ...discoverTV];
  for (const item of candidates) {
    const key = `${item.id}:${item.media_type}`;
    if (seen.has(key) || trackedKeys.has(key)) continue;
    seen.add(key);
    results.push(item);
  }

  // Sort by vote_average desc, return top 50
  return results.sort((a, b) => b.vote_average - a.vote_average).slice(0, 50);
}
