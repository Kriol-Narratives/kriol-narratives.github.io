"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { menuLinks } from "@/data/categories";

type MenuDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

export function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  const asideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      document.body.classList.add("overflow-hidden");
      closeButtonRef.current?.focus();
    } else {
      document.body.classList.remove("overflow-hidden");
      previouslyFocused.current?.focus();
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab" && asideRef.current) {
        const focusables = asideRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-[395px] flex-col bg-green px-8 py-6 text-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            tabIndex={isOpen ? 0 : -1}
            className="-m-2 cursor-pointer rounded p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        <nav className="mt-12 flex flex-col">
          {menuLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              tabIndex={isOpen ? 0 : -1}
              className="flex items-center justify-between gap-4 border-b border-white/50 py-3 font-display text-lg transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {link.label}
              <Plus size={18} strokeWidth={2} className="shrink-0" />
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
