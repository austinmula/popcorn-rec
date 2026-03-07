import { create } from "zustand";
import { WatchlistEntry, WatchStatus, MediaType } from "@/types/watchlist";

interface EntryMeta {
  title: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

interface WatchlistState {
  entries: WatchlistEntry[];
  initialized: boolean;
  initialize: (entries: WatchlistEntry[]) => void;
  getStatus: (tmdb_id: number, media_type: MediaType) => WatchStatus | null;
  setStatus: (
    tmdb_id: number,
    media_type: MediaType,
    status: WatchStatus,
    meta: EntryMeta
  ) => Promise<void>;
  removeEntry: (tmdb_id: number, media_type: MediaType) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  entries: [],
  initialized: false,

  initialize(entries) {
    set({ entries, initialized: true });
  },

  getStatus(tmdb_id, media_type) {
    const entry = get().entries.find(
      (e) => e.tmdb_id === tmdb_id && e.media_type === media_type
    );
    return entry?.status ?? null;
  },

  async setStatus(tmdb_id, media_type, status, meta) {
    const prev = get().entries;
    const now = new Date();

    // Optimistic update
    const existing = prev.find((e) => e.tmdb_id === tmdb_id && e.media_type === media_type);
    if (existing) {
      set({
        entries: prev.map((e) =>
          e.tmdb_id === tmdb_id && e.media_type === media_type
            ? { ...e, status, updated_at: now }
            : e
        ),
      });
    } else {
      const newEntry: WatchlistEntry = {
        tmdb_id,
        media_type,
        status,
        title: meta.title,
        poster_path: meta.poster_path,
        genre_ids: meta.genre_ids,
        vote_average: meta.vote_average,
        added_at: now,
        updated_at: now,
      };
      set({ entries: [...prev, newEntry] });
    }

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdb_id, media_type, status, ...meta }),
      });
      if (!res.ok) throw new Error("API error");
      const { entry } = await res.json();
      set((s) => ({
        entries: s.entries.map((e) =>
          e.tmdb_id === tmdb_id && e.media_type === media_type ? entry : e
        ),
      }));
    } catch {
      // Rollback
      set({ entries: prev });
    }
  },

  async removeEntry(tmdb_id, media_type) {
    const prev = get().entries;
    // Optimistic remove
    set({ entries: prev.filter((e) => !(e.tmdb_id === tmdb_id && e.media_type === media_type)) });

    try {
      const res = await fetch(
        `/api/watchlist/${tmdb_id}?media_type=${media_type}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("API error");
    } catch {
      // Rollback
      set({ entries: prev });
    }
  },
}));
