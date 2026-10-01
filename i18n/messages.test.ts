import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import {
  type MessageFormatElement,
  isArgumentElement,
  isDateElement,
  isNumberElement,
  isPluralElement,
  isSelectElement,
  isTagElement,
  isTimeElement,
  parse,
} from "@formatjs/icu-messageformat-parser"
import { describe, expect, it } from "vitest"

import { mergeMessages } from "./messages"
import { LOCALE_STATUS, routing } from "./routing"

type Tree = { readonly [key: string]: Tree | string }

const MESSAGES_DIR = join(__dirname, "..", "messages")

function catalog(locale: string): Tree {
  return JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), "utf8"))
}

/** Every message of a catalog, by its dotted key. */
function flatten(tree: Tree, path = ""): Map<string, string> {
  const out = new Map<string, string>()
  for (const [key, value] of Object.entries(tree)) {
    const at = path === "" ? key : `${path}.${key}`
    if (typeof value === "string") out.set(at, value)
    else for (const entry of flatten(value, at)) out.set(...entry)
  }
  return out
}

/** What a message takes: each argument with its type, and each rich tag. */
function signature(elements: MessageFormatElement[]): string[] {
  return elements
    .flatMap((element): string[] => {
      if (isArgumentElement(element)) return [element.value]
      if (isNumberElement(element)) return [`${element.value}:number`]
      if (isDateElement(element) || isTimeElement(element)) {
        return [`${element.value}:date`]
      }
      if (isPluralElement(element) || isSelectElement(element)) {
        return [
          // A plural takes a number, like `{n, number}`: Arabic's six forms
          // agree with a count that English only prints.
          `${element.value}:${isPluralElement(element) ? "number" : "select"}`,
          ...Object.values(element.options).flatMap((option) =>
            signature(option.value)
          ),
        ]
      }
      if (isTagElement(element)) {
        return [`<${element.value}>`, ...signature(element.children)]
      }
      return []
    })
    .filter((entry, index, all) => all.indexOf(entry) === index)
    .sort()
}

function plurals(elements: MessageFormatElement[]): string[][] {
  return elements.flatMap((element) => {
    if (isPluralElement(element) || isSelectElement(element)) {
      return [
        ...(isPluralElement(element) ? [Object.keys(element.options)] : []),
        ...Object.values(element.options).flatMap((option) =>
          plurals(option.value)
        ),
      ]
    }
    return isTagElement(element) ? plurals(element.children) : []
  })
}

const english = flatten(catalog(routing.defaultLocale))

// A live language must be complete; so must one whose translation is done,
// even while it waits in draft — Arabic, until its native review.
const TRANSLATED = routing.locales.filter(
  (locale) =>
    LOCALE_STATUS[locale] === "live" || locale === "es" || locale === "ar"
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
    for (const file of readdirSync(dir)) {
      const source = readFileSync(join(dir, file), "utf8")
      for (const [, namespace] of source.matchAll(
        /useTranslations\(\s*"([^"]*)"/g
      )) {
        expect(namespace, file).toMatch(/^Editor(\.|$)/)
      }
    }
  })

  // The landing has no message provider: an editor component it embeds that
  // reached for one would throw the moment the live sketch opened.
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
