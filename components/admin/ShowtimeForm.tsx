"use client";

import { useActionState } from "react";
import { createShowtimeAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import type { Movie } from "@/lib/types";

export function ShowtimeForm({
  movies,
  today,
}: {
  movies: Movie[];
  today: string;
}) {
  const [state, action] = useActionState(createShowtimeAction, {});

  return (
    <form action={action} className="form">
      <div className="griglia-form">
        <div className="campo">
          <label htmlFor="movie_id">Film</label>
          <select id="movie_id" name="movie_id" required defaultValue="">
            <option value="" disabled>
              Scegli un film…
            </option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
                {m.year ? ` (${m.year})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="data">Primo giorno</label>
          <input id="data" name="data" type="date" defaultValue={today} required />
        </div>
        <div className="campo">
          <label htmlFor="giorni">Ripeti per (giorni)</label>
          <input
            id="giorni"
            name="giorni"
            type="number"
            min={1}
            max={60}
            defaultValue={1}
          />
        </div>
        <div className="campo">
          <label htmlFor="orari">Orari (separati da virgola)</label>
          <input
            id="orari"
            name="orari"
            defaultValue="18:30, 21:00"
            placeholder="16:00, 18:30, 21:00"
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="hall">Sala</label>
          <input id="hall" name="hall" defaultValue="Sala Aurea" />
        </div>
        <div className="campo">
          <label htmlFor="format">Formato</label>
          <select id="format" name="format" defaultValue="2D">
            <option>2D</option>
            <option>3D</option>
            <option>IMAX</option>
            <option>Versione restaurata</option>
            <option>Lingua originale</option>
          </select>
        </div>
        <div className="campo">
          <label htmlFor="posti">Posti in sala</label>
          <input id="posti" name="posti" type="number" min={1} defaultValue={120} />
        </div>
      </div>

      {state.error && <p className="avviso avviso-errore">{state.error}</p>}
      {state.ok && <p className="avviso avviso-ok">{state.ok}</p>}

      <SubmitButton pendingLabel="Creo…">Crea gli spettacoli</SubmitButton>
    </form>
  );
}
