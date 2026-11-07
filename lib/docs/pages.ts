import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { Node } from "fumadocs-core/page-tree"

import type { AppLocale } from "@/i18n/routing"
import { LIVE_LOCALES, routing } from "@/i18n/routing"
import { REPOSITORY_URL } from "@/lib/site"

import { COMMANDS_PATH } from "./command-pages"
import { EXERCISES_PATH } from "./exercise-pages"
import { docsSource } from "./docs-source"
import {
  DOCS_PACKAGES,
  DOCS_PATH,
  type DocsPackage,
  isEnglishOnlyPath,
  packagePageFile,
} from "./packages"

export type DocsPage = NonNullable<ReturnType<typeof docsSource.getPage>>

/** A page's file in the language it is written in (`engine/api.mdx` → `en`). */
export function pageLanguage(page: DocsPage): AppLocale {
  return (
    routing.locales.find((locale) => page.data.info.path.endsWith(`.${locale}.mdx`)) ??
    routing.defaultLocale
  )
}

/** The page's own URL, in the language it is written in: its canonical. */
export function canonicalPath(page: DocsPage): string {
  return [DOCS_PATH, ...page.slugs].join("/")
}

/**
 * Whether the page is written in every live language ("Use"): each then has
 * its own URL and the others as its hreflang alternates. One a draft has not
 * translated yet is served under its prefix, canonical to the English one.
 */
export function isTranslated(page: DocsPage): boolean {
  return LIVE_LOCALES.every((locale) => {
    const own = docsSource.getPage(page.slugs, locale)
    return own !== undefined && pageLanguage(own) === locale
  })
}

/** Whether a node of the page tree is a package's folder ("Build"). */
function isPackageFolder(node: Node): boolean {
  return (
    node.type === "folder" &&
    DOCS_PACKAGES.some((pkg) => node.index?.url.endsWith(`${DOCS_PATH}/${pkg.slug}`))
  )
}

/**
 * The navigation's two sections: "Use" is the pages at the docs' root, and
 * the command reference, a folder only for the commands' own pages under it,
 * listed as its index; "Build" the packages' folders (`content/docs/meta.json`
 * orders both).
 */
export function navSections(nodes: Node[]): { use: Node[]; build: Node[] } {
  return {
    use: nodes.flatMap((node): Node[] => {
      if (node.type === "page") return [node]
      if (node.type === "folder" && node.index && !isPackageFolder(node)) {
        return [{ ...node.index, name: node.name }]
      }
      return []
    }),
    build: nodes.filter(isPackageFolder),
  }
}

/**
 * Whether the page is one its folder's index lists — a command's own
 * (`/docs/commands/offset`) or an exercise (`/docs/exercises/gasket`): not in
 * the navigation, which lists the index that leads to each.
 */
export function isIndexedPage(page: DocsPage): boolean {
  return (
    page.slugs.length === 2 &&
    [COMMANDS_PATH, EXERCISES_PATH].includes(`${DOCS_PATH}/${page.slugs[0]}`)
  )
}

/** Whether the page is an exercise of the practice library (`/docs/exercises/gasket`). */
export function isExercisePage(page: DocsPage): boolean {
  return page.slugs.length === 2 && `${DOCS_PATH}/${page.slugs[0]}` === EXERCISES_PATH
}

/**
 * Whether `locale` serves the page under its prefix: every page but the
 * packages' ("Build"), which exist in English only and have one URL, the
 * English one (`isEnglishOnlyPath`).
 */
export function servedIn(page: DocsPage, locale: string | undefined): boolean {
  return locale === routing.defaultLocale || !isEnglishOnlyPath(canonicalPath(page))
}

/**
 * "Build" as another language's navigation lists it: each package's first
 * page, at its English URL. The pages under it are in English only, and so is
 * the navigation that lists them.
 */
export function englishBuildNodes(): Node[] {
  const { build } = navSections(docsSource.getPageTree(routing.defaultLocale).children)
  return build.flatMap((node) =>
    node.type === "folder" && node.index ? [{ ...node.index, name: node.name }] : []
  )
}

/** Whether a package is on npm: one still `private` is "not published yet". */
export function isPublished(pkg: DocsPackage): boolean {
  const manifest = JSON.parse(
    readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), pkg.dir, "package.json"), "utf8")
  ) as { private?: boolean }
  return manifest.private !== true
}

/** The package a page documents, and the repository file it includes. */
export function pageSource(
  page: DocsPage
): { pkg: DocsPackage; file: string; url: string } | undefined {
  const [slug, sub = "index"] = page.slugs
  const pkg = DOCS_PACKAGES.find((candidate) => candidate.slug === slug)
  const file = pkg && packagePageFile(pkg, sub)
  if (!pkg || !file) return undefined
  return { pkg, file, url: `${REPOSITORY_URL}/blob/main/${file}` }
}

/**
 * Every page with its own file in `locale`, in the navigation's order, and
 * the commands' own pages, which it does not list, after it by name: what
 * the `.md` routes, the sitemap and `llms.txt` serve.
 */
export function ownPages(locale: AppLocale): DocsPage[] {
  const order: string[] = []
  const visit = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.type === "page") order.push(node.url)
      if (node.type === "folder") {
        if (node.index) order.push(node.index.url)
        visit(node.children)
      }
    }
  }
  visit(docsSource.getPageTree(locale).children)
  const rank = (page: DocsPage) => {
    const index = order.indexOf(page.url)
    return index === -1 ? order.length : index
  }
  return docsSource
    .getPages(locale)
    .filter((page) => pageLanguage(page) === locale)
    .sort((a, b) => rank(a) - rank(b) || a.url.localeCompare(b.url))
}
