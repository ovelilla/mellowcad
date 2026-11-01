import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { sweep } from "../../test/arbitraries"
import { Vec3, dot3, length3, scale3, sub3 } from "./Vec3"
import { domainSamples } from "./faceDomains"

import { brepMoments, solidInertia } from "./massProperties"
import {
  brepArea,
  brepBox,
  brepIsClosed,
  brepIsolines,
  brepMapped,
  brepVolume,
} from "./solids"
import {
  PlanarProfile,
  extrusionBrep,
  revolutionBrep,
  revolveSide,
} from "./sweeps"
import { PlanarCurve } from "./planarCurves"
import { bsplineDomain } from "./nurbs"
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
      { numRuns: 40 }
    )
  }, 30_000)
})

describe("a swept face's isolines", () => {
  const lines = (brep: ReturnType<typeof extrusionBrep>, count: number) =>
    brepIsolines(brep!, count).length

  it("rule a turned face every 2π/n from where it starts (r03's i3)", () => {
    const brep = revolved(rectangle(10, 0, 20, 5), 0, 120 * DEG)
    expect(lines(brep, 4)).toBe(2)
    expect(lines(brep, 6)).toBe(2)
    expect(lines(brep, 8)).toBe(4)
    expect(lines(revolved(rectangle(10, 0, 20, 5), 0, 2 * Math.PI), 4)).toBe(8)
  })

  it("rule an extruded arc from the arc's start (x09)", () => {
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
    expect(wires).toEqual([
      {
        kind: "line",
        start: { x: 15, y: 5, z: 0 },
        end: { x: 15, y: 5, z: 8 },
      },
    ])
  })

  it("draw a torus' tube circles and parallels within a part of a turn (i5)", () => {
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
    // One tube circle at 90°, four parallels round the tube.
    expect(
      wires.filter((w) => w.kind === "arc" && w.radius === 4)
    ).toHaveLength(1)
    expect(wires).toHaveLength(5)
  })

  it("draw a revolution's profiles round it and circles along it, an extrusion's rulings", () => {
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
    const wires = brepIsolines(ellipse, 4)
    expect(wires.filter((w) => w.kind === "curve")).toHaveLength(4)
    expect(wires.filter((w) => w.kind === "arc")).toHaveLength(4)

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
    expect(brepIsolines(spline, 4).map((w) => w.kind)).toEqual([
      "line",
      "line",
      "line",
    ])
    // Mirrored, its profile runs backwards and its volume stays.
    const mirrored = brepMapped(
      spline,
      (p) => ({ ...p, x: -p.x }),
      (d) => ({ ...d, x: -d.x }),
      true
    )
    expect(brepIsClosed(mirrored)).toBe(true)
    expect(brepVolume(mirrored)).toBeCloseTo(515.858363810842, 9)
    expect(brepIsolines(mirrored, 4)).toHaveLength(3)
  })
})
