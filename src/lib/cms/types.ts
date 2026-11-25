export type ArticleStatus = "Publicado" | "Borrador";

export type ArticleType = "audio" | "video" | "documento" | "galeria" | "multiformato";

export type MediaType = "audio" | "video" | "documento" | "imagen";

export type MediaItem = {
  type: MediaType;
  url: string;
  /** The sheet cell exactly as written, used to cite this file. */
  sourceUrl?: string;
  /** Description and license of this file as they are on Commons, when available. */
  description?: string | null;
  license?: string | null;
  licenseUrl?: string | null;
  keywords?: string[];
};

export type Article = {
  id: string;
  slug: string;
  /** Slugs de esta misma historia en los demás idiomas, para que un link de otro idioma siga abriendo. */
  slugAliases: string[];
  categoriaSlug: string;
  estado: ArticleStatus;
  destacado: boolean;
  orden: number;
  tipo: ArticleType;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Optional `autoria` column; several authors may be separated by ";". */
  autoria: string | null;
  /** Optional `licencia` column, e.g. "CC BY-SA 4.0". */
  licencia: string | null;
  coverUrl: string | null;
  wikimediaUrl: string | null;
  /** The primary `wikimedia_url*` cell exactly as written in the sheet (before resolving to the direct file URL); used to cite the material. */
  citationUrl: string | null;
  /** Description and license of the primary file as they are on Commons; null when Commons has none. */
  commonsDescription: string | null;
  commonsLicense: string | null;
  commonsLicenseUrl: string | null;
  /** Optional `palabras_clave` column, separated by ";" or ",". */
  keywords: string[];
  fechaPublicacion: Date | null;
  fechaActualizacion: Date | null;
  /** Only populated when `tipo` is "multiformato" or "galeria": one entry per non-empty wikimedia_url* column. */
  mediaItems: MediaItem[];
};

export type InstitucionalPage = {
  id: string;
  slug: string;
  slugAliases: string[];
  estado: ArticleStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  coverUrl: string | null;
  /** Id del Google Doc del idioma actual, sacado de la columna `enlace_*`. */
  googleDocsId: string | null;
  fechaPublicacion: Date | null;
  fechaActualizacion: Date | null;
};

export type Category = {
  id: string;
  nombre: string | null;
  slug: string;
  slugAliases: string[];
  descripcion: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  orden: number;
};

export type MenuItem = {
  id: string;
  label: string;
  /** Ruta interna ("/memorias") o link externo ("https://…"). */
  href: string;
};

export type Memoria = {
  id: string;
  slug: string;
  slugAliases: string[];
  estado: ArticleStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  coverUrl: string | null;
  /** Id del Google Doc del idioma actual, sacado de la columna `enlace_*`. */
  googleDocsId: string | null;
  fechaPublicacion: Date | null;
  /** `relacionado_1` … `relacionado_5`: id_articulo (o slug) de otras memorias, en ese orden. */
  relatedRefs: string[];
};
