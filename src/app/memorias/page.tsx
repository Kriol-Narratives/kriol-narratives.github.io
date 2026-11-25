"use client";

import { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { DetailHeader } from "@/components/detail-header";
import { MenuDrawer } from "@/components/menu-drawer";
import { PaginationBar } from "@/components/pagination-bar";
import { ResultsFilters } from "@/components/results-filters";
import { ResultsGrid } from "@/components/results-grid";
import { SiteFooter } from "@/components/site-footer";
import { filterResults, getResultsForCategory } from "@/data/results";

export default function MemoriasPage() {
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

  const results = useMemo(() => getResultsForCategory(10), []);
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
      <DetailHeader
        onOpenMenu={() => setIsMenuOpen(true)}
        searchValue={keyword}
        onSearchChange={setKeyword}
      />
      <div className="flex flex-1 flex-col bg-cream">
        <Breadcrumb href="/" label="Home" />
        <h1 className="px-4 pt-2 font-display text-3xl dark:text-cream sm:px-7">Memoria</h1>
        <main className="mt-6 flex-1">
          <ResultsFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            selected={selected}
            onToggleOption={toggleOption}
            resultsCount={filteredResults.length}
            totalCount={results.length}
          />
          <ResultsGrid items={filteredResults} viewMode="grid" basePath="/memorias" />
          <PaginationBar />
        </main>
        <SiteFooter isDark={isDark} onToggleDark={() => setIsDark((value) => !value)} />
      </div>
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
