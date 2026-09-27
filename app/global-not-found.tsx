import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import "./[locale]/(marketing)/marketing.css"
import { Logo } from "@/components/marketing/logo"
import { NotFoundMessage } from "@/components/marketing/not-found-message"
import { THEME } from "@/cad"
import { DIRECTION, routing } from "@/i18n/routing"
import { SITE_NAME } from "@/lib/site"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Outside `[locale]` there is no language to read, so it is named: without it
// the request config would find no root param and answer with notFound().
const locale = routing.defaultLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "NotFound" })
  return { title: `${t("metaTitle")} · ${SITE_NAME}` }
}

export const viewport: Viewport = {
  themeColor: THEME.background,
  colorScheme: "dark",
}

/**
 * The safety net for URLs that never reach a language's own 404
 * (`[locale]/(marketing)/not-found.tsx`), in the default language.
 */
export default async function GlobalNotFound() {
  const t = await getTranslations({ locale, namespace: "NotFound" })
  return (
    <html
      lang={locale}
      dir={DIRECTION[locale]}
      className={`${inter.variable} ${fontMono.variable}`}
    >
      <body>
        <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-8 px-6">
          <Link href="/" aria-label={t("home")} className="self-start">
            <Logo />
          </Link>
          <NotFoundMessage locale={locale} />
        </main>
      </body>
    </html>
  )
}
