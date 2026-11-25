"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

// El tema vive en la clase "dark" de <html> (la pone un script en <head> antes de pintar, según localStorage),
// así que es el mismo en todas las vistas y no se reinicia al navegar ni al recargar.
const listeners = new Set<() => void>();

function readDark() {
  return document.documentElement.classList.contains("dark");
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    // Cambio hecho en otra pestaña: se aplica aquí también.
    if (event.key !== THEME_STORAGE_KEY) return;
    document.documentElement.classList.toggle("dark", event.newValue === "dark");
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDarkMode(): [boolean, () => void] {
  const isDark = useSyncExternalStore(subscribe, readDark, () => false);

  const toggle = useCallback(() => {
    const next = !readDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* sin almacenamiento: el tema vale solo mientras dure la sesión */
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [isDark, toggle];
}
