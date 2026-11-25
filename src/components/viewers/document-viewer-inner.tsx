"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useText } from "@/lib/i18n/client";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function useDragScroll(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    function onPointerDown(event: PointerEvent) {
      isDown = true;
      el!.setPointerCapture(event.pointerId);
      startX = event.clientX;
      startY = event.clientY;
      scrollLeft = el!.scrollLeft;
      scrollTop = el!.scrollTop;
      el!.style.cursor = "grabbing";
    }
    function onPointerMove(event: PointerEvent) {
      if (!isDown) return;
      el!.scrollLeft = scrollLeft - (event.clientX - startX);
      el!.scrollTop = scrollTop - (event.clientY - startY);
    }
    function onPointerUp() {
      isDown = false;
      el!.style.cursor = "grab";
    }

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
      el.style.cursor = "";
    };
  }, [enabled]);

  return ref;
}

export function DocumentViewer({ fileUrl }: { fileUrl?: string | null }) {
  const TEXT = useText();
  const t = TEXT.Viewers;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [containerWidth, setContainerWidth] = useState(520);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useDragScroll(!isFullscreen);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const index = pageRefs.current.findIndex((el) => el === visible.target);
          if (index !== -1) setCurrentPage(index + 1);
        }
      },
      { root: scrollEl, threshold: [0.5] },
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [numPages, scrollRef]);

  function goToPage(pageNumber: number) {
    const container = scrollRef.current;
    const target = pageRefs.current[pageNumber - 1];
    if (!container || !target) return;
    const offset =
      target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top: offset, behavior: "smooth" });
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }

  function handleDownload() {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop() ?? "documento.pdf";
    link.click();
  }

  const availableWidth = containerWidth - 32;
  const baseWidth = Math.min(isFullscreen ? 720 : 520, availableWidth);
  const pageWidth = baseWidth * (zoom / 100);

  if (!fileUrl) {
    return (
      <div className="flex h-[300px] w-full max-w-[640px] items-center justify-center border border-[#d9d9d9] bg-[#525659] font-sans text-xs text-white">
        {t.noDocument}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex w-full max-w-[640px] flex-col border border-[#d9d9d9] bg-[#525659]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#4b5563] px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t.previousPage}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/10 text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
          <span className="font-sans text-xs font-semibold text-white">
            {numPages > 0 ? `${currentPage} / ${numPages}` : "Documento"}
          </span>
          <button
            type="button"
            aria-label={t.nextPage}
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/10 text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label={t.zoomOut}
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/10 text-white"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <span className="min-w-9 text-center font-sans text-xs font-semibold text-white">
            {zoom}%
          </span>
          <button
            type="button"
            aria-label={t.zoomIn}
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/10 text-white"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label={t.download}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/10 text-white"
          >
            <Download size={13} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? t.exitFullscreen : t.fullscreen}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/10 text-white"
          >
            {isFullscreen ? (
              <Minimize2 size={13} strokeWidth={2.5} />
            ) : (
              <Maximize2 size={13} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`no-scrollbar flex justify-center overflow-auto py-6 select-none ${
          isFullscreen ? "h-[calc(100vh-40px)]" : "h-[560px]"
        }`}
      >
        <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: numPages }, (_, index) => (
              <div key={index} ref={(el) => { pageRefs.current[index] = el; }}>
                <Page
                  pageNumber={index + 1}
                  width={pageWidth}
                  className="shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                />
              </div>
            ))}
          </div>
        </Document>
      </div>
    </div>
  );
}
