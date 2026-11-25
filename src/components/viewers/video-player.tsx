"use client";

import { Loader2, Maximize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { inferMediaTypeFromUrl } from "@/lib/cms/media-type";
import { useText } from "@/lib/i18n/client";
import { ShareButton } from "@/components/viewers/share-button";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

// Los WebM grabados en directo suelen venir con la duración sin cerrar (0, 1 o Infinity): el navegador no deja saltar.
function hasValidDuration(seconds: number) {
  return Number.isFinite(seconds) && seconds > 1;
}

function isNormalizableVideo(url: string) {
  return /\.(webm|mkv)(\?|#|$)/i.test(url);
}

function normalizedSrc(url: string) {
  return `/__webm?url=${encodeURIComponent(url)}`;
}

// Un Service Worker corrige en el navegador la duración del WebM (ver public/webm-normalizer-sw.js).
async function enableNormalizer() {
  if (!("serviceWorker" in navigator)) return false;
  try {
    await navigator.serviceWorker.register("/webm-normalizer-sw.js");
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
        setTimeout(resolve, 3000);
      });
    }
    return Boolean(navigator.serviceWorker.controller);
  } catch {
    return false;
  }
}

export function VideoPlayer({
  posterImage,
  src,
}: {
  posterImage?: string | null;
  src: string;
}) {
  const TEXT = useText();
  const t = TEXT.Viewers;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  // Arrastre de la barra: la bolita sigue al puntero al instante y el video salta una sola vez al soltar.
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);
  // Destino de un salto en curso: la barra se queda ahí mientras el navegador termina de buscar.
  const [pendingTime, setPendingTime] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeAfterScrub = useRef(false);
  // Si el archivo llega con la duración rota, se reemplaza una sola vez por la versión normalizada en el navegador.
  const [useNormalized, setUseNormalized] = useState(false);
  const normalizeTried = useRef(false);
  const videoSrc = useNormalized ? normalizedSrc(src) : src;
  // Misma lógica que el listado: portada de imagen si la hay; si no, el primer fotograma del video.
  const hasImagePoster = Boolean(posterImage) && inferMediaTypeFromUrl(posterImage!) !== "video";

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onSeeked = () => {
      setCurrentTime(video.currentTime);
      setPendingTime(null);
    };
    const onDurationChange = () => setDuration(video.duration);
    let cancelled = false;
    const onLoadedMetadata = () => {
      onDurationChange();
      if (!hasValidDuration(video.duration) && !normalizeTried.current && isNormalizableVideo(src)) {
        normalizeTried.current = true;
        enableNormalizer().then((ok) => {
          if (ok && !cancelled) setUseNormalized(true);
        });
      }
    };
    // Si la versión normalizada falla, se vuelve al archivo original.
    const onError = () => {
      if (normalizeTried.current) setUseNormalized(false);
    };
    const onBusy = () => setIsBuffering(true);
    const onReady = () => setIsBuffering(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
    video.addEventListener("seeking", onBusy);
    video.addEventListener("waiting", onBusy);
    video.addEventListener("seeked", onReady);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("playing", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("emptied", onReady);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    if (video.readyState >= 1) onLoadedMetadata();
    return () => {
      cancelled = true;
      video.removeEventListener("error", onError);
      video.removeEventListener("seeking", onBusy);
      video.removeEventListener("waiting", onBusy);
      video.removeEventListener("seeked", onReady);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("playing", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("emptied", onReady);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  // Si la versión normalizada no arranca (origen lento o error), se vuelve al archivo original.
  useEffect(() => {
    if (!useNormalized) return;
    const id = setTimeout(() => {
      if ((videoRef.current?.readyState ?? 0) < 1) setUseNormalized(false);
    }, 25000);
    return () => clearTimeout(id);
  }, [useNormalized]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  function seekTo(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    const max = hasValidDuration(video.duration) ? video.duration : Number.MAX_SAFE_INTEGER;
    const target = Math.min(Math.max(seconds, 0), max);
    setPendingTime(target);
    video.currentTime = target;
  }

  function seekBy(delta: number) {
    const video = videoRef.current;
    if (video) seekTo((pendingTime ?? video.currentTime) + delta);
  }

  function ratioFromPointer(event: { clientX: number }) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return 0;
    return Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  }

  function handleScrubStart(event: React.PointerEvent<HTMLDivElement>) {
    if (!hasValidDuration(duration) || event.button > 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const video = videoRef.current;
    // Se pausa mientras se arrastra (como hacen los reproductores) y se reanuda al soltar.
    resumeAfterScrub.current = Boolean(video && !video.paused);
    if (resumeAfterScrub.current) video?.pause();
    setScrubRatio(ratioFromPointer(event));
  }

  function handleScrubMove(event: React.PointerEvent<HTMLDivElement>) {
    if (scrubRatio === null) return;
    setScrubRatio(ratioFromPointer(event));
  }

  function handleScrubEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (scrubRatio === null) return;
    const ratio = ratioFromPointer(event);
    setScrubRatio(null);
    seekTo(ratio * duration);
    if (resumeAfterScrub.current) videoRef.current?.play().catch(() => {});
    resumeAfterScrub.current = false;
  }

  function handleScrubKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!hasValidDuration(duration)) return;
    const step = event.shiftKey ? 30 : 5;
    const handlers: Record<string, () => void> = {
      ArrowLeft: () => seekBy(-step),
      ArrowDown: () => seekBy(-step),
      ArrowRight: () => seekBy(step),
      ArrowUp: () => seekBy(step),
      Home: () => seekTo(0),
      End: () => seekTo(duration),
    };
    const handler = handlers[event.key];
    if (!handler) return;
    event.preventDefault();
    handler();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }

  const shownDuration = hasValidDuration(duration) ? duration : 0;
  const displayTime = scrubRatio !== null ? scrubRatio * shownDuration : (pendingTime ?? currentTime);
  const progressRatio = shownDuration ? Math.min(Math.max(displayTime / shownDuration, 0), 1) : 0;
  const isScrubbing = scrubRatio !== null;

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "dark flex h-screen w-screen flex-col justify-center gap-2 bg-black p-6"
          : "w-full max-w-[600px]"
      }
    >
      <div
        className={`relative w-full overflow-hidden rounded bg-black ${
          isFullscreen ? "min-h-0 flex-1" : "aspect-video"
        }`}
      >
        <video
          ref={videoRef}
          src={hasImagePoster ? videoSrc : `${videoSrc}#t=0.5`}
          preload="metadata"
          poster={hasImagePoster ? posterImage! : undefined}
          onClick={togglePlay}
          className="h-full w-full cursor-pointer object-contain"
        />
        {isBuffering && (
          <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 size={36} strokeWidth={2} className="animate-spin text-white/90 drop-shadow" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className={`relative z-10 mr-1 flex justify-end gap-3 ${isFullscreen ? "" : "-mt-9"}`}>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t.exitFullscreen : t.fullscreen}
          className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded bg-white/90 text-black"
        >
          <Maximize2 size={13} strokeWidth={2} />
        </button>
        <ShareButton iconSize={13} className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded bg-white/90 text-black" />
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <span className="font-sans text-xs font-medium tabular-nums text-black dark:text-cream">
          {formatTime(displayTime)}
        </span>
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label={`${formatTime(displayTime)} / ${formatTime(shownDuration)}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(shownDuration)}
          aria-valuenow={Math.round(displayTime)}
          aria-valuetext={formatTime(displayTime)}
          onPointerDown={handleScrubStart}
          onPointerMove={handleScrubMove}
          onPointerUp={handleScrubEnd}
          onPointerCancel={handleScrubEnd}
          onKeyDown={handleScrubKeyDown}
          className="group relative flex h-7 flex-1 cursor-pointer touch-none items-center outline-none"
        >
          <div className="relative h-1 w-full rounded-full bg-[#e5e7eb] dark:bg-white/20">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-green"
              style={{ width: `${progressRatio * 100}%` }}
            />
            <div
              className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-green transition-transform group-focus-visible:ring-2 group-focus-visible:ring-green/50 ${
                isScrubbing ? "scale-150" : "group-hover:scale-125"
              }`}
              style={{ left: `${progressRatio * 100}%` }}
            />
            {isScrubbing && (
              <div
                className="pointer-events-none absolute bottom-full mb-3 -translate-x-1/2 rounded bg-black px-1.5 py-0.5 font-sans text-xs font-medium tabular-nums text-white"
                style={{ left: `${progressRatio * 100}%` }}
              >
                {formatTime(displayTime)}
              </div>
            )}
          </div>
        </div>
        <span className="font-sans text-xs font-medium text-black dark:text-cream">
          {formatTime(shownDuration)}
        </span>
      </div>

      <div className="mt-3.5 flex items-center justify-center gap-7">
        <button
          type="button"
          onClick={() => seekBy(-10)}
          aria-label={t.rewind}
          className="cursor-pointer text-green"
        >
          <SkipBack size={20} strokeWidth={2} fill="currentColor" />
        </button>
        <button
          type="button"
          aria-label={isPlaying ? t.pause : t.play}
          onClick={togglePlay}
          className="flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-full border-2 border-green text-green"
        >
          {isPlaying ? (
            <Pause size={18} strokeWidth={2} fill="currentColor" />
          ) : (
            <Play size={18} strokeWidth={2} fill="currentColor" />
          )}
        </button>
        <button
          type="button"
          onClick={() => seekBy(10)}
          aria-label={t.forward}
          className="cursor-pointer text-green"
        >
          <SkipForward size={20} strokeWidth={2} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
