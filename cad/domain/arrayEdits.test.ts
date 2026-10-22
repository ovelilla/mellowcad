import { describe, expect, it } from "vitest"
import { arcOf, lineOf, p } from "../../test/builders"
import {
  type ArrayPlacement,
  arrayPointOf,
  placeArrayPoint,
  withPathItems,
  withPathMethod,
  withPathSpacing,
  withRingAngleBetween,
  withRingFill,
  withRingRadius,
} from "./arrayEdits"
import {
  arrayPathOf,
  arraySourceItem,
  distanceAlongPath,
  polarArrayItems,
} from "./arrays"
import type { ArrayParameters, ArrayPath } from "./entityTypes"

type Polar = Extract<ArrayParameters, { kind: "polar" }>
type Path = Extract<ArrayParameters, { kind: "path" }>

/** desktop arrays/d11's ring: six items about 23,25 from 23,43. */
const ring: Polar = {
  kind: "polar",
  center: p(23, 25),
  basePoint: p(23, 43),
  items: 6,
  fill: 360,
  clockwise: false,
  rotate: true,
}

/** desktop arrays/d11's path array: 80 long, 6 apart, 14 items. */
const pathArray = (): Path => ({
  kind: "path",
  path: arrayPathOf(lineOf(p(60, 0), p(140, 0))) as ArrayPath,
  pathId: "P",
  method: "measure",
  items: 14,
  spacing: 6,
  align: true,
})

describe("an array's placement", () => {
  it("takes a point of the block's to the reference's and back", () => {
    const place: ArrayPlacement = {
      origin: p(10, 10),
      position: p(100, 0),
      rotation: Math.PI / 2,
      scale: 2,
      mirrored: true,
    }
    // 3 to the right of the base: mirrored left, twice as far, turned up…
    const placed = placeArrayPoint(place, p(13, 10))
    expect(placed).toBeCloseToPoint(p(100, -6))
    expect(arrayPointOf(place, placed)).toBeCloseToPoint(p(13, 10))
  })
})

describe("a ring's edits", () => {
  // ARRAYS-D73: the base point along its ray, the source following it.
  it("stretches the radius, keeping where the source stands", () => {
    const stretched = withRingRadius(ring, 25)!
    expect(stretched.basePoint).toBeCloseToPoint(p(23, 50))
    expect(stretched.sourceBase).toEqual(p(23, 43))
    expect(arraySourceItem(stretched)?.move).toBeCloseToPoint(p(0, 7))
    // Every item moves with it, round the larger ring.
    for (const item of polarArrayItems(stretched)) {
      expect(item.move).toBeCloseToPoint(p(0, 7))
    }
    // Back to where the source stands, nothing is recorded.
    const back = withRingRadius(stretched, 18)!
    expect(back).toEqual(ring)
    expect(arraySourceItem(back)).toBeNull()
    expect(withRingRadius(ring, 0)).toBeNull()
  })

  // desktop arrays/d15c, d15e, d20d, d20e.
  it("refuses an angle between whose fill passes a turn", () => {
    expect(withRingAngleBetween(ring, 45)?.fill).toBe(225)
    expect(withRingAngleBetween(ring, 72)?.fill).toBe(360)
    expect(withRingAngleBetween(ring, 90)).toBeNull()
    expect(withRingAngleBetween(ring, 0)).toBeNull()
    expect(withRingFill(ring, 180)?.fill).toBe(180)
    expect(withRingFill(ring, 361)).toBeNull()
  })
})

describe("a path array's edits", () => {
  // desktop arrays/d16b, d20h: as many items as fit.
  it("fits the items to a spacing", () => {
    expect(withPathSpacing(pathArray(), 10)).toMatchObject({ items: 9 })
    expect(withPathSpacing(pathArray(), 10.08)).toMatchObject({ items: 8 })
    expect(withPathSpacing(pathArray(), 0)).toBeNull()
    // More than 32767 would fit: refused.
    expect(withPathSpacing(pathArray(), 0.001)).toBeNull()
  })

  // probe arrays/p373: by Measure a count over the maximum is the maximum;
  // p334: Measure goes on from Divide's spacing.
  it("caps a count by Measure, and switches method", () => {
    expect(withPathItems(pathArray(), 20)).toMatchObject({ items: 14 })
    const divided = withPathMethod(pathArray(), "divide")
    expect(withPathItems(divided, 20)).toMatchObject({ items: 20 })
    expect(withPathMethod(divided, "measure").spacing).toBeCloseTo(80 / 13)
  })

  it("measures how far along the path a point's nearest is", () => {
    const line = arrayPathOf(lineOf(p(60, 0), p(140, 0)))!
    expect(distanceAlongPath(line, p(70, 5))).toBeCloseTo(10)
    expect(distanceAlongPath(line, p(0, 0))).toBe(0)
    expect(distanceAlongPath(line, p(200, 0))).toBeCloseTo(80)
    // A quarter arc of radius 10 from angle 0, counter-clockwise.
    const arc = arrayPathOf(arcOf(p(0, 0), 10, 0, Math.PI / 2))!
    expect(distanceAlongPath(arc, p(20, 20))).toBeCloseTo((10 * Math.PI) / 4)
    expect(distanceAlongPath(arc, p(5, -5))).toBe(0)
    expect(distanceAlongPath(arc, p(-5, 5))).toBeCloseTo(5 * Math.PI)
  })
})
