import type { Movie } from "@/lib/types";

/** Tonalità profonde coerenti con la palette: bordeaux, prugna, bronzo, notte. */
const TINTE = ["#3a0d16", "#2c0b22", "#3d1a08", "#160c2c", "#0d2420", "#3a1408"];

function tinta(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTE[h % TINTE.length];
}

/**
 * Locandina: usa l'immagine se il film ne ha una (per esempio importata da
 * TMDb), altrimenti disegna una locandina tipografica in tema.
 */
export function Poster({
  movie,
  sizes,
}: {
  movie: Pick<Movie, "title" | "poster_url" | "year" | "genres">;
  sizes?: string;
}) {
  if (movie.poster_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={movie.poster_url}
        alt={`Locandina di ${movie.title}`}
        loading="lazy"
        sizes={sizes}
      />
    );
  }

  const genere = (movie.genres || "").split(",")[0]?.trim() || "Cinema";

  return (
    <div
      className="locandina-disegnata"
      style={{ ["--lp-1" as string]: tinta(movie.title) }}
      role="img"
      aria-label={`Locandina di ${movie.title}`}
    >
      <div className="lp-alto">Cinema Aureo</div>
      <div className="lp-titolo">{movie.title}</div>
      <div className="lp-sigillo">✧</div>
      <div className="lp-basso">
        {genere}
        {movie.year ? ` · ${movie.year}` : ""}
      </div>
    </div>
  );
}
