import Image from "next/image";
import { SecondaryPageShell } from "@/components/secondary-page-shell";

export default function AliadosPage() {
  return (
    <SecondaryPageShell breadcrumbHref="/" breadcrumbLabel="Home" tint="cream">
      <div className="px-4 py-6 sm:px-7">
        <h1 className="font-display text-3xl dark:text-cream">Aliados</h1>
        <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-black/85 dark:text-cream/85">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac finibus ligula, quis
          rhoncus metus. Quisque vestibulum leo in nulla fringilla dignissim. Donec venenatis
          interdum.
        </p>
        <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
          <div className="relative aspect-[173/125] overflow-hidden bg-white">
            <Image
              src="/images/pages/aliados-1.png"
              alt="Logo de One Raizal Corporation"
              fill
              className="object-contain p-2"
            />
          </div>
          <div className="relative aspect-[173/125] overflow-hidden bg-white">
            <Image
              src="/images/pages/aliados-2.png"
              alt="Logo de la Pontificia Universidad Javeriana"
              fill
              className="object-contain p-2"
            />
          </div>
        </div>
      </div>
    </SecondaryPageShell>
  );
}
