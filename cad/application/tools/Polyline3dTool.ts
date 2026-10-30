import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { createPolyline3d } from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { PointerInput, Tool, ToolContext } from "./Tool"
import { CommandOption, CommandOptionOutcome } from "./Tool"
import type { PromptId } from "../../locales/types"
import {
  type CurrentProperties,
  currentColor,
  currentProperties,
  wearingProperties,
} from "./currentProperties"
import { acuteHeading, headingInUcs } from "./ucsHeading"
import { pointAlongCursor, showRise } from "./directDistance"

type Polyline3dToolState =
  /** Waiting for the start point. */
  | { readonly phase: "idle" }
  /** Start placed; rubber-banding towards the next vertex. */
  | {
      readonly phase: "drawing"
      /** Every vertex placed so far, each at its own Z. */
      readonly vertices: readonly Vec3[]
      /**
       * The history's depth when each segment was added: Undo takes back to
       * the last, so a transparent command run since goes with the segment.
       */
      readonly marks: readonly number[]
      /** What is current at the start point, which the polyline keeps. */
      readonly properties: CurrentProperties
      readonly cursor: Vec3
      /** Last non-degenerate unit direction from the last vertex to the cursor. */
      readonly direction: Vec2 | null
      readonly closed: boolean
    }

type Drawing = Extract<Polyline3dToolState, { phase: "drawing" }>

/**
 * AutoCAD's 3DPOLY: straight segments through points each at its own Z, as
 * one 3D polyline, as AutoCAD 2027's console asks them (3dpoly/p01, p02):
 * `Specify start point of polyline:`, then `Specify endpoint of line or
 * [Undo]:`, `[Close/Undo]:` from the second segment on. Enter at the start
 * says `Invalid point.` and asks again — no Continue (p02, p03); Enter later
 * ends, keeping even the start point alone as a 3D polyline of one vertex
 * (p05). A point with no Z lies at ELEVATION (p04). Undo steps back one
 * vertex, `All segments already undone.` with none (p06); Close joins the
 * start and ends. The polyline is added when the command ends, Escape
 * included, wearing what was current at its start, like PLINE.
 */
export class Polyline3dTool implements Tool {
  readonly id = "polyline3d"
  readonly shortcut = "3p"

  private state: Polyline3dToolState = { phase: "idle" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(ctx: ToolContext): void {
    this.commit(ctx)
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
    } else if (ctx.dynamicInput.getSession()?.fields[0]?.id !== "point") {
      this.openStartInput(ctx, input.screen)
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase !== "drawing") {
      this.begin(this.typedStart(ctx) ?? input.point, ctx, input.screen)
      return
    }
    const last = this.lastVertex(this.state)
    const point = this.resolveEnd(last, input.point, ctx)
    if (point.x === last.x && point.y === last.y && point.z === last.z) return
    this.append(point, ctx)
    ctx.dynamicInput.setPosition(input.screen)
  }

  /** Enter at the start point is refused, the prompt asked again (p03). */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "drawing") return false
    ctx.report(ctx.text.message("invalidPoint"), "error")
    return true
  }

  question(): PromptId {
    return this.state.phase === "drawing"
      ? "specifyEndpointOfLineOr"
      : "specifyStartPointOfPolyline"
  }

  /** Close once two segments exist, as the console offers it (p01). */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "drawing") return []
    return this.state.vertices.length >= 3
      ? [{ id: "Close" }, { id: "Undo" }]
      : [{ id: "Undo" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "drawing") return "unhandled"
    switch (id) {
      case "Close":
        if (this.state.vertices.length < 3) return "unhandled"
        this.state = { ...this.state, closed: true }
        return "end"
      case "Undo":
        this.undoLastVertex(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  wantsSnap(): boolean {
    return true
  }

  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "drawing" ? this.lastVertex(this.state) : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "drawing") return []
    const stroke = { color: currentColor(ctx, this.state.properties), width: 1 }
    const last = this.lastVertex(this.state)
    const jig = createPolyline3d(
      [...this.state.vertices, this.resolveEnd(last, this.state.cursor, ctx)],
      false,
      this.state.properties.layerId,
      "polyline3d-preview"
    )
    return entityScenePrimitive(ctx.viewport, jig, stroke)
  }

  private lastVertex(state: Drawing): Vec3 {
    return state.vertices[state.vertices.length - 1]
  }

  private begin(start: Vec3, ctx: ToolContext, screen?: Vec2): void {
    this.state = {
      phase: "drawing",
      vertices: [start],
      marks: [],
      properties: currentProperties(ctx),
      cursor: start,
      direction: null,
      closed: false,
    }
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(start)
    this.openNextInput(ctx, at)
    ctx.requestRender()
  }

  private append(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    this.state = {
      ...this.state,
      vertices: [...this.state.vertices, point],
      marks: [...this.state.marks, ctx.historyDepth()],
      cursor: point,
      direction: null,
    }
    ctx.dynamicInput.clearTexts()
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.requestRender()
  }

  /**
   * The last vertex taken back, the command going on from the one before.
   * The polyline is added only at the end, so what the history takes back to
   * the segment's mark is a transparent command run since, as PLINE's.
   */
  private undoLastVertex(ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    if (this.state.vertices.length < 2) {
      ctx.report(ctx.text.message("all3dSegmentsUndone"), "error")
      return
    }
    if (ctx.undoHistory.settings().control === "none") return
    const vertices = this.state.vertices.slice(0, -1)
    const mark = this.state.marks[this.state.marks.length - 1]
    this.state = {
      ...this.state,
      vertices,
      marks: this.state.marks.slice(0, -1),
      cursor: vertices[vertices.length - 1],
      direction: null,
    }
    ctx.undoTo(mark)
    ctx.dynamicInput.clearTexts()
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.requestRender()
  }

  /** Idempotent: the state is reset first, so a second call adds nothing. */
  private commit(ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    const { vertices, closed, properties } = this.state
    this.state = { phase: "idle" }
    ctx.execute(
      new AddEntityCommand(
        wearingProperties(
          createPolyline3d(vertices, closed, properties.layerId),
          properties
        )
      )
    )
  }

  /** The start typed into its box: with no previous point, `x,y` is absolute. */
  private typedStart(ctx: ToolContext): Vec3 | null {
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return null
    return parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
  }

  private openStartInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitStart(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(screen)
  }

  private commitStart(ctx: ToolContext): boolean {
    if (this.state.phase !== "idle") return false
    if (ctx.dynamicInput.getText("point").trim() === "") {
      return this.onEnter(ctx)
    }
    const start = this.typedStart(ctx)
    if (!start) return false
    this.begin(start, ctx)
    return true
  }

  private openNextInput(ctx: ToolContext, screen: Vec2): void {
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

  /** Enter with nothing typed ends; a typed length and angle place the vertex. */
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
    if (!Number.isFinite(distance)) return
    const last = this.lastVertex(this.state)
    const next =
      pointAlongCursor(ctx, last, this.state.cursor, {
        distance,
        angle: Number.isFinite(angle) ? angle : null,
      }) ?? (distance === 0 ? last : null)
    if (next) this.append(next, ctx)
  }

  private nothingTyped(ctx: ToolContext): boolean {
    return (
      ctx.dynamicInput.getText("distance").trim() === "" &&
      ctx.dynamicInput.getText("angle").trim() === ""
    )
  }

  private commitRawEntry(ctx: ToolContext): boolean {
    if (this.state.phase !== "drawing") return false
    if (this.nothingTyped(ctx)) {
      ctx.endCommand()
      return true
    }
    const text = ctx.dynamicInput.getText("distance").trim()
    if (!isCoordinateExpression(text)) {
      if (parseNumber(text) !== 0) return false
      this.commitSegment({ distance: 0, angle: Number.NaN }, ctx)
      return true
    }
    const point = parseCoordinate(text, {
      lastPoint: this.lastVertex(this.state),
      relativeByDefault: true,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.append(point, ctx)
    return true
  }

  /** The next vertex: a coordinate typed in the box, else a typed length or angle along the cursor. */
  private resolveEnd(start: Vec3, cursor: Vec3, ctx: ToolContext): Vec3 {
    const text = ctx.dynamicInput.getText("distance").trim()
    if (isCoordinateExpression(text)) {
      return (
        parseCoordinate(text, {
          lastPoint: start,
          relativeByDefault: true,
          ucs: ctx.ucs,
          elevation: ctx.elevation,
        }) ?? cursor
      )
    }
    const distance = parseField(ctx, "distance")
    const angle = parseField(ctx, "angle")
    // Nothing typed: the point picked, at its own Z, as LINE takes it.
    if (distance === null && angle === null) return cursor
    return pointAlongCursor(ctx, start, cursor, { distance, angle }) ?? cursor
  }
}

/** A field as a finite number, or `null` when empty or not one. */
function parseField(ctx: ToolContext, id: string): number | null {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
