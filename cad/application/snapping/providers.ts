import { V, Vec2 } from "../../geometry/Vec2"
import {
  Vec3,
  dot3,
  length3,
  planar,
  sub3,
  withZ,
  withZOf,
  zOf,
} from "../../geometry/Vec3"
import { axesToWorld } from "../../geometry/ocs"
import {
  BSplineCurve,
  bsplinePoint,
  bsplinesMeeting,
} from "../../geometry/nurbs"
import { CameraTransform } from "../../scene/types"
import { Ucs, ucsZAxis } from "../../domain/ucs"
import {
  angleWithinSweep,
  circleCircleIntersection,
  closestPointOnArc,
  closestPointOnCircle,
  closestPointOnInfiniteLine,
  closestPointOnSegment,
  infiniteLineIntersection,
  normalizeAngle,
  polarPoint,
  segmentArcIntersection,
  segmentCircleIntersection,
  segmentSegmentIntersection,
  signChanges,
  tangentPointsFromPoint,
} from "../../geometry/primitives"
import {
  arcEndPoint,
  arcMidpoint,
  arcStartPoint,
  closestOnEntity,
  dimensionGeometry,
  ellipseEndPoint,
  ellipseMidpoint,
  ellipseQuadrantPoints,
  ellipseStartPoint,
  entityAxes,
  entityPointToWorld,
  entityZAt,
  insertAttributePoints,
  isFullEllipse,
  lineEndZ,
  lineStartZ,
  planeAxes,
  polylineSegmentGeometries,
  sameNormal,
  splineEndPoint,
  splineChords,
  splineMidpoint,
  splineStartPoint,
  worldToEntity,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
  PolylineSegmentGeometry,
} from "../../domain/entities"
import {
  ConstructionGeometry,
  SnapCandidate,
  SnapContext,
  SnapProvider,
  SnapType,
} from "./types"

/**
 * Built-in snap providers. Each is a small, self-contained object so the set of
 * active snaps can be composed freely by the SnapEngine.
 *
 * **Hatches are deliberately absent from every provider.** OSOPTIONS ships at
 * 7, whose first bit reads "Object snaps ignore hatch objects" — and the
 * boundary a hatch was traced from is still there to snap to.
 */

/**
 * A point on `entity`, given as it stores its points, in the WCS at the
 * object's height there. A line's point read along it in space carries its
 * own Z: a vertical line is one point in plan, where its height is ambiguous.
 */
function on(entity: Entity, point: Vec2): Vec3 {
  if (entity.type === "line" && "z" in point) return withZ(point, zOf(point))
  return entityPointToWorld(entity, point)
}

/** A line's ends in space. */
function lineEnds(line: LineEntity): [Vec3, Vec3] {
  return [withZ(line.start, lineStartZ(line)), withZ(line.end, lineEndZ(line))]
}

const VERTICAL_EPSILON = 1e-9

/**
 * The point of `line` nearest `cursor`, in space. A cursor read along the
 * line's image on the screen (`SnapContext.cursorOn`, off the plan) has a Z
 * and is measured in space, so a vertical line gives the point under it
 * (interaction3d/i01); a plan cursor is measured in plan.
 */
export function nearestOnLine(line: LineEntity, cursor: Vec2): Vec3 {
  const [a, b] = lineEnds(line)
  const along = sub3(b, a)
  const lengthSq = "z" in cursor ? dot3(along, along) : V.lengthSq(along)
  if (!(lengthSq > 0)) return a
  const offset = sub3(withZ(cursor, zOf(cursor)), a)
  const t =
    ("z" in cursor ? dot3(offset, along) : V.dot(offset, along)) / lengthSq
  return lerp3(a, b, Math.max(0, Math.min(1, t)))
}

/**
 * The anchor in the plan of `entity`'s plane: projected along the plane's
 * normal, so the perpendicular or tangent found there is the one in space.
 */
function anchorIn(entity: Entity, anchor: Vec2): Vec2 {
  return planeAxes(entity) ? planar(worldToEntity(entity, anchor)) : anchor
}

/**
 * A notable point of `entity` (given as it stores its points), with the
 * object's point nearest the cursor as its `touch`: the engine decides when
 * passing over the object is enough.
 */
function notable(
  type: SnapType,
  entity: Entity,
  point: Vec2,
  touch: SnapContext["touch"]
): SnapCandidate {
  const near = touch(entity)
  return {
    type,
    point: on(entity, point),
    sourceIds: [entity.id],
    ...(near ? { touch: near } : {}),
  }
}

const QUADRANT_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]

/** Endpoint is the primary snap (highest priority). */
export const endpointProvider: SnapProvider = {
  type: SnapType.Endpoint,
  collect({ document, entities, touch }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type === "line") {
        for (const end of lineEnds(entity)) {
          candidates.push(notable(SnapType.Endpoint, entity, end, touch))
        }
      } else if (entity.type === "arc") {
        candidates.push(
          notable(SnapType.Endpoint, entity, arcStartPoint(entity), touch)
        )
        candidates.push(
          notable(SnapType.Endpoint, entity, arcEndPoint(entity), touch)
        )
      } else if (entity.type === "ellipse") {
        // Only an elliptical arc has ends; a whole ellipse closes on itself.
        if (isFullEllipse(entity)) continue
        candidates.push(
          notable(SnapType.Endpoint, entity, ellipseStartPoint(entity), touch)
        )
        candidates.push(
          notable(SnapType.Endpoint, entity, ellipseEndPoint(entity), touch)
        )
      } else if (entity.type === "spline") {
        // A closed spline's start is where it closes, and AutoCAD snaps there.
        candidates.push(
          notable(SnapType.Endpoint, entity, splineStartPoint(entity), touch)
        )
        if (!entity.closed) {
          candidates.push(
            notable(SnapType.Endpoint, entity, splineEndPoint(entity), touch)
          )
        }
      } else if (entity.type === "polyline") {
        for (const vertex of entity.vertices) {
          candidates.push(notable(SnapType.Endpoint, entity, vertex, touch))
        }
      } else if (entity.type === "dimension") {
        // A dimension has no geometry of its own to snap along, but its
        // definition points and the ends of its dimension line are the points
        // you chain the next dimension off.
        const g = dimensionGeometry(entity)
        for (const point of [
          entity.first,
          entity.second,
          ...(entity.vertex ? [entity.vertex] : []),
          g.lineStart,
          g.lineEnd,
        ]) {
          candidates.push(notable(SnapType.Endpoint, entity, point, touch))
        }
      }
    }
    return candidates
  },
}

export const midpointProvider: SnapProvider = {
  type: SnapType.Midpoint,
  collect({ document, entities, touch }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type === "line") {
        const [a, b] = lineEnds(entity)
        candidates.push(
          notable(SnapType.Midpoint, entity, lerp3(a, b, 0.5), touch)
        )
      } else if (entity.type === "arc") {
        candidates.push(
          notable(SnapType.Midpoint, entity, arcMidpoint(entity), touch)
        )
      } else if (entity.type === "ellipse" && !isFullEllipse(entity)) {
        // Halfway along its length (ellipse/p303); a whole one has none (p304).
        candidates.push(
          notable(SnapType.Midpoint, entity, ellipseMidpoint(entity), touch)
        )
      } else if (entity.type === "spline") {
        // Halfway along from its start, a closed one's too (spline/p311).
        candidates.push(
          notable(SnapType.Midpoint, entity, splineMidpoint(entity), touch)
        )
      } else if (entity.type === "polyline") {
        for (const seg of polylineSegmentGeometries(entity)) {
          const point =
            seg.kind === "line"
              ? V.midpoint(seg.a, seg.b)
              : polarPoint(
                  seg.center,
                  seg.radius,
                  seg.startAngle + arcSweep(seg.startAngle, seg.endAngle) / 2
                )
          candidates.push(notable(SnapType.Midpoint, entity, point, touch))
        }
      }
    }
    return candidates
  },
}

export const centerProvider: SnapProvider = {
  type: SnapType.Center,
  collect({ document, entities, touch }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (
        entity.type === "circle" ||
        entity.type === "arc" ||
        entity.type === "ellipse"
      ) {
        candidates.push(notable(SnapType.Center, entity, entity.center, touch))
      } else if (entity.type === "polyline") {
        // An arc segment is an arc: CENter "snaps to the center of an arc".
        for (const seg of polylineSegmentGeometries(entity)) {
          if (seg.kind !== "arc") continue
          candidates.push(notable(SnapType.Center, entity, seg.center, touch))
        }
      }
    }
    return candidates
  },
}

/**
 * Snaps to the point a text object, an attribute definition or a block
 * reference hangs off — AutoCAD's Insertion osnap. A reference offers its own
 * insertion point and those of the attributes it shows; the rest of what it
 * draws is snapped to by every other provider.
 */
export const insertionProvider: SnapProvider = {
  type: SnapType.Insertion,
  collect({ document, touch }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    const display = document.getSettings().attributeDisplay
    for (const entity of document.getEntities()) {
      if (!document.isEntityVisible(entity)) continue
      if (
        entity.type === "text" ||
        entity.type === "mtext" ||
        entity.type === "attdef" ||
        entity.type === "insert"
      ) {
        candidates.push(
          notable(SnapType.Insertion, entity, entity.position, touch)
        )
      }
      if (entity.type === "insert") {
        const block = document.getBlock(entity.blockId)
        for (const point of insertAttributePoints(entity, block, display)) {
          candidates.push({
            type: SnapType.Insertion,
            point,
            sourceIds: [entity.id],
          })
        }
      }
    }
    return candidates
  },
}

/**
 * Where a circle's or an arc's quadrants start in its own plan: along the
 * UCS's X when it lies parallel to the UCS's XY plane (circle/p212, p217;
 * arc/p201, p211); `null`, no quadrant at all, when it is oblique to it —
 * "Oblique, non-uniformly scaled objects were ignored." (interaction3d/i09,
 * a circle; an arc by the same rule).
 */
function quadrantTurn(circle: Entity, ucs: Ucs): number | null {
  const axes = entityAxes(circle)
  if (Math.abs(Math.abs(dot3(axes.z, ucsZAxis(ucs))) - 1) > 1e-9) return null
  return Math.atan2(dot3(ucs.xAxis, axes.y), dot3(ucs.xAxis, axes.x))
}

/** Snaps to the 0°/90°/180°/270° cardinal points of a circle, and to the
 * endpoints of an ellipse's axes. */
export const quadrantProvider: SnapProvider = {
  type: SnapType.Quadrant,
  collect({ document, entities, touch }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type === "circle") {
        const { center: c, radius: r } = entity
        const turn = quadrantTurn(entity, document.getSettings().ucs)
        if (turn === null) continue
        const points =
          turn === 0
            ? [
                { x: c.x + r, y: c.y },
                { x: c.x, y: c.y + r },
                { x: c.x - r, y: c.y },
                { x: c.x, y: c.y - r },
              ]
            : QUADRANT_ANGLES.map((angle) => polarPoint(c, r, turn + angle))
        for (const point of points) {
          candidates.push(notable(SnapType.Quadrant, entity, point, touch))
        }
      } else if (entity.type === "arc") {
        // Only the quadrants the sweep actually passes through (arc/p201, p203).
        const turn = quadrantTurn(entity, document.getSettings().ucs)
        if (turn === null) continue
        for (const quadrant of QUADRANT_ANGLES) {
          const angle = turn + quadrant
          if (!angleWithinSweep(entity.startAngle, entity.endAngle, angle)) {
            continue
          }
          candidates.push(
            notable(
              SnapType.Quadrant,
              entity,
              polarPoint(entity.center, entity.radius, angle),
              touch
            )
          )
        }
      } else if (entity.type === "ellipse") {
        // WHY not `quadrantTurn`: an ellipse's quadrants are its own axis
        // ends whatever the UCS (ellipse/p301), unlike a circle's or an
        // arc's; an arc's only those on its sweep (p302).
        for (const point of ellipseQuadrantPoints(entity)) {
          candidates.push(notable(SnapType.Quadrant, entity, point, touch))
        }
      } else if (entity.type === "polyline") {
        for (const seg of polylineSegmentGeometries(entity)) {
          if (seg.kind !== "arc") continue
          for (const angle of QUADRANT_ANGLES) {
            if (!angleWithinSweep(seg.startAngle, seg.endAngle, angle)) continue
            const point = polarPoint(seg.center, seg.radius, angle)
            candidates.push(notable(SnapType.Quadrant, entity, point, touch))
          }
        }
      }
    }
    return candidates
  },
}

/**
 * Snaps to the point on an object that is *perpendicular* from the operation's
 * anchor (the line being drawn from, or a grip's fixed end) — AutoCAD's
 * Perpendicular osnap, offered from anywhere over the object. For a line it is
 * the foot on the infinite line (so it engages past the segment's ends, as
 * AutoCAD's does); for a circle or an arc the perpendicular runs through the
 * centre, giving the two radial points (an arc's on its sweep); a polyline
 * answers with the segment under the cursor, as a line or an arc. Offered
 * only while an anchor exists.
 */
export const perpendicularProvider: SnapProvider = {
  type: SnapType.Perpendicular,
  collect({
    document,
    entities,
    anchor,
    cursorOn,
    touch,
  }: SnapContext): SnapCandidate[] {
    if (!anchor) return []
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type === "line") {
        // The foot in space: from a point at another height to a sloped or
        // vertical line, AutoCAD's PER is perpendicular in 3D, in plan and
        // in an isometric view alike (interaction3d/i04, i08, i14).
        const near = touch(entity)
        const [a, b] = lineEnds(entity)
        const along = sub3(b, a)
        const lengthSq = dot3(along, along)
        if (!near || !(lengthSq > 0)) continue
        const t = dot3(sub3(withZ(anchor, zOf(anchor)), a), along) / lengthSq
        candidates.push({
          type: SnapType.Perpendicular,
          point: lerp3(a, b, t),
          touch: near,
          sourceIds: [entity.id],
        })
        continue
      }
      const shape =
        entity.type === "circle" || entity.type === "arc"
          ? { center: entity.center, a: null, b: null, radius: entity.radius }
          : entity.type === "polyline"
            ? asShape(segmentUnder(entity, cursorOn(entity)))
            : null
      if (!shape) continue
      const near = touch(entity)
      if (!near) continue
      const from = anchorIn(entity, anchor)
      const feet: Vec2[] = []
      if (shape.center === null) {
        feet.push(closestPointOnInfiniteLine(shape.a, shape.b, from).point)
      } else {
        const radial = V.sub(from, shape.center)
        const len = V.length(radial)
        if (len < 1e-9) continue
        const dir = V.scale(radial, 1 / len)
        for (const sign of [1, -1]) {
          const foot = V.add(shape.center, V.scale(dir, shape.radius * sign))
          // An arc's feet off its sweep are no perpendicular (arc/p208, p209).
          // A polyline's arc segment keeps both: PLINE's object, unprobed.
          if (
            entity.type === "arc" &&
            !angleWithinSweep(
              entity.startAngle,
              entity.endAngle,
              Math.atan2(foot.y - shape.center.y, foot.x - shape.center.x)
            )
          ) {
            continue
          }
          feet.push(foot)
        }
      }
      for (const foot of feet) {
        candidates.push({
          type: SnapType.Perpendicular,
          point: on(entity, foot),
          touch: near,
          sourceIds: [entity.id],
        })
      }
    }
    return candidates
  },
}

type PerpendicularShape =
  | { center: null; a: Vec2; b: Vec2; radius: number }
  | { center: Vec2; a: null; b: null; radius: number }

function asShape(
  seg: PolylineSegmentGeometry | null
): PerpendicularShape | null {
  if (!seg) return null
  return seg.kind === "line"
    ? { center: null, a: seg.a, b: seg.b, radius: 0 }
    : { center: seg.center, a: null, b: null, radius: seg.radius }
}

/**
 * Snaps to a point on a curve where a line from the anchor would be *tangent*
 * — AutoCAD's Tangent osnap, offered from anywhere over a circle, an arc or a
 * polyline's arc segment, at a point of the arc itself. Undefined for an
 * anchor inside the curve, so it offers nothing then.
 */
export const tangentProvider: SnapProvider = {
  type: SnapType.Tangent,
  collect({
    document,
    entities,
    anchor,
    cursorOn,
    touch,
  }: SnapContext): SnapCandidate[] {
    if (!anchor) return []
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      const segment =
        entity.type === "polyline"
          ? segmentUnder(entity, cursorOn(entity))
          : null
      const arc =
        entity.type === "circle"
          ? { center: entity.center, radius: entity.radius, sweep: null }
          : entity.type === "arc"
            ? { center: entity.center, radius: entity.radius, sweep: entity }
            : segment?.kind === "arc"
              ? {
                  center: segment.center,
                  radius: segment.radius,
                  sweep: segment,
                }
              : null
      if (!arc) continue
      const near = touch(entity)
      if (!near) continue
      for (const point of tangentPointsFromPoint(
        anchorIn(entity, anchor),
        arc.center,
        arc.radius
      )) {
        const angle = Math.atan2(point.y - arc.center.y, point.x - arc.center.x)
        if (
          arc.sweep &&
          !angleWithinSweep(arc.sweep.startAngle, arc.sweep.endAngle, angle)
        ) {
          continue
        }
        candidates.push({
          type: SnapType.Tangent,
          point: on(entity, point),
          touch: near,
          sourceIds: [entity.id],
        })
      }
    }
    return candidates
  },
}

/** The segment of a polyline nearest `cursor`, in its own plane. */
function segmentUnder(
  entity: PolylineEntity,
  cursor: Vec2
): PolylineSegmentGeometry | null {
  let best: PolylineSegmentGeometry | null = null
  let bestDistance = Infinity
  for (const seg of polylineSegmentGeometries(entity)) {
    const d =
      seg.kind === "line"
        ? closestPointOnSegment(seg.a, seg.b, cursor).distance
        : closestPointOnArc(
            seg.center,
            seg.radius,
            seg.startAngle,
            seg.endAngle,
            cursor
          ).distance
    if (d < bestDistance) {
      bestDistance = d
      best = seg
    }
  }
  return best
}

/**
 * Snaps to a point on the prolongation of an object past an end the cursor has
 * passed over — AutoCAD's Extension, which "causes a temporary extension line
 * or arc to be displayed when you pass the cursor over the endpoint of
 * objects". Only acquired ends are prolonged (the + marker OTRACK shows), so
 * merely drawing near a line's continuation does nothing. A line, an open
 * polyline's end segment and an arc prolong; the point slides along the
 * extension as the cursor moves near it.
 */
export const extensionProvider: SnapProvider = {
  type: SnapType.Extension,
  collect({
    document,
    entities,
    cursorOn,
    acquired,
  }: SnapContext): SnapCandidate[] {
    const ends = acquired.filter((a) => a.sourceType === SnapType.Endpoint)
    if (ends.length === 0) return []
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      for (const end of ends) {
        if (!end.sourceIds.includes(entity.id)) continue
        const candidate = extensionFrom(entity, end.origin, cursorOn(entity))
        if (candidate) candidates.push(candidate)
      }
    }
    return candidates
  },
}

/** A straight prolongation from an acquired end: Extension's path as a line. */
export interface ExtensionLine {
  readonly origin: Vec3
  /** Unit direction, outwards from the end. */
  readonly dir: Vec3
  readonly sourceIds: readonly EntityId[]
}

/**
 * The straight prolongations of the acquired ends, for the alignment paths
 * they cross: an Extension meets another extension or an OTRACK guide at one
 * point, the way two tracking paths do. An arc's extension is no line.
 */
export function extensionLines(
  context: Pick<SnapContext, "document" | "entities" | "acquired">
): ExtensionLine[] {
  const ends = context.acquired.filter(
    (a) => a.sourceType === SnapType.Endpoint
  )
  if (ends.length === 0) return []
  const out: ExtensionLine[] = []
  for (const entity of context.entities) {
    if (!context.document.isEntityVisible(entity)) continue
    for (const end of ends) {
      if (!end.sourceIds.includes(entity.id)) continue
      for (const piece of prolongations(entity)) {
        if (piece.kind !== "line") continue
        const tip = on(entity, piece.to)
        if (length3(sub3(tip, end.origin)) > ACQUIRED_EPSILON) continue
        const along = sub3(tip, on(entity, piece.from))
        const length = length3(along)
        if (length < 1e-9) continue
        out.push({
          origin: end.origin,
          dir: {
            x: along.x / length,
            y: along.y / length,
            z: along.z / length,
          },
          sourceIds: [entity.id],
        })
      }
    }
  }
  return out
}

/** The ends an object can be prolonged from: a straight piece or an arc, each going outwards. */
function prolongations(
  entity: Entity
): (
  | { kind: "line"; from: Vec2; to: Vec2 }
  | { kind: "arc"; center: Vec2; radius: number; at: number; ccw: boolean }
)[] {
  if (entity.type === "line") {
    return [
      { kind: "line", from: entity.start, to: entity.end },
      { kind: "line", from: entity.end, to: entity.start },
    ]
  }
  if (entity.type === "arc") {
    const { center, radius } = entity
    return [
      { kind: "arc", center, radius, at: entity.endAngle, ccw: true },
      { kind: "arc", center, radius, at: entity.startAngle, ccw: false },
    ]
  }
  if (entity.type === "polyline" && !entity.closed) {
    const segments = polylineSegmentGeometries(entity)
    const first = segments[0]
    const last = segments[segments.length - 1]
    const out: { kind: "line"; from: Vec2; to: Vec2 }[] = []
    if (first?.kind === "line") {
      out.push({ kind: "line", from: first.b, to: first.a })
    }
    if (last?.kind === "line") {
      out.push({ kind: "line", from: last.a, to: last.b })
    }
    return out
  }
  return []
}

function extensionFrom(
  entity: Entity,
  origin: Vec3,
  cursor: Vec2
): SnapCandidate | null {
  for (const end of prolongations(entity)) {
    if (end.kind === "line") {
      if (length3(sub3(on(entity, end.to), origin)) > ACQUIRED_EPSILON) continue
      const proj = closestPointOnInfiniteLine(end.from, end.to, cursor)
      if (!(proj.t > 1)) continue
      return {
        type: SnapType.Extension,
        point: on(entity, proj.point),
        sourceIds: [entity.id],
        path: [origin, on(entity, proj.point)],
      }
    }
    const tip = polarPoint(end.center, end.radius, end.at)
    if (length3(sub3(on(entity, tip), origin)) > ACQUIRED_EPSILON) continue
    if (entity.type !== "arc") continue
    const gap = Math.PI * 2 - arcSweep(entity.startAngle, entity.endAngle)
    const angle = Math.atan2(cursor.y - end.center.y, cursor.x - end.center.x)
    const along = normalizeAngle(end.ccw ? angle - end.at : end.at - angle)
    if (along <= 0 || along >= gap) continue
    const path: Vec3[] = []
    const steps = Math.max(2, Math.ceil(along / (Math.PI / 32)))
    for (let i = 0; i <= steps; i++) {
      const a = end.at + ((end.ccw ? 1 : -1) * along * i) / steps
      path.push(on(entity, polarPoint(end.center, end.radius, a)))
    }
    return {
      type: SnapType.Extension,
      point: path[path.length - 1],
      sourceIds: [entity.id],
      path,
    }
  }
  return null
}

/** World distance under which an acquired point is taken to be an object's end. */
const ACQUIRED_EPSILON = 1e-6

/**
 * Keeps the segment being drawn *parallel* to an existing line — AutoCAD's
 * Parallel. Projects the cursor onto the ray through the anchor parallel to
 * each line and offers that projection, engaging by proximity to the ray — so
 * the point locks onto the parallel direction as the rubber-band nears it.
 * Needs the anchor, so it offers nothing without one.
 */
export const parallelProvider: SnapProvider = {
  type: SnapType.Parallel,
  collect({
    document,
    entities,
    anchor,
    worldCursor,
    parallelSourceIds,
  }: SnapContext): SnapCandidate[] {
    if (!anchor || parallelSourceIds.size === 0) return []
    const offset = V.sub(worldCursor, anchor)
    if (V.length(offset) < 1e-6) return []
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type !== "line") continue
      // Only lines the user has acquired (hovered) are offered as parallels.
      if (!parallelSourceIds.has(entity.id)) continue
      const along = V.sub(entity.end, entity.start)
      const len = V.length(along)
      if (len < 1e-9) continue
      const dir = V.scale(along, 1 / len)
      // Project the cursor onto the anchor→dir ray; the projection is the point
      // that keeps the new segment parallel to this line.
      const point = V.add(anchor, V.scale(dir, V.dot(offset, dir)))
      candidates.push({
        type: SnapType.Parallel,
        // The point lies on the new segment, not on the line it parallels.
        point: withZOf(point, anchor),
        sourceIds: [entity.id],
        direction: dir,
      })
    }
    return candidates
  },
}

/**
 * Snaps to the closest point *anywhere* on an entity's outline — AutoCAD's
 * Nearest osnap. Unlike the notable-point snaps it engages whenever the cursor
 * is within tolerance of the geometry itself, so it is the greediest snap and
 * runs at lowest priority (and is off by default).
 */
export const nearestProvider: SnapProvider = {
  type: SnapType.Nearest,
  collect({
    document,
    entities,
    cursorOn,
    isNear,
  }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      const cursor = cursorOn(entity)
      if (entity.type === "line") {
        const point = nearestOnLine(entity, cursor)
        if (isNear(point)) {
          candidates.push({
            type: SnapType.Nearest,
            point,
            sourceIds: [entity.id],
          })
        }
        continue
      }
      const closest =
        entity.type === "circle"
          ? closestPointOnCircle(entity.center, entity.radius, cursor)
          : entity.type === "arc"
            ? closestPointOnArc(
                entity.center,
                entity.radius,
                entity.startAngle,
                entity.endAngle,
                cursor
              )
            : entity.type === "polyline" ||
                entity.type === "spline" ||
                entity.type === "ellipse"
              ? closestOnEntity(entity, cursor)
              : null
      if (closest && isNear(on(entity, closest.point))) {
        candidates.push({
          type: SnapType.Nearest,
          point: on(entity, closest.point),
          sourceIds: [entity.id],
        })
      }
    }
    return candidates
  },
}

/**
 * Snaps to intersections between entities. Only computes intersections for
 * pairs whose bounding proximity is worth checking near the cursor, keeping the
 * common case cheap.
 *
 * The rubber-band segment the active tool is drawing is folded into the same
 * shape list, so intersections engage on the line *being drawn* against the
 * committed geometry too — exactly like AutoCAD.
 */
export const intersectionProvider: SnapProvider = {
  type: SnapType.Intersection,
  collect(context: SnapContext): SnapCandidate[] {
    const { document, entities, cursorOn, isNear, construction } = context
    // WHY filtered before pairing: crossing every pair of the drawing on
    // each pointer move is quadratic — 5 ms a move at 300 lines. A point it
    // keeps lies on both shapes within `INTERSECTION_REACH` of the cursor, so
    // a shape that never comes that close cannot hold one.
    const shapes = collectShapes(document, entities, construction, {
      cursorOn,
      isNear,
    }).filter((shape) => mayReachCursor(shape, context))
    const candidates: SnapCandidate[] = []

    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        // Neighbouring chords of one spline meet at every tessellation vertex.
        const a = shapes[i]
        const b = shapes[j]
        if (
          a.kind === "segment" &&
          b.kind === "segment" &&
          ((a.curveId !== undefined && a.curveId === b.curveId) ||
            (a.edgeOf !== undefined && a.edgeOf === b.edgeOf))
        ) {
          continue
        }
        // Two alignment paths crossing is tracking's point, not an object's.
        if (a.fromConstruction && b.fromConstruction) continue
        if (!sameFrame(a, b)) continue
        const upright = verticalMeeting(a, b)
        if (upright !== undefined) {
          if (upright && isNear(upright, INTERSECTION_REACH)) {
            candidates.push({
              type: SnapType.Intersection,
              point: upright,
              sourceIds: [...a.sourceIds, ...b.sourceIds],
            })
          }
          continue
        }
        for (const crossing of intersectShapes(shapes[i], shapes[j])) {
          const point = onCurves(a, b, crossing)
          const at = meetingPoint(a, b, point)
          if (at === null) continue
          // Coarse pre-filter around the cursor; the engine judges exactly.
          if (!isNear(at, INTERSECTION_REACH)) continue
          candidates.push({
            type: SnapType.Intersection,
            point: at,
            sourceIds: [...shapes[i].sourceIds, ...shapes[j].sourceIds],
            transient: shapes[i].fromConstruction || shapes[j].fromConstruction,
          })
        }
      }
    }
    return candidates
  },
}

/**
 * Where a vertical line meets another object, which crossing the two in plan
 * cannot find, the line being a point there: that point on the other's
 * outline, at the other's height, when the line spans it (interaction3d/i06,
 * i14). `null` when they do not meet, `undefined` when neither is vertical.
 * Two vertical lines, a spline's chord or the rubber band are not crossed.
 */
function verticalMeeting(a: SnapShape, b: SnapShape): Vec3 | null | undefined {
  const upright = isUpright(a) ? a : isUpright(b) ? b : null
  if (upright === null || upright.kind !== "segment") return undefined
  const other = upright === a ? b : a
  if (other.fromConstruction || isUpright(other)) return null
  if (other.kind === "segment" && other.curveId !== undefined) return null
  const point = planar(upright.a)
  const off =
    other.kind === "segment"
      ? closestPointOnSegment(other.a, other.b, point).distance
      : other.kind === "arc" && !arcShapeContains(other, point)
        ? Infinity
        : Math.abs(V.distance(point, other.center) - other.radius)
  if (off > MEETING_EPSILON) return null
  const z = heightOn(other, point) ?? 0
  const low = Math.min(zOf(upright.a), zOf(upright.b))
  const high = Math.max(zOf(upright.a), zOf(upright.b))
  if (z < low - MEETING_EPSILON || z > high + MEETING_EPSILON) return null
  return withZ(point, z)
}

/** A line's segment along the UCS's Z: a point in plan. */
function isUpright(shape: SnapShape): boolean {
  return (
    shape.kind === "segment" &&
    shape.source?.type === "line" &&
    V.distance(shape.a, shape.b) < VERTICAL_EPSILON
  )
}

/** How far from the cursor, in release tolerances, Intersection looks. */
const INTERSECTION_REACH = 8

/**
 * Whether a shape may pass within {@link INTERSECTION_REACH} of the cursor.
 * Judged only in plan and for a shape in the world's XY — the rubber band, or
 * an object in no plane of its own — where `isNear` measures in that XY too;
 * anywhere else the screen distorts it, and the shape is kept. An arc is
 * judged by its whole circle, which is never farther.
 */
function mayReachCursor(
  shape: SnapShape,
  { view, worldCursor: cursor, isNear }: SnapContext
): boolean {
  if (!view.isPlan) return true
  if (shape.source !== null && planeAxes(shape.source) !== undefined) {
    return true
  }
  let closest: Vec2
  if (shape.kind === "segment") {
    closest = closestPointOnSegment(shape.a, shape.b, cursor).point
  } else {
    const radial = V.sub(cursor, shape.center)
    const length = V.length(radial)
    closest =
      length < 1e-9
        ? V.add(shape.center, { x: shape.radius, y: 0 })
        : V.add(shape.center, V.scale(radial, shape.radius / length))
  }
  return isNear(withZ(closest, 0), INTERSECTION_REACH)
}

/**
 * Snaps to "the visual intersection of two objects that do not intersect in 3D
 * space but may appear to intersect in the current view" — AutoCAD's Apparent
 * Intersection: two edges crossing on screen at different heights. An edge is
 * prolonged only to meet an engaged polar path ("use polar tracking with …
 * Apparent Intersection … to find where a polar alignment path intersects
 * another object"). WHY not two edges prolonged to meet each other: AutoCAD's
 * extended intersections are picked object by object as an override, not
 * offered by the running snap, and here they fired in empty space. Two edges
 * that meet are one too: `_APP` on a real crossing gives it (probe
 * osnapz/o04), Intersection winning the tie when both run.
 */
export const apparentIntersectionProvider: SnapProvider = {
  type: SnapType.ApparentIntersection,
  collect({
    document,
    entities,
    isNear,
    view,
    construction,
  }: SnapContext): SnapCandidate[] {
    const segments = collectShapes(document, entities, construction).filter(
      (s): s is SegmentShape => s.kind === "segment"
    )
    // Edges in other planes than the world's cross, if at all, on the screen.
    if (!view.isPlan || segments.some((s) => shapeAxes(s))) {
      return apparentOnScreen(segments, view, isNear)
    }
    const candidates: SnapCandidate[] = []

    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const a = segments[i]
        const b = segments[j]
        if (a.fromConstruction && b.fromConstruction) continue
        const x = infiniteLineIntersection(a.a, a.b, b.a, b.b)
        if (!x) continue
        const withinBoth = x.t >= 0 && x.t <= 1 && x.u >= 0 && x.u <= 1
        if (!withinBoth && !a.fromConstruction && !b.fromConstruction) continue
        const za = heightOn(a, x.point)
        const zb = heightOn(b, x.point)
        // In plan, the later object's height: the newer of two lines at Z 0
        // and Z 30 gives its own, whichever was drawn first (interaction3d/
        // i02, i03); off the plan the earlier one's (`apparentOnScreen`).
        const point = withZ(x.point, zb ?? za ?? 0)
        if (isNear(point, 8)) {
          candidates.push({
            type: SnapType.ApparentIntersection,
            point,
            sourceIds: [...a.sourceIds, ...b.sourceIds],
            transient: a.fromConstruction || b.fromConstruction,
          })
        }
      }
    }
    return candidates
  },
}

/**
 * Apparent intersection on the screen: where two edges cross in the view
 * without meeting in space (an edge prolonged only to meet a polar path). The
 * point is on the earlier of them, at its height there, whichever was drawn
 * first (interaction3d/i12, i13: in SEISO; in plan the later's).
 */
function apparentOnScreen(
  segments: readonly SegmentShape[],
  view: CameraTransform,
  isNear: SnapContext["isNear"]
): SnapCandidate[] {
  const ends = segments.map((segment): [Vec3, Vec3] => [
    segmentEnd(segment, segment.a),
    segmentEnd(segment, segment.b),
  ])
  const screen = ends.map(([a, b]) => [
    view.worldToScreen(a),
    view.worldToScreen(b),
  ])
  const candidates: SnapCandidate[] = []
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      if (segments[i].fromConstruction && segments[j].fromConstruction) {
        continue
      }
      const x = infiniteLineIntersection(
        screen[i][0],
        screen[i][1],
        screen[j][0],
        screen[j][1]
      )
      if (!x) continue
      const onFirst = lerp3(ends[i][0], ends[i][1], x.t)
      const withinBoth = x.t >= 0 && x.t <= 1 && x.u >= 0 && x.u <= 1
      const extended =
        segments[i].fromConstruction || segments[j].fromConstruction
      if (!withinBoth && !extended) continue
      if (!isNear(onFirst, 8)) continue
      candidates.push({
        type: SnapType.ApparentIntersection,
        point: onFirst,
        sourceIds: [...segments[i].sourceIds, ...segments[j].sourceIds],
        transient: segments[i].fromConstruction || segments[j].fromConstruction,
      })
    }
  }
  return candidates
}

/** An end of an edge in space: on its object there, or the rubber band's own. */
function segmentEnd(segment: SegmentShape, point: Vec2): Vec3 {
  return segment.source ? on(segment.source, point) : withZ(point, zOf(point))
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  }
}

type SegmentShape = {
  readonly kind: "segment"
  readonly a: Vec2
  readonly b: Vec2
  readonly sourceIds: readonly EntityId[]
  readonly fromConstruction: boolean
  /** The object it is part of; none for the rubber band. */
  readonly source: Entity | null
  /** The spline this is a chord of. */
  readonly curveId?: EntityId
  /**
   * The solid this is an edge of: its edges meet only at its vertices, where
   * AutoCAD finds no Intersection (solid/s01).
   */
  readonly edgeOf?: EntityId
  /** Its curve and the parameters the chord spans, to refine a crossing onto. */
  readonly chordOf?: {
    readonly curve: BSplineCurve
    readonly from: number
    readonly to: number
  }
}

type CircleShape = {
  readonly kind: "circle"
  readonly center: Vec2
  readonly radius: number
  readonly sourceIds: readonly EntityId[]
  readonly fromConstruction: boolean
  readonly source: Entity | null
}

type ArcShape = {
  readonly kind: "arc"
  readonly center: Vec2
  readonly radius: number
  readonly startAngle: number
  readonly endAngle: number
  readonly sourceIds: readonly EntityId[]
  readonly fromConstruction: boolean
  readonly source: Entity | null
}

/** A geometry primitive the intersection providers can cross with another. */
type SnapShape = SegmentShape | CircleShape | ArcShape

function heightOn(shape: SnapShape, point: Vec2): number | null {
  return shape.source ? entityZAt(shape.source, point) : null
}

/** The axes a shape's points are in, when not the WCS's. */
function shapeAxes(shape: SnapShape) {
  return shape.source ? planeAxes(shape.source) : undefined
}

/** Whether two shapes' points are in one coordinate system, so crossing them in 2D means something. */
function sameFrame(a: SnapShape, b: SnapShape): boolean {
  const tiltedA = a.source !== null && planeAxes(a.source) !== undefined
  const tiltedB = b.source !== null && planeAxes(b.source) !== undefined
  if (!tiltedA || !tiltedB) return !tiltedA && !tiltedB
  return (
    a.source !== null && b.source !== null && sameNormal(a.source, b.source)
  )
}

/** Tolerance on the heights of two objects crossing in plan. */
const MEETING_EPSILON = 1e-6

/**
 * Where two shapes of one frame crossing in its plan at `point` really meet,
 * in the WCS, or null when they pass one above the other. The rubber band
 * meets anything.
 */
function meetingPoint(a: SnapShape, b: SnapShape, point: Vec2): Vec3 | null {
  const za = heightOn(a, point)
  const zb = heightOn(b, point)
  let z: number
  if (za === null) z = zb ?? 0
  else if (zb === null) z = za
  else if (Math.abs(za - zb) <= MEETING_EPSILON) z = za
  else return null
  const axes = shapeAxes(a)
  return axes ? axesToWorld(axes, withZ(point, z)) : withZ(point, z)
}

/**
 * Normalises committed entities and the provisional rubber-band into one
 * uniform shape list, tagging construction geometry so downstream candidates
 * can be marked {@link SnapCandidate.transient}.
 *
 * A spline enters as the chords of its tessellation, each with the span of
 * the curve it stands for (a crossing on one is refined onto the curve,
 * `onCurves`), and only those within `near.reach` of the cursor: a whole
 * tessellation would make the pairwise search quadratic in chords.
 */
function collectShapes(
  document: SnapContext["document"],
  entities: SnapContext["entities"],
  construction: readonly ConstructionGeometry[],
  near?: Pick<SnapContext, "cursorOn" | "isNear">
): SnapShape[] {
  const shapes: SnapShape[] = []
  for (const entity of entities) {
    if (!document.isEntityVisible(entity)) continue
    if (entity.type === "spline") {
      if (!near) continue
      const { curve, params, points } = splineChords(entity)
      const cursor = near.cursorOn(entity)
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1]
        const b = points[i]
        const closest = closestPointOnSegment(a, b, cursor).point
        if (!near.isNear(on(entity, closest), 8)) continue
        shapes.push({
          kind: "segment",
          a,
          b,
          sourceIds: [entity.id],
          fromConstruction: false,
          source: entity,
          curveId: entity.id,
          chordOf: { curve, from: params[i - 1], to: params[i] },
        })
      }
    } else if (entity.type === "line") {
      const [a, b] = lineEnds(entity)
      const solid = document.get(entity.id)?.type === "solid3d"
      shapes.push({
        kind: "segment",
        a,
        b,
        sourceIds: [entity.id],
        fromConstruction: false,
        source: entity,
        ...(solid ? { edgeOf: entity.id } : {}),
      })
    } else if (entity.type === "circle") {
      shapes.push({
        kind: "circle",
        center: entity.center,
        radius: entity.radius,
        sourceIds: [entity.id],
        fromConstruction: false,
        source: entity,
      })
    } else if (entity.type === "arc") {
      shapes.push({
        kind: "arc",
        center: entity.center,
        radius: entity.radius,
        startAngle: entity.startAngle,
        endAngle: entity.endAngle,
        sourceIds: [entity.id],
        fromConstruction: false,
        source: entity,
      })
    } else if (entity.type === "polyline") {
      for (const seg of polylineSegmentGeometries(entity)) {
        shapes.push(
          seg.kind === "line"
            ? {
                kind: "segment",
                a: seg.a,
                b: seg.b,
                sourceIds: [entity.id],
                fromConstruction: false,
                source: entity,
              }
            : {
                kind: "arc",
                center: seg.center,
                radius: seg.radius,
                startAngle: seg.startAngle,
                endAngle: seg.endAngle,
                sourceIds: [entity.id],
                fromConstruction: false,
                source: entity,
              }
        )
      }
    }
  }
  for (const geometry of construction) {
    if (geometry.kind === "segment") {
      shapes.push({
        kind: "segment",
        a: geometry.a,
        b: geometry.b,
        sourceIds: [],
        fromConstruction: true,
        source: null,
      })
    }
  }
  return shapes
}

/**
 * A crossing found on a spline's chords, moved onto the curve: bisected
 * along the chord's span against the other shape's edge, or, two splines,
 * met by Newton from where their chords cross (probes spline/p310, p313).
 * The chord's point is kept where neither settles.
 */
function onCurves(a: SnapShape, b: SnapShape, point: Vec2): Vec2 {
  const one = isSplineChord(a) ? a : null
  const two = isSplineChord(b) ? b : null
  if (one && two) {
    const met = bsplinesMeeting(
      one.chordOf.curve,
      chordParam(one, point),
      two.chordOf.curve,
      chordParam(two, point)
    )
    return met ? bsplinePoint(one.chordOf.curve, met.u) : point
  }
  const chord = one ?? two
  if (!chord) return point
  const { curve, from, to } = chord.chordOf
  const edge = edgeFunction(one ? b : a)
  const [u] = signChanges(
    (t) => edge(bsplinePoint(curve, t)),
    from,
    to - from,
    1
  )
  return u === undefined ? point : bsplinePoint(curve, u)
}

type SplineChord = SegmentShape & {
  readonly chordOf: NonNullable<SegmentShape["chordOf"]>
}

function isSplineChord(shape: SnapShape): shape is SplineChord {
  return shape.kind === "segment" && shape.chordOf !== undefined
}

/** The parameter a chord's point stands for, by its fraction along the chord. */
function chordParam(chord: SplineChord, point: Vec2): number {
  const along = V.sub(chord.b, chord.a)
  const lengthSq = V.lengthSq(along)
  const t = lengthSq > 0 ? V.dot(V.sub(point, chord.a), along) / lengthSq : 0
  const { from, to } = chord.chordOf
  return from + (to - from) * Math.min(1, Math.max(0, t))
}

/** Signed: negative on one side of the shape's edge, positive on the other. */
function edgeFunction(shape: SnapShape): (point: Vec2) => number {
  if (shape.kind === "segment") {
    const along = V.sub(shape.b, shape.a)
    return (point) => V.cross(along, V.sub(point, shape.a))
  }
  return (point) => V.distance(point, shape.center) - shape.radius
}

/** The CCW sweep (radians, in `(0, 2π]`) from `start` to `end`. */
function arcSweep(start: number, end: number): number {
  const sweep = normalizeAngle(end - start)
  return sweep < 1e-9 ? Math.PI * 2 : sweep
}

/** All *real* intersection points between two shapes (0, 1 or 2 points). */
function intersectShapes(a: SnapShape, b: SnapShape): Vec2[] {
  if (a.kind === "segment" && b.kind === "segment") {
    const p = segmentSegmentIntersection(a.a, a.b, b.a, b.b)
    return p ? [p] : []
  }
  if (a.kind === "segment" && b.kind === "circle") {
    return segmentCircleIntersection(a.a, a.b, b.center, b.radius)
  }
  if (a.kind === "circle" && b.kind === "segment") {
    return segmentCircleIntersection(b.a, b.b, a.center, a.radius)
  }
  if (a.kind === "segment" && b.kind === "arc") {
    return segmentArcIntersection(
      a.a,
      a.b,
      b.center,
      b.radius,
      b.startAngle,
      b.endAngle
    )
  }
  if (a.kind === "arc" && b.kind === "segment") {
    return segmentArcIntersection(
      b.a,
      b.b,
      a.center,
      a.radius,
      a.startAngle,
      a.endAngle
    )
  }
  if (a.kind === "circle" && b.kind === "circle") {
    return circleCircleIntersection(a.center, a.radius, b.center, b.radius)
  }
  if (a.kind === "circle" && b.kind === "arc") {
    return circleCircleIntersection(
      a.center,
      a.radius,
      b.center,
      b.radius
    ).filter((p) => arcShapeContains(b, p))
  }
  if (a.kind === "arc" && b.kind === "circle") {
    return circleCircleIntersection(
      a.center,
      a.radius,
      b.center,
      b.radius
    ).filter((p) => arcShapeContains(a, p))
  }
  if (a.kind === "arc" && b.kind === "arc") {
    return circleCircleIntersection(
      a.center,
      a.radius,
      b.center,
      b.radius
    ).filter((p) => arcShapeContains(a, p) && arcShapeContains(b, p))
  }
  return []
}

/** Whether `point` (on the arc's circle) lies within the arc's swept extent. */
function arcShapeContains(arc: ArcShape, point: Vec2): boolean {
  return angleWithinSweep(
    arc.startAngle,
    arc.endAngle,
    Math.atan2(point.y - arc.center.y, point.x - arc.center.x)
  )
}

/**
 * Default provider registry. The order here is also the default priority order
 * used by the engine to break ties between snaps at similar distances.
 */
export const defaultSnapProviders: SnapProvider[] = [
  endpointProvider,
  intersectionProvider,
  midpointProvider,
  centerProvider,
  insertionProvider,
  quadrantProvider,
  perpendicularProvider,
  tangentProvider,
  extensionProvider,
  parallelProvider,
  // Lowest priority: only engages when no real snap is near, so a genuine
  // intersection or endpoint always wins over an extended (apparent) one.
  apparentIntersectionProvider,
  // Greediest of all (matches any point on an outline): kept last so every
  // notable-point snap wins over it.
  nearestProvider,
]
