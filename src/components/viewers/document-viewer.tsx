"use client";

import dynamic from "next/dynamic";
import { useText } from "@/lib/i18n/client";

function LoadingPlaceholder() {
  const TEXT = useText();
  const t = TEXT.Viewers;
  return (
    <div className="flex h-[560px] w-full max-w-[640px] items-center justify-center border border-[#d9d9d9] bg-[#525659] font-sans text-xs text-white">
      {t.loadingDocument}
    </div>
  );
}

export const DocumentViewer = dynamic(
  () => import("./document-viewer-inner").then((mod) => mod.DocumentViewer),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder />,
  },
);
