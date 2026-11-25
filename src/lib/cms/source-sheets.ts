import "server-only";

import type { Locale } from "@/lib/i18n/config";
import { getGoogleAccessToken } from "./google-auth";
import { inferMediaTypeFromUrl, toDirectMediaUrl } from "./media-type";
import { resolveWikiFileUrls } from "./mediawiki";
import { resolveWikiMetadata, type WikiFileMetadata } from "./wiki-metadata";
import type { Article, ArticleType, Category, InstitucionalPage, MediaItem, MenuItem, Memoria } from "./types";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAMES = ["articulos_es", "articulos_kr", "articulos_en", "institucional", "categorias", "menu"] as const;
type SheetName = (typeof SHEET_NAMES)[number];

type Row = Record<string, unknown>;
type SheetData = Record<SheetName, Row[]>;

const ARTICLE_SHEET: Record<Locale, SheetName> = { es: "articulos_es", kri: "articulos_kr", en: "articulos_en" };
// Sufijo de las columnas por idioma (slug_es, nombre_kr, descripcion_en…).
const COLUMN_SUFFIX: Record<Locale, string> = { es: "es", kri: "kr", en: "en" };
const ALL_LOCALES = Object.keys(COLUMN_SUFFIX) as Locale[];

const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedData: SheetData | null = null;
let cachedAt = 0;

function rowsToObjects(rows: unknown[][]): Row[] {
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  const keys = header.map((cell) => String(cell ?? "").trim());

  return body.map((row) => {
    const obj: Row = {};
    keys.forEach((key, i) => {
      if (!key) return;
      const value = row[i];
      obj[key] = value === "" ? undefined : value;
    });
    return obj;
  });
}

async function fetchAllSheets(): Promise<SheetData> {
  if (cachedData && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedData;
  }
  if (!SPREADSHEET_ID) {
    throw new Error("Falta la variable GOOGLE_SHEETS_SPREADSHEET_ID en el entorno.");
  }

  const token = await getGoogleAccessToken(["https://www.googleapis.com/auth/spreadsheets.readonly"]);
  const rangesQuery = SHEET_NAMES.map((name) => `ranges=${encodeURIComponent(name)}`).join("&");
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet` +
    `?${rangesQuery}&valueRenderOption=UNFORMATTED_VALUE`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Error leyendo la hoja de cálculo (${res.status}): ${await res.text()}`);
  }
  const { valueRanges } = (await res.json()) as { valueRanges: { values?: unknown[][] }[] };

  const data = {} as SheetData;
  SHEET_NAMES.forEach((name, index) => {
    data[name] = rowsToObjects(valueRanges[index]?.values ?? []);
  });

  cachedData = data;
  cachedAt = Date.now();
  return data;
}

// Sheets returns dates as serial numbers (days since 1899-12-30, same base as Excel).
function excelSerialToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000);
}

function toDate(value: unknown): Date | null {
  if (typeof value === "number") return excelSerialToDate(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

// Bare filenames (no scheme) resolve against the local public folder instead of a URL.
function resolveLogoUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  if (/^https?:\/\//i.test(raw)) return toDirectMediaUrl(raw);
  return `/images/categories/${raw}`;
}

function resolveCoverUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  return toDirectMediaUrl(raw);
}

function mediaUrlColumns(row: Row): string[] {
  return Object.keys(row)
    .filter((key) => /^wikimedia_url/i.test(key))
    .sort();
}

function extractMultiformatoMedia(
  row: Row,
  directUrls: Map<string, string>,
  metadata: Map<string, WikiFileMetadata>,
): MediaItem[] {
  const items: MediaItem[] = [];
  for (const column of mediaUrlColumns(row)) {
    const raw = row[column];
    if (typeof raw !== "string" || !raw.trim()) continue;
    const sourceUrl = raw.trim();
    const url = directUrls.get(sourceUrl) ?? toDirectMediaUrl(sourceUrl);
    const type = inferMediaTypeFromUrl(url);
    const meta = metadata.get(sourceUrl);
    if (type) items.push({ type, url, sourceUrl, description: meta?.description, license: meta?.license, licenseUrl: meta?.licenseUrl, keywords: meta?.keywords });
  }
  return items;
}

function primaryMediaUrl(row: Row, directUrls: Map<string, string>): string | null {
  const raw = row.wikimedia_url ?? row.wikimedia_url_1;
  if (typeof raw !== "string" || !raw.trim()) return null;
  return directUrls.get(raw.trim()) ?? toDirectMediaUrl(raw.trim());
}

/** Authors of every media file of the story, as read from the wikis ("A; B"), without repeats. */
function wikiAuthors(row: Row, metadata: Map<string, WikiFileMetadata>): string | null {
  const authors = mediaUrlColumns(row)
    .map((column) => text(row[column]))
    .flatMap((url) => (url ? (metadata.get(url)?.author ?? "").split(";") : []))
    .map((author) => author.trim())
    .filter(Boolean);
  const unique = [...new Set(authors)];
  return unique.length ? unique.join("; ") : null;
}

function keywordsOf(value: unknown): string[] {
  return typeof value === "string" ? value.split(/[;,]/).map((word) => word.trim()).filter(Boolean) : [];
}

function definedOnly(row: Row): Row {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));
}

/** Valor de una columna con sufijo de idioma; si esa traducción está vacía usa la de español. */
function localized(row: Row, base: string, locale: Locale): unknown {
  return row[`${base}_${COLUMN_SUFFIX[locale]}`] ?? row[`${base}_es`] ?? row[base];
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Los slugs de una fila en todos los idiomas, para encontrar la misma entrada desde un link de otro idioma. */
function allSlugs(row: Row): string[] {
  const slugs = ALL_LOCALES.map((locale) => text(row[`slug_${COLUMN_SUFFIX[locale]}`]));
  return [...new Set(slugs.filter((slug): slug is string => slug !== null))];
}

/** Slug de una categoría (escrito en cualquier idioma en la hoja de artículos) en el idioma pedido. */
function categorySlugResolver(rows: Row[], locale: Locale): (raw: unknown) => string {
  const byAnySlug = new Map<string, string>();
  for (const row of rows) {
    const own = String(localized(row, "slug", locale) ?? "");
    for (const slug of allSlugs(row)) byAnySlug.set(slug.toLowerCase(), own);
    // También se acepta el id (LFI) o el nombre en cualquier idioma.
    const aliases = [text(row.id_categoria), ...ALL_LOCALES.map((l) => text(row[`nombre_${COLUMN_SUFFIX[l]}`]))];
    for (const alias of aliases) if (alias) byAnySlug.set(alias.toLowerCase(), own);
  }
  return (raw) => {
    const value = typeof raw === "string" ? raw.trim() : "";
    return byAnySlug.get(value.toLowerCase()) ?? value;
  };
}

/** Clave que une las versiones de una historia en distintos idiomas: el id, o el slug si la fila no trae id. */
function articleKey(row: Row): string {
  return String(row.id_articulo ?? row.slug);
}

/**
 * Historias en el idioma pedido. `articulos_es` es la base; cada fila traducida se une por `id_articulo`
 * y solo pisa los campos que trae llenos (lo demás —tipo, orden, links…— se hereda del español).
 * Una historia que existe solo en otro idioma (p. ej. solo en kriol) también se incluye, tomando la
 * versión disponible, para que siempre se pueda abrir desde cualquier idioma.
 */
function articleRowsFor(data: SheetData, locale: Locale): Row[] {
  const rowsOf = (sheet: SheetName) => data[sheet].filter((row) => row.slug);
  const base = rowsOf("articulos_es");
  const own = locale === "es" ? new Map<string, Row>() : new Map(rowsOf(ARTICLE_SHEET[locale]).map((row) => [articleKey(row), row]));

  const result: Row[] = [];
  const seen = new Set<string>();
  for (const row of base) {
    const key = articleKey(row);
    seen.add(key);
    const translation = own.get(key);
    // La categoría es estructural: se hereda del español (en la hoja traducida suele venir como texto, no como slug).
    result.push(translation ? { ...row, ...definedOnly({ ...translation, categoria: undefined }) } : row);
  }
  // Historias que no están en español: la del idioma pedido, o la de cualquier otro idioma que la tenga.
  const fallbackOrder = [ARTICLE_SHEET[locale], ...ALL_LOCALES.map((l) => ARTICLE_SHEET[l])];
  for (const sheet of fallbackOrder) {
    for (const row of rowsOf(sheet)) {
      const key = articleKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(row);
    }
  }
  return result;
}

export async function getArticlesFromSheets(locale: Locale = "es"): Promise<Article[]> {
  const data = await fetchAllSheets();
  const articleRows = articleRowsFor(data, locale);
  const resolveCategory = categorySlugResolver(data.categorias, locale);

  const slugsById = new Map<string, Set<string>>();
  for (const sheet of Object.values(ARTICLE_SHEET)) {
    for (const row of data[sheet]) {
      const slug = text(row.slug);
      if (!slug) continue;
      const id = articleKey(row);
      slugsById.set(id, (slugsById.get(id) ?? new Set()).add(slug));
    }
  }

  // One batched wiki API call for every media link in the sheet (cached for 5 min).
  const mediaLinks = articleRows.flatMap((row) =>
    mediaUrlColumns(row)
      .map((column) => row[column])
      .filter((value): value is string => typeof value === "string" && value.trim() !== "")
      .map((value) => value.trim()),
  );
  const [directUrls, metadata] = await Promise.all([
    resolveWikiFileUrls(mediaLinks),
    resolveWikiMetadata(mediaLinks, locale),
  ]);

  return articleRows.map((row) => {
    const tipo = (String(row.tipo ?? "").toLowerCase() as ArticleType) || "documento";
    const id = articleKey(row);
    const slug = String(row.slug);
    const citationUrl = text(row.wikimedia_url ?? row.wikimedia_url_1);
    const primaryMeta = citationUrl ? metadata.get(citationUrl) : undefined;
    return {
      id,
      slug,
      slugAliases: [...(slugsById.get(id) ?? [])].filter((alias) => alias !== slug),
      categoriaSlug: resolveCategory(row.categoria),
      estado: row.estado === "Publicado" ? "Publicado" : "Borrador",
      destacado: Boolean(row.destacado),
      orden: Number(row.orden) || 0,
      tipo,
      seoTitle: (row.seo_title_custom as string) ?? null,
      seoDescription: (row.seo_description as string) ?? null,
      licencia: typeof row.licencia === "string" && row.licencia.trim() ? row.licencia.trim() : null,
      autoria: wikiAuthors(row, metadata) ?? (typeof row.autoria === "string" && row.autoria.trim() ? row.autoria.trim() : null),
      coverUrl: resolveCoverUrl(row.custom_cover_url),
      wikimediaUrl: primaryMediaUrl(row, directUrls),
      citationUrl,
      commonsDescription: primaryMeta?.description ?? null,
      commonsLicense: primaryMeta?.license ?? null,
      commonsLicenseUrl: primaryMeta?.licenseUrl ?? null,
      keywords: primaryMeta?.keywords.length ? primaryMeta.keywords : keywordsOf(row.palabras_clave),
      fechaPublicacion: toDate(row.fecha_publicacion),
      fechaActualizacion: toDate(row.fecha_actualizacion),
      mediaItems: tipo === "multiformato" || tipo === "galeria" ? extractMultiformatoMedia(row, directUrls, metadata) : [],
    };
  });
}

/** Id del documento a partir de su link de Google Docs (`…/document/d/<id>/edit`); también acepta el id suelto. */
function googleDocId(raw: unknown): string | null {
  const value = text(raw);
  if (!value) return null;
  return value.match(/\/d\/([\w-]+)/)?.[1] ?? (/^[\w-]{20,}$/.test(value) ? value : null);
}

/**
 * Páginas institucionales (nosotros, aliados, contacto, créditos…). Hoja `institucional`: id_articulo,
 * slug_es / slug_kr / slug_en, estado, seo_*, fechas y enlace_es / enlace_kr / enlace_en (link del Google Doc
 * de cada idioma; si falta el de un idioma se usa el de español).
 */
export async function getInstitucionalFromSheets(locale: Locale = "es"): Promise<InstitucionalPage[]> {
  const { institucional: rows } = await fetchAllSheets();

  return rows
    .filter((row) => localized(row, "slug", "es"))
    .map((row) => {
      const slug = String(localized(row, "slug", locale));
      return {
        id: String(row.id_articulo ?? slug),
        slug,
        slugAliases: allSlugs(row).filter((alias) => alias !== slug),
        estado: row.estado === "Publicado" ? "Publicado" : "Borrador",
        // seo_title_custom_kr / _en; vacía usa seo_title_custom.
        seoTitle: text(row[`seo_title_custom_${COLUMN_SUFFIX[locale]}`]) ?? text(row.seo_title_custom),
        seoDescription: (row.seo_description as string) ?? null,
        coverUrl: resolveCoverUrl(row.custom_cover_url),
        googleDocsId: googleDocId(localized(row, "enlace", locale)),
        fechaPublicacion: toDate(row.fecha_publicacion),
        fechaActualizacion: toDate(row.fecha_actualizacion),
      };
    });
}

export async function getCategoriesFromSheets(locale: Locale = "es"): Promise<Category[]> {
  const { categorias: rows } = await fetchAllSheets();

  return rows
    .filter((row) => row.slug_es)
    .map((row) => {
      const slug = String(localized(row, "slug", locale));
      return {
        id: (row.id_categoria as string) ?? slug,
        nombre: (localized(row, "nombre", locale) as string) ?? null,
        slug,
        slugAliases: allSlugs(row).filter((alias) => alias !== slug),
        descripcion: (localized(row, "descripcion", locale) as string) ?? null,
        logoUrl: resolveLogoUrl(row.logo),
        coverUrl: resolveCoverUrl(row.url_cover),
        orden: Number(row.orden) || 0,
      };
    });
}

/**
 * Opciones del menú lateral, en el idioma pedido. Hoja `menu`: id_menu, orden, estado, url,
 * id_institucional (opcional: toma el slug de esa página) o url_es / url_kr / url_en, y nombre_es / nombre_kr / nombre_en (una columna por idioma, como slug_* en artículos).
 * Si el nombre de un idioma está vacío se usa el de español.
 */
export async function getMenuFromSheets(locale: Locale = "es"): Promise<MenuItem[]> {
  const { menu: rows, institucional } = await fetchAllSheets();
  // Una opción puede apuntar a una página institucional (id_institucional): su link es el slug de esa página en el idioma actual.
  const hrefOf = (row: Row): string | null => {
    const target = text(row.id_institucional);
    // Si apunta a una página institucional publicada, el link es su slug en el idioma actual (tenga o no ya el documento).
    const page = target ? institucional.find((item) => String(item.id_articulo) === target) : undefined;
    if (page && page.estado === "Publicado") return `/${String(localized(page, "slug", locale))}`;
    return text(localized(row, "url", locale));
  };

  return rows
    .filter((row) => row.estado === "Publicado" && text(localized(row, "nombre", locale)) && hrefOf(row))
    .sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0))
    .map((row) => ({
      id: String(row.id_menu ?? localized(row, "nombre", "es")),
      label: text(localized(row, "nombre", locale))!,
      href: hrefOf(row)!,
    }));
}

const MEMORIAS_SHEET = "memorias";
let cachedMemorias: Row[] = [];
let cachedMemoriasAt = 0;

/** La hoja `memorias` se lee aparte: si todavía no existe o falla, no se cae el resto del sitio. */
async function fetchMemoriasRows(): Promise<Row[]> {
  if (cachedMemoriasAt && Date.now() - cachedMemoriasAt < CACHE_TTL_MS) return cachedMemorias;
  if (!SPREADSHEET_ID) throw new Error("Falta la variable GOOGLE_SHEETS_SPREADSHEET_ID en el entorno.");
  const token = await getGoogleAccessToken(["https://www.googleapis.com/auth/spreadsheets.readonly"]);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(MEMORIAS_SHEET)}` +
    "?valueRenderOption=UNFORMATTED_VALUE";
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Error leyendo la hoja ${MEMORIAS_SHEET} (${res.status}): ${await res.text()}`);
  const { values } = (await res.json()) as { values?: unknown[][] };
  cachedMemorias = rowsToObjects(values ?? []);
  cachedMemoriasAt = Date.now();
  return cachedMemorias;
}

/**
 * Memorias en el idioma pedido. Hoja `memorias`: id_articulo, slug_es / slug_kr / slug_en, estado, seo_title_custom,
 * seo_description, custom_cover_url, fecha_publicacion, fecha_actualizacion, enlace_es / enlace_kr / enlace_en
 * (link del Google Doc de cada idioma) y relacionado_1 … relacionado_5.
 */
export async function getMemoriasFromSheets(locale: Locale = "es"): Promise<Memoria[]> {
  const rows = await fetchMemoriasRows();

  return rows
    .filter((row) => localized(row, "slug", "es"))
    .map((row) => {
      const slug = String(localized(row, "slug", locale));
      return {
        id: String(row.id_articulo ?? slug),
        slug,
        slugAliases: allSlugs(row).filter((alias) => alias !== slug),
        estado: row.estado === "Publicado" ? "Publicado" : "Borrador",
        seoTitle: text(row.seo_title_custom),
        seoDescription: text(row.seo_description),
        coverUrl: resolveCoverUrl(row.custom_cover_url),
        googleDocsId: googleDocId(localized(row, "enlace", locale)),
        fechaPublicacion: toDate(row.fecha_publicacion),
        relatedRefs: [1, 2, 3, 4, 5].map((n) => text(row[`relacionado_${n}`])).filter((ref): ref is string => ref !== null),
      };
    });
}
