import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { arcFrom3Points, normalizeAngle } from "../../geometry/primitives"
import {
  ArcEntity,
  EntityId,
  createArc,
  onPlaneOf,
} from "../../domain/entities"
import { LayerId } from "../../domain/layers"
import { AddEntityCommand } from "../commands/entityCommands"
import type { MessageId } from "../EngineText"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  isPlanarCoordinate,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  MACRO_PAUSE,
  PointerInput,
  type RibbonMacro,
  Tool,
  ToolContext,
  type QuestionInput,
} from "./Tool"
import {
  currentColor,
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"
import { continuePoint } from "./lastDrawnPoint"

/** The ghost's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "arc-preview"

/**
 * How an arc is defined — the top of AutoCAD's ARC dropdown, each surfaced as
 * its own rail entry (a flyout) that runs ARC as the ribbon's button does
 * ({@link ArcTool.ribbonMacro}):
 *
 * - `threePoint`: start, a point on the arc, then the end (the default ARC);
 * - `startCenterEnd`: start point, centre, then the end angle;
 * - `centerStartEnd`: centre, start point, then the end angle.
 *
 * All three collect three points; only the interpretation differs, so one class
 * parameterised by {@link ArcMode} covers them.
 */
export type ArcMode = "threePoint" | "startCenterEnd" | "centerStartEnd"

/** The arc three points define, as {@link arcFromCenterStartEnd} gives it. */
interface SolvedArc {
  readonly center: Vec2
  readonly radius: number
  readonly startAngle: number
  readonly endAngle: number
}

/**
 * Why three points make no arc: AutoCAD's `*Invalid*`, after `Radius must be
 * non-zero.` for a centre on the start (probes arc/p188, p189).
 */
type NoArc = "invalid" | "zeroRadius"

type ArcToolState =
  | { readonly phase: "p1" }
  | { readonly phase: "p2"; readonly p1: Vec3; readonly cursor: Vec3 }
  | {
      readonly phase: "p3"
      readonly p1: Vec3
      readonly p2: Vec3
      readonly cursor: Vec3
    }

/**
 * The arc tool — AutoCAD's ARC. One class parameterised by {@link ArcMode},
 * registered once per mode, every one starting by three points as ARC does;
 * the start point's and the second point's `[Center]`, which a mode's macro
 * answers, switch the mode actually running. It never mutates the document:
 * the finished arc is submitted as an {@link AddEntityCommand}, so it is
 * undoable, and the command ends the moment the arc is defined (ARC is
 * single-shot in AutoCAD).
 */
export class ArcTool implements Tool {
  readonly id: string
  readonly shortcut?: string

  /** The rail's mode: the answers its macro types. */
  private readonly mode: ArcMode
  /** The mode actually running: `[Center]` switches it. */
  private active: ArcMode
  private state: ArcToolState = { phase: "p1" }
  private lastScreen: Vec2 | null = null
  /**
   * Ctrl held at the end point of a centre mode: the arc runs clockwise,
   * "hold Ctrl to switch direction".
   */
  private reversed = false

  constructor(mode: ArcMode, id: string, shortcut?: string) {
    this.mode = mode
    this.active = "threePoint"
    this.id = id
    this.shortcut = shortcut
  }

  /**
   * The ribbon's Arc buttons are ARC answered (acad.cuix): 3-Point
   * `^C^C_arc`, Start, Center, End `^C^C_arc \_c \`, Center, Start, End
   * `^C^C_arc _c` (desktop arc/d03, d04). WHY ARCSCE and ARCCSE typed run them
   * too: they are this app's names for the buttons (ARC-D3).
   */
  ribbonMacro(): RibbonMacro {
    const answers: Record<ArcMode, readonly string[]> = {
      threePoint: [],
      startCenterEnd: [MACRO_PAUSE, "_c"],
      centerStartEnd: ["_c"],
    }
    return { command: "ARC", answers: answers[this.mode] }
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.active = "threePoint"
    this.state = { phase: "p1" }
    this.openPointInput(ctx, this.promptFor("p1"))
  }

  onDeactivate(ctx: ToolContext): void {
    this.active = "threePoint"
    this.state = { phase: "p1" }
    ctx.dynamicInput.close()
  }

  /**
   * The end point's Angle and chord Length, and the second point's End, are
   * not offered, so those questions go without the `or` that introduces them.
   */
  question(): PromptId {
    switch (this.state.phase) {
      case "p1":
        return this.active === "centerStartEnd"
          ? "specifyCenterPointOfArc"
          : "specifyStartPointOfArcOr"
      case "p2":
        return this.active === "threePoint"
          ? "specifySecondPointOfArcOr"
          : this.active === "startCenterEnd"
            ? "specifyCenterPointOfArc"
            : "specifyStartPointOfArc"
      case "p3":
        return this.active === "threePoint"
          ? "specifyEndPointOfArc"
          : "specifyEndPointOfArcCtrl"
    }
  }

  /**
   * Every point after the first is a 2D one, as AutoCAD's console refuses it
   * (probes arc/p04, p05, p07, p124, p125). WHY a centre mode's end names a
   * keyword it does not offer: its `initget` declares Angle and chord Length,
   * and the console's words are the spec (p164; ARC-D2).
   */
  takes(): QuestionInput | null {
    if (this.state.phase === "p1") return null
    return this.atCentreEnd()
      ? { refusal: "point2dOrKeywordRequired" }
      : "point2d"
  }

  /** The end point given at a centre mode's end is LASTPOINT (arc/p142, p143). */
  setsLastPoint(): boolean | null {
    return this.atCentreEnd() ? true : null
  }

  /**
   * A Tangent or Perpendicular where the tool has no base measures from
   * LASTPOINT: at the first point (probes arc/p14, p15) and CSE's centre
   * (p16), and after them, where LASTPOINT is the point before (p09, p10). At
   * a centre mode's end the centre is the base (p12, p13).
   */
  snapsFromLastPoint(): boolean {
    return true
  }

  /** A centre mode's end point: the prompt with a base, and its own refusal. */
  private atCentreEnd(): boolean {
    return this.state.phase === "p3" && this.active !== "threePoint"
  }

  commandOptions(): readonly CommandOption[] {
    const center =
      (this.state.phase === "p1" && this.active !== "centerStartEnd") ||
      (this.state.phase === "p2" && this.active === "threePoint")
    return center ? [{ id: "Center" }] : []
  }

  /**
   * `[Center]` at the start point asks for the centre first (Center, Start,
   * End); after the start point, for the centre next (Start, Center, End).
   */
  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id !== "Center" || this.commandOptions().length === 0) {
      return "unhandled"
    }
    this.active =
      this.state.phase === "p1" ? "centerStartEnd" : "startCenterEnd"
    this.openPointInput(ctx, this.promptFor(this.state.phase))
    ctx.requestRender()
    return "continue"
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.reversed = input.ctrlKey
    if (this.state.phase !== "p1") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    this.reversed = input.ctrlKey
    this.advanceWithPoint(input.point, ctx, input.screen)
  }

  /**
   * Advances the point phases with a resolved world point, shared by the click
   * path and the typed-coordinate path so both behave identically.
   */
  private advanceWithPoint(point: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(point)

    switch (this.state.phase) {
      case "p1":
        this.state = { phase: "p2", p1: point, cursor: point }
        this.openPointInput(ctx, this.promptFor("p2"), at)
        break
      case "p2":
        this.state = {
          phase: "p3",
          p1: this.state.p1,
          p2: point,
          cursor: point,
        }
        this.openPointInput(ctx, this.promptFor("p3"), at)
        break
      case "p3":
        this.commit(this.state.p1, this.state.p2, point, ctx)
        return
    }
    ctx.requestRender()
  }

  /** Enter where the drawing's Enter would end ARC: {@link answerEnter}. */
  onEnter(ctx: ToolContext): boolean {
    return this.answerEnter(ctx)
  }

  /**
   * Enter at the start continues from what was drawn last, and with nothing
   * there AutoCAD says so and ARC ends (probe arc/p108). WHY it ends with
   * something to continue: Continue is not built (ARC-D4, p109). Every later
   * prompt refuses it in its own words and asks again (p113–p118).
   */
  private answerEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "p1" && this.active !== "centerStartEnd") {
      if (continuePoint(ctx.document, ctx.lastPoint) !== null) return false
      ctx.report(ctx.text.message("noLineOrArcToContinue"), "error")
      ctx.report(ctx.text.message("invalid"), "error")
      ctx.endCommand()
      return true
    }
    const keyworded =
      (this.state.phase === "p2" && this.active === "threePoint") ||
      this.atCentreEnd()
    const refusal: MessageId =
      this.state.phase === "p1"
        ? "invalidPoint"
        : keyworded
          ? "point2dOrKeywordRequired"
          : "invalidPoint2d"
    ctx.report(ctx.text.message(refusal), "error")
    return true
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.active = "threePoint"
      this.state = { phase: "p1" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  /**
   * Only a centre mode's end bends about a base, the centre. WHY none at 3P's
   * points, SCE's centre or CSE's start, though the trace gives them a base
   * point: Ortho leaves their picks alone (desktop arc/d06) and `<45` there
   * is the prompt's wrong answer (probes arc/p07, p136, p137, p139).
   */
  getConstraintAnchor(): Vec3 | null {
    return this.state.phase === "p3" && this.atCentreEnd()
      ? this.centerOf(this.state.p1, this.state.p2)
      : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    // The arc about to be made, in its colour: red with CECOLOR 1 (desktop
    // arc/d01–d04).
    const ghost = { color: currentColor(ctx), width: 1 }
    // Amber and dashed, as CIRCLE's size line (desktop arc/d02–d04).
    const rubberLine = (a: Vec2, b: Vec2): ScenePrimitive => ({
      kind: "segment",
      a: viewport.worldToScreen(a),
      b: viewport.worldToScreen(b),
      stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
    })

    switch (this.state.phase) {
      case "p2":
        // From the start at 3P's second point and SCE's centre, from the
        // centre at CSE's start.
        return [rubberLine(this.state.p1, this.state.cursor)]
      case "p3": {
        const { p1, p2, cursor } = this.state
        const arc = this.arcFor(
          p1,
          p2,
          cursor,
          ctx.document.getCurrentLayerId(),
          PREVIEW_ID
        )
        // A centre mode's end draws the line from the centre to the cursor;
        // 3P's the ghost alone (desktop arc/d02).
        const out: ScenePrimitive[] =
          this.active === "threePoint"
            ? []
            : [rubberLine(this.centerOf(p1, p2), cursor)]
        if (typeof arc === "object") {
          out.push(...entityScenePrimitive(viewport, arc, ghost))
        }
        return out
      }
      default:
        return []
    }
  }

  /** The centre point of a centre mode, in the plane of the first point. */
  private centerOf(p1: Vec3, p2: Vec3): Vec3 {
    // startCenterEnd: p2 is the centre; centerStartEnd: p1 is the centre.
    return this.active === "startCenterEnd" ? { ...p2, z: p1.z } : p1
  }

  /** The arc defined by the three points in plan, per mode, or why none. */
  private solve(p1: Vec2, p2: Vec2, p3: Vec2): SolvedArc | NoArc {
    if (this.active === "threePoint") {
      // Coincident or collinear points, the end on the start (probes arc/p17,
      // p132, p168–p170).
      const arc = arcFrom3Points(p1, p2, p3)
      return arc && arc.radius > 0 ? arc : "invalid"
    }
    const center = this.active === "startCenterEnd" ? p2 : p1
    const start = this.active === "startCenterEnd" ? p1 : p2
    const arc = arcFromCenterStartEnd(center, start, p3)
    if (typeof arc === "string") return arc
    // Clockwise is counter-clockwise from the end back to the start.
    return this.reversed
      ? { ...arc, startAngle: arc.endAngle, endAngle: arc.startAngle }
      : arc
  }

  /**
   * The arc the three points make, solved from their X and Y and lying in the
   * first point's plane, as AutoCAD's 3P does too (probes arc/p06, p152,
   * p192), or why none.
   */
  private arcFor(
    p1: Vec3,
    p2: Vec3,
    p3: Vec3,
    layerId: LayerId,
    id?: EntityId
  ): ArcEntity | NoArc {
    const solved = this.solve(p1, p2, p3)
    if (typeof solved === "string") return solved
    const arc = createArc(
      solved.center,
      solved.radius,
      solved.startAngle,
      solved.endAngle,
      layerId,
      id
    )
    return onPlaneOf(arc, p1)
  }

  /**
   * Adds the arc, or says AutoCAD's `*Invalid*` and ends ARC with nothing
   * made, LASTPOINT the point last given (probes arc/p17, p162, p188).
   */
  private commit(p1: Vec3, p2: Vec3, p3: Vec3, ctx: ToolContext): void {
    const arc = this.arcFor(p1, p2, p3, ctx.document.getCurrentLayerId())
    if (typeof arc === "string") {
      if (arc === "zeroRadius") {
        ctx.report(ctx.text.message("radiusMustBeNonZero"), "error")
      }
      ctx.report(ctx.text.message("invalid"), "error")
      ctx.endCommand()
      return
    }
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(withCurrentThickness(arc, ctx), ctx)
      )
    )
    ctx.endCommand()
  }

  private promptFor(phase: "p1" | "p2" | "p3"): PromptId {
    const prompts: Record<ArcMode, [PromptId, PromptId, PromptId]> = {
      threePoint: ["startPoint", "secondPoint", "endPoint"],
      startCenterEnd: ["startPoint", "centerPoint", "endPoint"],
      centerStartEnd: ["centerPoint", "startPoint", "endPoint"],
    }
    const index = phase === "p1" ? 0 : phase === "p2" ? 1 : 2
    return prompts[this.active][index]
  }

  /**
   * Opens a coordinate session for a point phase. Clicking places the point;
   * typing an AutoCAD coordinate (e.g. `50,20`, `@30,0`, `100<45`) and pressing
   * Enter places it precisely.
   */
  private openPointInput(
    ctx: ToolContext,
    prompt: PromptId,
    screen?: Vec2
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(screen ?? this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") return this.answerEnter(ctx)
    if (!isCoordinateExpression(text)) return false
    // The runtime refuses a Z or `*` where the question takes "point2d"; a
    // centre mode's end declares its refusal instead, so it is refused here.
    if (this.atCentreEnd() && !isPlanarCoordinate(text)) return false

    const last = this.previousPoint()
    const point = parseCoordinate(text, {
      lastPoint: last ?? ctx.lastPoint,
      relativeByDefault: last !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    // WHY the tool says it: the box reads it from the point before, which is
    // no base of the runtime's at 3P's points, SCE's centre or CSE's start.
    if (last !== null) ctx.setLastPoint(point)
    this.advanceWithPoint(point, ctx)
    return true
  }

  /**
   * The point a relative coordinate is measured from, per phase: the point
   * before, and at a centre mode's end the centre (probes arc/p126–p129).
   */
  private previousPoint(): Vec3 | null {
    switch (this.state.phase) {
      case "p2":
        return this.state.p1
      case "p3":
        return this.active === "threePoint"
          ? this.state.p2
          : this.centerOf(this.state.p1, this.state.p2)
      default:
        return null
    }
  }
}

/**
 * The arc through `start` that turns about `center` until it reaches the ray to
 * `end` — AutoCAD's Start/Center/End family. The radius comes from the start
 * point; the end point only supplies the angle to stop at, and the sweep is
 * always CCW (the tool's invariant). None for an end at the centre or on the
 * start's ray, and then for a zero radius: the ray is asked first, a centre on
 * the start having its ray at 0° (probes arc/p130, p162, p166, p188–p191).
 */
function arcFromCenterStartEnd(
  center: Vec2,
  start: Vec2,
  end: Vec2
): SolvedArc | NoArc {
  if (!(V.distance(center, end) > 0)) return "invalid"
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x)
  const endAngle = Math.atan2(end.y - center.y, end.x - center.x)
  const sweep = normalizeAngle(endAngle - startAngle)
  if (sweep < SAME_RAY || sweep > 2 * Math.PI - SAME_RAY) return "invalid"
  const radius = V.distance(center, start)
  if (!(radius > 0)) return "zeroRadius"
  return { center, radius, startAngle, endAngle }
}

/** Radians within which the end lies on the start's ray: a zero sweep. */
const SAME_RAY = 1e-10
