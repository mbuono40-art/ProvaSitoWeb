import Link from "next/link";
import { formatFullDate, formatTime } from "@/lib/format";
import { archiveStats, listAllGenres, searchArchive } from "@/lib/queries";

export default async function ArchivioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");

  const q = one("q");
  const from = one("dal");
  const to = one("al");
  const genere = one("genere");

  const [generi, risultati, stats] = await Promise.all([
    listAllGenres(),
    searchArchive({ q, from, to, genre: genere, limit: 300 }),
    archiveStats(),
  ]);

  const filmDistinti = new Set(risultati.map((r) => r.movie_id)).size;

  return (
    <div className="contenitore pagina">
      <p className="occhiello">Memoria della sala</p>
      <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.7rem)", marginBottom: 8 }}>
        Archivio delle <span className="oro">vecchie programmazioni</span>
      </h1>
      <p className="tenue" style={{ marginBottom: 22, maxWidth: "62ch" }}>
        Ogni proiezione passata resta consultabile: cerca un titolo, restringi a un
        periodo o sfoglia per genere.
      </p>

      <div className="tre-colonne" style={{ marginBottom: 22 }}>
        <div className="statistica">
          <b>{stats.shows}</b>
          <span>proiezioni archiviate</span>
        </div>
        <div className="statistica">
          <b>{stats.films}</b>
          <span>film diversi passati in sala</span>
        </div>
        <div className="statistica">
          <b>{stats.first ? formatFullDate(stats.first).split(" ").slice(1).join(" ") : "—"}</b>
          <span>prima proiezione registrata</span>
        </div>
      </div>

      <form className="pannello" style={{ marginBottom: 26 }}>
        <div className="griglia-form">
          <div className="campo">
            <label htmlFor="q">Titolo o regista</label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Es. Leone" />
          </div>
          <div className="campo">
            <label htmlFor="dal">Dal</label>
            <input id="dal" name="dal" type="date" defaultValue={from} />
          </div>
          <div className="campo">
            <label htmlFor="al">Al</label>
            <input id="al" name="al" type="date" defaultValue={to} />
          </div>
          <div className="campo">
            <label htmlFor="genere">Genere</label>
            <select id="genere" name="genere" defaultValue={genere}>
              <option value="">Tutti i generi</option>
              {generi.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="riga" style={{ marginTop: 15 }}>
          <button type="submit" className="btn btn-oro">
            Cerca nell'archivio
          </button>
          <Link href="/archivio" className="btn btn-fantasma">
            Azzera
          </Link>
          <span className="tenue piccolo" style={{ marginInlineStart: "auto" }}>
            {risultati.length} proiezioni · {filmDistinti} film
          </span>
        </div>
      </form>

      {risultati.length ? (
        <div className="tabella-scroll">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Ora</th>
                <th>Film</th>
                <th>Genere</th>
              </tr>
            </thead>
            <tbody>
              {risultati.map((r) => (
                <tr key={r.id}>
                  <td className="tenue">{formatFullDate(r.starts_at)}</td>
                  <td className="oro">{formatTime(r.starts_at)}</td>
                  <td>
                    <Link href={`/film/${r.movie_id}`} className="oro">
                      {r.title}
                    </Link>
                  </td>
                  <td className="tenue piccolo">{r.genres}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="vuoto">Nessuna proiezione passata corrisponde ai filtri scelti.</div>
      )}
    </div>
  );
}
