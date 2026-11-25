"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryGrid } from "@/components/category-grid";
import { MenuDrawer } from "@/components/menu-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, type ViewMode } from "@/components/site-header";
import { categories } from "@/data/categories";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => category.title.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <>
      <SiteHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenMenu={() => setIsMenuOpen(true)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      <main
        className={
          viewMode === "grid"
            ? "flex flex-1 flex-col justify-center overflow-hidden sm:block sm:overflow-visible"
            : "flex-1"
        }
      >
        {filteredCategories.length > 0 ? (
          <CategoryGrid viewMode={viewMode} categories={filteredCategories} />
        ) : (
          <p className="px-4 py-10 text-center font-sans text-sm text-black/60 dark:text-cream/60 sm:px-7">
            No se encontraron categorías para &quot;{searchQuery}&quot;.
          </p>
        )}
      </main>
      <SiteFooter isDark={isDark} onToggleDark={() => setIsDark((value) => !value)} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
