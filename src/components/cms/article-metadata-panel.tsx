"use client";

import { useState } from "react";
import { buildApaCitation } from "@/lib/cms/apa";
import type { Article, ArticleType, MediaItem, MediaType } from "@/lib/cms/types";
import { useText } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n/messages";
/** Official Creative Commons icons (the ones Commons shows), keyed by license-name token. */
const LICENSE_ICONS: Record<string, string> = {
  CC: "cc",
  BY: "by",
  SA: "sa",
  NC: "nc",
  ND: "nd",
  CC0: "zero",
  PD: "pd",
  PUBLIC: "pd",
};

const MEDIA_TO_ARTICLE_TYPE: Record<MediaType, ArticleType> = {
  imagen: "galeria",
  video: "video",
  audio: "audio",
  documento: "documento",
};

function LicenseIcons({ license }: { license: string }) {
  const tokens = license.toUpperCase().split(/[\s\-/]+/);
  const icons = tokens.filter((token, index) => token in LICENSE_ICONS && tokens.indexOf(token) === index);
  if (icons.length === 0) return <span>{license}</span>;
  // "CC0" and public domain are the whole mark; otherwise lead with the generic CC badge.
  const standalone = icons.includes("CC0") || icons.includes("PD") || icons.includes("PUBLIC");
  const list = standalone || icons[0] === "CC" ? icons : ["CC", ...icons];
  return (
    <span className="flex items-center gap-1.5" title={license}>
      {list.map((token) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={token} src={`/licenses/${LICENSE_ICONS[token]}.svg`} alt="" aria-hidden className="h-6 w-6" />
      ))}
      <span className="sr-only">{license}</span>
    </span>
  );
}

function MetaBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <h3 className="mb-1.5 font-sans text-[11px] font-bold uppercase tracking-wide text-brown-dark dark:text-coral">
        {label}
      </h3>
      <div className="font-sans text-[13px] leading-relaxed text-black dark:text-cream">
        {children}
      </div>
    </div>
  );
}

function formatDate(date: Date | null, TEXT: Messages) {
  if (!date) return null;
  // Sheet dates are UTC midnight; reading the UTC parts keeps server and browser output identical (no hydration mismatch).
  return TEXT.formatDate({
    day: date.getUTCDate(),
    month: TEXT.Months[date.getUTCMonth()],
    year: date.getUTCFullYear(),
  });
}

/** `activeMedia` is the file on screen in a gallery; its own description, license and links replace the article's. */
export function ArticleMetadataPanel({
  article,
  activeMedia = null,
}: {
  article: Article;
  activeMedia?: MediaItem | null;
}) {
  const TEXT = useText();
  const t = TEXT.Article;
  const tTypes = TEXT.ArticleTypes;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const publicado = formatDate(article.fechaPublicacion, TEXT);
  // Por ahora la descripción es la del Excel (seo_description, ya en el idioma actual). Antes venía de la wiki:
  // const description = activeMedia?.description ?? article.commonsDescription ?? article.seoDescription;
  const description = article.seoDescription;
  // The license is only what Commons says about the file on screen; with none there is nothing to show.
  const license = activeMedia ? activeMedia.license : article.commonsLicense;
  const licenseUrl = activeMedia ? activeMedia.licenseUrl : article.commonsLicenseUrl;
  const repositoryUrl = activeMedia?.url ?? article.wikimediaUrl;
  const keywords = activeMedia?.keywords?.length ? activeMedia.keywords : article.keywords;
  // The citation names the kind of file cited: an image of a multiformato story is cited as a gallery, a video as a video…
  const citedType = activeMedia ? MEDIA_TO_ARTICLE_TYPE[activeMedia.type] : article.tipo;
  const apa = buildApaCitation({ ...article, citationUrl: activeMedia?.sourceUrl ?? article.citationUrl }, {
    medium: tTypes[citedType],
    publisher: t.publisher,
    noDate: t.noDate,
    and: t.and,
  });


  return (
    <aside>
      <h2 className="mb-4 border-b border-[#e0e0e0] pb-3 font-display text-2xl dark:border-white/20 dark:text-cream">
        {t.metadata}
      </h2>

      {description && (
        <>
          <MetaBlock label={t.description}>
            <p
              className={`text-black/80 dark:text-cream/80 ${isDescriptionExpanded ? "" : "line-clamp-4"}`}
            >
              {description}
            </p>
            <button
              type="button"
              onClick={() => setIsDescriptionExpanded((value) => !value)}
              className="mt-1 cursor-pointer font-sans text-xs font-semibold text-green underline"
            >
              {isDescriptionExpanded ? t.readLess : t.readMore}
            </button>
          </MetaBlock>
          <div className="my-4 h-px bg-[#e0e0e0] dark:bg-white/20" />
        </>
      )}

      {keywords.length > 0 && (
        <MetaBlock label={t.keywords}>
          <ul className="flex flex-wrap gap-1.5">
            {keywords.map((keyword) => (
              <li
                key={keyword}
                className="rounded bg-[#f0f0f0] px-2 py-0.5 text-xs dark:bg-white/10"
              >
                {keyword}
              </li>
            ))}
          </ul>
        </MetaBlock>
      )}

      {license && (
        <MetaBlock label={t.license}>
          {licenseUrl ? (
            <a href={licenseUrl} target="_blank" rel="noreferrer" className="inline-block">
              <LicenseIcons license={license} />
            </a>
          ) : (
            <LicenseIcons license={license} />
          )}
        </MetaBlock>
      )}

      <MetaBlock label={t.mediaType}>{tTypes[article.tipo]}</MetaBlock>

      {publicado && <MetaBlock label={t.publishedOn}>{publicado}</MetaBlock>}

      {repositoryUrl && (
        <MetaBlock label={t.repositoryLink}>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all text-blue underline"
          >
            {repositoryUrl}
          </a>
        </MetaBlock>
      )}

      <MetaBlock label={t.citeThis}>
        <p className="break-words">
          {apa.authors ? `${apa.authors} ` : ""}({apa.year}). <em>{apa.title}</em> [{apa.medium}].{" "}
          {apa.publisher}.{apa.url && (
            <>
              {" "}
              <a href={apa.url} target="_blank" rel="noreferrer" className="break-all underline">
                {apa.url}
              </a>
            </>
          )}
        </p>
      </MetaBlock>
    </aside>
  );
}
