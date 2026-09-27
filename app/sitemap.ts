import type { MetadataRoute } from "next"

import { localeUrl } from "@/i18n/navigation"
import { LIVE_LOCALES } from "@/i18n/routing"
import { languageAlternates } from "@/lib/metadata"
import { CONTENT_UPDATED } from "@/lib/site"

const PAGES = ["/", "/privacy"]

/**
 * Only indexable pages, once per live language, each with its hreflang set
 * (none while English is the only one). `lastModified` is when the copy last changed, not the
 * build time: Google uses it only while it stays truthful, and ignores
 * `changeFrequency` and `priority` altogether, so neither is set.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((path) => {
    const languages = languageAlternates(path, localeUrl)
    return LIVE_LOCALES.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified: CONTENT_UPDATED,
      ...(languages && { alternates: { languages } }),
    }))
  })
}
