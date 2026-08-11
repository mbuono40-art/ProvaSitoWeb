import Link from "next/link";
import {
  deleteUserAction,
  liftSuspensionAction,
  renameUserAction,
  setUserRoleAction,
  suspendUserAction,
} from "@/app/actions/admin";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";
import { getCurrentUser } from "@/lib/auth";
import { formatFullDate } from "@/lib/format";
import { listUsersForAdmin } from "@/lib/queries";

function isSuspendedRow(suspended_until: string | null): boolean {
  if (!suspended_until) return false;
  // Confronto testuale: stesso formato "YYYY-MM-DD HH:MM:SS" di datetime('now').
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  return suspended_until > now;
}

export default async function AdminUtentiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = one("q");
  const ruolo = one("ruolo");
  const stato = one("stato");

  const me = await getCurrentUser();
  const utenti = await listUsersForAdmin({ q, role: ruolo, status: stato });

  const amministratori = utenti.filter((u) => u.role === "admin");
  const spettatori = utenti.filter((u) => u.role !== "admin");
  const soloUnAdmin = amministratori.length <= 1;

  return (
    <div className="colonna" style={{ gap: 22 }}>
      <h2>Utenti registrati ({utenti.length})</h2>

      <form className="pannello" style={{ display: "grid", gap: 12 }}>
        <div className="griglia-form">
          <div className="campo">
            <label htmlFor="q">Cerca per nome o email</label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Es. matteo o gmail" />
          </div>
          <div className="campo">
            <label htmlFor="ruolo">Ruolo</label>
            <select id="ruolo" name="ruolo" defaultValue={ruolo}>
              <option value="">Tutti</option>
              <option value="admin">Direzione</option>
              <option value="user">Spettatore</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="stato">Stato</label>
            <select id="stato" name="stato" defaultValue={stato}>
              <option value="">Tutti</option>
              <option value="attivi">Attivi</option>
              <option value="sospesi">Sospesi</option>
            </select>
          </div>
        </div>
        <div className="riga">
          <button type="submit" className="btn btn-piccolo btn-oro">
            Filtra
          </button>
          <Link href="/admin/utenti" className="btn btn-piccolo btn-fantasma">
            Azzera
          </Link>
        </div>
      </form>

      <section className="pannello">
        <h3 style={{ marginBottom: 6 }}>Direzione</h3>
        <p className="tenue piccolo" style={{ marginBottom: 16 }}>
          Gestisci qui chi ha accesso al pannello di direzione, separatamente dalle
          altre azioni sugli account.
        </p>

        <div className="due-colonne">
          <div>
            <p className="etichetta" style={{ marginBottom: 8 }}>
              Amministratori attuali
            </p>
            <div className="colonna" style={{ gap: 8 }}>
              {amministratori.map((u) => (
                <div key={u.id} className="riga riga-tra">
                  <span>
                    {u.name} <span className="tenue piccolo">{u.email}</span>
                  </span>
                  {u.id !== me?.id && !soloUnAdmin && (
                    <form action={setUserRoleAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="role" value="user" />
                      <button type="submit" className="btn btn-piccolo btn-fantasma">
                        Togli i permessi
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
            {soloUnAdmin && (
              <p className="piccolo tenue" style={{ marginTop: 10 }}>
                Il cinema non può restare senza direzione: l'unico amministratore non
                può essere retrocesso.
              </p>
            )}
          </div>

          <div>
            <p className="etichetta" style={{ marginBottom: 8 }}>
              Promuovi uno spettatore
            </p>
            {spettatori.length ? (
              <form action={setUserRoleAction} className="riga">
                <input type="hidden" name="role" value="admin" />
                <select name="id" required defaultValue="" style={{ flex: 1 }}>
                  <option value="" disabled>
                    Scegli uno spettatore…
                  </option>
                  {spettatori.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-piccolo btn-oro">
                  Rendi amministratore
                </button>
              </form>
            ) : (
              <p className="piccolo tenue">Nessuno spettatore da promuovere.</p>
            )}
          </div>
        </div>
      </section>

      <div className="tabella-scroll">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Ruolo</th>
              <th>Iscritto il</th>
              <th>Recensioni</th>
              <th>Richieste</th>
              <th>Stato scrittura</th>
              <th>Password</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {utenti.map((u) => {
              const sospeso = isSuspendedRow(u.suspended_until);
              return (
                <tr key={u.id}>
                  <td>
                    <form action={renameUserAction} className="riga" style={{ gap: 6 }}>
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        name="name"
                        defaultValue={u.name}
                        style={{ width: 130, padding: "5px 8px" }}
                      />
                      <button type="submit" className="btn btn-piccolo btn-fantasma">
                        Salva
                      </button>
                    </form>
                  </td>
                  <td className="tenue piccolo">{u.email}</td>
                  <td>
                    <span className={`badge${u.role === "admin" ? "" : " badge-neutro"}`}>
                      {u.role === "admin" ? "Direzione" : "Spettatore"}
                    </span>
                  </td>
                  <td className="tenue piccolo">
                    {formatFullDate(u.created_at.replace(" ", "T"))}
                  </td>
                  <td className="tenue">{u.recensioni}</td>
                  <td className="tenue">{u.richieste}</td>
                  <td>
                    {u.id === me?.id ? (
                      <span className="piccolo tenue">—</span>
                    ) : sospeso ? (
                      <div className="colonna" style={{ gap: 6 }}>
                        <span className="badge badge-rosso">
                          Sospeso fino al{" "}
                          {formatFullDate(u.suspended_until!.replace(" ", "T"))}
                        </span>
                        <form action={liftSuspensionAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <button type="submit" className="btn btn-piccolo btn-fantasma">
                            Riattiva
                          </button>
                        </form>
                      </div>
                    ) : (
                      <form action={suspendUserAction} className="riga" style={{ gap: 6 }}>
                        <input type="hidden" name="id" value={u.id} />
                        <input
                          type="number"
                          name="giorni"
                          defaultValue={7}
                          min={1}
                          max={365}
                          style={{ width: 60, padding: "5px 6px" }}
                        />
                        <button type="submit" className="btn btn-piccolo btn-fantasma">
                          Sospendi (giorni)
                        </button>
                      </form>
                    )}
                  </td>
                  <td>
                    <ResetPasswordButton userId={u.id} />
                  </td>
                  <td>
                    {me?.id !== u.id && (
                      <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="btn btn-piccolo btn-rosso">
                          Elimina
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="tenue piccolo">
        Le password sono cifrate (bcrypt) e non possono essere lette, nemmeno dalla
        direzione: usa "Reimposta password" per ottenerne una nuova da comunicare per
        il testing. Un utente sospeso non può scrivere recensioni né inviare
        richieste finché la sospensione non scade o viene rimossa. Eliminando un
        utente si cancellano anche le sue recensioni e i suoi voti.
      </p>
    </div>
  );
}
