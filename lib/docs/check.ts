import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { frontmatter } from "fumadocs-core/content/md/frontmatter"

import {
  DOCS_PACKAGES,
  DOCS_PATH,
  PACKAGE_PAGES,
  pagePackage,
} from "./packages.ts"
import { resolvePackageLink } from "./remark-package-source.ts"
import { docsPageSchema, metaSchema } from "./schema.ts"
import { SITE_URL } from "../site.ts"

export const CONTENT_DIR = "content/docs"

const FENCE = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm
const INLINE_CODE = /`[^`\n]*`/g
const LINK = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const LOCALE_SUFFIX = /\.[a-z]{2}(?=\.mdx$)/

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? files(full) : [full]
  })
}

/** The links a Markdown file makes, code left out. */
export function markdownLinks(markdown: string): string[] {
  const prose = markdown.replace(FENCE, "").replace(INLINE_CODE, "")
  return [...prose.matchAll(LINK)].map((match) => match[1])
}

/** The URL a page of `content/docs/` is served at, in English. */
export function contentPagePath(relative: string): string {
  const slugs = relative
    .replace(LOCALE_SUFFIX, "")
    .replace(/\.mdx$/, "")
    .split("/")
    .filter((slug, index, all) => !(slug === "index" && index === all.length - 1))
  return [DOCS_PATH, ...slugs].join("/")
}

/**
 * What `npm run docs:check` holds the docs to, as a list of problems (none
 * when it passes): every page's frontmatter and every `meta.json`; each
 * package's two pages, each including its file and nothing else; and every
 * link — a package file's to the repository or another page, a written
 * page's to a page that exists — and every example a block names; and a
 * published package's `homepage` is its page.
 */
export function checkDocs(root: string): string[] {
  const problems: string[] = []
  const contentDir = path.join(root, CONTENT_DIR)
  const all = files(contentDir).map((file) =>
    path.relative(contentDir, file).split(path.sep).join("/")
  )
  const pages = all.filter((file) => file.endsWith(".mdx"))
  const pagePaths = new Set(pages.map(contentPagePath))
  pagePaths.add(DOCS_PATH)
  const report = (file: string, message: string) =>
    problems.push(`${file}: ${message}`)

  for (const page of pages) {
    const file = `${CONTENT_DIR}/${page}`
    const { data, content } = frontmatter(
      readFileSync(path.join(root, file), "utf8")
    )
    const parsed = docsPageSchema.safeParse(data)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        report(file, `frontmatter ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      }
    }
    const pkg = pagePackage(file)
    if (pkg) {
      const name = path.posix.basename(page, ".mdx")
      const entry = PACKAGE_PAGES.find(({ page }) => (page || "index") === name)
      if (!entry) {
        report(file, `${pkg.slug}/ holds only the package's pages (index, api)`)
        continue
      }
      const source = path.posix.relative(
        path.posix.dirname(file),
        `${pkg.dir}/${entry.file}`
      )
      if (content.trim() !== `<include>${source}</include>`) {
        report(file, `the page is its file and nothing else: <include>${source}</include>`)
      }
      continue
    }
    for (const link of markdownLinks(content)) {
      const target = link.split("#")[0]
      if (target.startsWith(DOCS_PATH) && !pagePaths.has(target)) {
        report(file, `the link "${link}" names no page`)
      }
    }
  }

  for (const pkg of DOCS_PACKAGES) {
    const manifest = JSON.parse(
      readFileSync(path.join(root, pkg.dir, "package.json"), "utf8")
    ) as { private?: boolean; homepage?: string }
    const homepage = `${SITE_URL}${DOCS_PATH}/${pkg.slug}`
    if (!manifest.private && manifest.homepage !== homepage) {
      report(`${pkg.dir}/package.json`, `a published package's homepage is ${homepage}`)
    }
    for (const { file, page } of PACKAGE_PAGES) {
      const doc = `${CONTENT_DIR}/${pkg.slug}/${page || "index"}.mdx`
      if (!existsSync(path.join(root, doc))) {
        report(doc, `missing: the page of ${pkg.dir}/${file}`)
      }
      const source = `${pkg.dir}/${file}`
      const markdown = readFileSync(path.join(root, source), "utf8")
      for (const link of markdownLinks(markdown)) {
        try {
          resolvePackageLink(link, pkg.dir, root)
        } catch (error) {
          report(source, (error as Error).message)
        }
      }
      for (const [, example] of markdown.matchAll(/^`{3,}\w* (examples\/\S+)$/gm)) {
        if (!existsSync(path.join(root, example))) {
          report(source, `the block of "${example}" names no file`)
        }
      }
    }
  }

  for (const meta of all.filter((file) => /(^|\/)meta(\.[a-z]{2})?\.json$/.test(file))) {
    const file = `${CONTENT_DIR}/${meta}`
    const parsed = metaSchema.safeParse(
      JSON.parse(readFileSync(path.join(root, file), "utf8"))
    )
    if (!parsed.success) {
      report(file, `not a meta file: ${parsed.error.issues[0]?.message}`)
      continue
    }
    const dir = path.posix.dirname(meta)
    for (const entry of parsed.data.pages ?? []) {
      if (entry.startsWith("---") || entry.startsWith("...")) continue
      const base = dir === "." ? entry : `${dir}/${entry}`
      if (!all.some((other) => other === `${base}.mdx` || other.startsWith(`${base}/`))) {
        report(file, `"${entry}" is no page or folder of ${dir === "." ? CONTENT_DIR : `${CONTENT_DIR}/${dir}`}`)
      }
    }
  }

  return problems
}
