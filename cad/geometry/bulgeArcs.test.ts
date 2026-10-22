import fc from "fast-check"
import { describe, expect, it } from "vitest"
import { V } from "./Vec2"
import {
  arcAlongChord,
  arcAroundChord,
  arcAroundToward,
  arcThroughBulge,
  bulgeOfAngle,
  radiusArcBulge,
  refitArcBulge,
  sameHeightBulge,
  segmentExitTangent,
  tangentArcBulge,
} from "./bulgeArcs"
import { bulgeToArc } from "./primitives"

const o = { x: 0, y: 0 }
const east = { x: 1, y: 0 }

describe("polyline arc segments", () => {
  it("leaves tangent and ends heading on by the included angle", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -150, max: 150, noNaN: true }),
        fc.double({ min: -150, max: 150, noNaN: true }),
        (x, y) => {
          fc.pre(Math.abs(y) > 1e-3)
          const end = { x, y }
          const bulge = tangentArcBulge(o, east, end)
          expect(bulge).not.toBeNull()
          const { center } = bulgeToArc(o, end, bulge!)
          // The tangent at the start is square to the radius there.
          expect(V.dot(V.sub(o, center), east)).toBeCloseTo(0, 6)
          const exit = segmentExitTangent(o, end, bulge!)!
          expect(V.dot(V.sub(end, center), exit)).toBeCloseTo(0, 6)
        }
      )
    )
  })

  it("has no tangent arc to a point on the tangent's line, nor to itself", () => {
    expect(tangentArcBulge(o, east, { x: 10, y: 0 })).toBeNull()
    expect(tangentArcBulge(o, east, { x: -10, y: 0 })).toBeNull()
    expect(tangentArcBulge(o, east, o)).toBeNull()
    expect(segmentExitTangent(o, o, 0)).toBeNull()
    expect(segmentExitTangent(o, { x: 0, y: 10 }, 0)).toEqual({ x: 0, y: 1 })
  })

  it("turns about a centre to a ray, either way round", () => {
    const ccw = arcAroundToward(
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: -30 },
      false
    )!
    expect(ccw.end.x).toBeCloseTo(20)
    expect(ccw.end.y).toBeCloseTo(-10)
    expect(ccw.bulge).toBeCloseTo(bulgeOfAngle(Math.PI / 2))
    const cw = arcAroundToward(
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: -30 },
      true
    )!
    expect(cw.bulge).toBeCloseTo(bulgeOfAngle(-1.5 * Math.PI))
    expect(arcAroundToward(o, o, east, false)).toBeNull()
    expect(arcAroundToward(east, o, o, false)).toBeNull()
    expect(arcAroundToward(east, o, { x: 5, y: 0 }, false)).toBeNull()
  })

  it("takes a chord about a centre: minor, major, or none too long", () => {
    const start = { x: 30, y: 0 }
    const center = { x: 40, y: 0 }
    expect(arcAroundChord(start, center, 10, false)!.bulge).toBeCloseTo(
      bulgeOfAngle(Math.PI / 3)
    )
    expect(arcAroundChord(start, center, -10, false)!.bulge).toBeCloseTo(
      3.7321,
      4
    )
    expect(arcAroundChord(start, center, 10, true)!.bulge).toBeCloseTo(
      bulgeOfAngle(-Math.PI / 3)
    )
    expect(arcAroundChord(start, center, 30, false)).toBeNull()
    expect(arcAroundChord(start, center, 0, false)).toBeNull()
    expect(arcAroundChord(start, start, 1, false)).toBeNull()
  })

  it("runs a chord its angle and radius make, or the minor arc to an end", () => {
    const along = arcAlongChord(o, 10, Math.PI / 2, Math.PI / 6)
    expect(along.end.x).toBeCloseTo(12.2474, 4)
    expect(along.end.y).toBeCloseTo(7.0711, 4)
    expect(
      radiusArcBulge({ x: 10, y: 0 }, { x: 10, y: 10 }, 10, false)
    ).toBeCloseTo(0.2679, 4)
    expect(
      radiusArcBulge({ x: 10, y: 0 }, { x: 10, y: 10 }, 10, true)
    ).toBeCloseTo(-0.2679, 4)
    expect(radiusArcBulge(o, { x: 30, y: 0 }, 10, false)).toBeNull()
    expect(radiusArcBulge(o, o, 10, false)).toBeNull()
  })

  // probe pline/p122: Radius -10 and a chord of 10, the major arc.
  it("takes a negative radius as the major arc, either way round", () => {
    const end = { x: 20, y: 0 }
    expect(radiusArcBulge({ x: 10, y: 0 }, end, -10, false)).toBeCloseTo(
      3.7320508075688745,
      9
    )
    expect(radiusArcBulge({ x: 10, y: 0 }, end, -10, true)).toBeCloseTo(
      -3.7320508075688745,
      9
    )
    expect(radiusArcBulge(o, { x: 30, y: 0 }, -10, false)).toBeNull()
  })

  // probes pline/p256, p257: a chord's direction reads a negative radius as
  // its size, after Angle or Radius alike.
  it("runs a chord of a negative radius its way, as long as the positive", () => {
    const along = arcAlongChord(o, -10, Math.PI / 2, 0)
    expect(along.end.x).toBeCloseTo(14.142135623730951, 9)
    expect(along.end.y).toBeCloseTo(0, 9)
    expect(along.bulge).toBeCloseTo(0.41421356237309503, 9)
  })

  // probe transforms/p281: STRETCH's -1 on a chord of 100 grown to 110.1136.
  it("keeps an arc's chord height on a new chord", () => {
    expect(sameHeightBulge(-1, 100, Math.hypot(110, 5))).toBeCloseTo(
      -0.908153,
      6
    )
    expect(sameHeightBulge(0.5, 10, 0)).toBe(0.5)
    fc.assert(
      fc.property(
        fc.double({ min: -4, max: 4, noNaN: true }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        fc.double({ min: 1, max: 100, noNaN: true }),
        (bulge, chord, newChord) => {
          const after = sameHeightBulge(bulge, chord, newChord)
          expect((after * newChord) / 2).toBeCloseTo((bulge * chord) / 2, 9)
        }
      )
    )
  })

  // AutoCAD 2023's console (acc/f6, f13, f15, f24): CHAMFER's refitted arcs.
  it("refits an arc to new ends at its radius, turn and side", () => {
    const at = (y: number) => ({ x: 100, y })
    expect(refitArcBulge(1, 25, at(5), at(50))).toBeCloseTo(1.5954, 4)
    expect(refitArcBulge(1, 25, at(40), at(50))).toBeCloseTo(9.899, 3)
    expect(
      refitArcBulge(
        Math.tan(Math.PI / 8),
        25,
        { x: 103.5355339, y: 3.5355339 },
        { x: 125, y: 25 }
      )
    ).toBeCloseTo(0.3383, 4)
    expect(
      refitArcBulge(
        -Math.tan(Math.PI / 8),
        40,
        { x: 81.4142136, y: 1.4142136 },
        { x: 140, y: 60 }
      )
    ).toBeCloseTo(-1.0357, 4)
    expect(refitArcBulge(0.5, 10, o, o)).toBe(0)
  })

  it("passes through a second point, turning as the three do", () => {
    expect(arcThroughBulge(o, { x: 5, y: 5 }, { x: 10, y: 0 })).toBeCloseTo(-1)
    expect(arcThroughBulge(o, { x: 5, y: -5 }, { x: 10, y: 0 })).toBeCloseTo(1)
    expect(arcThroughBulge(o, { x: 5, y: 0 }, { x: 10, y: 0 })).toBeNull()
  })
})
