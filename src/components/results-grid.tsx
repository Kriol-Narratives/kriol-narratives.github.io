import Image from "next/image";
import Link from "next/link";
import type { ResultItem } from "@/data/results";
import type { ViewMode } from "./site-header";

export function ResultsGrid({
  items,
  viewMode,
  basePath,
}: {
  items: ResultItem[];
  viewMode: ViewMode;
  basePath: string;
}) {
  if (viewMode === "list") {
    return (
      <ul className="flex flex-col px-4 sm:px-7">
        {items.map((item) => (
          <li key={item.id} className="border-b border-[#e0e0e0] dark:border-white/20">
            <Link href={`${basePath}/${item.id}`} className="flex gap-4 py-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-sm">
                <Image src={item.image} alt="" fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center gap-1">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wide text-green">
                  {item.type}
                </span>
                <span className="font-sans text-sm font-bold uppercase text-brown-dark">
                  {item.title}
                </span>
                <span className="font-sans text-[10px] text-black/60 dark:text-cream/60">
                  {item.author}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-x-5 gap-y-6 px-4 py-6 sm:grid-cols-3 sm:px-7 lg:grid-cols-5">
      {items.map((item) => (
        <li key={item.id} className="group">
          <Link href={`${basePath}/${item.id}`}>
            <div className="relative aspect-[231/131] w-full overflow-hidden rounded-sm">
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw"
              />
            </div>
            <span className="mt-3 block font-sans text-[11px] font-bold uppercase tracking-wide text-green">
              {item.type}
            </span>
            <span className="mt-1 block font-sans text-sm font-semibold leading-snug text-brown-dark">
              {item.title}
            </span>
            <span className="mt-1.5 block font-sans text-[11px] text-black/60 dark:text-cream/60">
              {item.author}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
