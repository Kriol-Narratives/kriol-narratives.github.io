"use client";

import { ArrowLeft, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useText } from "@/lib/i18n/client";

const FOCUS_RING =
  "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral";

type DetailHeaderProps = {
  /** Link de volver, siempre visible en la barra (a la izquierda del buscador y el idioma). */
  back?: { href: string; label: string; ariaLabel: string };
  onOpenMenu: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Títulos para el autocompletado del buscador; sin ellos no se muestra la lupa. */
  suggestions?: { title: string; href: string }[];
};

export function DetailHeader({ back, onOpenMenu, searchValue, onSearchChange, suggestions }: DetailHeaderProps) {
  const router = useRouter();
  const TEXT = useText();
  const t = TEXT.Common;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const hasSearch = Boolean(suggestions || onSearchChange);
  const value = searchValue ?? localValue;
  const handleChange = onSearchChange ?? setLocalValue;

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  const normalize = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const query = normalize(value.trim());
  const matches =
    suggestions && query
      ? suggestions.filter((item) => normalize(item.title).includes(query)).slice(0, 8)
      : [];

  function closeSearch() {
    setIsSearchOpen(false);
    handleChange("");
  }

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#241d19]">
      <div className="flex h-14 items-center justify-between border-b border-[#ABABAB] px-4 dark:border-white/20 sm:px-7">
        <h1 className="font-display text-2xl sm:text-3xl dark:text-cream">
          <Link href="/" className={FOCUS_RING}>
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
      <div className="flex h-9 items-center justify-between gap-4 px-4 sm:px-7">
        {back ? (
          <Link
            href={back.href}
            aria-label={back.ariaLabel}
            className={`flex min-w-0 items-center gap-2 font-sans text-xs font-bold uppercase tracking-wide text-green ${FOCUS_RING}`}
          >
            <ArrowLeft size={18} strokeWidth={2.5} className="shrink-0" />
            <span className="truncate">{back.label}</span>
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          {hasSearch && (
          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            aria-label={t.search}
            aria-expanded={isSearchOpen}
            className={`cursor-pointer text-green ${FOCUS_RING}`}
          >
            <Search size={18} strokeWidth={2} />
          </button>
          )}
          <LanguageSwitcher />
        </div>
      </div>

      {hasSearch && isSearchOpen && (
        <div className="flex items-center gap-3 border-t border-[#ABABAB] px-4 py-3 dark:border-white/20 sm:px-7">
          <Search size={16} strokeWidth={2} className="shrink-0 text-black/50 dark:text-cream/50" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => handleChange(event.target.value)}
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
      {hasSearch && isSearchOpen && matches.length > 0 && (
        <ul className="max-h-72 overflow-y-auto border-t border-[#ABABAB] bg-white px-4 py-2 shadow-lg dark:border-white/20 dark:bg-[#241d19] sm:px-7">
          {matches.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => {
                  closeSearch();
                  router.push(item.href);
                }}
                className={`w-full cursor-pointer py-2 text-left font-sans text-sm text-black hover:text-green dark:text-cream ${FOCUS_RING}`}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
