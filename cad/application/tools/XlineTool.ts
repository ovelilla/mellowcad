import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, sub3 } from "../../geometry/Vec3"
import {
  Entity,
  createXline,
  infiniteBase,
  infiniteDirection,
  isInfiniteLine,
  lineEndZ,
  lineStartZ,
  nextEntityId,
} from "../../domain/entities"
import { parseAngleDegrees } from "../../domain/units"
import type { PromptId } from "../../locales/types"
import type { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { currentColor, withCurrentProperties } from "./currentProperties"
import { rollover } from "./ghostLook"
import { lockedObjectAt } from "./lockedPick"
import { typedPick } from "./typedPick"
import { directionFromUcsHeading } from "./ucsHeading"
import type {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** How the xlines of a run are placed once their direction is known. */
type Fixed = {
  readonly direction: Vec3
  /** Hor or Ver, whose prompt German words apart (table 21730). */
  readonly axis: boolean
}

type XlineState =
  | { readonly phase: "first" }
  /** The point form: every through point an xline through the base. */
  | { readonly phase: "through"; readonly base: Vec3 }
  /** Hor, Ver, Ang and Reference: every point an xline through it. */
  | { readonly phase: "fixed"; readonly fixed: Fixed }
  | { readonly phase: "angle" }
  | { readonly phase: "reference"; readonly hover: Entity | null }
  | { readonly phase: "referenceAngle"; readonly reference: number }
  | { readonly phase: "vertex" }
  | { readonly phase: "start"; readonly vertex: Vec3 }
  | { readonly phase: "end"; readonly vertex: Vec3; readonly start: Vec3 }
  | { readonly phase: "offsetDistance" }
  | {
      readonly phase: "offsetObject"
      /** Null in Through. */
      readonly distance: number | null
      readonly hover: Entity | null
    }
  | {
      readonly phase: "offsetSide"
      readonly distance: number
      readonly source: LineLike
    }
  | { readonly phase: "offsetThrough"; readonly source: LineLike }

/** A line object's base point and direction: a line's start and run, an XLINE's or a RAY's own. */
interface LineLike {
  readonly base: Vec3
  readonly direction: Vec3
}

const PREVIEW_ID = "xline-preview"

/**
 * AutoCAD's XLINE (xline/x01–x09, desktop d04–d07): `Specify a point or
 * [Hor/Ver/Ang/Bisect/Offset]:`, then each answer of the option's prompt makes
 * one xline and asks again, Enter ending the run.
 *
 * - A point: `Specify through point:`, every xline through it and the
 *   point; one on the point itself is `*Invalid*`.
 * - Hor and Ver: along the UCS's X and Y through each point. Ang: `Enter
 *   angle of xline (0) or [Reference]:`, Enter taking 0, then through each
 *   point; Reference: `Select a line object:` (a LINE, XLINE or RAY) and
 *   `Enter angle of xline <0>:`, measured from its direction.
 * - Bisect: `Specify angle vertex point:`, `Specify angle start point:` (not
 *   on the vertex, `Start point must differ from vertex point`), then each
 *   `Specify angle end point:` the bisector of the start's direction and the
 *   end's through the vertex; Enter at the first two is `Invalid point.`
 * - Offset: `Specify offset distance or [Through] <Through>:`, OFFSET's
 *   OFFSETDIST, then `Select a line object:` and `Specify side to offset:`
 *   (the xline based at the object's base moved across) or, through, `Specify
 *   through point:` (based there), round and round; anything but a line
 *   object is `No usable object selected`.
 *
 * Each xline wears the current properties and lies where its points do.
 */
export class XlineTool implements Tool {
  readonly id = "xline"

  private state: XlineState = { phase: "first" }
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.state = { phase: "first" }
    this.openPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    this.cursor = null
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "first":
        return "specifyAPointOr"
      case "fixed":
        return this.state.fixed.axis
          ? "specifyThroughPointAxis"
          : "specifyThroughPoint"
      case "through":
      case "offsetThrough":
        return "specifyThroughPoint"
      case "angle":
        return { id: "xlineAngleOr", values: { angle: "0" } }
      case "reference":
      case "offsetObject":
        return "selectLineObject"
      case "referenceAngle":
        return { id: "xlineAngle", enter: { angle: 0 } }
      case "vertex":
        return "specifyAngleVertexPoint"
      case "start":
        return "specifyAngleStartPoint"
      case "end":
        return "specifyAngleEndPoint"
      case "offsetDistance": {
        const distance = this.offsetDistance()
        return distance < 0
          ? "xlineOffsetDistanceOr"
          : { id: "xlineOffsetDistanceOr", enter: distance }
      }
      case "offsetSide":
        return "specifySideToOffset"
    }
  }

  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "reference":
      case "offsetObject":
        return "objectOrGroup"
      case "angle":
        return {
          refusal: "requiresAngle",
          values: { points: "two", keyword: "yes" },
        }
      case "referenceAngle":
        return {
          refusal: "requiresAngle",
          values: { points: "two", keyword: "no" },
        }
      case "offsetDistance":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "yes" },
        }
      default:
        return null
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "offsetDistance" && this.offsetDistance() < 0
      ? "Through"
      : null
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "first":
        return [
          { id: "Hor" },
          { id: "Ver" },
          { id: "Ang" },
          { id: "Bisect" },
          { id: "Offset" },
        ]
      case "angle":
        return [{ id: "Reference" }]
      case "offsetDistance":
        // `Thru`, the initget's second word for Through (xline/x05's trace).
        return [{ id: "Through" }, { id: "Thru", hidden: true }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const phase = this.state.phase
    if (phase === "first") {
      switch (id) {
        case "Hor":
          return this.toFixed({ x: 1, y: 0, z: 0 }, ctx, true)
        case "Ver":
          return this.toFixed({ x: 0, y: 1, z: 0 }, ctx, true)
        case "Ang":
          this.state = { phase: "angle" }
          this.openAngle(ctx)
          return "continue"
        case "Bisect":
          this.state = { phase: "vertex" }
          this.openPoint(ctx)
          return "continue"
        case "Offset":
          this.state = { phase: "offsetDistance" }
          this.openDistance(ctx)
          return "continue"
      }
    }
    if (phase === "angle" && id === "Reference") {
      this.state = { phase: "reference", hover: null }
      this.openPick(ctx)
      return "continue"
    }
    if (phase === "offsetDistance" && (id === "Through" || id === "Thru")) {
      ctx.held("OFFSETDIST").write(-1)
      this.toOffsetObject(null, ctx)
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    switch (this.state.phase) {
      case "first":
      case "through":
      case "fixed":
      case "vertex":
      case "start":
      case "end":
      case "offsetSide":
      case "offsetThrough":
        return true
      default:
        return false
    }
  }

  getConstraintAnchor(): Vec3 | null {
    switch (this.state.phase) {
      case "through":
        return this.state.base
      case "end":
        return this.state.vertex
      default:
        return null
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    ctx.dynamicInput.setPosition(input.screen)
    if (
      this.state.phase === "reference" ||
      this.state.phase === "offsetObject"
    ) {
      const hover = ctx.pick(input.world)
      this.state = { ...this.state, hover: hover && lineLike(hover) && hover }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (
      this.state.phase === "reference" ||
      this.state.phase === "offsetObject"
    ) {
      this.pickLine(input, ctx)
      return
    }
    if (this.wantsSnap()) this.placePoint(input.point, ctx)
  }

  /** A point typed at `Select a line object:` picks there, as a click does. */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "reference" && this.state.phase !== "offsetObject")
      return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.pickLine(
      {
        screen: ctx.viewport.worldToScreen(point),
        world: point,
        point,
        snap: null,
        tracking: null,
        button: 0,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      },
      ctx
    )
    return true
  }

  /** Enter at `Select a line object:` ends the command (xline/x08). */
  onEnter(): boolean {
    return false
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "reference" || state.phase === "offsetObject") {
      return state.hover ? rollover(ctx, state.hover) : []
    }
    const cursor = this.cursor
    if (!cursor) return []
    const ghost = this.xlineAt(cursor, ctx)
    if (!ghost) return []
    // The dashed rubber band from the base or the vertex (the trace's
    // UseDashedLine; desktop d04, d06).
    const from =
      state.phase === "through"
        ? state.base
        : state.phase === "end"
          ? state.vertex
          : null
    return [
      ...entityScenePrimitive(ctx.viewport, ghost, {
        color: currentColor(ctx),
        width: 1,
      }),
      ...(from ? [rubberBand(ctx, from, cursor)] : []),
    ]
  }

  /**
   * The xline a point would make where the run is: what a click commits and
   * the jig draws (desktop d04–d07); none where the point makes none.
   */
  private xlineAt(point: Vec3, ctx: ToolContext): Entity | null {
    const layer = ctx.document.getCurrentLayerId()
    const state = this.state
    switch (state.phase) {
      case "through":
        return createXline(
          state.base,
          sub3(point, state.base),
          layer,
          PREVIEW_ID
        )
      case "fixed":
        return createXline(point, state.fixed.direction, layer, PREVIEW_ID)
      case "end":
        return createXline(
          state.vertex,
          bisector(sub3(state.start, state.vertex), sub3(point, state.vertex)),
          layer,
          PREVIEW_ID
        )
      case "offsetSide":
        return offsetXline(state.source, state.distance, point, layer)
      case "offsetThrough":
        return createXline(point, state.source.direction, layer, PREVIEW_ID)
      default:
        return null
    }
  }

  /** A point clicked or typed, at whichever point prompt is asked. */
  private placePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "first":
        this.state = { phase: "through", base: point }
        this.openPoint(ctx)
        return
      case "vertex":
        this.state = { phase: "start", vertex: point }
        this.openPoint(ctx)
        return
      case "start":
        if (V.distance(point, state.vertex) === 0) {
          ctx.report(ctx.text.message("startPointMustDiffer"), "error")
          return
        }
        this.state = { phase: "end", vertex: state.vertex, start: point }
        this.openPoint(ctx)
        return
      case "through": {
        const d = sub3(point, state.base)
        if (d.x === 0 && d.y === 0 && d.z === 0) {
          // On the base (xline/x01).
          ctx.report(ctx.text.message("invalid"), "error")
          return
        }
        break
      }
      default:
        break
    }
    const made = this.xlineAt(point, ctx)
    if (!made) return
    const xline = { ...made, id: nextEntityId() }
    ctx.execute(new AddEntityCommand(withCurrentProperties(xline, ctx)))
    this.openPoint(ctx)
  }

  /** `Select a line object:`, for Reference or Offset. */
  private pickLine(input: PointerInput, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "reference" && state.phase !== "offsetObject") return
    const hit = ctx.pick(input.world)
    const line = hit && lineLike(hit)
    if (!line) {
      if (lockedObjectAt(input.screen, ctx)) {
        ctx.report(ctx.text.message("objectOnLockedLayer"), "error")
        return
      }
      // A miss too (xline/x06, x08).
      ctx.report(ctx.text.message("noUsableObjectSelected"), "error")
      return
    }
    if (state.phase === "reference") {
      this.state = {
        phase: "referenceAngle",
        reference: Math.atan2(line.direction.y, line.direction.x),
      }
      this.openAngle(ctx)
      return
    }
    this.state =
      state.distance === null
        ? { phase: "offsetThrough", source: line }
        : { phase: "offsetSide", distance: state.distance, source: line }
    this.openPoint(ctx)
  }

  private toFixed(
    direction: Vec3,
    ctx: ToolContext,
    axis = false
  ): CommandOptionOutcome {
    this.state = { phase: "fixed", fixed: { direction, axis } }
    this.openPoint(ctx)
    return "continue"
  }

  private toOffsetObject(distance: number | null, ctx: ToolContext): void {
    this.state = { phase: "offsetObject", distance, hover: null }
    this.openPick(ctx)
  }

  /** OFFSETDIST, which OFFSET shares: negative is Through. */
  private offsetDistance(): number {
    return this.ctxDistance
  }

  private ctxDistance = -1

  private openPoint(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          // Enter: the vertex and the start are `Invalid point.`
          // (xline/x09); elsewhere the run ends.
          if (this.state.phase === "vertex" || this.state.phase === "start") {
            commitCtx.report(commitCtx.text.message("invalidPoint"), "error")
            return true
          }
          return false
        }
        if (!isCoordinateExpression(text)) return false
        const point = parseCoordinate(text, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.placePoint(point, commitCtx)
        return true
      },
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
    ctx.requestRender()
  }

  private openPick(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
    ctx.requestRender()
  }

  /** Ang's angle or Reference's, typed, two points, or Enter's 0. */
  private openAngle(ctx: ToolContext): void {
    const commit = (commitCtx: ToolContext): boolean => {
      const text = commitCtx.dynamicInput.getText("angle").trim()
      const degrees = text === "" ? 0 : parseAngleDegrees(text)
      if (degrees === null) return false
      const state = this.state
      if (state.phase === "angle") {
        const along = directionFromUcsHeading(commitCtx.ucs, degrees)
        this.toFixed({ x: along.x, y: along.y, z: 0 }, commitCtx)
        return true
      }
      if (state.phase === "referenceAngle") {
        const radians = state.reference + (degrees * Math.PI) / 180
        this.toFixed(
          { x: Math.cos(radians), y: Math.sin(radians), z: 0 },
          commitCtx
        )
        return true
      }
      return false
    }
    ctx.dynamicInput.open({
      fields: [{ id: "angle", prompt: "angle", kind: "angle" }],
      commit: (_values, commitCtx) => commit(commitCtx),
      commitRaw: (commitCtx) => commit(commitCtx),
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  /** Offset's distance: typed, two points, Enter's OFFSETDIST, or Through. */
  private openDistance(ctx: ToolContext): void {
    this.ctxDistance = ctx.held("OFFSETDIST").read()
    const take = (distance: number, commitCtx: ToolContext): boolean => {
      if (!(distance > 0)) {
        // xline/x08: said, and asked again.
        commitCtx.report(commitCtx.text.message("positiveNonzero"), "error")
        return true
      }
      commitCtx.held("OFFSETDIST").write(distance)
      this.ctxDistance = distance
      this.toOffsetObject(distance, commitCtx)
      return true
    }
    ctx.dynamicInput.open({
      fields: [{ id: "distance", prompt: "offsetDistance", kind: "distance" }],
      commit: (values, commitCtx) => take(values.distance, commitCtx),
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        const distance = this.offsetDistance()
        if (distance < 0) {
          this.toOffsetObject(null, commitCtx)
          return true
        }
        return take(distance, commitCtx)
      },
    })
    const distance = this.offsetDistance()
    if (distance >= 0) ctx.dynamicInput.setDefault("distance", distance)
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }
}

/** The dashed line from `from` to the cursor. */
export function rubberBand(
  ctx: ToolContext,
  from: Vec3,
  cursor: Vec3
): ScenePrimitive {
  return {
    kind: "segment",
    a: ctx.viewport.worldToScreen(from),
    b: ctx.viewport.worldToScreen(cursor),
    stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
  }
}

/**
 * What `Select a line object:` takes: a LINE, an XLINE or a RAY, as its base
 * and direction; a polyline, a circle or nothing is `No usable object
 * selected` (xline/x06).
 */
function lineLike(entity: Entity): LineLike | null {
  if (isInfiniteLine(entity)) {
    return { base: infiniteBase(entity), direction: infiniteDirection(entity) }
  }
  if (entity.type !== "line") return null
  const base = { ...entity.start, z: lineStartZ(entity) }
  const direction = sub3({ ...entity.end, z: lineEndZ(entity) }, base)
  const length = Math.hypot(direction.x, direction.y, direction.z)
  if (!(length > 0)) return null
  return {
    base,
    direction: {
      x: direction.x / length,
      y: direction.y / length,
      z: direction.z / length,
    },
  }
}

/**
 * The xline at `distance` from `source` on the side of `side`: based at the
 * source's base moved square across (xline/x09: a line's start, an xline's
 * base), the left of its direction where the side is on it.
 */
function offsetXline(
  source: LineLike,
  distance: number,
  side: Vec2,
  layer: string
): Entity | null {
  const across = V.normalize(V.perpendicular(source.direction))
  if (V.lengthSq(across) === 0) return null
  const toward = V.dot(V.sub(side, source.base), across) < 0 ? -1 : 1
  const shift = V.scale(across, toward * distance)
  return createXline(
    {
      x: source.base.x + shift.x,
      y: source.base.y + shift.y,
      z: source.base.z,
    },
    source.direction,
    layer,
    PREVIEW_ID
  )
}

/**
 * The direction halfway between two: the sum of their unit vectors, or,
 * where they point apart, the start's turned a right angle anticlockwise
 * (xline/x04: start 0°, end 180° gives 90°).
 */
function bisector(start: Vec3, end: Vec3): Vec3 {
  const unit = (v: Vec3) => {
    const length = Math.hypot(v.x, v.y, v.z)
    return length > 0
      ? { x: v.x / length, y: v.y / length, z: v.z / length }
      : null
  }
  const a = unit(start)
  const b = unit(end) ?? a
  if (!a || !b) return { x: 1, y: 0, z: 0 }
  const sum = { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
  if (Math.hypot(sum.x, sum.y, sum.z) > 1e-12) return sum
  return { x: -a.y, y: a.x, z: 0 }
}
