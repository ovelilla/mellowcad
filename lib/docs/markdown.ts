import { localeUrl } from "@/i18n/navigation"
import { SITE_NAME } from "@/lib/site"

import type { DocsPage } from "./pages"
import { canonicalPath, pageLanguage } from "./pages"
import { DOCS_PATH } from "./packages"

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
  const body = (await page.data.getText("processed")).replace(
    DOCS_LINK,
    (_, path: string, hash = "") => `](${localeUrl(language, path)}.md${hash})`
  )
  return `# ${page.data.title}\n\n> ${page.data.description}\n\n${body.trim()}\n`
}

/** `llms.txt` (llmstxt.org): the site in a line, then every page's Markdown. */
export function llmsText(
  description: string,
  sections: { title: string; pages: DocsPage[] }[]
): string {
  const blocks = sections.map(({ title, pages }) =>
    [
      `## ${title}`,
      "",
      ...pages.map(
        (page) => `- [${page.data.title}](${markdownUrl(page)}): ${page.data.description}`
      ),
    ].join("\n")
  )
  return `${[`# ${SITE_NAME}`, `> ${description}`, ...blocks].join("\n\n")}\n`
}
