import { en } from "./en";
import { es } from "./es";
import { kri } from "./kri";
import type { Locale } from "./config";

type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : T extends readonly string[]
      ? string[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

export type Messages = Widen<typeof es>;
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

function merge<T>(base: T, override: DeepPartial<T>): T {
  if (typeof base !== "object" || base === null || Array.isArray(base)) return (override ?? base) as T;
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override as object)) {
    if (value !== undefined) result[key] = merge(result[key], value as never);
  }
  return result as T;
}

/** Los textos de la interfaz por idioma. Kriol hereda del inglés lo que aún no está traducido. */
export const MESSAGES: Record<Locale, Messages> = {
  es,
  en,
  kri: merge<Messages>(en, kri),
};
