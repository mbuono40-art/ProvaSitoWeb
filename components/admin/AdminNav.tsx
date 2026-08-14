"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const VOCI = [
  { href: "/admin", label: "Riepilogo" },
  { href: "/admin/film", label: "Film" },
  { href: "/admin/importa", label: "Importa da TMDb" },
  { href: "/admin/spettacoli", label: "Programmazione" },
  { href: "/admin/sondaggi", label: "Sondaggi" },
  { href: "/admin/richieste", label: "Richieste" },
  { href: "/admin/interessi", label: "Film richiesti" },
  { href: "/admin/recensioni", label: "Recensioni" },
  { href: "/admin/utenti", label: "Utenti" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav">
      {VOCI.map((v) => {
        const attivo =
          v.href === "/admin" ? pathname === "/admin" : pathname.startsWith(v.href);
        return (
          <Link key={v.href} href={v.href} className={attivo ? "attivo" : undefined}>
            {v.label}
          </Link>
        );
      })}
    </nav>
  );
}
