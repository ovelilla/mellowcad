import { describe, expect, it, onTestFinished, vi } from "vitest"
import type { LineEntity } from "../../domain/entities"
import type { Vec2 } from "../../geometry/Vec2"
import { SnapType } from "./types"
import { createHarness } from "../../../test/harness"
import { CadRuntime } from "../CadRuntime"
import { createRecordingHost } from "../CadDriver"
import { circleOf, lineOf, p } from "../../../test/builders"
import { THEME } from "../../scene/theme"

/**
 * Object snapping decides where a pick *actually* lands, so it is both the most
 * valuable feature and the easiest to break invisibly: a wrong priority or a
 * missing visibility check only shows up as "my line ended up 2 mm off".
 *
 * Every test here draws a real segment and inspects the geometry that came out,
 * rather than poking at the snap engine's internals.
 */

const REFERENCE = lineOf(p(0, 0), p(100, 0), { id: "REF" })

describe("running object snaps", () => {
  it("pulls a pick onto a nearby endpoint", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(100, 0))
  })

  it("pulls a pick onto a midpoint", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })
    cad.runtime.setSnapEnabled(SnapType.Midpoint, true)

    cad.command("LINE").click(p(52, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(50, 0))
  })

  it("pulls a pick onto a circle's centre", () => {
    const cad = createHarness({
      entities: [circleOf(p(200, 200), 80, { id: "C1" })],
      snap: true,
    })

    cad.command("LINE").click(p(202, 202)).click(p(0, 0)).escape()

    expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(200, 200))
  })

  it("pulls a pick onto an intersection", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0), { id: "H" }),
        lineOf(p(0, -100), p(0, 100), { id: "V" }),
      ],
      snap: true,
    })

    cad.command("LINE").click(p(3, 3)).click(p(200, 200)).escape()

    const drawn = cad
      .entities()
      .find(
        (e) => e.type === "line" && e.id !== "H" && e.id !== "V"
      ) as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(0, 0))
  })

  it("leaves the pick alone once snapping is off", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })
    cad.press("F3")

    cad.command("LINE").click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(102, 2))
  })

  it("never snaps to geometry on a hidden layer", () => {
    const cad = createHarness({ snap: true })
    const hidden = cad.runtime.createLayer("Hidden")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "REF", layerId: hidden }),
    ])
    cad.runtime.updateLayer(hidden, { visible: false })
    cad.runtime.setCurrentLayer("0")

    cad.command("LINE").click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(102, 2))
  })

  it("still snaps to geometry on a locked layer", () => {
    // Locked objects cannot be edited, but they remain valid reference points.
    const cad = createHarness({ snap: true })
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "REF", layerId: locked }),
    ])
    cad.runtime.updateLayer(locked, { locked: true })
    cad.runtime.setCurrentLayer("0")

    cad.command("LINE").click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(100, 0))
  })

  it("ships with AutoCAD's default running set", () => {
    // OSMODE 4133: Endpoint + Center + Intersection + Extension.
    const cad = createHarness()
    const enabled = cad.state().snapEnabled
    const on = Object.entries(enabled)
      .filter(([, value]) => value)
      .map(([type]) => type)

    expect(on.sort()).toEqual(
      [
        SnapType.Endpoint,
        SnapType.Center,
        SnapType.Intersection,
        SnapType.Extension,
      ].sort()
    )
  })

  it("ships with polar tracking on, at 90 degrees", () => {
    // AUTOSNAP 63 includes polar tracking; POLARANG starts at 90.
    const runtime = new CadRuntime(createRecordingHost(), null, null, null)

    expect(runtime.getState().polarActive).toBe(true)
    expect(runtime.getState().polarAngleStep).toBe(90)
  })
})

describe("one-shot snap override", () => {
  it("forces a snap that is not in the running set", () => {
    // Perpendicular is off by default; the override must beat both the running
    // set and the higher-priority snaps that would otherwise win.
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "REF" })],
      snap: true,
    })

    cad.command("LINE").click(p(0, -100))
    cad.runtime.setSnapOverride(SnapType.Perpendicular)
    cad.click(p(60, 0)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    // The foot of the perpendicular from (0, −100) is (0, 0): a vertical line.
    expect(drawn.end).toBeCloseToPoint(p(0, 0), 5)
  })

  it("is consumed by the pick it applied to", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "REF" })],
      snap: true,
    })

    cad.command("LINE").click(p(0, -100))
    cad.runtime.setSnapOverride(SnapType.Perpendicular)
    cad.click(p(60, 0))

    expect(cad.state().snapOverride).toBeNull()
  })

  it("suppresses snapping entirely with None", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE")
    cad.runtime.setSnapOverride("none")
    cad.click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(102, 2))
  })

  it("is dropped by Escape", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE")
    cad.runtime.setSnapOverride(SnapType.Perpendicular)
    cad.escape()

    expect(cad.state().snapOverride).toBeNull()
  })
})

describe("snap markers", () => {
  it("reports the engaged snap so the UI can draw its glyph", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").moveTo(p(101, 1))

    expect(cad.state().snap?.type).toBe(SnapType.Endpoint)
    expect(cad.state().snap?.point).toBeCloseToPoint(p(100, 0))
  })

  it("reports nothing when the cursor is in open space", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").moveTo(p(400, 400))

    expect(cad.state().snap).toBeNull()
  })
})

describe("which snap wins", () => {
  it("takes the point nearest the cursor, not the first snap type", () => {
    // "the selected snap modes are applied to return a point closest to the
    // center of the aperture box"
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(12, 0), { id: "REF" })],
      snap: true,
    })
    cad.runtime.setSnapEnabled(SnapType.Midpoint, true)

    cad.command("LINE").click(p(6.5, 1)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(6, 0))
  })

  it("takes an intersection under the cursor over an endpoint a few pixels off", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "H" }),
        lineOf(p(6, -50), p(6, 50), { id: "V" }),
      ],
      snap: true,
    })

    cad.command("LINE").click(p(6.5, 0.5)).click(p(200, 200)).escape()

    const drawn = cad
      .entities()
      .find((e) => e.id !== "H" && e.id !== "V") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(6, 0))
  })

  it("names a point that is two snaps at once by the first snap type", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "H" }),
        lineOf(p(100, 0), p(100, 50), { id: "V" }),
      ],
      snap: true,
    })

    cad.command("LINE").moveTo(p(101, 1))

    expect(cad.state().snap?.type).toBe(SnapType.Endpoint)
  })
})

describe("snapping through the object under the cursor", () => {
  it("leaves a line's ends and middle alone while the cursor is elsewhere on it", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })
    cad.runtime.setSnapEnabled(SnapType.Midpoint, true)

    cad.command("LINE").click(p(30, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(30, 2))
  })

  it("finds a circle's centre from its rim", () => {
    const cad = createHarness({
      entities: [circleOf(p(200, 200), 80, { id: "C1" })],
      snap: true,
    })

    cad.command("LINE").click(p(280, 203)).click(p(0, 0)).escape()

    expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(200, 200))
  })

  it("leaves the crosshair on the pointer while the point is far away", () => {
    const cad = createHarness({
      entities: [circleOf(p(200, 200), 80, { id: "C1" })],
      snap: true,
    })

    cad.command("LINE").moveTo(p(280, 203))

    expect(cad.state().snap?.point).toBeCloseToPoint(p(200, 200))
    // The crosshair's pick box, drawn where the crosshair is.
    const box = cad
      .scene()
      .primitives.find(
        (s) => s.kind === "rect" && s.stroke?.color === THEME.crosshair
      )
    expect(box?.kind === "rect" && box.min).toBeTruthy()
    if (box?.kind !== "rect") return
    const at = cad.runtime.viewport.screenToWorld({
      x: box.min.x + box.width / 2,
      y: box.min.y + box.height / 2,
    })
    expect(at).toBeCloseToPoint(p(280, 203), 3)
  })

  it("prefers a point under the cursor to Nearest, and Nearest to a far point", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })
    cad.runtime.setSnapEnabled(SnapType.Nearest, true)

    cad.command("LINE").moveTo(p(98, 2))
    expect(cad.state().snap?.type).toBe(SnapType.Endpoint)

    cad.moveTo(p(30, 2))
    expect(cad.state().snap?.type).toBe(SnapType.Nearest)
    expect(cad.state().snap?.point).toBeCloseToPoint(p(30, 0))
  })
})

describe("snaps against Ortho and Polar", () => {
  it("keeps the snapped point with Ortho on", () => {
    // "Ortho is ignored when you enter coordinates or specify an object snap."
    const cad = createHarness({
      entities: [lineOf(p(300, 70), p(450, 250), { id: "REF" })],
      snap: true,
    })
    cad.press("F8")

    cad.command("LINE").click(p(0, 0)).click(p(301, 71)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.end).toBeCloseToPoint(p(300, 70))
  })

  it("keeps the snapped point when it sits near a polar angle", () => {
    const cad = createHarness({
      entities: [lineOf(p(300, 6), p(450, 250), { id: "REF" })],
      snap: true,
    })
    cad.press("F10")

    cad.command("LINE").click(p(0, 0)).click(p(301, 6)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.end).toBeCloseToPoint(p(300, 6))
  })

  it("keeps a grip on the endpoint it snapped to with Ortho on", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-300, -200), p(0, -200), { id: "G" }),
        lineOf(p(300, 70), p(450, 250), { id: "REF" }),
      ],
      snap: true,
    })
    cad.press("F8")

    cad.click(p(-150, -200)).click(p(0, -200)).click(p(301, 71))

    expect(cad.byId<LineEntity>("G")!.end).toBeCloseToPoint(p(300, 70))
  })
})

describe("the line being drawn", () => {
  it("is not an object to intersect with", () => {
    const cad = createHarness({
      entities: [lineOf(p(200, -400), p(200, 0), { id: "REF" })],
      snap: true,
    })

    cad.command("LINE").click(p(-100, -350))
    cad.runtime.setSnapOverride(SnapType.Intersection)
    cad.click(p(204, -170)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.end).toBeCloseToPoint(p(204, -170))
  })

  it("lets an engaged polar path cross an object, exactly", () => {
    // "use polar tracking with Intersection and Apparent Intersection object
    // snaps to find where a polar alignment path intersects another object"
    const cad = createHarness({
      entities: [lineOf(p(100, -400), p(300, 0), { id: "REF" })],
      snap: true,
    })
    cad.press("F10")

    cad.command("LINE").click(p(-100, -200)).click(p(205, -196)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.end).toBeCloseToPoint(p(200, -200))
  })
})

describe("Tab", () => {
  // An intersection under the cursor and, a few pixels off, an end of one line.
  const corner = () => [
    lineOf(p(0, 0), p(100, 0), { id: "H" }),
    lineOf(p(4, -50), p(4, 50), { id: "V" }),
  ]

  it("cycles through the snaps under the cursor and comes back round", () => {
    // "Press TAB to cycle through the options."
    const cad = createHarness({ entities: corner(), snap: true })
    cad.command("LINE").moveTo(p(3, 1))
    expect(cad.state().snap?.type).toBe(SnapType.Intersection)

    expect(cad.press("Tab")).toBe(true)
    expect(cad.state().snap?.type).toBe(SnapType.Endpoint)
    expect(cad.state().snap?.point).toBeCloseToPoint(p(0, 0))

    cad.press("Tab")
    expect(cad.state().snap?.point).toBeCloseToPoint(p(4, 0))
  })

  it("places the point it cycled to", () => {
    const cad = createHarness({ entities: corner(), snap: true })
    cad.command("LINE").moveTo(p(3, 1))
    cad.press("Tab")

    cad.click(p(3, 1)).click(p(300, 300)).escape()

    expect((cad.latest() as LineEntity).start).toBeCloseToPoint(p(0, 0))
  })

  it("is left alone with a single snap to offer", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })
    cad.command("LINE").moveTo(p(150, 50))

    expect(cad.runtime.cycleSnap()).toBe(false)
  })
})

describe("an object snap typed at a point prompt", () => {
  it("forces that snap for the next point, by its capitals", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").type("MID").enter()
    cad.click(p(40, 3)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(50, 0))
  })

  it("is understood by its global name and its whole word", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").type("_endpoint").enter()

    expect(cad.state().snapOverride).toBe(SnapType.Endpoint)
  })

  it("turns snapping off for one pick with NON", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").type("NON").enter()
    cad.click(p(99, 1)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(99, 1))
  })

  it("leaves a keyword of the prompt its own meaning", () => {
    const cad = createHarness()

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    cad.type("C").enter()

    expect(cad.entities()).toHaveLength(3)
    expect(cad.state().snapOverride).toBeNull()
  })

  it("starts FROM typed into the box", () => {
    const cad = createHarness()

    cad.command("LINE").click(p(0, 0)).type("FROM").enter()
    cad.click(p(40, 30)).type("@10,0").enter().escape()

    expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(50, 30))
  })
})

describe("-OSNAP", () => {
  it("lists the running modes and replaces them with the list typed", () => {
    const cad = createHarness()

    cad.command("-OSNAP")
    expect(cad.runtime.commandLine.getLines().at(-1)?.text).toBe(
      "Current osnap modes: End,Cen,Int,Ext"
    )
    cad.type("mid,PER, qua").enter()

    const enabled = cad.state().snapEnabled
    const on = Object.keys(enabled).filter((type) => enabled[type as SnapType])
    expect(on.sort()).toEqual(
      [SnapType.Midpoint, SnapType.Perpendicular, SnapType.Quadrant].sort()
    )
    expect(cad.state().activeToolId).toBe("select")
  })

  it("clears them with OFF, and says None", () => {
    const cad = createHarness()

    cad.command("-OSNAP").type("off").enter()
    cad.command("-OSNAP")

    expect(cad.runtime.commandLine.getLines().at(-1)?.text).toBe(
      "Current osnap modes: None"
    )
  })

  it("asks again for a mode it does not know", () => {
    const cad = createHarness()

    cad.command("-OSNAP").type("END,XYZ").enter()

    expect(cad.state().activeToolId).toBe("osnap")
    expect(cad.state().snapEnabled[SnapType.Extension]).toBe(true)
  })
})

describe("where alignment paths cross", () => {
  /** Dwells on `at` so it is acquired, as resting the cursor there does. */
  function acquire(cad: ReturnType<typeof createHarness>, at: Vec2): void {
    cad.moveTo(at)
    vi.advanceTimersByTime(300)
    cad.moveTo(at)
  }

  // Two lines whose ends' paths cross at (90, 0), on both lines' extensions.
  const ends = () => [
    lineOf(p(0, 0), p(60, 0), { id: "A" }),
    lineOf(p(90, 20), p(90, 60), { id: "B" }),
  ]

  for (const polar of [false, true]) {
    it(`takes the crossing of two acquired points' paths${polar ? ", Polar on" : ""}`, () => {
      // "Rest on two points to acquire them, then follow their alignment paths
      // to where they cross" — a crossing that lies on an Extension too must
      // not give way to the Extension sliding along the line.
      vi.useFakeTimers()
      onTestFinished(() => {
        vi.useRealTimers()
      })
      const cad = createHarness({ entities: ends(), snap: true, polar })

      cad.command("LINE").click(p(20, 40))
      acquire(cad, p(60, 0))
      acquire(cad, p(90, 60))
      cad.click(p(93, 3)).escape()

      expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(90, 0))
    })
  }

  it("takes the crossing of two Extensions with OTRACK off", () => {
    vi.useFakeTimers()
    onTestFinished(() => {
      vi.useRealTimers()
    })
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(60, 30), { id: "A" }),
        lineOf(p(200, 0), p(160, 40), { id: "B" }),
      ],
      snap: true,
    })
    cad.press("F11")

    cad.command("LINE")
    acquire(cad, p(60, 30))
    acquire(cad, p(160, 40))
    // y = x / 2 meets y = 200 − x at (133.33, 66.67).
    cad.click(p(135, 68)).click(p(300, 300)).escape()

    const drawn = cad.latest() as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(400 / 3, 200 / 3))
  })
})

describe("an alignment path crossing an object", () => {
  function acquire(cad: ReturnType<typeof createHarness>, at: Vec2): void {
    cad.moveTo(at)
    vi.advanceTimersByTime(300)
    cad.moveTo(at)
  }

  it("gives the intersection where an OTRACK guide crosses a line", () => {
    vi.useFakeTimers()
    onTestFinished(() => {
      vi.useRealTimers()
    })
    const cad = createHarness({
      entities: [
        lineOf(p(-60, 0), p(0, 0), { id: "A" }),
        lineOf(p(-30, -40), p(30, -40), { id: "B" }),
      ],
      snap: true,
    })

    cad.command("LINE")
    acquire(cad, p(0, 0))
    cad.moveTo(p(1, -41))
    expect(cad.state().snap?.type).toBe(SnapType.Intersection)
    cad.click(p(1, -41)).click(p(200, 200)).escape()

    expect((cad.latest() as LineEntity).start).toBeCloseToPoint(p(0, -40))
  })

  it("does so at a later point too, along an Extension", () => {
    vi.useFakeTimers()
    onTestFinished(() => {
      vi.useRealTimers()
    })
    const cad = createHarness({
      entities: [
        lineOf(p(-60, 0), p(0, 0), { id: "A" }),
        lineOf(p(40, -30), p(40, 30), { id: "V" }),
      ],
      snap: true,
    })

    cad.command("LINE").click(p(-20, 100))
    acquire(cad, p(0, 0))
    cad.click(p(41, 2)).escape()

    expect((cad.latest() as LineEntity).end).toBeCloseToPoint(p(40, 0))
  })

  it("is no intersection while the cursor is off every path", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-60, 0), p(0, 0), { id: "A" }),
        lineOf(p(-30, -40), p(30, -40), { id: "B" }),
      ],
      snap: true,
    })

    cad.command("LINE").moveTo(p(1, -41))

    expect(cad.state().snap).toBeNull()
  })
})
