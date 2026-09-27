import { getLocale } from "next-intl/server"

import { EDITOR_PATH, SITE_URL } from "@/lib/site"

import { type AppLocale, routing } from "./routing"

/**
 * A path in `locale`: `/draw` in English, `/es/draw` in Spanish — what
 * next-intl's `getPathname` gives for this routing (slugs are not translated,
 * so it only adds the prefix; a test holds the two together). Every link to a
 * page of the site is built with it.
 *
 * WHY not next-intl's navigation: `createNavigation` registers its client
 * `Link` wherever it is imported, which puts next-intl's client runtime
 * (~12 KB gz) on the landing, and its `Link` with a `locale` forces the `/en`
 * prefix for a proxy to refresh a cookie — here, a redirect on every link to
 * English.
 */
export function localePath(locale: AppLocale, href: string): string {
  if (locale === routing.defaultLocale) return href
  return href === "/" ? `/${locale}` : `/${locale}${href}`
}

/** The same path as a full URL on the canonical host, for metadata and feeds. */
export function localeUrl(locale: AppLocale, href: string): string {
  return `${SITE_URL}${localePath(locale, href)}`
}

/** The site's own pages in the language being rendered. */
export async function sitePaths(): Promise<{
  readonly home: string
  readonly editor: string
  readonly privacy: string
}> {
  const locale = await getLocale()
  return {
    home: localePath(locale, "/"),
    editor: localePath(locale, EDITOR_PATH),
    privacy: localePath(locale, "/privacy"),
  }
}
