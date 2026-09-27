import { Vec2, V } from "../../geometry/Vec2"
import {
  angleWithinSweep,
  circleCircleIntersection,
  closestPointOnArc,
  closestPointOnSegment,
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
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
  PolylineSegmentGeometry,
  arcSweepAngle,
  createArc,
  createLine,
  createPolyline,
  polylineBulge,
  polylineSegmentGeometries,
  polylineSegments,
} from "../../domain/entities"
import { LayerId } from "../../domain/layers"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import { PointerInput, Tool, ToolContext } from "./Tool"

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
 * - **Extend**: a line or arc grows from the endpoint nearest the click, along
 *   its own direction/sweep, until it reaches the closest boundary. (Circles
 *   are closed, so they cannot be extended.)
 *
 * The command loops until Escape/Enter, so successive clicks trim more pieces
 * or extend to further boundaries — exactly like AutoCAD. Lines, circles and
 * arcs all serve as edges/boundaries for one another.
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

export abstract class EdgeEditTool implements Tool {
  abstract readonly id: string
  abstract readonly shortcut?: string

  /** The action performed without Shift; Shift performs the other one. */
  protected abstract readonly defaultMode: EdgeEditMode

  private preview: EdgeEditPlan | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.preview = null
  }

  onDeactivate(): void {
    this.preview = null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.preview = this.planFor(input, ctx)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const plan = this.planFor(input, ctx)
    if (!plan) return
    this.commit(plan, ctx)
    // Loop like AutoCAD: recompute the preview against the now-updated drawing
    // so a follow-up click continues trimming/extending from the same spot.
    this.preview = this.planFor(input, ctx)
    ctx.requestRender()
  }

  wantsSnap(): boolean {
    // Trim/Extend pick objects by proximity, not precise points — running snaps
    // would only clutter the hover, exactly as in AutoCAD.
    return false
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const plan = this.preview
    if (!plan) return []
    const { viewport } = ctx
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
      if (g.kind === "polyline") {
        // A reused id keeps preview frames from burning fresh entity ids.
        return entityScenePrimitive(
          viewport,
          createPolyline(
            g.vertices,
            g.closed,
            plan.layerId,
            g.bulges,
            plan.targetId
          ),
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

  private planFor(input: PointerInput, ctx: ToolContext): EdgeEditPlan | null {
    const hit = ctx.pick(input.world)
    if (!hit) return null
    const mode: EdgeEditMode = input.shiftKey
      ? this.defaultMode === "trim"
        ? "extend"
        : "trim"
      : this.defaultMode
    const others = ctx.document
      .getEntities()
      .filter((e) => e.id !== hit.id && ctx.document.isEntityVisible(e))
    return mode === "trim"
      ? planTrim(hit, input.world, others)
      : planExtend(hit, input.world, others)
  }

  private commit(plan: EdgeEditPlan, ctx: ToolContext): void {
    if (plan.kind === "extend") {
      ctx.execute(
        new UpdateEntityCommand(
          geomToEntity(plan.result, plan.layerId, plan.targetId)
        )
      )
      return
    }
    if (plan.replacements.length === 1) {
      ctx.execute(
        new UpdateEntityCommand(
          geomToEntity(plan.replacements[0], plan.layerId, plan.targetId)
        )
      )
      return
    }
    // A mid-object cut splits it into two independent pieces.
    ctx.execute(
      new ReplaceEntitiesCommand(
        [plan.targetId],
        plan.replacements.map((g) => geomToEntity(g, plan.layerId))
      )
    )
  }
}

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
      return createPolyline(g.vertices, g.closed, layerId, g.bulges, id)
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
    case "text":
      return null // annotation, not an outline to cut
    case "ellipse":
    case "dimension":
    case "hatch":
    case "insert":
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
    case "text":
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
    }
  }
  return dedupeSorted(out)
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
    case "text":
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
  if (angles.length < 2) return null // need two crossings to bound a piece

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

// --- Polyline target --------------------------------------------------------

/** Index of the polyline segment nearest the click (matches `polylineSegmentGeometries`). */
function nearestPolylineSegment(poly: PolylineEntity, click: Vec2): number {
  const geoms = polylineSegmentGeometries(poly)
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < geoms.length; i++) {
    const g = geoms[i]
    const d =
      g.kind === "line"
        ? closestPointOnSegment(g.a, g.b, click).distance
        : closestPointOnArc(g.center, g.radius, g.startAngle, g.endAngle, click)
            .distance
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

/**
 * Trims the clicked segment of a polyline (arc segments are handled by
 * {@link planTrimPolylineArc}). A cut that reaches a free end of the chain
 * merely shortens it (one polyline survives); a mid-segment cut breaks the
 * chain in two; trimming any segment of a closed polyline opens it into a
 * single chain. Other segments (including arc bulges) are preserved.
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
  const replacements = trimPolylinePieces(poly, si, ta, tb, pa, pb)
  if (replacements.length === 0) return null

  return {
    kind: "trim",
    targetId: poly.id,
    layerId: poly.layerId,
    replacements,
    removed: { kind: "line", start: pa, end: pb },
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
  const fractions = arcSegmentCrossFractions(seg, others)
  if (fractions.length === 0) return null

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
  if (fa === 0 && fb === 1) return null

  const pa = polarPoint(seg.center, seg.radius, angA + fa * phi)
  const pb = polarPoint(seg.center, seg.radius, angA + fb * phi)
  const startBulge = Math.tan((fa * phi) / 4) // sub-arc from start vertex to pa
  const endBulge = Math.tan(((1 - fb) * phi) / 4) // sub-arc from pb to end vertex

  const replacements = trimPolylinePieces(
    poly,
    si,
    fa,
    fb,
    pa,
    pb,
    startBulge,
    endBulge
  )
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
 * The polyline piece(s) left after removing the interval `[ta, tb]` of segment
 * `si`, with every other segment's bulge carried into the surviving pieces. The
 * two new boundary segments (start-vertex→pa and pb→end-vertex) take
 * `startBulge`/`endBulge` — zero for a straight target, or the retained sub-arc
 * bulge when the trimmed segment is an arc. Pieces with fewer than two vertices
 * (a bare stub at a free end) are dropped.
 */
function trimPolylinePieces(
  poly: PolylineEntity,
  si: number,
  ta: number,
  tb: number,
  pa: Vec2,
  pb: Vec2,
  startBulge = 0,
  endBulge = 0
): EditGeom[] {
  const v = poly.vertices
  const n = v.length
  const keepStart = ta > PARAM_EPS // pa is distinct from the segment's start vertex
  const keepEnd = tb < 1 - PARAM_EPS // pb is distinct from the segment's end vertex
  const clone = (p: Vec2): Vec2 => ({ x: p.x, y: p.y })

  if (poly.closed) {
    // A cut opens the loop into one chain: from pb, around the ring past the
    // untouched vertices back to the start vertex, ending at pa.
    const endVertex = (si + 1) % n
    const vertices: Vec2[] = []
    const bulges: number[] = []
    if (keepEnd) {
      vertices.push(clone(pb))
      bulges.push(endBulge)
    }
    for (let k = 0; k < n; k++) {
      const idx = (endVertex + k) % n
      vertices.push(clone(v[idx]))
      if (k < n - 1) bulges.push(polylineBulge(poly, idx))
    }
    if (keepStart) {
      bulges.push(startBulge)
      vertices.push(clone(pa))
    }
    return vertices.length >= 2
      ? [{ kind: "polyline", vertices, closed: false, bulges }]
      : []
  }

  const pieces: EditGeom[] = []
  const beforeV: Vec2[] = []
  const beforeB: number[] = []
  for (let idx = 0; idx <= si; idx++) {
    beforeV.push(clone(v[idx]))
    if (idx < si) beforeB.push(polylineBulge(poly, idx))
  }
  if (keepStart) {
    beforeB.push(startBulge)
    beforeV.push(clone(pa))
  }
  if (beforeV.length >= 2) {
    pieces.push({
      kind: "polyline",
      vertices: beforeV,
      closed: false,
      bulges: beforeB,
    })
  }

  const afterV: Vec2[] = []
  const afterB: number[] = []
  if (keepEnd) {
    afterV.push(clone(pb))
    afterB.push(endBulge)
  }
  for (let idx = si + 1; idx < n; idx++) {
    afterV.push(clone(v[idx]))
    if (idx < n - 1) afterB.push(polylineBulge(poly, idx))
  }
  if (afterV.length >= 2) {
    pieces.push({
      kind: "polyline",
      vertices: afterV,
      closed: false,
      bulges: afterB,
    })
  }
  return pieces
}

/**
 * Extends a free end of an open polyline: the clicked end segment grows along
 * its own direction/sweep until it meets the nearest boundary, moving the
 * chain's endpoint vertex (arc segments are handled by
 * {@link planExtendPolylineArc}). Closed polylines have no free end.
 */
function planExtendPolyline(
  poly: PolylineEntity,
  click: Vec2,
  others: readonly Entity[]
): EdgeEditPlan | null {
  if (poly.closed) return null
  const v = poly.vertices
  const n = v.length
  const si = nearestPolylineSegment(poly, click)
  const geom = polylineSegmentGeometries(poly)[si]

  const isFirst = si === 0
  const isLast = si === n - 2
  if (!isFirst && !isLast) return null

  if (geom.kind === "arc")
    return planExtendPolylineArc(poly, si, geom, click, others, isFirst, isLast)

  // The clicked half of the end segment decides which endpoint grows.
  const line = createLine(v[si], v[si + 1])
  const p = paramOnLine(line, click)
  const growStart = isFirst && (!isLast || p < 0.5)

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
  if (isLast && (!isFirst || p >= 0.5)) {
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
  return null
}

/**
 * Extends a free end of an open polyline whose end segment is an *arc*: the arc
 * grows along its own sweep, past the free endpoint, to the nearest boundary on
 * its circle. The end segment's bulge is enlarged to match the new sweep.
 */
function planExtendPolylineArc(
  poly: PolylineEntity,
  si: number,
  seg: ArcSegment,
  click: Vec2,
  others: readonly Entity[],
  isFirst: boolean,
  isLast: boolean
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

  const angClick = Math.atan2(click.y - seg.center.y, click.x - seg.center.x)
  const fc = normalizeAngle((angClick - angA) * sign) / absPhi
  const growStart = isFirst && (!isLast || fc < 0.5)
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
  return {
    kind: "polyline",
    vertices,
    closed: false,
    bulges,
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
