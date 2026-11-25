import { articleTitle } from "./labels";
import type { Article } from "./types";

export function splitAuthors(value: string | null): string[] {
  return value ? value.split(";").map((author) => author.trim()).filter(Boolean) : [];
}

/**
 * "Apellido, Nombre" is used as written. Otherwise the last word is the surname,
 * or the last two for names of three or more words (Spanish double surname).
 */
function toApaName(fullName: string): string {
  const initials = (given: string[]) =>
    given.map((part) => `${part.charAt(0).toUpperCase()}.`).join(" ");

  if (fullName.includes(",")) {
    const [surname, ...rest] = fullName.split(",");
    const given = rest.join(" ").split(/\s+/).filter(Boolean);
    return given.length ? `${surname.trim()}, ${initials(given)}` : surname.trim();
  }
  const words = fullName.split(/\s+/).filter(Boolean);
  if (words.length < 2) return fullName;
  const surnameCount = words.length >= 3 ? 2 : 1;
  const surname = words.slice(-surnameCount).join(" ");
  return `${surname}, ${initials(words.slice(0, -surnameCount))}`;
}

function joinAuthors(names: string[], and: string): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]}, ${and} ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, ${and} ${names[names.length - 1]}`;
}

export type ApaParts = {
  authors: string;
  year: string;
  title: string;
  medium: string;
  publisher: string;
  url: string | null;
};

export function buildApaCitation(
  article: Article,
  options: { medium: string; publisher: string; noDate: string; and: string },
): ApaParts {
  const authors = joinAuthors(splitAuthors(article.autoria).map(toApaName), options.and);
  const year = article.fechaPublicacion
    ? String(article.fechaPublicacion.getUTCFullYear())
    : options.noDate;
  return {
    authors,
    year,
    title: articleTitle(article),
    medium: options.medium,
    publisher: options.publisher,
    url: article.citationUrl,
  };
}
