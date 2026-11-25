import Image from "next/image";
import { SecondaryPageShell } from "@/components/secondary-page-shell";

export default function AcercaDePage() {
  return (
    <SecondaryPageShell breadcrumbHref="/" breadcrumbLabel="Home" tint="cream">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-7">
        <h1 className="font-display text-3xl dark:text-cream">Acerca de este proyecto</h1>

        <div className="relative mt-7 aspect-[364/215] w-full max-w-xl overflow-hidden">
          <Image
            src="/images/pages/acerca-de.png"
            alt="Equipo del proyecto Kriol Narratives"
            fill
            className="object-cover"
            sizes="(min-width: 640px) 570px, 100vw"
          />
          <span className="absolute left-3.5 top-3.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-green text-sm font-bold text-white">
            i
          </span>
        </div>
        <p className="mt-2.5 font-sans text-[13px] text-black dark:text-cream">
          Lorem ipsum dolor sit amet,
        </p>

        <div className="mt-5 max-w-xl space-y-5 font-sans text-sm leading-relaxed text-black/85 dark:text-cream/85">
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nam ac finibus ligula, quis
            rhoncus metus. Quisque vestibulum leo in nulla fringilla dignissim. Donec venenatis
            interdum venenatis. Sed tincidunt elit augue. Quisque cursus mi vel felis sagittis,
            sed tempor metus tincidunt. Sed sit amet iaculis nisl. Praesent molestie viverra
            tellus id gravida. Nunc id nulla eget elit feugiat pretium imperdiet vel eros.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nam ac finibus ligula, quis
            rhoncus metus. Quisque vestibulum leo in nulla fringilla dignissim. Donec venenatis
            interdum venenatis. Sed tincidunt elit augue. Quisque cursus mi vel felis sagittis,
            sed tempor metus tincidunt.
          </p>
          <p>
            Sed sit amet iaculis nisl. Praesent molestie viverra tellus id gravida. Nunc id nulla
            eget elit feugiat pretium imperdiet vel eros. Lorem ipsum dolor sit amet, consectetuer
            adipiscing elit. Nam ac finibus ligula, quis rhoncus metus.
          </p>
        </div>
      </div>
    </SecondaryPageShell>
  );
}
