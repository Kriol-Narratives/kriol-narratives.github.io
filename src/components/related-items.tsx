import Image from "next/image";
import { getRelatedItems } from "@/data/story";

export function RelatedItems({ compact = false }: { compact?: boolean }) {
  const items = getRelatedItems();

  return (
    <section className={compact ? "px-2 py-8" : "px-4 py-10 sm:px-7"}>
      <h2 className="mb-5 font-display text-2xl dark:text-cream">Elementos relacionados</h2>
      <ul
        className={
          compact
            ? "grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-5"
            : "grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-5"
        }
      >
        {items.map((item, index) => (
          <li key={index} className="cursor-pointer">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
              <Image src={item.image} alt="" fill className="object-cover" />
            </div>
            <span
              className={`mt-3 block font-sans font-bold uppercase tracking-wide text-black dark:text-cream ${compact ? "text-[10px]" : "text-[11px]"}`}
            >
              {item.type}
            </span>
            <span
              className={`mt-1.5 block font-display leading-tight text-black dark:text-cream ${compact ? "text-base" : "text-lg"}`}
            >
              {item.title}
            </span>
            {!compact && (
              <span className="mt-1.5 block font-sans text-xs text-black/70 dark:text-cream/70">
                Autoría(s): {item.author}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
