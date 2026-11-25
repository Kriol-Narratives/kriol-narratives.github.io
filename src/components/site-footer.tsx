"use client";

import { Moon, Sun } from "lucide-react";

type SiteFooterProps = {
  isDark: boolean;
  onToggleDark: () => void;
};

export function SiteFooter({ isDark, onToggleDark }: SiteFooterProps) {
  return (
    <footer className="mt-auto flex h-12 items-center justify-between border-t border-[#ABABAB] px-4 dark:border-white/20 sm:px-7">
      <span className="font-sans text-[11px] text-black dark:text-cream">
        Copyright © 2020-2026
      </span>
      <button
        type="button"
        onClick={onToggleDark}
        aria-label="Cambiar tema"
        className="-m-2 cursor-pointer rounded p-2 text-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral"
      >
        {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
      </button>
    </footer>
  );
}
