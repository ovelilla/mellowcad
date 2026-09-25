import type { MetadataRoute } from "next"
import { getTranslations } from "next-intl/server"

import { BRAND } from "@/lib/brand"
import { EDITOR_PATH, SITE_NAME } from "@/lib/site"

/** Installing the site installs the editor: it starts at /draw, not the landing. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations("Metadata")
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: t("appDescription"),
    start_url: EDITOR_PATH,
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
}
