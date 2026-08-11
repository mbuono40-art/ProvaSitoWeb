import Link from "next/link";
import { formatFullDate, formatTime } from "@/lib/format";
import {
  latestReviews,
  listPolls,
  listRequests,
  siteStats,
  upcomingShowtimes,
} from "@/lib/queries";
import { tmdbAvailable } from "@/lib/tmdb";

export default async function AdminHome() {
  const [stats, prossimiTutti, richiesteTutte, polls, recensioni] = await Promise.all([
    siteStats(),
    upcomingShowtimes(7),
    listRequests(),
    listPolls(null, "aperto"),
    latestReviews(5),
  ]);
  const prossimi = prossimiTutti.slice(0, 8);
  const richieste = richiesteTutte.filter((r) => r.status === "in_attesa").slice(0, 5);

  return (
    <div className="colonna" style={{ gap: 22 }}>
      <div className="tre-colonne">
        <div className="statistica">
          <b>{stats.movies}</b>
          <span>film in catalogo</span>
        </div>
        <div className="statistica">
          <b>{stats.upcoming}</b>
          <span>spettacoli futuri</span>
        </div>
        <div className="statistica">
          <b>{stats.reviews}</b>
          <span>recensioni</span>
        </div>
        <div className="statistica">
          <b>{stats.users}</b>
          <span>utenti registrati</span>
        </div>
        <div className="statistica">
          <b>{stats.requests}</b>
          <span>richieste da valutare</span>
        </div>
        <div className="statistica">
          <b>{stats.polls}</b>
          <span>sondaggi aperti</span>
        </div>
      </div>

      {!tmdbAvailable() && (
        <div className="avviso avviso-info">
          <strong className="oro">TMDb non configurato.</strong> Il sito funziona
          normalmente con il catalogo interno. Per importare film con locandine reali,
          aggiungi <code>TMDB_API_KEY</code> nel file <code>.env.local</code> e riavvia
          il server.
        </div>
      )}

      <div className="due-colonne">
        <section className="pannello">
          <div className="riga riga-tra" style={{ marginBottom: 12 }}>
            <h2>Prossimi spettacoli</h2>
            <Link href="/admin/spettacoli" className="sezione-link">
              Gestisci →
            </Link>
          </div>
          {prossimi.length ? (
            <div className="colonna" style={{ gap: 8 }}>
              {prossimi.map((s) => (
                <div key={s.id} className="riga riga-tra piccolo">
                  <span>
                    <strong className="oro">{formatTime(s.starts_at)}</strong>{" "}
                    {s.title}
                  </span>
                  <span className="tenue">
                    {formatFullDate(s.starts_at)} · {s.hall}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="vuoto">Nessuno spettacolo programmato.</div>
          )}
        </section>

        <section className="pannello">
          <div className="riga riga-tra" style={{ marginBottom: 12 }}>
            <h2>Richieste in attesa</h2>
            <Link href="/admin/richieste" className="sezione-link">
              Gestisci →
            </Link>
          </div>
          {richieste.length ? (
            <div className="colonna" style={{ gap: 8 }}>
              {richieste.map((r) => (
                <div key={r.id} className="riga riga-tra piccolo">
                  <span>
                    <strong>{r.title}</strong>{" "}
                    <span className="tenue">· {r.author}</span>
                  </span>
                  <span className="badge">★ {r.votes ?? 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="vuoto">Nessuna richiesta da valutare.</div>
          )}
        </section>
      </div>

      <div className="due-colonne">
        <section className="pannello">
          <div className="riga riga-tra" style={{ marginBottom: 12 }}>
            <h2>Sondaggi aperti</h2>
            <Link href="/admin/sondaggi" className="sezione-link">
              Gestisci →
            </Link>
          </div>
          {polls.length ? (
            <div className="colonna" style={{ gap: 10 }}>
              {polls.map((p) => (
                <div key={p.id}>
                  <div className="riga riga-tra">
                    <strong>{p.title}</strong>
                    <span className="badge">{p.total_votes} voti</span>
                  </div>
                  <p className="piccolo tenue">
                    In testa:{" "}
                    {p.options[0]
                      ? `${p.options[0].label} (${p.options[0].votes})`
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="vuoto">Nessun sondaggio aperto.</div>
          )}
        </section>

        <section className="pannello">
          <div className="riga riga-tra" style={{ marginBottom: 12 }}>
            <h2>Ultime recensioni</h2>
            <Link href="/admin/recensioni" className="sezione-link">
              Modera →
            </Link>
          </div>
          {recensioni.length ? (
            <div className="colonna" style={{ gap: 8 }}>
              {recensioni.map((r) => (
                <div key={r.id} className="riga riga-tra piccolo">
                  <span>
                    <strong>{r.author}</strong>{" "}
                    <span className="tenue">su {r.movie_title}</span>
                  </span>
                  <span className="badge">{r.rating}/10</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="vuoto">Ancora nessuna recensione.</div>
          )}
        </section>
      </div>
    </div>
  );
}
