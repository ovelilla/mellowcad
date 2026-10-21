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

  it("cuts a line's band along the arc's end radius where they meet at an angle", () => {
    // probe pline/p236: `0,-100 W 6`, arc CEnter 25,-100 Angle 180, Line
    // 0,-50: no wedge, the line's band starting along the horizontal radius.
    const poly = polylineOf([p(0, -100), p(50, -100), p(0, -50)], {
      bulges: [1, 0],
      widths: [
        [6, 6],
        [6, 6],
      ],
    })
    const { bands, wedges } = polylineOutline(poly, 0.01)
    expect(wedges).toEqual([])
    const line = bands[1]
    expect(line[0]).toBeCloseToPoint(p(50 - 3 * Math.SQRT2, -100))
    expect(line[line.length - 1]).toBeCloseToPoint(p(50 + 3 * Math.SQRT2, -100))
  })

  it("mitres a corner of 29° and ends both bands square at one of 28° (p235)", () => {
    // The mitre's tip lies 1/sin(θ/2) half-widths out: 3.99 at 29°, 4.13 at 28°.
    const corner = (degrees: number) => {
      const r = ((180 - degrees) * Math.PI) / 180
      return polylineOf(
        [p(0, 0), p(60, 0), p(60 + 60 * Math.cos(r), 60 * Math.sin(r))],
        {
          widths: [
            [6, 6],
            [6, 6],
          ],
        }
      )
    }
    const maxX = (degrees: number) => {
      const { bands, wedges } = polylineOutline(corner(degrees), 0.01)
      expect(wedges).toEqual([])
      return Math.max(...bands.flat().map((q) => q.x))
    }
    expect(maxX(29)).toBeCloseTo(60 + 3 / Math.tan((14.5 * Math.PI) / 180), 6)
    // Square at the vertex, overlapping: the second band's corner reaches
    // past it by 3·sin(28°) (p230, p233, d12).
    expect(maxX(28)).toBeCloseTo(60 + 3 * Math.sin((28 * Math.PI) / 180), 6)
  })

  it("mitres the start of a polyline closed by Close, not one drawn back to its start (p236)", () => {
    const square = [p(0, 0), p(50, 0), p(50, 50), p(0, 50)]
    const widths = Array(4).fill([6, 6])
    const closed = polylineOf(square, { closed: true, widths })
    const xs = polylineOutline(closed, 0.01)
      .bands.flat()
      .map((q) => q.x)
    expect(Math.min(...xs)).toBeCloseTo(-3, 9)
    const back = polylineOf([...square, p(0, 0)], { widths })
    expect(polylineOutline(back, 0.01).bands[0][0]).toBeCloseToPoint(p(0, 3))
  })

  it("stops an arc's band at its centre, however wide (p234)", () => {
    // `0,0 W 24 @0,10 A @20,0`: radius 10, the band 2r out, none past the centre.
    const poly = polylineOf([p(0, 0), p(0, 10), p(20, 10)], {
      bulges: [0, -1],
      widths: [
        [24, 24],
        [24, 24],
      ],
    })
    const arc = polylineOutline(poly, 0.01).bands[1]
    const reach = arc.map((q) => Math.hypot(q.x - 10, q.y - 10))
    expect(Math.max(...reach)).toBeCloseTo(20, 9)
    expect(Math.min(...reach)).toBeCloseTo(0, 9)
  })

  it("draws both bands of a closed polyline of two vertices", () => {
    // probe pline/p227: an arc CLose after one arc is a whole circle.
    const circle = polylineOf([p(0, 0), p(10, 10)], {
      closed: true,
      bulges: [Math.tan(Math.PI / 8), Math.tan((3 * Math.PI) / 8)],
      widths: [
        [2, 2],
        [4, 4],
      ],
    })
    expect(polylineOutline(circle, 0.01).bands).toHaveLength(2)
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
