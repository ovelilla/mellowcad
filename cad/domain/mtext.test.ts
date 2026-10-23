import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { p } from "../../test/builders"
import {
  createMText,
  entityBounds,
  measureTextWidth,
  mtextContents,
  mtextCorners,
  mtextLayout,
  mtextLineTexts,
  mtextPlainText,
  MTEXT_LINE_SPACING_FACTOR,
} from "./entities"

describe("MTEXT contents", () => {
  it("reads paragraphs, escapes and a non-breaking space", () => {
    expect(mtextPlainText("ONE\\PTWO")).toBe("ONE\nTWO")
    expect(mtextPlainText("a\\\\b \\{c\\}")).toBe("a\\b {c}")
    expect(mtextPlainText("A\\~B")).toBe("A\u00a0B")
  })

  it("keeps the words of formatted contents and drops the formatting", () => {
    expect(mtextPlainText("{\\H2x;BIG} \\C1;red \\Lunder\\l")).toBe(
      "BIG red under"
    )
    expect(mtextPlainText("\\fArial|b1|i0;Bold")).toBe("Bold")
    expect(mtextPlainText("1\\S1/2;")).toBe("11/2")
    expect(mtextPlainText("\\S+0.1^-0.1;")).toBe("+0.1/-0.1")
    expect(mtextPlainText("90\\U+00B0")).toBe("90°")
  })

  it("reads back exactly what was typed", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !s.includes("\r")),
        (typed) => {
          expect(mtextPlainText(mtextContents(typed))).toBe(typed)
        }
      )
    )
  })

  it("writes a line break as AutoCAD's paragraph code", () => {
    expect(mtextContents("ONE\nTWO\r\nTHREE")).toBe("ONE\\PTWO\\PTHREE")
    expect(mtextContents("{x}\\")).toBe("\\{x\\}\\\\")
  })
})

describe("MTEXT layout", () => {
  const pitch = (height: number, factor = 1) =>
    factor * MTEXT_LINE_SPACING_FACTOR * height

  it("sets one line per paragraph when there is no width", () => {
    const layout = mtextLayout(
      createMText(p(0, 0), "FIRST LINE\\PSECOND", { height: 10 })
    )
    expect(layout.lines.map((line) => line.value)).toEqual([
      "FIRST LINE",
      "SECOND",
    ])
    expect(layout.x1 - layout.x0).toBeCloseTo(
      measureTextWidth("FIRST LINE", 10)
    )
  })

  it("wraps words to the width and keeps an over-long word whole", () => {
    const word = measureTextWidth("WORD", 10)
    const layout = mtextLayout(
      createMText(p(0, 0), "WORD WORD WORD LONGERWORDTHANWIDTH", {
        height: 10,
        width: word * 2.5,
      })
    )
    expect(layout.lines.map((line) => line.value)).toEqual([
      "WORD WORD",
      "WORD",
      "LONGERWORDTHANWIDTH",
    ])
  })

  it("spaces baselines by the factor times single spacing", () => {
    const layout = mtextLayout(
      createMText(p(0, 0), "A\\PB\\PC", { height: 10, lineSpacingFactor: 2 })
    )
    expect(layout.lines.map((line) => line.y)).toEqual([
      -10,
      -10 - pitch(10, 2),
      -10 - 2 * pitch(10, 2),
    ])
  })

  it("hangs the box off the attachment point and grows away from it", () => {
    const top = mtextLayout(
      createMText(p(0, 0), "A\\PB", { height: 10, width: 100 })
    )
    expect([top.x0, top.x1, top.y1]).toEqual([0, 100, 0])
    expect(top.y0).toBeCloseTo(-10 - pitch(10))

    const bottom = mtextLayout(
      createMText(p(0, 0), "A\\PB", {
        height: 10,
        width: 100,
        attachment: "br",
      })
    )
    expect([bottom.x0, bottom.x1, bottom.y0]).toEqual([-100, 0, 0])
    expect(bottom.align).toBe("right")
    expect(bottom.lines.at(-1)!.y).toBeCloseTo(0)

    const middle = mtextLayout(
      createMText(p(0, 0), "A", { height: 10, width: 100, attachment: "mc" })
    )
    expect([middle.x0, middle.x1, middle.y0, middle.y1]).toEqual([
      -50, 50, -5, 5,
    ])
    expect(middle.lines[0].x).toBe(0)
  })

  it("bounds the rotated box", () => {
    const mtext = createMText(p(10, 0), "A", {
      height: 10,
      width: 100,
      rotation: Math.PI / 2,
    })
    const bounds = entityBounds(mtext)
    expect(bounds.min).toBeCloseToPoint(p(10, 0))
    expect(bounds.max).toBeCloseToPoint(p(20, 100))
    expect(mtextCorners(mtext)[2]).toBeCloseToPoint(p(10, 100))
  })
})

describe("exploding MTEXT", () => {
  // probes pieces/p255 (Top left), p256 (Middle center): every TEXT is
  // BaseLeft, at its line's drawn left end, whatever the attachment.
  it("gives one Left text per line, at the left end of its baseline", () => {
    const mtext = createMText(p(0, 0), "ONE\\P\\PTWO", {
      height: 10,
      width: 200,
      attachment: "tc",
      layerId: "Notes",
    })
    const texts = mtextLineTexts(mtext)
    expect(texts.map((text) => text.value)).toEqual(["ONE", "TWO"])
    expect(texts.map((text) => text.justify)).toEqual(["left", "left"])
    expect(texts[0].position).toBeCloseToPoint(
      p(-measureTextWidth("ONE", 10) / 2, -10)
    )
    expect(texts[1].position).toBeCloseToPoint(
      p(-measureTextWidth("TWO", 10) / 2, -10 - 2 * (50 / 3))
    )
    expect(texts[0].layerId).toBe("Notes")
  })

  it("starts a right-attached line where it is drawn, turned with the object", () => {
    const mtext = createMText(p(10, 0), "AB", {
      height: 10,
      attachment: "br",
      rotation: Math.PI / 2,
    })
    const [text] = mtextLineTexts(mtext)
    expect(text.justify).toBe("left")
    expect(text.rotation).toBeCloseTo(Math.PI / 2)
    expect(text.position).toBeCloseToPoint(p(10, -measureTextWidth("AB", 10)))
  })
})
