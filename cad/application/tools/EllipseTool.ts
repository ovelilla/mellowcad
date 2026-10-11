import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import {
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
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"

/**
 * How an ellipse is defined — the three entries of AutoCAD's Ellipse dropdown,
 * each surfaced as its own rail entry (a flyout), as CIRCLE and ARC are:
 *
 * - `axis`: the two endpoints of one axis, then the distance to the other;
 * - `center`: the centre, one axis endpoint, then the distance to the other;
 * - `arc`: an elliptical arc — the same ellipse, then a start and an end angle.
 *
 * The one command-line ELLIPSE reaches all three through the `[Arc/Center]`
 * keywords of its first prompt, which is why the active mode can change after
 * the tool is constructed.
 */
export type EllipseMode = "axis" | "center" | "arc"

type EllipseToolState =
  /** Awaiting the first point: an axis endpoint, or the centre. */
  | { readonly phase: "first" }
  /** Awaiting the other end of the first axis (or its only end, from the centre). */
  | { readonly phase: "second"; readonly first: Vec3; readonly cursor: Vec2 }
  /**
   * The first axis is fixed; awaiting the half-length of the other one. The
   * centre is at the first point's height, the plane the ellipse lies in.
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
      readonly cursor: Vec2
    }
  | {
      readonly phase: "endAngle"
      readonly ellipse: EllipseEntity
      readonly startParam: number
      readonly startAngle: number
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
 * The ellipse tool — AutoCAD's ELLIPSE. One class parameterised by
 * {@link EllipseMode}, registered once per mode. It never mutates the document:
 * the finished ellipse is submitted as an {@link AddEntityCommand}, so it is
 * undoable, and the command ends the moment the ellipse is defined.
 */
export class EllipseTool implements Tool {
  readonly id: string
  readonly shortcut?: string

  private readonly mode: EllipseMode
  /**
   * What is actually running: the Arc and Center keywords turn these on, and
   * an elliptical arc can still be started from its centre.
   */
  private arc: boolean
  private centered: boolean
  private state: EllipseToolState = { phase: "first" }
  private lastScreen: Vec2 | null = null

  constructor(mode: EllipseMode, id: string, shortcut?: string) {
    this.mode = mode
    this.arc = mode === "arc"
    this.centered = mode === "center"
    this.id = id
    this.shortcut = shortcut
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.arc = this.mode === "arc"
    this.centered = this.mode === "center"
    this.state = { phase: "first" }
    this.openPointInput(ctx, this.firstPrompt())
  }

  /** WHY no Parameter at the arc's angles: it is not offered. */
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
        return "specifyStartAngle"
      case "endAngle":
        return this.state.included
          ? { id: "specifyIncludedAngleForArc", enter: { angle: 180 } }
          : "specifyEndAngleOr"
    }
  }

  /** The axis's other end is a 2D point, as AutoCAD's console refuses it. */
  takes(): QuestionInput | null {
    return this.state.phase === "second" ? "point2d" : null
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
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
        ctx.dynamicInput.setLive("rotation", this.pointedRotation(input.point))
        break
      case "startAngle":
      case "endAngle":
        this.state = { ...this.state, cursor: input.point }
        ctx.dynamicInput.setLive(
          this.state.phase === "startAngle" ? "startAngle" : "endAngle",
          toDegrees(this.pointedAngle(this.state.ellipse, input.point))
        )
        break
      case "second":
        this.state = { ...this.state, cursor: input.point }
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
        this.openPointInput(ctx, this.secondPrompt(), at)
        break
      case "second": {
        const axis = this.axisFrom(this.state.first, point)
        if (!axis) return // zero-length axis — keep prompting
        this.state = { phase: "distance", ...axis, cursor: point }
        this.openDistanceInput(ctx, at)
        break
      }
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
          parseField(ctx, "rotation") ?? this.pointedRotation(point),
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
      case "endAngle": {
        const typed = parseField(ctx, "endAngle")
        this.commitArc(
          typed !== null
            ? toRadians(typed)
            : this.pointedAngle(this.state.ellipse, point),
          ctx
        )
        return
      }
    }
    ctx.requestRender()
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.arc = this.mode === "arc"
      this.centered = this.mode === "center"
      this.state = { phase: "first" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "first":
        // AutoCAD's first prompt: `[Arc/Center]` from the axis mode, and just
        // `[Center]` once it is already drawing an elliptical arc.
        return this.centered
          ? []
          : [...(this.arc ? [] : [{ id: "Arc" }]), { id: "Center" }]
      case "distance":
        return [{ id: "Rotation" }]
      case "endAngle":
        return this.state.included ? [] : [{ id: "Included angle" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "first" && (id === "Arc" || id === "Center")) {
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

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const rubber = { color: THEME.rubberBand, width: 1 }
    const guide = (a: Vec2, b: Vec2): ScenePrimitive => ({
      kind: "segment",
      a: viewport.worldToScreen(a),
      b: viewport.worldToScreen(b),
      stroke: rubber,
    })

    switch (this.state.phase) {
      case "second":
        return [guide(this.state.first, this.state.cursor)]
      case "distance":
      case "rotation": {
        const preview = this.previewEllipse(ctx)
        // The guide runs from the centre to the cursor, whose distance from it
        // *is* the half-length being specified.
        return [
          guide(this.state.center, this.state.cursor),
          ...(preview ? entityScenePrimitive(viewport, preview, rubber) : []),
        ]
      }
      case "startAngle":
      case "endAngle": {
        const preview = this.previewEllipse(ctx)
        return [
          guide(this.state.ellipse.center, this.state.cursor),
          ...(preview ? entityScenePrimitive(viewport, preview, rubber) : []),
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
      case "rotation": {
        const degrees =
          parseField(ctx, "rotation") ?? this.pointedRotation(this.state.cursor)
        const ratio = rotationRatio(degrees)
        return ratio === null
          ? null
          : this.solve(
              this.state.center,
              this.state.semiAxis,
              V.length(this.state.semiAxis) * ratio
            )
      }
      case "startAngle":
        return this.state.ellipse
      case "endAngle": {
        const typed = parseField(ctx, "endAngle")
        const angle =
          typed !== null
            ? toRadians(typed)
            : this.pointedAngle(this.state.ellipse, this.state.cursor)
        return this.sweptEllipse(
          this.state.ellipse,
          this.state.startParam,
          angle
        )
      }
      default:
        return null
    }
  }

  /** The centre and first semi-axis the two picked points define, per mode. */
  private axisFrom(
    first: Vec3,
    second: Vec2
  ): { center: Vec3; semiAxis: Vec2 } | null {
    const center = withZOf(
      this.centered ? first : V.midpoint(first, second),
      first
    )
    const semiAxis = V.sub(second, center)
    return V.length(semiAxis) < 1e-9 ? null : { center, semiAxis }
  }

  /**
   * The full ellipse with the given half-length on the second axis. Which of
   * the two is the *major* one is decided by {@link createEllipse}, so either
   * order of picking produces the same object.
   */
  private solve(
    center: Vec3,
    semiAxis: Vec2,
    otherHalfLength: number
  ): EllipseEntity | null {
    if (!(otherHalfLength > 1e-9)) return null
    return onPlaneOf(
      createEllipse(center, semiAxis, otherHalfLength / V.length(semiAxis), {
        id: PREVIEW_ID,
      }),
      center
    )
  }

  /** A copy of `ellipse` swept from `startParam` to the given angle. */
  private sweptEllipse(
    ellipse: EllipseEntity,
    startParam: number,
    endAngle: number
  ): EllipseEntity {
    return carryPlane(
      ellipse,
      createEllipse(ellipse.center, ellipse.majorAxis, ellipse.ratio, {
        startParam,
        endParam: ellipseParamFromAngle(ellipse.ratio, endAngle),
        id: PREVIEW_ID,
      })
    )
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

  /** The rotation a pointed-at cursor names: how far its distance falls short. */
  private pointedRotation(point: Vec2): number {
    if (this.state.phase !== "rotation" && this.state.phase !== "distance") {
      return 0
    }
    const half = V.length(this.state.semiAxis)
    const reach = V.distance(this.state.center, point)
    return toDegrees(Math.acos(Math.min(reach, half) / half))
  }

  private commitEllipse(
    center: Vec3,
    semiAxis: Vec2,
    otherHalfLength: number,
    ctx: ToolContext,
    screen: Vec2
  ): void {
    const solved = this.solve(center, semiAxis, otherHalfLength)
    if (!solved) return // degenerate — keep prompting
    this.finish(solved, ctx, screen)
  }

  private commitRotation(
    degrees: number,
    ctx: ToolContext,
    screen: Vec2
  ): void {
    if (this.state.phase !== "rotation") return
    const ratio = rotationRatio(degrees)
    if (ratio === null) {
      // Inside the band that would draw a line: AutoCAD ends the command.
      ctx.report(ctx.text.message("invalid"), "error")
      ctx.dynamicInput.close()
      ctx.endCommand()
      return
    }
    this.commitEllipse(
      this.state.center,
      this.state.semiAxis,
      V.length(this.state.semiAxis) * ratio,
      ctx,
      screen
    )
  }

  /**
   * Either adds the finished ellipse, or — in arc mode — moves on to ask for
   * the sweep, which is the point at which the two modes diverge.
   */
  private finish(ellipse: EllipseEntity, ctx: ToolContext, screen: Vec2): void {
    if (!this.arc) {
      this.add(ellipse, ctx)
      return
    }
    this.state = { phase: "startAngle", ellipse, cursor: ellipse.center }
    this.openAngleInput(ctx, "startAngle", screen)
    ctx.requestRender()
  }

  private beginEndAngle(angle: number, ctx: ToolContext, screen: Vec2): void {
    if (this.state.phase !== "startAngle") return
    this.state = {
      phase: "endAngle",
      ellipse: this.state.ellipse,
      startParam: ellipseParamFromAngle(this.state.ellipse.ratio, angle),
      startAngle: angle,
      cursor: this.state.cursor,
      included: false,
    }
    this.openAngleInput(ctx, "endAngle", screen)
    ctx.requestRender()
  }

  private commitArc(endAngle: number, ctx: ToolContext): void {
    if (this.state.phase !== "endAngle") return
    this.add(
      this.sweptEllipse(this.state.ellipse, this.state.startParam, endAngle),
      ctx
    )
  }

  private add(ellipse: EllipseEntity, ctx: ToolContext): void {
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(
          carryPlane(
            ellipse,
            createEllipse(ellipse.center, ellipse.majorAxis, ellipse.ratio, {
              startParam: ellipse.startParam,
              endParam: ellipse.endParam,
              layerId: ctx.document.getCurrentLayerId(),
            })
          ),
          ctx
        )
      )
    )
    ctx.endCommand()
  }

  private secondPrompt(): PromptId {
    return this.centered ? "endpointOfAxis" : "otherAxisEndpoint"
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
    if (!isCoordinateExpression(text)) return false
    const last = this.state.phase === "second" ? this.state.first : null
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
    const session: DynamicInputSession = {
      // The field and its prompt share the id: startAngle, endAngle.
      fields: [{ id, prompt: id, kind: "angle" }],
      commit: (values, commitCtx) => {
        const angle = toRadians(values[id])
        if (id === "startAngle") this.beginEndAngle(angle, commitCtx, screen)
        else this.commitArc(angle, commitCtx)
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
      commit: (values, commitCtx) => {
        if (this.state.phase !== "endAngle") return
        this.commitArc(
          this.state.startAngle + toRadians(values.included),
          commitCtx
        )
      },
      // Enter keeps the `<180>` the prompt shows: half the ellipse.
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "endAngle") return false
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.commitArc(this.state.startAngle + Math.PI, commitCtx)
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
