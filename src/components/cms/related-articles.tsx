"use client";

import { ArticleVisual } from "@/components/cms/article-visual";
import { articleTitle } from "@/lib/cms/labels";
import type { Article } from "@/lib/cms/types";
import Link from "next/link";
import { useText } from "@/lib/i18n/client";
import { categoryPath } from "@/lib/cms/paths";

export function RelatedArticles({
  articles,
  categorySlug,
  compact = false,
}: {
  articles: Article[];
  categorySlug: string;
  compact?: boolean;
}) {
  const TEXT = useText();
  const t = TEXT.Common;
  const tTypes = TEXT.ArticleTypes;
  const tArticle = TEXT.Article;

  if (articles.length === 0) return null;

  return (
    <section className={compact ? "px-2 py-8" : "px-4 py-10 sm:px-7"}>
      <h2 className="mb-5 font-display text-2xl text-brown-dark dark:text-cream">{t.relatedItems}</h2>
      <ul
        className={
          compact
            ? "grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-5"
            : "grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3 sm:gap-y-6 lg:grid-cols-5"
        }
      >
        {articles.map((article) => (
          <li
            key={article.id}
            className={`group ${compact ? "" : "border-b border-[#e0e0e0] pb-4 last:border-0 sm:border-0 sm:pb-0 dark:border-white/20"}`}
          >
            <Link
              href={categoryPath(categorySlug, article.slug)}
              className={compact ? "" : "flex items-center gap-4 sm:block"}
            >
              <ArticleVisual
                article={article}
                className={`aspect-[4/3] rounded-sm shadow-md transition duration-300 group-hover:scale-105 group-hover:shadow-lg ${
                  compact ? "w-full" : "w-28 shrink-0 sm:w-full"
                }`}
              />
              <span className="min-w-0">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wide text-brown-dark sm:mt-3 dark:text-cream">
                  {tTypes[article.tipo]}
                </span>
                {article.autoria && (
                  <span className="mt-1 block font-sans text-xs text-green sm:hidden">
                    {article.autoria.split(";").map((a) => a.trim()).filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="mt-1 block font-display text-base leading-tight text-black transition-colors group-hover:text-green dark:text-cream">
                  {articleTitle(article)}
                </span>
                {article.autoria && (
                  <>
                    {/* Móvil: autor (solo nombres, verde) entre el tipo y el título; escritorio: "Autoría(s):" después del título. */}
                    <span className="mt-1 hidden font-sans text-xs text-brown-dark sm:block dark:text-cream">
                      {tArticle.authors}{" "}
                      <span className="text-green">{article.autoria.split(";").map((a) => a.trim()).filter(Boolean).join(", ")}</span>
                    </span>
                  </>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
