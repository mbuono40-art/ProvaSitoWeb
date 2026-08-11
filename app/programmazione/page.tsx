import Link from "next/link";
import { Poster } from "@/components/Poster";
import { formatDuration, formatFullDate, formatTime } from "@/lib/format";
import { upcomingShowtimes } from "@/lib/queries";
import type { ShowtimeWithMovie } from "@/lib/types";

const GIORNI_BREVI = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

export default async function ProgrammazionePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const richiesto = typeof sp.giorno === "string" ? sp.giorno : "";

  const shows = await upcomingShowtimes(21);
  const giorni = [...new Set(shows.map((s) => s.starts_at.slice(0, 10)))].sort();
  const giorno = giorni.includes(richiesto) ? richiesto : (giorni[0] ?? "");

  const delGiorno = shows.filter((s) => s.starts_at.startsWith(giorno));

  const perFilm = new Map<number, { film: ShowtimeWithMovie; orari: ShowtimeWithMovie[] }>();
  for (const s of delGiorno) {
    if (!perFilm.has(s.movie_id)) perFilm.set(s.movie_id, { film: s, orari: [] });
    perFilm.get(s.movie_id)!.orari.push(s);
  }

  return (
    <div className="contenitore pagina">
      <p className="occhiello">Le prossime tre settimane</p>
      <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.7rem)", marginBottom: 8 }}>
        Programmazione <span className="oro">in sala</span>
      </h1>
      <p className="tenue" style={{ marginBottom: 22, maxWidth: "62ch" }}>
        Scegli il giorno per vedere tutti gli spettacoli, con sala e formato.
      </p>

      {giorni.length === 0 ? (
        <div className="vuoto">
          Nessuno spettacolo programmato al momento. Torna a trovarci.
        </div>
      ) : (
        <>
          <div className="giorni" role="tablist" aria-label="Giorni di programmazione">
            {giorni.map((g) => {
              const d = new Date(`${g}T12:00`);
              return (
                <Link
                  key={g}
                  href={`/programmazione?giorno=${g}`}
                  role="tab"
                  aria-selected={g === giorno}
                  className={`giorno-chip${g === giorno ? " attivo" : ""}`}
                  scroll={false}
                >
                  <small>{GIORNI_BREVI[d.getDay()]}</small>
                  <strong>{d.getDate()}</strong>
                  <small>{d.toLocaleDateString("it-IT", { month: "short" })}</small>
                </Link>
              );
            })}
          </div>

          <h2 style={{ margin: "22px 0 12px", fontSize: "1.3rem" }}>
            {formatFullDate(`${giorno}T00:00`)}
            <span className="tenue piccolo" style={{ marginInlineStart: 10 }}>
              {delGiorno.length} spettacoli
            </span>
          </h2>

          <div className="pannello">
            {[...perFilm.values()].map(({ film, orari }) => (
              <div key={film.movie_id} className="riga-spettacolo">
                <Link href={`/film/${film.movie_id}`} className="mini-locandina">
                  <Poster
                    movie={{
                      title: film.title,
                      poster_url: film.poster_url,
                      year: film.year,
                      genres: film.genres,
                    }}
                    sizes="78px"
                  />
                </Link>
                <div>
                  <Link href={`/film/${film.movie_id}`}>
                    <h3 style={{ fontSize: "1.12rem", marginBottom: 3 }}>
                      {film.title}
                    </h3>
                  </Link>
                  <p className="piccolo tenue">
                    {[
                      film.year,
                      film.genres.split(",")[0]?.trim(),
                      formatDuration(film.duration_min),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="orari">
                  {orari
                    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
                    .map((o) => (
                      <span key={o.id} className="orario">
                        {formatTime(o.starts_at)}
                        <small>
                          {o.hall} · {o.format}
                        </small>
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
