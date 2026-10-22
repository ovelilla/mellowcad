import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { offsetPolyline, polylineThroughDistance } from "./polylineOffset"
import type { PolylineWidth } from "./entityTypes"
import { p, polylineOf } from "../../test/builders"
import { point, polylineEntity, positiveLength } from "../../test/arbitraries"

/**
 * Every case is AutoCAD 2027's LWPOLYLINE as its MPDUMP gave it (probes
 * offset/<id>), vertices to full precision.
 */

const QUARTER = 0.41421356237309503
const at = (x: number, y: number) => p(x, y)

const L = () => polylineOf([at(0, 0), at(100, 0), at(100, 100)])
const SQUARE = () =>
  polylineOf([at(0, 0), at(100, 0), at(100, 100), at(0, 100)], {
    closed: true,
  })
const D = () =>
  polylineOf([at(0, 0), at(100, 0), at(100, 100), at(0, 100)], {
    bulges: [0, 1, 0],
  })
const CONCAVE = () =>
  polylineOf([at(0, 0), at(100, 0), at(100, 100), at(0, 100)], {
    closed: true,
    bulges: [0, 0, -0.5, 0],
  })
const ROUNDED = () =>
  polylineOf(
    [
      at(10, 0),
      at(90, 0),
      at(100, 10),
      at(100, 90),
      at(90, 100),
      at(10, 100),
      at(0, 90),
      at(0, 10),
    ],
    { closed: true, bulges: [0, QUARTER, 0, QUARTER, 0, QUARTER, 0, QUARTER] }
  )
const U = () => polylineOf([at(0, 100), at(0, 0), at(100, 0), at(100, 100)])

describe("offsetPolyline", () => {
  it("shifts straight segments and extends them to meet", () => {
    // probe offset/p178.
    const [copy] = offsetPolyline(L(), 10, at(50, 50))
    expect(copy.vertices).toBeCloseToPoints([
      at(0, 10),
      at(90, 10),
      at(90, 100),
    ])
    expect(copy.closed).toBe(false)
    expect(copy.bulges).toEqual([0, 0])
  })

  it("offsets a rectangle out and in", () => {
    // probes offset/p179, p180.
    expect(
      offsetPolyline(SQUARE(), 10, at(50, -50))[0].vertices
    ).toBeCloseToPoints([
      at(-10, -10),
      at(110, -10),
      at(110, 110),
      at(-10, 110),
    ])
    const inward = offsetPolyline(SQUARE(), 10, at(50, 50))
    expect(inward).toHaveLength(1)
    expect(inward[0].closed).toBe(true)
    expect(inward[0].vertices).toBeCloseToPoints([
      at(10, 10),
      at(90, 10),
      at(90, 90),
      at(10, 90),
    ])
  })

  it("makes an arc segment concentric, in and out", () => {
    // probes offset/p181, p182.
    const inward = offsetPolyline(D(), 10, at(50, 50))[0]
    expect(inward.vertices).toBeCloseToPoints([
      at(0, 10),
      at(100, 10),
      at(100, 90),
      at(0, 90),
    ])
    expect(inward.bulges[1]).toBeCloseTo(1, 12)
    const outward = offsetPolyline(D(), 10, at(50, -50))[0]
    expect(outward.vertices).toBeCloseToPoints([
      at(0, -10),
      at(100, -10),
      at(100, 110),
      at(0, 110),
    ])
    expect(outward.bulges[1]).toBeCloseTo(1, 12)
  })

  it("judges the side against an arc, not its chord", () => {
    // probe offset/p226: (140,50) is inside the bulge, so inward, as p181.
    const [copy] = offsetPolyline(D(), 10, at(140, 50))
    expect(copy.vertices).toBeCloseToPoints([
      at(0, 10),
      at(100, 10),
      at(100, 90),
      at(0, 90),
    ])
  })

  it("rounds a vertex the offsets no longer meet at, on the vertex", () => {
    // probe offset/p183: arcs of radius 10 on (100,100) and (0,100).
    const [copy] = offsetPolyline(CONCAVE(), 10, at(50, -50))
    expect(copy.vertices).toBeCloseToPoints(
      [
        at(-10, -10),
        at(110.00000000000001, -10),
        at(110, 100),
        at(92, 106),
        at(8.00000000000001, 105.99999999999997),
        at(-10, 100),
      ],
      12
    )
    expect(copy.bulges[2]).toBeCloseTo(0.7207592200561265, 12)
    expect(copy.bulges[3]).toBeCloseTo(-0.5000000000000002, 12)
    expect(copy.bulges[4]).toBeCloseTo(0.7207592200561265, 12)
    expect(copy.bulges[0]).toBe(0)
  })

  it("meets an arc where its circle crosses the next segment", () => {
    // probe offset/p184.
    const [copy] = offsetPolyline(CONCAVE(), 10, at(50, 50))
    expect(copy.vertices).toBeCloseToPoints(
      [
        at(10, 10),
        at(90, 10),
        at(90, 77.03306688776087),
        at(10.000000000000007, 77.03306688776087),
      ],
      12
    )
    expect(copy.bulges[2]).toBeCloseTo(-0.3008266721940218, 12)
  })

  it("keeps each segment's widths", () => {
    // probes offset/p185 (a taper), p186 (constant).
    const taper: PolylineWidth[] = [
      [0, 10],
      [2, 2],
    ]
    const tapered = polylineOf([at(0, 0), at(100, 0), at(100, 50)], {
      widths: taper,
    })
    const [copy] = offsetPolyline(tapered, 5, at(25, -20))
    expect(copy.vertices).toBeCloseToPoints([
      at(0, -5),
      at(105, -5),
      at(105, 50),
    ])
    expect(copy.widths).toEqual(taper)
    const constant: PolylineWidth[] = [
      [4, 4],
      [4, 4],
    ]
    const even = polylineOf([at(0, 0), at(100, 0), at(100, 50)], {
      widths: constant,
    })
    expect(offsetPolyline(even, 5, at(50, -20))[0].widths).toEqual(constant)
    expect(offsetPolyline(L(), 10, at(50, 50))[0].widths).toBeUndefined()
  })

  it("drops a segment the offset reverses, its neighbours meeting", () => {
    // probe offset/p187: the trapezoid becomes a triangle.
    const trapezoid = polylineOf(
      [at(0, 0), at(100, 0), at(55, 40), at(45, 40)],
      {
        closed: true,
      }
    )
    const copies = offsetPolyline(trapezoid, 15, at(50, 10))
    expect(copies).toHaveLength(1)
    expect(copies[0].vertices).toBeCloseToPoints(
      [
        at(39.452989835235556, 15),
        at(60.547010164764444, 15),
        at(50, 24.37512014645729),
      ],
      12
    )
  })

  it("splits a pinched outline into its loops, in the source's order", () => {
    // probe offset/p188: the left loop first, from (10,10), with the
    // collinear (80,55); the right one from (120,45).
    const dumbbell = polylineOf(
      [
        at(0, 0),
        at(90, 0),
        at(90, 45),
        at(110, 45),
        at(110, 0),
        at(200, 0),
        at(200, 100),
        at(110, 100),
        at(110, 55),
        at(90, 55),
        at(90, 100),
        at(0, 100),
      ],
      { closed: true }
    )
    const copies = offsetPolyline(dumbbell, 10, at(50, 50))
    expect(copies).toHaveLength(2)
    expect(copies[0].vertices).toBeCloseToPoints(
      [at(10, 10), at(80, 10), at(80, 55), at(80, 90), at(10, 90)],
      12
    )
    expect(copies[1].vertices).toBeCloseToPoints(
      [at(120, 45), at(120, 10), at(190, 10), at(190, 90), at(120, 90)],
      12
    )
    expect(copies.every((copy) => copy.closed)).toBe(true)
  })

  it("offsets a U inward from a side point anywhere inside it", () => {
    // probes offset/p189, p190 (above the opening), p191 (by an end).
    for (const side of [at(50, 50), at(50, 150), at(5, 120)]) {
      const copies = offsetPolyline(U(), 10, side)
      expect(copies).toHaveLength(1)
      expect(copies[0].vertices).toBeCloseToPoints([
        at(10, 100),
        at(10, 10),
        at(90, 10),
        at(90, 100),
      ])
    }
  })

  it("refuses a closed polyline on one straight line, not a bulged one", () => {
    // probes offset/p192, p193.
    const flat = polylineOf([at(0, 0), at(100, 0)], { closed: true })
    expect(offsetPolyline(flat, 10, at(50, 50))).toEqual([])
    const round = polylineOf([at(0, 0), at(100, 0)], {
      closed: true,
      bulges: [1, 1],
    })
    const [copy] = offsetPolyline(round, 10, at(50, 10))
    expect(copy.vertices).toBeCloseToPoints([at(10, 0), at(90, 0)], 12)
    expect(copy.bulges[0]).toBeCloseTo(1, 12)
    expect(copy.bulges[1]).toBeCloseTo(1, 12)
  })

  it("leaves a zero-length segment out, its vertex with it", () => {
    // probe offset/p194.
    const doubled = polylineOf([at(0, 0), at(100, 0), at(100, 0), at(100, 100)])
    const copies = offsetPolyline(doubled, 10, at(50, 50))
    expect(copies).toHaveLength(1)
    expect(copies[0].vertices).toBeCloseToPoints([
      at(0, 10),
      at(90, 10),
      at(90, 100),
    ])
  })

  it("drops the rounded corners that collapse inward", () => {
    // probes offset/p230 (past the radius), p231 (to it).
    expect(
      offsetPolyline(ROUNDED(), 15, at(50, 50))[0].vertices
    ).toBeCloseToPoints([at(15, 15), at(85, 15), at(85, 85), at(15, 85)], 12)
    const [copy] = offsetPolyline(ROUNDED(), 10, at(50, 50))
    expect(copy.vertices).toBeCloseToPoints(
      [at(10, 10), at(90, 10), at(90, 90), at(10, 90)],
      12
    )
    expect(copy.bulges).toEqual([0, 0, 0, 0])
  })

  it("makes nothing where nothing is left at the distance", () => {
    expect(offsetPolyline(SQUARE(), 60, at(50, 50))).toEqual([])
  })

  it("makes well-formed polylines of any polyline", () => {
    fc.assert(
      fc.property(polylineEntity, positiveLength, point, (poly, d, side) => {
        for (const copy of offsetPolyline(poly, d, side)) {
          const segments = copy.closed
            ? copy.vertices.length
            : copy.vertices.length - 1
          expect(segments).toBeGreaterThan(0)
          expect(copy.bulges).toHaveLength(segments)
          if (copy.widths) expect(copy.widths).toHaveLength(segments)
          for (const v of copy.vertices) {
            expect(Number.isFinite(v.x) && Number.isFinite(v.y)).toBe(true)
          }
          expect(copy.bulges.every(Number.isFinite)).toBe(true)
        }
      })
    )
  })
})

describe("polylineThroughDistance", () => {
  it("measures past an open end to the end segment drawn on", () => {
    // probe offset/p211: 30, not the 58.31 to the end vertex.
    expect(polylineThroughDistance(L(), at(130, 150))).toBeCloseTo(30, 12)
    const [copy] = offsetPolyline(L(), 30, at(130, 150))
    expect(copy.vertices).toBeCloseToPoints([
      at(0, -30),
      at(130, -30),
      at(130, 100),
    ])
  })

  it("measures to a corner from outside it", () => {
    // probe offset/p212.
    expect(polylineThroughDistance(L(), at(130, -20))).toBeCloseTo(
      36.0555127546399,
      12
    )
  })

  it("leaves a closed polyline's ends alone", () => {
    expect(polylineThroughDistance(SQUARE(), at(50, 150))).toBeCloseTo(50, 12)
  })
})
