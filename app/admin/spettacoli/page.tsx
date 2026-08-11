import { ShowtimeForm } from "@/components/admin/ShowtimeForm";
import {
  deleteDayShowtimesAction,
  deleteShowtimeAction,
} from "@/app/actions/admin";
import { formatFullDate, formatTime, todayKey } from "@/lib/format";
import { allMoviesSimple, upcomingShowtimes } from "@/lib/queries";
import type { ShowtimeWithMovie } from "@/lib/types";

export default async function AdminSpettacoliPage() {
  const [movies, shows] = await Promise.all([allMoviesSimple(), upcomingShowtimes(60)]);

  const perGiorno = new Map<string, ShowtimeWithMovie[]>();
  for (const s of shows) {
    const g = s.starts_at.slice(0, 10);
    if (!perGiorno.has(g)) perGiorno.set(g, []);
    perGiorno.get(g)!.push(s);
  }

  return (
    <div className="colonna" style={{ gap: 22 }}>
      <section className="pannello">
        <h2 style={{ marginBottom: 6 }}>Aggiungi spettacoli</h2>
        <p className="tenue piccolo" style={{ marginBottom: 16 }}>
          Puoi creare più orari in un colpo solo e ripeterli per più giorni: utile per
          impostare un'intera settimana di programmazione.
        </p>
        <ShowtimeForm movies={movies} today={todayKey()} />
      </section>

      <section className="colonna">
        <h2>Programmazione futura ({shows.length} spettacoli)</h2>
        {perGiorno.size === 0 && (
          <div className="vuoto">Non c'è ancora nessuno spettacolo in programma.</div>
        )}
        {[...perGiorno.entries()].map(([giorno, lista]) => (
          <div key={giorno} className="pannello">
            <div className="riga riga-tra" style={{ marginBottom: 10 }}>
              <h3>{formatFullDate(`${giorno}T00:00`)}</h3>
              <form action={deleteDayShowtimesAction}>
                <input type="hidden" name="giorno" value={giorno} />
                <button type="submit" className="btn btn-piccolo btn-fantasma">
                  Svuota il giorno
                </button>
              </form>
            </div>
            <div className="tabella-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Ora</th>
                    <th>Film</th>
                    <th>Posti</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((s) => (
                    <tr key={s.id}>
                      <td className="oro">{formatTime(s.starts_at)}</td>
                      <td>{s.title}</td>
                      <td className="tenue">{s.seats_total}</td>
                      <td>
                        <form action={deleteShowtimeAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className="btn btn-piccolo btn-fantasma"
                          >
                            Elimina
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
