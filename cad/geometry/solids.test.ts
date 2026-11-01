import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { Vec3, add3, cross3, dot3, length3, scale3 } from "./Vec3"
import { arbitraryAxis } from "./ocs"
import {
  Brep,
  boxBrep,
  ellipsePerimeter,
  roundBrep,
  brepArea,
  brepIsClosed,
  brepMapped,
  brepVolume,
  brepIsolines,
  closedSurfaceReach,
  coedgeStart,
  pyramidBrep,
  sphereBrep,
  sphereParallels,
  torusBrep,
  wedgeBrep,
} from "./solids"

const size = fc.double({ min: 0.01, max: 1000, noNaN: true })
const coordinate = fc.double({ min: -1e4, max: 1e4, noNaN: true })
const angle = fc.double({ min: -Math.PI, max: Math.PI, noNaN: true })

const unitVector = fc
  .tuple(angle, fc.double({ min: -Math.PI / 2, max: Math.PI / 2, noNaN: true }))
  .map(([azimuth, tilt]): Vec3 => ({
    x: Math.cos(tilt) * Math.cos(azimuth),
    y: Math.cos(tilt) * Math.sin(azimuth),
    z: Math.sin(tilt),
  }))

const point = fc
  .tuple(coordinate, coordinate, coordinate)
  .map(([x, y, z]): Vec3 => ({ x, y, z }))

/** A box anywhere, its sides along any right-handed frame, and its sizes. */
const box = fc
  .tuple(point, unitVector, angle, size, size, size)
  .map(([corner, n, turn, l, w, h]) => {
    const axes = arbitraryAxis(n)!
    const x = add3(
      scale3(axes.x, Math.cos(turn)),
      scale3(axes.y, Math.sin(turn))
    )
    const y = cross3(axes.z, x)
    return {
      brep: boxBrep(corner, scale3(x, l), scale3(y, w), scale3(axes.z, h)),
      l,
      w,
      h,
    }
  })

/**
 * The Euler characteristic V − E + Σ χ(face), 2 for one shell of genus 0:
 * each face an open surface with its loops as holes, χ = 2 − 2g − L for a
 * disc's, an annulus's or a doughnut's (g 1); an apex's edge of no length is
 * only its vertex, its loop a puncture the vertex fills (a cone's side, χ 0,
 * plus that vertex; a lemon's, an apple's poles).
 */
function euler(brep: Brep): number {
  const edges = brep.edges.filter((e) => e.curve.kind !== "point").length
  const faces = brep.faces.reduce((n, f) => {
    const s = f.surface
    const genus = s.kind === "torus" && s.majorRadius > s.minorRadius ? 1 : 0
    return n + 2 - 2 * genus - f.loops.length
  }, 0)
  return brep.vertices.length - edges + faces
}

/** Each edge used by exactly two faces, once each way. */
function faceUses(brep: Brep): Map<number, string[]> {
  const uses = new Map<number, string[]>()
  brep.faces.forEach((face, f) =>
    face.loops.forEach((loop) =>
      loop.forEach((c) =>
        uses.set(c.edge, [
          ...(uses.get(c.edge) ?? []),
          `${f}${c.reversed ? "-" : "+"}`,
        ])
      )
    )
  )
  return uses
}

/**
 * Every plane's loops turning counter-clockwise about its outward normal: a
 * polygon's by its corners, a whole circle's or ellipse's by its normal and
 * the coedge's sense. A curved face's are the closing check's.
 */
function loopsTurnOutward(brep: Brep): boolean {
  return brep.faces.every((face) =>
    face.loops.every((loop) => {
      const s = face.surface
      if (s.kind !== "plane") return true
      const only = brep.edges[loop[0].edge].curve
      if (loop.length === 1 && only.kind !== "line" && only.kind !== "point") {
        return dot3(only.normal, s.normal) * (loop[0].reversed ? -1 : 1) > 0
      }
      const points = loop.map((c) => brep.vertices[coedgeStart(brep, c)])
      let n: Vec3 = { x: 0, y: 0, z: 0 }
      points.forEach((p, i) => {
        n = add3(n, cross3(p, points[(i + 1) % points.length]))
      })
      return dot3(n, s.normal) > 0
    })
  )
}

const close = (a: number, b: number) =>
  Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) * 1e3

describe("a box's B-rep", () => {
  it("is one closed shell: Euler's V − E + F = 2, 8 − 12 + 6", () => {
    fc.assert(
      fc.property(box, ({ brep }) => {
        expect([
          brep.vertices.length,
          brep.edges.length,
          brep.faces.length,
        ]).toEqual([8, 12, 6])
        expect(euler(brep)).toBe(2)
      })
    )
  })

  it("is watertight: each edge in two faces, run opposite ways", () => {
    fc.assert(
      fc.property(box, ({ brep }) => {
        for (const uses of faceUses(brep).values()) {
          expect(uses).toHaveLength(2)
          expect(uses.map((u) => u.at(-1)).sort()).toEqual(["+", "-"])
          expect(uses[0][0]).not.toBe(uses[1][0])
        }
        expect(brepIsClosed(brep)).toBe(true)
        expect(loopsTurnOutward(brep)).toBe(true)
      })
    )
  })

  it("encloses its length × width × height, bounded by twice its faces", () => {
    fc.assert(
      fc.property(box, ({ brep, l, w, h }) => {
        expect(close(brepVolume(brep), l * w * h)).toBe(true)
        expect(close(brepArea(brep), 2 * (l * w + l * h + w * h))).toBe(true)
      })
    )
  })

  it("keeps all that through a turn, a scale, a shift and a reflection", () => {
    fc.assert(
      fc.property(
        box,
        unitVector,
        angle,
        fc.double({ min: 0.1, max: 10, noNaN: true }),
        point,
        fc.boolean(),
        ({ brep, l, w, h }, n, turn, k, shift, reflects) => {
          const axes = arbitraryAxis(n)!
          const x = add3(
            scale3(axes.x, Math.cos(turn)),
            scale3(axes.y, Math.sin(turn))
          )
          const y = cross3(axes.z, x)
          const z = reflects ? scale3(axes.z, -1) : axes.z
          const direction = (d: Vec3) =>
            add3(add3(scale3(x, d.x), scale3(y, d.y)), scale3(z, d.z))
          const moved = brepMapped(
            brep,
            (p) => add3(scale3(direction(p), k), shift),
            direction,
            reflects,
            k
          )
          expect(brepIsClosed(moved)).toBe(true)
          expect(loopsTurnOutward(moved)).toBe(true)
          expect(euler(moved)).toBe(2)
          expect(close(brepVolume(moved), l * w * h * k ** 3)).toBe(true)
          const edge = (b: Brep, i: number) =>
            length3({
              x: b.vertices[b.edges[i].end].x - b.vertices[b.edges[i].start].x,
              y: b.vertices[b.edges[i].end].y - b.vertices[b.edges[i].start].y,
              z: b.vertices[b.edges[i].end].z - b.vertices[b.edges[i].start].z,
            })
          brep.edges.forEach((_, i) =>
            expect(close(edge(moved, i), edge(brep, i) * k)).toBe(true)
          )
        }
      )
    )
  })

  it("runs its edges as ACIS runs a box's, its faces in ACIS's order (solid/p01)", () => {
    const brep = boxBrep(
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      { x: 0, y: 20, z: 0 },
      { x: 0, y: 0, z: 5 }
    )
    const at = (i: number) => {
      const { x, y, z } = brep.vertices[i]
      return [x, y, z]
    }
    // The bottom's edges round the bottom face, so the one at X 10 runs
    // from Y 20 to Y 0, as ACIS's edge 10 does; the risers run down.
    expect(brep.edges.slice(0, 4).map((e) => [at(e.start), at(e.end)])).toEqual(
      [
        [
          [0, 0, 0],
          [0, 20, 0],
        ],
        [
          [0, 20, 0],
          [10, 20, 0],
        ],
        [
          [10, 20, 0],
          [10, 0, 0],
        ],
        [
          [10, 0, 0],
          [0, 0, 0],
        ],
      ]
    )
    expect(brep.edges.slice(8).every((e) => at(e.start)[2] === 5)).toBe(true)
    expect(
      brep.faces.map((f) =>
        f.surface.kind === "plane" ? f.surface.normal : null
      )
    ).toEqual([
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: -1 },
      { x: 0, y: -1, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
    ])
    expect([brepVolume(brep), brepArea(brep)]).toEqual([1000, 700])
  })

  it("is not closed with an edge used once, or a vertex off its face", () => {
    const brep = boxBrep(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 }
    )
    expect(brepIsClosed({ ...brep, faces: brep.faces.slice(1) })).toBe(false)
    expect(
      brepIsClosed({
        ...brep,
        vertices: brep.vertices.map((p, i) => (i === 6 ? { ...p, z: 2 } : p)),
      })
    ).toBe(false)
  })
})

/** A right-handed frame anywhere: a corner or centre, its axes. */
const frame = fc.tuple(point, unitVector, angle).map(([origin, n, turn]) => {
  const axes = arbitraryAxis(n)!
  const x = add3(scale3(axes.x, Math.cos(turn)), scale3(axes.y, Math.sin(turn)))
  return { origin, x, y: cross3(axes.z, x), z: axes.z }
})

/** A point of `f` at local coordinates (a, b, c). */
function at(
  f: { origin: Vec3; x: Vec3; y: Vec3; z: Vec3 },
  a: number,
  b: number,
  c: number
): Vec3 {
  return add3(
    f.origin,
    add3(add3(scale3(f.x, a), scale3(f.y, b)), scale3(f.z, c))
  )
}

const wedge = fc.tuple(frame, size, size, size).map(([f, l, w, h]) => ({
  brep: wedgeBrep(f.origin, scale3(f.x, l), scale3(f.y, w), scale3(f.z, h)),
  l,
  w,
  h,
}))

/** A pyramid of 3 to 32 sides, `top` 0 for a point, else a frustum's top. */
const pyramid = fc
  .tuple(
    frame,
    fc.integer({ min: 3, max: 32 }),
    size,
    size,
    fc.oneof(fc.constant(0), size)
  )
  .map(([f, n, r, h, top]) => {
    const ring = (radius: number, z: number) =>
      Array.from({ length: n }, (_, k) => {
        const a = (Math.PI * (2 * k + 1)) / n
        return at(f, radius * Math.cos(a), radius * Math.sin(a), z)
      })
    return {
      brep: pyramidBrep(
        ring(r, 0),
        at(f, 0, 0, h),
        top > 0 ? ring(top, h) : null
      ),
      n,
      r,
      h,
      top,
    }
  })

describe("a wedge's B-rep", () => {
  it("is one closed shell, 6 − 9 + 5, watertight and facing out", () => {
    fc.assert(
      fc.property(wedge, ({ brep }) => {
        expect([
          brep.vertices.length,
          brep.edges.length,
          brep.faces.length,
        ]).toEqual([6, 9, 5])
        expect(euler(brep)).toBe(2)
        expect(brepIsClosed(brep)).toBe(true)
        expect(loopsTurnOutward(brep)).toBe(true)
      })
    )
  })

  it("encloses half its box, bounded by its base, back, ends and slope", () => {
    fc.assert(
      fc.property(wedge, ({ brep, l, w, h }) => {
        expect(close(brepVolume(brep), (l * w * h) / 2)).toBe(true)
        const area = l * w + w * h + l * h + w * Math.hypot(l, h)
        expect(close(brepArea(brep), area)).toBe(true)
      })
    )
  })
})

describe("a pyramid's B-rep", () => {
  it("is one closed shell, its apex or its top over its base", () => {
    fc.assert(
      fc.property(pyramid, ({ brep, n, top }) => {
        expect([
          brep.vertices.length,
          brep.edges.length,
          brep.faces.length,
        ]).toEqual(top > 0 ? [2 * n, 3 * n, n + 2] : [n + 1, 2 * n, n + 1])
        expect(euler(brep)).toBe(2)
        expect(brepIsClosed(brep)).toBe(true)
        expect(loopsTurnOutward(brep)).toBe(true)
      })
    )
  })

  it("encloses a frustum's volume and is bounded by its faces' area", () => {
    fc.assert(
      fc.property(pyramid, ({ brep, n, r, h, top }) => {
        const polygon = (radius: number) =>
          (n / 2) * radius ** 2 * Math.sin((2 * Math.PI) / n)
        const base = polygon(r)
        const upper = polygon(top)
        expect(
          close(
            brepVolume(brep),
            (h / 3) * (base + upper + Math.sqrt(base * upper))
          )
        ).toBe(true)
        const side = (radius: number) => 2 * radius * Math.sin(Math.PI / n)
        const slant = Math.hypot(h, (r - top) * Math.cos(Math.PI / n))
        const lateral = (n / 2) * (side(r) + side(top)) * slant
        expect(close(brepArea(brep), base + upper + lateral)).toBe(true)
      })
    )
  })

  it("keeps all that through a reflection", () => {
    fc.assert(
      fc.property(pyramid, point, ({ brep }, shift) => {
        const flip = (d: Vec3) => ({ x: -d.x, y: d.y, z: d.z })
        const moved = brepMapped(brep, (p) => add3(flip(p), shift), flip, true)
        expect(brepIsClosed(moved)).toBe(true)
        expect(loopsTurnOutward(moved)).toBe(true)
        expect(close(brepVolume(moved), brepVolume(brep))).toBe(true)
      })
    )
  })
})

/**
 * A cylinder, cone or frustum anywhere, circular or elliptical: `scale` 1, 0
 * or another top.
 */
const round = fc
  .tuple(
    frame,
    size,
    fc.oneof(fc.constant(null), size),
    size,
    fc.oneof(
      fc.constant(1),
      fc.constant(0),
      fc.double({ min: 0.05, max: 3, noNaN: true })
    )
  )
  .map(([f, rx, across, h, scale]) => {
    const ry = across ?? rx
    return {
      brep: roundBrep(f.origin, f.z, f.x, rx, ry, h, scale),
      rx,
      ry,
      h,
      scale,
    }
  })

/** ∫₀^2π √(a² sin²θ + b² cos²θ) dθ by the trapezoid rule, exact fast on a periodic integrand. */
function perimeterBySum(a: number, b: number): number {
  const n = 4096
  let sum = 0
  for (let k = 0; k < n; k++) {
    const t = (2 * Math.PI * k) / n
    sum += Math.hypot(a * Math.sin(t), b * Math.cos(t))
  }
  return (sum * 2 * Math.PI) / n
}

describe("the perimeter of an ellipse", () => {
  it("is a circle's for equal axes and the sum's for any", () => {
    expect(ellipsePerimeter(3, 3)).toBeCloseTo(6 * Math.PI, 12)
    expect(ellipsePerimeter(2, 1)).toBeCloseTo(9.688448220547675, 12)
    fc.assert(
      fc.property(size, size, (a, b) => {
        expect(close(ellipsePerimeter(a, b), perimeterBySum(a, b))).toBe(true)
      })
    )
  })
})

describe("a cylinder's, a cone's and a frustum's B-rep", () => {
  it("is one closed shell: its circles' vertices, an apex's, its faces' loops", () => {
    fc.assert(
      fc.property(round, ({ brep, scale }) => {
        expect([
          brep.vertices.length,
          brep.edges.length,
          brep.faces.length,
        ]).toEqual([2, 2, scale === 0 ? 2 : 3])
        expect(brep.faces[0].loops).toHaveLength(2)
        expect(euler(brep)).toBe(2)
        expect(brepIsClosed(brep)).toBe(true)
        expect(loopsTurnOutward(brep)).toBe(true)
      })
    )
  })

  it("encloses π·rx·ry·h·(1 + s + s²)/3, bounded by its caps and its side", () => {
    fc.assert(
      fc.property(round, ({ brep, rx, ry, h, scale: s }) => {
        const volume = (Math.PI * rx * ry * h * (1 + s + s * s)) / 3
        expect(close(brepVolume(brep), volume)).toBe(true)
        // The side's area, ∫ of its slant along its height, by the sum.
        const major = Math.max(rx, ry)
        const k = (major * Math.abs(1 - s)) / h / major
        const side =
          s === 1
            ? perimeterBySum(rx, ry) * h
            : (Math.abs(1 - s * s) / 2) *
              (h / Math.abs(1 - s)) ** 2 *
              perimeterBySum(
                Math.hypot(ry * k, rx * ry * k * k),
                Math.hypot(rx * k, rx * ry * k * k)
              )
        const caps = Math.PI * rx * ry * (1 + s * s)
        expect(close(brepArea(brep), side + caps)).toBe(true)
      })
    )
  })

  it("keeps all that through a turn, a scale, a shift and a reflection", () => {
    fc.assert(
      fc.property(
        round,
        unitVector,
        fc.double({ min: 0.1, max: 10, noNaN: true }),
        point,
        fc.boolean(),
        ({ brep }, n, k, shift, reflects) => {
          const axes = arbitraryAxis(n)!
          const z = reflects ? scale3(axes.z, -1) : axes.z
          const direction = (d: Vec3) =>
            add3(add3(scale3(axes.x, d.x), scale3(axes.y, d.y)), scale3(z, d.z))
          const moved = brepMapped(
            brep,
            (p) => add3(scale3(direction(p), k), shift),
            direction,
            reflects,
            k
          )
          expect(brepIsClosed(moved)).toBe(true)
          expect(loopsTurnOutward(moved)).toBe(true)
          expect(close(brepVolume(moved), brepVolume(brep) * k ** 3)).toBe(true)
          expect(close(brepArea(moved), brepArea(brep) * k ** 2)).toBe(true)
        }
      )
    )
  })
})

const ball = fc
  .tuple(frame, size)
  .map(([f, r]) => ({ brep: sphereBrep(f.origin, f.z, f.x, r), r }))

/**
 * A torus of every kind: a doughnut's ring wider than its tube, a vortex's
 * as wide, an apple's narrower, a lemon's negative and narrower still.
 */
const torus = fc
  .tuple(
    frame,
    size,
    fc.oneof(
      fc.constant(1),
      fc.double({ min: 1.05, max: 20, noNaN: true }),
      fc.double({ min: 0.05, max: 0.95, noNaN: true }),
      fc.double({ min: -0.95, max: -0.05, noNaN: true })
    )
  )
  .map(([f, r, ratio]) => ({
    brep: torusBrep(f.origin, f.z, f.x, ratio * r, r),
    f,
    R: ratio * r,
    r,
  }))

/**
 * The volume and the area the tube's circle sweeps where it lies outside the
 * axis, by Pappus: the disc's part beyond the chord at `a` = −R from its
 * centre, its area r²·acos(a/r) − a·√(r² − a²) and first moment ⅔(r² − a²)^1.5;
 * the circle's arc of half angle acos(−R/r).
 */
function torusMeasures(R: number, r: number) {
  const a = Math.max(-r, Math.min(r, -R))
  const segment = r * r * Math.acos(a / r) - a * Math.sqrt(r * r - a * a)
  const moment = (2 / 3) * (r * r - a * a) ** 1.5
  const half = Math.acos(a / r)
  return {
    volume: 2 * Math.PI * (R * segment + moment),
    area: 4 * Math.PI * r * (R * half + r * Math.sin(half)),
  }
}

describe("a sphere's and a torus' B-rep", () => {
  it("is one face with no edge, a lemon's or an apple's with its poles (h01, r05)", () => {
    fc.assert(
      fc.property(ball, ({ brep }) => {
        expect([brep.vertices, brep.edges, brep.faces[0].loops]).toEqual([
          [],
          [],
          [],
        ])
        expect(euler(brep)).toBe(2)
        expect(brepIsClosed(brep)).toBe(true)
      })
    )
    fc.assert(
      fc.property(torus, ({ brep, R, r }) => {
        // A doughnut's hole makes it genus 1; a vortex's pinch, its poles one.
        expect(euler(brep)).toBe(R > r ? 0 : R === r ? 1 : 2)
        expect(brep.vertices).toHaveLength(R > r ? 0 : R === r ? 1 : 2)
        expect(brepIsClosed(brep)).toBe(true)
      })
    )
  })

  it("encloses and is bounded as Pappus has it, AutoCAD's measures too (h01, r01, r05)", () => {
    fc.assert(
      fc.property(ball, ({ brep, r }) => {
        expect(close(brepVolume(brep), (4 / 3) * Math.PI * r ** 3)).toBe(true)
        expect(close(brepArea(brep), 4 * Math.PI * r * r)).toBe(true)
      })
    )
    fc.assert(
      fc.property(torus, ({ brep, R, r }) => {
        const { volume, area } = torusMeasures(R, r)
        expect(close(brepVolume(brep), volume)).toBe(true)
        expect(close(brepArea(brep), area)).toBe(true)
      })
    )
    const origin = { x: 0, y: 0, z: 0 }
    const Z = { x: 0, y: 0, z: 1 }
    const X = { x: 1, y: 0, z: 0 }
    const lemon = torusBrep(origin, Z, X, -4, 5)
    expect(brepArea(lemon)).toBeCloseTo(26.766091, 6)
    expect(brepVolume(lemon)).toBeCloseTo(10.366559, 6)
    expect(brepArea(torusBrep(origin, Z, X, 2, 4))).toBeCloseTo(384.6763, 4)
    expect(brepArea(torusBrep(origin, Z, X, 10, 2))).toBeCloseTo(789.5684, 4)
  })

  it("keeps all that through a turn, a scale, a shift and a reflection", () => {
    fc.assert(
      fc.property(
        fc.oneof(ball, torus),
        unitVector,
        fc.double({ min: 0.1, max: 10, noNaN: true }),
        point,
        fc.boolean(),
        ({ brep }, n, k, shift, reflects) => {
          const axes = arbitraryAxis(n)!
          const z = reflects ? scale3(axes.z, -1) : axes.z
          const direction = (d: Vec3) =>
            add3(add3(scale3(axes.x, d.x), scale3(axes.y, d.y)), scale3(z, d.z))
          const moved = brepMapped(
            brep,
            (p) => add3(scale3(direction(p), k), shift),
            direction,
            reflects,
            k
          )
          expect(brepIsClosed(moved)).toBe(true)
          expect(euler(moved)).toBe(euler(brep))
          expect(close(brepVolume(moved), brepVolume(brep) * k ** 3)).toBe(true)
          expect(close(brepArea(moved), brepArea(brep) * k ** 2)).toBe(true)
        }
      )
    )
  })

  it("reaches along each axis exactly as far as its surface does", () => {
    fc.assert(
      fc.property(torus, ({ brep, f, R, r }) => {
        const [{ surface }] = brep.faces
        const reach = closedSurfaceReach(surface)!
        const half = Math.acos(Math.max(-1, Math.min(1, -R / r)))
        let most = { x: 0, y: 0, z: 0 }
        for (let i = 0; i <= 360; i++) {
          const phi = -half + (2 * half * i) / 360
          for (let j = 0; j < 360; j++) {
            const theta = (2 * Math.PI * j) / 360
            const p = at(
              f,
              (R + r * Math.cos(phi)) * Math.cos(theta),
              (R + r * Math.cos(phi)) * Math.sin(theta),
              r * Math.sin(phi)
            )
            const d = add3(p, scale3(f.origin, -1))
            most = {
              x: Math.max(most.x, Math.abs(d.x)),
              y: Math.max(most.y, Math.abs(d.y)),
              z: Math.max(most.z, Math.abs(d.z)),
            }
          }
        }
        // Sampled every degree: within 1e-3 of the reach, never past it.
        for (const axis of ["x", "y", "z"] as const) {
          expect(most[axis]).toBeLessThanOrEqual(reach[axis] + 1e-9 * r)
          expect(most[axis]).toBeGreaterThan(
            reach[axis] - 1e-3 * (r + Math.abs(R))
          )
        }
      }),
      { numRuns: 20 }
    )
    expect(
      closedSurfaceReach(sphereBrep(ORIGIN, UP, EAST, 3).faces[0].surface)
    ).toEqual({ x: 3, y: 3, z: 3 })
  })

  it("draws ISOLINES' meridians and parallels, none at 0 (d06–d09)", () => {
    expect([1, 4, 8, 16, 17].map(sphereParallels)).toEqual([1, 3, 7, 13, 13])
    const sphere = sphereBrep(ORIGIN, UP, EAST, 5)
    expect(brepIsolines(sphere, 4)).toHaveLength(4 + 3)
    expect(brepIsolines(sphere, 16)).toHaveLength(16 + 13)
    expect(brepIsolines(sphere, 0)).toEqual([])
    const doughnut = torusBrep(ORIGIN, UP, EAST, 10, 2)
    const lemon = torusBrep(ORIGIN, UP, EAST, -4, 5)
    expect(brepIsolines(doughnut, 4)).toHaveLength(8)
    expect(brepIsolines(lemon, 4)).toHaveLength(8)
    // A lemon's tube circles are arcs within its poles.
    const [tube] = brepIsolines(lemon, 4)
    expect(tube.kind === "arc" && tube.sweep).toBeCloseTo(
      2 * Math.acos(4 / 5),
      12
    )
  })
})

const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 }
const UP: Vec3 = { x: 0, y: 0, z: 1 }
const EAST: Vec3 = { x: 1, y: 0, z: 0 }
