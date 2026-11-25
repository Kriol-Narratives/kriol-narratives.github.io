import { HomeView } from "@/components/home-view";
import { getArticles, getCategories } from "@/lib/cms";
import { articleTitle } from "@/lib/cms/labels";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, articles] = await Promise.all([getCategories(), getArticles()]);
  // Only what the home search needs, so the page doesn't ship every article's full record.
  const searchableArticles = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    categorySlug: article.categoriaSlug,
    title: articleTitle(article),
    tipo: article.tipo,
    keywords: article.keywords,
    coverUrl: article.coverUrl,
    wikimediaUrl: article.wikimediaUrl,
    mediaItems: article.mediaItems.map(({ type, url }) => ({ type, url })),
  }));
  return <HomeView categories={categories} articles={searchableArticles} />;
}
