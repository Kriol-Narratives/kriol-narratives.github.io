"use client";

import { ArrowLeft, LayoutGrid, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useEffect, useRef, useState } from "react";
import { useText } from "@/lib/i18n/client";

export type ViewMode = "carousel" | "grid" | "list";

/** Tres cuadrados iguales (de verdad cuadrados) y separados: la tira infinita. */
function ThreeSquaresIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <rect x="1" y="8" width="6" height="6" rx="0.8" />
      <rect x="9" y="8" width="6" height="6" rx="0.8" />
      <rect x="17" y="8" width="6" height="6" rx="0.8" />
    </svg>
  );
}

type SiteHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** The views to offer (none hides the buttons): "grid" shows the 4-square icon, "carousel" and "list" the 3-square one. */
  modes?: ViewMode[];
  /** Link de volver, siempre visible a la izquierda de la barra del buscador y el idioma. */
  back?: { href: string; label: string };
  onOpenMenu: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

const FOCUS_RING =
  "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral";

export function SiteHeader({
  viewMode,
  onViewModeChange,
  modes = ["grid", "list"],
  back,
  onOpenMenu,
  searchQuery,
  onSearchQueryChange,
}: SiteHeaderProps) {
  const TEXT = useText();
  const t = TEXT.Common;
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
    <header className="sticky top-0 z-30 bg-white dark:bg-[#241d19]">
      <div className="flex h-14 items-center justify-between border-b border-[#ABABAB] px-4 dark:border-white/20 sm:px-7">
        <h1 className="font-display text-2xl sm:text-3xl dark:text-cream">
          <Link href="/" onClick={closeSearch} className={FOCUS_RING}>
            kriol narratives
          </Link>
        </h1>
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t.openMenu}
          className={`-m-2 shrink-0 cursor-pointer p-2 ${FOCUS_RING}`}
        >
          <Image src="/images/icons/wave.svg" alt="" width={20} height={20} />
        </button>
      </div>
      <div className="flex h-9 items-center justify-between px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-4">
          {back && (
            <Link
              href={back.href}
              className={`flex min-w-0 items-center gap-2 font-sans text-xs font-bold uppercase tracking-wide text-green ${FOCUS_RING}`}
            >
              <ArrowLeft size={18} strokeWidth={2.5} className="shrink-0" />
              <span className="truncate">{back.label}</span>
            </Link>
          )}
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              aria-label={mode === "list" ? t.viewList : mode === "grid" ? t.viewGrid : t.viewCarousel}
              aria-pressed={viewMode === mode}
              className={`cursor-pointer ${FOCUS_RING} ${
                viewMode === mode ? "text-green" : "text-black/40 dark:text-cream/40"
              }`}
            >
              {mode === "grid" ? <LayoutGrid size={20} strokeWidth={2} /> : <ThreeSquaresIcon />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            aria-label={t.search}
            aria-expanded={isSearchOpen}
            className={`cursor-pointer text-green ${FOCUS_RING}`}
          >
            <Search size={18} strokeWidth={2} />
          </button>
          <LanguageSwitcher />
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
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent font-sans text-sm text-black outline-none dark:text-cream"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label={t.closeSearch}
            className={`shrink-0 cursor-pointer text-black/50 dark:text-cream/50 ${FOCUS_RING}`}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )}
    </header>
  );
}
