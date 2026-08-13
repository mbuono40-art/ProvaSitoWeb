"use client";

import Link from "next/link";
import { useActionState } from "react";
import { proposeMovieAction } from "@/app/actions/requests";
import { AvvisiAzione } from "./Avvisi";
import { SubmitButton } from "./SubmitButton";

/**
 * Compare nella scheda di un film che non è in cartellone, al posto degli
 * orari: propone quel titolo alla direzione con un clic, senza far riscrivere
 * all'utente dati che il sito ha già.
 */
export function ProposeMovie({
  movieId,
  movieTitle,
  isLogged,
}: {
  movieId: number;
  movieTitle: string;
  isLogged: boolean;
}) {
  const [state, action] = useActionState(proposeMovieAction, {});

  return (
    <div className="proponi">
      <p className="proponi-testo">
        Questo film non è in programmazione al momento.
      </p>

      {isLogged ? (
        <>
          <p className="piccolo tenue" style={{ marginBottom: 16 }}>
            Vuoi rivederlo in sala? Segnalalo alla direzione: le proposte più
            richieste entrano in cartellone.
          </p>
          <form action={action}>
            <input type="hidden" name="movie_id" value={movieId} />
            <SubmitButton className="btn btn-oro" pendingLabel="Invio…">
              Proponi questo film alla direzione
            </SubmitButton>
          </form>

          <AvvisiAzione stato={state} style={{ marginTop: 14 }} />
        </>
      ) : (
        <>
          <p className="piccolo tenue" style={{ marginBottom: 16 }}>
            Con un account puoi proporre <em>{movieTitle}</em> alla direzione e
            chiederne la programmazione.
          </p>
          <div className="riga" style={{ justifyContent: "center" }}>
            <Link
              href={`/accedi?next=${encodeURIComponent(`/film/${movieId}`)}`}
              className="btn btn-oro"
            >
              Accedi per proporlo
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
