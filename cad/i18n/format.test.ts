import compile from "icu-minify/compile"
import { describe, expect, it } from "vitest"
import { MessageFormatter } from "./format"
import { mergeCatalog } from "./merge"

const erased = compile(
  "{count, plural, one {# object erased.} other {# objects erased.}}"
)

describe("the message formatter", () => {
  it("formats plurals by the language's own rules", () => {
    const english = new MessageFormatter("en")
    expect(english.format(erased, { count: 1 })).toBe("1 object erased.")
    expect(english.format(erased, { count: 2 })).toBe("2 objects erased.")
  })

  it("writes latin digits where the locale's default numbering is another", () => {
    // Egyptian Arabic defaults to Arabic-Indic digits in CLDR.
    expect(new Intl.NumberFormat("ar-EG").format(123)).not.toBe("123")
    const egyptian = new MessageFormatter("ar-EG")
    expect(egyptian.format(compile("{n, number}"), { n: 123 })).toBe("123")
    expect(egyptian.format(erased, { count: 1234 })).toBe(
      "1234 objects erased."
    )
  })

  it("never groups a count, as AutoCAD's command line does not", () => {
    const english = new MessageFormatter("en")
    expect(english.format(erased, { count: 12345 })).toBe(
      "12345 objects erased."
    )
  })

  it("hands tagged spans to their handlers instead of flattening them", () => {
    const parts = new MessageFormatter("en").formatParts<{ span: string }>(
      compile("{head} <keywords>[{list}]</keywords>:"),
      { head: "LINE", list: "Close/Undo" },
      { keywords: (chunks) => ({ span: chunks.join("") }) }
    )
    expect(parts).toEqual(["LINE ", { span: "[Close/Undo]" }, ":"])
  })
})

describe("merging a language over English", () => {
  it("replaces only what the language provides, key by key", () => {
    const base = { a: { b: "B", c: "C" }, d: ["D", "DD"] }
    expect(mergeCatalog(base, { a: { b: "b" } })).toEqual({
      a: { b: "b", c: "C" },
      d: ["D", "DD"],
    })
  })

  it("replaces a list whole, never item by item", () => {
    const base = { names: { LINE: ["LINE", "L"] } }
    expect(mergeCatalog(base, { names: { LINE: ["LINEA"] } })).toEqual({
      names: { LINE: ["LINEA"] },
    })
  })

  it("leaves the base untouched", () => {
    const base = { a: { b: "B" } }
    mergeCatalog(base, { a: { b: "b" } })
    expect(base).toEqual({ a: { b: "B" } })
  })
})
