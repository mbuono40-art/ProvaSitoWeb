"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createShowtimeAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

/**
 * Scorciatoia riservata alla direzione, dentro la scheda del film: mette
 * subito quel titolo in programmazione senza passare dal pannello.
 * L'azione richiamata verifica comunque il ruolo lato server, quindi non
 * basta far comparire questo riquadro per poterlo usare.
 */
export function QuickShowtime({
  movieId,
  movieTitle,
  today,
}: {
  movieId: number;
  movieTitle: string;
  today: string;
}) {
  const [state, action] = useActionState(createShowtimeAction, {});
  const [aperto, setAperto] = useState(false);

  return (
    <section className="pannello riquadro-direzione">
      <div className="riga riga-tra" style={{ marginBottom: aperto ? 14 : 0 }}>
        <div>
          <p className="occhiello" style={{ marginBottom: 2 }}>
            Riservato alla direzione
          </p>
          <h3 style={{ fontSize: "1.05rem" }}>Metti in programmazione</h3>
        </div>
        <button
          type="button"
          className={`btn btn-piccolo${aperto ? " btn-fantasma" : " btn-oro"}`}
          onClick={() => setAperto((v) => !v)}
          aria-expanded={aperto}
        >
          {aperto ? "Annulla" : "Programma questo film"}
        </button>
      </div>

      {aperto && (
        <form action={action} className="form" style={{ gap: 12 }}>
          <input type="hidden" name="movie_id" value={movieId} />
          <input type="hidden" name="giorni" value={1} />

          <p className="piccolo tenue">
            Aggiunge <strong className="oro">{movieTitle}</strong> al cartellone
            nella data indicata.
          </p>

          <div className="griglia-form">
            <div className="campo">
              <label htmlFor="data-rapida">Giorno</label>
              <input
                id="data-rapida"
                name="data"
                type="date"
                defaultValue={today}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="orari-rapidi">Orari (separati da virgola)</label>
              <input
                id="orari-rapidi"
                name="orari"
                defaultValue="21:00"
                placeholder="18:30, 21:00"
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="sala-rapida">Sala</label>
              <input id="sala-rapida" name="hall" defaultValue="Sala Aurea" />
            </div>
            <div className="campo">
              <label htmlFor="formato-rapido">Formato</label>
              <select id="formato-rapido" name="format" defaultValue="2D">
                <option>2D</option>
                <option>3D</option>
                <option>IMAX</option>
                <option>Versione restaurata</option>
                <option>Lingua originale</option>
              </select>
            </div>
          </div>

          {state.error && <p className="avviso avviso-errore">{state.error}</p>}
          {state.ok && <p className="avviso avviso-ok">{state.ok}</p>}

          <div className="riga">
            <SubmitButton className="btn btn-piccolo btn-oro" pendingLabel="Aggiungo…">
              Aggiungi al cartellone
            </SubmitButton>
            <Link href="/admin/spettacoli" className="sezione-link">
              Programmazione completa →
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
