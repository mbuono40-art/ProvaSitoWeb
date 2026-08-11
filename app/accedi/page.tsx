import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export default async function AccediPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/profilo");

  const sp = await searchParams;
  const raw = typeof sp.next === "string" ? sp.next : "/";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  return (
    <div className="contenitore pagina">
      <div className="pannello pannello-stretto">
        <p className="occhiello centro">Cinema Aureo</p>
        <h1 style={{ fontSize: "1.7rem", textAlign: "center", marginBottom: 6 }}>
          Accedi
        </h1>
        <p className="tenue piccolo centro" style={{ marginBottom: 20 }}>
          Con un account puoi votare i film, scrivere recensioni, richiedere titoli e
          partecipare ai sondaggi.
        </p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
