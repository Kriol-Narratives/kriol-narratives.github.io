"use client";

import { ChevronLeft, ChevronRight, Maximize2, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function PhotoGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex w-full max-w-[480px] flex-col items-center">
      <div className="relative aspect-[433/504] w-full overflow-hidden bg-[#eee]">
        <Image src={images[activeIndex]} alt="" fill className="object-cover" />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            aria-label="Pantalla completa"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-white/90 text-black"
          >
            <Maximize2 size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Compartir"
            className="flex h-7 items-center gap-1.5 rounded bg-green px-3 text-white"
          >
            <Share2 size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex w-full items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Imagen anterior"
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
              aria-label={`Ver imagen ${index + 1}`}
              className={`relative h-[60px] w-[51px] shrink-0 cursor-pointer overflow-hidden border-2 transition-opacity ${
                activeIndex === index ? "border-green opacity-100" : "border-transparent opacity-50"
              }`}
            >
              <Image src={image} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Imagen siguiente"
          onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
          className="cursor-pointer text-green"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
