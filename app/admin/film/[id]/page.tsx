import Link from "next/link";
import { notFound } from "next/navigation";
import { AvvisoTemporaneo } from "@/components/Avvisi";
import { MovieForm } from "@/components/admin/MovieForm";
import { Poster } from "@/components/Poster";
import { dbGet } from "@/lib/db";
import { formatFullDate, formatTime } from "@/lib/format";
import { showtimesForMovie } from "@/lib/queries";
import type { Movie } from "@/lib/types";

export default async function ModificaFilmPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const movie = await dbGet<Movie>(`SELECT * FROM movies WHERE id = @id`, { id: Number(id) });
  if (!movie) notFound();

  const shows = await showtimesForMovie(movie.id);

  return (
    <div className="colonna">
      <div className="riga riga-tra">
        <h2>Modifica film</h2>
        <div className="riga">
          <Link href={`/film/${movie.id}`} className="btn btn-piccolo btn-fantasma">
            Vedi la scheda
          </Link>
          <Link href="/admin/film" className="btn btn-piccolo btn-fantasma">
            ← Elenco
          </Link>
        </div>
      </div>

      {sp.nuovo && (
        <AvvisoTemporaneo>
          Film creato. Ora puoi aggiungere gli spettacoli dalla sezione
          Programmazione.
        </AvvisoTemporaneo>
      )}

      <div className="due-colonne">
        <div className="pannello">
          <MovieForm movie={movie} />
        </div>

        <div className="colonna">
          <div className="pannello">
            <h3 style={{ marginBottom: 12 }}>Anteprima locandina</h3>
            <div
              className="card-locandina"
              style={{ maxWidth: 200, marginInline: "auto" }}
            >
              <Poster movie={movie} sizes="200px" />
            </div>
          </div>

          <div className="pannello">
            <div className="riga riga-tra" style={{ marginBottom: 10 }}>
              <h3>Spettacoli futuri</h3>
              <Link href="/admin/spettacoli" className="sezione-link">
                Aggiungi →
              </Link>
            </div>
            {shows.length ? (
              <div className="colonna" style={{ gap: 6 }}>
                {shows.slice(0, 12).map((s) => (
                  <div key={s.id} className="riga riga-tra piccolo">
                    <span className="tenue">{formatFullDate(s.starts_at)}</span>
                    <span className="oro">
                      {formatTime(s.starts_at)} · {s.hall}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="tenue piccolo">Nessuno spettacolo programmato.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
