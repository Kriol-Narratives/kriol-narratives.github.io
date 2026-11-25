"use client";

import Image from "next/image";
import { isWikimediaUrl } from "@/lib/cms/media-type";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import type { Category } from "@/lib/cms";

const FOCUS_RING =
  "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral";

const GAP = 10;
const DRAG_THRESHOLD = 5;
const FRICTION = 0.92;

/** Una tarjeta de la tira o de la cuadrícula: categorías y artículos comparten el mismo formato. */
export type CardEntry = {
  key: string;
  href: string;
  title: string;
  description: string;
  /** Imagen cuadrada que llena su ancho. */
  visual: React.ReactNode;
};

export function CardVisual({ category }: { category: Category }) {
  const imageUrl = category.coverUrl ?? category.logoUrl;
  if (imageUrl) {
    return (
      <div className="relative aspect-square w-full overflow-hidden">
        <Image src={imageUrl} alt="" unoptimized={isWikimediaUrl(imageUrl)} fill draggable={false} className="pointer-events-none object-cover" />
      </div>
    );
  }
  return (
    <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-cream">
      <CategoryIcon className="h-1/3 w-1/3 text-teal" />
    </div>
  );
}

/**
 * Carrusel horizontal que se arrastra con el mouse o el dedo.
 * Es infinito: la lista se repite y al pasar de una copia a otra el desplazamiento se reajusta.
 * Si las tarjetas caben en el ancho (pocos resultados de búsqueda) se quedan quietas, sin repetirse.
 */
export function CardCarousel({ entries }: { entries: CardEntry[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  // Copias de la lista en el track: las necesarias para que el viewport nunca quede vacío al reajustar.
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let x = 0;
    let velocity = 0;
    let previousX = 0;
    let startX = 0;
    let pointerId: number | null = null;
    let moved = false;
    let frame = 0;
    let setWidth = 0;
    let positioned = false;
    let looping = true;

    const measure = () => {
      // Ancho de una copia (con el gap que la separa de la siguiente).
      const items = track.children;
      const first = items[0] as HTMLElement | undefined;
      const last = items[entries.length - 1] as HTMLElement | undefined;
      if (!first || !last) return;
      setWidth = last.offsetLeft + last.offsetWidth + GAP - first.offsetLeft;
      looping = setWidth >= wrapper.clientWidth;
      const needed = looping ? Math.max(3, Math.ceil(wrapper.clientWidth / setWidth) + 2) : 1;
      if (needed !== copies) setCopies(needed);
      if (!looping) {
        x = 0;
        positioned = false;
      } else if (!positioned) {
        // Se empieza en la segunda copia para poder arrastrar hacia ambos lados.
        x = -setWidth;
        positioned = true;
      }
    };

    // x vive en (-2·setWidth, -setWidth]: al salir se salta una copia, que se ve idéntica.
    const render = () => {
      if (looping && setWidth > 0) {
        while (x > -setWidth) x -= setWidth;
        while (x <= -2 * setWidth) x += setWidth;
      }
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const inertia = () => {
      if (pointerId !== null) return;
      velocity *= FRICTION;
      x += velocity;
      render();
      if (Math.abs(velocity) > 0.1) frame = requestAnimationFrame(inertia);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!looping || (e.pointerType === "mouse" && e.button !== 0)) return;
      cancelAnimationFrame(frame);
      pointerId = e.pointerId;
      previousX = startX = e.clientX;
      velocity = 0;
      moved = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (!moved && Math.abs(e.clientX - startX) > DRAG_THRESHOLD) {
        moved = true;
        wrapper.setPointerCapture(e.pointerId);
        wrapper.classList.add("cursor-grabbing");
      }
      if (!moved) return;
      const delta = e.clientX - previousX;
      previousX = e.clientX;
      velocity = delta;
      x += delta;
      render();
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      wrapper.classList.remove("cursor-grabbing");
      if (moved) frame = requestAnimationFrame(inertia);
    };

    // Trackpad o rueda horizontal (o Shift + rueda): mueve la tira; la rueda vertical sigue desplazando la página.
    const onWheel = (e: WheelEvent) => {
      if (!looping) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!horizontal) return;
      e.preventDefault();
      cancelAnimationFrame(frame);
      x -= horizontal;
      velocity = 0;
      render();
    };

    // Si hubo arrastre, no se debe navegar al soltar sobre un link.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    measure();
    render();

    const resizeObserver = new ResizeObserver(() => {
      measure();
      render();
    });
    resizeObserver.observe(track);
    resizeObserver.observe(wrapper);

    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerup", onPointerEnd);
    wrapper.addEventListener("pointercancel", onPointerEnd);
    wrapper.addEventListener("click", onClickCapture, true);
    wrapper.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerup", onPointerEnd);
      wrapper.removeEventListener("pointercancel", onPointerEnd);
      wrapper.removeEventListener("click", onClickCapture, true);
    };
  }, [entries.length, copies]);

  return (
    <div
      ref={wrapperRef}
      className="flex cursor-grab select-none items-center overflow-hidden py-16 [touch-action:pan-y]"
    >
      <ul ref={trackRef} className="flex w-max gap-[10px] px-4 will-change-transform sm:px-10">
        {Array.from({ length: copies }, (_, copy) => entries.map((entry) => ({ entry, copy }))).flat().map(({ entry, copy }) => (
          <li
            key={`${copy}-${entry.key}`}
            aria-hidden={copy > 0 ? true : undefined}
            className="group @container shrink-0 opacity-80 transition-opacity duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
              w-[65vw] md:w-[12vw]
              [@media(hover:hover)_and_(pointer:fine)]:hover:z-10 [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-100"
          >
            <Link
              href={entry.href}
              draggable={false}
              tabIndex={copy > 0 ? -1 : undefined}
              className={`flex flex-col gap-2.5 ${FOCUS_RING}`}
            >
              {/* Solo la imagen crece; el texto baja lo que crece la imagen (15% del ancho por lado) para no pisar a las cards vecinas. */}
              <div className="transition-[scale] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.3]">
                {entry.visual}
              </div>
              <div className="flex flex-col gap-2.5 transition-[translate] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-[15cqw]">
                <h2 className="font-display text-teal text-sm leading-tight dark:text-coral">{entry.title}</h2>
                <p className="font-sans text-[10px] font-light leading-tight text-black dark:text-cream">
                  {entry.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
