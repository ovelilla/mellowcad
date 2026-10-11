import { Vec2, V } from "../../geometry/Vec2"
import {
  Vec3,
  add3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "../../geometry/Vec3"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  DocumentSettings,
  formatAngle,
  formatLength,
  unitSuffix,
} from "../../domain/units"
import { Ucs, worldDirectionToUcs } from "../../domain/ucs"
import { Entity, readsInPlan } from "../../domain/entities"
import { objectArea } from "../../domain/objectArea"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"
import { lastObject } from "./objectSelection"
import type { PromptId } from "../../locales/types"

/**
 * MEASURE (AutoCAD's DIST / MEASUREGEOM). Creates no geometry — the result is a
 * transient overlay (measurement guide + a readout chip that follows the
 * cursor) and disappears with the tool. Two modes:
 *
 * - **Distance**: pick two points → AutoCAD's DIST: the 3D distance, the angle
 *   in and from the UCS's XY plane and the ΔX/ΔY/ΔZ between them, on the
 *   readout while the second is picked and then on the command line, and the
 *   command ends, as AutoCAD's DIST does.
 * - **Area**: AutoCAD's AREA — a run of points, the enclosed area and perimeter
 *   of the (implicitly closed) polygon updating live with the cursor as a
 *   tentative vertex, or one object's (Object, the prompt's default); the
 *   command reports it and ends, as AutoCAD's does.
 */
export type MeasureMode = "distance" | "area"

type MeasureState =
  | { readonly phase: "first" }
  | { readonly phase: "second"; readonly base: Vec3; readonly cursor: Vec3 }
  | {
      readonly phase: "area"
      readonly points: readonly Vec3[]
      readonly cursor: Vec2
    }
  | { readonly phase: "areaObject"; readonly hover: Entity | null }
  | {
      /** DIST's Multiple points, or its Length's `Specify length of line:`. */
      readonly phase: "multiple" | "length"
      readonly points: readonly Vec3[]
      readonly cursor: Vec3
      /** The run's length so far, as `Distance = …` writes it. */
      readonly total: string
    }

interface Measurement {
  readonly base: Vec3
  readonly tip: Vec3
}

export class MeasureTool implements Tool {
  constructor(
    private readonly mode: MeasureMode,
    readonly id: string,
    readonly shortcut?: string
  ) {}

  private state: MeasureState = { phase: "first" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset(ctx.viewport.worldCenter())
    this.askPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset({ x: 0, y: 0 })
    ctx.dynamicInput.close()
  }

  private reset(origin: Vec2): void {
    this.state =
      this.mode === "area"
        ? { phase: "area", points: [], cursor: origin }
        : { phase: "first" }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
    if (
      this.state.phase === "second" ||
      this.state.phase === "multiple" ||
      this.state.phase === "length"
    ) {
      this.state = { ...this.state, cursor: input.point }
    } else if (this.state.phase === "area") {
      this.state = { ...this.state, cursor: input.point }
    } else if (this.state.phase === "areaObject") {
      const hover = this.pickArea(input.world, ctx)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { phase: "areaObject", hover }
      }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "areaObject") {
      const picked = this.pickArea(input.world, ctx)
      if (picked && this.reportObject(picked, ctx)) ctx.endCommand()
    } else {
      this.place(input.point, ctx)
    }
    ctx.requestRender()
  }

  private place(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase === "first") {
      this.state = { phase: "second", base: point, cursor: point }
    } else if (this.state.phase === "second") {
      ctx.report(distanceReport({ base: this.state.base, tip: point }, ctx))
      ctx.endCommand()
      return
    } else if (this.state.phase === "multiple") {
      this.walk([...this.state.points, point], ctx)
      return
    } else if (this.state.phase === "length") {
      // A point there gives the length from the last one, as AutoCAD's does.
      this.extend(length3(sub3(point, lastOf(this.state.points))), ctx)
      return
    } else if (this.state.phase === "area") {
      this.state = {
        phase: "area",
        points: [...this.state.points, point],
        cursor: point,
      }
    }
    this.askPoint(ctx)
  }

  /**
   * Multiple points' run so far, then its next point: `Distance = …` once
   * it has a segment, as AutoCAD 2023's console writes it before each.
   */
  private walk(points: readonly Vec3[], ctx: ToolContext): void {
    const total = formatLength(pathLength(points), ctx.document.getSettings())
    this.state = { phase: "multiple", points, cursor: lastOf(points), total }
    if (points.length > 1) {
      ctx.report(ctx.text.message("distanceTotal", { value: total }))
    }
    this.askPoint(ctx)
  }

  /**
   * Length's segment: on along the last one (a negative length back), or
   * along the UCS's X axis before there is one.
   */
  private extend(length: number, ctx: ToolContext): void {
    if (this.state.phase !== "length" || !Number.isFinite(length)) return
    const { points } = this.state
    const last = lastOf(points)
    const along =
      points.length > 1
        ? normalize3(sub3(last, points[points.length - 2]))
        : null
    const direction = along ?? ctx.ucs.xAxis
    this.walk([...points, add3(last, scale3(direction, length))], ctx)
  }

  private askLength(ctx: ToolContext): void {
    if (this.state.phase !== "multiple") return
    this.state = { ...this.state, phase: "length" }
    ctx.dynamicInput.open({
      fields: [{ id: "distance", prompt: "length", kind: "distance" }],
      commit: (values, commitCtx) => this.extend(values.distance, commitCtx),
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("distance").trim()
        if (!isCoordinateExpression(text)) return false
        const point = parseCoordinate(text, {
          lastPoint: this.basePoint() ?? commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.place(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * A point can be typed too; one given without a Z lies at the current
   * elevation, as DIST's help says, which is what `parseCoordinate` does.
   */
  private askPoint(ctx: ToolContext): void {
    const first =
      this.state.phase === "first" ||
      (this.state.phase === "area" && this.state.points.length === 0)
    ctx.dynamicInput.open({
      fields: [
        {
          id: "point",
          prompt: first ? "firstPoint" : "secondPoint",
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") return this.enter(commitCtx)
        const point = parseCoordinate(text, {
          lastPoint: this.basePoint() ?? commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.place(point, commitCtx)
        commitCtx.requestRender()
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private basePoint(): Vec3 | null {
    switch (this.state.phase) {
      case "second":
        return this.state.base
      case "area":
        return this.state.points.at(-1) ?? null
      case "multiple":
      case "length":
        return lastOf(this.state.points)
      default:
        return null
    }
  }

  /**
   * Enter, at the box or the drawing: DIST's first point takes LASTPOINT and
   * its second measures to the first (LASTPOINT again), as AutoCAD's do, Multiple points'
   * next point takes `<Total>` and its Length refuses it; AREA's first corner
   * takes `<Object>`, from the third point it takes `<Total>`, and before that
   * AutoCAD 2023's console refuses it as a missing point.
   */
  private enter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "first":
        this.place(ctx.lastPoint, ctx)
        return true
      case "second":
        this.place(this.state.base, ctx)
        return true
      case "multiple":
        if (this.invokeDistOption("Total", ctx) === "end") ctx.endCommand()
        return true
      case "length":
        ctx.report(
          ctx.text.message("requiresDistance", {
            points: "second",
            keyword: "no",
          }),
          "error"
        )
        return true
      case "area": {
        const { points } = this.state
        if (points.length === 0) this.askObject(ctx)
        else if (points.length >= 3) {
          this.reportPolygon(points, ctx)
          ctx.endCommand()
        } else ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
        return true
      }
      case "areaObject":
        return false
    }
  }

  question(): PromptId | null {
    switch (this.state.phase) {
      case "first":
        return "specifyFirstPoint"
      case "second":
        return "distSecondPointOr"
      case "multiple":
        return "specifyNextPointOr"
      case "length":
        return "specifyLengthOfLine"
      case "area":
        return this.state.points.length === 0
          ? "specifyFirstCornerPointOr"
          : "specifyNextPointOr"
      case "areaObject":
        return "selectObjects"
    }
  }

  /**
   * AREA's object is one pick, and Multiple points' next point says the run
   * so far again after its refusal, as AutoCAD 2023's console refuses them.
   */
  takes(): QuestionInput | null {
    if (this.state.phase === "areaObject") return "objectOrLast"
    if (this.state.phase === "multiple" && this.state.points.length > 1) {
      return {
        refusal: ["pointOrKeywordRequired", "distanceTotal"],
        values: { value: this.state.total },
      }
    }
    return null
  }

  /**
   * DIST's second point keeps LASTPOINT at its first, where Multiple
   * points' set it, as AutoCAD 2023's console shows.
   */
  setsLastPoint(): boolean | null {
    if (this.state.phase === "second") return false
    return this.state.phase === "multiple" ? true : null
  }

  defaultOption(): string | null {
    if (this.state.phase === "multiple") return "Total"
    if (this.state.phase !== "area") return null
    const { length } = this.state.points
    return length === 0 ? "Object" : length >= 3 ? "Total" : null
  }

  onEnter(ctx: ToolContext): boolean {
    return this.enter(ctx)
  }

  /** While marking an area, Backspace removes the last placed vertex too. */
  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Backspace" && this.state.phase === "area") {
      this.undoPoint(ctx)
    }
  }

  /**
   * WHY no Add area / Subtract area, nor Arc and Length at AREA's next point,
   * nor Arc at DIST's: not built (docs/autocad-coverage.md).
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "areaObject") {
      return [{ id: "Last", hidden: true, prompt: "selectObjects" }]
    }
    if (this.state.phase === "second") return [{ id: "Multiple" }]
    if (this.state.phase === "multiple") {
      const later = [{ id: "Length" }, { id: "Undo" }, { id: "Total" }]
      return this.state.points.length > 1 ? [{ id: "Close" }, ...later] : later
    }
    if (this.state.phase !== "area") return []
    const { length } = this.state.points
    if (length === 0) return [{ id: "Object" }]
    return length >= 3 ? [{ id: "Undo" }, { id: "Total" }] : [{ id: "Undo" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "second" || this.state.phase === "multiple") {
      return this.invokeDistOption(id, ctx)
    }
    switch (id) {
      case "Object":
        if (this.state.phase !== "area") return "unhandled"
        this.askObject(ctx)
        return "continue"
      case "Undo":
        return this.undoPoint(ctx) ? "continue" : "unhandled"
      case "Total":
        if (this.state.phase !== "area") return "unhandled"
        this.reportPolygon(this.state.points, ctx)
        return "end"
      case "Last": {
        if (this.state.phase !== "areaObject") return "unhandled"
        const last = lastObject(ctx)
        return last && readsInPlan(last) && this.reportObject(last, ctx)
          ? "end"
          : "continue"
      }
      default:
        return "unhandled"
    }
  }

  /**
   * DIST's Multiple points and what its next point offers: Close back to the
   * first point and Total, each `Distance = …` and the end, Length, and Undo
   * of one point (`All segments already undone.` at the first).
   */
  private invokeDistOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "second") {
      if (id !== "Multiple") return "unhandled"
      this.walk([state.base], ctx)
      return "continue"
    }
    if (state.phase !== "multiple") return "unhandled"
    switch (id) {
      case "Close":
        if (state.points.length < 2) return "unhandled"
        this.walk([...state.points, state.points[0]], ctx)
        return "end"
      case "Total":
        ctx.report(ctx.text.message("distanceTotal", { value: state.total }))
        return "end"
      case "Length":
        this.askLength(ctx)
        return "continue"
      case "Undo":
        if (state.points.length === 1) {
          ctx.report(ctx.text.message("allSegmentsUndone"))
        } else {
          this.walk(state.points.slice(0, -1), ctx)
        }
        return "continue"
      default:
        return "unhandled"
    }
  }

  /**
   * AREA's Undo takes back the last point; the first corner it keeps, saying
   * so as AutoCAD 2023's console does.
   */
  private undoPoint(ctx: ToolContext): boolean {
    if (this.state.phase !== "area" || this.state.points.length === 0) {
      return false
    }
    if (this.state.points.length === 1) {
      ctx.report(ctx.text.message("allSegmentsUndone"))
      ctx.report(ctx.text.message("commandCompletelyUndone"))
      return true
    }
    this.state = { ...this.state, points: this.state.points.slice(0, -1) }
    ctx.requestRender()
    return true
  }

  private askObject(ctx: ToolContext): void {
    this.state = { phase: "areaObject", hover: null }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.requestRender()
  }

  /** What an Object pick can take: an object lying in the UCS's XY plane. */
  private pickArea(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    return hit && readsInPlan(hit) ? hit : null
  }

  /** Whether the object has an area, which was then reported. */
  private reportObject(entity: Entity, ctx: ToolContext): boolean {
    const measured = objectArea(entity)
    if (measured === null) {
      ctx.report(ctx.text.message("objectHasNoArea"))
      return false
    }
    const settings = ctx.document.getSettings()
    ctx.report(
      ctx.text.message("areaReport", {
        area: formatLength(measured.area, settings),
        measured: measured.measured,
        around: formatLength(measured.around, settings),
      })
    )
    return true
  }

  private reportPolygon(points: readonly Vec2[], ctx: ToolContext): void {
    const settings = ctx.document.getSettings()
    ctx.report(
      ctx.text.message("areaReport", {
        area: formatLength(polygonArea(points), settings),
        measured: "perimeter",
        around: formatLength(polygonPerimeter(points), settings),
      })
    )
  }

  wantsSnap(): boolean {
    return this.state.phase !== "areaObject"
  }

  getConstraintAnchor(): Vec2 | null {
    return this.basePoint()
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    const settings = ctx.document.getSettings()
    if (this.state.phase === "second") {
      this.drawDistance(out, ctx, this.state.base, this.state.cursor, settings)
    }
    if (this.state.phase === "multiple" || this.state.phase === "length") {
      const { points, cursor } = this.state
      this.drawRun(
        out,
        ctx,
        this.state.phase === "multiple" ? [...points, cursor] : points,
        settings
      )
    }
    if (this.state.phase === "area" && this.state.points.length > 0) {
      this.drawArea(out, ctx, this.state.points, this.state.cursor, settings)
    }
    if (this.state.phase === "areaObject" && this.state.hover) {
      out.push(
        ...entityScenePrimitive(ctx.viewport, this.state.hover, {
          color: THEME.selected,
          width: 2,
        })
      )
    }
    return out
  }

  private drawDistance(
    out: ScenePrimitive[],
    ctx: ToolContext,
    base: Vec3,
    tip: Vec3,
    settings: DocumentSettings
  ): void {
    const { viewport } = ctx
    const a = viewport.worldToScreen(base)
    const b = viewport.worldToScreen(tip)
    out.push({
      kind: "segment",
      a,
      b,
      stroke: {
        color: THEME.selected,
        width: 1.5,
        dash: [6, 4],
      },
    })
    pushTick(out, a)
    pushTick(out, b)

    const measured = measure(base, tip, settings.ucs)
    const suffix = unitSuffix(settings.unit)
    const { text } = ctx
    const lines = [
      text.feedback("measureDistance", {
        value: formatLength(measured.distance, settings),
        unit: suffix,
      }),
      text.feedback("measureAngle", {
        value: formatAngle(measured.angleInPlane, settings),
      }),
      text.feedback("measureDeltaX", {
        value: formatLength(measured.deltaX, settings),
      }),
      text.feedback("measureDeltaY", {
        value: formatLength(measured.deltaY, settings),
      }),
      text.feedback("measureDeltaZ", {
        value: formatLength(measured.deltaZ, settings),
      }),
    ]
    // The readout follows the tip (like AutoCAD's dimensional input), placed
    // above-right of it clear of the object-snap tooltip (which sits below-right
    // of the cursor), then clamped inside the viewport.
    placeAndPushReadout(out, b, lines, viewport)
  }

  /** Multiple points' run, the cursor's point last, with its length. */
  private drawRun(
    out: ScenePrimitive[],
    ctx: ToolContext,
    points: readonly Vec3[],
    settings: DocumentSettings
  ): void {
    const { viewport } = ctx
    const screen = points.map((point) => viewport.worldToScreen(point))
    out.push({
      kind: "path",
      points: screen,
      closed: false,
      stroke: { color: THEME.selected, width: 1.5, dash: [6, 4] },
    })
    for (const p of screen) pushTick(out, p)
    const lines = [
      ctx.text.feedback("measureDistance", {
        value: formatLength(pathLength(points), settings),
        unit: unitSuffix(settings.unit),
      }),
    ]
    placeAndPushReadout(out, screen[screen.length - 1], lines, viewport)
  }

  private drawArea(
    out: ScenePrimitive[],
    ctx: ToolContext,
    points: readonly Vec2[],
    cursor: Vec2,
    settings: DocumentSettings
  ): void {
    const { viewport } = ctx
    const vertices = [...points, cursor]
    const screen = vertices.map((v) => viewport.worldToScreen(v))
    if (screen.length >= 2) {
      out.push({
        kind: "path",
        points: screen,
        closed: true,
        stroke: {
          color: THEME.selected,
          width: 1.5,
          dash: [6, 4],
        },
      })
    }
    for (const p of screen) pushTick(out, p)

    const suffix = unitSuffix(settings.unit)
    const area = polygonArea(vertices)
    const perimeter = polygonPerimeter(vertices)
    const { text } = ctx
    const lines = [
      text.feedback("measureArea", {
        value: formatLength(area, settings),
        unit: suffix,
      }),
      text.feedback("measurePerimeter", {
        value: formatLength(perimeter, settings),
        unit: suffix,
      }),
    ]
    placeAndPushReadout(out, viewport.worldToScreen(cursor), lines, viewport)
  }
}

interface DistanceMeasure {
  readonly distance: number
  readonly angleInPlane: number
  readonly angleFromPlane: number
  readonly deltaX: number
  readonly deltaY: number
  readonly deltaZ: number
}

/** DIST in model space: 3D, its components and angles relative to the UCS. */
function measure(base: Vec3, tip: Vec3, ucs: Ucs): DistanceMeasure {
  const delta = worldDirectionToUcs(ucs, V.sub(tip, base))
  const deltaZ = tip.z - base.z
  const inPlane = Math.hypot(delta.x, delta.y)
  const degrees = (radians: number) =>
    normalizeDegrees((radians * 180) / Math.PI)
  return {
    distance: Math.hypot(inPlane, deltaZ),
    angleInPlane: degrees(Math.atan2(delta.y, delta.x)),
    angleFromPlane: degrees(Math.atan2(deltaZ, inPlane)),
    deltaX: delta.x,
    deltaY: delta.y,
    deltaZ,
  }
}

function distanceReport(measurement: Measurement, ctx: ToolContext): string {
  const settings = ctx.document.getSettings()
  const measured = measure(measurement.base, measurement.tip, settings.ucs)
  const length = (value: number) => formatLength(value, settings)
  const angle = (value: number) => formatAngle(value, settings)
  return ctx.text.message("distanceReport", {
    distance: length(measured.distance),
    angleInPlane: angle(measured.angleInPlane),
    angleFromPlane: angle(measured.angleFromPlane),
    deltaX: length(measured.deltaX),
    deltaY: length(measured.deltaY),
    deltaZ: length(measured.deltaZ),
  })
}

function lastOf(points: readonly Vec3[]): Vec3 {
  return points[points.length - 1]
}

/** The 3D length of the run through `points`. */
function pathLength(points: readonly Vec3[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += length3(sub3(points[i], points[i - 1]))
  }
  return total
}

/** A small filled square marking a measured point. */
function pushTick(out: ScenePrimitive[], p: Vec2): void {
  const s = 3
  out.push({
    kind: "rect",
    min: { x: p.x - s, y: p.y - s },
    width: s * 2,
    height: s * 2,
    fill: THEME.selected,
  })
}

/** Places the readout near `anchor` (above-right, clear of the snap tooltip)
 * and pushes its chip + lines. */
function placeAndPushReadout(
  out: ScenePrimitive[],
  anchor: Vec2,
  lines: readonly string[],
  viewport: { width: number; height: number }
): void {
  const size = readoutSize(lines)
  const at = placeReadout(anchor, size, viewport)
  out.push({
    kind: "rect",
    min: at,
    width: size.width,
    height: size.height,
    fill: THEME.snapTooltipBg,
    stroke: { color: THEME.snapTooltipBorder, width: 1 },
  })
  lines.forEach((line, i) => {
    out.push({
      kind: "label",
      at: {
        x: at.x + READOUT_PAD_X,
        y: at.y + READOUT_PAD_Y + 11 + i * READOUT_LINE_H,
      },
      text: line,
      color: THEME.snapTooltipText,
      font: "11px ui-monospace, monospace",
    })
  })
}

const READOUT_PAD_X = 6
const READOUT_PAD_Y = 4
const READOUT_LINE_H = 14
const READOUT_CHAR_W = 6.4 // ~width of one 11px monospace glyph

/** The pixel size of the readout chip for the given lines. */
function readoutSize(lines: readonly string[]): {
  width: number
  height: number
} {
  const longest = Math.max(...lines.map((l) => l.length))
  return {
    width: Math.ceil(longest * READOUT_CHAR_W) + READOUT_PAD_X * 2,
    height: lines.length * READOUT_LINE_H + READOUT_PAD_Y * 2,
  }
}

/**
 * The top-left of the readout chip: above-right of the anchor (the object-snap
 * tooltip occupies the space below-right of the cursor, so this stays clear),
 * flipped below-left if it would clip the top edge, then clamped into the view.
 */
function placeReadout(
  anchor: Vec2,
  size: { width: number; height: number },
  viewport: { width: number; height: number }
): Vec2 {
  const gap = 12
  let x = anchor.x + 16
  let y = anchor.y - size.height - gap
  if (y < 4) {
    // Would clip the top: drop below and swing left, away from the snap tooltip.
    x = anchor.x - size.width - 16
    y = anchor.y + gap
  }
  return {
    x: Math.max(4, Math.min(x, viewport.width - size.width - 4)),
    y: Math.max(4, Math.min(y, viewport.height - size.height - 4)),
  }
}

/** Signed-area (shoelace) magnitude of the closed polygon through `points`. */
function polygonArea(points: readonly Vec2[]): number {
  if (points.length < 3) return 0
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    sum += a.x * b.y - b.x * a.y
  }
  return Math.abs(sum) / 2
}

/** Perimeter of the closed polygon (includes the closing edge). */
function polygonPerimeter(points: readonly Vec2[]): number {
  if (points.length < 2) return 0
  let total = 0
  for (let i = 0; i < points.length; i++) {
    total += V.distance(points[i], points[(i + 1) % points.length])
  }
  return total
}
