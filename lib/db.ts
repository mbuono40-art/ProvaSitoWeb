import "server-only";
import { createClient, type Client, type InArgs, type Row } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

/**
 * Connessione al database. In sviluppo punta a un file SQLite locale
 * (data/cinema.db); in produzione, se TURSO_DATABASE_URL è impostata, punta
 * al database Turso in cloud. Stesso motore SQLite in entrambi i casi, stesso
 * codice: cambia solo dove vivono i dati.
 */

declare global {
  // eslint-disable-next-line no-var
  var __cinemaDb: Client | undefined;
  // eslint-disable-next-line no-var
  var __cinemaMigrated: Promise<void> | undefined;
}

function resolveUrl(): string {
  const remote = process.env.TURSO_DATABASE_URL;
  if (remote) return remote;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return `file:${path.join(dataDir, "cinema.db")}`;
}

function createConnection(): Client {
  return createClient({
    url: resolveUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
    intMode: "number",
  });
}

function client(): Client {
  if (!global.__cinemaDb) {
    global.__cinemaDb = createConnection();
  }
  return global.__cinemaDb;
}

async function runMigration(db: Client): Promise<void> {
  try {
    await db.execute("PRAGMA foreign_keys = ON");
  } catch (e) {
    // Con un database remoto la causa più frequente è il token scaduto o
    // sbagliato. Senza questo messaggio nei log resta solo un generico 500.
    if (process.env.TURSO_DATABASE_URL) {
      console.error(
        "\n[cinema] Impossibile parlare con il database remoto." +
          "\n[cinema] Causa più probabile: TURSO_AUTH_TOKEN scaduto o errato." +
          "\n[cinema] Genera un token nuovo (senza scadenza) su turso.tech e" +
          "\n[cinema] aggiornalo sia in .env.local sia fra le variabili di Vercel." +
          `\n[cinema] Dettaglio: ${e instanceof Error ? e.message : String(e)}\n`,
      );
    }
    throw e;
  }

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      name             TEXT NOT NULL,
      email            TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash    TEXT NOT NULL,
      role             TEXT NOT NULL DEFAULT 'user',
      suspended_until  TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movies (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id        INTEGER UNIQUE,
      title          TEXT NOT NULL,
      original_title TEXT,
      year           INTEGER,
      genres         TEXT NOT NULL DEFAULT '',
      duration_min   INTEGER,
      director       TEXT,
      cast_list      TEXT,
      synopsis       TEXT,
      poster_url     TEXT,
      backdrop_url   TEXT,
      trailer_url    TEXT,
      age_rating     TEXT,
      status         TEXT NOT NULL DEFAULT 'catalogo',
      featured       INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS showtimes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id    INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      starts_at   TEXT NOT NULL,
      hall        TEXT NOT NULL DEFAULT 'Sala 1',
      format      TEXT NOT NULL DEFAULT '2D',
      price_cents INTEGER NOT NULL DEFAULT 900,
      seats_total INTEGER NOT NULL DEFAULT 120,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_showtimes_starts ON showtimes(starts_at);
    CREATE INDEX IF NOT EXISTS idx_showtimes_movie ON showtimes(movie_id);

    CREATE TABLE IF NOT EXISTS reviews (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id   INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
      title      TEXT,
      body       TEXT NOT NULL DEFAULT '',
      hidden     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (movie_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS movie_requests (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
      title      TEXT NOT NULL,
      year       INTEGER,
      note       TEXT,
      status     TEXT NOT NULL DEFAULT 'in_attesa',
      admin_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS request_votes (
      request_id INTEGER NOT NULL REFERENCES movie_requests(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (request_id, user_id)
    );

    /* Interesse dichiarato su un film già in catalogo, dalla sua scheda.
       Diverso da movie_requests, che raccoglie proposte scritte a mano su
       titoli che il cinema non ha. La chiave doppia impedisce i doppioni. */
    CREATE TABLE IF NOT EXISTS movie_interests (
      movie_id   INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (movie_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_interests_movie ON movie_interests(movie_id);

    CREATE TABLE IF NOT EXISTS polls (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT,
      starts_at   TEXT NOT NULL DEFAULT (datetime('now')),
      ends_at     TEXT,
      status      TEXT NOT NULL DEFAULT 'aperto',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS poll_options (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id  INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      movie_id INTEGER REFERENCES movies(id) ON DELETE SET NULL,
      label    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS poll_votes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id    INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      option_id  INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (poll_id, user_id)
    );
  `);

  // Colonne aggiunte dopo la prima versione: su un database già esistente
  // "CREATE TABLE IF NOT EXISTS" non le crea da solo.
  await ensureColumn(db, "users", "suspended_until", "TEXT");
}

async function ensureColumn(
  db: Client,
  table: string,
  column: string,
  definition: string,
) {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  const cols = info.rows as unknown as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/** Connessione pronta all'uso: garantisce che lo schema sia stato creato. */
export async function getDb(): Promise<Client> {
  const db = client();
  if (!global.__cinemaMigrated) {
    global.__cinemaMigrated = runMigration(db);
  }
  await global.__cinemaMigrated;
  return db;
}

export type Args = InArgs;

/**
 * Le righe di @libsql/client non sono oggetti "semplici" (hanno un
 * prototipo/metodi propri): React vieta di passarle da un Server Component a
 * un Client Component. Le ricostruiamo come oggetti letterali usando
 * l'accesso posizionale, che è l'unica interfaccia garantita e stabile.
 */
function toPlainRow(row: Row, columns: string[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < columns.length; i++) {
    obj[columns[i]] = row[i];
  }
  return obj;
}

/**
 * Turso remoto rifiuta i parametri nominati che non compaiono nella query
 * ("Number of arguments mismatch"), mentre il file SQLite locale li ignora in
 * silenzio. Diverse query hanno un WHERE costruito a pezzi, quindi certi
 * parametri esistono solo in alcune combinazioni di filtri: qui teniamo solo
 * quelli davvero citati nell'SQL, così le due modalità si comportano uguale.
 */
function pruneArgs(sql: string, args: Args): Args {
  if (Array.isArray(args)) return args;
  const usati: Record<string, unknown> = {};
  for (const [nome, valore] of Object.entries(args)) {
    const sicuro = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // SQLite ammette @nome, :nome e $nome come segnaposto.
    if (new RegExp(`[@:$]${sicuro}\\b`).test(sql)) usati[nome] = valore;
  }
  return usati as Args;
}

/** Prima riga del risultato, o undefined. Equivalente a db.prepare(sql).get(args). */
export async function dbGet<T = unknown>(sql: string, args: Args = {}): Promise<T | undefined> {
  const db = await getDb();
  const result = await db.execute({ sql, args: pruneArgs(sql, args) });
  const row = result.rows[0];
  return row ? (toPlainRow(row, result.columns) as unknown as T) : undefined;
}

/** Tutte le righe. Equivalente a db.prepare(sql).all(args). */
export async function dbAll<T = unknown>(sql: string, args: Args = {}): Promise<T[]> {
  const db = await getDb();
  const result = await db.execute({ sql, args: pruneArgs(sql, args) });
  return result.rows.map((row) => toPlainRow(row, result.columns)) as unknown as T[];
}

/** INSERT/UPDATE/DELETE. Equivalente a db.prepare(sql).run(args). */
export async function dbRun(
  sql: string,
  args: Args = {},
): Promise<{ lastInsertRowid: number; changes: number }> {
  const db = await getDb();
  const result = await db.execute({ sql, args: pruneArgs(sql, args) });
  return {
    lastInsertRowid: Number(result.lastInsertRowid ?? 0),
    changes: result.rowsAffected,
  };
}

export type { Client as DbClient };
