import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getLikedEntries } from "./watchlist-repo";
import { NormalizedMedia } from "@/types/movie";

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

const AIRecommendationsSchema = z.object({
  taste_profile: z.string(),
  picks: z.array(z.object({
    tmdb_id: z.number(),
    media_type: z.enum(["movie", "tv"]),
    reason: z.string(),
  })).max(10),
});

export type AIRecommendations = z.infer<typeof AIRecommendationsSchema>;

export interface AIPickWithMedia {
  media: NormalizedMedia;
  reason: string;
}

export interface AIResult {
  taste_profile: string;
  picks: AIPickWithMedia[];
}

const TOOL_INPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    taste_profile: {
      type: "string",
      description: "1-2 sentence description of what the user clearly enjoys",
    },
    picks: {
      type: "array",
      maxItems: 10,
      description: "Ordered list of top picks from the candidate pool",
      items: {
        type: "object",
        properties: {
          tmdb_id: { type: "number", description: "Exact tmdb_id from the candidate list" },
          media_type: { type: "string", enum: ["movie", "tv"] },
          reason: {
            type: "string",
            description: "One sentence explaining why this matches the user's taste, referencing titles they liked",
          },
        },
        required: ["tmdb_id", "media_type", "reason"],
      },
    },
  },
  required: ["taste_profile", "picks"],
};

export async function getAIRecommendations(
  candidates: NormalizedMedia[],
  sessionId: string
): Promise<AIResult | null> {
  const liked = await getLikedEntries(sessionId);
  if (liked.length === 0 || candidates.length === 0) return null;

  const client = new Anthropic();

  const likedSummary = liked.map((e) => ({
    title: e.title,
    type: e.media_type,
    genres: e.genre_ids.map((id) => GENRE_MAP[id] ?? "Unknown").join(", "),
    rating: e.vote_average.toFixed(1),
  }));

  const candidatePool = candidates.slice(0, 30);
  const candidateSummary = candidatePool.map((c) => ({
    tmdb_id: c.id,
    title: c.title,
    type: c.media_type,
    year: c.release_date?.split("-")[0] ?? "?",
    genres: c.genre_ids.map((id) => GENRE_MAP[id] ?? "Unknown").join(", "),
    rating: c.vote_average.toFixed(1),
  }));

  const prompt = `You are a film and TV expert helping curate personalized recommendations.

The user has liked these movies/shows:
${JSON.stringify(likedSummary, null, 2)}

From the following candidate pool, select the top 10 that best match their taste:
${JSON.stringify(candidateSummary, null, 2)}

Think carefully about the user's taste patterns, then pick the 10 best candidates. Only use tmdb_id and media_type values exactly as they appear in the candidate list.`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    thinking: { type: "enabled", budget_tokens: 8000 },
    tools: [
      {
        name: "curate_recommendations",
        description: "Return a taste profile and ordered list of top picks from the candidate pool",
        input_schema: TOOL_INPUT_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "curate_recommendations" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUseBlock = response.content.find((b) => b.type === "tool_use");
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error("No tool_use block in Claude response");
  }

  const parsed = AIRecommendationsSchema.safeParse(toolUseBlock.input);
  if (!parsed.success) {
    throw new Error(`Invalid response shape: ${parsed.error.message}`);
  }

  const candidateMap = new Map(
    candidatePool.map((c) => [`${c.id}:${c.media_type}`, c])
  );

  const picks: AIPickWithMedia[] = parsed.data.picks
    .map((pick) => {
      const media = candidateMap.get(`${pick.tmdb_id}:${pick.media_type}`);
      if (!media) return null;
      return { media, reason: pick.reason };
    })
    .filter((p): p is AIPickWithMedia => p !== null);

  return {
    taste_profile: parsed.data.taste_profile,
    picks,
  };
}
