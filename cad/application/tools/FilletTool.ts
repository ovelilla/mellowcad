import { Vec2, V } from "../../geometry/Vec2"
import {
  angleWithinSweep,
  bulgeThroughPoint,
  circleCircleIntersection,
  closestPointOnInfiniteLine,
  filletLines,
  infiniteLineIntersection,
  lineCircleIntersectionParams,
  normalizeAngle,
  polarPoint,
} from "../../geometry/primitives"
import {
  createArc,
  createLine,
  carryOverrides,
  carryPlane,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
  PolylineSegmentGeometry,
} from "../../domain/entities"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { formatLength } from "../../domain/units"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import { LineCorner, LinePick, lineCorner } from "./lineCorner"
import {
  ArcCorner,
  CornerCut,
  PolylineCorner,
  SegmentsRefusal,
  cutBetweenSegments,
  cutPolylineCorners,
  reportSkipped,
} from "./polylineCorners"
import {
  CornerJoin,
  CornerObject,
  JoinCut,
  SegmentPick,
  cornerEntity,
  cornerJoin,
  isSegment,
  joinAtCut,
  joinRefusal,
  joinedSecond,
  pickCornerObject,
} from "./cornerObjects"
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

/**
 * AutoCAD's FILLET: round the corner between two lines with an arc of a given
 * radius, trimming (or extending) both lines to the points of tangency.
 *
 * ```
 *        [R] Radius ──► radius ──► back to the prompt it was asked from
 *  first ──click line──► second ──click line──► fillet ──► end, or first (Multiple)
 *    └──[P] Polyline──► polyline ──click polyline──► every corner ──► end, or first
 * ```
 *
 * The arc is placed in the corner nearest to where you clicked each line, and
 * the lines are trimmed/extended to meet it. Two straight segments of one
 * polyline are objects too, rounded within it, and a line with a polyline's
 * segment, or segments of two polylines, are joined into one polyline. Shift on the second pick applies a
 * corner instead, as a radius of 0 does. The radius is kept for the session.
 * Multiple keeps asking for the next pair until Enter, and Undo takes back the
 * last fillet made in the command. Each fillet is one command — a
 * {@link ReplaceEntitiesCommand} for two lines, an {@link UpdateEntityCommand}
 * for a polyline — which the runtime folds into the command's undo step.
 */

type FilletState =
  /** Awaiting the first object (hover-highlighted). */
  | { readonly phase: "first"; readonly hover: CornerObject | null }
  /** First object chosen; awaiting the second (a live preview tracks the cursor). */
  | {
      readonly phase: "second"
      readonly first: CornerObject
      /** Where the first line was clicked — picks which corner to round. */
      readonly pick1: LinePick
      readonly hover: CornerObject | null
      readonly cursor: LinePick
      /** Shift is held: the second pick applies a corner. */
      readonly corner: boolean
    }
  /** Polyline: awaiting the 2D polyline whose every corner is rounded. */
  | { readonly phase: "polyline"; readonly hover: PolylineEntity | null }

export class FilletTool implements Tool {
  readonly id = "fillet"
  readonly shortcut = "f"

  private state: FilletState = { phase: "first", hover: null }
  /** FILLETRAD, kept for the session (Not-saved). */
  private radius = 0
  /** True while the radius sub-prompt's input is open (object picks paused). */
  private askingRadius = false
  private multiple = false
  /**
   * What Undo takes back, newest last: a fillet, or a radius given in the
   * command (the radius it replaced).
   */
  private steps: ({ readonly radius: number } | "fillet")[] = []
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset()
    // TRIMMODE is always 1 here: the lines are trimmed to the arc.
    ctx.report(
      ctx.text.message("filletSettings", {
        radius: formatLength(this.radius, ctx.document.getSettings()),
      })
    )
    this.openKeywordPrompt(ctx)
  }

  /** WHY no Trim: TRIMMODE is always 1 here, so it is not offered. */
  question(): PromptId | ToolQuestion {
    if (this.askingRadius) {
      return { id: "specifyFilletRadius", enter: this.radius }
    }
    switch (this.state.phase) {
      case "first":
        return "selectFirstObjectOr"
      case "second":
        return "selectSecondObjectOrApplyCornerOr"
      case "polyline":
        return "select2dPolylineOr"
    }
  }

  takes(): QuestionInput | null {
    return this.askingRadius ? null : "object"
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset()
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
    if (this.askingRadius) {
      ctx.requestRender()
      return
    }

    switch (this.state.phase) {
      case "first":
        this.state = {
          phase: "first",
          hover: pickCornerObject(ctx, input.world, null),
        }
        break
      case "second":
        this.state = {
          ...this.state,
          hover: pickCornerObject(ctx, input.world, this.state.first),
          cursor: { world: input.world, screen: input.screen },
          corner: input.shiftKey,
        }
        break
      case "polyline":
        this.state = { phase: "polyline", hover: this.pickPolyline(input, ctx) }
        break
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.askingRadius) return

    switch (this.state.phase) {
      case "first": {
        const hit = pickCornerObject(ctx, input.world, null)
        if (!hit) return
        const pick = { world: input.world, screen: input.screen }
        this.state = {
          phase: "second",
          first: hit,
          pick1: pick,
          hover: null,
          cursor: pick,
          corner: false,
        }
        ctx.requestRender()
        return
      }
      case "second": {
        const { first, pick1 } = this.state
        const second = pickCornerObject(ctx, input.world, first)
        if (!second) return
        const radius = input.shiftKey ? 0 : this.radius
        const join = cornerJoin(first, pick1.world, second, input.world)
        if (join) {
          this.commitJoin(join, radius, ctx)
        } else if (isSegment(first) && isSegment(second)) {
          const cut = filletSegments(first, second, radius)
          if (typeof cut !== "string") {
            this.done(new UpdateEntityCommand(cut), ctx)
          } else {
            this.refuse(REFUSALS[cut], ctx)
          }
        } else if (!isSegment(first) && !isSegment(second)) {
          const pick2 = { world: input.world, screen: input.screen }
          this.commitFillet(first, pick1, second, pick2, radius, ctx)
        }
        return
      }
      case "polyline": {
        const poly = this.pickPolyline(input, ctx)
        if (poly) this.commitPolyline(poly, ctx)
        return
      }
    }
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") ctx.dynamicInput.close()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.askingRadius) return []
    switch (this.state.phase) {
      case "first":
        return this.multiple
          ? [{ id: "Undo" }, { id: "Polyline" }, { id: "Radius" }]
          : [
              { id: "Undo" },
              { id: "Polyline" },
              { id: "Radius" },
              { id: "Multiple" },
            ]
      case "second":
      case "polyline":
        return [{ id: "Radius" }]
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.askingRadius) return "unhandled"
    if (id === "Radius") {
      this.openRadiusPrompt(ctx)
      return "continue"
    }
    if (this.state.phase !== "first") return "unhandled"
    switch (id) {
      case "Undo":
        this.undoStep(ctx)
        return "continue"
      case "Polyline":
        this.state = { phase: "polyline", hover: null }
        ctx.requestRender()
        return "continue"
      case "Multiple":
        this.multiple = true
        return "continue"
      default:
        return "unhandled"
    }
  }

  wantsSnap(): boolean {
    // Lines are picked by proximity, not precise points, so running snaps would
    // only clutter the hover — the same choice as TRIM/EXTEND.
    return false
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const draw = (entity: Entity, stroke: StrokeStyle) =>
      entityScenePrimitive(viewport, entity, stroke)

    if (this.state.phase === "first") {
      const h = this.state.hover
      return h ? draw(cornerEntity(h), hoverStroke) : []
    }
    if (this.state.phase === "polyline") {
      const h = this.state.hover
      return h ? draw(h, selectedStroke) : []
    }

    const { first, pick1, hover, cursor } = this.state
    const radius = this.state.corner ? 0 : this.radius
    const join = hover && cornerJoin(first, pick1.world, hover, cursor.world)
    if (join) {
      const cut = !joinRefusal(join) && filletJoin(join, radius)
      return cut
        ? draw(joinAtCut(join, cut), hoverStroke)
        : [
            ...draw(cornerEntity(first), selectedStroke),
            ...draw(cornerEntity(joinedSecond(join)), hoverStroke),
          ]
    }
    if (isSegment(first)) {
      const cut =
        hover && isSegment(hover) && filletSegments(first, hover, radius)
      return cut && typeof cut !== "string"
        ? draw(cut, hoverStroke)
        : draw(first.poly, selectedStroke)
    }
    const line1 = first
    const prims = draw(line1, selectedStroke)
    if (!hover || isSegment(hover)) return prims

    const corner = lineCorner(line1, pick1, hover, cursor, viewport)
    const filleted =
      corner && this.fillet(corner, line1, hover, radius, ctx, PREVIEW_ID)
    if (!filleted || filleted === "tooLarge") {
      return [...prims, ...draw(hover, hoverStroke)]
    }
    for (const entity of filleted) {
      prims.push(
        ...draw(
          entity,
          entity.type === "arc"
            ? { color: THEME.rubberBand, width: 1 }
            : hoverStroke
        )
      )
    }
    return prims
  }

  private reset(): void {
    this.state = { phase: "first", hover: null }
    this.askingRadius = false
    this.multiple = false
    this.steps = []
  }

  /**
   * The two lines trimmed or extended to the arc of `radius`, and the arc
   * (none at radius 0), back in the frame; `null` when the lines are
   * parallel, `tooLarge` when a line would be trimmed away. A preview gives
   * the arc a fixed `arcId`, so it burns no entity ids.
   */
  private fillet(
    corner: LineCorner,
    line1: LineEntity,
    line2: LineEntity,
    radius: number,
    ctx: ToolContext,
    arcId?: EntityId
  ): Entity[] | "tooLarge" | null {
    const result = filletLines(
      corner.line1.start,
      corner.line1.end,
      corner.line2.start,
      corner.line2.end,
      corner.pick1,
      corner.pick2,
      radius
    )
    if (!result) return null
    const trimmed1 = trimLine(
      corner.line1,
      result.corner,
      result.direction1,
      result.tangent1
    )
    const trimmed2 = trimLine(
      corner.line2,
      result.corner,
      result.direction2,
      result.tangent2
    )
    if (!trimmed1 || !trimmed2) return "tooLarge"
    const built: Entity[] = [trimmed1, trimmed2]
    if (result.radius > 0) {
      // AutoCAD places the arc on the lines' shared layer, or the current layer
      // when they differ.
      const arcLayer =
        line1.layerId === line2.layerId
          ? line1.layerId
          : ctx.document.getCurrentLayerId()
      built.push(
        carryPlane(
          corner.line1,
          createArc(
            result.center,
            result.radius,
            result.startAngle,
            result.endAngle,
            arcLayer,
            arcId
          )
        )
      )
    }
    return built.map((entity) => corner.back(entity))
  }

  private commitFillet(
    line1: LineEntity,
    pick1: LinePick,
    line2: LineEntity,
    pick2: LinePick,
    radius: number,
    ctx: ToolContext
  ): void {
    const corner = lineCorner(line1, pick1, line2, pick2, ctx.viewport)
    if (!corner) {
      ctx.report(ctx.text.message("linesNonCoplanar"), "error")
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    const filleted = this.fillet(corner, line1, line2, radius, ctx)
    // WHY nothing for parallel lines: AutoCAD caps them with a half circle,
    // which is not built; the second object is asked again.
    if (!filleted) return
    if (filleted === "tooLarge") {
      this.refuse("filletRadiusTooLarge", ctx)
      return
    }
    this.done(new ReplaceEntitiesCommand([line1.id, line2.id], filleted), ctx)
  }

  /**
   * A line and a polyline's segment, or segments of two polylines, joined
   * into one polyline through the arc; parallel, `Cannot fillet between these
   * two entities.`
   */
  private commitJoin(join: CornerJoin, radius: number, ctx: ToolContext): void {
    const refusal = joinRefusal(join)
    if (refusal) {
      this.refuse(refusal, ctx, false)
      return
    }
    const cut = filletJoin(join, radius)
    if (!cut) {
      this.refuse("cannotFilletBetween", ctx, false)
      return
    }
    this.done(
      new ReplaceEntitiesCommand(
        [cornerEntity(join.other).id, join.segment.poly.id],
        [joinAtCut(join, cut)]
      ),
      ctx
    )
  }

  /**
   * A corner that cannot be made: said, and Multiple asks for the first
   * object again; otherwise the input is `*Invalid*` (unless the console says
   * only why, as for every join) and the command ends.
   */
  private refuse(message: MessageId, ctx: ToolContext, invalid = true): void {
    ctx.report(ctx.text.message(message), "error")
    if (this.multiple) {
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
      return
    }
    if (invalid) ctx.report(ctx.text.message("invalid"), "error")
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Polyline: rounds every corner where two line segments meet, and replaces
   * an arc segment between two lines that converge towards it — at radius 0
   * removes it, the lines meeting at their crossing.
   */
  private commitPolyline(poly: PolylineEntity, ctx: ToolContext): void {
    const result = cutPolylineCorners(poly, {
      lines: (corner) => filletCorner(corner, this.radius),
      acrossArcs: true,
      arcs: (corner) => filletArcCorner(corner, this.radius),
    })
    ctx.report(ctx.text.message("linesFilleted", { count: result.cut }))
    reportSkipped(result, ctx)
    if (result.polyline) {
      this.done(new UpdateEntityCommand(result.polyline), ctx)
    } else if (this.multiple) {
      this.state = { phase: "first", hover: null }
      ctx.requestRender()
    } else {
      ctx.dynamicInput.close()
      ctx.endCommand()
    }
  }

  /** Executes a fillet; the command ends, or Multiple asks for the next. */
  private done(
    command: ReplaceEntitiesCommand | UpdateEntityCommand,
    ctx: ToolContext
  ): void {
    this.steps.push("fillet")
    if (this.multiple) {
      this.state = { phase: "first", hover: null }
      ctx.execute(command)
      ctx.requestRender()
      return
    }
    ctx.execute(command)
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /**
   * Undo takes back the last fillet or radius of this command, and only
   * those; back at its start AutoCAD says so.
   */
  private undoStep(ctx: ToolContext): void {
    const step = this.steps.pop()
    if (step === "fillet") ctx.undo()
    else if (step) this.radius = step.radius
    if (this.steps.length === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
    ctx.requestRender()
  }

  private pickPolyline(
    input: PointerInput,
    ctx: ToolContext
  ): PolylineEntity | null {
    const hit = ctx.pick(input.world)
    return hit?.type === "polyline" ? hit : null
  }

  /** A prompt answered by a pick or a keyword, its keywords on the tooltip. */
  private openKeywordPrompt(ctx: ToolContext): void {
    const session: DynamicInputSession = { fields: [], commit: () => {} }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private openRadiusPrompt(ctx: ToolContext): void {
    this.askingRadius = true
    const session: DynamicInputSession = {
      fields: [{ id: "radius", prompt: "filletRadius", kind: "distance" }],
      commit: (values, commitCtx) => this.setRadius(values.radius, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault("radius", this.radius)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** The radius, then the prompt Radius was chosen at, asked again. */
  private setRadius(value: number, ctx: ToolContext): void {
    if (Number.isFinite(value) && value >= 0) {
      this.steps.push({ radius: this.radius })
      this.radius = value
    }
    this.askingRadius = false
    this.openKeywordPrompt(ctx)
    ctx.requestRender()
  }
}

const hoverStroke: StrokeStyle = { color: THEME.entityHover, width: 2 }
const selectedStroke: StrokeStyle = { color: THEME.selected, width: 2 }
/** The preview arc's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "fillet-preview"

/**
 * Rebuilds `line` trimmed/extended to end at `tangent`: the endpoint on the
 * picked side (farther from the corner along `dir`) is kept, the other becomes
 * the tangent point. Preserves the line's id and layer. `null` when the
 * tangent point is not short of the kept end: the line would vanish.
 */
function trimLine(
  line: LineEntity,
  corner: Vec2,
  dir: Vec2,
  tangent: Vec2
): LineEntity | null {
  const keepEnd =
    V.dot(V.sub(line.end, corner), dir) >= V.dot(V.sub(line.start, corner), dir)
      ? line.end
      : line.start
  if (V.dot(V.sub(keepEnd, tangent), dir) <= 0) return null
  return carryOverrides(
    line,
    createLine(keepEnd, tangent, line.layerId, line.id)
  )
}

const REFUSALS: Readonly<Record<SegmentsRefusal, MessageId>> = {
  parallel: "linesParallel",
  diverge: "linesDiverge",
  tooLarge: "filletRadiusTooLarge",
}

/** The arc between the two objects of a join; `null` when parallel. */
function filletJoin(
  { otherA, otherB, otherPick, a, b, segmentPick }: CornerJoin,
  radius: number
): JoinCut | null {
  const result = filletLines(
    otherA,
    otherB,
    a,
    b,
    otherPick,
    segmentPick,
    radius
  )
  if (!result) return null
  const sweep = normalizeAngle(result.endAngle - result.startAngle)
  const mid = polarPoint(
    result.center,
    result.radius,
    result.startAngle + sweep / 2
  )
  return {
    corner: result.corner,
    otherSide: result.direction1,
    segmentSide: result.direction2,
    onOther: result.tangent1,
    onSegment: result.tangent2,
    bulge:
      result.radius > 0
        ? bulgeThroughPoint(result.tangent2, result.tangent1, mid)
        : 0,
  }
}

/** Two segments of one polyline rounded within it, or why they cannot be. */
function filletSegments(
  first: SegmentPick,
  second: SegmentPick,
  radius: number
): PolylineEntity | SegmentsRefusal {
  return cutBetweenSegments(first.poly, first.index, second.index, (corner) =>
    filletCorner(corner, radius)
  )
}

/** A polyline corner rounded at `radius`; at 0 the lines meet at the corner. */
function filletCorner(
  { from, corner, to }: PolylineCorner,
  radius: number
): CornerCut | null {
  const result = filletLines(from, corner, corner, to, from, to, radius)
  if (!result) return null
  if (result.radius <= 0) return { entry: corner, exit: corner, bulge: 0 }
  const sweep = normalizeAngle(result.endAngle - result.startAngle)
  const mid = polarPoint(
    result.center,
    result.radius,
    result.startAngle + sweep / 2
  )
  return {
    entry: result.tangent1,
    exit: result.tangent2,
    bulge: bulgeThroughPoint(result.tangent1, result.tangent2, mid),
  }
}

/**
 * A polyline vertex an arc segment meets, rounded at `radius` by the circle
 * tangent to both sides (FILLETPOLYARC 1); `null` when none fits there.
 */
function filletArcCorner(
  { incoming, corner, outgoing }: ArcCorner,
  radius: number
): CornerCut | null {
  return solveCornerFillet(
    toFilletSide(incoming, corner, true),
    toFilletSide(outgoing, corner, false),
    corner,
    radius,
    V.distance(incoming.a, incoming.b),
    V.distance(outgoing.a, outgoing.b)
  )
}

/** One side of a corner: a straight segment or a circular arc, with the unit
 * travel tangent at the corner (into it for the incoming side, out for the
 * outgoing side). */
type FilletSide =
  | { readonly kind: "line"; readonly tangent: Vec2; readonly far: Vec2 }
  | {
      readonly kind: "arc"
      readonly tangent: Vec2
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }

/** Builds a {@link FilletSide} for the segment `g` meeting `corner`. `incoming`
 * = the segment arrives at the corner (tangent points into it), else it leaves. */
function toFilletSide(
  g: PolylineSegmentGeometry,
  corner: Vec2,
  incoming: boolean
): FilletSide {
  if (g.kind === "line") {
    const far = incoming ? g.a : g.b
    // Travel direction along the segment's own a→b orientation — into the corner
    // for the incoming side, out of it for the outgoing side, matching the arc
    // branch so `turn` and the interior normals are consistent for both sides.
    return { kind: "line", tangent: V.normalize(V.sub(g.b, g.a)), far }
  }
  // The arc's travel tangent at the corner: perpendicular to the radius, in the
  // CCW direction for a positive bulge (its natural start→end orientation).
  const radial = V.normalize(V.sub(corner, g.center))
  const ccw = g.bulge >= 0
  const travel = ccw ? V.perpendicular(radial) : negate(V.perpendicular(radial))
  return {
    kind: "arc",
    tangent: travel,
    center: g.center,
    radius: g.radius,
    startAngle: g.startAngle,
    endAngle: g.endAngle,
  }
}

/** The fillet circle of `radius` tangent to both sides, in the corner's wedge. */
function solveCornerFillet(
  inSide: FilletSide,
  outSide: FilletSide,
  corner: Vec2,
  radius: number,
  inSegLen: number,
  outSegLen: number
): CornerCut | null {
  if (radius <= 0) return null
  const turn = Math.sign(V.cross(inSide.tangent, outSide.tangent))
  if (turn === 0) return null // collinear — no corner to round

  const nIn = interiorNormal(inSide.tangent, turn)
  const nOut = interiorNormal(outSide.tangent, turn)
  const locusIn = sideLocus(inSide, corner, nIn, radius)
  const locusOut = sideLocus(outSide, corner, nOut, radius)
  if (!locusIn || !locusOut) return null

  const ref = V.add(corner, V.scale(V.normalize(V.add(nIn, nOut)), radius))
  const center = intersectLoci(locusIn, locusOut, ref)
  if (!center) return null

  const entry = sideTangentPoint(inSide, corner, center)
  const exit = sideTangentPoint(outSide, corner, center)
  if (
    !sideContains(inSide, entry, corner, inSegLen) ||
    !sideContains(outSide, exit, corner, outSegLen)
  ) {
    return null
  }

  const mid = V.add(center, V.scale(V.normalize(V.sub(corner, center)), radius))
  return { entry, exit, bulge: bulgeThroughPoint(entry, exit, mid) }
}

/** The locus of fillet-circle centres at distance `radius` from a side, on the
 * corner-interior side: a parallel line, or a concentric circle. */
type CenterLocus =
  | { readonly kind: "line"; readonly p0: Vec2; readonly p1: Vec2 }
  | { readonly kind: "circle"; readonly center: Vec2; readonly radius: number }

function sideLocus(
  side: FilletSide,
  corner: Vec2,
  normal: Vec2,
  radius: number
): CenterLocus | null {
  if (side.kind === "line") {
    const p0 = V.add(corner, V.scale(normal, radius))
    return { kind: "line", p0, p1: V.add(p0, side.tangent) }
  }
  // Concentric circle: outside the arc when the interior lies outside, inside
  // otherwise. `rho` collapses when the fillet can't fit against the arc.
  const outward = V.normalize(V.sub(corner, side.center))
  const rho =
    V.dot(normal, outward) >= 0 ? side.radius + radius : side.radius - radius
  if (rho <= 1e-9) return null
  return { kind: "circle", center: side.center, radius: rho }
}

function intersectLoci(a: CenterLocus, b: CenterLocus, ref: Vec2): Vec2 | null {
  if (a.kind === "line" && b.kind === "line") {
    const x = infiniteLineIntersection(a.p0, a.p1, b.p0, b.p1)
    return x ? x.point : null
  }
  if (a.kind === "line" && b.kind === "circle") {
    return nearestPoint(lineCirclePoints(a.p0, a.p1, b.center, b.radius), ref)
  }
  if (a.kind === "circle" && b.kind === "line") {
    return nearestPoint(lineCirclePoints(b.p0, b.p1, a.center, a.radius), ref)
  }
  if (a.kind === "circle" && b.kind === "circle") {
    return nearestPoint(
      circleCircleIntersection(a.center, a.radius, b.center, b.radius),
      ref
    )
  }
  return null
}

/** The tangent point where the fillet circle at `center` touches a side. */
function sideTangentPoint(side: FilletSide, corner: Vec2, center: Vec2): Vec2 {
  if (side.kind === "line") {
    return closestPointOnInfiniteLine(
      corner,
      V.add(corner, side.tangent),
      center
    ).point
  }
  return V.add(
    side.center,
    V.scale(V.normalize(V.sub(center, side.center)), side.radius)
  )
}

/** Whether a tangent point lies within the side's real extent (segment length
 * for a line, sweep for an arc) so the fillet doesn't fall off the segment. */
function sideContains(
  side: FilletSide,
  point: Vec2,
  corner: Vec2,
  segLen: number
): boolean {
  if (side.kind === "line") {
    // The tangent point must lie between the corner and the segment's far end.
    const body = V.normalize(V.sub(side.far, corner))
    const along = V.dot(V.sub(point, corner), body)
    return along >= -1e-9 && along <= segLen + 1e-9
  }
  const angle = Math.atan2(point.y - side.center.y, point.x - side.center.x)
  return angleWithinSweep(side.startAngle, side.endAngle, angle)
}

/** Points where the infinite line through `a`/`b` meets a circle. */
function lineCirclePoints(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number
): Vec2[] {
  const dir = V.sub(b, a)
  return lineCircleIntersectionParams(a, b, center, radius).map((t) =>
    V.add(a, V.scale(dir, t))
  )
}

/** The point in `points` nearest `ref`, or `null` when there are none. */
function nearestPoint(points: readonly Vec2[], ref: Vec2): Vec2 | null {
  let best: Vec2 | null = null
  let bestDist = Infinity
  for (const p of points) {
    const d = V.distance(p, ref)
    if (d < bestDist) {
      bestDist = d
      best = p
    }
  }
  return best
}

/** The interior normal of a side's travel direction for a left (`turn` > 0) or
 * right (`turn` < 0) corner — the direction toward the fillet centre. */
function interiorNormal(tangent: Vec2, turn: number): Vec2 {
  const perp = V.perpendicular(tangent) // +90° (left)
  return turn > 0 ? perp : negate(perp)
}

function negate(v: Vec2): Vec2 {
  return { x: -v.x, y: -v.y }
}
