import { getTranslations } from "next-intl/server"

import { localeUrl } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { pageMarkdown } from "@/lib/docs/markdown"
import { canonicalPath, ownPages } from "@/lib/docs/pages"
import { SITE_NAME } from "@/lib/site"

export const dynamic = "force-static"

/**
 * `llms-full.txt`: every English docs page's Markdown in one file, in the
 * navigation's order, each under its URL — for an agent that reads the docs
 * whole instead of following `llms.txt`'s links.
 */
export async function GET() {
  const locale = routing.defaultLocale
  const metadata = await getTranslations({ locale, namespace: "Metadata" })
  const pages = await Promise.all(
    ownPages(locale).map(
      async (page) =>
        `Source: ${localeUrl(locale, canonicalPath(page))}\n\n${await pageMarkdown(page)}`
    )
  )
  const text = [
    `# ${SITE_NAME}\n\n> ${metadata("description")}`,
    ...pages,
  ].join("\n\n---\n\n")
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
