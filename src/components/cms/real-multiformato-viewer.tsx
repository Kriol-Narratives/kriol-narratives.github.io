"use client";

import { useEffect, useState } from "react";
import { AudioPlayer } from "@/components/viewers/audio-player";
import { DocumentViewer } from "@/components/viewers/document-viewer";
import { PhotoGallery } from "@/components/viewers/photo-gallery";
import { VideoPlayer } from "@/components/viewers/video-player";
import type { MediaItem, MediaType } from "@/lib/cms/types";
import { useText } from "@/lib/i18n/client";

const TAB_ORDER: MediaType[] = ["video", "imagen", "audio", "documento"];

export function RealMultiformatoViewer({
  mediaItems,
  onActiveMediaChange,
}: {
  mediaItems: MediaItem[];
  /** Reports the file on screen (the selected tab and, in images, the selected picture) so the metadata follows it. */
  onActiveMediaChange?: (item: MediaItem | null) => void;
}) {
  const TEXT = useText();
  const t = TEXT.MediaTabs;
  const tCommon = TEXT.Common;
  const availableTabs = TAB_ORDER.filter((type) => mediaItems.some((item) => item.type === type));
  const [activeTab, setActiveTab] = useState<MediaType | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const currentTab = activeTab && availableTabs.includes(activeTab) ? activeTab : (availableTabs[0] ?? null);
  const itemsForTab = mediaItems.filter((item) => item.type === currentTab);
  const activeItem = currentTab === "imagen" ? (itemsForTab[imageIndex] ?? itemsForTab[0]) : itemsForTab[0];

  useEffect(() => {
    onActiveMediaChange?.(activeItem ?? null);
  }, [activeItem, onActiveMediaChange]);

  if (availableTabs.length === 0 || !currentTab) {
    return (
      <div className="flex h-[300px] w-full max-w-[600px] items-center justify-center bg-[#f0f0f0] font-sans text-xs text-black/50">
        {tCommon.noContent}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px]">
      <div className="mb-5 flex justify-center gap-9 border-b border-[#e0e0e0] dark:border-white/20">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setImageIndex(0);
            }}
            className={`relative cursor-pointer pb-3.5 font-sans text-xs font-bold uppercase tracking-wide ${
              currentTab === tab
                ? "text-black after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-green dark:text-cream"
                : "text-black/40 dark:text-cream/40"
            }`}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {/* Fixed-height area: switching tabs recentres the file without moving the tab bar. */}
      <div className="flex flex-col items-center justify-center md:min-h-[640px]">
        {currentTab === "video" && <VideoPlayer src={itemsForTab[0].url} />}
        {currentTab === "audio" && <AudioPlayer src={itemsForTab[0].url} />}
        {currentTab === "documento" && <DocumentViewer fileUrl={itemsForTab[0].url} />}
        {currentTab === "imagen" && <PhotoGallery images={itemsForTab.map((item) => item.url)} onActiveChange={setImageIndex} />}
      </div>
    </div>
  );
}
