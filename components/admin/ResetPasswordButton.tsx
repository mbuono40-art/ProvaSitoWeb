"use client";

import { useActionState } from "react";
import { resetUserPasswordAction, type ResetPasswordState } from "@/app/actions/admin";

/**
 * Le password sono cifrate con bcrypt: nessuno, admin compreso, può leggerle.
 * Per il testing questo pulsante genera una password nuova e la mostra una
 * sola volta, subito dopo averla creata.
 */
export function ResetPasswordButton({ userId }: { userId: number }) {
  const [state, action] = useActionState<ResetPasswordState, FormData>(
    resetUserPasswordAction,
    {},
  );

  return (
    <form action={action}>
      <input type="hidden" name="id" value={userId} />
      <button type="submit" className="btn btn-piccolo btn-fantasma">
        Reimposta password
      </button>
      {state.password && (
        <p className="piccolo oro" style={{ marginTop: 6 }}>
          Nuova password: <code>{state.password}</code>
          <br />
          <span className="tenue">Comunicala subito: non sarà più visibile dopo.</span>
        </p>
      )}
    </form>
  );
}
