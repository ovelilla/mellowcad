import { Geist_Mono, Inter, Readex_Pro } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import "./marketing.css"
import { THEME, themeCustomProperties } from "@mellowcad/engine"
import { SheetFrame } from "@/components/marketing/sheet-frame"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { SpeculationRules } from "@/components/marketing/speculation-rules"
import { DirectionProvider } from "@/components/ui/direction"
import { localePath } from "@/i18n/navigation"
import { DIRECTION, LOCALE_STATUS, localeParams } from "@/i18n/routing"
import { scriptFontVariables } from "@/lib/fonts"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import { VIEW_TRANSITION_OPT_IN } from "@/lib/view-transition"

// Every language is prerendered; any other first segment is not a language.
export const dynamicParams = false

export function generateStaticParams() {
  return localeParams()
}

// Inter's `opsz` axis (the Display cut at headline sizes) costs ~25 KB more
// woff2, which the first-load budget cannot spare next to the framework
// runtime; the headlines' tracking is tightened to make up for it instead.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Arabic only, behind Inter (lib/fonts.ts). Not preloaded: a preload here
// would fetch it on every page of every language; its `unicode-range` and the
// one page whose font stack names it keep it to Arabic.
const fontArabic = Readex_Pro({ subsets: ["arabic"], preload: false })

// Polish's and Czech's letters alone, cut from Inter's and Geist Mono's Latin
// Extended files (assets/fonts/README.md), before them on those pages
// (lib/fonts.ts).
// The range is a literal: next/font reads its options statically.
const fontLettersSans = localFont({
  src: "../../../assets/fonts/inter-letters-wght.woff2",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0104-0107, U+010C-010F, U+0118-011B, U+0141-0144, U+0147-0148, U+0158-015B, U+0160-0161, U+0164-0165, U+016E-016F, U+0179-017E",
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
      value:
        "U+0104-0107, U+010C-010F, U+0118-011B, U+0141-0144, U+0147-0148, U+0158-015B, U+0160-0161, U+0164-0165, U+016E-016F, U+0179-017E",
    },
  ],
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("Metadata")
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    applicationName: SITE_NAME,
    manifest: localePath(locale, "/manifest.webmanifest"),
    // A draft language is reachable by URL but not offered to search engines.
    ...(LOCALE_STATUS[locale] === "draft" && {
      robots: { index: false, follow: true },
    }),
    // Search Console and Bing Webmaster Tools tokens, when the deployment has
    // them; nothing is emitted otherwise.
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : undefined,
    },
  }
}

export const viewport: Viewport = {
  themeColor: THEME.background,
  colorScheme: "dark",
}

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const common = await getTranslations("Common")
  // The drawings' colours, written from the engine's own THEME so the
  // figures and the editor can never drift apart.
  const themeStyle = `:root{${themeCustomProperties()}}`
  return (
    <html
      lang={locale}
      dir={DIRECTION[locale]}
      className={`${inter.variable} ${fontMono.variable}`}
      style={scriptFontVariables(locale, {
        sans: inter,
        mono: fontMono,
        arabic: fontArabic,
        "latin-ext": { sans: fontLettersSans, mono: fontLettersMono },
      })}
    >
      <head>
        <style>{themeStyle}</style>
        <style>{VIEW_TRANSITION_OPT_IN}</style>
      </head>
      <body>
        <DirectionProvider direction={DIRECTION[locale]}>
          <a
            href="#content"
            className="sr-only z-50 rounded-md bg-accent px-4 py-2 font-medium text-accent-ink focus:not-sr-only focus:fixed focus:inset-s-3 focus:top-3"
          >
            {common("skipToContent")}
          </a>
          <SheetFrame />
          <SiteHeader />
          <main id="content" className="relative">
            {children}
          </main>
          <SiteFooter />
        </DirectionProvider>
        <SpeculationRules />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
