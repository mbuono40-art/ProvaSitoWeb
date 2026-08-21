"use client";

/**
 * Ultima rete di sicurezza: intercetta anche gli errori generati dal layout
 * radice, dove "error.tsx" non arriva. È il caso tipico del database
 * irraggiungibile, visto che l'utente collegato viene letto proprio lì.
 *
 * Sostituendo il layout, questo file deve portarsi html e body. Gli stili
 * sono scritti a mano invece che con le classi del sito: se il guasto
 * impedisse di caricare il foglio di stile, la pagina resterebbe leggibile.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background:
            "radial-gradient(120% 90% at 15% -10%, #2a0a12 0%, transparent 62%), linear-gradient(170deg, #0a0710 0%, #07060a 45%, #050408 100%)",
          color: "#f3ead6",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <main
          style={{
            maxWidth: "460px",
            width: "100%",
            textAlign: "center",
            padding: "34px 26px",
            borderRadius: "14px",
            border: "1px solid rgba(212, 175, 55, 0.22)",
            background: "rgba(22, 20, 27, 0.78)",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.55)",
          }}
        >
          <p
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              fontSize: "0.68rem",
              color: "#8f7420",
            }}
          >
            Cinema Aureo
          </p>

          <h1
            style={{
              margin: "10px 0",
              fontSize: "1.6rem",
              fontWeight: 600,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            La pellicola si è inceppata
          </h1>

          <p style={{ margin: "0 0 22px", color: "#a89f92", lineHeight: 1.6 }}>
            Il sito non riesce a raggiungere i propri dati. Di solito è
            momentaneo: riprova fra poco.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              padding: "11px 22px",
              borderRadius: "999px",
              border: "1px solid #f2dc9b",
              background: "linear-gradient(180deg, #f2dc9b, #d4af37 55%, #8f7420)",
              color: "#1a1206",
              fontSize: "0.95rem",
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            Riprova
          </button>

          {error.digest && (
            <p style={{ marginTop: "18px", fontSize: "0.8rem", color: "#8f7420" }}>
              Codice per la direzione: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
