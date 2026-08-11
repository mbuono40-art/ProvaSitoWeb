import Link from "next/link";
import { MovieCard } from "@/components/MovieCard";
import { listAllGenres, searchMovies } from "@/lib/queries";

const STATI = [
  { value: "", label: "Tutti" },
  { value: "in_programmazione", label: "In sala" },
  { value: "prossimamente", label: "Prossimamente" },
  { value: "archivio", label: "Archivio" },
  { value: "catalogo", label: "Catalogo" },
];

const ORDINI = [
  { value: "titolo", label: "Titolo (A-Z)" },
  { value: "voto", label: "Voto più alto" },
  { value: "anno", label: "Anno più recente" },
  { value: "recenti", label: "Aggiunti di recente" },
];

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : "";
  };

  const q = one("q");
  const genere = one("genere");
  const stato = one("stato");
  const ordina = one("ordina") || "titolo";

  const [generi, films] = await Promise.all([
    listAllGenres(),
    searchMovies({ q, genre: genere, status: stato, sort: ordina }),
  ]);

  return (
    <div className="contenitore pagina">
      <p className="occhiello">Il catalogo del Cinema Aureo</p>
      <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.7rem)", marginBottom: 8 }}>
        Tutti i <span className="oro">film</span>
      </h1>
      <p className="tenue" style={{ marginBottom: 22, maxWidth: "62ch" }}>
        Cerca per titolo, regista o interprete, filtra per genere e ordina come
        preferisci. Ogni scheda raccoglie orari, recensioni e voti del pubblico.
      </p>

      <form className="pannello" style={{ marginBottom: 26 }}>
        <div className="griglia-form">
          <div className="campo">
            <label htmlFor="q">Cerca</label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Titolo, regista, interprete…"
            />
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
          <div className="campo">
            <label htmlFor="stato">Stato</label>
            <select id="stato" name="stato" defaultValue={stato}>
              {STATI.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="ordina">Ordina per</label>
            <select id="ordina" name="ordina" defaultValue={ordina}>
              {ORDINI.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="riga" style={{ marginTop: 15 }}>
          <button type="submit" className="btn btn-oro">
            Applica filtri
          </button>
          <Link href="/catalogo" className="btn btn-fantasma">
            Azzera
          </Link>
          <span className="tenue piccolo" style={{ marginInlineStart: "auto" }}>
            {films.length} {films.length === 1 ? "film trovato" : "film trovati"}
          </span>
        </div>
      </form>

      {films.length ? (
        <div className="griglia-film">
          {films.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <div className="vuoto">
          Nessun film corrisponde alla ricerca.
          <br />
          <Link href="/richieste" className="oro">
            Proponilo alla direzione
          </Link>
          .
        </div>
      )}
    </div>
  );
}
