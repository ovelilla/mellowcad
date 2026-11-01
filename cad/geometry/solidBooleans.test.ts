import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { solidPair } from "../../test/arbitraries"

import { Vec3 } from "./Vec3"
import {
  Brep,
  boxBrep,
  torusBrep,
  brepArea,
  brepIsClosed,
  brepVolume,
  roundBrep,
  sphereBrep,
} from "./solids"
import { brepMoments, solidInertia } from "./massProperties"
import { SolidBooleanError, brepBoolean } from "./solidBooleans"
import { conicArcCurve } from "./nurbs"
import { extrusionBrep, revolutionBrep } from "./sweeps"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Y: Vec3 = { x: 0, y: 1, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const box = (
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number
) =>
  boxBrep(
    { x, y, z },
    { x: dx, y: 0, z: 0 },
    { x: 0, y: dy, z: 0 },
    { x: 0, y: 0, z: dz }
  )

function counts(b: Brep) {
  return { v: b.vertices.length, e: b.edges.length, f: b.faces.length }
}

describe("booleans of solids", () => {
  it("unites two boxes overlapping at a corner (union/k01: 2375)", () => {
    const r = brepBoolean(
      "union",
      box(0, 0, 0, 10, 10, 10),
      box(5, 5, 5, 10, 10, 15)
    )!
    expect(brepIsClosed(r)).toBe(true)
    expect(brepVolume(r)).toBeCloseTo(2375, 9)
    expect(brepArea(r)).toBeCloseTo(1250, 9)
    expect(counts(r)).toEqual({ v: 20, e: 30, f: 12 })
    const c = solidInertia(brepMoments(r)).centroid
    expect(c.x).toBeCloseTo(8.026315789473685, 9)
    expect(c.z).toBeCloseTo(9.605263157894736, 9)
  })

  it("unites boxes side by side into one box (union/k02)", () => {
    const r = brepBoolean(
      "union",
      box(0, 0, 0, 10, 10, 10),
      box(10, 0, 0, 10, 10, 10)
    )!
    expect(brepIsClosed(r)).toBe(true)
    expect(brepVolume(r)).toBeCloseTo(2000, 9)
    expect(counts(r)).toEqual({ v: 8, e: 12, f: 6 })
  })

  it("unites boxes apart into one of two shells (union/k03)", () => {
    const r = brepBoolean(
      "union",
      box(0, 0, 0, 10, 10, 10),
      box(20, 0, 0, 10, 10, 10)
    )!
    expect(brepVolume(r)).toBeCloseTo(2000, 9)
    expect(counts(r)).toEqual({ v: 16, e: 24, f: 12 })
    expect(solidInertia(brepMoments(r)).centroid.x).toBeCloseTo(15, 9)
  })

  it("drills a cylinder through a box (union/k04)", () => {
    const r = brepBoolean(
      "subtract",
      box(0, 0, 0, 20, 20, 10),
      roundBrep({ x: 10, y: 10, z: -5 }, Z, X, 4, 4, 20, 1)
    )!
    expect(brepIsClosed(r)).toBe(true)
    expect(brepVolume(r)).toBeCloseTo(4000 - Math.PI * 160, 9)
    expect(brepArea(r)).toBeCloseTo(
      2 * 400 - 2 * Math.PI * 16 + 800 + 2 * Math.PI * 4 * 10,
      9
    )
    expect(counts(r)).toEqual({ v: 10, e: 14, f: 7 })
  })

  it("unites two cylinders square to each other (union/k05, k06, k08)", () => {
    const upright = roundBrep({ x: 0, y: 0, z: -10 }, Z, X, 5, 5, 20, 1)
    const thin = roundBrep({ x: -10, y: 0, z: 0 }, X, Y, 3, 3, 20, 1)
    const tee = brepBoolean("union", upright, thin)!
    expect(brepIsClosed(tee)).toBe(true)
    // WHY not AutoCAD's 1866.8100: ACIS integrates a face bounded by its
    // approximate intersection curve only roughly (its INTERSECT of the same
    // pair, 269.3665, does not add up with it); this is π(25 + 9)·20 less
    // 36 ∫ cos²φ √(25 − 9 sin²φ) dφ.
    expect(brepVolume(tee)).toBeCloseTo(1866.9126769129991, 9)
    const even = brepBoolean(
      "union",
      upright,
      roundBrep({ x: -10, y: 0, z: 0 }, X, Y, 5, 5, 20, 1)
    )!
    expect(brepIsClosed(even)).toBe(true)
    expect(brepVolume(even)).toBeCloseTo(2474.925986923126, 6)
  })

  it("cuts a sphere's upper half off with a box (union/k07)", () => {
    const r = brepBoolean(
      "subtract",
      sphereBrep({ x: 0, y: 0, z: 0 }, Z, X, 10),
      box(-20, -20, 0, 40, 40, 20)
    )!
    expect(brepIsClosed(r)).toBe(true)
    expect(brepVolume(r)).toBeCloseTo(2094.3951023931954, 9)
    expect(counts(r)).toEqual({ v: 1, e: 1, f: 2 })
  })

  it("hold vol(A ∪ B) = vol(A) + vol(B) − vol(A ∩ B) and vol(A − B) = vol(A) − vol(A ∩ B)", () => {
    const tilt = (b: Brep) => b
    const pairs: [string, Brep, Brep][] = [
      ["boxes", box(0, 0, 0, 10, 10, 10), box(3, 4, -2, 5, 12, 6)],
      ["coplanar tops", box(0, 0, 0, 10, 10, 10), box(5, 5, 0, 10, 10, 10)],
      ["box in box", box(0, 0, 0, 10, 10, 10), box(2, 2, 2, 3, 3, 3)],
      [
        "slanted box",
        box(0, 0, 0, 10, 10, 10),
        boxBrep(
          { x: 5, y: -3, z: 2 },
          { x: 6, y: 6, z: 0 },
          { x: -3, y: 3, z: 1 },
          { x: 1, y: -1, z: 6 }
        ),
      ],
      [
        "spheres",
        sphereBrep({ x: 0, y: 0, z: 0 }, Z, X, 5),
        sphereBrep({ x: 3, y: 2, z: 1 }, Z, X, 4),
      ],
      [
        "sphere and box",
        sphereBrep({ x: 5, y: 5, z: 9 }, Z, X, 4),
        box(0, 0, 0, 10, 10, 10),
      ],
      [
        "cylinder through sphere",
        sphereBrep({ x: 0, y: 0, z: 0 }, Z, X, 6),
        roundBrep({ x: 0, y: 0, z: -10 }, Z, X, 3, 3, 20, 1),
      ],
      [
        "cone and box",
        roundBrep({ x: 5, y: 5, z: -2 }, Z, X, 6, 6, 14, 0),
        box(0, 0, 0, 10, 10, 10),
      ],
      [
        "cone and slanted plane",
        roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 6, 6, 12, 0),
        boxBrep(
          { x: -10, y: -10, z: 2 },
          { x: 20, y: 0, z: 4 },
          { x: 0, y: 20, z: 0 },
          { x: 0, y: 0, z: 20 }
        ),
      ],
      [
        "parallel cylinders",
        roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1),
        roundBrep({ x: 6, y: 1, z: -3 }, Z, X, 3, 3, 10, 1),
      ],
      [
        "cylinder and box aslant",
        roundBrep(
          { x: 5, y: 5, z: -5 },
          normalize({ x: 1, y: 1, z: 3 }),
          normalize({ x: 1, y: -1, z: 0 }),
          3,
          3,
          20,
          1
        ),
        box(0, 0, 0, 10, 10, 10),
      ],
      [
        "tee",
        roundBrep({ x: 0, y: 0, z: -10 }, Z, X, 5, 5, 20, 1),
        roundBrep({ x: -10, y: 0, z: 1 }, X, Y, 3, 3, 20, 1),
      ],
    ]
    void tilt
    for (const [name, A, B] of pairs) {
      const va = brepVolume(A)
      const vb = brepVolume(B)
      const u = brepBoolean("union", A, B)
      const i = brepBoolean("intersect", A, B)
      const d = brepBoolean("subtract", A, B)
      const vu = u ? brepVolume(u) : 0
      const vi = i ? brepVolume(i) : 0
      const vd = d ? brepVolume(d) : 0
      for (const r of [u, i, d]) if (r) expect(brepIsClosed(r), name).toBe(true)
      expect(vu, name).toBeCloseTo(va + vb - vi, 6)
      expect(vd, name).toBeCloseTo(va - vi, 6)
    }
  })
})

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v.x, v.y, v.z)
  return { x: v.x / l, y: v.y / l, z: v.z / l }
}

/**
 * Euler–Poincaré: V − E + F − (L − F) = 2 (S − G), an apex's edge of no
 * length counted with no edge: even, and no more than twice the shells.
 */
function eulerHolds(b: Brep): boolean {
  const edges = b.edges.filter((e) => e.curve.kind !== "point").length
  const loops = b.faces.reduce((n, f) => n + f.loops.length, 0)
  const chi =
    b.vertices.length - edges + b.faces.length - (loops - b.faces.length)
  // Shells: faces joined by the edges they share.
  const parent = b.faces.map((_, i) => i)
  const find = (i: number): number =>
    parent[i] === i ? i : (parent[i] = find(parent[i]))
  const owner = new Map<number, number>()
  b.faces.forEach((f, i) => {
    for (const loop of f.loops) {
      for (const c of loop) {
        const j = owner.get(c.edge)
        if (j === undefined) owner.set(c.edge, i)
        else parent[find(i)] = find(j)
      }
    }
  })
  const shells = new Set(b.faces.map((_, i) => find(i))).size
  return chi % 2 === 0 && chi <= 2 * shells
}

/** Unions, intersections and differences of the pair add up, and each closes. */
function addsUp(name: string, A: Brep, B: Brep, digits = 6) {
  const va = brepVolume(A)
  const vb = brepVolume(B)
  const u = brepBoolean("union", A, B)
  const i = brepBoolean("intersect", A, B)
  const d = brepBoolean("subtract", A, B)
  for (const r of [u, i, d]) if (r) expect(brepIsClosed(r), name).toBe(true)
  const vi = i ? brepVolume(i) : 0
  expect(u ? brepVolume(u) : 0, name).toBeCloseTo(va + vb - vi, digits)
  expect(d ? brepVolume(d) : 0, name).toBeCloseTo(va - vi, digits)
  return { u, i, d, vi }
}

const O: Vec3 = { x: 0, y: 0, z: 0 }

/** A closed spline loop: the circle of radius `r` round `c` in the XZ plane, as a NURBS. */
function splineCircle(c: Vec3, r: number) {
  const curve = conicArcCurve(
    c,
    { x: r, y: 0, z: 0 },
    { x: 0, y: 0, z: r },
    0,
    2 * Math.PI
  )
  return { curve, end: curve.knots[curve.knots.length - 1] }
}

describe("booleans in each closed form", () => {
  it("cut a torus by planes square to its axis and through it, and by a cylinder round it", () => {
    const torus = torusBrep(O, Z, X, 10, 3)
    const { i } = addsUp("torus/box", torus, box(0, -20, -1, 20, 40, 21))
    // A quarter... no: the half past x = 0, above z = −1.
    expect(i).not.toBeNull()
    addsUp(
      "torus/cylinder",
      torus,
      roundBrep({ x: 0, y: 0, z: -10 }, Z, X, 10, 10, 20, 1)
    )
    addsUp("torus/sphere", torus, sphereBrep({ x: 0, y: 0, z: 2 }, Z, X, 11))
    // Turned whole, π r² 2π R: the cylinder through its hole leaves it whole.
    const ring = brepBoolean(
      "subtract",
      torus,
      roundBrep({ x: 0, y: 0, z: -10 }, Z, X, 6, 6, 20, 1)
    )!
    expect(brepVolume(ring)).toBeCloseTo(2 * Math.PI ** 2 * 10 * 9, 6)
  })

  it("cut a revolution by planes square to its axis and through it, and by a cylinder on it", () => {
    const { curve, end } = splineCircle({ x: 10, y: 0, z: 0 }, 3)
    const turned = revolutionBrep(
      {
        axes: { x: X, y: { x: 0, y: 0, z: 1 }, z: { x: 0, y: -1, z: 0 } },
        elevation: 0,
        faces: [
          {
            loops: [
              [
                {
                  kind: "spline",
                  curve: {
                    ...curve,
                    controlPoints: curve.controlPoints.map((p) => ({
                      x: p.x,
                      y: p.z,
                      z: 0,
                    })),
                  },
                  from: 0,
                  to: end,
                },
              ],
            ],
          },
        ],
      },
      O,
      Z,
      X,
      0,
      2 * Math.PI
    )
    expect(brepIsClosed(turned)).toBe(true)
    addsUp("revolution/box", turned, box(0, -20, -1, 20, 40, 21))
    addsUp(
      "revolution/cylinder",
      turned,
      roundBrep({ x: 0, y: 0, z: -10 }, Z, X, 11, 11, 20, 1)
    )
  })

  it("cut an extruded spline by planes along it and aslant, and by a cylinder along it", () => {
    // Counter-clockwise, as a region's outline runs: the base, then the arch back.
    const arch = {
      degree: 3,
      knots: [0, 0, 0, 0, 1, 1, 1, 1],
      controlPoints: [
        { x: 10, y: 0, z: 0 },
        { x: 10, y: 12, z: 0 },
        { x: 0, y: 12, z: 0 },
        { x: 0, y: 0, z: 0 },
      ],
    }
    const prism = extrusionBrep(
      {
        axes: { x: X, y: Y, z: Z },
        elevation: 0,
        faces: [
          {
            loops: [
              [
                { kind: "line", start: { x: 0, y: 0 }, end: { x: 10, y: 0 } },
                { kind: "spline", curve: arch, from: 0, to: 1 },
              ],
            ],
          },
        ],
      },
      { x: 0, y: 0, z: 10 }
    )!
    addsUp("extrusion/box", prism, box(2, 3, -2, 5, 20, 7))
    addsUp(
      "extrusion/slanted",
      prism,
      boxBrep(
        { x: -5, y: -5, z: 3 },
        { x: 20, y: 0, z: 2 },
        { x: 0, y: 20, z: 1 },
        { x: 0, y: 0, z: 12 }
      )
    )
    addsUp(
      "extrusion/cylinder",
      prism,
      roundBrep({ x: 5, y: 9, z: -5 }, Z, X, 2, 2, 20, 1)
    )
  })

  it("cut a cone in a hyperbola, a parabola and the lines through its apex", () => {
    const cone = roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 6, 6, 12, 0)
    // Along the axis, off it: a hyperbola's branch.
    addsUp("hyperbola", cone, box(1, -10, -1, 10, 20, 15))
    // Along a ruling (the slope's 1:2): a parabola.
    const s = Math.hypot(1, 2)
    addsUp(
      "parabola",
      cone,
      boxBrep(
        { x: -10, y: -10, z: 2 },
        { x: 0, y: 20, z: 0 },
        { x: 20 / s, y: 0, z: 40 / s },
        { x: 20 / s, y: 0, z: -10 / s }
      ),
      5
    )
    // Through the apex: two lines.
    addsUp("apex", cone, box(0, -10, -1, 10, 20, 15))
  })

  it("leave solids apart alone, and refuse a pair with no closed form", () => {
    const a = box(0, 0, 0, 1, 1, 1)
    const b = box(5, 5, 5, 1, 1, 1)
    expect(brepBoolean("intersect", a, b)).toBeNull()
    expect(brepBoolean("subtract", a, b)).toBe(a)
    expect(brepBoolean("subtract", a, a)).toBeNull()
    expect(() =>
      brepBoolean(
        "union",
        sphereBrep({ x: 0, y: 0, z: 0 }, Z, X, 5),
        roundBrep({ x: 3, y: 0, z: -10 }, Z, X, 3, 3, 20, 1)
      )
    ).toThrow(SolidBooleanError)
  })
})

describe("booleans of any solids", () => {
  it("close, keep Euler's count and add up their volumes, or refuse, rarely", () => {
    let made = 0
    let refused = 0
    fc.assert(
      fc.property(solidPair, ({ a, b, kind }) => {
        let u: Brep | null
        let i: Brep | null
        let d: Brep | null
        try {
          u = brepBoolean("union", a, b)
          i = brepBoolean("intersect", a, b)
          d = brepBoolean("subtract", a, b)
        } catch (e) {
          if (!(e instanceof SolidBooleanError)) throw e
          // A refusal leaves the solids as they were (the command says so):
          // safe, and counted below.
          if (e.reason === "failed") refused++
          return
        }
        made++
        for (const r of [u, i, d]) {
          if (!r) continue
          expect(brepIsClosed(r), kind).toBe(true)
          expect(eulerHolds(r), kind).toBe(true)
        }
        const va = brepVolume(a)
        const vb = brepVolume(b)
        const vi = i ? brepVolume(i) : 0
        const scale = Math.max(va, vb)
        expect(
          ((u ? brepVolume(u) : 0) - (va + vb - vi)) / scale,
          kind
        ).toBeCloseTo(0, 6)
        expect(((d ? brepVolume(d) : 0) - (va - vi)) / scale, kind).toBeCloseTo(
          0,
          6
        )
      }),
      { numRuns: 20 }
    )
    expect(made).toBeGreaterThan(8)
    // About 1 in 1000 sampled pairs, a sliver between a cut and an edge.
    expect(refused).toBeLessThanOrEqual(Math.max(1, made / 10))
  }, 120_000)
})
