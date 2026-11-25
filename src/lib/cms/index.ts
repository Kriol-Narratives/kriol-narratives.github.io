import "server-only";

import { getLocale } from "@/lib/i18n/server";
import { getGoogleDocHtml } from "./google-docs";
import {
  getArticlesFromSheets,
  getCategoriesFromSheets,
  getInstitucionalFromSheets,
  getMemoriasFromSheets,
  getMenuFromSheets,
} from "./source-sheets";
import type { Article, Category, InstitucionalPage, MenuItem, Memoria } from "./types";

export type { Article, ArticleType, Category, InstitucionalPage, MediaItem, MediaType, MenuItem, Memoria } from "./types";
export { toDirectMediaUrl } from "./media-type";

/** Un link con el slug de otro idioma (el usuario cambió de idioma en la misma página) sigue abriendo la misma entrada. */
function findBySlug<T extends { slug: string; slugAliases: string[] }>(items: T[], slug: string): T | undefined {
  // El slug propio gana sobre un alias: el mismo texto puede ser alias de otra entrada (slugs distintos por idioma).
  return items.find((item) => item.slug === slug) ?? items.find((item) => item.slugAliases.includes(slug));
}

export async function getCategories(): Promise<Category[]> {
  const categories = await getCategoriesFromSheets(await getLocale());
  return categories.sort((a, b) => a.orden - b.orden);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return findBySlug(categories, slug) ?? null;
}

export async function getArticles(): Promise<Article[]> {
  const articles = await getArticlesFromSheets(await getLocale());
  return articles
    .filter((article) => article.estado === "Publicado")
    .sort((a, b) => a.orden - b.orden);
}

export async function getArticlesByCategory(categoriaSlug: string): Promise<Article[]> {
  const [category, articles] = await Promise.all([getCategoryBySlug(categoriaSlug), getArticles()]);
  if (!category) return [];
  return articles.filter((article) => article.categoriaSlug === category.slug);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await getArticles();
  return findBySlug(articles, slug) ?? null;
}

export async function getInstitucionalBySlug(slug: string): Promise<InstitucionalPage | null> {
  const pages = await getInstitucionalFromSheets(await getLocale());
  return findBySlug(pages.filter((item) => item.estado === "Publicado"), slug) ?? null;
}

/** HTML del Google Doc de la página en el idioma actual (el link ya viene por idioma en la hoja). */
export async function getInstitucionalHtml(page: InstitucionalPage): Promise<string | null> {
  return page.googleDocsId ? getGoogleDocHtml(page.googleDocsId) : null;
}

/** Menú lateral desde la hoja `menu`; si la hoja falla o está vacía devuelve [] y el sitio usa el menú por defecto. */
export async function getMenu(): Promise<MenuItem[]> {
  try {
    return await getMenuFromSheets(await getLocale());
  } catch (error) {
    console.error("[menu] No se pudo leer la hoja menu:", error);
    return [];
  }
}

/** Memorias publicadas (con o sin documento todavía). Si la hoja falla o no existe devuelve []. */
export async function getMemorias(): Promise<Memoria[]> {
  try {
    const memorias = await getMemoriasFromSheets(await getLocale());
    return memorias.filter((item) => item.estado === "Publicado").sort((a, b) => (b.fechaPublicacion?.getTime() ?? 0) - (a.fechaPublicacion?.getTime() ?? 0));
  } catch (error) {
    console.error("[memorias] No se pudo leer la hoja memorias:", error);
    return [];
  }
}

export async function getMemoriaBySlug(slug: string): Promise<Memoria | null> {
  return findBySlug(await getMemorias(), slug) ?? null;
}

/** Las memorias relacionadas (relacionado_1…5) de una memoria, en el orden de la hoja; ignora las que no existen. */
export function getRelatedMemorias(memoria: Memoria, all: Memoria[]): Memoria[] {
  return memoria.relatedRefs
    .map((ref) => all.find((item) => item.id === ref || item.slug === ref || item.slugAliases.includes(ref)))
    .filter((item): item is Memoria => item !== undefined && item.id !== memoria.id);
}

export async function getMemoriaHtml(memoria: Memoria): Promise<string | null> {
  return memoria.googleDocsId ? getGoogleDocHtml(memoria.googleDocsId) : null;
}
