import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { sweep } from "../../test/arbitraries"
import { Vec3, dot3, length3, scale3, sub3 } from "./Vec3"
import { domainSamples, turnIsolines } from "./faceDomains"
import { brepBoolean } from "./solidBooleans"

import { brepMoments, solidInertia } from "./massProperties"
import {
  Brep,
  boxBrep,
  brepArea,
  brepBox,
  brepIsClosed,
  brepIsolines,
  brepMapped,
  brepVolume,
  roundBrep,
} from "./solids"
import {
  PlanarProfile,
  extrusionBrep,
  revolutionBrep,
  revolveSide,
} from "./sweeps"
import { PlanarCurve } from "./planarCurves"
import { bsplineDomain, bsplinePoint } from "./nurbs"
import { createSpline, splineCurve } from "../domain/splines"

const WORLD = {
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: { x: 0, y: 0, z: 1 },
}

const line = (ax: number, ay: number, bx: number, by: number): PlanarCurve => ({
  kind: "line",
  start: { x: ax, y: ay },
  end: { x: bx, y: by },
})

const flat = (...loops: PlanarCurve[][]): PlanarProfile => ({
  axes: WORLD,
  elevation: 0,
  faces: [{ loops }],
})

describe("extrusionBrep", () => {
  it("extrudes a rectangle as x01's", () => {
    const brep = extrusionBrep(
      flat([
        line(0, 0, 10, 0),
        line(10, 0, 10, 20),
        line(10, 20, 0, 20),
        line(0, 20, 0, 0),
      ]),
      { x: 0, y: 0, z: 5 }
    )!
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(1000, 9)
    expect(brepArea(brep)).toBeCloseTo(700, 9)
  })

  it("tapers a circle into x01's frustum", () => {
    const brep = extrusionBrep(
      flat([
        {
          kind: "arc",
          center: { x: 50, y: 0 },
          radius: 5,
          startAngle: 0,
          sweep: 2 * Math.PI,
        },
      ]),
      { x: 0, y: 0, z: 8 },
      (10 * Math.PI) / 180
    )!
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(467.7253356124937, 8)
    expect(brepArea(brep)).toBeCloseTo(338.2200719501368, 8)
    const m = solidInertia(brepMoments(brep))
    expect(m.centroid.z).toBeCloseTo(3.5659612639882012, 9)
    expect(m.moments.x).toBeCloseTo(10624.955282968998, 5)
    expect(m.moments.y).toBeCloseTo(1179938.294314204, 3)
    expect(m.products.zx).toBeCloseTo(-83394.5214490017, 4)
    const box = brepBox(brep)!
    expect(box.max.x).toBeCloseTo(55, 9)
    expect(box.max.z).toBeCloseTo(8, 9)
  })
})

const Y = { x: 0, y: 1, z: 0 }
const O = { x: 0, y: 0, z: 0 }
const DEG = Math.PI / 180

function revolved(
  profile: PlanarProfile,
  start: number,
  angle: number,
  origin = O,
  axis = Y
) {
  const out = revolveSide(profile, origin, axis)
  if (typeof out === "string") throw new Error(out)
  return revolutionBrep(profile, origin, axis, out, start, angle)
}

const rectangle = (x0: number, y0: number, x1: number, y1: number) =>
  flat([
    line(x0, y0, x1, y0),
    line(x1, y0, x1, y1),
    line(x1, y1, x0, y1),
    line(x0, y1, x0, y0),
  ])

describe("extrusionBrep's curved sides", () => {
  it("extrudes an ellipse, an arc's polyline and a fit spline as x04's", () => {
    const ellipse = extrusionBrep(
      flat([
        {
          kind: "ellipse",
          center: { x: 5, y: 0 },
          majorAxis: { x: 5, y: 0 },
          ratio: 0.6,
          startParam: 0,
          sweep: 2 * Math.PI,
        },
      ]),
      { x: 0, y: 0, z: 5 }
    )!
    expect(brepIsClosed(ellipse)).toBe(true)
    const e = solidInertia(brepMoments(ellipse))
    expect(brepVolume(ellipse)).toBeCloseTo(235.61944901923448, 9)
    expect(e.moments.x).toBeCloseTo(2493.6391687868745, 7)
    expect(e.moments.y).toBeCloseTo(9326.603190344718, 7)
    expect(e.products.zx).toBeCloseTo(-2945.24311274043, 7)

    const arc = extrusionBrep(
      flat([
        line(100, 0, 110, 0),
        {
          kind: "arc",
          center: { x: 110, y: 5 },
          radius: 5,
          startAngle: -Math.PI / 2,
          sweep: Math.PI,
        },
        line(110, 10, 100, 10),
        line(100, 10, 100, 0),
      ]),
      { x: 0, y: 0, z: 3 }
    )!
    expect(brepIsClosed(arc)).toBe(true)
    const a = solidInertia(brepMoments(arc))
    expect(brepVolume(arc)).toBeCloseTo(417.8097245096172, 9)
    expect(a.centroid.x).toBeCloseTo(107.00820750051443, 9)
    expect(a.moments.y).toBeCloseTo(4792487.406518082, 5)
    expect(a.products.xy).toBeCloseTo(-223545.34848028948, 6)
    expect(brepBox(arc)!.max.x).toBeCloseTo(115, 9)

    const curve = splineCurve(
      createSpline(
        "fit",
        [
          { x: 50, y: 0 },
          { x: 60, y: 5 },
          { x: 55, y: 10 },
          { x: 45, y: 8 },
        ],
        { closed: true }
      )
    )
    const { start, end } = bsplineDomain(curve)
    const spline = extrusionBrep(
      flat([{ kind: "spline", curve, from: start, to: end }]),
      { x: 0, y: 0, z: 4 }
    )!
    expect(brepIsClosed(spline)).toBe(true)
    const sp = solidInertia(brepMoments(spline))
    expect(brepVolume(spline)).toBeCloseTo(515.858363810842, 9)
    expect(sp.centroid.y).toBeCloseTo(5.340118857897265, 9)
    expect(sp.moments.y).toBeCloseTo(1415375.0637928045, 5)
    expect(sp.products.zx).toBeCloseTo(-53849.117181313384, 6)
    expect(brepArea(spline)).toBeCloseTo(423.12950485970003, 7)
    expect(brepBox(spline)!.min.y).toBeCloseTo(-0.312750610339386, 7)
  })

  it("extrudes a region with a hole, its wall facing in (x08)", () => {
    const brep = extrusionBrep(
      flat(
        [
          line(50, 0, 60, 0),
          line(60, 0, 60, 10),
          line(60, 10, 50, 10),
          line(50, 10, 50, 0),
        ],
        [
          {
            kind: "arc",
            center: { x: 55, y: 5 },
            radius: 2,
            startAngle: 0,
            sweep: -2 * Math.PI,
          },
        ]
      ),
      { x: 0, y: 0, z: 4 }
    )!
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(349.7345, 4)
    const m = solidInertia(brepMoments(brep))
    expect(m.moments.x).toBeCloseTo(13891.6816, 3)
    expect(m.products.xy).toBeCloseTo(-96176.9923, 4)
  })

  it("extrudes a circle along a slanted direction (x02)", () => {
    const brep = extrusionBrep(
      flat([
        {
          kind: "arc",
          center: { x: 0, y: 0 },
          radius: 5,
          startAngle: 0,
          sweep: 2 * Math.PI,
        },
      ]),
      { x: 3, y: 0, z: 4 }
    )!
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(Math.PI * 25 * 4, 9)
    const box = brepBox(brep)!
    expect(box.min.x).toBeCloseTo(-5, 9)
    expect(box.max.x).toBeCloseTo(8, 9)
    expect(box.max.z).toBeCloseTo(4, 9)
  })
})

describe("revolutionBrep", () => {
  it("turns a rectangle round Y, whole and from 30° through 90° (r01)", () => {
    const whole = revolved(rectangle(10, 0, 20, 5), 0, 2 * Math.PI)
    expect(brepIsClosed(whole)).toBe(true)
    expect(brepVolume(whole)).toBeCloseTo(Math.PI * 300 * 5, 8)
    const part = revolved(rectangle(100, 0, 110, 5), 30 * DEG, 90 * DEG)
    expect(brepIsClosed(part)).toBe(true)
    expect(brepVolume(part)).toBeCloseTo(8246.68071567321, 7)
    expect(brepArea(part)).toBeCloseTo(5048.008429403923, 7)
    const m = solidInertia(brepMoments(part))
    expect(m.centroid.x).toBeCloseTo(24.485489542151804, 8)
    expect(m.centroid.z).toBeCloseTo(-91.38109101950742, 8)
    expect(m.moments.x).toBeCloseTo(70751782.66191426, 2)
    expect(m.products.zx).toBeCloseTo(14503124.999999957, 2)
    const box = brepBox(part)!
    expect(box.min.x).toBeCloseTo(-55, 9)
    expect(box.max.x).toBeCloseTo(95.26279441628826, 9)
    expect(box.min.z).toBeCloseTo(-110, 9)
  })

  it("turns a circle whole into a doughnut (r02)", () => {
    const brep = revolved(
      flat([
        {
          kind: "arc",
          center: { x: 60, y: 0 },
          radius: 5,
          startAngle: 0,
          sweep: 2 * Math.PI,
        },
      ]),
      0,
      2 * Math.PI
    )
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(29608.8132, 4)
    const m = solidInertia(brepMoments(brep))
    expect(m.moments.x).toBeCloseTo(53758501.4722, 3)
    expect(m.moments.y).toBeCloseTo(107146892.7793, 3)
    expect(brepBox(brep)!.max.z).toBeCloseTo(65, 9)
  })

  it("turns a half disc a quarter backwards into a sphere's wedge (r03)", () => {
    const brep = revolved(
      flat([
        {
          kind: "arc",
          center: { x: 0, y: 0 },
          radius: 5,
          startAngle: -Math.PI / 2,
          sweep: Math.PI,
        },
        line(0, 5, 0, -5),
      ]),
      0,
      -90 * DEG,
      O,
      { x: 0, y: -1, z: 0 }
    )
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(130.8996938995748, 9)
    expect(brepArea(brep)).toBeCloseTo(157.0796326794895, 9)
    const m = solidInertia(brepMoments(brep))
    expect(m.centroid.x).toBeCloseTo(1.875, 9)
    expect(m.centroid.z).toBeCloseTo(-1.875, 9)
    expect(m.products.zx).toBeCloseTo(416.6667, 4)
  })

  it("turns a triangle whole into a cylinder round a cone (r06)", () => {
    const brep = revolved(
      flat([line(0, 0, 5, 0), line(5, 0, 5, 10), line(5, 10, 0, 0)]),
      0,
      2 * Math.PI
    )
    expect(brepIsClosed(brep)).toBe(true)
    expect(brep.edges.map((e) => e.curve.kind).sort()).toEqual([
      "circle",
      "circle",
      "point",
    ])
    expect(brepVolume(brep)).toBeCloseTo(523.5987755982989, 9)
    expect(brepArea(brep)).toBeCloseTo(568.3194499747423, 9)
    expect(solidInertia(brepMoments(brep)).moments.x).toBeCloseTo(14398.9663, 4)
  })

  it("turns a half disc whole into a sphere with no edge (r06)", () => {
    const brep = revolved(
      flat([
        {
          kind: "arc",
          center: { x: 20, y: 0 },
          radius: 5,
          startAngle: -Math.PI / 2,
          sweep: Math.PI,
        },
        line(20, 5, 20, -5),
      ]),
      0,
      2 * Math.PI,
      { x: 20, y: 0, z: 0 }
    )
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(523.5987755982989, 9)
  })

  it("turns an ellipse whole into a revolution of it (r04)", () => {
    const brep = revolved(
      flat([
        {
          kind: "ellipse",
          center: { x: 50, y: 0 },
          majorAxis: { x: 5, y: 0 },
          ratio: 0.4,
          startParam: 0,
          sweep: 2 * Math.PI,
        },
      ]),
      0,
      2 * Math.PI
    )
    expect(brepIsClosed(brep)).toBe(true)
    expect(brep.faces.map((f) => f.surface.kind)).toEqual(["revolution"])
    expect(brepVolume(brep)).toBeCloseTo(9869.604401089357, 8)
    const m = solidInertia(brepMoments(brep))
    // Exact, by the ring's closed form: about its axis 2π²ab(R³ + ¾Ra²),
    // across it half that and ∫ y² = 2πR·πab³/4. AutoCAD's own sum is off
    // in the eleventh digit (12439402.64776518, 24859066.08678288).
    const about = 2 * Math.PI ** 2 * 10 * (50 ** 3 + 0.75 * 50 * 25)
    expect(m.moments.y).toBeCloseTo(about, 6)
    expect(m.moments.x).toBeCloseTo(about / 2 + 2 * Math.PI ** 2 * 500, 6)
    expect(m.moments.x / 12439402.64776518).toBeCloseTo(1, 9)
    const box = brepBox(brep)!
    expect(box.max.x).toBeCloseTo(55, 7)
    expect(box.max.y).toBeCloseTo(2, 7)
  })

  it("turns a spline's region by Pappus' rule", () => {
    const curve = splineCurve(
      createSpline("fit", [
        { x: 10, y: 0 },
        { x: 14, y: 3 },
        { x: 12, y: 7 },
        { x: 16, y: 10 },
      ])
    )
    const { start, end } = bsplineDomain(curve)
    const profile = flat([
      { kind: "spline", curve, from: start, to: end },
      line(16, 10, 10, 10),
      line(10, 10, 10, 0),
    ])
    const region = extrusionBrep(profile, { x: 0, y: 0, z: 1 })!
    const area = brepVolume(region)
    const centroid = solidInertia(brepMoments(region)).centroid.x
    for (const angle of [2 * Math.PI, 75 * DEG]) {
      const brep = revolved(profile, 10 * DEG, angle)
      expect(brepIsClosed(brep)).toBe(true)
      expect(brepVolume(brep)).toBeCloseTo(angle * centroid * area, 9)
    }
  })
})

/** The faces and edges as MPDUMP counts them, a seam's two coedges once (p304). */
function kinds(b: Brep) {
  const count = (xs: string[]) =>
    xs
      .sort()
      .reduce<Record<string, number>>(
        (a, x) => ((a[x] = (a[x] ?? 0) + 1), a),
        {}
      )
  return {
    faces: count(b.faces.map((f) => f.surface.kind)),
    edges: count(b.edges.map((e) => e.curve.kind)),
    vertices: b.vertices.length,
  }
}

/** V − E + F − (L − F): 2(1 − genus) for one closed shell. */
const euler = (b: Brep) =>
  b.vertices.length -
  b.edges.length +
  2 * b.faces.length -
  b.faces.reduce((n, f) => n + f.loops.length, 0)

const arcOf = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  sweep: number
): PlanarCurve => ({
  kind: "arc",
  center: { x: cx, y: cy },
  radius,
  startAngle,
  sweep,
})

describe("a swept profile's runs merged (the Sweeps review, SWO-05)", () => {
  it("extrudes a vertex mid-side and two arcs of one circle as one face each (sweeps/p330)", () => {
    const brep = extrusionBrep(
      flat([
        line(0, 0, 10, 0),
        line(10, 0, 20, 0),
        arcOf(20, 10, 10, -Math.PI / 2, Math.PI / 2),
        arcOf(20, 10, 10, 0, Math.PI / 2),
        line(20, 20, 0, 20),
        line(0, 20, 0, 0),
      ]),
      { x: 0, y: 0, z: 5 }
    )!
    expect(brepIsClosed(brep)).toBe(true)
    expect(kinds(brep)).toEqual({
      faces: { cylinder: 1, plane: 5 },
      edges: { circle: 2, line: 10 },
      vertices: 8,
    })
    expect(brepVolume(brep)).toBeCloseTo(2785.398163, 6)
  })

  it("extrudes an ellipse in two halves as a whole one, the merge across the loop's start too (p302's B-rep)", () => {
    const half = (startParam: number) => ({
      kind: "ellipse" as const,
      center: { x: 0, y: 0 },
      majorAxis: { x: 10, y: 0 },
      ratio: 0.4,
      startParam,
      sweep: Math.PI,
    })
    const brep = extrusionBrep(flat([half(0), half(Math.PI)]), {
      x: 0,
      y: 0,
      z: 5,
    })!
    expect(brepIsClosed(brep)).toBe(true)
    expect(kinds(brep)).toEqual({
      faces: { cylinder: 1, plane: 2 },
      edges: { ellipse: 2 },
      vertices: 2,
    })
    expect(brepVolume(brep)).toBeCloseTo(Math.PI * 40 * 5, 9)
    const square = extrusionBrep(
      flat([
        line(5, 0, 10, 0),
        line(10, 0, 10, 10),
        line(10, 10, 0, 10),
        line(0, 10, 0, 0),
        line(0, 0, 5, 0),
      ]),
      { x: 0, y: 0, z: 1 }
    )!
    expect(kinds(square).vertices).toBe(8)
    expect(brepVolume(square)).toBeCloseTo(100, 9)
  })

  it("turns collinear sides through 90° as a rectangle's (sweeps/p331)", () => {
    const brep = revolved(
      flat([
        line(10, 0, 15, 0),
        line(15, 0, 20, 0),
        line(20, 0, 20, 5),
        line(20, 5, 10, 5),
        line(10, 5, 10, 0),
      ]),
      0,
      90 * DEG
    )
    expect(brepIsClosed(brep)).toBe(true)
    expect(kinds(brep)).toEqual({
      faces: { cylinder: 2, plane: 4 },
      edges: { circle: 4, line: 8 },
      vertices: 8,
    })
    expect(brepVolume(brep)).toBeCloseTo(1178.097245, 6)
  })

  it("turns two quarter arcs on the axis whole into one sphere face, no edge or vertex (sweeps/p309)", () => {
    const brep = revolved(
      flat([
        arcOf(0, 0, 5, -Math.PI / 2, Math.PI / 2),
        arcOf(0, 0, 5, 0, Math.PI / 2),
        line(0, 5, 0, -5),
      ]),
      0,
      2 * Math.PI
    )
    expect(brepIsClosed(brep)).toBe(true)
    expect(kinds(brep)).toEqual({
      faces: { sphere: 1 },
      edges: {},
      vertices: 0,
    })
    expect(brepVolume(brep)).toBeCloseTo(523.598776, 6)
  })
})

describe("a revolution surface turned whole keeps its seam (the Sweeps review, SWO-06)", () => {
  it("an ellipse: its profile and the circle its start traces, one vertex (revolve/r04)", () => {
    const brep = revolved(
      flat([
        {
          kind: "ellipse",
          center: { x: 50, y: 0 },
          majorAxis: { x: 5, y: 0 },
          ratio: 0.4,
          startParam: 0,
          sweep: 2 * Math.PI,
        },
      ]),
      0,
      2 * Math.PI
    )
    expect(brepIsClosed(brep)).toBe(true)
    expect(kinds(brep)).toEqual({
      faces: { revolution: 1 },
      edges: { circle: 1, ellipse: 1 },
      vertices: 1,
    })
    // A ring: genus 1.
    expect(euler(brep)).toBe(0)
    expect(brep.vertices[0].x).toBeCloseTo(55, 9)
    expect(brepVolume(brep)).toBeCloseTo(9869.604401089357, 8)
  })

  it("a CV spline's region: the spline beside three circles (sweeps/p308)", () => {
    const spline = {
      degree: 3,
      knots: [0, 0, 0, 0, 1, 1, 1, 1],
      controlPoints: [
        { x: 10, y: 0, z: 0 },
        { x: 14, y: 3, z: 0 },
        { x: 12, y: 7, z: 0 },
        { x: 16, y: 10, z: 0 },
      ],
    }
    const profile = flat([
      { kind: "spline", curve: spline, from: 0, to: 1 },
      line(16, 10, 10, 10),
      line(10, 10, 10, 0),
    ])
    const brep = revolved(profile, 0, 2 * Math.PI)
    expect(brepIsClosed(brep)).toBe(true)
    expect(kinds(brep)).toEqual({
      faces: { cylinder: 1, plane: 1, revolution: 1 },
      edges: { circle: 3, spline: 1 },
      vertices: 3,
    })
    expect(euler(brep)).toBe(0)
    expect(brepVolume(brep)).toBeCloseTo(2226.401834, 5)
    // A small one near its axis still measures by its loops, its seam
    // bounding nothing where the periods wrap (the property below, shrunk).
    const tilt = 2.698641310416861e-9
    const small = revolutionBrep(
      {
        axes: {
          x: { x: 0, y: 1, z: 0 },
          y: { x: tilt, y: 0, z: 1 },
          z: { x: 1, y: 0, z: -tilt },
        },
        elevation: 64.01,
        faces: [
          {
            loops: [
              [
                {
                  kind: "ellipse",
                  center: { x: 0, y: 0 },
                  majorAxis: { x: 0.01, y: 0 },
                  ratio: 0.5,
                  startParam: 0,
                  sweep: 2 * Math.PI,
                },
              ],
            ],
          },
        ],
      },
      { x: 64.01000000001684, y: 0, z: 0.006237446416158235 },
      Y,
      { x: 0, y: 0, z: -1 },
      0,
      2 * Math.PI
    )
    expect(brepIsClosed(small)).toBe(true)
    // The ellipse's centre lies 64.01·tilt below the plane z = 0.
    const R = 0.006237446416158235 + 64.01 * tilt
    const pappus = 2 * Math.PI ** 2 * R * 0.01 * 0.005
    expect(brepVolume(small) / pappus).toBeCloseTo(1, 6)
    // Short of a turn it is closed by the profile at each end, as before.
    expect(brepIsClosed(revolved(profile, 0, 90 * DEG))).toBe(true)
  })
})

describe("an extrusion's faces in ACIS's order (the Sweeps review, SWO-07)", () => {
  it("the sides from the profile's last edge back, then the top and the bottom (sweeps/p316)", () => {
    const brep = extrusionBrep(rectangle(0, 0, 10, 20), { x: 0, y: 0, z: 5 })!
    expect(
      brep.faces.map(({ surface }) =>
        surface.kind === "plane"
          ? [surface.normal.x + 0, surface.normal.y + 0, surface.normal.z + 0]
          : surface.kind
      )
    ).toEqual([
      [-1, 0, 0],
      [0, 1, 0],
      [1, 0, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ])
  })
})

describe("swept solids, any", () => {
  it("close, and hold the volume Pappus or the prism's rule gives them", () => {
    fc.assert(
      fc.property(sweep, (s) => {
        expect(brepIsClosed(s.brep)).toBe(true)
        const flatBrep = extrusionBrep(s.profile, s.profile.axes.z)!
        const area = brepVolume(flatBrep)
        const volume = brepVolume(s.brep)
        const scale = Math.max(1, Math.abs(volume))
        if (s.kind === "revolve") {
          // Pappus: the angle times the centroid's distance from the axis times the area.
          // The unit slab's centroid lies half its height off the profile.
          const c = sub3(
            solidInertia(brepMoments(flatBrep)).centroid,
            scale3(s.profile.axes.z, 0.5)
          )
          const d = sub3(c, s.origin)
          const away = length3(sub3(d, scale3(s.axis, dot3(d, s.axis))))
          expect(volume / scale).toBeCloseTo(
            (Math.abs(s.angle) * away * area) / scale,
            6
          )
        } else if (s.taper === 0) {
          const rise = Math.abs(dot3(s.offset, s.profile.axes.z))
          expect(volume / scale).toBeCloseTo((area * rise) / scale, 8)
        } else {
          expect(volume).toBeGreaterThan(0)
        }
      }),
      { numRuns: 200 }
    )
  }, 30_000)

  it("keep their volume and moments through a mirror and a scale", () => {
    fc.assert(
      fc.property(
        sweep,
        fc.double({ min: 0.1, max: 10, noNaN: true }),
        (s, k) => {
          const mirror = (p: Vec3) => ({ x: -p.x * k, y: p.y * k, z: p.z * k })
          const turn = (d: Vec3) => ({ x: -d.x, y: d.y, z: d.z })
          const mirrored = brepMapped(s.brep, mirror, turn, true, k)
          expect(brepIsClosed(mirrored)).toBe(true)
          const v = brepVolume(s.brep)
          expect(brepVolume(mirrored) / (v * k ** 3)).toBeCloseTo(1, 7)
          expect(brepArea(mirrored) / (brepArea(s.brep) * k ** 2)).toBeCloseTo(
            1,
            6
          )
          const a = solidInertia(brepMoments(s.brep))
          const b = solidInertia(brepMoments(mirrored))
          const size =
            Math.max(
              1,
              Math.abs(a.centroid.x),
              Math.abs(a.centroid.y),
              Math.abs(a.centroid.z)
            ) * k
          expect((b.centroid.x + a.centroid.x * k) / size).toBeCloseTo(0, 6)
          expect((b.centroid.z - a.centroid.z * k) / size).toBeCloseTo(0, 6)
        }
      ),
      { numRuns: 60 }
    )
  }, 30_000)

  it("box their every point", () => {
    fc.assert(
      fc.property(sweep, (s) => {
        const box = brepBox(s.brep)!
        const pad =
          1e-6 *
          Math.max(
            1,
            ...[box.min, box.max].flatMap((p) => [
              Math.abs(p.x),
              Math.abs(p.y),
              Math.abs(p.z),
            ])
          )
        for (const face of s.brep.faces) {
          if (!face.domain || face.surface.kind === "plane") continue
          for (const { p } of domainSamples(face.surface, face.domain, false)) {
            expect(p.x).toBeGreaterThanOrEqual(box.min.x - pad)
            expect(p.x).toBeLessThanOrEqual(box.max.x + pad)
            expect(p.y).toBeGreaterThanOrEqual(box.min.y - pad)
            expect(p.y).toBeLessThanOrEqual(box.max.y + pad)
            expect(p.z).toBeGreaterThanOrEqual(box.min.z - pad)
            expect(p.z).toBeLessThanOrEqual(box.max.z + pad)
          }
        }
      }),
      // 2.5 to 6.2 s alone with coverage at 40 runs (1/11/2026), over the
      // 10 s limit with the whole suite beside it: half as many keep it under.
      { numRuns: 20 }
    )
  }, 30_000)
})

describe("a swept face's isolines", () => {
  const lines = (brep: ReturnType<typeof extrusionBrep>, count: number) =>
    brepIsolines(brep!, count).length

  /** Degrees round +Y, from +X towards −Z (a right-handed turn), 0 to 360. */
  const aroundY = (p: Vec3) =>
    (((Math.atan2(-p.z, p.x) / DEG) % 360) + 360) % 360

  /** The angles of the rulings parallel to `axis` at `radius` from it. */
  function rulings(
    wires: ReturnType<typeof brepIsolines>,
    radius: number,
    angle: (p: Vec3) => number,
    axis: "y" | "z" = "y"
  ): number[] {
    const across = axis === "y" ? (["x", "z"] as const) : (["x", "y"] as const)
    return wires
      .filter(
        (w): w is Extract<typeof w, { kind: "line" }> =>
          w.kind === "line" &&
          across.every((k) => Math.abs(w.start[k] - w.end[k]) < 1e-9) &&
          Math.abs(
            Math.hypot(w.start[across[0]], w.start[across[1]]) - radius
          ) < 1e-6
      )
      .map((w) => angle(w.start))
      .sort((a, b) => a - b)
  }

  const expectAngles = (got: number[], want: number[]) => {
    expect(got).toHaveLength(want.length)
    got.forEach((a, k) => expect(Math.abs(a - want[k])).toBeLessThan(0.1))
  }

  // sweeps/d01, d02 at ISOLINES N: a part of a turn of s° (N, s, the
  // rulings in degrees from where it starts).
  const partial: [number, number, number[]][] = [
    [4, 20, [10]],
    [4, 90, [45]],
    [4, 100, [50]],
    [4, 135, [45, 90]],
    [4, 150, [50, 100]],
    [4, 180, [60, 120]],
    [4, 203, [67.67, 135.33]],
    [4, 250, [62.5, 125, 187.5]],
    [4, 270, [67.5, 135, 202.5]],
    [4, 300, [75, 150, 225]],
    [6, 45, [22.5]],
    [6, 100, [33.33, 66.67]],
    [6, 180, [45, 90, 135]],
    [8, 20, [10]],
    [8, 45, [22.5]],
    [8, 100, [33.33, 66.67]],
    [8, 180, [36, 72, 108, 144]],
  ]

  it("spread max(1, round(N·s/360)) inside a part of a turn, a whole turn's N from its seam (sweeps/d01, d02)", () => {
    for (const [n, s, want] of partial) {
      expectAngles(
        turnIsolines([0, s * DEG], n).map((t) => t / DEG),
        want
      )
      // Backwards from where it starts alike.
      expectAngles(
        turnIsolines([1, 1 - s * DEG], n).map((t) => (1 - t) / DEG),
        want
      )
    }
    expectAngles(
      turnIsolines([0, 2 * Math.PI], 4).map((t) => t / DEG),
      [0, 90, 180, 270]
    )
    expect(turnIsolines([0, Math.PI], 0)).toEqual([])
    expect(turnIsolines([0, 2 * Math.PI], 0)).toEqual([])
  })

  it("rule a turned rectangle's side the same way (sweeps/d01: REVOLVE)", () => {
    for (const [n, s, want] of partial) {
      const brep = revolved(rectangle(0, 0, 10, 20), 0, s * DEG)
      expectAngles(rulings(brepIsolines(brep, n), 10, aroundY), want)
    }
    const whole = revolved(rectangle(0, 0, 10, 20), 0, 2 * Math.PI)
    expectAngles(
      rulings(brepIsolines(whole, 4), 10, aroundY),
      [0, 90, 180, 270]
    )
    expect(
      brepIsolines(revolved(rectangle(0, 0, 10, 20), 0, Math.PI), 0)
    ).toEqual([])
  })

  it("rule a cylinder cut in half by SUBTRACT inside what is left (sweeps/d01 c3)", () => {
    const cylinder = roundBrep(O, WORLD.z, WORLD.x, 10, 10, 20, 1)
    const box = boxBrep(
      { x: -20, y: -20, z: -1 },
      { x: 20, y: 0, z: 0 },
      { x: 0, y: 40, z: 0 },
      { x: 0, y: 0, z: 22 }
    )
    const half = brepBoolean("subtract", cylinder, box)!
    const atan = (p: Vec3) => (((Math.atan2(p.y, p.x) / DEG) % 360) + 360) % 360
    expectAngles(rulings(brepIsolines(half, 4), 10, atan, "z"), [30, 330])
    expectAngles(
      rulings(brepIsolines(half, 8), 10, atan, "z"),
      [18, 54, 306, 342]
    )
  })

  it("rule an extruded half circle inside it, from the arc's start (sweeps/d01: EXTRUDE of an arc)", () => {
    const brep = extrusionBrep(
      flat([
        line(0, 0, 10, 0),
        {
          kind: "arc",
          center: { x: 10, y: 5 },
          radius: 5,
          startAngle: -Math.PI / 2,
          sweep: Math.PI,
        },
        line(10, 10, 0, 10),
        line(0, 10, 0, 0),
      ]),
      { x: 0, y: 0, z: 8 }
    )
    const wires = brepIsolines(brep!, 4)
    // 60° and 120° from −90°.
    expect(wires).toHaveLength(2)
    expect(wires.map((w) => (w.kind === "line" ? w.start : null))).toEqual([
      {
        x: expect.closeTo(10 + 5 * Math.cos(-30 * DEG), 9),
        y: expect.closeTo(2.5, 9),
        z: 0,
      },
      {
        x: expect.closeTo(10 + 5 * Math.cos(30 * DEG), 9),
        y: expect.closeTo(7.5, 9),
        z: 0,
      },
    ])
  })

  it("draw a torus' tube circles inside a part of a turn, its parallels round the tube (sweeps/d01, d02)", () => {
    const brep = revolved(
      flat([
        {
          kind: "arc",
          center: { x: 15, y: 0 },
          radius: 4,
          startAngle: 0,
          sweep: 2 * Math.PI,
        },
      ]),
      0,
      150 * DEG
    )
    const wires = brepIsolines(brep, 4)
    // Two tube circles, at 50° and 100°; four parallels round the tube.
    const tubes = wires.filter(
      (w) => w.kind === "arc" && Math.abs(w.radius - 4) < 1e-9
    )
    expectAngles(
      tubes.map((w) => (w.kind === "arc" ? aroundY(w.center) : NaN)),
      [50, 100]
    )
    expect(wires).toHaveLength(6)
  })

  it("turns a hair off the axis' cone with a cone's rulings and no circles", () => {
    const brep = revolved(
      flat([
        line(0, 0, 10, 0),
        line(10, 0, 10.005, 20),
        line(10.005, 20, 0, 20),
        line(0, 20, 0, 0),
      ]),
      0,
      180 * DEG
    )
    const wires = brepIsolines(brep, 4)
    expect(wires).toHaveLength(2)
    expect(wires.every((w) => w.kind === "curve")).toBe(true)
  })

  // p308's one-span CV spline, closed by a polyline back to its start, as d02 and d03 drew it.
  const p308 = () => {
    const curve = splineCurve(
      createSpline("cv", [
        { x: 10, y: 0 },
        { x: 14, y: 3 },
        { x: 12, y: 7 },
        { x: 16, y: 10 },
      ])
    )
    const { start, end } = bsplineDomain(curve)
    return {
      curve,
      start,
      end,
      profile: flat([
        { kind: "spline", curve, from: start, to: end },
        line(16, 10, 10, 10),
        line(10, 10, 10, 0),
      ]),
    }
  }

  it("split a turned spline in N − 3 parts each way, the seam on a whole turn (sweeps/d02)", () => {
    const { curve, start, end, profile } = p308()
    const meridians = (brep: Brep, n: number) =>
      brepIsolines(brep, n)
        .filter((w) => w.kind === "curve")
        .map((w) =>
          w.kind === "curve" ? aroundY(w.curve.controlPoints[0]) : NaN
        )
        .sort((a, b) => a - b)
    const rings = (brep: Brep, n: number) =>
      brepIsolines(brep, n)
        .filter((w) => w.kind === "arc")
        .map((w) => (w.kind === "arc" ? w.radius : NaN))
        .sort((a, b) => a - b)
    const half = revolved(profile, 0, Math.PI)
    expect(meridians(half, 4)).toEqual([])
    expectAngles(meridians(half, 6), [60, 120])
    expectAngles(meridians(half, 8), [36, 72, 108, 144])
    expectAngles(
      meridians(revolved(profile, 0, Math.PI / 2), 8),
      [18, 36, 54, 72]
    )
    expect(rings(half, 4)).toEqual([])
    // The radii d02 measured: 12.43, 13.55 at 6; 11.77, 12.68, 13.30, 14.22 at 8.
    const radius = (t: number) =>
      bsplinePoint(curve, start + (end - start) * t).x
    expect(rings(half, 6)).toEqual([
      expect.closeTo(radius(1 / 3), 9),
      expect.closeTo(radius(2 / 3), 9),
    ])
    expect(rings(half, 6)[0]).toBeCloseTo(12.43, 1)
    expect(rings(half, 6)[1]).toBeCloseTo(13.55, 1)
    expect(rings(half, 8)).toEqual(
      [1, 2, 3, 4].map((k) => expect.closeTo(radius(k / 5), 9))
    )
    expect(rings(half, 8)[0]).toBeCloseTo(11.77, 1)
    expect(rings(half, 8)[3]).toBeCloseTo(14.22, 1)
    const whole = revolved(profile, 0, 2 * Math.PI)
    expectAngles(meridians(whole, 4), [0])
    expectAngles(meridians(whole, 6), [0, 120, 240])
    expectAngles(meridians(whole, 8), [0, 72, 144, 216, 288])
    expect(rings(whole, 8)).toHaveLength(4)
    expect(brepIsolines(whole, 0)).toEqual([])
  })

  it("split a turned whole ellipse in N − 3 parts each way, both seams drawn (sweeps/d02: r04)", () => {
    const ellipse = revolved(
      flat([
        {
          kind: "ellipse",
          center: { x: 50, y: 0 },
          majorAxis: { x: 5, y: 0 },
          ratio: 0.4,
          startParam: 0,
          sweep: 2 * Math.PI,
        },
      ]),
      0,
      2 * Math.PI
    )
    const kinds = (n: number) => brepIsolines(ellipse, n).map((w) => w.kind)
    expect(kinds(4).filter((k) => k === "curve")).toHaveLength(1)
    expect(kinds(4).filter((k) => k === "arc")).toHaveLength(1)
    expect(kinds(6).filter((k) => k === "curve")).toHaveLength(3)
    expect(kinds(6).filter((k) => k === "arc")).toHaveLength(3)
  })

  it("split an extruded spline side in N − 3 parts each way: rulings and profiles across (sweeps/d03)", () => {
    const { curve, start, end, profile } = p308()
    const brep = extrusionBrep(profile, { x: 0, y: 0, z: 20 })!
    expect(brepIsolines(brep, 4)).toEqual([])
    for (const n of [6, 8]) {
      const parts = n - 3
      const wires = brepIsolines(brep, n)
      const ruled = wires.filter((w) => w.kind === "line")
      expect(ruled).toHaveLength(parts - 1)
      ruled.forEach((w, k) => {
        const at = bsplinePoint(
          curve,
          start + ((end - start) * (k + 1)) / parts
        )
        expect(w.kind === "line" && w.start).toEqual({
          x: expect.closeTo(at.x, 9),
          y: expect.closeTo(at.y, 9),
          z: 0,
        })
        expect(w.kind === "line" && w.end.z).toBeCloseTo(20, 9)
      })
      const across = wires.filter((w) => w.kind === "curve")
      expect(
        across.map((w) =>
          w.kind === "curve" ? w.curve.controlPoints[0].z : NaN
        )
      ).toEqual(
        Array.from({ length: parts - 1 }, (_, k) =>
          expect.closeTo((20 * (k + 1)) / parts, 9)
        )
      )
    }
  })

  it("rule a closed spline's extruded side from its seam, mirrored too (sweeps/d03)", () => {
    const curve = splineCurve(
      createSpline(
        "fit",
        [
          { x: 50, y: 0 },
          { x: 60, y: 5 },
          { x: 55, y: 10 },
          { x: 45, y: 8 },
        ],
        { closed: true }
      )
    )
    const { start, end } = bsplineDomain(curve)
    const spline = extrusionBrep(
      flat([{ kind: "spline", curve, from: start, to: end }]),
      { x: 0, y: 0, z: 4 }
    )!
    expect(brepIsolines(spline, 4).map((w) => w.kind)).toEqual(["line"])
    const seam = bsplinePoint(curve, start)
    expect(brepIsolines(spline, 4)[0]).toMatchObject({
      start: { x: expect.closeTo(seam.x, 9), y: expect.closeTo(seam.y, 9) },
    })
    const six = brepIsolines(spline, 6).map((w) => w.kind)
    expect(six.filter((k) => k === "line")).toHaveLength(3)
    expect(six.filter((k) => k === "curve")).toHaveLength(2)
    // Mirrored, its profile runs backwards and its volume stays.
    const mirrored = brepMapped(
      spline,
      (p) => ({ ...p, x: -p.x }),
      (d) => ({ ...d, x: -d.x }),
      true
    )
    expect(brepIsClosed(mirrored)).toBe(true)
    expect(brepVolume(mirrored)).toBeCloseTo(515.858363810842, 9)
    expect(brepIsolines(mirrored, 4)).toHaveLength(1)
    expect(lines(mirrored, 6)).toBe(5)
  })
})
