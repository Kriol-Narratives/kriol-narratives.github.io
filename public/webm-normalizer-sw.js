/* Service Worker que "normaliza" WebM grabados en directo (OBS, MediaRecorder, Zoom...).
 *
 * Esos archivos quedan con Duration = 1.0 (o sin cerrar) y sin índice, y Chrome limita currentTime a esa
 * duración falsa: la barra no avanza y no deja adelantar/atrasar. Este worker atiende /__webm?url=<video>,
 * pide los bytes al origen desde el propio navegador del visitante (sin pasar por nuestro servidor) y
 * sobrescribe únicamente el valor de Duration con la duración real, leída del último Cluster del archivo.
 */

const ID_SEGMENT = 0x18538067;
const ID_INFO = 0x1549a966;
const ID_TIMECODE_SCALE = 0x2ad7b1;
const ID_DURATION = 0x4489;
const ID_CLUSTER = 0x1f43b675;
const ID_CLUSTER_TIMECODE = 0xe7;
const ID_SIMPLE_BLOCK = 0xa3;
const ID_BLOCK_GROUP = 0xa0;
const ID_BLOCK = 0xa1;

const HEAD_BYTES = 64 * 1024;
const TAIL_WINDOWS = [1024 * 1024, 4 * 1024 * 1024, 16 * 1024 * 1024];
const FETCH_TIMEOUT_MS = 20000;
const CACHE_NAME = "webm-normalizer-v1";
const PASSTHROUGH_HEADERS = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];

const fixCache = new Map(); // url -> Promise<fix | null> (memoria del worker)

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname !== "/__webm") return;
  event.respondWith(handle(event.request, url.searchParams.get("url")));
});

// ---------- EBML ----------

function readId(d, i) {
  const first = d[i];
  if (!first) return null;
  const len = Math.clz32(first) - 23; // 1..4
  if (len > 4 || i + len > d.length) return null;
  let id = 0;
  for (let k = 0; k < len; k++) id = id * 256 + d[i + k];
  return { id, len };
}

function readSize(d, i) {
  const first = d[i];
  if (!first) return null;
  const len = Math.clz32(first) - 23; // 1..8
  if (i + len > d.length) return null;
  let value = first & (0xff >> len);
  let allOnes = value === 0xff >> len;
  for (let k = 1; k < len; k++) {
    value = value * 256 + d[i + k];
    if (d[i + k] !== 0xff) allOnes = false;
  }
  return { size: value, len, unknown: allOnes };
}

function readUint(d, start, size) {
  let v = 0;
  for (let k = 0; k < size; k++) v = v * 256 + d[start + k];
  return v;
}

/** Lee Info > TimecodeScale y Duration de los primeros bytes. null si no hay Duration que parchear. */
function parseHead(d) {
  let p = 0;
  const ebml = readId(d, p);
  if (!ebml) return null;
  const ebmlSize = readSize(d, p + ebml.len);
  if (!ebmlSize) return null;
  p += ebml.len + ebmlSize.len + ebmlSize.size;
  const seg = readId(d, p);
  if (!seg || seg.id !== ID_SEGMENT) return null;
  const segSize = readSize(d, p + seg.len);
  if (!segSize) return null;
  p += seg.len + segSize.len;
  while (p < d.length) {
    const id = readId(d, p);
    if (!id || id.id === ID_CLUSTER) return null;
    const size = readSize(d, p + id.len);
    if (!size) return null;
    const payload = p + id.len + size.len;
    if (id.id === ID_INFO) {
      let timecodeScale = 1000000;
      let q = payload;
      const end = Math.min(payload + size.size, d.length);
      while (q < end) {
        const cid = readId(d, q);
        if (!cid) break;
        const csz = readSize(d, q + cid.len);
        if (!csz) break;
        const cp = q + cid.len + csz.len;
        if (cid.id === ID_TIMECODE_SCALE) timecodeScale = readUint(d, cp, csz.size);
        if (cid.id === ID_DURATION && (csz.size === 4 || csz.size === 8)) {
          const view = new DataView(d.buffer, d.byteOffset + cp, csz.size);
          const durationValue = csz.size === 4 ? view.getFloat32(0) : view.getFloat64(0);
          return { timecodeScale, durationOffset: cp, durationSize: csz.size, durationValue };
        }
        q = cp + csz.size;
      }
      return null;
    }
    if (size.unknown) return null;
    p = payload + size.size;
  }
  return null;
}

/** Mayor timestamp (en ticks) del último Cluster presente en `d`. */
function lastTimestampTicks(d) {
  for (let pos = d.length - 5; pos >= 0; pos--) {
    if (d[pos] !== 0x1f || d[pos + 1] !== 0x43 || d[pos + 2] !== 0xb6 || d[pos + 3] !== 0x75) continue;
    const size = readSize(d, pos + 4);
    if (!size) continue;
    let p = pos + 4 + size.len;
    if (d[p] !== ID_CLUSTER_TIMECODE) continue; // un Cluster real empieza por su Timecode
    let clusterTime = 0;
    let max = -1;
    while (p < d.length) {
      const id = readId(d, p);
      if (!id || id.id === ID_CLUSTER) break;
      const sz = readSize(d, p + id.len);
      if (!sz) break;
      const payload = p + id.len + sz.len;
      if (id.id === ID_BLOCK_GROUP) {
        p = payload;
        continue;
      }
      if (id.id === ID_CLUSTER_TIMECODE) {
        if (payload + sz.size > d.length) break;
        clusterTime = readUint(d, payload, sz.size);
        max = Math.max(max, clusterTime);
      } else if (id.id === ID_SIMPLE_BLOCK || id.id === ID_BLOCK) {
        const track = readSize(d, payload);
        if (!track || payload + track.len + 2 > d.length) break;
        const at = payload + track.len;
        let rel = (d[at] << 8) | d[at + 1];
        if (rel & 0x8000) rel -= 0x10000;
        max = Math.max(max, clusterTime + rel);
      }
      p = payload + sz.size;
    }
    if (max >= 0) return max;
  }
  return null;
}

async function fetchRange(url, range) {
  const res = await fetch(url, {
    headers: { Range: range },
    mode: "cors",
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (res.status !== 206) {
    // El origen ignoró Range (200) o falló: no descargar el archivo completo.
    res.body?.cancel();
    throw new Error("Upstream " + res.status);
  }
  const total = Number((res.headers.get("content-range") || "").split("/")[1] || res.headers.get("content-length"));
  return { bytes: new Uint8Array(await res.arrayBuffer()), total };
}

/** { durationOffset, patch } si el archivo tiene la duración inválida y se puede corregir; si no, null. */
async function computeFix(url) {
  const head = await fetchRange(url, "bytes=0-" + (HEAD_BYTES - 1));
  const info = parseHead(head.bytes);
  if (!info || !head.total) return null;
  const headerSeconds = (info.durationValue * info.timecodeScale) / 1e9;
  if (Number.isFinite(headerSeconds) && headerSeconds > 1) return null; // ya es válida
  for (const window of TAIL_WINDOWS) {
    const start = Math.max(0, head.total - window);
    const tail = await fetchRange(url, "bytes=" + start + "-" + (head.total - 1));
    const ticks = lastTimestampTicks(tail.bytes);
    if (ticks !== null && ticks > 0) {
      const patch = new Uint8Array(info.durationSize);
      const view = new DataView(patch.buffer);
      if (info.durationSize === 4) view.setFloat32(0, ticks);
      else view.setFloat64(0, ticks);
      return { durationOffset: info.durationOffset, patch };
    }
    if (start === 0) break;
  }
  return null;
}

// El resultado también se guarda en Cache Storage para no recalcularlo en visitas siguientes ni si el worker se reinicia.
const cacheKey = (url) => new Request(self.location.origin + "/__webm-fix?url=" + encodeURIComponent(url));

async function loadCachedFix(url) {
  try {
    const hit = await (await caches.open(CACHE_NAME)).match(cacheKey(url));
    if (!hit) return undefined;
    const data = await hit.json();
    return data && { durationOffset: data.durationOffset, patch: new Uint8Array(data.patch) };
  } catch {
    return undefined;
  }
}

async function resolveFix(url) {
  const cached = await loadCachedFix(url);
  if (cached) return cached;
  const fix = await computeFix(url).catch(() => null);
  if (fix) {
    try {
      const body = JSON.stringify({ durationOffset: fix.durationOffset, patch: Array.from(fix.patch) });
      await (await caches.open(CACHE_NAME)).put(cacheKey(url), new Response(body, { headers: { "content-type": "application/json" } }));
    } catch {
      /* sin caché persistente: se recalcula la próxima vez */
    }
  } else {
    fixCache.delete(url); // no cachear fallos: pueden ser temporales
  }
  return fix;
}

function getFix(url) {
  let pending = fixCache.get(url);
  if (!pending) {
    pending = resolveFix(url);
    fixCache.set(url, pending);
  }
  return pending;
}

// ---------- Respuesta ----------

function patchStream(body, startOffset, fix) {
  const patchEnd = fix.durationOffset + fix.patch.length;
  let offset = startOffset;
  return body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        const chunkEnd = offset + chunk.length;
        if (chunkEnd > fix.durationOffset && offset < patchEnd) {
          const out = chunk.slice();
          for (let i = Math.max(offset, fix.durationOffset); i < Math.min(chunkEnd, patchEnd); i++) {
            out[i - offset] = fix.patch[i - fix.durationOffset];
          }
          controller.enqueue(out);
        } else {
          controller.enqueue(chunk);
        }
        offset = chunkEnd;
      },
    }),
  );
}

async function handle(request, target) {
  let targetUrl;
  try {
    targetUrl = new URL(target);
    if (targetUrl.protocol !== "https:" && targetUrl.hostname !== "localhost" && targetUrl.hostname !== "127.0.0.1") throw 0;
  } catch {
    return new Response("URL inválida", { status: 400 });
  }

  try {
    const fix = await getFix(targetUrl.href);
    const range = request.headers.get("range");
    const upstream = await fetch(targetUrl.href, { headers: range ? { Range: range } : {}, mode: "cors" });

    const headers = new Headers();
    for (const name of PASSTHROUGH_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (upstream.status === 416) return new Response(null, { status: 416, headers });
    if (!upstream.body || (upstream.status !== 200 && upstream.status !== 206)) return Response.error();
    let body = upstream.body;
    if (fix) {
      const startOffset =
        upstream.status === 206 ? Number((upstream.headers.get("content-range") || "").match(/bytes (\d+)-/)?.[1] ?? 0) : 0;
      body = patchStream(body, startOffset, fix);
    }
    return new Response(body, { status: upstream.status, headers });
  } catch {
    return Response.error(); // el reproductor vuelve a la URL original al recibir el error
  }
}
