import { SecondaryPageShell } from "@/components/secondary-page-shell";
import { getInstitucionalHtml, type InstitucionalPage } from "@/lib/cms";
import { getText } from "@/lib/i18n/server";

// Páginas (id_articulo de la hoja institucional) cuyo Doc se muestra sin espacio entre párrafos: INS-004 = créditos.
const COMPACT_PAGES = ["INS-004"];

/** Página institucional (nosotros, aliados, contacto, créditos…): el contenido es el Google Doc del idioma actual. */
export async function InstitucionalView({ page }: { page: InstitucionalPage }) {
  const TEXT = await getText();
  const t = TEXT.AboutPage;
  const rawHtml = await getInstitucionalHtml(page);

  // El doc abre con su título como primer párrafo; se sube al <h1>.
  const titleMatch = rawHtml?.match(/^\s*<p[^>]*>([^<]{1,120})<\/p>/);
  const title = titleMatch?.[1].trim() || page.seoTitle || t.title;
  const html = titleMatch && rawHtml ? rawHtml.slice(titleMatch[0].length) : rawHtml;

  return (
    <SecondaryPageShell breadcrumbHref="/" tint="cream">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-7">
        <h1 className="font-display text-3xl dark:text-cream">{title}</h1>

        {/* Sin link al documento de este idioma la página queda solo con el título. */}
        {html && (
          <div
            className={`doc-content mt-5 max-w-2xl ${COMPACT_PAGES.includes(page.id) ? "doc-compact" : ""}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </SecondaryPageShell>
  );
}
