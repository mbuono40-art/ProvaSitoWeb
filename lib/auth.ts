import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { dbGet, dbRun } from "./db";
import { ensureAdmin, seedIfEmpty } from "./seed";
import type { Role, User } from "./types";

const COOKIE = "cinema_session";
const SESSION_DAYS = 30;

let bootstrapPromise: Promise<void> | undefined;

/** Prima chiamata al DB in ogni richiesta: crea schema, seed e utente admin. */
export function bootstrap(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await seedIfEmpty();
      await ensureAdmin();
    })();
  }
  return bootstrapPromise;
}

export async function createSession(userId: number): Promise<{ token: string; expires: Date }> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await dbRun(`INSERT INTO sessions (token, user_id, expires_at) VALUES (@token, @userId, @expires)`, {
    token,
    userId,
    expires: expires.toISOString(),
  });
  await dbRun(`DELETE FROM sessions WHERE expires_at < datetime('now')`);
  return { token, expires };
}

export async function setSessionCookie(userId: number) {
  const { token, expires } = await createSession(userId);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await dbRun(`DELETE FROM sessions WHERE token = @token`, { token });
  }
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  await bootstrap();
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = await dbGet<User>(
    `SELECT u.id, u.name, u.email, u.role, u.suspended_until, u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token = @token AND s.expires_at > datetime('now')`,
    { token },
  );
  return row ?? null;
}

/** true se l'utente ha una sospensione dalla scrittura ancora attiva. */
export function isSuspended(user: Pick<User, "suspended_until">): boolean {
  return !!user.suspended_until && user.suspended_until > todayNow();
}

function todayNow(): string {
  // Stesso formato di datetime('now') di SQLite: "YYYY-MM-DD HH:MM:SS".
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export async function requireUser(returnTo = "/"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/accedi?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/accedi?next=%2Fadmin");
  if (user.role !== ("admin" satisfies Role)) redirect("/");
  return user;
}
