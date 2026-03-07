import { TMDBTVResponse, NormalizedMedia } from "@/types/movie";
import { normalizeMedia } from "./tmdb";

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
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status} ${url}`);
  return res.json();
}

export async function fetchTrendingTV(): Promise<NormalizedMedia[]> {
  const data = await tmdbFetch<TMDBTVResponse>("/trending/tv/week");
  return data.results.map((item) => normalizeMedia(item, "tv"));
}

export async function fetchTVByGenre(genreId: number, page = 1): Promise<NormalizedMedia[]> {
  const data = await tmdbFetch<TMDBTVResponse>("/discover/tv", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
    include_adult: "false",
  });
  return data.results.map((item) => normalizeMedia(item, "tv"));
}

export async function fetchTVRecommendations(tvId: number): Promise<NormalizedMedia[]> {
  try {
    const data = await tmdbFetch<TMDBTVResponse>(`/tv/${tvId}/recommendations`);
    return data.results.map((item) => normalizeMedia(item, "tv"));
  } catch {
    return [];
  }
}

export async function fetchTVTopRated(page = 1): Promise<NormalizedMedia[]> {
  const data = await tmdbFetch<TMDBTVResponse>("/tv/top_rated", { page: String(page) });
  return data.results.map((item) => normalizeMedia(item, "tv"));
}
