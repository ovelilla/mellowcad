import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  EllipseEntity,
  LineEntity,
  PolylineEntity,
  SplineEntity,
} from "../../domain/entities"
import {
  assignEntityColor,
  closestOnEntity,
  createBlockDefinition,
  createDimension,
  createInsert,
  createMText,
  createSpline,
  ellipseEndPoint,
  ellipseStartPoint,
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
} from "../../domain/entities"
import { polarPoint } from "../../geometry/primitives"
import { THEME } from "../../scene/theme"
import { DEFAULT_LAYER_COLOR } from "../../domain/layers"
import { fadedColor } from "../SceneBuilder"
import { es } from "../../locales/es"
import { type CadHarness, createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  hatchOf,
  lineOf,
  loopOf,
  p,
  polylineOf,
  textOf,
} from "../../../test/builders"

/**
 * Selection and grip editing — the interactions a user performs more often
 * than any command. Both AutoCAD selection rules (window and crossing) and the
 * multifunction grips are covered here, including the layer visibility rules
 * that decide what may be picked at all.
 */

const SHORT = lineOf(p(0, 0), p(100, 0), { id: "L1" })

/** Each answer typed at the command line and confirmed, as the console types it. */
function typed(cad: CadHarness, ...texts: string[]): void {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
}
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

  // desktop arc/d08: the middle grip's default is Stretch, the arc bent
  // through both ends and the cursor; 40,25 → 50,30 → 60,25 dragged up to its
  // middle at 50,33.9822 is centre 50,23.9245, radius 10.0577 (d09's palette),
  // stored counter-clockwise from 60,25.
  const d08 = () =>
    arcOf(p(50, 17.5), 12.5, Math.atan2(7.5, 10), Math.atan2(7.5, -10), {
      id: "A1",
    })

  it("stretches an arc through its middle grip, its ends kept", () => {
    const cad = createHarness({ entities: [d08()] })
    // Zoomed in, so the 4-unit drag passes the drag threshold.
    cad.runtime.zoomToBounds({ min: p(30, 10), max: p(70, 40) })
    cad.select("A1")

    cad.drag(p(50, 30), p(50, 23.9245 + 10.0577))

    const arc = cad.byId<ArcEntity>("A1")
    expect(arc.center).toBeCloseToPoint(p(50, 23.9245), 4)
    expect(arc.radius).toBeCloseTo(10.0577, 4)
    expect(polarPoint(arc.center, arc.radius, arc.startAngle)).toBeCloseToPoint(
      p(60, 25),
      9
    )
    expect(polarPoint(arc.center, arc.radius, arc.endAngle)).toBeCloseToPoint(
      p(40, 25),
      9
    )
  })

  it("stretches an arc to the other side of its chord the long way, still counter-clockwise", () => {
    const cad = createHarness({ entities: [d08()] })
    cad.select("A1")

    cad.drag(p(50, 30), p(50, 15))

    const arc = cad.byId<ArcEntity>("A1")
    expect(polarPoint(arc.center, arc.radius, arc.startAngle)).toBeCloseToPoint(
      p(40, 25),
      9
    )
    expect(polarPoint(arc.center, arc.radius, arc.endAngle)).toBeCloseToPoint(
      p(60, 25),
      9
    )
    expect(closestOnEntity(arc, p(50, 15)).distance).toBeLessThan(1e-9)
  })

  it("leaves an arc stretched onto its chord as it was", () => {
    const cad = createHarness({ entities: [d08()] })
    cad.select("A1")

    cad.drag(p(50, 30), p(50, 25))

    expect(cad.byId("A1")).toEqual(d08())
    expect(cad.commandLog()).toEqual([])
  })

  // desktop arc/d08: the ghost is the arc through the cursor, solid in the
  // object's colour, the hot grip left at the middle it was taken from.
  it("previews an arc's stretch in its own colour, the grip hot where it was", () => {
    const cad = createHarness({
      entities: [assignEntityColor(d08(), "#ff0000")],
    })
    cad.select("A1")

    cad.click(p(50, 30)).moveTo(p(50, 34))

    const primitives = cad.scene().primitives
    const ghost = primitives.flatMap((q) =>
      q.kind === "arc" && Math.abs(q.radius - 10.0556) < 1e-3 ? [q] : []
    )
    expect(ghost).toHaveLength(1)
    expect(ghost[0].stroke).toEqual({ color: "#ff0000", width: 1 })
    const grip = cad.toScreen(p(50, 30))
    const hot = primitives.find(
      (q) =>
        q.kind === "rect" &&
        q.fill === THEME.gripHot &&
        Math.abs(q.min.x + q.width / 2 - grip.x) < 1e-6 &&
        Math.abs(q.min.y + q.height / 2 - grip.y) < 1e-6
    )
    expect(hot).toBeDefined()
    cad.escape()
    expect(cad.byId("A1")).toEqual(assignEntityColor(d08(), "#ff0000"))
  })

  /** desktop ellipse/d07's ellipse: centre 50,25, major axis 10,0, minor 5. */
  const d07Ellipse = () => ellipseOf(p(50, 25), p(10, 0), 0.5, { id: "E1" })
  /** desktop ellipse/d07's arc: `_ELLIPSE _A 20,25 40,25 4 30 200`. */
  const d07Arc = () =>
    ellipseOf(p(30, 25), p(-10, 0), 0.4, {
      id: "E1",
      startParam: Math.atan2(Math.sin(deg(30)) / 0.4, Math.cos(deg(30))),
      endParam: Math.atan2(Math.sin(deg(200)) / 0.4, Math.cos(deg(200))),
    })
  /** The grips drawn on the selection, in the world, rounded. */
  function gripsOf(cad: ReturnType<typeof createHarness>): number[][] {
    return cad
      .scene()
      .primitives.flatMap((q) =>
        q.kind === "rect" && (q.fill === THEME.grip || q.fill === THEME.gripHot)
          ? [
              cad.runtime.viewport.screenToWorld({
                x: q.min.x + q.width / 2,
                y: q.min.y + q.height / 2,
              }),
            ]
          : []
      )
      .map((w) => [+w.x.toFixed(2) + 0, +w.y.toFixed(2) + 0])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  }
  const zoomed = (entity: EllipseEntity) => {
    const cad = createHarness({ entities: [entity] })
    // Zoomed in, so the few units dragged pass the drag threshold.
    cad.runtime.zoomToBounds({ min: p(15, 10), max: p(70, 40) })
    cad.select("E1")
    cad.moveTo(p(68, 38))
    return cad
  }

  // desktop ellipse/d07-1: the centre and the four quadrants.
  it("grips an ellipse at its centre and its four quadrants", () => {
    expect(gripsOf(zoomed(d07Ellipse()))).toEqual([
      [40, 25],
      [50, 20],
      [50, 25],
      [50, 30],
      [60, 25],
    ])
  })

  // desktop ellipse/d07-5: an elliptical arc keeps the four quadrants, on
  // its sweep or off it, and has a grip at each end.
  it("grips an elliptical arc at its quadrants, on its sweep or off it, and its ends", () => {
    expect(gripsOf(zoomed(d07Arc()))).toEqual([
      [20, 25],
      [24.31, 21.71],
      [30, 21],
      [30, 25],
      [30, 29],
      [37.4, 27.69],
      [40, 25],
    ])
  })

  // desktop ellipse/d07-3: the minor quadrant at 50,30 dragged to 52,33
  // makes the minor half-axis the cursor's distance from the centre, √68;
  // d07-4: then the major quadrant at 60,25 to 64,28, √205, the minor kept.
  it("sets a half-axis from a quadrant grip, its direction and the other kept", () => {
    const cad = zoomed(d07Ellipse())
    cad.drag(p(50, 30), p(52, 33))
    let ellipse = cad.byId<EllipseEntity>("E1")
    expect(ellipse.majorAxis).toBeCloseToPoint(p(10, 0), 9)
    expect(ellipse.ratio).toBeCloseTo(Math.sqrt(68) / 10, 9)
    expect(ellipse.center).toBeCloseToPoint(p(50, 25), 9)

    cad.drag(p(60, 25), p(64, 28))
    ellipse = cad.byId<EllipseEntity>("E1")
    expect(ellipse.majorAxis).toBeCloseToPoint(p(Math.sqrt(205), 0), 9)
    expect(ellipse.ratio * Math.sqrt(205)).toBeCloseTo(Math.sqrt(68), 9)
  })

  it("keeps the longer half-axis the major one when a quadrant outgrows it", () => {
    const cad = zoomed(d07Ellipse())
    cad.drag(p(50, 20), p(50, 10))
    const ellipse = cad.byId<EllipseEntity>("E1")
    expect(ellipse.majorAxis).toBeCloseToPoint(p(0, 15), 9)
    expect(ellipse.ratio).toBeCloseTo(10 / 15, 9)
  })

  // desktop ellipse/d07-7: the end grip dragged to 32,31 puts the end on the
  // cursor's heading from the centre, the ellipse and the start kept.
  it("moves an elliptical arc's end to the cursor's heading from the centre", () => {
    const cad = zoomed(d07Arc())
    cad.drag(p(37.4, 27.69), p(32, 31))
    const arc = cad.byId<EllipseEntity>("E1")
    expect(arc.majorAxis).toBeCloseToPoint(p(-10, 0), 12)
    expect(arc.ratio).toBe(0.4)
    expect(ellipseStartPoint(arc)).toBeCloseToPoint(
      ellipseStartPoint(d07Arc()),
      9
    )
    const end = ellipseEndPoint(arc)
    const heading = Math.atan2(31 - 25, 32 - 30)
    expect(Math.atan2(end.y - 25, end.x - 30)).toBeCloseToAngle(heading, 9)
  })

  // desktop ellipse/d07-3, d07-7: the reshaped ghost in the object's colour,
  // an amber dashed line from the centre to the cursor, the grip hot where
  // it was taken; Escape leaves the object as it was.
  it("previews a quadrant's drag from the centre, the grip hot where it was", () => {
    const red = assignEntityColor(d07Ellipse(), "#ff0000") as EllipseEntity
    const cad = zoomed(red)
    cad.click(p(50, 30)).moveTo(p(52, 33))

    const primitives = cad.scene().primitives
    const ghost = primitives.flatMap((q) =>
      q.kind === "ellipse" && q.stroke.color === "#ff0000" ? [q] : []
    )
    expect(ghost.length).toBeGreaterThan(0)
    expect(ghost.at(-1)!.radiusY / ghost.at(-1)!.radiusX).toBeCloseTo(
      Math.sqrt(68) / 10,
      6
    )
    const center = cad.toScreen(p(50, 25))
    const cursor = cad.toScreen(p(52, 33))
    const line = primitives.find(
      (q) =>
        q.kind === "segment" &&
        q.stroke.color === THEME.dashedRubberBand &&
        Math.abs(q.a.x - center.x) < 1e-6 &&
        Math.abs(q.b.y - cursor.y) < 1e-6
    )
    expect(line?.kind === "segment" && line.stroke.dash).toEqual([2, 3])
    const grip = cad.toScreen(p(50, 30))
    expect(
      primitives.find(
        (q) =>
          q.kind === "rect" &&
          q.fill === THEME.gripHot &&
          Math.abs(q.min.x + q.width / 2 - grip.x) < 1e-6 &&
          Math.abs(q.min.y + q.height / 2 - grip.y) < 1e-6
      )
    ).toBeDefined()
    cad.escape()
    expect(cad.byId("E1")).toEqual(red)
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

  // desktop spline/d09-1, d09-3: round grips at a CV spline's vertices;
  // d08-1: squares at a fit spline's fit points.
  it.each([
    ["cv", "circle"],
    ["fit", "rect"],
  ] as const)("draws a %s spline's grips as %s", (method, kind) => {
    const cad = createHarness({
      entities: [
        createSpline(method, [p(0, 0), p(100, 100), p(200, 0)], { id: "S1" }),
      ],
    })
    cad.select("S1").moveTo(p(500, 500))

    const grips = cad
      .scene()
      .primitives.filter(
        (q) =>
          "fill" in q && (q.fill === THEME.grip || q.fill === THEME.gripHot)
      )
    expect(grips.map((grip) => grip.kind)).toEqual([kind, kind, kind])

    // The grip under the cursor, and the one dragged, keep the shape.
    cad.moveTo(p(100, 100))
    const hot = cad
      .scene()
      .primitives.filter((q) => "fill" in q && q.fill === THEME.gripHot)
    expect(hot.map((grip) => grip.kind)).toEqual([kind])
    cad.click(p(100, 100)).moveTo(p(100, 60))
    const dragged = cad
      .scene()
      .primitives.filter((q) => "fill" in q && q.fill === THEME.gripHot)
    expect(dragged.map((grip) => grip.kind)).toEqual([kind])
  })

  it("draws a selected CV spline's frame dashed (desktop spline/d09-1)", () => {
    // WHY the crosshair's grey and not d09's muted red: SPLINE-D61, one frame
    // look while drawing (d07) and selected.
    const cad = createHarness({
      entities: [
        createSpline("cv", [p(0, 0), p(100, 100), p(200, 0)], { id: "S1" }),
      ],
    })
    cad.select("S1")

    const frames = cad
      .scene()
      .primitives.filter(
        (q) => q.kind === "path" && q.stroke?.color === THEME.crosshair
      )
    expect(frames).toEqual([
      expect.objectContaining({
        points: [p(0, 0), p(100, 100), p(200, 0)].map((q) =>
          expect.objectContaining(cad.toScreen(q))
        ),
        stroke: { color: THEME.crosshair, width: 1, dash: [2, 3] },
      }),
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
    cad.undo()
    expect(cad.entityCount).toBe(2)
  })

  // AutoCAD 2027 writes nothing once ERASE closes its set: the history ends at
  // `Select objects:`, and a preselection at its count (probes erase/p00,
  // p01, p03; desktop erase/d09).
  it("writes what each pick found and nothing after the set (erase/p00, p01)", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    cad.command("E")
    expect(cad.state().commandLine.prompt).toBe("ERASE Select objects:")
    cad.click(p(50, 0)).enter()
    cad.select("L2").command("ERASE")

    expect(cad.commandLog()).toEqual([
      "E ERASE",
      "Select objects: 1 found",
      "Select objects:",
      "ERASE 1 found",
    ])
    expect(cad.entityCount).toBe(0)
  })

  it("is BORRA and B in Spanish, and Enter at Command: repeats it (erase/p300, p303)", () => {
    const cad = createHarness({
      locale: es,
      entities: [SHORT, FAR, lineOf(p(0, 50), p(100, 50))],
    })
    typed(cad, "BORRA", "_L", "", "B", "_L", "", "", "_L", "")

    expect(cad.commandLog()).toEqual([
      "BORRA",
      "Designe objetos: _L",
      "1 encontrados",
      "Designe objetos:",
      "B BORRA",
      "Designe objetos: _L",
      "1 encontrados",
      "Designe objetos:",
      "BORRA",
      "Designe objetos: _L",
      "1 encontrados",
      "Designe objetos:",
    ])
    expect(cad.entityCount).toBe(0)
  })

  it("ends silently on Enter with nothing selected (erase/p304)", () => {
    const cad = createHarness({ entities: [SHORT] })
    typed(cad, "_ERASE", "")

    expect(cad.commandLog()).toEqual(["ERASE", "Select objects:"])
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(1)
  })

  it("is refused transparently, at Command:, a point and its own set (erase/p04, p324, p325)", () => {
    const cad = createHarness({ entities: [SHORT] })
    typed(cad, "'_ERASE")
    expect(cad.commandLog()).toEqual([
      "'ERASE",
      "** That command may not be invoked transparently **",
    ])

    typed(cad, "_CIRCLE", "0,0", "'_ERASE")
    expect(cad.commandLog().slice(-2)).toEqual([
      "** That command may not be invoked transparently **",
      'Requires numeric radius, point on circumference, or "D".',
    ])

    cad.escape()
    typed(cad, "_ERASE", "'_ERASE")
    expect(cad.commandLog().slice(-3)).toEqual([
      "** That command may not be invoked transparently **",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object",
    ])
    expect(cad.activeToolId()).toBe("erase")
  })

  it("erases every type of object ALL finds (erase/p310, p323)", () => {
    const block = createBlockDefinition("B1", p(0, 0), [
      lineOf(p(0, 0), p(1, 0)),
    ])
    const cad = createHarness({
      blocks: [block],
      entities: [
        lineOf(p(0, 0), p(10, 0)),
        circleOf(p(20, 0), 3),
        arcOf(p(33, 0), 3, 0, Math.PI),
        polylineOf([p(40, 0), p(50, 0), p(50, 5)]),
        createSpline("fit", [p(60, 0), p(65, 5), p(70, 0)]),
        textOf(p(80, 0), "Hola"),
        createMText(p(90, 0), "Hola"),
        createDimension("linear", p(0, 0), p(10, 0), p(0, -5)),
        createInsert("B1", p(0, 20)),
        hatchOf([loopOf(p(0, 30), p(10, 40))]),
      ],
    })
    typed(cad, "_ERASE", "ALL", "")

    expect(cad.commandLog().slice(-2)).toEqual(["10 found", "Select objects:"])
    expect(cad.entityCount).toBe(0)
  })

  it("is DELETE too, in English and Spanish (erase/p302)", () => {
    const en = createHarness({ entities: [SHORT, FAR] })
    en.command("DELETE")
    expect(en.activeToolId()).toBe("erase")
    expect(en.commandLog()).toEqual(["DELETE ERASE"])

    const spanish = createHarness({ locale: es, entities: [SHORT, FAR] })
    spanish.command("DELETE")
    expect(spanish.activeToolId()).toBe("erase")
    expect(spanish.commandLog()).toEqual(["DELETE BORRA"])
  })

  // acad.cuix's Delete key is `^C^C_erase;`: echoed like a typed ERASE with
  // its count, named ERASE by U, repeated by Enter (desktop erase/d11).
  it("runs ERASE from the Delete key with a selection (erase/d11)", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })
    cad.command("LINE").escape()

    cad.select("L1")
    expect(cad.press("Delete")).toBe(true)
    expect(cad.entities().map((e) => e.id)).toEqual(["L2"])
    expect(cad.commandLog().slice(-1)).toEqual(["ERASE 1 found"])

    cad.command("U")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "ERASE"])
    expect(cad.entityCount).toBe(2)

    cad.command("LINE").escape()
    cad.select("L1").press("Delete")
    cad.press("Enter")
    expect(cad.activeToolId()).toBe("erase")
    expect(cad.state().commandLine.prompt).toBe("ERASE Select objects:")
  })

  // WHY Backspace too: a Mac's Delete key reaches the browser as Backspace.
  it("runs ERASE from Backspace as from Delete, and neither does a thing with no selection", () => {
    const cad = createHarness({ entities: [SHORT, FAR] })

    expect(cad.press("Delete")).toBe(false)
    expect(cad.commandLog()).toEqual([])

    cad.select("L1").press("Backspace")
    expect(cad.entities().map((e) => e.id)).toEqual(["L2"])
    expect(cad.commandLog()).toEqual(["ERASE 1 found"])
  })

  // AutoCAD's erase preview: at ERASE's `Select objects:` the object under
  // the cursor and those already in the set draw faded in their own colour,
  // where every other command's glow (desktop erase/d09-2, d09-4).
  it("draws the hovered object and the set faded at its prompt (erase/d09)", () => {
    const colours = (cad: ReturnType<typeof createHarness>) =>
      cad
        .scene()
        .primitives.flatMap((prim) =>
          prim.kind === "segment" ? [prim.stroke.color] : []
        )
    const erase = createHarness({ entities: [SHORT, FAR] })
    erase.command("ERASE").click(p(50, 0)).moveTo(p(450, 400))

    const faded = colours(erase)
    expect(faded).not.toContain(THEME.selected)
    expect(faded).not.toContain(THEME.entityHover)
    expect(faded).not.toContain(DEFAULT_LAYER_COLOR)
    expect(
      faded.filter((colour) => colour === fadedColor(DEFAULT_LAYER_COLOR))
    ).toHaveLength(2)

    const move = createHarness({ entities: [SHORT, FAR] })
    move.command("MOVE").click(p(50, 0)).moveTo(p(450, 400))
    expect(colours(move)).toContain(THEME.selected)
    expect(colours(move)).toContain(THEME.entityHover)
    expect(colours(move)).not.toContain(fadedColor(DEFAULT_LAYER_COLOR))
  })

  it("erases nothing when Escape ends the prompt (erase/d10)", () => {
    const cad = createHarness({ entities: [SHORT] })

    cad.command("ERASE").click(p(50, 0)).escape()

    expect(cad.entityCount).toBe(1)
  })
})
