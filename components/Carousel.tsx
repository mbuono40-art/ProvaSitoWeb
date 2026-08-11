"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fila che scorre orizzontalmente: swipe su smartphone, trascinamento col
 * mouse e frecce su desktop. Le frecce compaiono solo se serve scorrere.
 */
export function Carousel({ children }: { children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.85, 220), behavior: "smooth" });
  };

  // Trascinamento col mouse (sui touch resta lo scorrimento nativo).
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = track.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
    };
    el.classList.add("trascina");
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = track.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.abs(dx);
    el.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = () => {
    const el = track.current;
    if (!el) return;
    drag.current.active = false;
    el.classList.remove("trascina");
  };

  // Dopo un trascinamento vero non deve aprirsi la scheda del film.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  };

  return (
    <div className="carosello">
      <button
        type="button"
        className="freccia freccia-sx"
        onClick={() => scrollBy(-1)}
        hidden={!canLeft}
        aria-label="Scorri indietro"
      >
        ‹
      </button>
      <div
        className="carosello-pista"
        ref={track}
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
      <button
        type="button"
        className="freccia freccia-dx"
        onClick={() => scrollBy(1)}
        hidden={!canRight}
        aria-label="Scorri avanti"
      >
        ›
      </button>
    </div>
  );
}
