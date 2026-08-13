"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deleteReviewAction, saveReviewAction } from "@/app/actions/reviews";
import { AvvisiAzione } from "./Avvisi";
import { SubmitButton } from "./SubmitButton";
import type { ReviewWithAuthor } from "@/lib/types";

export function ReviewForm({
  movieId,
  movieTitle,
  existing,
  isLogged,
}: {
  movieId: number;
  movieTitle: string;
  existing: ReviewWithAuthor | null;
  isLogged: boolean;
}) {
  const [state, action] = useActionState(saveReviewAction, {});
  const [rating, setRating] = useState(existing?.rating ?? 0);

  if (!isLogged) {
    return (
      <div className="pannello">
        <h3 style={{ marginBottom: 8 }}>Dai il tuo voto</h3>
        <p className="tenue piccolo" style={{ marginBottom: 14 }}>
          Per votare e recensire <em>{movieTitle}</em> serve un account gratuito.
        </p>
        <div className="riga">
          <Link
            href={`/accedi?next=${encodeURIComponent(`/film/${movieId}`)}`}
            className="btn btn-oro"
          >
            Accedi
          </Link>
          <Link href="/registrati" className="btn btn-fantasma">
            Registrati
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pannello">
      <h3 style={{ marginBottom: 4 }}>
        {existing ? "La tua recensione" : "Dai il tuo voto"}
      </h3>
      <p className="tenue piccolo" style={{ marginBottom: 14 }}>
        Un voto da 1 a 10. Puoi modificarlo quando vuoi.
      </p>

      <form action={action} className="form">
        <input type="hidden" name="movie_id" value={movieId} />
        <input type="hidden" name="rating" value={rating} />

        <div className="campo">
          <span className="etichetta">Voto</span>
          <div className="selettore-stelle">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <span key={n}>
                <input
                  type="radio"
                  id={`voto-${n}`}
                  name="voto_visivo"
                  checked={rating === n}
                  onChange={() => setRating(n)}
                />
                <label htmlFor={`voto-${n}`}>{n}</label>
              </span>
            ))}
          </div>
        </div>

        <div className="campo">
          <label htmlFor="corpo-rec">Recensione</label>
          <textarea
            id="corpo-rec"
            name="body"
            maxLength={4000}
            defaultValue={existing?.body ?? ""}
            placeholder="Che cosa ti è rimasto di questo film?"
          />
        </div>

        <AvvisiAzione stato={state} />

        <div className="riga">
          <SubmitButton pendingLabel="Salvo…">
            {existing ? "Aggiorna" : "Pubblica"}
          </SubmitButton>
          {existing && (
            <span className="tenue piccolo">
              Voto attuale: <strong className="oro">{existing.rating}/10</strong>
            </span>
          )}
        </div>
      </form>

      {existing && (
        <form action={deleteReviewAction} style={{ marginTop: 12 }}>
          <input type="hidden" name="movie_id" value={movieId} />
          <button type="submit" className="btn btn-piccolo btn-fantasma">
            Elimina la mia recensione
          </button>
        </form>
      )}
    </div>
  );
}
