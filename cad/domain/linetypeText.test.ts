import { describe, expect, it } from "vitest"
import { linetypeNamed } from "./linetypes"
import { ACADISO_LIN } from "./linetypeLibrary"
import {
  arcPath,
  linePath,
  linetypeTextPlacements,
  segmentsPath,
} from "./linetypeText"
import { measureTextWidth } from "./text"

const GAS = linetypeNamed(ACADISO_LIN, "GAS_LINE")!
const none = () => 0

/** GAS_LINE's texts along a line from `a` to `b`, at LTSCALE 1. */
const along = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  linetypeTextPlacements(linePath(a, b), "centred", GAS, 1, none)

describe("linetypeTextPlacements", () => {
  // ltype/p15, measured on AutoCAD 2027's plot: a 60-unit line holds two
  // periods; the first dash ends at 12.22, its text starts 2.54 back from the
  // end of the 5.08 gap after it, 1.27 below the line, 2.54 tall.
  it("stands each period's text where AutoCAD plots it", () => {
    const texts = along({ x: 0, y: 0 }, { x: 60, y: 0 })
    const end = (60 - 2 * 24.13 + 12.7) / 2
    expect(texts).toHaveLength(2)
    expect(texts[0].text).toBe("GAS")
    expect(texts[0].at.x).toBeCloseTo(end + 5.08 - 2.54, 9)
    expect(texts[0].at.y).toBeCloseTo(-1.27, 9)
    expect(texts[0].height).toBeCloseTo(2.54, 9)
    expect(texts[0].angle).toBe(0)
    expect(texts[1].at.x - texts[0].at.x).toBeCloseTo(24.13, 9)
  })

  it("turns an upright text half round on a line drawn leftwards, on the same stretch (p15)", () => {
    const right = along({ x: 0, y: 0 }, { x: 60, y: 0 })
    const left = along({ x: 60, y: 0 }, { x: 0, y: 0 })
    const width = measureTextWidth("GAS", 2.54)
    // Read left to right, it covers from the start the stretch the other does.
    expect(left[0].angle).toBeCloseTo(0, 9)
    expect(60 - (left[0].at.x + width)).toBeCloseTo(right[0].at.x, 9)
    expect(left[0].at.y).toBeCloseTo(-1.27, 9)
  })

  it("leaves a text straight up or down as it is (p14)", () => {
    expect(along({ x: 0, y: 0 }, { x: 0, y: 60 })[0].angle).toBeCloseTo(
      Math.PI / 2,
      9
    )
    expect(along({ x: 0, y: 60 }, { x: 0, y: 0 })[0].angle).toBeCloseTo(
      -Math.PI / 2,
      9
    )
  })

  it("lays none on a run shorter than one period, drawn solid (p14)", () => {
    expect(along({ x: 0, y: 0 }, { x: 15, y: 0 })).toEqual([])
  })

  it("lays a circle's round from its start, one per stretched period (p14)", () => {
    const texts = linetypeTextPlacements(
      arcPath({ x: 0, y: 0 }, 30, 0, 2 * Math.PI),
      "loop",
      GAS,
      1,
      none
    )
    expect(texts).toHaveLength(Math.round((2 * Math.PI * 30) / 24.13))
  })

  it("sizes a text by S, the style's fixed height and the scale", () => {
    const texts = linetypeTextPlacements(
      linePath({ x: 0, y: 0 }, { x: 120, y: 0 }),
      "centred",
      GAS,
      2,
      () => 3
    )
    expect(texts[0].height).toBeCloseTo(2.54 * 2 * 3, 9)
  })

  it("walks a polyline's segments, its arcs too", () => {
    const path = segmentsPath([
      { kind: "line", a: { x: 0, y: 0 }, b: { x: 10, y: 0 } },
      {
        kind: "arc",
        a: { x: 10, y: 0 },
        b: { x: 10, y: 10 },
        bulge: 1,
        center: { x: 10, y: 5 },
        radius: 5,
        startAngle: -Math.PI / 2,
        endAngle: Math.PI / 2,
      },
    ])
    expect(path.length).toBeCloseTo(10 + 5 * Math.PI, 9)
    const top = path.pointAt(10 + 2.5 * Math.PI)
    expect(top.x).toBeCloseTo(15, 9)
    expect(top.y).toBeCloseTo(5, 9)
  })
})
