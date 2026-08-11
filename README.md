<p align="center">
  <img src="docs/banner.svg" alt="Cinema Aureo" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-0b0b0f?style=flat-square&labelColor=07060a" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-0b0b0f?style=flat-square&labelColor=07060a" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-0b0b0f?style=flat-square&labelColor=07060a" alt="TypeScript">
  <img src="https://img.shields.io/badge/SQLite-libSQL-0b0b0f?style=flat-square&labelColor=07060a" alt="SQLite / libSQL">
</p>

---

## Descrizione

Applicazione web per la gestione e la consultazione del cartellone di una sala
cinematografica. Il pubblico consulta il catalogo, la programmazione e
l'archivio storico delle proiezioni; gli utenti registrati esprimono voti,
recensioni e preferenze; un'area riservata consente alla direzione di gestire
catalogo, calendario e moderazione.

Progetto sviluppato a scopo didattico.

## Funzionalità

| Area | Descrizione |
| --- | --- |
| Catalogo | Schede film con locandina, dati tecnici, sinossi e cast; ricerca testuale e filtri per genere, stato e ordinamento |
| Programmazione | Calendario degli spettacoli per giornata, con sala e formato di proiezione |
| Archivio | Consultazione storica delle proiezioni concluse, filtrabile per titolo, periodo e genere |
| Valutazioni | Voto numerico e recensione testuale per utente registrato, con media aggregata per film |
| Partecipazione | Sondaggi a scelta singola sul cartellone e invio di proposte alla direzione |
| Area riservata | Gestione di catalogo, calendario, sondaggi, proposte, moderazione dei contenuti e degli account |

## Architettura

Applicazione Next.js con App Router. Il rendering delle pagine e tutte le
operazioni di scrittura avvengono lato server; il codice client è limitato ai
componenti realmente interattivi.

```
app/          route pubbliche, area riservata e server actions
components/   componenti di presentazione e form
lib/          accesso ai dati, autenticazione, integrazioni esterne
docs/         materiale di supporto
```

Il livello di accesso ai dati è isolato in `lib/db.ts` ed espone un'interfaccia
uniforme al resto dell'applicazione. Il motore è SQLite in entrambe le
modalità operative — file locale in sviluppo, istanza libSQL gestita in
ambienti con filesystem non persistente — senza differenze nel codice
applicativo.

## Requisiti

- Node.js 20 o superiore

## Avvio

```bash
npm install
npm run dev
```

Al primo avvio su un database vuoto lo schema viene creato e popolato con un
insieme di dati dimostrativi, incluso l'account di direzione iniziale.

Script disponibili:

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Ambiente di sviluppo |
| `npm run dev:rete` | Ambiente di sviluppo esposto sulla rete locale |
| `npm run build` | Build di produzione |
| `npm start` | Esecuzione della build di produzione |

## Configurazione

Le impostazioni sono lette da variabili d'ambiente; il file `.env.example`
elenca le voci previste. Nessun valore predefinito sensibile è incluso nel
codice sorgente.

| Variabile | Ruolo |
| --- | --- |
| `ADMIN_EMAIL` | Identificativo dell'account di direzione iniziale |
| `ADMIN_PASSWORD` | Credenziale iniziale; se omessa ne viene generata una casuale |
| `TURSO_DATABASE_URL` | Endpoint del database gestito |
| `TURSO_AUTH_TOKEN` | Token di accesso al database gestito |
| `TMDB_API_KEY` | Abilita l'importazione di schede da catalogo esterno |

## Modello di sicurezza

- Credenziali memorizzate esclusivamente come hash bcrypt.
- Sessioni gestite tramite token opachi in cookie `httpOnly`.
- Autorizzazione verificata lato server sia in fase di rendering sia a ogni
  operazione di scrittura.
- Interrogazioni parametrizzate su tutto il livello dati.
- Sospensione temporanea della facoltà di scrittura a livello di account.

## Note

I contenuti dimostrativi (titoli, immagini e metadati) sono impiegati a soli
fini illustrativi e appartengono ai rispettivi titolari.
