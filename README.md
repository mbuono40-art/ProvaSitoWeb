# Cinema Aureo

Sito completo di un cinema: catalogo con caroselli orizzontali, account utente,
voti e recensioni, programmazione futura, archivio delle vecchie proiezioni,
richieste di film, sondaggi e pannello di direzione.

Tecnologie: **Next.js 16 + React 19 + TypeScript + SQLite/Turso** (in locale
gira senza account o servizi esterni; per pubblicarlo online serve solo un
database Turso gratuito, vedi punto 8).

---

## 1. Avvio in 30 secondi

Apri il terminale nella cartella del progetto (`C:\Sviluppo\cinema_web`) e lancia:

```bash
npm run dev
```

Poi apri il browser su **http://localhost:3000**.

Al primo avvio il sito crea da solo:

- il database `data/cinema.db`;
- 26 film di esempio con generi, regia, cast e trame;
- circa 465 spettacoli (3 settimane future + 4 mesi di archivio);
- un sondaggio aperto e due richieste di esempio;
- l'account amministratore.

Per fermare il server: `Ctrl + C` nel terminale.

## 2. Entrare come amministratore

Al primo avvio viene creato un account di direzione con i valori di
`ADMIN_EMAIL` e `ADMIN_PASSWORD` (vedi `.env.example`). Se non li imposti, i
valori di ripiego sono `admin@cinemaaureo.it` / `aureo2026`.

> ⚠️ **Questi valori di ripiego sono scritti qui, in un file pubblico: non
> lasciarli mai attivi su un sito online.** Prima di pubblicare, imposta un
> `ADMIN_EMAIL` e un `ADMIN_PASSWORD` tuoi (punto 8.3), e se l'account è già
> stato creato cambia la password dal tuo profilo.

Accedi da **Accedi** in alto a destra. Il pannello di direzione **non** è nel
menu principale: si raggiunge dal link discreto **"Area riservata"** in fondo
al footer, oppure andando direttamente su `/admin`. Una volta loggato come
admin, cliccare sul proprio nome in alto ti porta lì direttamente.

Nota: `ADMIN_PASSWORD` vale **solo alla creazione** dell'account. Se l'account
esiste già, cambiarla nelle variabili d'ambiente non ha effetto: va cambiata
dal profilo, o rigenerata da **Admin → Utenti → Reimposta password**.

Dal pannello di direzione puoi:

- **Film** — aggiungere, modificare, eliminare film (con upload locandina da
  file locale); decidere quali finiscono nel carosello grande della home.
- **Importa da TMDb** — cercare un film e importarlo con locandina, trama in
  italiano, regia, cast, durata e trailer (serve la chiave, vedi punto 6).
- **Programmazione** — creare spettacoli anche in blocco: scegli film, giorno,
  orari separati da virgola e per quanti giorni ripeterli.
- **Sondaggi** — creare una votazione "quale film vedere", chiuderla, riaprirla.
- **Richieste** — sono private (visibili solo a chi le invia e alla direzione):
  approvarle, rifiutarle o segnarle come programmate, con una risposta pubblica
  visibile solo a chi ha inviato la richiesta.
- **Recensioni** — nascondere una recensione (sparisce dal sito e dalla media)
  o eliminarla.
- **Utenti** — cercare/filtrare, rinominare, sospendere temporaneamente dalla
  scrittura, reimpostare la password (le password sono cifrate e non possono
  essere lette: si può solo generarne una nuova), promuovere o retrocedere
  dalla direzione, eliminare.

## 3. Vedere il sito dallo smartphone

Sul PC lancia:

```bash
npm run dev:rete
```

Nel terminale compare una riga tipo `Network: http://192.168.1.42:3000`.
Scrivi **quell'indirizzo** nel browser del telefono: PC e telefono devono essere
sulla stessa rete Wi-Fi e il PC deve restare acceso.

Se il telefono non si collega, la causa quasi sempre è il firewall di Windows:
al primo avvio autorizza Node.js sulle **reti private** (o disattiva
temporaneamente le eventuali regole "Blocca" per `node.exe` in Windows
Defender Firewall → Regole connessioni in entrata).

## 4. Palette e tema

Colori fissi in tutto il sito: **oro, rosso scuro, nero**. Nessuna parte
dell'interfaccia cambia automaticamente: è lo stesso tema sempre, giorno e
notte, in ogni stagione.

## 5. Il database

In locale i dati (utenti, recensioni, voti, spettacoli, richieste, sondaggi)
stanno nel file `data/cinema.db` (creato al primo avvio, escluso da Git).

- **Backup locale**: copia il file `data/cinema.db` da qualche parte.
- **Ripartire da zero in locale**: chiudi il server, cancella la cartella
  `data`, riavvia. Il catalogo di esempio viene ricreato, ma perdi utenti e
  recensioni.

Online (vedi punto 8) i dati vivono invece su Turso, non sul file locale.

## 6. Collegare TMDb (facoltativo)

Senza chiave il sito funziona benissimo: i film senza immagine ricevono una
locandina disegnata dal sito, in tema con la palette.

Per avere invece locandine e trame reali:

1. crea un account gratuito su [themoviedb.org](https://www.themoviedb.org/);
2. vai in **Impostazioni → API** e richiedi una chiave per uso personale;
3. crea nella cartella del progetto un file chiamato `.env.local` (copia
   `.env.example`) e imposta:

   ```
   TMDB_API_KEY=la_tua_chiave
   ```

4. ferma e riavvia `npm run dev`.

Da quel momento **Admin → Importa da TMDb** diventa attivo. Funzionano sia la
chiave v3 sia il token v4.

## 7. Mappa del progetto

```
app/
  page.tsx              home: hero + caroselli + sondaggio + recensioni
  film/[id]/             scheda film: orari, recensioni, voto
  catalogo/               ricerca e filtri su tutto il catalogo
  programmazione/         spettacoli futuri, giorno per giorno
  archivio/               ricerca nelle proiezioni passate
  sondaggi/               votazioni "quale film vedere"
  richieste/               proponi un film (privato: solo tu e la direzione)
  accedi/ registrati/ profilo/
  admin/                  pannello di direzione (protetto, non nel menu)
  actions/                tutte le operazioni di scrittura (server actions)
components/               header, caroselli, locandine, form
lib/
  db.ts                  connessione al database (locale o Turso) e schema
  queries.ts              tutte le letture dal database
  seed.ts                 catalogo iniziale e programmazione di esempio
  auth.ts                 sessioni, ruoli, sospensioni, protezione pagine
  tmdb.ts                 client TMDb (opzionale)
  upload.ts               upload locandine da file locale
app/globals.css           intero design system: palette, layout, responsive
```

## 8. Pubblicare online (Vercel + Turso)

Il sito è pronto per andare online gratis su **Vercel**, con i dati salvati su
**Turso** (un database SQLite in cloud, stesso motore usato in locale — il
codice non cambia tra locale e online).

### 8.1 Crea il database Turso

1. Vai su [turso.tech](https://turso.tech) e registrati (consigliato: accesso
   con GitHub).
2. Dalla dashboard crea un nuovo database (es. `cinema-aureo`).
3. Apri il database e trova la sezione "Connect" / "Credentials": copia
   **Database URL** (inizia con `libsql://…`) e genera un **Auth Token**.

### 8.2 Metti il codice su GitHub

```bash
git add -A
git commit -m "Pubblica il sito"
git push -u origin main
```

(Se non hai ancora creato il repository su GitHub, fallo prima da
[github.com/new](https://github.com/new), poi collega il repository locale con
`git remote add origin <url-del-repo>`.)

### 8.3 Collega Vercel

1. Vai su [vercel.com](https://vercel.com), registrati (consigliato: accesso
   con GitHub) e clicca **"Add New… → Project"**.
2. Importa il repository del sito.
3. Prima di avviare il deploy, apri **"Environment Variables"** e aggiungi:

   | Nome                 | Valore                                  |
   | -------------------- | ---------------------------------------- |
   | `TURSO_DATABASE_URL` | l'URL copiato al punto 8.1               |
   | `TURSO_AUTH_TOKEN`   | il token copiato al punto 8.1            |
   | `ADMIN_EMAIL`        | l'email che vuoi per l'account direzione |
   | `ADMIN_PASSWORD`     | una password sicura (cambiala dopo)      |
   | `TMDB_API_KEY`       | facoltativa, vedi punto 6                |

4. Clicca **Deploy**. In un paio di minuti il sito è online con un indirizzo
   tipo `cinema-aureo.vercel.app` (personalizzabile dalle impostazioni del
   progetto Vercel).

Da lì in poi, ogni `git push` su GitHub aggiorna automaticamente il sito
online.

## 9. Sicurezza

- Le password sono salvate con hash **bcrypt**, mai in chiaro: nemmeno
  l'admin può leggerle, solo reimpostarle.
- La sessione è un token casuale in un cookie `httpOnly`, valido 30 giorni.
- Le pagine `/admin` sono protette lato server e ogni operazione di scrittura
  ricontrolla il ruolo: non basta conoscere l'indirizzo per entrare.
- Le query usano sempre parametri legati (niente SQL injection).
- Un utente sospeso dalla direzione non può scrivere recensioni né inviare
  richieste finché la sospensione non scade o viene rimossa.
