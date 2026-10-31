import { getTranslations } from "next-intl/server"

import { localeParams, segmentLocale } from "@/i18n/routing"
import { ogImage } from "@/lib/og"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return localeParams()
}

/** The editor's share card: the same drawing, headed with the invitation. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const locale = segmentLocale((await params).locale)
  if (!locale) {
    return new Response(null, { status: 404 })
  }
  const og = await getTranslations({ locale, namespace: "Og" })
  return ogImage({ locale, eyebrow: og("tagline"), title: og("drawTitle") })
}
