import { createFromSource } from "fumadocs-core/search/server"

import { docsSource } from "@/lib/docs/docs-source"

// WHY on the server, a function per query: nubigest's static index of three
// languages passed Vercel's 20 MB limit for a static body (its deploy failed
// with FALLBACK_BODY_TOO_LARGE), and every reader downloaded it whole. The
// index is built on the function's first query.
const { GET: search } = createFromSource(docsSource)

/** A repeated query is answered by the CDN, which every deploy empties. */
const SEARCH_CACHE_CONTROL = "public, max-age=0, s-maxage=86400"

export async function GET(request: Request): Promise<Response> {
  const response = await search(request)
  if (response.ok) response.headers.set("Cache-Control", SEARCH_CACHE_CONTROL)
  return response
}
