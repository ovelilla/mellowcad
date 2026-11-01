import { Vec2 } from "../../geometry/Vec2"
import { Vec3, length3, normalize3, scale3, sub3 } from "../../geometry/Vec3"
import { MODEL_TOLERANCE } from "../../geometry/planarCurves"
import {
  PlanarProfile,
  revolutionBrep,
  revolveSide,
} from "../../geometry/sweeps"
import {
  Entity,
  EntityId,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { entityShape } from "../../domain/polylineFits"
import { closedLoop } from "../../domain/regionModeling"
import { createSweptSolid, sweepProfile } from "../../domain/sweptSolids"
import { lineEndZ, lineStartZ } from "../../domain/entities"
import {
  AddEntitiesCommand,
  ReplaceEntitiesCommand,
} from "../commands/entityCommands"
import { evaluateExpression } from "../input/expression"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { MessageId } from "../EngineText"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  HeldVariables,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { currentColor, withCurrentProperties } from "./currentProperties"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"
import { SweepSettings, sweepSettings } from "./sweepSettings"

interface Profile {
  readonly id: EntityId
  readonly profile: PlanarProfile | "crosses"
}

/** The axis: a point on it and its way, start to end. */
interface Axis {
  readonly origin: Vec3
  readonly direction: Vec3
}

type RevolveState =
  | { readonly phase: "select" }
  | { readonly phase: "mode" }
  | { readonly phase: "axisStart" }
  | { readonly phase: "axisEnd"; readonly start: Vec3 }
  | { readonly phase: "object" }
  | {
      readonly phase: "angle"
      readonly axis: Axis
      readonly start: number | null
    }
  | { readonly phase: "startAngle"; readonly axis: Axis }
  | {
      readonly phase: "expression"
      readonly axis: Axis
      readonly start: number | null
    }
  | {
      readonly phase: "erase"
      readonly made: readonly Entity[]
      readonly used: readonly EntityId[]
    }

const PREVIEW_ID = "revolve-preview"
const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 }
const UNIT: Record<"X" | "Y" | "Z", Vec3> = {
  X: { x: 1, y: 0, z: 0 },
  Y: { x: 0, y: 1, z: 0 },
  Z: { x: 0, y: 0, z: 1 },
}

/**
 * AutoCAD's REVOLVE, as 2027's console asks it (revolve/r01–r09), in en, es
 * and pt-BR: EXTRUDE's first line, set and MOde (`Select objects to revolve
 * or [MOde]:`, `Cannot revolve an object of this type.`), then `Specify axis
 * start point or define axis by [Object/X/Y/Z] <Object>:` — two points
 * (`Zero length axis is not permitted.` ends it), a line or a straight
 * segment of a polyline (Object; a closed one `Cannot get axis direction
 * from a closed curve or edge.`), or the UCS's X, Y or Z through its origin
 * — and `Specify angle of revolution or [STart angle/Reverse/EXpression]
 * <360>:`: 0 or a turn or more is a whole one (r05, r07), negative turns
 * back; STart angle asks `Specify start angle <0.0>:` and the angle again
 * without Reverse; Reverse turns the axis round. A profile across the axis
 * says `The object should be on one side of the axis.`, one square to it
 * `Axis of revolution is perpendicular to plane of revolve curve.`, each with
 * `Unable to revolve the selected object.`, and the command ends (r05).
 * DELOBJ as EXTRUDE's (r09). One undo step.
 *
 * WHY an axis off the profile's plane is refused (`Unable to revolve the
 * selected object.` alone): AutoCAD turns the profile round it (r05's
 * 40,0,0 to 40,10,10) into faces this kernel does not hold yet.
 */
export class RevolveTool implements Tool {
  readonly id = "revolve"

  private state: RevolveState = { phase: "select" }
  private profiles: readonly Profile[] = []
  private lastScreen: Vec2 | null = null
  private cursor: Vec3 = ORIGIN
  private readonly selector = new ObjectSelector({
    done: (ctx) => this.closeSet(ctx),
    question: () => "revolveSelectOr",
    noneFound: "sweepNothingSelected",
  })
  private readonly axisPick = new ObjectSelector({
    takes: () => "singleSet",
    done: () => {},
    question: () => "revolveSelectAxis",
    modes: ONE_OBJECT_MODES,
    one: {
      take: (entity, ctx, find) => this.takeAxisObject(entity, find.last, ctx),
      newest: true,
      pick: (point, ctx) => {
        const hit = ctx.pick(point)
        if (hit) this.takeAxisObject(hit, point, ctx)
        else ctx.report(ctx.text.message("noObjectFound"))
      },
    },
  })

  constructor(private readonly settings: SweepSettings = sweepSettings()) {}

  heldVariables(): Partial<HeldVariables> {
    return {
      DELOBJ: {
        read: () => this.settings.delobj,
        write: (value) => {
          this.settings.delobj = value
        },
      },
    }
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.profiles = []
    this.state = { phase: "select" }
    ctx.report(
      ctx.text.message("sweepDensity", {
        isolines: ctx.document.getSettings().isolines,
      })
    )
    this.selector.start()
    if (this.selector.preselect(ctx)) this.closeSet(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select" }
    this.profiles = []
    this.selector.start()
    this.axisPick.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "select":
        return this.selector.question()
      case "mode":
        return { id: "closedProfilesMode", enter: "closedProfilesSolid" }
      case "axisStart":
        return "revolveAxisStartOr"
      case "axisEnd":
        return "revolveAxisEnd"
      case "object":
        return this.axisPick.question()
      case "angle":
        return { id: "revolveAngleOr", enter: { name: "360" } }
      case "startAngle":
        return { id: "revolveStartAngle", enter: { name: "0.0" } }
      case "expression":
        return "enterExpression"
      case "erase":
        return "eraseDefiningObjects"
    }
  }

  defaultOption(): string | null {
    if (this.state.phase === "axisStart") return "Object"
    if (this.state.phase === "erase") return this.settings.erase ? "Yes" : "No"
    return null
  }

  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "select":
        return this.selector.takes()
      case "object":
        return this.axisPick.takes()
      case "mode":
      case "erase":
        return "keyword"
      case "axisStart":
      case "axisEnd":
        return { refusal: "pointOrKeywordRequired" }
      case "angle":
      case "startAngle":
        return {
          refusal: "requiresAngle",
          values: { points: "second", keyword: "yes" },
        }
      case "expression":
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    const state = this.state
    switch (state.phase) {
      case "select":
        return this.selector.inMode()
          ? this.selector.commandOptions()
          : [{ id: "MOde" }, ...this.selector.commandOptions()]
      case "object":
        return this.axisPick.commandOptions()
      case "mode":
        return [{ id: "SOlid" }, { id: "SUrface" }]
      case "axisStart":
        return [{ id: "Object" }, { id: "X" }, { id: "Y" }, { id: "Z" }]
      case "angle":
        // Reverse no more once a start angle is given (r01).
        return state.start === null
          ? [{ id: "STart" }, { id: "Reverse" }, { id: "EXpression" }]
          : [{ id: "STart" }, { id: "EXpression" }]
      case "erase":
        return [{ id: "Yes" }, { id: "No" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    switch (state.phase) {
      case "select":
        if (id === "MOde" && !this.selector.inMode()) {
          this.state = { phase: "mode" }
          this.openKeywords(ctx)
          return "continue"
        }
        return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "object":
        return this.axisPick.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "mode":
        if (id !== "SOlid") return "unhandled"
        this.state = { phase: "select" }
        ctx.dynamicInput.close()
        return "continue"
      case "axisStart":
        if (id === "Object") {
          this.askObject(ctx)
          return "continue"
        }
        if (id === "X" || id === "Y" || id === "Z") {
          this.askAngle({ origin: ORIGIN, direction: UNIT[id] }, null, ctx)
          return "continue"
        }
        return "unhandled"
      case "angle":
        if (id === "STart") {
          this.state = { phase: "startAngle", axis: state.axis }
          this.openValue(ctx, "revolveStartAngle")
          return "continue"
        }
        if (id === "Reverse" && state.start === null) {
          this.askAngle(
            {
              origin: state.axis.origin,
              direction: scale3(state.axis.direction, -1),
            },
            null,
            ctx
          )
          return "continue"
        }
        if (id === "EXpression") {
          this.state = {
            phase: "expression",
            axis: state.axis,
            start: state.start,
          }
          this.openExpression(ctx)
          return "continue"
        }
        return "unhandled"
      case "erase":
        if (id !== "Yes" && id !== "No") return "unhandled"
        this.settings.erase = id === "Yes"
        this.finish(state.made, id === "Yes" ? state.used : [], ctx)
        return "end"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    switch (state.phase) {
      case "select":
        return this.selector.onEnter(ctx)
      case "object":
        return this.axisPick.onEnter(ctx)
      case "mode":
        this.state = { phase: "select" }
        ctx.dynamicInput.close()
        return true
      case "axisStart":
        this.askObject(ctx)
        return true
      case "erase":
        this.finish(state.made, this.settings.erase ? state.used : [], ctx)
        ctx.endCommand()
        return true
      default:
        return false
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase === "select")
      return this.selector.answerTyped(text, ctx)
    if (this.state.phase === "object")
      return this.axisPick.answerTyped(text, ctx)
    return false
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.state.phase === "select" && this.selector.cycleLasso(ctx)
  }

  wantsSnap(): boolean {
    switch (this.state.phase) {
      case "select":
        return this.selector.wantsSnap()
      case "object":
        return this.axisPick.wantsSnap()
      case "axisStart":
      case "axisEnd":
        return true
      default:
        return false
    }
  }

  getConstraintAnchor(): Vec3 | null {
    return this.state.phase === "axisEnd" ? this.state.start : null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    if (this.state.phase === "select") {
      this.selector.onPointerMove(input, ctx)
      return
    }
    if (this.state.phase === "object") {
      this.axisPick.onPointerMove(input, ctx)
      return
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") {
      this.selector.onPointerDown(input, ctx)
      return
    }
    if (this.state.phase === "object") {
      if (input.button !== 0) return
      const hit = ctx.pick(input.point)
      if (hit) this.takeAxisObject(hit, input.point, ctx)
      else ctx.report(ctx.text.message("noObjectFound"))
      return
    }
    if (input.button !== 0) return
    this.takePoint(input.point, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.selector.onPointerUp(input, ctx)
  }

  /** The set as it closes, the axis as it is dragged, then the whole turn the angle starts from. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "select") return this.selector.buildOverlay(ctx)
    if (state.phase === "object") return this.axisPick.buildOverlay(ctx)
    if (state.phase !== "angle") return []
    const stroke = { color: currentColor(ctx), width: 1 }
    return this.solids(state.axis, 0, 2 * Math.PI, ctx, false).made.flatMap(
      (solid) => entityScenePrimitive(ctx.viewport, solid, stroke)
    )
  }

  private closeSet(ctx: ToolContext): void {
    const profiles: Profile[] = []
    let refused = 0
    for (const id of ctx.selection.toArray()) {
      const entity = ctx.document.get(id)
      const profile = entity ? sweepProfile(entity) : null
      if (profile === null || profile === "open") refused++
      else profiles.push({ id, profile })
    }
    if (refused > 0) {
      ctx.report(
        ctx.text.message("revolveRefused", { count: refused }),
        "error"
      )
    }
    ctx.selection.clear()
    if (profiles.length === 0) {
      this.selector.start()
      this.state = { phase: "select" }
      ctx.requestRender()
      return
    }
    this.profiles = profiles
    this.state = { phase: "axisStart" }
    this.openPoint(ctx, "revolveAxisStartOr")
  }

  private askObject(ctx: ToolContext): void {
    this.state = { phase: "object" }
    this.axisPick.start()
    ctx.dynamicInput.close()
    ctx.requestRender()
  }

  /**
   * The axis along a line from its start, or along the straight segment of a
   * polyline nearest the pick, from where it starts (r08); a closed object
   * gives none and ends the command (r01).
   */
  private takeAxisObject(
    entity: Entity,
    at: Vec2 | undefined,
    ctx: ToolContext
  ): void {
    const loop = closedLoop(entity)
    if (loop !== null && loop !== "open") {
      ctx.report(ctx.text.message("revolveClosedAxis"), "error")
      ctx.endCommand()
      return
    }
    let ends: [Vec3, Vec3] | null = null
    if (entity.type === "line") {
      ends = [
        { ...entity.start, z: lineStartZ(entity) },
        { ...entity.end, z: lineEndZ(entity) },
      ]
    } else if (entity.type === "polyline") {
      const z = entity.elevation ?? 0
      const segments = polylineSegmentGeometries(entityShape(entity)).filter(
        (s) => s.kind === "line"
      )
      const near = (s: (typeof segments)[number]) => {
        if (!at) return 0
        const mx = (s.a.x + s.b.x) / 2 - at.x
        const my = (s.a.y + s.b.y) / 2 - at.y
        return Math.hypot(mx, my)
      }
      const best = segments.reduce<(typeof segments)[number] | null>(
        (b, s) => (b === null || near(s) < near(b) ? s : b),
        null
      )
      if (best)
        ends = [
          { ...best.a, z },
          { ...best.b, z },
        ]
    }
    if (!ends) {
      ctx.report(ctx.text.message("revolveClosedAxis"), "error")
      ctx.endCommand()
      return
    }
    const direction = normalize3(sub3(ends[1], ends[0]))
    if (!direction) {
      ctx.report(ctx.text.message("revolveZeroAxis"), "error")
      ctx.endCommand()
      return
    }
    this.askAngle({ origin: ends[0], direction }, null, ctx)
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase === "axisStart") {
      this.state = { phase: "axisEnd", start: point }
      this.openPoint(ctx, "revolveAxisEnd")
      return
    }
    if (state.phase === "axisEnd") {
      const direction = sub3(point, state.start)
      if (length3(direction) <= MODEL_TOLERANCE) {
        // Said, and the command ends (r09).
        ctx.report(ctx.text.message("revolveZeroAxis"), "error")
        ctx.dynamicInput.close()
        ctx.endCommand()
        return
      }
      this.askAngle(
        { origin: state.start, direction: normalize3(direction)! },
        null,
        ctx
      )
    }
  }

  private askAngle(axis: Axis, start: number | null, ctx: ToolContext): void {
    this.state = { phase: "angle", axis, start }
    this.openValue(ctx, "revolveAngleOr")
  }

  /**
   * The angle: 0, a turn or more either way a whole turn (r05, r07); else
   * the profile turned to its start and swept on.
   */
  private takeAngle(degrees: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "angle") return
    const whole = degrees === 0 || Math.abs(degrees) >= 360
    const angle = whole ? 360 : degrees
    this.revolve(state.axis, state.start ?? 0, angle, ctx)
  }

  /** The solids, each profile on its own; what cannot be turned, said. */
  private solids(
    axis: Axis,
    startDegrees: number,
    angleRadians: number,
    ctx: ToolContext,
    report: boolean,
    startRadians = (startDegrees * Math.PI) / 180
  ): { made: Entity[]; refused: boolean } {
    const made: Entity[] = []
    let refused = false
    const say = (id: MessageId) => {
      if (report) ctx.report(ctx.text.message(id), "error")
    }
    for (const { profile } of this.profiles) {
      if (profile === "crosses") {
        say("revolveUnable")
        refused = true
        continue
      }
      const out = revolveSide(profile, axis.origin, axis.direction)
      if (typeof out === "string") {
        if (out === "crossesAxis") say("revolveOneSide")
        if (out === "perpendicularAxis") say("revolvePerpendicular")
        say("revolveUnable")
        refused = true
        continue
      }
      const brep = revolutionBrep(
        profile,
        axis.origin,
        axis.direction,
        out,
        startRadians,
        angleRadians
      )
      const solid = createSweptSolid(
        brep,
        {
          kind: "revolve",
          start: startRadians,
          angle: angleRadians,
          axis: axis.direction,
        },
        ctx.document.getCurrentLayerId(),
        report ? undefined : `${PREVIEW_ID}-${made.length}`
      )
      made.push(report ? withCurrentProperties(solid, ctx) : solid)
    }
    return { made, refused }
  }

  private revolve(
    axis: Axis,
    startDegrees: number,
    angleDegrees: number,
    ctx: ToolContext
  ): void {
    const { made, refused } = this.solids(
      axis,
      startDegrees,
      (angleDegrees * Math.PI) / 180,
      ctx,
      true
    )
    // A profile it cannot turn ends the command, nothing made (r05).
    if (refused) {
      ctx.dynamicInput.close()
      ctx.endCommand()
      return
    }
    const used = this.profiles.map(({ id }) => id)
    if (made.length > 0 && this.settings.delobj < 0) {
      this.state = { phase: "erase", made, used }
      this.openKeywords(ctx)
      return
    }
    this.finish(made, this.settings.delobj !== 0 ? used : [], ctx)
    ctx.endCommand()
  }

  private finish(
    made: readonly Entity[],
    erase: readonly EntityId[],
    ctx: ToolContext
  ): void {
    this.state = { phase: "select" }
    ctx.dynamicInput.close()
    if (made.length === 0) return
    ctx.execute(
      erase.length > 0
        ? new ReplaceEntitiesCommand(erase, made)
        : new AddEntitiesCommand(made)
    )
  }

  private openKeywords(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private openPoint(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** An angle's box: degrees typed; Enter its `<360>` or `<0.0>`. */
  private openValue(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt, kind: "angle" }],
      commit: (values, commitCtx) => {
        if (Number.isFinite(values.value))
          this.takeValue(values.value, commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.takeValue(this.state.phase === "startAngle" ? 0 : 360, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private takeValue(degrees: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase === "startAngle") {
      this.askAngle(state.axis, degrees, ctx)
      return
    }
    this.takeAngle(degrees, ctx)
  }

  private openExpression(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "expression", prompt: "enterExpression", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const value = evaluateExpression(
          commitCtx.dynamicInput.getText("expression").trim()
        )
        if (value === null) {
          commitCtx.report(commitCtx.text.message("expressionSyntax"), "error")
          return true
        }
        const state = this.state
        if (state.phase !== "expression") return true
        this.state = { phase: "angle", axis: state.axis, start: state.start }
        this.takeAngle(value, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private commitTypedPoint(ctx: ToolContext): boolean {
    if (!ctx.dynamicInput.hasTypedText()) {
      if (this.state.phase === "axisStart") {
        this.askObject(ctx)
        return true
      }
      ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
      return true
    }
    const field = ctx.dynamicInput.getActiveFieldId()
    const text = field === null ? "" : ctx.dynamicInput.getText(field).trim()
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor()
    const point = parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: base !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.takePoint(point, ctx)
    return true
  }
}

void ORIGIN
