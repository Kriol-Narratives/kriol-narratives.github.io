import type { Locale } from "@/lib/i18n/config";
import { getMediawikiBaseUrl, parseWikiFileTitle } from "./mediawiki";

export type WikiFileMetadata = {
  /** Description in the requested language (falls back to another one when that translation is missing). */
  description: string | null;
  /** Every translation of the description on the wiki page, by language code. */
  descriptions: Record<string, string>;
  license: string | null;
  licenseUrl: string | null;
  /** Visible (non-hidden) wiki categories of the file page; they act as its keywords. */
  keywords: string[];
  author: string | null;
};

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const CACHE_TTL_MS = 5 * 60 * 1000;
const BATCH_SIZE = 50;
// Codes a language may carry on the wiki; Kriol (San Andrés) is "icr" and is sometimes written "kri"/"kr".
const LANGUAGE_CODES: Record<Locale, string[]> = {
  kri: ["icr", "kri", "kr", "en", "es"],
  en: ["en", "es", "icr", "kri", "kr"],
  es: ["es", "en", "icr", "kri", "kr"],
};

function pickDescription(descriptions: Record<string, string>, locale: Locale): string | null {
  for (const code of LANGUAGE_CODES[locale]) if (descriptions[code]) return descriptions[code];
  return Object.values(descriptions)[0] ?? null;
}

/** With `iiextmetadatamultilang` the value is either a plain string or `{ <lang>: html, _type: "lang" }`. */
function descriptionsOf(value: ExtMetadataValue["value"]): Record<string, string> {
  if (!value) return {};
  if (typeof value === "string") return { und: stripHtml(value) };
  const entries = Object.entries(value)
    .filter(([code]) => code !== "_type")
    .map(([code, html]) => [code.toLowerCase(), stripHtml(html)] as const)
    .filter(([, text]) => text);
  return Object.fromEntries(entries);
}

const cache = new Map<string, { meta: WikiFileMetadata | null; at: number }>();

type ExtMetadataValue = { value?: string | Record<string, string> };
type ExtMetadataResponse = {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages?: Record<
      string,
      {
        title: string;
        imageinfo?: { extmetadata?: Record<string, ExtMetadataValue> }[];
        categories?: { title: string }[];
      }
    >;
  };
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Authors of a file page as "A; B". The Artist field is HTML: several authors come as separate links or
 * lines, so those are split apart instead of being flattened into one string.
 */
function authorsOf(value: ExtMetadataValue["value"]): string | null {
  const html = typeof value === "string" ? value : value ? Object.values(value).find((item) => item !== "lang") : null;
  if (!html) return null;
  const links = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => stripHtml(match[1]));
  const parts =
    links.length > 1
      ? links
      : stripHtml(html.replace(/<br\s*\/?>|<\/(?:li|p|div)>/gi, ";")).split(/[;\n]/);
  const authors = [...new Set(parts.map((part) => part.trim()).filter((part) => part && !/^(unknown|desconocido|anonymous)/i.test(part)))];
  return authors.length ? authors.join("; ") : null;
}

/** The API and file title that hold the metadata of a file-page link (Commons or our own wiki), otherwise null. */
function locateFile(url: string): { api: string; title: string } | null {
  const commons = url.match(/^https?:\/\/commons\.wikimedia\.org\/wiki\/((?:File|Archivo):[^?#]+)/i);
  if (commons) return { api: COMMONS_API, title: decodeURIComponent(commons[1]).replace(/_/g, " ") };

  const baseUrl = getMediawikiBaseUrl();
  const title = parseWikiFileTitle(url);
  return baseUrl && title ? { api: `${baseUrl}/api.php`, title } : null;
}

async function fetchMetadata(api: string, titles: string[]): Promise<Map<string, WikiFileMetadata>> {
  const params = new URLSearchParams({
    action: "query",
    prop: "imageinfo|categories",
    iiprop: "extmetadata",
    iiextmetadatamultilang: "1",
    cllimit: "max",
    clshow: "!hidden",
    redirects: "1",
    format: "json",
    titles: titles.join("|"),
  });
  const res = await fetch(`${api}?${params}`, {
    signal: AbortSignal.timeout(8000),
    headers: { "User-Agent": "KriolNarratives/1.0 (https://kriol-narratives.jerrejerre.workers.dev)" },
  });
  if (!res.ok) throw new Error(`La API de la wiki respondió ${res.status}`);
  const { query } = (await res.json()) as ExtMetadataResponse;

  const metaByTitle = new Map<string, WikiFileMetadata>();
  for (const page of Object.values(query?.pages ?? {})) {
    const ext = page.imageinfo?.[0]?.extmetadata ?? {};
    const keywords = (page.categories ?? []).map((category) => category.title.replace(/^[^:]+:/, "").trim());
    const descriptions = descriptionsOf(ext.ImageDescription?.value);
    const plain = (value: ExtMetadataValue["value"]) => Object.values(descriptionsOf(value))[0] ?? null;
    const license = plain(ext.LicenseShortName?.value);
    const author = authorsOf(ext.Artist?.value);
    metaByTitle.set(page.title, {
      description: null,
      descriptions,
      license: license || null,
      licenseUrl: (typeof ext.LicenseUrl?.value === "string" && ext.LicenseUrl.value.trim()) || null,
      keywords,
      author: author || null,
    });
  }

  const result = new Map<string, WikiFileMetadata>();
  for (const requested of titles) {
    let title = requested;
    title = query?.normalized?.find((n) => n.from === title)?.to ?? title;
    title = query?.redirects?.find((r) => r.from === title)?.to ?? title;
    const meta = metaByTitle.get(title);
    if (meta) result.set(requested, meta);
  }
  return result;
}

/**
 * Description and license of each file-page link as they are on Commons (or our wiki).
 * Links that are not file pages, or whose lookup fails, are absent from the map.
 */
export async function resolveWikiMetadata(urls: string[], locale: Locale = "es"): Promise<Map<string, WikiFileMetadata>> {
  const located = new Map<string, { api: string; title: string }>();
  for (const url of new Set(urls)) {
    const file = locateFile(url);
    if (file) located.set(url, file);
  }

  const now = Date.now();
  const stale = new Map<string, Set<string>>();
  for (const { api, title } of located.values()) {
    const key = `${api}|${title}`;
    const hit = cache.get(key);
    if (hit && now - hit.at <= CACHE_TTL_MS) continue;
    stale.set(api, (stale.get(api) ?? new Set()).add(title));
  }

  for (const [api, titleSet] of stale) {
    const titles = [...titleSet];
    for (let i = 0; i < titles.length; i += BATCH_SIZE) {
      const batch = titles.slice(i, i + BATCH_SIZE);
      try {
        const resolved = await fetchMetadata(api, batch);
        for (const title of batch) cache.set(`${api}|${title}`, { meta: resolved.get(title) ?? null, at: now });
      } catch (error) {
        // Without Commons metadata the sheet values are used, so a wiki outage must not break the site.
        console.error("[wiki-metadata] No se pudo leer la metadata:", error);
      }
    }
  }

  const result = new Map<string, WikiFileMetadata>();
  for (const [url, { api, title }] of located) {
    const meta = cache.get(`${api}|${title}`)?.meta;
    if (meta) result.set(url, { ...meta, description: pickDescription(meta.descriptions, locale) });
  }
  return result;
}
