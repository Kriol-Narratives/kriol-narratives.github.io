// Limpia el HTML que exporta Google Docs conservando el formato que el autor le dio al documento
// (negrita, cursiva, subrayado, tamaños, alineación, sangría, colores, imágenes con su tamaño),
// pero sin el CSS propio de Google: todo pasa por una lista de formatos permitidos.

const BODY_PT = 11; // tamaño base de Docs; los demás tamaños se expresan en proporción a este (em)
const HEADING = /^h[1-6]$/;

type Style = Record<string, string>;

function parseStyle(style: string): Style {
  const out: Style = {};
  for (const declaration of style.split(";")) {
    const index = declaration.indexOf(":");
    if (index < 0) continue;
    out[declaration.slice(0, index).trim().toLowerCase()] = declaration.slice(index + 1).trim().toLowerCase();
  }
  return out;
}

function getStyle(attrs: string): Style {
  return parseStyle(attrs.match(/\sstyle="([^"]*)"/i)?.[1] ?? "");
}

function stripGoogleAttrs(attrs: string): string {
  return attrs.replace(/\s(?:id|class|style)="[^"]*"/gi, "");
}

/** Google guarda el tamaño de cada imagen en su style (px): se pasa a atributos width/height. */
function imageTag(attrs: string): string {
  const style = getStyle(attrs);
  const width = style.width?.match(/^([\d.]+)px/)?.[1];
  const height = style.height?.match(/^([\d.]+)px/)?.[1];
  const cleaned = stripGoogleAttrs(attrs).replace(/\s(?:width|height)="[^"]*"/gi, "");
  if (!width) return `<img${cleaned}>`;
  return `<img width="${Math.round(Number(width))}"${height ? ` height="${Math.round(Number(height))}"` : ""}${cleaned}>`;
}

function isNearBlackOrWhite(hex: string): boolean {
  const match = hex.match(/^#([0-9a-f]{6})$/);
  if (!match) return false;
  const value = parseInt(match[1], 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.15 || luminance > 0.92; // el texto negro/blanco depende del tema claro/oscuro
}

function blockStyle(style: Style, isHeading: boolean): string {
  const parts: string[] = [];
  const align = style["text-align"];
  if (align === "center" || align === "right" || align === "justify") parts.push(`text-align:${align}`);
  const margin = style["margin-left"]?.match(/^([\d.]+)(pt|px)$/);
  if (!isHeading && margin && Number(margin[1]) > 0) parts.push(`margin-left:${margin[1]}${margin[2]}`);
  return parts.length ? ` style="${parts.join(";")}"` : "";
}

/** Un <span> de Google se convierte en etiquetas semánticas (strong, em, u...) según su estilo. */
function spanTags(style: Style, inHeading: boolean, inLink: boolean): { open: string; close: string } {
  const open: string[] = [];
  const close: string[] = [];
  const wrap = (tag: string) => {
    open.push(`<${tag}>`);
    close.unshift(`</${tag}>`);
  };

  const css: string[] = [];
  const size = style["font-size"]?.match(/^([\d.]+)pt$/);
  if (size && !inHeading) {
    const ratio = Number(size[1]) / BODY_PT;
    if (Math.abs(ratio - 1) > 0.03) css.push(`font-size:${Math.round(ratio * 100) / 100}em`);
  }
  const color = style.color;
  // --doc-color deja que el modo oscuro aclare el tono sin perder el color elegido (ver globals.css)
  if (color && !inLink && !isNearBlackOrWhite(color)) css.push(`--doc-color:${color};color:var(--doc-color)`);
  if (css.length) {
    open.push(`<span style="${css.join(";")}">`);
    close.unshift("</span>");
  }

  const weight = style["font-weight"];
  if (weight === "bold" || Number(weight) >= 600) wrap("strong");
  if (style["font-style"] === "italic") wrap("em");
  const decoration = style["text-decoration"] ?? "";
  if (decoration.includes("underline") && !inLink) wrap("u");
  if (decoration.includes("line-through")) wrap("s");
  const align = style["vertical-align"];
  if (align === "super") wrap("sup");
  else if (align === "sub") wrap("sub");

  return { open: open.join(""), close: close.join("") };
}

export function cleanGoogleDocHtml(html: string): string {
  const closers: string[] = []; // cierres pendientes de cada <span> abierto
  let headingDepth = 0;
  let linkDepth = 0;

  const cleaned = html.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_tag, slash: string, rawName: string, attrs: string) => {
    const name = rawName.toLowerCase();

    if (name === "span") return slash ? (closers.pop() ?? "") : spanOpen(attrs);
    if (HEADING.test(name)) {
      headingDepth += slash ? -1 : 1;
      return slash ? `</${name}>` : `<${name}${blockStyle(getStyle(attrs), true)}${stripGoogleAttrs(attrs)}>`;
    }
    if (name === "a") {
      linkDepth += slash ? -1 : 1;
      return slash ? "</a>" : `<a${stripGoogleAttrs(attrs)}>`;
    }
    if (slash) return `</${name}>`;
    if (name === "img") return imageTag(attrs);
    if (name === "p") return `<p${blockStyle(getStyle(attrs), false)}${stripGoogleAttrs(attrs)}>`;
    return `<${name}${stripGoogleAttrs(attrs)}>`;
  });

  function spanOpen(attrs: string): string {
    const { open, close } = spanTags(getStyle(attrs), headingDepth > 0, linkDepth > 0);
    closers.push(close);
    return open;
  }

  return (
    cleaned
      // Párrafos vacíos (líneas en blanco del Doc): quedan como <p></p>; el CSS los oculta salvo en .doc-compact.
      .replace(/<p(?:\s[^>]*)?>\s*<\/p>/gi, "<p></p>")
      // …pero no al inicio ni al final: el primer párrafo puede ser el título del doc.
      .replace(/^(\s*<p><\/p>)+|(<p><\/p>\s*)+$/g, "")
      .trim()
  );
}
