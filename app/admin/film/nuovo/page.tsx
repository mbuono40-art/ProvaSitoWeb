import Link from "next/link";
import { MovieForm } from "@/components/admin/MovieForm";

export default async function NuovoFilmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const titolo = typeof sp.titolo === "string" ? sp.titolo : "";
  const annoRaw = typeof sp.anno === "string" ? sp.anno : "";
  const anno = annoRaw && Number.isInteger(Number(annoRaw)) ? Number(annoRaw) : undefined;

  return (
    <div className="colonna">
      <div className="riga riga-tra">
        <h2>Nuovo film</h2>
        <Link href="/admin/film" className="btn btn-piccolo btn-fantasma">
          ← Torna all'elenco
        </Link>
      </div>
      <div className="pannello">
        <p className="tenue piccolo" style={{ marginBottom: 16 }}>
          Compila almeno il titolo. Se lasci vuoto il campo della locandina, il sito ne
          disegna una in tema con la palette del cinema.
        </p>
        <MovieForm initial={{ title: titolo, year: anno }} />
      </div>
    </div>
  );
}
