import { createFromSource } from "fumadocs-core/search/server"

import { docsSource } from "@/lib/docs/docs-source"
import { canonicalPath, servedIn } from "@/lib/docs/pages"

// WHY on the server, a function per query: nubigest's static index of three
// languages passed Vercel's 20 MB limit for a static body (its deploy failed
// with FALLBACK_BODY_TOO_LARGE), and every reader downloaded it whole. The
// index is built on the function's first query.
//
// Each language searches "Build" too, which it does not serve: a result
// leads to the English page, the only one there is (`servedIn`).
const { GET: search } = createFromSource(docsSource, {
  buildIndex: (page) => ({
    id: page.url,
    url: servedIn(page, page.locale) ? page.url : canonicalPath(page),
    title: page.data.title,
    description: page.data.description,
    structuredData: page.data.structuredData,
  }),
})

/** A repeated query is answered by the CDN, which every deploy empties. */
const SEARCH_CACHE_CONTROL = "public, max-age=0, s-maxage=86400"

export async function GET(request: Request): Promise<Response> {
  const response = await search(request)
  if (response.ok) response.headers.set("Cache-Control", SEARCH_CACHE_CONTROL)
  return response
}
