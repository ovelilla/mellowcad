import { loadEngineLocale } from "@/i18n/engine"
import { localeUrl } from "@/i18n/navigation"
import { SITE_NAME } from "@/lib/site"

import type { DocsPage } from "./pages"
import { canonicalPath, pageLanguage } from "./pages"
import { DOCS_PATH } from "./packages"
import { historyLine, isSession, renderSession } from "./sessions"

const SESSION = /<Session\s+name="([^"]+)"(?:\s+caption="([^"]*)")?\s*\/>/g

/**
 * Each `<Session>` as its caption, when the page gives one, and its history
 * in a text block, recorded in the page's language: what the figure shows,
 * as an agent can read it.
 */
async function sessionsAsText(markdown: string, language: Parameters<typeof loadEngineLocale>[0]) {
  const locale = await loadEngineLocale(language)
  const blocks = await Promise.all(
    [...markdown.matchAll(SESSION)].map(async ([, name, caption]) => {
      if (!isSession(name)) throw new Error(`<Session name="${name}" /> names no session`)
      const { lines, text } = await renderSession(name, locale)
      const history = lines.length
        ? `\`\`\`text\n${lines.map((line) => historyLine(line, text)).join("\n")}\n\`\`\``
        : ""
      return [caption, history].filter(Boolean).join("\n\n")
    })
  )
  let index = 0
  return markdown.replace(SESSION, () => blocks[index++])
}

const DOCS_LINK = new RegExp(`\\]\\((${DOCS_PATH}(?:/[^)#\\s]*)?)(#[^)\\s]*)?\\)`, "g")

/** A page's own URL with `.md`: what an agent reads instead of the HTML. */
export function markdownUrl(page: DocsPage): string {
  return `${localeUrl(pageLanguage(page), canonicalPath(page))}.md`
}

/**
 * A page as Markdown: its title and description, then the Markdown it was
 * written in, with the edits of the docs' plugins (`remarkPackageSource`).
 * A link to another page of the docs leads to that page's Markdown.
 */
export async function pageMarkdown(page: DocsPage): Promise<string> {
  const language = pageLanguage(page)
  const processed = await sessionsAsText(await page.data.getText("processed"), language)
  const body = processed.replace(
    DOCS_LINK,
    (_, path: string, hash = "") => `](${localeUrl(language, path)}.md${hash})`
  )
  return `# ${page.data.title}\n\n> ${page.data.description}\n\n${body.trim()}\n`
}

/** A list entry of `llms.txt` for a page: its title, its Markdown and what it holds. */
export function pageLink(page: DocsPage): string {
  return `[${page.data.title}](${markdownUrl(page)}): ${page.data.description}`
}

/**
 * `llms.txt` (llmstxt.org): the site in a line, what to know first, then
 * sections of list entries, each a link with what it holds.
 */
export function llmsText(
  summary: string,
  details: string,
  sections: { title: string; entries: string[] }[]
): string {
  const blocks = sections
    .filter(({ entries }) => entries.length > 0)
    .map(({ title, entries }) => [`## ${title}`, "", ...entries.map((entry) => `- ${entry}`)].join("\n"))
  return `${[`# ${SITE_NAME}`, `> ${summary}`, details, ...blocks].join("\n\n")}\n`
}
