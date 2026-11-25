"use client";

import { useState } from "react";
import { AudioPlayer } from "./audio-player";
import { DocumentViewer } from "./document-viewer";
import { PhotoGallery } from "./photo-gallery";
import { VideoPlayer } from "./video-player";

const TABS = [
  { key: "video", label: "Video" },
  { key: "imagen", label: "Imágen" },
  { key: "sonido", label: "Sonido" },
  { key: "documento", label: "Documento" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function MultiformatoViewer({ images }: { images: string[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("video");

  return (
    <div className="w-full max-w-[600px]">
      <div className="mb-5 flex justify-center gap-9 border-b border-[#e0e0e0] dark:border-white/20">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative cursor-pointer pb-3.5 font-sans text-xs font-bold uppercase tracking-wide ${
              activeTab === tab.key
                ? "text-black after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-green dark:text-cream"
                : "text-black/40 dark:text-cream/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "video" && <VideoPlayer posterImage={images[0]} />}
      {activeTab === "imagen" && <PhotoGallery images={images} />}
      {activeTab === "sonido" && <AudioPlayer coverImage={images[0]} />}
      {activeTab === "documento" && <DocumentViewer />}
    </div>
  );
}
