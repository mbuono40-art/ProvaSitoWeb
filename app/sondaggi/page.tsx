import Link from "next/link";
import { PollCard } from "@/components/PollCard";
import { getCurrentUser } from "@/lib/auth";
import { listPolls } from "@/lib/queries";

export default async function SondaggiPage() {
  const user = await getCurrentUser();
  const polls = await listPolls(user?.id);
  const aperti = polls.filter((p) => p.status === "aperto");
  const chiusi = polls.filter((p) => p.status !== "aperto");

  return (
    <div className="contenitore pagina">
      <p className="occhiello">La programmazione la scegliete voi</p>
      <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.7rem)", marginBottom: 8 }}>
        Vota il <span className="oro">prossimo film</span>
      </h1>
      <p className="tenue" style={{ marginBottom: 26, maxWidth: "62ch" }}>
        Un voto a testa per ogni sondaggio, modificabile fino alla chiusura. Il titolo
        vincitore entra in cartellone.
      </p>

      {aperti.length ? (
        <div className="tre-colonne">
          {aperti.map((p) => (
            <PollCard key={p.id} poll={p} isLogged={!!user} />
          ))}
        </div>
      ) : (
        <div className="vuoto">
          Nessun sondaggio aperto in questo momento.
          <br />
          Intanto puoi{" "}
          <Link href="/richieste" className="oro">
            proporre un film
          </Link>
          .
        </div>
      )}

      {chiusi.length > 0 && (
        <section className="sezione">
          <div className="sezione-testata">
            <h2>
              Votazioni <span>concluse</span>
            </h2>
          </div>
          <div className="tre-colonne">
            {chiusi.map((p) => (
              <PollCard key={p.id} poll={p} isLogged={!!user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
