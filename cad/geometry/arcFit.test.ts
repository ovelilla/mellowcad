import { describe, expect, it } from "vitest"
import { arcFit, biarc, fitTangents } from "./arcFit"
import { splineFitCurve, splineFitPoints } from "./splineFit"
import { vec2 } from "./Vec2"

// PEDIT's Fit and Spline as AutoCAD 2027 lays them (probes pedit/p147–p190):
// angles in degrees, MPDUMP's to the ninth decimal.

const deg = (radians: number) => (radians * 180) / Math.PI
const rad = (degrees: number) => (degrees * Math.PI) / 180
const pts = (...xy: [number, number][]) => xy.map(([x, y]) => vec2(x, y))

describe("fitTangents", () => {
  it("weighs each chord by the turn on its far side (p184)", () => {
    const tangents = fitTangents(
      pts([0, 0], [10, 0], [20, 5], [30, 5], [40, 20], [50, 0]),
      false
    ).map(deg)
    expect(tangents[0]).toBeCloseTo(-12.528807709, 9)
    expect(tangents[1]).toBeCloseTo(17.781820576, 9)
    expect(tangents[2]).toBeCloseTo(16.650295419, 9)
    expect(tangents[3]).toBeCloseTo(11.596472831, 9)
    expect(tangents[4]).toBeCloseTo(15.18959842, 9)
    expect(tangents[5]).toBeCloseTo(-133.781124765, 9)
  })

  it("keeps a straight run's direction, and a tangent given (p149, p59)", () => {
    const run = fitTangents(
      pts([0, 0], [10, 0], [20, 0], [25, 5], [30, 0]),
      false
    ).map(deg)
    expect(run[2]).toBeCloseTo(0, 9)
    expect(run[3]).toBeCloseTo(9.735610317, 9)
    const given = fitTangents(pts([0, 0], [10, 10], [20, 0]), false, [
      null,
      rad(5),
      null,
    ])
    expect(deg(given[1])).toBeCloseTo(5, 12)
  })
})

describe("biarc", () => {
  const along = (a: number, b: number) =>
    biarc(vec2(0, 0), vec2(10, 0), rad(a), rad(b))

  it("meets at the incentre where the tangents lie either side (p185)", () => {
    const arc = along(20, -10)!
    expect(arc.joint.x).toBeCloseTo(3.316280343, 9)
    expect(arc.joint.y).toBeCloseTo(0.5847497, 7)
    expect(arc.bulges[1]).toBeCloseTo(-0.043660942909, 9)
  })

  it("splits an S by r₁ sin α = r₂ sin β (p185)", () => {
    const arc = along(20, 10)!
    expect(arc.joint.x).toBeCloseTo(4.159165725, 9)
    expect(arc.joint.y).toBeCloseTo(0.212142453, 9)
    expect(arc.bulges[1]).toBeCloseTo(0.105811024399, 9)
    expect(along(60, 60)!.joint.x).toBeCloseTo(5, 12)
  })

  it("stays straight with a tangent along the chord (p186)", () => {
    expect(along(0, 30)).toBeNull()
    expect(along(30, 0)).toBeNull()
    expect(along(180, 30)).toBeNull()
  })

  it("fits each segment, none on a straight run (p149)", () => {
    const arcs = arcFit(pts([0, 0], [10, 0], [20, 0], [25, 5], [30, 0]), false)
    expect(arcs.slice(0, 2)).toEqual([null, null])
    expect(arcs[2]!.bulges[0]).toBeCloseTo(0.388303902176, 9)
  })
})

describe("the Spline's B-spline", () => {
  const frame = [0, 10, 20, 30].map((x, i) => ({
    x,
    y: i % 2 ? 10 : 0,
    z: 0,
  }))

  it("is clamped with knots 1 apart, a loop cut where its curve starts (p57, p189)", () => {
    expect(splineFitCurve(frame, false, 3).knots).toEqual([
      0, 0, 0, 0, 1, 1, 1, 1,
    ])
    const loop = splineFitCurve(frame, true, 2)
    expect(loop.knots).toEqual([0, 0, 0, 1, 2, 3, 4, 4, 4])
    expect(loop.controlPoints.map((v) => [v.x, v.y])).toEqual([
      [5, 5],
      [10, 10],
      [20, 0],
      [30, 10],
      [0, 0],
      [5, 5],
    ])
  })

  it("leaves a frame of two unfitted (p190)", () => {
    expect(splineFitPoints(frame.slice(0, 2), false, 3, 8)).toEqual([])
  })
})
