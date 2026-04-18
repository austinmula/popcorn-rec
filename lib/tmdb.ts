import { TMDBResponse, Movie, TVShow, NormalizedMedia } from "@/types/movie";

interface MultiSearchItem {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
}

interface MultiSearchResponse {
  page: number;
  results: MultiSearchItem[];
  total_pages: number;
  total_results: number;
}

const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

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

export async function fetchGenreMovies(genreId: number, page = 1): Promise<TMDBResponse> {
  return tmdbFetch("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
    include_adult: "false",
  });
}

export async function fetchMoodMovies(genreIds: number[], page = 1): Promise<TMDBResponse> {
  return tmdbFetch("/discover/movie", {
    with_genres: genreIds.join(","),
    sort_by: "popularity.desc",
    page: String(page),
    include_adult: "false",
  });
}

export async function fetchEraMovies(
  startYear: number,
  endYear: number,
  page = 1
): Promise<TMDBResponse> {
  return tmdbFetch("/discover/movie", {
    "primary_release_date.gte": `${startYear}-01-01`,
    "primary_release_date.lte": `${endYear}-12-31`,
    sort_by: "popularity.desc",
    page: String(page),
    include_adult: "false",
  });
}

const UI_PAGE_SIZE = 24;
const TMDB_PAGE_SIZE = 20;

async function fetchPaged(
  endpoint: string,
  params: Record<string, string>,
  uiPage: number
): Promise<TMDBResponse> {
  const startItem = (uiPage - 1) * UI_PAGE_SIZE;
  const endItem = uiPage * UI_PAGE_SIZE - 1;
  const tmdbPage1 = Math.floor(startItem / TMDB_PAGE_SIZE) + 1;
  const tmdbPage2 = Math.floor(endItem / TMDB_PAGE_SIZE) + 1;

  const fetches = [
    tmdbFetch<TMDBResponse>(endpoint, { ...params, page: String(tmdbPage1) }),
    ...(tmdbPage2 !== tmdbPage1
      ? [tmdbFetch<TMDBResponse>(endpoint, { ...params, page: String(tmdbPage2) })]
      : []),
  ];

  const pages = await Promise.all(fetches);
  const combined = pages.flatMap((p) => p.results);
  const offset = startItem % TMDB_PAGE_SIZE;

  return {
    page: uiPage,
    results: combined.slice(offset, offset + UI_PAGE_SIZE),
    total_pages: Math.ceil(pages[0].total_results / UI_PAGE_SIZE),
    total_results: pages[0].total_results,
  };
}

export async function fetchTrending(page = 1): Promise<TMDBResponse> {
  return fetchPaged("/trending/movie/week", {}, page);
}

export async function fetchTopRated(page = 1): Promise<TMDBResponse> {
  return fetchPaged("/movie/top_rated", {}, page);
}

export async function fetchHiddenGems(page = 1): Promise<TMDBResponse> {
  return fetchPaged(
    "/discover/movie",
    {
      "vote_count.gte": "200",
      "vote_count.lte": "5000",
      "vote_average.gte": "7.2",
      sort_by: "vote_average.desc",
      include_adult: "false",
    },
    page
  );
}

export function getPosterUrl(path: string | null): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}${path}`;
}

export function getBackdropUrl(path: string | null): string | null {
  if (!path) return null;
  return `${BACKDROP_BASE}${path}`;
}

export function getReleaseYear(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.slice(0, 4);
}

export async function fetchSearchMulti(
  query: string,
  page = 1
): Promise<{ results: NormalizedMedia[]; total_pages: number; total_results: number }> {
  const data = await tmdbFetch<MultiSearchResponse>("/search/multi", {
    query,
    page: String(page),
    include_adult: "false",
  });
  const results = data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item): NormalizedMedia => ({
      id: item.id,
      media_type: item.media_type as "movie" | "tv",
      title: (item.media_type === "tv" ? item.name : item.title) ?? "",
      overview: item.overview ?? "",
      poster_path: item.poster_path ?? null,
      backdrop_path: item.backdrop_path ?? null,
      release_date: (item.media_type === "tv" ? item.first_air_date : item.release_date) ?? "",
      vote_average: item.vote_average ?? 0,
      vote_count: item.vote_count ?? 0,
      genre_ids: item.genre_ids ?? [],
    }));
  return { results, total_pages: data.total_pages, total_results: data.total_results };
}

export function normalizeMedia(item: Movie | TVShow, media_type: "movie" | "tv"): NormalizedMedia {
  if (media_type === "tv") {
    const tv = item as TVShow;
    return {
      id: tv.id,
      media_type: "tv",
      title: tv.name,
      overview: tv.overview,
      poster_path: tv.poster_path,
      backdrop_path: tv.backdrop_path,
      release_date: tv.first_air_date,
      vote_average: tv.vote_average,
      vote_count: tv.vote_count,
      genre_ids: tv.genre_ids,
    };
  }
  const movie = item as Movie;
  return {
    id: movie.id,
    media_type: "movie",
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genre_ids: movie.genre_ids,
  };
}
