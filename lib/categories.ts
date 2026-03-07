export interface GenreCategory {
  slug: string;
  name: string;
  id: number;
}

export interface MoodCategory {
  slug: string;
  name: string;
  description: string;
  genreIds: number[];
}

export interface EraCategory {
  decade: string;
  label: string;
  startYear: number;
  endYear: number;
}

export interface TopCategory {
  list: string;
  label: string;
  description: string;
}

export const GENRES: GenreCategory[] = [
  { slug: "action", name: "Action", id: 28 },
  { slug: "comedy", name: "Comedy", id: 35 },
  { slug: "drama", name: "Drama", id: 18 },
  { slug: "horror", name: "Horror", id: 27 },
  { slug: "sci-fi", name: "Sci-Fi", id: 878 },
  { slug: "thriller", name: "Thriller", id: 53 },
  { slug: "romance", name: "Romance", id: 10749 },
  { slug: "animation", name: "Animation", id: 16 },
];

export const MOODS: MoodCategory[] = [
  {
    slug: "feel-good",
    name: "Feel Good",
    description: "Uplifting comedies and family favorites",
    genreIds: [35, 10751],
  },
  {
    slug: "mind-bending",
    name: "Mind-Bending",
    description: "Sci-fi thrillers that mess with your head",
    genreIds: [878, 53],
  },
  {
    slug: "date-night",
    name: "Date Night",
    description: "Romantic dramas for a cozy evening",
    genreIds: [10749, 18],
  },
  {
    slug: "adrenaline-rush",
    name: "Adrenaline Rush",
    description: "High-octane action and adventure",
    genreIds: [28, 12],
  },
  {
    slug: "spine-chilling",
    name: "Spine-Chilling",
    description: "Horror and mystery to keep you up at night",
    genreIds: [27, 9648],
  },
];

export const ERAS: EraCategory[] = [
  { decade: "2020s", label: "2020s", startYear: 2020, endYear: 2025 },
  { decade: "2010s", label: "2010s", startYear: 2010, endYear: 2019 },
  { decade: "2000s", label: "2000s", startYear: 2000, endYear: 2009 },
  { decade: "90s", label: "90s", startYear: 1990, endYear: 1999 },
  { decade: "80s", label: "80s", startYear: 1980, endYear: 1989 },
];

export const TOP_LISTS: TopCategory[] = [
  {
    list: "trending",
    label: "Trending Now",
    description: "What everyone is watching this week",
  },
  {
    list: "all-time",
    label: "All-Time Greats",
    description: "The highest-rated movies of all time",
  },
  {
    list: "hidden-gems",
    label: "Hidden Gems",
    description: "Critically acclaimed films you may have missed",
  },
];
