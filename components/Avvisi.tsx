"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/** Quanto resta visibile un messaggio di esito prima di sparire da solo. */
const DURATA = 5_000;
/** Quanto dura la dissolvenza finale, dentro DURATA. */
const USCITA = 700;

type Tipo = "ok" | "errore" | "info";
type Fase = "visibile" | "uscita" | "chiuso";

/**
 * Mostra il messaggio, avvia la dissolvenza poco prima della fine e lo rimuove.
 *
 * La scomparsa è pilotata da qui e non da un'animazione CSS: dopo un'azione il
 * server rigenera la pagina, l'elemento può essere ricreato e un'animazione
 * legata alla sua nascita ripartirebbe da capo, facendo sparire l'avviso di
 * colpo. Cambiando invece una classe su un elemento già presente, la
 * dissolvenza si vede sempre.
 *
 * Il conto riparte a ogni cambio di "riferimento": per le server action si
 * passa l'oggetto di stato, nuovo a ogni risposta, così anche due esiti
 * identici di fila fanno ricomparire l'avviso.
 */
function useDissolvenza(riferimento: unknown, attivo: boolean): Fase {
  const [fase, setFase] = useState<Fase>("visibile");

  useEffect(() => {
    if (!attivo) return;
    setFase("visibile");
    const aUscita = setTimeout(() => setFase("uscita"), DURATA - USCITA);
    const aChiusura = setTimeout(() => setFase("chiuso"), DURATA);
    return () => {
      clearTimeout(aUscita);
      clearTimeout(aChiusura);
    };
  }, [riferimento, attivo]);

  return fase;
}

function classi(tipo: Tipo, fase: Fase): string {
  return `avviso avviso-${tipo} avviso-temporaneo${fase === "uscita" ? " in-uscita" : ""}`;
}

/**
 * Esito di una server action (useActionState): mostra l'errore se c'è,
 * altrimenti la conferma, e svanisce da solo dopo pochi secondi.
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
  const fase = useDissolvenza(stato, !!messaggio);

  if (!messaggio || fase === "chiuso") return null;

  return (
    <p
      className={classi(tipo, fase)}
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
  const fase = useDissolvenza(children, true);
  if (fase === "chiuso") return null;

  return (
    <p className={classi(tipo, fase)} style={style} role="status">
      {children}
    </p>
  );
}
