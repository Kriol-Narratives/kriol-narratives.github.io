"use client";

import { useMemo, useState } from "react";
import { ArticleFilters } from "@/components/cms/article-filters";
import { ArticleGrid } from "@/components/cms/article-grid";
import { MenuDrawer } from "@/components/menu-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, type ViewMode } from "@/components/site-header";
import type { Article, ArticleType, Category } from "@/lib/cms";
import { useCategoryTitle, useText } from "@/lib/i18n/client";
import { useDarkMode } from "@/lib/theme";
import { categoryPath } from "@/lib/cms/paths";

function splitAuthors(value: string | null) {
  return value ? value.split(";").map((author) => author.trim()).filter(Boolean) : [];
}

export function CategoryResultsView({
  category,
  articles,
}: {
  category: Category;
  articles: Article[];
}) {
  const displayTitle = useCategoryTitle();
  const TEXT = useText();
  const t = TEXT.Category;
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const [keyword, setKeyword] = useState("");
  const [selectedTipos, setSelectedTipos] = useState<ArticleType[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);


  function toggleValue<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  }

  const authorOptions = useMemo(
    () => [...new Set(articles.flatMap((article) => splitAuthors(article.autoria)))].sort(),
    [articles],
  );
  const yearOptions = useMemo(
    () =>
      [
        ...new Set(
          articles.flatMap((article) =>
            article.fechaPublicacion ? [String(article.fechaPublicacion.getUTCFullYear())] : [],
          ),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return articles.filter((article) => {
      if (selectedTipos.length > 0 && !selectedTipos.includes(article.tipo)) return false;
      if (selectedAuthors.length > 0) {
        const authors = splitAuthors(article.autoria);
        if (!selectedAuthors.some((author) => authors.includes(author))) return false;
      }
      if (selectedYears.length > 0) {
        const year = article.fechaPublicacion
          ? String(article.fechaPublicacion.getUTCFullYear())
          : null;
        if (!year || !selectedYears.includes(year)) return false;
      }
      if (query) {
        const haystack = [article.seoTitle ?? article.slug, article.seoDescription ?? "", ...article.keywords]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [articles, keyword, selectedTipos, selectedAuthors, selectedYears]);

  return (
    <>
      <SiteHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        modes={[]}
        back={{ href: "/", label: t.backHome }}
        onOpenMenu={() => setIsMenuOpen(true)}
        searchQuery={keyword}
        onSearchQueryChange={setKeyword}
      />
      <main className="flex-1">
        <div className="px-4 pt-6 sm:px-7">
          <h1 className="font-display text-3xl sm:text-4xl dark:text-cream">
            {displayTitle(category)}
          </h1>
        </div>
        <div className="mt-6">
          <ArticleFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            selectedTipos={selectedTipos}
            onToggleTipo={(tipo) => toggleValue(setSelectedTipos, tipo)}
            authorOptions={authorOptions}
            selectedAuthors={selectedAuthors}
            onToggleAuthor={(author) => toggleValue(setSelectedAuthors, author)}
            yearOptions={yearOptions}
            selectedYears={selectedYears}
            onToggleYear={(year) => toggleValue(setSelectedYears, year)}
            resultsCount={filteredArticles.length}
            totalCount={articles.length}
          />
          {filteredArticles.length > 0 ? (
            <ArticleGrid
              articles={filteredArticles}
              viewMode={viewMode}
              basePath={categoryPath(category.slug)}
            />
          ) : (
            <p className="px-4 py-10 text-center font-sans text-sm text-black/60 dark:text-cream/60 sm:px-7">
              {t.noArticles}
            </p>
          )}
        </div>
      </main>
      <SiteFooter isDark={isDark} onToggleDark={toggleDark} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
