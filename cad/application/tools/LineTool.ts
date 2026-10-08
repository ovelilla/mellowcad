import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, add3, scale3, withZOf } from "../../geometry/Vec3"
import { LineEntity, createLine } from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { TrackingResult } from "../tracking/types"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { KeyInput, PointerInput, Tool, ToolContext } from "./Tool"
import { CommandOption, CommandOptionOutcome } from "./Tool"
import type { PromptId } from "../../locales/types"
import { continuePoint } from "./lastDrawnPoint"
import {
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"
import { acuteHeading, headingInUcs } from "./ucsHeading"
import { pointAlongCursor, showRise } from "./directDistance"
import {
  DeferredPick,
  deferredFrom,
  deferredPair,
  deferredPick,
} from "./deferredSnap"

/**
 * The line tool's interaction flow, modelled as an explicit state machine:
 *
 * ```
 *            hover acquired guide            click 1st point
 *  idle ───────────────────────► tracking ────────────────┐
 *   │                              (offset input)          │
 *   │ click 1st point                 │ commit offset      ▼
 *   ├────────────────────────────────┴────────────► drawing ──┐
 *   │ Enter after an arc                              ▲        │ click / commit
 *   ├──────────────► tangent ── length ───────────────┤────────┘   (chains)
 *   │ tan / per on an object                          │
 *   └──────────────► deferred ── next point ──────────┘
 * ```
 *
 * Precision comes from three cooperating systems: snapping places points
 * exactly on existing geometry, Ortho constrains the direction, and dynamic
 * input lets the user type an exact length along the current direction.
 *
 * The tool never mutates the document: finished segments are submitted as
 * {@link AddEntityCommand}s, which the runtime folds into one undo step for
 * the whole command; the Undo option steps back one segment at a time.
 */

type LineToolState =
  /** Waiting for the first point. */
  | { readonly phase: "idle" }
  /** No start yet, but a tracking guide is engaged: offer a typed offset. */
  | { readonly phase: "tracking"; readonly origin: Vec3; readonly dir: Vec3 }
  /**
   * Continue from an arc: the line leaves its end tangent to it, so only its
   * length is asked ("You need to specify only the line length").
   */
  | {
      readonly phase: "tangent"
      readonly start: Vec3
      readonly dir: Vec2
      readonly cursor: Vec3
    }
  /**
   * The first point is a Tangent or Perpendicular picked with nothing to
   * measure from yet: it is worked out once the next point is known.
   */
  | {
      readonly phase: "deferred"
      readonly deferred: DeferredPick
      readonly cursor: Vec3
    }
  /** Start placed; rubber-banding towards the next point. */
  | {
      readonly phase: "drawing"
      /** First vertex of the whole chain, used by the Close (C) option. */
      readonly first: Vec3
      readonly start: Vec3
      readonly cursor: Vec3
      /** Last non-degenerate unit direction from start to cursor. */
      readonly direction: Vec2 | null
      /** The alignment path the cursor is on, which a typed length runs along. */
      readonly tracking: TrackingResult | null
      /** Segments committed in this chain (Close needs at least two). */
      readonly segments: number
      /**
       * Every committed vertex of the chain (`vertices[0]` is `first`, the last
       * is `start`). Lets the Undo (U) option step back one segment at a time.
       */
      readonly vertices: readonly Vec3[]
    }

export class LineTool implements Tool {
  readonly id = "line"
  readonly shortcut = "l"

  private state: LineToolState = { phase: "idle" }
  /** Last known screen position, used to place dynamic input on re-open. */
  private lastScreen: Vec2 | null = null
  /**
   * The last point LINE was given (AutoCAD's LASTPOINT, 0,0,0 until one is),
   * which `@` at the first point is relative to. Kept across runs.
   */
  private lastPoint: Vec3 | null = null

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
        this.state = {
          ...this.state,
          cursor: input.point,
          direction,
          tracking: input.tracking,
        }

        // Feed the dynamic-input fields the live distance and heading, then
        // follow the cursor. The heading already reflects Ortho (input.point is
        // constrained), so a typed length alone still honours the aid.
        if (!showRise(ctx, start, input.point)) {
          ctx.dynamicInput.setLive("distance", length)
          ctx.dynamicInput.setLive(
            "angle",
            direction ? acuteHeading(headingInUcs(ctx.ucs, direction)) : null
          )
        }
        ctx.dynamicInput.setPosition(input.screen)
        break
      }
      case "deferred":
        this.state = { ...this.state, cursor: input.point }
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "tangent":
        this.state = { ...this.state, cursor: input.point }
        ctx.dynamicInput.setLive(
          "distance",
          V.distance(this.state.start, input.point)
        )
        ctx.dynamicInput.setPosition(input.screen)
        break
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

    if (this.state.phase === "tangent") {
      // A pick at the length prompt gives the length: how far it is.
      this.commitTangent(this.resolveTangent(input.point, ctx), ctx)
      return
    }

    if (this.state.phase === "deferred") {
      this.completeDeferred(input, ctx)
      return
    }

    if (this.state.phase !== "drawing") {
      const deferred = this.deferredAt(input, ctx)
      if (deferred) {
        this.beginDeferred(deferred, input, ctx)
        return
      }
      // Placing the first point: honour a coordinate typed into the pre-start
      // box (always absolute — there is no previous point), otherwise use the
      // snapped cursor. Then begin the rubber-band chain.
      const start = this.resolveFirstPoint(input.point, ctx)
      this.beginDrawing(start, ctx, input.screen)
      return
    }

    const { start } = this.state
    // Place the point at the *effective* endpoint, honouring any hard-locked
    // typed length/angle — clicking respects the dynamic input exactly like
    // Enter does, rather than snapping to the raw cursor.
    const end = this.resolveEnd(start, input.point, ctx)
    this.addSegment(end, null, ctx)

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
   * A guide's typed offset still answers the first point (direct distance
   * along it), and the deferred first point waits on the next one. WHY none
   * for Continue's length: AutoCAD's wording of it is unverified.
   */
  question(): PromptId | null {
    switch (this.state.phase) {
      case "idle":
      case "tracking":
        return "specifyFirstPoint"
      case "tangent":
        return null
      case "deferred":
      case "drawing":
        return "specifyNextPointOr"
    }
  }

  /**
   * The keywords offered while drawing, AutoCAD-style: `Specify next point or
   * [Undo]:` from the first point on — its Undo takes that point back — and
   * `[Close/Undo]` once two segments exist, so a lone segment isn't retraced.
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "deferred") return [{ id: "Undo" }]
    if (this.state.phase !== "drawing") return []
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
    if (!samePoint(start, first)) {
      ctx.execute(new AddEntityCommand(newLine(start, first, ctx)))
    }
    this.lastPoint = first
    this.state = { phase: "idle" }
    ctx.dynamicInput.close()
    ctx.requestRender()
    return true
  }

  /**
   * Undoes the last committed segment while staying in the LINE command —
   * AutoCAD's "Undo" (U) option. The chain's last vertex is dropped and drawing
   * resumes from the previous one, so the user can retrace a mistaken point
   * without breaking the continuous-draw flow. With no segment yet it takes
   * back the first point, and the prompt asks for it again.
   *
   * State is rolled back *before* reverting the command: `ctx.undo()` emits a
   * document change that synchronously rebuilds engine state (and thus our
   * `commandOptions`), so `segments` must already be current for the "Undo"/
   * "Close" chips to update on time — mirroring `commitSegment`.
   */
  private undoLastSegment(ctx: ToolContext): boolean {
    if (this.state.phase === "deferred") {
      const at =
        this.lastScreen ?? ctx.viewport.worldToScreen(this.state.deferred.pick)
      this.state = { phase: "idle" }
      this.openFirstPointInput(ctx, at)
      ctx.requestRender()
      return true
    }
    if (this.state.phase !== "drawing") return false

    if (this.state.segments < 1) {
      const at = this.lastScreen ?? ctx.viewport.worldToScreen(this.state.start)
      this.state = { phase: "idle" }
      this.openFirstPointInput(ctx, at)
      ctx.requestRender()
      return true
    }

    const { first } = this.state
    const vertices = this.state.vertices.slice(0, -1)
    const start = vertices[vertices.length - 1]
    this.lastPoint = start
    this.state = {
      phase: "drawing",
      first,
      start,
      cursor: start,
      direction: null,
      tracking: null,
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

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    let from: Vec3
    let to: Vec3
    if (this.state.phase === "drawing") {
      // Rubber-band segment from the confirmed start to the *effective*
      // endpoint, so a typed (hard-locked) length/angle is reflected live —
      // the preview shows exactly where the point will land, matching AutoCAD.
      from = this.state.start
      to = this.resolveEnd(this.state.start, this.state.cursor, ctx)
    } else if (this.state.phase === "tangent") {
      from = this.state.start
      to = this.resolveTangent(this.state.cursor, ctx)
    } else if (this.state.phase === "deferred") {
      const { deferred, cursor } = this.state
      const start = deferredFrom(deferred, cursor)
      if (!start) return []
      from = start
      to = cursor
    } else {
      return []
    }
    return [
      {
        kind: "segment",
        a: viewport.worldToScreen(from),
        b: viewport.worldToScreen(to),
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
  private resolveEnd(start: Vec3, rawCursor: Vec3, ctx: ToolContext): Vec3 {
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
        elevation: ctx.elevation,
      })
      // Incomplete/invalid while typing: keep following the cursor.
      return point ?? rawCursor
    }

    const typedDist = parseField(ctx, "distance")
    const typedAngle = parseField(ctx, "angle")
    if (typedDist === null && typedAngle === null) return rawCursor
    return (
      this.pointAt(start, rawCursor, typedDist, typedAngle, ctx) ?? rawCursor
    )
  }

  /**
   * The point a typed length and/or angle give from `start`. A length alone on
   * an alignment path — an OTRACK guide, an Extension — is measured from the
   * point acquired along that path ("use direct distance to specify points at
   * precise distances along alignment paths from the acquired object snap
   * point"); elsewhere it is direct distance, `@dist<angle` keeping the start's
   * Z or running up the Z guide the cursor is on. A typed angle is read on the
   * cursor's side, as the field shows it.
   */
  private pointAt(
    start: Vec3,
    cursor: Vec3,
    distance: number | null,
    angle: number | null,
    ctx: ToolContext
  ): Vec3 | null {
    const tracking = this.state.phase === "drawing" ? this.state.tracking : null
    if (
      distance !== null &&
      angle === null &&
      tracking?.kind === "projection"
    ) {
      const origin = tracking.guides[0].point.origin
      return add3(origin, scale3(tracking.direction, distance))
    }
    return pointAlongCursor(ctx, start, cursor, { distance, angle })
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
      ctx.dynamicInput.setLive(
        "distance",
        tracking.direction.z !== 0
          ? Math.abs(input.point.z - origin.z)
          : V.distance(origin, input.point)
      )
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
  private resolveFirstPoint(rawPoint: Vec3, ctx: ToolContext): Vec3 {
    const text = ctx.dynamicInput.getText("point").trim()
    if (isCoordinateExpression(text)) {
      const point = parseCoordinate(text, {
        lastPoint: this.lastPoint,
        relativeByDefault: false,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
      if (point) return point
    }
    return rawPoint
  }

  /**
   * Enters the drawing phase from `start`, opening the length/angle session so
   * the next segment can be typed or picked.
   */
  private beginDrawing(start: Vec3, ctx: ToolContext, screen?: Vec2): void {
    this.lastPoint = start
    this.state = {
      phase: "drawing",
      first: start,
      start,
      cursor: start,
      direction: null,
      tracking: null,
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
    if (text === "") return this.continueFromLast(ctx)
    if (!isCoordinateExpression(text)) return false
    const start = parseCoordinate(text, {
      lastPoint: this.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!start) return false
    this.beginDrawing(start, ctx)
    return true
  }

  /**
   * A pick under a Tangent or Perpendicular override, with no point yet to
   * measure from: the object it was made on, to work the point out later.
   */
  private deferredAt(
    input: PointerInput,
    ctx: ToolContext
  ): DeferredPick | null {
    // A snap found anyway (an anchor for it after all) is an ordinary point.
    if (input.snap) return null
    const entity = ctx.pick(input.world, ctx.pickTolerance())
    return deferredPick(ctx.snapOverride(), entity, input.world)
  }

  /** "Deferred Tangent": the first point waits for the next one. */
  private beginDeferred(
    deferred: DeferredPick,
    input: PointerInput,
    ctx: ToolContext
  ): void {
    this.state = { phase: "deferred", deferred, cursor: input.point }
    const session: DynamicInputSession = {
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitDeferredCoordinate(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  /**
   * The next point settles the deferred one: picked plainly, the tangent or
   * the foot seen from it; under a second Tangent or Perpendicular, the line
   * that touches both objects.
   */
  private completeDeferred(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase !== "deferred") return
    const { deferred } = this.state
    const second = this.deferredAt(input, ctx)
    const pair = second && deferredPair(deferred, second)
    if (pair) {
      this.drawDeferred(pair[0], pair[1], ctx)
      return
    }
    const start = deferredFrom(deferred, input.point)
    if (start) this.drawDeferred(start, input.point, ctx)
  }

  /** A typed next point settles the deferred one as a pick there would. */
  private commitDeferredCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "deferred") return false
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false
    const end = parseCoordinate(text, {
      lastPoint: this.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    const start = end && deferredFrom(this.state.deferred, end)
    if (!end || !start) return false
    this.drawDeferred(start, end, ctx)
    return true
  }

  /** Draws the first segment once both its ends are known, and chains on. */
  private drawDeferred(start: Vec3, end: Vec3, ctx: ToolContext): void {
    this.beginDrawing(start, ctx)
    this.addSegment(end, null, ctx)
  }

  /**
   * AutoCAD's Continue: "a new line starts from the endpoint of the most
   * recently created line, polyline, or arc" — and from an arc, tangent to it,
   * asking only the length.
   */
  private continueFromLast(ctx: ToolContext): boolean {
    const resume = continuePoint(ctx.document)
    if (!resume) return false
    if (resume.tangent === null) {
      this.beginDrawing(resume.point, ctx)
      return true
    }
    this.lastPoint = resume.point
    this.state = {
      phase: "tangent",
      start: resume.point,
      dir: resume.tangent,
      cursor: resume.point,
    }
    const session: DynamicInputSession = {
      fields: [{ id: "distance", prompt: "length", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitTangent(this.tangentPoint(values.distance), commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setPosition(
      this.lastScreen ?? ctx.viewport.worldToScreen(resume.point)
    )
    ctx.requestRender()
    return true
  }

  /** Where the tangent line ends for the length typed, or the cursor's. */
  private resolveTangent(cursor: Vec3, ctx: ToolContext): Vec3 {
    if (this.state.phase !== "tangent") return cursor
    const typed = parseField(ctx, "distance")
    return this.tangentPoint(typed ?? V.distance(this.state.start, cursor))
  }

  private tangentPoint(length: number): Vec3 {
    if (this.state.phase !== "tangent") throw new Error("not continuing")
    const { start, dir } = this.state
    return withZOf(V.add(start, V.scale(dir, length)), start)
  }

  /** Draws the tangent line and goes on to the next point from its end. */
  private commitTangent(end: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "tangent") return
    const { start, dir } = this.state
    if (samePoint(start, end)) return
    this.state = {
      phase: "drawing",
      first: start,
      start,
      cursor: start,
      direction: dir,
      tracking: null,
      segments: 0,
      vertices: [start],
    }
    this.openLengthInput(
      ctx,
      this.lastScreen ?? ctx.viewport.worldToScreen(start)
    )
    this.addSegment(end, dir, ctx)
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
      // Still the first-point prompt: Enter is its Continue, guide or not.
      commitRaw: (commitCtx) =>
        this.state.phase === "tracking" &&
        commitCtx.dynamicInput.getText("distance").trim() === "" &&
        this.continueFromLast(commitCtx),
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
    const start = add3(this.state.origin, scale3(this.state.dir, distance))
    this.beginDrawing(start, ctx)
  }

  /**
   * Builds a segment from the typed length and angle (either may come from the
   * live cursor: a typed length uses the current heading, a typed angle locks
   * the direction, and typing both places the point precisely without the
   * mouse), then chains from the new endpoint. A negative length runs the
   * other way: "If you had typed -6, the vertical line would have been drawn
   * downward".
   */
  private commitSegment(
    values: Record<string, number>,
    ctx: ToolContext
  ): void {
    if (this.state.phase !== "drawing") return
    const { distance, angle } = values
    if (!(Math.abs(distance) > 0)) return

    const { start, cursor } = this.state
    // No angle at all (the field reads `+Z` / `-Z`): the length runs along the
    // cursor's path, the Z guide.
    const typedAngle = ctx.dynamicInput.getText("angle").trim() !== ""
    const heading = Number.isFinite(angle) ? angle : null
    const end = this.pointAt(
      start,
      cursor,
      distance,
      typedAngle ? heading : null,
      ctx
    )
    if (end === null) return
    this.addSegment(end, null, ctx)
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
      elevation: ctx.elevation,
    })
    if (!end) return false
    this.addSegment(end, null, ctx)
    return true
  }

  /**
   * Draws the segment from the current start to `end` and chains from `end`.
   * A zero-length one (a double click on the same snap point) is skipped.
   * State advances *before* executing: executing emits a document change that
   * rebuilds engine state (and thus our commandOptions), so `segments` must
   * already be current for "Close" to appear on time.
   */
  private addSegment(end: Vec3, heading: Vec2 | null, ctx: ToolContext): void {
    if (this.state.phase !== "drawing") return
    const { start, first, segments, vertices } = this.state
    const offset = V.sub(end, start)
    const length = V.length(offset)
    const draws = !samePoint(start, end)
    const direction =
      heading ?? (length > 1e-9 ? V.scale(offset, 1 / length) : null)
    this.lastPoint = end
    this.state = {
      phase: "drawing",
      first,
      start: end,
      cursor: end,
      direction: direction ?? this.state.direction,
      tracking: null,
      segments: draws ? segments + 1 : segments,
      vertices: draws ? [...vertices, end] : vertices,
    }
    if (draws) ctx.execute(new AddEntityCommand(newLine(start, end, ctx)))

    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive(
      "angle",
      direction ? acuteHeading(headingInUcs(ctx.ucs, direction)) : null
    )
    ctx.requestRender()
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

/** A line straight up in Z is still a line, though it is a point in plan. */
function samePoint(a: Vec3, b: Vec3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z
}

function newLine(start: Vec3, end: Vec3, ctx: ToolContext): LineEntity {
  return withCurrentProperties(
    withCurrentThickness(
      createLine(start, end, ctx.document.getCurrentLayerId()),
      ctx
    ),
    ctx
  )
}
