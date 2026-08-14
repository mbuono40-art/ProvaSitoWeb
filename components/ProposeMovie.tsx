"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleInterestAction } from "@/app/actions/requests";
import { AvvisiAzione } from "./Avvisi";
import { SubmitButton } from "./SubmitButton";

/**
 * Compare nella scheda di un film che non è in cartellone, al posto degli
 * orari. L'utente dichiara di volerlo rivedere: il conteggio finisce nelle
 * statistiche che la direzione consulta nel proprio pannello.
 */
export function ProposeMovie({
  movieId,
  movieTitle,
  isLogged,
  interessato,
  interessati,
}: {
  movieId: number;
  movieTitle: string;
  isLogged: boolean;
  /** Se l'utente collegato ha già segnalato interesse per questo film. */
  interessato: boolean;
  /** Quante persone lo hanno segnalato in tutto. */
  interessati: number;
}) {
  const [state, action] = useActionState(toggleInterestAction, {});

  return (
    <div className="proponi">
      <p className="proponi-testo">Questo film non è in programmazione al momento.</p>

      {interessati > 0 && (
        <p className="proponi-conteggio">
          <strong className="oro">{interessati}</strong>{" "}
          {interessati === 1
            ? "persona vorrebbe rivederlo in sala"
            : "persone vorrebbero rivederlo in sala"}
        </p>
      )}

      {isLogged ? (
        <>
          <p className="piccolo tenue" style={{ marginBottom: 16 }}>
            {interessato
              ? "La direzione vede il tuo interesse fra le proposte del pubblico."
              : "Segnala il tuo interesse: i titoli più richiesti tornano in cartellone."}
          </p>
          <form action={action}>
            <input type="hidden" name="movie_id" value={movieId} />
            <SubmitButton
              className={`btn ${interessato ? "btn-fantasma" : "btn-oro"}`}
              pendingLabel="Registro…"
            >
              {interessato ? "✓ Interesse segnalato — ritira" : "Vorrei rivederlo in sala"}
            </SubmitButton>
          </form>

          <AvvisiAzione stato={state} style={{ marginTop: 14 }} />
        </>
      ) : (
        <>
          <p className="piccolo tenue" style={{ marginBottom: 16 }}>
            Con un account puoi segnalare alla direzione che vorresti rivedere{" "}
            <em>{movieTitle}</em> in sala.
          </p>
          <div className="riga" style={{ justifyContent: "center" }}>
            <Link
              href={`/accedi?next=${encodeURIComponent(`/film/${movieId}`)}`}
              className="btn btn-oro"
            >
              Accedi per segnalarlo
            </Link>
            <Link href="/registrati" className="btn btn-fantasma">
              Registrati
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
