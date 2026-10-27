import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import {
  angleWithinSweep,
  closestPointOnArc,
  closestPointOnSegment,
  infiniteLineIntersection,
  normalizeAngle,
} from "../../geometry/primitives"
import {
  arcEndPoint,
  arcStartPoint,
  createDimension,
  DimensionEntity,
  Entity,
  entityElevation,
  withElevation,
  polylineSegmentGeometries,
  readsInPlan,
} from "../../domain/entities"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
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
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
  QuestionInput,
} from "./Tool"
import { measurementOf } from "./DimensionTool"
import { withCurrentProperties } from "./currentProperties"
import { rollover } from "./ghostLook"
import { typedPick } from "./typedPick"

/**
 * AutoCAD's DIMANGULAR: "measures the angle between selected geometric objects
 * or 3 points".
 *
 * Its four ways in all hang off one prompt, **select arc, circle, line, or
 * `<specify vertex>`**:
 *
 * - an **arc** (or a polyline arc segment) — "the center of the arc is the
 *   angle vertex, the arc endpoints become the origin points of the extension
 *   lines", so it goes straight to the location;
 * - a **circle** — "uses the selection point as the origin of the first
 *   extension line, the center of the circle is the angle vertex", then asks
 *   for a second endpoint which "does not have to lie on the circle";
 * - a **line**, then a second line — "using each line as a vector for the angle
 *   and the intersection of the lines for the angle vertex". "The arc is always
 *   less than 180 degrees": of the four sectors the two lines make, the one
 *   the location is in (probes dimensions/p344–p348). The same line twice, or
 *   parallel lines, end the command with `Lines are parallel.` (p349, p350);
 * - **Enter** — the three-point form: vertex, then both angle endpoints.
 *
 * Any other object is refused in words, `Object selected is not a line, arc
 * or circle.`, and anything but a line at the second, `Object selected is
 * not a line.` (p354, p355, p358). The prompts are AutoCAD 2027's (p340,
 * p342, p361); Enter at the location ends with nothing (p369).
 *
 * The location prompt then "specifies the placement of the dimension line and
 * determines the direction to draw the extension lines": two sweeps join the
 * endpoints, and the one the location falls in is the one measured, so dragging
 * across a ray gives the reflex angle.
 *
 * Two keywords of AutoCAD's `[Mtext/Text/Angle/Quadrant]` are missing. **Mtext**
 * edits the text in the multiline editor, and a dimension's text here is a
 * single line. **Quadrant**
 * locks the dimension to one quadrant and extends the dimension line past the
 * extension line when the text is pushed outside — a placement mode of its own,
 * left for later.
 */
export class AngularDimensionTool implements Tool {
  readonly id = "dimangular"

  private state: AngularToolState = { phase: "select", hover: null }
  /** Whether the angle is the three-point form's, which no object defines. */
  private byPoints = false
  /** The measurement Text offers as its `<default>`. */
  private measured = ""
  private text: string | undefined
  private textAngle: number | undefined
  private lastScreen: Vec2 | null = null

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
    switch (this.state.phase) {
      case "select":
      case "secondLine": {
        const hover = this.pickMeasurable(input.world, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { ...this.state, hover }
        }
        break
      }
      case "vertex":
        break
      default:
        this.state = { ...this.state, cursor: input.point }
        break
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "select":
        this.selectFirst(input.world, ctx)
        break
      case "secondLine":
        this.selectSecond(input.world, ctx)
        break
      case "vertex":
        this.enterFirstEndpoint(input.point, ctx)
        break
      case "firstEndpoint":
        this.enterSecondEndpoint(this.state.vertex, input.point, ctx)
        break
      case "secondEndpoint":
        this.endpointsGiven(input.point, ctx)
        break
      case "location":
        this.place(input.point, ctx)
        break
    }
    ctx.requestRender()
  }

  /**
   * Enter at the object prompt is AutoCAD's `<specify vertex>` default, which
   * starts the three-point form. It arrives here rather than through a field's
   * `commitRaw` because that prompt is keyword-only: the canvas keeps focus so
   * clicking an object stays the primary gesture.
   */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    this.byPoints = true
    this.state = { phase: "vertex" }
    this.openCoordinate(ctx, "angleVertex", (commitCtx) => {
      const point = this.parsePoint(commitCtx, null)
      if (!point) return false
      this.enterFirstEndpoint(point, commitCtx)
      return true
    })
    return true
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "select":
        return "selectArcCircleLineOrVertex"
      case "secondLine":
        return "selectSecondLine"
      case "vertex":
        return "angleVertex"
      case "firstEndpoint":
        return "firstAngleEndpoint"
      case "secondEndpoint":
        // The circle form's own string, worded apart in Spanish (p342 es).
        return state.circle === null
          ? "secondAngleEndpoint"
          : "circleSecondAngleEndpoint"
      case "location":
        switch (state.prompt) {
          case "text":
            return { id: "enterDimensionText", enter: { name: this.measured } }
          case "textAngle":
            return "specifyAngleOfDimensionText"
          case null:
            return "dimensionArcLocationOr"
        }
    }
  }

  /** As AutoCAD 2027's console refuses a dimension's answers (p353, p358). */
  takes(): QuestionInput | null {
    const state = this.state
    switch (state.phase) {
      case "select":
      case "secondLine":
        return "singleObject"
      case "location":
        if (state.prompt === "text") return null
        if (state.prompt === "textAngle") {
          return { refusal: "invalidInputCapital" }
        }
        return { refusal: "invalidPointInput" }
      default:
        return { refusal: "invalidPointInput" }
    }
  }

  /**
   * The picks, the points and the location are LASTPOINT once given, which
   * their refusal of its own would hide from the runtime (probes
   * dimensions/p335, p340, p362).
   */
  setsLastPoint(): boolean | null {
    const state = this.state
    return state.phase !== "location" || state.prompt === null ? true : null
  }

  /** The object prompts take a locked layer's objects, as DIMRADIUS's (p315). */
  picksLocked(): boolean {
    return this.state.phase === "select" || this.state.phase === "secondLine"
  }

  /** `<30` at Angle is that angle (probe dimensions/p130, DIMLINEAR's). */
  answersAngleOverride(): boolean {
    return this.state.phase === "location" && this.state.prompt === "textAngle"
  }

  /** A point typed at either object prompt picks there (probe dimensions/p335). */
  answerTyped(text: string, ctx: ToolContext): boolean {
    const phase = this.state.phase
    if (phase !== "select" && phase !== "secondLine") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    if (phase === "select") this.selectFirst(point, ctx)
    else this.selectSecond(point, ctx)
    return true
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "location" || this.state.prompt !== null) return []
    return [{ id: "Text" }, { id: "Angle" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "location") return "unhandled"
    switch (id) {
      case "Text": {
        const pending = this.pending(
          this.state.target,
          this.state.cursor,
          ctx,
          ANGULAR_PREVIEW_ID
        )
        this.measured = pending ? measurementOf(pending, ctx) : ""
        this.state = { ...this.state, prompt: "text" }
        openDimensionTextInput(ctx, this.lastScreen, (text, commitCtx) => {
          this.text = text
          this.returnToLocation(commitCtx)
        })
        return "continue"
      }
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
   * The vertex at the endpoints (UseBasePoint true, probe dimensions/p362);
   * none at the location (false, p340), which a point typed there reads from
   * LASTPOINT.
   */
  getConstraintAnchor(): Vec2 | null {
    switch (this.state.phase) {
      case "firstEndpoint":
      case "secondEndpoint":
        return this.state.vertex
      default:
        return null
    }
  }

  wantsSnap(): boolean {
    // Everything but the two object prompts asks for a point; the text's
    // angle is two points the runtime measures.
    return (
      this.state.phase !== "select" &&
      this.state.phase !== "secondLine" &&
      !(this.state.phase === "location" && this.state.prompt === "textAngle")
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const rubber = { color: THEME.rubberBand, width: 1 }

    switch (this.state.phase) {
      case "select":
      case "secondLine":
        return this.state.hover ? rollover(ctx, this.state.hover) : []
      case "firstEndpoint":
      case "secondEndpoint":
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(this.state.vertex),
            b: viewport.worldToScreen(this.state.cursor),
            stroke: rubber,
          },
        ]
      case "location": {
        const pending = this.pending(
          this.state.target,
          this.state.cursor,
          ctx,
          ANGULAR_PREVIEW_ID
        )
        return pending
          ? entityScenePrimitive(viewport, pending, rubber, {
              dimStyle: ctx.document.getDimStyle(
                ctx.document.getCurrentDimStyleId()
              ),
            })
          : []
      }
      default:
        return []
    }
  }

  /**
   * The dimension as it stands with the arc through `at`. Shared by the live
   * preview and the commit, so what is drawn is what is created. Null while the
   * gesture is degenerate — a location on the vertex has no arc to draw. It
   * lies at the current ELEVATION, as every dimension (probes dimensions/p158,
   * p324).
   */
  private pending(
    target: AngularTarget,
    at: Vec2 | Vec3,
    ctx: ToolContext,
    id?: string
  ): DimensionEntity | null {
    const origins = resolveOrigins(target, at)
    if (!origins) return null
    return withElevation(
      createDimension("angular", origins.first, origins.second, at, {
        vertex: target.vertex,
        text: this.text,
        textAngle: this.textAngle,
        styleId: ctx.document.getCurrentDimStyleId(),
        layerId: ctx.document.getCurrentLayerId(),
        ...(id !== undefined ? { id } : {}),
      }),
      ctx.elevation
    )
  }

  private place(at: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "location") return
    const dim = this.pending(this.state.target, at, ctx)
    if (!dim) return
    ctx.execute(new AddEntityCommand(withCurrentProperties(dim, ctx)))
    ctx.report(
      ctx.text.message("dimensionTextIs", { text: measurementOf(dim, ctx) })
    )
    ctx.endCommand()
  }

  /**
   * `Select arc, circle, line, or <specify vertex>:` at `world`: nothing is
   * passed over in silence, an object with no angle refused in words (probes
   * dimensions/p354, p355). WHY a block reference is silent: AutoCAD's prompt
   * picks inside one, which is not built here.
   */
  private selectFirst(world: Vec2, ctx: ToolContext): void {
    const hit = ctx.pick(world)
    if (!hit || !readsInPlan(hit) || hit.type === "insert") return
    const picked = anglePick(hit, world)
    if (picked === null) {
      ctx.report(ctx.text.message("notLineArcOrCircle"))
    } else if (picked.kind === "sweep") {
      this.enterLocation(picked.target, ctx)
    } else if (picked.kind === "line") {
      this.enterSecondLine(picked.line, ctx)
    } else {
      // The pick, onto the circle, is the first endpoint; the second is asked
      // for next and taken onto the circle too (probes dimensions/p342, p343).
      const { center, radius } = picked
      this.enterSecondEndpoint(
        withZ(center, entityElevation(hit)),
        onCircle(center, radius, world),
        ctx,
        radius
      )
    }
  }

  /**
   * `Select second line:` at `world`: anything but a line is refused, and the
   * same segment again or a parallel one ends the command (probes
   * dimensions/p349, p350, p358).
   */
  private selectSecond(world: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "secondLine") return
    const first = this.state.line
    const hit = ctx.pick(world)
    if (!hit || !readsInPlan(hit) || hit.type === "insert") return
    const picked = anglePick(hit, world)
    if (picked?.kind !== "line") {
      ctx.report(ctx.text.message("notALine"))
      return
    }
    const second = picked.line
    const crossing =
      second.id === first.id && second.segment === first.segment
        ? null
        : infiniteLineIntersection(first.a, first.b, second.a, second.b)
    if (!crossing) {
      ctx.report(ctx.text.message("dimLinesParallel"))
      ctx.endCommand()
      return
    }
    this.enterLocation(
      { kind: "lines", vertex: crossing.point, a: first, b: second },
      ctx
    )
  }

  /** What the cursor is over that the prompt takes, for its rollover. */
  private pickMeasurable(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    if (!hit || !readsInPlan(hit)) return null
    const picked = anglePick(hit, world)
    if (this.state.phase === "secondLine") {
      return picked?.kind === "line" ? hit : null
    }
    return picked ? hit : null
  }

  /** Three points: nothing ties the dimension to an object, as AutoCAD says. */
  private reportByPoints(ctx: ToolContext): void {
    if (this.byPoints) ctx.report(ctx.text.message("nonAssociativeDimension"))
  }

  private enterSelect(ctx: ToolContext): void {
    this.byPoints = false
    this.state = { phase: "select", hover: null }
    // Keyword-only prompt: no field, so the canvas keeps focus, clicking an
    // object is the primary gesture and Enter reaches `onEnter`.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterSecondLine(line: PickedLine, ctx: ToolContext): void {
    this.state = { phase: "secondLine", line, hover: null }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterFirstEndpoint(vertex: Vec3, ctx: ToolContext): void {
    this.state = { phase: "firstEndpoint", vertex, cursor: vertex }
    this.openCoordinate(ctx, "firstAngleEndpoint", (commitCtx) => {
      if (this.state.phase !== "firstEndpoint") return false
      const point = this.parsePoint(commitCtx, this.state.vertex)
      if (!point) return false
      this.enterSecondEndpoint(this.state.vertex, point, commitCtx)
      return true
    })
  }

  /** `circle`: the radius the circle form takes the second endpoint onto. */
  private enterSecondEndpoint(
    vertex: Vec3,
    first: Vec2,
    ctx: ToolContext,
    circle: number | null = null
  ): void {
    this.state = {
      phase: "secondEndpoint",
      vertex,
      first,
      circle,
      cursor: first,
    }
    this.openCoordinate(
      ctx,
      circle === null ? "secondAngleEndpoint" : "circleSecondAngleEndpoint",
      (commitCtx) => {
        if (this.state.phase !== "secondEndpoint") return false
        const point = this.parsePoint(commitCtx, this.state.first)
        if (!point) return false
        this.endpointsGiven(point, commitCtx)
        return true
      }
    )
  }

  private endpointsGiven(second: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "secondEndpoint") return
    const { vertex, first, circle } = this.state
    this.reportByPoints(ctx)
    this.enterLocation(
      {
        kind: "points",
        vertex,
        first,
        second: circle === null ? second : onCircle(vertex, circle, second),
      },
      ctx
    )
  }

  private enterLocation(target: AngularTarget, ctx: ToolContext): void {
    this.state = {
      phase: "location",
      target,
      cursor: target.vertex,
      prompt: null,
    }
    this.openLocationInput(ctx)
  }

  private returnToLocation(ctx: ToolContext): void {
    if (this.state.phase !== "location") return
    this.state = { ...this.state, prompt: null }
    this.openLocationInput(ctx)
  }

  private openLocationInput(ctx: ToolContext): void {
    this.openCoordinate(ctx, "dimensionArcLocation", (commitCtx) => {
      if (this.state.phase !== "location") return false
      const point = this.parsePoint(commitCtx, null)
      if (!point) return false
      this.place(point, commitCtx)
      return true
    })
  }

  private openCoordinate(
    ctx: ToolContext,
    prompt: PromptId,
    commitRaw: (ctx: ToolContext) => boolean
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw,
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private parsePoint(
    ctx: ToolContext,
    lastPoint: Vec2 | Vec3 | null
  ): Vec3 | null {
    const typed = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(typed)) return null
    return parseCoordinate(typed, {
      lastPoint: lastPoint ?? ctx.lastPoint,
      relativeByDefault: lastPoint !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const ANGULAR_PREVIEW_ID = "__angular_dimension_preview__"

/**
 * One line of a line pair: the segment picked, which the second pick may not
 * repeat (a polyline's other segments it may, probe dimensions/p367).
 */
interface PickedLine {
  readonly id: string
  /** Which of a polyline's segments; −1 for a LINE. */
  readonly segment: number
  readonly a: Vec2
  readonly b: Vec2
}

/**
 * What the angle is being taken from. A line pair keeps the lines rather than
 * two endpoints, because which side of the vertex each counts on depends on
 * where the location is dragged.
 */
type AngularTarget =
  | {
      readonly kind: "points"
      readonly vertex: Vec2
      readonly first: Vec2
      readonly second: Vec2
    }
  | {
      readonly kind: "lines"
      readonly vertex: Vec2
      readonly a: PickedLine
      readonly b: PickedLine
    }

/** The two angle endpoints, given where the dimension arc is being placed. */
function resolveOrigins(
  target: AngularTarget,
  at: Vec2
): { first: Vec2; second: Vec2 } | null {
  if (target.kind === "points") return target
  const { vertex } = target
  const offset = V.sub(at, vertex)
  if (V.length(offset) < 1e-9) return null
  const bearing = Math.atan2(offset.y, offset.x)
  const radius = V.length(offset)
  const along = (line: PickedLine): Vec2 => V.normalize(V.sub(line.b, line.a))
  const a = along(target.a)
  const b = along(target.b)
  // The two lines make four sectors, each bounded by a ray of either and
  // under 180°: the one holding the location's bearing is measured
  // (probes dimensions/p344–p348).
  for (const ra of [a, V.scale(a, -1)]) {
    for (const rb of [b, V.scale(b, -1)]) {
      const from = Math.atan2(ra.y, ra.x)
      const to = Math.atan2(rb.y, rb.x)
      const [start, end] =
        normalizeAngle(to - from) <= Math.PI ? [from, to] : [to, from]
      if (angleWithinSweep(start, end, bearing)) {
        return {
          first: rayPoint(target.a, vertex, ra, radius),
          second: rayPoint(target.b, vertex, rb, radius),
        }
      }
    }
  }
  return null
}

/**
 * The angle endpoint on the ray from `vertex` along `ray` for an arc at
 * `radius`: the point of `line` nearest the arc, so an extension line is
 * drawn only where the arc misses the line, outward past its far end or
 * inward short of its near one, and none where it crosses it (probes
 * dimensions/p344, p346: no LINE in the exploded dimension). WHY a point
 * rather than the line's end: the dimension stores points, not the lines,
 * so an arc moved later is not re-measured against them as AutoCAD's is.
 * A line not reaching that side of the vertex gives the arc's own point.
 */
function rayPoint(
  line: PickedLine,
  vertex: Vec2,
  ray: Vec2,
  radius: number
): Vec2 {
  const reach = (end: Vec2) => V.dot(V.sub(end, vertex), ray)
  const far = Math.max(reach(line.a), reach(line.b))
  const near = Math.max(Math.min(reach(line.a), reach(line.b)), 0)
  const distance = far <= 1e-9 ? radius : Math.min(Math.max(radius, near), far)
  return V.add(vertex, V.scale(ray, distance))
}

/** `point` taken radially onto the circle about `center`; itself at the centre. */
function onCircle(center: Vec2, radius: number, point: Vec2): Vec2 {
  const offset = V.sub(point, center)
  const distance = V.length(offset)
  return distance < 1e-9
    ? point
    : V.add(center, V.scale(offset, radius / distance))
}

/** What a pick on `entity` gives DIMANGULAR's first prompt; null refuses it. */
type AnglePick =
  | { readonly kind: "sweep"; readonly target: AngularTarget }
  | { readonly kind: "circle"; readonly center: Vec2; readonly radius: number }
  | { readonly kind: "line"; readonly line: PickedLine }

/**
 * An arc gives its angle directly — "the center of the arc is the angle
 * vertex, the arc endpoints become the origin points of the extension lines"
 * —, a circle its centre and the pick, a line itself; a polyline as the
 * segment picked is ("two lines or polyline segments", p367, p368).
 */
function anglePick(entity: Entity, at: Vec2): AnglePick | null {
  switch (entity.type) {
    case "arc":
      return {
        kind: "sweep",
        target: {
          kind: "points",
          vertex: entity.center,
          first: arcStartPoint(entity),
          second: arcEndPoint(entity),
        },
      }
    case "circle":
      return { kind: "circle", center: entity.center, radius: entity.radius }
    case "line":
      return {
        kind: "line",
        line: { id: entity.id, segment: -1, a: entity.start, b: entity.end },
      }
    case "polyline": {
      let best: AnglePick | null = null
      let bestDistance = Infinity
      polylineSegmentGeometries(entity).forEach((seg, segment) => {
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
        if (distance >= bestDistance) return
        bestDistance = distance
        best =
          seg.kind === "arc"
            ? {
                kind: "sweep",
                target: {
                  kind: "points",
                  vertex: seg.center,
                  first: seg.a,
                  second: seg.b,
                },
              }
            : {
                kind: "line",
                line: { id: entity.id, segment, a: seg.a, b: seg.b },
              }
      })
      return best
    }
    default:
      return null
  }
}

type AngularToolState =
  /** "Select arc, circle, line, or <specify vertex>". */
  | { readonly phase: "select"; readonly hover: Entity | null }
  /** One line picked, waiting for the other. */
  | {
      readonly phase: "secondLine"
      readonly line: PickedLine
      readonly hover: Entity | null
    }
  /** The three-point form: the vertex, then each endpoint. */
  | { readonly phase: "vertex" }
  | {
      readonly phase: "firstEndpoint"
      readonly vertex: Vec3
      readonly cursor: Vec2
    }
  | {
      readonly phase: "secondEndpoint"
      readonly vertex: Vec3
      readonly first: Vec2
      /** The circle form's radius, which the second endpoint is taken onto. */
      readonly circle: number | null
      readonly cursor: Vec2
    }
  | {
      readonly phase: "location"
      readonly target: AngularTarget
      readonly cursor: Vec2
      /** Which sub-prompt is open, so its answer returns here. */
      readonly prompt: "text" | "textAngle" | null
    }
