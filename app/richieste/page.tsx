import { RequestForm } from "@/components/RequestForm";
import { deleteOwnRequestAction } from "@/app/actions/requests";
import { getCurrentUser } from "@/lib/auth";
import { requestsByUser } from "@/lib/queries";
import { formatFullDate } from "@/lib/format";

const STATO_LABEL: Record<string, { testo: string; classe: string }> = {
  in_attesa: { testo: "In valutazione", classe: "badge badge-neutro" },
  approvata: { testo: "Approvata", classe: "badge" },
  programmata: { testo: "In programmazione", classe: "badge" },
  rifiutata: { testo: "Non accolta", classe: "badge badge-rosso" },
};

export default async function RichiestePage() {
  const user = await getCurrentUser();
  const richieste = user ? await requestsByUser(user.id) : [];

  return (
    <div className="contenitore pagina">
      <p className="occhiello">Proponi un titolo alla direzione</p>
      <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.7rem)", marginBottom: 8 }}>
        Richiedi un <span className="oro">film</span>
      </h1>
      <p className="tenue" style={{ marginBottom: 26, maxWidth: "62ch" }}>
        Ogni richiesta viene inviata alla direzione per essere valutata: non è
        visibile agli altri utenti. Qui sotto trovi lo stato delle richieste che
        hai inviato tu.
      </p>

      <div className="due-colonne">
        <div>
          <div className="sezione-testata">
            <h2>
              Le tue <span>richieste</span>
            </h2>
            {user && (
              <span className="piccolo tenue">{richieste.length} inviate</span>
            )}
          </div>

          {!user ? (
            <div className="vuoto">
              Accedi per vedere lo stato delle richieste che hai inviato.
            </div>
          ) : richieste.length ? (
            <div className="colonna">
              {richieste.map((r) => {
                const stato = STATO_LABEL[r.status] ?? STATO_LABEL.in_attesa;
                return (
                  <div key={r.id} className="pannello">
                    <div className="riga riga-tra" style={{ marginBottom: 6 }}>
                      <h3 style={{ fontSize: "1.15rem" }}>
                        {r.title}
                        {r.year ? (
                          <span className="tenue"> ({r.year})</span>
                        ) : null}
                      </h3>
                      <span className={stato.classe}>{stato.testo}</span>
                    </div>

                    {r.note && (
                      <p className="piccolo" style={{ color: "rgba(243,234,214,.8)" }}>
                        {r.note}
                      </p>
                    )}

                    <div className="riga riga-tra" style={{ marginTop: 12 }}>
                      <span className="piccolo tenue">
                        inviata il {formatFullDate(r.created_at.replace(" ", "T"))}
                      </span>

                      {r.status === "in_attesa" && (
                        <form action={deleteOwnRequestAction}>
                          <input type="hidden" name="request_id" value={r.id} />
                          <button type="submit" className="btn btn-piccolo btn-fantasma">
                            Ritira
                          </button>
                        </form>
                      )}
                    </div>

                    {r.admin_note && (
                      <p className="avviso avviso-info" style={{ marginTop: 12 }}>
                        <strong className="oro">Risposta della direzione: </strong>
                        {r.admin_note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="vuoto">
              Non hai ancora inviato nessuna richiesta.
            </div>
          )}
        </div>

        <RequestForm isLogged={!!user} />
      </div>
    </div>
  );
}
