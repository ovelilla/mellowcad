import { Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import "./marketing.css"
import { THEME, themeCustomProperties } from "@/cad"
import { SheetFrame } from "@/components/marketing/sheet-frame"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { SpeculationRules } from "@/components/marketing/speculation-rules"
import { DirectionProvider } from "@/components/ui/direction"
import { localePath } from "@/i18n/navigation"
import { DIRECTION, LOCALE_STATUS, routing } from "@/i18n/routing"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import { VIEW_TRANSITION_OPT_IN } from "@/lib/view-transition"

// Every language is prerendered; any other first segment is not a language.
export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
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
  return (
    <html
      lang={locale}
      dir={DIRECTION[locale]}
      className={`${inter.variable} ${fontMono.variable}`}
    >
      <head>
        {/* The drawings' colours, written from the engine's own THEME so the
            figures and the editor can never drift apart. */}
        <style>{`:root{${themeCustomProperties()}}`}</style>
        <style>{VIEW_TRANSITION_OPT_IN}</style>
      </head>
      <body>
        <DirectionProvider direction={DIRECTION[locale]}>
          <a
            href="#content"
            className="text-accent-ink sr-only z-50 rounded-md bg-accent px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:inset-s-3 focus:top-3"
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
