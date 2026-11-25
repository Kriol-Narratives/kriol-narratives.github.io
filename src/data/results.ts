import { authors, contentTypeLabels, contentTypes, dateRanges } from "./content-types";
import { categories } from "./categories";

export type ResultItem = {
  id: number;
  type: string;
  title: string;
  author: string;
  dateRange: string;
  image: string;
};

const dummyTitle = "Lorem ipsum dolor sit amet, consectetur";

export function getResultsForCategory(count = 15): ResultItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    type: contentTypes[index % contentTypes.length].label,
    title: dummyTitle,
    author: authors[index % authors.length],
    dateRange: dateRanges[index % dateRanges.length],
    image: categories[index % categories.length].image,
  }));
}

export type FilterGroup = {
  key: string;
  label: string;
  type: "text" | "checkbox";
  options?: string[];
};

export const filterGroups: FilterGroup[] = [
  { key: "keyword", label: "Palabra clave", type: "text" },
  {
    key: "medio",
    label: "Medio",
    type: "checkbox",
    options: contentTypeLabels,
  },
  {
    key: "autoria",
    label: "Autoría",
    type: "checkbox",
    options: authors,
  },
  {
    key: "fechas",
    label: "Fechas",
    type: "checkbox",
    options: dateRanges,
  },
];

export function filterResults(
  items: ResultItem[],
  { keyword, selected }: { keyword: string; selected: Record<string, string[]> },
): ResultItem[] {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return items.filter((item) => {
    if (normalizedKeyword) {
      const haystack = `${item.type} ${item.title} ${item.author}`.toLowerCase();
      if (!haystack.includes(normalizedKeyword)) return false;
    }

    const medio = selected.medio ?? [];
    if (medio.length > 0 && !medio.includes(item.type)) return false;

    const autoria = selected.autoria ?? [];
    if (autoria.length > 0 && !autoria.includes(item.author)) return false;

    const fechas = selected.fechas ?? [];
    if (fechas.length > 0 && !fechas.includes(item.dateRange)) return false;

    return true;
  });
}
