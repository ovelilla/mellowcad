import { describe, expect, it } from "vitest"

import { visualPieces } from "./og"

const isolated = (text: string) =>
  String.fromCodePoint(0x2068) + text + String.fromCodePoint(0x2069)

describe("visualPieces", () => {
  it("orders the words of a right-to-left line from right to left", () => {
    expect(visualPieces("ابدأ الرسم")).toEqual(["الرسم", " ", "ابدأ"])
  })

  it("keeps each Arabic word, punctuation and all, in logical order", () => {
    // Satori reverses a word with an Arabic letter itself.
    expect(visualPieces("في متصفحك،")).toEqual(["متصفحك،", " ", "في"])
  })

  it("sets a latin run as it reads, its full stop at the line's left end", () => {
    expect(visualPieces(`اكتب ${isolated("L")}.`)).toEqual([
      ".",
      "L",
      " ",
      "اكتب",
    ])
    expect(visualPieces(`اضغط ${isolated("Enter")}.`)).toEqual([
      ".",
      "Enter",
      " ",
      "اضغط",
    ])
  })

  it("mirrors a bracket that reads right to left", () => {
    expect(visualPieces("(كاد)")).toEqual(["(كاد)"])
    expect(visualPieces(`كاد (${isolated("CAD")})`)).toEqual([
      "(",
      "CAD",
      ")",
      " ",
      "كاد",
    ])
  })
})
