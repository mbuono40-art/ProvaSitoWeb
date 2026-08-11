import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="contenitore pagina">
      <div className="riga riga-tra" style={{ marginBottom: 18 }}>
        <div>
          <p className="occhiello">Pannello di direzione</p>
          <h1 style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)" }}>
            Cinema <span className="oro">Aureo</span>
          </h1>
        </div>
        <div className="riga">
          <span className="badge">{user.name}</span>
          <Link href="/" className="btn btn-piccolo btn-fantasma">
            Vedi il sito
          </Link>
        </div>
      </div>

      <div className="admin-layout">
        <AdminNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
