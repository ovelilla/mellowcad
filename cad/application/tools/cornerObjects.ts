import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, WORLD_Z, planar } from "../../geometry/Vec3"
import { arbitraryAxis, worldToAxes } from "../../geometry/ocs"
import {
  closestPointOnArc,
  closestPointOnInfiniteLine,
  closestPointOnSegment,
  normalizeAngle,
  polarPoint,
} from "../../geometry/primitives"
import {
  Entity,
  LineEntity,
  PolylineEntity,
  carryOverrides,
  coplanar,
  createPolyline,
  entityAxes,
  entityElevation,
  entityFromOcs,
  entityInOcs,
  entityNormal,
  entityPointToWorld,
  facesAlong,
  isTilted,
  polylineSegmentGeometries,
  readsInPlan,
  sharesTiltedPlane,
  withNormal,
} from "../../domain/entities"
import type { CameraTransform } from "../../scene/types"
import type { MessageId } from "../EngineText"
import type { Curve, CurveEnd } from "./curveFillets"
import { LinePick, alongOnScreen } from "./lineCorner"
import { fenceCrossing, meetsPolygon } from "./boxSelection"
import { ONE_OBJECT_MODES, type ModeFind } from "./objectSelection"
import { entityScreenOutline } from "../viewOutline"
import { cursorInPlane } from "../viewPick"
import { bulgeBetween, segmentsPair } from "./polylineCorners"
import type { RoundObject, RoundPartner } from "./roundFillets"
import { QuestionInput, ToolContext } from "./Tool"
import { typedPick } from "./typedPick"

/** A segment of a polyline, picked as one of FILLET's two objects. */
export interface SegmentPick {
  readonly poly: PolylineEntity
  readonly index: number
}

/** What FILLET and CHAMFER take as each of their two objects. */
export type CornerObject = LineEntity | SegmentPick

/** FILLET's objects: CHAMFER's, and an ARC or a CIRCLE. */
export type FilletObject = CornerObject | RoundObject

export function isSegment(object: FilletObject): object is SegmentPick {
  return "poly" in object
}

export function isRound(object: FilletObject): object is RoundObject {
  return !isSegment(object) && object.type !== "line"
}

/** What a pick of `object` highlights: the line, or its whole polyline. */
export function cornerEntity(object: FilletObject): Entity {
  return isSegment(object) ? object.poly : object
}

/** Whether the object is an arc segment of a polyline. */
export function isArcSegment(object: CornerObject): boolean {
  return isSegment(object) && curveOf(object).kind === "arc"
}

/** The object as the curve a corner is cut on: a line, or its segment. */
export function curveOf(object: CornerObject): Curve {
  return isSegment(object)
    ? polylineSegmentGeometries(object.poly)[object.index]
    : { kind: "line", a: object.start, b: object.end }
}

/**
 * The object a FILLET or CHAMFER pick at `world` takes: a line, or the
 * segment of a polyline nearest it, an arc segment too. With `first` already
 * taken, only what can make a corner with it: another line, or a segment of
 * another polyline, or a segment of the same polyline next to it or one
 * segment away.
 */
export function pickCornerObject(
  ctx: ToolContext,
  pick: LinePick,
  first: CornerObject | null
): CornerObject | null {
  const hit = ctx.pick(pick.world)
  return hit ? cornerObjectAt(ctx, hit, pick, first) : null
}

/**
 * The object `hit` is as {@link pickCornerObject} takes it at `pick`, a
 * polyline's segment given by `index` where it is not the one nearest.
 */
function cornerObjectAt(
  ctx: ToolContext,
  hit: Entity,
  pick: LinePick,
  first: CornerObject | null,
  index = segmentAt(ctx, hit, pick)
): CornerObject | null {
  if (hit.type === "line") {
    return first === null || isSegment(first) || first.id !== hit.id
      ? hit
      : null
  }
  if (hit.type !== "polyline" || index === null) return null
  if (first === null || !isSegment(first) || first.poly.id !== hit.id) {
    return { poly: hit, index }
  }
  return segmentsPair(hit, first.index, index) ? { poly: hit, index } : null
}

/**
 * The object a pick takes where an ARC or a CIRCLE is one too (FILLET's, and
 * CHAMFER's to refuse): with `first` taken not the same object (one out of
 * the other's plane is taken, for FILLET to refuse). Anything else as
 * {@link pickCornerObject}.
 */
export function pickFilletObject(
  ctx: ToolContext,
  pick: LinePick,
  first: FilletObject | null
): FilletObject | null {
  const hit = ctx.pick(pick.world)
  return hit ? filletObjectAt(ctx, hit, pick, first) : null
}

function filletObjectAt(
  ctx: ToolContext,
  hit: Entity,
  pick: LinePick,
  first: FilletObject | null,
  index?: number
): FilletObject | null {
  if (hit.type !== "arc" && hit.type !== "circle") {
    return cornerObjectAt(
      ctx,
      hit,
      pick,
      first && isRound(first) ? null : first,
      index
    )
  }
  return first === null || cornerEntity(first).id !== hit.id ? hit : null
}

/**
 * Why a pick at the second prompt makes no corner with `first`, where the
 * console says so rather than taking nothing (acc/i1–i5, j6, k1–k5): the
 * first object again, its polyline's segment included, or a segment of its
 * polyline two or more away (an open one's first and last make a corner).
 */
export function cornerPairRefusal(
  ctx: ToolContext,
  pick: LinePick,
  first: FilletObject
): PairRefusal | null {
  const hit = ctx.pick(pick.world)
  return hit && pairRefusal(first, hit, () => segmentAt(ctx, hit, pick))
}

/** Why the second object makes no corner with the first, said and refused. */
export type PairRefusal = "itself" | "apart"

/**
 * {@link cornerPairRefusal} for what a mode found at the second prompt, read
 * as {@link foundFilletObject} reads it: the console refuses a crossing
 * window's or a fence's segment as it refuses a pick there (acc/v1–v8 of
 * 2026-10-14).
 */
export function foundPairRefusal(
  ctx: ToolContext,
  entity: Entity,
  find: ModeFind,
  first: FilletObject
): PairRefusal | null {
  return pairRefusal(first, entity, () => {
    const found = foundFilletObject(ctx, entity, find, null)
    return found && !found.whole && isSegment(found.object)
      ? found.object.index
      : null
  })
}

function pairRefusal(
  first: FilletObject,
  hit: Entity,
  segment: () => number | null
): PairRefusal | null {
  if (!isSegment(first))
    return cornerEntity(first).id === hit.id ? "itself" : null
  if (hit.id !== first.poly.id) return null
  const index = segment()
  if (index === null) return null
  if (index === first.index) return "itself"
  return segmentsPair(first.poly, first.index, index) ? null : "apart"
}

/**
 * The modes FILLET's and CHAMFER's object prompts take, as their refusal
 * lists them: a single object's, not ALL.
 */
export const CORNER_OBJECT_MODES = ONE_OBJECT_MODES.filter(
  (mode) => mode !== "ALL"
)

/**
 * How FILLET's and CHAMFER's object prompts refuse an answer, in AutoCAD
 * 2023's console's words: the modes, then the keywords `set` names. The
 * console lists the prompt's own words but the last (FILLET's first prompt
 * leaves out Multiple), and a prompt with one word that word and the end of
 * the prompt (`Radius]:`); the words this command does not offer (Trim,
 * Angle, mEthod) are left out with it.
 */
export function cornerObjectRefusal(
  set: "fillet" | "filletRadius" | "chamfer" | "chamferDistance"
): QuestionInput {
  return {
    refusal: ["invalidSelection", "expectsCornerObject"],
    values: { set },
  }
}

/**
 * A point typed at FILLET's and CHAMFER's object prompts, a pick there as
 * AutoCAD 2023's console takes it: `30,40` picks what passes through it, and
 * on nothing the prompt is asked again ({@link typedPick}). Null for
 * anything but a coordinate.
 */
export function typedCornerPick(
  text: string,
  ctx: ToolContext
): LinePick | null {
  const point = typedPick(text, ctx)
  return (
    point && { world: planar(point), screen: ctx.viewport.worldToScreen(point) }
  )
}

/** Whether a mode's find is an object FILLET or CHAMFER takes. */
export function isCornerEntity(entity: Entity | undefined): boolean {
  return (
    entity?.type === "line" ||
    entity?.type === "polyline" ||
    entity?.type === "arc" ||
    entity?.type === "circle"
  )
}

/**
 * An object a selection mode found at FILLET's and CHAMFER's object prompts,
 * and the pick it stands for there.
 */
export interface FoundObject {
  readonly object: FilletObject
  readonly pick: LinePick
  /**
   * A polyline a window, a polygon or Last found whole: no segment is read
   * from it, and no corner is made of it.
   */
  readonly whole: boolean
  /**
   * The pick only stands for one the mode did not give (a middle, a first
   * vertex): where two parallel lines are capped, the console reads the
   * cap's end from the origin instead.
   */
  readonly stands: boolean
}

/**
 * What a mode's find stands for at FILLET's and CHAMFER's object prompts, as
 * AutoCAD 2023's console reads it: a fence picks where it first crosses the
 * object; otherwise a line, an arc or a circle is picked at its middle (a
 * line keeps its longer side), and a polyline at the first segment a
 * crossing window or polygon meets, picked at the polyline's first vertex
 * (the run from it is kept, wherever the window lies). `null` where a pick
 * there takes nothing.
 */
export function foundFilletObject(
  ctx: ToolContext,
  entity: Entity,
  find: ModeFind,
  first: FilletObject | null
): FoundObject | null {
  const view = ctx.viewport
  const at = (point: Vec2): LinePick => ({
    world: point,
    screen: view.worldToScreen(entityPointToWorld(entity, point)),
  })
  const take = (pick: LinePick, stands: boolean, index?: number) => {
    const object = filletObjectAt(ctx, entity, pick, first, index)
    return object && { object, pick, whole: false, stands }
  }
  const crossed =
    find.by === "fence" &&
    fenceCrossing(
      entityScreenOutline(view, entity, ctx.blocks),
      find.points.map((point) => view.worldToScreen(point))
    )
  if (crossed) {
    return take({ world: view.screenToWorld(crossed), screen: crossed }, false)
  }
  if (entity.type === "polyline") {
    const pick = at(entity.vertices[0])
    const index =
      find.by === "crossing" ? firstSegmentIn(entity, find.outline, view) : null
    return index === null
      ? { object: { poly: entity, index: 0 }, pick, whole: true, stands: true }
      : take(pick, true, index)
  }
  const middle = middleOf(entity)
  return middle && take(at(middle), true)
}

/**
 * Where a mode's find of a line, an arc or a circle stands for its pick: its
 * middle — a circle's half way round from its angle 0.
 */
function middleOf(entity: Entity): Vec2 | null {
  switch (entity.type) {
    case "line":
      return V.lerp(entity.start, entity.end, 0.5)
    case "arc":
      return polarPoint(
        entity.center,
        entity.radius,
        entity.startAngle +
          normalizeAngle(entity.endAngle - entity.startAngle) / 2
      )
    case "circle":
      return polarPoint(entity.center, entity.radius, Math.PI)
    default:
      return null
  }
}

/** The first segment of `poly` drawn crossing or inside `outline`. */
function firstSegmentIn(
  poly: PolylineEntity,
  outline: readonly Vec2[],
  view: CameraTransform
): number | null {
  const polygon = outline.map((point) => view.worldToScreen(point))
  const drawn = (point: Vec2) =>
    view.worldToScreen(entityPointToWorld(poly, point))
  const index = polylineSegmentGeometries(poly).findIndex((segment) =>
    meetsPolygon(segmentPoints(segment).map(drawn), polygon)
  )
  return index < 0 ? null : index
}

/**
 * FILLET's and CHAMFER's two objects where they are cut, and the picks there:
 * as they are when both read in plan, else in the OCS of the tilted
 * polyline's plane, where AutoCAD 2023's console rounds and bevels them too
 * (within it, or joined with a line lying in it). `back` returns what is
 * built there; an object off that plane stays off it, for the coplanar test
 * to refuse.
 */
export interface CornerPlane {
  readonly first: CornerObject
  readonly pick1: Vec2
  readonly second: CornerObject
  readonly pick2: Vec2
  back(entity: Entity): Entity
}

export function cornerPlane(
  first: CornerObject,
  pick1: LinePick,
  second: CornerObject,
  pick2: LinePick,
  view: CameraTransform
): CornerPlane {
  const tilted = [first, second].find(
    (object): object is SegmentPick =>
      isSegment(object) && !readsInPlan(object.poly)
  )
  const axes = tilted && arbitraryAxis(entityNormal(tilted.poly))
  if (!tilted || !axes) {
    return {
      first,
      pick1: pick1.world,
      second,
      pick2: pick2.world,
      back: (entity) => entity,
    }
  }
  const normal = entityNormal(tilted.poly)
  const into = (object: CornerObject, pick: LinePick): [CornerObject, Vec2] => {
    if (!isSegment(object)) {
      // WHY no normal: in the plane's frame the line is a level one there,
      // whatever extrusion it had in the WCS.
      const line = withNormal(entityInOcs(object, normal), WORLD_Z)
      const along = alongOnScreen(object, pick.screen, view)
      return [line as LineEntity, planar(worldToAxes(axes, along))]
    }
    const poly = entityInOcs(object.poly, normal) as PolylineEntity
    const seen = facesAlong(object.poly, normal)
      ? nearestOnScreen(object.poly, pick.screen, view)
      : null
    return [{ poly, index: object.index }, seen?.point ?? pick.world]
  }
  const [inFirst, onFirst] = into(first, pick1)
  const [inSecond, onSecond] = into(second, pick2)
  return {
    first: inFirst,
    pick1: onFirst,
    second: inSecond,
    pick2: onSecond,
    back: backFromPlane(normal),
  }
}

/**
 * What is built in the OCS of the plane facing `normal`, back in the WCS.
 * WHY the plane's own normal on what lies level there: rebuilt from its axes
 * it would drift a last bit with every cut, and a file with it.
 */
function backFromPlane(normal: Vec3): (entity: Entity) => Entity {
  return (entity) =>
    entity.type === "line" || isTilted(entity)
      ? entityFromOcs(entity, normal)
      : withNormal(entity, normal)
}

/**
 * FILLET's two objects where one is an ARC or a CIRCLE, and the picks there:
 * as they are in a plane read level, else in the OCS of the tilted plane
 * they share, where AutoCAD 2023's console rounds them as it does in plan
 * (acc/w7, w9, a1–a7 of 2026-10-14); `back` returns what is built there.
 * A pick is where the line of sight through it meets that plane. `null`
 * when they share no plane: `Two entities are non coplanar.`
 */
export interface RoundPlane {
  readonly first: RoundPartner
  readonly pick1: Vec2
  readonly second: RoundPartner
  readonly pick2: Vec2
  back(entity: Entity): Entity
}

export function roundPlane(
  first: RoundPartner,
  pick1: LinePick,
  second: RoundPartner,
  pick2: LinePick,
  view: CameraTransform
): RoundPlane | null {
  const plane = [first, second].find((entity) => !readsInPlan(entity))
  if (!plane || !sharesTiltedPlane(first, second)) {
    return coplanar(first, second)
      ? {
          first,
          pick1: pick1.world,
          second,
          pick2: pick2.world,
          back: (entity) => entity,
        }
      : null
  }
  const normal = entityNormal(plane)
  const axes = entityAxes(plane)
  const height = entityElevation(plane)
  const into = (object: RoundPartner) =>
    entityInOcs(object, normal) as RoundPartner
  const onPlane = (pick: LinePick) =>
    cursorInPlane(view, height, pick.screen, axes)
  return {
    first: into(first),
    pick1: onPlane(pick1),
    second: into(second),
    pick2: onPlane(pick2),
    back: backFromPlane(normal),
  }
}

/**
 * Two objects FILLET and CHAMFER join into one polyline: a line and a
 * polyline's segment, in either order, or segments of two polylines.
 */
export interface CornerJoin {
  /** The polyline the join is: the one picked first, or the line's. */
  readonly segment: SegmentPick
  readonly segmentPick: Vec2
  /** The segment's two ends, as the polyline runs. */
  readonly a: Vec2
  readonly b: Vec2
  /** The line, or the other polyline's segment, joined to it. */
  readonly other: CornerObject
  readonly otherPick: Vec2
  readonly otherA: Vec2
  readonly otherB: Vec2
  readonly otherFirst: boolean
}

/**
 * The two objects as a join, or `null` for two lines or two segments of one
 * polyline. AutoCAD 2023's console keeps the polyline picked first: its
 * handle, layer, colour and direction.
 */
export function cornerJoin(
  first: CornerObject,
  pick1: Vec2,
  second: CornerObject,
  pick2: Vec2
): CornerJoin | null {
  if (!isSegment(first) && !isSegment(second)) return null
  if (isSegment(first) && isSegment(second) && first.poly.id === second.poly.id)
    return null
  const otherFirst = !isSegment(first)
  const segment = (otherFirst ? second : first) as SegmentPick
  const other = otherFirst ? first : second
  const { a, b } = segmentEnds(segment)
  const ends = isSegment(other)
    ? segmentEnds(other)
    : { a: other.start, b: other.end }
  return {
    segment,
    segmentPick: otherFirst ? pick2 : pick1,
    a,
    b,
    other,
    otherPick: otherFirst ? pick1 : pick2,
    otherA: ends.a,
    otherB: ends.b,
    otherFirst,
  }
}

/**
 * Why two objects cannot be joined, in AutoCAD's words, or `null`: they must
 * lie in one plane read level — `Line and polyline are non coplanar.`, and
 * for two polylines `Two entities are non coplanar.`
 */
export function joinRefusal({ segment, other }: CornerJoin): MessageId | null {
  // WHY level only: a polyline in a tilted plane keeps its points in its own
  // OCS, which the picks are not given in; AutoCAD joins them there too (a gap).
  const otherEntity = cornerEntity(other)
  return readsInPlan(segment.poly) &&
    readsInPlan(otherEntity) &&
    coplanar(otherEntity, segment.poly)
    ? null
    : isSegment(other)
      ? "twoEntitiesNonCoplanar"
      : "lineAndPolylineNonCoplanar"
}

/**
 * A corner cut between the two objects of a join: where each is cut — the
 * same point at a sharp corner — and the bulge from the segment's cut to the
 * other's (0 for a bevel).
 */
export interface JoinCut {
  readonly corner: Vec2
  /** Unit rays from the corner toward the other's and the segment's kept side. */
  readonly otherSide: Vec2
  readonly segmentSide: Vec2
  readonly onOther: Vec2
  readonly onSegment: Vec2
  readonly bulge: number
  /**
   * The end each keeps, where the rays cannot tell it: an arc segment's, kept
   * round its circle from the corner (FILLET's).
   */
  readonly keeps?: { readonly segment: CurveEnd; readonly other: CurveEnd }
}

/**
 * Whether each cut falls short of the far end of its line or straight
 * segment: CHAMFER's `Chamfer distance is too large` otherwise, even with
 * more of the polyline beyond (FILLET refuses no radius for its size).
 */
export function cutFits(join: CornerJoin, cut: JoinCut): boolean {
  const fits = (a: Vec2, b: Vec2, side: Vec2, at: Vec2) => {
    const along = (point: Vec2) => V.dot(V.sub(point, cut.corner), side)
    return along(at) < Math.max(along(a), along(b)) - 1e-9
  }
  return (
    fits(join.a, join.b, cut.segmentSide, cut.onSegment) &&
    fits(join.otherA, join.otherB, cut.otherSide, cut.onOther)
  )
}

/**
 * The polyline FILLET and CHAMFER make of a join, as AutoCAD 2023's console
 * makes it: each object keeps its run on its kept side up to the cut — a
 * line its kept end, a polyline from its first vertex, or from the segment's
 * end to its last —, and the polyline picked first (or the line's) keeps its
 * direction, the other's run reversed where it must be. What lies past either
 * segment on the other side is dropped, and a closed polyline opens there.
 * Nothing is refused for its size: a cut past a kept end doubles back to it
 * (a line at radius 60: `40,80` then `50,80`). An arc segment keeps what is
 * left of it on its circle, from the cut.
 */
export function joinAtCut(join: CornerJoin, cut: JoinCut): PolylineEntity {
  const { poly } = join.segment
  const own = keptRun(
    join.segment,
    cut.segmentSide,
    cut.corner,
    cut.onSegment,
    cut.keeps?.segment
  )
  const joined = keptRun(
    join.other,
    cut.otherSide,
    cut.corner,
    cut.onOther,
    cut.keeps?.other
  )
  const sharp = V.equals(cut.onSegment, cut.onOther)
  const points: Vec2[] = []
  const pointBulges: number[] = []
  const add = (point: Vec2, next: number) => {
    if (points.length > 0 && V.equals(points[points.length - 1], point)) {
      pointBulges[pointBulges.length - 1] = next
      return
    }
    points.push(point)
    pointBulges.push(next)
  }
  const [lead, leadCut, tail, tailCut, bulge] = own.forward
    ? [joined, cut.onOther, own, cut.onSegment, -cut.bulge]
    : [own, cut.onSegment, joined, cut.onOther, cut.bulge]
  for (let k = lead.points.length - 1; k >= 0; k--) {
    add(lead.points[k], k > 0 ? -lead.bulges[k - 1] : -lead.cutBulge)
  }
  add(leadCut, sharp ? tail.cutBulge : bulge)
  if (!sharp) add(tailCut, tail.cutBulge)
  tail.points.forEach((point, k) => add(point, tail.bulges[k] ?? 0))
  pointBulges[pointBulges.length - 1] = 0
  return carryOverrides(
    poly,
    createPolyline(points, false, poly.layerId, pointBulges, poly.id)
  )
}

/**
 * What an object keeps past its cut, going outward: from the cut to
 * `points[0]` by `cutBulge` (straight but on an arc segment), then from
 * `points[k]` to `points[k + 1]` by `bulges[k]`. `forward` when that is
 * the polyline's own direction.
 */
interface Run {
  readonly points: readonly Vec2[]
  readonly bulges: readonly number[]
  readonly cutBulge: number
  readonly forward: boolean
}

function keptRun(
  object: CornerObject,
  side: Vec2,
  corner: Vec2,
  cut: Vec2,
  keep?: CurveEnd
): Run {
  const along = (point: Vec2) => V.dot(V.sub(point, corner), side)
  if (!isSegment(object)) {
    const end = keep
      ? keep === "b"
        ? object.end
        : object.start
      : along(object.end) >= along(object.start)
        ? object.end
        : object.start
    return { points: [end], bulges: [], cutBulge: 0, forward: true }
  }
  const { poly, index } = object
  const vertices = poly.closed
    ? [...poly.vertices, poly.vertices[0]]
    : poly.vertices
  const bulge = (k: number) => poly.bulges?.[k] ?? 0
  const segment = curveOf(object)
  const forward = keep
    ? keep === "b"
    : along(vertices[index + 1]) >= along(vertices[index])
  if (forward) {
    const points = vertices.slice(index + 1)
    return {
      points,
      bulges: points.slice(1).map((_, k) => bulge(index + 1 + k)),
      cutBulge:
        segment.kind === "arc" ? bulgeBetween(segment, cut, segment.b) : 0,
      forward: true,
    }
  }
  const points = vertices.slice(0, index + 1).reverse()
  return {
    points,
    bulges: points.slice(1).map((_, k) => -bulge(index - 1 - k)),
    cutBulge:
      segment.kind === "arc" ? -bulgeBetween(segment, segment.a, cut) : 0,
    forward: false,
  }
}

function segmentEnds({ poly, index }: SegmentPick): { a: Vec2; b: Vec2 } {
  const { a, b } = polylineSegmentGeometries(poly)[index]
  return { a, b }
}

/** The segment of `hit`, a polyline, a pick at `pick` takes. */
function segmentAt(
  ctx: ToolContext,
  hit: Entity,
  pick: LinePick
): number | null {
  if (hit.type !== "polyline") return null
  // A polyline in a tilted plane is picked as it is drawn.
  return readsInPlan(hit)
    ? nearestSegment(hit, pick.world)
    : (nearestOnScreen(hit, pick.screen, ctx.viewport)?.index ?? null)
}

/** The points a segment is drawn through: an arc's sampled along it. */
function segmentPoints(segment: Curve): Vec2[] {
  if (segment.kind === "line") return [segment.a, segment.b]
  const start = Math.atan2(
    segment.a.y - segment.center.y,
    segment.a.x - segment.center.x
  )
  const included = 4 * Math.atan(segment.bulge)
  return Array.from({ length: ARC_SAMPLES + 1 }, (_, k) =>
    polarPoint(
      segment.center,
      segment.radius,
      start + (included * k) / ARC_SAMPLES
    )
  )
}

/**
 * The segment of a polyline in a tilted plane drawn nearest `screen`, and
 * its point drawn there, in the polyline's own coordinates.
 */
function nearestOnScreen(
  poly: PolylineEntity,
  screen: Vec2,
  view: CameraTransform
): { readonly index: number; readonly point: Vec2 } | null {
  const drawn = (point: Vec2) =>
    view.worldToScreen(entityPointToWorld(poly, point))
  let best: { index: number; point: Vec2 } | null = null
  let bestDistance = Infinity
  const consider = (index: number, point: Vec2) => {
    const distance = V.distance(drawn(point), screen)
    if (distance < bestDistance) {
      bestDistance = distance
      best = { index, point }
    }
  }
  polylineSegmentGeometries(poly).forEach((segment, index) => {
    if (segment.kind === "line") {
      const { t } = closestPointOnInfiniteLine(
        drawn(segment.a),
        drawn(segment.b),
        screen
      )
      const along = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0
      consider(index, V.lerp(segment.a, segment.b, along))
      return
    }
    for (const point of segmentPoints(segment)) consider(index, point)
  })
  return best
}

/** How finely an arc segment drawn in a tilted plane is searched for a pick. */
const ARC_SAMPLES = 64

/** The segment of `poly` nearest `world`. */
function nearestSegment(poly: PolylineEntity, world: Vec2): number | null {
  let nearest: number | null = null
  let best = Infinity
  polylineSegmentGeometries(poly).forEach((segment, index) => {
    const distance =
      segment.kind === "line"
        ? closestPointOnSegment(segment.a, segment.b, world).distance
        : closestPointOnArc(
            segment.center,
            segment.radius,
            segment.startAngle,
            segment.endAngle,
            world
          ).distance
    if (distance < best) {
      best = distance
      nearest = index
    }
  })
  return nearest
}
