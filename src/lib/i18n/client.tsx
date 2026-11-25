"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { MESSAGES } from "./messages";

export type MenuEntry = { id: string; label: string; href: string };
const MenuContext = createContext<MenuEntry[]>([]);

/** Opciones del menú que vienen de la hoja `menu`; vacío = se usa el menú por defecto. */
export function MenuProvider({ items, children }: { items: MenuEntry[]; children: React.ReactNode }) {
  return <MenuContext.Provider value={items}>{children}</MenuContext.Provider>;
}

export function useMenuItems() {
  return useContext(MenuContext);
}

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useText() {
  return MESSAGES[useContext(LocaleContext)];
}

/** Nombre de la categoría en el idioma actual (columna nombre_* de la hoja categorias). */
export function useCategoryTitle() {
  return (category: { slug: string; nombre: string | null }) =>
    category.nombre ??
    category.slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
