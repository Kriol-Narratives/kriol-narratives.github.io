"use client";

import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import { isWikimediaUrl } from "@/lib/cms/media-type";
import { useEffect, useRef, useState } from "react";
import { useText } from "@/lib/i18n/client";
import { ShareButton } from "@/components/viewers/share-button";

export function PhotoGallery({
  images,
  onActiveChange,
}: {
  images: string[];
  /** Called with the index of the image on screen, so the metadata can follow it. */
  onActiveChange?: (index: number) => void;
}) {
  const TEXT = useText();
  const t = TEXT.Viewers;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onActiveChange?.(activeIndex);
  }, [activeIndex, onActiveChange]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen();
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-[433/504] w-full max-w-[480px] items-center justify-center bg-[#eee] font-sans text-xs text-black/50">
        {t.noImage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "dark flex h-screen w-screen flex-col items-center bg-black p-6"
          : "mx-auto flex w-full max-w-[480px] flex-col items-center"
      }
    >
      {/* El marco se ajusta a la imagen (sin fondo ni recorte) y queda centrado. */}
      <div className={isFullscreen ? "flex min-h-0 w-full flex-1 items-center justify-center" : "flex w-full justify-center"}>
        <div className="relative inline-block max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex]}
            alt=""
            className={`block h-auto w-auto max-w-full object-contain ${
              isFullscreen ? "max-h-[calc(100vh-140px)]" : "max-h-[70vh]"
            }`}
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? t.exitFullscreen : t.fullscreen}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-white/90 text-black"
            >
              {isFullscreen ? <Minimize2 size={14} strokeWidth={2} /> : <Maximize2 size={14} strokeWidth={2} />}
            </button>
            <ShareButton className="flex h-7 cursor-pointer items-center gap-1.5 rounded bg-green px-3 text-white" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex w-full items-center justify-center gap-2">
        <button
          type="button"
          aria-label={t.previousImage}
          onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
          className="cursor-pointer text-green"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <div className="flex gap-1.5">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={t.viewImage({ number: index + 1 })}
              className={`relative h-[60px] w-[51px] shrink-0 cursor-pointer overflow-hidden border-2 transition-opacity ${
                activeIndex === index ? "border-green opacity-100" : "border-transparent opacity-50"
              }`}
            >
              <Image src={image} alt="" unoptimized={isWikimediaUrl(image)} fill className="object-cover" />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={t.nextImage}
          onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
          className="cursor-pointer text-green"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
