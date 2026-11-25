import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { MESSAGES } from "./messages";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Textos de la interfaz para componentes de servidor. En componentes cliente usar `useText()`. */
export async function getText() {
  return MESSAGES[await getLocale()];
}
