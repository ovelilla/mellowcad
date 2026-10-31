import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { Vec3, add3, cross3, dot3, length3, scale3 } from "./Vec3"
import { arbitraryAxis } from "./ocs"
import {
  Brep,
  boxBrep,
  brepArea,
  brepIsClosed,
  brepMapped,
  brepVolume,
  coedgeStart,
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

/** V − E + F − (L − F): 2 for one shell of genus 0, holes in faces counted. */
function euler(brep: Brep): number {
  const loops = brep.faces.reduce((n, f) => n + f.loops.length, 0)
  const faces = brep.faces.length
  return brep.vertices.length - brep.edges.length + faces - (loops - faces)
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

/** Every vertex of a face on its plane's outer side's boundary, its loop turning about the normal. */
function loopsTurnOutward(brep: Brep): boolean {
  return brep.faces.every((face) =>
    face.loops.every((loop) => {
      const points = loop.map((c) => brep.vertices[coedgeStart(brep, c)])
      let n: Vec3 = { x: 0, y: 0, z: 0 }
      points.forEach((p, i) => {
        n = add3(n, cross3(p, points[(i + 1) % points.length]))
      })
      return dot3(n, face.surface.normal) > 0
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
            reflects
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
    expect(brep.faces.map((f) => f.surface.normal)).toEqual([
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
