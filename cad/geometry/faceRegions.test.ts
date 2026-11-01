import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { Vec3, dot3, length3, sub3 } from "./Vec3"
import {
  Brep,
  BrepFace,
  brepAnchor,
  brepArea,
  brepIsClosed,
  brepVolume,
  roundBrep,
  sphereBrep,
  torusBrep,
} from "./solids"
import { faceRegion, faceSamples, surfaceParams } from "./faceRegions"
import { surfacePoint } from "./faceDomains"
import { brepMoments, solidInertia } from "./massProperties"
import { conicArcCurve } from "./nurbs"
import { revolutionBrep } from "./sweeps"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const O: Vec3 = { x: 0, y: 0, z: 0 }

/** Every face measured by Green in its parameters, a plane's by its own region. */
function greenMeasures(brep: Brep): { volume: number; area: number } {
  const about = brepAnchor(brep)
  let flux = 0
  let area = 0
  const planes: BrepFace[] = []
  for (const face of brep.faces) {
    if (face.surface.kind === "plane") {
      planes.push(face)
      continue
    }
    for (const { p, n, w } of faceSamples(brep, face, true)) {
      flux += dot3(sub3(p, about), n) * w
    }
    for (const { n, w } of faceSamples(brep, face, false)) {
      area += length3(n) * w
    }
  }
  // The planes' share, as brepVolume measures them.
  const flat: Brep = { ...brep, faces: planes }
  return {
    volume: flux / 3 + brepVolume(flat),
    area: area + brepArea(flat),
  }
}

describe("Green in a face's parameters", () => {
  it("measures a primitive's faces as their closed forms do", () => {
    const solids = [
      roundBrep(O, Z, X, 3, 3, 7, 1),
      roundBrep(O, Z, X, 4, 2, 5, 1),
      roundBrep(O, Z, X, 3, 3, 6, 0),
      roundBrep(O, Z, X, 5, 5, 4, 0.4),
      roundBrep(O, Z, X, 2, 2, 4, 1.8),
      sphereBrep({ x: 1, y: 2, z: 3 }, Z, X, 4),
      torusBrep(O, Z, X, 10, 3),
      torusBrep(O, Z, X, 2, 3),
      torusBrep(O, Z, X, -1, 3),
      torusBrep(O, Z, X, 3, 3),
    ]
    for (const brep of solids) {
      const green = greenMeasures(brep)
      expect(green.volume).toBeCloseTo(brepVolume(brep), 9)
      expect(green.area).toBeCloseTo(brepArea(brep), 9)
    }
  })

  it("closes a face round the pole it reaches, which no loop bounds (union/k07)", () => {
    // SUBTRACT's hemisphere: the sphere's face below its equator, the plane over it.
    const r = 10
    const brep: Brep = {
      vertices: [{ x: 0, y: r, z: 0 }],
      edges: [
        {
          start: 0,
          end: 0,
          curve: {
            kind: "circle",
            center: O,
            normal: { x: 0, y: 0, z: -1 },
            radius: r,
          },
        },
      ],
      faces: [
        {
          surface: { kind: "plane", origin: O, normal: Z },
          loops: [[{ edge: 0, reversed: true }]],
        },
        {
          surface: { kind: "sphere", center: O, axis: Z, xAxis: X, radius: r },
          loops: [[{ edge: 0, reversed: false }]],
          domain: { u: [0, 2 * Math.PI], v: [-Math.PI / 2, Math.PI / 2] },
        },
      ],
    }
    expect(brepIsClosed(brep)).toBe(true)
    // AutoCAD's MASSPROP: 2094.3951, the half of 4/3 π r³.
    expect(brepVolume(brep)).toBeCloseTo((2 / 3) * Math.PI * r ** 3, 9)
    expect(brepArea(brep)).toBeCloseTo(3 * Math.PI * r ** 2, 9)
    expect(faceRegion(brep, brep.faces[1])!.top).toBe(null)
    // The other cap, its equator run the other way, reaches the north pole.
    const cap: Brep = {
      ...brep,
      edges: [
        {
          ...brep.edges[0],
          curve: { ...brep.edges[0].curve, normal: Z } as never,
        },
      ],
      faces: [
        {
          ...brep.faces[0],
          surface: { kind: "plane", origin: O, normal: { x: 0, y: 0, z: -1 } },
        },
        brep.faces[1],
      ],
    }
    expect(brepVolume(cap)).toBeCloseTo((2 / 3) * Math.PI * r ** 3, 9)
    expect(faceRegion(cap, cap.faces[1])!.top).toBe(Math.PI / 2)
  })

  it("finds a point's parameters back on every surface", () => {
    const surfaces = [
      { kind: "cylinder", origin: O, axis: Z, xAxis: X, radius: 3, ratio: 0.5 },
      { kind: "cone", apex: O, axis: Z, xAxis: X, slope: 0.7, ratio: 1 },
      { kind: "sphere", center: O, axis: Z, xAxis: X, radius: 2 },
      {
        kind: "torus",
        center: O,
        axis: Z,
        xAxis: X,
        majorRadius: 5,
        minorRadius: 2,
      },
      {
        kind: "extrusion",
        profile: {
          kind: "ellipse",
          center: O,
          majorAxis: { x: 4, y: 0, z: 0 },
          minorAxis: { x: 0, y: 2, z: 0 },
        },
        direction: { x: 0, y: 0.6, z: 0.8 },
      },
      {
        kind: "revolution",
        profile: {
          kind: "spline",
          curve: {
            degree: 3,
            knots: [0, 0, 0, 0, 1, 1, 1, 1],
            controlPoints: [
              { x: 2, y: 0, z: 0 },
              { x: 4, y: 0, z: 1 },
              { x: 3, y: 0, z: 3 },
              { x: 5, y: 0, z: 4 },
            ],
          },
        },
        origin: O,
        axis: Z,
      },
    ] as const
    fc.assert(
      fc.property(
        fc.double({ min: -3, max: 3, noNaN: true }),
        fc.double({ min: 0.05, max: 0.95, noNaN: true }),
        (u, t) => {
          for (const s of surfaces) {
            const v =
              s.kind === "sphere"
                ? (t - 0.5) * 3
                : s.kind === "torus"
                  ? (t - 0.5) * 6
                  : s.kind === "revolution"
                    ? t
                    : 1 + 3 * t
            const p = surfacePoint(s, u, v)
            const back = surfaceParams(s, p, { u, v })
            expect(back.u).toBeCloseTo(u, 9)
            expect(back.v).toBeCloseTo(v, 9)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it("integrates an edge no rule of the surface is exact for: a cylinder cut aslant", () => {
    const r = 3
    const h = 5
    const k = 0.5
    const top: Vec3 = { x: 0, y: 0, z: h }
    const normal = { x: -k / Math.hypot(1, k), y: 0, z: 1 / Math.hypot(1, k) }
    const brep: Brep = {
      vertices: [
        { x: r, y: 0, z: 0 },
        { x: r, y: 0, z: h + k * r },
      ],
      edges: [
        {
          start: 0,
          end: 0,
          curve: {
            kind: "circle",
            center: O,
            normal: { x: 0, y: 0, z: -1 },
            radius: r,
          },
        },
        {
          start: 1,
          end: 1,
          curve: {
            kind: "ellipse",
            center: top,
            normal,
            majorAxis: { x: r, y: 0, z: k * r },
            ratio: 1 / Math.hypot(1, k),
          },
        },
      ],
      faces: [
        {
          surface: {
            kind: "cylinder",
            origin: O,
            axis: Z,
            xAxis: X,
            radius: r,
            ratio: 1,
          },
          loops: [[{ edge: 0, reversed: true }], [{ edge: 1, reversed: true }]],
          domain: { u: [0, 2 * Math.PI], v: [0, h + k * r] },
        },
        {
          surface: { kind: "plane", origin: O, normal: { x: 0, y: 0, z: -1 } },
          loops: [[{ edge: 0, reversed: false }]],
        },
        {
          surface: { kind: "plane", origin: top, normal },
          loops: [[{ edge: 1, reversed: false }]],
        },
      ],
    }
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(Math.PI * r * r * h, 9)
    expect(brepArea(brep)).toBeCloseTo(
      2 * Math.PI * r * h + Math.PI * r * r * (1 + Math.hypot(1, k)),
      9
    )
    // z over the slab and its wedge: ∫ z dV = π r² h²/2 + π r⁴ k²/8.
    const c = solidInertia(brepMoments(brep)).centroid
    expect(c.z).toBeCloseTo(h / 2 + (r * r * k * k) / (8 * h), 9)
    expect(c.x).toBeCloseTo((k * r * r) / (4 * h), 9)
  })

  it("folds a closed spline's parameter round, turned whole", () => {
    const circle = conicArcCurve(
      { x: 10, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
      { x: 0, y: 2, z: 0 },
      0,
      2 * Math.PI
    )
    const end = circle.knots[circle.knots.length - 1]
    const brep = revolutionBrep(
      {
        axes: { x: X, y: { x: 0, y: 1, z: 0 }, z: Z },
        elevation: 0,
        faces: [
          { loops: [[{ kind: "spline", curve: circle, from: 0, to: end }]] },
        ],
      },
      O,
      { x: 0, y: 1, z: 0 },
      X,
      0,
      2 * Math.PI
    )
    expect(brepIsClosed(brep)).toBe(true)
    // Pappus: 2π · 10 · π 2².
    expect(brepVolume(brep)).toBeCloseTo(80 * Math.PI ** 2, 7)
    expect(brepArea(brep)).toBeCloseTo(80 * Math.PI ** 2, 7)
  })
})
