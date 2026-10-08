import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import { createPolyline, onPlaneOf } from "../../domain/entities"
import { bulgeToArc } from "../../geometry/primitives"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import { PointerInput, Tool, ToolContext } from "./Tool"
import { CommandOption, CommandOptionOutcome } from "./Tool"
import { lastDrawnPoint } from "./lastDrawnPoint"
import {
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"
import { acuteHeading, headingInUcs } from "./ucsHeading"
import { pointAlongCursor, showRise } from "./directDistance"

/**
 * The polyline tool draws a single connected chain of straight segments as one
 * {@link createPolyline} entity — AutoCAD's PLINE. Unlike the line tool (which
 * commits an independent line per click), the polyline accumulates its vertices
 * in the tool's own state and materialises *one* entity when the command ends,
 * so the whole chain is a single object and a single undo step.
 *
 * The interaction mirrors the line tool's precision model: object snaps place
 * each vertex exactly, Ortho/Polar constrain the direction, and dynamic input
 * lets the user type an exact length/angle or a coordinate for the next vertex.
 * The command ends on Enter (or Escape, or switching tools), and the polyline
 * is committed then; "Close" (C) joins the last vertex to the first and ends,
 * while "Undo" (U) steps back one vertex without leaving the command.
 */

type PolylineToolState =
  /** Waiting for the first point. */
  | { readonly phase: "idle" }
  /** First vertex placed; rubber-banding towards the next one. */
  | {
      readonly phase: "drawing"
      /**
       * Every vertex placed so far (`vertices[0]` is the first), each projected
       * onto the first one's plane: a polyline is flat, as in AutoCAD.
       */
      readonly vertices: readonly Vec3[]
      /** Bulge of each committed segment (entry `i` = vertices[i]→[i+1]). */
      readonly bulges: readonly number[]
      readonly cursor: Vec3
      /** Last non-degenerate unit direction from the last vertex to the cursor. */
      readonly direction: Vec2 | null
      /** Whether the chain is to be closed on commit (set by the Close option). */
      readonly closed: boolean
      /** Arc mode: the next segment is a tangent arc rather than a line. */
      readonly arcMode: boolean
    }

export class PolylineTool implements Tool {
  readonly id = "polyline"
  readonly shortcut = "p"

  private state: PolylineToolState = { phase: "idle" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(ctx: ToolContext): void {
    // Every exit path (Enter, Escape, Close, switching tools) ends here, so the
    // accumulated chain is materialised as one entity in a single place.
    this.commitPolyline(ctx)
    this.state = { phase: "idle" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    if (this.state.phase === "drawing") {
      const start = this.lastVertex(this.state)
      const offset = V.sub(input.point, start)
      const length = V.length(offset)
      const direction =
        length > 1e-9 ? V.scale(offset, 1 / length) : this.state.direction
      this.state = { ...this.state, cursor: input.point, direction }

      if (!showRise(ctx, start, input.point)) {
        ctx.dynamicInput.setLive("distance", length)
        ctx.dynamicInput.setLive(
          "angle",
          direction ? acuteHeading(headingInUcs(ctx.ucs, direction)) : null
        )
      }
      ctx.dynamicInput.setPosition(input.screen)
    } else {
      // No first vertex yet: offer a coordinate box to type the point directly.
      if (this.currentFieldId(ctx) !== "point") {
        this.openFirstPointInput(ctx, input.screen)
      }
      ctx.dynamicInput.setPosition(input.screen)
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    if (this.state.phase !== "drawing") {
      const start = this.resolveFirstPoint(input.point, ctx)
      this.beginDrawing(start, ctx, input.screen)
      return
    }

    // Place the next vertex at the effective endpoint (honouring any hard-locked
    // typed length/angle), then keep chaining. A click on the same point as the
    // last vertex adds nothing.
    const last = this.lastVertex(this.state)
    const point = this.resolveEnd(last, input.point, ctx)
    if (point.x === last.x && point.y === last.y) return
    this.appendVertex(point, ctx)
    ctx.dynamicInput.setPosition(input.screen)
  }

  /**
   * The keywords offered while drawing. The Line/Arc toggle switches the next
   * segment's kind (AutoCAD's PLINE Arc/Line options); "Undo" appears once a
   * segment exists and "Close" once two do, so a lone segment isn't retraced.
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "drawing") return []
    const options: CommandOption[] = []
    options.push({ id: this.state.arcMode ? "Line" : "Arc" })
    if (this.state.vertices.length >= 3) options.push({ id: "Close" })
    if (this.state.vertices.length >= 2) options.push({ id: "Undo" })
    return options
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Arc":
        return this.setArcMode(true, ctx)
      case "Line":
        return this.setArcMode(false, ctx)
      case "Close":
        return this.markClosed() ? "end" : "unhandled"
      case "Undo":
        return this.undoLastVertex(ctx) ? "continue" : "unhandled"
      default:
        return "unhandled"
    }
  }

  private setArcMode(arcMode: boolean, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "drawing") return "unhandled"
    this.state = { ...this.state, arcMode }
    ctx.requestRender()
    return "continue"
  }

  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "drawing" ? this.lastVertex(this.state) : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "drawing") return []
    const { viewport } = ctx
    const stroke = { color: THEME.rubberBand, width: 1 }
    const out: ScenePrimitive[] = []

    // The chain committed so far, drawn as it will look once materialised
    // (arcs included, via the shared entity renderer).
    if (this.state.vertices.length >= 2) {
      const committed = createPolyline(
        this.state.vertices,
        false,
        ctx.document.getCurrentLayerId(),
        this.state.bulges
      )
      out.push(...entityScenePrimitive(viewport, committed, stroke))
    }

    // The rubber-band from the last vertex to the effective next point — an arc
    // in arc mode (tangent to the previous segment), otherwise a line.
    const last = this.lastVertex(this.state)
    const end = this.resolveEnd(last, this.state.cursor, ctx)
    const bulge = this.pendingBulge(this.state, end)
    if (bulge !== 0) {
      const arc = bulgeToArc(last, end, bulge)
      out.push(
        arcScenePrimitive(
          viewport,
          arc.center,
          arc.radius,
          arc.startAngle,
          arc.endAngle,
          stroke
        )
      )
    } else {
      out.push({
        kind: "segment",
        a: viewport.worldToScreen(last),
        b: viewport.worldToScreen(end),
        stroke,
      })
    }

    return out
  }

  /**
   * The bulge of the segment about to be drawn to `endpoint`. Zero (a straight
   * segment) unless arc mode is on and a previous segment exists to be tangent
   * to; then it is `tan(φ/2)` for the turn angle φ from that exit tangent to the
   * new chord — the tangent-continuous arc AutoCAD's PLINE Arc draws by default.
   */
  private pendingBulge(
    state: Extract<PolylineToolState, { phase: "drawing" }>,
    endpoint: Vec2
  ): number {
    if (!state.arcMode) return 0
    const tangent = currentTangent(state)
    if (!tangent) return 0
    const chord = V.sub(endpoint, this.lastVertex(state))
    const length = V.length(chord)
    if (length < 1e-9) return 0
    const chordDir = V.scale(chord, 1 / length)
    const phi = signedAngle(tangent, chordDir)
    // A near-180° reversal has no finite tangent arc — fall back to straight.
    if (Math.abs(Math.abs(phi) - Math.PI) < 1e-6) return 0
    return Math.tan(phi / 2)
  }

  /** The last (most recent) vertex of the chain being drawn. */
  private lastVertex(
    state: Extract<PolylineToolState, { phase: "drawing" }>
  ): Vec3 {
    return state.vertices[state.vertices.length - 1]
  }

  /** Appends `point` as the next vertex and keeps drawing from it. */
  private appendVertex(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    const onPlane = withZOf(point, this.state.vertices[0])
    // In arc mode the new segment is a tangent arc; its bulge is derived from
    // the direction leaving the previous segment.
    const bulge = this.pendingBulge(this.state, onPlane)
    this.state = {
      ...this.state,
      vertices: [...this.state.vertices, onPlane],
      bulges: [...this.state.bulges, bulge],
      cursor: onPlane,
      direction: null,
    }
    ctx.dynamicInput.clearTexts()
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.requestRender()
  }

  /** Flags the chain to be closed on commit; the runtime then ends the command. */
  private markClosed(): boolean {
    if (this.state.phase !== "drawing" || this.state.vertices.length < 3) {
      return false
    }
    this.state = { ...this.state, closed: true }
    return true
  }

  /**
   * Removes the last placed vertex while staying in the command — AutoCAD's
   * PLINE "Undo" (U). Nothing is committed yet, so this is a pure local rollback
   * (no document undo). Returns to the previous vertex to resume drawing.
   */
  private undoLastVertex(ctx: ToolContext): boolean {
    if (this.state.phase !== "drawing" || this.state.vertices.length < 2) {
      return false
    }
    const vertices = this.state.vertices.slice(0, -1)
    const bulges = this.state.bulges.slice(0, -1)
    const last = vertices[vertices.length - 1]
    this.state = {
      phase: "drawing",
      vertices,
      bulges,
      cursor: last,
      direction: null,
      closed: false,
      arcMode: this.state.arcMode,
    }
    ctx.dynamicInput.clearTexts()
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.requestRender()
    return true
  }

  /**
   * Materialises the accumulated chain as one polyline entity, if it has at
   * least two vertices (a single point is not geometry). Idempotent: resets the
   * state so a second call (e.g. onDeactivate after an explicit end) is a no-op.
   */
  private commitPolyline(ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    const { vertices, closed, bulges } = this.state
    this.state = { phase: "idle" }
    if (vertices.length < 2) return
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(
          withCurrentThickness(
            onPlaneOf(
              createPolyline(
                vertices,
                closed,
                ctx.document.getCurrentLayerId(),
                bulges
              ),
              vertices[0]
            ),
            ctx
          ),
          ctx
        )
      )
    )
  }

  /** Enters the drawing phase from the first vertex, opening the length session. */
  private beginDrawing(start: Vec3, ctx: ToolContext, screen?: Vec2): void {
    this.state = {
      phase: "drawing",
      vertices: [start],
      bulges: [],
      cursor: start,
      direction: null,
      closed: false,
      arcMode: false,
    }
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(start)
    this.openLengthInput(ctx, at)
    ctx.requestRender()
  }

  /** The id of the field the current dynamic-input session leads with, if any. */
  private currentFieldId(ctx: ToolContext): string | undefined {
    return ctx.dynamicInput.getSession()?.fields[0]?.id
  }

  /**
   * Resolves the first vertex, honouring a coordinate typed into the pre-start
   * box. The first point has no previous point, so a bare `x,y` is absolute.
   */
  private resolveFirstPoint(rawPoint: Vec3, ctx: ToolContext): Vec3 {
    const text = ctx.dynamicInput.getText("point").trim()
    if (isCoordinateExpression(text)) {
      const point = parseCoordinate(text, {
        lastPoint: null,
        relativeByDefault: false,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
      if (point) return point
    }
    return rawPoint
  }

  private openFirstPointInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitFirstPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(screen)
  }

  /** An empty box resumes from the last drawn endpoint (AutoCAD's Continue). */
  private commitFirstPoint(ctx: ToolContext): boolean {
    if (this.state.phase !== "idle") return false
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") {
      const resume = lastDrawnPoint(ctx.document)
      if (!resume) return false
      this.beginDrawing(resume, ctx)
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const start = parseCoordinate(text, {
      lastPoint: null,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!start) return false
    this.beginDrawing(start, ctx)
    return true
  }

  private openLengthInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [
        { id: "distance", prompt: "length", kind: "distance" },
        { id: "angle", prompt: "angle", kind: "angle" },
      ],
      commit: (values, commitCtx) => this.commitSegment(values, commitCtx),
      commitRaw: (commitCtx) => this.commitRawEntry(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.dynamicInput.setPosition(screen)
  }

  /**
   * Handles Enter in the length/angle session. With nothing typed it ends the
   * command (AutoCAD's Enter-to-finish), committing the chain via onDeactivate;
   * with a typed length/angle it places the next vertex precisely.
   */
  private commitSegment(
    values: Record<string, number>,
    ctx: ToolContext
  ): void {
    if (this.state.phase !== "drawing") return
    if (this.nothingTyped(ctx)) {
      ctx.endCommand()
      return
    }

    const { distance, angle } = values
    if (!(distance > 0)) return
    const last = this.lastVertex(this.state)
    const next = pointAlongCursor(ctx, last, this.state.cursor, {
      distance,
      angle: Number.isFinite(angle) ? angle : null,
    })
    if (next) this.appendVertex(next, ctx)
  }

  /** True when neither dimension field holds typed text. */
  private nothingTyped(ctx: ToolContext): boolean {
    return (
      ctx.dynamicInput.getText("distance").trim() === "" &&
      ctx.dynamicInput.getText("angle").trim() === ""
    )
  }

  /**
   * Enter in the length/angle session when the numeric path cannot resolve —
   * which includes the common case of pressing Enter straight after a pick,
   * before the cursor has moved and given the angle a live value. With nothing
   * typed that means "finish the polyline"; otherwise it is a coordinate.
   */
  private commitRawEntry(ctx: ToolContext): boolean {
    if (this.state.phase !== "drawing") return false
    if (this.nothingTyped(ctx)) {
      ctx.endCommand()
      return true
    }
    return this.commitCoordinate(ctx)
  }

  /**
   * Handles Enter with a coordinate expression typed into the length field
   * (e.g. `@30,0`, `50,100` or `100<45`), placing the next vertex there.
   */
  private commitCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "drawing") return false
    const coordText = ctx.dynamicInput.getText("distance").trim()
    if (!isCoordinateExpression(coordText)) return false
    const point = parseCoordinate(coordText, {
      lastPoint: this.lastVertex(this.state),
      relativeByDefault: true,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.appendVertex(point, ctx)
    return true
  }

  /**
   * The effective next vertex, honouring hard-locked typed values exactly like
   * the line tool: a typed length or angle overrides the corresponding cursor
   * component, an untyped one follows the cursor (already Ortho/snap aware).
   */
  private resolveEnd(start: Vec3, rawCursor: Vec3, ctx: ToolContext): Vec3 {
    const coordText = ctx.dynamicInput.getText("distance").trim()
    if (isCoordinateExpression(coordText)) {
      const point = parseCoordinate(coordText, {
        lastPoint: start,
        relativeByDefault: true,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
      return point ?? rawCursor
    }

    const typedDist = parseField(ctx, "distance")
    const typedAngle = parseField(ctx, "angle")
    return (
      pointAlongCursor(ctx, start, rawCursor, {
        distance: typedDist,
        angle: typedAngle,
      }) ?? rawCursor
    )
  }
}

/**
 * The unit tangent direction *leaving* the last committed segment, used to make
 * the next arc segment tangent-continuous. `null` when there is no prior
 * segment (or it is degenerate), so the first arc segment falls back to a line.
 */
function currentTangent(state: {
  vertices: readonly Vec2[]
  bulges: readonly number[]
}): Vec2 | null {
  const n = state.vertices.length
  if (n < 2) return null
  return exitTangent(
    state.vertices[n - 2],
    state.vertices[n - 1],
    state.bulges[n - 2] ?? 0
  )
}

/**
 * The unit tangent at the *end* of a segment from `a` to `b` with the given
 * bulge. For a straight segment it is the chord direction; for an arc the chord
 * bisects the entry/exit tangents, so the exit is the chord rotated by half the
 * included angle (θ/2, θ = 4·atan(bulge)).
 */
function exitTangent(a: Vec2, b: Vec2, bulge: number): Vec2 | null {
  const chord = V.sub(b, a)
  const length = V.length(chord)
  if (length < 1e-9) return null
  const dir = V.scale(chord, 1 / length)
  if (bulge === 0) return dir
  return rotate(dir, (4 * Math.atan(bulge)) / 2)
}

/** Rotates a vector by `angle` radians (counter-clockwise). */
function rotate(v: Vec2, angle: number): Vec2 {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos }
}

/** Signed angle (radians, in `(-π, π]`) from vector `from` to vector `to`. */
function signedAngle(from: Vec2, to: Vec2): number {
  const cross = from.x * to.y - from.y * to.x
  const dot = from.x * to.x + from.y * to.y
  return Math.atan2(cross, dot)
}

/** Reads a field as a finite number, or `null` when empty/invalid (unlocked). */
function parseField(ctx: ToolContext, id: string): number | null {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
