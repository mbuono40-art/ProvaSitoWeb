"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Schermata mostrata quando una pagina non riesce a caricarsi: quasi sempre
 * il database non è raggiungibile (token scaduto o credenziali mancanti).
 * Senza questo file il visitatore vedrebbe la pagina di errore grezza del
 * browser, senza alcun riferimento al sito.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[cinema] pagina non caricata:", error);
  }, [error]);

  return (
    <div className="contenitore pagina">
      <div className="pannello pannello-stretto centro">
        <p className="occhiello">Proiezione interrotta</p>
        <h1 style={{ fontSize: "1.7rem", marginBottom: 10 }}>
          La pellicola si è inceppata
        </h1>
        <p className="tenue" style={{ marginBottom: 20 }}>
          Non siamo riusciti a caricare questa pagina. Di solito è una cosa
          momentanea: riprova fra qualche istante.
        </p>

        <div className="riga" style={{ justifyContent: "center" }}>
          <button type="button" onClick={reset} className="btn btn-oro">
            Riprova
          </button>
          <Link href="/" className="btn btn-fantasma">
            Torna alla home
          </Link>
        </div>

        {error.digest && (
          <p className="piccolo tenue" style={{ marginTop: 18 }}>
            Codice per la direzione: <code>{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
