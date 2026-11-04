import { V, Vec2 } from "../../geometry/Vec2"
import { Vec3, length3, normalize3, scale3, sub3 } from "../../geometry/Vec3"
import { MODEL_TOLERANCE } from "../../geometry/planarCurves"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  PlanarProfile,
  revolutionBrep,
  revolveSide,
} from "../../geometry/sweeps"
import {
  Entity,
  EntityId,
  arcEndPoint,
  arcStartPoint,
  entityPointToWorld,
  lineEndZ,
  lineStartZ,
  splineEndPoint,
  splineStartPoint,
} from "../../domain/entities"
import { entityShape } from "../../domain/polylineFits"
import { closedLoop } from "../../domain/regionModeling"
import {
  createSweptSolid,
  revolveBase,
  sweepProfile,
  sweptFaces,
} from "../../domain/sweptSolids"
import { ucsZAxis, worldPointToUcs } from "../../domain/ucs"
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
  RibbonMacro,
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

/**
 * AutoCAD's REVOLVE, as 2027's console asks it (revolve/r01–r09), in en, es
 * and pt-BR: EXTRUDE's first line, set and MOde (`Select objects to revolve
 * or [MOde]:`, `Cannot revolve an object of this type.`), then `Specify axis
 * start point or define axis by [Object/X/Y/Z] <Object>:` — two points
 * (`Zero length axis is not permitted.` ends it), the chord of a line, a
 * polyline, an arc or a spline from its end nearer the pick (Object; a
 * closed one `Cannot get axis direction from a closed curve or edge.`), or
 * the UCS's X, Y or Z through its origin (sweeps/p205, p211). The axis given,
 * a profile across it says `The object should be on one side of the axis.`,
 * one square to it `Axis of revolution is perpendicular to plane of revolve
 * curve.`, one crossing itself `Cannot revolve a self-intersecting curve.`,
 * each with `Unable to revolve the selected object.`, and the command ends
 * (r05, p244, p245). Then `Specify angle of revolution or [STart
 * angle/Reverse/EXpression] <360>:`, LASTPOINT put on the axis
 * ({@link revolveBase}): 0 or a turn or more is a whole one (r05, r07),
 * negative turns back, a coordinate typed its first number (p228), a click
 * the plan angle from LASTPOINT's place (desktop d06); STart
 * angle asks `Specify start angle <0.0>:` and the angle again without
 * Reverse; Reverse turns the axis round. DELOBJ as EXTRUDE's (r09). One undo
 * step. The rail runs the ribbon's macro ({@link RevolveTool.ribbonMacro}).
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
      // What a mode found has no pick: its axis runs from its start (p242).
      take: (entity, ctx) => this.takeAxisObject(entity, undefined, ctx),
      newest: true,
      pick: (point, ctx) => this.pickAxis(point, ctx),
    },
  })

  constructor(private readonly settings: SweepSettings = sweepSettings()) {}

  /**
   * The ribbon's Revolve (acad.cuix ID_Revolve, Home > Modeling):
   * `^C^C^R_revolve _MO _SO;` (sweeps/p401). Typed, REVOLVE asks as typed.
   */
  ribbonMacro(): RibbonMacro {
    return { command: "REVOLVE", answers: ["_MO", "_SO"] }
  }

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
        return { refusal: "pointOrKeywordRequired" }
      case "axisEnd":
        return { refusal: "invalidPoint" }
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

  /** The axis points move LASTPOINT (p119), which the angle prompt then puts on the axis. */
  setsLastPoint(): boolean | null {
    const phase = this.state.phase
    return phase === "axisStart" || phase === "axisEnd" ? true : null
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
          const ucs = ctx.ucs
          const direction =
            id === "X" ? ucs.xAxis : id === "Y" ? ucs.yAxis : ucsZAxis(ucs)
          this.axisGiven({ origin: ucs.origin, direction }, ctx)
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
      // A click at the angles is measured here, from their base (d06).
      case "angle":
      case "startAngle":
        return true
      default:
        return false
    }
  }

  getConstraintAnchor(): Vec3 | null {
    const state = this.state
    if (state.phase === "axisEnd") return state.start
    if (state.phase === "angle" || state.phase === "startAngle") {
      return this.angleBase(state.axis)
    }
    return null
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
      if (this.axisPick.inMode()) this.axisPick.onPointerDown(input, ctx)
      else if (input.button === 0) this.pickAxis(input.point, ctx)
      return
    }
    if (input.button !== 0) return
    this.takePoint(input.point, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.selector.onPointerUp(input, ctx)
    else if (this.state.phase === "object") {
      this.axisPick.onPointerUp(input, ctx)
    }
  }

  /** The set as it closes, the axis as it is dragged, then the whole turn the angle starts from. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "select") return this.selector.buildOverlay(ctx)
    if (state.phase === "object") return this.axisPick.buildOverlay(ctx)
    if (state.phase !== "angle") return []
    const stroke = { color: currentColor(ctx), width: 1 }
    return this.solids(state.axis, 0, 2 * Math.PI, ctx, false).flatMap(
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

  /** A pick at `Select an object:`: on nothing AUto's window starts there (p241). */
  private pickAxis(point: Vec3, ctx: ToolContext): void {
    const hit = ctx.pick(point)
    if (hit) this.takeAxisObject(hit, point, ctx)
    else this.axisPick.startWindow(point, ctx)
  }

  /**
   * The axis an object gives: the chord of its two ends — a line's, a
   * polyline's of any segments, an arc's, a spline's — from the end nearer
   * the pick in a straight line (sweeps/p233–p237, p265–p267, p403, p404),
   * from its start with no pick (a mode, r08's entity name, p242); a closed
   * object gives none and ends the command (r01). WHY a tie is not settled:
   * AutoCAD broke it from a line's start (p402) and an arc's end (p236).
   */
  private takeAxisObject(
    entity: Entity,
    at: Vec2 | undefined,
    ctx: ToolContext
  ): void {
    const ends = closedLoop(entity) === "open" ? objectEnds(entity) : null
    if (!ends) {
      ctx.report(ctx.text.message("revolveClosedAxis"), "error")
      ctx.endCommand()
      return
    }
    const [start, end] =
      at && V.distance(at, ends[1]) < V.distance(at, ends[0])
        ? [ends[1], ends[0]]
        : ends
    const direction = normalize3(sub3(end, start))
    if (!direction) {
      ctx.report(ctx.text.message("revolveZeroAxis"), "error")
      ctx.endCommand()
      return
    }
    this.axisGiven({ origin: start, direction }, ctx)
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase === "angle" || state.phase === "startAngle") {
      // The plan angle from the base to the point, counter-clockwise from
      // the UCS's X, 0–360 (desktop sweeps/d06: 10,15 from 0,5 is 45).
      const base = worldPointToUcs(ctx.ucs, this.angleBase(state.axis))
      const at = worldPointToUcs(ctx.ucs, point)
      const degrees = normalizeDegrees(
        (Math.atan2(at.y - base.y, at.x - base.x) * 180) / Math.PI
      )
      this.takeValue(degrees, ctx)
      return
    }
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
      this.axisGiven(
        { origin: state.start, direction: normalize3(direction)! },
        ctx
      )
    }
  }

  /**
   * The axis complete, however it was given: every profile it cannot turn
   * is said, and the command ends before any angle is asked (r05, r07,
   * p244, p245).
   */
  private axisGiven(axis: Axis, ctx: ToolContext): void {
    const lines = this.profiles.flatMap(({ profile }) =>
      refusalOf(profile, axis)
    )
    if (lines.length > 0) {
      for (const id of lines) ctx.report(ctx.text.message(id), "error")
      this.state = { phase: "select" }
      ctx.dynamicInput.close()
      ctx.endCommand()
      return
    }
    this.askAngle(axis, null, ctx)
  }

  /**
   * The angle asked, LASTPOINT put on the axis across the first profile
   * (p119–p123, p151), where a typed angle or point leaves it (p120).
   */
  private askAngle(axis: Axis, start: number | null, ctx: ToolContext): void {
    this.state = { phase: "angle", axis, start }
    ctx.setLastPoint(this.angleBase(axis))
    this.openValue(ctx, "revolveAngleOr")
  }

  /** The angles' base: the first profile's {@link revolveBase} on `axis`. */
  private angleBase(axis: Axis): Vec3 {
    const first = this.profiles[0]?.profile
    return first && first !== "crosses"
      ? revolveBase(first, axis.origin, axis.direction)
      : axis.origin
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

  /** The solids, each profile on its own, every one turnable (axisGiven). */
  private solids(
    axis: Axis,
    startDegrees: number,
    angleRadians: number,
    ctx: ToolContext,
    report: boolean
  ): Entity[] {
    const made: Entity[] = []
    const startRadians = (startDegrees * Math.PI) / 180
    // A region's faces each make a solid (sweeps/p332).
    const faces = this.profiles.flatMap(({ profile }) =>
      profile === "crosses" ? [] : sweptFaces(profile)
    )
    for (const profile of faces) {
      const out = revolveSide(profile, axis.origin, axis.direction)
      if (typeof out === "string") continue
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
    return made
  }

  private revolve(
    axis: Axis,
    startDegrees: number,
    angleDegrees: number,
    ctx: ToolContext
  ): void {
    const made = this.solids(
      axis,
      startDegrees,
      (angleDegrees * Math.PI) / 180,
      ctx,
      true
    )
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

  /**
   * An angle's box: degrees typed, a coordinate its first number (p228,
   * p230); Enter its `<360>` or `<0.0>`.
   */
  private openValue(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt, kind: "angle" }],
      coordinateAsNumber: true,
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
        const state = this.state
        if (state.phase !== "expression") return true
        const text = commitCtx.dynamicInput.getText("expression").trim()
        // Enter goes back to the angle, nothing said (p225).
        if (text === "") {
          this.askAngle(state.axis, state.start, commitCtx)
          return true
        }
        const value = evaluateExpression(text)
        if (value === null) {
          commitCtx.report(commitCtx.text.message("expressionSyntax"), "error")
          return true
        }
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
      ctx.report(ctx.text.message("invalidPoint"), "error")
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

/**
 * The lines REVOLVE says of a profile it cannot turn round `axis` (r05, r07,
 * p244); none for one it can.
 */
function refusalOf(profile: Profile["profile"], axis: Axis): MessageId[] {
  if (profile === "crosses") return ["revolveSelfIntersecting", "revolveUnable"]
  const out = revolveSide(profile, axis.origin, axis.direction)
  if (out === "crossesAxis") return ["revolveOneSide", "revolveUnable"]
  if (out === "perpendicularAxis") {
    return ["revolvePerpendicular", "revolveUnable"]
  }
  return out === "notInPlane" ? ["revolveUnable"] : []
}

/** An open object's two ends, read where it lies; null for one with none here. */
function objectEnds(entity: Entity): [Vec3, Vec3] | null {
  switch (entity.type) {
    case "line":
      return [
        { ...entity.start, z: lineStartZ(entity) },
        { ...entity.end, z: lineEndZ(entity) },
      ]
    case "arc":
      return [
        entityPointToWorld(entity, arcStartPoint(entity)),
        entityPointToWorld(entity, arcEndPoint(entity)),
      ]
    case "spline":
      return [
        entityPointToWorld(entity, splineStartPoint(entity)),
        entityPointToWorld(entity, splineEndPoint(entity)),
      ]
    case "polyline": {
      const vertices = entityShape(entity).vertices
      if (vertices.length < 2) return null
      return [
        entityPointToWorld(entity, vertices[0]),
        entityPointToWorld(entity, vertices[vertices.length - 1]),
      ]
    }
    case "polyline3d": {
      const vertices = entityShape(entity).vertices
      if (vertices.length < 2) return null
      return [vertices[0], vertices[vertices.length - 1]]
    }
    default:
      return null
  }
}
