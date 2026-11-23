import fc from "fast-check"
import { describe, expect, it } from "vitest"
import {
  createBlockDefinition,
  createInsert,
  createPolyline3d,
  createSpline,
  createXline,
  entitiesWorldBox,
  entityBounds,
  entityWorldBox,
  polyline3dSplined,
  withElevation,
  withNormal,
  withThickness,
} from "./entities"
import { arbitraryAxis } from "../geometry/ocs"
import { Vec3 } from "../geometry/Vec3"
import { ellipticalArcExtremes, boxOfPoints } from "../geometry/solids"
import { arcOf, circleOf, lineOf, p, polylineOf } from "../../test/builders"
import { coordinate, positiveLength } from "../../test/arbitraries"

const near = (a: Vec3, b: Vec3, digits = 9) => {
  expect(a.x).toBeCloseTo(b.x, digits)
  expect(a.y).toBeCloseTo(b.y, digits)
  expect(a.z).toBeCloseTo(b.z, digits)
}

const unitNormal = fc
  .tuple(
    fc.double({ min: -1, max: 1, noNaN: true }),
    fc.double({ min: -1, max: 1, noNaN: true }),
    fc.double({ min: -1, max: 1, noNaN: true })
  )
  .filter(([x, y, z]) => Math.hypot(x, y, z) > 0.1)
  .map(([x, y, z]) => ({ x, y, z }))

describe("entityWorldBox", () => {
  it("is a level object's entityBounds to the bit, its Z from its elevation and thickness", () => {
    const circle = withThickness(withElevation(circleOf(p(10, 20), 5), 3), 4)
    const box = entityWorldBox(circle)!
    const plan = entityBounds(circle)
    expect(box.min).toEqual({ ...plan.min, z: 3 })
    expect(box.max).toEqual({ ...plan.max, z: 7 })
  })

  it("reads an object facing down mirrored in X, as its own plane holds it (x058)", () => {
    // A circle of normal −Z at 100,0 is at −100,0 in its OCS.
    const circle = withNormal(circleOf(p(-100, 0), 10), { x: 0, y: 0, z: -1 })
    expect(entityBounds(circle).min.x).toBe(-110)
    const box = entityWorldBox(circle)!
    expect(box.min).toEqual({ x: 90, y: -10, z: 0 })
    expect(box.max).toEqual({ x: 110, y: 10, z: 0 })
  })

  it("bounds a circle in any plane as the curve it is", () => {
    fc.assert(
      fc.property(
        unitNormal,
        coordinate,
        coordinate,
        coordinate,
        positiveLength,
        (normal, x, y, z, radius) => {
          const circle = withElevation(
            withNormal(circleOf(p(x, y), radius), normal),
            z
          )
          const axes = arbitraryAxis(circle.normal ?? { x: 0, y: 0, z: 1 })!
          const center = {
            x: axes.x.x * x + axes.y.x * y + axes.z.x * z,
            y: axes.x.y * x + axes.y.y * y + axes.z.y * z,
            z: axes.x.z * x + axes.y.z * y + axes.z.z * z,
          }
          const scaled = (v: Vec3) => ({
            x: v.x * radius,
            y: v.y * radius,
            z: v.z * radius,
          })
          const exact = boxOfPoints(
            ellipticalArcExtremes(
              center,
              scaled(axes.x),
              scaled(axes.y),
              0,
              2 * Math.PI
            )
          )!
          const box = entityWorldBox(circle)!
          const tolerance = 1e-9 * (1 + Math.hypot(x, y, z) + radius)
          for (const k of ["x", "y", "z"] as const) {
            expect(Math.abs(box.min[k] - exact.min[k])).toBeLessThan(tolerance)
            expect(Math.abs(box.max[k] - exact.max[k])).toBeLessThan(tolerance)
          }
        }
      )
    )
  })

  it("follows an arc's sweep in a tilted plane", () => {
    // Normal +X: the OCS's X is the world's Y and its Y the world's Z, its
    // height the world's X.
    const arc = withElevation(
      withNormal(arcOf(p(0, 0), 10, 0, Math.PI / 2), { x: 1, y: 0, z: 0 }),
      5
    )
    const box = entityWorldBox(arc)!
    near(box.min, { x: 5, y: 0, z: 0 })
    near(box.max, { x: 5, y: 10, z: 10 })
  })

  it("extrudes a tilted object's thickness along its normal", () => {
    const thick = withThickness(
      withNormal(polylineOf([p(0, 0), p(10, 0)]), { x: 0, y: -1, z: 0 }),
      3
    )
    const box = entityWorldBox(thick)!
    near(box.min, { x: 0, y: -3, z: 0 })
    near(box.max, { x: 10, y: 0, z: 0 })
  })

  it("takes a line's two heights and its thickness along its normal", () => {
    const line = withThickness(
      { ...lineOf(p(0, 0), p(10, 0)), elevation: 2, deltaZ: 4 },
      1
    )
    const box = entityWorldBox(line)!
    expect(box.min).toEqual({ x: 0, y: 0, z: 2 })
    expect(box.max).toEqual({ x: 10, y: 0, z: 7 })
  })

  it("measures a fitted 3D polyline by its curve, as AutoCAD's EXTMAX (x058's kinds)", () => {
    const frame = createPolyline3d([
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 10, z: 10 },
      { x: 20, y: 0, z: 5 },
    ])
    const box = entityWorldBox(polyline3dSplined(frame, "cubic", 8)!)!
    near(box.max, { x: 20, y: 7.5, z: 8.251953125 })
  })

  it("measures a spline that leaves every plane by its curve's Z", () => {
    const spline = createSpline("cv", [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 10 },
      { x: 20, y: 0, z: 0 },
    ])
    const box = entityWorldBox(spline)!
    expect(box.min.z).toBeCloseTo(0, 12)
    expect(box.max.z).toBeCloseTo(5, 6)
  })

  it("measures a reference by what it shows, each piece in its own plane", () => {
    const down = withNormal(circleOf(p(-10, 0), 2), { x: 0, y: 0, z: -1 })
    const block = createBlockDefinition("B", p(0, 0), [down])
    const insert = createInsert(block.id, p(100, 0))
    const blocks = (id: string) => (id === block.id ? block : undefined)
    const box = entityWorldBox(insert, blocks)!
    near(box.min, { x: 108, y: -2, z: 0 })
    near(box.max, { x: 112, y: 2, z: 0 })
    // Without the table: its insertion point, in its plane.
    const tilted = withNormal(insert, { x: 0, y: 0, z: -1 })
    expect(entityWorldBox(tilted)!.min).toEqual({ x: -100, y: 0, z: 0 })
  })

  it("leaves an XLINE out: it has no extents", () => {
    const xline = createXline(p(0, 0), { x: 1, y: 0 })!
    expect(entityWorldBox(xline)).toBeNull()
    expect(entitiesWorldBox([xline])).toBeNull()
    const box = entitiesWorldBox([xline, circleOf(p(0, 0), 1)])!
    expect(box.min).toEqual({ x: -1, y: -1, z: 0 })
  })
})
