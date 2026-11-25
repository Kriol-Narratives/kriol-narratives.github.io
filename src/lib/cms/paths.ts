/** Ruta pública de una categoría (/ciencia) o de una historia (/ciencia/mecanica-cuantica). */
export function categoryPath(categorySlug: string, articleSlug?: string): string {
  return articleSlug ? `/${categorySlug}/${articleSlug}` : `/${categorySlug}`;
}
