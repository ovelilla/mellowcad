import { describe, expect, it } from "vitest"
import {
  arcOf,
  circleOf,
  ellipseOf,
  hatchOf,
  loopOf,
  p,
  polylineOf,
  rectOf,
} from "../../test/builders"
import { objectArea } from "./objectArea"

// The figures AutoCAD 2023's console reports for the same objects.
describe("objectArea", () => {
  it("measures a circle's circumference", () => {
    expect(objectArea(circleOf(p(0, 0), 5))).toEqual({
      area: expect.closeTo(78.5398, 4),
      around: expect.closeTo(31.4159, 4),
      measured: "circumference",
    })
  })

  it("measures an ellipse, and an elliptical arc closed by its chord", () => {
    expect(objectArea(ellipseOf(p(5, 0), p(5, 0), 0.6))).toEqual({
      area: expect.closeTo(47.1239, 4),
      around: expect.closeTo(25.527, 4),
      measured: "perimeter",
    })
    const quarter = ellipseOf(p(5, 0), p(5, 0), 0.6, {
      startParam: 0,
      endParam: Math.PI / 2,
    })
    expect(objectArea(quarter)).toEqual({
      area: expect.closeTo(4.281, 4),
      around: expect.closeTo(6.3817, 4),
      measured: "length",
    })
  })

  it("closes an open polyline and reports its length", () => {
    expect(objectArea(polylineOf([p(0, 0), p(10, 0), p(10, 10)]))).toEqual({
      area: 50,
      around: 20,
      measured: "length",
    })
    expect(objectArea(rectOf(p(0, 0), p(10, 10)))?.measured).toBe("perimeter")
  })

  it("leaves an island out of a hatch's area", () => {
    const hatch = hatchOf([
      loopOf(p(0, 0), p(10, 10)),
      loopOf(p(2, 2), p(4, 4)),
    ])
    expect(objectArea(hatch)).toEqual({
      area: 96,
      around: 48,
      measured: "perimeter",
    })
  })

  it("finds no area in an arc", () => {
    expect(objectArea(arcOf(p(5, 0), 5, 0, Math.PI))).toBeNull()
  })
})
