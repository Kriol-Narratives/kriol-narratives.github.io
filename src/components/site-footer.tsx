"use client";

import { BsFillMoonStarsFill } from "react-icons/bs";
import { Sun } from "lucide-react";
import { useText } from "@/lib/i18n/client";

type SiteFooterProps = {
  isDark: boolean;
  onToggleDark: () => void;
};

export function SiteFooter({ isDark, onToggleDark }: SiteFooterProps) {
  const TEXT = useText();
  const t = TEXT.Common;
  return (
    <footer className="mt-auto flex h-12 items-center justify-between border-t border-[#ABABAB] bg-white px-4 dark:border-white/20 dark:bg-[#241d19] sm:px-7">
      <span className="font-sans text-[11px] text-black dark:text-cream">
        {t.copyright} {new Date().getFullYear()}
      </span>
      <button
        type="button"
        onClick={onToggleDark}
        aria-label={t.changeTheme}
        className="-m-2 cursor-pointer rounded p-2 text-green transition hover:opacity-70 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral"
      >
        {isDark ? <Sun size={18} strokeWidth={2} /> : <BsFillMoonStarsFill size={18} />}
      </button>
    </footer>
  );
}
