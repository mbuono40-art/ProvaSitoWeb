import Link from "next/link";
import { Carousel } from "./Carousel";
import { MovieCard } from "./MovieCard";
import type { MovieWithStats } from "@/lib/types";

export function MovieRow({
  title,
  accent,
  movies,
  href,
  hrefLabel = "Vedi tutti",
  showLabel = true,
}: {
  title: string;
  accent?: string;
  movies: MovieWithStats[];
  href?: string;
  hrefLabel?: string;
  showLabel?: boolean;
}) {
  if (!movies.length) return null;

  return (
    <section className="sezione">
      <div className="sezione-testata">
        <h2>
          {title} {accent && <span>{accent}</span>}
        </h2>
        {href && (
          <Link href={href} className="sezione-link">
            {hrefLabel} →
          </Link>
        )}
      </div>
      <Carousel>
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} showLabel={showLabel} />
        ))}
      </Carousel>
    </section>
  );
}
