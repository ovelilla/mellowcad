import { describe, expect, it } from "vitest"

import { Vec3, dot3, scale3 } from "./Vec3"
import {
  Brep,
  boxBrep,
  brepArea,
  roundBrep,
  sphereBrep,
  torusBrep,
} from "./solids"
import { brepBoolean } from "./solidBooleans"
import { brepMesh, loopAreaVector, meshArea } from "./faceMesh"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Y: Vec3 = { x: 0, y: 1, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const box = (x: number, y: number, z: number, d: number) =>
  boxBrep({ x, y, z }, scale3(X, d), scale3(Y, d), scale3(Z, d))

/**
 * Every cell's outline runs counter-clockwise about its outward normal and
 * every hole in it clockwise.
 */
function facesOut(brep: Brep): boolean {
  return brepMesh(brep).every(({ loops, normal }) =>
    loops.every(
      (loop, i) =>
        (i === 0 ? 1 : -1) * dot3(loopAreaVector(loop), normal) >= -1e-9
    )
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

  it("covers a compound's planar faces exactly, cut at their edges (union/k01, k04)", () => {
    const k01 = brepBoolean(
      "union",
      box(0, 0, 0, 10),
      boxBrep({ x: 5, y: 5, z: 5 }, scale3(X, 10), scale3(Y, 10), scale3(Z, 15))
    )!
    // An L-shaped face's inner corner lies off the grid: its cells are cut
    // there, not stepped.
    expect(meshArea(brepMesh(k01))).toBeCloseTo(1250, 9)
    expect(facesOut(k01)).toBe(true)
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

  it("cuts a plane's cells at a round edge, never past it", () => {
    // A cylinder of radius 5 drilled with a hole of radius 2: its caps' cells
    // reach the rim and the hole's edge, and stop there.
    const drilled = brepBoolean(
      "subtract",
      roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 4, 1),
      roundBrep({ x: 0, y: 0, z: -1 }, Z, X, 2, 2, 6, 1)
    )!
    const caps = brepMesh(drilled).filter(
      (cell) => Math.abs(cell.normal.z) === 1
    )
    expect(caps.length).toBeGreaterThan(0)
    for (const { loops } of caps) {
      for (const p of loops.flat()) {
        const r = Math.hypot(p.x, p.y)
        expect(r).toBeLessThanOrEqual(5 + 1e-9)
        expect(r).toBeGreaterThanOrEqual(2 - 1e-9)
      }
    }
    // Two caps, each a ring, in chords a hair inside the rim and outside the
    // hole.
    const ring = Math.PI * (25 - 4)
    const area = caps.reduce((sum, cell) => sum + meshArea([cell]), 0)
    expect(Math.abs(area - 2 * ring) / (2 * ring)).toBeLessThan(1e-3)
    expect(facesOut(drilled)).toBe(true)
  })
})
