import { getTranslations } from "next-intl/server"

import { FAQ_QUESTIONS } from "@/content/faq"
import { loadEngineLocale } from "@/i18n/engine"
import { localeUrl } from "@/i18n/navigation"
import {
  COMMAND_LANGUAGE,
  LANGUAGE_NAMES,
  LIVE_LOCALES,
  routing,
} from "@/i18n/routing"
import { engineText } from "@mellowcad/engine"
import { docsSource } from "@/lib/docs/docs-source"
import { llmsText, markdownUrl, pageLink } from "@/lib/docs/markdown"
import { DOCS_PATH } from "@/lib/docs/packages"
import {
  isIndexedPage,
  navSections,
  ownPages,
  pageSource,
} from "@/lib/docs/pages"
import { productFacts } from "@/lib/facts"
import {
  EDITOR_PATH,
  ENGINE_PACKAGE,
  ENGINE_PACKAGE_URL,
  REPOSITORY_URL,
  SITE_NAME,
} from "@/lib/site"

export const dynamic = "force-static"

const STATUS_TODAY = [1, 2, 3, 4, 5, 6] as const
const STATUS_NOT_YET = [1, 2, 3, 4, 5] as const

/**
 * Each live language as an agent should know it: where it is, and which
 * command names its users type — its own AutoCAD's (`LINEA`) or the global
 * ones — with its "Use" pages.
 */
async function languages(): Promise<string[]> {
  const english = new Intl.DisplayNames([routing.defaultLocale], {
    type: "language",
  })
  return Promise.all(
    LIVE_LOCALES.map(async (locale) => {
      const text = engineText(await loadEngineLocale(locale))
      const [line] = text.commandNames("LINE")
      const [offset] = text.commandNames("OFFSET")
      const commands =
        COMMAND_LANGUAGE[locale] === "localized"
          ? `the command names of ${english.of(locale)} AutoCAD (${line}, ${offset}), and \`_LINE\` for the global one`
          : `AutoCAD's global command names (${line}, ${offset})`
      const pages =
        locale === routing.defaultLocale
          ? ""
          : `; docs: ${ownPages(locale)
              .filter((page) => !isIndexedPage(page))
              .map((page) => `[${page.data.title}](${markdownUrl(page)})`)
              .join(", ")}`
      return `[${LANGUAGE_NAMES[locale]}](${localeUrl(locale, "/")}): ${english.of(locale)}, with ${commands}${pages}`
    })
  )
}

/**
 * The site for agents (llmstxt.org), in English: what MellowCAD is, what it
 * does and does not do yet, its answers, its languages, and every docs page
 * with its Markdown. Every claim is the landing's own (Status, FAQ), with
 * its numbers from `lib/facts.ts`.
 */
export async function GET() {
  const locale = routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "Docs" })
  const metadata = await getTranslations({ locale, namespace: "Metadata" })
  const status = await getTranslations({ locale, namespace: "Status" })
  const faq = await getTranslations({ locale, namespace: "Faq" })
  const header = await getTranslations({ locale, namespace: "Header" })
  const common = await getTranslations({ locale, namespace: "Common" })
  const facts = productFacts()

  const link = (url: string) => (chunks: string) => `[${chunks}](${url})`
  const answers = FAQ_QUESTIONS.map(
    (n) =>
      `**${faq(`q${n}`)}** ${faq.markup(`a${n}`, {
        github: link(REPOSITORY_URL),
        npm: link(ENGINE_PACKAGE_URL),
        reference: link(localeUrl(locale, `${DOCS_PATH}/commands`)),
        exercises: link(localeUrl(locale, `${DOCS_PATH}/exercises`)),
        dxf: link(localeUrl(locale, `${DOCS_PATH}/open-dxf`)),
        edit: link(localeUrl(locale, `${DOCS_PATH}/edit-dxf`)),
        package: ENGINE_PACKAGE,
        commands: facts.commands,
      })}`
  )
  const today = STATUS_TODAY.map((n) =>
    status(`today${n}`, {
      commands: facts.commands,
      aliases: facts.aliases,
      snaps: facts.objectSnaps,
      lineweights: facts.lineweights,
    })
  )

  // "Use" is the navigation's pages, "Build" the packages'. A command's own
  // page is left out: the reference's Markdown links each one, and listed
  // here they would be most of the file (`docs.md`, "For agents").
  const pages = ownPages(locale)
  const { use } = navSections(docsSource.getPageTree(locale).children)
  const isUse = (page: (typeof pages)[number]) =>
    use.some((node) => node.type === "page" && node.url === page.url)

  const text = llmsText(
    metadata("description"),
    [
      status("lead"),
      `[${common("startDrawing")}](${localeUrl(locale, EDITOR_PATH)}) · [${SITE_NAME}](${localeUrl(locale, "/")}) · [GitHub](${REPOSITORY_URL}) · [npm](${ENGINE_PACKAGE_URL})`,
    ].join("\n\n"),
    [
      { title: status("todayTitle"), entries: today },
      {
        title: status("notYetTitle"),
        entries: STATUS_NOT_YET.map((n) => status(`notYet${n}`)),
      },
      { title: header("faq"), entries: answers },
      { title: "Languages", entries: await languages() },
      { title: t("useTitle"), entries: pages.filter(isUse).map(pageLink) },
      {
        title: t("buildTitle"),
        entries: pages
          .filter((page) => pageSource(page) !== undefined)
          .map(pageLink),
      },
      {
        title: "Optional",
        entries: [
          `[Every page above in one file](${localeUrl(locale, "/llms-full.txt")}): their Markdown, one after another`,
        ],
      },
    ]
  )
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
