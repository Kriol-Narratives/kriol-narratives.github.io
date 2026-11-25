"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MenuDrawer } from "@/components/menu-drawer";
import { PaginationBar } from "@/components/pagination-bar";
import { ResultsFilters } from "@/components/results-filters";
import { ResultsGrid } from "@/components/results-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, type ViewMode } from "@/components/site-header";
import { categories } from "@/data/categories";
import { filterResults, getResultsForCategory } from "@/data/results";

export default function CategoryResultsPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((item) => item.slug === slug);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Record<string, string[]>>({
    medio: [],
    autoria: [],
    fechas: [],
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  if (!category) {
    notFound();
  }

  const results = useMemo(() => getResultsForCategory(), []);
  const filteredResults = useMemo(
    () => filterResults(results, { keyword, selected }),
    [results, keyword, selected],
  );

  function toggleOption(groupKey: string, option: string) {
    setSelected((prev) => {
      const current = prev[groupKey] ?? [];
      const next = current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option];
      return { ...prev, [groupKey]: next };
    });
  }

  return (
    <>
      <SiteHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenMenu={() => setIsMenuOpen(true)}
        searchQuery={keyword}
        onSearchQueryChange={setKeyword}
      />
      <main className="flex-1">
        <div className="px-4 pt-6 sm:px-7">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded font-sans text-xs font-semibold uppercase text-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            home
          </Link>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl dark:text-cream">
            {category.title}
          </h1>
        </div>
        <div className="mt-6">
          <ResultsFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            selected={selected}
            onToggleOption={toggleOption}
            resultsCount={filteredResults.length}
            totalCount={results.length}
          />
          <ResultsGrid
            items={filteredResults}
            viewMode={viewMode}
            basePath={`/categoria/${category.slug}`}
          />
          <PaginationBar />
        </div>
      </main>
      <SiteFooter isDark={isDark} onToggleDark={() => setIsDark((value) => !value)} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
