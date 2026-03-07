import { TMDBResponse, Movie, TVShow, NormalizedMedia } from "@/types/movie";

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

export async function fetchTrending(): Promise<TMDBResponse> {
  return tmdbFetch("/trending/movie/week");
}

export async function fetchTopRated(page = 1): Promise<TMDBResponse> {
  return tmdbFetch("/movie/top_rated", { page: String(page) });
}

export async function fetchHiddenGems(page = 1): Promise<TMDBResponse> {
  return tmdbFetch("/discover/movie", {
    "vote_count.lte": "1000",
    "vote_average.gte": "7.5",
    sort_by: "vote_average.desc",
    page: String(page),
    include_adult: "false",
  });
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
