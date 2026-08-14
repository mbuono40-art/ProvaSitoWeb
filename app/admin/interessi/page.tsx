import Link from "next/link";
import { Poster } from "@/components/Poster";
import { formatFullDate } from "@/lib/format";
import { listInterests } from "@/lib/queries";

const STATO: Record<string, string> = {
  in_programmazione: "In sala",
  prossimamente: "Prossimamente",
  archivio: "Archivio",
  catalogo: "Catalogo",
};

export default async function AdminInteressiPage() {
  const righe = await listInterests();
  const totaleSegnalazioni = righe.reduce((s, r) => s + r.interessati, 0);
  const daProgrammare = righe.filter((r) => r.in_programmazione === 0);

  return (
    <div className="colonna" style={{ gap: 22 }}>
      <div>
        <h2>Film che il pubblico vorrebbe rivedere</h2>
        <p className="tenue piccolo">
          Segnalazioni raccolte dalla scheda dei film già presenti in catalogo. Le
          proposte scritte a mano su titoli che non abbiamo restano invece nella
          sezione Richieste.
        </p>
      </div>

      <div className="tre-colonne">
        <div className="statistica">
          <b>{righe.length}</b>
          <span>film segnalati</span>
        </div>
        <div className="statistica">
          <b>{totaleSegnalazioni}</b>
          <span>segnalazioni totali</span>
        </div>
        <div className="statistica">
          <b>{daProgrammare.length}</b>
          <span>senza proiezioni in programma</span>
        </div>
      </div>

      {righe.length === 0 ? (
        <div className="vuoto">
          Nessuna segnalazione per ora. Compaiono qui quando un utente, dalla
          scheda di un film non in cartellone, dichiara di volerlo rivedere.
        </div>
      ) : (
        <div className="colonna" style={{ gap: 12 }}>
          {righe.map((r, posizione) => (
            <div key={r.movie_id} className="pannello interesse-riga">
              <span className="interesse-posizione">{posizione + 1}</span>

              <Link href={`/film/${r.movie_id}`} className="interesse-locandina">
                <Poster
                  movie={{
                    title: r.title,
                    poster_url: r.poster_url,
                    year: r.year,
                    genres: r.genres,
                  }}
                  sizes="60px"
                />
              </Link>

              <div style={{ minWidth: 0, flex: 1 }}>
                <Link href={`/film/${r.movie_id}`}>
                  <h3 style={{ fontSize: "1.05rem" }}>
                    {r.title}
                    {r.year ? <span className="tenue"> ({r.year})</span> : null}
                  </h3>
                </Link>
                <p className="piccolo tenue">
                  <span className="badge badge-neutro">{STATO[r.status]}</span>{" "}
                  ultima segnalazione {formatFullDate(r.ultimo.replace(" ", "T"))}
                </p>
              </div>

              <div className="interesse-azioni">
                <span className="interesse-conteggio">
                  <b>{r.interessati}</b>
                  <span className="piccolo tenue">
                    {r.interessati === 1 ? "interessato" : "interessati"}
                  </span>
                </span>
                {r.in_programmazione > 0 ? (
                  <span className="badge">già in cartellone</span>
                ) : (
                  <Link
                    href={`/film/${r.movie_id}`}
                    className="btn btn-piccolo btn-oro"
                  >
                    Programma
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
