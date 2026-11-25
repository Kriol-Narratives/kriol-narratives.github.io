"use client";

import { useState } from "react";
import { ArticleMetadataPanel } from "@/components/cms/article-metadata-panel";
import { RealMultiformatoViewer } from "@/components/cms/real-multiformato-viewer";
import { RelatedArticles } from "@/components/cms/related-articles";
import { DetailHeader } from "@/components/detail-header";
import { MenuDrawer } from "@/components/menu-drawer";
import { SiteFooter } from "@/components/site-footer";
import { AudioPlayer } from "@/components/viewers/audio-player";
import { DocumentViewer } from "@/components/viewers/document-viewer";
import { PhotoGallery } from "@/components/viewers/photo-gallery";
import { VideoPlayer } from "@/components/viewers/video-player";
import { articleTitle } from "@/lib/cms/labels";
import type { Article, Category, MediaItem } from "@/lib/cms/types";
import { useCategoryTitle, useText } from "@/lib/i18n/client";
import { useDarkMode } from "@/lib/theme";
import { categoryPath } from "@/lib/cms/paths";

function NoMediaPlaceholder() {
  const TEXT = useText();
  const t = TEXT.Common;
  return (
    <div className="flex h-[300px] w-full max-w-[480px] items-center justify-center bg-[#f0f0f0] font-sans text-xs text-black/50">
      {t.noContent}
    </div>
  );
}

export function ArticleDetailView({
  article,
  category,
  relatedArticles,
  suggestions,
}: {
  article: Article;
  category: Category;
  relatedArticles: Article[];
  suggestions: { title: string; href: string }[];
}) {
  const displayTitle = useCategoryTitle();
  const TEXT = useText();
  const t = TEXT.Category;
  const tArticle = TEXT.Article;
  const categoryTitle = displayTitle(category);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [multiformatoMedia, setMultiformatoMedia] = useState<MediaItem | null>(null);
  const galleryItems = article.mediaItems.filter((item) => item.type === "imagen");


  return (
    <>
      <DetailHeader
        back={{
          href: categoryPath(category.slug),
          label: categoryTitle,
          ariaLabel: t.backTo({ category: categoryTitle }),
        }}
        onOpenMenu={() => setIsMenuOpen(true)}
        suggestions={suggestions}
      />
      <main className="flex-1">
        <div className="grid grid-cols-1 gap-9 px-4 py-6 sm:px-7 lg:grid-cols-[1fr_320px]">
          <div className="h-full">
            <div className="grid h-full grid-cols-1 gap-9 lg:grid-cols-[240px_1fr]">
              <aside className="self-start">
                <p className="mb-2.5 font-sans text-xs font-bold uppercase tracking-wide text-black dark:text-cream">
                  {categoryTitle}
                </p>
                <h1 className="mb-4 font-display text-3xl leading-[1.15] dark:text-cream">
                  {articleTitle(article)}
                </h1>
                {article.autoria && (
                  <p className="mb-1.5 font-sans text-xs text-black dark:text-cream">
                    <strong>{tArticle.authors}</strong>{" "}
                    <span className="text-green">
                      {article.autoria.split(";").map((a) => a.trim()).filter(Boolean).join(", ")}
                    </span>
                  </p>
                )}
                {article.fechaPublicacion && (
                  <p className="font-sans text-xs text-black dark:text-cream">
                    <strong>{tArticle.date}</strong> {article.fechaPublicacion.getUTCFullYear()}
                  </p>
                )}
              </aside>

              <div className="flex items-center justify-center">
                {article.tipo === "documento" && <DocumentViewer fileUrl={article.wikimediaUrl} />}
                {article.tipo === "audio" &&
                  (article.wikimediaUrl ? (
                    <AudioPlayer coverImage={article.coverUrl} src={article.wikimediaUrl} />
                  ) : (
                    <NoMediaPlaceholder />
                  ))}
                {article.tipo === "video" &&
                  (article.wikimediaUrl ? (
                    <VideoPlayer posterImage={article.coverUrl} src={article.wikimediaUrl} />
                  ) : (
                    <NoMediaPlaceholder />
                  ))}
                {article.tipo === "galeria" && (
                  <PhotoGallery
                    onActiveChange={setGalleryIndex}
                    images={
                      galleryItems.length > 0
                        ? galleryItems.map((item) => item.url)
                        : article.wikimediaUrl
                          ? [article.wikimediaUrl]
                          : []
                    }
                  />
                )}
                {article.tipo === "multiformato" && (
                  <RealMultiformatoViewer mediaItems={article.mediaItems} onActiveMediaChange={setMultiformatoMedia} />
                )}
              </div>
            </div>

          </div>

          <ArticleMetadataPanel
            article={article}
            activeMedia={
              article.tipo === "galeria"
                ? (galleryItems[galleryIndex] ?? null)
                : article.tipo === "multiformato"
                  ? multiformatoMedia
                  : null
            }
          />
        </div>

        <div className="mx-4 h-px bg-[#e0e0e0] sm:mx-7 dark:bg-white/20" />
        <RelatedArticles articles={relatedArticles} categorySlug={category.slug} />
      </main>
      <SiteFooter isDark={isDark} onToggleDark={toggleDark} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
