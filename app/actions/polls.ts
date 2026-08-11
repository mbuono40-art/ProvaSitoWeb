"use server";

import { revalidatePath } from "next/cache";
import { dbGet, dbRun } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export interface VoteState {
  error?: string;
  ok?: string;
}

export async function votePollAction(
  _prev: VoteState,
  formData: FormData,
): Promise<VoteState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Accedi per votare: ogni utente ha un voto." };

  const pollId = Number(formData.get("poll_id"));
  const optionId = Number(formData.get("option_id"));

  const poll = await dbGet<{ status: string; ends_at: string | null }>(
    `SELECT * FROM polls WHERE id = @id`,
    { id: pollId },
  );
  if (!poll) return { error: "Sondaggio non trovato." };
  if (poll.status !== "aperto") return { error: "Questo sondaggio è chiuso." };

  const option = await dbGet(
    `SELECT id FROM poll_options WHERE id = @optionId AND poll_id = @pollId`,
    { optionId, pollId },
  );
  if (!option) return { error: "Opzione non valida." };

  await dbRun(
    `INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (@pollId, @optionId, @userId)
     ON CONFLICT (poll_id, user_id) DO UPDATE SET
       option_id = excluded.option_id, created_at = datetime('now')`,
    { pollId, optionId, userId: user.id },
  );

  revalidatePath("/sondaggi");
  revalidatePath("/");
  return { ok: "Voto registrato." };
}
