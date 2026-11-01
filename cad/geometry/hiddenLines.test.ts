import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { solidPair } from "../../test/arbitraries"

import { Vec3, add3, length3, normalize3, scale3, sub3 } from "./Vec3"
import { bsplineDomain, bsplinePoint } from "./nurbs"
import { Brep, Wire, boxBrep, roundBrep, sphereBrep, torusBrep } from "./solids"
import { brepBoolean } from "./solidBooleans"
import { extrusionBrep, revolutionBrep } from "./sweeps"
import { pointInSolid } from "./brepQueries"
import { brepBox } from "./solids"
import { ViewLine, viewLines } from "./hiddenLines"

const X: Vec3 = { x: 1, y: 0, z: 0 }
const Y: Vec3 = { x: 0, y: 1, z: 0 }
const Z: Vec3 = { x: 0, y: 0, z: 1 }
const SW_ISO: Vec3 = { x: -1, y: -1, z: 1 }

const box = (
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number
) => boxBrep({ x, y, z }, scale3(X, dx), scale3(Y, dy), scale3(Z, dz))

/** A wire's points, every `n`th of its length. */
function wirePoints(wire: Wire, n = 64): Vec3[] {
  return Array.from({ length: n + 1 }, (_, i) => wireAt(wire, i / n))
}

function wireAt(wire: Wire, f: number): Vec3 {
  switch (wire.kind) {
    case "line":
      return add3(wire.start, scale3(sub3(wire.end, wire.start), f))
    case "curve": {
      const { start, end } = bsplineDomain(wire.curve)
      return bsplinePoint(wire.curve, start + (end - start) * f)
    }
    case "arc": {
      const r = sub3(wire.start, wire.center)
      const n = normalize3(wire.normal)!
      const t = {
        x: n.y * r.z - n.z * r.y,
        y: n.z * r.x - n.x * r.z,
        z: n.x * r.y - n.y * r.x,
      }
      const a = wire.sweep * f
      return add3(
        wire.center,
        add3(scale3(r, Math.cos(a)), scale3(t, Math.sin(a)))
      )
    }
  }
}

function wireLength(wire: Wire): number {
  if (wire.kind === "arc") return wire.radius * Math.abs(wire.sweep)
  const ps = wirePoints(wire, 2048)
  let sum = 0
  for (let i = 1; i < ps.length; i++) sum += length3(sub3(ps[i], ps[i - 1]))
  return sum
}

const total = (lines: readonly ViewLine[], visible: boolean) =>
  lines
    .filter((l) => l.visible === visible)
    .reduce((s, l) => s + wireLength(l.wire), 0)

describe("hidden lines", () => {
  it("show a box's nine edges round its three faces towards the viewer", () => {
    const [lines] = viewLines([box(0, 0, 0, 10, 10, 10)], SW_ISO)
    expect(total(lines, true)).toBeCloseTo(90, 6)
    expect(total(lines, false)).toBeCloseTo(30, 6)
  })

  it("show a cylinder's top, its base's front half and its two outlines", () => {
    const [lines] = viewLines(
      [roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1)],
      SW_ISO
    )
    expect(total(lines, true)).toBeCloseTo(
      2 * Math.PI * 5 + Math.PI * 5 + 20,
      3
    )
    expect(total(lines, false)).toBeCloseTo(Math.PI * 5, 3)
  })

  it("find a cylinder's outline on its seam (u = 0)", () => {
    // Seen from the front, its outlines are the rulings at u = 0 and π.
    const [lines] = viewLines(
      [roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1)],
      { x: 0, y: -1, z: 0 }
    )
    const rulings = lines.filter((l) => l.wire.kind === "line")
    expect(
      rulings
        .map((l) => l.wire.kind === "line" && Math.round(l.wire.start.x))
        .sort()
    ).toEqual([-5, 5])
    expect(rulings.every((l) => l.visible)).toBe(true)
  })

  it("draw no outline of a cylinder seen down its axis", () => {
    const [lines] = viewLines(
      [roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1)],
      Z
    )
    expect(lines.filter((l) => l.wire.kind === "line")).toEqual([])
    expect(total(lines, true)).toBeCloseTo(4 * Math.PI * 5, 6)
  })

  it("show a sphere's outline whole and nothing else", () => {
    const [lines] = viewLines(
      [sphereBrep({ x: 1, y: 2, z: 3 }, Z, X, 5)],
      SW_ISO
    )
    expect(lines.every((l) => l.visible)).toBe(true)
    expect(total(lines, true)).toBeCloseTo(2 * Math.PI * 5, 6)
  })

  it("show a doughnut's outer outline and the hole's front", () => {
    const [lines] = viewLines([torusBrep({ x: 0, y: 0, z: 0 }, Z, X, 6, 2)], Z)
    // Seen along its axis: the outer circle and the hole's, both shown.
    expect(total(lines, true)).toBeCloseTo(2 * Math.PI * 8 + 2 * Math.PI * 4, 1)
  })

  it("see nothing along no direction", () => {
    expect(viewLines([box(0, 0, 0, 1, 1, 1)], { x: 0, y: 0, z: 0 })).toEqual([
      [],
    ])
  })

  it("hide a solid behind another", () => {
    const [front, back] = viewLines(
      [box(0, 0, 0, 10, 10, 10), box(2, 2, -20, 2, 2, 2)],
      Z
    )
    expect(total(front, true)).toBeGreaterThan(0)
    expect(back.every((l) => !l.visible)).toBe(true)
  })

  it("show a compound's edges where its pieces meet (union/k01)", () => {
    const u = brepBoolean(
      "union",
      box(0, 0, 0, 10, 10, 10),
      box(5, 5, 5, 10, 10, 15)
    )!
    const [lines] = viewLines([u], SW_ISO)
    expect(total(lines, true)).toBeGreaterThan(0)
    expect(total(lines, false)).toBeGreaterThan(0)
  })
})

/** Steps along a ray towards the viewer the oracle looks for a solid in. */
const ORACLE_STEPS = 16

/** That no shown stretch has a solid in front of it, read by stepping towards the viewer. */
function expectNothingInFront(breps: Brep[], w: Vec3, kind = ""): void {
  const boxes = breps.map((x) => brepBox(x)!)
  const reach = Math.max(
    ...boxes.flatMap((x) => [
      x.max.x - x.min.x,
      x.max.y - x.min.y,
      x.max.z - x.min.z,
    ])
  )
  const unit = normalize3(w)!
  for (const line of viewLines(breps, w).flat()) {
    if (!line.visible) continue
    if (wireLength(line.wire) < reach * 1e-3) continue
    for (const f of [0.5]) {
      const p = wireAt(line.wire, f)
      for (let k = 1; k <= ORACLE_STEPS; k++) {
        const q = add3(p, scale3(unit, (2 * reach * k) / ORACLE_STEPS))
        for (const x of breps) {
          expect(pointInSolid(x, q, 1e-6), kind).not.toBe("inside")
        }
      }
    }
  }
}

describe("hidden lines where solids touch", () => {
  it("show what solids face to face, edge to edge and tangent leave in front", () => {
    const stacked = [box(0, 0, 0, 10, 10, 10), box(0, 0, 10, 10, 10, 10)]
    const shifted = [box(0, 0, 0, 10, 10, 10), box(5, 5, 10, 10, 10, 10)]
    const tangent = [
      roundBrep({ x: 0, y: 0, z: 0 }, Z, X, 5, 5, 10, 1),
      roundBrep({ x: 10, y: 0, z: 0 }, Z, X, 5, 5, 10, 1),
    ]
    const ball = [
      box(0, 0, 0, 10, 10, 10),
      sphereBrep({ x: 5, y: 5, z: 15 }, Z, X, 5),
    ]
    for (const breps of [stacked, shifted, tangent, ball]) {
      for (const w of [
        SW_ISO,
        Z,
        { x: 0, y: -1, z: 0 },
        { x: 1, y: 0.3, z: -0.4 },
      ]) {
        expectNothingInFront(breps, w)
      }
    }
    // Stacked, the lower box shows only its front faces' edges below the upper's.
    const [lower] = viewLines(stacked, SW_ISO)
    expect(total(lower, true)).toBeCloseTo(70, 6)
  })
})

describe("hidden lines of swept solids", () => {
  // Counter-clockwise, as a region's outline runs: the base, then the arch back.
  const arch = extrusionBrep(
    {
      axes: { x: X, y: Y, z: Z },
      elevation: 0,
      faces: [
        {
          loops: [
            [
              { kind: "line", start: { x: 0, y: 0 }, end: { x: 10, y: 0 } },
              {
                kind: "spline",
                curve: {
                  degree: 3,
                  knots: [0, 0, 0, 0, 1, 1, 1, 1],
                  controlPoints: [
                    { x: 10, y: 0, z: 0 },
                    { x: 10, y: 12, z: 0 },
                    { x: 0, y: 12, z: 0 },
                    { x: 0, y: 0, z: 0 },
                  ],
                },
                from: 0,
                to: 1,
              },
            ],
          ],
        },
      ],
    },
    { x: 2, y: 1, z: 10 }
  )!
  // An ellipse turned round Z: a flattened ring.
  const ring = revolutionBrep(
    {
      axes: { x: X, y: Z, z: { x: 0, y: -1, z: 0 } },
      elevation: 0,
      faces: [
        {
          loops: [
            [
              {
                kind: "ellipse",
                center: { x: 10, y: 0 },
                majorAxis: { x: 3, y: 0 },
                ratio: 0.5,
                startParam: 0,
                sweep: 2 * Math.PI,
              },
            ],
          ],
        },
      ],
    },
    { x: 0, y: 0, z: 0 },
    Z,
    X,
    0,
    2 * Math.PI
  )

  it("hide what lies behind an extruded spline and show its outlines", () => {
    const behind = box(2, 20, 2, 4, 4, 4)
    for (const w of [
      SW_ISO,
      { x: 0, y: -1, z: 0 },
      { x: 0.2, y: -1, z: 0.1 },
    ]) {
      expectNothingInFront([arch, behind], w)
    }
    const [shape, back] = viewLines([arch, behind], { x: 0, y: -1, z: 0 })
    expect(total(shape, true)).toBeGreaterThan(0)
    expect(back.every((l) => !l.visible)).toBe(true)
  })

  it("show a turned ring's outlines from its side and from above, a solid behind hidden", () => {
    const behind = box(-2, 30, -1, 4, 4, 2)
    for (const w of [{ x: 0, y: -1, z: 0 }, SW_ISO, Z]) {
      expectNothingInFront([ring, behind], w)
    }
    // From the side its outline is the ellipse at each end and the lines over and under it.
    const [side, back] = viewLines([ring, behind], { x: 0, y: -1, z: 0 })
    expect(total(side, true)).toBeGreaterThan(40)
    expect(back.every((l) => !l.visible)).toBe(true)
    // From above, the circles at its widest and narrowest.
    const [top] = viewLines([ring], Z)
    expect(total(top, true)).toBeCloseTo(2 * Math.PI * 13 + 2 * Math.PI * 7, 1)
  })
})

describe("hidden lines of any solids", () => {
  it("show no stretch that a solid lies in front of", () => {
    const direction = fc
      .tuple(
        fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
        fc.double({ min: -1.4, max: 1.4, noNaN: true })
      )
      .map(([a, e]) => ({
        x: Math.cos(e) * Math.cos(a),
        y: Math.cos(e) * Math.sin(a),
        z: Math.sin(e),
      }))
    fc.assert(
      fc.property(solidPair, direction, ({ a, b, kind }, w) =>
        expectNothingInFront([a, b], w, kind)
      ),
      { numRuns: 8 }
    )
  }, 60_000)
})
