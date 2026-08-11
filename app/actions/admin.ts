"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import type { InStatement } from "@libsql/client";
import { dbAll, dbGet, dbRun, getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { tmdbDetails, tmdbSearch, type TmdbSearchResult } from "@/lib/tmdb";
import { fileFromForm, saveUploadedImage } from "@/lib/upload";

export interface AdminState {
  error?: string;
  ok?: string;
}

async function assertAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return { ok: false, error: "Operazione riservata alla direzione." };
  return { ok: true };
}

function refreshAll() {
  revalidatePath("/", "layout");
}

/* ----------------------------------------------------------------- film */

export async function saveMovieAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const id = Number(formData.get("id") || 0);
  const str = (k: string) => String(formData.get(k) || "").trim();
  const num = (k: string) => {
    const v = str(k);
    return v ? Number(v) : null;
  };

  const title = str("title");
  if (title.length < 1) return { error: "Il titolo è obbligatorio." };

  let posterUrl = str("poster_url") || null;

  try {
    const posterFile = fileFromForm(formData, "poster_file");
    if (posterFile) posterUrl = await saveUploadedImage(posterFile, "locandina");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore nel caricamento dell'immagine." };
  }

  const dati = {
    title,
    original_title: str("original_title") || null,
    year: num("year"),
    genres: str("genres"),
    duration_min: num("duration_min"),
    director: str("director") || null,
    cast_list: str("cast_list") || null,
    synopsis: str("synopsis") || null,
    poster_url: posterUrl,
    // niente backdrop_url: il campo è stato tolto dal form (rompeva il layout
    // della scheda con certe immagini orizzontali). Un eventuale sfondo
    // importato da TMDb resta quindi intatto anche modificando il film.
    trailer_url: str("trailer_url") || null,
    age_rating: str("age_rating") || null,
    status: str("status") || "catalogo",
    featured: formData.get("featured") ? 1 : 0,
  };

  if (id) {
    await dbRun(
      `UPDATE movies SET title=@title, original_title=@original_title, year=@year,
         genres=@genres, duration_min=@duration_min, director=@director,
         cast_list=@cast_list, synopsis=@synopsis, poster_url=@poster_url,
         trailer_url=@trailer_url,
         age_rating=@age_rating, status=@status, featured=@featured
       WHERE id=@id`,
      { ...dati, id },
    );
    refreshAll();
    return { ok: "Film aggiornato." };
  }

  const { lastInsertRowid } = await dbRun(
    `INSERT INTO movies (title, original_title, year, genres, duration_min, director,
       cast_list, synopsis, poster_url, trailer_url, age_rating,
       status, featured)
     VALUES (@title, @original_title, @year, @genres, @duration_min, @director,
       @cast_list, @synopsis, @poster_url, @trailer_url, @age_rating,
       @status, @featured)`,
    dati,
  );

  refreshAll();
  redirect(`/admin/film/${lastInsertRowid}?nuovo=1`);
}

export async function deleteMovieAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  await dbRun(`DELETE FROM movies WHERE id = @id`, { id: Number(formData.get("id")) });
  refreshAll();
  redirect("/admin/film");
}

/* ----------------------------------------------------------- spettacoli */

export async function createShowtimeAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const movieId = Number(formData.get("movie_id"));
  const data = String(formData.get("data") || "");
  const orari = String(formData.get("orari") || "")
    .split(/[,\s]+/)
    .map((o) => o.trim())
    .filter(Boolean);
  const giorni = Math.min(Math.max(Number(formData.get("giorni") || 1), 1), 60);
  const hall = String(formData.get("hall") || "Sala 1").trim();
  const format = String(formData.get("format") || "2D").trim();
  const posti = Number(formData.get("posti") || 120);

  if (!movieId) return { error: "Scegli un film." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { error: "Data non valida." };
  if (!orari.length) return { error: "Indica almeno un orario (es. 18:30, 21:00)." };
  for (const o of orari) {
    if (!/^\d{1,2}:\d{2}$/.test(o))
      return { error: `Orario non valido: ${o}. Usa il formato 21:00.` };
  }

  const insertSql = `INSERT INTO showtimes (movie_id, starts_at, hall, format, seats_total)
     VALUES (@movieId, @startsAt, @hall, @format, @posti)`;
  const statements: InStatement[] = [];
  const base = new Date(`${data}T12:00`);

  for (let g = 0; g < giorni; g++) {
    const d = new Date(base);
    d.setDate(base.getDate() + g);
    const giorno = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    for (const o of orari) {
      const [hh, mm] = o.split(":");
      statements.push({
        sql: insertSql,
        args: {
          movieId,
          startsAt: `${giorno}T${hh.padStart(2, "0")}:${mm}`,
          hall,
          format,
          posti,
        },
      });
    }
  }

  const db = await getDb();
  await db.batch(statements, "write");

  refreshAll();
  return {
    ok: `${statements.length} ${statements.length === 1 ? "spettacolo creato" : "spettacoli creati"}.`,
  };
}

export async function deleteShowtimeAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  await dbRun(`DELETE FROM showtimes WHERE id = @id`, { id: Number(formData.get("id")) });
  refreshAll();
}

export async function deleteDayShowtimesAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  const giorno = String(formData.get("giorno") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(giorno)) return;
  await dbRun(`DELETE FROM showtimes WHERE starts_at LIKE @prefix`, { prefix: `${giorno}T%` });
  refreshAll();
}

/* -------------------------------------------------------------- sondaggi */

export async function createPollAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const ends = String(formData.get("ends_at") || "").trim();
  const movieIds = formData
    .getAll("movie_ids")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);

  if (title.length < 3) return { error: "Dai un titolo al sondaggio." };
  if (movieIds.length < 2) return { error: "Scegli almeno due film da mettere ai voti." };

  const movies = await dbAll<{ id: number; title: string }>(
    `SELECT id, title FROM movies WHERE id IN (${movieIds.map(() => "?").join(",")})`,
    movieIds,
  );

  const { lastInsertRowid: pollId } = await dbRun(
    `INSERT INTO polls (title, description, ends_at, status)
     VALUES (@title, @description, @ends, 'aperto')`,
    { title, description: description || null, ends: ends || null },
  );

  if (movies.length) {
    const db = await getDb();
    await db.batch(
      movies.map((m) => ({
        sql: `INSERT INTO poll_options (poll_id, movie_id, label) VALUES (@pollId, @movieId, @label)`,
        args: { pollId, movieId: m.id, label: m.title },
      })),
      "write",
    );
  }

  refreshAll();
  return { ok: "Sondaggio creato e già votabile." };
}

export async function togglePollAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  await dbRun(
    `UPDATE polls SET status = CASE status WHEN 'aperto' THEN 'chiuso' ELSE 'aperto' END
      WHERE id = @id`,
    { id: Number(formData.get("id")) },
  );
  refreshAll();
}

export async function deletePollAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  await dbRun(`DELETE FROM polls WHERE id = @id`, { id: Number(formData.get("id")) });
  refreshAll();
}

/* -------------------------------------------------------------- richieste */

export async function updateRequestAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "in_attesa");
  const note = String(formData.get("admin_note") || "").trim();

  if (!["in_attesa", "approvata", "programmata", "rifiutata"].includes(status))
    return { error: "Stato non valido." };

  await dbRun(`UPDATE movie_requests SET status = @status, admin_note = @note WHERE id = @id`, {
    status,
    note: note || null,
    id,
  });

  refreshAll();
  return { ok: "Richiesta aggiornata." };
}

export async function deleteRequestAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  await dbRun(`DELETE FROM movie_requests WHERE id = @id`, { id: Number(formData.get("id")) });
  refreshAll();
}

/* ------------------------------------------------------------- recensioni */

export async function toggleReviewAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  await dbRun(`UPDATE reviews SET hidden = 1 - hidden WHERE id = @id`, {
    id: Number(formData.get("id")),
  });
  refreshAll();
}

/* ----------------------------------------------------------------- utenti */

export async function setUserRoleAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  const id = Number(formData.get("id"));
  const role = String(formData.get("role")) === "admin" ? "admin" : "user";

  if (role === "user") {
    const admins = await dbGet<{ n: number }>(
      `SELECT COUNT(*) AS n FROM users WHERE role = 'admin'`,
    );
    const target = await dbGet<{ role: string }>(`SELECT role FROM users WHERE id = @id`, { id });
    // Il cinema non può restare senza direzione.
    if (admins!.n <= 1 && target?.role === "admin") return;
  }

  await dbRun(`UPDATE users SET role = @role WHERE id = @id`, { role, id });
  refreshAll();
}

export async function deleteUserAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  const id = Number(formData.get("id"));
  const me = await getCurrentUser();
  if (me?.id === id) return;
  await dbRun(`DELETE FROM users WHERE id = @id`, { id });
  refreshAll();
}

export async function renameUserAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2 || name.length > 60) return;
  await dbRun(`UPDATE users SET name = @name WHERE id = @id`, { name, id });
  refreshAll();
}

export async function suspendUserAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  const id = Number(formData.get("id"));
  const giorni = Math.min(Math.max(Number(formData.get("giorni") || 1), 1), 365);
  const me = await getCurrentUser();
  if (me?.id === id) return;
  await dbRun(
    `UPDATE users SET suspended_until = datetime('now', '+' || @giorni || ' days') WHERE id = @id`,
    { giorni, id },
  );
  refreshAll();
}

export async function liftSuspensionAction(formData: FormData) {
  const guard = await assertAdmin();
  if (!guard.ok) return;
  await dbRun(`UPDATE users SET suspended_until = NULL WHERE id = @id`, {
    id: Number(formData.get("id")),
  });
  refreshAll();
}

export interface ResetPasswordState extends AdminState {
  password?: string;
}

/**
 * Le password sono cifrate con bcrypt (irreversibile): non possono essere
 * visualizzate. Per il testing l'admin può reimpostarne una nuova, mostrata
 * una sola volta subito dopo la generazione.
 */
export async function resetUserPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const id = Number(formData.get("id"));
  const nuova = crypto.randomBytes(6).toString("base64url");
  await dbRun(`UPDATE users SET password_hash = @hash WHERE id = @id`, {
    hash: hashPassword(nuova),
    id,
  });

  return { ok: "Nuova password generata.", password: nuova };
}

/* ------------------------------------------------------------------ TMDb */

export interface TmdbState extends AdminState {
  results?: TmdbSearchResult[];
  query?: string;
}

export async function tmdbSearchAction(
  _prev: TmdbState,
  formData: FormData,
): Promise<TmdbState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const query = String(formData.get("query") || "").trim();
  if (query.length < 2) return { error: "Scrivi almeno due caratteri." };

  try {
    const results = await tmdbSearch(query);
    return {
      results,
      query,
      ok: results.length ? undefined : "Nessun risultato su TMDb per questa ricerca.",
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore nella ricerca su TMDb." };
  }
}

export async function importTmdbAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const tmdbId = Number(formData.get("tmdb_id"));
  const status = String(formData.get("status") || "catalogo");
  if (!tmdbId) return { error: "Film TMDb non valido." };

  try {
    const m = await tmdbDetails(tmdbId);
    const esiste = await dbGet<{ id: number }>(`SELECT id FROM movies WHERE tmdb_id = @tmdbId`, {
      tmdbId,
    });

    if (esiste) {
      await dbRun(
        `UPDATE movies SET title=@title, original_title=@original_title, year=@year,
           genres=@genres, duration_min=@duration_min, director=@director,
           cast_list=@cast_list, synopsis=@synopsis, poster_url=@poster_url,
           backdrop_url=@backdrop_url, trailer_url=@trailer_url
         WHERE id=@id`,
        { ...m, id: esiste.id },
      );
      refreshAll();
      return { ok: `“${m.title}” era già in catalogo: dati e locandina aggiornati.` };
    }

    await dbRun(
      `INSERT INTO movies (tmdb_id, title, original_title, year, genres, duration_min,
         director, cast_list, synopsis, poster_url, backdrop_url, trailer_url, status)
       VALUES (@tmdb_id, @title, @original_title, @year, @genres, @duration_min,
         @director, @cast_list, @synopsis, @poster_url, @backdrop_url, @trailer_url,
         @status)`,
      { ...m, status },
    );

    refreshAll();
    return { ok: `“${m.title}” importato nel catalogo.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore nell'importazione." };
  }
}
