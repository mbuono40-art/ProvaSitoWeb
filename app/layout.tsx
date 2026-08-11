import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Cinema Aureo — catalogo, programmazione e recensioni",
  description:
    "Il catalogo del Cinema Aureo: film in sala, prossime uscite, recensioni del pubblico, sondaggi e archivio delle proiezioni passate.",
};

export const viewport: Viewport = {
  themeColor: "#07060a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="it">
      <body>
        <div className="sfondo" aria-hidden="true" />
        <Header user={user} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
