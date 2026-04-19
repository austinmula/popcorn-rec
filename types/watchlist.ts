export type MediaType = "movie" | "tv";
export type WatchStatus =
  | "liked"
  | "disliked"
  | "want_to_watch"
  | "watching"
  | "waiting_for_season";

export interface WatchlistEntry {
  _id?: string;
  session_id?: string;
  tmdb_id: number;
  media_type: MediaType;
  status: WatchStatus;
  title: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
  added_at: Date;
  updated_at: Date;
}
