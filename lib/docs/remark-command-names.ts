import { readFileSync } from "node:fs"
import path from "node:path"

import { replaceSource } from "fumadocs-core/mdx-plugins/stringifier"
import type { Nodes, Parent, Root } from "mdast"
import type { VFile } from "vfile"

/** The engine's catalogs, its words' one source. */
const CATALOGS = "cad/locales"

const LOCALE_SUFFIX = /\.([a-z]{2}(?:-[A-Z]{2})?)\.mdx$/

type Catalog = { commands?: { names?: Record<string, readonly string[]> } }

function catalog(root: string, tag: string): Catalog {
  try {
    return JSON.parse(readFileSync(path.join(root, CATALOGS, `${tag}.json`), "utf8")) as Catalog
  } catch {
    return {}
  }
}

/**
 * Each command's name in a language's command language, by global name: the
 * language's catalog laid over English's, as the engine merges them — so
 * Spanish names its own and Arabic, which has none, the global ones.
 */
export function commandNames(root: string, tag: string): Record<string, string> {
  const names = {
    ...catalog(root, "en").commands?.names,
    ...catalog(root, tag).commands?.names,
  }
  return Object.fromEntries(Object.entries(names).map(([id, [name]]) => [id, name]))
}

/** The `<Command id="…" />` elements a page's Markdown names, by id. */
export function commandElements(markdown: string): string[] {
  return [...markdown.matchAll(/<Command\s+id="([^"]+)"\s*\/>/g)].map((match) => match[1])
}

type JsxNode = {
  type: "mdxJsxTextElement" | "mdxJsxFlowElement"
  name: string | null
  attributes: { type: string; name?: string; value?: unknown }[]
}

/**
 * `<Command id="NEW" />` in a written page is the command's name as that
 * page's command language types it — `NEW`, `NUEVO` in Spanish — so no guide
 * keeps a copy of the catalog's words. It becomes inline code, for the HTML,
 * the search index and the page's Markdown alike.
 */
export function remarkCommandNames() {
  return (tree: Root, file: VFile) => {
    const tag = LOCALE_SUFFIX.exec(file.path)?.[1] ?? "en"
    let names: Record<string, string> | undefined
    const visit = (node: Nodes, parent?: Parent) => {
      const jsx = node as unknown as JsxNode
      if (
        parent &&
        (jsx.type === "mdxJsxTextElement" || jsx.type === "mdxJsxFlowElement") &&
        jsx.name === "Command"
      ) {
        const id = jsx.attributes.find((attribute) => attribute.name === "id")?.value
        names ??= commandNames(file.cwd, tag)
        const name = typeof id === "string" ? names[id] : undefined
        if (!name) throw new Error(`${file.path}: <Command id="${String(id)}" /> names no command`)
        replaceSource(file, node, `\`${name}\``)
        parent.children.splice(parent.children.indexOf(node as never), 1, {
          type: "inlineCode",
          value: name,
        } as never)
        return
      }
      if ("children" in node) {
        for (const child of [...node.children]) visit(child, node)
      }
    }
    visit(tree)
  }
}
