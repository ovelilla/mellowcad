import { existsSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

import { replaceSource } from "fumadocs-core/mdx-plugins/stringifier"
import type { Code, Heading, Link, Nodes, Parent, Root } from "mdast"
import type { VFile } from "vfile"

import { REPOSITORY_URL } from "../site.ts"

import { packagePagePath, pagePackage } from "./packages.ts"

/** A link a README writes for GitHub and npm, both of which resolve it against its file. */
function isRelative(url: string): boolean {
  return !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(url)
}

/**
 * Where a link of a package's file goes on the site: a file that is a docs
 * page is that page, any other file or folder of the repository is GitHub's.
 * `base` is the folder of the file that wrote it, from the repository root.
 */
export function resolvePackageLink(
  url: string,
  base: string,
  root: string
): string {
  if (!isRelative(url)) return url
  const hash = url.indexOf("#")
  const target = path.posix.normalize(
    path.posix.join(base, hash === -1 ? url : url.slice(0, hash))
  )
  const fragment = hash === -1 ? "" : url.slice(hash)
  const page = packagePagePath(target)
  if (page) return page + fragment
  const absolute = path.join(root, target)
  if (!existsSync(absolute)) {
    throw new Error(`${base}: the link "${url}" names no file of the repository`)
  }
  const kind = statSync(absolute).isDirectory() ? "tree" : "blob"
  return `${REPOSITORY_URL}/${kind}/main/${target}${fragment}`
}

function walk(node: Nodes, visit: (node: Nodes, parent?: Parent) => void, parent?: Parent) {
  visit(node, parent)
  if ("children" in node) {
    for (const child of [...node.children]) walk(child, visit, node)
  }
}

const EXPORT = /^export (?:type )?\{ (\w+) \}$/

/**
 * An API report's code is the page, and search indexes no code: each export
 * becomes a record of its own, its declaration's first line, so a search for
 * `CadDriver` finds the reference.
 */
function indexExports(code: Code) {
  const lines = code.value.split("\n")
  const contents = lines.flatMap((line, index) =>
    EXPORT.test(line) && lines[index + 1]
      ? [{ heading: undefined, content: lines[index + 1].replace(/\s*\{$/, "") }]
      : []
  )
  if (contents.length) code.data = { ...code.data, structuredData: { contents } }
}

/**
 * A page of "Build with MellowCAD" is its package's README or `api.md`,
 * included whole (`<include>`): what the file says for GitHub and npm, the
 * site says for itself. Its title is the page's, so the file's `#` heading
 * goes; its relative links go where they lead on the site; and a block that
 * names an example's file (`tsx examples/editor-vite/src/main.tsx`) is read
 * from that file, which `test/packages.test.ts` already holds it to.
 * Every change is recorded for the page's Markdown too.
 */
export function remarkPackageSource() {
  return (tree: Root, file: VFile) => {
    const pkg = pagePackage(file.path.split(path.sep).join("/"))
    if (!pkg) return
    const root = file.cwd
    const apiReport = file.path.endsWith(`${path.sep}api.mdx`)

    walk(tree, (node, parent) => {
      if (node.type === "heading" && (node as Heading).depth === 1 && parent) {
        replaceSource(file, node, "")
        parent.children.splice(parent.children.indexOf(node as never), 1)
        return
      }
      // An API report heads each entry point with its `exports` key (`.`,
      // `./locales/es`); the page names it as a host imports it.
      if (apiReport && node.type === "heading" && node.depth === 2) {
        const [text] = node.children
        if (node.children.length !== 1 || text.type !== "text") return
        if (!/^\.(\/\S*)?$/.test(text.value)) return
        const entry = `${pkg.name}${text.value.slice(1)}`
        node.children = [{ type: "inlineCode", value: entry }]
        replaceSource(file, node, `## \`${entry}\``)
        return
      }
      if (node.type === "link") {
        const link = node as Link
        const url = resolvePackageLink(link.url, pkg.dir, root)
        if (url === link.url) return
        link.url = url
        replaceSource(file, link, (s) => `[${s.inner(link)}](${url})`)
        return
      }
      if (node.type === "code") {
        const code = node as Code
        if (apiReport) indexExports(code)
        if (!code.meta?.startsWith("examples/")) return
        const source = code.meta
        code.value = readFileSync(path.join(root, source), "utf8").replace(/\r?\n$/, "")
        code.meta = `title="${source}"`
        replaceSource(
          file,
          code,
          `\`\`\`${code.lang ?? ""} ${source}\n${code.value}\n\`\`\``
        )
      }
    })
  }
}
