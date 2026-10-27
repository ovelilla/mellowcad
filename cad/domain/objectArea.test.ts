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
import { createSpline } from "./splines"

// The figures AutoCAD 2027's console reports for the same objects (probes
// inquiry/p215, p221, p223, and those named at a test).
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

  // probe hatch/p320: a hatch over 0,0–100,50 with a circle r 10 at 50,25 as
  // island, AREA Object → `Area = 4685.8407, Perimeter = 362.8319`: the island
  // left out, its perimeter added.
  it("leaves an island out of a hatch's area (hatch/p320)", () => {
    const hatch = hatchOf([
      loopOf(p(0, 0), p(100, 50)),
      { vertices: [p(60, 25), p(40, 25)], bulges: [1, 1] },
    ])
    expect(objectArea(hatch)).toEqual({
      area: expect.closeTo(4685.8407, 4),
      around: expect.closeTo(362.8319, 4),
      measured: "perimeter",
    })
  })

  // probe spline/p327: AREA Object, `Area = 610.00000000, Perimeter =
  // 87.61720462` for the closed fit spline through the square 0,0 20,0 20,20
  // 0,20, `Area = 85.84165405, Length = 44.39570038` for the open CV spline
  // 0,-5 5,10 20,-10 40,5, whose two loops with its chord are added. Its
  // length is the curve's, 44.39441982: AutoCAD's measure runs long (p332).
  it("measures a spline as AREA's Object does", () => {
    const square = createSpline(
      "fit",
      [p(0, 0), p(20, 0), p(20, 20), p(0, 20)],
      { closed: true }
    )
    expect(objectArea(square)).toEqual({
      area: expect.closeTo(610, 8),
      around: expect.closeTo(87.6172046, 7),
      measured: "perimeter",
    })
    const lobes = createSpline("cv", [p(0, -5), p(5, 10), p(20, -10), p(40, 5)])
    expect(objectArea(lobes)).toEqual({
      area: expect.closeTo(85.84165405, 8),
      around: expect.closeTo(44.39441982, 8),
      measured: "length",
    })
  })

  // probe spline/p317: `Area = 39.7222, Perimeter = 42.5520`, the closed CV
  // bowtie's two loops added where their signed sum is nothing.
  it("adds the loops of a spline that crosses itself", () => {
    const bowtie = createSpline(
      "cv",
      [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
      { closed: true }
    )
    expect(objectArea(bowtie)).toEqual({
      area: expect.closeTo(39.7222, 4),
      around: expect.closeTo(42.552, 4),
      measured: "perimeter",
    })
  })

  it("finds no area in an arc", () => {
    expect(objectArea(arcOf(p(5, 0), 5, 0, Math.PI))).toBeNull()
  })
})
