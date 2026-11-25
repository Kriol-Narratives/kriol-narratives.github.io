"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMenuItems, useText } from "@/lib/i18n/client";

export function Breadcrumb({ href, label }: { href: string; label?: string }) {
  const TEXT = useText();
  const t = TEXT.Common;
  const menuLabel = useMenuItems().find((item) => item.href === href)?.label;
  return (
    <div className="px-4 pt-5 sm:px-7">
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded font-sans text-xs font-bold uppercase tracking-wide text-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green dark:focus-visible:outline-coral"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        {label ?? menuLabel ?? t.home}
      </Link>
    </div>
  );
}
