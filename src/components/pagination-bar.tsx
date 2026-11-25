import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGES = [1, 2, 3, "...", 67, 68] as const;

export function PaginationBar() {
  return (
    <nav
      aria-label="Paginación de resultados"
      className="flex flex-wrap items-center justify-center gap-2 px-4 py-10 font-sans text-sm text-green sm:px-7"
    >
      <button
        type="button"
        className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-semibold uppercase"
      >
        <ChevronLeft size={14} strokeWidth={2} />
        Anterior
      </button>
      {PAGES.map((page, index) =>
        page === "..." ? (
          <span key={`dots-${index}`} className="px-1 text-black/40 dark:text-cream/40">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded px-2 ${
              page === 1 ? "bg-green text-white" : ""
            }`}
          >
            {page}
          </button>
        ),
      )}
      <button
        type="button"
        className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-semibold uppercase"
      >
        Siguiente
        <ChevronRight size={14} strokeWidth={2} />
      </button>
    </nav>
  );
}
