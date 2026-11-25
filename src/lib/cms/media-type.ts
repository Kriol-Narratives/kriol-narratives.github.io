import { md5 } from "./md5";
import { getMediawikiBaseUrl, parseWikiFileTitle } from "./mediawiki";
import type { MediaType } from "./types";

const EXTENSION_MAP: Record<string, MediaType> = {
  mp4: "video",
  webm: "video",
  mov: "video",
  ogv: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  m4a: "audio",
  flac: "audio",
  pdf: "documento",
  jpg: "imagen",
  jpeg: "imagen",
  png: "imagen",
  gif: "imagen",
  webp: "imagen",
  svg: "imagen",
};

export function inferMediaTypeFromUrl(url: string): MediaType | null {
  const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
  const extension = match?.[1]?.toLowerCase();
  return extension ? (EXTENSION_MAP[extension] ?? null) : null;
}

// Rewrites Wikimedia/MediaWiki file-page and Google Drive share links to direct, embeddable image URLs.
export function toDirectMediaUrl(url: string): string {
  // Commons: la ruta de upload.wikimedia.org se calcula con el md5 del nombre, sin consultar la red.
  // Así el navegador carga el archivo directo y evitamos el redirect de Special:FilePath (que Wikimedia bloquea con 403 desde servidores).
  const commonsMatch = url.match(/^https?:\/\/commons\.wikimedia\.org\/wiki\/(?:File:|Special:FilePath\/)([^?#]+)/i);
  if (commonsMatch) {
    const name = decodeURIComponent(commonsMatch[1]).replace(/ /g, "_");
    const hash = md5(name);
    return `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(name)}`;
  }

  // Miniaturas de Commons (thumb.wikimedia.org/.../thumb/9/96/Nombre.jpg/1920px-Nombre.jpg) -> archivo original.
  const thumbMatch = url.match(/^https?:\/\/(?:thumb|upload)\.wikimedia\.org\/wikipedia\/commons\/thumb\/(\w\/\w\w\/[^/?#]+)\/[^/?#]+/i);
  if (thumbMatch) {
    return `https://upload.wikimedia.org/wikipedia/commons/${thumbMatch[1]}`;
  }

  // Sync fallback (e.g. covers): Special:FilePath redirects to the file. Articles get the exact URL via resolveWikiFileUrls.
  const wikiTitle = parseWikiFileTitle(url);
  const wikiBaseUrl = getMediawikiBaseUrl();
  if (wikiTitle && wikiBaseUrl) {
    return `${wikiBaseUrl}/index.php?title=Special:FilePath/${encodeURIComponent(wikiTitle.replace(/^[^:]+:/, "").replace(/ /g, "_"))}`;
  }

  const driveMatch =
    url.match(/drive\.google\.com\/file\/d\/([^/]+)/i) ??
    (/drive\.google\.com/i.test(url) ? url.match(/[?&]id=([^&]+)/i) : null);
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  return url;
}

/** Las imágenes de Wikimedia se cargan directo desde el navegador: el optimizador de Next recibe 403 desde el servidor. */
export function isWikimediaUrl(url: string): boolean {
  return /^https?:\/\/(upload|thumb|commons)\.wikimedia\.org\//i.test(url);
}
