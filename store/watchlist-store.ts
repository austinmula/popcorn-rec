import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WatchlistEntry, WatchStatus, MediaType } from "@/types/watchlist";

interface EntryMeta {
  title: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

interface WatchlistState {
  entries: WatchlistEntry[];
  getStatus: (tmdb_id: number, media_type: MediaType) => WatchStatus | null;
  setStatus: (tmdb_id: number, media_type: MediaType, status: WatchStatus, meta: EntryMeta) => void;
  removeEntry: (tmdb_id: number, media_type: MediaType) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      entries: [],

      getStatus(tmdb_id, media_type) {
        const entry = get().entries.find(
          (e) => e.tmdb_id === tmdb_id && e.media_type === media_type
        );
        return entry?.status ?? null;
      },

      setStatus(tmdb_id, media_type, status, meta) {
        const entries = get().entries;
        const now = new Date().toISOString();
        const existing = entries.find(
          (e) => e.tmdb_id === tmdb_id && e.media_type === media_type
        );
        if (existing) {
          set({
            entries: entries.map((e) =>
              e.tmdb_id === tmdb_id && e.media_type === media_type
                ? { ...e, status, updated_at: now }
                : e
            ),
          });
        } else {
          set({
            entries: [
              ...entries,
              { tmdb_id, media_type, status, ...meta, added_at: now, updated_at: now },
            ],
          });
        }
      },

      removeEntry(tmdb_id, media_type) {
        set({
          entries: get().entries.filter(
            (e) => !(e.tmdb_id === tmdb_id && e.media_type === media_type)
          ),
        });
      },
    }),
    { name: "popcorn-watchlist" }
  )
);
