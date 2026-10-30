import { getTranslations } from "next-intl/server"

import { routing } from "@/i18n/routing"
import { llmsText } from "@/lib/docs/markdown"
import { ownPages } from "@/lib/docs/pages"

export const dynamic = "force-static"

/** The docs for agents (llmstxt.org): each page with its Markdown. */
export async function GET() {
  const locale = routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "Docs" })
  const metadata = await getTranslations({ locale, namespace: "Metadata" })
  const text = llmsText(metadata("description"), [
    { title: t("buildTitle"), pages: ownPages(locale) },
  ])
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
