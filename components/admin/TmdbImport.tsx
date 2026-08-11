"use client";

import { useActionState } from "react";
import {
  importTmdbAction,
  tmdbSearchAction,
  type TmdbState,
} from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import type { TmdbSearchResult } from "@/lib/tmdb";

const IMG = "https://image.tmdb.org/t/p/w200";

function ImportCard({ film }: { film: TmdbSearchResult }) {
  const [state, action] = useActionState(importTmdbAction, {});

  return (
    <div className="pannello" style={{ display: "flex", gap: 14 }}>
      <div
        className="mini-locandina"
        style={{ width: 92, flexShrink: 0 }}
      >
        {film.poster_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${IMG}${film.poster_path}`} alt={`Locandina di ${film.title}`} />
        ) : (
          <div className="locandina-disegnata">
            <div className="lp-alto">TMDb</div>
            <div className="lp-titolo" style={{ fontSize: "0.8rem" }}>
              {film.title}
            </div>
            <div className="lp-basso" />
          </div>
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{ fontSize: "1.05rem" }}>{film.title}</h3>
        <p className="piccolo tenue">
          {film.release_date ? film.release_date.slice(0, 4) : "anno sconosciuto"}
          {film.original_title !== film.title ? ` · ${film.original_title}` : ""}
          {film.vote_average ? ` · TMDb ${film.vote_average.toFixed(1)}` : ""}
        </p>
        <p
          className="piccolo tenue"
          style={{
            margin: "6px 0 10px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {film.overview || "Nessuna trama disponibile in italiano."}
        </p>

        <form action={action} className="riga" style={{ gap: 8 }}>
          <input type="hidden" name="tmdb_id" value={film.id} />
          <select name="status" defaultValue="catalogo" style={{ width: "auto" }}>
            <option value="catalogo">Catalogo</option>
            <option value="in_programmazione">In programmazione</option>
            <option value="prossimamente">Prossimamente</option>
            <option value="archivio">Archivio</option>
          </select>
          <SubmitButton className="btn btn-piccolo btn-oro" pendingLabel="Importo…">
            Importa
          </SubmitButton>
        </form>

        {state.error && (
          <p className="avviso avviso-errore" style={{ marginTop: 8 }}>
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="avviso avviso-ok" style={{ marginTop: 8 }}>
            {state.ok}
          </p>
        )}
      </div>
    </div>
  );
}

export function TmdbImport() {
  const [state, action] = useActionState<TmdbState, FormData>(tmdbSearchAction, {});

  return (
    <div className="colonna" style={{ gap: 18 }}>
      <form action={action} className="pannello">
        <div className="campo">
          <label htmlFor="query">Cerca un film su TMDb</label>
          <input
            id="query"
            name="query"
            type="search"
            required
            minLength={2}
            placeholder="Es. Nuovo Cinema Paradiso"
            defaultValue={state.query ?? ""}
          />
        </div>
        <div className="riga" style={{ marginTop: 14 }}>
          <SubmitButton pendingLabel="Cerco…">Cerca</SubmitButton>
        </div>

        {state.error && (
          <p className="avviso avviso-errore" style={{ marginTop: 12 }}>
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="avviso avviso-info" style={{ marginTop: 12 }}>
            {state.ok}
          </p>
        )}
      </form>

      {state.results?.map((f) => (
        <ImportCard key={f.id} film={f} />
      ))}
    </div>
  );
}
