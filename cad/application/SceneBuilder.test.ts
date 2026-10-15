import { describe, expect, it } from "vitest"
import type { ScenePrimitive } from "../scene/types"
import type { EllipseEntity } from "../domain/entities"
import { ellipseEndPoint, ellipseStartPoint } from "../domain/entities"
import { THEME } from "../scene/theme"
import { createHarness } from "../../test/harness"
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

  it("highlights the selection instead of its normal colour", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1")

    expect(
      strokes(cad.scene().primitives, THEME.selected).length
    ).toBeGreaterThan(0)
    expect(strokes(cad.scene().primitives, THEME.entity)).toHaveLength(0)
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
