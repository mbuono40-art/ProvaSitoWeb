import Link from "next/link";
import { RequestRow } from "@/components/admin/RequestRow";
import { listRequests } from "@/lib/queries";

export default async function AdminRichiestePage() {
  const richieste = await listRequests();
  const attesa = richieste.filter((r) => r.status === "in_attesa");
  const altre = richieste.filter((r) => r.status !== "in_attesa");

  return (
    <div className="colonna" style={{ gap: 22 }}>
      <div className="riga riga-tra">
        <p className="tenue piccolo">
          Approvi una richiesta e vuoi aggiungerla subito al catalogo? Usa il
          pulsante qui sotto, oppure "Aggiungi al catalogo" su ogni singola
          richiesta per precompilare titolo e anno.
        </p>
        <Link href="/admin/film/nuovo" className="btn btn-piccolo btn-oro">
          + Nuovo film
        </Link>
      </div>

      <section className="colonna">
        <h2>Da valutare ({attesa.length})</h2>
        {attesa.length ? (
          attesa.map((r) => <RequestRow key={r.id} request={r} />)
        ) : (
          <div className="vuoto">Nessuna richiesta in attesa.</div>
        )}
      </section>

      {altre.length > 0 && (
        <section className="colonna">
          <h2>Già gestite ({altre.length})</h2>
          {altre.map((r) => (
            <RequestRow key={r.id} request={r} />
          ))}
        </section>
      )}
    </div>
  );
}
