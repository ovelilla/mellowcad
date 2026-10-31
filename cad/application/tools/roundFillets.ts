import { Vec2, V } from "../../geometry/Vec2"
import { normalizeAngle } from "../../geometry/primitives"
import {
  ArcEntity,
  CircleEntity,
  Entity,
  EntityId,
  LineEntity,
  createArc,
} from "../../domain/entities"
import type { LayerId } from "../../domain/layers"
import { WholeCurve, wholeCrossing, wholeFillet } from "./curveFillets"
import { cornerPiece } from "./cornerObjects"

/** An ARC or a CIRCLE, which FILLET takes as an object and CHAMFER refuses. */
export type RoundObject = ArcEntity | CircleEntity

/** A line, or an ARC or a CIRCLE, rounded against one of the latter. */
export type RoundPartner = LineEntity | RoundObject

/** What a fillet against an ARC or a CIRCLE replaces, and with what. */
export interface RoundFillet {
  readonly replaced: readonly EntityId[]
  readonly built: readonly Entity[]
}

/**
 * FILLET between a line, an arc or a circle and an arc or a circle, as AutoCAD
 * 2023's console makes it (acc/a*, b*, c*, p*, q*, r*): a circle is never
 * trimmed; a line and an arc are trimmed or extended to the fillet, each kept
 * on the side it runs on from it, tangent; the arc lies on the objects' layer
 * when they share one, else on `currentLayer`, and wears the second's
 * lineweight and thickness ({@link cornerPiece}). At radius 0 they meet where
 * they cross: a line kept on its picked side, an arc on its picked part —
 * extended at the end its pick is nearer when the crossing lies off it.
 * `noValidFillet` where nothing fits; `nothing` for two circles at radius 0,
 * which the console leaves as they are without a word.
 */
export function filletRound(
  first: RoundPartner,
  pick1: Vec2,
  second: RoundPartner,
  pick2: Vec2,
  radius: number,
  currentLayer: LayerId,
  arcId?: EntityId
): RoundFillet | "noValidFillet" | "nothing" {
  const whole1 = wholeOf(first)
  const whole2 = wholeOf(second)
  if (radius <= 0) {
    const corner = wholeCrossing(whole1, pick1, whole2, pick2)
    if (!corner) return "noValidFillet"
    const built = [
      keptAtCorner(first, corner, pick1),
      keptAtCorner(second, corner, pick2),
    ].filter((entity): entity is LineEntity | ArcEntity => entity !== null)
    return built.length > 0
      ? { replaced: built.map((entity) => entity.id), built }
      : "nothing"
  }
  const fillet = wholeFillet(whole1, pick1, whole2, pick2, radius)
  if (!fillet) return "noValidFillet"
  const { center } = fillet
  // The fillet runs from the first to the second the short way round.
  const ccw =
    V.cross(V.sub(fillet.first, center), V.sub(fillet.second, center)) >= 0
  const travel = (point: Vec2) => {
    const tangent = V.perpendicular(V.sub(point, center))
    return ccw ? tangent : V.scale(tangent, -1)
  }
  const kept = [
    keptFrom(first, fillet.first, V.scale(travel(fillet.first), -1)),
    keptFrom(second, fillet.second, travel(fillet.second)),
  ].filter((entity): entity is LineEntity | ArcEntity => entity !== null)
  const angle = (point: Vec2) =>
    normalizeAngle(Math.atan2(point.y - center.y, point.x - center.x))
  const [from, to] = ccw
    ? [fillet.first, fillet.second]
    : [fillet.second, fillet.first]
  const arc = cornerPiece(
    first,
    second,
    createArc(
      center,
      radius,
      angle(from),
      angle(to),
      first.layerId === second.layerId ? first.layerId : currentLayer,
      arcId
    )
  )
  return {
    replaced: kept.map((entity) => entity.id),
    built: [...kept, arc],
  }
}

function wholeOf(object: RoundPartner): WholeCurve {
  return object.type === "line"
    ? { kind: "line", a: object.start, b: object.end }
    : { kind: "circle", center: object.center, radius: object.radius }
}

/**
 * The object kept from `point` the way `away` points: a line keeps the end
 * that lies that way, an arc the part that turns that way; a circle stays.
 */
export function keptFrom(
  object: RoundPartner,
  point: Vec2,
  away: Vec2
): LineEntity | ArcEntity | null {
  if (object.type === "circle") return null
  if (object.type === "line") {
    const along = (end: Vec2) => V.dot(V.sub(end, point), away)
    return along(object.end) >= along(object.start)
      ? { ...object, start: point }
      : { ...object, end: point }
  }
  const at = angleOn(object, point)
  return V.dot(away, V.perpendicular(V.sub(point, object.center))) > 0
    ? { ...object, startAngle: at }
    : { ...object, endAngle: at }
}

/**
 * The object met at `corner` with no fillet: a line kept on its picked side;
 * an arc the part of it its pick is on, or, when the corner lies off it,
 * reaching it from the end the pick is nearer (the start on a tie: acc/a8,
 * p2–p4).
 */
export function keptAtCorner(
  object: RoundPartner,
  corner: Vec2,
  pick: Vec2
): LineEntity | ArcEntity | null {
  if (object.type !== "arc")
    return keptFrom(object, corner, V.sub(pick, corner))
  const sweep = normalizeAngle(object.endAngle - object.startAngle)
  const offset = (point: Vec2) =>
    normalizeAngle(angleOn(object, point) - object.startAngle)
  const atPick = offset(pick)
  const atCorner = offset(corner)
  const keepsStart = atCorner <= sweep ? atPick < atCorner : atPick > sweep / 2
  const at = angleOn(object, corner)
  return keepsStart
    ? { ...object, endAngle: at }
    : { ...object, startAngle: at }
}

function angleOn(arc: ArcEntity, point: Vec2): number {
  return normalizeAngle(
    Math.atan2(point.y - arc.center.y, point.x - arc.center.x)
  )
}
