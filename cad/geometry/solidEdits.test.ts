import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { solidCut } from "../../test/arbitraries"
import { eulerHolds, shellCount } from "../../test/breps"

import { Vec3, cross3, normalize3, sub3 } from "./Vec3"
import { curveEnd, curveStart } from "./planarCurves"
import { facesArea } from "./planarRegions"
import {
  Brep,
  boxBrep,
  brepIsClosed,
  brepVolume,
  roundBrep,
  sphereBrep,
} from "./solids"
import { brepMoments, solidInertia } from "./massProperties"
import { SolidBooleanError, brepBoolean } from "./solidBooleans"
import { brepEdgesBlended } from "./solidBlends"
import {
  CutPlane,
  PlaneSection,
  brepFaceDeleted,
  brepFaceExtruded,
  brepFaceOffset,
  brepFacePlaneSet,
  brepFacesExtruded,
  brepSection,
  brepSliced,
} from "./solidEdits"

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

/** SLICE's plane through three points, its normal (b − a) × (c − a). */
function through(a: Vec3, b: Vec3, c: Vec3): CutPlane {
  return {
    origin: a,
    normal: normalize3(cross3(sub3(b, a), sub3(c, a)))!,
  }
}

const centroid = (b: Brep) => solidInertia(brepMoments(b)).centroid

function counts(b: Brep) {
  return { v: b.vertices.length, e: b.edges.length, f: b.faces.length }
}

/** The index of the planar face facing `normal` at `level` along it. */
function faceAt(b: Brep, normal: Vec3, level: number): number {
  return b.faces.findIndex(
    (f) =>
      f.surface.kind === "plane" &&
      Math.abs(f.surface.normal.x - normal.x) < 1e-9 &&
      Math.abs(f.surface.normal.y - normal.y) < 1e-9 &&
      Math.abs(f.surface.normal.z - normal.z) < 1e-9 &&
      Math.abs(
        f.surface.origin.x * normal.x +
          f.surface.origin.y * normal.y +
          f.surface.origin.z * normal.z -
          level
      ) < 1e-9
  )
}

/** Each loop of the section runs end to start round. */
function closedLoops(section: PlaneSection): boolean {
  return section.faces.every((face) =>
    face.loops.every((loop) =>
      loop.every((c, i) => {
        const next = loop[(i + 1) % loop.length]
        const a = curveEnd(c)
        const b = curveStart(next)
        return Math.hypot(a.x - b.x, a.y - b.y) < 1e-6
      })
    )
  )
}

describe("a solid cut by a plane", () => {
  it("halves a box across the plane's normal (slice/s01)", () => {
    const { front, back } = brepSliced(box(0, 0, 0, 10, 10, 10), {
      origin: { x: 5, y: 0, z: 0 },
      normal: X,
    })
    for (const half of [front!, back!]) {
      expect(brepIsClosed(half)).toBe(true)
      expect(brepVolume(half)).toBeCloseTo(500, 9)
      expect(counts(half)).toEqual({ v: 8, e: 12, f: 6 })
    }
    expect(centroid(front!).x).toBeCloseTo(7.5, 9)
    expect(centroid(back!).x).toBeCloseTo(2.5, 9)
  })

  it("cuts along a slope through three points (s05)", () => {
    const { front, back } = brepSliced(
      box(0, 0, 0, 10, 10, 10),
      through(
        { x: 0, y: 0, z: 2 },
        { x: 10, y: 0, z: 8 },
        { x: 0, y: 10, z: 2 }
      )
    )
    expect(brepVolume(front!)).toBeCloseTo(500, 9)
    expect(centroid(front!).z).toBeCloseTo(7.2, 9)
    expect(centroid(back!).x).toBeCloseTo(6, 9)
  })

  it("leaves a corner through three vertices (s07)", () => {
    const { front, back } = brepSliced(
      box(0, 0, 0, 10, 10, 10),
      through(
        { x: 10, y: 0, z: 0 },
        { x: 20, y: 0, z: -10 },
        { x: 10, y: 10, z: -10 }
      )
    )
    expect(brepVolume(back!)).toBeCloseTo(1000 / 6, 9)
    expect(counts(back!)).toEqual({ v: 4, e: 6, f: 4 })
    expect(brepVolume(front!)).toBeCloseTo(5000 / 6, 9)
    expect(eulerHolds(front!)).toBe(true)
  })

  it("leaves a solid whole where the plane only touches it (s07)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    // On its top face.
    const top = brepSliced(b, { origin: { x: 0, y: 0, z: 10 }, normal: Z })
    expect(top.front).toBeNull()
    expect(brepVolume(top.back!)).toBeCloseTo(1000, 9)
    // Along an edge.
    const edge = brepSliced(
      b,
      through(
        { x: 10, y: 0, z: 0 },
        { x: 10, y: 0, z: 10 },
        { x: 20, y: 10, z: 0 }
      )
    )
    expect(edge.back).toBeNull()
    expect(brepVolume(edge.front!)).toBeCloseTo(1000, 9)
    // Past it.
    const past = brepSliced(b, { origin: { x: 0, y: 0, z: 20 }, normal: Z })
    expect(past.front).toBeNull()
    expect(brepVolume(past.back!)).toBeCloseTo(1000, 9)
  })

  it("cuts round solids into their closed forms (s10)", () => {
    const cylinder = brepSliced(
      roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1),
      through(
        { x: 0, y: -10, z: 3 },
        { x: 0, y: 10, z: 3 },
        { x: 10, y: 0, z: 7 }
      )
    )
    expect(brepVolume(cylinder.front!)).toBeCloseTo(235.61944901923476, 9)
    expect(brepVolume(cylinder.back!)).toBeCloseTo(549.7787143782135, 9)
    expect(centroid(cylinder.front!).z).toBeCloseTo(1.6666666666666619, 9)
    const sphere = brepSliced(sphereBrep({ x: 30, y: 0, z: 0 }, Z, X, 5), {
      origin: { x: 0, y: 0, z: 2 },
      normal: Z,
    })
    expect(brepVolume(sphere.front!)).toBeCloseTo(113.09733552923255, 9)
    expect(centroid(sphere.front!).z).toBeCloseTo(3.0625, 9)
    expect(brepVolume(sphere.back!)).toBeCloseTo(410.50144006906623, 9)
    const cone = brepSliced(
      roundBrep({ x: 60, y: 0, z: 0 }, Z, X, 5, 5, 10, 0),
      { origin: { x: 0, y: 0, z: 0 }, normal: Y }
    )
    expect(brepVolume(cone.front!)).toBeCloseTo(130.8996938995747, 9)
    expect(centroid(cone.front!).y).toBeCloseTo(1.5915494309189566, 9)
    expect(brepVolume(cone.back!)).toBeCloseTo(130.8996938995747, 9)
  })

  it("keeps one solid of two lumps where a side holds two (s11)", () => {
    const u = [box(0, 0, 10, 10, 10, 10), box(20, 0, 10, 10, 10, 10)].reduce(
      (s, b) => brepBoolean("union", s, b)!,
      box(0, 0, 0, 30, 10, 10)
    )
    const { front, back } = brepSliced(u, {
      origin: { x: 0, y: 0, z: 15 },
      normal: Z,
    })
    expect(brepVolume(front!)).toBeCloseTo(1000, 9)
    expect(shellCount(front!)).toBe(2)
    expect(counts(front!)).toEqual({ v: 16, e: 24, f: 12 })
    expect(brepVolume(back!)).toBeCloseTo(4000, 9)
    expect(counts(back!)).toEqual({ v: 16, e: 24, f: 10 })
  })
})

describe("a solid's section by a plane", () => {
  it("is the region the cut leaves on the plane (section/c01, c03, c05)", () => {
    const square = brepSection(box(0, 0, 0, 10, 10, 10), {
      origin: { x: 0, y: 0, z: 5 },
      normal: Z,
    })!
    expect(square.elevation).toBeCloseTo(5, 12)
    expect(square.normal).toEqual(Z)
    expect(square.faces).toHaveLength(1)
    expect(facesArea(square.faces)).toBeCloseTo(100, 9)
    const cylinder = roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1)
    expect(
      facesArea(
        brepSection(cylinder, { origin: { x: 0, y: 0, z: 0 }, normal: Y })!
          .faces
      )
    ).toBeCloseTo(100, 9)
    const ellipse = brepSection(
      cylinder,
      through(
        { x: 0, y: -10, z: 3 },
        { x: 0, y: 10, z: 3 },
        { x: 10, y: 0, z: 7 }
      )
    )!
    expect(facesArea(ellipse.faces)).toBeCloseTo(84.58997098232028, 9)
    expect(closedLoops(ellipse)).toBe(true)
    const drilled = brepBoolean(
      "subtract",
      box(0, 0, 0, 10, 10, 10),
      roundBrep({ x: 5, y: 5, z: -1 }, Z, X, 2, 2, 12, 1)
    )!
    const ring = brepSection(drilled, {
      origin: { x: 0, y: 0, z: 5 },
      normal: Z,
    })!
    expect(ring.faces[0].loops).toHaveLength(2)
    expect(facesArea(ring.faces)).toBeCloseTo(87.43362938564083, 9)
  })

  it("is a face the plane holds, either way it faces (c06)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    for (const z of [10, 0]) {
      const face = brepSection(b, { origin: { x: 0, y: 0, z }, normal: Z })!
      expect(facesArea(face.faces)).toBeCloseTo(100, 9)
      expect(face.elevation).toBeCloseTo(z, 12)
    }
  })

  it("cuts a corner off askew, and misses or grazes as nothing (c04, c06)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    const corner = brepSection(b, {
      origin: { x: 0, y: 0, z: 4 },
      normal: normalize3({ x: 1, y: 1, z: 1 })!,
    })!
    expect(facesArea(corner.faces)).toBeCloseTo(13.856406460551026, 9)
    expect(
      brepSection(b, { origin: { x: 0, y: 0, z: 20 }, normal: Z })
    ).toBeNull()
    expect(
      brepSection(
        b,
        through(
          { x: 10, y: 0, z: 0 },
          { x: 10, y: 0, z: 10 },
          { x: 20, y: 10, z: 0 }
        )
      )
    ).toBeNull()
    const sphere = brepSection(sphereBrep({ x: 0, y: 0, z: 0 }, Z, X, 5), {
      origin: { x: 0, y: 0, z: 2 },
      normal: Z,
    })!
    expect(facesArea(sphere.faces)).toBeCloseTo(21 * Math.PI, 9)
  })
})

describe("a face pulled, pressed and offset", () => {
  it("offsets and extrudes a box's top alike (solidedit/e01)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    const top = faceAt(b, Z, 10)
    const offset = brepFaceOffset(b, top, 2)
    expect(brepVolume(offset)).toBeCloseTo(1200, 9)
    expect(counts(offset)).toEqual({ v: 8, e: 12, f: 6 })
    expect(brepVolume(brepFaceExtruded(b, top, 2)!)).toBeCloseTo(1200, 9)
    expect(brepVolume(brepFaceOffset(b, top, -3))).toBeCloseTo(700, 9)
  })

  it("carries a sloping side on, or rises square beside it (e02)", () => {
    const sloped = brepSliced(
      box(0, 0, 0, 10, 10, 10),
      through(
        { x: 10, y: 0, z: 10 },
        { x: 10, y: 10, z: 10 },
        { x: 5, y: 0, z: 0 }
      )
    )
    const b = [sloped.front!, sloped.back!].find((s) => centroid(s).x < 5)!
    expect(brepVolume(b)).toBeCloseTo(750, 9)
    const top = faceAt(b, Z, 10)
    const offset = brepFaceOffset(b, top, 2)
    expect(brepVolume(offset)).toBeCloseTo(960, 9)
    expect(counts(offset).f).toBe(6)
    expect(centroid(offset).x).toBeCloseTo(4.1875, 9)
    const extruded = brepFaceExtruded(b, top, 2)!
    expect(brepVolume(extruded)).toBeCloseTo(950, 9)
    expect(counts(extruded).f).toBe(7)
  })

  it("grows a cylinder square to the face, and keeps a hole through it (e03)", () => {
    const cylinder = roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1)
    expect(
      brepVolume(brepFaceOffset(cylinder, faceAt(cylinder, Z, 10), 3))
    ).toBeCloseTo(1021.017612416683, 9)
    const drilled = brepBoolean(
      "subtract",
      box(40, 0, 0, 10, 10, 10),
      roundBrep({ x: 45, y: 5, z: -1 }, Z, X, 2, 2, 12, 1)
    )!
    const pressed = brepFaceOffset(drilled, faceAt(drilled, Z, 10), -3)
    expect(brepVolume(pressed)).toBeCloseTo(612.035405699482, 9)
    expect(brepIsClosed(pressed)).toBe(true)
  })

  it("refuses a face pushed through the solid", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    expect(() => brepFaceOffset(b, faceAt(b, Z, 10), -12)).toThrow(
      SolidBooleanError
    )
  })

  it("slides a frustum's top down its cone (e03), not past its foot", () => {
    const frustum = roundBrep({ x: 20, y: 0, z: 0 }, Z, X, 5, 5, 10, 0.4)
    const top = faceAt(frustum, Z, 10)
    const pressed = brepFaceOffset(frustum, top, -4)
    expect(brepVolume(pressed)).toBeCloseTo(321.9504, 4)
    expect(brepIsClosed(pressed)).toBe(true)
    expect(() => brepFaceOffset(frustum, top, -11)).toThrow(SolidBooleanError)
  })
})

describe("any solid cut by any plane", () => {
  it("halves add up to it, each closed and Euler's, its section closed", () => {
    let made = 0
    fc.assert(
      fc.property(solidCut, ({ brep, origin, normal, kind }) => {
        let halves
        let section
        try {
          halves = brepSliced(brep, { origin, normal })
          section = brepSection(brep, { origin, normal })
        } catch (e) {
          if (!(e instanceof SolidBooleanError)) throw e
          return
        }
        made++
        const { front, back } = halves
        let sum = 0
        for (const half of [front, back]) {
          if (!half) continue
          expect(brepIsClosed(half), kind).toBe(true)
          expect(eulerHolds(half), kind).toBe(true)
          sum += brepVolume(half)
        }
        const whole = brepVolume(brep)
        expect((sum - whole) / whole, kind).toBeCloseTo(0, 6)
        if (front && back) {
          expect(section, kind).not.toBeNull()
          expect(facesArea(section!.faces), kind).toBeGreaterThan(0)
          expect(closedLoops(section!), kind).toBe(true)
        }
      }),
      { numRuns: 10 }
    )
    expect(made).toBeGreaterThan(5)
  }, 120_000)
})

describe("any box's face offset", () => {
  it("changes its volume by the face's area times the distance", () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.double({ min: 1, max: 20, noNaN: true }),
          fc.double({ min: 1, max: 20, noNaN: true }),
          fc.double({ min: 1, max: 20, noNaN: true })
        ),
        fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
        fc.integer({ min: 0, max: 5 }),
        fc.double({ min: -0.9, max: 2, noNaN: true }),
        ([a, b, c], turn, face, share) => {
          const u = { x: a * Math.cos(turn), y: a * Math.sin(turn), z: 0 }
          const v = { x: -b * Math.sin(turn), y: b * Math.cos(turn), z: 0 }
          const solid = boxBrep({ x: 3, y: -2, z: 1 }, u, v, {
            x: 0,
            y: 0,
            z: c,
          })
          const n = solid.faces[face].surface
          if (n.kind !== "plane") return
          // How far the face lies from the one across.
          const depth = face < 2 ? c : face === 2 || face === 4 ? b : a
          const area = (a * b * c) / depth
          // A prism thinner than a twentieth of the solid is a sliver no
          // boolean sorts (solidBooleans.test.ts).
          if (Math.abs(share) < 0.05) return
          const d = share * depth
          const moved = brepFaceOffset(solid, face, d)
          expect(brepIsClosed(moved)).toBe(true)
          expect(brepVolume(moved)).toBeCloseTo(a * b * c + area * d, 6)
          const extruded = brepFaceExtruded(solid, face, d)!
          expect(brepVolume(extruded)).toBeCloseTo(a * b * c + area * d, 6)
        }
      ),
      { numRuns: 40 }
    )
  })
})

describe("SOLIDEDIT's faces", () => {
  it("lays a face in a turned plane, its neighbours carried on (solidedit/e07, e08)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    const a = (10 * Math.PI) / 180
    const turned = { x: 0, y: -Math.sin(a), z: Math.cos(a) }
    const rotated = brepFacePlaneSet(b, faceAt(b, Z, 10), {
      normal: turned,
      level: 10 * turned.z,
    })
    expect(brepVolume(rotated)).toBeCloseTo(1088.1634903542329, 9)
    const tapered = { x: 0, y: -Math.cos(a), z: Math.sin(a) }
    const front = faceAt(b, { x: 0, y: -1, z: 0 }, 0)
    expect(
      brepVolume(brepFacePlaneSet(b, front, { normal: tapered, level: 0 }))
    ).toBeCloseTo(911.8365096457675, 9)
    // A plane the corner cannot reach: the top laid past the bottom.
    expect(() =>
      brepFacePlaneSet(b, faceAt(b, Z, 10), { normal: Z, level: -1 })
    ).toThrow(SolidBooleanError)
  })

  it("extrudes a face tapered, the prism narrowing as it rises (e08)", () => {
    const b = box(0, 0, 0, 10, 10, 10)
    const taper = (20 * Math.PI) / 180
    const out = brepFacesExtruded(b, [faceAt(b, Z, 10)], 3, taper)!
    const top = 10 - 2 * 3 * Math.tan(taper)
    const frustum = (3 / 3) * (100 + top * top + 10 * top)
    expect(brepVolume(out)).toBeCloseTo(1000 + frustum, 9)
  })

  it("deletes a hole's wall, a fillet or a chamfer, and refuses a box's side (e09)", () => {
    const drilled = brepBoolean(
      "subtract",
      box(0, 0, 0, 20, 10, 10),
      roundBrep({ x: 5, y: 5, z: -1 }, Z, X, 2, 2, 12, 1)
    )!
    const wall = drilled.faces.findIndex((f) => f.surface.kind === "cylinder")
    const whole = brepFaceDeleted(drilled, wall)
    expect(brepVolume(whole)).toBeCloseTo(2000, 9)
    expect(counts(whole)).toEqual({ v: 8, e: 12, f: 6 })

    const b = box(30, 0, 0, 10, 10, 10)
    const edge = b.edges.findIndex(
      (e) =>
        b.vertices[e.start].y === 0 &&
        b.vertices[e.end].y === 0 &&
        b.vertices[e.start].z === 10 &&
        b.vertices[e.end].z === 10
    )
    const rounded = brepEdgesBlended(b, [edge], { kind: "fillet", radius: 1 })
    const back = brepFaceDeleted(rounded, 0)
    expect(brepVolume(back)).toBeCloseTo(1000, 9)
    expect(counts(back)).toEqual({ v: 8, e: 12, f: 6 })
    const bevel = brepEdgesBlended(b, [edge], {
      kind: "chamfer",
      base: faceAt(b, Z, 10),
      distance1: 1,
      distance2: 2,
    })
    expect(brepVolume(brepFaceDeleted(bevel, 0))).toBeCloseTo(1000, 9)
    expect(() => brepFaceDeleted(b, faceAt(b, Z, 10))).toThrow(
      SolidBooleanError
    )
  })
})
