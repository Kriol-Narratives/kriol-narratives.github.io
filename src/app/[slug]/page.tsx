import { notFound, redirect } from "next/navigation";
import { CategoryResultsView } from "@/components/category-results-view";
import { InstitucionalView } from "@/components/institucional-view";
import { getArticlesByCategory, getCategoryBySlug, getInstitucionalBySlug } from "@/lib/cms";
import { categoryPath } from "@/lib/cms/paths";

export const dynamic = "force-dynamic";

export default async function CategoryResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    // No es una categoría: puede ser una página institucional (nosotros, aliados, contacto, créditos…).
    const page = await getInstitucionalBySlug(slug);
    if (!page) notFound();
    if (page.slug !== slug) redirect(`/${page.slug}`);
    return <InstitucionalView page={page} />;
  }
  // Si la URL trae el slug de otro idioma, se lleva a la del idioma actual.
  if (category.slug !== slug) redirect(categoryPath(category.slug));

  const articles = await getArticlesByCategory(slug);

  return <CategoryResultsView category={category} articles={articles} />;
}
