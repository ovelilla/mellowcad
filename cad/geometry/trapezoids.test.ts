import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { Vec2 } from "./Vec2"
import { evenOddTrapezoids } from "./trapezoids"

/** The area of a piece: two triangles, its corners in SOLID's order. */
function area([a, b, c, d]: [Vec2, Vec2, Vec2, Vec2]): number {
  const tri = (p: Vec2, q: Vec2, r: Vec2) =>
    Math.abs((q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y)) / 2
  return tri(a, b, d) + tri(a, d, c)
}

const total = (rings: Vec2[][]) =>
  evenOddTrapezoids(rings).reduce((sum, piece) => sum + area(piece), 0)

describe("evenOddTrapezoids", () => {
  it("cuts a square with a square hole into the ring between them", () => {
    const outer = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]
    const hole = [
      { x: 3, y: 3 },
      { x: 7, y: 3 },
      { x: 7, y: 7 },
      { x: 3, y: 7 },
    ]
    expect(total([outer, hole])).toBeCloseTo(84)
    // Below, beside and above the hole.
    expect(evenOddTrapezoids([outer, hole])).toHaveLength(4)
  })

  it("leaves a triangle's apex a corner of no width", () => {
    const pieces = evenOddTrapezoids([
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 3 },
      ],
    ])
    expect(pieces).toHaveLength(1)
    expect(pieces[0][2]).toEqual(pieces[0][3])
    expect(area(pieces[0])).toBeCloseTo(6)
  })

  it("cuts where edges cross between two vertices' heights", () => {
    // A bow tie, crossing itself at 5,5: two triangles, 50 in all.
    const bowTie = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ]
    expect(total([bowTie])).toBeCloseTo(50)
    // Two squares overlapping 2 by 8 at a slant's height: by the even-odd
    // rule the overlap is a hole (100 + 152 − 2 × overlap).
    const a = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]
    const b = [
      { x: 8, y: 1 },
      { x: 20, y: 1 },
      { x: 20, y: 9 },
      { x: 14, y: 9 },
    ]
    // b's slanted edge leaves x 8 at y 1 for x 14 at y 9: the overlap is the
    // part of b left of x 10, a trapezoid under its slant (y 1 to 11/3).
    const overlap = (2 * (8 / 3)) / 2
    const bArea = ((12 + 6) / 2) * 8
    expect(total([a, b])).toBeCloseTo(100 + bArea - 2 * overlap)
  })

  it("covers a convex polygon's area, whatever its vertices", () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0, max: 2 * Math.PI, noNaN: true }), {
          minLength: 3,
          maxLength: 12,
        }),
        (angles) => {
          const ring = [...new Set(angles)]
            .sort((a, b) => a - b)
            .map((t) => ({ x: 5 * Math.cos(t), y: 3 * Math.sin(t) }))
          if (ring.length < 3) return
          let shoelace = 0
          ring.forEach((p, i) => {
            const q = ring[(i + 1) % ring.length]
            shoelace += p.x * q.y - q.x * p.y
          })
          expect(total([ring])).toBeCloseTo(Math.abs(shoelace) / 2, 6)
        }
      )
    )
  })
})
