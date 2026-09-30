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
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { parseCoordinate } from "../input/coordinateInput"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * MEASURE (AutoCAD's DIST / MEASUREGEOM). Creates no geometry — the result is a
 * transient overlay (measurement guide + a readout chip that follows the
 * cursor) and disappears with the tool. Two modes:
 *
 * - **Distance**: pick two points → AutoCAD's DIST: the 3D distance, the angle
 *   in and from the UCS's XY plane and the ΔX/ΔY/ΔZ between them, on the
 *   command line and on the readout. Loops so successive pairs can be measured.
 * - **Area**: pick a run of points → the enclosed area and perimeter of the
 *   (implicitly closed) polygon, updating live with the cursor as a tentative
 *   vertex. Enter finalises the polygon; the tool then starts a fresh one.
 */
export type MeasureMode = "distance" | "area"

type MeasureState =
  | { readonly phase: "first" }
  | { readonly phase: "second"; readonly base: Vec3; readonly cursor: Vec3 }
  | {
      readonly phase: "area"
      readonly points: readonly Vec2[]
      readonly cursor: Vec2
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
  /** The last completed distance measurement, kept until a new one starts. */
  private last: Measurement | null = null
  /** The last completed area polygon, kept until a new one starts. */
  private lastArea: readonly Vec2[] | null = null
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset(ctx.viewport.worldCenter())
    if (this.mode === "distance") this.askPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset({ x: 0, y: 0 })
    if (this.mode === "distance") ctx.dynamicInput.close()
  }

  private reset(origin: Vec2): void {
    this.state =
      this.mode === "area"
        ? { phase: "area", points: [], cursor: origin }
        : { phase: "first" }
    this.last = null
    this.lastArea = null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.mode === "distance") ctx.dynamicInput.setPosition(input.screen)
    if (this.state.phase === "second") {
      this.state = { ...this.state, cursor: input.point }
    } else if (this.state.phase === "area") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "area") {
      this.lastArea = null
      this.state = {
        phase: "area",
        points: [...this.state.points, input.point],
        cursor: input.point,
      }
    } else {
      this.place(input.point, ctx)
    }
    ctx.requestRender()
  }

  private place(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase === "first") {
      // A fresh measurement clears the previous readout.
      this.last = null
      this.state = { phase: "second", base: point, cursor: point }
    } else if (this.state.phase === "second") {
      this.last = { base: this.state.base, tip: point }
      this.state = { phase: "first" }
      ctx.report(distanceReport(this.last, ctx))
    }
    this.askPoint(ctx)
  }

  /**
   * A point can be typed too; one given without a Z lies at the current
   * elevation, as DIST's help says, which is what `parseCoordinate` does.
   */
  private askPoint(ctx: ToolContext): void {
    const first = this.state.phase === "first"
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
        if (text === "" && this.state.phase === "first") {
          commitCtx.endCommand()
          return true
        }
        const point = parseCoordinate(text, {
          lastPoint: this.state.phase === "second" ? this.state.base : null,
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

  /** Enter finalises an area polygon (≥3 points); otherwise it ends the tool. */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "area" && this.state.points.length >= 3) {
      this.lastArea = this.state.points
      this.state = { phase: "area", points: [], cursor: this.state.cursor }
      ctx.requestRender()
      return true
    }
    return false
  }

  /** While marking an area, U (or Backspace) removes the last placed vertex —
   * AutoCAD's Undo option. */
  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Backspace") this.removeLastVertex(ctx)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "area" || this.state.points.length === 0) return []
    return [{ id: "Undo" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id !== "Undo") return "unhandled"
    return this.removeLastVertex(ctx) ? "continue" : "unhandled"
  }

  private removeLastVertex(ctx: ToolContext): boolean {
    if (this.state.phase !== "area" || this.state.points.length === 0) {
      return false
    }
    this.state = {
      ...this.state,
      points: this.state.points.slice(0, -1),
    }
    ctx.requestRender()
    return true
  }

  wantsSnap(): boolean {
    return true
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
    if (this.last) {
      this.drawDistance(
        out,
        ctx,
        this.last.base,
        this.last.tip,
        settings,
        false
      )
    }
    if (this.lastArea) {
      this.drawArea(out, ctx, this.lastArea, null, settings)
    }
    if (this.state.phase === "second") {
      this.drawDistance(
        out,
        ctx,
        this.state.base,
        this.state.cursor,
        settings,
        true
      )
    }
    if (this.state.phase === "area" && this.state.points.length > 0) {
      this.drawArea(out, ctx, this.state.points, this.state.cursor, settings)
    }
    return out
  }

  private drawDistance(
    out: ScenePrimitive[],
    ctx: ToolContext,
    base: Vec3,
    tip: Vec3,
    settings: DocumentSettings,
    live: boolean
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
        dash: live ? [6, 4] : undefined,
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
    cursor: Vec2 | null,
    settings: DocumentSettings
  ): void {
    const { viewport } = ctx
    // The tentative cursor vertex belongs only to an in-progress polygon.
    const vertices = cursor ? [...points, cursor] : points
    const screen = vertices.map((v) => viewport.worldToScreen(v))
    if (screen.length >= 2) {
      out.push({
        kind: "path",
        points: screen,
        closed: true,
        stroke: {
          color: THEME.selected,
          width: 1.5,
          dash: cursor ? [6, 4] : undefined,
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
    // While collecting, hint the point-undo and finish keys (there is no
    // command line to show them otherwise).
    if (cursor && points.length > 0) {
      lines.push(
        text.feedback("measureHint", { undo: text.abbreviation("Undo") })
      )
    }
    // Live: anchor by the cursor; completed: by the polygon centroid.
    const anchor = cursor
      ? viewport.worldToScreen(cursor)
      : viewport.worldToScreen(centroid(vertices))
    placeAndPushReadout(out, anchor, lines, viewport)
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

function centroid(points: readonly Vec2[]): Vec2 {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), {
    x: 0,
    y: 0,
  })
  return { x: sum.x / points.length, y: sum.y / points.length }
}

/** Normalises a degree value into `[0, 360)`. */
