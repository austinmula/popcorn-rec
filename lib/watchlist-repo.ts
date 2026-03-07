import { Collection, ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import { WatchlistEntry, WatchStatus, MediaType } from "@/types/watchlist";

async function getCollection(): Promise<Collection<WatchlistEntry>> {
  const client = await clientPromise;
  const db = client.db("popcorn-rec");
  const col = db.collection<WatchlistEntry>("watchlist");

  // Ensure indexes exist (idempotent)
  await col.createIndex({ tmdb_id: 1, media_type: 1 }, { unique: true });
  await col.createIndex({ status: 1 });

  return col;
}

export async function getAllEntries(): Promise<WatchlistEntry[]> {
  const col = await getCollection();
  const docs = await col.find({}).toArray();
  return docs.map((d) => ({ ...d, _id: d._id?.toString() }));
}

export async function getEntriesByStatus(status: WatchStatus): Promise<WatchlistEntry[]> {
  const col = await getCollection();
  const docs = await col.find({ status }).toArray();
  return docs.map((d) => ({ ...d, _id: d._id?.toString() }));
}

export async function getLikedEntries(): Promise<WatchlistEntry[]> {
  return getEntriesByStatus("liked");
}

export interface UpsertPayload {
  tmdb_id: number;
  media_type: MediaType;
  status: WatchStatus;
  title: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

export async function upsertEntry(payload: UpsertPayload): Promise<WatchlistEntry> {
  const col = await getCollection();
  const now = new Date();
  const filter = { tmdb_id: payload.tmdb_id, media_type: payload.media_type };
  const update = {
    $set: {
      ...payload,
      updated_at: now,
    },
    $setOnInsert: {
      added_at: now,
    },
  };
  await col.updateOne(filter, update, { upsert: true });
  const doc = await col.findOne(filter);
  if (!doc) throw new Error("Upsert failed");
  return { ...doc, _id: doc._id?.toString() };
}

export async function updateStatus(
  tmdb_id: number,
  media_type: MediaType,
  status: WatchStatus
): Promise<WatchlistEntry> {
  const col = await getCollection();
  const filter = { tmdb_id, media_type };
  await col.updateOne(filter, { $set: { status, updated_at: new Date() } });
  const doc = await col.findOne(filter);
  if (!doc) throw new Error("Entry not found");
  return { ...doc, _id: doc._id?.toString() };
}

export async function deleteEntry(tmdb_id: number, media_type: MediaType): Promise<void> {
  const col = await getCollection();
  await col.deleteOne({ tmdb_id, media_type });
}
