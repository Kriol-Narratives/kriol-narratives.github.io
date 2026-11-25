// El orden es el del selector de idioma.
export const LOCALES = ["kri", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "locale";

// Nombre en el selector y código BCP 47 para <html lang> (icr = criollo sanandresano).
export const LOCALE_LABELS: Record<Locale, string> = { es: "Español", kri: "Kriol", en: "English" };
export const LOCALE_HTML_LANG: Record<Locale, string> = { es: "es", kri: "icr", en: "en" };

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
