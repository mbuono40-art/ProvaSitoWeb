import Link from "next/link";
import { allMoviesSimple } from "@/lib/queries";

const STATO: Record<string, string> = {
  in_programmazione: "In sala",
  prossimamente: "Prossimamente",
  archivio: "Archivio",
  catalogo: "Catalogo",
};

export default async function AdminFilmPage() {
  const films = await allMoviesSimple();

  return (
    <div className="colonna">
      <div className="riga riga-tra">
        <h2>Film in catalogo ({films.length})</h2>
        <div className="riga">
          <Link href="/admin/importa" className="btn btn-piccolo btn-fantasma">
            Importa da TMDb
          </Link>
          <Link href="/admin/film/nuovo" className="btn btn-piccolo btn-oro">
            + Nuovo film
          </Link>
        </div>
      </div>

      <div className="tabella-scroll">
        <table>
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Anno</th>
              <th>Generi</th>
              <th>Stato</th>
              <th>Evidenza</th>
              <th>Locandina</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {films.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link href={`/admin/film/${m.id}`} className="oro">
                    {m.title}
                  </Link>
                </td>
                <td className="tenue">{m.year ?? "—"}</td>
                <td className="tenue piccolo">{m.genres || "—"}</td>
                <td>
                  <span className="badge badge-neutro">{STATO[m.status]}</span>
                </td>
                <td>{m.featured ? "★" : ""}</td>
                <td className="tenue piccolo">
                  {m.poster_url ? "immagine" : "disegnata"}
                </td>
                <td>
                  <Link
                    href={`/film/${m.id}`}
                    className="btn btn-piccolo btn-fantasma"
                  >
                    Vedi
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
