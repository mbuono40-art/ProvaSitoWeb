import { TmdbImport } from "@/components/admin/TmdbImport";
import { tmdbAvailable } from "@/lib/tmdb";

export default async function AdminImportaPage() {
  const attivo = tmdbAvailable();

  return (
    <div className="colonna" style={{ gap: 18 }}>
      <div>
        <h2>Importa film da TMDb</h2>
        <p className="tenue piccolo">
          I film importati arrivano già con locandina, trama in italiano, regia, cast,
          durata e link al trailer.
        </p>
      </div>

      {attivo ? (
        <TmdbImport />
      ) : (
        <div className="pannello">
          <p className="avviso avviso-info" style={{ marginBottom: 16 }}>
            <strong className="oro">TMDb non è ancora collegato.</strong> Il sito
            funziona lo stesso: puoi aggiungere i film a mano da{" "}
            <em>Film → Nuovo film</em>.
          </p>

          <h3 style={{ marginBottom: 10 }}>Come attivarlo in 4 passi</h3>
          <ol className="colonna" style={{ gap: 8, paddingInlineStart: 20 }}>
            <li>
              Crea un account gratuito su <strong>themoviedb.org</strong>.
            </li>
            <li>
              Vai in <em>Impostazioni → API</em> e richiedi una chiave per uso
              personale.
            </li>
            <li>
              Nella cartella del progetto crea il file <code>.env.local</code> con
              dentro la riga:
              <br />
              <code
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  padding: "6px 10px",
                  background: "rgba(0,0,0,.5)",
                  borderRadius: 6,
                  border: "1px solid var(--bordo)",
                }}
              >
                TMDB_API_KEY=la_tua_chiave
              </code>
            </li>
            <li>Ferma e riavvia il server di sviluppo.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
