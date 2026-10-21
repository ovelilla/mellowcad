import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import { KnotParameterization } from "../../geometry/nurbs"
import {
  DEFAULT_SPLINE_DEGREE,
  type Entity,
  MAX_SPLINE_DEGREE,
  SplineEntity,
  SplineMethod,
  createSpline,
  onPlaneOf,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import { SnapType } from "../snapping/types"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  type RibbonMacro,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"
import { acuteHeading, headingInUcs } from "./ucsHeading"
import { pointAlongCursor, showRise } from "./directDistance"
import {
  type CurrentProperties,
  currentProperties,
  wearingProperties,
} from "./currentProperties"
import { defersOn } from "./deferredSnap"

/**
 * The points picked so far and what has been said about their ends. The points
 * lie on the first one's plane: a SPLINE is flat until the kernel has 3D NURBS
 * (AutoCAD 2027 keeps each point's Z, probes spline/p200, p265).
 */
interface Drawn {
  readonly points: readonly Vec3[]
  readonly startTangent: Vec2 | null
  readonly endTangent: Vec2 | null
  readonly closed: boolean
  /**
   * The current layer and properties as they stood when the spline first
   * held two points, which it wears whatever is set later, Undo back to one
   * point included (probes spline/p227, p228, p232, p277). Null before: it
   * also tells the first point's prompt from the one Undo leaves at one
   * point, which keeps the second point's (p125, p128).
   */
  readonly properties: CurrentProperties | null
}

type SplineToolState =
  | { readonly phase: "first" }
  | { readonly phase: "method" }
  | { readonly phase: "knots" }
  | { readonly phase: "degree" }
  | ({ readonly phase: "next" } & Drawn)
  | ({ readonly phase: "startTangent" } & Drawn)
  | ({ readonly phase: "endTangent" } & Drawn)

type DrawingState = Extract<SplineToolState, Drawn>

/**
 * SPLMETHOD, SPLKNOTS and SPLDEGREE: program-wide (rectang/p301), one object
 * the three SPLINE tools share, so the rail's macros and the typed command
 * start from the last spline's settings (spline/p104).
 */
export interface SplineSettings {
  method: SplineMethod
  knots: KnotParameterization
  degree: number
}

/** SPLINE's settings as AutoCAD installs them: Fit, Chord, degree 3. */
export function defaultSplineSettings(): SplineSettings {
  return { method: "fit", knots: "chord", degree: DEFAULT_SPLINE_DEGREE }
}

/** The 16-bit range AutoCAD's integer input names at the Degree prompt (spline/p111). */
const INTEGER_RANGE = { min: -32768, max: 32767 }

const KNOTS_BY_KEYWORD: Record<string, KnotParameterization> = {
  Chord: "chord",
  "Square root": "sqrtChord",
  Uniform: "uniform",
}

/** How the knot prompt's `<default>` names each, as `Current settings:` does. */
const KNOTS_PHRASE: Record<KnotParameterization, PromptId> = {
  chord: "knotsChord",
  sqrtChord: "knotsSquareRoot",
  uniform: "knotsUniform",
}

const RUBBER: StrokeStyle = { color: THEME.rubberBand, width: 1 }
const FRAME: StrokeStyle = { color: THEME.crosshair, width: 1 }

/**
 * AutoCAD's SPLINE. The curve accumulates in the tool and becomes one object
 * when the command ends — Enter, Close, or the end tangent — so the whole
 * spline is one undo step, and Escape discards it, as AutoCAD's does.
 *
 * Method, Knots and Degree are {@link SplineSettings}, which `Current
 * settings:` reports at the start and after each change. toLerance and Object
 * are not offered (see `docs/coverage/draw.md`). The rail's Spline Fit and
 * Spline CV are this tool run as the ribbon's macros
 * ({@link SplineTool.ribbonMacro}).
 */
export class SplineTool implements Tool {
  readonly id: string

  private state: SplineToolState = { phase: "first" }
  private cursor: Vec3 | null = null
  /** The cursor unsnapped, where a deferred Tangent's object is picked. */
  private pickWorld: Vec2 | null = null
  private lastScreen: Vec2 | null = null

  constructor(
    id = "spline",
    private readonly macroMethod: SplineMethod | null = null,
    private readonly settings: SplineSettings = defaultSplineSettings()
  ) {
    this.id = id
  }

  private get method(): SplineMethod {
    return this.settings.method
  }

  private get knots(): KnotParameterization {
    return this.settings.knots
  }

  private get degree(): number {
    return this.settings.degree
  }

  /**
   * The ribbon's Spline Fit and Spline CV (acad.cuix, Home > Draw):
   * `^C^C_^RSPLINE _M _FIT` and `^C^C_^RSPLINE _M _CV`. WHY no typed names
   * for them: AutoCAD has none, and the bare SPLINE keeps the method last
   * used (SPLINE-D7).
   */
  ribbonMacro(): RibbonMacro | null {
    if (this.macroMethod === null) return null
    return {
      command: "SPLINE",
      answers: ["_m", this.macroMethod === "cv" ? "_cv" : "_fit"],
    }
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.enterFirst(ctx)
  }

  /** WHY no toLerance or Object: they are not offered, so not listed. */
  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "first":
        return "specifyFirstPointOr"
      case "method":
        return "enterSplineCreationMethod"
      case "knots":
        return {
          id: "enterKnotParameterization",
          enter: KNOTS_PHRASE[this.knots],
        }
      case "degree":
        return { id: "enterDegreeOfSpline", enter: { count: this.degree } }
      case "next":
        // WHY three ids for one English text: Spanish words the question
        // after two points otherwise (`Precise el punto siguiente o`, 57995,
        // CV 57493), which Undo back to one point keeps (p125, p128).
        if (state.points.length <= 2 && twoGiven(state)) {
          return "enterThirdPointOr"
        }
        return this.commandOptions().length > 0
          ? "enterNextPointOr"
          : "enterNextPoint"
      case "startTangent":
        return "specifyStartTangent"
      case "endTangent":
        return "specifyEndTangent"
    }
  }

  /**
   * The degree is a 16-bit integer (spline/p111); the method and the knots,
   * keywords. CV's one-point prompt declares no keyword, yet refuses as one
   * that does (spline/p127, p138).
   */
  takes(): QuestionInput | null {
    const state = this.state
    switch (state.phase) {
      case "degree":
        return {
          refusal: "requiresIntegerBetweenOrKeyword",
          values: INTEGER_RANGE,
        }
      case "method":
      case "knots":
        return "keyword"
      case "next":
        return this.commandOptions().length === 0
          ? { refusal: "pointOrKeywordRequired" }
          : null
      default:
        return null
    }
  }

  /** CV's one-point prompt is a point prompt for all its own refusal says. */
  setsLastPoint(): boolean | null {
    return this.state.phase === "next" && this.commandOptions().length === 0
      ? true
      : null
  }

  /**
   * A Tangent or Perpendicular at the first point measures from LASTPOINT
   * (probes spline/p242, p243, p274).
   */
  snapsFromLastPoint(): boolean {
    return this.state.phase === "first"
  }

  /**
   * The end tangent's Tangent is deferred on a circle or an arc: the tool
   * works the direction out ({@link endTangentAt}), an end inside the
   * circle taken too (probe spline/p272). WHY not on other objects:
   * unprobed, so they keep the ordinary Tangent from the last point.
   */
  defersSnap(
    kind: SnapType.Tangent | SnapType.Perpendicular,
    entity: Entity | null
  ): boolean {
    return (
      this.state.phase === "endTangent" &&
      kind === SnapType.Tangent &&
      defersOn(kind, entity)
    )
  }

  snapMarker(
    kind: SnapType.Tangent | SnapType.Perpendicular,
    entity: Entity
  ): "deferred" | null {
    return this.defersSnap(kind, entity) ? "deferred" : null
  }

  defaultOption(): string | null {
    switch (this.state.phase) {
      case "method":
        return this.method === "cv" ? "CV" : "Fit"
      default:
        return null
    }
  }

  onDeactivate(ctx: ToolContext): void {
    this.commitPending(ctx)
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  onKeyDown(input: KeyInput): void {
    if (input.key === "Escape") this.state = { phase: "first" }
  }

  /**
   * The first prompt refuses Enter in its words and asks again (AllowNone
   * false, probe spline/p106; desktop d05); elsewhere {@link acceptDefault}.
   */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "first") {
      ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
      return true
    }
    return this.acceptDefault(ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    this.pickWorld = input.world
    const state = this.state
    if (state.phase === "next") {
      const offset = V.sub(input.point, lastPoint(state))
      const length = V.length(offset)
      if (!showRise(ctx, lastPoint(state), input.point)) {
        ctx.dynamicInput.setLive("distance", length)
        ctx.dynamicInput.setLive(
          "angle",
          length > 1e-9 ? acuteHeading(headingInUcs(ctx.ucs, offset)) : null
        )
      }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    if (state.phase === "endTangent") {
      this.endWith(
        state,
        this.endTangentAt(state, input.point, input.world, ctx),
        ctx
      )
      return
    }
    this.placePoint(
      state.phase === "next"
        ? this.resolveNext(state, input.point, ctx)
        : input.point,
      ctx
    )
  }

  commandOptions(): readonly CommandOption[] {
    const state = this.state
    switch (state.phase) {
      case "first":
        return this.method === "fit"
          ? [{ id: "Method" }, { id: "Knots" }]
          : [{ id: "Method" }, { id: "Degree" }]
      case "method":
        return [{ id: "Fit" }, { id: "CV" }]
      case "knots":
        return Object.keys(KNOTS_BY_KEYWORD).map((id) => ({ id }))
      case "degree":
        // Declared, unlisted, each back at the first prompt (spline/p153,
        // p154, p155): Object too, which is not built.
        return [
          { id: "Method", hidden: true },
          { id: "Degree", hidden: true },
          { id: "Object", hidden: true },
        ]
      case "next": {
        const count = state.points.length
        const second = count >= 2 || twoGiven(state)
        if (this.method === "cv") {
          if (!second) return []
          return count <= 2
            ? [{ id: "Undo" }]
            : [{ id: "Close" }, { id: "Undo" }]
        }
        if (!second) return [{ id: "start Tangency" }]
        return count <= 2
          ? [{ id: "end Tangency" }, { id: "Undo" }]
          : [{ id: "end Tangency" }, { id: "Undo" }, { id: "Close" }]
      }
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    switch (state.phase) {
      case "first":
        return this.invokeFirstOption(id, ctx)
      case "method":
        if (id !== "Fit" && id !== "CV") return "unhandled"
        this.settings.method = id === "CV" ? "cv" : "fit"
        this.enterFirst(ctx)
        return "continue"
      case "knots": {
        const knots = KNOTS_BY_KEYWORD[id]
        if (!knots) return "unhandled"
        this.settings.knots = knots
        this.enterFirst(ctx)
        return "continue"
      }
      case "degree":
        if (id !== "Method" && id !== "Degree" && id !== "Object") {
          return "unhandled"
        }
        this.enterFirst(ctx)
        return "continue"
      case "next":
        return this.invokeNextOption(state, id, ctx)
      default:
        return "unhandled"
    }
  }

  private invokeFirstOption(
    id: string,
    ctx: ToolContext
  ): CommandOptionOutcome {
    switch (id) {
      case "Method":
        this.state = { phase: "method" }
        this.openKeywordPrompt(ctx)
        return "continue"
      case "Knots":
        if (this.method !== "fit") return "unhandled"
        this.state = { phase: "knots" }
        this.openKeywordPrompt(ctx)
        return "continue"
      case "Degree":
        if (this.method !== "cv") return "unhandled"
        this.state = { phase: "degree" }
        this.openDegreeInput(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  private invokeNextOption(
    state: Extract<SplineToolState, { phase: "next" }>,
    id: string,
    ctx: ToolContext
  ): CommandOptionOutcome {
    const offered = this.commandOptions().some((option) => option.id === id)
    if (!offered) return "unhandled"
    switch (id) {
      case "start Tangency":
        this.state = { ...state, phase: "startTangent" }
        this.openPointInput(ctx, "splineStartTangent")
        return "continue"
      case "end Tangency":
        // At one point, after Undo, the desktop asks the same prompt again
        // (spline/d12; the console's p148 asks the tangent).
        if (state.points.length < 2) {
          this.openNextInput(ctx)
          return "continue"
        }
        this.state = { ...state, phase: "endTangent" }
        this.openPointInput(ctx, "splineEndTangent")
        return "continue"
      case "Undo":
        // WHY no refusal at one point, against the rule for an Undo keyword:
        // AutoCAD takes it there and does nothing, silently (spline/p125,
        // p128, p146).
        if (state.points.length > 1) {
          this.state = { ...state, points: state.points.slice(0, -1) }
        }
        this.openNextInput(ctx)
        ctx.requestRender()
        return "continue"
      case "Close":
        // Periodic, and the end of the command: AutoCAD 2027 asks no tangent
        // at the closure, whatever its older `Specify tangent:` suggests
        // (spline/p124, p129, p303).
        this.state = { ...state, closed: true, startTangent: null }
        return "end"
      default:
        return "unhandled"
    }
  }

  getConstraintAnchor(): Vec2 | null {
    const state = this.state
    switch (state.phase) {
      case "next":
      case "endTangent":
        return lastPoint(state)
      case "startTangent":
        return state.points[0]
      default:
        return null
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    const cursor = this.cursor
    if (!cursor || !("points" in state)) return []
    const out: ScenePrimitive[] = []
    const segment = (a: Vec2, b: Vec2): ScenePrimitive => ({
      kind: "segment",
      a: ctx.viewport.worldToScreen(a),
      b: ctx.viewport.worldToScreen(b),
      stroke: RUBBER,
    })
    const preview = this.previewOf(state, cursor, ctx)
    if (this.method === "cv") {
      const frame = preview.closed
        ? [...preview.points, preview.points[0]]
        : preview.points
      out.push({
        kind: "path",
        points: frame.map((p) => ctx.viewport.worldToScreen(p)),
        closed: false,
        stroke: FRAME,
      })
    }
    if (preview.points.length >= 2) {
      out.push(...entityScenePrimitive(ctx.viewport, preview, RUBBER))
    }
    if (state.phase === "startTangent") {
      out.push(segment(state.points[0], cursor))
    } else if (state.phase === "endTangent") {
      out.push(segment(lastPoint(state), cursor))
    }
    return out
  }

  /** What the spline would be if the cursor were the answer to the current prompt. */
  private previewOf(
    state: DrawingState,
    cursor: Vec3,
    ctx: ToolContext
  ): SplineEntity {
    switch (state.phase) {
      case "next":
        return this.splineOf(
          {
            ...state,
            points: [
              ...state.points,
              withZOf(this.resolveNext(state, cursor, ctx), state.points[0]),
            ],
          },
          ctx
        )
      case "startTangent":
        return this.splineOf(
          { ...state, startTangent: V.sub(cursor, state.points[0]) },
          ctx
        )
      case "endTangent":
        return this.splineOf(
          {
            ...state,
            endTangent: this.endTangentAt(
              state,
              cursor,
              this.pickWorld ?? cursor,
              ctx
            ),
          },
          ctx
        )
    }
  }

  /**
   * The end tangent a point at the end tangent's prompt gives, `world` the
   * cursor unsnapped. Under a Tangent on a circle or an arc, AutoCAD's
   * deferred one: the tangent where the circle is nearest the spline's end,
   * pointing the pick's way (probes spline/p250, p262, p263, p270, p272,
   * p273); else the point's offset from the end.
   */
  private endTangentAt(
    state: DrawingState,
    point: Vec3,
    world: Vec2,
    ctx: ToolContext
  ): Vec2 {
    const end = lastPoint(state)
    if (ctx.snapOverride() === SnapType.Tangent) {
      const entity = ctx.pick(world, ctx.pickTolerance())
      if (defersOn(SnapType.Tangent, entity) && entity.type !== "line") {
        const radial = V.sub(end, entity.center)
        if (V.length(radial) > 1e-9) {
          const along = V.perpendicular(V.normalize(radial))
          return V.dot(along, V.sub(world, end)) < 0
            ? V.scale(along, -1)
            : along
        }
      }
    }
    return V.sub(point, end)
  }

  private splineOf(drawn: Drawn, ctx: ToolContext): SplineEntity {
    return onPlaneOf(
      createSpline(this.method, drawn.points, {
        degree: this.degree,
        knots: this.knots,
        closed: drawn.closed,
        startTangent: drawn.startTangent ?? undefined,
        endTangent: drawn.endTangent ?? undefined,
        layerId: drawn.properties?.layerId ?? ctx.document.getCurrentLayerId(),
      }),
      drawn.points[0]
    )
  }

  /** A pick or a typed point, answering whichever point prompt is open. */
  private placePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "first":
        this.state = {
          phase: "next",
          points: [point],
          startTangent: null,
          endTangent: null,
          closed: false,
          properties: null,
        }
        this.openNextInput(ctx)
        break
      case "next":
        if (V.equals(point, lastPoint(state))) return
        this.state = {
          ...state,
          points: [...state.points, withZOf(point, state.points[0])],
          properties: state.properties ?? currentProperties(ctx),
        }
        this.openNextInput(ctx)
        break
      case "startTangent": {
        const direction = V.sub(point, state.points[0])
        this.state = {
          ...state,
          phase: "next",
          startTangent: V.length(direction) > 1e-9 ? direction : null,
        }
        this.openNextInput(ctx)
        break
      }
      case "endTangent":
        this.endWith(state, V.sub(point, lastPoint(state)), ctx)
        return
      default:
        return
    }
    ctx.requestRender()
  }

  /**
   * The end tangent given, and the end of the command. LASTPOINT stays the
   * last fit point, not the tangent's (probes spline/p210, p220).
   */
  private endWith(
    state: Extract<SplineToolState, { phase: "endTangent" }>,
    direction: Vec2,
    ctx: ToolContext
  ): void {
    if (V.length(direction) > 1e-9) {
      this.state = { ...state, endTangent: direction }
    }
    ctx.setLastPoint(lastPoint(state))
    ctx.endCommand()
  }

  /**
   * Enter with nothing typed: the `<default>` of a sub-prompt (the current
   * setting, a computed tangent, a periodic closure), or the end of the
   * command at a point prompt. Returns whether the command carries on.
   */
  private acceptDefault(ctx: ToolContext): boolean {
    const state = this.state
    switch (state.phase) {
      case "method":
      case "knots":
      case "degree":
        this.enterFirst(ctx)
        return true
      case "startTangent":
        this.state = { ...state, phase: "next" }
        this.openNextInput(ctx)
        return true
      default:
        return false
    }
  }

  private commitPending(ctx: ToolContext): void {
    const state = this.state
    if (!("points" in state) || state.points.length < 2) return
    const spline = this.splineOf(state, ctx)
    const properties = state.properties ?? currentProperties(ctx)
    this.state = { phase: "first" }
    ctx.execute(new AddEntityCommand(wearingProperties(spline, properties)))
  }

  /** The first point's prompt, after the settings it starts from. */
  private enterFirst(ctx: ToolContext): void {
    ctx.report(
      this.method === "cv"
        ? ctx.text.message("splineSettingsCv", { degree: this.degree })
        : ctx.text.message("splineSettingsFit", { knots: this.knots })
    )
    this.state = { phase: "first" }
    this.openPointInput(ctx, "firstPoint")
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
    const text = ctx.dynamicInput.getText("point").trim()
    if (text.length === 0) {
      if (!this.onEnter(ctx)) ctx.endCommand()
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor()
    const point = parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: base !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.placePoint(point, ctx)
    return true
  }

  /** The next point, asked as LINE and PLINE ask it: a length and an angle from the last one. */
  private openNextInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [
        { id: "distance", prompt: "length", kind: "distance" },
        { id: "angle", prompt: "angle", kind: "angle" },
      ],
      commit: (values, commitCtx) => this.commitNext(values, commitCtx),
      commitRaw: (commitCtx) => this.commitRawNext(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitNext(values: Record<string, number>, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "next") return
    if (this.nothingTyped(ctx)) {
      ctx.endCommand()
      return
    }
    const { distance, angle } = values
    // A negative length runs backwards along the cursor, as LINE's
    // (spline/p117); 0 gives the last point, which is asked again.
    if (!Number.isFinite(distance)) return
    const last = lastPoint(state)
    const next = pointAlongCursor(ctx, last, this.cursor ?? last, {
      distance,
      angle: Number.isFinite(angle) ? angle : null,
    })
    if (next) this.placePoint(next, ctx)
  }

  private commitRawNext(ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase !== "next") return false
    if (this.nothingTyped(ctx)) {
      ctx.endCommand()
      return true
    }
    const text = ctx.dynamicInput.getText("distance").trim()
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: lastPoint(state),
      relativeByDefault: true,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.placePoint(point, ctx)
    return true
  }

  private nothingTyped(ctx: ToolContext): boolean {
    return (
      ctx.dynamicInput.getText("distance").trim() === "" &&
      ctx.dynamicInput.getText("angle").trim() === ""
    )
  }

  /** The next point with a typed length or angle hard-locking the cursor's, as LINE's does. */
  private resolveNext(
    state: DrawingState,
    cursor: Vec3,
    ctx: ToolContext
  ): Vec3 {
    const start = lastPoint(state)
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
    const typedDistance = typedNumber(ctx, "distance")
    const typedAngle = typedNumber(ctx, "angle")
    if (typedDistance === null && typedAngle === null) return cursor
    return (
      pointAlongCursor(ctx, start, cursor, {
        distance: typedDistance,
        angle: typedAngle,
      }) ?? cursor
    )
  }

  private openDegreeInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "degree", prompt: "splineDegree", kind: "number" }],
      commit: (values, commitCtx) =>
        this.commitDegree(values.degree, commitCtx),
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.getText("degree").trim() !== "") {
          return false
        }
        this.enterFirst(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault("degree", this.degree)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * A whole number outside 1–10 is asked again silently; anything else that
   * is no 16-bit integer refused in its words (spline/p111).
   */
  private commitDegree(value: number, ctx: ToolContext): void {
    if (
      !Number.isInteger(value) ||
      value < INTEGER_RANGE.min ||
      value > INTEGER_RANGE.max
    ) {
      ctx.report(
        ctx.text.message("requiresIntegerBetweenOrKeyword", INTEGER_RANGE),
        "error"
      )
      return
    }
    if (value < 1 || value > MAX_SPLINE_DEGREE) return
    this.settings.degree = value
    this.enterFirst(ctx)
  }

  /** A keyword-only prompt: the options are chips, typed and confirmed; Enter keeps the current one. */
  private openKeywordPrompt(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }
}

function lastPoint(state: Drawn): Vec3 {
  return state.points[state.points.length - 1]
}

/** Whether a second point was given, whatever Undo took back since. */
function twoGiven(state: Drawn): boolean {
  return state.properties !== null
}

function typedNumber(ctx: ToolContext, id: string): number | null {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
