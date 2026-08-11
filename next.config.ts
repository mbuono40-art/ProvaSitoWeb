import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libsql usa un binario nativo per il file locale: non va impacchettato dal bundler.
  serverExternalPackages: ["@libsql/client", "libsql"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
