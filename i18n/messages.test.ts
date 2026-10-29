import { readFileSync, readdirSync } from "node:fs"
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

describe("the editor", () => {
  const dir = join(__dirname, "..", "components", "cad")

  // Only `Editor.*` reaches the browser (app/[locale]/(app)/layout.tsx).
  it("reads only its own namespace", () => {
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
      const source = readFileSync(join(dir, file), "utf8")
      for (const [, namespace] of source.matchAll(
        /useTranslations\(\s*"([^"]*)"/g
      )) {
        expect(namespace, file).toMatch(/^Editor(\.|$)/)
      }
    }
  })

  // The landing has no message provider: an editor component it embeds that
  // reached for one would throw the moment it rendered there.
  it("lends the landing only components that take their words as props", () => {
    const landing = join(__dirname, "..", "components", "marketing")
    for (const file of readdirSync(landing)) {
      const source = readFileSync(join(landing, file), "utf8")
      for (const [, name] of source.matchAll(
        /from "@\/components\/cad\/([^"]+)"/g
      )) {
        const lent = readFileSync(join(dir, `${name}.tsx`), "utf8")
        expect(lent, `${file} embeds ${name}`).not.toMatch(
          /use(Translations|Formatter|Locale|Messages)\(/
        )
      }
    }
  })
})
