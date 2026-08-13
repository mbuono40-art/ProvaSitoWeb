"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Poster } from "./Poster";
import { Stars } from "./Stars";
import { formatDuration, formatFullDate, formatTime } from "@/lib/format";
import type { MovieWithStats } from "@/lib/types";

const DURATA = 8000;

export function HeroCarousel({
  movies,
  etichetta,
}: {
  movies: MovieWithStats[];
  /** Sovrascrive l'occhiello: usato quando i film arrivano dal sondaggio. */
  etichetta?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (movies.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % movies.length), DURATA);
    return () => clearInterval(t);
  }, [movies.length]);

  if (!movies.length) return null;
  const m = movies[Math.min(i, movies.length - 1)];

  return (
    <section className="hero" aria-roledescription="carosello" aria-label="Film in evidenza">
      {m.backdrop_url && (
        <div
          className="hero-sfondo"
          style={{ backgroundImage: `url(${m.backdrop_url})` }}
          aria-hidden="true"
        />
      )}
      <div className="hero-velo" aria-hidden="true" />

      <div className="hero-corpo">
        <p className="occhiello">
          {etichetta ??
            (m.status === "prossimamente" ? "Prossimamente in sala" : "In programmazione")}
        </p>
        <h1>{m.title}</h1>
        <div className="hero-meta">
          <Stars value={m.avg_rating} />
          <span className="piccolo tenue">
            {m.avg_rating
              ? `${m.avg_rating.toFixed(1).replace(".", ",")}/10 · ${m.reviews_count} recensioni`
              : "Ancora nessuna recensione"}
          </span>
          <span className="badge">{m.year}</span>
          <span className="badge badge-neutro">{formatDuration(m.duration_min)}</span>
          {m.age_rating && <span className="badge badge-rosso">{m.age_rating}</span>}
        </div>
        <p className="hero-testo">{m.synopsis}</p>
        {m.next_showtime && (
          <p className="piccolo oro">
            Prossima proiezione: {formatFullDate(m.next_showtime)} alle{" "}
            {formatTime(m.next_showtime)}
          </p>
        )}
        <div className="hero-azioni">
          <Link href={`/film/${m.id}`} className="btn btn-oro">
            Scheda del film
          </Link>
          <Link href="/programmazione" className="btn">
            Tutti gli orari
          </Link>
        </div>
      </div>

      <Link
        href={`/film/${m.id}`}
        className="hero-locandina"
        aria-label={`Scheda di ${m.title}`}
      >
        <Poster movie={m} sizes="230px" />
      </Link>

      {movies.length > 1 && (
        <div className="hero-punti">
          {movies.map((mv, idx) => (
            <button
              key={mv.id}
              type="button"
              className={`hero-punto${idx === i ? " attivo" : ""}`}
              onClick={() => setI(idx)}
              aria-label={`Vai a ${mv.title}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
