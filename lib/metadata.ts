import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { localePath } from "@/i18n/navigation"
import {
  type AppLocale,
  LIVE_LOCALES,
  OG_LOCALE,
  routing,
} from "@/i18n/routing"
import { OG_IMAGE_PATH, SITE_NAME } from "@/lib/site"

/**
 * The hreflang set of a page: every live language and `x-default`, the English
 * URL. Each version lists itself and all the others. With a single live
 * language there is nothing to point at, so nothing is emitted. Metadata takes
 * paths; the sitemap passes `localeUrl` for full URLs.
 */
export function languageAlternates(
  path: string,
  href: (locale: AppLocale, path: string) => string = localePath
): Record<string, string> | undefined {
  if (LIVE_LOCALES.length < 2) return undefined
  return Object.fromEntries([
    ...LIVE_LOCALES.map((locale) => [locale, href(locale, path)]),
    ["x-default", href(routing.defaultLocale, path)],
  ])
}

/**
 * A page's canonical URL, its language versions and its share card, in the
 * language being rendered. Next merges `openGraph` and `twitter` shallowly — a
 * page that sets either replaces the layout's whole object — so every page
 * builds both complete, here.
 *
 * The card is the `/og` route of the page's language, named explicitly: a
 * metadata image file inside `[locale]` would give English a `/en/…` URL, and
 * one in a route group gets a hashed URL that structured data cannot cite.
 */
export async function pageMetadata({
  path,
  title,
  description,
  contentLocale,
}: {
  path: string
  title: string
  description: string
  /**
   * The one language a page is written in, when it has no other (the docs'
   * "Build" section is English): every language's URL names that one as its
   * canonical, and there are no language versions to list.
   */
  contentLocale?: AppLocale
}): Promise<Metadata> {
  const pageLocale = await getLocale()
  const locale = contentLocale ?? pageLocale
  const t = await getTranslations("Metadata")
  const image = {
    url: localePath(pageLocale, OG_IMAGE_PATH),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: t("ogAlt"),
  }
  const languages = contentLocale ? undefined : languageAlternates(path)
  return {
    alternates: {
      canonical: localePath(locale, path),
      ...(languages && { languages }),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      ...(languages && {
        alternateLocale: LIVE_LOCALES.filter((other) => other !== locale).map(
          (other) => OG_LOCALE[other]
        ),
      }),
      url: localePath(locale, path),
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}
