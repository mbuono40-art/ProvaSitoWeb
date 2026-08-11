import Link from "next/link";
import { Poster } from "./Poster";
import { Stars } from "./Stars";
import { formatDayShort, formatTime } from "@/lib/format";
import type { MovieWithStats } from "@/lib/types";

const ETICHETTA: Record<string, string> = {
  in_programmazione: "In sala",
  prossimamente: "Prossimamente",
  archivio: "Archivio",
  catalogo: "Catalogo",
};

export function MovieCard({
  movie,
  showLabel = true,
}: {
  movie: MovieWithStats;
  showLabel?: boolean;
}) {
  return (
    <Link href={`/film/${movie.id}`} className="card">
      <div className="card-locandina">
        <Poster movie={movie} sizes="(max-width: 620px) 40vw, 190px" />
        {showLabel && (
          <span className="card-etichetta">
            {ETICHETTA[movie.status] ?? "Catalogo"}
          </span>
        )}
        <div className="card-velo">
          <span className="card-voto">
            ★ {movie.avg_rating ? movie.avg_rating.toFixed(1).replace(".", ",") : "—"}
          </span>
          <span>
            {movie.next_showtime
              ? `${formatDayShort(movie.next_showtime)} · ${formatTime(movie.next_showtime)}`
              : movie.year || ""}
          </span>
        </div>
      </div>
      <div>
        <div className="card-titolo">{movie.title}</div>
        <div className="card-meta">
          {[movie.year, movie.genres.split(",")[0]?.trim()]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      <Stars value={movie.avg_rating} size="0.8rem" />
    </Link>
  );
}
