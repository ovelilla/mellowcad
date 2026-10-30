import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, describe, expect, it } from "vitest"

import { checkDocs, contentPagePath, markdownLinks } from "./check"
import { resolvePackageLink } from "./remark-package-source"
import { USE_PAGES, sourceHash } from "./use"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

let dir: string | undefined
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true })
  dir = undefined
})

function repo(tree: Record<string, string>): string {
  dir = mkdtempSync(path.join(tmpdir(), "docs-check-"))
  for (const [file, text] of Object.entries(tree)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    writeFileSync(path.join(dir, file), text)
  }
  return dir
}

const page = (body: string, type = "reference") =>
  `---\ntitle: T\ndescription: D\ntype: ${type}\n---\n\n${body}\n`

const translated = (english: string, body: string) =>
  `---\ntitle: T\ndescription: D\ntype: howTo\nsourceHash: "${sourceHash(english)}"\n---\n\n${body}\n`

/** "Use" in every language, each translation up to date with its English page. */
function translatedPages(): Record<string, string> {
  const tree: Record<string, string> = {}
  for (const name of USE_PAGES) {
    const english = page(`## Start [#start]\n\nSee [the engine](/docs/engine).`, "howTo")
    tree[`content/docs/${name}.mdx`] = english
    tree[`content/docs/${name}.es.mdx`] = translated(english, "## Empezar [#start]")
    tree[`content/docs/${name}.ar.mdx`] = translated(english, "## ابدأ [#start]")
  }
  return tree
}

/** A repository whose three packages are documented as they should be. */
function packages(): Record<string, string> {
  const tree: Record<string, string> = {}
  for (const [slug, folder] of [
    ["engine", "cad"],
    ["react", "packages/react"],
    ["editor", "packages/editor"],
  ]) {
    tree[`${folder}/README.md`] = "# P\n\nSee [the API](api.md).\n"
    tree[`${folder}/api.md`] = "# API\n"
    tree[`${folder}/package.json`] = JSON.stringify({ private: true })
    const source = `../../../${folder}`
    tree[`content/docs/${slug}/index.mdx`] = page(`<include>${source}/README.md</include>`)
    tree[`content/docs/${slug}/api.mdx`] = page(`<include>${source}/api.md</include>`)
    tree[`content/docs/${slug}/meta.json`] = JSON.stringify({ pages: ["api"] })
  }
  tree["content/docs/meta.json"] = JSON.stringify({
    pages: [...USE_PAGES, "engine", "react", "editor"],
  })
  return { ...tree, ...translatedPages() }
}

describe("docs:check", () => {
  it("passes the repository's docs", () => {
    expect(checkDocs(ROOT)).toEqual([])
  })

  it("passes docs that are their packages' files", () => {
    expect(checkDocs(repo(packages()))).toEqual([])
  })

  it("names each fault and where it is", () => {
    const tree = packages()
    tree["content/docs/engine/index.mdx"] = page("<include>../../../cad/README.md</include>", "tutorial")
    tree["content/docs/react/api.mdx"] = page("Copied by hand.")
    delete tree["content/docs/editor/api.mdx"]
    tree["cad/README.md"] = "# E\n\n[gone](missing.md) and `[code](no.md)`\n\n```ts examples/none.ts\nx\n```\n"
    tree["content/docs/guide.mdx"] = page("[a page](/docs/engine) and [none](/docs/nope#x)", "howTo")
    tree["content/docs/meta.json"] = JSON.stringify({ pages: ["engine", "ghost", "---Section---"] })
    tree["cad/package.json"] = JSON.stringify({ homepage: "https://github.com/x" })
    expect(checkDocs(repo(tree))).toEqual([
      'content/docs/guide.mdx: "guide" is not in USE_PAGES (lib/docs/use.ts)',
      "content/docs/engine/index.mdx: frontmatter type: Invalid option: expected one of \"gettingStarted\"|\"howTo\"|\"reference\"|\"concept\"",
      'content/docs/guide.mdx: the link "/docs/nope#x" names no page',
      "content/docs/react/api.mdx: the page is its file and nothing else: <include>../../../packages/react/api.md</include>",
      "cad/package.json: a published package's homepage is https://mellowcad.com/docs/engine",
      'cad/README.md: cad: the link "missing.md" names no file of the repository',
      'cad/README.md: the block of "examples/none.ts" names no file',
      "content/docs/editor/api.mdx: missing: the page of packages/editor/api.md",
      'content/docs/editor/meta.json: "api" is no page or folder of content/docs/editor',
      'content/docs/meta.json: "ghost" is no page or folder of content/docs',
    ])
  })

  it("holds each translation to its English page", () => {
    const tree = packages()
    const [name] = USE_PAGES
    tree[`content/docs/${name}.mdx`] += "A new line.\n"
    delete tree[`content/docs/${name}.ar.mdx`]
    const hash = sourceHash(tree[`content/docs/${name}.mdx`])
    expect(checkDocs(repo(tree))).toEqual([
      `content/docs/${name}.es.mdx: out of date with ${name}.mdx: bring it up to date, then set sourceHash: "${hash}"`,
      `content/docs/${name}.ar.mdx: missing: ${name}.mdx in ar`,
    ])
  })

  it("holds a generated page's translations to its generator", () => {
    const tree = packages()
    const [name] = USE_PAGES
    const generated = (body: string) =>
      `---\ntitle: T\ndescription: D\ntype: reference\ngenerated: "gen.test.ts"\n---\n\n${body}\n`
    tree[`content/docs/${name}.mdx`] = generated("## A [#a]")
    tree[`content/docs/${name}.es.mdx`] = generated("## A [#a]")
    tree[`content/docs/${name}.ar.mdx`] = translated("x", "## A [#a]")
    tree["content/docs/guide.mdx"] = page(`[a](/docs/${name}#a) [b](/docs/${name}#b)`)
    expect(checkDocs(repo(tree))).toEqual([
      'content/docs/guide.mdx: "guide" is not in USE_PAGES (lib/docs/use.ts)',
      `content/docs/${name}.ar.mdx: written by gen.test.ts, as ${name}.mdx is: no sourceHash`,
      `content/docs/guide.mdx: the link "/docs/${name}#b" names no heading of /docs/${name}`,
    ])
  })
})

describe("the docs' paths and links", () => {
  it("serves a page at its folders, an index at its folder's", () => {
    expect(contentPagePath("engine/index.mdx")).toBe("/docs/engine")
    expect(contentPagePath("engine/api.mdx")).toBe("/docs/engine/api")
    expect(contentPagePath("start.es.mdx")).toBe("/docs/start")
  })

  it("reads links outside code only", () => {
    expect(
      markdownLinks('[a](a.md) `[b](b.md)`\n\n```md\n[c](c.md)\n```\n[d](d.md "title")')
    ).toEqual(["a.md", "d.md"])
  })

  it("sends a package file's links to their page, or to GitHub", () => {
    const github = "https://github.com/ovelilla/mellowcad"
    expect(resolvePackageLink("api.md#entry", "packages/react", ROOT)).toBe(
      "/docs/react/api#entry"
    )
    expect(resolvePackageLink("../../cad/README.md", "packages/react", ROOT)).toBe(
      "/docs/engine"
    )
    expect(resolvePackageLink("../examples/engine-node", "cad", ROOT)).toBe(
      `${github}/tree/main/examples/engine-node`
    )
    expect(resolvePackageLink("LICENSE", "cad", ROOT)).toBe(`${github}/blob/main/cad/LICENSE`)
    expect(resolvePackageLink("https://npmjs.com", "cad", ROOT)).toBe("https://npmjs.com")
    expect(resolvePackageLink("#languages", "cad", ROOT)).toBe("#languages")
  })
})
