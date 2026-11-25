"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { DetailHeader } from "@/components/detail-header";
import { MenuDrawer } from "@/components/menu-drawer";
import { RelatedItems } from "@/components/related-items";
import { SiteFooter } from "@/components/site-footer";
import { getMemoria } from "@/data/memoria";

export default function MemoriaArticlePage() {
  const { itemId } = useParams<{ itemId: string }>();
  const memoria = getMemoria(itemId);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <>
      <DetailHeader onOpenMenu={() => setIsMenuOpen(true)} />
      <div className="flex flex-1 flex-col bg-cream">
        <Breadcrumb href="/memorias" label="Home" />

        <main className="flex-1">
        <div className="grid grid-cols-1 gap-10 px-4 py-6 sm:px-7 lg:grid-cols-[400px_1fr] lg:gap-16">
          <div>
            <h1 className="mb-4 font-display text-3xl dark:text-cream">{memoria.title}</h1>
            <p className="font-sans text-[13px] font-bold leading-relaxed text-black dark:text-cream">
              {memoria.intro}
            </p>
          </div>

          <article>
            <div className="relative aspect-[11/7] w-full overflow-hidden">
              <Image src={memoria.heroImage} alt="" fill className="object-cover" />
            </div>
            <p className="mt-2.5 font-sans text-[13px] text-black dark:text-cream">
              {memoria.heroCaption}
            </p>

            <div className="mt-5 flex items-center gap-4">
              <span className="font-sans text-[13px] font-bold uppercase tracking-wide text-green">
                {memoria.author}
              </span>
              <span className="h-[26px] w-px bg-gold" />
              <span className="font-sans text-[13px] font-bold uppercase tracking-wide text-green">
                {memoria.date}
              </span>
            </div>

            <div className="mt-5 space-y-5 font-sans text-sm leading-relaxed text-black/85 dark:text-cream/85">
              <p>{memoria.bodyParagraphs[0]}</p>
              <p>{memoria.bodyParagraphs[1]}</p>
            </div>

            <blockquote className="my-6 border-l-[3px] border-gold pl-5">
              <p className="font-sans text-sm italic leading-relaxed text-gold">
                {memoria.quote}
              </p>
            </blockquote>

            <div className="space-y-5 font-sans text-sm leading-relaxed text-black/85 dark:text-cream/85">
              <p>{memoria.bodyParagraphs[2]}</p>
            </div>

            <div className="mt-6">
              <div className="relative aspect-[11/7] w-full overflow-hidden">
                <Image src={memoria.secondImage} alt="" fill className="object-cover" />
              </div>
              <p className="mt-2.5 font-sans text-[13px] text-black dark:text-cream">
                {memoria.secondImageCaption}
              </p>
            </div>
          </article>
        </div>

        <div className="mx-4 h-px bg-[#e6e0c0] dark:bg-white/20 sm:mx-7" />

        <RelatedItems />
        </main>

        <SiteFooter isDark={isDark} onToggleDark={() => setIsDark((value) => !value)} />
      </div>
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
