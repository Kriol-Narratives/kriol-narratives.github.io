"use client";

import Link from "next/link";
import { ArticleVisual } from "@/components/cms/article-visual";
import { articleTitle } from "@/lib/cms/labels";
import type { Article } from "@/lib/cms/types";
import type { ViewMode } from "@/components/site-header";
import { useText } from "@/lib/i18n/client";

function Authors({ value }: { value: string | null }) {
  const TEXT = useText();
  const t = TEXT.Article;
  if (!value) return null;
  return (
    <span className="mt-1 block font-sans text-xs font-light text-black dark:text-cream">
      {t.authors} <span className="text-green">{value.split(";").map((a) => a.trim()).filter(Boolean).join(", ")}</span>
    </span>
  );
}

export function ArticleGrid({
  articles,
  viewMode,
  basePath,
}: {
  articles: Article[];
  viewMode: ViewMode;
  basePath: string;
}) {
  const TEXT = useText();
  const tTypes = TEXT.ArticleTypes;

  if (viewMode === "list") {
    return (
      <ul className="flex flex-col px-4 sm:px-7">
        {articles.map((article) => (
          <li key={article.id} className="border-b border-[#e0e0e0] dark:border-white/20">
            <Link href={`${basePath}/${article.slug}`} className="flex gap-4 py-3">
              <ArticleVisual article={article} className="h-20 w-28 shrink-0 rounded-sm" />
              <div className="flex flex-col justify-center gap-1">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wide text-green">
                  {tTypes[article.tipo]}
                </span>
                <span className="font-display text-base leading-tight text-brown-dark dark:text-cream">
                  {articleTitle(article)}
                </span>
                <Authors value={article.autoria} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-x-5 gap-y-4 px-4 py-6 sm:grid-cols-3 sm:gap-y-6 sm:px-7 lg:grid-cols-5">
      {articles.map((article) => (
        <li key={article.id} className="group border-b border-[#e0e0e0] pb-4 sm:border-0 sm:pb-0 dark:border-white/20">
          {/* En móvil cada resultado es una fila (miniatura a la izquierda); desde sm vuelve a la tarjeta. */}
          <Link href={`${basePath}/${article.slug}`} className="flex gap-4 sm:block">
            <ArticleVisual
              article={article}
              className="aspect-[231/131] w-28 shrink-0 self-start rounded-sm shadow-md transition duration-300 group-hover:shadow-lg sm:w-full sm:group-hover:scale-105"
            />
            <span className="min-w-0">
            <span className="block font-sans sm:mt-3 text-[11px] font-bold uppercase tracking-wide text-green">
              {tTypes[article.tipo]}
            </span>
            <span className="mt-1 block font-display text-base leading-tight text-brown-dark transition-colors group-hover:text-green dark:text-cream dark:group-hover:text-green">
              {articleTitle(article)}
            </span>
            <Authors value={article.autoria} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
