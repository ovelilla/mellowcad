import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { eulerHolds } from "../../test/breps"

import { Vec3, cross3, length3, scale3, sub3 } from "./Vec3"
import { edgeTrace } from "./brepCurves"
import { brepMoments, solidInertia } from "./massProperties"
import { PlanarCurve } from "./planarCurves"
import { SolidBooleanError, brepBoolean } from "./solidBooleans"
import {
  EdgeBlend,
  brepEdgesBlended,
  chamferBase,
  edgeLoops,
  tangentChain,
} from "./solidBlends"
import { extrusionBrep } from "./sweeps"
import { Brep, boxBrep, brepIsClosed, brepVolume, roundBrep } from "./solids"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Y: Vec3 = { x: 0, y: 1, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const WORLD = { x: X, y: Y, z: Z }

const box = (
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number
) => boxBrep({ x, y, z }, scale3(X, dx), scale3(Y, dy), scale3(Z, dz))

/** The edge whose middle lies at `p`. */
function edgeAt(b: Brep, p: Vec3): number {
  const i = b.edges.findIndex((e) => {
    const t = edgeTrace(b, e)
    return length3(sub3(t.point((t.t0 + t.t1) / 2), p)) < 1e-6
  })
  expect(i, `an edge at ${JSON.stringify(p)}`).toBeGreaterThanOrEqual(0)
  return i
}

/** The edge running through `p` (a circle's anywhere on it). */
function edgeThrough(b: Brep, p: Vec3): number {
  const i = b.edges.findIndex((e) => {
    if (e.curve.kind !== "circle") return false
    const d = sub3(p, e.curve.center)
    return Math.abs(length3(d) - e.curve.radius) < 1e-6
  })
  expect(i).toBeGreaterThanOrEqual(0)
  return i
}

const counts = (b: Brep) => ({
  v: b.vertices.length,
  e: b.edges.filter((e) => e.curve.kind !== "point").length,
  f: b.faces.length,
})

const centroid = (b: Brep) => solidInertia(brepMoments(b)).centroid

function blended(b: Brep, edges: number[], blend: EdgeBlend): Brep {
  const out = brepEdgesBlended(b, edges, blend)
  expect(brepIsClosed(out)).toBe(true)
  expect(eulerHolds(out)).toBe(true)
  return out
}

const fillet = (radius: number): EdgeBlend => ({ kind: "fillet", radius })

/** A rectangle with rounded corners, extruded: the chain f02 fillets. */
function roundedBlock(w: number, d: number, corner: number, h: number): Brep {
  const r = corner
  const arc = (cx: number, cy: number, start: number): PlanarCurve => ({
    kind: "arc",
    center: { x: cx, y: cy },
    radius: r,
    startAngle: start,
    sweep: Math.PI / 2,
  })
  const line = (
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): PlanarCurve => ({
    kind: "line",
    start: { x: x0, y: y0 },
    end: { x: x1, y: y1 },
  })
  const loop: PlanarCurve[] = [
    line(r, 0, w - r, 0),
    arc(w - r, r, -Math.PI / 2),
    line(w, r, w, d - r),
    arc(w - r, d - r, 0),
    line(w - r, d, r, d),
    arc(r, d - r, Math.PI / 2),
    line(0, d - r, 0, r),
    arc(r, r, Math.PI),
  ]
  return extrusionBrep(
    { axes: WORLD, elevation: 0, faces: [{ loops: [loop] }] },
    scale3(Z, h)
  )!
}

describe("a fillet along a straight edge", () => {
  it("rounds a box's edge into a cylinder, its ends notched (filletedge/f01)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    const out = blended(b, [edgeAt(b, { x: 5, y: 0, z: 10 })], fillet(2))
    expect(brepVolume(out)).toBeCloseTo(991.4159265358979, 9)
    expect(counts(out)).toEqual({ v: 10, e: 15, f: 7 })
    expect(out.faces[0].surface.kind).toBe("cylinder")
    // The volume drops by the corner's section, (1 − π/4) r², times its length.
    expect(1000 - brepVolume(out)).toBeCloseTo((1 - Math.PI / 4) * 4 * 10, 9)
  })

  it("wears a face away where the radius is as wide as it (f05)", () => {
    const b = box(0, 0, 0, 10, 10, 2)
    const out = blended(b, [edgeAt(b, { x: 5, y: 0, z: 2 })], fillet(2))
    expect(brepVolume(out)).toBeCloseTo(191.41592653589794, 9)
    expect(counts(out)).toEqual({ v: 8, e: 12, f: 6 })
    expect(centroid(out).y).toBeCloseTo(5.2042, 4)
  })

  it("refuses a radius wider than a face beside the edge", () => {
    const b = box(0, 0, 0, 10, 10, 2)
    expect(() =>
      brepEdgesBlended(b, [edgeAt(b, { x: 5, y: 0, z: 2 })], fillet(2.5))
    ).toThrow(SolidBooleanError)
  })

  it("meets the next fillet at a corner in an ellipse (f03, f06)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    const top = [
      { x: 5, y: 0, z: 10 },
      { x: 10, y: 5, z: 10 },
      { x: 5, y: 10, z: 10 },
      { x: 0, y: 5, z: 10 },
    ].map((p) => edgeAt(b, p))
    const loop = blended(b, top, fillet(1))
    expect(brepVolume(loop)).toBeCloseTo(991.7994, 4)
    expect(counts(loop)).toEqual({ v: 12, e: 20, f: 10 })
    expect(loop.edges.filter((e) => e.curve.kind === "ellipse")).toHaveLength(4)
    const two = blended(b, top.slice(0, 2), fillet(2))
    expect(brepVolume(two)).toBeCloseTo(983.5988, 4)
    expect(counts(two)).toEqual({ v: 11, e: 17, f: 8 })
  })

  it("rounds three edges at a corner with a sphere (f06)", () => {
    const b = box(20, 0, 0, 10, 10, 10)
    const out = blended(
      b,
      [
        edgeAt(b, { x: 25, y: 0, z: 10 }),
        edgeAt(b, { x: 30, y: 5, z: 10 }),
        edgeAt(b, { x: 30, y: 0, z: 5 }),
      ],
      fillet(2)
    )
    expect(brepVolume(out)).toBeCloseTo(975.587, 3)
    expect(counts(out)).toEqual({ v: 13, e: 21, f: 10 })
    expect(out.faces.some((f) => f.surface.kind === "sphere")).toBe(true)
  })
})

describe("a fillet round a circle", () => {
  it("rounds a cylinder's rim, a hole's and a boss's foot with tori (f04)", () => {
    const cylinder = roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1)
    const rim = blended(
      cylinder,
      [edgeThrough(cylinder, { x: 5, y: 0, z: 10 })],
      fillet(1)
    )
    expect(brepVolume(rim)).toBeCloseTo(778.9574, 4)
    expect(counts(rim)).toEqual({ v: 3, e: 3, f: 4 })

    const drilled = brepBoolean(
      "subtract",
      box(20, -10, 0, 20, 20, 5),
      roundBrep({ x: 30, y: 0, z: -1 }, Z, X, 4, 4, 7, 1)
    )!
    const hole = blended(
      drilled,
      [edgeThrough(drilled, { x: 34, y: 0, z: 5 })],
      fillet(1)
    )
    expect(brepVolume(hole)).toBeCloseTo(1742.9779, 4)

    const bossed = brepBoolean(
      "union",
      box(50, -10, 0, 20, 20, 5),
      roundBrep({ x: 60, y: 0, z: 5 }, Z, X, 4, 4, 5, 1)
    )!
    const foot = blended(
      bossed,
      [edgeThrough(bossed, { x: 64, y: 0, z: 5 })],
      fillet(1)
    )
    expect(brepVolume(foot)).toBeCloseTo(2257.0221, 4)
  })

  it("runs a chain of tangent edges round a rounded block (f02)", () => {
    const b = roundedBlock(20, 10, 2, 5)
    const top = b.edges
      .map((e, i) => ({ e, i }))
      .filter(
        ({ e }) =>
          Math.abs(b.vertices[e.start].z - 5) < 1e-9 &&
          Math.abs(b.vertices[e.end].z - 5) < 1e-9
      )
      .map(({ i }) => i)
    expect(top).toHaveLength(8)
    const out = blended(b, top, fillet(1))
    expect(brepVolume(out)).toBeCloseTo(970.9937916034522, 6)
    expect(counts(out)).toEqual({ v: 24, e: 40, f: 18 })
  })
})

describe("a chamfer", () => {
  it("bevels a box's edge, its first distance along the base face (chamferedge/c02)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    const edge = edgeAt(b, { x: 5, y: 0, z: 10 })
    const front = b.faces.findIndex(
      (f) => f.surface.kind === "plane" && f.surface.normal.y === -1
    )
    const out = blended(b, [edge], {
      kind: "chamfer",
      base: front,
      distance1: 1,
      distance2: 3,
    })
    expect(brepVolume(out)).toBeCloseTo(985, 9)
    expect(counts(out)).toEqual({ v: 10, e: 15, f: 7 })
    expect(centroid(out).z).toBeCloseTo(4.928934010152284, 9)
  })

  it("bevels three edges of a face, meeting at its corners (c01)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    const top = b.faces.findIndex(
      (f) => f.surface.kind === "plane" && f.surface.normal.z === 1
    )
    const out = blended(
      b,
      [
        edgeAt(b, { x: 5, y: 0, z: 10 }),
        edgeAt(b, { x: 10, y: 5, z: 10 }),
        edgeAt(b, { x: 0, y: 5, z: 10 }),
      ],
      { kind: "chamfer", base: top, distance1: 1, distance2: 3 }
    )
    expect(brepVolume(out)).toBeCloseTo(957, 9)
    expect(counts(out)).toEqual({ v: 12, e: 19, f: 9 })
  })

  it("bevels a rim and a hole's edge into cones (c03)", () => {
    const cylinder = roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1)
    const top = cylinder.faces.findIndex(
      (f) => f.surface.kind === "plane" && f.surface.normal.z === 1
    )
    const out = blended(
      cylinder,
      [edgeThrough(cylinder, { x: 5, y: 0, z: 10 })],
      {
        kind: "chamfer",
        base: top,
        distance1: 1,
        distance2: 2,
      }
    )
    expect(brepVolume(out)).toBeCloseTo(756.0766, 4)
    expect(out.faces[0].surface.kind).toBe("cone")

    const drilled = brepBoolean(
      "subtract",
      box(20, -10, 0, 20, 20, 5),
      roundBrep({ x: 30, y: 0, z: -1 }, Z, X, 4, 4, 7, 1)
    )!
    const face = drilled.faces.findIndex(
      (f) =>
        f.surface.kind === "plane" &&
        f.surface.normal.z === 1 &&
        Math.abs(f.surface.origin.z - 5) < 1e-9
    )
    const hole = blended(
      drilled,
      [edgeThrough(drilled, { x: 34, y: 0, z: 5 })],
      {
        kind: "chamfer",
        base: face,
        distance1: 1,
        distance2: 2,
      }
    )
    expect(brepVolume(hole)).toBeCloseTo(1721.4455, 4)
  })

  it("refuses distances past a face beside the edge (c04)", () => {
    const b = box(0, 0, 0, 10, 10, 2)
    const front = b.faces.findIndex(
      (f) => f.surface.kind === "plane" && f.surface.normal.y === -1
    )
    expect(() =>
      brepEdgesBlended(b, [edgeAt(b, { x: 5, y: 0, z: 2 })], {
        kind: "chamfer",
        base: front,
        distance1: 3,
        distance2: 1,
      })
    ).toThrow(SolidBooleanError)
  })
})

describe("a concave edge", () => {
  it("fills the inside corner of an L, the volume growing by the section", () => {
    const l = brepBoolean(
      "union",
      box(0, 0, 0, 10, 10, 2),
      box(0, 0, 0, 2, 10, 10)
    )!
    const edge = edgeAt(l, { x: 2, y: 5, z: 2 })
    const out = blended(l, [edge], fillet(1))
    expect(brepVolume(out) - brepVolume(l)).toBeCloseTo(
      (1 - Math.PI / 4) * 10,
      9
    )
    const top = l.faces.findIndex(
      (f) =>
        f.surface.kind === "plane" &&
        f.surface.normal.z === 1 &&
        Math.abs(f.surface.origin.z - 2) < 1e-9
    )
    const bevel = blended(l, [edge], {
      kind: "chamfer",
      base: top,
      distance1: 1,
      distance2: 3,
    })
    expect(brepVolume(bevel) - brepVolume(l)).toBeCloseTo(1.5 * 10, 9)
  })
})

describe("any box's edge blended", () => {
  it("closes, keeps Euler's count and loses exactly the corner's section along it", () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.double({ min: 1, max: 20, noNaN: true }),
          fc.double({ min: 1, max: 20, noNaN: true }),
          fc.double({ min: 1, max: 20, noNaN: true })
        ),
        fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
        fc.integer({ min: 0, max: 11 }),
        fc.double({ min: 0.05, max: 0.95, noNaN: true }),
        fc.double({ min: 0.05, max: 0.95, noNaN: true }),
        ([a, b, c], turn, edge, k1, k2) => {
          const u = { x: a * Math.cos(turn), y: a * Math.sin(turn), z: 0 }
          const v = { x: -b * Math.sin(turn), y: b * Math.cos(turn), z: 0 }
          const solid = boxBrep({ x: 3, y: -2, z: 1 }, u, v, scale3(Z, c))
          const e = solid.edges[edge]
          const d = sub3(solid.vertices[e.end], solid.vertices[e.start])
          const length = length3(d)
          // The box's sizes across the edge: all but the one along it.
          const sides = [u, v, scale3(Z, c)]
          const widths = [a, b, c].filter(
            (_, k) =>
              length3(cross3(sides[k], d)) > 1e-6 * length * [a, b, c][k]
          )
          const narrow = Math.min(...widths)
          const r = k1 * narrow
          const round = blended(solid, [edge], fillet(r))
          expect(a * b * c - brepVolume(round)).toBeCloseTo(
            (1 - Math.PI / 4) * r * r * length,
            6
          )
          const faces = solid.faces
            .map((f, i) => ({ f, i }))
            .filter(({ f }) =>
              f.loops.some((l) => l.some((co) => co.edge === edge))
            )
          const d1 = k1 * narrow
          const d2 = k2 * narrow
          const bevel = blended(solid, [edge], {
            kind: "chamfer",
            base: faces[0].i,
            distance1: d1,
            distance2: d2,
          })
          expect(a * b * c - brepVolume(bevel)).toBeCloseTo(
            (d1 * d2 * length) / 2,
            6
          )
        }
      ),
      { numRuns: 60 }
    )
  })
})

describe("the edges a pick takes", () => {
  it("chains tangent edges, offers an edge's two loops and finds a chamfer's base", () => {
    const block = roundedBlock(20, 10, 2, 5)
    const front = edgeAt(block, { x: 10, y: 0, z: 5 })
    expect(tangentChain(block, front)).toHaveLength(8)
    const b = box(0, 0, 0, 10, 10, 10)
    const edge = edgeAt(b, { x: 5, y: 0, z: 10 })
    expect(tangentChain(b, edge)).toEqual([edge])
    const [first, next] = edgeLoops(b, edge)
    const top = b.faces.findIndex(
      (f) => f.surface.kind === "plane" && f.surface.normal.z === 1
    )
    const frontFace = b.faces.findIndex(
      (f) => f.surface.kind === "plane" && f.surface.normal.y === -1
    )
    expect(first).toEqual(b.faces[frontFace].loops[0].map((c) => c.edge))
    expect(next).toEqual(b.faces[top].loops[0].map((c) => c.edge))
    expect(chamferBase(b, [edge])).toBe(frontFace)
    const right = edgeAt(b, { x: 10, y: 5, z: 10 })
    expect(chamferBase(b, [edge, right])).toBe(top)
    expect(chamferBase(b, [edge, edgeAt(b, { x: 10, y: 0, z: 5 })])).toBe(
      frontFace
    )
    expect(chamferBase(b, [edge, edgeAt(b, { x: 5, y: 10, z: 0 })])).toBeNull()
  })
})
