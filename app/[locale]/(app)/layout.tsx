import { Geist_Mono, Inter, Readex_Pro } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages, getTranslations } from "next-intl/server"

import "./globals.css"
import { THEME } from "@/cad"
import { DirectionProvider } from "@/components/ui/direction"
import { localePath } from "@/i18n/navigation"
import { DIRECTION, OG_LOCALE, routing } from "@/i18n/routing"
import { scriptFontVariables } from "@/lib/fonts"
import { EDITOR_PATH, SITE_NAME, SITE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"
import { PALETTE_LAYOUT_SCRIPT } from "@/lib/palette-layout"
import { EDITOR_SHEET_ID, VIEW_TRANSITION_OPT_IN } from "@/lib/view-transition"

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// The editor is shared as a link, so it carries a preview — but it has nothing
// to index, in any language, so it has no hreflang either. `follow` stays on
// and robots.txt must not block it, or crawlers could never read this noindex.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("Metadata")
  const og = await getTranslations("Og")
  const image = {
    url: localePath(locale, "/og/draw"),
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

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    // The head script writes the palette panel's layout on <html> before
    // React hydrates (lib/palette-layout.ts); the DOM wins.
    <html
      suppressHydrationWarning
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
      })}
    >
      <head>
        <style>{VIEW_TRANSITION_OPT_IN}</style>
        <script dangerouslySetInnerHTML={{ __html: PALETTE_LAYOUT_SCRIPT }} />
        <link rel="expect" href={`#${EDITOR_SHEET_ID}`} blocking="render" />
      </head>
      <body>
        {/* Only the editor's own messages reach the browser: without an
            explicit `messages`, the provider would ship every message of
            the site. */}
        <NextIntlClientProvider messages={{ Editor: messages.Editor }}>
          <DirectionProvider direction={DIRECTION[locale]}>
            {children}
          </DirectionProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
