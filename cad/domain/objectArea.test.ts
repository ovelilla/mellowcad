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

  // probe ellipse/p328: AREA Object, `Area = 3926.9908, Perimeter =
  // 242.2112` for the ellipse 50 by 25, `Area = 219.4099, Length = 56.0148`
  // for its arc from 10° to 100°, the segment its chord closes.
  it("measures an ellipse as AREA's Object does", () => {
    expect(objectArea(ellipseOf(p(0, 0), p(50, 0), 0.5))).toEqual({
      area: expect.closeTo(3926.9908, 4),
      around: expect.closeTo(242.2112, 4),
      measured: "perimeter",
    })
    const arc = ellipseOf(p(0, 0), p(50, 0), 0.5, {
      startParam: 0.33903719097228474,
      endParam: 1.6587324508186057,
    })
    expect(objectArea(arc)).toEqual({
      area: expect.closeTo(219.4099, 4),
      around: expect.closeTo(56.0148, 4),
      measured: "length",
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
