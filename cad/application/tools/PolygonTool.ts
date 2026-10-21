import { Vec2, V, vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { createPolyline, onPlaneOf } from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { ucsRotation } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"
import {
  currentColor,
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"

const MIN_SIDES = 3
const MAX_SIDES = 1024

/**
 * AutoCAD's POLYGON: a regular N-sided closed polyline, asked in AutoCAD's
 * order:
 *
 * ```
 *  sides ──► center ──► Inscribed / Circumscribed ──► radius ──► polygon
 *              └──[E] Edge──► first endpoint ──► second endpoint ──► polygon
 * ```
 *
 * Inscribed puts the vertices on the radius, Circumscribed the edges'
 * midpoints. A pointed radius sets the size and the rotation at once; a typed
 * one draws the bottom edge level. Edge builds the polygon counterclockwise from
 * its first edge. The side count (POLYSIDES) and the last option are the next
 * run's defaults, for the session. As AutoCAD 2027's console answers it
 * (probes polygon/p01–p153).
 */
type PolygonToolState =
  /** Awaiting the number of sides. */
  | { readonly phase: "sides" }
  /** Side count fixed; awaiting the centre. */
  | { readonly phase: "center"; readonly sides: number }
  /** Centre placed; awaiting Inscribed or Circumscribed. */
  | { readonly phase: "type"; readonly sides: number; readonly center: Vec3 }
  /** Rubber-banding the radius (and orientation). */
  | {
      readonly phase: "radius"
      readonly sides: number
      readonly center: Vec3
      readonly cursor: Vec2
      /** Radius is the apothem (edge midpoints) when true, else the circumradius. */
      readonly circumscribed: boolean
    }
  /** Edge: awaiting the first endpoint of the edge. */
  | { readonly phase: "edgeStart"; readonly sides: number }
  /** Edge: rubber-banding the polygon from its first edge. */
  | {
      readonly phase: "edgeEnd"
      readonly sides: number
      readonly start: Vec3
      readonly cursor: Vec2
    }

export class PolygonTool implements Tool {
  readonly id = "polygon"

  private state: PolygonToolState = { phase: "sides" }
  private lastScreen: Vec2 | null = null
  /** POLYSIDES: the side count Enter keeps, the last one given. */
  private sides = 4
  /** The option Enter keeps at `Enter an option`, the last one chosen. */
  private circumscribed = false

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "sides" }
    this.openSidesInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "sides" }
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "sides":
        return { id: "enterNumberOfSides", enter: { count: this.sides } }
      case "center":
        return "specifyCenterOfPolygonOr"
      case "type":
        return {
          id: "enterAnOption",
          enter: this.circumscribed ? "circumscribedShort" : "inscribedShort",
        }
      case "radius":
        return "specifyRadiusOfCircle"
      case "edgeStart":
        return "specifyFirstEndpointOfEdge"
      case "edgeEnd":
        return "specifySecondEndpointOfEdge"
    }
  }

  /** A count AutoCAD refuses in its range's words; the edge's end is 2D. */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "sides":
        return {
          refusal: "requiresIntegerBetween",
          values: { min: MIN_SIDES, max: MAX_SIDES },
        }
      case "type":
        return "keyword"
      case "edgeEnd":
        return "point2d"
      default:
        return null
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "radius") {
      this.state = { ...this.state, cursor: input.point }
      ctx.dynamicInput.setLive(
        "radius",
        V.distance(this.state.center, input.point)
      )
    } else if (this.state.phase === "edgeEnd") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "sides":
      case "type":
        return // typed, not clicked
      case "center":
        this.placeCenter(input.point, ctx)
        return
      case "radius":
        this.commitPolygon(ctx, input.point)
        return
      case "edgeStart":
        this.placeEdgeStart(input.point, ctx)
        return
      case "edgeEnd":
        this.commitEdge(input.point, ctx)
        return
    }
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "sides" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  /** Enter at `Enter an option` keeps the option it shows. */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "type") return false
    this.chooseType(this.circumscribed, ctx)
    return true
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "center":
        return [{ id: "Edge" }]
      case "type":
        return [{ id: "Inscribed" }, { id: "Circumscribed" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "center" && id === "Edge") {
      this.state = { phase: "edgeStart", sides: state.sides }
      this.openPointInput(ctx, "firstPoint")
      return "continue"
    }
    if (
      state.phase === "type" &&
      (id === "Inscribed" || id === "Circumscribed")
    ) {
      this.chooseType(id === "Circumscribed", ctx)
      return "continue"
    }
    return "unhandled"
  }

  /** `_TAN` at the centre or Edge's first endpoint measures from LASTPOINT (p04, p05). */
  snapsFromLastPoint(): boolean {
    const { phase } = this.state
    return phase === "center" || phase === "edgeStart"
  }

  getConstraintAnchor(): Vec2 | null {
    switch (this.state.phase) {
      case "radius":
        return this.state.center
      case "edgeEnd":
        return this.state.start
      default:
        return null
    }
  }

  /**
   * The polygon in the colour it will wear; at the radius an amber dashed
   * line from the centre to the cursor, at Edge's end the ghost alone
   * (desktop rectang/d02).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const state = this.state
    if (state.phase !== "radius" && state.phase !== "edgeEnd") return []
    const vertices =
      state.phase === "radius"
        ? this.resolvePolygon(ctx, state.cursor)
        : edgePolygon(state.start, state.cursor, state.sides)
    const out: ScenePrimitive[] = []
    if (state.phase === "radius") {
      out.push({
        kind: "segment",
        a: viewport.worldToScreen(state.center),
        b: viewport.worldToScreen(state.cursor),
        stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
      })
    }
    if (vertices) {
      out.push({
        kind: "path",
        points: vertices.map((v) => viewport.worldToScreen(v)),
        closed: true,
        stroke: { color: currentColor(ctx), width: 1 },
      })
    }
    return out
  }

  private openSidesInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "sides", prompt: "numberOfSides", kind: "number" }],
      commit: (values, commitCtx) => this.commitSides(values.sides, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault("sides", this.sides)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * A count outside 3–1024, or not written as an integer, is refused and
   * asked again: `3.0` and `1e1` too, `+5` taken (p08, p153).
   */
  private commitSides(value: number, ctx: ToolContext): void {
    if (this.state.phase !== "sides") return
    const typed = ctx.dynamicInput.getText("sides").trim()
    const written = typed === "" || /^[+-]?\d+$/.test(typed)
    if (
      !written ||
      !Number.isInteger(value) ||
      value < MIN_SIDES ||
      value > MAX_SIDES
    ) {
      ctx.report(
        ctx.text.message("requiresIntegerBetween", {
          min: MIN_SIDES,
          max: MAX_SIDES,
        }),
        "error"
      )
      this.openSidesInput(ctx)
      return
    }
    this.sides = value
    this.state = { phase: "center", sides: value }
    this.openPointInput(ctx, "center")
  }

  private openPointInput(ctx: ToolContext, prompt: PromptId): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitTypedPoint(ctx: ToolContext): boolean {
    const state = this.state
    if (!ctx.dynamicInput.hasTypedText()) {
      // The point prompts take no Enter: each asks again in its words (p02,
      // p03), the edge's end being a 2D point.
      const refusal =
        state.phase === "center"
          ? "pointOrKeywordRequired"
          : state.phase === "edgeStart"
            ? "invalidPoint"
            : "invalidPoint2d"
      ctx.report(ctx.text.message(refusal), "error")
      return true
    }
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false
    const last = state.phase === "edgeEnd" ? state.start : null
    const point = parseCoordinate(text, {
      lastPoint: last ?? ctx.lastPoint,
      relativeByDefault: last !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    switch (state.phase) {
      case "center":
        this.placeCenter(point, ctx)
        return true
      case "edgeStart":
        this.placeEdgeStart(point, ctx)
        return true
      case "edgeEnd":
        this.commitEdge(point, ctx)
        return true
      default:
        return false
    }
  }

  private placeCenter(center: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "center") return
    this.state = { phase: "type", sides: this.state.sides, center }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private chooseType(circumscribed: boolean, ctx: ToolContext): void {
    if (this.state.phase !== "type") return
    this.circumscribed = circumscribed
    const { sides, center } = this.state
    this.state = {
      phase: "radius",
      sides,
      center,
      cursor: center,
      circumscribed,
    }
    const session: DynamicInputSession = {
      fields: [{ id: "radius", prompt: "radius", kind: "distance" }],
      commit: (_values, commitCtx) => this.commitPolygon(commitCtx, null),
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        // The radius has no default: Enter is refused and asked again (p02).
        commitCtx.report(
          commitCtx.text.message("requiresDistance", {
            points: "second",
            keyword: "no",
          }),
          "error"
        )
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("radius", 0)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * The radius prompt answered: by a pick at `point`, or by the typed value.
   * One of 0 or less, a pick on the centre (`@`) too, is refused (p08, p124).
   */
  private commitPolygon(ctx: ToolContext, point: Vec2 | null): void {
    if (this.state.phase !== "radius") return
    const vertices = this.resolvePolygon(ctx, point ?? this.state.cursor)
    if (!vertices) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.add(vertices, this.state.center, ctx)
  }

  private placeEdgeStart(start: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "edgeStart") return
    this.state = {
      phase: "edgeEnd",
      sides: this.state.sides,
      start,
      cursor: start,
    }
    this.openPointInput(ctx, "secondPoint")
    ctx.requestRender()
  }

  private commitEdge(end: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "edgeEnd") return
    this.add(
      edgePolygon(this.state.start, end, this.state.sides),
      this.state.start,
      ctx
    )
  }

  private add(vertices: Vec2[], plane: Vec3, ctx: ToolContext): void {
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(
          withCurrentThickness(
            onPlaneOf(
              createPolyline(vertices, true, ctx.document.getCurrentLayerId()),
              plane
            ),
            ctx
          ),
          ctx
        )
      )
    )
    ctx.endCommand()
  }

  /**
   * The polygon the radius prompt would draw: a typed radius with its bottom
   * edge level in the UCS ("Specifying the radius draws the bottom edge of the
   * polygon at the current snap rotation angle"), else sized and turned by the
   * cursor: a vertex at it (Inscribed), or an edge's midpoint (Circumscribed).
   * Shared by the preview and the commit.
   */
  private resolvePolygon(ctx: ToolContext, cursor: Vec2): Vec2[] | null {
    if (this.state.phase !== "radius") return null
    const { center, sides, circumscribed } = this.state
    const typed = parseField(ctx, "radius")
    const radius = typed ?? V.distance(center, cursor)
    if (!(radius > 0)) return null
    const first =
      typed !== null
        ? topVertexAngle(sides, ctx)
        : Math.atan2(cursor.y - center.y, cursor.x - center.x) +
          (circumscribed ? Math.PI / sides : 0)
    return polygonVertices(center, sides, radius, first, circumscribed)
  }
}

/**
 * The vertices of a regular polygon, counterclockwise from the one at angle
 * `first`. The circumscribed radius is the apothem, so the circumradius is
 * scaled up by `1 / cos(π/n)`.
 */
function polygonVertices(
  center: Vec2,
  sides: number,
  radius: number,
  first: number,
  circumscribed: boolean
): Vec2[] {
  const step = (Math.PI * 2) / sides
  const circumradius = circumscribed
    ? radius / Math.cos(Math.PI / sides)
    : radius
  const vertices: Vec2[] = []
  for (let k = 0; k < sides; k++) {
    const a = first + k * step
    vertices.push(
      V.add(center, V.scale(vec2(Math.cos(a), Math.sin(a)), circumradius))
    )
  }
  return vertices
}

/**
 * Where a typed radius puts the first vertex, Inscribed or Circumscribed: on
 * the UCS's Y axis, or half a step past it for an even count, so the bottom
 * edge is level (p100, p101, p104). WHY it matters for one figure: it is the
 * polyline's start point, LIST's and EXPLODE's order, a linetype's phase.
 */
function topVertexAngle(sides: number, ctx: ToolContext): number {
  const up = ucsRotation(ctx.ucs) + Math.PI / 2
  return sides % 2 === 0 ? up + Math.PI / sides : up
}

/**
 * Edge: the polygon whose first edge runs from `start` to `end`, the rest
 * turning counterclockwise from it, as AutoCAD's does; of a zero edge, every
 * vertex on `start`, as AutoCAD makes it (p125).
 */
function edgePolygon(start: Vec2, end: Vec2, sides: number): Vec2[] {
  const edge = V.sub(end, start)
  const vertices: Vec2[] = [vec2(start.x, start.y)]
  let at = vec2(end.x, end.y)
  let heading = Math.atan2(edge.y, edge.x)
  const length = V.length(edge)
  for (let k = 1; k < sides; k++) {
    vertices.push(at)
    heading += (Math.PI * 2) / sides
    at = V.add(at, V.scale(vec2(Math.cos(heading), Math.sin(heading)), length))
  }
  return vertices
}

/** Reads a numeric field, returning `null` when empty or not a number. */
function parseField(ctx: ToolContext, fieldId: string): number | null {
  const text = ctx.dynamicInput.getText(fieldId).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
