import Link from "next/link";

export default function NotFound() {
  return (
    <div className="contenitore pagina">
      <div className="pannello pannello-stretto centro">
        <p className="occhiello">Errore 404</p>
        <h1 style={{ fontSize: "1.8rem", marginBottom: 10 }}>
          Questa pellicola non è in archivio
        </h1>
        <p className="tenue" style={{ marginBottom: 20 }}>
          La pagina che cercavi non esiste o è stata rimossa dal cartellone.
        </p>
        <div className="riga" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn btn-oro">
            Torna in sala
          </Link>
          <Link href="/catalogo" className="btn btn-fantasma">
            Sfoglia il catalogo
          </Link>
        </div>
      </div>
    </div>
  );
}
