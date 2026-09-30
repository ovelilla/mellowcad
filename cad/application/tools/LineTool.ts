import { Vec2, V } from "../../geometry/Vec2"
import { createLine } from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ConstructionGeometry } from "../snapping/types"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { KeyInput, PointerInput, Tool, ToolContext } from "./Tool"
import { CommandOption, CommandOptionOutcome } from "./Tool"
import { lastDrawnPoint } from "./lastDrawnPoint"
import { directionFromUcsHeading, headingInUcs } from "./ucsHeading"

/**
 * The line tool's interaction flow, modelled as an explicit state machine:
 *
 * ```
 *            hover acquired guide            click 1st point
 *  idle ───────────────────────► tracking ────────────────┐
 *   │                              (offset input)          │
 *   │ click 1st point                 │ commit offset      ▼
 *   └────────────────────────────────┴────────────► drawing ──┐
 *                                                     ▲        │ click / commit
 *                                                     └────────┘   (chains)
 * ```
 *
 * Precision comes from three cooperating systems: snapping places points
 * exactly on existing geometry, Ortho constrains the direction, and dynamic
 * input lets the user type an exact length along the current direction.
 *
 * The tool never mutates the document: finished segments are submitted as
 * {@link AddEntityCommand}s, so every line is individually undoable.
 */

type LineToolState =
  /** Waiting for the first point. */
  | { readonly phase: "idle" }
  /** No start yet, but a tracking guide is engaged: offer a typed offset. */
  | { readonly phase: "tracking"; readonly origin: Vec2; readonly dir: Vec2 }
  /** Start placed; rubber-banding towards the next point. */
  | {
      readonly phase: "drawing"
      /** First vertex of the whole chain, used by the Close (C) option. */
      readonly first: Vec2
      readonly start: Vec2
      readonly cursor: Vec2
      /** Last non-degenerate unit direction from start to cursor. */
      readonly direction: Vec2 | null
      /** Segments committed in this chain (Close needs at least two). */
      readonly segments: number
      /**
       * Every committed vertex of the chain (`vertices[0]` is `first`, the last
       * is `start`). Lets the Undo (U) option step back one segment at a time.
       */
      readonly vertices: readonly Vec2[]
    }

export class LineTool implements Tool {
  readonly id = "line"
  readonly shortcut = "l"

  private state: LineToolState = { phase: "idle" }
  /** Last known screen position, used to place dynamic input on re-open. */
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "idle" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "drawing": {
        const { start } = this.state
        const offset = V.sub(input.point, start)
        const length = V.length(offset)
        const direction =
          length > 1e-9 ? V.scale(offset, 1 / length) : this.state.direction
        this.state = { ...this.state, cursor: input.point, direction }

        // Feed the dynamic-input fields the live distance and heading, then
        // follow the cursor. The heading already reflects Ortho (input.point is
        // constrained), so a typed length alone still honours the aid.
        ctx.dynamicInput.setLive("distance", length)
        ctx.dynamicInput.setLive(
          "angle",
          direction ? headingInUcs(ctx.ucs, direction) : null
        )
        ctx.dynamicInput.setPosition(input.screen)
        break
      }
      case "idle":
      case "tracking":
        // No start yet: object snap tracking can offset the start along a guide.
        this.updatePreStartTracking(input, ctx)
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    if (this.state.phase !== "drawing") {
      // Placing the first point: honour a coordinate typed into the pre-start
      // box (always absolute — there is no previous point), otherwise use the
      // snapped cursor. Then begin the rubber-band chain.
      const start = this.resolveFirstPoint(input.point, ctx)
      this.beginDrawing(start, ctx, input.screen)
      return
    }

    const { start, first, segments } = this.state
    // Place the point at the *effective* endpoint, honouring any hard-locked
    // typed length/angle — clicking respects the dynamic input exactly like
    // Enter does, rather than snapping to the raw cursor.
    const end = this.resolveEnd(start, input.point, ctx)
    // Ignore zero-length segments (e.g. a double click on the same snap point).
    const draws = start.x !== end.x || start.y !== end.y

    // Advance our own state *before* executing the command: executing emits a
    // document change that rebuilds engine state (and thus our commandOptions),
    // so `segments` must already be current for "Close" to appear on time.
    this.state = {
      phase: "drawing",
      first,
      start: end,
      cursor: end,
      direction: null,
      segments: draws ? segments + 1 : segments,
      vertices: draws ? [...this.state.vertices, end] : this.state.vertices,
    }
    if (draws) {
      ctx.execute(
        new AddEntityCommand(
          createLine(start, end, ctx.document.getCurrentLayerId())
        )
      )
    }

    // Clear the typed values so the next segment starts unlocked (AutoCAD-style).
    ctx.dynamicInput.clearTexts()
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "idle" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  /**
   * The keywords offered while drawing, AutoCAD-style. "Undo" appears once a
   * segment exists (so there is something to step back), and "Close" once at
   * least two segments exist (three points), so a lone segment isn't retraced.
   * Growing this list is all it takes to add options.
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "drawing" || this.state.segments < 1) return []
    const options: CommandOption[] = []
    if (this.state.segments >= 2) options.push({ id: "Close" })
    options.push({ id: "Undo" })
    return options
  }

  /**
   * Runs a keyword. Close closes the chain and ends the command; Undo undoes
   * the last segment and keeps drawing.
   */
  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Close":
        return this.close(ctx) ? "end" : "unhandled"
      case "Undo":
        return this.undoLastSegment(ctx) ? "continue" : "unhandled"
      default:
        return "unhandled"
    }
  }

  /**
   * Closes the current polyline chain — AutoCAD's LINE "Close" (C) option:
   * draws the final segment from the last vertex back to the very first one and
   * ends the command. Available only once at least two segments exist (three
   * points), so a lone segment isn't simply retraced. Returns whether it
   * actually closed, letting the runtime end the command only when it did.
   */
  private close(ctx: ToolContext): boolean {
    if (this.state.phase !== "drawing" || this.state.segments < 2) return false
    const { start, first } = this.state
    if (start.x !== first.x || start.y !== first.y) {
      ctx.execute(
        new AddEntityCommand(
          createLine(start, first, ctx.document.getCurrentLayerId())
        )
      )
    }
    this.state = { phase: "idle" }
    ctx.dynamicInput.close()
    ctx.requestRender()
    return true
  }

  /**
   * Undoes the last committed segment while staying in the LINE command —
   * AutoCAD's "Undo" (U) option. The chain's last vertex is dropped and drawing
   * resumes from the previous one, so the user can retrace a mistaken point
   * without breaking the continuous-draw flow (unlike the global Ctrl+Z).
   *
   * State is rolled back *before* reverting the command: `ctx.undo()` emits a
   * document change that synchronously rebuilds engine state (and thus our
   * `commandOptions`), so `segments` must already be current for the "Undo"/
   * "Close" chips to update on time — mirroring `commitSegment`.
   */
  private undoLastSegment(ctx: ToolContext): boolean {
    if (this.state.phase !== "drawing" || this.state.segments < 1) return false

    const { first } = this.state
    const vertices = this.state.vertices.slice(0, -1)
    const start = vertices[vertices.length - 1]
    this.state = {
      phase: "drawing",
      first,
      start,
      cursor: start,
      direction: null,
      segments: this.state.segments - 1,
      vertices,
    }
    ctx.undo()

    // Unlock any typed values so the retraced segment starts fresh.
    ctx.dynamicInput.clearTexts()
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.requestRender()
    return true
  }

  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "drawing" ? this.state.start : null
  }

  /**
   * Exposes the rubber-band segment (confirmed start → raw cursor) so the snap
   * engine can compute intersections between the line being drawn and existing
   * geometry, making the intersection osnap engage while drawing — like AutoCAD.
   */
  getSnapGeometry(cursor: Vec2): readonly ConstructionGeometry[] {
    if (this.state.phase !== "drawing") return []
    return [{ kind: "segment", a: this.state.start, b: cursor }]
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "drawing") return []
    const { viewport } = ctx
    // Rubber-band segment from the confirmed start to the *effective* endpoint,
    // so a typed (hard-locked) length/angle is reflected live — the preview
    // shows exactly where the point will land, matching AutoCAD.
    const end = this.resolveEnd(this.state.start, this.state.cursor, ctx)
    return [
      {
        kind: "segment",
        a: viewport.worldToScreen(this.state.start),
        b: viewport.worldToScreen(end),
        stroke: { color: THEME.rubberBand, width: 1 },
      },
    ]
  }

  /**
   * Computes the effective endpoint of the segment being drawn, honouring any
   * *hard-locked* typed values. A typed length or angle overrides the cursor
   * for that component — the mouse can no longer change it until the field is
   * cleared, exactly like AutoCAD's dimensional input. Untyped components
   * follow the cursor: the distance from the raw point and the angle from the
   * start→cursor heading (which already reflects Ortho/snapping).
   */
  private resolveEnd(start: Vec2, rawCursor: Vec2, ctx: ToolContext): Vec2 {
    // A full coordinate typed into the length field (e.g. `@30,0` or `100<45`)
    // defines the endpoint directly, overriding the length/angle fields. With
    // dynamic input on, a bare `x,y` is relative to the current start (AutoCAD's
    // DYN default); `#` forces absolute and `@` forces relative.
    const coordText = ctx.dynamicInput.getText("distance").trim()
    if (isCoordinateExpression(coordText)) {
      const point = parseCoordinate(coordText, {
        lastPoint: start,
        relativeByDefault: true,
        ucs: ctx.ucs,
      })
      // Incomplete/invalid while typing: keep following the cursor.
      return point ?? rawCursor
    }

    const typedDist = parseField(ctx, "distance")
    const typedAngle = parseField(ctx, "angle")

    const offset = V.sub(rawCursor, start)
    const cursorDist = V.length(offset)
    const cursorAngle = cursorDist > 1e-9 ? headingInUcs(ctx.ucs, offset) : null

    const distance = typedDist ?? cursorDist
    const angle = typedAngle ?? cursorAngle
    // No heading yet (cursor still on the start and nothing typed): no point.
    if (angle === null) return rawCursor

    return V.add(
      start,
      V.scale(directionFromUcsHeading(ctx.ucs, angle), distance)
    )
  }

  /**
   * While no start point exists, two typed-entry modes are offered near the
   * cursor. When an object-snap-tracking guide is engaged, a distance session
   * lets the user offset the start along the guide. Otherwise a coordinate
   * session lets the user type the first point directly (always absolute, since
   * there is no previous point) — AutoCAD's pointer input.
   */
  private updatePreStartTracking(input: PointerInput, ctx: ToolContext): void {
    const tracking = input.tracking
    if (tracking) {
      const origin = tracking.guides[0].point.origin
      this.state = { phase: "tracking", origin, dir: tracking.direction }
      if (this.currentFieldId(ctx) !== "distance") {
        this.openOffsetInput(ctx, input.screen)
      }
      ctx.dynamicInput.setLive("distance", V.distance(origin, input.point))
      ctx.dynamicInput.setPosition(input.screen)
    } else {
      // No guide: drop any offset session and show the first-point coordinate
      // box instead.
      if (this.state.phase === "tracking") this.state = { phase: "idle" }
      if (this.currentFieldId(ctx) !== "point") {
        this.openFirstPointInput(ctx, input.screen)
      }
      ctx.dynamicInput.setPosition(input.screen)
    }
  }

  /** The id of the field the current dynamic-input session leads with, if any. */
  private currentFieldId(ctx: ToolContext): string | undefined {
    return ctx.dynamicInput.getSession()?.fields[0]?.id
  }

  /**
   * Resolves the first point of the chain, honouring a coordinate typed into
   * the pre-start box. The first point of a command has no previous point, so a
   * bare `x,y` is absolute (the DYN relative default does not apply yet).
   */
  private resolveFirstPoint(rawPoint: Vec2, ctx: ToolContext): Vec2 {
    const text = ctx.dynamicInput.getText("point").trim()
    if (isCoordinateExpression(text)) {
      const point = parseCoordinate(text, {
        lastPoint: null,
        relativeByDefault: false,
        ucs: ctx.ucs,
      })
      if (point) return point
    }
    return rawPoint
  }

  /**
   * Enters the drawing phase from `start`, opening the length/angle session so
   * the next segment can be typed or picked.
   */
  private beginDrawing(start: Vec2, ctx: ToolContext, screen?: Vec2): void {
    this.state = {
      phase: "drawing",
      first: start,
      start,
      cursor: start,
      direction: null,
      segments: 0,
      vertices: [start],
    }
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(start)
    this.openLengthInput(ctx, at)
    ctx.requestRender()
  }

  /**
   * Opens the pre-start coordinate session for typing the first point directly
   * (absolute), AutoCAD-style. Its commit routes through {@link commitFirstPoint}.
   */
  private openFirstPointInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", kind: "coordinate" }],
      // Coordinate-only: there is no numeric field to resolve.
      commit: () => {},
      commitRaw: (commitCtx) => this.commitFirstPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(screen)
  }

  /**
   * Places the first point from a typed coordinate and begins drawing. An
   * empty box means AutoCAD's Continue: resume from the last drawn endpoint.
   */
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
    })
    if (!start) return false
    this.beginDrawing(start, ctx)
    return true
  }

  /**
   * Opens the segment session offering a length *and* an angle field. Tab in
   * the UI moves between them; typing the length alone follows the current
   * heading (cursor / Ortho), while typing the angle locks the direction —
   * matching AutoCAD's polar dynamic input (e.g. `100` Tab `45`).
   */
  private openLengthInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [
        { id: "distance", prompt: "length", kind: "distance" },
        { id: "angle", prompt: "angle", kind: "angle" },
      ],
      commit: (values, commitCtx) => this.commitSegment(values, commitCtx),
      // Enter with a coordinate expression in the length field commits a whole
      // point (e.g. `@30,0`), so the numeric length/angle path is bypassed.
      commitRaw: (commitCtx) => this.commitCoordinate(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.dynamicInput.setPosition(screen)
  }

  /** Opens the pre-start "offset from tracking reference" session. */
  private openOffsetInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [{ id: "distance", prompt: "trackingOffset", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitOffsetStart(values.distance, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  /**
   * Places the start point `distance` units from the acquired tracking origin
   * along the guide direction, then opens the usual segment-length session.
   */
  private commitOffsetStart(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "tracking") return

    const start = V.add(this.state.origin, V.scale(this.state.dir, distance))
    this.state = {
      phase: "drawing",
      first: start,
      start,
      cursor: start,
      direction: null,
      segments: 0,
      vertices: [start],
    }

    const screen = this.lastScreen ?? ctx.viewport.worldToScreen(start)
    this.openLengthInput(ctx, screen)
    ctx.requestRender()
  }

  /**
   * Builds a segment of exactly `distance` document units from the current
   * start at `angle` degrees (counter-clockwise from +X, AutoCAD convention),
   * then chains from the new endpoint. Either value may come from the live
   * cursor: a typed length uses the current heading, a typed angle locks the
   * direction, and typing both places the point precisely without the mouse.
   */
  private commitSegment(
    values: Record<string, number>,
    ctx: ToolContext
  ): void {
    if (this.state.phase !== "drawing") return
    const { distance, angle } = values
    if (!(distance > 0) || !Number.isFinite(angle)) return

    const { start, first, segments } = this.state
    const direction = directionFromUcsHeading(ctx.ucs, angle)
    const end = V.add(start, V.scale(direction, distance))

    // Advance state before executing so commandOptions ("Close") reflect the
    // new segment count as soon as the document-change rebuilds engine state.
    this.state = {
      phase: "drawing",
      first,
      start: end,
      cursor: end,
      direction,
      segments: segments + 1,
      vertices: [...this.state.vertices, end],
    }
    ctx.execute(
      new AddEntityCommand(
        createLine(start, end, ctx.document.getCurrentLayerId())
      )
    )

    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", headingInUcs(ctx.ucs, direction))
    ctx.requestRender()
  }

  /**
   * Commits the segment from a coordinate expression typed into the length
   * field (AutoCAD's typed-point precision, e.g. `@30,0`, `50,100` or `100<45`)
   * and chains from the new endpoint, mirroring {@link commitSegment}. Returns
   * whether the text was a coordinate that resolved — the runtime only treats
   * the input as consumed when it did.
   */
  private commitCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "drawing") return false
    const coordText = ctx.dynamicInput.getText("distance").trim()
    if (!isCoordinateExpression(coordText)) return false
    const end = parseCoordinate(coordText, {
      lastPoint: this.state.start,
      relativeByDefault: true,
      ucs: ctx.ucs,
    })
    if (!end) return false

    const { start, first, segments } = this.state
    const offset = V.sub(end, start)
    const length = V.length(offset)
    const draws = length > 0
    const direction = draws ? V.scale(offset, 1 / length) : this.state.direction

    // Advance state before executing so commandOptions reflect the new count.
    this.state = {
      phase: "drawing",
      first,
      start: end,
      cursor: end,
      direction,
      segments: draws ? segments + 1 : segments,
      vertices: draws ? [...this.state.vertices, end] : this.state.vertices,
    }
    if (draws) {
      ctx.execute(
        new AddEntityCommand(
          createLine(start, end, ctx.document.getCurrentLayerId())
        )
      )
    }

    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive(
      "angle",
      direction ? headingInUcs(ctx.ucs, direction) : null
    )
    ctx.requestRender()
    return true
  }
}

/**
 * Reads a dynamic-input field as a finite number, or `null` when it is empty
 * or not (yet) a valid number. A non-null result means the field is
 * *hard-locked* to that typed value.
 */
function parseField(ctx: ToolContext, id: string): number | null {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
