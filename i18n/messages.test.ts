import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { parse } from "@formatjs/icu-messageformat-parser"
import { describe, expect, it } from "vitest"

import { editorTags, readEditorCatalog } from "../scripts/locales/editor"
import { type Tree, flatten, plurals, signature } from "../scripts/locales/icu"
import { mergeMessages } from "./messages"
import { LOCALE_STATUS, routing } from "./routing"

const MESSAGES_DIR = join(__dirname, "..", "messages")

function catalog(locale: string): Tree {
  return JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), "utf8"))
}

const english = flatten(catalog(routing.defaultLocale))

// A live language must be complete; so must one whose translation is done,
// even while it waits in draft: add it here by name until it goes live.
const TRANSLATED = routing.locales.filter(
  (locale) => LOCALE_STATUS[locale] === "live"
)

describe("the app's message catalogs", () => {
  it("exist for exactly the routed languages", () => {
    const files = readdirSync(MESSAGES_DIR)
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(/\.json$/, ""))
    expect(files.sort()).toEqual([...routing.locales].sort())
  })

  it("hold ICU the message parser accepts, every plural with `other`", () => {
    for (const locale of routing.locales) {
      for (const [key, message] of flatten(catalog(locale))) {
        const elements = parse(message)
        for (const options of plurals(elements)) {
          expect(options, `${locale}: ${key}`).toContain("other")
        }
      }
    }
  })

  it("translate only English's keys, with its arguments and tags", () => {
    for (const locale of routing.locales) {
      for (const [key, message] of flatten(catalog(locale))) {
        const source = english.get(key)
        expect(source, `${locale}: ${key} is not an English key`).toBeDefined()
        expect(signature(parse(message)), `${locale}: ${key}`).toEqual(
          signature(parse(source!))
        )
      }
    }
  })

  it("are complete in every live or translated language", () => {
    for (const locale of TRANSLATED) {
      expect([...flatten(catalog(locale)).keys()].sort(), locale).toEqual(
        [...english.keys()].sort()
      )
    }
  })
})

// The editor's own catalog (components/cad/locales/) is checked beside it;
// which languages the site needs it in is the site's to say.
describe("the editor's catalogs, for the site", () => {
  it("exist for exactly the routed languages", () => {
    expect(editorTags().sort()).toEqual([...routing.locales].sort())
  })

  it("are complete in every live or translated language", () => {
    const keys = [...flatten(readEditorCatalog(routing.defaultLocale)).keys()]
    for (const locale of TRANSLATED) {
      expect(
        [...flatten(readEditorCatalog(locale)).keys()].sort(),
        locale
      ).toEqual(keys.sort())
    }
  })
})

describe("mergeMessages", () => {
  it("lays a partial language over English key by key", () => {
    const merged = mergeMessages(
      { A: { one: "One", two: "Two" }, B: { three: "Three" } },
      { A: { two: "Dos" } }
    )
    expect(merged).toEqual({
      A: { one: "One", two: "Dos" },
      B: { three: "Three" },
    })
  })

  it("replaces a precompiled message whole", () => {
    // icu-minify's form of "Hello {name}" and "Hola {name}".
    const merged = mergeMessages(
      { A: { greet: ["Hello ", ["name"]] } },
      { A: { greet: ["Hola ", ["name"]] } }
    )
    expect(merged).toEqual({ A: { greet: ["Hola ", ["name"]] } })
  })
})

/** The names of an `import { … }` or `export { … }` list, without `type`. */
function importedNames(list: string): string[] {
  return list
    .split(",")
    .map((name) => name.replace(/^\s*type\s+/, "").trim())
    .filter(Boolean)
}

describe("the editor", () => {
  const dir = join(__dirname, "..", "packages", "editor", "src")

  // The editor is a library with a catalog of its own: next-intl is the
  // site's, and /draw ships none of it.
  it("never reads the site's catalog", () => {
    for (const file of readdirSync(dir, {
      recursive: true,
      encoding: "utf8",
    })) {
      if (!/\.tsx?$/.test(file)) continue
      const source = readFileSync(join(dir, file), "utf8")
      expect(source, file).not.toMatch(/from "next-intl/)
    }
  })

  // The landing never mounts the editor's catalog: an editor component it
  // embeds that read one would speak English on every page.
  it("lends the landing only components that take their words as props", () => {
    const modules = new Map<string, string>()
    const barrel = readFileSync(join(dir, "index.ts"), "utf8")
    for (const [, names, from] of barrel.matchAll(
      /export (?:type )?\{([^}]*)\} from "\.\/([^"]+)"/g
    )) {
      for (const name of importedNames(names)) modules.set(name, from)
    }
    const landing = join(__dirname, "..", "components", "marketing")
    for (const file of readdirSync(landing)) {
      const source = readFileSync(join(landing, file), "utf8")
      for (const [, names] of source.matchAll(
        /import (?:type )?\{([^}]*)\} from "@mellowcad\/editor"/g
      )) {
        for (const name of importedNames(names)) {
          const from = modules.get(name)
          expect(from, `${file} embeds ${name}`).toBeDefined()
          const tsx = join(dir, `${from}.tsx`)
          const lent = existsSync(tsx) ? tsx : join(dir, `${from}.ts`)
          expect(
            readFileSync(lent, "utf8"),
            `${file} embeds ${name}`
          ).not.toMatch(/useEditorText\(/)
        }
      }
    }
  })
})
