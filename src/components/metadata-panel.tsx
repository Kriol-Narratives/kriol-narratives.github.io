"use client";

import { useState } from "react";
import type { Story } from "@/data/story";

function MetaBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <h3 className="mb-1.5 font-sans text-[11px] font-bold uppercase tracking-wide text-brown-dark">
        {label}
      </h3>
      <div className="font-sans text-[13px] leading-relaxed text-black dark:text-cream">
        {children}
      </div>
    </div>
  );
}

const mediaTypeLabel: Record<Story["mediaType"], string> = {
  documento: "Documento",
  audio: "Audio",
  video: "Video",
  imagen: "Imagen",
  multiformato: "Multiformato",
};

export function MetadataPanel({ story }: { story: Story }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <aside>
      <h2 className="mb-4 border-b border-[#e0e0e0] pb-3 font-display text-2xl dark:border-white/20 dark:text-cream">
        Metadata
      </h2>

      <MetaBlock label="Descripción:">
        <p className={`text-black/80 dark:text-cream/80 ${isDescriptionExpanded ? "" : "line-clamp-4"}`}>
          {story.description}
        </p>
        <button
          type="button"
          onClick={() => setIsDescriptionExpanded((value) => !value)}
          className="mt-1 cursor-pointer font-sans text-xs font-semibold text-green underline"
        >
          {isDescriptionExpanded ? "Leer menos" : "Leer más"}
        </button>
      </MetaBlock>

      <div className="my-4 h-px bg-[#e0e0e0] dark:bg-white/20" />

      <MetaBlock label="Licencia:">
        <div className="flex gap-1.5">
          {story.license.map((code) => (
            <span
              key={code}
              className="flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-black text-[10px] font-bold dark:border-cream"
            >
              {code}
            </span>
          ))}
        </div>
      </MetaBlock>

      <MetaBlock label="Tipo de medio:">{mediaTypeLabel[story.mediaType]}</MetaBlock>
      <MetaBlock label="Lugar:">{story.place}</MetaBlock>
      <MetaBlock label="Palabras clave:">{story.keywords}</MetaBlock>
      <MetaBlock label="Fecha de creación:">{story.createdAt}</MetaBlock>
      <MetaBlock label="Link al repositorio:">
        <a
          href={story.repositoryLink}
          target="_blank"
          rel="noreferrer"
          className="break-all text-blue underline"
        >
          {story.repositoryLink}
        </a>
      </MetaBlock>
      <MetaBlock label="Cómo citar este material:">{story.citation}</MetaBlock>
    </aside>
  );
}
