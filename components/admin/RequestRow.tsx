"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deleteRequestAction, updateRequestAction } from "@/app/actions/admin";
import { AvvisiAzione } from "@/components/Avvisi";
import { SubmitButton } from "@/components/SubmitButton";
import type { MovieRequest } from "@/lib/types";

const STATI = [
  { value: "in_attesa", label: "In valutazione" },
  { value: "approvata", label: "Approvata" },
  { value: "programmata", label: "In programmazione" },
  { value: "rifiutata", label: "Non accolta" },
];

export function RequestRow({ request }: { request: MovieRequest }) {
  const [state, action] = useActionState(updateRequestAction, {});

  return (
    <div className="pannello">
      <div className="riga riga-tra" style={{ marginBottom: 6 }}>
        <h3 style={{ fontSize: "1.1rem" }}>
          {request.title}
          {request.year ? <span className="tenue"> ({request.year})</span> : null}
        </h3>
        <span className="badge">★ {request.votes ?? 0}</span>
      </div>
      <p className="piccolo tenue" style={{ marginBottom: 8 }}>
        proposto da {request.author}
      </p>
      {request.note && (
        <p className="piccolo" style={{ color: "rgba(243,234,214,.8)", marginBottom: 12 }}>
          “{request.note}”
        </p>
      )}

      <form action={action} className="form" style={{ gap: 10 }}>
        <input type="hidden" name="id" value={request.id} />
        <div className="griglia-form">
          <div className="campo">
            <label htmlFor={`stato-${request.id}`}>Stato</label>
            <select
              id={`stato-${request.id}`}
              name="status"
              defaultValue={request.status}
            >
              {STATI.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor={`nota-${request.id}`}>Risposta pubblica</label>
            <input
              id={`nota-${request.id}`}
              name="admin_note"
              defaultValue={request.admin_note ?? ""}
              placeholder="Visibile a tutti sotto la richiesta"
            />
          </div>
        </div>

        <AvvisiAzione stato={state} />

        <div className="riga">
          <SubmitButton className="btn btn-piccolo btn-oro" pendingLabel="Salvo…">
            Salva
          </SubmitButton>
        </div>
      </form>

      <div className="riga" style={{ marginTop: 10 }}>
        <Link
          href={`/admin/film/nuovo?titolo=${encodeURIComponent(request.title)}${
            request.year ? `&anno=${request.year}` : ""
          }`}
          className="btn btn-piccolo btn-fantasma"
        >
          Aggiungi al catalogo →
        </Link>
        <form action={deleteRequestAction}>
          <input type="hidden" name="id" value={request.id} />
          <button type="submit" className="btn btn-piccolo btn-fantasma">
            Elimina richiesta
          </button>
        </form>
      </div>
    </div>
  );
}
