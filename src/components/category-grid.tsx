import Image from "next/image";
import { isWikimediaUrl } from "@/lib/cms/media-type";
import Link from "next/link";
import { CardCarousel, CardVisual, type CardEntry } from "@/components/category-carousel";
import { CategoryIcon } from "@/components/category-icon";
import { useCategoryTitle } from "@/lib/i18n/client";
import { categoryPath } from "@/lib/cms/paths";
import type { Category } from "@/lib/cms";
import type { ViewMode } from "./site-header";

const FOCUS_RING =
  "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral";

function CategoryVisual({ category, className }: { category: Category; className: string }) {
  const imageUrl = category.coverUrl ?? category.logoUrl;
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={imageUrl} alt="" unoptimized={isWikimediaUrl(imageUrl)} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center overflow-hidden bg-cream ${className}`}>
      <CategoryIcon className="h-1/3 w-1/3 text-teal" />
    </div>
  );
}

/** Tarjetas de una colección (categorías o artículos) en la vista activa: tira infinita o cuadrícula. */
export function CardCollection({
  viewMode,
  entries,
  alignStart = false,
}: {
  viewMode: "carousel" | "grid";
  entries: CardEntry[];
  /** Pegada al margen izquierdo en vez de centrada (resultados de búsqueda). */
  alignStart?: boolean;
}) {
  if (viewMode === "grid") {
    return (
      <ul
        className={`${alignStart ? "" : "mx-auto max-w-5xl"} grid grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 sm:grid-cols-3 sm:px-7 lg:grid-cols-5`}
      >
        {entries.map((entry) => (
          <li key={entry.key}>
            <Link href={entry.href} className={`flex flex-col gap-2.5 ${FOCUS_RING}`}>
              {entry.visual}
              <h2 className="font-display text-teal text-sm leading-tight dark:text-coral">{entry.title}</h2>
              <p className="font-sans text-[10px] font-light leading-tight text-black dark:text-cream">
                {entry.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return <CardCarousel entries={entries} />;
}

export function CategoryGrid({
  viewMode,
  categories,
  alignStart = false,
}: {
  viewMode: ViewMode;
  categories: Category[];
  alignStart?: boolean;
}) {
  const displayTitle = useCategoryTitle();
  if (viewMode === "list") {
    return (
      <ul className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-7">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={categoryPath(category.slug)}
              className={`flex items-center gap-4 ${FOCUS_RING}`}
            >
              <CategoryVisual category={category} className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
              <div>
                <h2 className="font-display text-teal text-base dark:text-coral">
                  {displayTitle(category)}
                </h2>
                <p className="font-sans text-xs font-light text-black dark:text-cream">
                  {category.descripcion ?? ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  const entries: CardEntry[] = categories.map((category) => ({
    key: category.slug,
    href: categoryPath(category.slug),
    title: displayTitle(category),
    description: category.descripcion ?? "",
    visual: <CardVisual category={category} />,
  }));
  return <CardCollection viewMode={viewMode === "grid" ? "grid" : "carousel"} entries={entries} alignStart={alignStart} />;
}
