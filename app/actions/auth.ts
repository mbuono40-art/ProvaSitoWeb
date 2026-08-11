"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { dbGet, dbRun } from "@/lib/db";
import { bootstrap, clearSession, getCurrentUser, setSessionCookie } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export interface FormState {
  error?: string;
  ok?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  // Solo percorsi interni: evita redirect verso siti esterni.
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await bootstrap();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const next = safeNext(formData.get("next"));

  if (name.length < 2) return { error: "Inserisci il tuo nome (almeno 2 caratteri)." };
  if (!EMAIL_RE.test(email)) return { error: "L'indirizzo email non sembra valido." };
  if (password.length < 8)
    return { error: "La password deve avere almeno 8 caratteri." };
  if (password !== confirm) return { error: "Le due password non coincidono." };

  const existing = await dbGet(`SELECT id FROM users WHERE email = @email`, { email });
  if (existing) return { error: "Esiste già un account con questa email." };

  const { lastInsertRowid } = await dbRun(
    `INSERT INTO users (name, email, password_hash) VALUES (@name, @email, @hash)`,
    { name, email, hash: hashPassword(password) },
  );

  await setSessionCookie(lastInsertRowid);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await bootstrap();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const next = safeNext(formData.get("next"));

  const row = await dbGet<{ id: number; password_hash: string }>(
    `SELECT id, password_hash FROM users WHERE email = @email`,
    { email },
  );

  if (!row || !verifyPassword(password, row.password_hash)) {
    return { error: "Email o password non corretti." };
  }

  await setSessionCookie(row.id);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function logoutAction() {
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Devi accedere per modificare il profilo." };

  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) return { error: "Il nome deve avere almeno 2 caratteri." };

  const current = String(formData.get("current_password") || "");
  const nuova = String(formData.get("new_password") || "");

  await dbRun(`UPDATE users SET name = @name WHERE id = @id`, { name, id: user.id });

  if (nuova) {
    const row = await dbGet<{ password_hash: string }>(
      `SELECT password_hash FROM users WHERE id = @id`,
      { id: user.id },
    );
    if (!verifyPassword(current, row!.password_hash)) {
      return { error: "La password attuale non è corretta." };
    }
    if (nuova.length < 8)
      return { error: "La nuova password deve avere almeno 8 caratteri." };
    await dbRun(`UPDATE users SET password_hash = @hash WHERE id = @id`, {
      hash: hashPassword(nuova),
      id: user.id,
    });
  }

  revalidatePath("/profilo");
  revalidatePath("/", "layout");
  return { ok: nuova ? "Profilo e password aggiornati." : "Profilo aggiornato." };
}
