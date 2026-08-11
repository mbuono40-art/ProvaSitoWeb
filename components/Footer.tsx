import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="contenitore">
        <div className="footer-griglia">
          <div>
            <div className="logo" style={{ marginBottom: 10 }}>
              <span className="logo-marchio">✦</span>
              <span className="logo-testo">
                <strong>CINEMA AUREO</strong>
                <small>sala storica</small>
              </span>
            </div>
            <p className="piccolo tenue">
              Quattro sale, una programmazione scelta film per film. Il pubblico vota,
              propone e decide che cosa torna sullo schermo.
            </p>
          </div>
          <div>
            <h4>Il cartellone</h4>
            <Link href="/programmazione">Programmazione</Link>
            <Link href="/catalogo">Catalogo completo</Link>
            <Link href="/archivio">Archivio proiezioni</Link>
          </div>
          <div>
            <h4>Partecipa</h4>
            <Link href="/sondaggi">Sondaggi</Link>
            <Link href="/richieste">Richiedi un film</Link>
            <Link href="/registrati">Crea un account</Link>
          </div>
          <div>
            <h4>La sala</h4>
            <p className="piccolo tenue">Via del Cinema 12 — Salerno</p>
            <p className="piccolo tenue">Botteghino: tutti i giorni 15:30 — 23:00</p>
            <p className="piccolo tenue">info@cinemaaureo.it</p>
          </div>
        </div>
        <div className="footer-basso">
          <span>© {new Date().getFullYear()} Cinema Aureo</span>
          <Link href="/admin" className="footer-riservata">
            Area riservata
          </Link>
        </div>
      </div>
    </footer>
  );
}
