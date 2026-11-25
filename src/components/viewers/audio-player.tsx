"use client";

import { Pause, Play, Share2, SkipBack, SkipForward } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  coverImage,
  src = "/media/sample-audio.mp3",
}: {
  coverImage: string;
  src?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    if (audio.readyState >= 1) onDurationChange();
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }

  function seekBy(delta: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), audio.duration || 0);
  }

  function seekToRatio(ratio: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = ratio * duration;
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

  const progressRatio = duration ? currentTime / duration : 0;

  return (
    <div className="w-full max-w-[480px]">
      <audio ref={audioRef} src={src} />

      <div className="relative aspect-square w-full overflow-hidden rounded">
        <Image src={coverImage} alt="" fill className="object-cover" />
      </div>

      <div className="mt-2.5 flex justify-end">
        <button type="button" aria-label="Compartir" className="cursor-pointer text-black dark:text-cream">
          <Share2 size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
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
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-green shadow-[0_0_0_1px_var(--color-green)] transition-transform group-active:scale-125"
            style={{ left: `${progressRatio * 100}%` }}
          />
        </div>
        <span className="font-sans text-xs font-medium text-black dark:text-cream">
          {formatTime(duration)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => seekBy(-10)}
          aria-label="Retroceder 10 segundos"
          className="cursor-pointer text-green"
        >
          <SkipBack size={22} strokeWidth={2} fill="currentColor" />
        </button>
        <button
          type="button"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          onClick={togglePlay}
          className="cursor-pointer text-green"
        >
          {isPlaying ? (
            <Pause size={22} strokeWidth={2} fill="currentColor" />
          ) : (
            <Play size={22} strokeWidth={2} fill="currentColor" />
          )}
        </button>
        <button
          type="button"
          onClick={() => seekBy(10)}
          aria-label="Adelantar 10 segundos"
          className="cursor-pointer text-green"
        >
          <SkipForward size={22} strokeWidth={2} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
