import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";
import { PollCard } from "@/components/PollCard";
import { PollShowcase } from "@/components/PollShowcase";
import { Stars } from "@/components/Stars";
import { getCurrentUser } from "@/lib/auth";
import {
  latestReviews,
  listFeatured,
  listMoviesByStatus,
  listPolls,
  listTopRated,
  moviesByIds,
  nextScreeningDay,
  siteStats,
  upcomingDatesForMovies,
} from "@/lib/queries";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [
    featured,
    inSala,
    prossimi,
    archivio,
    catalogo,
    topRated,
    polls,
    recensioni,
    stats,
    giornata,
  ] = await Promise.all([
    listFeatured(5),
    listMoviesByStatus("in_programmazione", 20),
    listMoviesByStatus("prossimamente", 20),
    listMoviesByStatus("archivio", 20),
    listMoviesByStatus("catalogo", 20),
    listTopRated(15),
    listPolls(user?.id, "aperto"),
    latestReviews(4),
    siteStats(),
    nextScreeningDay(),
  ]);

  // In cima il carosello dei film effettivamente in cartellone nella prima
  // giornata utile, con i loro orari. Senza programmazione si ripiega sui film
  // in evidenza, e in mancanza di quelli su ciò che risulta in sala.
  const filmGiornata = giornata
    ? await moviesByIds([...new Set(giornata.spettacoli.map((s) => s.movie_id))])
    : [];

  const orariPerFilm: Record<number, string[]> = {};
  for (const s of giornata?.spettacoli ?? []) {
    (orariPerFilm[s.movie_id] ??= []).push(s.starts_at);
  }

  const altreProiezioni = giornata
    ? await upcomingDatesForMovies(
        filmGiornata.map((f) => f.id),
        giornata.giorno,
      )
    : {};

  const filmHero = filmGiornata.length
    ? filmGiornata
    : featured.length
      ? featured
      : inSala.slice(0, 5);

  // Sotto, la vetrina dei candidati del sondaggio aperto più recente.
  const sondaggio = polls[0] ?? null;
  const filmSondaggio = sondaggio
    ? await moviesByIds(
        sondaggio.options
          .map((o) => o.movie_id)
          .filter((id): id is number => id !== null),
      )
    : [];

  return (
    <div className="contenitore pagina">
      <HeroCarousel
        movies={filmHero}
        etichetta={filmGiornata.length ? "Oggi in sala" : undefined}
        orariPerFilm={orariPerFilm}
        altreProiezioni={altreProiezioni}
      />

      {sondaggio && filmSondaggio.length > 0 && (
        <PollShowcase sondaggio={sondaggio} film={filmSondaggio} />
      )}

      <div className="due-colonne sezione">
        <div>
          <div className="sezione-testata">
            <h2>
              Decidi tu <span>la rassegna</span>
            </h2>
            <Link href="/sondaggi" className="sezione-link">
              Tutti i sondaggi →
            </Link>
          </div>
          {sondaggio ? (
            <PollCard poll={sondaggio} isLogged={!!user} />
          ) : (
            <div className="vuoto">
              Nessun sondaggio aperto in questo momento. Torna presto.
            </div>
          )}
        </div>

        <div>
          <div className="sezione-testata">
            <h2>
              La sala <span>in numeri</span>
            </h2>
          </div>
          <div className="colonna">
            <div className="tre-colonne" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="statistica">
                <b>{stats.movies}</b>
                <span>film in catalogo</span>
              </div>
              <div className="statistica">
                <b>{stats.upcoming}</b>
                <span>proiezioni in arrivo</span>
              </div>
              <div className="statistica">
                <b>{stats.reviews}</b>
                <span>recensioni</span>
              </div>
              <div className="statistica">
                <b>{stats.users}</b>
                <span>spettatori iscritti</span>
              </div>
            </div>
            <div className="pannello">
              <h3 style={{ marginBottom: 6 }}>Manca un film?</h3>
              <p className="tenue piccolo" style={{ marginBottom: 14 }}>
                Proponilo alla direzione: le richieste più votate entrano in
                programmazione.
              </p>
              <Link href="/richieste" className="btn btn-blocco">
                Richiedi un film
              </Link>
            </div>
          </div>
        </div>
      </div>

      <MovieRow
        title="In sala"
        accent="adesso"
        movies={inSala}
        href="/programmazione"
        hrefLabel="Orari e sale"
        showLabel={false}
      />

      <MovieRow
        title="Prossimamente"
        accent="in cartellone"
        movies={prossimi}
        href="/catalogo?stato=prossimamente"
        showLabel={false}
      />

      <MovieRow
        title="I più votati"
        accent="dal pubblico"
        movies={topRated}
        href="/catalogo?ordina=voto"
      />

      <MovieRow
        title="Rassegne"
        accent="e classici"
        movies={[...archivio, ...catalogo]}
        href="/archivio"
        hrefLabel="Archivio proiezioni"
        showLabel={false}
      />

      {recensioni.length > 0 && (
        <section className="sezione">
          <div className="sezione-testata">
            <h2>
              Ultime <span>recensioni</span>
            </h2>
          </div>
          <div className="tre-colonne">
            {recensioni.map((r) => (
              <Link key={r.id} href={`/film/${r.movie_id}`} className="pannello">
                <div className="riga" style={{ marginBottom: 8 }}>
                  <span className="avatar">{r.author.charAt(0).toUpperCase()}</span>
                  <div>
                    <div className="recensione-autore">{r.author}</div>
                    <Stars value={r.rating} size="0.8rem" />
                  </div>
                </div>
                <div className="recensione-titolo">{r.movie_title}</div>
                <p className="piccolo tenue" style={{ marginTop: 4 }}>
                  {r.body.length > 160 ? `${r.body.slice(0, 160)}…` : r.body}
                </p>
                <p className="piccolo oro" style={{ marginTop: 10 }}>
                  su {r.movie_title} →
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
