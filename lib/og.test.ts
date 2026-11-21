import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { parse } from "opentype.js"
import { describe, expect, it } from "vitest"

import ja from "@/messages/ja.json"
import ko from "@/messages/ko.json"
import zhCN from "@/messages/zh-CN.json"

import { CJK_CARD_FONTS, cardSentences, visualPieces } from "./og"

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

describe.each([
  { script: "japanese", messages: ja },
  { script: "korean", messages: ko },
  { script: "simplified-chinese", messages: zhCN },
] as const)("the $script card's face", ({ script, messages }) => {
  it("has every character its cards set beyond Inter's latin", async () => {
    const data = await readFile(
      join("assets/fonts", CJK_CARD_FONTS[script].file)
    )
    const face = parse(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    )
    const card = [
      messages.Og.tagline,
      messages.Og.drawTitle,
      messages.Hero.tagline,
    ].join("")
    const missing = [...new Set(card)].filter(
      (character) =>
        character.codePointAt(0)! > 0x24f &&
        face.charToGlyphIndex(character) === 0
    )
    // Cut the face again with these (assets/fonts/README.md).
    expect(missing).toEqual([])
  })
})
