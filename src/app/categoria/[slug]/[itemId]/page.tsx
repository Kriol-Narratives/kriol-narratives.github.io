"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuDrawer } from "@/components/menu-drawer";
import { MetadataPanel } from "@/components/metadata-panel";
import { RelatedItems } from "@/components/related-items";
import { SiteFooter } from "@/components/site-footer";
import { DetailHeader } from "@/components/detail-header";
import { AudioPlayer } from "@/components/viewers/audio-player";
import { DocumentViewer } from "@/components/viewers/document-viewer";
import { MultiformatoViewer } from "@/components/viewers/multiformato-viewer";
import { PhotoGallery } from "@/components/viewers/photo-gallery";
import { VideoPlayer } from "@/components/viewers/video-player";
import { getStory } from "@/data/story";

export default function StoryPage() {
  const { slug, itemId } = useParams<{ slug: string; itemId: string }>();
  const story = getStory(slug, itemId);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  if (!story) {
    notFound();
  }

  return (
    <>
      <DetailHeader onOpenMenu={() => setIsMenuOpen(true)} />
      <main className="flex-1">
        <div className="flex items-center gap-2 px-4 pt-5 sm:px-7">
          <Link
            href={`/categoria/${story.categorySlug}`}
            aria-label={`Volver a ${story.categoryTitle}`}
            className="rounded text-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </Link>
          <Link
            href={`/categoria/${story.categorySlug}`}
            className="font-sans text-xs font-bold uppercase tracking-wide text-black dark:text-cream"
          >
            {story.categoryTitle}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-9 px-4 py-6 sm:px-7 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            <div className="grid grid-cols-1 gap-9 lg:grid-cols-[240px_1fr]">
              <aside>
                <p className="mb-2.5 font-sans text-xs font-bold uppercase tracking-wide text-black dark:text-cream">
                  {story.categoryTitle}
                </p>
                <h1 className="mb-4 font-display text-3xl leading-[1.15] dark:text-cream">
                  {story.title}
                </h1>
                <p className="mb-1.5 font-sans text-[13px] text-black dark:text-cream">
                  <span className="font-bold">Autoría(s):</span> {story.author}
                </p>
                <p className="font-sans text-[13px] text-black dark:text-cream">
                  <span className="font-bold">Fecha:</span> {story.date}
                </p>
              </aside>

              <div className="flex justify-center">
                {story.mediaType === "documento" && <DocumentViewer />}
                {story.mediaType === "audio" && <AudioPlayer coverImage={story.images[0]} />}
                {story.mediaType === "video" && <VideoPlayer posterImage={story.images[0]} />}
                {story.mediaType === "imagen" && <PhotoGallery images={story.images} />}
                {story.mediaType === "multiformato" && (
                  <MultiformatoViewer images={story.images} />
                )}
              </div>
            </div>

            <div className="mt-8 mb-2 h-px bg-[#e0e0e0] dark:bg-white/20" />

            <RelatedItems compact />
          </div>

          <MetadataPanel story={story} />
        </div>
      </main>
      <SiteFooter isDark={isDark} onToggleDark={() => setIsDark((value) => !value)} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
