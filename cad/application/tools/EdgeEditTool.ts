import { Vec2, V } from "../../geometry/Vec2"
import {
  angleWithinSweep,
  circleCircleIntersection,
  infiniteLineIntersection,
  lineCircleIntersectionParams,
  normalizeAngle,
  polarPoint,
  segmentArcIntersection,
  segmentCircleIntersection,
} from "../../geometry/primitives"
import {
  ArcEntity,
  CircleEntity,
  EllipseEntity,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
  PolylineWidth,
  PolylineSegmentGeometry,
  SplineEntity,
  arcSweepAngle,
  createArc,
  createEllipse,
  createLine,
  carryPiece,
  createPolyline,
  ellipseCut,
  ellipseParamAt,
  ellipseSweepParams,
  isFullEllipse,
  fractionAlongSegment,
  nearestPolylineSegment,
  polylineSegmentGeometries,
  polylineSegments,
  polylineSpan,
  readsInPlan,
} from "../../domain/entities"
import { LayerId } from "../../domain/layers"
import {
  RemoveEntitiesCommand,
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  type QuestionInput,
} from "./Tool"
import {
  crossingParams,
  curveCrossings,
  ellipseImplicit,
  ellipseParamOf,
  implicitEdges,
  parametricCurve,
} from "./curveCrossings"
import { typedPick } from "./typedPick"
import {
  buildFenceOverlay,
  fenceCrossing,
  objectsOnFence,
} from "./boxSelection"
import { entityScreenOutline } from "../viewOutline"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"

/**
 * TRIM and EXTEND share one interaction and most of their geometry, so they are
 * built on this common base — AutoCAD likewise treats them as a single command
 * pair where **Shift toggles** from one to the other on the fly.
 *
 * This mirrors AutoCAD's modern *Quick* mode: there is no separate step to pick
 * cutting edges or boundaries — *every* other visible object implicitly acts as
 * one. You simply hover the object to edit (which previews the result) and
 * click:
 *
 * - **Trim**: the clicked portion of the object is removed up to its nearest
 *   intersections. A line portion between two crossings splits it in two; a
 *   portion running off an end just shortens it. A **circle** trimmed between
 *   two crossings becomes the complementary **arc**; an **arc** trims like a
 *   line but along its sweep.
 *   An object no edge cuts is deleted instead, as Quick mode's is.
 * - **Extend**: a line or arc grows from the endpoint nearest the click, along
 *   its own direction/sweep, until it reaches the closest boundary. (Circles
 *   are closed, so they cannot be extended.)
 *
 * The command loops until Escape/Enter, so successive clicks trim more pieces
 * or extend to further boundaries — exactly like AutoCAD. Lines, circles,
 * arcs, polylines, ellipses and splines all serve as edges/boundaries for
 * one another.
 */

type EdgeEditMode = "trim" | "extend"

/** A bare piece of geometry (no id/layer), used for previews and results. */
type EditGeom =
  | { readonly kind: "line"; readonly start: Vec2; readonly end: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }
  | {
      readonly kind: "polyline"
      readonly vertices: readonly Vec2[]
      readonly closed: boolean
      readonly bulges?: readonly number[]
      readonly widths?: readonly PolylineWidth[]
    }
  | {
      readonly kind: "ellipse"
      readonly center: Vec2
      readonly majorAxis: Vec2
      readonly ratio: number
      readonly startParam: number
      readonly endParam: number
    }

/** A resolved edit ready to preview and commit against the hovered object. */
type EdgeEditPlan =
  | {
      readonly kind: "trim"
      readonly targetId: EntityId
      readonly layerId: LayerId
      /** The piece(s) that remain — one when shortened, two when split. */
      readonly replacements: readonly EditGeom[]
      /** The stretch being cut away, drawn as a deletion preview. */
      readonly removed: EditGeom
    }
  | {
      readonly kind: "extend"
      readonly targetId: EntityId
      readonly layerId: LayerId
      readonly result: EditGeom
      /** The stretch being appended, drawn as an addition preview. */
      readonly added: EditGeom
    }
  /** Quick mode's trim of an object no edge cuts: it is deleted. */
  | { readonly kind: "erase"; readonly target: Entity }
  /** A pick TRIM refuses, in the console's words; Undo counts it. */
  | { readonly kind: "refuse"; readonly message: MessageId }

export abstract class EdgeEditTool implements Tool {
  abstract readonly id: string
  abstract readonly shortcut?: string

  /** The action performed without Shift; Shift performs the other one. */
  protected abstract readonly defaultMode: EdgeEditMode

  private preview: EdgeEditPlan | null = null
  /**
   * What Undo takes back since the command started, newest last: an edit
   * (`true`), or a pick EXTEND refused that the console still counts.
   */
  private steps: boolean[] = []
  private lastInput: PointerInput | null = null
  /**
   * The crossing fence a pick on nothing starts, AutoCAD's "pick two empty
   * locations": its second point closes it (acc/tf1–tf19, tg1–tg7).
   */
  private fence: { readonly start: Vec2; readonly cursor: Vec2 } | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.preview = null
    this.fence = null
    this.steps = []
    // PROJMODE 1, EDGEMODE 0 and TRIMEXTENDMODE 1 are fixed here.
    ctx.report(ctx.text.message("trimExtendSettings"))
  }

  /**
   * WHY Undo alone: cuTting edges (Boundary edges), Crossing, mOde, Project
   * and eRase are not offered, so the question ends at its colon until the
   * first edit brings Undo.
   */
  question(): PromptId {
    if (this.fence) return "specifyNextFencePointOr"
    if (this.defaultMode === "trim") {
      return this.steps.length > 0
        ? "selectObjectToTrimOrShiftSelectToExtendOr"
        : "selectObjectToTrimOrShiftSelectToExtend"
    }
    return this.steps.length > 0
      ? "selectObjectToExtendOrShiftSelectToTrimOr"
      : "selectObjectToExtendOrShiftSelectToTrim"
  }

  /**
   * WHY `*Invalid selection*` alone: the console's second line lists the
   * prompt's words but its last, after its unlisted Fence (`Expects a point
   * or Fence/cuTting edges/Crossing/mOde/Project`, EXTEND's `…/Boundary
   * edges/…`, acc/t1, t2) — never Undo, the only one offered here.
   */
  takes(): QuestionInput {
    return { refusal: this.fence ? "invalidResponse" : "invalidSelection" }
  }

  commandOptions(): readonly CommandOption[] {
    return this.fence || this.steps.length > 0 ? [{ id: "Undo" }] : []
  }

  /**
   * Undo takes back the last edit of this command, and only those; back at
   * its start AutoCAD says so, and Undo is no longer offered.
   */
  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    // WHY nothing: AutoCAD 2023's console keeps the fence's first point and
    // asks again (acc/tg1, tg7).
    if (this.fence) return id === "Undo" ? "continue" : "unhandled"
    if (id !== "Undo" || this.steps.length === 0) return "unhandled"
    if (this.steps.pop()) ctx.undo()
    if (this.steps.length === 0) {
      ctx.report(ctx.text.message("commandCompletelyUndone"))
    }
    this.preview = this.lastInput && this.planFor(this.lastInput, ctx)
    ctx.requestRender()
    return "continue"
  }

  onDeactivate(ctx: ToolContext): void {
    this.preview = null
    this.lastInput = null
    if (this.fence) ctx.dynamicInput.close()
    this.fence = null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.fence) {
      this.fence = { ...this.fence, cursor: input.point }
      ctx.dynamicInput.setPosition(input.screen)
      ctx.requestRender()
      return
    }
    this.lastInput = input
    this.preview = this.planFor(input, ctx)
    ctx.requestRender()
  }

  /**
   * A point typed at the prompt picks there (AutoCAD 2023's console, acc/v1,
   * v3, v4 of the hidden UCS words session), and on nothing starts the
   * fence, as a click does.
   */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.fence) return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.onPointerDown(
      {
        screen: ctx.viewport.worldToScreen(point),
        world: point,
        point,
        snap: null,
        tracking: null,
        button: 0,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      },
      ctx
    )
    return true
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.fence) {
      this.closeFence(input.point, ctx)
      return
    }
    this.lastInput = input
    const plan = this.planFor(input, ctx)
    if (!plan) {
      if (ctx.pick(input.world)) this.refuseExtend(input, ctx)
      else this.startFence(input.point, ctx)
      return
    }
    if (plan.kind === "refuse") {
      ctx.report(ctx.text.message(plan.message), "error")
      this.steps.push(false)
      ctx.requestRender()
      return
    }
    this.steps.push(true)
    this.commit(plan, ctx)
    // Loop like AutoCAD: recompute the preview against the now-updated drawing
    // so a follow-up click continues trimming/extending from the same spot.
    this.preview = this.planFor(input, ctx)
    ctx.requestRender()
  }

  wantsSnap(): boolean {
    // Trim/Extend pick objects by proximity, not precise points — running snaps
    // would only clutter the hover, exactly as in AutoCAD. A fence's point is
    // a point.
    return this.fence !== null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.fence) {
      return buildFenceOverlay(ctx.viewport, [
        this.fence.start,
        this.fence.cursor,
      ])
    }
    const plan = this.preview
    if (!plan || plan.kind === "refuse") return []
    const { viewport } = ctx
    if (plan.kind === "erase") {
      return entityScenePrimitive(viewport, plan.target, {
        color: THEME.gripHot,
        width: 1.5,
        dash: [6, 4],
      })
    }
    const prim = (
      g: EditGeom,
      color: string,
      width: number,
      dash?: readonly number[]
    ): ScenePrimitive[] => {
      const stroke: StrokeStyle = { color, width, dash }
      if (g.kind === "line") {
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(g.start),
            b: viewport.worldToScreen(g.end),
            stroke,
          },
        ]
      }
      if (g.kind === "polyline" || g.kind === "ellipse") {
        // A reused id keeps preview frames from burning fresh entity ids.
        return entityScenePrimitive(
          viewport,
          geomToEntity(g, plan.layerId, plan.targetId),
          stroke
        )
      }
      return [
        arcScenePrimitive(
          viewport,
          g.center,
          g.radius,
          g.startAngle,
          g.endAngle,
          stroke
        ),
      ]
    }

    if (plan.kind === "trim") {
      return [
        ...plan.replacements.flatMap((g) => prim(g, THEME.entityHover, 2)),
        ...prim(plan.removed, THEME.gripHot, 1.5, [6, 4]),
      ]
    }
    return prim(plan.added, THEME.selected, 1.5, [6, 4])
  }

  /**
   * An object EXTEND reaches no edge with, said in AutoCAD 2023's console's
   * words (acc/x1, x5, x6, x8, x12, x15 of the arcs session), the pick
   * counted for Undo where the console counts it.
   */
  private refuseExtend(input: PointerInput, ctx: ToolContext): void {
    const hit = this.pickFor(input, ctx)
    if (!hit || this.modeFor(input) !== "extend") return
    const refusal = extendRefusal(hit)
    if (!refusal) return
    ctx.report(ctx.text.message(refusal.message), "error")
    if (refusal.counts) this.steps.push(false)
    ctx.requestRender()
  }

  /** The fence's next point, picked or typed: `@` and a number from its first. */
  private startFence(start: Vec2, ctx: ToolContext): void {
    this.fence = { start, cursor: start }
    this.preview = null
    const from = { ...start, z: ctx.elevation }
    ctx.dynamicInput.open({
      fields: [
        { id: "point", prompt: "specifyNextFencePointOr", kind: "coordinate" },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        const point = isCoordinateExpression(text)
          ? parseCoordinate(text, {
              lastPoint: from,
              relativeByDefault: false,
              ucs: commitCtx.ucs,
              elevation: commitCtx.elevation,
            })
          : null
        if (!point) return false
        this.closeFence({ x: point.x, y: point.y }, commitCtx)
        return true
      },
      directDistance: from,
    })
    ctx.requestRender()
  }

  /**
   * The fence's second point: every object it crosses is trimmed or extended
   * as if picked where the fence first meets it, all planned against the
   * drawing as it was and done as one Undo step, which the console counts
   * even when the fence crosses nothing (acc/tf12, tf14, tf17, tg3–tg6).
   */
  private closeFence(end: Vec2, ctx: ToolContext): void {
    const fence = this.fence
    if (!fence) return
    if (end.x === fence.start.x && end.y === fence.start.y) {
      ctx.report(ctx.text.message("polygonSegmentZeroLength"))
      return
    }
    this.fence = null
    ctx.dynamicInput.close()
    const view = ctx.viewport
    const points = [fence.start, end]
    const screen = points.map((point) => view.worldToScreen(point))
    const crossed = objectsOnFence(
      ctx.document,
      points,
      view,
      (entity) => ctx.document.isEntityVisible(entity) && readsInPlan(entity)
    )
    const ids: EntityId[] = []
    const added: Entity[] = []
    for (const id of crossed) {
      const entity = ctx.document.get(id)
      const at =
        entity &&
        fenceCrossing(entityScreenOutline(view, entity, ctx.blocks), screen)
      if (!entity || !at) continue
      const plan = this.planOn(
        entity,
        view.screenToWorld(at),
        this.defaultMode,
        ctx
      )
      const pieces = plan && plan.kind !== "refuse" && this.piecesOf(plan, ctx)
      if (!pieces) continue
      ids.push(pieces.id)
      added.push(...pieces.added)
    }
    if (ids.length > 0) ctx.execute(new ReplaceEntitiesCommand(ids, added))
    this.steps.push(ids.length > 0)
    ctx.requestRender()
  }

  private modeFor(input: PointerInput): EdgeEditMode {
    if (!input.shiftKey) return this.defaultMode
    return this.defaultMode === "trim" ? "extend" : "trim"
  }

  /**
   * TRIM and EXTEND work in the UCS's XY plane: an object at an angle to it
   * is neither cut nor a boundary (AutoCAD would project some; PROJMODE).
   */
  private pickFor(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    return hit && readsInPlan(hit) ? hit : null
  }

  private planFor(input: PointerInput, ctx: ToolContext): EdgeEditPlan | null {
    const hit = this.pickFor(input, ctx)
    if (!hit) return null
    return this.planOn(hit, input.world, this.modeFor(input), ctx)
  }

  private planOn(
    hit: Entity,
    click: Vec2,
    mode: EdgeEditMode,
    ctx: ToolContext
  ): EdgeEditPlan | null {
    const others = ctx.document
      .getEntities()
      .filter(
        (e) =>
          e.id !== hit.id && ctx.document.isEntityVisible(e) && readsInPlan(e)
      )
    if (mode === "extend") return planExtend(hit, click, others)
    // "In Quick mode, selecting an object that doesn't cross a boundary
    // deletes the object instead" — of those trimmed here.
    return (
      planTrim(hit, click, others) ??
      (TRIMMED.has(hit.type) ? { kind: "erase", target: hit } : null)
    )
  }

  private commit(
    plan: Exclude<EdgeEditPlan, { kind: "refuse" }>,
    ctx: ToolContext
  ): void {
    const pieces = this.piecesOf(plan, ctx)
    if (!pieces) return
    if (pieces.added.length === 0) {
      ctx.execute(new RemoveEntitiesCommand([pieces.id]))
    } else if (pieces.added.length === 1) {
      ctx.execute(new UpdateEntityCommand(pieces.added[0]))
    } else {
      ctx.execute(new ReplaceEntitiesCommand([pieces.id], pieces.added))
    }
  }

  /** The object an edit takes, and what it leaves in its place. */
  private piecesOf(
    plan: Exclude<EdgeEditPlan, { kind: "refuse" }>,
    ctx: ToolContext
  ): { readonly id: EntityId; readonly added: readonly Entity[] } | null {
    if (plan.kind === "erase") return { id: plan.target.id, added: [] }
    const target = ctx.document.get(plan.targetId)
    if (!target) return null
    const geoms = plan.kind === "extend" ? [plan.result] : plan.replacements
    // A mid-object cut splits it in two: the piece from its start, listed
    // first, is the object kept (its handle), the other a new one, which
    // Last then finds — AutoCAD 2023's console (acc/hd1–hd7, hd20).
    return {
      id: plan.targetId,
      added: geoms.map((g, i) =>
        carryPiece(
          target,
          geomToEntity(g, plan.layerId, i === 0 ? plan.targetId : undefined)
        )
      ),
    }
  }
}

/** What `planTrim` cuts, and so what Quick mode deletes when nothing cuts it. */
const TRIMMED: ReadonlySet<Entity["type"]> = new Set([
  "line",
  "circle",
  "arc",
  "polyline",
  "ellipse",
])

const PARAM_EPS = 1e-6
const ANGLE_EPS = 1e-6
const TWO_PI = Math.PI * 2

function geomToEntity(g: EditGeom, layerId: LayerId, id?: EntityId): Entity {
  switch (g.kind) {
    case "line":
      return createLine(g.start, g.end, layerId, id)
    case "arc":
      return createArc(
        g.center,
        g.radius,
        g.startAngle,
        g.endAngle,
        layerId,
        id
      )
    case "polyline":
      return createPolyline(
        g.vertices,
        g.closed,
        layerId,
        g.bulges,
        id,
        g.widths
      )
    case "ellipse":
      return createEllipse(g.center, g.majorAxis, g.ratio, {
        startParam: g.startParam,
        endParam: g.endParam,
        layerId,
        id,
      })
  }
}

function planTrim(
  target: Entity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  switch (target.type) {
    case "line":
      return planTrimLine(target, click, others)
    case "circle":
      return planTrimCircle(target, click, others)
    case "arc":
      return planTrimArc(target, click, others)
    case "polyline":
      return planTrimPolyline(target, click, others)
    case "ellipse":
      return planTrimEllipse(target, click, others)
    case "spline":
      return planTrimSpline(target, others)
    case "text":
    case "mtext":
    case "attdef":
      return null // annotation, not an outline to cut
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

/**
 * Why EXTEND leaves `target` as it is, in the console's words, and whether
 * Undo then counts the pick: a line or an arc `Path does not intersect with
 * the bounding edge.`, an open polyline's end `Object does not intersect an
 * edge.`, a closed polyline `Cannot EXTEND this object.`, all counted; a
 * circle that too and a dimension the path's, neither counted; an elliptical
 * arc as an open polyline's end, a whole ellipse and a closed spline as a
 * closed polyline. `null` where the console extends what is not built here
 * (an open spline) or was not asked.
 */
function extendRefusal(
  target: Entity
): { readonly message: MessageId; readonly counts: boolean } | null {
  switch (target.type) {
    case "line":
    case "arc":
      return { message: "pathDoesNotIntersectBoundingEdge", counts: true }
    case "polyline":
      return {
        message: target.closed
          ? "cannotExtendObject"
          : "objectDoesNotIntersectEdge",
        counts: true,
      }
    case "circle":
      return { message: "cannotExtendObject", counts: false }
    case "ellipse":
      return {
        message: isFullEllipse(target)
          ? "cannotExtendObject"
          : "objectDoesNotIntersectEdge",
        counts: true,
      }
    case "spline":
      return target.closed
        ? { message: "cannotExtendObject", counts: true }
        : null
    case "dimension":
      return { message: "pathDoesNotIntersectBoundingEdge", counts: false }
    default:
      return null
  }
}

function planExtend(
  target: Entity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  switch (target.type) {
    case "line":
      return planExtendLine(target, click, others)
    case "arc":
      return planExtendArc(target, click, others)
    case "circle":
      return null // a closed circle has no endpoint to extend
    case "polyline":
      return planExtendPolyline(target, click, others)
    case "ellipse":
      return planExtendEllipse(target, click, others)
    case "spline":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

// --- Line target ------------------------------------------------------------

function paramOnLine(line: LineEntity, p: Vec2): number {
  const dir = V.sub(line.end, line.start)
  const lenSq = V.lengthSq(dir)
  if (lenSq === 0) return 0
  return V.dot(V.sub(p, line.start), dir) / lenSq
}

function pointOnLine(line: LineEntity, t: number): Vec2 {
  return V.add(line.start, V.scale(V.sub(line.end, line.start), t))
}

/**
 * Parameters (0..1 along the line) where `line` is genuinely crossed *within*
 * its own extent by another entity — the trim breakpoints.
 */
function trimCrossParams(
  line: LineEntity,
  others: readonly Entity[]
): number[] {
  const out: number[] = []
  for (const o of others) {
    if (o.type === "line") {
      const x = infiniteLineIntersection(line.start, line.end, o.start, o.end)
      if (
        x &&
        x.t > PARAM_EPS &&
        x.t < 1 - PARAM_EPS &&
        x.u >= -PARAM_EPS &&
        x.u <= 1 + PARAM_EPS
      ) {
        out.push(x.t)
      }
    } else if (o.type === "circle") {
      for (const p of segmentCircleIntersection(
        line.start,
        line.end,
        o.center,
        o.radius
      )) {
        const t = paramOnLine(line, p)
        if (t > PARAM_EPS && t < 1 - PARAM_EPS) out.push(t)
      }
    } else if (o.type === "arc") {
      for (const p of segmentArcIntersection(
        line.start,
        line.end,
        o.center,
        o.radius,
        o.startAngle,
        o.endAngle
      )) {
        const t = paramOnLine(line, p)
        if (t > PARAM_EPS && t < 1 - PARAM_EPS) out.push(t)
      }
    } else if (o.type === "polyline") {
      for (const [a, b] of polylineSegments(o)) {
        const x = infiniteLineIntersection(line.start, line.end, a, b)
        if (
          x &&
          x.t > PARAM_EPS &&
          x.t < 1 - PARAM_EPS &&
          x.u >= -PARAM_EPS &&
          x.u <= 1 + PARAM_EPS
        ) {
          out.push(x.t)
        }
      }
    } else if (o.type === "ellipse" || o.type === "spline") {
      for (const t of lineCurveParams(line, o)) {
        if (t > PARAM_EPS && t < 1 - PARAM_EPS) out.push(t)
      }
    }
  }
  return dedupeSorted(out)
}

/**
 * Parameters along the infinite line through `line` where an ellipse or a
 * spline crosses it, within the curve's extent.
 */
function lineCurveParams(
  line: LineEntity,
  curve: EllipseEntity | SplineEntity
): number[] {
  const d = V.sub(line.end, line.start)
  if (V.lengthSq(d) === 0) return []
  return curveCrossings(curve, (p) => V.cross(d, V.sub(p, line.start))).map(
    (p) => paramOnLine(line, p)
  )
}

/**
 * Parameters (t along the *infinite* line, unbounded) where `line`, extended,
 * meets another entity *within that entity's extent* — the extend boundaries.
 */
function extendCrossParams(
  line: LineEntity,
  others: readonly Entity[]
): number[] {
  const out: number[] = []
  for (const o of others) {
    if (o.type === "line") {
      const x = infiniteLineIntersection(line.start, line.end, o.start, o.end)
      if (x && x.u >= -PARAM_EPS && x.u <= 1 + PARAM_EPS) out.push(x.t)
    } else if (o.type === "circle") {
      for (const t of lineCircleIntersectionParams(
        line.start,
        line.end,
        o.center,
        o.radius
      )) {
        out.push(t)
      }
    } else if (o.type === "arc") {
      for (const t of lineCircleIntersectionParams(
        line.start,
        line.end,
        o.center,
        o.radius
      )) {
        const p = pointOnLine(line, t)
        const angle = Math.atan2(p.y - o.center.y, p.x - o.center.x)
        if (angleWithinSweep(o.startAngle, o.endAngle, angle)) out.push(t)
      }
    } else if (o.type === "polyline") {
      for (const [a, b] of polylineSegments(o)) {
        const x = infiniteLineIntersection(line.start, line.end, a, b)
        if (x && x.u >= -PARAM_EPS && x.u <= 1 + PARAM_EPS) out.push(x.t)
      }
    } else if (o.type === "ellipse" || o.type === "spline") {
      out.push(...lineCurveParams(line, o))
    }
  }
  return out
}

function planTrimLine(
  line: LineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const crossings = trimCrossParams(line, others)
  if (crossings.length === 0) return null

  const tc = Math.max(0, Math.min(1, paramOnLine(line, click)))
  const bounds = [0, ...crossings, 1]
  let i = 0
  while (i < bounds.length - 1 && !(tc >= bounds[i] && tc <= bounds[i + 1])) i++
  const ta = bounds[i]
  const tb = bounds[i + 1]
  if (ta === 0 && tb === 1) return null // no crossing brackets the click

  const pa = pointOnLine(line, ta)
  const pb = pointOnLine(line, tb)
  const base = {
    kind: "trim" as const,
    targetId: line.id,
    layerId: line.layerId,
  }

  if (ta === 0) {
    return {
      ...base,
      replacements: [{ kind: "line", start: pb, end: line.end }],
      removed: { kind: "line", start: line.start, end: pb },
    }
  }
  if (tb === 1) {
    return {
      ...base,
      replacements: [{ kind: "line", start: line.start, end: pa }],
      removed: { kind: "line", start: pa, end: line.end },
    }
  }
  return {
    ...base,
    replacements: [
      { kind: "line", start: line.start, end: pa },
      { kind: "line", start: pb, end: line.end },
    ],
    removed: { kind: "line", start: pa, end: pb },
  }
}

function planExtendLine(
  line: LineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const crossings = extendCrossParams(line, others)
  if (crossings.length === 0) return null

  const base = {
    kind: "extend" as const,
    targetId: line.id,
    layerId: line.layerId,
  }
  // The half you click on decides which endpoint grows.
  if (paramOnLine(line, click) < 0.5) {
    const candidates = crossings.filter((t) => t < -PARAM_EPS)
    if (candidates.length === 0) return null
    const t = Math.max(...candidates) // nearest boundary past the start
    const p = pointOnLine(line, t)
    return {
      ...base,
      result: { kind: "line", start: p, end: line.end },
      added: { kind: "line", start: line.start, end: p },
    }
  }
  const candidates = crossings.filter((t) => t > 1 + PARAM_EPS)
  if (candidates.length === 0) return null
  const t = Math.min(...candidates) // nearest boundary past the end
  const p = pointOnLine(line, t)
  return {
    ...base,
    result: { kind: "line", start: line.start, end: p },
    added: { kind: "line", start: line.end, end: p },
  }
}

// --- Circle / arc targets ---------------------------------------------------

/**
 * Intersection points between a target circle and an edge entity, respecting
 * the edge's own extent (segment for lines, sweep for arcs).
 */
function circleEdgeCrossPoints(
  center: Vec2,
  radius: number,
  o: Entity
): Vec2[] {
  switch (o.type) {
    case "line":
      return segmentCircleIntersection(o.start, o.end, center, radius)
    case "circle":
      return circleCircleIntersection(center, radius, o.center, o.radius)
    case "arc":
      return circleCircleIntersection(
        center,
        radius,
        o.center,
        o.radius
      ).filter((p) =>
        angleWithinSweep(
          o.startAngle,
          o.endAngle,
          Math.atan2(p.y - o.center.y, p.x - o.center.x)
        )
      )
    case "polyline": {
      const points: Vec2[] = []
      for (const [a, b] of polylineSegments(o)) {
        points.push(...segmentCircleIntersection(a, b, center, radius))
      }
      return points
    }
    case "ellipse":
    case "spline":
      return curveCrossings(o, (p) => V.distance(p, center) - radius)
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return []
  }
}

function angleAt(center: Vec2, p: Vec2): number {
  return normalizeAngle(Math.atan2(p.y - center.y, p.x - center.x))
}

/**
 * Normalised, deduped angles (radians, `[0, 2π)`) where visible entities cross
 * the circle of `center`/`radius`.
 */
function circleCrossAngles(
  center: Vec2,
  radius: number,
  others: readonly Entity[]
): number[] {
  const angles: number[] = []
  for (const o of others) {
    for (const p of circleEdgeCrossPoints(center, radius, o)) {
      angles.push(angleAt(center, p))
    }
  }
  return dedupeAngles(angles)
}

function planTrimCircle(
  circle: CircleEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const angles = circleCrossAngles(circle.center, circle.radius, others)
  if (angles.length === 0) return null
  // AutoCAD 2023's console (acc/o1): cut once, a circle is left as it is.
  if (angles.length === 1) {
    return { kind: "refuse", message: "circleMustIntersectTwice" }
  }

  const clickAngle = angleAt(circle.center, click)
  // Find the CCW segment [θa, θb] the click falls in; the last→first segment
  // wraps across 0/2π and is the default when the click is in that gap.
  let thetaA = angles[angles.length - 1]
  let thetaB = angles[0]
  for (let i = 0; i < angles.length - 1; i++) {
    if (
      clickAngle >= angles[i] - ANGLE_EPS &&
      clickAngle <= angles[i + 1] + ANGLE_EPS
    ) {
      thetaA = angles[i]
      thetaB = angles[i + 1]
      break
    }
  }

  const arc = (startAngle: number, endAngle: number): EditGeom => ({
    kind: "arc",
    center: circle.center,
    radius: circle.radius,
    startAngle,
    endAngle,
  })
  // Removing the clicked arc [θa, θb] leaves the complementary arc [θb, θa].
  return {
    kind: "trim",
    targetId: circle.id,
    layerId: circle.layerId,
    replacements: [arc(thetaB, thetaA)],
    removed: arc(thetaA, thetaB),
  }
}

function planTrimArc(
  arc: ArcEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const sweep = arcSweepAngle(arc)
  const offsets = dedupeSorted(
    circleCrossAngles(arc.center, arc.radius, others)
      .map((a) => normalizeAngle(a - arc.startAngle))
      .filter((o) => o > ANGLE_EPS && o < sweep - ANGLE_EPS)
  )
  if (offsets.length === 0) return null

  const clickOffset = Math.max(
    0,
    Math.min(sweep, normalizeAngle(angleAt(arc.center, click) - arc.startAngle))
  )
  const bounds = [0, ...offsets, sweep]
  let i = 0
  while (
    i < bounds.length - 1 &&
    !(clickOffset >= bounds[i] && clickOffset <= bounds[i + 1])
  ) {
    i++
  }
  const oa = bounds[i]
  const ob = bounds[i + 1]
  if (oa === 0 && ob === sweep) return null

  const thetaA = arc.startAngle + oa
  const thetaB = arc.startAngle + ob
  const piece = (startAngle: number, endAngle: number): EditGeom => ({
    kind: "arc",
    center: arc.center,
    radius: arc.radius,
    startAngle,
    endAngle,
  })
  const base = {
    kind: "trim" as const,
    targetId: arc.id,
    layerId: arc.layerId,
  }

  if (oa === 0) {
    return {
      ...base,
      replacements: [piece(thetaB, arc.endAngle)],
      removed: piece(arc.startAngle, thetaB),
    }
  }
  if (ob === sweep) {
    return {
      ...base,
      replacements: [piece(arc.startAngle, thetaA)],
      removed: piece(thetaA, arc.endAngle),
    }
  }
  return {
    ...base,
    replacements: [piece(arc.startAngle, thetaA), piece(thetaB, arc.endAngle)],
    removed: piece(thetaA, thetaB),
  }
}

function planExtendArc(
  arc: ArcEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const sweep = arcSweepAngle(arc)
  // Candidate boundaries lie on the circle but *outside* the current sweep.
  const outside = circleCrossAngles(arc.center, arc.radius, others).filter(
    (a) => {
      const off = normalizeAngle(a - arc.startAngle)
      return off > sweep + ANGLE_EPS && off < TWO_PI - ANGLE_EPS
    }
  )
  if (outside.length === 0) return null

  const startPt = polarPoint(arc.center, arc.radius, arc.startAngle)
  const endPt = polarPoint(arc.center, arc.radius, arc.endAngle)
  const extendEnd = V.distance(click, endPt) <= V.distance(click, startPt)

  const piece = (startAngle: number, endAngle: number): EditGeom => ({
    kind: "arc",
    center: arc.center,
    radius: arc.radius,
    startAngle,
    endAngle,
  })
  const base = {
    kind: "extend" as const,
    targetId: arc.id,
    layerId: arc.layerId,
  }

  if (extendEnd) {
    // Grow CCW past the end angle to the nearest boundary.
    const best = nearestAngle(outside, (a) => normalizeAngle(a - arc.endAngle))
    if (best === null) return null
    return {
      ...base,
      result: piece(arc.startAngle, best),
      added: piece(arc.endAngle, best),
    }
  }
  // Grow CW past the start angle to the nearest boundary.
  const best = nearestAngle(outside, (a) => normalizeAngle(arc.startAngle - a))
  if (best === null) return null
  return {
    ...base,
    result: piece(best, arc.endAngle),
    added: piece(best, arc.startAngle),
  }
}

// --- Ellipse targets --------------------------------------------------------

/**
 * Parameters (normalised, deduped) where the edges cross the whole ellipse
 * of `ellipse`, each within its own extent: round the ellipse, the sign
 * changes of each edge's implicit function — but along a spline edge,
 * which has none, those of the ellipse's own.
 */
function ellipseCrossParams(
  ellipse: EllipseEntity,
  others: readonly Entity[]
): number[] {
  const whole = createEllipse(
    ellipse.center,
    ellipse.majorAxis,
    ellipse.ratio,
    {
      id: ellipse.id,
    }
  )
  const round = parametricCurve(whole)
  const own = ellipseImplicit(whole).f
  const params: number[] = []
  for (const o of others) {
    if (o.type === "spline") {
      for (const p of curveCrossings(o, own)) {
        params.push(ellipseParamOf(ellipse, p))
      }
      continue
    }
    for (const edge of implicitEdges(o)) {
      params.push(...crossingParams(round, edge))
    }
  }
  return dedupeAngles(params.map(normalizeAngle))
}

function ellipsePiece(
  ellipse: EllipseEntity,
  startParam: number,
  endParam: number
): EditGeom {
  return {
    kind: "ellipse",
    center: ellipse.center,
    majorAxis: ellipse.majorAxis,
    ratio: ellipse.ratio,
    startParam,
    endParam,
  }
}

/**
 * Trims an ellipse as a circle (two crossings bound the removed piece, the
 * rest is left as an elliptical arc) and an elliptical arc as an arc, in the
 * ellipse's parameter. Cut once, a whole ellipse is refused, as AutoCAD 2023's
 * console refuses it (acc/o4).
 */
function planTrimEllipse(
  ellipse: EllipseEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const crossings = ellipseCrossParams(ellipse, others)
  const { start, sweep } = ellipseSweepParams(ellipse)
  const base = {
    kind: "trim" as const,
    targetId: ellipse.id,
    layerId: ellipse.layerId,
  }
  const clickOffset = ellipseParamAt(ellipse, click)
  const cut = (from: number, to: number): EdgeEditPlan => {
    const { kept, removed } = ellipseCut(ellipse, from, to)
    return {
      ...base,
      replacements: kept.map((piece) =>
        ellipsePiece(ellipse, piece.startParam, piece.endParam)
      ),
      removed: ellipsePiece(ellipse, removed.startParam, removed.endParam),
    }
  }

  if (isFullEllipse(ellipse)) {
    if (crossings.length === 0) return null
    if (crossings.length === 1) {
      return { kind: "refuse", message: "curveMustIntersectTwice" }
    }
    let ta = crossings[crossings.length - 1]
    let tb = crossings[0]
    for (let i = 0; i < crossings.length - 1; i++) {
      if (clickOffset >= crossings[i] && clickOffset <= crossings[i + 1]) {
        ta = crossings[i]
        tb = crossings[i + 1]
        break
      }
    }
    return cut(ta, ta + normalizeAngle(tb - ta))
  }

  const offsets = dedupeSorted(
    crossings
      .map((t) => normalizeAngle(t - start))
      .filter((o) => o > ANGLE_EPS && o < sweep - ANGLE_EPS)
  )
  if (offsets.length === 0) return null
  const bounds = [0, ...offsets, sweep]
  let i = 0
  while (
    i < bounds.length - 1 &&
    !(clickOffset >= bounds[i] && clickOffset <= bounds[i + 1])
  ) {
    i++
  }
  return cut(bounds[i], bounds[i + 1])
}

/**
 * Extends an elliptical arc round its ellipse to the nearest edge past the
 * end that grows: the one the pick lies nearer in the ellipse's parameter, as
 * AutoCAD 2023's console decides it (acc/m1–m4) — not along the curve, nor in
 * a straight line.
 */
function planExtendEllipse(
  ellipse: EllipseEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  if (isFullEllipse(ellipse)) return null
  const { start, sweep } = ellipseSweepParams(ellipse)
  const end = start + sweep
  const outside = ellipseCrossParams(ellipse, others).filter((t) => {
    const off = normalizeAngle(t - start)
    return off > sweep + ANGLE_EPS && off < TWO_PI - ANGLE_EPS
  })
  if (outside.length === 0) return null
  const base = {
    kind: "extend" as const,
    targetId: ellipse.id,
    layerId: ellipse.layerId,
  }
  if (ellipseParamAt(ellipse, click) < sweep / 2) {
    const best = nearestAngle(outside, (t) => normalizeAngle(start - t))
    if (best === null) return null
    return {
      ...base,
      result: ellipsePiece(ellipse, best, end),
      added: ellipsePiece(ellipse, best, start),
    }
  }
  const best = nearestAngle(outside, (t) => normalizeAngle(t - end))
  if (best === null) return null
  return {
    ...base,
    result: ellipsePiece(ellipse, start, best),
    added: ellipsePiece(ellipse, end, best),
  }
}

// --- Spline target ----------------------------------------------------------

/**
 * A spline is only deleted or refused here: trimmed, AutoCAD 2023's console
 * leaves its piece on control points and knots of its own (acc/t2, p12),
 * which a spline here — fit points or control vertices on uniform knots —
 * cannot hold, so a spline an edge cuts stays as it is.
 */
function planTrimSpline(
  spline: SplineEntity,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const curve = parametricCurve(spline)
  const params: number[] = []
  for (const o of others) {
    for (const edge of implicitEdges(o)) {
      params.push(...crossingParams(curve, edge))
    }
  }
  const crossings = dedupeSorted(params).length
  if (crossings === 0) return { kind: "erase", target: spline }
  // acc/o3: cut once, a closed one is refused as a whole ellipse is.
  if (spline.closed && crossings === 1) {
    return { kind: "refuse", message: "curveMustIntersectTwice" }
  }
  return null
}

// --- Polyline target --------------------------------------------------------

/** Index of the polyline segment nearest the click (matches `polylineSegmentGeometries`). */
/**
 * The polyline's other segments, which cut the picked one as any edge does:
 * Quick mode makes every object an edge, the polyline too, so AutoCAD 2023's
 * console trims a segment back to its own vertices and to where the polyline
 * crosses itself (acc/tp1, tq1, tq5, tr4), and deletes only a polyline of one
 * segment nothing crosses (tr1).
 */
function ownEdges(poly: PolylineEntity, si: number): Entity[] {
  return polylineSegmentGeometries(poly).flatMap((g, j): Entity[] => {
    if (j === si) return []
    return g.kind === "line"
      ? [createLine(g.a, g.b, poly.layerId, poly.id)]
      : [
          createArc(
            g.center,
            g.radius,
            g.startAngle,
            g.endAngle,
            poly.layerId,
            poly.id
          ),
        ]
  })
}

/**
 * Trims the clicked segment of a polyline (arc segments are handled by
 * {@link planTrimPolylineArc}) between its vertices and the crossings on it.
 * A cut that reaches a free end of the chain merely shortens it (one polyline
 * survives); a mid-chain cut breaks it in two; trimming any segment of a
 * closed polyline opens it into a single chain, from the cut's far end round
 * to its near one. Other segments (including arc bulges) are preserved.
 */
function planTrimPolyline(
  poly: PolylineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const si = nearestPolylineSegment(poly, click)
  const segments = polylineSegments(poly)
  const [a, b] = segments[si]
  const geom = polylineSegmentGeometries(poly)[si]
  if (geom.kind === "arc")
    return planTrimPolylineArc(poly, si, geom, click, others)

  const line = createLine(a, b)
  const crossings = trimCrossParams(line, [...others, ...ownEdges(poly, si)])

  const tc = Math.max(0, Math.min(1, paramOnLine(line, click)))
  const bounds = [0, ...crossings, 1]
  let i = 0
  while (i < bounds.length - 1 && !(tc >= bounds[i] && tc <= bounds[i + 1])) i++
  const ta = bounds[i]
  const tb = bounds[i + 1]

  const replacements = trimPolylinePieces(poly, si, ta, tb)
  if (replacements.length === 0) return null

  return {
    kind: "trim",
    targetId: poly.id,
    layerId: poly.layerId,
    replacements,
    removed: {
      kind: "line",
      start: pointOnLine(line, ta),
      end: pointOnLine(line, tb),
    },
  }
}

type ArcSegment = Extract<PolylineSegmentGeometry, { kind: "arc" }>

/** An arc `EditGeom` between two segment fractions, in the CCW arc convention. */
function subArcGeom(
  center: Vec2,
  radius: number,
  angA: number,
  phi: number,
  f1: number,
  f2: number
): EditGeom {
  const a1 = angA + f1 * phi
  const a2 = angA + f2 * phi
  return phi >= 0
    ? { kind: "arc", center, radius, startAngle: a1, endAngle: a2 }
    : { kind: "arc", center, radius, startAngle: a2, endAngle: a1 }
}

/**
 * Fractions along an arc segment (0 at its start vertex, 1 at its end) where
 * other visible entities cross it — the trim breakpoints in sweep space.
 */
function arcSegmentCrossFractions(
  seg: ArcSegment,
  others: readonly Entity[]
): number[] {
  const phi = 4 * Math.atan(seg.bulge)
  const angA = Math.atan2(seg.a.y - seg.center.y, seg.a.x - seg.center.x)
  const absPhi = Math.abs(phi)
  const sign = Math.sign(phi)
  const out: number[] = []
  for (const o of others) {
    for (const p of circleEdgeCrossPoints(seg.center, seg.radius, o)) {
      const angP = Math.atan2(p.y - seg.center.y, p.x - seg.center.x)
      const f = normalizeAngle((angP - angA) * sign) / absPhi
      if (f > PARAM_EPS && f < 1 - PARAM_EPS) out.push(f)
    }
  }
  return dedupeSorted(out)
}

/**
 * Trims the clicked *arc* segment of a polyline. Mirrors the straight case but
 * in the arc's sweep: the clicked sub-arc is removed and the surviving pieces
 * keep proportional bulges so the retained curvature is exact.
 */
function planTrimPolylineArc(
  poly: PolylineEntity,
  si: number,
  seg: ArcSegment,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  const fractions = arcSegmentCrossFractions(seg, [
    ...others,
    ...ownEdges(poly, si),
  ])

  const phi = 4 * Math.atan(seg.bulge)
  const angA = Math.atan2(seg.a.y - seg.center.y, seg.a.x - seg.center.x)
  const absPhi = Math.abs(phi)
  const sign = Math.sign(phi)
  const angClick = Math.atan2(click.y - seg.center.y, click.x - seg.center.x)
  const fc = Math.max(
    0,
    Math.min(1, normalizeAngle((angClick - angA) * sign) / absPhi)
  )

  const bounds = [0, ...fractions, 1]
  let i = 0
  while (i < bounds.length - 1 && !(fc >= bounds[i] && fc <= bounds[i + 1])) i++
  const fa = bounds[i]
  const fb = bounds[i + 1]

  const replacements = trimPolylinePieces(poly, si, fa, fb)
  if (replacements.length === 0) return null

  return {
    kind: "trim",
    targetId: poly.id,
    layerId: poly.layerId,
    replacements,
    removed: subArcGeom(seg.center, seg.radius, angA, phi, fa, fb),
  }
}

/**
 * The polyline piece(s) left after removing the interval `[ta, tb]` of
 * segment `si` (fractions along it, an arc's by its sweep), every other
 * segment's bulge carried into what survives (`polylineSpan`, BREAK's cut
 * too). A cut that reaches a free end merely shortens the chain; a mid-chain
 * cut breaks it in two; a closed polyline opens into one chain, from the
 * cut's far end round to its near one. A bare stub at a free end is dropped.
 */
function trimPolylinePieces(
  poly: PolylineEntity,
  si: number,
  ta: number,
  tb: number
): EditGeom[] {
  const count = polylineSegments(poly).length
  const piece = (from: number, to: number): EditGeom[] =>
    to - from > PARAM_EPS
      ? [{ kind: "polyline", ...polylineSpan(poly, from, to), closed: false }]
      : []
  // Two vertices make one segment, closed or not (`polylineSegments`).
  if (poly.closed && poly.vertices.length > 2) {
    return piece(si + tb, si + ta + count)
  }
  return [...piece(0, si + ta), ...piece(si + tb, count)]
}

/**
 * Extends a free end of an open polyline: its end segment grows along its
 * own direction/sweep until it meets the nearest boundary, moving the chain's
 * endpoint vertex (arc segments are handled by {@link planExtendPolylineArc}).
 * The end is the one the pick lies nearer in the polyline's parameter — its
 * segment's index plus how far along it —, as AutoCAD 2023's console grows
 * it from any segment: from the first half of the segments the start, so an
 * end segment's own end. Closed polylines have no free end.
 */
function planExtendPolyline(
  poly: PolylineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  if (poly.closed) return null
  const v = poly.vertices
  const n = v.length
  const segments = polylineSegmentGeometries(poly)
  const si = nearestPolylineSegment(poly, click)
  const growStart = si + fractionAlongSegment(segments[si], click) < (n - 1) / 2
  const end = growStart ? 0 : n - 2
  const geom = segments[end]
  if (geom.kind === "arc") {
    return planExtendPolylineArc(poly, end, geom, others, growStart)
  }

  if (growStart) {
    const seg = createLine(v[0], v[1])
    const t = nearestExtendParam(seg, others, "before")
    if (t === null) return null
    const np = pointOnLine(seg, t)
    return {
      kind: "extend",
      targetId: poly.id,
      layerId: poly.layerId,
      result: extendedPolyline(poly, 0, np),
      added: { kind: "line", start: v[0], end: np },
    }
  }
  const seg = createLine(v[n - 2], v[n - 1])
  const t = nearestExtendParam(seg, others, "after")
  if (t === null) return null
  const np = pointOnLine(seg, t)
  return {
    kind: "extend",
    targetId: poly.id,
    layerId: poly.layerId,
    result: extendedPolyline(poly, n - 1, np),
    added: { kind: "line", start: v[n - 1], end: np },
  }
}

/**
 * Extends a free end of an open polyline whose end segment is an *arc*: the arc
 * grows along its own sweep, past the free endpoint (the start's when
 * `growStart`), to the nearest boundary on its circle. The end segment's
 * bulge is enlarged to match the new sweep.
 */
function planExtendPolylineArc(
  poly: PolylineEntity,
  si: number,
  seg: ArcSegment,
  others: readonly Entity[],
  growStart: boolean
): EdgeEditPlan | null {
  const phi = 4 * Math.atan(seg.bulge)
  const angA = Math.atan2(seg.a.y - seg.center.y, seg.a.x - seg.center.x)
  const absPhi = Math.abs(phi)
  const sign = Math.sign(phi)
  const fFull = (2 * Math.PI) / absPhi

  // Circle crossings that lie in the gap past the sweep are the boundaries.
  const outside: number[] = []
  for (const o of others) {
    for (const p of circleEdgeCrossPoints(seg.center, seg.radius, o)) {
      const angP = Math.atan2(p.y - seg.center.y, p.x - seg.center.x)
      const f = normalizeAngle((angP - angA) * sign) / absPhi
      if (f > 1 + PARAM_EPS && f < fFull - PARAM_EPS) outside.push(f)
    }
  }
  if (outside.length === 0) return null

  const n = poly.vertices.length
  const base = {
    kind: "extend" as const,
    targetId: poly.id,
    layerId: poly.layerId,
  }

  if (growStart) {
    // Grow past the start vertex: the boundary just *before* it is the largest
    // gap fraction, taken as a negative fraction (`fMax - fFull`).
    const fMax = Math.max(...outside)
    const fNeg = fMax - fFull
    const np = polarPoint(seg.center, seg.radius, angA + fMax * phi)
    const newBulge = Math.tan(((1 - fNeg) * phi) / 4)
    return {
      ...base,
      result: extendedPolyline(poly, 0, np, { index: 0, value: newBulge }),
      added: subArcGeom(seg.center, seg.radius, angA, phi, fNeg, 0),
    }
  }
  // Grow past the end vertex: the nearest gap fraction beyond 1.
  const fMin = Math.min(...outside)
  const np = polarPoint(seg.center, seg.radius, angA + fMin * phi)
  const newBulge = Math.tan((fMin * phi) / 4)
  return {
    ...base,
    result: extendedPolyline(poly, n - 1, np, {
      index: n - 2,
      value: newBulge,
    }),
    added: subArcGeom(seg.center, seg.radius, angA, phi, 1, fMin),
  }
}

/** Nearest extend boundary param past the start (`before`, t<0) or end (`after`, t>1). */
function nearestExtendParam(
  line: LineEntity,
  others: readonly Entity[],
  side: "before" | "after"
): number | null {
  const crossings = extendCrossParams(line, others)
  if (side === "before") {
    const candidates = crossings.filter((t) => t < -PARAM_EPS)
    return candidates.length ? Math.max(...candidates) : null
  }
  const candidates = crossings.filter((t) => t > 1 + PARAM_EPS)
  return candidates.length ? Math.min(...candidates) : null
}

/** The polyline with its endpoint vertex `index` moved to `point`; an optional
 * `bulgeOverride` resets one segment's curvature (used when an arc end grows). */
function extendedPolyline(
  poly: PolylineEntity,
  index: number,
  point: Vec2,
  bulgeOverride?: { index: number; value: number }
): EditGeom {
  const vertices = poly.vertices.map((vtx, i) =>
    i === index ? { x: point.x, y: point.y } : { x: vtx.x, y: vtx.y }
  )
  let bulges = poly.bulges ? poly.bulges.slice() : undefined
  if (bulgeOverride) {
    if (!bulges) bulges = new Array(poly.vertices.length - 1).fill(0)
    bulges[bulgeOverride.index] = bulgeOverride.value
  }
  // The segment grown keeps its widths, tapering over its new length
  // (acc/w18).
  return {
    kind: "polyline",
    vertices,
    closed: false,
    bulges,
    widths: poly.widths,
  }
}

/** The angle in `angles` with the smallest positive `gap`, or `null`. */
function nearestAngle(
  angles: readonly number[],
  gap: (a: number) => number
): number | null {
  let best: number | null = null
  let bestGap = Infinity
  for (const a of angles) {
    const g = gap(a)
    if (g > ANGLE_EPS && g < bestGap) {
      bestGap = g
      best = a
    }
  }
  return best
}

function dedupeSorted(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (const v of sorted) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]) > PARAM_EPS) {
      out.push(v)
    }
  }
  return out
}

function dedupeAngles(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (const v of sorted) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]) > ANGLE_EPS) {
      out.push(v)
    }
  }
  // Merge a value near 2π with its near-0 twin (same physical direction).
  if (
    out.length > 1 &&
    Math.abs(out[out.length - 1] - (out[0] + TWO_PI)) < ANGLE_EPS
  ) {
    out.pop()
  }
  return out
}
