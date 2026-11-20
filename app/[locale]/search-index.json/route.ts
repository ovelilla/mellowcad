import { initAdvancedSearch } from "fumadocs-core/search/server"

import { localeParams, segmentLocale } from "@/i18n/routing"
import { docsSource } from "@/lib/docs/docs-source"
import { canonicalPath, servedIn } from "@/lib/docs/pages"

// Made once per language when the site is built.
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return localeParams()
}

/**
 * The docs' search index of one language, searched in the browser
 * (`DocsSearch`). WHY one per language, a static file: a function per query
 * spent invocations that can pause the site on Hobby, and one database of
 * every language, as the function kept, would be some 75 MB; a language's is
 * 0.6–0.7 MB in Brotli, fetched only by whoever searches.
 *
 * Each language searches "Build" too, which it does not serve: a result
 * leads to the English page, the only one there is (`servedIn`).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const locale = segmentLocale((await params).locale)
  if (!locale) return new Response(null, { status: 404 })
  const server = initAdvancedSearch({
    indexes: docsSource.getPages(locale).map((page) => ({
      id: page.url,
      url: servedIn(page, locale) ? page.url : canonicalPath(page),
      title: page.data.title,
      description: page.data.description,
      structuredData: page.data.structuredData,
    })),
  })
  return Response.json(await server.export())
}
