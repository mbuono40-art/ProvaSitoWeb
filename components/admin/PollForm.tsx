"use client";

import { useActionState, useState } from "react";
import { createPollAction } from "@/app/actions/admin";
import { AvvisiAzione } from "@/components/Avvisi";
import { SubmitButton } from "@/components/SubmitButton";
import type { Movie } from "@/lib/types";

export function PollForm({ movies }: { movies: Movie[] }) {
  const [state, action] = useActionState(createPollAction, {});
  const [filtro, setFiltro] = useState("");

  const visibili = filtro
    ? movies.filter((m) => m.title.toLowerCase().includes(filtro.toLowerCase()))
    : movies;

  return (
    <form action={action} className="form">
      <div className="campo">
        <label htmlFor="title">Domanda del sondaggio</label>
        <input
          id="title"
          name="title"
          required
          placeholder="Quale film proiettiamo domenica sera?"
        />
      </div>
      <div className="campo">
        <label htmlFor="description">Descrizione (facoltativa)</label>
        <textarea
          id="description"
          name="description"
          style={{ minHeight: 80 }}
          placeholder="Il titolo più votato entra in programmazione."
        />
      </div>
      <div className="campo">
        <label htmlFor="ends_at">Chiusura votazioni (facoltativa)</label>
        <input id="ends_at" name="ends_at" type="datetime-local" />
      </div>

      <div className="campo">
        <span className="etichetta">Film in votazione (almeno due)</span>
        <p className="piccolo tenue" style={{ marginBottom: 10 }}>
          I film selezionati qui diventano anche il carosello grande in cima alla
          home: se ne scegli tre, in home ne scorreranno tre. Vale il sondaggio
          aperto più recente.
        </p>
        <input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtra l'elenco per titolo…"
          style={{ marginBottom: 10 }}
        />
        <div
          style={{
            maxHeight: 260,
            overflowY: "auto",
            border: "1px solid var(--bordo)",
            borderRadius: "var(--raggio-s)",
            padding: 10,
          }}
        >
          {visibili.map((m) => (
            <label
              key={m.id}
              className="riga"
              style={{ gap: 9, padding: "5px 2px", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                name="movie_ids"
                value={m.id}
                style={{ width: 17, height: 17 }}
              />
              <span className="piccolo">
                {m.title}{" "}
                <span className="tenue">{m.year ? `(${m.year})` : ""}</span>
              </span>
            </label>
          ))}
          {!visibili.length && <p className="tenue piccolo">Nessun film trovato.</p>}
        </div>
      </div>

      <AvvisiAzione stato={state} />

      <SubmitButton pendingLabel="Creo…">Apri il sondaggio</SubmitButton>
    </form>
  );
}
