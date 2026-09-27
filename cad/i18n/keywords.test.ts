import { describe, expect, it } from "vitest"
import {
  type Keyword,
  abbreviationOf,
  keywordForKey,
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
    expect(resolveKeyword("cl", line)).toBeNull()
    expect(resolveKeyword("", line)).toBeNull()
  })

  it("reads the command language without _, and the global one with it", () => {
    expect(resolveKeyword("H", spanish)).toBe("Undo")
    expect(resolveKeyword("deshacer", spanish)).toBe("Undo")
    expect(resolveKeyword("U", spanish)).toBeNull()
    expect(resolveKeyword("_U", spanish)).toBe("Undo")
    expect(resolveKeyword("_close", spanish)).toBe("Close")
    expect(resolveKeyword("_H", spanish)).toBeNull()
    expect(resolveKeyword("_", spanish)).toBeNull()
  })

  it("hands back the global id however it was typed", () => {
    expect(resolveKeyword("Cerrar", spanish)).toBe("Close")
    expect(resolveKeyword("_C", spanish)).toBe("Close")
  })
})

describe("the single key", () => {
  it("runs a one-letter abbreviation that starts no other", () => {
    const offered = offerKeywords([english("Close"), english("Undo")])
    expect(offered.map((keyword) => keyword.key)).toEqual(["C", "U"])
    expect(keywordForKey("u", offered)?.id).toBe("Undo")
  })

  it("is withheld when another abbreviation starts with the same letter", () => {
    const offered = offerKeywords([
      { id: "Scale", word: "Escala", global: "Scale" },
      { id: "Extents", word: "EXtensión", global: "Extents" },
    ])
    expect(offered.map((keyword) => keyword.key)).toEqual([null, null])
    expect(keywordForKey("E", offered)).toBeNull()
  })

  it("is never a longer abbreviation", () => {
    const offered = offerKeywords([
      { id: "TL", word: "SIZ", global: "TL" },
      { id: "Left", word: "Izquierda", global: "Left" },
    ])
    expect(offered.map((keyword) => keyword.key)).toEqual([null, "I"])
    expect(offered[0].abbreviation).toBe("SIZ")
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
