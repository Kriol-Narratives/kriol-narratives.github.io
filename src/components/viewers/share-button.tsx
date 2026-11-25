"use client";

import { Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useText } from "@/lib/i18n/client";

/**
 * Botón de compartir: abre una barra con X (Twitter) y Facebook.
 * Ambas abren en una pestaña nueva su diálogo de compartir, con el link de la página ya puesto.
 */
export function ShareButton({
  className,
  iconSize = 14,
  children,
}: {
  /** Clases del botón que abre el menú. */
  className: string;
  iconSize?: number;
  children?: React.ReactNode;
}) {
  const TEXT = useText();
  const t = TEXT.Viewers;
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    // Sin medidas en el tercer argumento el navegador la abre como pestaña y no como ventana emergente.
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
    // Respaldo: si Facebook no precarga el link (p. ej. desde una dirección que no es pública), basta con pegarlo.
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setIsOpen(false);
    }
  }

  function shareOnX() {
    const params = new URLSearchParams({ url: window.location.href, text: document.title });
    window.open(`https://x.com/intent/post?${params}`, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  }

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={t.share}
        aria-expanded={isOpen}
        className={className}
      >
        <Share2 size={iconSize} strokeWidth={2} />
        {children}
      </button>
      {isOpen && (
        <span
          role="menu"
          className="absolute bottom-full right-0 z-30 mb-2 flex items-center gap-5 whitespace-nowrap rounded-lg bg-green px-4 py-2.5 text-white shadow-lg"
        >
          {copied ? (
            <span className="font-sans text-xs font-semibold">
              {t.linkCopied}
            </span>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={shareOnX}
                aria-label={t.shareX}
                className="cursor-pointer transition hover:opacity-80"
              >
                <FaXTwitter size={20} />
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={shareOnFacebook}
                aria-label={t.shareFacebook}
                className="cursor-pointer transition hover:opacity-80"
              >
                <FaFacebook size={20} />
              </button>
            </>
          )}
        </span>
      )}
    </span>
  );
}
