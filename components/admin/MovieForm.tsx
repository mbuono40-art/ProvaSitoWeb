"use client";

import { useActionState } from "react";
import { deleteMovieAction, saveMovieAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import type { Movie } from "@/lib/types";

const STATI = [
  { value: "in_programmazione", label: "In programmazione" },
  { value: "prossimamente", label: "Prossimamente" },
  { value: "catalogo", label: "Catalogo" },
  { value: "archivio", label: "Archivio" },
];

export function MovieForm({
  movie,
  initial,
}: {
  movie?: Movie;
  initial?: { title?: string; year?: number };
}) {
  const [state, action] = useActionState(saveMovieAction, {});

  return (
    <>
      <form action={action} className="form">
        {movie && <input type="hidden" name="id" value={movie.id} />}

        <div className="griglia-form">
          <div className="campo">
            <label htmlFor="title">Titolo *</label>
            <input
              id="title"
              name="title"
              defaultValue={movie?.title ?? initial?.title ?? ""}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="original_title">Titolo originale</label>
            <input
              id="original_title"
              name="original_title"
              defaultValue={movie?.original_title ?? ""}
            />
          </div>
          <div className="campo">
            <label htmlFor="year">Anno</label>
            <input
              id="year"
              name="year"
              type="number"
              min={1890}
              max={2100}
              defaultValue={movie?.year ?? initial?.year ?? ""}
            />
          </div>
          <div className="campo">
            <label htmlFor="duration_min">Durata (minuti)</label>
            <input
              id="duration_min"
              name="duration_min"
              type="number"
              min={1}
              max={600}
              defaultValue={movie?.duration_min ?? ""}
            />
          </div>
          <div className="campo">
            <label htmlFor="genres">Generi (separati da virgola)</label>
            <input
              id="genres"
              name="genres"
              defaultValue={movie?.genres ?? ""}
              placeholder="Drammatico, Thriller"
            />
          </div>
          <div className="campo">
            <label htmlFor="age_rating">Classificazione</label>
            <input
              id="age_rating"
              name="age_rating"
              defaultValue={movie?.age_rating ?? ""}
              placeholder="T / VM14 / VM18"
            />
          </div>
          <div className="campo">
            <label htmlFor="director">Regia</label>
            <input id="director" name="director" defaultValue={movie?.director ?? ""} />
          </div>
          <div className="campo">
            <label htmlFor="cast_list">Interpreti</label>
            <input
              id="cast_list"
              name="cast_list"
              defaultValue={movie?.cast_list ?? ""}
              placeholder="Nome, Nome, Nome"
            />
          </div>
          <div className="campo">
            <label htmlFor="status">Stato</label>
            <select id="status" name="status" defaultValue={movie?.status ?? "catalogo"}>
              {STATI.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="trailer_url">Link al trailer</label>
            <input
              id="trailer_url"
              name="trailer_url"
              type="url"
              defaultValue={movie?.trailer_url ?? ""}
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="synopsis">Sinossi</label>
          <textarea id="synopsis" name="synopsis" defaultValue={movie?.synopsis ?? ""} />
        </div>

        <div className="campo">
          <label htmlFor="poster_file">Locandina (verticale, 2:3)</label>
          <input id="poster_file" name="poster_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
          <input
            id="poster_url"
            name="poster_url"
            type="url"
            defaultValue={movie?.poster_url ?? ""}
            placeholder="…oppure incolla un URL"
            style={{ marginTop: 6 }}
          />
          <span className="piccolo tenue">
            Carica un file dal PC (max 5MB) oppure incolla un indirizzo. Se carichi un
            file, ha la precedenza. Vuoto = locandina disegnata dal sito.
          </span>
        </div>

        <label className="riga" style={{ gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={!!movie?.featured}
            style={{ width: 18, height: 18 }}
          />
          <span className="piccolo">
            Mostra in evidenza nella home: usato nel carosello grande solo quando
            non c&apos;è nessun sondaggio aperto
          </span>
        </label>

        {state.error && <p className="avviso avviso-errore">{state.error}</p>}
        {state.ok && <p className="avviso avviso-ok">{state.ok}</p>}

        <SubmitButton pendingLabel="Salvo…">
          {movie ? "Salva modifiche" : "Aggiungi il film"}
        </SubmitButton>
      </form>

      {movie && (
        <form action={deleteMovieAction} style={{ marginTop: 16 }}>
          <input type="hidden" name="id" value={movie.id} />
          <button type="submit" className="btn btn-piccolo btn-rosso">
            Elimina il film (e i suoi spettacoli)
          </button>
        </form>
      )}
    </>
  );
}
