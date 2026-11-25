"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ARTICLE_TYPES } from "@/lib/cms/labels";
import type { ArticleType } from "@/lib/cms/types";
import { useText } from "@/lib/i18n/client";

const PILL =
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-[#ABABAB] bg-transparent px-4 py-2 font-sans text-xs font-semibold uppercase text-green transition hover:border-green active:scale-95";

function FilterDropdown({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className={`${PILL} max-sm:rounded-none max-sm:border-transparent max-sm:bg-white max-sm:py-3.5 max-sm:text-sm max-sm:tracking-wider max-sm:shadow-md dark:max-sm:bg-[#241d19] ${active ? "!border-green !border-2" : ""}`}
      >
        {label}
        <ChevronDown size={14} strokeWidth={2} className={isOpen ? "rotate-180" : ""} />
      </button>
      {isOpen && (
        <div className="mt-2 w-full rounded-lg sm:absolute sm:left-0 sm:top-full sm:z-20 sm:min-w-48 border border-[#ABABAB] bg-white p-4 shadow-lg dark:bg-[#241d19]">
          {children}
        </div>
      )}
    </div>
  );
}

function CheckboxList({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const TEXT = useText();
  const t = TEXT.Filters;
  if (options.length === 0) {
    return <p className="font-sans text-xs text-black/50 dark:text-cream/50">{t.noOptions}</p>;
  }
  return (
    <ul className="flex max-h-60 flex-col gap-2.5 overflow-y-auto">
      {options.map((option) => (
        <li key={option.value}>
          <label className="flex cursor-pointer items-center gap-2 font-sans text-sm text-black dark:text-cream">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(option.value)}
              className="h-4 w-4 accent-green"
            />
            {option.label}
          </label>
        </li>
      ))}
    </ul>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const TEXT = useText();
  const t = TEXT.Filters;
  return (
    <span className="inline-flex items-center gap-2 rounded-sm bg-green px-3 py-1 font-sans text-xs font-semibold uppercase text-cream">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t.remove({ value: label })}
        className="cursor-pointer transition hover:opacity-70"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </span>
  );
}

export function ArticleFilters({
  keyword,
  onKeywordChange,
  selectedTipos,
  onToggleTipo,
  authorOptions,
  selectedAuthors,
  onToggleAuthor,
  yearOptions,
  selectedYears,
  onToggleYear,
  resultsCount,
  totalCount,
}: {
  keyword: string;
  onKeywordChange: (value: string) => void;
  selectedTipos: ArticleType[];
  onToggleTipo: (tipo: ArticleType) => void;
  authorOptions: string[];
  selectedAuthors: string[];
  onToggleAuthor: (author: string) => void;
  yearOptions: string[];
  selectedYears: string[];
  onToggleYear: (year: string) => void;
  resultsCount: number;
  totalCount: number;
}) {
  const TEXT = useText();
  const t = TEXT.Filters;
  const tTypes = TEXT.ArticleTypes;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-4 sm:px-7">
      {/* Móvil: un solo botón BUSCAR que despliega los filtros a todo el ancho. */}
      <div className="relative">
      {/* Móvil: al abrir, la pantalla se tiñe de azul y los filtros quedan encima; tocar fuera cierra. */}
      {isOpen && (
        <div
          aria-hidden
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-[#849df6]/98 sm:hidden"
        />
      )}
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className={`${PILL} rounded-none py-3.5 text-sm tracking-wider sm:hidden`}
      >
        {t.search}
        <ChevronDown size={14} strokeWidth={2} className={isOpen ? "rotate-180" : ""} />
      </button>
      {/* Móvil: los filtros se despliegan sobre la lista, a todo el ancho; desde sm van los 4 en una fila. */}
      <div
        className={`absolute inset-x-0 top-full z-50 mt-3 flex-col gap-3 sm:static sm:z-auto sm:mt-0 sm:grid sm:grid-cols-4 sm:gap-3 ${
          isOpen ? "flex" : "hidden"
        }`}
      >
        <FilterDropdown label={t.keyword} active={keyword.trim() !== ""}>
          <input
            type="text"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder={t.keywordPlaceholder}
            autoFocus
            className="w-full rounded-md border border-[#ABABAB] bg-transparent px-3 py-2 font-sans text-sm text-black transition focus:border-green focus:outline-none dark:text-cream"
          />
        </FilterDropdown>

        <FilterDropdown label={t.medio} active={selectedTipos.length > 0}>
          <CheckboxList
            options={ARTICLE_TYPES.map((tipo) => ({ value: tipo, label: tTypes[tipo] }))}
            selected={selectedTipos}
            onToggle={(value) => onToggleTipo(value as ArticleType)}
          />
        </FilterDropdown>

        <FilterDropdown label={t.autoria} active={selectedAuthors.length > 0}>
          <CheckboxList
            options={authorOptions.map((author) => ({ value: author, label: author }))}
            selected={selectedAuthors}
            onToggle={onToggleAuthor}
          />
        </FilterDropdown>

        <FilterDropdown label={t.fechas} active={selectedYears.length > 0}>
          <CheckboxList
            options={yearOptions.map((year) => ({ value: year, label: year }))}
            selected={selectedYears}
            onToggle={onToggleYear}
          />
        </FilterDropdown>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="mt-5 w-fit cursor-pointer bg-green px-16 py-3 font-sans text-base font-semibold uppercase text-white shadow-md transition active:scale-95 sm:hidden"
        >
          {t.apply}
        </button>
      </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {keyword.trim() && <Chip label={keyword.trim()} onRemove={() => onKeywordChange("")} />}
        {selectedTipos.map((tipo) => (
          <Chip key={tipo} label={tTypes[tipo]} onRemove={() => onToggleTipo(tipo)} />
        ))}
        {selectedAuthors.map((author) => (
          <Chip key={author} label={author} onRemove={() => onToggleAuthor(author)} />
        ))}
        {selectedYears.map((year) => (
          <Chip key={year} label={year} onRemove={() => onToggleYear(year)} />
        ))}
      </div>

      <p className="mt-4 font-sans text-xs text-black/60 dark:text-cream/60">
        {t.resultsOf({ count: resultsCount, total: totalCount })}
      </p>
    </div>
  );
}
