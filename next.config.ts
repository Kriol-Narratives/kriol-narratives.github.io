import type { NextConfig } from "next";
import path from "path";

// Host of the MediaWiki that serves the media files (from .env.local); images are only optimized for allowed hosts.
const mediawikiUrl = process.env.MEDIAWIKI_BASE_URL ? new URL(process.env.MEDIAWIKI_BASE_URL) : null;

const nextConfig: NextConfig = {
  agentRules: false,
  // Bake the value into the bundle at build time so it doesn't depend on the host injecting it at runtime (Workers).
  ...(process.env.MEDIAWIKI_BASE_URL ? { env: { MEDIAWIKI_BASE_URL: process.env.MEDIAWIKI_BASE_URL } } : {}),
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Las categorías ya no llevan el prefijo /categoria: los links viejos siguen abriendo.
  async redirects() {
    return [{ source: "/categoria/:path*", destination: "/:path*", permanent: false }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      ...(mediawikiUrl
        ? [{ protocol: mediawikiUrl.protocol.replace(":", "") as "http" | "https", hostname: mediawikiUrl.hostname }]
        : []),
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
