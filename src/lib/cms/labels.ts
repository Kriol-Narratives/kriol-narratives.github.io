import type { ArticleType } from "./types";

// Display names live in Messages.ArticleTypes in src/lib/i18n/es.ts.
export const ARTICLE_TYPES: ArticleType[] = ["documento", "audio", "video", "galeria", "multiformato"];

export function articleTitle(article: { seoTitle: string | null; slug: string }): string {
  if (article.seoTitle) return article.seoTitle;
  return article.slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
