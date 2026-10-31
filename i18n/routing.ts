import { defineRouting } from "next-intl/routing"

// English keeps today's URLs (`/`, `/draw`); the others live under a prefix,
// their tag unless it names a region: URLs are lower case (`/pt-br`), the tag
// keeps its BCP 47 case everywhere else (catalogs, `lang`, hreflang).
const PREFIXES: Readonly<Record<string, `/${string}`>> = { "pt-BR": "/pt-br" }

/**
 * The site's languages, and the one source of truth for them: the URL scheme,
 * the rewrites in `next.config.ts`, the static params of both root layouts,
 * the sitemap and the metadata all read this.
 */
export const routing = defineRouting({
  locales: ["en", "es", "ar", "pt-BR"],
  defaultLocale: "en",
  localePrefix: { mode: "as-needed", prefixes: PREFIXES },
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
 * A language's URL segment: what `[locale]` holds, and what every prefixed
 * path starts with (`pt-br` for `pt-BR`).
 */
export function localeSegment(locale: AppLocale): string {
  return PREFIXES[locale]?.slice(1) ?? locale
}

const SEGMENT_LOCALES: ReadonlyMap<string, AppLocale> = new Map(
  routing.locales.map((locale) => [localeSegment(locale), locale])
)

/**
 * The language a `[locale]` segment names, or none. WHY a map and not a
 * case-insensitive match: `/pt-BR/…` is not served (Next matches routes
 * without case, so a redirect from it to `/pt-br/…` would loop), and the
 * prefix need not be the tag at all.
 */
export function segmentLocale(segment: string): AppLocale | undefined {
  return SEGMENT_LOCALES.get(segment)
}

/** Every language's segment, as `generateStaticParams` gives `[locale]`. */
export function localeParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale: localeSegment(locale) }))
}

/**
 * The reading direction of each language. A static map rather than
 * `Intl.Locale#getTextInfo()`, which not every browser has, so the server and
 * any client agree.
 */
export const DIRECTION: Readonly<Record<AppLocale, "ltr" | "rtl">> = {
  en: "ltr",
  es: "ltr",
  ar: "rtl",
  "pt-BR": "ltr",
}

/**
 * `live`: announced — in the language selector, the hreflang set and the
 * sitemap. `draft`: served and reachable by URL, but `noindex` and announced
 * nowhere, until it is complete and reviewed.
 */
export const LOCALE_STATUS: Readonly<Record<AppLocale, "live" | "draft">> = {
  en: "live",
  es: "live",
  ar: "live",
  "pt-BR": "live",
}

export const LIVE_LOCALES: readonly AppLocale[] = routing.locales.filter(
  (locale) => LOCALE_STATUS[locale] === "live"
)

/**
 * Where each language's command language comes from. `localized`: its own
 * AutoCAD's, copied whole into the engine's catalog — a user of that AutoCAD
 * types its names, so a language that has one never goes live without it.
 * `global`: the global commands, for English and for a language Autodesk does
 * not ship (Arabic: docs/i18n/ar.md). Checked by `languages.test.ts`.
 */
export const COMMAND_LANGUAGE: Readonly<
  Record<AppLocale, "localized" | "global">
> = {
  en: "global",
  es: "localized",
  ar: "global",
  "pt-BR": "localized",
}

/**
 * The script each language is written in. Any but latin needs a face Inter
 * and Geist Mono lack, which `scriptFontVariables` then requires by type.
 */
export const SCRIPT: Readonly<Record<AppLocale, "latin" | "arabic">> = {
  en: "latin",
  es: "latin",
  ar: "arabic",
  "pt-BR": "latin",
}

export type NonLatinScript = Exclude<(typeof SCRIPT)[AppLocale], "latin">

/**
 * Each language named in itself, as the language selector offers it — a
 * reader looks for their own language's name, and never for a flag, which
 * stands for a country.
 */
export const LANGUAGE_NAMES: Readonly<Record<AppLocale, string>> = {
  en: "English",
  es: "Español",
  ar: "العربية",
  "pt-BR": "Português (Brasil)",
}

/** Open Graph wants language and territory. */
export const OG_LOCALE: Readonly<Record<AppLocale, string>> = {
  en: "en_US",
  es: "es_ES",
  ar: "ar_AR",
  "pt-BR": "pt_BR",
}
