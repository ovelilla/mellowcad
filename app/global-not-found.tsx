import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import "./(marketing)/marketing.css"
import { Logo } from "@/components/marketing/logo"
import { UnknownCommand } from "@/components/marketing/unknown-command"
import { THEME, engineText } from "@/cad"
import { EDITOR_PATH, SITE_NAME } from "@/lib/site"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound")
  return { title: `${t("metaTitle")} · ${SITE_NAME}` }
}

export const viewport: Viewport = {
  themeColor: THEME.background,
  colorScheme: "dark",
}

/**
 * Every unmatched URL, in either root layout's territory. It answers the way
 * AutoCAD answers a mistyped command — the requested path is the command.
 */
export default async function GlobalNotFound() {
  const t = await getTranslations("NotFound")
  // The engine's own words, as the command line would print them, then
  // AutoCAD's pointer to its help.
  const text = engineText()
  const unknown = text.message("unknownCommand", { name: "{command}" })
  return (
    <html lang="en" className={`${inter.variable} ${fontMono.variable}`}>
      <body>
        <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-8 px-6">
          <Link href="/" aria-label={t("home")} className="self-start">
            <Logo />
          </Link>
          <h1 className="sr-only">{t("metaTitle")}</h1>
          <p className="rounded-md border border-border bg-bg-sunken p-5 font-mono text-sm leading-relaxed">
            <span className="text-fg-subtle">{text.idlePrompt()} </span>
            <UnknownCommand
              fallback={t("fallbackCommand")}
              template={`${unknown}  ${t("help")}`}
            />
          </p>
          <p className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-md border border-border px-5 font-medium"
            >
              {t("home")}
            </Link>
            <a
              href={EDITOR_PATH}
              className="inline-flex h-11 items-center rounded-md bg-accent px-5 font-medium text-accent-ink"
            >
              {t("cta")}
            </a>
          </p>
        </main>
      </body>
    </html>
  )
}
