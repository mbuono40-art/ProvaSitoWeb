"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { votePollAction } from "@/app/actions/polls";
import { formatFullDate } from "@/lib/format";
import type { PollWithOptions } from "@/lib/types";

export function PollCard({
  poll,
  isLogged,
}: {
  poll: PollWithOptions;
  isLogged: boolean;
}) {
  const [state, action] = useActionState(votePollAction, {});
  const chiuso = poll.status !== "aperto";
  const totale = poll.total_votes;

  // Opzione appena premuta: serve solo per l'effetto visivo immediato,
  // prima che il server risponda e la pagina si aggiorni.
  const [inAttesa, setInAttesa] = useState<number | null>(null);
  // Opzione confermata dal server: fa scattare il lampo dorato una sola volta.
  const [confermata, setConfermata] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Volutamente senza "inAttesa" tra le dipendenze: deve reagire solo alla
  // risposta del server (nuovo stato dell'azione o nuovo voto registrato),
  // non al clic che ha appena impostato l'attesa.
  useEffect(() => {
    if (inAttesa === null) return;
    setConfermata(inAttesa);
    setInAttesa(null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfermata(null), 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.my_option_id, state]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="pannello">
      <div className="riga riga-tra" style={{ marginBottom: 6 }}>
        <span className={`badge${chiuso ? " badge-neutro" : ""}`}>
          {chiuso ? "Chiuso" : "Votazione aperta"}
        </span>
        <span className="piccolo tenue">
          {totale} {totale === 1 ? "voto" : "voti"}
        </span>
      </div>

      <h3 style={{ marginBottom: 6 }}>{poll.title}</h3>
      {poll.description && (
        <p className="tenue piccolo" style={{ marginBottom: 6 }}>
          {poll.description}
        </p>
      )}
      {poll.ends_at && !chiuso && (
        <p className="piccolo oro" style={{ marginBottom: 14 }}>
          Si vota fino a {formatFullDate(poll.ends_at)}
        </p>
      )}

      <form action={action} className="colonna" style={{ gap: 9 }}>
        <input type="hidden" name="poll_id" value={poll.id} />
        {poll.options.map((o) => {
          const perc = totale ? Math.round((o.votes / totale) * 100) : 0;
          const mia = poll.my_option_id === o.id;
          const classi = [
            "opzione-sondaggio",
            mia ? "opzione-scelta-mia" : "",
            inAttesa === o.id ? "in-attesa" : "",
            confermata === o.id ? "appena-votata" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={o.id}
              type="submit"
              name="option_id"
              value={o.id}
              className={classi}
              disabled={chiuso || !isLogged}
              onClick={() => setInAttesa(o.id)}
            >
              <span
                className="opzione-barra"
                style={{ width: `${perc}%` }}
                aria-hidden="true"
              />
              <span className="opzione-segno">{mia ? "◉" : "○"}</span>
              <span>{o.label}</span>
              <span className={`opzione-scelta${mia ? " opzione-mia" : ""}`}>
                {perc}% <span className="tenue piccolo">({o.votes})</span>
              </span>
            </button>
          );
        })}
      </form>

      {state.error && (
        <p className="avviso avviso-errore" style={{ marginTop: 12 }}>
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="avviso avviso-ok" style={{ marginTop: 12 }}>
          {state.ok}
        </p>
      )}

      {!isLogged && !chiuso && (
        <p className="piccolo tenue" style={{ marginTop: 12 }}>
          <Link href="/accedi?next=%2Fsondaggi" className="oro">
            Accedi
          </Link>{" "}
          per esprimere il tuo voto: uno per persona, modificabile fino alla chiusura.
        </p>
      )}
      {isLogged && poll.my_option_id && !chiuso && (
        <p className="piccolo tenue" style={{ marginTop: 12 }}>
          Hai già votato. Puoi cambiare scelta cliccando un'altra opzione.
        </p>
      )}
    </div>
  );
}
