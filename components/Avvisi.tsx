"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/** Quanto resta visibile un messaggio di esito prima di sparire da solo. */
const DURATA = 10_000;

type Tipo = "ok" | "errore" | "info";

/**
 * Mostra il messaggio e lo nasconde dopo DURATA. Il conto riparte ogni volta
 * che cambia "riferimento": per le server action si passa l'oggetto di stato,
 * che è nuovo a ogni risposta, così anche due esiti identici di fila fanno
 * ricomparire l'avviso.
 */
function useAutoNascondi(riferimento: unknown, attivo: boolean): boolean {
  const [visibile, setVisibile] = useState(true);

  useEffect(() => {
    if (!attivo) return;
    setVisibile(true);
    const timer = setTimeout(() => setVisibile(false), DURATA);
    return () => clearTimeout(timer);
  }, [riferimento, attivo]);

  return visibile;
}

function classi(tipo: Tipo): string {
  return `avviso avviso-${tipo} avviso-temporaneo`;
}

/**
 * Esito di una server action (useActionState): mostra l'errore se c'è,
 * altrimenti la conferma, e sparisce da solo dopo dieci secondi.
 */
export function AvvisiAzione({
  stato,
  style,
  tipoOk = "ok",
}: {
  stato: { ok?: string; error?: string };
  style?: CSSProperties;
  /** Alcune conferme sono in realtà note informative, non successi. */
  tipoOk?: Tipo;
}) {
  const messaggio = stato.error ?? stato.ok;
  const tipo: Tipo = stato.error ? "errore" : tipoOk;
  const visibile = useAutoNascondi(stato, !!messaggio);

  if (!messaggio || !visibile) return null;

  return (
    <p
      className={classi(tipo)}
      style={style}
      role={stato.error ? "alert" : "status"}
    >
      {messaggio}
    </p>
  );
}

/** Messaggio singolo, per le conferme mostrate dopo un cambio pagina. */
export function AvvisoTemporaneo({
  tipo = "ok",
  style,
  children,
}: {
  tipo?: Tipo;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const visibile = useAutoNascondi(children, true);
  if (!visibile) return null;

  return (
    <p className={classi(tipo)} style={style} role="status">
      {children}
    </p>
  );
}
