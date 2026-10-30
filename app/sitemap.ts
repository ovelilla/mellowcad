import type { MetadataRoute } from "next"

import { localeUrl } from "@/i18n/navigation"
import { LIVE_LOCALES } from "@/i18n/routing"
import { DOCS_PATH } from "@/lib/docs/packages"
import { canonicalPath, ownPages } from "@/lib/docs/pages"
import { languageAlternates } from "@/lib/metadata"
import { CONTENT_UPDATED } from "@/lib/site"

const PAGES = ["/", "/privacy", DOCS_PATH]

/**
 * Only indexable pages, once per live language, each with its hreflang set
 * (none while English is the only one). `lastModified` is when the copy last changed, not the
 * build time: Google uses it only while it stays truthful, and ignores
 * `changeFrequency` and `priority` altogether, so neither is set.
 *
 * A docs page is listed in the languages it is written in, without
 * alternates: the others serve it under their prefix, canonical to it. It has
 * no `lastModified`: it changes with its README, which no date here follows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = PAGES.flatMap((path) => {
    const languages = languageAlternates(path, localeUrl)
    return LIVE_LOCALES.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified: CONTENT_UPDATED,
      ...(languages && { alternates: { languages } }),
    }))
  })
  const docs = LIVE_LOCALES.flatMap((locale) =>
    ownPages(locale).map((page) => ({
      url: localeUrl(locale, canonicalPath(page)),
    }))
  )
  return [...site, ...docs]
}
