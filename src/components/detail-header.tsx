"use client";

import { Globe, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const FOCUS_RING =
  "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral";

type DetailHeaderProps = {
  onOpenMenu: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function DetailHeader({ onOpenMenu, searchValue, onSearchChange }: DetailHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const value = searchValue ?? localValue;
  const handleChange = onSearchChange ?? setLocalValue;

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  function closeSearch() {
    setIsSearchOpen(false);
    handleChange("");
  }

  return (
    <header className="border-b border-[#ABABAB] dark:border-white/20">
      <div className="flex h-14 items-center justify-between px-4 sm:px-7">
        <h1 className="font-display text-2xl sm:text-3xl dark:text-cream">kriol narratives</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            aria-label="Buscar"
            aria-expanded={isSearchOpen}
            className={`-m-2 cursor-pointer p-2 text-black dark:text-cream ${FOCUS_RING}`}
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
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menú"
            className={`-m-2 shrink-0 cursor-pointer p-2 ${FOCUS_RING}`}
          >
            <Image src="/images/icons/wave.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="flex items-center gap-3 border-t border-[#ABABAB] px-4 py-3 dark:border-white/20 sm:px-7">
          <Search size={16} strokeWidth={2} className="shrink-0 text-black/50 dark:text-cream/50" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => handleChange(event.target.value)}
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
