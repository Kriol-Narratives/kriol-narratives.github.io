import "server-only";

import { cleanGoogleDocHtml } from "./doc-html";
import { getGoogleAccessToken } from "./google-auth";

// Exports the doc as HTML via Drive (service account — doc just needs Viewer access, not public).
export async function getGoogleDocHtml(docId: string): Promise<string | null> {
  const token = await getGoogleAccessToken(["https://www.googleapis.com/auth/drive.readonly"]);

  const url = `https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=text%2Fhtml`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  if (!response.ok) return null;

  const raw = await response.text();

  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const html = bodyMatch ? bodyMatch[1] : raw;

  return cleanGoogleDocHtml(html);
}
