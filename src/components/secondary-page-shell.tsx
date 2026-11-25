"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { DetailHeader } from "@/components/detail-header";
import { MenuDrawer } from "@/components/menu-drawer";
import { SiteFooter } from "@/components/site-footer";

export function SecondaryPageShell({
  breadcrumbHref,
  breadcrumbLabel,
  tint = "white",
  children,
}: {
  breadcrumbHref: string;
  breadcrumbLabel: string;
  tint?: "white" | "cream";
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <>
      <DetailHeader onOpenMenu={() => setIsMenuOpen(true)} />
      <div className={`flex flex-1 flex-col ${tint === "cream" ? "bg-cream" : "bg-white"}`}>
        <Breadcrumb href={breadcrumbHref} label={breadcrumbLabel} />
        <main className="flex-1">{children}</main>
        <SiteFooter isDark={isDark} onToggleDark={() => setIsDark((value) => !value)} />
      </div>
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
