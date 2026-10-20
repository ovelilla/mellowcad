import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import {
  createPolyline,
  onPlaneOf,
  type PolylineWidth,
} from "../../domain/entities"
import {
  ArcSegment,
  segmentExitTangent,
  tangentArcBulge,
} from "../../geometry/bulgeArcs"
import { formatLength, parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"
import { CommandOption, CommandOptionOutcome } from "./Tool"
import type { PromptId } from "../../locales/types"
import { lastDrawnDirection, lastDrawnPoint } from "./lastDrawnPoint"
import {
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"
import { acuteHeading, headingInUcs } from "./ucsHeading"
import { pointAlongCursor, showRise } from "./directDistance"
import { ARC_SEGMENT_OPTIONS, ArcSegmentInput } from "./arcSegmentInput"

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
 * while "Undo" (U) steps back one vertex without leaving the command. Length
 * asks a line's length and draws it on the way the chain heads. In arc mode the
 * endpoint draws the arc tangent to the chain, and Angle, CEnter, Direction,
 * Radius and Second pt ask theirs ({@link ArcSegmentInput}). Width and
 * Halfwidth set the starting and ending width of the next segment, the ending
 * one going on through the segments after it; the width it ends at is PLINEWID.
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
      /** Starting and ending width of each committed segment, likewise. */
      readonly widths: readonly PolylineWidth[]
      /** The widths the next segment takes. */
      readonly width: PolylineWidth
      /** PLINEWID as the command started: the width Undo may go back to. */
      readonly startWidth: number
      readonly cursor: Vec3
      /** Last non-degenerate unit direction from the last vertex to the cursor. */
      readonly direction: Vec2 | null
      /**
       * The way a first arc leaves the start point: where the last line, arc
       * or polyline drawn ends heading, else along the X axis.
       */
      readonly startTangent: Vec2
      /** Whether the chain is to be closed on commit (set by the Close option). */
      readonly closed: boolean
      /** Arc mode: the next segment is a tangent arc rather than a line. */
      readonly arcMode: boolean
      /**
       * Ctrl held: the arc leaves the other way, "hold Ctrl to switch
       * direction".
       */
      readonly reversed: boolean
    }

type Drawing = Extract<PolylineToolState, { phase: "drawing" }>

/** Width's or Halfwidth's prompt: its starting width, then its ending one. */
interface WidthPrompt {
  readonly half: boolean
  /** The starting width given, once the ending one is asked. */
  readonly start: number | null
}

export class PolylineTool implements Tool {
  readonly id = "polyline"
  readonly shortcut = "p"

  private state: PolylineToolState = { phase: "idle" }
  /** Length's `Specify length of line:` is open. */
  private askingLength = false
  private askingWidth: WidthPrompt | null = null
  private lastScreen: Vec2 | null = null
  private readonly arc = new ArcSegmentInput((segment, ctx) =>
    this.appendArc(segment, ctx)
  )

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(ctx: ToolContext): void {
    // Every exit path (Enter, Escape, Close, switching tools) ends here, so the
    // accumulated chain is materialised as one entity in a single place.
    this.arc.cancel()
    this.askingLength = false
    this.askingWidth = null
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
      this.state = {
        ...this.state,
        cursor: input.point,
        direction,
        reversed: input.ctrlKey,
      }

      if (this.arc.active) {
        this.arc.onPointerMove(input, ctx)
      } else if (this.askingWidth) {
        // The runtime measures a width from the last vertex.
      } else if (this.askingLength) {
        ctx.dynamicInput.setLive("length", length)
      } else if (!showRise(ctx, start, input.point)) {
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
    if (this.arc.active) {
      this.arc.onPointerDown(input, ctx)
      return
    }
    // The runtime measures Length's point, and a width's, from the last vertex.
    if (this.askingLength || this.askingWidth) return

    // Place the next vertex at the effective endpoint (honouring any hard-locked
    // typed length/angle), then keep chaining. A click on the same point as the
    // last vertex adds nothing.
    this.state = { ...this.state, reversed: input.ctrlKey }
    const last = this.lastVertex(this.state)
    const point = this.resolveEnd(last, input.point, ctx)
    if (point.x === last.x && point.y === last.y) return
    this.appendVertex(point, ctx)
    ctx.dynamicInput.setPosition(input.screen)
  }

  /**
   * A prompt with no default refuses Enter, as the console does: an arc
   * option's step, and Length's, as it refuses `FOO`.
   */
  onEnter(ctx: ToolContext): boolean {
    if (this.askingLength) {
      ctx.report(
        ctx.text.message("requiresDistance", {
          points: "second",
          keyword: "no",
        }),
        "error"
      )
      return true
    }
    return this.arc.onEnter(ctx)
  }

  question(): PromptId | ToolQuestion | null {
    if (this.state.phase !== "drawing") return "specifyStartPoint"
    if (this.askingWidth) return this.widthQuestion(this.askingWidth)
    if (this.askingLength) return "specifyLengthOfLine"
    if (this.arc.active) return this.arc.question()
    return this.state.arcMode ? "specifyEndpointOfArcOr" : "specifyNextPointOr"
  }

  /** Every point after the start is a 2D one, as AutoCAD's console refuses it. */
  takes(): QuestionInput | null {
    if (this.askingWidth) {
      return {
        refusal: "requiresDistance",
        values: { points: "second", keyword: "no" },
      }
    }
    if (this.state.phase !== "drawing" || this.askingLength) return null
    return this.arc.active ? this.arc.takes() : "point2d"
  }

  /**
   * The keywords offered while drawing, in AutoCAD's order: Close once a
   * segment exists, as the console offers it, and Length and Undo from the
   * start point on, Halfwidth and Width too. In arc mode the arc options open
   * prompts of their own. Each mode also declares, unlisted, the mode it is
   * in (`LIne`, `ARc`): typed, the console asks the same prompt again.
   */
  commandOptions(): readonly CommandOption[] {
    if (
      this.state.phase !== "drawing" ||
      this.askingLength ||
      this.askingWidth
    ) {
      return []
    }
    if (this.arc.active) return this.arc.commandOptions()
    const close = this.state.vertices.length >= 2 ? [{ id: "Close" }] : []
    if (!this.state.arcMode) {
      return [
        { id: "Arc" },
        ...close,
        { id: "Halfwidth" },
        { id: "Length" },
        { id: "Undo" },
        { id: "Width" },
        { id: "Line", hidden: true },
      ]
    }
    const [angle, center, direction, radius, second] = ARC_SEGMENT_OPTIONS
    return [
      { id: angle },
      { id: center },
      ...close,
      { id: direction },
      { id: "Halfwidth" },
      { id: "Line" },
      { id: radius },
      { id: second },
      { id: "Undo" },
      { id: "Width" },
      { id: "Arc", hidden: true },
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (
      this.state.phase !== "drawing" ||
      this.askingLength ||
      this.askingWidth
    ) {
      return "unhandled"
    }
    if (this.arc.active) return this.arc.invokeOption(id, ctx)
    switch (id) {
      case "Length":
        if (this.state.arcMode) return "unhandled"
        this.openLengthPrompt(ctx)
        return "continue"
      case "Arc":
        return this.setArcMode(true, ctx)
      case "Line":
        return this.setArcMode(false, ctx)
      case "Close":
        return this.close(ctx) ? "end" : "unhandled"
      case "Undo":
        this.undoLastVertex(ctx)
        return "continue"
      case "Width":
      case "Halfwidth":
        this.openWidthPrompt({ half: id === "Halfwidth", start: null }, ctx)
        return "continue"
      default:
        return this.state.arcMode &&
          this.arc.begin(id, this.arcStart(this.state), ctx)
          ? "continue"
          : "unhandled"
    }
  }

  private setArcMode(arcMode: boolean, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "drawing") return "unhandled"
    this.state = { ...this.state, arcMode }
    ctx.requestRender()
    return "continue"
  }

  /** Length's, a width's and an arc option's distances are the runtime's to measure. */
  wantsSnap(): boolean {
    if (this.askingLength || this.askingWidth) return false
    return !this.arc.active || this.arc.wantsSnap()
  }

  getConstraintAnchor(): Vec2 | null {
    if (this.state.phase !== "drawing") return null
    return this.arc.active ? this.arc.anchor() : this.lastVertex(this.state)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "drawing") return []
    const { viewport } = ctx
    const stroke = { color: THEME.rubberBand, width: 1 }
    const out: ScenePrimitive[] = []

    // The chain committed so far, drawn as it will look once materialised
    // (arcs and widths included, via the shared entity renderer).
    if (this.state.vertices.length >= 2) {
      const committed = createPolyline(
        this.state.vertices,
        false,
        ctx.document.getCurrentLayerId(),
        this.state.bulges,
        undefined,
        this.state.widths
      )
      out.push(...entityScenePrimitive(viewport, committed, stroke))
    }
    if (this.askingWidth) return out

    // The rubber-band from the last vertex to the effective next point — an arc
    // in arc mode (tangent to the previous segment), otherwise a line; an arc
    // option's arc as its answers so far make it.
    const last = this.lastVertex(this.state)
    let end: Vec2
    let bulge: number
    if (this.arc.active) {
      const segment = this.arc.preview(ctx)
      if (segment === null) return out
      end = segment.end
      bulge = segment.bulge
    } else {
      end = this.resolveEnd(last, this.state.cursor, ctx)
      bulge = this.pendingBulge(this.state, end) ?? 0
    }
    // The next segment, as wide as it will be drawn.
    const next = createPolyline(
      [last, end],
      false,
      ctx.document.getCurrentLayerId(),
      [bulge],
      "polyline-preview",
      [this.state.width]
    )
    out.push(...entityScenePrimitive(viewport, next, stroke))
    return out
  }

  /**
   * The bulge of the segment about to be drawn to `endpoint`: zero for a line,
   * and in arc mode the arc leaving tangent to the chain — the way the last
   * segment ends, or for the first the {@link startTangent} — or the other way
   * with Ctrl held. Null where no such arc exists (`*Invalid*`).
   */
  private pendingBulge(state: Drawing, endpoint: Vec2): number | null {
    if (!state.arcMode) return 0
    const exit = this.tangent(state)
    return tangentArcBulge(
      this.lastVertex(state),
      state.reversed ? V.scale(exit, -1) : exit,
      endpoint
    )
  }

  /**
   * The way the chain leaves its last vertex: where its last segment of any
   * length ends heading, else the {@link startTangent}.
   */
  private tangent(state: Drawing): Vec2 {
    for (let k = state.vertices.length - 1; k > 0; k--) {
      const exit = segmentExitTangent(
        state.vertices[k - 1],
        state.vertices[k],
        state.bulges[k - 1] ?? 0
      )
      if (exit) return exit
    }
    return state.startTangent
  }

  private arcStart(state: Drawing): { point: Vec3; tangent: Vec2 } {
    return { point: this.lastVertex(state), tangent: this.tangent(state) }
  }

  /** The last (most recent) vertex of the chain being drawn. */
  private lastVertex(state: Drawing): Vec3 {
    return state.vertices[state.vertices.length - 1]
  }

  /**
   * Appends `point` as the next vertex and keeps drawing from it: in arc mode
   * by the tangent arc, refused as AutoCAD's `*Invalid*` where none exists.
   */
  private appendVertex(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    const onPlane = withZOf(point, this.state.vertices[0])
    const bulge = this.pendingBulge(this.state, onPlane)
    if (bulge === null) {
      ctx.report(ctx.text.message("invalid"), "error")
      return
    }
    this.addSegment(onPlane, bulge, ctx)
  }

  /** An arc option's arc, after which the endpoint prompt asks again. */
  private appendArc(segment: ArcSegment, ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    this.addSegment(
      withZOf(segment.end, this.state.vertices[0]),
      segment.bulge,
      ctx
    )
    this.openLengthInput(ctx, this.lastScreen ?? { x: 0, y: 0 })
  }

  private addSegment(end: Vec3, bulge: number, ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    const [, ending] = this.state.width
    this.state = {
      ...this.state,
      vertices: [...this.state.vertices, end],
      bulges: [...this.state.bulges, bulge],
      widths: [...this.state.widths, this.state.width],
      // "The ending width becomes the uniform width for all subsequent
      // segments until you change the width again."
      width: [ending, ending],
      cursor: end,
      direction: null,
    }
    ctx.dynamicInput.clearTexts()
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.requestRender()
  }

  /**
   * Closes the chain and ends: with a line, or in arc mode with the arc
   * tangent to the chain back to the start — where none leaves that way
   * (straight back along a line), `*Invalid*` and a line, as the console
   * closes it.
   */
  private close(ctx: ToolContext): boolean {
    if (this.state.phase !== "drawing" || this.state.vertices.length < 2) {
      return false
    }
    let bulge = this.pendingBulge(this.state, this.state.vertices[0])
    if (bulge === null) {
      ctx.report(ctx.text.message("invalid"), "error")
      bulge = 0
    }
    this.state = {
      ...this.state,
      bulges: [...this.state.bulges, bulge],
      widths: [...this.state.widths, this.state.width],
      closed: true,
    }
    return true
  }

  /**
   * Removes the last placed vertex while staying in the command — AutoCAD's
   * PLINE "Undo" (U), `All segments already undone.` with none. Nothing is
   * committed yet, so this is a pure local rollback (no document undo). The
   * chain then goes on as its last segment was drawn, a line or an arc (the
   * console returns to the line prompt once the only arc is undone). The
   * width goes back to the command's starting one where every segment left
   * has it, else to 0, whatever it was before: AutoCAD 2023's console
   * (acc/w3–w7).
   */
  private undoLastVertex(ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    if (this.state.vertices.length < 2) {
      ctx.report(ctx.text.message("allSegmentsUndone"), "error")
      return
    }
    const vertices = this.state.vertices.slice(0, -1)
    const bulges = this.state.bulges.slice(0, -1)
    const widths = this.state.widths.slice(0, -1)
    const { startWidth } = this.state
    const kept = widths.every(
      ([start, end]) => start === startWidth && end === startWidth
    )
    const width = kept ? startWidth : 0
    const last = vertices[vertices.length - 1]
    this.state = {
      ...this.state,
      vertices,
      bulges,
      widths,
      width: [width, width],
      cursor: last,
      direction: null,
      closed: false,
      arcMode: (bulges[bulges.length - 1] ?? 0) !== 0,
      reversed: false,
    }
    ctx.dynamicInput.clearTexts()
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.requestRender()
  }

  /**
   * Materialises the accumulated chain as one polyline entity, if it has at
   * least two vertices (a single point is not geometry). Idempotent: resets the
   * state so a second call (e.g. onDeactivate after an explicit end) is a no-op.
   */
  private commitPolyline(ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    const { vertices, closed, bulges, widths, width } = this.state
    this.state = { phase: "idle" }
    // PLINEWID keeps the width the command was left at, whether it drew a
    // polyline or not (acc/w2).
    if (width[1] !== ctx.document.getSettings().polylineWidth) {
      ctx.execute(new UpdateSettingsCommand({ polylineWidth: width[1] }))
    }
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
                bulges,
                undefined,
                widths
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

  /**
   * Enters the drawing phase from the first vertex, opening the length
   * session, at PLINEWID's width.
   */
  private beginDrawing(start: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const settings = ctx.document.getSettings()
    const startWidth = settings.polylineWidth
    ctx.report(
      ctx.text.message("currentLineWidth", {
        width: formatLength(startWidth, settings),
      })
    )
    this.state = {
      phase: "drawing",
      vertices: [start],
      bulges: [],
      widths: [],
      width: [startWidth, startWidth],
      startWidth,
      cursor: start,
      direction: null,
      startTangent: lastDrawnDirection(ctx.document) ?? { x: 1, y: 0 },
      closed: false,
      arcMode: false,
      reversed: false,
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
        lastPoint: ctx.lastPoint,
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
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!start) return false
    this.beginDrawing(start, ctx)
    return true
  }

  /**
   * Length: `Specify length of line:`, with no default (Enter and `FOO` say
   * `Requires numeric distance or second point.`); a point is measured from
   * the last vertex. The line runs the way the chain heads — along the last
   * segment, tangent to an arc —, and first along the last line, arc or
   * polyline drawn, else east; a negative length runs back, and 0 adds a
   * segment of no length, as the console's do.
   */
  private openLengthPrompt(ctx: ToolContext): void {
    this.askingLength = true
    const session: DynamicInputSession = {
      fields: [{ id: "length", prompt: "length", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitLength(values.length, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * Width's or Halfwidth's prompt: the starting width offering the width the
   * next segment would end at, the ending one the starting one just given.
   */
  private widthQuestion(prompt: WidthPrompt): ToolQuestion {
    const scale = prompt.half ? 0.5 : 1
    if (prompt.start === null) {
      const ending = this.state.phase === "drawing" ? this.state.width[1] : 0
      return {
        id: prompt.half ? "polylineStartingHalfWidth" : "polylineStartingWidth",
        enter: ending * scale,
      }
    }
    return {
      id: prompt.half ? "polylineEndingHalfWidth" : "polylineEndingWidth",
      enter: prompt.start * scale,
    }
  }

  /**
   * A width is a value or a point measured from the last vertex, as AutoCAD
   * measures one (`Requires numeric distance or second point.`).
   */
  private openWidthPrompt(prompt: WidthPrompt, ctx: ToolContext): void {
    this.askingWidth = prompt
    ctx.dynamicInput.open({
      fields: [{ id: "width", prompt: "length", kind: "distance" }],
      commit: (values, commitCtx) => this.commitWidth(values.width, commitCtx),
    })
    ctx.dynamicInput.setDefault(
      "width",
      this.widthQuestion(prompt).enter as number
    )
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** Never negative: `Value must be positive.` and the same prompt again. */
  private commitWidth(value: number, ctx: ToolContext): void {
    const prompt = this.askingWidth
    if (this.state.phase !== "drawing" || !prompt || !Number.isFinite(value)) {
      return
    }
    if (value < 0) {
      ctx.report(ctx.text.message("valueMustBePositive"), "error")
      this.openWidthPrompt(prompt, ctx)
      return
    }
    const width = prompt.half ? value * 2 : value
    if (prompt.start === null) {
      this.openWidthPrompt({ ...prompt, start: width }, ctx)
      return
    }
    this.askingWidth = null
    this.state = { ...this.state, width: [prompt.start, width] }
    this.openLengthInput(ctx, this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private commitLength(length: number, ctx: ToolContext): void {
    if (this.state.phase !== "drawing" || !Number.isFinite(length)) return
    const last = this.lastVertex(this.state)
    const end = V.add(last, V.scale(this.tangent(this.state), length))
    this.askingLength = false
    this.addSegment(withZOf(end, this.state.vertices[0]), 0, ctx)
    this.openLengthInput(ctx, this.lastScreen ?? { x: 0, y: 0 })
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

/** Reads a field as a finite number, or `null` when empty/invalid (unlocked). */
function parseField(ctx: ToolContext, id: string): number | null {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
