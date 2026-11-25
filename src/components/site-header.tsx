"use client";

import { Globe, LayoutGrid, List, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type ViewMode = "grid" | "list";

type SiteHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenMenu: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

const FOCUS_RING =
  "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral";

export function SiteHeader({
  viewMode,
  onViewModeChange,
  onOpenMenu,
  searchQuery,
  onSearchQueryChange,
}: SiteHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  function closeSearch() {
    setIsSearchOpen(false);
    onSearchQueryChange("");
  }

  return (
    <header className="border-b border-[#ABABAB] dark:border-white/20">
      <div className="flex h-14 items-center justify-between px-4 sm:px-7">
        <h1 className="font-display text-2xl sm:text-3xl dark:text-cream">kriol narratives</h1>
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className={`-m-2 shrink-0 cursor-pointer p-2 ${FOCUS_RING}`}
        >
          <Image src="/images/icons/wave.svg" alt="" width={20} height={20} />
        </button>
      </div>
      <div className="flex h-9 items-center justify-between px-4 sm:px-7">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Ver como cuadrícula"
            aria-pressed={viewMode === "grid"}
            className={`cursor-pointer ${FOCUS_RING} ${
              viewMode === "grid" ? "text-green" : "text-black/40 dark:text-cream/40"
            }`}
          >
            <LayoutGrid size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            aria-label="Ver como lista"
            aria-pressed={viewMode === "list"}
            className={`cursor-pointer ${FOCUS_RING} ${
              viewMode === "list" ? "text-green" : "text-black/40 dark:text-cream/40"
            }`}
          >
            <List size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            aria-label="Buscar"
            aria-expanded={isSearchOpen}
            className={`cursor-pointer text-black dark:text-cream ${FOCUS_RING}`}
          >
            <Search size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Cambiar idioma"
            className={`flex cursor-pointer items-center gap-1.5 text-green ${FOCUS_RING}`}
          >
            <Globe size={18} strokeWidth={2} />
            <span className="font-sans text-xs font-semibold uppercase">Español</span>
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="flex items-center gap-3 border-t border-[#ABABAB] px-4 py-3 dark:border-white/20 sm:px-7">
          <Search size={16} strokeWidth={2} className="shrink-0 text-black/50 dark:text-cream/50" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Buscar…"
            className="w-full bg-transparent font-sans text-sm text-black outline-none dark:text-cream"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Cerrar búsqueda"
            className={`shrink-0 cursor-pointer text-black/50 dark:text-cream/50 ${FOCUS_RING}`}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )}
    </header>
  );
}
