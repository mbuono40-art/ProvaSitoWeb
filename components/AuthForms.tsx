"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, updateProfileAction } from "@/app/actions/auth";
import { AvvisiAzione } from "./Avvisi";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, {});

  return (
    <form action={action} className="form">
      <input type="hidden" name="next" value={next} />
      <div className="campo">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="campo">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <AvvisiAzione stato={state} />

      <SubmitButton className="btn btn-oro btn-blocco" pendingLabel="Accesso…">
        Entra
      </SubmitButton>

      <p className="piccolo tenue centro">
        Non hai un account?{" "}
        <Link href="/registrati" className="oro">
          Registrati
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(registerAction, {});

  return (
    <form action={action} className="form">
      <input type="hidden" name="next" value={next} />
      <div className="campo">
        <label htmlFor="name">Nome</label>
        <input id="name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="campo">
        <label htmlFor="email-r">Email</label>
        <input id="email-r" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="campo">
        <label htmlFor="password-r">Password (almeno 8 caratteri)</label>
        <input
          id="password-r"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="campo">
        <label htmlFor="confirm">Ripeti la password</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <AvvisiAzione stato={state} />

      <SubmitButton className="btn btn-oro btn-blocco" pendingLabel="Creo l'account…">
        Crea il mio account
      </SubmitButton>

      <p className="piccolo tenue centro">
        Hai già un account?{" "}
        <Link href="/accedi" className="oro">
          Accedi
        </Link>
      </p>
    </form>
  );
}

export function ProfileForm({ name }: { name: string }) {
  const [state, action] = useActionState(updateProfileAction, {});

  return (
    <form action={action} className="form">
      <div className="campo">
        <label htmlFor="name-p">Nome visualizzato</label>
        <input id="name-p" name="name" type="text" defaultValue={name} required />
      </div>
      <hr className="filetto" style={{ margin: "6px 0" }} />
      <div className="campo">
        <label htmlFor="current_password">Password attuale</label>
        <input
          id="current_password"
          name="current_password"
          type="password"
          autoComplete="current-password"
        />
      </div>
      <div className="campo">
        <label htmlFor="new_password">Nuova password (lascia vuoto per non cambiarla)</label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          autoComplete="new-password"
        />
      </div>

      <AvvisiAzione stato={state} />

      <SubmitButton pendingLabel="Salvo…">Salva modifiche</SubmitButton>
    </form>
  );
}
