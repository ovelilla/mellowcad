import { describe, expect, it } from "vitest"
import { p, polylineOf } from "../../test/builders"
import {
  closestOnEntity,
  entityBounds,
  entityCrossesRect,
  polylineConstantWidth,
  polylineOutline,
  polylineSpan,
} from "./entities"

describe("polylineOutline", () => {
  it("mitres two straight bands: a wide rectangle has square outer corners", () => {
    const square = polylineOf([p(0, 0), p(10, 0), p(10, 10), p(0, 10)], {
      closed: true,
      widths: Array(4).fill([2, 2]),
    })
    const { bands, wedges, bare } = polylineOutline(square, 0.01)
    expect(wedges).toEqual([])
    expect(bare).toEqual([])
    // The first band, left edge then right edge back: inner corners at 1,1
    // and 9,1, outer ones at -1,-1 and 11,-1.
    expect(bands[0]).toBeCloseToPoints([p(1, 1), p(9, 1), p(11, -1), p(-1, -1)])
  })

  it("tapers a band from its starting to its ending width", () => {
    const arrow = polylineOf([p(0, 0), p(10, 0)], { widths: [[4, 0]] })
    expect(polylineOutline(arrow, 0.01).bands[0]).toBeCloseToPoints([
      p(0, 2),
      p(10, 0),
      p(10, 0),
      p(0, -2),
    ])
  })

  it("bends a band round an arc segment, the width along its sweep", () => {
    // A half circle of radius 5 from 0,0 to 10,0, counter-clockwise.
    const arc = polylineOf([p(0, 0), p(10, 0)], {
      bulges: [1],
      widths: [[2, 4]],
    })
    const [band] = polylineOutline(arc, 0.001).bands
    const half = band.length / 2
    // Left of a counter-clockwise arc is towards its centre.
    expect(band[0]).toBeCloseToPoint(p(1, 0))
    expect(band[half - 1]).toBeCloseToPoint(p(8, 0))
    expect(band[half]).toBeCloseToPoint(p(12, 0))
    expect(band[band.length - 1]).toBeCloseToPoint(p(-1, 0))
  })

  it("closes the outer corner where an arc meets a line at an angle", () => {
    const poly = polylineOf([p(0, 0), p(10, 0), p(20, 0)], {
      bulges: [0, 1],
      widths: [
        [2, 2],
        [2, 2],
      ],
    })
    const { wedges } = polylineOutline(poly, 0.01)
    expect(wedges).toHaveLength(1)
    expect(wedges[0][0]).toBeCloseToPoint(p(10, 0))
  })

  it("draws a segment of no width as its centreline", () => {
    const poly = polylineOf([p(0, 0), p(10, 0), p(10, 10)], {
      widths: [
        [0, 0],
        [2, 2],
      ],
    })
    const { bands, bare } = polylineOutline(poly, 0.01)
    expect(bands).toHaveLength(1)
    expect(bare).toEqual([{ kind: "line", a: p(0, 0), b: p(10, 0) }])
  })
})

describe("a wide polyline as an object", () => {
  const wide = polylineOf([p(0, 0), p(100, 0)], { widths: [[0, 10]] })

  it("is picked anywhere on its band", () => {
    expect(closestOnEntity(wide, p(80, 3.9)).distance).toBe(0)
    expect(closestOnEntity(wide, p(80, 6)).distance).toBeCloseTo(2)
  })

  it("reaches as far as its width", () => {
    const bounds = entityBounds(wide)
    expect(bounds.min).toBeCloseToPoint(p(0, -5))
    expect(bounds.max).toBeCloseToPoint(p(100, 5))
  })

  it("is crossed by a window over its band only", () => {
    expect(entityCrossesRect(wide, p(90, 3), p(95, 4.5))).toBe(true)
    expect(entityCrossesRect(wide, p(10, 3), p(15, 4.5))).toBe(false)
  })

  it("has a constant width only when every segment has the one", () => {
    expect(polylineConstantWidth(wide)).toBeNull()
    const even = polylineOf([p(0, 0), p(1, 0), p(1, 1)], {
      widths: [
        [2, 2],
        [2, 2],
      ],
    })
    expect(polylineConstantWidth(even)).toBe(2)
    expect(polylineConstantWidth(polylineOf([p(0, 0), p(1, 0)]))).toBe(0)
  })

  it("is cut with its width where it is cut", () => {
    expect(polylineSpan(wide, 0.25, 0.5).widths).toEqual([[2.5, 5]])
  })
})
