// Set MEDIAWIKI_BASE_URL in .env.local (see .env.example). Without it wiki links are left untouched.
// Read lazily (per call, not at module load) so runtimes that inject env vars per request, like Workers, see it.
export function getMediawikiBaseUrl(): string | null {
  return process.env.MEDIAWIKI_BASE_URL?.trim().replace(/\/+$/, "") || null;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const BATCH_SIZE = 50; // MediaWiki's limit for `titles` on anonymous requests.
const cache = new Map<string, { directUrl: string | null; at: number }>();

/** Returns the file title ("Archivo:Foo.jpg") if `url` is a file page of our wiki, otherwise null. */
export function parseWikiFileTitle(url: string): string | null {
  const baseUrl = getMediawikiBaseUrl();
  if (!baseUrl) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.origin !== new URL(baseUrl).origin) return null;

  const fromQuery = parsed.searchParams.get("title");
  const fromPath = parsed.pathname.match(/\/wiki\/(.+)$/)?.[1];
  const title = fromQuery ?? (fromPath ? decodeURIComponent(fromPath) : null);
  if (!title) return null;

  // Only file pages are media; "Emergencia_villavicencio"-style article pages are not.
  return /^(archivo|file|imagen|image):/i.test(title) ? title.replace(/_/g, " ") : null;
}

type ImageInfoResponse = {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages?: Record<string, { title: string; imageinfo?: { url: string }[] }>;
  };
};

async function fetchDirectUrls(baseUrl: string, titles: string[]): Promise<Map<string, string>> {
  const params = new URLSearchParams({
    action: "query",
    prop: "imageinfo",
    iiprop: "url|mime",
    redirects: "1",
    format: "json",
    titles: titles.join("|"),
  });
  const started = Date.now();
  const res = await fetch(`${baseUrl}/api.php?${params}`, {
    signal: AbortSignal.timeout(8000),
  });
  console.log(`[mediawiki] API respondió ${res.status} en ${Date.now() - started}ms`);
  if (!res.ok) throw new Error(`MediaWiki API respondió ${res.status}`);
  const { query } = (await res.json()) as ImageInfoResponse;

  const finalUrlByTitle = new Map<string, string>();
  for (const page of Object.values(query?.pages ?? {})) {
    const url = page.imageinfo?.[0]?.url;
    if (url) finalUrlByTitle.set(page.title, url);
  }

  // Follow requested title -> normalized -> redirect -> page title.
  const result = new Map<string, string>();
  for (const requested of titles) {
    let title = requested;
    title = query?.normalized?.find((n) => n.from === title)?.to ?? title;
    title = query?.redirects?.find((r) => r.from === title)?.to ?? title;
    const url = finalUrlByTitle.get(title);
    if (url) result.set(requested, url);
  }
  return result;
}

/**
 * Resolves wiki file-page links to their direct file URLs with as few API calls as possible.
 * Links that are not wiki file pages, or that fail to resolve, are absent from the returned map
 * so callers keep the original value.
 */
export async function resolveWikiFileUrls(urls: string[]): Promise<Map<string, string>> {
  const baseUrl = getMediawikiBaseUrl();
  const titleByUrl = new Map<string, string>();
  // TEMP-DEBUG: quitar los console.log "[mediawiki]" cuando se resuelva el problema de producción.
  console.log(`[mediawiki] base=${baseUrl ?? "NO DEFINIDA"} | enlaces recibidos=${urls.length}`);
  if (!baseUrl) return new Map();
  for (const url of new Set(urls)) {
    const title = parseWikiFileTitle(url);
    if (title) titleByUrl.set(url, title);
  }

  console.log(`[mediawiki] enlaces que son archivo de la wiki=${titleByUrl.size}`, [...titleByUrl.values()]);

  const now = Date.now();
  const stale = [...new Set(titleByUrl.values())].filter((title) => {
    const hit = cache.get(title);
    return !hit || now - hit.at > CACHE_TTL_MS;
  });

  console.log(`[mediawiki] por consultar al API=${stale.length} (el resto viene de caché)`);

  for (let i = 0; i < stale.length; i += BATCH_SIZE) {
    const batch = stale.slice(i, i + BATCH_SIZE);
    try {
      const resolved = await fetchDirectUrls(baseUrl, batch);
      for (const title of batch) {
        cache.set(title, { directUrl: resolved.get(title) ?? null, at: now });
      }
    } catch (error) {
      // A wiki outage must not take the whole site down: keep the original links.
      console.error("[mediawiki] No se pudieron resolver archivos:", error);
    }
  }

  const result = new Map<string, string>();
  for (const [url, title] of titleByUrl) {
    const directUrl = cache.get(title)?.directUrl;
    if (directUrl) result.set(url, directUrl);
  }
  console.log(`[mediawiki] resueltos=${result.size}/${titleByUrl.size}`, [...result.values()]);
  return result;
}
