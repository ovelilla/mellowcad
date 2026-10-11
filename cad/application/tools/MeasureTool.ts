import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
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
import { parseCoordinate } from "../input/coordinateInput"
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
    if (this.state.phase === "second") {
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
          lastPoint: this.basePoint(),
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
    if (this.state.phase === "second") return this.state.base
    if (this.state.phase === "area") return this.state.points.at(-1) ?? null
    return null
  }

  /**
   * Enter, at the box or the drawing: DIST's first point ends the command and
   * its second measures to the first, as AutoCAD's does; AREA's first corner
   * takes `<Object>`, from the third point it takes `<Total>`, and before that
   * AutoCAD 2023's console refuses it as a missing point.
   */
  private enter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "first":
        ctx.endCommand()
        return true
      case "second":
        this.place(this.state.base, ctx)
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

  /** DIST's two points; WHY no `[Multiple points]` on the second: not built. */
  question(): PromptId | null {
    switch (this.state.phase) {
      case "first":
        return "specifyFirstPoint"
      case "second":
        return "distSecondPoint"
      case "area":
        return this.state.points.length === 0
          ? "specifyFirstCornerPointOr"
          : "specifyNextPointOr"
      case "areaObject":
        return "selectObjects"
    }
  }

  /** AREA's object is one pick, refused as AutoCAD 2023's console refuses it. */
  takes(): QuestionInput | null {
    return this.state.phase === "areaObject" ? "objectOrLast" : null
  }

  defaultOption(): string | null {
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
   * WHY no Add area / Subtract area, nor Arc and Length at the next point:
   * not built (docs/autocad-coverage.md).
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "areaObject") {
      return [{ id: "Last", hidden: true, prompt: "selectObjects" }]
    }
    if (this.state.phase !== "area") return []
    const { length } = this.state.points
    if (length === 0) return [{ id: "Object" }]
    return length >= 3 ? [{ id: "Undo" }, { id: "Total" }] : [{ id: "Undo" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
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
    if (this.state.phase === "second") return this.state.base
    if (this.state.phase === "area") {
      const { points } = this.state
      return points.length > 0 ? points[points.length - 1] : null
    }
    return null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    const settings = ctx.document.getSettings()
    if (this.state.phase === "second") {
      this.drawDistance(out, ctx, this.state.base, this.state.cursor, settings)
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
