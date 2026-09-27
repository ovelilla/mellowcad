import { defineRouting } from "next-intl/routing"

/**
 * The site's languages, and the one source of truth for them: the URL scheme,
 * the rewrites in `next.config.ts`, the static params of both root layouts,
 * the sitemap and the metadata all read this.
 */
export const routing = defineRouting({
  locales: ["en", "es", "ar"],
  defaultLocale: "en",
  // English keeps today's URLs (`/`, `/draw`); the others live under a prefix.
  localePrefix: "as-needed",
  // No negotiation by Accept-Language: Google advises against it and its
  // crawlers do not send one. Without detection the cookie has no use either,
  // and the privacy notice can go on saying there are no cookies.
  localeDetection: false,
  localeCookie: false,
  // The hreflang set goes in the HTML and the sitemap, both generated from
  // `routing`; the header would be a third copy to keep in step.
  alternateLinks: false,
})

export type AppLocale = (typeof routing.locales)[number]

/**
 * The reading direction of each language. A static map rather than
 * `Intl.Locale#getTextInfo()`, which not every browser has, so the server and
 * any client agree.
 */
export const DIRECTION: Readonly<Record<AppLocale, "ltr" | "rtl">> = {
  en: "ltr",
  es: "ltr",
  ar: "rtl",
}

/**
 * `live`: announced — in the language selector, the hreflang set and the
 * sitemap. `draft`: served and reachable by URL, but `noindex` and announced
 * nowhere, until it is complete and reviewed.
 */
export const LOCALE_STATUS: Readonly<Record<AppLocale, "live" | "draft">> = {
  en: "live",
  es: "draft",
  ar: "draft",
}

export const LIVE_LOCALES: readonly AppLocale[] = routing.locales.filter(
  (locale) => LOCALE_STATUS[locale] === "live"
)

/** Open Graph wants language and territory. */
export const OG_LOCALE: Readonly<Record<AppLocale, string>> = {
  en: "en_US",
  es: "es_ES",
  ar: "ar_AR",
}
