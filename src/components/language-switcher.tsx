"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { useLocale, useText } from "@/lib/i18n/client";

const FOCUS_RING =
  "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral";

export function LanguageSwitcher() {
  const TEXT = useText();
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  async function select(next: Locale) {
    setIsOpen(false);
    if (next === locale) return;
    await setLocale(next);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={TEXT.Common.changeLanguage}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex cursor-pointer items-center gap-1.5 text-green transition hover:opacity-70 ${FOCUS_RING}`}
      >
        <Globe size={18} strokeWidth={2} aria-hidden />
        <span className="font-sans text-xs font-semibold uppercase">{LOCALE_LABELS[locale]}</span>
        <ChevronDown size={12} strokeWidth={2.5} aria-hidden />
      </button>
      {isOpen && (
        <ul
          role="listbox"
          aria-label={TEXT.Common.changeLanguage}
          className="absolute right-0 top-full z-40 mt-2 min-w-32 overflow-hidden rounded border border-[#ABABAB] bg-white py-1 shadow-md dark:border-white/20 dark:bg-[#241d19]"
        >
          {LOCALES.map((option) => (
            <li key={option} role="option" aria-selected={option === locale}>
              <button
                type="button"
                lang={option === "kri" ? "icr" : option}
                onClick={() => select(option)}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-left font-sans text-xs font-semibold uppercase text-green hover:bg-green/10 ${FOCUS_RING}`}
              >
                {LOCALE_LABELS[option]}
                {option === locale && <Check size={12} strokeWidth={3} aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
