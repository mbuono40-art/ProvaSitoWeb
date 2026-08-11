import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export default async function RegistratiPage({
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
        <p className="occhiello centro">Entra nella sala</p>
        <h1 style={{ fontSize: "1.7rem", textAlign: "center", marginBottom: 6 }}>
          Crea un account
        </h1>
        <p className="tenue piccolo centro" style={{ marginBottom: 20 }}>
          Bastano nome, email e una password. Nessun dato viene condiviso con
          terzi: resta tutto nel database del cinema.
        </p>
        <RegisterForm next={next} />
      </div>
    </div>
  );
}
