import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import {
  ArcSegment,
  arcAlongChord,
  arcAroundChord,
  arcAroundToward,
  arcThroughBulge,
  bulgeOfAngle,
  endAround,
  radiusArcBulge,
  tangentArcBulge,
} from "../../geometry/bulgeArcs"
import { normalizeDegrees } from "../../geometry/primitives"
import { formatAngle, parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { MessageId } from "../EngineText"
import type { MessageValues } from "../../i18n/types"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** Where the next arc starts: the chain's last point and the way it leaves it. */
export interface ArcStart {
  readonly point: Vec3
  readonly tangent: Vec2
  /**
   * The tangent is a rising line's, taken in the UCS's plane: the chord's
   * `<default>` says so first (table 21314, pline/p149).
   */
  readonly offPlane?: boolean
}

/** What the command drawing the arcs hands {@link ArcSegmentInput}. */
export interface ArcSegmentHost {
  /** The arc the option's answers make. */
  readonly finish: (segment: ArcSegment, ctx: ToolContext) => void
  /** The option cancelled at `*Invalid*`: the command asks its arc prompt again. */
  readonly back: (ctx: ToolContext) => void
  /**
   * CEnter's included angle names Ctrl, as PLINE's does; DIST's 2027 prompt
   * does not (pline/p145).
   */
  readonly ctrlAtCenterAngle: boolean
}

/**
 * The options of AutoCAD's arc endpoint prompt that open prompts of their
 * own, in its order; the command adds its own between them (PLINE's CLose
 * and Line, `[Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]`).
 */
export const ARC_SEGMENT_OPTIONS = [
  "Angle",
  "Center",
  "Direction",
  "Radius",
  "Second pt",
] as const

type Step =
  | { readonly kind: "included" }
  | { readonly kind: "angleEnd"; readonly included: number }
  | { readonly kind: "angleCenter"; readonly included: number }
  | { readonly kind: "angleRadius"; readonly included: number }
  | {
      readonly kind: "chordDirection"
      readonly included: number
      readonly radius: number
    }
  | { readonly kind: "center" }
  | { readonly kind: "centerEnd"; readonly center: Vec2 }
  | { readonly kind: "centerAngle"; readonly center: Vec2 }
  | { readonly kind: "centerChord"; readonly center: Vec2 }
  | { readonly kind: "direction" }
  | { readonly kind: "directionEnd"; readonly tangent: Vec2 }
  | { readonly kind: "radius" }
  | { readonly kind: "radiusEnd"; readonly radius: number }
  | { readonly kind: "radiusAngle"; readonly radius: number }
  | { readonly kind: "second" }
  | { readonly kind: "secondEnd"; readonly second: Vec2 }

type StepKind = Step["kind"]

/** The steps that ask a point, and the keywords each offers beside it. */
const POINT_STEPS: Partial<Record<StepKind, readonly string[]>> = {
  angleEnd: ["Center", "Radius"],
  angleCenter: [],
  center: [],
  centerEnd: ["Angle", "Length"],
  directionEnd: [],
  radiusEnd: ["Angle"],
  second: [],
  secondEnd: [],
}

const QUESTIONS: Record<StepKind, PromptId> = {
  included: "specifyIncludedAngle",
  angleEnd: "specifyEndpointOfArcOr",
  angleCenter: "specifyCenterPointOfArc",
  angleRadius: "specifyRadiusOfArc",
  chordDirection: "specifyDirectionOfChordForArc",
  center: "specifyCenterPointOfArc",
  centerEnd: "specifyEndpointOfArcOr",
  centerAngle: "specifyIncludedAngleCtrl",
  centerChord: "specifyLengthOfChordCtrl",
  direction: "specifyTangentDirectionForStartPointOfArc",
  directionEnd: "specifyEndpointOfTheArcCtrl",
  radius: "specifyRadiusOfArc",
  radiusEnd: "specifyEndpointOfArcOr",
  radiusAngle: "specifyIncludedAngle",
  second: "specifySecondPointOnArc",
  secondEnd: "specifyEndPointOfArc",
}

/**
 * The prompts an arc option of AutoCAD's PLINE opens — Angle, CEnter,
 * Direction, Radius and Second pt, each to its own endpoint, centre, radius
 * or chord — as one piece any command drawing a polyline's arcs holds (PLINE,
 * DIST's Arc), so they ask the same and draw the same: a tool hands it every
 * call while {@link active}, and it hands back the finished {@link
 * ArcSegment}. Its distances and angles are boxes the runtime also measures
 * by points: from the start point (an angle, a chord's length) or by two of
 * their own (the radius), as AutoCAD 2027's console asks them (pline/p140,
 * p141). Ctrl held at the last pick or move turns the arc the other way, as
 * each prompt says. An answer that makes no arc is `*Invalid*` and the
 * option is left for the arc prompt, LASTPOINT back at the arc's start
 * (p118–p125, p250–p255).
 */
export class ArcSegmentInput {
  private step: Step | null = null
  private from: ArcStart | null = null
  private cursor: Vec3 | null = null
  private clockwise = false
  /** The chord's `<default>` as first written, which 'AUPREC leaves (p114). */
  private chordDefault = ""

  constructor(private readonly host: ArcSegmentHost) {}

  get active(): boolean {
    return this.step !== null
  }

  cancel(): void {
    this.step = null
    this.from = null
  }

  /** Starts `option` from `from`; false for an option that is not an arc's. */
  begin(option: string, from: ArcStart, ctx: ToolContext): boolean {
    const first: Partial<Record<string, Step>> = {
      Angle: { kind: "included" },
      Center: { kind: "center" },
      Direction: { kind: "direction" },
      Radius: { kind: "radius" },
      "Second pt": { kind: "second" },
    }
    const step = first[option]
    if (!step) return false
    this.from = from
    this.cursor = from.point
    this.ask(step, ctx)
    return true
  }

  question(): PromptId | ToolQuestion | null {
    const step = this.step
    if (step === null) return null
    if (step.kind === "chordDirection") {
      return { id: QUESTIONS[step.kind], enter: { name: this.chordDefault } }
    }
    if (step.kind === "centerAngle" && !this.host.ctrlAtCenterAngle) {
      return "specifyIncludedAngle"
    }
    return QUESTIONS[step.kind]
  }

  /** A point step's later points are 2D, as PLINE's are; a box tells the rest. */
  takes(): QuestionInput | null {
    return this.step && POINT_STEPS[this.step.kind] ? "point2d" : null
  }

  commandOptions(): readonly CommandOption[] {
    const keywords = this.step ? POINT_STEPS[this.step.kind] : undefined
    return (keywords ?? []).map((id) => ({ id }))
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const step = this.step
    if (step === null || !POINT_STEPS[step.kind]?.includes(id)) {
      return "unhandled"
    }
    switch (step.kind) {
      case "angleEnd":
        this.ask(
          id === "Center"
            ? { kind: "angleCenter", included: step.included }
            : { kind: "angleRadius", included: step.included },
          ctx
        )
        return "continue"
      case "centerEnd":
        this.ask(
          id === "Angle"
            ? { kind: "centerAngle", center: step.center }
            : { kind: "centerChord", center: step.center },
          ctx
        )
        return "continue"
      case "radiusEnd":
        this.ask({ kind: "radiusAngle", radius: step.radius }, ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  /**
   * A point step takes the pick itself; a distance or an angle leaves its
   * points to the runtime, which measures them from {@link anchor}.
   */
  wantsSnap(): boolean {
    return this.step !== null && POINT_STEPS[this.step.kind] !== undefined
  }

  /** Where an angle or a chord's length is measured from: the start point. */
  anchor(): Vec3 | null {
    const step = this.step
    if (step === null || this.from === null) return null
    // WHY none for the radius: the console measures it by two points.
    return step.kind === "radius" || step.kind === "angleRadius"
      ? null
      : this.from.point
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.cursor = input.point
    this.clockwise = input.ctrlKey
    const step = this.step
    const from = this.from
    if (step === null || from === null) return
    if (isAngleStep(step.kind)) {
      ctx.dynamicInput.setLive("value", headingDegrees(from.point, input.point))
    } else if (step.kind === "centerChord") {
      ctx.dynamicInput.setLive("value", V.distance(from.point, input.point))
    }
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    this.clockwise = input.ctrlKey
    this.givePoint(input.point, ctx)
  }

  /**
   * Enter with nothing given: a step with no default refuses it, as the
   * console does (`Invalid 2D point.`), rather than ending the command.
   */
  onEnter(ctx: ToolContext): boolean {
    const step = this.step
    if (step === null) return false
    const [id, values] = enterRefusal(step.kind)
    ctx.report(ctx.text.message(id, values), "error")
    return true
  }

  /**
   * The step asks the arc's endpoint and the preview runs to the cursor:
   * AutoCAD draws the chord from the start point beside the arc (desktop
   * pline/d06). CEnter's endpoint and Angle's centre end elsewhere, unseen.
   */
  endsAtCursor(): boolean {
    const kind = this.step?.kind
    return (
      kind === "angleEnd" ||
      kind === "directionEnd" ||
      kind === "radiusEnd" ||
      kind === "secondEnd"
    )
  }

  /** The arc as it would be if the cursor answered the step, for the preview. */
  preview(ctx: ToolContext): ArcSegment | null {
    const step = this.step
    const from = this.from
    const cursor = this.cursor
    if (step === null || from === null || cursor === null) return null
    if (POINT_STEPS[step.kind]) return this.segmentTo(step, cursor)
    const typed = parseNumber(ctx.dynamicInput.getText("value").trim())
    const value =
      typed !== null && Number.isFinite(typed)
        ? typed
        : step.kind === "centerChord"
          ? V.distance(from.point, cursor)
          : isAngleStep(step.kind)
            ? headingDegrees(from.point, cursor)
            : null
    return value === null ? null : this.segmentOf(step, value)
  }

  /** Asks `step`, its box open on a point or on its one value. */
  private ask(step: Step, ctx: ToolContext): void {
    this.step = step
    if (step.kind === "chordDirection") {
      const degrees = this.tangentDegrees()
      this.chordDefault = formatAngle(degrees, ctx.document.getSettings())
      if (this.from?.offPlane) {
        ctx.report(
          ctx.text.message("previousDirectionNotUcsParallel", {
            angle: this.chordDefault,
          })
        )
      }
    }
    const at = ctx.dynamicInput.getScreen() ?? { x: 0, y: 0 }
    const session: DynamicInputSession = POINT_STEPS[step.kind]
      ? {
          fields: [
            { id: "point", prompt: pointLabel(step.kind), kind: "coordinate" },
          ],
          commit: () => {},
          commitRaw: (commitCtx) => this.typedPoint(commitCtx),
        }
      : {
          fields: [
            {
              id: "value",
              prompt: valueLabel(step.kind),
              kind: isAngleStep(step.kind) ? "angle" : "distance",
            },
          ],
          commit: (values, commitCtx) =>
            this.giveValue(values.value, commitCtx),
          // The chord's `<default>`, which the cursor's reading overwrites,
          // and Direction's unshown one, the way the chain heads (p134).
          commitRaw: (commitCtx) => {
            if (commitCtx.dynamicInput.hasTypedText()) return false
            if (step.kind === "chordDirection") {
              this.giveValue(this.tangentDegrees(), commitCtx)
              return true
            }
            if (step.kind !== "direction" || this.from === null) return false
            this.ask(
              { kind: "directionEnd", tangent: this.from.tangent },
              commitCtx
            )
            return true
          },
        }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(at)
    ctx.requestRender()
  }

  /** `@` is from LASTPOINT: Second pt's end from its second point (p138). */
  private typedPoint(ctx: ToolContext): boolean {
    if (this.from === null) return false
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: true,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.givePoint(point, ctx)
    return true
  }

  private givePoint(point: Vec3, ctx: ToolContext): void {
    const step = this.step
    if (step === null || !POINT_STEPS[step.kind]) return
    switch (step.kind) {
      case "center":
        this.ask({ kind: "centerEnd", center: point }, ctx)
        return
      case "second":
        this.ask({ kind: "secondEnd", second: point }, ctx)
        return
    }
    this.complete(this.segmentTo(step, point), ctx)
  }

  /**
   * A distance or an angle (degrees) answering the step. An included angle
   * of a whole turn, the radius and CEnter's chord are refused if 0, `Value
   * must be nonzero.` (p110, p111, p133, p136); a negative radius is the
   * major arc (p122), and Angle's radius takes 0 and less (p131, p256).
   */
  private giveValue(value: number, ctx: ToolContext): void {
    const step = this.step
    if (step === null || !Number.isFinite(value)) return
    const radians = (value * Math.PI) / 180
    switch (step.kind) {
      case "included":
        if (isWholeTurn(value)) {
          ctx.report(ctx.text.message("valueMustBeNonzero"), "error")
          return
        }
        this.ask({ kind: "angleEnd", included: radians }, ctx)
        return
      case "direction":
        this.ask(
          {
            kind: "directionEnd",
            tangent: { x: Math.cos(radians), y: Math.sin(radians) },
          },
          ctx
        )
        return
      case "radius":
        if (value === 0) {
          ctx.report(ctx.text.message("valueMustBeNonzero"), "error")
          return
        }
        this.ask({ kind: "radiusEnd", radius: value }, ctx)
        return
      case "centerChord":
        if (value === 0) {
          ctx.report(ctx.text.message("valueMustBeNonzero"), "error")
          return
        }
        break
      case "angleRadius":
        this.ask(
          { kind: "chordDirection", included: step.included, radius: value },
          ctx
        )
        return
      case "radiusAngle":
        this.ask(
          { kind: "chordDirection", included: radians, radius: step.radius },
          ctx
        )
        return
    }
    this.complete(this.segmentOf(step, value), ctx)
  }

  /** The arc a point gives at a point step. */
  private segmentTo(step: Step, point: Vec2): ArcSegment | null {
    const from = this.from
    if (from === null) return null
    const start = from.point
    const turn = this.clockwise ? -1 : 1
    switch (step.kind) {
      case "angleEnd":
        return V.distance(start, point) < 1e-9
          ? null
          : { end: point, bulge: bulgeOfAngle(turn * step.included) }
      case "angleCenter":
        return {
          end: endAround(start, point, step.included),
          bulge: bulgeOfAngle(step.included),
        }
      case "centerEnd":
        return arcAroundToward(start, step.center, point, this.clockwise)
      case "directionEnd": {
        const tangent = this.clockwise
          ? V.scale(step.tangent, -1)
          : step.tangent
        const bulge = tangentArcBulge(start, tangent, point)
        return bulge === null ? null : { end: point, bulge }
      }
      case "radiusEnd": {
        const bulge = radiusArcBulge(start, point, step.radius, this.clockwise)
        return bulge === null ? null : { end: point, bulge }
      }
      case "secondEnd": {
        const bulge = arcThroughBulge(start, step.second, point)
        return bulge === null ? null : { end: point, bulge }
      }
      default:
        return null
    }
  }

  /** The arc a value gives at the step that completes one. */
  private segmentOf(step: Step, value: number): ArcSegment | null {
    const from = this.from
    if (from === null) return null
    const radians = (value * Math.PI) / 180
    const turn = this.clockwise ? -1 : 1
    switch (step.kind) {
      case "chordDirection":
        return arcAlongChord(
          from.point,
          step.radius,
          turn * step.included,
          radians
        )
      case "centerAngle": {
        // WHY null: the console's `*Invalid*` for a whole turn (p250, p251).
        if (isWholeTurn(value)) return null
        const included = turn * radians
        return {
          end: endAround(from.point, step.center, included),
          bulge: bulgeOfAngle(included),
        }
      }
      case "centerChord":
        return arcAroundChord(from.point, step.center, value, this.clockwise)
      default:
        return null
    }
  }

  /**
   * Hands back the arc and leaves the steps, LASTPOINT at its end whatever
   * answered last (a chord, a ray's point: pline/p117, p138); one that does
   * not exist is AutoCAD's `*Invalid*`, and the arc prompt is asked again.
   */
  private complete(segment: ArcSegment | null, ctx: ToolContext): void {
    const from = this.from
    this.cancel()
    if (segment !== null) {
      if (from !== null) ctx.setLastPoint(withZOf(segment.end, from.point))
      this.host.finish(segment, ctx)
      return
    }
    ctx.report(ctx.text.message("invalid"), "error")
    if (from !== null) ctx.setLastPoint(from.point)
    this.host.back(ctx)
  }

  /** The start tangent's heading, the chord direction's `<default>`. */
  private tangentDegrees(): number {
    const tangent = this.from?.tangent ?? { x: 1, y: 0 }
    return normalizeDegrees((Math.atan2(tangent.y, tangent.x) * 180) / Math.PI)
  }
}

/** An angle that turns back where it started (0, 360, -720). */
function isWholeTurn(degrees: number): boolean {
  const left = normalizeDegrees(degrees)
  return left < 1e-9 || 360 - left < 1e-9
}

function isAngleStep(kind: StepKind): boolean {
  return (
    kind === "included" ||
    kind === "chordDirection" ||
    kind === "centerAngle" ||
    kind === "direction" ||
    kind === "radiusAngle"
  )
}

/** The heading, in degrees, of the line from `from` to `to`. */
function headingDegrees(from: Vec2, to: Vec2): number {
  return normalizeDegrees(
    (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
  )
}

function pointLabel(kind: StepKind): PromptId {
  switch (kind) {
    case "center":
    case "angleCenter":
      return "centerPoint"
    case "second":
      return "secondPoint"
    default:
      return "endPoint"
  }
}

function valueLabel(kind: StepKind): PromptId {
  switch (kind) {
    case "included":
    case "radiusAngle":
    case "centerAngle":
      return "includedAngle"
    case "radius":
    case "angleRadius":
      return "radius"
    case "centerChord":
      return "length"
    default:
      return "angle"
  }
}

/** What the console answers Enter with at a step that offers no default. */
function enterRefusal(kind: StepKind): [MessageId, MessageValues?] {
  const keywords = POINT_STEPS[kind]
  if (keywords) {
    return [keywords.length > 0 ? "point2dOrKeywordRequired" : "invalidPoint2d"]
  }
  if (isAngleStep(kind)) {
    return ["requiresAngle", { points: "second", keyword: "no" }]
  }
  return [
    "requiresDistance",
    { points: kind === "centerChord" ? "second" : "two", keyword: "no" },
  ]
}
