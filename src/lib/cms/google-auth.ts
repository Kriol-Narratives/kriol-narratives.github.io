import "server-only";

// Hand-rolled service-account OAuth2 (JWT bearer flow) using Web Crypto + fetch —
// avoids google-auth-library's Node-only HTTP stack (gaxios), which mishandles
// gzip responses under Cloudflare Workers' nodejs_compat runtime.

type CachedToken = { token: string; expiresAt: number };
const tokenCache = new Map<string, CachedToken>();

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

function getCredentials(): { email: string; key: string } {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  // Strip stray surrounding quotes some env var UIs preserve literally, then unescape "\n".
  const rawKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.trim().replace(/^['"]|['"]$/g, "");
  const key = rawKey?.replace(/\\n/g, "\n");
  if (!email || !key) {
    throw new Error(
      "Faltan las variables GOOGLE_SHEETS_CLIENT_EMAIL / GOOGLE_SHEETS_PRIVATE_KEY en el entorno.",
    );
  }
  return { email, key };
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signJwt(email: string, key: string, scopes: string[]): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64UrlEncodeString(JSON.stringify(header))}.${base64UrlEncodeString(JSON.stringify(claims))}`;
  const cryptoKey = await importPrivateKey(key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64UrlEncode(signature)}`;
}

export async function getGoogleAccessToken(scopes: string[]): Promise<string> {
  const cacheKey = scopes.join(" ");
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  const { email, key } = getCredentials();
  const jwt = await signJwt(email, key, scopes);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo obtener el token de Google (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  tokenCache.set(cacheKey, { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 });
  return data.access_token;
}
