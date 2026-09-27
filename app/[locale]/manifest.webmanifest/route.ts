import type { MetadataRoute } from "next"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"

import { localePath } from "@/i18n/navigation"
import { DIRECTION, routing } from "@/i18n/routing"
import { BRAND } from "@/lib/brand"
import { EDITOR_PATH, SITE_NAME } from "@/lib/site"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/**
 * Installing the site installs the editor: it starts at the editor of this
 * language, not the landing. The `id` defaults to `start_url`, so each language
 * installs as an app of its own, whose name and language never change because
 * the user visits another.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    return new Response(null, { status: 404 })
  }
  const t = await getTranslations({ locale, namespace: "Metadata" })
  const manifest: MetadataRoute.Manifest & { dir: string; lang: string } = {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: t("appDescription"),
    lang: locale,
    dir: DIRECTION[locale],
    start_url: localePath(locale, EDITOR_PATH),
    scope: "/",
    display: "standalone",
    background_color: BRAND.sheet,
    theme_color: BRAND.sheet,
    categories: ["design", "productivity", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  })
}
