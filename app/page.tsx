import Image from "next/image";
import Link from "next/link";
import {
  fetchTrending,
  fetchGenreMovies,
  fetchMoodMovies,
  fetchEraMovies,
  fetchTopRated,
  getBackdropUrl,
  getReleaseYear,
  normalizeMedia,
} from "@/lib/tmdb";
import { GENRES, MOODS, ERAS } from "@/lib/categories";
import CategorySection from "@/components/CategorySection";
import { fetchTrendingTV, fetchTVTopRated } from "@/lib/tmdb-tv";

export default async function HomePage() {
  const [trending, topRated, trendingTV, topRatedTV] = await Promise.all([
    fetchTrending(),
    fetchTopRated(),
    fetchTrendingTV(),
    fetchTVTopRated(),
  ]);

  const hero = trending.results[0];
  const trendingMovies = trending.results.slice(1, 13).map((m) => normalizeMedia(m, "movie"));

  const [actionMovies, ...moodResults] = await Promise.all([
    fetchGenreMovies(GENRES[0].id),
    ...MOODS.map((m) => fetchMoodMovies(m.genreIds)),
  ]);

  const eraResults = await Promise.all(
    ERAS.slice(0, 2).map((e) => fetchEraMovies(e.startYear, e.endYear))
  );

  const backdropUrl = getBackdropUrl(hero?.backdrop_path);

  return (
    <main>
      {/* Hero */}
      {hero && (
        <section className="relative h-[70vh] min-h-[400px] flex items-end overflow-hidden">
          {backdropUrl && (
            <Image
              src={backdropUrl}
              alt={hero.title}
              fill
              className="object-cover object-center"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <p className="text-[#f5c518] text-sm font-semibold uppercase tracking-widest mb-2">
              Trending Now
            </p>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-3 max-w-2xl leading-tight">
              {hero.title}
            </h1>
            <p className="text-gray-300 text-base max-w-xl line-clamp-2">{hero.overview}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-[#f5c518] font-bold">★ {hero.vote_average.toFixed(1)}</span>
              <span className="text-gray-400">{getReleaseYear(hero.release_date)}</span>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Trending Now */}
        <CategorySection
          title="Trending This Week"
          movies={trendingMovies}
          seeAllHref="/top/trending"
        />

        {/* Browse by Genre */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Browse by Genre</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {GENRES.map((g) => (
              <Link
                key={g.slug}
                href={`/genre/${g.slug}`}
                className="px-4 py-2 rounded-full border border-white/20 text-sm text-gray-300 hover:border-[#f5c518] hover:text-[#f5c518] transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>
          <CategorySection
            title="Action"
            movies={actionMovies.results.slice(0, 12).map((m) => normalizeMedia(m, "movie"))}
            seeAllHref="/genre/action"
          />
        </section>

        {/* Browse by Mood */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-6">Browse by Mood</h2>
          {MOODS.map((mood, i) => (
            <CategorySection
              key={mood.slug}
              title={mood.name}
              movies={(moodResults[i]?.results.slice(0, 12) ?? []).map((m) => normalizeMedia(m, "movie"))}
              seeAllHref={`/mood/${mood.slug}`}
            />
          ))}
        </section>

        {/* Browse by Era */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Browse by Era</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {ERAS.map((e) => (
              <Link
                key={e.decade}
                href={`/era/${e.decade}`}
                className="px-4 py-2 rounded-full border border-white/20 text-sm text-gray-300 hover:border-[#f5c518] hover:text-[#f5c518] transition-colors"
              >
                {e.label}
              </Link>
            ))}
          </div>
          {eraResults.map((result, i) => (
            <CategorySection
              key={ERAS[i].decade}
              title={`Best of the ${ERAS[i].label}`}
              movies={result.results.slice(0, 12).map((m) => normalizeMedia(m, "movie"))}
              seeAllHref={`/era/${ERAS[i].decade}`}
            />
          ))}
        </section>

        {/* All-Time Greats */}
        <CategorySection
          title="All-Time Greats"
          movies={topRated.results.slice(0, 12).map((m) => normalizeMedia(m, "movie"))}
          seeAllHref="/top/all-time"
        />

        {/* TV Shows */}
        <section className="mb-4 mt-4">
          <h2 className="text-xl font-semibold text-white mb-6">TV Shows</h2>
          <CategorySection
            title="Trending TV This Week"
            movies={trendingTV.slice(0, 12)}
          />
          <CategorySection
            title="Top Rated Shows"
            movies={topRatedTV.slice(0, 12)}
          />
        </section>
      </div>
    </main>
  );
}
