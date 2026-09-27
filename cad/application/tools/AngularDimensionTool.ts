import { Vec2, V } from "../../geometry/Vec2"
import {
  closestPointOnArc,
  closestPointOnSegment,
  infiniteLineIntersection,
} from "../../geometry/primitives"
import {
  arcEndPoint,
  arcStartPoint,
  createDimension,
  DimensionEntity,
  Entity,
  polylineSegmentGeometries,
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
} from "./Tool"

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
 *   less than 180 degrees", which is why each line's ray is taken towards the
 *   side the location is on;
 * - **Enter** — the three-point form: vertex, then both angle endpoints.
 *
 * The location prompt then "specifies the placement of the dimension line and
 * determines the direction to draw the extension lines": two sweeps join the
 * endpoints, and the one the location falls in is the one measured, so dragging
 * across a ray gives the reflex angle.
 *
 * Two keywords of AutoCAD's `[Mtext/Text/Angle/Quadrant]` are missing. **Mtext**
 * opens the multiline editor, and this app has no MTEXT object. **Quadrant**
 * locks the dimension to one quadrant and extends the dimension line past the
 * extension line when the text is pushed outside — a placement mode of its own,
 * left for later.
 */
export class AngularDimensionTool implements Tool {
  readonly id = "dimangular"

  private state: AngularToolState = { phase: "select", hover: null }
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
      case "secondLine": {
        const hit = this.pickMeasurable(input.world, ctx)
        const line = hit && pickedLine(hit, input.world)
        if (line) this.beginLinePair(this.state.line, line, ctx)
        break
      }
      case "vertex":
        this.enterFirstEndpoint(input.point, ctx)
        break
      case "firstEndpoint":
        this.enterSecondEndpoint(this.state.vertex, input.point, ctx)
        break
      case "secondEndpoint":
        this.enterLocation(
          {
            kind: "points",
            vertex: this.state.vertex,
            first: this.state.first,
            second: input.point,
          },
          ctx
        )
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
    this.state = { phase: "vertex" }
    this.openCoordinate(ctx, "angleVertex", (commitCtx) => {
      const point = this.parsePoint(commitCtx, null)
      if (!point) return false
      this.enterFirstEndpoint(point, commitCtx)
      return true
    })
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
        this.state = { ...this.state, prompt: "text" }
        openDimensionTextInput(
          ctx,
          this.lastScreen,
          this.text,
          (text, commitCtx) => {
            this.text = text
            this.returnToLocation(commitCtx)
          }
        )
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

  getConstraintAnchor(): Vec2 | null {
    switch (this.state.phase) {
      case "firstEndpoint":
        return this.state.vertex
      case "secondEndpoint":
        return this.state.vertex
      case "location":
        return this.state.target.vertex
      default:
        return null
    }
  }

  wantsSnap(): boolean {
    // Everything but the two object prompts asks for a point.
    return this.state.phase !== "select" && this.state.phase !== "secondLine"
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const rubber = { color: THEME.rubberBand, width: 1 }

    switch (this.state.phase) {
      case "select":
      case "secondLine":
        return this.state.hover
          ? entityScenePrimitive(viewport, this.state.hover, {
              color: THEME.selected,
              width: 2,
            })
          : []
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
   * gesture is degenerate — a location on the vertex has no arc to draw.
   */
  private pending(
    target: AngularTarget,
    at: Vec2,
    ctx: ToolContext,
    id?: string
  ): DimensionEntity | null {
    const origins = resolveOrigins(target, at)
    if (!origins) return null
    return createDimension("angular", origins.first, origins.second, at, {
      vertex: target.vertex,
      text: this.text,
      textAngle: this.textAngle,
      styleId: ctx.document.getCurrentDimStyleId(),
      layerId: ctx.document.getCurrentLayerId(),
      ...(id !== undefined ? { id } : {}),
    })
  }

  private place(at: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "location") return
    const dim = this.pending(this.state.target, at, ctx)
    if (!dim) return
    ctx.execute(new AddEntityCommand(dim))
    ctx.endCommand()
  }

  /** Dispatches on what the object prompt was answered with. */
  private selectFirst(world: Vec2, ctx: ToolContext): void {
    const hit = this.pickMeasurable(world, ctx)
    if (!hit) return
    const sweep = pickedSweep(hit, world)
    if (sweep) {
      this.enterLocation(sweep, ctx)
      return
    }
    if (hit.type === "circle") {
      // The pick point is the first endpoint; the second is asked for next and
      // need not lie on the circle.
      const offset = V.sub(world, hit.center)
      const dir = V.length(offset) < 1e-9 ? { x: 1, y: 0 } : V.normalize(offset)
      this.enterSecondEndpoint(
        hit.center,
        V.add(hit.center, V.scale(dir, hit.radius)),
        ctx
      )
      return
    }
    const line = pickedLine(hit, world)
    if (line) this.enterSecondLine(line, ctx)
  }

  /** The object under the cursor DIMANGULAR can take an angle from. */
  private pickMeasurable(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    if (!hit) return null
    if (this.state.phase === "secondLine") {
      // Two lines are needed, and not the same one twice.
      return hit.id !== this.state.line.id && pickedLine(hit, world)
        ? hit
        : null
    }
    return pickedSweep(hit, world) ||
      hit.type === "circle" ||
      pickedLine(hit, world)
      ? hit
      : null
  }

  private enterSelect(ctx: ToolContext): void {
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

  private beginLinePair(a: PickedLine, b: PickedLine, ctx: ToolContext): void {
    const crossing = infiniteLineIntersection(a.a, a.b, b.a, b.b)
    // Parallel lines subtend no angle, so the prompt simply stays open.
    if (!crossing) return
    this.enterLocation({ kind: "lines", vertex: crossing.point, a, b }, ctx)
  }

  private enterFirstEndpoint(vertex: Vec2, ctx: ToolContext): void {
    this.state = { phase: "firstEndpoint", vertex, cursor: vertex }
    this.openCoordinate(ctx, "firstAngleEndpoint", (commitCtx) => {
      if (this.state.phase !== "firstEndpoint") return false
      const point = this.parsePoint(commitCtx, this.state.vertex)
      if (!point) return false
      this.enterSecondEndpoint(this.state.vertex, point, commitCtx)
      return true
    })
  }

  private enterSecondEndpoint(
    vertex: Vec2,
    first: Vec2,
    ctx: ToolContext
  ): void {
    this.state = { phase: "secondEndpoint", vertex, first, cursor: first }
    this.openCoordinate(ctx, "secondAngleEndpoint", (commitCtx) => {
      if (this.state.phase !== "secondEndpoint") return false
      const point = this.parsePoint(commitCtx, this.state.first)
      if (!point) return false
      this.enterLocation(
        {
          kind: "points",
          vertex: this.state.vertex,
          first: this.state.first,
          second: point,
        },
        commitCtx
      )
      return true
    })
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
      const point = this.parsePoint(commitCtx, this.state.target.vertex)
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

  private parsePoint(ctx: ToolContext, lastPoint: Vec2 | null): Vec2 | null {
    const typed = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(typed)) return null
    return parseCoordinate(typed, {
      lastPoint,
      relativeByDefault: lastPoint !== null,
    })
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const ANGULAR_PREVIEW_ID = "__angular_dimension_preview__"

/** One line of a line pair, kept with its id so the second pick can exclude it. */
interface PickedLine {
  readonly id: string
  readonly a: Vec2
  readonly b: Vec2
}

/**
 * What the angle is being taken from. A line pair keeps the lines rather than
 * two endpoints, because which end of each counts depends on where the location
 * is dragged — the rule that keeps the measured arc under 180°.
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
  const offset = V.sub(at, target.vertex)
  if (V.length(offset) < 1e-9) return null
  const towards = V.normalize(offset)
  const first = rayEndpoint(target.a, target.vertex, towards)
  const second = rayEndpoint(target.b, target.vertex, towards)
  return first && second ? { first, second } : null
}

/**
 * The end of `line` that lies on the same side of the vertex as the location.
 * Both rays then sit within 90° of it, so the angle between them — the one the
 * dimension measures — is always less than 180°, as AutoCAD specifies for the
 * two-line form.
 */
function rayEndpoint(
  line: PickedLine,
  vertex: Vec2,
  towards: Vec2
): Vec2 | null {
  let best: Vec2 | null = null
  let bestDot = -Infinity
  for (const end of [line.a, line.b]) {
    const offset = V.sub(end, vertex)
    const distance = V.length(offset)
    // An end sitting on the vertex gives no direction; the other one does.
    if (distance < 1e-9) continue
    const alignment = V.dot(V.scale(offset, 1 / distance), towards)
    if (alignment > bestDot) {
      bestDot = alignment
      best = end
    }
  }
  return best
}

/**
 * The angle an arc supplies directly: "the center of the arc is the angle
 * vertex, the arc endpoints become the origin points of the extension lines" —
 * for a standalone arc or an arc segment of a polyline.
 */
function pickedSweep(entity: Entity, at: Vec2): AngularTarget | null {
  if (entity.type === "arc") {
    return {
      kind: "points",
      vertex: entity.center,
      first: arcStartPoint(entity),
      second: arcEndPoint(entity),
    }
  }
  if (entity.type !== "polyline") return null
  let best: AngularTarget | null = null
  let bestDistance = Infinity
  for (const seg of polylineSegmentGeometries(entity)) {
    if (seg.kind !== "arc") continue
    const distance = closestPointOnArc(
      seg.center,
      seg.radius,
      seg.startAngle,
      seg.endAngle,
      at
    ).distance
    if (distance < bestDistance) {
      bestDistance = distance
      best = {
        kind: "points",
        vertex: seg.center,
        first: seg.a,
        second: seg.b,
      }
    }
  }
  return best
}

/**
 * The straight run under the cursor: a line, or the nearest straight segment of
 * a polyline ("two lines or polyline segments").
 */
function pickedLine(entity: Entity, at: Vec2): PickedLine | null {
  if (entity.type === "line") {
    return { id: entity.id, a: entity.start, b: entity.end }
  }
  if (entity.type !== "polyline") return null
  let best: PickedLine | null = null
  let bestDistance = Infinity
  for (const seg of polylineSegmentGeometries(entity)) {
    if (seg.kind !== "line") continue
    const distance = closestPointOnSegment(seg.a, seg.b, at).distance
    if (distance < bestDistance) {
      bestDistance = distance
      best = { id: entity.id, a: seg.a, b: seg.b }
    }
  }
  return best
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
      readonly vertex: Vec2
      readonly cursor: Vec2
    }
  | {
      readonly phase: "secondEndpoint"
      readonly vertex: Vec2
      readonly first: Vec2
      readonly cursor: Vec2
    }
  | {
      readonly phase: "location"
      readonly target: AngularTarget
      readonly cursor: Vec2
      /** Which sub-prompt is open, so its answer returns here. */
      readonly prompt: "text" | "textAngle" | null
    }
