import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { parse } from "opentype.js"
import { describe, expect, it } from "vitest"

import ja from "@/messages/ja.json"

import { JAPANESE_CARD_FONT, cardSentences, visualPieces } from "./og"

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

describe("cardSentences", () => {
  it("puts an opening bracket on the sentence it opens, as ICU does not after 。", () => {
    expect(cardSentences("L と入力。[Enter]を押す。作図する。", "ja")).toEqual([
      "L と入力。",
      "[Enter]を押す。",
      "作図する。",
    ])
    expect(cardSentences("Type L. Press Enter. Draw.", "en")).toEqual([
      "Type L.",
      "Press Enter.",
      "Draw.",
    ])
  })
})

describe("the Japanese card's face", () => {
  it("has every character the Japanese cards set beyond Inter's latin", async () => {
    const data = await readFile(join("assets/fonts", JAPANESE_CARD_FONT))
    const face = parse(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    )
    const card = [ja.Og.tagline, ja.Og.drawTitle, ja.Hero.tagline].join("")
    const missing = [...new Set(card)].filter(
      (character) =>
        character.codePointAt(0)! > 0x24f &&
        face.charToGlyphIndex(character) === 0
    )
    // Cut the face again with these (assets/fonts/README.md).
    expect(missing).toEqual([])
  })
})
