"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createRequestAction } from "@/app/actions/requests";
import { AvvisiAzione } from "./Avvisi";
import { SubmitButton } from "./SubmitButton";

export function RequestForm({ isLogged }: { isLogged: boolean }) {
  const [state, action] = useActionState(createRequestAction, {});

  if (!isLogged) {
    return (
      <div className="pannello">
        <h2 style={{ marginBottom: 8 }}>Proponi un titolo</h2>
        <p className="tenue piccolo" style={{ marginBottom: 14 }}>
          Serve un account per inviare una richiesta: così possiamo contarne i voti
          ed evitare doppioni.
        </p>
        <div className="riga">
          <Link href="/accedi?next=%2Frichieste" className="btn btn-oro">
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
      <h2 style={{ marginBottom: 8 }}>Proponi un titolo</h2>
      <p className="tenue piccolo" style={{ marginBottom: 14 }}>
        Se il film è già stato proposto da qualcun altro, il tuo invio diventa un voto
        in più per quella richiesta.
      </p>
      <form action={action} className="form">
        <div className="campo">
          <label htmlFor="title">Titolo del film</label>
          <input id="title" name="title" type="text" required maxLength={160} />
        </div>
        <div className="campo">
          <label htmlFor="year">Anno (facoltativo)</label>
          <input id="year" name="year" type="number" min={1890} max={2100} />
        </div>
        <div className="campo">
          <label htmlFor="note">Perché dovremmo proiettarlo?</label>
          <textarea id="note" name="note" maxLength={800} style={{ minHeight: 90 }} />
        </div>

        <AvvisiAzione stato={state} />

        <SubmitButton pendingLabel="Invio…">Invia la richiesta</SubmitButton>
      </form>
    </div>
  );
}
