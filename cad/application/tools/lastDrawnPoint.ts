import { Vec2, V } from "../../geometry/Vec2"
import { segmentExitTangent } from "../../geometry/bulgeArcs"
import { Vec3, length3, sub3, withZ } from "../../geometry/Vec3"
import { DocumentReader } from "../../domain/Document"
import {
  ArcEntity,
  PolylineEntity,
  Polyline3dEntity,
  arcEndPoint,
  polyline3dSegments,
  arcStartPoint,
  entityElevation,
  lineEndZ,
  lineStartZ,
  entityShape,
} from "../../domain/entities"

/** Where a draw command's Continue starts, and the arc it must leave tangent to. */
export interface ContinuePoint {
  readonly point: Vec3
  /**
   * The direction the arc leaves in when the last object is an arc, or a
   * polyline ending in an arc segment, lying in the plan; else `null`.
   */
  readonly tangent: Vec2 | null
}

/**
 * The endpoint of the last line, arc or polyline drawn — what AutoCAD resumes
 * from when you press Enter at a draw command's "Specify first point" prompt
 * (its Continue behaviour), an arc's drawn end told by `lastPoint` as
 * {@link continuePoint} tells it (pline/p32). Objects with no endpoint, such
 * as circles, are skipped rather than ending the search.
 */
export function lastDrawnPoint(
  document: DocumentReader,
  lastPoint?: Vec3
): Vec3 | null {
  return continuePoint(document, lastPoint)?.point ?? null
}

/**
 * {@link lastDrawnPoint} with the tangent LINE's Continue needs: "If the most
 * recently created object is an arc, its endpoint defines the starting point
 * of the line. The line is tangent to the arc." An arc is stored
 * counter-clockwise, so one drawn clockwise ends at its stored start: given
 * `lastPoint` (LASTPOINT, which the arc's last point set), an arc whose start
 * is there and whose end is not is left from its start, backwards (AutoCAD
 * 2027's console: `ARC 0,0 50,50 100,0`, then LINE's Continue `30` runs from
 * (100,0) to (100,-30), line/p07).
 */
export function continuePoint(
  document: DocumentReader,
  lastPoint?: Vec3
): ContinuePoint | null {
  const entities = document.getEntities()
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entityShape(entities[i])
    switch (entity.type) {
      case "line":
        return { point: withZ(entity.end, lineEndZ(entity)), tangent: null }
      case "arc":
        return arcContinue(entity, lastPoint)
      case "polyline":
        return {
          point: withZ(
            entity.closed
              ? entity.vertices[0]
              : entity.vertices[entity.vertices.length - 1],
            entityElevation(entity)
          ),
          tangent: entity.closed ? null : polylineEndTangent(entity),
        }
      case "polyline3d": {
        // LINE's Continue starts at its last vertex, Z and all (3dpoly/p23).
        const { vertices, closed } = entity
        return {
          point: closed ? vertices[0] : vertices[vertices.length - 1],
          tangent: null,
        }
      }
      case "circle":
      case "ellipse":
      case "spline":
      case "text":
      case "mtext":
      case "attdef":
      case "dimension":
      case "hatch":
      case "insert":
      case "region":
      case "solid3d":
        break
      default: {
        const unhandled: never = entity
        void unhandled
      }
    }
  }
  return null
}

/**
 * The direction the last line, arc or polyline drawn ends in, where PLINE's
 * first arc leaves from: AutoCAD 2027's console bulges `PLINE 0,0 A 10,0`
 * -0.4142 after a line drawn at 45° (pline/p09), and passes a circle over
 * (p159, p190). An arc drawn clockwise, told by `lastPoint` as
 * {@link continuePoint} tells it, ends heading back along its stored start
 * (p33, p34). Null with none, or when the last one is an arc out of the plan.
 */
export function lastDrawnDirection(
  document: DocumentReader,
  lastPoint?: Vec3
): Vec2 | null {
  const entities = document.getEntities()
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entityShape(entities[i])
    switch (entity.type) {
      case "line": {
        const run = V.sub(entity.end, entity.start)
        return V.length(run) < 1e-9 ? null : V.normalize(run)
      }
      case "arc":
        return arcContinue(entity, lastPoint).tangent
      case "polyline": {
        const { vertices, closed } = entity
        const n = vertices.length
        if (n < 2) return null
        const last = closed ? n - 1 : n - 2
        return segmentExitTangent(
          vertices[last],
          vertices[(last + 1) % n],
          entity.bulges?.[last] ?? 0
        )
      }
      case "polyline3d": {
        const segment = lastSegment3d(entity)
        if (!segment) return null
        const run = V.sub(segment[1], segment[0])
        return V.length(run) < 1e-9 ? null : V.normalize(run)
      }
      case "circle":
      case "ellipse":
      case "spline":
      case "text":
      case "mtext":
      case "attdef":
      case "dimension":
      case "hatch":
      case "insert":
      case "region":
      case "solid3d":
        break
      default: {
        const unhandled: never = entity
        void unhandled
      }
    }
  }
  return null
}

/**
 * Whether the last line, arc or polyline drawn, whose heading {@link
 * lastDrawnDirection} reads, is a line rising off the plane: AutoCAD takes
 * its heading in the plane and says so (table 21314, pline/p149).
 */
export function lastDrawnRises(document: DocumentReader): boolean {
  const entities = document.getEntities()
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entityShape(entities[i])
    if (entity.type === "line") {
      return Math.abs(lineEndZ(entity) - lineStartZ(entity)) > 1e-9
    }
    if (entity.type === "polyline3d") {
      const segment = lastSegment3d(entity)
      return segment !== null && Math.abs(segment[1].z - segment[0].z) > 1e-9
    }
    if (entity.type === "arc" || entity.type === "polyline") return false
  }
  return false
}

/** The segment a 3D polyline ends with, the closing one if it is closed. */
function lastSegment3d(poly: Polyline3dEntity): [Vec3, Vec3] | null {
  return polyline3dSegments(poly).at(-1) ?? null
}

/** Where Continue leaves an arc: its drawn end, along its heading there. */
function arcContinue(
  arc: ArcEntity,
  lastPoint: Vec3 | undefined
): ContinuePoint {
  const z = entityElevation(arc)
  const end = withZ(arcEndPoint(arc), z)
  const start = withZ(arcStartPoint(arc), z)
  const tolerance = 1e-9 * Math.max(1, arc.radius)
  const drawnClockwise =
    lastPoint !== undefined &&
    length3(sub3(start, lastPoint)) <= tolerance &&
    length3(sub3(end, lastPoint)) > tolerance
  if (!drawnClockwise) return { point: end, tangent: arcEndTangent(arc) }
  const ahead = inPlan(arc) ? arcTangentAt(arc.startAngle) : null
  return { point: start, tangent: ahead && V.scale(ahead, -1) }
}

/** An arc runs counter-clockwise, so at its end it heads a quarter turn on. */
function arcEndTangent(arc: ArcEntity): Vec2 | null {
  return inPlan(arc) ? arcTangentAt(arc.endAngle) : null
}

function arcTangentAt(angle: number): Vec2 {
  return { x: -Math.sin(angle), y: Math.cos(angle) }
}

/** The heading a polyline's last segment ends in, if that segment is an arc. */
function polylineEndTangent(polyline: PolylineEntity): Vec2 | null {
  const { vertices } = polyline
  const last = vertices.length - 2
  const bulge = last < 0 ? 0 : (polyline.bulges?.[last] ?? 0)
  if (bulge === 0 || !inPlan(polyline)) return null
  return segmentExitTangent(vertices[last], vertices[last + 1], bulge)
}

/**
 * WHY plan only: a tilted object's end and heading are in its own plane,
 * which a line in this one cannot leave tangent to.
 */
function inPlan(entity: ArcEntity | PolylineEntity): boolean {
  return !entity.normal || entity.normal.z >= 1 - 1e-9
}
