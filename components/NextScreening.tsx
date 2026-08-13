import Link from "next/link";
import { formatFullDate, formatTime, todayKey } from "@/lib/format";
import type { ShowtimeWithMovie } from "@/lib/types";

/**
 * Fascia in cima alla home: la prima giornata di proiezione ancora utile,
 * con la data e, per ogni film, tutti gli orari di quella giornata.
 * Il contenuto viene dagli spettacoli inseriti dalla direzione, quindi si
 * aggiorna da sé quando la programmazione viene modificata a mano.
 */
export function NextScreening({
  giorno,
  spettacoli,
}: {
  giorno: string;
  spettacoli: ShowtimeWithMovie[];
}) {
  if (!spettacoli.length) return null;

  const perFilm = new Map<number, { titolo: string; orari: ShowtimeWithMovie[] }>();
  for (const s of spettacoli) {
    if (!perFilm.has(s.movie_id)) {
      perFilm.set(s.movie_id, { titolo: s.title, orari: [] });
    }
    perFilm.get(s.movie_id)!.orari.push(s);
  }

  const oggi = giorno === todayKey();
  const primo = spettacoli[0];

  return (
    <section className="giornata" aria-label="Prossima giornata di proiezione">
      <div className="giornata-testata">
        <div>
          <p className="occhiello">
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

      <div className="giornata-elenco">
        {[...perFilm.entries()].map(([movieId, { titolo, orari }]) => (
          <div key={movieId} className="giornata-film">
            <Link href={`/film/${movieId}`} className="giornata-titolo">
              {titolo}
            </Link>
            <div className="giornata-orari">
              {orari.map((o) => (
                <span key={o.id} className="giornata-chip">
                  {formatTime(o.starts_at)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Link href="/programmazione" className="sezione-link">
        Programmazione completa →
      </Link>
    </section>
  );
}
