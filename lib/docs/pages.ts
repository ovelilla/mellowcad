import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { Node } from "fumadocs-core/page-tree"

import type { AppLocale } from "@/i18n/routing"
import { routing } from "@/i18n/routing"
import { REPOSITORY_URL } from "@/lib/site"

import { docsSource } from "./docs-source"
import {
  DOCS_PACKAGES,
  DOCS_PATH,
  type DocsPackage,
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
 * Whether the page is written in every language ("Use"): each then has its
 * own URL and the others as its hreflang alternates. A page in English only
 * ("Build") is served under every prefix, canonical to the English one.
 */
export function isTranslated(page: DocsPage): boolean {
  return routing.locales.every((locale) => {
    const own = docsSource.getPage(page.slugs, locale)
    return own !== undefined && pageLanguage(own) === locale
  })
}

/**
 * The navigation's two sections: "Use" is the pages at the docs' root,
 * "Build" the packages' folders (`content/docs/meta.json` orders both).
 */
export function navSections(nodes: Node[]): { use: Node[]; build: Node[] } {
  return {
    use: nodes.filter((node) => node.type === "page"),
    build: nodes.filter((node) => node.type !== "page"),
  }
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
 * Every page with its own file in `locale`, in the navigation's order: what
 * the `.md` routes and `llms.txt` serve.
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
  return docsSource
    .getPages(locale)
    .filter((page) => pageLanguage(page) === locale)
    .sort((a, b) => order.indexOf(a.url) - order.indexOf(b.url))
}
