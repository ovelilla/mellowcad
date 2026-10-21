import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import {
  ellipseAngleFromParam,
  ellipseParamFromAngle,
  normalizeAngle,
} from "../../geometry/primitives"
import {
  carryPlane,
  createEllipse,
  ellipseRotation,
  EllipseEntity,
  onPlaneOf,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import type { MessageId } from "../EngineText"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
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
import {
  type CurrentProperties,
  currentColor,
  currentProperties,
  wearingProperties,
} from "./currentProperties"
import { pointAlongCursor, pointAtDistance, showRise } from "./directDistance"
import { acuteHeading, headingInUcs } from "./ucsHeading"

/**
 * How an ellipse is defined — the three entries of AutoCAD's Ellipse dropdown,
 * each surfaced as its own rail entry (a flyout) that runs ELLIPSE as the
 * ribbon's button does ({@link EllipseTool.ribbonMacro}), as CIRCLE and ARC
 * are:
 *
 * - `axis`: the two endpoints of one axis, then the distance to the other;
 * - `center`: the centre, one axis endpoint, then the distance to the other;
 * - `arc`: an elliptical arc — the same ellipse, then a start and an end angle.
 *
 * The one command-line ELLIPSE reaches all three through the `[Arc/Center]`
 * keywords of its first prompt, which the macros answer, which is why the
 * active mode changes after the tool starts.
 */
export type EllipseMode = "axis" | "center" | "arc"

type EllipseToolState =
  /** Awaiting the first point: an axis endpoint, or the centre. */
  | { readonly phase: "first" }
  /** Awaiting the other end of the first axis (or its only end, from the centre). */
  | { readonly phase: "second"; readonly first: Vec3; readonly cursor: Vec3 }
  /**
   * The first axis is fixed; awaiting the half-length of the other one. The
   * centre is at the first point's height, the plane the ellipse lies in. A
   * zero first axis is taken too, and refused only once the distance is given
   * (probes ellipse/p205, p206, p166).
   */
  | {
      readonly phase: "distance"
      readonly center: Vec3
      readonly semiAxis: Vec2
      readonly cursor: Vec2
    }
  /** The Rotation option: the angle a circle is turned through about the axis. */
  | {
      readonly phase: "rotation"
      readonly center: Vec3
      readonly semiAxis: Vec2
      readonly cursor: Vec2
    }
  /** The whole ellipse is fixed; awaiting the elliptical arc's start angle. */
  | {
      readonly phase: "startAngle"
      readonly ellipse: EllipseEntity
      readonly center: Vec3
      readonly cursor: Vec2
    }
  | {
      readonly phase: "endAngle"
      readonly ellipse: EllipseEntity
      readonly center: Vec3
      readonly startParam: number
      readonly cursor: Vec2
      /** Included angle: the sweep is asked instead of the end angle. */
      readonly included: boolean
    }

/** Id the provisional ellipse carries, so previewing does not mint real ones. */
const PREVIEW_ID = "__ellipse_preview__"

/**
 * Half-width of the band of rotations AutoCAD refuses: "values between 89.4
 * degrees and 90.6 degrees are invalid because the ellipse would otherwise
 * appear as a straight line", and the band repeats every 90°.
 */
const ROTATION_LIMIT_DEGREES = 89.4

/**
 * The ellipse tool — AutoCAD's ELLIPSE, as AutoCAD 2027's console answers it
 * (probes ellipse/p00–p299). One class parameterised by {@link EllipseMode},
 * registered once per mode, every one starting at ELLIPSE's first prompt. It
 * never mutates the document: the finished ellipse is submitted as an
 * {@link AddEntityCommand}, so it is undoable, and the command ends the moment
 * the ellipse is defined, LASTPOINT on its centre (p100, p109, p184).
 */
export class EllipseTool implements Tool {
  readonly id: string
  readonly shortcut?: string

  /** The rail's mode: the answer its macro types. */
  private readonly mode: EllipseMode
  /**
   * What is actually running: the Arc and Center keywords turn these on, and
   * an elliptical arc can still be started from its centre.
   */
  private arc = false
  private centered = false
  /**
   * The arc's Parameter mode: its start and end are parameters of
   * `p(u) = c + a·cos(u) + b·sin(u)`, not angles. The start prompt's choice
   * holds at the end prompt (probes ellipse/p117, p118).
   */
  private parameter = false
  /**
   * The layer and properties current when the ellipse was fixed, which an
   * elliptical arc keeps whatever is set at its angles (probes ellipse/p253,
   * p257).
   */
  private properties: CurrentProperties | null = null
  private state: EllipseToolState = { phase: "first" }
  private lastScreen: Vec2 | null = null

  constructor(mode: EllipseMode, id: string, shortcut?: string) {
    this.mode = mode
    this.id = id
    this.shortcut = shortcut
  }

  /**
   * The ribbon's Ellipse buttons are ELLIPSE answered (acad.cuix): Axis, End
   * `^C^C_ellipse`, Center `^C^C_ellipse _c`, Elliptical Arc
   * `^C^C_ellipse _a`. WHY ELLIPSEC and ELLIPSEARC typed run them too: they
   * are this app's names for the buttons, which AutoCAD knows not (probe
   * ellipse/p05; ELLIPSE-D5).
   */
  ribbonMacro(): RibbonMacro {
    const answers: Record<EllipseMode, readonly string[]> = {
      axis: [],
      center: ["_c"],
      arc: ["_a"],
    }
    return { command: "ELLIPSE", answers: answers[this.mode] }
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.restart()
    this.openPointInput(ctx, this.firstPrompt())
  }

  /** ELLIPSE as it starts: the axis mode, angles, nothing fixed. */
  private restart(): void {
    this.arc = false
    this.centered = false
    this.parameter = false
    this.properties = null
    this.state = { phase: "first" }
  }

  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "first":
        if (this.centered) {
          return this.arc
            ? "specifyCenterOfEllipticalArc"
            : "specifyCenterOfEllipse"
        }
        return this.arc
          ? "specifyAxisEndpointOfEllipticalArcOr"
          : "specifyAxisEndpointOfEllipseOr"
      case "second":
        return this.centered
          ? "specifyEndpointOfAxis"
          : "specifyOtherEndpointOfAxis"
      case "distance":
        return "specifyDistanceToOtherAxisOr"
      case "rotation":
        return "specifyRotationAroundMajorAxis"
      case "startAngle":
        return this.parameter
          ? "specifyStartParameterOr"
          : "specifyStartAngleOr"
      case "endAngle":
        if (this.state.included) {
          return { id: "specifyIncludedAngleForArc", enter: { angle: 180 } }
        }
        return this.parameter ? "specifyEndParameterOr" : "specifyEndAngleOr"
    }
  }

  /**
   * The axis's other end is a 2D point, as AutoCAD's console refuses it
   * (probe ellipse/p170); the centre mode's endpoint of axis takes a Z, which
   * the centre's plane drops (p184, p245).
   */
  takes(): QuestionInput | null {
    return this.state.phase === "second" && !this.centered ? "point2d" : null
  }

  /**
   * A Tangent or Perpendicular at the first point or the centre measures
   * from LASTPOINT (probes ellipse/p266, p267, p295).
   */
  snapsFromLastPoint(): boolean {
    return this.state.phase === "first"
  }

  /**
   * `<45` at the start or end angle (or parameter) is that angle, the end
   * prompt next (probes ellipse/p181, p292). WHY not at Rotation or Included
   * angle: unprobed there, so they keep the override every prompt has.
   */
  answersAngleOverride(): boolean {
    return (
      this.state.phase === "startAngle" ||
      (this.state.phase === "endAngle" && !this.state.included)
    )
  }

  onDeactivate(ctx: ToolContext): void {
    this.restart()
    ctx.dynamicInput.close()
  }

  private firstPrompt(): PromptId {
    return this.centered ? "center" : "axisEndpoint"
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "distance":
        this.state = { ...this.state, cursor: input.point }
        ctx.dynamicInput.setLive(
          "distance",
          V.distance(this.state.center, input.point)
        )
        break
      case "rotation":
        this.state = { ...this.state, cursor: input.point }
        ctx.dynamicInput.setLive(
          "rotation",
          this.heading(ctx, this.state.center, input.point)
        )
        break
      case "startAngle":
        this.state = { ...this.state, cursor: input.point }
        ctx.dynamicInput.setLive(
          "startAngle",
          toDegrees(this.pointedAngle(this.state.ellipse, input.point))
        )
        break
      case "endAngle":
        this.state = { ...this.state, cursor: input.point }
        if (this.state.included) {
          ctx.dynamicInput.setLive(
            "included",
            this.heading(ctx, this.state.center, input.point)
          )
        } else {
          ctx.dynamicInput.setLive(
            "endAngle",
            toDegrees(this.pointedAngle(this.state.ellipse, input.point))
          )
        }
        break
      case "second":
        this.state = { ...this.state, cursor: input.point }
        this.showAxis(this.state.first, input.point, ctx)
        break
      case "first":
        break
    }

    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    this.advanceWithPoint(input.point, ctx, input.screen)
  }

  /**
   * Advances the state machine with a resolved world point, shared by the click
   * path and the typed-coordinate path so both behave identically.
   */
  private advanceWithPoint(point: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(point)

    switch (this.state.phase) {
      case "first":
        this.state = { phase: "second", first: point, cursor: point }
        this.openAxisInput(ctx, at)
        break
      case "second":
        this.state = {
          phase: "distance",
          ...this.axisFrom(this.state.first, point),
          cursor: point,
        }
        this.openDistanceInput(ctx, at)
        break
      case "distance":
        // A typed value hard-locks the size, exactly as it locks the preview.
        this.commitEllipse(
          this.state.center,
          this.state.semiAxis,
          parseField(ctx, "distance") ?? V.distance(this.state.center, point),
          ctx,
          at
        )
        return
      case "rotation":
        this.commitRotation(
          parseField(ctx, "rotation") ??
            this.heading(ctx, this.state.center, point),
          ctx,
          at
        )
        return
      case "startAngle": {
        const typed = parseField(ctx, "startAngle")
        this.beginEndAngle(
          typed !== null
            ? toRadians(typed)
            : this.pointedAngle(this.state.ellipse, point),
          ctx,
          at
        )
        return
      }
      case "endAngle":
        this.commitArc(this.endParam(ctx, point), ctx)
        return
    }
    ctx.requestRender()
  }

  /**
   * Enter, where the box has no default to give: every prompt but Included
   * angle's `<180>` refuses it in its input function's words and asks again
   * (probes ellipse/p125–p133; the right button's Enter alike, desktop d06).
   */
  onEnter(ctx: ToolContext): boolean {
    const [refusal, values]: [MessageId, Record<string, string>?] = (() => {
      switch (this.state.phase) {
        case "first":
          return [this.centered ? "invalidPoint" : "pointOrKeywordRequired"]
        case "second":
          return [this.centered ? "invalidPoint" : "invalidPoint2d"]
        case "distance":
          return ["requiresDistance", { points: "second", keyword: "yes" }]
        case "rotation":
          return ["requiresAngle", { points: "second", keyword: "no" }]
        case "startAngle":
        case "endAngle":
          return ["requiresAngle", { points: "second", keyword: "yes" }]
      }
    })()
    ctx.report(ctx.text.message(refusal, values), "error")
    return true
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.restart()
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "first":
        // AutoCAD's first prompt: `[Arc/Center]` from the axis mode, and just
        // `[Center]` once it is already drawing an elliptical arc; both
        // declare `Centre` too, unlisted.
        return this.centered
          ? []
          : [
              ...(this.arc ? [] : [{ id: "Arc" }]),
              { id: "Center" },
              { id: "Centre", hidden: true },
            ]
      case "distance":
        return [{ id: "Rotation" }]
      // Each start and end prompt declares Angle and Parameter both; the
      // current measure's asks the same prompt again (probes ellipse/p03,
      // p114, p115, p234).
      case "startAngle":
        return [this.otherMeasure(), this.currentMeasure()]
      case "endAngle":
        return this.state.included
          ? []
          : [
              this.otherMeasure(),
              { id: "Included angle" },
              this.currentMeasure(),
            ]
      default:
        return []
    }
  }

  /** The keyword that switches the arc's angles and parameters. */
  private otherMeasure(): CommandOption {
    return { id: this.parameter ? "Angle" : "Parameter" }
  }

  /** The keyword of the measure in use, unlisted. */
  private currentMeasure(): CommandOption {
    return { id: this.parameter ? "Parameter" : "Angle", hidden: true }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (
      this.state.phase === "first" &&
      (id === "Arc" || id === "Center" || id === "Centre")
    ) {
      if (id === "Arc") this.arc = true
      else this.centered = true
      this.openPointInput(ctx, this.firstPrompt())
      ctx.requestRender()
      return "continue"
    }
    if (this.state.phase === "distance" && id === "Rotation") {
      this.state = { ...this.state, phase: "rotation" }
      this.openRotationInput(ctx)
      ctx.requestRender()
      return "continue"
    }
    const measuring =
      this.state.phase === "startAngle" ||
      (this.state.phase === "endAngle" && !this.state.included)
    if (measuring && (id === "Parameter" || id === "Angle")) {
      this.parameter = id === "Parameter"
      this.openAngleInput(
        ctx,
        this.state.phase === "startAngle" ? "startAngle" : "endAngle",
        this.lastScreen ?? { x: 0, y: 0 }
      )
      ctx.requestRender()
      return "continue"
    }
    if (
      this.state.phase === "endAngle" &&
      !this.state.included &&
      id === "Included angle"
    ) {
      this.state = { ...this.state, included: true }
      this.openIncludedAngleInput(ctx)
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  getConstraintAnchor(): Vec2 | null {
    switch (this.state.phase) {
      case "second":
        return this.state.first
      case "distance":
      case "rotation":
        return this.state.center
      case "startAngle":
      case "endAngle":
        return this.state.ellipse.center
      default:
        return null
    }
  }

  /**
   * The amber dashed line from the first point at the axis's other end, no
   * ghost; from the centre at every later prompt, beside the ghost in the
   * colour the ellipse will wear (desktop ellipse/d01, d02; the trace's
   * UseDashedLine at D, S and E, p03).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const ghost = {
      color: currentColor(ctx, this.properties ?? undefined),
      width: 1,
    }
    const rubberLine = (a: Vec2, b: Vec2): ScenePrimitive => ({
      kind: "segment",
      a: viewport.worldToScreen(a),
      b: viewport.worldToScreen(b),
      stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
    })

    switch (this.state.phase) {
      case "second":
        return [rubberLine(this.state.first, this.state.cursor)]
      case "distance":
      case "rotation":
      case "startAngle":
      case "endAngle": {
        const preview = this.previewEllipse(ctx)
        return [
          rubberLine(this.state.center, this.state.cursor),
          ...(preview ? entityScenePrimitive(viewport, preview, ghost) : []),
        ]
      }
      default:
        return []
    }
  }

  /**
   * The ellipse the current state draws, shared by the preview and the commit
   * so a typed value locks the result exactly as it locks the rubber band.
   */
  private previewEllipse(ctx: ToolContext): EllipseEntity | null {
    switch (this.state.phase) {
      case "distance": {
        const distance =
          parseField(ctx, "distance") ??
          V.distance(this.state.center, this.state.cursor)
        return this.solve(this.state.center, this.state.semiAxis, distance)
      }
      case "rotation":
        return this.rotated(
          parseField(ctx, "rotation") ??
            this.heading(ctx, this.state.center, this.state.cursor)
        )
      case "startAngle":
        return this.state.ellipse
      case "endAngle":
        return this.sweptEllipse(
          this.state.ellipse,
          this.state.startParam,
          this.endParam(ctx, this.state.cursor)
        )
      default:
        return null
    }
  }

  /**
   * The centre and first semi-axis the two picked points define, per mode.
   * The semi-axis runs to the first endpoint, or from the centre to the one
   * endpoint, which is where an arc's angle 0 lies: the console's 0,0 → 100,0
   * stores the major axis as -50,0 and starts an arc at 0 on 0,0 (probes
   * ellipse/p01, p109).
   */
  private axisFrom(
    first: Vec3,
    second: Vec2
  ): { center: Vec3; semiAxis: Vec2 } {
    const center = withZOf(
      this.centered ? first : V.midpoint(first, second),
      first
    )
    return { center, semiAxis: V.sub(this.centered ? second : first, center) }
  }

  /**
   * The full ellipse with the given half-length on the second axis, or null
   * for a zero first axis or other half. Which of the two is the *major* one
   * is decided by {@link createEllipse}, so either order of picking produces
   * the same object.
   */
  private solve(
    center: Vec3,
    semiAxis: Vec2,
    otherHalfLength: number
  ): EllipseEntity | null {
    if (V.length(semiAxis) < 1e-9 || !(otherHalfLength > 1e-9)) return null
    return onPlaneOf(
      createEllipse(center, semiAxis, otherHalfLength / V.length(semiAxis), {
        id: PREVIEW_ID,
      }),
      center
    )
  }

  /** A copy of `ellipse` swept between two parameters. */
  private sweptEllipse(
    ellipse: EllipseEntity,
    startParam: number,
    endParam: number
  ): EllipseEntity {
    return carryPlane(
      ellipse,
      createEllipse(ellipse.center, ellipse.majorAxis, ellipse.ratio, {
        startParam,
        endParam,
        id: PREVIEW_ID,
      })
    )
  }

  /**
   * The parameter a start or end value names: an angle's, or the value itself
   * in Parameter mode — a point's angle from the major axis included, as the
   * console takes `0,25` there (u = 333.43°, not the point on that heading:
   * AutoCAD 2023's console; 2027's probed the angle's alone, ellipse/p179).
   */
  private paramAt(ellipse: EllipseEntity, value: number): number {
    return this.parameter ? value : ellipseParamFromAngle(ellipse.ratio, value)
  }

  /**
   * The angle a pointed-at cursor names, measured from the *major axis* — the
   * frame AutoCAD's elliptical-arc prompts work in, the same one its Parameter
   * option's `p(angle) = c + a·cos(angle) + b·sin(angle)` is written in.
   */
  private pointedAngle(ellipse: EllipseEntity, point: Vec2): number {
    const offset = V.sub(point, ellipse.center)
    if (V.length(offset) < 1e-9) return 0
    return normalizeAngle(
      Math.atan2(offset.y, offset.x) - ellipseRotation(ellipse)
    )
  }

  /**
   * A point's heading from `center` in degrees, from the UCS's X axis — not
   * from the axis drawn: what a point gives at Rotation and Included angle,
   * AutoCAD's angle input from the centre (probes ellipse/p178, p298, p299).
   */
  private heading(ctx: ToolContext, center: Vec2, point: Vec2): number {
    return headingInUcs(ctx.ucs, V.sub(point, center))
  }

  /** The ellipse a Rotation of `degrees` draws, or null in the band. */
  private rotated(degrees: number): EllipseEntity | null {
    if (this.state.phase !== "rotation") return null
    const ratio = rotationRatio(degrees)
    const { center, semiAxis } = this.state
    return ratio === null
      ? null
      : this.solve(center, semiAxis, V.length(semiAxis) * ratio)
  }

  /**
   * The distance answered: 0 or less (a pick on the centre, `@`) is refused
   * and asked again (probes ellipse/p136, p137, p173, p202, p203); a zero
   * first axis then says `*Invalid*` (p205).
   */
  private commitEllipse(
    center: Vec3,
    semiAxis: Vec2,
    otherHalfLength: number,
    ctx: ToolContext,
    screen: Vec2
  ): void {
    if (!(otherHalfLength > 1e-9)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    const solved = this.solve(center, semiAxis, otherHalfLength)
    if (!solved) {
      this.invalid(ctx, center)
      return
    }
    this.finish(solved, ctx, screen)
  }

  private commitRotation(
    degrees: number,
    ctx: ToolContext,
    screen: Vec2
  ): void {
    if (this.state.phase !== "rotation") return
    const solved = this.rotated(degrees)
    if (!solved) {
      // Inside the band that would draw a line, or of a zero first axis.
      this.invalid(ctx, this.state.center)
      return
    }
    this.finish(solved, ctx, screen)
  }

  /**
   * AutoCAD's `*Invalid*`, which ends ELLIPSE with nothing made and LASTPOINT
   * on the centre (probes ellipse/p178, p166).
   */
  private invalid(ctx: ToolContext, center: Vec3): void {
    ctx.report(ctx.text.message("invalid"), "error")
    ctx.setLastPoint(center)
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Either adds the finished ellipse, or — in arc mode — moves on to ask for
   * the sweep, which is the point at which the two modes diverge. The current
   * properties are taken here, the arc's as its ellipse is fixed (probes
   * ellipse/p249, p253, p257).
   */
  private finish(ellipse: EllipseEntity, ctx: ToolContext, screen: Vec2): void {
    if (this.state.phase !== "distance" && this.state.phase !== "rotation") {
      return
    }
    const { center } = this.state
    this.properties = currentProperties(ctx)
    if (!this.arc) {
      this.add(ellipse, center, ctx)
      return
    }
    this.state = { phase: "startAngle", ellipse, center, cursor: center }
    this.openAngleInput(ctx, "startAngle", screen)
    ctx.requestRender()
  }

  private beginEndAngle(value: number, ctx: ToolContext, screen: Vec2): void {
    if (this.state.phase !== "startAngle") return
    this.state = {
      phase: "endAngle",
      ellipse: this.state.ellipse,
      center: this.state.center,
      startParam: this.paramAt(this.state.ellipse, value),
      cursor: this.state.cursor,
      included: false,
    }
    this.openAngleInput(ctx, "endAngle", screen)
    ctx.requestRender()
  }

  private commitArc(endParam: number, ctx: ToolContext): void {
    if (this.state.phase !== "endAngle") return
    this.add(
      this.sweptEllipse(this.state.ellipse, this.state.startParam, endParam),
      this.state.center,
      ctx
    )
  }

  /**
   * The end parameter the end prompt's answer names, shared by the preview
   * and the commit: the end angle or parameter typed or pointed at, or at
   * Included angle the sweep typed or a point's heading from the centre in
   * the UCS (probes ellipse/p182, p237, p299).
   */
  private endParam(ctx: ToolContext, point: Vec2): number {
    if (this.state.phase !== "endAngle") return 0
    const { ellipse, center, included } = this.state
    if (included) {
      const typed = parseField(ctx, "included")
      return this.includedEnd(
        toRadians(typed ?? this.heading(ctx, center, point))
      )
    }
    const typed = parseField(ctx, "endAngle")
    return this.paramAt(
      ellipse,
      typed !== null ? toRadians(typed) : this.pointedAngle(ellipse, point)
    )
  }

  /**
   * The end of the arc swept `included` from its start: in parameters when
   * the end was asked as a parameter, else in angles — the console's 90 from
   * a start angle of 30 ends at 120 (angle) or at parameter 139.1 (angle 157;
   * probes ellipse/p116, p118).
   */
  private includedEnd(included: number): number {
    if (this.state.phase !== "endAngle") return 0
    const { ellipse, startParam } = this.state
    return this.parameter
      ? startParam + included
      : ellipseParamFromAngle(
          ellipse.ratio,
          ellipseAngleFromParam(ellipse.ratio, startParam) + included
        )
  }

  private commitIncluded(included: number, ctx: ToolContext): void {
    this.commitArc(this.includedEnd(included), ctx)
  }

  private add(ellipse: EllipseEntity, center: Vec3, ctx: ToolContext): void {
    const properties = this.properties ?? currentProperties(ctx)
    ctx.setLastPoint(center)
    ctx.execute(
      new AddEntityCommand(
        wearingProperties(
          carryPlane(
            ellipse,
            createEllipse(ellipse.center, ellipse.majorAxis, ellipse.ratio, {
              startParam: ellipse.startParam,
              endParam: ellipse.endParam,
              layerId: properties.layerId,
            })
          ),
          properties
        )
      )
    )
    ctx.endCommand()
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

  /**
   * The axis's other end, or its end from the centre: the box dimensions the
   * axis from the first point with its length and angle, as LINE's next point
   * (desktop ellipse/d04-2; the centre mode's from the centre, unprobed but
   * the same input). The command line answers the point itself, a number
   * there direct distance as at any point prompt.
   */
  private openAxisInput(ctx: ToolContext, screen: Vec2): void {
    ctx.dynamicInput.open({
      fields: [
        { id: "distance", prompt: "length", kind: "distance" },
        { id: "angle", prompt: "angle", kind: "angle" },
      ],
      commit: (values, commitCtx) => this.commitAxis(values, commitCtx),
      commitRaw: (commitCtx) => this.commitAxisRaw(commitCtx),
      commandLinePoint: true,
    })
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    ctx.dynamicInput.setPosition(screen)
  }

  /** The axis's length and heading, shown acute as every direction's. */
  private showAxis(first: Vec3, cursor: Vec3, ctx: ToolContext): void {
    if (showRise(ctx, first, cursor)) return
    const offset = V.sub(cursor, first)
    const length = V.length(offset)
    ctx.dynamicInput.setLive("distance", length)
    ctx.dynamicInput.setLive(
      "angle",
      length > 1e-9 ? acuteHeading(headingInUcs(ctx.ucs, offset)) : null
    )
  }

  /**
   * The box's length and angle: the point that far from the first point, a
   * typed angle read on the cursor's side as the field shows it, a length
   * alone along the cursor (LINE's `commitSegment`).
   */
  private commitAxis(values: Record<string, number>, ctx: ToolContext): void {
    if (this.state.phase !== "second") return
    const { first, cursor } = this.state
    const { distance, angle } = values
    if (!Number.isFinite(distance)) return
    const typedAngle = ctx.dynamicInput.getText("angle").trim() !== ""
    const point = pointAlongCursor(ctx, first, cursor, {
      distance,
      angle: typedAngle && Number.isFinite(angle) ? angle : null,
    })
    if (point !== null) this.placeAxisEnd(point, ctx)
  }

  /**
   * A coordinate typed in the length field is the point, relative to the
   * first (DYNPICOORDS). A length with no heading to run along, the cursor
   * never having left the first point, is direct distance along the UCS's X,
   * as the runtime's (`pointAtDistance`).
   */
  private commitAxisRaw(ctx: ToolContext): boolean {
    if (this.state.phase !== "second") return false
    const text = ctx.dynamicInput.getText("distance").trim()
    if (isCoordinateExpression(text)) return this.commitTypedPoint(ctx, text)
    const distance = text === "" ? null : parseNumber(text)
    if (distance === null || !Number.isFinite(distance)) return false
    this.placeAxisEnd(
      pointAtDistance(ctx, this.state.first, null, distance),
      ctx
    )
    return true
  }

  /**
   * An axis end the box worked out: LASTPOINT is that point, as a pick there
   * leaves it, not the centre the next prompt measures from.
   */
  private placeAxisEnd(point: Vec3, ctx: ToolContext): void {
    ctx.setLastPoint(point)
    this.advanceWithPoint(point, ctx)
  }

  private commitTypedPoint(
    ctx: ToolContext,
    text = ctx.dynamicInput.getText("point").trim()
  ): boolean {
    const last = this.state.phase === "second" ? this.state.first : null
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: last ?? ctx.lastPoint,
      relativeByDefault: last !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.advanceWithPoint(point, ctx)
    return true
  }

  private openDistanceInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [
        { id: "distance", prompt: "distanceToOtherAxis", kind: "distance" },
      ],
      commit: (values, commitCtx) => {
        if (this.state.phase !== "distance") return
        this.commitEllipse(
          this.state.center,
          this.state.semiAxis,
          values.distance,
          commitCtx,
          screen
        )
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  private openRotationInput(ctx: ToolContext): void {
    const screen = this.lastScreen ?? { x: 0, y: 0 }
    const session: DynamicInputSession = {
      fields: [
        {
          id: "rotation",
          prompt: "rotationAroundMajorAxis",
          kind: "angle",
        },
      ],
      commit: (values, commitCtx) =>
        this.commitRotation(values.rotation, commitCtx, screen),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("rotation", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  private openAngleInput(
    ctx: ToolContext,
    id: "startAngle" | "endAngle",
    screen: Vec2
  ): void {
    const prompt: PromptId = this.parameter
      ? id === "startAngle"
        ? "startParameter"
        : "endParameter"
      : id
    const session: DynamicInputSession = {
      fields: [{ id, prompt, kind: "angle" }],
      commit: (values, commitCtx) => {
        const value = toRadians(values[id])
        if (id === "startAngle") this.beginEndAngle(value, commitCtx, screen)
        else if (this.state.phase === "endAngle") {
          this.commitArc(this.paramAt(this.state.ellipse, value), commitCtx)
        }
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive(id, 0)
    ctx.dynamicInput.setPosition(screen)
  }

  /** AutoCAD's Included angle: the sweep measured from the start angle. */
  private openIncludedAngleInput(ctx: ToolContext): void {
    const screen = this.lastScreen ?? { x: 0, y: 0 }
    const session: DynamicInputSession = {
      fields: [{ id: "included", prompt: "includedAngle", kind: "angle" }],
      commit: (values, commitCtx) =>
        this.commitIncluded(toRadians(values.included), commitCtx),
      // Enter keeps the `<180>` the prompt shows: half the ellipse.
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "endAngle") return false
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.commitIncluded(Math.PI, commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("included", 0)
    ctx.dynamicInput.setPosition(screen)
  }
}

/**
 * The axis ratio a Rotation value produces: turning a circle through φ about
 * the axis foreshortens the other one by cos φ. `null` inside the band AutoCAD
 * rejects, where the ellipse would come out as a straight line — the band
 * repeats every 90°, which is also what makes the effect mirror there.
 */
function rotationRatio(degrees: number): number | null {
  const foldedTo180 = ((degrees % 180) + 180) % 180
  if (Math.abs(foldedTo180 - 90) < 90 - ROTATION_LIMIT_DEGREES) return null
  const ratio = Math.abs(Math.cos(toRadians(degrees)))
  return ratio > 1e-9 ? ratio : null
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const toDegrees = (radians: number) => (radians * 180) / Math.PI

/** Reads a numeric field, returning `null` when empty or not a number. */
function parseField(ctx: ToolContext, fieldId: string): number | null {
  const text = ctx.dynamicInput.getText(fieldId).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}
