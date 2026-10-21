import { describe, expect, it, vi } from "vitest"
import type { LineEntity } from "../../domain/entities"
import {
  closestOnEntity,
  createSpline,
  lineStartZ,
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

  // probes circle/p212, p217: in UCS Z 30 a circle's quadrants are along the
  // UCS's axes, `_QUA` near its X and Y giving (8.660254, 5) and
  // (−5, 8.660254). Only the snap turns: the grips stay (desktop circle/d15).
  it.each([
    ["9.9,0", p(8.660254037844387, 4.999999999999999)],
    ["0,9.9", p(-4.999999999999998, 8.660254037844387)],
  ])("snaps to a circle's quadrants along a rotated UCS (%s)", (typed, at) => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 10, { id: "REF-C" })],
    })
    const answer = (...texts: string[]) => {
      for (const text of texts) {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    answer("ZOOM", "W", "-30,-30", "50,40", "UCS", "Z", "30")
    answer("LINE", "_QUA", typed, "30,30", "")
    expect(drawnLine(cad).start).toBeCloseToPoint(at, 9)
  })

  // probe ellipse/p300: a turned ellipse's quadrants are its axis ends.
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
  // probe ellipse/p306.
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
  // probe ellipse/p305: a whole ellipse has no end, `_END` at its param 0
  // (100,0 here) refused; an elliptical arc's ends are its start and end
  // points (p302's StartPoint, EndPoint).
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

    const whole = createHarness({
      entities: [ellipseOf(p(0, 0), p(100, 0), 0.5, { id: "REF-E" })],
      snap: true,
    })
    expect(missedWith(whole, SnapType.Endpoint, null, p(99, 2))[0]).toBe(
      "No Endpoint found for specified point."
    )
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

describe("an arc", () => {
  function typed(cad: CadHarness, ...texts: string[]): CadHarness {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  const ZOOM = ["ZOOM", "W", "-30,-30", "30,30"]
  /** The arc drawn by `arc`, then `then` typed: LINE's first point, in the WCS. */
  function lineFrom(arc: string[], ...then: string[]): number[] {
    const cad = typed(createHarness(), ...arc, ...ZOOM, ...then)
    const line = cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
      .at(-1)!
    return [line.start.x, line.start.y, lineStartZ(line)].map(
      (n) => +n.toFixed(4) + 0
    )
  }
  /** 10° to 170° of radius 10 about the origin (probes arc/p202–p205). */
  const ARC10 = [
    "ARC",
    "C",
    "0,0",
    "9.84807753,1.73648178",
    "-9.84807753,1.73648178",
  ]

  // probe arc/p202, the console's ID at each snap.
  it.each([
    ["END", "7,7", [9.8481, 1.7365, 0]],
    ["END", "-6,8", [-9.8481, 1.7365, 0]],
    ["MID", "7,7", [0, 10, 0]],
    ["CEN", "10<45", [0, 0, 0]],
    ["NEA", "7,7", [7.0711, 7.0711, 0]],
  ])("snaps %s of %s as AutoCAD does", (snap, aim, at) => {
    expect(lineFrom(ARC10, "LINE", snap, aim, "@", "")).toEqual(at)
  })

  // probe arc/p204: past the arc's start a line it would cross extended.
  it("finds no intersection beyond the arc's end", () => {
    const cad = typed(
      createHarness(),
      ...ARC10,
      ...ZOOM,
      ...["LINE", "9.95,-5", "9.95,5", ""],
      ...["LINE", "INT", "9.9,1.2"]
    )
    expect(cad.commandLog().slice(-2)).toEqual([
      "No Intersection found for specified point.",
      "Invalid point.",
    ])
  })

  // probe arc/p205: an arc with a line and with another arc.
  it.each([
    ["0.1,10", [0, 10, 0]],
    ["5,8.6", [5, 8.6603, 0]],
  ])("snaps INT of %s where it crosses", (aim, at) => {
    const set = [
      ...ARC10,
      ...["LINE", "0,0", "0,20", ""],
      ...["ARC", "C", "10,0", "20,0", "0,0"],
    ]
    expect(lineFrom(set, "LINE", "INT", aim, "@", "")).toEqual(at)
  })

  // probe arc/p207: both tangent points from 30,0 lie off the 300°–60° arc.
  it("refuses a Tangent whose points lie off the sweep", () => {
    const cad = typed(
      createHarness(),
      ...["ARC", "C", "0,0", "5,-8.66025404", "5,8.66025404"],
      ...ZOOM,
      ...["LINE", "30,0", "TAN", "10<-55"]
    )
    expect(cad.commandLog().slice(-2)).toEqual([
      "No found for specified point.",
      "Point or option keyword required.",
    ])
  })

  // probe arc/p203: in the WCS, only the quadrant on the 10°–170° arc.
  it("snaps to the quadrant its sweep passes through", () => {
    expect(lineFrom(ARC10, "LINE", "QUA", "10<12", "@", "")).toEqual([0, 10, 0])
  })

  // probe arc/p201: in UCS Z 30 the quadrants are the UCS's, kept where the
  // 0°–180° arc passes, so `_QUA` near either end gives the UCS's 90° point.
  it.each(["9.9<60", "9.9<145"])(
    "snaps to the UCS's quadrant on the sweep in a rotated UCS (%s)",
    (aim) => {
      const arc = ["ARC", "C", "0,0", "10,0", "-10,0", "UCS", "Z", "30"]
      expect(lineFrom(arc, "LINE", "QUA", aim, "@", "")).toEqual([
        -5, 8.6603, 0,
      ])
    }
  )

  // probe arc/p210: an arc drawn in UCS X 90, snapped in its plan.
  const TILTED = ["UCS", "X", "90", "ARC", "C", "0,0", "10,0", "-5,8.66025404"]
  it.each([
    ["QUA", "10<80", [0, 0, 10]],
    ["MID", "10<20", [5, 0, 8.6603]],
    ["QUA", "10<5", [10, 0, 0]],
  ])("snaps %s of %s on a tilted arc", (snap, aim, at) => {
    const set = [...TILTED, "PLAN", "C"]
    expect(lineFrom(set, "LINE", snap, aim, "@", "")).toEqual(at)
  })

  // probe arc/p211: the same arc, the UCS then turned 30° about its Z.
  it("snaps to the UCS's quadrant on a tilted arc", () => {
    const set = [...TILTED, "UCS", "Z", "30", "PLAN", "C"]
    expect(lineFrom(set, "LINE", "QUA", "10<55", "@", "")).toEqual([
      -5, 0, 8.6603,
    ])
  })

  // probe arc/p208: from 30,0 both feet (0° and 180°) lie off the 20°–160°
  // arc, refused in the shared words.
  it("refuses a Perpendicular whose feet lie off the sweep", () => {
    const cad = typed(
      createHarness(),
      ...["ARC", "C", "0,0", "9.39692621,3.42020143", "-9.39692621,3.42020143"],
      ...ZOOM,
      ...["LINE", "30,0", "PER", "10<25"]
    )
    expect(cad.commandLog().slice(-2)).toEqual([
      "No Perpendicular found for specified point.",
      "Point or option keyword required.",
    ])
    expect(cad.entities().filter((e) => e.type === "line")).toEqual([])
  })

  // probe arc/p209: the foot at 180° lies on the 20°–200° arc, though the one
  // at 0° is nearer the pick.
  it("keeps the Perpendicular's foot that lies on the sweep", () => {
    const arc = [
      ...["ARC", "C", "0,0", "9.39692621,3.42020143"],
      "-9.39692621,-3.42020143",
    ]
    const cad = typed(createHarness(), ...arc, ...ZOOM)
    typed(cad, "LINE", "30,0", "PER", "10<25", "")
    expect(drawnLine(cad).end).toBeCloseToPoint(p(-10, 0), 6)
  })
})

describe("an ellipse", () => {
  function typed(cad: CadHarness, ...texts: string[]): CadHarness {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  const ZOOM = ["ZOOM", "W", "-200,-200", "200,200"]
  /** The ellipse 0,0 → 50,0, 25 of probes ellipse/p300–p307. */
  const WHOLE = ["ELLIPSE", "C", "0,0", "50,0", "25"]
  const ARC = (from: number, to: number) => [
    ...["ELLIPSE", "A", "C", "0,0", "50,0", "25"],
    ...[String(from), String(to)],
  ]
  /** The shapes drawn by `set`, then `then` typed: LINE's first point, in the WCS. */
  function lineFrom(set: string[], ...then: string[]): number[] {
    const cad = typed(createHarness(), ...ZOOM, ...set, ...then)
    const line = cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
      .at(-1)!
    return [line.start.x, line.start.y, lineStartZ(line)].map(
      (n) => +n.toFixed(4) + 0
    )
  }
  /** What LINE's first prompt says when `snap` at `aim` finds nothing. */
  function refused(set: string[], snap: string, aim: string): string[] {
    const cad = typed(createHarness(), ...ZOOM, ...set, "LINE", snap, aim)
    expect(cad.entities().filter((e) => e.type === "line")).toEqual([])
    return cad.commandLog().slice(-2)
  }

  // probe ellipse/p307: `_NEA` at 40,16 → (39.546219, 15.297847).
  it("snaps Nearest onto a whole ellipse", () => {
    expect(lineFrom(WHOLE, "LINE", "NEA", "40,16", "@", "")).toEqual([
      39.5462, 15.2978, 0,
    ])
  })

  // The arc 10°→100° of p302: p307's point lies on it; past its start the
  // nearest point is the start itself.
  it("snaps Nearest onto an elliptical arc, its nearer end off the sweep", () => {
    const set = ARC(10, 100)
    expect(lineFrom(set, "LINE", "NEA", "40,16", "@", "")).toEqual([
      39.5462, 15.2978, 0,
    ])
    expect(lineFrom(set, "LINE", "NEA", "50,5", "@", "")).toEqual([
      47.1538, 8.3145, 0,
    ])
  })

  // probe ellipse/p303: halfway along the quarter arc's length, not at its
  // middle parameter (35.3553, 17.6777).
  it("snaps Midpoint halfway along an elliptical arc", () => {
    expect(lineFrom(ARC(0, 90), "LINE", "MID", "35.36,17.68", "@", "")).toEqual(
      [29.7236, 20.1029, 0]
    )
  })

  // probes ellipse/p304, p305: a whole ellipse has no midpoint and no end.
  it.each([
    ["MID", "35.36,17.68", "No Midpoint found for specified point."],
    ["END", "49.9,1", "No Endpoint found for specified point."],
  ])("refuses %s on a whole ellipse", (snap, aim, said) => {
    expect(refused(WHOLE, snap, aim)).toEqual([said, "Invalid point."])
  })

  // probe ellipse/p306: CEN picked on the curve.
  it("snaps Center from the curve", () => {
    expect(lineFrom(WHOLE, "LINE", "CEN", "0,25", "@", "")).toEqual([0, 0, 0])
  })

  // probe ellipse/p300: the ellipse turned 30°, picked near its world top.
  it("snaps Quadrant to a turned ellipse's own axis end", () => {
    const set = ["ELLIPSE", "C", "0,0", "@50<30", "25"]
    expect(lineFrom(set, "LINE", "QUA", "24.55,33.07", "@", "")).toEqual([
      43.3013, 25, 0,
    ])
  })

  // probe ellipse/p301: in UCS Z 30 the quadrants stay the ellipse's own
  // axis ends, unlike a circle's (circle/p212).
  it("keeps an ellipse's own quadrants in a rotated UCS", () => {
    const set = [...WHOLE, "UCS", "Z", "30"]
    expect(lineFrom(set, "LINE", "QUA", "*-37.8,16.37", "@", "")).toEqual([
      -50, 0, 0,
    ])
  })

  // probe ellipse/p302: only the quadrants the 10°→100° arc passes.
  it("snaps Quadrant only on an elliptical arc's sweep", () => {
    expect(
      lineFrom(ARC(10, 100), "LINE", "QUA", "47.15,8.31", "@", "")
    ).toEqual([0, 25, 0])
  })
})
