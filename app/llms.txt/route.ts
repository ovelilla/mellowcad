import { getTranslations } from "next-intl/server"

import { routing } from "@/i18n/routing"
import { docsSource } from "@/lib/docs/docs-source"
import { llmsText } from "@/lib/docs/markdown"
import { navSections, ownPages } from "@/lib/docs/pages"

export const dynamic = "force-static"

/** The docs for agents (llmstxt.org): each page with its Markdown. */
export async function GET() {
  const locale = routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "Docs" })
  const metadata = await getTranslations({ locale, namespace: "Metadata" })
  // "Use" is the pages at the docs' root, "Build" the packages' folders.
  const pages = ownPages(locale)
  const { use } = navSections(docsSource.getPageTree(locale).children)
  const isUse = (page: (typeof pages)[number]) =>
    use.some((node) => node.type === "page" && node.url === page.url)
  const text = llmsText(metadata("description"), [
    { title: t("useTitle"), pages: pages.filter(isUse) },
    { title: t("buildTitle"), pages: pages.filter((page) => !isUse(page)) },
  ])
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
