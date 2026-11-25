import "server-only";

import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { inferMediaTypeFromUrl } from "./media-type";
import type { Article, ArticleType, Category, InstitucionalPage, MediaItem } from "./types";

const WORKBOOK_PATH = path.join(
  process.cwd(),
  "Base de Datos CMS Completa - Google Sheets Model V2.xlsx",
);

type ArticleRow = {
  id_articulo?: string;
  slug?: string;
  categoria?: string;
  estado?: string;
  destacado?: boolean;
  orden?: number;
  tipo?: string;
  seo_title_custom?: string;
  seo_description?: string;
  autoria?: string;
  licencia?: string;
  custom_cover_url?: string;
  wikimedia_url?: string;
  fecha_publicacion?: Date;
  fecha_actualizacion?: Date;
  [column: string]: unknown;
};

type InstitucionalRow = {
  id_articulo?: string;
  slug?: string;
  estado?: string;
  seo_title_custom?: string;
  seo_description?: string;
  custom_cover_url?: string;
  google_docs_id?: string;
  fecha_publicacion?: Date;
  fecha_actualizacion?: Date;
};

type CategoryRow = {
  id_categoria?: string;
  nombre?: string;
  slug?: string;
  descripcion?: string;
  logo?: string;
  url_cover?: string;
  orden?: number;
};

let cachedWorkbook: XLSX.WorkBook | null = null;

function getWorkbook(): XLSX.WorkBook {
  if (!cachedWorkbook) {
    const buffer = fs.readFileSync(WORKBOOK_PATH);
    cachedWorkbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  }
  return cachedWorkbook;
}

function readSheet<T>(sheetName: string): T[] {
  const workbook = getWorkbook();
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<T>(sheet, { defval: undefined });
}

function extractMultiformatoMedia(row: ArticleRow): MediaItem[] {
  const urlColumns = Object.keys(row)
    .filter((key) => /^wikimedia_url/i.test(key))
    .sort();

  const items: MediaItem[] = [];
  for (const column of urlColumns) {
    const url = row[column];
    if (typeof url !== "string" || !url.trim()) continue;
    const type = inferMediaTypeFromUrl(url);
    if (type) items.push({ type, url });
  }
  return items;
}

export function getArticlesFromExcel(): Article[] {
  const rows = readSheet<ArticleRow>("articulos");

  return rows
    .filter((row) => row.id_articulo && row.slug)
    .map((row) => {
      const tipo = (row.tipo?.toLowerCase() as ArticleType) ?? "documento";
      return {
        id: row.id_articulo!,
        slug: row.slug!,
        slugAliases: [],
        categoriaSlug: row.categoria ?? "",
        estado: row.estado === "Publicado" ? "Publicado" : "Borrador",
        destacado: Boolean(row.destacado),
        orden: row.orden ?? 0,
        tipo,
        seoTitle: row.seo_title_custom ?? null,
        seoDescription: row.seo_description ?? null,
        autoria: row.autoria?.trim() || null,
        licencia: row.licencia?.trim() || null,
        coverUrl: row.custom_cover_url ?? null,
        wikimediaUrl: row.wikimedia_url ?? null,
        citationUrl: row.wikimedia_url?.trim() || null,
        commonsDescription: null,
        commonsLicense: null,
        commonsLicenseUrl: null,
        keywords:
          typeof row.palabras_clave === "string"
            ? row.palabras_clave.split(/[;,]/).map((word) => word.trim()).filter(Boolean)
            : [],
        fechaPublicacion: row.fecha_publicacion ?? null,
        fechaActualizacion: row.fecha_actualizacion ?? null,
        mediaItems: tipo === "multiformato" ? extractMultiformatoMedia(row) : [],
      };
    });
}

export function getInstitucionalFromExcel(): InstitucionalPage[] {
  const rows = readSheet<InstitucionalRow>("institucional");

  return rows
    .filter((row) => row.id_articulo && row.slug)
    .map((row) => ({
      id: row.id_articulo!,
      slug: row.slug!,
      slugAliases: [],
      estado: row.estado === "Publicado" ? "Publicado" : "Borrador",
      seoTitle: row.seo_title_custom ?? null,
      seoDescription: row.seo_description ?? null,
      coverUrl: row.custom_cover_url ?? null,
      googleDocsId: row.google_docs_id ?? null,
      fechaPublicacion: row.fecha_publicacion ?? null,
      fechaActualizacion: row.fecha_actualizacion ?? null,
    }));
}

export function getCategoriesFromExcel(): Category[] {
  const rows = readSheet<CategoryRow>("categorias");

  return rows
    .filter((row) => row.slug)
    .map((row) => ({
      id: row.id_categoria ?? row.slug!,
      nombre: row.nombre ?? null,
      slug: row.slug!,
      slugAliases: [],
      descripcion: row.descripcion ?? null,
      logoUrl: row.logo ?? null,
      coverUrl: row.url_cover ?? null,
      orden: row.orden ?? 0,
    }));
}
