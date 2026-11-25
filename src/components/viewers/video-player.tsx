"use client";

import { Maximize2, Pause, Play, Share2, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  posterImage,
  src = "/media/sample-video.mp4",
}: {
  posterImage: string;
  src?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    if (video.readyState >= 1) onDurationChange();
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  function seekBy(delta: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), video.duration || 0);
  }

  function seekToRatio(ratio: number) {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = ratio * duration;
  }

  function ratioFromEvent(event: { clientX: number }, rect: DOMRect) {
    return Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  }

  function handleProgressPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const bar = event.currentTarget;
    const rect = bar.getBoundingClientRect();
    bar.setPointerCapture(event.pointerId);
    seekToRatio(ratioFromEvent(event, rect));

    function onMove(moveEvent: PointerEvent) {
      seekToRatio(ratioFromEvent(moveEvent, rect));
    }
    function onUp() {
      bar.removeEventListener("pointermove", onMove);
      bar.removeEventListener("pointerup", onUp);
    }
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onUp);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }

  const progressRatio = duration ? currentTime / duration : 0;

  return (
    <div ref={containerRef} className="w-full max-w-[600px]">
      <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
        <video
          ref={videoRef}
          src={src}
          poster={posterImage}
          onClick={togglePlay}
          className="h-full w-full cursor-pointer object-contain"
        />
      </div>

      <div className="-mt-9 mr-1 flex justify-end gap-3 relative z-10">
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Pantalla completa"
          className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded bg-white/90 text-black"
        >
          <Maximize2 size={13} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Compartir"
          className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded bg-white/90 text-black"
        >
          <Share2 size={13} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <span className="font-sans text-xs font-medium text-black dark:text-cream">
          {formatTime(currentTime)}
        </span>
        <div
          onPointerDown={handleProgressPointerDown}
          className="group relative h-1 flex-1 cursor-pointer touch-none rounded-full bg-[#e5e7eb] dark:bg-white/20"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-green"
            style={{ width: `${progressRatio * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-green transition-transform group-active:scale-125"
            style={{ left: `${progressRatio * 100}%` }}
          />
        </div>
        <span className="font-sans text-xs font-medium text-black dark:text-cream">
          {formatTime(duration)}
        </span>
      </div>

      <div className="mt-3.5 flex items-center justify-center gap-7">
        <button
          type="button"
          onClick={() => seekBy(-10)}
          aria-label="Retroceder 10 segundos"
          className="cursor-pointer text-green"
        >
          <SkipBack size={20} strokeWidth={2} fill="currentColor" />
        </button>
        <button
          type="button"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
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
          aria-label="Adelantar 10 segundos"
          className="cursor-pointer text-green"
        >
          <SkipForward size={20} strokeWidth={2} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
