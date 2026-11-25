"use client";

import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { filterGroups } from "@/data/results";

type ActiveTag = { groupKey: string; value: string };

type ResultsFiltersProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  selected: Record<string, string[]>;
  onToggleOption: (groupKey: string, option: string) => void;
  resultsCount: number;
  totalCount: number;
};

function FilterGroupContent({
  groupKey,
  keyword,
  onKeywordChange,
  selected,
  onToggleOption,
}: {
  groupKey: string;
  keyword: string;
  onKeywordChange: (value: string) => void;
  selected: string[];
  onToggleOption: (value: string) => void;
}) {
  const group = filterGroups.find((g) => g.key === groupKey)!;

  if (group.type === "text") {
    return (
      <input
        type="text"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="Escribe una palabra clave"
        className="w-full rounded border border-[#ABABAB] px-3 py-2 font-sans text-sm text-black"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {group.options!.map((option) => (
        <li key={option}>
          <label className="flex cursor-pointer items-center gap-2 font-sans text-sm text-black">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggleOption(option)}
              className="h-4 w-4 accent-green"
            />
            {option}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function ResultsFilters({
  keyword,
  onKeywordChange,
  selected,
  onToggleOption,
  resultsCount,
  totalCount,
}: ResultsFiltersProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  function toggleGroup(groupKey: string) {
    setExpandedGroup((current) => (current === groupKey ? null : groupKey));
  }

  function removeTag(tag: ActiveTag) {
    if (tag.groupKey === "keyword") {
      onKeywordChange("");
      return;
    }
    onToggleOption(tag.groupKey, tag.value);
  }

  const activeTags: ActiveTag[] = [
    ...(keyword ? [{ groupKey: "keyword", value: keyword }] : []),
    ...Object.entries(selected).flatMap(([groupKey, values]) =>
      values.map((value) => ({ groupKey, value })),
    ),
  ];

  return (
    <div className="px-4 sm:px-7">
      {/* Desktop: inline pill dropdowns */}
      <div className="relative hidden gap-3 sm:flex">
        {filterGroups.map((group) => (
          <button
            key={group.key}
            type="button"
            onClick={() => toggleGroup(group.key)}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#ABABAB] bg-[#6B6B6B] px-4 py-2 font-sans text-xs font-semibold uppercase text-cream"
          >
            {group.label}
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={expandedGroup === group.key ? "rotate-180" : ""}
            />
          </button>
        ))}

        {expandedGroup && (
          <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-[#ABABAB] bg-white p-4 shadow-lg">
            <FilterGroupContent
              groupKey={expandedGroup}
              keyword={keyword}
              onKeywordChange={onKeywordChange}
              selected={selected[expandedGroup] ?? []}
              onToggleOption={(option) => onToggleOption(expandedGroup, option)}
            />
          </div>
        )}
      </div>

      {/* Mobile: sheet trigger */}
      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        className="flex w-full cursor-pointer items-center justify-between rounded border border-[#ABABAB] bg-white px-4 py-3 font-sans text-sm font-bold uppercase tracking-wide text-green sm:hidden"
      >
        Buscar
        <ChevronDown size={16} strokeWidth={2.4} />
      </button>

      {isSheetOpen && (
        <div
          className="fixed inset-0 z-40 bg-blue/55 sm:hidden"
          onClick={() => {
            setIsSheetOpen(false);
            setExpandedGroup(null);
          }}
        >
          <div
            className="absolute inset-x-5 top-28 flex flex-col gap-2.5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="flex cursor-pointer items-center justify-between rounded border border-white/50 bg-white/20 px-4 py-3.5 font-sans text-sm font-bold uppercase tracking-wide text-white"
            >
              Buscar
              <ChevronDown size={16} strokeWidth={2.4} />
            </button>

            {filterGroups.map((group) => (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="flex w-full cursor-pointer items-center justify-between rounded bg-white px-4 py-3.5 font-sans text-sm font-bold uppercase tracking-wide text-green shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
                >
                  {group.label}
                  <ChevronDown
                    size={16}
                    strokeWidth={2.4}
                    className={`text-black ${expandedGroup === group.key ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedGroup === group.key && (
                  <div className="mt-1.5 rounded bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
                    <FilterGroupContent
                      groupKey={group.key}
                      keyword={keyword}
                      onKeywordChange={onKeywordChange}
                      selected={selected[group.key] ?? []}
                      onToggleOption={(option) => onToggleOption(group.key, option)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {activeTags.map((tag) => (
          <span
            key={`${tag.groupKey}-${tag.value}`}
            className="inline-flex items-center gap-2 rounded-sm bg-green px-3 py-1 font-sans text-xs text-cream"
          >
            {tag.value}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Quitar filtro ${tag.value}`}
              className="cursor-pointer"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </span>
        ))}
      </div>

      <p className="mt-4 font-sans text-xs text-black/60 dark:text-cream/60">
        {activeTags.length > 0
          ? `${resultsCount} de ${totalCount} resultados`
          : `1-${resultsCount} de 47,951 resultados`}
      </p>
    </div>
  );
}
