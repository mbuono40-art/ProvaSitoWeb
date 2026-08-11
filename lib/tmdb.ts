import "server-only";

/**
 * Client TMDb — completamente opzionale.
 * Senza chiave in .env.local il sito funziona lo stesso: si perde solo
 * l'importazione automatica dei film dal pannello admin.
 * Sono accettate sia la chiave API v3 sia il token v4 (Bearer).
 */

const BASE = "https://api.themoviedb.org/3";
export const IMG = "https://image.tmdb.org/t/p";

export function tmdbKey(): string | null {
  const k = (process.env.TMDB_API_KEY || "").trim();
  return k.length ? k : null;
}

export function tmdbAvailable(): boolean {
  return tmdbKey() !== null;
}

async function call<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = tmdbKey();
  if (!key) throw new Error("TMDB_API_KEY non configurata");

  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("language", "it-IT");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const headers: Record<string, string> = { accept: "application/json" };
  // I token v4 sono lunghi e vanno in header; le chiavi v3 in query string.
  if (key.length > 60) headers.Authorization = `Bearer ${key}`;
  else url.searchParams.set("api_key", key);

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    const testo = await res.text().catch(() => "");
    throw new Error(
      res.status === 401
        ? "Chiave TMDb rifiutata (401). Controlla il valore in .env.local."
        : `TMDb ha risposto ${res.status}. ${testo.slice(0, 160)}`,
    );
  }
  return (await res.json()) as T;
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
}

export async function tmdbSearch(query: string): Promise<TmdbSearchResult[]> {
  const data = await call<{ results: TmdbSearchResult[] }>("/search/movie", {
    query,
    include_adult: "false",
  });
  return data.results.slice(0, 12);
}

export interface TmdbImported {
  tmdb_id: number;
  title: string;
  original_title: string;
  year: number | null;
  genres: string;
  duration_min: number | null;
  director: string;
  cast_list: string;
  synopsis: string;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
}

interface TmdbDetail {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  runtime: number | null;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { name: string }[];
  credits: {
    cast: { name: string }[];
    crew: { name: string; job: string }[];
  };
  videos: { results: { key: string; site: string; type: string }[] };
}

export async function tmdbDetails(id: number): Promise<TmdbImported> {
  const d = await call<TmdbDetail>(`/movie/${id}`, {
    append_to_response: "credits,videos",
  });

  const registi = d.credits.crew
    .filter((c) => c.job === "Director")
    .map((c) => c.name);
  const trailer = d.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer",
  );

  return {
    tmdb_id: d.id,
    title: d.title,
    original_title: d.original_title,
    year: d.release_date ? Number(d.release_date.slice(0, 4)) : null,
    genres: d.genres.map((g) => g.name).join(", "),
    duration_min: d.runtime || null,
    director: registi.join(", "),
    cast_list: d.credits.cast.slice(0, 4).map((c) => c.name).join(", "),
    synopsis: d.overview || "",
    poster_url: d.poster_path ? `${IMG}/w500${d.poster_path}` : null,
    backdrop_url: d.backdrop_path ? `${IMG}/w1280${d.backdrop_path}` : null,
    trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
  };
}
