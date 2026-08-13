import { PollForm } from "@/components/admin/PollForm";
import { deletePollAction, togglePollAction } from "@/app/actions/admin";
import { formatFullDate } from "@/lib/format";
import { allMoviesSimple, listPolls } from "@/lib/queries";

export default async function AdminSondaggiPage() {
  const [movies, polls] = await Promise.all([allMoviesSimple(), listPolls(null)]);

  // La home usa il sondaggio aperto più recente: è lo stesso criterio di
  // ordinamento di listPolls, quindi è il primo "aperto" di questo elenco.
  const inHome = polls.find((p) => p.status === "aperto") ?? null;

  return (
    <div className="due-colonne">
      <div className="colonna">
        <h2>Sondaggi ({polls.length})</h2>
        <p className="tenue piccolo">
          I film del sondaggio aperto più recente compaiono nel carosello grande
          in cima alla home. Chiudendolo, la home torna a mostrare i film marcati
          come «in evidenza» nella scheda del film.
        </p>
        {polls.length === 0 && <div className="vuoto">Nessun sondaggio creato.</div>}

        {polls.map((p) => (
          <div key={p.id} className="pannello">
            <div className="riga riga-tra" style={{ marginBottom: 8 }}>
              <h3>{p.title}</h3>
              <span className="riga" style={{ gap: 6 }}>
                {inHome?.id === p.id && (
                  <span className="badge">In home ({p.options.length} film)</span>
                )}
                <span className={`badge${p.status === "aperto" ? "" : " badge-neutro"}`}>
                  {p.status === "aperto" ? "Aperto" : "Chiuso"}
                </span>
              </span>
            </div>
            {p.description && <p className="piccolo tenue">{p.description}</p>}
            <p className="piccolo tenue" style={{ marginBottom: 12 }}>
              {p.total_votes} voti
              {p.ends_at ? ` · chiude il ${formatFullDate(p.ends_at)}` : ""}
            </p>

            <div className="colonna" style={{ gap: 6, marginBottom: 14 }}>
              {p.options.map((o) => {
                const perc = p.total_votes
                  ? Math.round((o.votes / p.total_votes) * 100)
                  : 0;
                return (
                  <div key={o.id} className="riga riga-tra piccolo">
                    <span>{o.label}</span>
                    <span className="oro">
                      {o.votes} voti · {perc}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="riga">
              <form action={togglePollAction}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="btn btn-piccolo">
                  {p.status === "aperto" ? "Chiudi votazioni" : "Riapri votazioni"}
                </button>
              </form>
              <form action={deletePollAction}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="btn btn-piccolo btn-rosso">
                  Elimina
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <section className="pannello">
        <h2 style={{ marginBottom: 6 }}>Nuovo sondaggio</h2>
        <p className="tenue piccolo" style={{ marginBottom: 16 }}>
          Ogni utente registrato può esprimere un solo voto, modificabile finché il
          sondaggio resta aperto.
        </p>
        <PollForm movies={movies} />
      </section>
    </div>
  );
}
