import { describe, expect, it } from "vitest"

import { circleOf, ellipseOf, lineOf, p, polylineOf } from "../../test/builders"
import { createRegion, faceOfLoop, regionCurvesOf } from "./regions"
import type { PlanarProfile } from "../geometry/sweeps"
import type { Entity } from "./entityTypes"
import { profileBase, revolveBase, sweepProfile } from "./sweptSolids"

const L = [p(0, 0), p(20, 0), p(20, 5), p(5, 5), p(5, 15), p(0, 15)]

function near(
  actual: { x: number; y: number; z: number } | null,
  x: number,
  y: number,
  z = 0
) {
  expect(actual).not.toBeNull()
  expect(actual!.x).toBeCloseTo(x, 12)
  expect(actual!.y).toBeCloseTo(y, 12)
  expect(actual!.z).toBeCloseTo(z, 12)
}

// The traced BasePoint of EXTRUDE's height prompt (probe sweeps/pNNN).
describe("profileBase", () => {
  it("a polyline: the mean of 20 points by arc length, its start twice (p104, p105, x01)", () => {
    const rect = [p(0, 0), p(10, 0), p(10, 20), p(0, 20)]
    near(
      profileBase(polylineOf(rect, { closed: true })),
      4.7368421052631575,
      9.473684210526317
    )
    // The same rectangle drawn from its other corner (p104).
    near(
      profileBase(
        polylineOf([p(10, 20), p(0, 20), p(0, 0), p(10, 0)], { closed: true })
      ),
      5.263157894736842,
      10.526315789473683
    )
  })

  it("an L and a triangle (p101, p102), arcs by their length (x09)", () => {
    near(
      profileBase(polylineOf(L, { closed: true })),
      7.421052631578948,
      5.078947368421053
    )
    near(
      profileBase(polylineOf([p(0, 0), p(12, 0), p(3, 9)], { closed: true })),
      5.031060895938742,
      2.7681211803276353
    )
    near(
      profileBase(
        polylineOf([p(0, 0), p(10, 0), p(10, 10), p(0, 10)], {
          closed: true,
          bulges: [0, 1, 0, 0],
        })
      ),
      6.370283281037412,
      4.74209802012075
    )
    near(
      profileBase(
        polylineOf([p(30, 0), p(40, 0), p(30, 10)], {
          closed: true,
          bulges: [0, Math.tan(Math.PI / 8), 0],
        })
      ),
      33.98276276350417,
      3.982762763504165
    )
  })

  it("a region: its centroid (p103), at its elevation", () => {
    const curves = regionCurvesOf(polylineOf(L, { closed: true }))!
    near(profileBase(createRegion([faceOfLoop(curves)])), 7.5, 5)
  })

  it("a circle and an ellipse: their centres (x07, x04)", () => {
    near(profileBase(circleOf(p(50, 0), 5)), 50, 0)
    near(profileBase(ellipseOf(p(3, 4), p(10, 0), 0.3)), 3, 4)
  })

  it("nothing for what no sweep takes", () => {
    expect(profileBase(lineOf(p(0, 0), p(10, 0)))).toBeNull()
    expect(profileBase(polylineOf(L))).toBeNull()
  })
})

const ORIGIN = { x: 0, y: 0, z: 0 }
const Y = { x: 0, y: 1, z: 0 }
const X = { x: 1, y: 0, z: 0 }

function profileOf(entity: Entity): PlanarProfile {
  const profile = sweepProfile(entity)
  if (profile === null || typeof profile === "string") throw new Error()
  return profile
}

// Where REVOLVE's angle prompt puts LASTPOINT (probes sweeps/p119–p125, p151).
describe("revolveBase", () => {
  it("the perimeter's centroid on the axis, not the area's (p151: 375/70)", () => {
    const L = [p(10, 0), p(30, 0), p(30, 5), p(15, 5), p(15, 15), p(10, 15)]
    const profile = profileOf(polylineOf(L, { closed: true }))
    near(revolveBase(profile, ORIGIN, Y), 0, 375 / 70)
  })

  it("a rectangle about Y and about X (p119, p122)", () => {
    const rect = [p(10, 0), p(20, 0), p(20, 5), p(10, 5)]
    const profile = profileOf(polylineOf(rect, { closed: true }))
    near(revolveBase(profile, ORIGIN, Y), 0, 2.5)
    near(revolveBase(profile, ORIGIN, X), 15, 0)
  })

  it("an arc weighs its own centroid, an ellipse its centre", () => {
    const half = polylineOf([p(25, 0), p(15, 0)], {
      closed: true,
      bulges: [1, 0],
    })
    const r = 5
    near(
      revolveBase(profileOf(half), ORIGIN, Y),
      0,
      (Math.PI * r * ((2 * r) / Math.PI)) / (Math.PI * r + 2 * r)
    )
    const ellipse = profileOf(ellipseOf(p(30, 4), p(6, 0), 0.5))
    near(revolveBase(ellipse, ORIGIN, Y), 0, 4)
  })
})
