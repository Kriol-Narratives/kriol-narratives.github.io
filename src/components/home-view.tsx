"use client";

import { useMemo, useState } from "react";
import { CardCollection, CategoryGrid } from "@/components/category-grid";
import { MenuDrawer } from "@/components/menu-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, type ViewMode } from "@/components/site-header";
import { ArticleVisual } from "@/components/cms/article-visual";
import type { ArticleType, Category, MediaItem } from "@/lib/cms";
import { categoryPath } from "@/lib/cms/paths";
import { useCategoryTitle, useText } from "@/lib/i18n/client";
import { useDarkMode } from "@/lib/theme";

export type SearchableArticle = {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  tipo: ArticleType;
  keywords: string[];
  coverUrl: string | null;
  wikimediaUrl: string | null;
  mediaItems: MediaItem[];
};

export function HomeView({
  categories,
  articles,
}: {
  categories: Category[];
  articles: SearchableArticle[];
}) {
  const TEXT = useText();
  const t = TEXT.Home;
  const displayTitle = useCategoryTitle();
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const [searchQuery, setSearchQuery] = useState("");


  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      displayTitle(category).toLowerCase().includes(query),
    );
  }, [categories, searchQuery, displayTitle]);

  const matchingArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const categoryTitles = new Map(categories.map((category) => [category.slug, displayTitle(category)]));
    // Una categoría que coincide trae también sus artículos.
    return articles.filter((article) =>
      [article.title, categoryTitles.get(article.categorySlug) ?? "", ...article.keywords].some((text) =>
        text.toLowerCase().includes(query),
      ),
    );
  }, [articles, categories, searchQuery, displayTitle]);

  const isSearching = searchQuery.trim() !== "";

  return (
    <>
      <SiteHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        modes={["grid", "carousel"]}
        onOpenMenu={() => setIsMenuOpen(true)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      <main
        className={
          viewMode === "carousel" && !isSearching
            ? "flex flex-1 flex-col justify-center overflow-hidden"
            : "flex-1"
        }
      >
        {filteredCategories.length > 0 && (
          <>
            {isSearching && (
              <h2 className="px-4 pt-6 font-display text-xl dark:text-cream sm:px-7">{t.categoriesResults}</h2>
            )}
            <CategoryGrid viewMode={viewMode} categories={filteredCategories} alignStart={isSearching} />
          </>
        )}
        {matchingArticles.length > 0 && (
          <section>
            <h2 className="px-4 pt-2 font-display text-xl dark:text-cream sm:px-7">{t.articlesResults}</h2>
            {/* Los artículos usan las mismas tarjetas y la misma vista (tira o cuadrícula) que las categorías. */}
            <CardCollection
              viewMode={viewMode === "grid" ? "grid" : "carousel"}
              alignStart
              entries={matchingArticles.map((article) => ({
                key: article.id,
                href: categoryPath(article.categorySlug, article.slug),
                title: article.title,
                description: TEXT.ArticleTypes[article.tipo],
                visual: <ArticleVisual article={article} className="aspect-square w-full" />,
              }))}
            />
          </section>
        )}
        {isSearching && filteredCategories.length === 0 && matchingArticles.length === 0 && (
          <p className="px-4 py-10 text-center font-sans text-sm text-black/60 dark:text-cream/60 sm:px-7">
            {t.noResults({ query: searchQuery })}
          </p>
        )}
      </main>
      <SiteFooter isDark={isDark} onToggleDark={toggleDark} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
