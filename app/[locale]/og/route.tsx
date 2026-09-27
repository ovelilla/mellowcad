import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"

import { routing } from "@/i18n/routing"
import { ogImage } from "@/lib/og"

// Drawn once per language when the site is built.
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/**
 * The landing's share card. A route handler rather than an `opengraph-image`
 * file: inside `[locale]` a metadata file would give English an `/en/…` URL
 * that redirects, and route handlers cannot read root params, so the locale
 * comes from `params` and is named to `getTranslations`.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    return new Response(null, { status: 404 })
  }
  const og = await getTranslations({ locale, namespace: "Og" })
  const hero = await getTranslations({ locale, namespace: "Hero" })
  return ogImage({ locale, eyebrow: og("tagline"), title: hero("title") })
}
