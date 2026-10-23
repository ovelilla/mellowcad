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

// AutoCAD's numbers, from MPDUMP: each exploded line's insertion point (the
// baseline's left end), ActualWidth and ActualHeight. All at x 0.
interface ProbedMText {
  readonly probe: string
  readonly contents: string
  readonly y: number
  readonly options?: Parameters<typeof createMText>[2]
  readonly lines: readonly (readonly [number, number, string])[]
  readonly actualWidth: number
  readonly actualHeight: number
}

const PROBED: readonly ProbedMText[] = [
  {
    probe: "text/p303 a",
    contents: "HHH\\PHHH",
    y: 1000,
    lines: [
      [-1.11869, 990, "HHH"],
      [-1.11869, 973.33333, "HHH"],
    ],
    actualWidth: 28.02183,
    actualHeight: 26.66667,
  },
  {
    probe: "text/p303 b",
    contents: "OOO\\PHHH",
    y: 900,
    lines: [
      [-0.67531, 889.82265, "OOO"],
      [-1.11869, 873.15598, "HHH"],
    ],
    actualWidth: 31.29604,
    actualHeight: 26.84402,
  },
  {
    probe: "text/p303 c",
    contents: "HHH\\POOO",
    y: 800,
    lines: [
      [-1.11869, 790, "HHH"],
      [-0.67531, 773.15598, "OOO"],
    ],
    actualWidth: 31.29604,
    actualHeight: 27.01455,
  },
  {
    probe: "text/p303 d",
    contents: "ggg\\PHHH",
    y: 700,
    lines: [
      [-0.4502, 690, "ggg"],
      [-1.11869, 673.33333, "HHH"],
    ],
    actualWidth: 28.02183,
    actualHeight: 26.66667,
  },
  {
    probe: "text/p303 e",
    contents: "xxx\\Pxxx",
    y: 600,
    lines: [
      [-0.10232, 590, "xxx"],
      [-0.10232, 573.33333, "xxx"],
    ],
    actualWidth: 20.75034,
    actualHeight: 26.66667,
  },
  {
    probe: "text/p303 f",
    contents: "H\\PH\\PH",
    y: 500,
    lines: [
      [-1.11869, 490, "H"],
      [-1.11869, 473.33333, "H"],
      [-1.11869, 456.66667, "H"],
    ],
    actualWidth: 7.84447,
    actualHeight: 43.33333,
  },
  {
    probe: "text/p303 g",
    contents: "HHH\\PHHH",
    y: 400,
    options: { height: 2.5 },
    lines: [
      [-0.27967, 397.5, "HHH"],
      [-0.27967, 393.33333, "HHH"],
    ],
    actualWidth: 7.00546,
    actualHeight: 6.66667,
  },
  {
    probe: "text/p303 h",
    contents: "The quick brown fox jumps over the lazy dog",
    y: 300,
    options: { width: 100 },
    lines: [
      [-0.32742, 290, "The quick"],
      [-0.91405, 273.1628, "brown fox"],
      [0, 256.49613, "jumps over the"],
      [-0.89359, 239.82947, "lazy dog"],
    ],
    actualWidth: 91.04366,
    actualHeight: 63.1105,
  },
  {
    probe: "text/p303 i",
    contents: "HHH\\PHHH",
    y: 200,
    options: { attachment: "mc" },
    lines: [
      [-15.1296, 203.33333, "HHH"],
      [-15.1296, 186.66667, "HHH"],
    ],
    actualWidth: 28.02183,
    actualHeight: 26.66667,
  },
  {
    probe: "text/p303 j",
    contents: "HHH\\PHHH",
    y: 100,
    options: { attachment: "br" },
    lines: [
      [-29.14052, 116.66667, "HHH"],
      [-29.14052, 100, "HHH"],
    ],
    actualWidth: 28.02183,
    actualHeight: 26.66667,
  },
  {
    probe: "text/p303 k",
    contents: "HHH\\PHHH",
    y: 0,
    options: { lineSpacingFactor: 2 },
    lines: [
      [-1.11869, -10, "HHH"],
      [-1.11869, -43.33333, "HHH"],
    ],
    actualWidth: 28.02183,
    actualHeight: 43.33333,
  },
  {
    probe: "text/p303 l",
    contents: "HHH\\PHHH",
    y: -100,
    options: { lineSpacingStyle: "exactly" },
    lines: [
      [-1.11869, -110, "HHH"],
      [-1.11869, -126.66667, "HHH"],
    ],
    actualWidth: 28.02183,
    actualHeight: 30,
  },
  {
    probe: "text/p303 m",
    contents: "W\\PiiiiW",
    y: -200,
    lines: [
      [-0.17053, -210, "W"],
      [-0.92769, -226.66667, "iiiiW"],
    ],
    actualWidth: 24.51569,
    actualHeight: 26.66667,
  },
  {
    probe: "text/p327 BL Exactly",
    contents: "HHH\\PHHH",
    y: 0,
    options: { attachment: "bl", lineSpacingStyle: "exactly" },
    lines: [
      [-1.11869, 20, "HHH"],
      [-1.11869, 3.33333, "HHH"],
    ],
    actualWidth: 28.02183,
    actualHeight: 30,
  },
  {
    probe: "text/p327 ML Exactly",
    contents: "HHH\\PHHH",
    y: 100,
    options: { attachment: "ml", lineSpacingStyle: "exactly" },
    lines: [
      [-1.11869, 105, "HHH"],
      [-1.11869, 88.33333, "HHH"],
    ],
    actualWidth: 28.02183,
    actualHeight: 30,
  },
  {
    probe: "text/p327 BL",
    contents: "HHH\\Pggg",
    y: 200,
    options: { attachment: "bl" },
    lines: [
      [-1.11869, 219.60664, "HHH"],
      [-0.4502, 202.94, "ggg"],
    ],
    actualWidth: 28.02183,
    actualHeight: 29.60664,
  },
  {
    probe: "text/p327 ML",
    contents: "HHH\\Pggg",
    y: 300,
    options: { attachment: "ml" },
    lines: [
      [-1.11869, 304.80332, "HHH"],
      [-0.4502, 288.13665, "ggg"],
    ],
    actualWidth: 28.02183,
    actualHeight: 29.60664,
  },
  {
    probe: "text/p327 BL ggg",
    contents: "ggg",
    y: 400,
    options: { attachment: "bl" },
    lines: [[-0.4502, 402.94, "ggg"]],
    actualWidth: 21.9236,
    actualHeight: 12.93997,
  },
  {
    probe: "text/p327 BL HHH",
    contents: "HHH",
    y: 500,
    options: { attachment: "bl" },
    lines: [[-1.11869, 500, "HHH"]],
    actualWidth: 28.02183,
    actualHeight: 10,
  },
]

describe("MTEXT layout, by ink as AutoCAD's", () => {
  for (const c of PROBED) {
    it(`${c.probe}: ${c.contents}`, () => {
      const mtext = createMText(p(0, c.y), c.contents, {
        height: 10,
        ...c.options,
      })
      const layout = mtextLayout(mtext)
      expect(layout.lines.map((line) => line.value)).toEqual(
        c.lines.map(([, , value]) => value)
      )
      layout.lines.forEach((line, i) => {
        expect(line.start).toBeCloseTo(c.lines[i][0], 4)
        expect(line.y + c.y).toBeCloseTo(c.lines[i][1], 4)
      })
      expect(layout.y1 - layout.y0).toBeCloseTo(c.actualHeight, 4)
      if (!(mtext.width > 0)) {
        expect(layout.x1 - layout.x0).toBeCloseTo(c.actualWidth, 4)
      }
    })
  }

  // text/p332: "HHH HHH" at 10, ink 62.169 and advance 64.413. AutoCAD's
  // one-line ActualHeight is 10.0068, a font unit below the baseline that no
  // glyph's ink explains: left alone.
  for (const [width, count] of [
    [62, 2],
    [63, 1],
    [64.3, 1],
    [64.5, 1],
  ] as const) {
    it(`wraps by the line's ink: width ${width}, ${count} line(s) (text/p332)`, () => {
      const layout = mtextLayout(
        createMText(p(0, 0), "HHH HHH", { height: 10, width })
      )
      expect(layout.lines).toHaveLength(count)
      expect(layout.x1 - layout.x0).toBe(width)
    })
  }

  it("keeps an over-long word whole", () => {
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
    expect(layout.x1 - layout.x0).toBeGreaterThan(word * 2.5)
  })

  it("hangs the defined width off the attachment point", () => {
    const right = mtextLayout(
      createMText(p(0, 0), "HHH\\PHHH", {
        height: 10,
        width: 100,
        attachment: "br",
      })
    )
    expect([right.x0, right.x1, right.y0]).toEqual([-100, 0, 0])
    expect(right.align).toBe("right")
    // The line's ink ends on the edge, as text/p303 j's.
    expect(right.lines[0].start).toBeCloseTo(-29.14052, 4)

    const middle = mtextLayout(
      createMText(p(0, 0), "HHH", { height: 10, width: 100, attachment: "mc" })
    )
    expect([middle.x0, middle.x1, middle.y0, middle.y1]).toEqual([
      -50, 50, -5, 5,
    ])
    expect(middle.lines[0].start).toBeCloseTo(-15.1296, 4)
  })

  // text/p307, p329, p330: Node on "Hola", MC at 70,45, height 2.5, width
  // 40, finds the frame's corners at x 50 and 90, y 45 ± 1.270464.
  it("frames the defined width by the actual height (text/p307, p330)", () => {
    const corners = mtextCorners(
      createMText(p(70, 45), "Hola", {
        height: 2.5,
        width: 40,
        attachment: "mc",
      })
    )
    expect(corners[0]).toBeCloseToPoint(p(50, 43.729536), 5)
    expect(corners[2]).toBeCloseToPoint(p(90, 46.270464), 5)
  })

  it("bounds the rotated box", () => {
    const mtext = createMText(p(10, 0), "HHH", {
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
  // pieces/p255 (Top left), p256 (Middle center) at 10,50: every TEXT is
  // BaseLeft at its line's baseline left end, set by the ink (text/p303).
  it("gives one Left text per line where AutoCAD's stand", () => {
    const options = { height: 10, layerId: "Notes" }
    const tl = mtextLineTexts(createMText(p(10, 50), "OLD\\PLINES", options))
    expect(tl.map((text) => text.value)).toEqual(["OLD", "LINES"])
    expect(tl.map((text) => text.justify)).toEqual(["left", "left"])
    expect(tl[0].position).toBeCloseToPoint(p(9.32469, 39.82265), 4)
    expect(tl[1].position).toBeCloseToPoint(p(8.97681, 22.98545), 4)
    expect(tl[0].layerId).toBe("Notes")

    const mc = mtextLineTexts(
      createMText(p(10, 50), "OLD\\PLINES", { ...options, attachment: "mc" })
    )
    expect(mc[0].position).toBeCloseToPoint(p(-4.3281, 53.41519), 4)
    expect(mc[1].position).toBeCloseToPoint(p(-10.33424, 36.57799), 4)
  })

  it("leaves nothing for a blank line", () => {
    const texts = mtextLineTexts(
      createMText(p(0, 0), "ONE\\P\\PTWO", { height: 10, width: 200 })
    )
    expect(texts.map((text) => text.value)).toEqual(["ONE", "TWO"])
  })

  it("starts a right-attached line where it is drawn, turned with the object", () => {
    const mtext = createMText(p(10, 0), "HHH", {
      height: 10,
      attachment: "br",
      rotation: Math.PI / 2,
    })
    const [text] = mtextLineTexts(mtext)
    expect(text.justify).toBe("left")
    expect(text.rotation).toBeCloseTo(Math.PI / 2)
    // text/p303 j's −29.14052 along the turned baseline.
    expect(text.position).toBeCloseToPoint(p(10, -29.14052), 4)
  })
})
