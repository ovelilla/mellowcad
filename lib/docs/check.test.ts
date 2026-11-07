import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, describe, expect, it } from "vitest"

import { checkDocs, contentPagePath, markdownLinks } from "./check"
import { coverageEntry, parseNotes } from "./command-pages"
import { resolvePackageLink } from "./remark-package-source"
import { DIFFERENCES, DIFFERENCES_PAGE } from "./differences"
import { USE_PAGES, sourceHash } from "./use"
import { LOCALE_STATUS, routing } from "../../i18n/routing"

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

// Each page its own title and description, as docs:check holds them.
let pages = 0

const page = (body: string, type = "reference") =>
  `---\ntitle: T${++pages}\ndescription: D${pages}\ntype: ${type}\n---\n\n${body}\n`

const translated = (english: string, body: string) =>
  `---\ntitle: T${++pages}\ndescription: D${pages}\ntype: howTo\nsourceHash: "${sourceHash(english)}"\n---\n\n${body}\n`

const differences = DIFFERENCES.map(({ id }) => `## ${id} [#${id}]`).join("\n\n")

const TRANSLATIONS = routing.locales.filter((locale) => locale !== routing.defaultLocale)
const LIVE = TRANSLATIONS.filter((locale) => LOCALE_STATUS[locale] === "live")
const DRAFTS = TRANSLATIONS.filter((locale) => LOCALE_STATUS[locale] === "draft")

/**
 * "Use" in every live language, each translation up to date with its English
 * page, the differences in their order and every quote in its file.
 */
function translatedPages(): Record<string, string> {
  const tree: Record<string, string> = {}
  for (const { sources } of DIFFERENCES) {
    for (const { file, quote } of sources) tree[file] = `${tree[file] ?? ""}${quote}\n`
  }
  tree["cad/locales/en.json"] = JSON.stringify({ commands: { names: { LINE: ["LINE", "L"] } } })
  for (const name of USE_PAGES) {
    const body = name === DIFFERENCES_PAGE ? differences : "## Start [#start]"
    const english = page(`${body}\n\nSee [the engine](/docs/engine) and <Command id="LINE" />.`, "howTo")
    tree[`content/docs/${name}.mdx`] = english
    for (const locale of LIVE) tree[`content/docs/${name}.${locale}.mdx`] = translated(english, body)
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
      "content/docs/engine/index.mdx: frontmatter type: Invalid option: expected one of \"gettingStarted\"|\"howTo\"|\"reference\"|\"concept\"|\"practice\"",
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

  it("holds a package's guides to their pages", () => {
    const tree = packages()
    tree["cad/docs/concepts.md"] = "# C\n\n[the API](../api.md), [gone](../nope.md)\n"
    tree["content/docs/engine/concepts.mdx"] = page("<include>../../../cad/docs/concepts.md</include>", "concept")
    tree["cad/docs/hosts.md"] = "# H\n"
    tree["cad/docs/Bad_Name.md"] = "# B\n"
    tree["content/docs/engine/stray.mdx"] = page("Written here.")
    expect(checkDocs(repo(tree))).toEqual([
      "content/docs/engine/stray.mdx: engine/ holds only the package's pages (index, api) and its guides (cad/docs/*.md)",
      "cad/docs/Bad_Name.md: a guide's name is lower case, words joined by -, and neither index nor api",
      'cad/docs/concepts.md: cad/docs: the link "../nope.md" names no file of the repository',
      "content/docs/engine/hosts.mdx: missing: the page of cad/docs/hosts.md",
    ])
  })

  it("holds each translation to its English page", () => {
    const tree = packages()
    const [name] = USE_PAGES
    const missing = LIVE.at(-1)
    tree[`content/docs/${name}.mdx`] += "A new line.\n"
    delete tree[`content/docs/${name}.${missing}.mdx`]
    const hash = sourceHash(tree[`content/docs/${name}.mdx`])
    expect(checkDocs(repo(tree))).toEqual(
      LIVE.map((locale) =>
        locale === missing
          ? `content/docs/${name}.${locale}.mdx: missing: ${name}.mdx in ${locale}`
          : `content/docs/${name}.${locale}.mdx: out of date with ${name}.mdx: bring it up to date, then set sourceHash: "${hash}"`
      )
    )
  })

  it.skipIf(DRAFTS.length === 0)("lets a draft miss a page, but holds the ones it has", () => {
    const tree = packages()
    const [name, written] = USE_PAGES
    for (const locale of DRAFTS) {
      tree[`content/docs/${written}.${locale}.mdx`] = translated("old", "## Start [#start]")
    }
    const hash = sourceHash(tree[`content/docs/${written}.mdx`])
    expect(tree[`content/docs/${name}.${DRAFTS[0]}.mdx`]).toBeUndefined()
    expect(checkDocs(repo(tree))).toEqual(
      DRAFTS.map(
        (locale) =>
          `content/docs/${written}.${locale}.mdx: out of date with ${written}.mdx: bring it up to date, then set sourceHash: "${hash}"`
      )
    )
  })

  it("holds a generated page's translations to its generator", () => {
    const tree = packages()
    const [name] = USE_PAGES
    const generated = (body: string) =>
      `---\ntitle: T${++pages}\ndescription: D${pages}\ntype: reference\ngenerated: "gen.test.ts"\n---\n\n${body}\n`
    const byHand = LIVE.at(-1)
    tree[`content/docs/${name}.mdx`] = generated("## A [#a]")
    for (const locale of LIVE) {
      tree[`content/docs/${name}.${locale}.mdx`] =
        locale === byHand ? translated("x", "## A [#a]") : generated("## A [#a]")
    }
    tree["content/docs/guide.mdx"] = page(`[a](/docs/${name}#a) [b](/docs/${name}#b)`)
    expect(checkDocs(repo(tree))).toEqual([
      'content/docs/guide.mdx: "guide" is not in USE_PAGES (lib/docs/use.ts)',
      `content/docs/${name}.${byHand}.mdx: written by gen.test.ts, as ${name}.mdx is: no sourceHash`,
      `content/docs/guide.mdx: the link "/docs/${name}#b" names no heading of /docs/${name}`,
    ])
  })

  it("gives each page a title and a description of its own, short enough to show whole", () => {
    const tree = packages()
    const [first, second, third] = USE_PAGES
    // Translations, which no English page's hash holds.
    const file = (name: string) => `content/docs/${name}.${LIVE[0]}.mdx`
    tree[file(second)] = tree[file(second)].replace(
      /^title: .*$/m,
      `title: Other\nmetaTitle: ${"A long one, ".repeat(5)}`
    )
    for (const name of [first, third]) {
      tree[file(name)] = tree[file(name)].replace(/^description: .*$/m, "description: Same")
    }
    expect(checkDocs(repo(tree))).toEqual([
      expect.stringMatching(
        new RegExp(`^${file(second).replace(/\./g, "\\.")}: its title in search results, ".+", is over 60`)
      ),
      `${file(third)}: ${file(first)} has the same description: give one a metaTitle or reword it`,
    ])
  })
})

describe("a command's notes", () => {
  const notes = (fields: string, body: string) => `---\n${fields}\n---\n\n${body}\n`
  const questions = "## Questions\n\n### Q1?\n\nA1.\n\n### Q2?\n\nA2."

  it("hold its pages, its coverage entry, the engine's words and its English", () => {
    const tree = packages()
    tree["cad/locales/en.json"] = JSON.stringify({
      commands: {
        names: { LINE: ["LINE", "L"], OFFSET: ["OFFSET", "O"] },
        keywords: { OFFSET: { Through: "Through", Erase: "Erase" } },
        messages: { cannotOffsetObject: "Cannot offset that object." },
      },
    })
    tree["docs/coverage/modify.md"] =
      "# Modify\n\n### `OFFSET` / `O`\n\n**Implemented:** most.\n\n**Missing:** OFFSETGAPTYPE 1 and 2\n"
    const english = notes(
      'title: "OFFSET"\ndescription: "D"\nfigure: "F"\nrelated: ["NOPE"]\ncoverage: "old"',
      `Lead <Message id="nope" />.\n\n## Options\n\n### Through\n\nT.\n\n### Spin\n\nS.\n\n${questions}`
    )
    tree["content/commands/offset.md"] = english
    const [stale, missing] = LIVE
    tree[`content/commands/offset.${stale}.md`] = notes(
      'title: "O2"\ndescription: "D2"\nfigure: "F2"\nbefore: "B2"\nsourceHash: "old"',
      `Lead.\n\n## Options\n\n### Through\n\nT.\n\n## Missing\n\nM.\n\n${questions}`
    )
    for (const locale of LIVE) {
      if (locale === stale || locale === missing) continue
      tree[`content/commands/offset.${locale}.md`] = notes(
        `title: "O${locale}"\ndescription: "D${locale}"\nfigure: "F"\nsourceHash: "${sourceHash(english)}"`,
        `Lead.\n\n## Options\n\n### Through\n\nT.\n\n### Spin\n\nS.\n\n${questions}`
      )
    }
    tree["content/docs/commands/line.mdx"] = page("A page no notes write.")
    const hash = sourceHash(english)
    const coverage = sourceHash("OFFSETGAPTYPE 1 and 2")
    const unwritten = (locale: string) =>
      `content/docs/commands/offset${locale === "en" ? "" : `.${locale}`}.mdx: missing: run npx vitest run lib/docs/generate.test.ts -u`
    const others = LIVE.filter((locale) => locale !== stale && locale !== missing)
    expect(checkDocs(repo(tree))).toEqual([
      "content/docs/commands/line.mdx: no notes write it (content/commands/line.md)",
      `content/commands/offset.md: out of date with its entry in docs/coverage/modify.md ("\`OFFSET\` / \`O\`"): say what it lacks as its Missing does, then set coverage: "${coverage}"`,
      "content/commands/offset.md: its coverage entry lists what it lacks: so does ## Missing",
      "content/commands/offset.md: related: NOPE is no command of cad/locales/en.json",
      unwritten("en"),
      "content/commands/offset.md: Spin is no keyword of OFFSET (cad/locales/en.json)",
      'content/commands/offset.md: <Message id="nope" /> names no message of cad/locales/en.json without arguments',
      unwritten(stale),
      `content/commands/offset.${stale}.md: out of date with content/commands/offset.md: bring it up to date, then set sourceHash: "${hash}"`,
      `content/commands/offset.${stale}.md: its options are the English notes', in order: Through, Spin`,
      `content/commands/offset.${stale}.md: ## Missing goes with the English notes'`,
      `content/commands/offset.${stale}.md: before goes with the English notes'`,
      `content/commands/offset.${missing}.md: missing: OFFSET's notes in ${missing}, a live language`,
      ...others.flatMap((locale) => [unwritten(locale), `content/commands/offset.${locale}.md: Spin is no keyword of OFFSET (cad/locales/en.json)`]),
    ])
  })

  it("read stacked headings as one entry, the last one's", () => {
    const root = repo({
      "docs/coverage/modify.md":
        "# Modify\n\n### `UNION`\n\n### `INTERSECT`\n\n**Implemented:** both.\n\n**Missing:** a gap\n\n### `SLICE`\n\n**Implemented:** all.\n",
    })
    expect(coverageEntry(root, "UNION")).toEqual({ file: "modify.md", heading: "`UNION`", missing: "a gap" })
    expect(coverageEntry(root, "SLICE")).toEqual({ file: "modify.md", heading: "`SLICE`", missing: undefined })
  })

  it("are refused when they do not parse", () => {
    expect(() => parseNotes("---\ntitle: T\n---\n\nLead.\n", "x.md")).toThrow("description is missing")
    const fields = 'title: "T"\ndescription: "D"\nfigure: "F"'
    expect(() => parseNotes(notes(fields, "Lead.\n\n## Steps\n\nS."), "x.md")).toThrow('"## Steps" is none of')
    expect(() => parseNotes(notes(fields, `Lead.\n\n${questions}\n\n## Options`), "x.md")).toThrow("in this order")
    expect(() => parseNotes(notes(fields, "Lead.\n\n## Questions\n\n### Q?\n\nA."), "x.md")).toThrow("two at least")
    expect(() => parseNotes(notes(`${fields}\nbefore: 'A "B"'`, `Lead.\n\n${questions}`), "x.md")).toThrow(
      "the before caption is an attribute"
    )
    const parsed = parseNotes(notes(fields, `Lead.\n\n## Options\n\n### Through\n\nT.\n\n${questions}`), "offset.es.md")
    expect([parsed.id, parsed.locale, parsed.options, parsed.questions.length]).toEqual([
      "OFFSET",
      "es",
      [{ id: "Through", text: "T." }],
      2,
    ])
  })
})

describe("the differences from AutoCAD", () => {
  it("hold each to the words that say why, and the page to their order", () => {
    const tree = packages()
    const [first] = DIFFERENCES
    const { file, quote } = first.sources[0]
    tree[file] = tree[file].replace(quote, "")
    const swapped = differences.replace(`[#${first.id}]`, "[#x]")
    tree[`content/docs/${DIFFERENCES_PAGE}.es.mdx`] = translated(
      tree[`content/docs/${DIFFERENCES_PAGE}.mdx`],
      `${swapped}\n\n<Command id="NOPE" />`
    )
    const order = DIFFERENCES.map(({ id }) => id).join(", ")
    expect(checkDocs(repo(tree))).toEqual([
      `${file}: no longer says why "${first.id}" differs from AutoCAD: "${quote}" (lib/docs/differences.ts)`,
      `content/docs/${DIFFERENCES_PAGE}.es.mdx: its sections are those of lib/docs/differences.ts, in order: ${order}`,
      `content/docs/${DIFFERENCES_PAGE}.es.mdx: <Command id="NOPE" /> names no command of cad/locales/en.json`,
    ])
  })
})

describe("the docs' paths and links", () => {
  it("serves a page at its folders, an index at its folder's", () => {
    expect(contentPagePath("engine/index.mdx")).toBe("/docs/engine")
    expect(contentPagePath("engine/api.mdx")).toBe("/docs/engine/api")
    expect(contentPagePath("start.es.mdx")).toBe("/docs/start")
    expect(contentPagePath("start.pt-BR.mdx")).toBe("/docs/start")
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
    expect(resolvePackageLink("../README.md#install", "cad/docs", ROOT)).toBe(
      "/docs/engine#install"
    )
  })
})
