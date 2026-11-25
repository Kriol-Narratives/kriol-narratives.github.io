"use client";

import Image from "next/image";
import Link from "next/link";
import { SecondaryPageShell } from "@/components/secondary-page-shell";
import { isWikimediaUrl } from "@/lib/cms/media-type";
import type { Memoria } from "@/lib/cms";
import { useMenuItems, useText } from "@/lib/i18n/client";

function useMonthYear() {
  const TEXT = useText();
  return (date: Date | null) =>
    date ? `${TEXT.Months[date.getUTCMonth()]} ${date.getUTCFullYear()}` : null;
}

function Cover({ memoria, className, sizes }: { memoria: Memoria; className: string; sizes: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#f0f0f0] ${className}`}>
      {memoria.coverUrl && (
        <Image
          src={memoria.coverUrl}
          alt=""
          fill
          sizes={sizes}
          unoptimized={isWikimediaUrl(memoria.coverUrl)}
          className="object-cover"
        />
      )}
    </div>
  );
}

/** Listado de memorias: tarjetas con portada, título y fecha; vacío mientras la hoja no tenga memorias con link. */
export function MemoriasListView({ memorias }: { memorias: Memoria[] }) {
  const TEXT = useText();
  const t = TEXT.MemoriesPage;
  const monthYear = useMonthYear();
  // El título sale del menu si el slug actual de la pagina coincide en el menu, para todos los casos
  const title = useMenuItems().find((item) => item.href === "/memorias")?.label ?? t.title;

  return (
    <SecondaryPageShell breadcrumbHref="/" tint="cream">
      <h1 className="px-4 pt-2 font-display text-3xl dark:text-cream sm:px-7">{title}</h1>
      {memorias.length > 0 && (
        <ul className="grid grid-cols-1 gap-x-5 gap-y-6 px-4 py-6 sm:grid-cols-3 sm:px-7 lg:grid-cols-5">
          {memorias.map((memoria) => (
            <li key={memoria.id} className="group">
              <Link href={`/memorias/${memoria.slug}`}>
                <Cover
                  memoria={memoria}
                  className="aspect-[231/131] w-full rounded-sm [&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-105"
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw"
                />
                <span className="mt-3 block font-sans text-sm font-semibold leading-snug text-brown-dark dark:text-cream">
                  {memoria.seoTitle ?? memoria.slug}
                </span>
                {memoria.fechaPublicacion && (
                  <span className="mt-1.5 block font-sans text-[11px] text-black/60 dark:text-cream/60">
                    {monthYear(memoria.fechaPublicacion)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SecondaryPageShell>
  );
}

/** Detalle de una memoria: título y resumen a la izquierda; portada, fecha y documento a la derecha; relacionadas al final. */
export function MemoriaDetailView({
  memoria,
  html,
  related,
}: {
  memoria: Memoria;
  html: string | null;
  related: Memoria[];
}) {
  const TEXT = useText();
  const monthYear = useMonthYear();

  return (
    <SecondaryPageShell breadcrumbHref="/memorias" tint="cream">
      <div className="grid grid-cols-1 gap-10 px-4 py-6 sm:px-7 lg:grid-cols-[400px_1fr] lg:gap-16">
        <div>
          <h1 className="mb-4 font-display text-3xl dark:text-cream">{memoria.seoTitle ?? memoria.slug}</h1>
          {memoria.seoDescription && (
            <p className="font-sans text-[13px] font-bold leading-relaxed text-black dark:text-cream">
              {memoria.seoDescription}
            </p>
          )}
        </div>

        <article>
          {memoria.coverUrl && <Cover memoria={memoria} className="aspect-[11/7] w-full" sizes="(min-width: 1024px) 60vw, 100vw" />}
          {memoria.fechaPublicacion && (
            <p className="mt-5 font-sans text-[13px] font-bold uppercase tracking-wide text-green">
              {monthYear(memoria.fechaPublicacion)}
            </p>
          )}
          {html && <div className="doc-content mt-5 max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />}
        </article>
      </div>

      {related.length > 0 && (
        <>
          <div className="mx-4 h-px bg-[#e6e0c0] dark:bg-white/20 sm:mx-7" />
          <section className="px-4 py-10 sm:px-7">
            <h2 className="mb-5 font-display text-2xl dark:text-cream">{TEXT.Common.relatedItems}</h2>
            <ul className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={`/memorias/${item.slug}`}>
                    <Cover memoria={item} className="aspect-[4/3] w-full rounded-sm" sizes="(min-width: 1024px) 20vw, 100vw" />
                    <span className="mt-3 block font-display text-lg leading-tight text-black dark:text-cream">
                      {item.seoTitle ?? item.slug}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </SecondaryPageShell>
  );
}
