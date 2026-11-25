"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { DetailHeader } from "@/components/detail-header";
import { MenuDrawer } from "@/components/menu-drawer";
import { SiteFooter } from "@/components/site-footer";
import { useDarkMode } from "@/lib/theme";

export function SecondaryPageShell({
  breadcrumbHref,
  tint = "white",
  children,
}: {
  breadcrumbHref: string;
  tint?: "white" | "cream";
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();


  return (
    <>
      <DetailHeader onOpenMenu={() => setIsMenuOpen(true)} />
      <div className={`flex flex-1 flex-col ${tint === "cream" ? "bg-cream" : "bg-white"} dark:bg-[#241d19]`}>
        <Breadcrumb href={breadcrumbHref} />
        <main className="flex-1">{children}</main>
        <SiteFooter isDark={isDark} onToggleDark={toggleDark} />
      </div>
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
