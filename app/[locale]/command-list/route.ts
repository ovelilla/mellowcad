import { loadEngineLocale } from "@/i18n/engine"
import { localeParams, segmentLocale } from "@/i18n/routing"
import { autocadCommands } from "@/lib/facts"

// Made once per language when the site is built.
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return localeParams()
}

/**
 * The commands the hero's command line suggests as the editor's autocomplete
 * does (`CommandTry`): each one's name in the command language, its aliases
 * and what it does. Not a page: the landing fetches it when that line is
 * first used, and no search engine should list it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const locale = segmentLocale((await params).locale)
  if (!locale) return new Response(null, { status: 404 })
  const commands = autocadCommands(await loadEngineLocale(locale)).map(
    ({ name, aliases, description }) => ({ name, aliases, description })
  )
  return Response.json(commands, { headers: { "X-Robots-Tag": "noindex" } })
}
