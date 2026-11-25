import { notFound } from "next/navigation";
import { InstitucionalView } from "@/components/institucional-view";
import { getInstitucionalBySlug } from "@/lib/cms";

export const dynamic = "force-dynamic";

// Ruta antigua de "Nosotros"; la página sale de la hoja `institucional` (el slug de cada idioma también la abre).
export default async function AcercaDePage() {
  const page = await getInstitucionalBySlug("nosotros");
  if (!page) notFound();
  return <InstitucionalView page={page} />;
}
