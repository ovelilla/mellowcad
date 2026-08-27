import { describe, expect, it, vi } from "vitest"
import type { LineEntity } from "../../domain/entities"
import { V } from "../../geometry/Vec2"
import { SnapType } from "./types"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"

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

    const drawn = secondPointWith(cad, SnapType.Tangent, p(10, 0), p(33, 95))

    expect(drawn.end).toBeCloseToPoint(p(33, 95))
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
  it("continues a line past its endpoint", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "REF-L" })],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.Extension, p(150, 3))

    expect(drawn.start).toBeCloseToPoint(p(150, 0), 5)
  })

  it("does not fire over the segment itself", () => {
    // Extension is about the *prolongation*; over the body the endpoint and
    // midpoint snaps already do the job.
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "REF-L" })],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.Extension, p(50, 3))

    expect(drawn.start).toBeCloseToPoint(p(50, 3))
  })
})

describe("apparent intersection", () => {
  it("snaps where two lines would meet if extended", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(0, 0), { id: "REF-A" }),
        lineOf(p(200, -100), p(200, -50), { id: "REF-B" }),
      ],
      snap: true,
    })

    const drawn = firstPointWith(cad, SnapType.ApparentIntersection, p(200, 3))

    expect(drawn.start).toBeCloseToPoint(p(200, 0), 5)
  })

  it("also crosses the live rubber band against existing edges", () => {
    // The in-progress segment participates as construction geometry, which is
    // what makes the snap useful while drawing rather than only afterwards.
    const cad = createHarness({
      entities: [lineOf(p(200, -100), p(200, -50), { id: "REF-B" })],
      snap: true,
    })

    const drawn = secondPointWith(
      cad,
      SnapType.ApparentIntersection,
      p(0, 0),
      p(198, 40)
    )

    expect(drawn.end.x).toBeCloseTo(200, 4)
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

    const drawn = secondPointWith(
      cad,
      SnapType.Parallel,
      p(100, -100),
      p(297.6, 53.2)
    )

    expect(drawn.end).toBeCloseToPoint(p(297.6, 53.2), 4)
  })
})
