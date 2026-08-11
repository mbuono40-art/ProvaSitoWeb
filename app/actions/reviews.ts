"use server";

import { revalidatePath } from "next/cache";
import { dbGet, dbRun } from "@/lib/db";
import { getCurrentUser, isSuspended } from "@/lib/auth";
import { formatFullDate } from "@/lib/format";

export interface ReviewState {
  error?: string;
  ok?: string;
}

export async function saveReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Devi accedere per lasciare un voto." };
  if (isSuspended(user)) {
    return {
      error: `Il tuo account è sospeso dalla scrittura fino al ${formatFullDate(
        user.suspended_until!.replace(" ", "T"),
      )}.`,
    };
  }

  const movieId = Number(formData.get("movie_id"));
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") || "").trim();

  if (!Number.isInteger(movieId) || movieId <= 0)
    return { error: "Film non valido." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 10)
    return { error: "Scegli un voto da 1 a 10." };
  if (body.length > 4000)
    return { error: "La recensione è troppo lunga (massimo 4000 caratteri)." };

  const movie = await dbGet(`SELECT id FROM movies WHERE id = @id`, { id: movieId });
  if (!movie) return { error: "Film non trovato." };

  await dbRun(
    `INSERT INTO reviews (movie_id, user_id, rating, body)
     VALUES (@movie_id, @user_id, @rating, @body)
     ON CONFLICT (movie_id, user_id) DO UPDATE SET
       rating = @rating, body = @body,
       hidden = 0, updated_at = datetime('now')`,
    {
      movie_id: movieId,
      user_id: user.id,
      rating,
      body,
    },
  );

  revalidatePath(`/film/${movieId}`);
  revalidatePath("/");
  return { ok: "Recensione salvata. Grazie!" };
}

export async function deleteReviewAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const movieId = Number(formData.get("movie_id"));

  if (user.role === "admin" && formData.get("review_id")) {
    await dbRun(`DELETE FROM reviews WHERE id = @id`, {
      id: Number(formData.get("review_id")),
    });
  } else {
    await dbRun(`DELETE FROM reviews WHERE movie_id = @movieId AND user_id = @userId`, {
      movieId,
      userId: user.id,
    });
  }

  revalidatePath(`/film/${movieId}`);
  revalidatePath("/profilo");
  revalidatePath("/admin/recensioni");
}
