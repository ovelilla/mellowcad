import { Vec2, V } from "../../geometry/Vec2"
import {
  Vec3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
  withZ,
  zOf,
} from "../../geometry/Vec3"
import { arbitraryAxis, axesToWorld } from "../../geometry/ocs"
import { bsplineDerivative, bsplineDomain } from "../../geometry/nurbs"
import { polarPoint } from "../../geometry/primitives"
import {
  Entity,
  LineEntity,
  arcEndPoint,
  arcStartPoint,
  ellipseEndPoint,
  ellipseMinorAxis,
  ellipseStartPoint,
  ellipseSweepParams,
  entityNormal,
  entityPointToWorld,
  entityZAt,
  isFullEllipse,
  lineEndZ,
  lineStartZ,
  planeAxes,
  polylineSegmentGeometries,
  splineCurve,
  splinePolyline,
} from "../../domain/entities"
import { Ucs, createUcs, ucsFromAxes } from "../../domain/ucs"

/** The objects UCS OBject can align to; dimensions and hatches are not among them. */
export function alignable(entity: Entity | null): Entity | null {
  if (!entity) return null
  return entity.type === "dimension" || entity.type === "hatch" ? null : entity
}

/**
 * AutoCAD's UCS OBject: the Z axis is the object's normal, and where the
 * origin goes and which way X points depends on the kind of object and on
 * where it was picked. `pick` is in the object's own coordinates — the plan
 * of its plane; a line's, a point along it in the WCS. A line lies in the new
 * XZ plane, its far end at Y = 0.
 */
export function ucsFromObject(entity: Entity, pick: Vec2 | Vec3): Ucs | null {
  if (entity.type === "line") return ucsAlongLine(entity, pick)
  const level = levelUcsFromObject(entity, pick)
  const axes = planeAxes(entity)
  if (!level || !axes) return level
  return {
    origin: axesToWorld(axes, level.origin),
    xAxis: axesToWorld(axes, level.xAxis),
    yAxis: axesToWorld(axes, level.yAxis),
  }
}

/** A line's ends, the one nearer `pick` (a point along it) first. */
function lineEnds(line: LineEntity, pick: Vec2 | Vec3): [Vec3, Vec3] {
  const start = { ...line.start, z: lineStartZ(line) }
  const end = { ...line.end, z: lineEndZ(line) }
  const at: Vec3 = { x: pick.x, y: pick.y, z: zOf(pick) }
  return length3(sub3(at, start)) <= length3(sub3(at, end))
    ? [start, end]
    : [end, start]
}

function ucsAlongLine(line: LineEntity, pick: Vec2 | Vec3): Ucs | null {
  const [origin, far] = lineEnds(line, pick)
  const along = sub3(far, origin)
  const z = entityNormal(line)
  const flat = sub3(along, scale3(z, dot3(along, z)))
  const x = normalize3(flat) ?? arbitraryAxis(z)?.x
  return x ? ucsFromAxes(origin, x, cross3(z, x)) : null
}

/** UCS OBject read in the object's own coordinates, where its plane is level. */
function levelUcsFromObject(entity: Entity, pick: Vec2): Ucs | null {
  const toward = (origin: Vec2, target: Vec2) =>
    createUcs(withZ(origin, entityZAt(entity, origin)), V.sub(target, origin))
  const nearer = (a: Vec2, b: Vec2) =>
    V.distance(pick, a) <= V.distance(pick, b) ? a : b
  switch (entity.type) {
    case "circle":
      return toward(entity.center, pick)
    case "arc":
      return toward(
        entity.center,
        nearer(arcStartPoint(entity), arcEndPoint(entity))
      )
    case "ellipse":
      return isFullEllipse(entity)
        ? toward(entity.center, pick)
        : toward(
            entity.center,
            nearer(ellipseStartPoint(entity), ellipseEndPoint(entity))
          )
    case "polyline": {
      const segments = polylineSegmentGeometries(entity)
      let best = segments[0]
      let bestDistance = Infinity
      for (const segment of segments) {
        const distance = segmentDistance(segment, pick)
        if (distance < bestDistance) {
          best = segment
          bestDistance = distance
        }
      }
      if (!best) return null
      const end = nearer(best.a, best.b)
      if (best.kind === "arc") return toward(best.center, end)
      return toward(end, end === best.a ? best.b : best.a)
    }
    case "spline": {
      const points = splinePolyline(entity)
      const first = points[0]
      const last = points[points.length - 1]
      if (entity.closed) return toward(first, pick)
      const origin = nearer(first, last)
      return toward(origin, origin === first ? last : first)
    }
    case "text":
    case "mtext":
    case "attdef":
    case "insert":
      return createUcs(
        withZ(entity.position, entityZAt(entity, entity.position)),
        polarPoint({ x: 0, y: 0 }, 1, entity.rotation)
      )
    default:
      return null
  }
}

function segmentDistance(
  segment: ReturnType<typeof polylineSegmentGeometries>[number],
  point: Vec2
): number {
  if (segment.kind === "line") {
    const ab = V.sub(segment.b, segment.a)
    const length = V.lengthSq(ab)
    const t =
      length > 0
        ? Math.max(0, Math.min(1, V.dot(V.sub(point, segment.a), ab) / length))
        : 0
    return V.distance(point, V.add(segment.a, V.scale(ab, t)))
  }
  return Math.abs(V.distance(point, segment.center) - segment.radius)
}

/**
 * The objects UCS ZAxis's Object aligns to: lines, circular and elliptical
 * arcs, open polylines and open splines — what has ends to be tangent at.
 */
export function hasEnds(entity: Entity | null): entity is Entity {
  if (!entity) return false
  switch (entity.type) {
    case "line":
    case "arc":
      return true
    case "ellipse":
      return !isFullEllipse(entity)
    case "polyline":
    case "spline":
      return !entity.closed
    default:
      return false
  }
}

/**
 * UCS ZAxis's Object: the origin at the end of the object nearer `pick` (in
 * the object's own coordinates), the Z axis tangent to it there pointing away
 * from the object, and X level in the WCS as for any ZAxis.
 */
export function ucsAtEnd(entity: Entity, pick: Vec2 | Vec3): Ucs | null {
  if (entity.type === "line") {
    const [end, other] = lineEnds(entity, pick)
    return ucsAlongZ(end, sub3(end, other))
  }
  const end = planarEnd(entity, pick)
  if (!end) return null
  const axes = planeAxes(entity)
  return ucsAlongZ(
    entityPointToWorld(entity, end.point),
    axes ? axesToWorld(axes, end.direction) : withZ(end.direction, 0)
  )
}

/**
 * The UCS at `origin` whose Z axis points along `z`. UCS ZAxis lays the X axis
 * parallel to the WCS's XY plane whatever the current UCS — DXF's arbitrary
 * axis algorithm.
 */
export function ucsAlongZ(origin: Vec3, z: Vec3): Ucs | null {
  const axes = arbitraryAxis(z)
  if (!axes) return null
  return ucsFromAxes(origin, axes.x, axes.y)
}

interface PlanarEnd {
  readonly point: Vec2
  /** The direction leaving the object there. */
  readonly direction: Vec2
}

/** The end of a curve nearer `pick`, both in the curve's own coordinates. */
function planarEnd(entity: Entity, pick: Vec2): PlanarEnd | null {
  const nearer = (start: PlanarEnd, end: PlanarEnd) =>
    V.distance(pick, start.point) <= V.distance(pick, end.point) ? start : end
  switch (entity.type) {
    case "arc":
      return nearer(
        {
          point: arcStartPoint(entity),
          direction: polarPoint(ORIGIN, 1, entity.startAngle - Math.PI / 2),
        },
        {
          point: arcEndPoint(entity),
          direction: polarPoint(ORIGIN, 1, entity.endAngle + Math.PI / 2),
        }
      )
    case "ellipse": {
      const { start, sweep } = ellipseSweepParams(entity)
      const minor = ellipseMinorAxis(entity)
      const tangent = (t: number) =>
        V.add(
          V.scale(entity.majorAxis, -Math.sin(t)),
          V.scale(minor, Math.cos(t))
        )
      return nearer(
        {
          point: ellipseStartPoint(entity),
          direction: V.scale(tangent(start), -1),
        },
        { point: ellipseEndPoint(entity), direction: tangent(start + sweep) }
      )
    }
    case "polyline": {
      const segments = polylineSegmentGeometries(entity)
      const first = segments[0]
      const last = segments[segments.length - 1]
      if (!first || !last) return null
      return nearer(
        {
          point: first.a,
          direction: V.scale(segmentTangent(first, first.a), -1),
        },
        { point: last.b, direction: segmentTangent(last, last.b) }
      )
    }
    case "spline": {
      const curve = splineCurve(entity)
      const { start, end } = bsplineDomain(curve)
      const points = splinePolyline(entity)
      return nearer(
        {
          point: points[0],
          direction: V.scale(bsplineDerivative(curve, start), -1),
        },
        {
          point: points[points.length - 1],
          direction: bsplineDerivative(curve, end),
        }
      )
    }
    default:
      return null
  }
}

const ORIGIN: Vec2 = { x: 0, y: 0 }

/** The direction a polyline segment runs in at `point`, one of its ends. */
function segmentTangent(
  segment: ReturnType<typeof polylineSegmentGeometries>[number],
  point: Vec2
): Vec2 {
  if (segment.kind === "line") return V.sub(segment.b, segment.a)
  const radial = V.sub(point, segment.center)
  // A positive bulge turns counter-clockwise from a to b.
  return segment.bulge > 0
    ? { x: -radial.y, y: radial.x }
    : { x: radial.y, y: -radial.x }
}
