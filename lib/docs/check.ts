import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { frontmatter } from "fumadocs-core/content/md/frontmatter"

import {
  DOCS_PACKAGES,
  DOCS_PATH,
  GUIDES_DIR,
  PACKAGE_PAGES,
  packagePageFile,
  packagePagePath,
  pagePackage,
} from "./packages.ts"
import { DIFFERENCES, DIFFERENCES_PAGE } from "./differences.ts"
import { commandElements, commandNames } from "./remark-command-names.ts"
import { resolvePackageLink } from "./remark-package-source.ts"
import { docsPageSchema, metaSchema } from "./schema.ts"
import { USE_PAGES, githubAnchor, sourceHash } from "./use.ts"
import { LOCALE_STATUS, routing } from "../../i18n/routing.ts"
import { SITE_URL } from "../site.ts"

export const CONTENT_DIR = "content/docs"

const CATALOGS_NOTE = "cad/locales/en.json"

const FENCE = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm
const INLINE_CODE = /`[^`\n]*`/g
const LINK = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const LOCALE_SUFFIX = /\.[a-z]{2}(?:-[A-Z]{2})?(?=\.mdx$)/

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

/** Every anchor a page's headings make, `[#id]` or GitHub's slug. */
export function headingAnchors(markdown: string): Set<string> {
  const prose = markdown.replace(FENCE, "")
  return new Set(
    [...prose.matchAll(/^#{2,6}\s+(.+)$/gm)].map((match) => githubAnchor(match[1]))
  )
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
 * package's two pages, each including its file and nothing else; each
 * "Use" page in every live language (a draft's missing one is served in
 * English, as its missing keys are), a translation written by hand carrying
 * the `sourceHash` of its English file (a generated one, its generator); each
 * guide of a package (`docs/<name>.md`) with its page; every link — a package
 * file's to the repository or another page, a written page's to a page and a
 * heading that exist — and every example a block names; and a published
 * package's `homepage` is its page.
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

  const source = (page: string) => readFileSync(path.join(contentDir, page), "utf8")
  const names = commandNames(root, "en")
  const anchors = new Map(
    pages
      .filter((page) => !page.includes("/") && !LOCALE_SUFFIX.test(page))
      .map((page) => [contentPagePath(page), headingAnchors(source(page))])
  )

  for (const page of pages.filter((page) => !page.includes("/"))) {
    const name = page.replace(LOCALE_SUFFIX, "").replace(/\.mdx$/, "")
    if (!(USE_PAGES as readonly string[]).includes(name)) {
      report(`${CONTENT_DIR}/${page}`, `"${name}" is not in USE_PAGES (lib/docs/use.ts)`)
    }
  }
  for (const name of USE_PAGES) {
    const english = `${name}.mdx`
    if (!pages.includes(english)) {
      report(`${CONTENT_DIR}/${english}`, "missing: a page of USE_PAGES")
      continue
    }
    const original = frontmatter(source(english)).data as Record<string, unknown>
    if (original.sourceHash !== undefined) {
      report(`${CONTENT_DIR}/${english}`, "the English page is the source: no sourceHash")
    }
    const hash = sourceHash(source(english))
    for (const locale of routing.locales.filter((tag) => tag !== routing.defaultLocale)) {
      const translation = `${name}.${locale}.mdx`
      const file = `${CONTENT_DIR}/${translation}`
      if (!pages.includes(translation)) {
        if (LOCALE_STATUS[locale] === "live") report(file, `missing: ${english} in ${locale}`)
        continue
      }
      const data = frontmatter(source(translation)).data as Record<string, unknown>
      if (original.generated !== undefined) {
        if (data.generated !== original.generated || data.sourceHash !== undefined) {
          report(file, `written by ${String(original.generated)}, as ${english} is: no sourceHash`)
        }
      } else if (data.sourceHash !== hash) {
        report(
          file,
          `out of date with ${english}: bring it up to date, then set sourceHash: "${hash}"`
        )
      }
    }
  }

  const flat = (text: string) => text.replace(/\s+/g, " ")
  for (const { id, sources } of DIFFERENCES) {
    for (const { file, quote } of sources) {
      const text = existsSync(path.join(root, file)) ? readFileSync(path.join(root, file), "utf8") : ""
      if (!flat(text).includes(flat(quote))) {
        report(file, `no longer says why "${id}" differs from AutoCAD: "${quote}" (lib/docs/differences.ts)`)
      }
    }
  }
  const expected = DIFFERENCES.map(({ id }) => id).join(", ")
  for (const page of pages.filter((page) => page.replace(LOCALE_SUFFIX, "") === `${DIFFERENCES_PAGE}.mdx`)) {
    const sections = [...source(page).matchAll(/^##\s+.*\[#([^\]]+)\]\s*$/gm)].map((match) => match[1])
    if (sections.join(", ") !== expected) {
      report(`${CONTENT_DIR}/${page}`, `its sections are those of lib/docs/differences.ts, in order: ${expected}`)
    }
  }

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
      const included = packagePageFile(pkg, name)
      if (!included || !existsSync(path.join(root, included))) {
        report(
          file,
          `${pkg.slug}/ holds only the package's pages (index, api) and its guides (${pkg.dir}/${GUIDES_DIR}/*.md)`
        )
        continue
      }
      const source = path.posix.relative(path.posix.dirname(file), included)
      if (content.trim() !== `<include>${source}</include>`) {
        report(file, `the page is its file and nothing else: <include>${source}</include>`)
      }
      continue
    }
    for (const id of commandElements(content)) {
      if (!(id in names)) report(file, `<Command id="${id}" /> names no command of ${CATALOGS_NOTE}`)
    }
    for (const link of markdownLinks(content)) {
      const [target, fragment] = link.split("#")
      if (!target.startsWith(DOCS_PATH)) continue
      if (!pagePaths.has(target)) {
        report(file, `the link "${link}" names no page`)
      } else if (fragment && anchors.get(target)?.has(fragment) === false) {
        report(file, `the link "${link}" names no heading of ${target}`)
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
    const guides = path.join(root, pkg.dir, GUIDES_DIR)
    const sources = [
      ...PACKAGE_PAGES.map(({ file }) => `${pkg.dir}/${file}`),
      ...(existsSync(guides) ? readdirSync(guides) : [])
        .filter((file) => file.endsWith(".md"))
        .sort()
        .map((file) => `${pkg.dir}/${GUIDES_DIR}/${file}`),
    ]
    for (const source of sources) {
      const url = packagePagePath(source)
      if (!url) {
        report(source, "a guide's name is lower case, words joined by -, and neither index nor api")
        continue
      }
      const doc = `${CONTENT_DIR}/${url.slice(DOCS_PATH.length + 1)}`
      const page = url === `${DOCS_PATH}/${pkg.slug}` ? `${doc}/index.mdx` : `${doc}.mdx`
      if (!existsSync(path.join(root, page))) {
        report(page, `missing: the page of ${source}`)
      }
      const markdown = readFileSync(path.join(root, source), "utf8")
      for (const link of markdownLinks(markdown)) {
        try {
          resolvePackageLink(link, path.posix.dirname(source), root)
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

  for (const meta of all.filter((file) => /(^|\/)meta(\.[a-z]{2}(?:-[A-Z]{2})?)?\.json$/.test(file))) {
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
