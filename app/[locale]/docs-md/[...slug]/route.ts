import { localeSegment, routing, segmentLocale } from "@/i18n/routing"
import { docsSource } from "@/lib/docs/docs-source"
import { pageMarkdown } from "@/lib/docs/markdown"
import { ownPages, pageLanguage } from "@/lib/docs/pages"

export const dynamic = "force-static"
export const dynamicParams = false

/**
 * Served at a page's own URL with `.md` (`i18n/rewrites.ts`), in its own
 * language only. WHY the extension in the last segment: exported, the route
 * is a file, and `commands` the file would collide with `commands/` the
 * folder of its children; a static host takes the type from it too.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ownPages(locale).map((page) => ({
      locale: localeSegment(locale),
      slug: [...page.slugs.slice(0, -1), `${page.slugs.at(-1)}.md`],
    }))
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string[] }> }
) {
  const { slug: named, ...segment } = await params
  const slug = [...named.slice(0, -1), named.at(-1)!.replace(/\.md$/, "")]
  const locale = segmentLocale(segment.locale)
  const page = locale ? docsSource.getPage(slug, locale) : undefined
  if (!locale || !page || pageLanguage(page) !== locale) {
    return new Response(null, { status: 404 })
  }
  // Its canonical `Link`, the HTML page, is `fileHeaders`': a static file
  // keeps no header of its own.
  return new Response(await pageMarkdown(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
