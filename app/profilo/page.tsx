import Link from "next/link";
import { ProfileForm } from "@/components/AuthForms";
import { Stars } from "@/components/Stars";
import { logoutAction } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { formatFullDate } from "@/lib/format";
import { requestsByUser, reviewsByUser } from "@/lib/queries";

export default async function ProfiloPage() {
  const user = await requireUser("/profilo");
  const [recensioni, richieste] = await Promise.all([
    reviewsByUser(user.id),
    requestsByUser(user.id),
  ]);

  return (
    <div className="contenitore pagina">
      <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.5rem)", marginBottom: 6 }}>
        Ciao, <span className="oro">{user.name}</span>
      </h1>
      <p className="tenue" style={{ marginBottom: 26 }}>
        Iscritto dal {formatFullDate(user.created_at.replace(" ", "T"))}
      </p>

      <div className="due-colonne">
        <div className="colonna">
          <section className="pannello">
            <div className="riga riga-tra" style={{ marginBottom: 12 }}>
              <h2>Le mie recensioni</h2>
              <span className="badge badge-neutro">{recensioni.length}</span>
            </div>
            {recensioni.length ? (
              recensioni.map((r) => (
                <article key={r.id} className="recensione">
                  <div className="recensione-testata">
                    <Link href={`/film/${r.movie_id}`} className="recensione-autore oro">
                      {r.movie_title}
                    </Link>
                    <Stars value={r.rating} size="0.85rem" />
                    <span className="badge">{r.rating}/10</span>
                    <span className="recensione-data">
                      {formatFullDate(r.updated_at.replace(" ", "T"))}
                    </span>
                  </div>
                  {r.body && <p className="recensione-corpo">{r.body}</p>}
                </article>
              ))
            ) : (
              <div className="vuoto">
                Non hai ancora recensito nulla.{" "}
                <Link href="/catalogo" className="oro">
                  Sfoglia il catalogo
                </Link>
                .
              </div>
            )}
          </section>

          <section className="pannello">
            <div className="riga riga-tra" style={{ marginBottom: 12 }}>
              <h2>Le mie richieste</h2>
              <span className="badge badge-neutro">{richieste.length}</span>
            </div>
            {richieste.length ? (
              <div className="colonna" style={{ gap: 10 }}>
                {richieste.map((r) => (
                  <div key={r.id} className="riga riga-tra">
                    <span>
                      <strong>{r.title}</strong>{" "}
                      {r.year && <span className="tenue">({r.year})</span>}
                    </span>
                    <span className="badge badge-neutro">
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vuoto">
                Nessuna richiesta inviata.{" "}
                <Link href="/richieste" className="oro">
                  Proponi un film
                </Link>
                .
              </div>
            )}
          </section>
        </div>

        <div className="colonna">
          <section className="pannello">
            <h2 style={{ marginBottom: 14 }}>Dati dell'account</h2>
            <p className="piccolo tenue" style={{ marginBottom: 14 }}>
              Email: <strong className="oro">{user.email}</strong>
            </p>
            <ProfileForm name={user.name} />
          </section>

          <form action={logoutAction}>
            <button type="submit" className="btn btn-fantasma btn-blocco">
              Esci dall'account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
