import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleDetailView } from "@/components/article-detail-view";
import {
  getArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getCategoryBySlug,
  toDirectMediaUrl,
  type Article,
} from "@/lib/cms";
import { articleTitle } from "@/lib/cms/labels";
import { inferMediaTypeFromUrl } from "@/lib/cms/media-type";
import { categoryPath } from "@/lib/cms/paths";

function withDirectUrls(article: Article): Article {
  return {
    ...article,
    wikimediaUrl: article.wikimediaUrl ? toDirectMediaUrl(article.wikimediaUrl) : null,
    mediaItems: article.mediaItems.map((item) => ({
      ...item,
      url: toDirectMediaUrl(item.url),
    })),
  };
}

export const dynamic = "force-dynamic";

// Título y descripción de la pestaña y de las tarjetas de redes salen de seo_title_custom y seo_description del CMS.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>;
}): Promise<Metadata> {
  const { itemId } = await params;
  const found = await getArticleBySlug(itemId);
  if (!found) return {};

  const article = withDirectUrls(found);
  const title = articleTitle(article);
  const description = article.seoDescription ?? undefined;
  const image =
    article.coverUrl ??
    article.mediaItems.find((item) => item.type === "imagen")?.url ??
    (article.wikimediaUrl && inferMediaTypeFromUrl(article.wikimediaUrl) === "imagen" ? article.wikimediaUrl : null);
  const images = image ? [image] : undefined;

  return {
    title,
    description,
    openGraph: { type: "article", title, description, images },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>;
}) {
  const { slug, itemId } = await params;

  const [category, article, categoryArticles, allArticles] = await Promise.all([
    getCategoryBySlug(slug),
    getArticleBySlug(itemId),
    getArticlesByCategory(slug),
    getArticles(),
  ]);

  if (!category || !article || article.categoriaSlug !== category.slug) notFound();
  // Si la URL trae slugs de otro idioma, se lleva a la del idioma actual.
  if (category.slug !== slug || article.slug !== itemId) redirect(categoryPath(category.slug, article.slug));

  const relatedArticles = categoryArticles.filter((item) => item.id !== article.id).slice(0, 5);

  return (
    <ArticleDetailView
      article={withDirectUrls(article)}
      category={category}
      relatedArticles={relatedArticles.map(withDirectUrls)}
      suggestions={allArticles.map((item) => ({
        title: articleTitle(item),
        href: categoryPath(item.categoriaSlug, item.slug),
      }))}
    />
  );
}
