import { describe, expect, it } from "vitest"

import { Vec3, add3, dot3, sub3 } from "./Vec3"
import { boxBrep, brepVolume, Brep } from "./solids"
import { brepSubobjectsMapped } from "./subobjectEdits"
import { SolidBooleanError } from "./solidBooleans"
import { eulerHolds } from "../../test/breps"

/** The console's 10 box at the origin (solid-edits/p241–p264). */
const box = () =>
  boxBrep(
    { x: 0, y: 0, z: 0 },
    { x: 10, y: 0, z: 0 },
    { x: 0, y: 10, z: 0 },
    { x: 0, y: 0, z: 10 }
  )

const moveBy = (d: Vec3) => (p: Vec3) => add3(p, d)

/** The index of the B-rep's planar face whose plane holds `point`. */
function faceAt(brep: Brep, point: Vec3): number {
  return brep.faces.findIndex(
    (f) =>
      f.surface.kind === "plane" &&
      Math.abs(dot3(sub3(point, f.surface.origin), f.surface.normal)) < 1e-9
  )
}

/** The index of the edge whose middle is `point`. */
function edgeAt(brep: Brep, point: Vec3): number {
  return brep.edges.findIndex((e) => {
    const a = brep.vertices[e.start]
    const b = brep.vertices[e.end]
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 }
    return (
      Math.abs(m.x - point.x) +
        Math.abs(m.y - point.y) +
        Math.abs(m.z - point.z) <
      1e-9
    )
  })
}

describe("subobjects moved, turned and scaled", () => {
  it("raises a face, its sides following (solid-edits/p244)", () => {
    const b = box()
    const top = faceAt(b, { x: 5, y: 5, z: 10 })
    const moved = brepSubobjectsMapped(
      b,
      [{ kind: "face", index: top }],
      moveBy({ x: 0, y: 0, z: 5 })
    )
    expect(brepVolume(moved)).toBeCloseTo(1500, 9)
    expect(eulerHolds(moved)).toBe(true)
  })

  it("moves an edge, the two faces on it tilting (p245, p262)", () => {
    const b = box()
    const front = brepSubobjectsMapped(
      b,
      [{ kind: "edge", index: edgeAt(b, { x: 5, y: 0, z: 10 }) }],
      moveBy({ x: 0, y: -2, z: 0 })
    )
    expect(brepVolume(front)).toBeCloseTo(1100, 9)
    expect(front.faces).toHaveLength(6)
    const tilted = front.faces.find(
      (f) =>
        f.surface.kind === "plane" &&
        f.surface.normal.z < -0.1 &&
        f.surface.normal.z > -0.9
    )
    expect(tilted?.surface).toMatchObject({
      normal: {
        x: 0,
        y: expect.closeTo(-0.9806, 4),
        z: expect.closeTo(-0.1961, 4),
      },
    })
    const back = brepSubobjectsMapped(
      b,
      [{ kind: "edge", index: edgeAt(b, { x: 5, y: 10, z: 0 }) }],
      moveBy({ x: 0, y: 2, z: 0 })
    )
    expect(brepVolume(back)).toBeCloseTo(1100, 9)
  })

  it("scales a face, its sides sloping (p261)", () => {
    const b = box()
    const top = faceAt(b, { x: 5, y: 5, z: 10 })
    const scaled = brepSubobjectsMapped(
      b,
      [{ kind: "face", index: top }],
      (p) => ({
        x: 5 + (p.x - 5) * 2,
        y: 5 + (p.y - 5) * 2,
        z: 10 + (p.z - 10) * 2,
      })
    )
    expect(brepVolume(scaled)).toBeCloseTo(7000 / 3, 9)
  })

  it("refuses what AutoCAD splits into triangles (p246, p249)", () => {
    const b = box()
    const corner = b.vertices.findIndex(
      (v) => v.x === 10 && v.y === 0 && v.z === 10
    )
    const turnTop = (p: Vec3) => {
      const a = (10 * Math.PI) / 180
      const dx = p.x - 5
      const dy = p.y - 5
      return {
        x: 5 + dx * Math.cos(a) - dy * Math.sin(a),
        y: 5 + dx * Math.sin(a) + dy * Math.cos(a),
        z: p.z,
      }
    }
    expect(() =>
      brepSubobjectsMapped(
        b,
        [{ kind: "vertex", index: corner }],
        moveBy({ x: 0, y: 0, z: 2 })
      )
    ).toThrow(SolidBooleanError)
    expect(() =>
      brepSubobjectsMapped(
        b,
        [{ kind: "face", index: faceAt(b, { x: 5, y: 5, z: 10 }) }],
        turnTop
      )
    ).toThrow(SolidBooleanError)
  })
})
