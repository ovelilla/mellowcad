import { Geist_Mono, Inter, Readex_Pro } from "next/font/google"
import localFont from "next/font/local"
import type { Metadata, Viewport } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import "./globals.css"
import { paletteLayoutScript } from "@mellowcad/editor"
import { THEME } from "@mellowcad/engine"
import { localePath } from "@/i18n/navigation"
import { DIRECTION, OG_LOCALE, localeParams } from "@/i18n/routing"
import { scriptFontVariables } from "@/lib/fonts"
import {
  EDITOR_LAYOUT_STORAGE,
  EDITOR_OG_IMAGE_PATH,
  EDITOR_PATH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site"
import { EditorMetrics } from "@/components/editor-metrics"
import { cn } from "@/lib/utils"
import { EDITOR_SHEET_ID, VIEW_TRANSITION_OPT_IN } from "@/lib/view-transition"

export const dynamicParams = false

export function generateStaticParams() {
  return localeParams()
}

// The editor is shared as a link, so it carries a preview — but it has nothing
// to index, in any language, so it has no hreflang either. `follow` stays on
// and robots.txt must not block it, or crawlers could never read this noindex.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("Metadata")
  const og = await getTranslations("Og")
  const image = {
    url: localePath(locale, EDITOR_OG_IMAGE_PATH),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: t("ogAlt"),
  }
  return {
    metadataBase: new URL(SITE_URL),
    title: `${t("drawTitle")} · ${SITE_NAME}`,
    description: t("drawDescription"),
    applicationName: SITE_NAME,
    manifest: localePath(locale, "/manifest.webmanifest"),
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${og("tagline")}`,
      description: t("drawDescription"),
      url: localePath(locale, EDITOR_PATH),
      locale: OG_LOCALE[locale],
      images: [image],
    },
    twitter: { card: "summary_large_image", images: [image] },
  }
}

export const viewport: Viewport = {
  themeColor: THEME.background,
  colorScheme: "dark",
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Arabic only, behind Inter (lib/fonts.ts). Not preloaded: a preload here
// would fetch it on every page of every language; its `unicode-range` and the
// one page whose font stack names it keep it to Arabic.
const fontArabic = Readex_Pro({ subsets: ["arabic"], preload: false })

// Polish's, Czech's and Hungarian's letters alone, before Inter and Geist Mono on their
// pages (lib/fonts.ts, assets/fonts/README.md). The range is a literal: next/font
// reads its options statically. One range for Latin Extended-A: only a Polish,
// Czech or Hungarian page names the face, and a letter it lacks there falls through to
// Inter.
const fontLettersSans = localFont({
  src: "../../../assets/fonts/inter-letters-wght.woff2",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0104-017E",
    },
  ],
})

const fontLettersMono = localFont({
  src: "../../../assets/fonts/geist-mono-letters-wght.woff2",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0104-017E",
    },
  ],
})

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      dir={DIRECTION[locale]}
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
      style={scriptFontVariables(locale, {
        sans: inter,
        mono: fontMono,
        arabic: fontArabic,
        "latin-ext": { sans: fontLettersSans, mono: fontLettersMono },
      })}
    >
      <head>
        <style>{VIEW_TRANSITION_OPT_IN}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: paletteLayoutScript(EDITOR_LAYOUT_STORAGE.palette),
          }}
        />
        <link rel="expect" href={`#${EDITOR_SHEET_ID}`} blocking="render" />
      </head>
      <body>
        {children}
        <EditorMetrics />
      </body>
    </html>
  )
}
