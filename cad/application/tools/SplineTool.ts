import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import { KnotParameterization } from "../../geometry/nurbs"
import {
  DEFAULT_SPLINE_DEGREE,
  MAX_SPLINE_DEGREE,
  SplineEntity,
  SplineMethod,
  createSpline,
  onPlaneOf,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
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
  Tool,
  ToolContext,
} from "./Tool"
import { directionFromUcsHeading, headingInUcs } from "./ucsHeading"

/**
 * The points picked so far and what has been said about their ends. The points
 * lie on the first one's plane: a SPLINE is flat until the kernel has 3D NURBS.
 */
interface Drawn {
  readonly points: readonly Vec3[]
  readonly startTangent: Vec2 | null
  readonly endTangent: Vec2 | null
  readonly closed: boolean
}

type SplineToolState =
  | { readonly phase: "first" }
  | { readonly phase: "method" }
  | { readonly phase: "knots" }
  | { readonly phase: "degree" }
  | ({ readonly phase: "next" } & Drawn)
  | ({ readonly phase: "startTangent" } & Drawn)
  | ({ readonly phase: "endTangent" } & Drawn)
  | ({ readonly phase: "closeTangent" } & Drawn)

type DrawingState = Extract<SplineToolState, Drawn>

const KNOTS_BY_KEYWORD: Record<string, KnotParameterization> = {
  Chord: "chord",
  "Square root": "sqrtChord",
  Uniform: "uniform",
}

const RUBBER: StrokeStyle = { color: THEME.rubberBand, width: 1 }
const FRAME: StrokeStyle = { color: THEME.crosshair, width: 1 }

/**
 * AutoCAD's SPLINE. The curve accumulates in the tool and becomes one object
 * when the command ends — Enter, Close, or the end tangent — so the whole
 * spline is one undo step, and Escape discards it, as AutoCAD's does.
 *
 * Method, Knots and Degree are SPLMETHOD, SPLKNOTS and SPLDEGREE: "Not-saved",
 * so they live on the tool for the session and the next spline starts from the
 * last one's settings. toLerance and Object are not offered (see
 * `docs/autocad-coverage.md`).
 */
export class SplineTool implements Tool {
  readonly id = "spline"

  private method: SplineMethod = "fit"
  private knots: KnotParameterization = "chord"
  private degree = DEFAULT_SPLINE_DEGREE

  private state: SplineToolState = { phase: "first" }
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.enterFirst(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.commitPending(ctx)
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  onKeyDown(input: KeyInput): void {
    if (input.key === "Escape") this.state = { phase: "first" }
  }

  onEnter(ctx: ToolContext): boolean {
    return this.acceptDefault(ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    const state = this.state
    if (state.phase === "next") {
      const offset = V.sub(input.point, lastPoint(state))
      const length = V.length(offset)
      ctx.dynamicInput.setLive("distance", length)
      ctx.dynamicInput.setLive(
        "angle",
        length > 1e-9 ? headingInUcs(ctx.ucs, offset) : null
      )
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    this.placePoint(
      this.state.phase === "next"
        ? this.resolveNext(this.state, input.point, ctx)
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
      case "next": {
        const count = state.points.length
        if (this.method === "cv") {
          return count >= 2 ? [{ id: "Close" }, { id: "Undo" }] : []
        }
        if (count === 1) return [{ id: "start Tangency" }]
        return count === 2
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
        this.method = id === "CV" ? "cv" : "fit"
        this.enterFirst(ctx)
        return "continue"
      case "knots": {
        const knots = KNOTS_BY_KEYWORD[id]
        if (!knots) return "unhandled"
        this.knots = knots
        this.enterFirst(ctx)
        return "continue"
      }
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
        this.state = { ...state, phase: "endTangent" }
        this.openPointInput(ctx, "splineEndTangent")
        return "continue"
      case "Undo":
        this.state = { ...state, points: state.points.slice(0, -1) }
        this.openNextInput(ctx)
        ctx.requestRender()
        return "continue"
      case "Close":
        if (this.method === "cv") {
          this.state = { ...state, closed: true }
          return "end"
        }
        // A fit spline asks for the one tangent at the closure, which replaces
        // any start tangent; Enter leaves it periodic.
        this.state = {
          ...state,
          phase: "closeTangent",
          closed: true,
          startTangent: null,
        }
        this.openPointInput(ctx, "splineCloseTangent")
        ctx.requestRender()
        return "continue"
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
      case "closeTangent":
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
    if (state.phase === "startTangent" || state.phase === "closeTangent") {
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
          { ...state, endTangent: V.sub(cursor, lastPoint(state)) },
          ctx
        )
      case "closeTangent":
        return this.splineOf(
          { ...state, startTangent: V.sub(cursor, state.points[0]) },
          ctx
        )
    }
  }

  private splineOf(drawn: Drawn, ctx: ToolContext): SplineEntity {
    return onPlaneOf(
      createSpline(this.method, drawn.points, {
        degree: this.degree,
        knots: this.knots,
        closed: drawn.closed,
        startTangent: drawn.startTangent ?? undefined,
        endTangent: drawn.endTangent ?? undefined,
        layerId: ctx.document.getCurrentLayerId(),
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
        }
        this.openNextInput(ctx)
        break
      case "next":
        if (V.equals(point, lastPoint(state))) return
        this.state = {
          ...state,
          points: [...state.points, withZOf(point, state.points[0])],
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
      case "endTangent": {
        const direction = V.sub(point, lastPoint(state))
        if (V.length(direction) > 1e-9) {
          this.state = { ...state, endTangent: direction }
        }
        ctx.endCommand()
        return
      }
      case "closeTangent": {
        const direction = V.sub(point, state.points[0])
        this.state = {
          ...state,
          startTangent: V.length(direction) > 1e-9 ? direction : null,
        }
        ctx.endCommand()
        return
      }
      default:
        return
    }
    ctx.requestRender()
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
    this.state = { phase: "first" }
    ctx.execute(new AddEntityCommand(spline))
  }

  private enterFirst(ctx: ToolContext): void {
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
      if (this.acceptDefault(ctx)) return true
      ctx.endCommand()
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor()
    const point = parseCoordinate(text, {
      lastPoint: base,
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
    if (!(distance > 0) || !Number.isFinite(angle)) return
    const last = lastPoint(state)
    this.placePoint(
      withZOf(
        V.add(last, V.scale(directionFromUcsHeading(ctx.ucs, angle), distance)),
        last
      ),
      ctx
    )
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
    const offset = V.sub(cursor, start)
    const distance = typedDistance ?? V.length(offset)
    const angle =
      typedAngle ??
      (V.length(offset) > 1e-9 ? headingInUcs(ctx.ucs, offset) : null)
    if (angle === null) return cursor
    return withZOf(
      V.add(start, V.scale(directionFromUcsHeading(ctx.ucs, angle), distance)),
      start
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
    ctx.dynamicInput.setLive("degree", this.degree)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitDegree(value: number, ctx: ToolContext): void {
    if (!Number.isInteger(value) || value < 1 || value > MAX_SPLINE_DEGREE) {
      return
    }
    this.degree = value
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

function typedNumber(ctx: ToolContext, id: string): number | null {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
