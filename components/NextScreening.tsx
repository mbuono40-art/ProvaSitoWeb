import Link from "next/link";
import { Poster } from "@/components/Poster";
import { formatFullDate, formatTime, todayKey } from "@/lib/format";
import type { ShowtimeWithMovie } from "@/lib/types";

/**
 * Fascia in cima alla home: la prima giornata di proiezione ancora utile.
 * Mostra con la locandina i film che sono entrati in cartellone per quella
 * giornata, con tutti i loro orari. Il contenuto viene dagli spettacoli
 * inseriti dalla direzione, quindi segue le modifiche manuali.
 */
export function NextScreening({
  giorno,
  spettacoli,
}: {
  giorno: string;
  spettacoli: ShowtimeWithMovie[];
}) {
  if (!spettacoli.length) return null;

  const perFilm = new Map<number, { film: ShowtimeWithMovie; orari: ShowtimeWithMovie[] }>();
  for (const s of spettacoli) {
    if (!perFilm.has(s.movie_id)) perFilm.set(s.movie_id, { film: s, orari: [] });
    perFilm.get(s.movie_id)!.orari.push(s);
  }

  const oggi = giorno === todayKey();
  const primo = spettacoli[0];
  const film = [...perFilm.values()];

  return (
    <section className="giornata" aria-label="Prossima giornata di proiezione">
      <div className="giornata-testata">
        <div>
          <p className="giornata-occhiello">
            {oggi ? "Oggi in sala" : "Prossima giornata di proiezione"}
          </p>
          <h2 className="giornata-data">{formatFullDate(`${giorno}T00:00`)}</h2>
        </div>
        <div className="giornata-apertura">
          <span className="giornata-ora">{formatTime(primo.starts_at)}</span>
          <span className="piccolo tenue">
            {oggi ? "prossimo spettacolo" : "prima proiezione"}
          </span>
        </div>
      </div>

      <p className="etichetta giornata-sottotitolo">
        {film.length === 1
          ? "Il film in cartellone"
          : `I ${film.length} film in cartellone`}
      </p>

      <div className="giornata-vincitori">
        {film.map(({ film: f, orari }) => (
          <Link key={f.movie_id} href={`/film/${f.movie_id}`} className="giornata-card">
            <div className="giornata-locandina">
              <Poster
                movie={{
                  title: f.title,
                  poster_url: f.poster_url,
                  year: f.year,
                  genres: f.genres,
                }}
                sizes="120px"
              />
            </div>
            <div className="giornata-card-info">
              <span className="giornata-card-titolo">{f.title}</span>
              <div className="giornata-orari">
                {orari.map((o) => (
                  <span key={o.id} className="giornata-chip">
                    {formatTime(o.starts_at)}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/programmazione" className="sezione-link">
        Programmazione completa →
      </Link>
    </section>
  );
}
