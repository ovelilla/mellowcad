import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { solidEntity } from "../../test/arbitraries"
import { brepIsClosed } from "../geometry/solids"
import { primitiveBrep } from "./solids"

import type { Vec3 } from "../geometry/Vec3"
import type { SolidPrimitive } from "./entityTypes"
import {
  GripView,
  solidGripDragged,
  solidGripReading,
  solidGripSized,
  solidGrips,
} from "./solidGrips"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const at = (x: number, y: number, z: number): Vec3 => ({ x, y, z })
const s3 = 1 / Math.sqrt(3)

/** SW Isometric, as -VIEW _SWISO looks, a view unit of 0.01: g01's MPGRIPDATA. */
const SWISO: GripView = { direction: at(-s3, -s3, s3), pixel: 0.01 }
const PLAN: GripView = { direction: Z, pixel: 0.01 }

const box: SolidPrimitive = {
  kind: "box",
  position: at(5, 10, 0),
  xAxis: X,
  normal: Z,
  length: 10,
  width: 20,
  height: 5,
}

function drag(p: SolidPrimitive, index: number, offset: Vec3) {
  const grip = solidGrips(p, SWISO)[index]
  return solidGripDragged(p, grip, offset, SWISO)
}

function expectPoint(actual: Vec3, expected: Vec3) {
  expect(actual.x).toBeCloseTo(expected.x, 4)
  expect(actual.y).toBeCloseTo(expected.y, 4)
  expect(actual.z).toBeCloseTo(expected.z, 4)
}

describe("a primitive's grips, as AutoCAD 2027's desktop lays them (solid/g01)", () => {
  it("a box's: the base's centre, corners and edges, the top's and the base's heights", () => {
    const points = solidGrips(box, SWISO).map((g) => [g.at.x, g.at.y, g.at.z])
    expect(points).toEqual([
      [5, 10, 0],
      [0, 0, 0],
      [10, 0, 0],
      [10, 20, 0],
      [0, 20, 0],
      [0, 10, 0],
      [10, 10, 0],
      [5, 0, 0],
      [5, 20, 0],
      [5, 10, 5],
      [5, 10, -0.1],
    ])
    // In plan the view looks along the axis: no height arrows.
    expect(solidGrips(box, PLAN)).toHaveLength(9)
  })

  it("a wedge's top over its tall end", () => {
    const wedge = { ...box, kind: "wedge" as const, position: at(25, 10, 0) }
    expectPoint(solidGrips(wedge, SWISO)[9].at, at(20, 10, 5))
  })

  it("a pyramid's corners and sides from the corner before its X, the top's arrow off the apex", () => {
    const pyramid: SolidPrimitive = {
      kind: "pyramid",
      position: at(0, 0, 0),
      xAxis: at(Math.SQRT1_2, Math.SQRT1_2, 0),
      normal: Z,
      sides: 4,
      radius: 5,
      topRadius: 0,
      height: 8,
      inscribed: true,
    }
    const grips = solidGrips(pyramid, SWISO)
    expect(grips).toHaveLength(12)
    expectPoint(grips[1].at, at(5, 0, 0))
    expectPoint(grips[2].at, at(2.5, 2.5, 0))
    expectPoint(
      grips[9].at,
      at(-0.10606601717798214, -0.10606601717798214, 7.85)
    )
    expectPoint(grips[10].at, at(0, 0, 8))
    expectPoint(grips[11].at, at(0, 0, -0.1))
  })

  it("a torus' tube opposite its X, |R| out, a lemon's too", () => {
    const torus: SolidPrimitive = {
      kind: "torus",
      position: at(310, 0, 0),
      xAxis: X,
      normal: Z,
      radius: -4,
      tubeRadius: 5,
    }
    const points = solidGrips(torus, SWISO).map((g) => [g.at.x, g.at.y, g.at.z])
    expect(points).toEqual([
      [310, 0, 0],
      [301, 0, 0],
      [311, 0, 0],
      [306, 0, -5],
      [306, 0, 5],
      [306, 0, 0],
    ])
  })
})

describe("dragging a box's grips (g01)", () => {
  it("moves it whole from the base's centre, Z too", () => {
    expectPoint(drag(box, 0, at(3, 4, 0))!.position, at(8, 14, 0))
    expectPoint(drag(box, 0, at(0, 0, 3))!.position, at(5, 10, 3))
  })

  it("moves a corner in the base's plane, the opposite one kept", () => {
    for (const offset of [at(-2, -3, 0), at(-2, -3, 4)]) {
      const edited = drag(box, 1, offset) as typeof box
      expect([edited.length, edited.width]).toEqual([12, 23])
      expectPoint(edited.position, at(4, 8.5, 0))
    }
    const third = drag(box, 3, at(2, 3, 0)) as typeof box
    expect([third.length, third.width]).toEqual([12, 23])
    expectPoint(third.position, at(6, 11.5, 0))
    const second = drag(box, 2, at(2, 3, 0)) as typeof box
    expect([second.length, second.width]).toEqual([12, 17])
    for (const offset of [at(12, 0, 0), at(10, 0, 0), at(12, 25, 0)]) {
      expect(drag(box, 1, offset)).toBeNull()
    }
  })

  it("sizes along an edge's arrow by the drag along it, the opposite face kept", () => {
    for (const offset of [at(-2, 0, 0), at(-2, 7, 4)]) {
      const edited = drag(box, 5, offset) as typeof box
      expect(edited.length).toBe(12)
      expectPoint(edited.position, at(4, 10, 0))
    }
    expect((drag(box, 6, at(3, 0, 0)) as typeof box).length).toBe(13)
    expect((drag(box, 7, at(0, -4, 0)) as typeof box).width).toBe(24)
    expectPoint(drag(box, 8, at(0, 4, 0))!.position, at(5, 12, 0))
    expect(drag(box, 6, at(-15, 0, 0))).toBeNull()
    expect(drag(box, 6, at(-10, 0, 0))).toBeNull()
  })

  it("reads the height along the line of sight", () => {
    const height = (index: number, offset: Vec3) =>
      (drag(box, index, offset) as typeof box | null)?.height
    expect(height(9, at(0, 0, 3))).toBeCloseTo(8, 9)
    expect(height(9, at(2, 2, 3))).toBeCloseTo(10, 9)
    expect(height(9, at(2, 0, 0))).toBeCloseTo(6, 9)
    expect(height(9, at(1, 1, 0))).toBeCloseTo(6, 9)
    expect(height(9, at(-2, -2, 0))).toBeCloseTo(3, 9)
    expect(height(9, at(0, 0, -5))).toBeUndefined()
    const base = drag(box, 10, at(0, 0, -3)) as typeof box
    expect(base.height).toBeCloseTo(8, 9)
    expectPoint(base.position, at(5, 10, -3))
    expect(drag(box, 10, at(2, 2, 0))!.position.z).toBeCloseTo(2, 9)
  })

  it("keeps a turned box's axes, the drag read along them", () => {
    const turn = Math.PI / 6
    const turned = {
      ...box,
      position: at(
        5 * Math.cos(turn) - 10 * Math.sin(turn),
        5 * Math.sin(turn) + 10 * Math.cos(turn),
        0
      ),
      xAxis: at(Math.cos(turn), Math.sin(turn), 0),
    }
    const side = drag(turned, 6, at(3, 0, 0)) as typeof box
    expect(side.length.toFixed(4)).toBe("12.5981")
    expectPoint(side.position, at(0.4551, 11.8098, 0))
    const corner = drag(turned, 1, at(3, 0, 0)) as typeof box
    expect([corner.length.toFixed(4), corner.width.toFixed(4)]).toEqual([
      "7.4019",
      "21.5000",
    ])
    expectPoint(corner.position, at(0.8301, 11.1603, 0))
  })
})

describe("dragging the other primitives' grips (g01)", () => {
  const pyramid: SolidPrimitive = {
    kind: "pyramid",
    position: at(0, 0, 0),
    xAxis: at(Math.SQRT1_2, Math.SQRT1_2, 0),
    normal: Z,
    sides: 4,
    radius: 5,
    topRadius: 0,
    height: 8,
    inscribed: true,
  }
  const radius = (p: SolidPrimitive | null) =>
    p && "radius" in p ? p.radius : null
  const top = (p: SolidPrimitive | null) =>
    p && "topRadius" in p ? p.topRadius : null

  it("a pyramid's corners and sides along the line of sight, its top from the arrow's stand-off", () => {
    expect(radius(drag(pyramid, 1, at(2, 0, 0)))).toBeCloseTo(7, 9)
    expect(radius(drag(pyramid, 1, at(0, 2, 0)))).toBeCloseTo(4, 9)
    expect(radius(drag(pyramid, 1, at(2, 2, 0)))).toBeCloseTo(6, 9)
    expect(radius(drag(pyramid, 1, at(0, 0, 3)))).toBeCloseTo(6.5, 9)
    expect(radius(drag(pyramid, 2, at(2, 0, 0)))).toBeCloseTo(7, 9)
    expect(radius(drag(pyramid, 2, at(0, 3, 0)))).toBeCloseTo(8, 9)
    expect(radius(drag(pyramid, 2, at(0, 0, 3)))).toBeCloseTo(11, 9)
    expect(drag(pyramid, 2, at(-6, 0, 0))).toBeNull()
    expect(drag(pyramid, 9, at(2, 0, 0))).toBeNull()
    expect(top(drag(pyramid, 9, at(-2, 0, 0)))).toBeCloseTo(2.2121, 4)
    expect(top(drag(pyramid, 9, at(0, 0, -3)))).toBeCloseTo(6.2121, 4)
    expect(drag(pyramid, 0, at(0, 0, 2))!.position.z).toBe(2)
  })

  const cylinder: SolidPrimitive = {
    kind: "cylinder",
    position: at(0, 0, 0),
    xAxis: X,
    normal: Z,
    radius: 5,
    height: 10,
  }

  it("a cylinder's radius in the base's plane, its height along the line of sight", () => {
    expect(radius(drag(cylinder, 2, at(2, 0, 0)))).toBe(7)
    expect(radius(drag(cylinder, 2, at(0, 3, 0)))).toBe(5)
    expect(radius(drag(cylinder, 2, at(0, 0, 3)))).toBe(5)
    expect(
      (drag(cylinder, 5, at(0, 0, 3)) as typeof cylinder).height
    ).toBeCloseTo(13, 9)
    expect(
      (drag(cylinder, 5, at(2, 0, 0)) as typeof cylinder).height
    ).toBeCloseTo(11, 9)
    const base = drag(cylinder, 6, at(0, 0, -2)) as typeof cylinder
    expect(base.height).toBeCloseTo(12, 9)
    expect(base.position.z).toBeCloseTo(-2, 9)
  })

  it("a cone's top from its apex or its top circle", () => {
    const cone: SolidPrimitive = { ...cylinder, kind: "cone", topRadius: 0 }
    expect(drag(cone, 7, at(2, 0, 0))).toBeNull()
    expect(top(drag(cone, 7, at(-2, 0, 0)))).toBeCloseTo(2.15, 9)
    expect(top(drag(cone, 7, at(0, 0, -3)))).toBeCloseTo(1.65, 9)
    expect(top(drag(cone, 7, at(-2, 0, -3)))).toBeCloseTo(3.65, 9)
    expect(radius(drag(cone, 1, at(-2, 0, 0)))).toBe(7)
    const frustum: SolidPrimitive = { ...cone, topRadius: 2 }
    expect(top(drag(frustum, 7, at(-1, 0, 0)))).toBeCloseTo(3, 9)
    expect(drag(frustum, 7, at(3, 0, 0))).toBeNull()
    expect(top(drag(frustum, 7, at(0, 2, 0)))).toBeCloseTo(3, 9)
    expect(top(drag(frustum, 7, at(-3, 0, 0)))).toBeCloseTo(5, 9)
  })

  it("a sphere's and a torus' radii along the line of sight", () => {
    const sphere: SolidPrimitive = {
      kind: "sphere",
      position: at(0, 0, 0),
      xAxis: X,
      normal: Z,
      radius: 5,
    }
    expect(radius(drag(sphere, 1, at(2, 0, 0)))).toBeCloseTo(7, 9)
    expect(radius(drag(sphere, 1, at(0, 0, 3)))).toBeCloseTo(6.5, 9)
    expect(radius(drag(sphere, 3, at(0, 2, 0)))).toBeCloseTo(7, 9)
    expect(drag(sphere, 1, at(-6, 0, 0))).toBeNull()
    const torus: SolidPrimitive = {
      kind: "torus",
      position: at(0, 0, 0),
      xAxis: X,
      normal: Z,
      radius: 10,
      tubeRadius: 3,
    }
    const tube = (p: SolidPrimitive | null) =>
      p?.kind === "torus" ? p.tubeRadius : null
    expect(radius(drag(torus, 5, at(-2, 0, 0)))).toBeCloseTo(12, 9)
    expect(radius(drag(torus, 5, at(0, 0, 3)))).toBeCloseTo(8.5, 9)
    expect(tube(drag(torus, 1, at(-2, 0, 0)))).toBeCloseTo(5, 9)
    expect(tube(drag(torus, 2, at(2, 0, 0)))).toBeCloseTo(5, 9)
    expect(tube(drag(torus, 3, at(0, 0, -2)))).toBeCloseTo(5, 9)
    expect(tube(drag(torus, 4, at(0, 0, 2)))).toBeCloseTo(5, 9)
    expect(tube(drag(torus, 1, at(0, 0, 2)))).toBeCloseTo(2, 9)
    expect(drag(torus, 5, at(12, 0, 0))).toBeNull()
  })
})

describe("typing an arrow's value", () => {
  it("moves it by the first box, sets it by the second (the box's 2.6481 and 7.6481, g01)", () => {
    const grip = solidGrips(box, SWISO)[9]
    expect(solidGripReading(box, grip.role)).toBe(5)
    expect((solidGripSized(box, grip, 8, false) as typeof box).height).toBe(13)
    expect((solidGripSized(box, grip, 8, true) as typeof box).height).toBe(8)
    expect(solidGripSized(box, grip, -5, false)).toBeNull()
  })
})

describe("any primitive's grips", () => {
  const offset = fc
    .tuple(
      fc.double({ min: -50, max: 50, noNaN: true }),
      fc.double({ min: -50, max: 50, noNaN: true }),
      fc.double({ min: -50, max: 50, noNaN: true })
    )
    .map(([x, y, z]) => at(x, y, z))

  it("leave it as it was when put down where taken, and make a closed solid or none", () => {
    fc.assert(
      fc.property(solidEntity, offset, (solid, by) => {
        const p = solid.primitive!
        for (const grip of solidGrips(p, SWISO)) {
          expect(solidGripDragged(p, grip, at(0, 0, 0), SWISO)).toEqual(p)
          const dragged = solidGripDragged(p, grip, by, SWISO)
          if (dragged) expect(brepIsClosed(primitiveBrep(dragged))).toBe(true)
          const was = solidGripReading(p, grip.role)
          if (was !== null && was > 0) {
            expect(
              solidGripReading(solidGripSized(p, grip, was, true)!, grip.role)
            ).toBeCloseTo(was, 6)
          }
        }
      })
    )
  })
})
