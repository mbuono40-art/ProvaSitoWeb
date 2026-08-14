"use server";

import { revalidatePath } from "next/cache";
import { dbGet, dbRun } from "@/lib/db";
import { getCurrentUser, isSuspended } from "@/lib/auth";
import { formatFullDate } from "@/lib/format";

export interface RequestState {
  error?: string;
  ok?: string;
}

export async function createRequestAction(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Accedi per inviare una richiesta." };
  if (isSuspended(user)) {
    return {
      error: `Il tuo account è sospeso dalla scrittura fino al ${formatFullDate(
        user.suspended_until!.replace(" ", "T"),
      )}.`,
    };
  }

  const title = String(formData.get("title") || "").trim();
  const yearRaw = String(formData.get("year") || "").trim();
  const note = String(formData.get("note") || "").trim();

  if (title.length < 2) return { error: "Scrivi il titolo del film." };
  if (title.length > 160) return { error: "Titolo troppo lungo." };
  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && (!Number.isInteger(year) || year < 1890 || year > 2100))
    return { error: "L'anno non sembra valido." };
  if (note.length > 800) return { error: "La nota è troppo lunga (max 800 caratteri)." };

  const doppione = await dbGet<{ id: number }>(
    `SELECT id FROM movie_requests
      WHERE LOWER(title) = LOWER(@title) AND status IN ('in_attesa','approvata')`,
    { title },
  );

  if (doppione) {
    // Richiesta già presente da un altro utente: si registra l'interesse invece
    // di creare un doppione. Il conteggio resta visibile solo alla direzione.
    await dbRun(
      `INSERT OR IGNORE INTO request_votes (request_id, user_id) VALUES (@requestId, @userId)`,
      { requestId: doppione.id, userId: user.id },
    );
    revalidatePath("/richieste");
    revalidatePath("/admin/richieste");
    return {
      ok: "Questo film era già stato proposto da qualcun altro: abbiamo segnalato anche il tuo interesse alla direzione.",
    };
  }

  const { lastInsertRowid } = await dbRun(
    `INSERT INTO movie_requests (user_id, title, year, note) VALUES (@userId, @title, @year, @note)`,
    { userId: user.id, title, year, note: note || null },
  );

  await dbRun(
    `INSERT OR IGNORE INTO request_votes (request_id, user_id) VALUES (@requestId, @userId)`,
    { requestId: lastInsertRowid, userId: user.id },
  );

  revalidatePath("/richieste");
  revalidatePath("/admin/richieste");
  return { ok: "Richiesta inviata: la direzione la valuterà a breve." };
}

/**
 * Interesse dichiarato dalla scheda di un film già in catalogo. Non crea una
 * richiesta scritta: alimenta solo il conteggio che la direzione consulta per
 * capire quali titoli del catalogo il pubblico rivedrebbe volentieri.
 * Premendo di nuovo si ritira l'interesse.
 */
export async function toggleInterestAction(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Accedi per segnalare il tuo interesse." };
  if (isSuspended(user)) {
    return {
      error: `Il tuo account è sospeso dalla scrittura fino al ${formatFullDate(
        user.suspended_until!.replace(" ", "T"),
      )}.`,
    };
  }

  const movieId = Number(formData.get("movie_id"));
  if (!Number.isInteger(movieId) || movieId <= 0) return { error: "Film non valido." };

  const film = await dbGet(`SELECT id FROM movies WHERE id = @id`, { id: movieId });
  if (!film) return { error: "Film non trovato." };

  const gia = await dbGet(
    `SELECT 1 FROM movie_interests WHERE movie_id = @movieId AND user_id = @userId`,
    { movieId, userId: user.id },
  );

  if (gia) {
    await dbRun(
      `DELETE FROM movie_interests WHERE movie_id = @movieId AND user_id = @userId`,
      { movieId, userId: user.id },
    );
    revalidatePath(`/film/${movieId}`);
    revalidatePath("/admin/interessi");
    return { ok: "Interesse ritirato." };
  }

  await dbRun(
    `INSERT OR IGNORE INTO movie_interests (movie_id, user_id) VALUES (@movieId, @userId)`,
    { movieId, userId: user.id },
  );
  revalidatePath(`/film/${movieId}`);
  revalidatePath("/admin/interessi");
  return { ok: "Interesse registrato." };
}

export async function deleteOwnRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const id = Number(formData.get("request_id"));
  await dbRun(`DELETE FROM movie_requests WHERE id = @id AND user_id = @userId`, {
    id,
    userId: user.id,
  });
  revalidatePath("/richieste");
  revalidatePath("/profilo");
}
