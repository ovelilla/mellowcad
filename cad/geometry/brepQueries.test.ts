import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { Vec3 } from "./Vec3"
import { boxBrep, roundBrep, sphereBrep, torusBrep } from "./solids"
import { revolutionBrep } from "./sweeps"
import { pointInSolid } from "./brepQueries"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Y: Vec3 = { x: 0, y: 1, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const O: Vec3 = { x: 0, y: 0, z: 0 }
const coordinate = fc.double({ min: -12, max: 12, noNaN: true })
const point = fc
  .tuple(coordinate, coordinate, coordinate)
  .map(([x, y, z]) => ({ x, y, z }))

describe("a point against a solid", () => {
  it("is inside, outside or on a primitive as its own equation says", () => {
    const solids: [ReturnType<typeof boxBrep>, (p: Vec3) => number][] = [
      [
        boxBrep(
          { x: -5, y: -4, z: -3 },
          { x: 10, y: 0, z: 0 },
          { x: 0, y: 8, z: 0 },
          { x: 0, y: 0, z: 6 }
        ),
        (p) =>
          Math.max(Math.abs(p.x) - 5, Math.abs(p.y) - 4, Math.abs(p.z) - 3),
      ],
      [
        roundBrep({ x: 0, y: 0, z: -4 }, Z, X, 5, 5, 8, 1),
        (p) => Math.max(Math.hypot(p.x, p.y) - 5, Math.abs(p.z) - 4),
      ],
      [
        roundBrep({ x: 0, y: 0, z: -4 }, Z, X, 6, 6, 8, 0),
        (p) => Math.max(Math.hypot(p.x, p.y) - (6 * (4 - p.z)) / 8, -4 - p.z),
      ],
      [sphereBrep(O, Z, X, 7), (p) => Math.hypot(p.x, p.y, p.z) - 7],
      [
        torusBrep(O, Z, X, 7, 3),
        (p) => Math.hypot(Math.hypot(p.x, p.y) - 7, p.z) - 3,
      ],
      [
        torusBrep(O, Z, X, 2, 5),
        (p) => Math.hypot(Math.hypot(p.x, p.y) - 2, p.z) - 5,
      ],
    ]
    fc.assert(
      fc.property(point, (p) => {
        for (const [brep, f] of solids) {
          const v = f(p)
          if (Math.abs(v) < 1e-3) continue
          expect(pointInSolid(brep, p, 1e-6)).toBe(v < 0 ? "inside" : "outside")
        }
      }),
      { numRuns: 300 }
    )
    expect(pointInSolid(solids[0][0], { x: 5, y: 1, z: 1 }, 1e-6)).toBe(
      "boundary"
    )
    expect(pointInSolid(solids[3][0], { x: 0, y: 7, z: 0 }, 1e-6)).toBe(
      "boundary"
    )
  }, 60_000)

  it("finds a revolved wedge of a sphere by its loops through the poles (r03)", () => {
    const half = {
      axes: { x: X, y: Y, z: Z },
      elevation: 0,
      faces: [
        {
          loops: [
            [
              {
                kind: "arc" as const,
                center: { x: 0, y: 0 },
                radius: 5,
                startAngle: -Math.PI / 2,
                sweep: Math.PI,
              },
              {
                kind: "line" as const,
                start: { x: 0, y: 5 },
                end: { x: 0, y: -5 },
              },
            ],
          ],
        },
      ],
    }
    const brep = revolutionBrep(half, O, Y, X, 0, Math.PI / 2)
    expect(pointInSolid(brep, { x: 1, y: 0, z: -1 }, 1e-6)).toBe("inside")
    expect(pointInSolid(brep, { x: 1, y: 4, z: -1 }, 1e-6)).toBe("inside")
    expect(pointInSolid(brep, { x: 1, y: 0, z: 1 }, 1e-6)).toBe("outside")
    expect(pointInSolid(brep, { x: -1, y: 0, z: -1 }, 1e-6)).toBe("outside")
  })
})
