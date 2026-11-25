import Image from "next/image";
import Link from "next/link";
import { categories as allCategories, type Category } from "@/data/categories";
import type { ViewMode } from "./site-header";

const FOCUS_RING =
  "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral";

export function CategoryGrid({
  viewMode,
  categories = allCategories,
}: {
  viewMode: ViewMode;
  categories?: Category[];
}) {
  if (viewMode === "list") {
    return (
      <ul className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-7">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/categoria/${category.slug}`}
              className={`flex items-center gap-4 ${FOCUS_RING}`}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden sm:h-24 sm:w-24">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 96px, 80px"
                />
              </div>
              <div>
                <h2 className="font-display text-teal text-base dark:text-coral">
                  {category.title}
                </h2>
                <p className="font-sans text-xs font-light text-black dark:text-cream">
                  {category.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 py-10
        sm:mx-auto sm:grid sm:max-w-6xl sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-7
        lg:grid-cols-5 lg:gap-x-[61px]"
    >
      {categories.map((category) => (
        <li key={category.slug} className="w-40 shrink-0 snap-center sm:w-auto">
          <Link
            href={`/categoria/${category.slug}`}
            className={`flex flex-col gap-2.5 ${FOCUS_RING}`}
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={category.image}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 159px, (min-width: 640px) 33vw, 160px"
              />
            </div>
            <h2 className="font-display text-teal text-sm leading-tight dark:text-coral">
              {category.title}
            </h2>
            <p className="font-sans text-[10px] font-light leading-tight text-black dark:text-cream">
              {category.description}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
