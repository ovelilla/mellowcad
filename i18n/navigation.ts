import { SITE_URL } from "@/lib/site"

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

/**
 * A page's path without its language, from the address bar or from the route
 * a prerender sees (`/es/privacy`, `/en/privacy` and `/privacy` all give
 * `/privacy`), so a link to the same page in another language comes out the
 * same on the server and in the browser.
 */
export function unlocalizedPath(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/"
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1)
    }
  }
  return pathname
}
