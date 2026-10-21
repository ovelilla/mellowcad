import { describe, expect, it, vi } from "vitest"
import type { LineEntity } from "../../domain/entities"
import {
  closestOnEntity,
  createSpline,
  withElevation,
} from "../../domain/entities"
import { V } from "../../geometry/Vec2"
import { SnapType } from "./types"
import { createHarness, type CadHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"

/**
 * The individual snap providers, each forced through the one-shot override so
 * exactly one is under test. Most of them are off by default precisely because
 * they are greedy, which also means they are the least exercised by hand.
 */

function drawnLine(cad: CadHarness): LineEntity {
  return cad
    .entities()
    .find((e): e is LineEntity => e.type === "line" && !e.id.startsWith("REF"))!
}

/**
 * Places the *first* point of a segment with `snap` forced. Used for snaps that
 * need no anchor: at the first prompt there is no rubber band yet, so nothing
 * competes with the geometry under test.
 */
function firstPointWith(
  cad: CadHarness,
  snap: SnapType,
  aim: { x: number; y: number }
): LineEntity {
  cad.command("LINE")
  cad.runtime.setSnapOverride(snap)
  cad.click(aim).click(p(900, 900)).escape()
  return drawnLine(cad)
}

/**
 * Forces `snap` at the first point, or at the one after `from`, aiming at
 * where it finds nothing: AutoCAD refuses the pick in the snap's words, then
 * in the prompt's (probes line/p36, p156). What the history ends with.
 */
function missedWith(
  cad: CadHarness,
  snap: SnapType,
  from: { x: number; y: number } | null,
  aim: { x: number; y: number }
): string[] {
  cad.command("LINE")
  if (from) cad.click(from)
  cad.runtime.setSnapOverride(snap)
  cad.click(aim)
  expect(cad.state().snapOverride).toBeNull()
  expect(cad.entities().filter((e) => !e.id.startsWith("REF"))).toEqual([])
  return cad.commandLog().slice(-2)
}

/** Places the *second* point with `snap` forced, for snaps that need an anchor. */
function secondPointWith(
  cad: CadHarness,
  snap: SnapType,
  from: { x: number; y: number },
  aim: { x: number; y: number }
): LineEntity {
  cad.command("LINE").click(from)
  cad.runtime.setSnapOverride(snap)
  cad.click(aim).escape()
  return drawnLine(cad)
}

describe("quadrant", () => {
  it("snaps to a circle's cardinal points", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 100, { id: "REF-C" })],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.Quadrant, p(3, 103))

    expect(drawn.start).toBeCloseToPoint(p(0, 100), 5)
  })

  it("snaps to an ellipse's axis ends, not the world's cardinals", () => {
    const cad = createHarness({
      // Major axis at 45°, so no quadrant of this ellipse points along +X.
      entities: [ellipseOf(p(0, 0), p(70.71, 70.71), 0.5, { id: "REF-E" })],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.Quadrant, p(68, 74))

    expect(drawn.start).toBeCloseToPoint(p(70.71, 70.71), 4)
  })
})

describe("center", () => {
  it("snaps to an ellipse's centre", () => {
    const cad = createHarness({
      entities: [ellipseOf(p(40, 20), p(100, 0), 0.5, { id: "REF-E" })],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.Center, p(44, 23))

    expect(drawn.start).toBeCloseToPoint(p(40, 20), 5)
  })
})

describe("endpoint", () => {
  it("offers an elliptical arc's ends, and a whole ellipse none", () => {
    const cad = createHarness({
      entities: [
        ellipseOf(p(0, 0), p(100, 0), 0.5, {
          id: "REF-E",
          startParam: 0,
          endParam: Math.PI / 2,
        }),
      ],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.Endpoint, p(3, 47))

    expect(drawn.start).toBeCloseToPoint(p(0, 50), 5)
  })
})

describe("perpendicular", () => {
  it("drops onto the foot of the perpendicular from the anchor", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "REF-L" })],
      snap: true,
    })

    const drawn = secondPointWith(
      cad,
      SnapType.Perpendicular,
      p(50, -100),
      p(120, 0)
    )

    expect(drawn.end).toBeCloseToPoint(p(50, 0), 5)
  })

  it("engages anywhere over the object, not just near the foot", () => {
    // Perpendicular reports its *pick* distance as the distance to the line, so
    // hovering the far end of a long line still offers the foot.
    const cad = createHarness({
      entities: [lineOf(p(-500, 0), p(500, 0), { id: "REF-L" })],
      snap: true,
    })

    const drawn = secondPointWith(
      cad,
      SnapType.Perpendicular,
      p(0, -100),
      p(480, 2)
    )

    expect(drawn.end).toBeCloseToPoint(p(0, 0), 5)
  })
})

describe("tangent", () => {
  it("touches the circle at a right angle to the radius", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 100, { id: "REF-C" })],
      snap: true,
    })
    const anchor = p(300, 0)

    const drawn = secondPointWith(cad, SnapType.Tangent, anchor, p(33, 95))

    expect(V.distance(drawn.end, p(0, 0))).toBeCloseTo(100, 5)
    expect(
      V.dot(V.sub(anchor, drawn.end), V.sub(drawn.end, p(0, 0)))
    ).toBeCloseTo(0, 4)
  })

  it("offers nothing from inside the circle", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 100, { id: "REF-C" })],
      snap: true,
    })

    // probe line/p36: Tangent's name is left out of the refusal.
    expect(missedWith(cad, SnapType.Tangent, p(10, 0), p(33, 95))).toEqual([
      "No found for specified point.",
      "Point or option keyword required.",
    ])
  })
})

describe("perpendicular and tangent on arcs and polylines", () => {
  it("drops onto the polyline segment under the cursor", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(200, -400), p(200, 0), p(500, 0)], { id: "REF-P" }),
      ],
      snap: true,
    })

    const drawn = secondPointWith(
      cad,
      SnapType.Perpendicular,
      p(0, -200),
      p(202, -300)
    )

    expect(drawn.end).toBeCloseToPoint(p(200, -200), 5)
  })

  it("runs through an arc's centre", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 100, deg(0), deg(180), { id: "REF-A" })],
      snap: true,
    })

    const drawn = secondPointWith(
      cad,
      SnapType.Perpendicular,
      p(0, 300),
      p(71, 71)
    )

    expect(drawn.end).toBeCloseToPoint(p(0, 100), 5)
  })

  it("touches an arc, on the arc itself", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 100, deg(0), deg(180), { id: "REF-A" })],
      snap: true,
    })
    const anchor = p(300, 0)

    const drawn = secondPointWith(cad, SnapType.Tangent, anchor, p(-71, 71))

    expect(V.distance(drawn.end, p(0, 0))).toBeCloseTo(100, 5)
    expect(drawn.end.y).toBeGreaterThan(0)
    expect(
      V.dot(V.sub(anchor, drawn.end), V.sub(drawn.end, p(0, 0)))
    ).toBeCloseTo(0, 4)
  })
})

describe("nearest", () => {
  it("lands on the outline wherever the cursor is", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "REF-L" })],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.Nearest, p(37, 4))

    expect(drawn.start).toBeCloseToPoint(p(37, 0), 5)
  })
})

describe("extension", () => {
  /** Dwells on `end` so it is acquired, as passing the cursor over it does. */
  function acquire(cad: CadHarness, end: { x: number; y: number }): void {
    cad.moveTo(end)
    vi.advanceTimersByTime(300)
    cad.moveTo(end)
  }

  it("continues a line past an endpoint the cursor passed over", () => {
    vi.useFakeTimers()
    try {
      const cad = createHarness({
        entities: [lineOf(p(0, 0), p(100, 0), { id: "REF-L" })],
        snap: true,
      })
      cad.press("F11")
      cad.runtime.setSnapEnabled(SnapType.Extension, true)

      cad.command("LINE")
      acquire(cad, p(100, 0))
      cad.click(p(150, 3)).click(p(900, 900)).escape()

      expect(drawnLine(cad).start).toBeCloseToPoint(p(150, 0), 5)
    } finally {
      vi.useRealTimers()
    }
  })

  it("prolongs nothing the cursor has not passed over", () => {
    // "when you pass the cursor over the endpoint of objects"
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "REF-L" })],
      snap: true,
    })

    // probe line/p156: `_EXT of 120,0` past a line's end.
    expect(missedWith(cad, SnapType.Extension, null, p(150, 3))).toEqual([
      "No found for specified point.",
      "Invalid point.",
    ])
  })

  it("does not fire over the segment itself", () => {
    vi.useFakeTimers()
    try {
      const cad = createHarness({
        entities: [lineOf(p(0, 0), p(100, 0), { id: "REF-L" })],
        snap: true,
      })
      cad.press("F11")
      cad.runtime.setSnapEnabled(SnapType.Extension, true)
      cad.runtime.setSnapEnabled(SnapType.Endpoint, false)
      cad.runtime.setSnapEnabled(SnapType.Midpoint, false)

      expect(missedWith(cad, SnapType.Extension, null, p(50, 3))).toEqual([
        "No found for specified point.",
        "Invalid point.",
      ])
    } finally {
      vi.useRealTimers()
    }
  })

  it("continues an arc round its circle past the end", () => {
    vi.useFakeTimers()
    try {
      const cad = createHarness({
        entities: [arcOf(p(0, 0), 100, deg(0), deg(90), { id: "REF-A" })],
        snap: true,
      })
      cad.press("F11")
      cad.runtime.setSnapEnabled(SnapType.Extension, true)

      cad.command("LINE")
      acquire(cad, p(0, 100))
      cad.moveTo(p(-72, 70))

      const snap = cad.state().snap
      expect(snap?.type).toBe(SnapType.Extension)
      expect(V.length(snap!.point)).toBeCloseTo(100, 6)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe("apparent intersection", () => {
  it("snaps where two objects cross in the view at different heights", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0), { id: "REF-A" }),
        withElevation(lineOf(p(20, -100), p(20, 100), { id: "REF-B" }), 30),
      ],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.ApparentIntersection, p(22, 3))

    expect(drawn.start).toBeCloseToPoint(p(20, 0), 5)
  })

  it("leaves two lines that would only meet if extended", () => {
    // Extended intersections are picked object by object as an override in
    // AutoCAD; the running snap never offers one in empty space.
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(0, 0), { id: "REF-A" }),
        lineOf(p(200, -100), p(200, -50), { id: "REF-B" }),
      ],
      snap: true,
    })

    expect(
      missedWith(cad, SnapType.ApparentIntersection, null, p(200, 3))
    ).toEqual(["No found for specified point.", "Invalid point."])
  })

  it("crosses an engaged polar alignment path with an edge", () => {
    // "Use polar tracking with Intersection and Apparent Intersection object
    // snaps to find where a polar alignment path intersects another object."
    const cad = createHarness({
      entities: [lineOf(p(200, -100), p(200, -50), { id: "REF-B" })],
      snap: true,
    })
    cad.press("F10")

    const drawn = secondPointWith(
      cad,
      SnapType.ApparentIntersection,
      p(0, 0),
      p(198, 4)
    )

    expect(drawn.end).toBeCloseToPoint(p(200, 0), 5)
  })

  it("never takes the rubber band for an edge", () => {
    const cad = createHarness({
      entities: [lineOf(p(200, -100), p(200, -50), { id: "REF-B" })],
      snap: true,
    })

    expect(
      missedWith(cad, SnapType.ApparentIntersection, p(0, 0), p(198, 40))
    ).toEqual([
      "No found for specified point.",
      "Point or option keyword required.",
    ])
  })
})

describe("parallel", () => {
  it("locks the new segment parallel to a line that was hovered first", () => {
    // AutoCAD acquires a parallel reference by dwelling on the object; without
    // that acquisition the snap must stay silent, or it would fire against
    // every line in the drawing at once.
    vi.useFakeTimers()
    try {
      const reference = lineOf(p(-200, -100), p(0, 50), { id: "REF-L" })
      const cad = createHarness({ entities: [reference], snap: true })

      cad.command("LINE").click(p(100, -100))
      cad.runtime.setSnapOverride(SnapType.Parallel)

      // Dwell over the reference so its direction is acquired...
      cad.moveTo(p(-100, -25))
      vi.advanceTimersByTime(300)
      cad.moveTo(p(-100, -25))

      // ...then aim close to, but not exactly along, the parallel ray.
      cad.click(p(297.6, 53.2)).escape()

      const drawn = drawnLine(cad)
      const referenceDir = V.normalize(V.sub(reference.end, reference.start))
      const drawnDir = V.normalize(V.sub(drawn.end, drawn.start))
      expect(V.cross(referenceDir, drawnDir)).toBeCloseTo(0, 6)
    } finally {
      vi.useRealTimers()
    }
  })

  it("stays silent until a reference has been acquired", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, -100), p(0, 50), { id: "REF-L" })],
      snap: true,
    })

    // probe line/p156: `_PAR to 50,1` with nothing acquired.
    expect(
      missedWith(cad, SnapType.Parallel, p(100, -100), p(297.6, 53.2))
    ).toEqual([
      "No found for specified point.",
      "Point or option keyword required.",
    ])
  })
})

describe("on a spline", () => {
  const spline = () =>
    createSpline("fit", [p(0, 0), p(100, 80), p(200, 0)], { id: "REF-S" })

  it("snaps to its ends", () => {
    const cad = createHarness({ entities: [spline()], snap: true })

    const drawn = firstPointWith(cad, SnapType.Endpoint, p(197, 3))

    expect(drawn.start).toBeCloseToPoint(p(200, 0), 5)
  })

  it("snaps to the point halfway along it", () => {
    const cad = createHarness({ entities: [spline()], snap: true })

    // Symmetric fit points, so halfway along is the middle one.
    const drawn = firstPointWith(cad, SnapType.Midpoint, p(100, 76))

    expect(drawn.start).toBeCloseToPoint(p(100, 80), 3)
  })

  it("snaps to the nearest point on the curve", () => {
    const cad = createHarness({ entities: [spline()], snap: true })

    const drawn = firstPointWith(cad, SnapType.Nearest, p(100, 82))

    expect(drawn.start.x).toBeCloseTo(100, 3)
    expect(drawn.start.y).toBeCloseTo(80, 3)
  })

  it("snaps where a line crosses it, and nowhere along its own chords", () => {
    const cad = createHarness({
      entities: [spline(), lineOf(p(50, -50), p(50, 150), { id: "REF-L" })],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.Intersection, p(51, 60))
    const crossing = closestOnEntity(spline(), drawn.start)

    expect(drawn.start.x).toBeCloseTo(50, 5)
    expect(crossing.distance).toBeLessThan(1e-3)
  })
})

describe("a polyline's arc segment", () => {
  // A half circle of radius 50 about (50, 0), bulging below the chord.
  const arched = () =>
    polylineOf([p(0, 0), p(100, 0)], { id: "REF-P", bulges: [1, 0] })

  it("has a centre", () => {
    const cad = createHarness({ entities: [arched()], snap: true })

    const drawn = firstPointWith(cad, SnapType.Center, p(52, 2))

    expect(drawn.start).toBeCloseToPoint(p(50, 0), 5)
  })

  it("has the quadrants its sweep passes through", () => {
    const cad = createHarness({ entities: [arched()], snap: true })

    const drawn = firstPointWith(cad, SnapType.Quadrant, p(52, -48))

    expect(drawn.start).toBeCloseToPoint(p(50, -50), 5)
  })
})
