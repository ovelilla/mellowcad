import { describe, expect, it } from "vitest"
import {
  type Keyword,
  abbreviationOf,
  offerKeywords,
  parseCommandInput,
  resolveKeyword,
} from "./keywords"

const english = (id: string): Keyword => ({ id, word: id, global: id })

describe("a keyword's abbreviation", () => {
  it("is its run of capitals, wherever it sits in the word", () => {
    expect(abbreviationOf("Close")).toBe("C")
    expect(abbreviationOf("eXit")).toBe("X")
    expect(abbreviationOf("desHacer")).toBe("H")
    expect(abbreviationOf("toP")).toBe("P")
    expect(abbreviationOf("SIZ")).toBe("SIZ")
    expect(abbreviationOf("LAyer")).toBe("LA")
    expect(abbreviationOf("Included angle")).toBe("I")
  })

  it("takes digits as capitals, so CIRCLE's 3P and 2P are typed whole", () => {
    expect(abbreviationOf("3P")).toBe("3P")
    expect(abbreviationOf("2P")).toBe("2P")
    expect(abbreviationOf("Ttr")).toBe("T")
  })

  it("is empty when nothing is capitalised", () => {
    expect(abbreviationOf("close")).toBe("")
  })
})

describe("resolving what was typed", () => {
  const line = [english("Close"), english("Undo")]
  const spanish: Keyword[] = [
    { id: "Close", word: "Cerrar", global: "Close" },
    { id: "Undo", word: "desHacer", global: "Undo" },
  ]

  it("takes the abbreviation or the whole word, in any case", () => {
    expect(resolveKeyword("c", line)).toBe("Close")
    expect(resolveKeyword("UNDO", line)).toBe("Undo")
    expect(resolveKeyword(" close ", line)).toBe("Close")
    expect(resolveKeyword("cl", line)).toBe("Close")
    expect(resolveKeyword("closer", line)).toBeNull()
    expect(resolveKeyword("", line)).toBeNull()
  })

  it("reads the command language without _, and the global one with it", () => {
    expect(resolveKeyword("H", spanish)).toBe("Undo")
    expect(resolveKeyword("deshacer", spanish)).toBe("Undo")
    expect(resolveKeyword("U", spanish)).toBeNull()
    expect(resolveKeyword("_U", spanish)).toBe("Undo")
    expect(resolveKeyword("_close", spanish)).toBe("Close")
    expect(resolveKeyword("_H", spanish)).toBeNull()
    expect(resolveKeyword("desh", spanish)).toBe("Undo")
    expect(resolveKeyword("des", spanish)).toBeNull()
    expect(resolveKeyword("_", spanish)).toBeNull()
  })

  // AutoCAD 2023's console: `EXI` ends ARRAYRECT, `OB` is UCS ZAxis's Object.
  it("takes the start of the word as far as its capitals and on", () => {
    const array = [english("COUnt"), english("COLumns"), english("eXit")]
    expect(resolveKeyword("EXI", array)).toBe("eXit")
    expect(resolveKeyword("ex", array)).toBe("eXit")
    expect(resolveKeyword("e", array)).toBeNull()
    expect(resolveKeyword("co", array)).toBeNull()
    expect(resolveKeyword("COLU", array)).toBe("COLumns")
    expect(resolveKeyword("OB", [english("Object")])).toBe("Object")
  })

  it("hands back the global id however it was typed", () => {
    expect(resolveKeyword("Cerrar", spanish)).toBe("Close")
    expect(resolveKeyword("_C", spanish)).toBe("Close")
  })
})

describe("the abbreviation on offer", () => {
  it("is the capitals of the word, as long as they run", () => {
    const offered = offerKeywords([
      { id: "TL", word: "SIZ", global: "TL" },
      { id: "Undo", word: "desHacer", global: "Undo" },
    ])
    expect(offered.map((keyword) => keyword.abbreviation)).toEqual(["SIZ", "H"])
  })
})

describe("a typed command", () => {
  it("is compared in capitals, with _ asking for the global name", () => {
    expect(parseCommandInput(" line ")).toEqual({ name: "LINE", global: false })
    expect(parseCommandInput("_line")).toEqual({ name: "LINE", global: true })
  })

  it("upper-cases the same whatever the page's locale", () => {
    // `i` stays `I`: a Turkish locale must not turn it into a dotted capital.
    expect(parseCommandInput("circle").name).toBe("CIRCLE")
  })
})
