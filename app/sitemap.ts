import type { MetadataRoute } from "next"

import { localeUrl } from "@/i18n/navigation"
import { LIVE_LOCALES } from "@/i18n/routing"
import { DOCS_PATH } from "@/lib/docs/packages"
import { lastCommitDay } from "@/lib/docs/last-modified"
import {
  canonicalPath,
  isTranslated,
  ownPages,
  pageSource,
} from "@/lib/docs/pages"
import { languageAlternates } from "@/lib/metadata"
import { CONTENT_UPDATED } from "@/lib/site"

const PAGES = ["/", "/privacy", DOCS_PATH]

/**
 * Only indexable pages, once per live language, each with its hreflang set
 * (none while English is the only one). `lastModified` is when the copy last changed, not the
 * build time: Google uses it only while it stays truthful, and ignores
 * `changeFrequency` and `priority` altogether, so neither is set.
 *
 * A docs page is listed in the languages it is written in: one written in
 * every language with its hreflang set, one in English only without. Its
 * `lastModified` is the last commit to its file and the package file it
 * includes (a generated page's file is rewritten with what it says), left
 * out where the build's history cannot tell.
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
    ownPages(locale).map((page) => {
      const languages = isTranslated(page)
        ? languageAlternates(canonicalPath(page), localeUrl)
        : undefined
      const files = [page.data.info.fullPath, pageSource(page)?.file]
      const lastModified = lastCommitDay(
        files.filter((file) => file !== undefined)
      )
      return {
        url: localeUrl(locale, canonicalPath(page)),
        ...(lastModified && { lastModified }),
        ...(languages && { alternates: { languages } }),
      }
    })
  )
  return [...site, ...docs]
}
