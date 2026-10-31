import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import {
  angleWithinSweep,
  closestPointOnArc,
  closestPointOnSegment,
  normalizeAngle,
} from "../../geometry/primitives"
import {
  createDimension,
  DimensionEntity,
  Entity,
  entityElevation,
  withElevation,
  polylineSegmentGeometries,
  readsInPlan,
  regionEdgeAt,
} from "../../domain/entities"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  openDimensionTextAngleInput,
  openDimensionTextInput,
} from "./dimensionTextOptions"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"
import { measurementOf } from "./DimensionTool"
import { rollover } from "./ghostLook"
import { typedPick } from "./typedPick"

/** Which measurement a radial dimension reports. */
export type RadialDimensionKind = "radius" | "diameter"

/**
 * AutoCAD's DIMRADIUS and DIMDIAMETER, one class parameterised by which of them
 * it is — they run the identical two prompts and differ only in the number they
 * report and the symbol in front of it ("R" or "Ø").
 *
 * The prompts are AutoCAD 2027's (probes dimensions/p300, p309, p320,
 * p321): `Select arc or circle:` — "specifies a circle, arc, or arc segment
 * on a polyline", anything else refused as `Object selected is not a circle
 * or arc.` —, `Dimension text = 50` said at once, then `Specify dimension
 * line location or [Text/Angle]:`, which "determines the angle of the
 * dimension line and the location of the dimension text", its Text asking
 * `Enter dimension text <50>:` and Angle `Specify angle of dimension text:`.
 * The command ends the moment the location is picked, or at Enter, which
 * places it at the cursor (p317, p333). How each placement draws is
 * `dimensionGeometry`'s.
 *
 * AutoCAD's **Mtext** keyword is absent: it edits the dimension text in the
 * multiline editor, and a dimension's text here is a single line.
 *
 * One deviation, and the two halves of it go together. AutoCAD lets the
 * dimension line of an arc point past the arc's own sweep and then "draws an
 * arc extension line" to reach it; that extension line is not implemented here,
 * so instead the direction is kept inside the sweep. The arrowhead therefore
 * always lands on geometry that exists, rather than in the empty space where
 * the arc would have been extended.
 */
export class RadialDimensionTool implements Tool {
  private state: RadialToolState = { phase: "select", hover: null }
  /** The measurement Text offers as its `<default>`. */
  private measured = ""
  private text: string | undefined
  private textAngle: number | undefined
  private lastScreen: Vec2 | null = null

  constructor(
    private readonly kind: RadialDimensionKind,
    readonly id: string
  ) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.text = undefined
    this.textAngle = undefined
    this.enterSelect(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "select") {
      const hover = this.pickMeasurable(input.world, ctx)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { phase: "select", hover }
      }
    } else {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "select") {
      this.pickAt(input.world, ctx)
    } else {
      this.place(input.point, ctx)
    }
    ctx.requestRender()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    if (state.phase === "select") return "selectArcOrCircle"
    switch (state.prompt) {
      case "text":
        return { id: "enterDimensionText", enter: { name: this.measured } }
      case "textAngle":
        return "specifyAngleOfDimensionText"
      case null:
        return "dimensionLineLocationOr"
    }
  }

  /** As AutoCAD 2027's console refuses a dimension's answers (p307, p316). */
  takes(): QuestionInput | null {
    const state = this.state
    if (state.phase === "select") return "singleObject"
    switch (state.prompt) {
      case "text":
        return null
      case "textAngle":
        return { refusal: "invalidInputCapital" }
      case null:
        return { refusal: "invalidPointInput" }
    }
  }

  /**
   * The pick and the location are LASTPOINT once given, which their refusal
   * of its own would hide from the runtime (probes dimensions/p300, p336).
   */
  setsLastPoint(): boolean | null {
    const state = this.state
    return state.phase === "select" || state.prompt === null ? true : null
  }

  /** `Select arc or circle:` takes a locked layer's objects (probe dimensions/p315). */
  picksLocked(): boolean {
    return this.state.phase === "select"
  }

  /** `<30` at Angle is that angle (probe dimensions/p130, DIMLINEAR's). */
  answersAngleOverride(): boolean {
    return this.state.phase === "location" && this.state.prompt === "textAngle"
  }

  /** A point typed at `Select arc or circle:` picks there (probe dimensions/p300). */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.pickAt(point, ctx)
    return true
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "location" || this.state.prompt !== null) return []
    return [{ id: "Text" }, { id: "Angle" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "location") return "unhandled"
    switch (id) {
      case "Text":
        this.measured = measurementOf(
          this.pending(this.state.target, this.state.cursor, ctx),
          ctx
        )
        this.state = { ...this.state, prompt: "text" }
        openDimensionTextInput(ctx, this.lastScreen, (text, commitCtx) => {
          this.text = text
          this.returnToLocation(commitCtx)
        })
        return "continue"
      case "Angle":
        this.state = { ...this.state, prompt: "textAngle" }
        openDimensionTextAngleInput(
          ctx,
          this.lastScreen,
          this.textAngle,
          (radians, commitCtx) => {
            this.textAngle = radians
            this.returnToLocation(commitCtx)
          }
        )
        return "continue"
      default:
        return "unhandled"
    }
  }

  /**
   * None: the location has no base point (the console's trace: UseBasePoint
   * false, probe dimensions/p300), so Ortho and Polar leave it alone and a
   * point typed there reads from LASTPOINT.
   */
  getConstraintAnchor(): Vec2 | null {
    return null
  }

  /** The text's angle is two points the runtime measures. */
  wantsSnap(): boolean {
    return this.state.phase === "location" && this.state.prompt !== "textAngle"
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "select") {
      return this.state.hover ? rollover(ctx, this.state.hover) : []
    }
    return entityScenePrimitive(
      ctx.viewport,
      this.pending(
        this.state.target,
        this.state.cursor,
        ctx,
        RADIAL_PREVIEW_ID
      ),
      { color: THEME.rubberBand, width: 1 },
      {
        dimStyle: ctx.document.getDimStyle(ctx.document.getCurrentDimStyleId()),
      }
    )
  }

  /**
   * The dimension as it stands with the location at `at`. Shared by the live
   * preview and by both commit paths, so what is drawn is what is created. It
   * lies at the current ELEVATION, whatever the location's Z (probe
   * dimensions/p324).
   */
  private pending(
    target: MeasuredCircle,
    at: Vec2 | Vec3,
    ctx: ToolContext,
    id?: string
  ): DimensionEntity {
    const dir = measuredDirection(target, at)
    return withElevation(
      createDimension(
        this.kind,
        target.center,
        V.add(target.center, V.scale(dir, target.radius)),
        at,
        {
          text: this.text,
          textAngle: this.textAngle,
          styleId: ctx.document.getCurrentDimStyleId(),
          layerId: ctx.document.getCurrentLayerId(),
          ...(id !== undefined ? { id } : {}),
        }
      ),
      ctx.elevation
    )
  }

  private place(at: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "location") return
    const dim = this.pending(this.state.target, at, ctx)
    ctx.execute(new AddEntityCommand(withCurrentProperties(dim, ctx)))
    ctx.endCommand()
  }

  /**
   * `Select arc or circle:` at `world`: a circle or arc starts the location
   * prompt, any other object is refused in words and nothing is passed over
   * in silence (probes dimensions/p309–p314). WHY a block reference is
   * silent: AutoCAD's prompt picks inside one (a nested pick, p300's trace),
   * which is not built here.
   */
  private pickAt(world: Vec2, ctx: ToolContext): void {
    const hit = ctx.pick(world)
    if (!hit || !readsInPlan(hit) || hit.type === "insert") return
    const target = measuredCircle(hit, world)
    if (target) {
      this.enterLocation(target, ctx)
    } else {
      ctx.report(ctx.text.message("notCircleOrArc"))
    }
  }

  /** The object under the cursor a radial dimension can be taken from, in the UCS's plane. */
  private pickMeasurable(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    return hit && readsInPlan(hit) && measuredCircle(hit, world) ? hit : null
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    // Keyword-only prompt: no field, so the canvas keeps focus and Escape or
    // Enter reaches the runtime, which ends the command.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  /** The measurement is said as the object is taken (probe dimensions/p300). */
  private enterLocation(target: MeasuredCircle, ctx: ToolContext): void {
    this.state = {
      phase: "location",
      target,
      cursor: target.center,
      prompt: null,
    }
    const dim = this.pending(target, target.center, ctx)
    ctx.report(
      ctx.text.message("dimensionTextIs", { text: measurementOf(dim, ctx) })
    )
    this.openLocationInput(ctx)
  }

  private returnToLocation(ctx: ToolContext): void {
    if (this.state.phase !== "location") return
    this.state = { ...this.state, prompt: null }
    this.openLocationInput(ctx)
  }

  private openLocationInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [
        {
          id: "point",
          prompt: "dimensionLineLocation",
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "location") return false
        const typed = commitCtx.dynamicInput.getText("point").trim()
        // Enter places it at the cursor, the jig's point (probes
        // dimensions/p317, p333; desktop d06).
        if (typed === "") {
          this.place(this.state.cursor, commitCtx)
          return true
        }
        if (!isCoordinateExpression(typed)) return false
        const point = parseCoordinate(typed, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.place(point, commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const RADIAL_PREVIEW_ID = "__radial_dimension_preview__"

/** A circular thing a radial dimension can measure, and how much of it exists. */
interface MeasuredCircle {
  /** At the object's height: a location typed relative to it keeps that Z. */
  readonly center: Vec3
  readonly radius: number
  /** The sweep a partial arc covers; null for a whole circle. */
  readonly startAngle: number | null
  readonly endAngle: number | null
}

/**
 * The circle a radial dimension would measure on `entity`, following AutoCAD's
 * "a circle, arc, or arc segment on a polyline". Everything else — a line, text,
 * another dimension, a straight polyline segment — gives nothing.
 */
function measuredCircle(entity: Entity, at: Vec2): MeasuredCircle | null {
  switch (entity.type) {
    case "circle":
      return {
        center: withZ(entity.center, entityElevation(entity)),
        radius: entity.radius,
        startAngle: null,
        endAngle: null,
      }
    case "arc":
      return {
        center: withZ(entity.center, entityElevation(entity)),
        radius: entity.radius,
        startAngle: entity.startAngle,
        endAngle: entity.endAngle,
      }
    case "polyline": {
      // The segment picked, which a straight one refuses (probe dimensions/p314).
      let best: MeasuredCircle | null = null
      let bestDistance = Infinity
      for (const seg of polylineSegmentGeometries(entity)) {
        const distance =
          seg.kind === "arc"
            ? closestPointOnArc(
                seg.center,
                seg.radius,
                seg.startAngle,
                seg.endAngle,
                at
              ).distance
            : closestPointOnSegment(seg.a, seg.b, at).distance
        if (distance < bestDistance) {
          bestDistance = distance
          best =
            seg.kind === "arc"
              ? {
                  center: withZ(seg.center, entityElevation(entity)),
                  radius: seg.radius,
                  startAngle: seg.startAngle,
                  endAngle: seg.endAngle,
                }
              : null
        }
      }
      return best
    }
    case "region":
      // A circle or arc edge picked, as that object (region/e04).
      return measuredCircle(regionEdgeAt(entity, at), at)
    case "line":
    case "ellipse":
    case "spline":
    case "polyline3d":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return null
    default: {
      const unhandled: never = entity
      return unhandled
    }
  }
}

/**
 * The direction the dimension line runs in: from the centre towards where the
 * user is placing the text, kept within the sweep of a partial arc so the
 * arrowhead always lands on geometry that exists.
 */
function measuredDirection(target: MeasuredCircle, at: Vec2): Vec2 {
  const offset = V.sub(at, target.center)
  const raw =
    V.length(offset) < 1e-9
      ? (target.startAngle ?? 0)
      : Math.atan2(offset.y, offset.x)
  const angle = clampToSweep(target, raw)
  return { x: Math.cos(angle), y: Math.sin(angle) }
}

function clampToSweep(target: MeasuredCircle, angle: number): number {
  const { startAngle, endAngle } = target
  if (startAngle === null || endAngle === null) return angle
  if (angleWithinSweep(startAngle, endAngle, angle)) return angle
  return normalizeAngle(startAngle - angle) <= normalizeAngle(angle - endAngle)
    ? startAngle
    : endAngle
}

type RadialToolState =
  /** Picking the circle or arc to measure. */
  | { readonly phase: "select"; readonly hover: Entity | null }
  | {
      readonly phase: "location"
      readonly target: MeasuredCircle
      readonly cursor: Vec2
      /** Which sub-prompt is open, so its answer returns here. */
      readonly prompt: "text" | "textAngle" | null
    }
