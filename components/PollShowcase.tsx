import Link from "next/link";
import { Poster } from "@/components/Poster";
import type { MovieWithStats, PollWithOptions } from "@/lib/types";

/**
 * Vetrina dei film messi ai voti dalla direzione: mostra le locandine dei
 * candidati e rimanda al sondaggio vero e proprio, più in basso nella pagina.
 * I voti si esprimono lì, qui si guarda soltanto.
 */
export function PollShowcase({
  sondaggio,
  film,
}: {
  sondaggio: PollWithOptions;
  film: MovieWithStats[];
}) {
  if (!film.length) return null;

  const votiPerFilm = new Map(
    sondaggio.options
      .filter((o) => o.movie_id !== null)
      .map((o) => [o.movie_id as number, o.votes]),
  );

  return (
    <section className="giornata" aria-label="Film in votazione per la rassegna">
      <div className="giornata-testata">
        <div>
          <p className="giornata-occhiello">In votazione per la rassegna</p>
          <h2 className="giornata-data">{sondaggio.title}</h2>
        </div>
        <div className="giornata-apertura">
          <span className="giornata-ora">{sondaggio.total_votes}</span>
          <span className="piccolo tenue">
            {sondaggio.total_votes === 1 ? "voto raccolto" : "voti raccolti"}
          </span>
        </div>
      </div>

      <p className="etichetta giornata-sottotitolo">
        {film.length === 1
          ? "Il film candidato"
          : `I ${film.length} film candidati`}
      </p>

      <div className="giornata-vincitori">
        {film.map((f) => {
          const voti = votiPerFilm.get(f.id) ?? 0;
          const quota = sondaggio.total_votes
            ? Math.round((voti / sondaggio.total_votes) * 100)
            : 0;
          return (
            <Link key={f.id} href={`/film/${f.id}`} className="giornata-card">
              <div className="giornata-locandina">
                <Poster movie={f} sizes="120px" />
              </div>
              <div className="giornata-card-info">
                <span className="giornata-card-titolo">{f.title}</span>
                <div className="giornata-orari">
                  <span className="giornata-chip">
                    {voti} {voti === 1 ? "voto" : "voti"}
                  </span>
                  {sondaggio.total_votes > 0 && (
                    <span className="giornata-chip">{quota}%</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/sondaggi" className="sezione-link">
        Vai alla votazione →
      </Link>
    </section>
  );
}
