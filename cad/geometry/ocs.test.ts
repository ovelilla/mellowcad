import fc from "fast-check"
import { describe, expect, it } from "vitest"
import { arbitraryAxis, axesToWorld, worldToAxes } from "./ocs"
import { Vec3, cross3, dot3, length3 } from "./Vec3"

const component = fc.double({ min: -1, max: 1, noNaN: true })
const normal = fc
  .tuple(component, component, component)
  .map(([x, y, z]): Vec3 => ({ x, y, z }))
  .filter((v) => length3(v) > 1e-3)
const coordinate = fc.double({ min: -1e4, max: 1e4, noNaN: true })
const point = fc
  .tuple(coordinate, coordinate, coordinate)
  .map(([x, y, z]): Vec3 => ({ x, y, z }))

function expectClose3(actual: Vec3, expected: Vec3, digits = 9): void {
  expect(actual.x).toBeCloseTo(expected.x, digits)
  expect(actual.y).toBeCloseTo(expected.y, digits)
  expect(actual.z).toBeCloseTo(expected.z, digits)
}

describe("arbitraryAxis", () => {
  it("keeps the world axes for a normal on +Z", () => {
    const axes = arbitraryAxis({ x: 0, y: 0, z: 1 })!
    expect(axes.x).toEqual({ x: 1, y: 0, z: 0 })
    expect(axes.y).toEqual({ x: 0, y: 1, z: 0 })
    expect(axes.z).toEqual({ x: 0, y: 0, z: 1 })
  })

  it("turns X round for a normal on -Z, as DXF does", () => {
    const axes = arbitraryAxis({ x: 0, y: 0, z: -1 })!
    expectClose3(axes.x, { x: -1, y: 0, z: 0 })
    expectClose3(axes.y, { x: 0, y: 1, z: 0 })
  })

  it("crosses the world Z with a normal outside the polar cap", () => {
    const axes = arbitraryAxis({ x: 0, y: -1, z: 0 })!
    expectClose3(axes.x, { x: 1, y: 0, z: 0 })
    expectClose3(axes.y, { x: 0, y: 0, z: 1 })
  })

  it("gives right-handed unit axes whose Z is the normal", () => {
    fc.assert(
      fc.property(normal, (n) => {
        const axes = arbitraryAxis(n)!
        const unit = 1 / length3(n)
        expectClose3(axes.z, { x: n.x * unit, y: n.y * unit, z: n.z * unit })
        expect(length3(axes.x)).toBeCloseTo(1, 12)
        expect(length3(axes.y)).toBeCloseTo(1, 12)
        expect(dot3(axes.x, axes.y)).toBeCloseTo(0, 12)
        expect(dot3(axes.x, axes.z)).toBeCloseTo(0, 12)
        expectClose3(cross3(axes.x, axes.y), axes.z, 12)
      })
    )
  })

  it("refuses a zero normal", () => {
    expect(arbitraryAxis({ x: 0, y: 0, z: 0 })).toBeNull()
  })
})

describe("axesToWorld / worldToAxes", () => {
  it("are inverses", () => {
    fc.assert(
      fc.property(normal, point, (n, p) => {
        const axes = arbitraryAxis(n)!
        expectClose3(axesToWorld(axes, worldToAxes(axes, p)), p, 6)
      })
    )
  })

  it("read a 2D point on the axes' XY plane", () => {
    const axes = arbitraryAxis({ x: 0, y: -1, z: 0 })!
    expectClose3(axesToWorld(axes, { x: 2, y: 3 }), { x: 2, y: 0, z: 3 })
  })
})
