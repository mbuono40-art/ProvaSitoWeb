"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import type { User } from "@/lib/types";

const VOCI = [
  { href: "/", label: "Home" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/programmazione", label: "Programmazione" },
  { href: "/sondaggi", label: "Sondaggi" },
  { href: "/richieste", label: "Richiedi un film" },
  { href: "/archivio", label: "Archivio" },
];

export function Header({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const attivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo" aria-label="Cinema Aureo, home">
            <span className="logo-marchio">✦</span>
            <span className="logo-testo">
              <strong>CINEMA AUREO</strong>
              <small>sala storica</small>
            </span>
          </Link>

          <nav className="nav">
            {VOCI.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className={attivo(v.href) ? "attivo" : undefined}
              >
                {v.label}
              </Link>
            ))}
          </nav>

          <div className="header-azioni">
            {user ? (
              <>
                {/* La direzione entra nel pannello, gli spettatori nel profilo. */}
                <Link
                  href={user.role === "admin" ? "/admin" : "/profilo"}
                  className="btn btn-piccolo btn-fantasma"
                >
                  {user.name.split(" ")[0]}
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="btn btn-piccolo btn-fantasma">
                    Esci
                  </button>
                </form>
              </>
            ) : (
              <Link href="/accedi" className="btn btn-piccolo btn-oro">
                Accedi
              </Link>
            )}
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Apri il menu"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="drawer">
          {VOCI.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className={attivo(v.href) ? "attivo" : undefined}
            >
              {v.label}
            </Link>
          ))}
          {user ? (
            user.role === "admin" ? (
              <Link href="/admin">Pannello di direzione</Link>
            ) : (
              <Link href="/profilo">Il mio profilo</Link>
            )
          ) : (
            <Link href="/registrati">Crea un account</Link>
          )}
        </div>
      )}
    </>
  );
}
