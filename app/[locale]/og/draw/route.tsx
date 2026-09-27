import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"

import { routing } from "@/i18n/routing"
import { ogImage } from "@/lib/og"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/** The editor's share card: the same drawing, headed with the invitation. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    return new Response(null, { status: 404 })
  }
  const og = await getTranslations({ locale, namespace: "Og" })
  return ogImage({ locale, eyebrow: og("tagline"), title: og("drawTitle") })
}
