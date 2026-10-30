import { hasLocale } from "next-intl"

import { localeUrl } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { docsSource } from "@/lib/docs/docs-source"
import { pageMarkdown } from "@/lib/docs/markdown"
import { canonicalPath, ownPages, pageLanguage } from "@/lib/docs/pages"

export const dynamic = "force-static"
export const dynamicParams = false

/** Served at a page's own URL with `.md` (`i18n/rewrites.ts`), in its own language only. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ownPages(locale).map((page) => ({ locale, slug: page.slugs }))
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string[] }> }
) {
  const { locale, slug } = await params
  const page = hasLocale(routing.locales, locale)
    ? docsSource.getPage(slug, locale)
    : undefined
  if (!page || pageLanguage(page) !== locale) {
    return new Response(null, { status: 404 })
  }
  return new Response(await pageMarkdown(page), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // The HTML page is the one to index; this is its text for agents.
      Link: `<${localeUrl(locale, canonicalPath(page))}>; rel="canonical"`,
    },
  })
}
