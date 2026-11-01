import { describe, expect, it } from "vitest"

import { Vec3, cross3, dot3, scale3, sub3 } from "./Vec3"
import {
  Brep,
  boxBrep,
  brepArea,
  roundBrep,
  sphereBrep,
  torusBrep,
} from "./solids"
import { brepBoolean } from "./solidBooleans"
import { brepMesh, meshArea } from "./faceMesh"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Y: Vec3 = { x: 0, y: 1, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const box = (x: number, y: number, z: number, d: number) =>
  boxBrep({ x, y, z }, scale3(X, d), scale3(Y, d), scale3(Z, d))

/** Every triangle runs counter-clockwise about its outward normal. */
function facesOut(brep: Brep): boolean {
  return brepMesh(brep).every(
    (t) => dot3(cross3(sub3(t.b, t.a), sub3(t.c, t.a)), t.normal) >= -1e-12
  )
}

describe("a solid's mesh", () => {
  it("covers a box exactly and faces out", () => {
    const b = box(0, 0, 0, 10)
    expect(meshArea(brepMesh(b))).toBeCloseTo(600, 9)
    expect(facesOut(b)).toBe(true)
  })

  it("covers round faces to their faceting, facing out", () => {
    for (const [brep, share] of [
      [roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1), 0.01],
      [roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 0), 0.01],
      [sphereBrep({ x: 1, y: 2, z: 3 }, Z, X, 5), 0.01],
      [torusBrep({ x: 0, y: 0, z: 0 }, Z, X, 6, 2), 0.01],
    ] as const) {
      const exact = brepArea(brep)
      expect(Math.abs(meshArea(brepMesh(brep)) - exact) / exact).toBeLessThan(
        share
      )
      expect(facesOut(brep)).toBe(true)
    }
  })

  it("covers a compound's faces to the halving at their edges (union/k01, k04)", () => {
    const k01 = brepBoolean(
      "union",
      box(0, 0, 0, 10),
      boxBrep({ x: 5, y: 5, z: 5 }, scale3(X, 10), scale3(Y, 10), scale3(Z, 15))
    )!
    // An L-shaped face's inner corner lies off the grid: a halving's step.
    expect(Math.abs(meshArea(brepMesh(k01)) - 1250) / 1250).toBeLessThan(0.002)
    const drilled = brepBoolean(
      "subtract",
      box(0, 0, 0, 10),
      roundBrep({ x: 5, y: 5, z: -1 }, Z, X, 3, 3, 12, 1)
    )!
    const exact = brepArea(drilled)
    expect(Math.abs(meshArea(brepMesh(drilled)) - exact) / exact).toBeLessThan(
      0.02
    )
    expect(facesOut(drilled)).toBe(true)
  })
})
