import { describe, expect, it } from "vitest"
import type { ScenePrimitive } from "../scene/types"
import type {
  CircleEntity,
  EllipseEntity,
  Entity,
  SplineEntity,
} from "../domain/entities"
import type { Vec3 } from "../geometry/Vec3"
import { V, type Vec2 } from "../geometry/Vec2"
import { bsplineDomain, bsplineLength } from "../geometry/nurbs"
import {
  assignEntityLinetype,
  closestPointOnSpline,
  createBlockDefinition,
  createInsert,
  createSpline,
  splineCurve,
  splineLength,
  splineStartPoint,
  entityAxes,
  withNormal,
  ellipseEndPoint,
  ellipseLengthTable,
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

  it("draws colour 7 as layer 0's objects are drawn, ByLayer or set (p300: layer 0 is 7)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0), { id: "BYLAYER" }),
        {
          ...lineOf(p(-100, 50), p(100, 50), { id: "SEVEN" }),
          color: "#ffffff",
        },
      ],
    })
    cad.moveTo(p(0, 400))

    expect(strokes(cad.scene().primitives, THEME.entity)).toHaveLength(2)
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

  // LAYLOCKFADECTL 50, the default (p00): a locked layer's objects fade half
  // way into the background (desktop properties/d00-2), a block reference's
  // whole, and as they were once unlocked.
  it("draws a locked layer's objects faded to half (properties/p00, d00-2)", () => {
    const cad = createHarness({
      blocks: [
        createBlockDefinition("BAR", p(0, 0), [
          lineOf(p(0, 0), p(10, 0), { id: "bar-line", layerId: "red" }),
        ]),
      ],
    })
    const locked = cad.runtime.createLayer("Locked", "#00ff00")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: locked }),
      createInsert("BAR", p(0, 50), { id: "I1", layerId: locked }),
    ])
    cad.runtime.updateLayer(locked, { locked: true })
    cad.moveTo(p(400, 400))

    expect(strokes(cad.scene().primitives, "#00ff00")).toEqual([])
    expect(
      strokes(cad.scene().primitives, "rgba(0, 255, 0, 0.5)")
    ).toHaveLength(1)
    expect(
      strokes(cad.scene().primitives, "rgba(226, 232, 240, 0.5)")
    ).toHaveLength(1)

    cad.runtime.updateLayer(locked, { locked: false })
    expect(strokes(cad.scene().primitives, "#00ff00")).toHaveLength(1)
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

  /**
   * A circle's drawn dashes as `[from, to]` in degrees of its own parameter
   * (counter-clockwise from its OCS X about its normal), rebuilt from the
   * renderer's formula, the view being the plan; `null` when it is drawn as
   * one solid circle.
   */
  function circleDashes(circle: CircleEntity): [number, number][] | null {
    const cad = createHarness({ entities: [circle] })
    const drawn = strokes(cad.scene().primitives, THEME.entity)
    if (drawn.length === 1 && drawn[0].kind === "circle") {
      expect(drawn[0].stroke?.dash).toBeUndefined()
      return null
    }
    const { x: X, y: Y } = entityAxes(circle)
    const det = X.x * Y.y - X.y * Y.x
    const center = {
      x: X.x * circle.center.x + Y.x * circle.center.y,
      y: X.y * circle.center.x + Y.y * circle.center.y,
    }
    const parameter = (screen: { x: number; y: number }) => {
      const w = cad.runtime.viewport.screenToWorld(screen)
      const dx = (w.x - center.x) / circle.radius
      const dy = (w.y - center.y) / circle.radius
      const t = Math.atan2(
        (X.x * dy - X.y * dx) / det,
        (Y.y * dx - Y.x * dy) / det
      )
      return ((t * 180) / Math.PI + 360) % 360
    }
    const dashes = drawn.map((piece): [number, number] => {
      if (piece.kind === "arc") {
        const at = (angle: number) => ({
          x: piece.center.x + piece.radius * Math.cos(angle),
          y: piece.center.y + piece.radius * Math.sin(angle),
        })
        return [parameter(at(piece.startAngle)), parameter(at(piece.endAngle))]
      }
      if (piece.kind !== "ellipse") throw new Error(piece.kind)
      const at = (angle: number) => ({
        x:
          piece.center.x +
          piece.radiusX * Math.cos(piece.rotation) * Math.cos(angle) -
          piece.radiusY * Math.sin(piece.rotation) * Math.sin(angle),
        y:
          piece.center.y +
          piece.radiusX * Math.sin(piece.rotation) * Math.cos(angle) +
          piece.radiusY * Math.cos(piece.rotation) * Math.sin(angle),
      })
      return [parameter(at(piece.startAngle)), parameter(at(piece.endAngle))]
    })
    return dashes
      .map(([from, to]): [number, number] => [
        +from.toFixed(6) % 360,
        +(to < from - 1e-9 ? to + 360 : to).toFixed(6),
      ])
      .sort((a, b) => a[0] - b[0])
  }

  const dashedCircle = (radius: number, normal?: Vec3): CircleEntity => {
    const circle = assignEntityLinetype(
      circleOf(p(0, 0), radius, { id: "C1" }),
      "Dashed"
    ) as CircleEntity
    return normal ? withNormal(circle, normal) : circle
  }

  // probe circle/p230, measured on the plot: a DASHED circle of radius 10
  // (3.3 periods) is three dashes of 80° from its start, counter-clockwise.
  it("lays a circle's pattern from its start, counter-clockwise, in whole stretched periods", () => {
    expect(circleDashes(dashedCircle(10))).toEqual([
      [0, 80],
      [120, 200],
      [240, 320],
    ])
  })

  // probes circle/p231, p232 (and desktop circle/d14, the screen alike): k
  // = L / period; n = max(2, round(k)) periods, and under one period solid.
  it.each([
    [0.9, null],
    [0.98, null],
    [1.02, 2],
    [1.1, 2],
    [1.4, 2],
    [1.98, 2],
    [2.4, 2],
    [2.6, 3],
    [3.3, 3],
    [3.45, 3],
    [3.55, 4],
    [4.45, 4],
    [4.55, 5],
  ])("draws a circle of %s periods as %s stretched ones", (k, periods) => {
    const radius = (k * 19.05) / (2 * Math.PI)
    const dashes = circleDashes(dashedCircle(radius))
    if (periods === null) return expect(dashes).toBeNull()
    expect(dashes).toHaveLength(periods)
    const sweep = (360 * 12.7) / 19.05 / periods
    dashes!.forEach(([from, to], i) => {
      expect(from).toBeCloseTo((360 / periods) * i, 6)
      expect(to - from).toBeCloseTo(sweep, 6)
    })
  })

  // probes circle/p231, p232: a circle drawn with its normal along −Z (UCS X
  // 180) starts at 180° and runs clockwise in plan.
  it("lays a flipped circle's pattern clockwise in plan, from 180°", () => {
    const flipped = dashedCircle(10, { x: 0, y: 0, z: -1 })
    expect(circleDashes(flipped)).toEqual([
      [0, 80],
      [120, 200],
      [240, 320],
    ])
    const cad = createHarness({ entities: [flipped] })
    const first = strokes(cad.scene().primitives, THEME.entity)[0]
    if (first.kind !== "ellipse") throw new Error(first.kind)
    const along = (angle: number) =>
      cad.runtime.viewport.screenToWorld({
        x:
          first.center.x +
          first.radiusX * Math.cos(first.rotation) * Math.cos(angle) -
          first.radiusY * Math.sin(first.rotation) * Math.sin(angle),
        y:
          first.center.y +
          first.radiusX * Math.sin(first.rotation) * Math.cos(angle) +
          first.radiusY * Math.cos(first.rotation) * Math.sin(angle),
      })
    const start = along(first.startAngle)
    const end = along(first.endAngle)
    expect(start.x).toBeCloseTo(-10, 6)
    expect(start.y).toBeCloseTo(0, 6)
    expect((Math.atan2(end.y, end.x) * 180) / Math.PI).toBeCloseTo(100, 6)
  })

  // probe circle/p233: a circle tilted by UCS Y 45 has its pattern at true
  // length in its plane, its first dash ending at the parameter's 80°.
  it("lays a tilted circle's pattern at true length in its plane", () => {
    const tilted = dashedCircle(10, {
      x: Math.SQRT1_2,
      y: 0,
      z: Math.SQRT1_2,
    })
    expect(circleDashes(tilted)).toEqual([
      [0, 80],
      [120, 200],
      [240, 320],
    ])
  })

  it("draws a circle's dot as a run as wide as the stroke", () => {
    // 62.83 / 25.4 = 2.47 periods of DASHDOT: two, stretched by 1.2368.
    const cad = createHarness({
      entities: [
        assignEntityLinetype(circleOf(p(0, 0), 10, { id: "C1" }), "DashDot"),
      ],
    })
    const pieces = strokes(cad.scene().primitives, THEME.entity)
    expect(pieces.map((piece) => piece.kind)).toEqual([
      "arc",
      "arc",
      "arc",
      "arc",
    ])
    const dot = pieces[1]
    if (dot.kind !== "arc") return
    expect(dot.radius * Math.abs(dot.endAngle - dot.startAngle)).toBeCloseTo(
      dot.stroke.width,
      6
    )
    expect(dot.stroke.dash).toBeUndefined()
  })

  it("leaves a huge circle's pattern to the renderer, unfitted", () => {
    // 3298 periods: past MAX_FITTED_PERIODS, one curve rather than thousands.
    const cad = createHarness({ entities: [dashedCircle(10000)] })
    const drawn = strokes(cad.scene().primitives, THEME.entity)
    expect(drawn.map((primitive) => primitive.kind)).toEqual(["circle"])
    expect(drawn[0].kind === "circle" && drawn[0].stroke?.dash).toEqual([
      12.7, 6.35,
    ])
  })

  /**
   * An upright arc's drawn dashes as `[from, to]` in degrees, rebuilt from
   * the renderer's formula in plan; `null` when it is drawn as one solid arc.
   */
  function arcDashes(arc: Entity): [number, number][] | null {
    if (arc.type !== "arc") throw new Error(arc.type)
    const cad = createHarness({ entities: [arc] })
    const drawn = strokes(cad.scene().primitives, THEME.entity)
    if (drawn.length === 1 && drawn[0].kind === "arc" && !drawn[0].stroke.dash)
      return null
    const degrees = (screen: { x: number; y: number }) => {
      const w = cad.runtime.viewport.screenToWorld(screen)
      const angle = Math.atan2(w.y - arc.center.y, w.x - arc.center.x)
      return (((angle * 180) / Math.PI) % 360) + (angle < -1e-9 ? 360 : 0)
    }
    return drawn
      .map((piece): [number, number] => {
        if (piece.kind !== "arc") throw new Error(piece.kind)
        expect(piece.stroke.dash).toBeUndefined()
        const at = (angle: number) => ({
          x: piece.center.x + piece.radius * Math.cos(angle),
          y: piece.center.y + piece.radius * Math.sin(angle),
        })
        const from = degrees(at(piece.startAngle))
        const to = degrees(at(piece.endAngle))
        return [+from.toFixed(2), +(to < from ? to + 360 : to).toFixed(2)]
      })
      .sort((a, b) => a[0] - b[0])
  }

  const dashedArc = (radius: number, from: number, to: number) =>
    assignEntityLinetype(
      arcOf(p(0, 0), radius, deg(from), deg(to), { id: "A1" }),
      "Dashed"
    )

  // probe arc/p200 (and desktop arc/d10, the screen alike), measured along
  // the plot: an arc's pattern is centred over its length as a line's is,
  // each end on a dash of (L − m·period + first dash) / 2; under one period
  // it is solid.
  it.each([
    [
      10,
      0,
      180,
      [
        [0, 71.81],
        [108.19, 180],
      ],
    ],
    [
      10,
      0,
      270,
      [
        [0, 62.23],
        [98.62, 171.38],
        [207.77, 270],
      ],
    ],
    [
      30,
      0,
      120,
      [
        [0, 17.55],
        [29.68, 53.94],
        [66.06, 90.32],
        [102.45, 120],
      ],
    ],
    [
      20,
      210,
      360,
      [
        [210, 248.62],
        [266.81, 303.19],
        [321.38, 360],
      ],
    ],
    [10, 30, 120, null],
  ] as const)(
    "lays an arc of radius %s from %s° to %s° centred over its length",
    (radius, from, to, dashes) => {
      expect(arcDashes(dashedArc(radius, from, to))).toEqual(dashes)
    }
  )

  it("draws an arc's dot as a run as wide as the stroke", () => {
    // 62.83 / 25.4: two whole periods of DASHDOT, a dash at each end.
    const cad = createHarness({
      entities: [
        assignEntityLinetype(
          arcOf(p(0, 0), 30, 0, deg(120), { id: "A1" }),
          "DashDot"
        ),
      ],
    })
    const pieces = strokes(cad.scene().primitives, THEME.entity)
    expect(pieces).toHaveLength(5)
    const dot = pieces[1]
    if (dot.kind !== "arc") throw new Error(dot.kind)
    const sweep = Math.abs(dot.endAngle - dot.startAngle)
    expect(dot.radius * sweep).toBeCloseTo(dot.stroke.width, 6)
  })

  it("leaves a huge arc's pattern to the renderer, unfitted", () => {
    // 3206 periods: past MAX_FITTED_PERIODS, one curve rather than thousands.
    const cad = createHarness({ entities: [dashedArc(10000, 0, 350)] })
    const drawn = strokes(cad.scene().primitives, THEME.entity)
    expect(drawn.map((primitive) => primitive.kind)).toEqual(["arc"])
    expect(drawn[0].kind === "arc" && drawn[0].stroke.dash).toEqual([
      12.7, 6.35,
    ])
  })

  it("leaves an arc ghost's own dashes on one arc", () => {
    const primitives = entityScenePrimitive(
      createHarness().runtime.viewport,
      arcOf(p(0, 0), 10, 0, deg(180)),
      { color: THEME.preview, width: 1, dash: [6, 4] }
    )
    expect(primitives.map((primitive) => primitive.kind)).toEqual(["arc"])
  })

  /**
   * An upright ellipse's drawn dashes as `[from, to]` along its length from
   * its start, rebuilt from the renderer's parameters in plan (the camera's
   * Y flip negates them); `null` when it is drawn as one solid curve.
   */
  function ellipseDashes(ellipse: EllipseEntity): [number, number][] | null {
    const cad = createHarness({
      entities: [assignEntityLinetype(ellipse, "Dashed")],
    })
    const drawn = strokes(cad.scene().primitives, THEME.entity)
    const only = drawn[0]
    if (drawn.length === 1 && only.kind === "ellipse" && !only.stroke.dash)
      return null
    const start = ellipse.startParam ?? 0
    const along = (param: number) =>
      param - start < 1e-12
        ? 0
        : ellipseLengthTable({ ...ellipse, startParam: start, endParam: param })
            .length
    return drawn
      .map((piece): [number, number] => {
        if (piece.kind !== "ellipse") throw new Error(piece.kind)
        expect(piece.stroke.dash).toBeUndefined()
        return [
          +along(-piece.startAngle).toFixed(2),
          +along(-piece.endAngle).toFixed(2),
        ]
      })
      .sort((a, b) => a[0] - b[0])
  }

  // probe ellipse/p330, measured along the plot: a whole ellipse is laid as
  // a circle, from its start in whole stretched periods (13 round 242.21,
  // 12.71 periods of DASHED), whether level or turned.
  it.each([0, 30])("lays a whole ellipse turned %s° as a circle", (turn) => {
    const ellipse = ellipseOf(
      p(0, 0),
      p(50 * Math.cos(deg(turn)), 50 * Math.sin(deg(turn))),
      0.5,
      { id: "E1" }
    )
    const dashes = ellipseDashes(ellipse)!
    expect(dashes).toHaveLength(13)
    const period = 242.2112 / 13
    dashes.forEach(([from, to], i) => {
      expect(from).toBeCloseTo(i * period, 1)
      expect(to - from).toBeCloseTo((period * 12.7) / 19.05, 1)
    })
  })

  // probe ellipse/p330: an elliptical arc centred over its length as an arc
  // is, its ends (L − m·period + 12.7) / 2: 8.05 on the quarter (L 60.55),
  // 9.75 on the half (121.11), 14.42 from 10° to 200° (130.44).
  it.each([
    [
      0,
      90,
      [
        [0, 8.05],
        [14.4, 27.1],
        [33.45, 46.15],
        [52.5, 60.55],
      ],
    ],
    [0, 180, 9.75],
    [10, 200, 14.42],
  ] as const)(
    "lays an elliptical arc from %s° to %s° centred over its length",
    (from, to, expected) => {
      const arc = ellipseOf(p(0, 0), p(50, 0), 0.5, {
        id: "A1",
        startParam: Math.atan2(Math.sin(deg(from)) / 0.5, Math.cos(deg(from))),
        endParam: Math.atan2(Math.sin(deg(to)) / 0.5, Math.cos(deg(to))),
      })
      const dashes = ellipseDashes(arc)!
      if (typeof expected !== "number") {
        expect(dashes).toEqual(expected)
        return
      }
      const first = dashes[0]
      const last = dashes[dashes.length - 1]
      expect(first[1] - first[0]).toBeCloseTo(expected, 1)
      expect(last[1] - last[0]).toBeCloseTo(expected, 1)
    }
  )

  // probe ellipse/p330: an ellipse shorter than one period (14.53) is solid.
  it("draws an ellipse shorter than its pattern solid", () => {
    expect(ellipseDashes(ellipseOf(p(0, 0), p(3, 0), 0.5))).toBeNull()
  })

  /**
   * A dashed spline's drawn dashes as `[from, to]` along its length from its
   * start, each path's ends found on the curve, at LTSCALE 3 as p328 drew
   * them; `null` when it is drawn as one solid path.
   */
  function splineDashes(spline: SplineEntity): [number, number][] | null {
    const cad = createHarness({
      entities: [assignEntityLinetype(spline, "Dashed")],
    })
    cad.runtime.setLtScale(3)
    const camera = cad.runtime.viewport
    const drawn = strokes(cad.scene().primitives, THEME.entity)
    const only = drawn[0]
    if (drawn.length === 1 && only.kind === "path" && !only.stroke?.dash)
      return null
    const curve = splineCurve(spline)
    const { start, end } = bsplineDomain(curve)
    const along = (screen: Vec2) => {
      const { t } = closestPointOnSpline(spline, camera.screenToWorld(screen))
      return bsplineLength(curve, start, start + t * (end - start))
    }
    return drawn.map((piece): [number, number] => {
      if (piece.kind !== "path") throw new Error(piece.kind)
      expect(piece.stroke?.dash).toBeUndefined()
      return [along(piece.points[0]), along(piece.points.at(-1)!)]
    })
  }

  // probe spline/p328, measured on the plot (DASHED at LTSCALE 3, 38.1 on,
  // 19.05 off): laid as a line is, centred over the length, each run a piece
  // of the curve. The plot's runs are each about half a unit longer at both
  // ends (the pen's width).
  it.each([
    [
      "an open fit spline",
      createSpline("fit", [p(0, 0), p(40, 40), p(80, 0), p(120, 40)]),
      [
        [0, 22.5],
        [40.5, 79.5],
        [97.5, 136.8],
        [154.8, 177],
      ],
    ],
    [
      "an open CV spline",
      createSpline("cv", [p(60, 60), p(80, 120), p(100, 40), p(140, 100)]),
      [
        [0, 43],
        [61, 104],
      ],
    ],
  ] as const)("lays %s's dashes centred over its length", (_, spline, plot) => {
    const dashes = splineDashes(spline)!
    expect(dashes).toHaveLength(plot.length)
    dashes.forEach(([from, to], i) => {
      expect(Math.abs(from - plot[i][0])).toBeLessThan(1)
      expect(Math.abs(to - plot[i][1])).toBeLessThan(1)
    })
    // Its end runs are the same length, as a line's.
    const length = splineLength(spline)
    const first = dashes[0][1] - dashes[0][0]
    expect(length - dashes.at(-1)![0]).toBeCloseTo(first, 3)
  })

  // probe spline/p328: a closed spline is centred too, not laid as a circle,
  // so one dash runs across its start.
  it.each([
    [
      "fit",
      createSpline("fit", [p(0, 60), p(40, 60), p(40, 100), p(0, 100)], {
        closed: true,
      }),
    ],
    [
      "CV",
      createSpline("cv", [p(160, 60), p(200, 60), p(200, 100), p(160, 100)], {
        closed: true,
      }),
    ],
  ] as const)(
    "runs one dash across a closed %s spline's start",
    (_, spline) => {
      const cad = createHarness({
        entities: [assignEntityLinetype(spline, "Dashed")],
      })
      cad.runtime.setLtScale(3)
      const drawn = strokes(cad.scene().primitives, THEME.entity)
      const length = splineLength(spline)
      const period = 57.15
      const periods = Math.floor(length / period)
      expect(drawn).toHaveLength(periods)
      const startOnScreen = cad.runtime.viewport.worldToScreen(
        splineStartPoint(spline)
      )
      const across = drawn.filter(
        (piece) =>
          piece.kind === "path" &&
          piece.points
            .slice(1, -1)
            .some((point) => V.distance(point, startOnScreen) < 1e-6)
      )
      expect(across).toHaveLength(1)
    }
  )

  // probe spline/p328: the fit spline 150,0 155,5 160,0, shorter than one
  // period, is solid.
  it("draws a spline shorter than its pattern solid", () => {
    expect(
      splineDashes(createSpline("fit", [p(150, 0), p(155, 5), p(160, 0)]))
    ).toBeNull()
  })

  it("leaves a spline ghost's own dashes on one path", () => {
    const primitives = entityScenePrimitive(
      createHarness().runtime.viewport,
      createSpline("fit", [p(0, 0), p(40, 40), p(80, 0), p(120, 40)]),
      { color: THEME.preview, width: 1, dash: [6, 4] }
    )
    expect(primitives.map((primitive) => primitive.kind)).toEqual(["path"])
  })

  it("leaves an ellipse ghost's own dashes on one curve", () => {
    const primitives = entityScenePrimitive(
      createHarness().runtime.viewport,
      ellipseOf(p(0, 0), p(50, 0), 0.5),
      { color: THEME.preview, width: 1, dash: [6, 4] }
    )
    expect(primitives.map((primitive) => primitive.kind)).toEqual(["ellipse"])
  })

  it("leaves a circle ghost's own dashes on one circle", () => {
    const primitives = entityScenePrimitive(
      createHarness().runtime.viewport,
      circleOf(p(0, 0), 10),
      { color: THEME.preview, width: 1, dash: [6, 4] }
    )
    expect(primitives.map((primitive) => primitive.kind)).toEqual(["circle"])
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

  // mellowcad's own look, no AutoCAD probe (desktop d01 is to check it):
  // the icon, its corner placement and the broken pencil.
  describe("the UCS icon", () => {
    const xArm = (cad: ReturnType<typeof createHarness>) =>
      strokes(cad.scene().primitives, THEME.ucsIconX).find(
        (primitive) => primitive.kind === "segment"
      )
    const pencil = (cad: ReturnType<typeof createHarness>) =>
      strokes(cad.scene().primitives, THEME.crosshair).filter(
        (primitive) =>
          primitive.kind === "path" && primitive.points.length === 5
      )

    it("becomes the broken pencil when the XY plane is seen edge-on", () => {
      const cad = createHarness({ ucsIcon: true })
      expect(xArm(cad)).toBeDefined()
      expect(pencil(cad)).toHaveLength(0)

      // UCS X 90 in the plan view: the view looks along the new XY plane.
      cad.command("UCS").option("X").type("90").enter()

      expect(xArm(cad)).toBeUndefined()
      expect(strokes(cad.scene().primitives, THEME.ucsIconY)).toHaveLength(0)
      expect(pencil(cad)).toHaveLength(2)
    })

    it("sits on the origin while it fits, in the lower-left corner when not", () => {
      const cad = createHarness({ ucsIcon: true, width: 1000, height: 800 })
      const arm = xArm(cad)
      expect(arm?.kind === "segment" && arm.a).toBeCloseToPoint(
        cad.runtime.viewport.worldToScreen(p(0, 0))
      )

      cad.command("UCS").type("100000,100000").enter().enter()
      const moved = xArm(cad)

      // Where Noorigin puts it: the same corner whatever the origin.
      const noOrigin = createHarness({
        ucsIcon: true,
        width: 1000,
        height: 800,
      })
      noOrigin.command("UCSICON").option("Noorigin")
      const corner = xArm(noOrigin)
      expect(moved?.kind === "segment" && corner?.kind === "segment").toBe(true)
      if (moved?.kind !== "segment" || corner?.kind !== "segment") return
      expect(moved.a).toBeCloseToPoint(corner.a)
      expect(moved.a.x).toBeLessThan(100)
      expect(moved.a.y).toBeGreaterThan(800 / 2)
    })

    it("is not drawn at UCSICON 0", () => {
      const cad = createHarness({ ucsIcon: true })

      cad.command("'UCSICON").type("0").enter()

      expect(cad.runtime.document.getSettings().ucsIcon.visible).toBe(false)
      expect(strokes(cad.scene().primitives, THEME.ucsIconX)).toHaveLength(0)
      expect(strokes(cad.scene().primitives, THEME.ucsIconY)).toHaveLength(0)
    })
  })

  it("stays a pure function of the model — building twice is identical", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    expect(cad.scene()).toEqual(cad.scene())
  })
})
