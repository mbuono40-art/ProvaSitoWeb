import Link from "next/link";
import { notFound } from "next/navigation";
import { MovieRow } from "@/components/MovieRow";
import { Poster } from "@/components/Poster";
import { ReviewForm } from "@/components/ReviewForm";
import { Stars } from "@/components/Stars";
import { QuickShowtime } from "@/components/admin/QuickShowtime";
import { getCurrentUser } from "@/lib/auth";
import {
  formatDuration,
  formatFullDate,
  formatRating,
  formatTime,
  todayKey,
} from "@/lib/format";
import {
  getMovie,
  listByGenre,
  myReview,
  pastShowtimesForMovie,
  reviewsForMovie,
  showtimesForMovie,
} from "@/lib/queries";
import type { ShowtimeWithMovie } from "@/lib/types";

const STATO: Record<string, string> = {
  in_programmazione: "In programmazione",
  prossimamente: "Prossimamente",
  archivio: "Archivio",
  catalogo: "Catalogo",
};

function raggruppaPerGiorno(shows: ShowtimeWithMovie[]) {
  const gruppi = new Map<string, ShowtimeWithMovie[]>();
  for (const s of shows) {
    const key = s.starts_at.slice(0, 10);
    if (!gruppi.has(key)) gruppi.set(key, []);
    gruppi.get(key)!.push(s);
  }
  return [...gruppi.entries()];
}

export default async function FilmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isInteger(movieId)) notFound();

  const [user, movie] = await Promise.all([getCurrentUser(), getMovie(movieId)]);
  if (!movie) notFound();

  const genere = movie.genres.split(",")[0]?.trim() || "";

  const [prossimi, passati, recensioni, mia, similiConSelf] = await Promise.all([
    showtimesForMovie(movie.id),
    pastShowtimesForMovie(movie.id, 8),
    reviewsForMovie(movie.id),
    user ? myReview(movie.id, user.id) : Promise.resolve(null),
    genere ? listByGenre(genere, 14) : Promise.resolve([]),
  ]);
  const simili = similiConSelf.filter((m) => m.id !== movie.id);

  return (
    <div className="contenitore pagina">
      <p className="piccolo tenue" style={{ marginBottom: 14 }}>
        <Link href="/catalogo" className="oro">
          Catalogo
        </Link>{" "}
        › {movie.title}
      </p>

      <section className="film-testata">
        {movie.backdrop_url && (
          <div
            className="film-sfondo"
            style={{ backgroundImage: `url(${movie.backdrop_url})` }}
            aria-hidden="true"
          />
        )}

        <div className="film-locandina">
          <Poster movie={movie} sizes="(max-width: 860px) 220px, 260px" />
        </div>

        <div className="film-info">
          <p className="occhiello">{STATO[movie.status]}</p>
          <h1>{movie.title}</h1>
          {movie.original_title && movie.original_title !== movie.title && (
            <p className="film-sottotitolo">{movie.original_title}</p>
          )}

          <div className="film-tag">
            {movie.year && <span className="badge badge-neutro">{movie.year}</span>}
            <span className="badge badge-neutro">
              {formatDuration(movie.duration_min)}
            </span>
            {movie.age_rating && (
              <span className="badge badge-rosso">{movie.age_rating}</span>
            )}
            {movie.genres
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean)
              .map((g) => (
                <Link
                  key={g}
                  href={`/catalogo?genere=${encodeURIComponent(g)}`}
                  className="badge"
                >
                  {g}
                </Link>
              ))}
          </div>

          {movie.synopsis && <p className="film-sinossi">{movie.synopsis}</p>}

          <div className="dati">
            <div className="dato">
              <span className="etichetta">Regia</span>
              <strong>{movie.director || "—"}</strong>
            </div>
            <div className="dato">
              <span className="etichetta">Interpreti</span>
              <strong>{movie.cast_list || "—"}</strong>
            </div>
            <div className="dato">
              <span className="etichetta">Prossima proiezione</span>
              <strong>
                {movie.next_showtime
                  ? `${formatFullDate(movie.next_showtime)}, ${formatTime(movie.next_showtime)}`
                  : "Non in programmazione"}
              </strong>
            </div>
          </div>

          <div className="voto-grande">
            <b>{formatRating(movie.avg_rating)}</b>
            <div>
              <Stars value={movie.avg_rating} />
              <div className="piccolo tenue">
                {movie.reviews_count
                  ? `${movie.reviews_count} ${movie.reviews_count === 1 ? "recensione" : "recensioni"} del pubblico`
                  : "Nessun voto: puoi essere il primo"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="due-colonne sezione">
        <div className="colonna">
          <section className="pannello">
            <h2 style={{ marginBottom: 14 }}>Orari e sale</h2>
            {prossimi.length ? (
              <div className="colonna" style={{ gap: 18 }}>
                {raggruppaPerGiorno(prossimi).map(([giorno, shows]) => (
                  <div key={giorno}>
                    <p className="etichetta" style={{ marginBottom: 8 }}>
                      {formatFullDate(`${giorno}T00:00`)}
                    </p>
                    <div className="orari" style={{ justifyContent: "flex-start" }}>
                      {shows.map((s) => (
                        <span key={s.id} className="orario">
                          {formatTime(s.starts_at)}
                          <small>
                            {s.hall} · {s.format}
                          </small>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vuoto">
                Questo film non è in programmazione al momento.
                <br />
                <Link href="/richieste" className="oro">
                  Richiedilo alla direzione
                </Link>{" "}
                per rivederlo in sala.
              </div>
            )}
          </section>

          <section className="pannello">
            <div className="riga riga-tra" style={{ marginBottom: 10 }}>
              <h2>Recensioni del pubblico</h2>
              <span className="badge badge-neutro">{recensioni.length}</span>
            </div>

            {recensioni.length ? (
              <div>
                {recensioni.map((r) => (
                  <article key={r.id} className="recensione">
                    <div className="recensione-testata">
                      <span className="avatar">{r.author.charAt(0).toUpperCase()}</span>
                      <span className="recensione-autore">{r.author}</span>
                      <Stars value={r.rating} size="0.85rem" />
                      <span className="badge">{r.rating}/10</span>
                      <span className="recensione-data">
                        {formatFullDate(r.updated_at.replace(" ", "T"))}
                      </span>
                    </div>
                    {r.body && <p className="recensione-corpo">{r.body}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="vuoto">
                Ancora nessuna recensione per questo film.
              </div>
            )}
          </section>
        </div>

        <div className="colonna">
          {user?.role === "admin" && (
            <QuickShowtime
              movieId={movie.id}
              movieTitle={movie.title}
              today={todayKey()}
            />
          )}

          <ReviewForm
            movieId={movie.id}
            movieTitle={movie.title}
            existing={mia}
            isLogged={!!user}
          />

          {passati.length > 0 && (
            <section className="pannello">
              <h3 style={{ marginBottom: 10 }}>Già proiettato</h3>
              <div className="colonna" style={{ gap: 7 }}>
                {passati.map((s) => (
                  <div key={s.id} className="riga riga-tra piccolo">
                    <span className="tenue">{formatFullDate(s.starts_at)}</span>
                    <span className="oro">
                      {formatTime(s.starts_at)} · {s.hall}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href={`/archivio?q=${encodeURIComponent(movie.title)}`}
                className="sezione-link"
                style={{ display: "inline-block", marginTop: 12 }}
              >
                Cerca nell'archivio →
              </Link>
            </section>
          )}
        </div>
      </div>

      <MovieRow title="Se ti è piaciuto" accent={genere} movies={simili} />
    </div>
  );
}
