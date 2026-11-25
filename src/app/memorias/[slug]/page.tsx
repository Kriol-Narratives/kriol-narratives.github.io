import { notFound, redirect } from "next/navigation";
import { MemoriaDetailView } from "@/components/memorias-view";
import { getMemoriaBySlug, getMemoriaHtml, getMemorias, getRelatedMemorias } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function MemoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const memoria = await getMemoriaBySlug(slug);
  if (!memoria) notFound();
  // Si la URL trae el slug de otro idioma, se lleva a la del idioma actual.
  if (memoria.slug !== slug) redirect(`/memorias/${memoria.slug}`);

  const [html, all] = await Promise.all([getMemoriaHtml(memoria), getMemorias()]);
  return <MemoriaDetailView memoria={memoria} html={html} related={getRelatedMemorias(memoria, all)} />;
}
