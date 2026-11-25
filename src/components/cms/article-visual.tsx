"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { inferMediaTypeFromUrl, isWikimediaUrl } from "@/lib/cms/media-type";
import type { Article } from "@/lib/cms";

type VisualArticle = Pick<Article, "coverUrl" | "tipo" | "wikimediaUrl" | "mediaItems">;

/** Stand-in artwork per kind of media, for articles with no cover and nothing to preview. */
const PLACEHOLDER = {
  documento: "/placeholders/documento.png",
  audio: "/placeholders/audio.png",
  video: "/placeholders/video.png",
  imagen: "/placeholders/galeria.png",
};

function placeholderFor(article: VisualArticle): string {
  if (article.tipo === "galeria") return PLACEHOLDER.imagen;
  if (article.tipo === "multiformato") return PLACEHOLDER[article.mediaItems[0]?.type ?? "documento"];
  return PLACEHOLDER[article.tipo];
}

/** The video whose first frame stands in for the thumbnail, when the article has no usable image cover. */
function previewVideoUrl(article: VisualArticle, coverFailed: boolean): string | null {
  if (article.coverUrl && inferMediaTypeFromUrl(article.coverUrl) === "video") return article.coverUrl;
  if (article.coverUrl && !coverFailed) return null;
  if (article.tipo === "video") return article.wikimediaUrl;
  if (article.tipo === "multiformato") return article.mediaItems.find((item) => item.type === "video")?.url ?? null;
  return null;
}

export function ArticleVisual({ article, className }: { article: VisualArticle; className: string }) {
  const [coverFailed, setCoverFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = previewVideoUrl(article, coverFailed);
  const coverIsImage = article.coverUrl !== null && inferMediaTypeFromUrl(article.coverUrl) !== "video";
  const thumbnail = coverIsImage && !coverFailed
    ? article.coverUrl
    : article.tipo === "galeria"
      ? (article.mediaItems.find((item) => item.type === "imagen")?.url ?? article.wikimediaUrl)
      : null;

  if (videoSrc) {
    // The first frame is the preview; hovering plays it muted.
    return (
      <div
        className={`relative overflow-hidden bg-[#f0f0f0] ${className}`}
        onMouseEnter={() => void videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => {
          const video = videoRef.current;
          if (!video) return;
          video.pause();
          video.currentTime = 0.5;
        }}
      >
        <video
          ref={videoRef}
          src={`${videoSrc}#t=0.5`}
          preload="metadata"
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  if (thumbnail) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={thumbnail}
          alt=""
          unoptimized={isWikimediaUrl(thumbnail)}
          fill
          className="object-cover"
          onError={() => setCoverFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={placeholderFor(article)} alt="" fill sizes="(min-width: 768px) 20vw, 65vw" className="object-cover" />
    </div>
  );
}
