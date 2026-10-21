import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  LineEntity,
  PolylineEntity,
  SplineEntity,
} from "../../domain/entities"
import {
  closestOnEntity,
  createSpline,
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
} from "../../domain/entities"
import { polarPoint } from "../../geometry/primitives"
import { THEME } from "../../scene/theme"
import { createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"

/**
 * Selection and grip editing — the interactions a user performs more often
 * than any command. Both AutoCAD selection rules (window and crossing) and the
 * multifunction grips are covered here, including the layer visibility rules
 * that decide what may be picked at all.
 */

const SHORT = lineOf(p(0, 0), p(100, 0), { id: "L1" })
const FAR = lineOf(p(400, 400), p(500, 400), { id: "L2" })

describe("picking", () => {
  it("selects the object under the cursor", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    cad.click(p(50, 0))

    expect(cad.selectedIds()).toEqual(["L1"])
  })

  it("adds each object picked to the selection (PICKADD 2)", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    cad.click(p(50, 0))
    cad.click(p(450, 400))

    expect(cad.selectedIds().sort()).toEqual(["L1", "L2"])
  })

  it("removes an object with Shift, and Shift on one not selected does nothing", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    cad.click(p(50, 0))
    // Away from L1's own grips, which would be grabbed instead.
    cad.click(p(30, 0), { shiftKey: true })
    expect(cad.selectedIds()).toEqual([])

    cad.click(p(470, 400), { shiftKey: true })
    expect(cad.selectedIds()).toEqual([])
  })

  it("keeps the selection when a click on nothing starts a window", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    cad.click(p(50, 0))
    cad.click(p(50, 300))

    expect(cad.selectedIds()).toEqual(["L1"])
  })

  describe("the minus badge while Shift is held", () => {
    const hasMinus = (cad: ReturnType<typeof createHarness>) =>
      cad
        .scene()
        .primitives.some(
          (prim) =>
            prim.kind === "segment" &&
            prim.stroke.color === THEME.grip &&
            prim.a.y === prim.b.y
        )

    it("shows with no command, from the key alone, until it is let go", () => {
      const cad = createHarness({ entities: [SHORT] })
      cad.moveTo(p(50, 300))

      cad.press("Shift")
      expect(hasMinus(cad)).toBe(true)
      cad.release("Shift")
      expect(hasMinus(cad)).toBe(false)
    })

    it("shows at Select objects:", () => {
      const cad = createHarness({ entities: [SHORT] })
      cad.command("ERASE").moveTo(p(50, 300))

      cad.press("Shift")

      expect(hasMinus(cad)).toBe(true)
    })

    it("is not shown where Shift does not remove", () => {
      const cad = createHarness({ entities: [SHORT, FAR] })

      cad.command("LINE").moveTo(p(50, 300)).press("Shift")
      expect(hasMinus(cad)).toBe(false)
      cad.release("Shift").escape()

      // TRIM's Shift extends.
      cad.command("TR").moveTo(p(50, 300)).press("Shift")
      expect(cad.state().commandLine.prompt).toContain("shift-select to extend")
      expect(hasMinus(cad)).toBe(false)
    })
  })

  it("drops the selection on Escape", () => {
    const cad = createHarness({ entities: [SHORT] })

    cad.click(p(50, 0))
    cad.escape()

    expect(cad.selectedIds()).toEqual([])
  })
})

describe("box selection", () => {
  const entities = [
    lineOf(p(0, 0), p(100, 0), { id: "INSIDE" }),
    lineOf(p(50, 50), p(400, 50), { id: "STRADDLING" }),
    lineOf(p(600, 600), p(700, 600), { id: "OUTSIDE" }),
  ]

  it("window (left to right) takes only fully enclosed objects", () => {
    const cad = createHarness({ entities })

    cad.drag(p(-50, -50), p(200, 200))

    expect(cad.selectedIds()).toEqual(["INSIDE"])
  })

  it("crossing (right to left) also takes objects it merely touches", () => {
    const cad = createHarness({ entities })

    cad.drag(p(200, 200), p(-50, -50))

    expect(cad.selectedIds().sort()).toEqual(["INSIDE", "STRADDLING"])
  })

  it("adds what it finds to the selection", () => {
    const cad = createHarness({ entities })

    cad.click(p(650, 600))
    cad.drag(p(-50, -50), p(200, 200))

    expect(cad.selectedIds().sort()).toEqual(["INSIDE", "OUTSIDE"])
  })

  it("removes what it finds with Shift held", () => {
    const cad = createHarness({ entities })

    cad.click(p(650, 600))
    cad.drag(p(200, 200), p(-50, -50))
    cad.drag(p(-50, -50), p(200, 200), { shiftKey: true })

    expect(cad.selectedIds().sort()).toEqual(["OUTSIDE", "STRADDLING"])
  })

  it("is drawn by two clicks from a point on nothing", () => {
    const cad = createHarness({ entities })

    cad.click(p(-50, -50))
    expect(cad.selectedIds()).toEqual([])
    cad.click(p(200, 200))

    expect(cad.selectedIds()).toEqual(["INSIDE"])
  })

  it("removes with Shift at either click of a clicked window", () => {
    const cad = createHarness({ entities })
    cad.select("INSIDE", "OUTSIDE")

    cad.click(p(-50, -50))
    cad.click(p(200, 200), { shiftKey: true })

    expect(cad.selectedIds()).toEqual(["OUTSIDE"])
  })

  it("drops a clicked window on Escape and keeps the selection", () => {
    const cad = createHarness({ entities })
    cad.select("OUTSIDE")

    cad.click(p(-50, -50))
    cad.escape()
    cad.click(p(50, 0))

    expect(cad.selectedIds().sort()).toEqual(["INSIDE", "OUTSIDE"])
  })

  it("never selects objects on a hidden or locked layer", () => {
    // Regression: the box path used to iterate the document directly and so
    // ignored the selectability rules that single-click picking respected.
    const cad = createHarness()
    const hidden = cad.runtime.createLayer("Hidden")
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "VISIBLE" }),
      lineOf(p(0, 20), p(100, 20), { id: "ON_HIDDEN", layerId: hidden }),
      lineOf(p(0, 40), p(100, 40), { id: "ON_LOCKED", layerId: locked }),
    ])
    cad.runtime.updateLayer(hidden, { visible: false })
    cad.runtime.updateLayer(locked, { locked: true })

    cad.drag(p(200, 200), p(-50, -50))

    expect(cad.selectedIds()).toEqual(["VISIBLE"])
  })

  it("cannot single-click an object on a locked layer either", () => {
    const cad = createHarness()
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "ON_LOCKED", layerId: locked }),
    ])
    cad.runtime.updateLayer(locked, { locked: true })

    cad.click(p(50, 0))

    expect(cad.selectedIds()).toEqual([])
  })
})

describe("grips", () => {
  it("stretches a line from its endpoint grip", () => {
    const cad = createHarness({ entities: [SHORT] })
    cad.select("L1")

    cad.drag(p(100, 0), p(150, 0))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(150, 0))
  })

  // desktop line/d15: an end grip clicked, the cursor moved off the line and
  // clicked, the end lands on the cursor (STRETCH, the default grip mode).
  it("stretches a line's end to the cursor, off the line's axis too", () => {
    const cad = createHarness({ entities: [SHORT] })
    cad.select("L1")

    cad.drag(p(100, 0), p(150, 50))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(150, 50))
  })

  // DSETTINGS' Dimension Input (help 2027, GUID-65DF3E4D): with DYNDIVIS's
  // default the first field is the resulting dimension, so a number typed
  // while stretching is the line's new length, towards the cursor.
  it("takes a number typed at a hot end grip as the line's resulting length", () => {
    const cad = createHarness({ entities: [SHORT] })
    cad.select("L1")

    cad.click(p(100, 0)).moveTo(p(60, 80)).type("50").enter()

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(30, 40))
  })

  // desktop line/d15: `** ESTIRAR **`, two lines selected, the midpoint grip
  // moved only its own line.
  it("moves only its own line from a midpoint grip, whatever else is selected", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })
    cad.select("L1", "L2")

    cad.drag(p(50, 0), p(50, 50))

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 50))
    expect(cad.byId<LineEntity>("L2").start).toBeCloseToPoint(p(400, 400))
  })

  it("puts a vertical line's grips at their own heights, and its end grip stretches", () => {
    const up = withDeltaZ(
      withElevation(lineOf(p(10, 20), p(10, 20), { id: "V" }), 5),
      30
    )
    const cad = createHarness({ entities: [up] })
    cad.command("VPOINT").type("1,-1,1").enter()
    cad.select("V")
    cad.moveTo(p(400, 400))

    const grips = cad
      .scene()
      .primitives.filter(
        (q) => q.kind === "rect" && "fill" in q && q.fill === THEME.grip
      )
    const heights = new Set(
      grips.map((g) => (g.kind === "rect" ? Math.round(g.min.y) : 0))
    )
    expect(grips).toHaveLength(3)
    expect(heights.size).toBe(3)

    cad.drag({ x: 10, y: 20, z: 35 }, p(60, 20))
    const line = cad.byId<LineEntity>("V")
    expect(line.start).toBeCloseToPoint(p(10, 20))
    expect(line.end).toBeCloseToPoint(p(60, 20))
    expect([lineStartZ(line), lineEndZ(line)]).toEqual([5, 0])
  })

  it("moves the whole line from its midpoint grip", () => {
    const cad = createHarness({ entities: [SHORT] })
    cad.select("L1")

    cad.drag(p(50, 0), p(50, 100))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 100))
    expect(line.end).toBeCloseToPoint(p(100, 100))
  })

  it("resizes a circle from a quadrant grip and moves it from the centre", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 80, { id: "C1" })],
    })
    cad.select("C1")

    cad.drag(p(80, 0), p(120, 0))
    expect(cad.byId<CircleEntity>("C1").radius).toBeCloseTo(120)
    expect(cad.byId<CircleEntity>("C1").center).toBeCloseToPoint(p(0, 0))

    cad.drag(p(0, 0), p(10, 10))
    expect(cad.byId<CircleEntity>("C1").center).toBeCloseToPoint(p(10, 10))
    expect(cad.byId<CircleEntity>("C1").radius).toBeCloseTo(120)
  })

  // help GUID-01DE459C and desktop circle/d15: a value typed while a
  // quadrant grip is hot is the radius, from the centre.
  it("takes a number typed at a hot quadrant grip as the circle's radius", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 80, { id: "C1" })],
    })
    cad.select("C1")

    cad.click(p(80, 0)).moveTo(p(100, 30)).type("25").enter()

    expect(cad.byId<CircleEntity>("C1").radius).toBeCloseTo(25, 9)
    expect(cad.byId<CircleEntity>("C1").center).toBeCloseToPoint(p(0, 0))
  })

  // desktop circle/d15: in UCS Z 30 the grips stay at the circle's own
  // quadrants; only the Quadrant snap turns with the UCS (p212).
  it("keeps a circle's quadrant grips at its OCS's in a rotated UCS", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 80, { id: "C1" })],
    })
    cad.command("UCS").option("Z").type("30").enter()
    cad.select("C1")

    cad.drag(p(80, 0), p(120, 0))

    expect(cad.byId<CircleEntity>("C1").radius).toBeCloseTo(120, 9)
  })

  it("bends a quadrant grip's drag with Ortho", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 80, { id: "C1" })],
    })
    cad.runtime.toggleOrtho()
    cad.select("C1")

    cad.drag(p(80, 0), p(120, 30))

    expect(cad.byId<CircleEntity>("C1").radius).toBeCloseTo(120, 9)
  })

  it("swings an arc endpoint without changing its radius", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 80, 0, deg(90), { id: "A1" })],
    })
    cad.select("A1")

    cad.drag(
      polarPoint(p(0, 0), 80, deg(90)),
      polarPoint(p(0, 0), 200, deg(135))
    )

    const arc = cad.byId<ArcEntity>("A1")
    expect(arc.radius).toBeCloseTo(80)
    expect(arc.startAngle).toBeCloseToAngle(0)
    expect(arc.endAngle).toBeCloseToAngle(deg(135), 5)
  })

  it("changes an arc's radius from its midpoint grip", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 80, 0, deg(90), { id: "A1" })],
    })
    cad.select("A1")

    cad.drag(
      polarPoint(p(0, 0), 80, deg(45)),
      polarPoint(p(0, 0), 110, deg(45))
    )

    const arc = cad.byId<ArcEntity>("A1")
    expect(arc.radius).toBeCloseTo(110, 5)
    expect(arc.startAngle).toBeCloseToAngle(0)
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
  })

  it("drags a polyline vertex", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P1" })],
    })
    cad.select("P1")

    cad.drag(p(100, 0), p(150, -50))

    expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
      p(0, 0),
      p(150, -50),
      p(100, 100),
    ])
  })

  it("drags a spline's fit point, and the curve refits through it", () => {
    const cad = createHarness({
      entities: [
        createSpline("fit", [p(0, 0), p(100, 50), p(200, 0)], { id: "S1" }),
      ],
    })
    cad.select("S1")

    cad.drag(p(100, 50), p(100, 90))

    const spline = cad.byId<SplineEntity>("S1")
    expect(spline.points).toBeCloseToPoints([p(0, 0), p(100, 90), p(200, 0)])
    expect(closestOnEntity(spline, p(100, 90)).distance).toBeLessThan(1e-6)
  })

  it("drags a spline's control vertex", () => {
    const cad = createHarness({
      entities: [
        createSpline("cv", [p(0, 0), p(100, 100), p(200, 0)], { id: "S1" }),
      ],
    })
    cad.select("S1")

    cad.drag(p(100, 100), p(100, 40))

    expect(cad.byId<SplineEntity>("S1").points).toBeCloseToPoints([
      p(0, 0),
      p(100, 40),
      p(200, 0),
    ])
  })

  /**
   * Desktop pline/d09: `10,60 30,60 A 40,70 L 55,70`, a line, a quarter arc
   * (bulge 0.4142, midpoint 37.0711,62.9289) and a line.
   */
  const lineArcLine = () =>
    polylineOf([p(10, 60), p(30, 60), p(40, 70), p(55, 70)], {
      id: "P1",
      bulges: [0, Math.tan(Math.PI / 8), 0],
    })

  it("stretches a straight segment from its midpoint grip, the next arc through its old midpoint", () => {
    // d09: the grip (20,60) to (20,55.0257) moves both vertices by the drag
    // and re-bulges the arc after it from 0.4142 to 0.1702.
    const cad = createHarness({ entities: [lineArcLine()] })
    cad.select("P1")

    cad.click(p(20, 60)).moveTo(p(20, 55.0257))
    const preview = cad
      .scene()
      .primitives.filter(
        (q) => "stroke" in q && q.stroke?.color === THEME.preview
      )
    expect(preview.length).toBeGreaterThan(0)
    cad.click(p(20, 55.0257))

    const poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toBeCloseToPoints([
      p(10, 55.0257),
      p(30, 55.0257),
      p(40, 70),
      p(55, 70),
    ])
    expect(poly.bulges?.[1]).toBeCloseTo(0.1702, 4)
    expect(closestOnEntity(poly, p(37.0711, 62.9289)).distance).toBeLessThan(
      1e-4
    )

    cad.escape().command("U")
    expect(cad.byId<PolylineEntity>("P1")).toEqual(lineArcLine())
  })

  it("re-bends the arc beside a dragged vertex through its old midpoint", () => {
    // d09: vertex (30,60) to (30,55.0257): only it moves, the arc to 0.1702.
    const cad = createHarness({ entities: [lineArcLine()] })
    cad.select("P1")

    cad.click(p(30, 60)).click(p(30, 55.0257))

    const poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toBeCloseToPoints([
      p(10, 60),
      p(30, 55.0257),
      p(40, 70),
      p(55, 70),
    ])
    expect(poly.bulges?.[1]).toBeCloseTo(0.1702, 4)
  })

  it("bends an arc segment through the point its midpoint grip is dragged to", () => {
    // d09: the arc's midpoint grip to (36,64) gives bulge 0.2001.
    const cad = createHarness({ entities: [lineArcLine()] })
    cad.select("P1")

    cad.click(p(37.0711, 62.9289)).click(p(36, 64))

    expect(cad.byId<PolylineEntity>("P1").bulges?.[1]).toBeCloseTo(0.2001, 3)
  })

  it("takes a Ctrl+click on a vertex grip as a click: Remove Vertex is the grip menu's", () => {
    // d07: AutoCAD removes a vertex from the vertex grip's hover menu only.
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(50, 40), p(100, 0), p(100, 100)], { id: "P1" }),
      ],
    })
    cad.select("P1")

    cad.click(p(50, 40), { ctrlKey: true }).click(p(50, 60))

    expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
      p(0, 0),
      p(50, 60),
      p(100, 0),
      p(100, 100),
    ])
  })

  it("bends an arc segment from its curvature grip", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(100, 0)], { id: "P1", bulges: [0.5] })],
    })
    cad.select("P1")

    // The arc's midpoint sits below the chord for a positive bulge.
    cad.drag(p(50, -25), p(50, -60))

    // sagitta / half-chord = 60 / 50.
    expect(cad.byId<PolylineEntity>("P1").bulges?.[0]).toBeCloseTo(1.2, 5)
  })

  it("makes a grip edit undoable in one step", () => {
    const cad = createHarness({ entities: [SHORT] })
    cad.select("L1")

    cad.drag(p(100, 0), p(150, 0))
    cad.undo()

    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })
})

describe("dragging a selection", () => {
  it("moves the selected objects when the drag starts on one of them", () => {
    // Polylines only expose reshaping grips, so dragging the body is the only
    // way to move one without reaching for the MOVE command.
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(200, 0), p(200, 120), p(0, 120)], {
          id: "P1",
          closed: true,
        }),
      ],
    })
    cad.select("P1")

    cad.drag(p(120, 0), p(170, 80))

    expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
      p(50, 80),
      p(250, 80),
      p(250, 200),
      p(50, 200),
    ])
  })

  it("still draws a selection box when the drag starts on empty space", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })
    cad.select("L1")

    cad.drag(p(-50, 300), p(600, 600))

    expect(cad.selectedIds().sort()).toEqual(["L1", "L2"])
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
  })
})

describe("ERASE", () => {
  it("deletes the selection and can be undone", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    cad.select("L1").command("ERASE")
    expect(cad.entityCount).toBe(1)

    cad.undo()
    expect(cad.entityCount).toBe(2)
  })

  it("asks for objects when nothing is selected and erases them on Enter", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    cad.command("E")
    expect(cad.activeToolId()).toBe("erase")
    expect(cad.entityCount).toBe(2)

    cad.click(p(50, 0)).enter()

    expect(cad.entities().map((e) => e.id)).toEqual(["L2"])
    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toContain("1 object erased.")
    cad.undo()
    expect(cad.entityCount).toBe(2)
  })

  it("asks Select objects and writes what each pick found", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    cad.command("E")
    expect(cad.state().commandLine.prompt).toBe("ERASE Select objects:")
    cad.click(p(50, 0)).enter()
    cad.select("L2").command("ERASE")

    expect(cad.commandLog()).toEqual([
      "E ERASE",
      "Select objects: 1 found",
      "Select objects:",
      "1 object erased.",
      "ERASE 1 found",
      "1 object erased.",
    ])
  })

  it("erases nothing when Escape ends the prompt", () => {
    const cad = createHarness({ entities: [SHORT] })

    cad.command("ERASE").click(p(50, 0)).escape()

    expect(cad.entityCount).toBe(1)
  })
})
