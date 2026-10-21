import { describe, expect, it } from "vitest"
import type { ScenePrimitive } from "../scene/types"
import type { EllipseEntity, Entity } from "../domain/entities"
import {
  assignEntityLinetype,
  ellipseEndPoint,
  ellipseStartPoint,
} from "../domain/entities"
import { THEME } from "../scene/theme"
import { createHarness } from "../../test/harness"
import { entityScenePrimitive } from "./SceneBuilder"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  lineOf,
  p,
  polylineOf,
} from "../../test/builders"

/**
 * The scene is the contract between the engine and *any* renderer: a flat list
 * of styled primitives in screen space. Testing it directly is how the drawing
 * gets verified without a canvas, a screenshot or a pixel comparison — the
 * appearance rules (ByLayer colour, linetype dashes, lineweight, visibility)
 * are all assertions about this list.
 */

function strokes(primitives: readonly ScenePrimitive[], color: string) {
  return primitives.filter(
    (primitive) => "stroke" in primitive && primitive.stroke?.color === color
  )
}

function kinds(primitives: readonly ScenePrimitive[]) {
  return new Set(primitives.map((primitive) => primitive.kind))
}

describe("entity rendering", () => {
  it("emits one primitive of the matching kind per entity type", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0), { id: "L1" }),
        circleOf(p(0, 200), 50, { id: "C1" }),
        arcOf(p(200, 0), 50, 0, deg(90), { id: "A1" }),
        polylineOf([p(-200, -200), p(-100, -200), p(-100, -100)], { id: "P1" }),
      ],
    })

    const drawn = strokes(cad.scene().primitives, THEME.entity)
    expect(kinds(drawn)).toEqual(new Set(["segment", "circle", "arc", "path"]))
  })

  it("draws an elliptical arc's ends where the camera puts them", () => {
    // The Y flip both turns the major axis's angle round and runs the
    // parametrisation backwards, so this reconstructs the canvas call and
    // checks it lands on the projected world endpoints.
    const cad = createHarness({
      entities: [
        ellipseOf(p(0, 0), p(100, 50), 0.5, {
          id: "E1",
          startParam: deg(30),
          endParam: deg(200),
        }),
      ],
    })

    const drawn = strokes(cad.scene().primitives, THEME.entity)[0]
    expect(drawn.kind).toBe("ellipse")
    if (drawn.kind !== "ellipse") return
    const at = (angle: number) => ({
      x:
        drawn.center.x +
        drawn.radiusX * Math.cos(drawn.rotation) * Math.cos(angle) -
        drawn.radiusY * Math.sin(drawn.rotation) * Math.sin(angle),
      y:
        drawn.center.y +
        drawn.radiusX * Math.sin(drawn.rotation) * Math.cos(angle) +
        drawn.radiusY * Math.cos(drawn.rotation) * Math.sin(angle),
    })
    const ellipse = cad.byId<EllipseEntity>("E1")
    expect(at(drawn.startAngle)).toBeCloseToPoint(
      cad.runtime.viewport.worldToScreen(ellipseStartPoint(ellipse)),
      4
    )
    expect(at(drawn.endAngle)).toBeCloseToPoint(
      cad.runtime.viewport.worldToScreen(ellipseEndPoint(ellipse)),
      4
    )
    // Sweeping the short way round is what the flag has to encode.
    expect(drawn.counterclockwise).toBe(true)
  })

  it("projects world coordinates into screen space", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    const segment = strokes(cad.scene().primitives, THEME.entity)[0]
    expect(segment.kind).toBe("segment")
    if (segment.kind !== "segment") return
    // Screen Y is flipped and the origin sits at the viewport centre.
    expect(segment.a).toBeCloseToPoint(p(500, 400))
    expect(segment.b).toBeCloseToPoint(p(600, 400))
  })

  it("omits entities on a layer that is turned off", () => {
    const cad = createHarness()
    const hidden = cad.runtime.createLayer("Hidden")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: hidden }),
    ])

    expect(strokes(cad.scene().primitives, THEME.entity)).toHaveLength(1)
    cad.runtime.updateLayer(hidden, { visible: false })
    expect(strokes(cad.scene().primitives, THEME.entity)).toHaveLength(0)
  })

  it("still draws locked geometry", () => {
    const cad = createHarness()
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: locked }),
    ])
    cad.runtime.updateLayer(locked, { locked: true })

    expect(strokes(cad.scene().primitives, THEME.entity)).toHaveLength(1)
  })
})

describe("appearance resolution", () => {
  it("takes the colour from the layer", () => {
    const cad = createHarness()
    const red = cad.runtime.createLayer("Red", "#ff0000")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: red }),
    ])

    expect(strokes(cad.scene().primitives, "#ff0000")).toHaveLength(1)
  })

  it("lets a per-object colour override the layer", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1")
    cad.runtime.setSelectionColor("#00ff00")
    cad.runtime.selection.clear()

    expect(strokes(cad.scene().primitives, "#00ff00")).toHaveLength(1)
  })

  // desktop d15: a selected line keeps its colour and glows blue over it.
  it("lays the selection's glow over the object in its own colour", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1")

    const scene = cad.scene().primitives
    expect(strokes(scene, THEME.entity)).toHaveLength(1)
    const glow = strokes(scene, THEME.selected)
    expect(glow).toHaveLength(1)
    expect(scene.indexOf(glow[0])).toBeGreaterThan(
      scene.indexOf(strokes(scene, THEME.entity)[0])
    )
  })

  it("dashes a line whose linetype is not continuous", () => {
    const cad = createHarness({
      entities: [lineOf(p(-500, 0), p(500, 0), { id: "L1" })],
    })

    const solid = strokes(cad.scene().primitives, THEME.entity)[0]
    expect("stroke" in solid && solid.stroke?.dash).toBeUndefined()

    cad.runtime.updateLayer("0", { linetype: "Dashed" })

    const dashed = strokes(cad.scene().primitives, THEME.entity)[0]
    expect("stroke" in dashed ? dashed.stroke?.dash : undefined).toBeDefined()
  })

  it("scales the dash pattern with LTSCALE", () => {
    const cad = createHarness({
      entities: [lineOf(p(-500, 0), p(500, 0), { id: "L1" })],
    })
    cad.runtime.updateLayer("0", { linetype: "Dashed" })

    const dashAt = (ltScale: number) => {
      cad.runtime.setLtScale(ltScale)
      const primitive = strokes(cad.scene().primitives, THEME.entity)[0]
      return "stroke" in primitive ? (primitive.stroke?.dash?.[0] ?? 0) : 0
    }

    expect(dashAt(2)).toBeCloseTo(dashAt(1) * 2, 6)
  })

  // probe line/p202: acadiso.lin's definitions, read back with `tblsearch`.
  it.each([
    ["Dashed", [12.7, 6.35]],
    ["Hidden", [6.35, 3.175]],
    ["Center", [31.75, 6.35, 6.35, 6.35]],
    ["Phantom", [31.75, 6.35, 6.35, 6.35, 6.35, 6.35]],
    ["DashDot", [12.7, 6.35, 0, 6.35]],
  ])("dashes %s as acadiso.lin does", (linetype, pattern) => {
    const cad = createHarness({
      entities: [
        assignEntityLinetype(
          lineOf(p(-500, 0), p(500, 0), { id: "L1" }),
          linetype
        ),
      ],
    })
    const dashed = strokes(cad.scene().primitives, THEME.entity).find(
      (primitive) => "stroke" in primitive && primitive.stroke?.dash
    )
    expect(dashed && "stroke" in dashed ? dashed.stroke?.dash : null).toEqual(
      pattern
    )
  })

  /** A line's drawn runs from its start, dash, gap, dash…, in world units. */
  function drawnRuns(linetype: string, length: number): number[] {
    return runsOf(
      assignEntityLinetype(
        lineOf(p(0, 0), p(length, 0), { id: "L1" }),
        linetype
      )
    )
  }

  /** The drawn runs of an object lying along the X axis from 0. */
  function runsOf(entity: Entity): number[] {
    const cad = createHarness({ entities: [entity] })
    const origin = cad.runtime.viewport.worldToScreen(p(0, 0)).x
    const on: [number, number][] = []
    for (const piece of strokes(cad.scene().primitives, THEME.entity)) {
      if (piece.kind !== "segment") continue
      const from = piece.a.x - origin
      const to = piece.b.x - origin
      const { dash, dashOffset = 0 } = piece.stroke
      if (!dash) {
        on.push([from, to])
        continue
      }
      for (
        let at = from - dashOffset, i = 0;
        at < to;
        at += dash[i++ % dash.length]
      ) {
        const end = at + dash[i % dash.length]
        if (i % 2 === 0 && end >= from)
          on.push([Math.max(at, from), Math.min(end, to)])
      }
    }
    on.sort((x, y) => x[0] - y[0])
    const runs: number[] = []
    let last = 0
    for (const [start, end] of on) {
      if (runs.length > 0 && start - last < 1e-9)
        runs[runs.length - 1] += end - last
      else {
        if (runs.length > 0) runs.push(start - last)
        runs.push(end - start)
      }
      last = end
    }
    return runs
  }

  // probe line/p207, measured on the plot: a line begins and ends on a dash of
  // the same length, (L − m·period + first dash) / 2 with m whole periods.
  it("lays a line's pattern centred, its end dashes equal", () => {
    const hidden = drawnRuns("Hidden", 100)
    expect(hidden[0]).toBeCloseTo(5.55, 6)
    expect(hidden.at(-1)).toBeCloseTo(5.55, 6)
    expect(hidden).toHaveLength(21)
    expect(drawnRuns("Hidden", 20).map((run) => +run.toFixed(3))).toEqual([
      3.65, 3.175, 6.35, 3.175, 3.65,
    ])
  })

  it("draws an end dash longer than the pattern's first, as AutoCAD does", () => {
    // probe line/p207: DASHDOT's ends are 18.25 long on a 100-unit line.
    const runs = drawnRuns("DashDot", 100)
    expect(runs[0]).toBeCloseTo(18.25, 6)
    expect(runs.at(-1)).toBeCloseTo(18.25, 6)
    expect(runs.reduce((sum, run) => sum + run, 0)).toBeCloseTo(100, 6)
  })

  it("draws a line shorter than one period solid", () => {
    // probe line/p207: a 5-unit HIDDEN line plots as one stroke.
    expect(drawnRuns("Hidden", 5)).toEqual([5])
  })

  // probe pline/p232, PLINEGEN 0: each segment laid as a line of its
  // length, the dashes either side of a vertex merging; segments shorter than
  // a period solid.
  it("lays a polyline's pattern segment by segment", () => {
    const along = (...xs: number[]) =>
      runsOf(
        assignEntityLinetype(
          polylineOf(
            xs.map((x) => p(x, 0)),
            { id: "P1" }
          ),
          "Dashed"
        )
      )
    const runs = along(0, 50, 100, 150)
    // (50 − 2·19.05 + 12.7) / 2 = 12.3 at each end of each segment.
    expect(runs.map((run) => +run.toFixed(3))).toEqual([
      12.3, 6.35, 12.7, 6.35, 24.6, 6.35, 12.7, 6.35, 24.6, 6.35, 12.7, 6.35,
      12.3,
    ])
    expect(along(0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100)).toEqual([100])
  })

  it("leaves a ghost's own dashes running from its start", () => {
    const primitives = entityScenePrimitive(
      createHarness().runtime.viewport,
      lineOf(p(0, 0), p(100, 0)),
      { color: THEME.preview, width: 1, dash: [6, 4] }
    )
    expect(primitives).toHaveLength(1)
    expect(primitives[0].kind === "segment" && primitives[0].stroke).toEqual({
      color: THEME.preview,
      width: 1,
      dash: [6, 4],
    })
  })

  it("draws a heavier lineweight thicker, and only while LWDISPLAY is on", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 0), p(100, 0), { id: "L1" })],
    })

    const widthOf = () => {
      const primitive = strokes(cad.scene().primitives, THEME.entity)[0]
      return "stroke" in primitive ? (primitive.stroke?.width ?? 0) : 0
    }

    const thin = widthOf()
    cad.runtime.updateLayer("0", { lineweight: 2.11 })
    const thick = widthOf()
    expect(thick).toBeGreaterThan(thin)

    cad.runtime.toggleLineweightDisplay()
    expect(widthOf()).toBeLessThan(thick)
  })

  it("draws a wide polyline by its width in plan, its lineweight off the plan", () => {
    // "Wide polylines display lineweights only when displayed outside of
    // plan view."
    const cad = createHarness({
      entities: [polylineOf([p(-100, 0), p(100, 0)], { widths: [[10, 10]] })],
    })
    cad.runtime.updateLayer("0", { lineweight: 2.11 })
    const band = () =>
      strokes(cad.scene().primitives, THEME.entity).find(
        (primitive) => primitive.kind === "path"
      )
    const plan = band()
    expect(plan?.kind === "path" && plan.fill).toBe(THEME.entity)
    expect(plan?.kind === "path" && plan.stroke?.width).toBe(1.25)

    cad.command("VPOINT").type("1,-1,1").enter()
    const off = band()
    expect(off?.kind === "path" && off.fill).toBeUndefined()
    expect(off?.kind === "path" && off.stroke?.width).toBeGreaterThan(1.25)
  })

  it("keeps lineweight independent of zoom, like a plotted drawing", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 0), p(100, 0), { id: "L1" })],
    })
    cad.runtime.updateLayer("0", { lineweight: 2.11 })

    const widthOf = () => {
      const primitive = strokes(cad.scene().primitives, THEME.entity)[0]
      return "stroke" in primitive ? (primitive.stroke?.width ?? 0) : 0
    }

    const before = widthOf()
    cad.wheel(p(0, 0), -100)
    cad.wheel(p(0, 0), -100)
    expect(widthOf()).toBeCloseTo(before, 6)
  })
})

describe("frame composition", () => {
  it("describes the frame in CSS pixels with the theme background", () => {
    const cad = createHarness({ width: 1000, height: 800 })

    const scene = cad.scene()
    expect(scene.width).toBe(1000)
    expect(scene.height).toBe(800)
    expect(scene.background).toBe(THEME.background)
  })

  it("drops the grid when it is turned off", () => {
    const cad = createHarness()

    const withGrid = cad.scene().primitives.length
    cad.press("F7")
    expect(cad.scene().primitives.length).toBeLessThan(withGrid)
  })

  it("draws the crosshair while the pointer is over the canvas", () => {
    const cad = createHarness()

    cad.moveTo(p(10, 10))
    expect(
      strokes(cad.scene().primitives, THEME.crosshair).length
    ).toBeGreaterThan(0)

    cad.runtime.pointerLeave()
    expect(strokes(cad.scene().primitives, THEME.crosshair)).toHaveLength(0)
  })

  // desktop d03, d05, d20: CURSORSIZE 5's short crosshair; the pick box at
  // `Command:`, none at a point prompt.
  it("draws the pick box at Command: and none at a point prompt", () => {
    const pickBoxes = (cad: ReturnType<typeof createHarness>) =>
      cad
        .scene()
        .primitives.filter(
          (primitive) =>
            primitive.kind === "rect" &&
            primitive.stroke?.color === THEME.crosshair
        ).length
    const cad = createHarness({ width: 1000, height: 800 })

    cad.moveTo(p(10, 10))
    expect(pickBoxes(cad)).toBe(1)
    const arm = strokes(cad.scene().primitives, THEME.crosshair).find(
      (primitive) => primitive.kind === "segment"
    )
    expect(arm?.kind === "segment" && Math.abs(arm.b.x - arm.a.x)).toBe(50)

    cad.command("LINE").moveTo(p(20, 10))
    expect(pickBoxes(cad)).toBe(0)
  })

  // desktop d05, d11, d21: the snap's name sits below and to the right of
  // the cursor, where the dynamic input's box would; the box goes under it.
  it("puts the snap's name below and right of the cursor, the box under it", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0))],
      snap: true,
    })

    cad.command("LINE").moveTo(p(98, 3))
    const cursor = cad.runtime.viewport.worldToScreen(p(100, 0))
    const name = cad
      .scene()
      .primitives.find(
        (primitive) =>
          primitive.kind === "label" && primitive.text === "Endpoint"
      )
    expect(name?.kind).toBe("label")
    if (name?.kind !== "label") return
    expect(name.at.x).toBeGreaterThan(cursor.x + 15)
    expect(name.at.y).toBeGreaterThan(cursor.y + 15)
    expect(cad.state().dynamicInput?.clearance).toBe(22)

    cad.moveTo(p(50, 50))
    expect(cad.state().dynamicInput?.clearance).toBe(0)
  })

  // desktop d12: Polar's path runs dashed from the base point out of the view.
  it("draws Polar's path from the base point outward", () => {
    const cad = createHarness({ polar: true })

    cad.command("LINE").click(p(0, 0)).moveTo(p(60, 2))
    const anchor = cad.runtime.viewport.worldToScreen(p(0, 0))
    const path = strokes(cad.scene().primitives, THEME.polar)
    expect(path).toHaveLength(1)
    expect(path[0].kind === "segment" && path[0].a).toBeCloseToPoint(anchor)
  })

  it("includes the active tool's preview while a command is running", () => {
    const cad = createHarness()

    cad.command("LINE").click(p(0, 0)).moveTo(p(100, 100))

    expect(
      strokes(cad.scene().primitives, THEME.rubberBand).length
    ).toBeGreaterThan(0)
  })

  it("stays a pure function of the model — building twice is identical", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    expect(cad.scene()).toEqual(cad.scene())
  })
})
