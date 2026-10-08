import { Vec2 } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import { DocumentReader } from "../../domain/Document"
import {
  ArcEntity,
  arcEndPoint,
  entityElevation,
  lineEndZ,
} from "../../domain/entities"

/** Where a draw command's Continue starts, and the arc it must leave tangent to. */
export interface ContinuePoint {
  readonly point: Vec3
  /**
   * The direction of the arc at its end when the last object is an arc lying
   * in the plan, else `null`.
   */
  readonly tangent: Vec2 | null
}

/**
 * The endpoint of the last line, arc or polyline drawn — what AutoCAD resumes
 * from when you press Enter at a draw command's "Specify first point" prompt
 * (its Continue behaviour). Objects with no endpoint, such as circles, are
 * skipped rather than ending the search.
 */
export function lastDrawnPoint(document: DocumentReader): Vec3 | null {
  return continuePoint(document)?.point ?? null
}

/**
 * {@link lastDrawnPoint} with the tangent LINE's Continue needs: "If the most
 * recently created object is an arc, its endpoint defines the starting point
 * of the line. The line is tangent to the arc."
 */
export function continuePoint(document: DocumentReader): ContinuePoint | null {
  const entities = document.getEntities()
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    switch (entity.type) {
      case "line":
        return { point: withZ(entity.end, lineEndZ(entity)), tangent: null }
      case "arc":
        return {
          point: withZ(arcEndPoint(entity), entityElevation(entity)),
          tangent: arcEndTangent(entity),
        }
      case "polyline":
        return {
          point: withZ(
            entity.closed
              ? entity.vertices[0]
              : entity.vertices[entity.vertices.length - 1],
            entityElevation(entity)
          ),
          tangent: null,
        }
    }
  }
  return null
}

/** An arc runs counter-clockwise, so at its end it heads a quarter turn on. */
function arcEndTangent(arc: ArcEntity): Vec2 | null {
  // WHY plan only: a tilted arc's end and heading are in its own plane, which
  // a line in this one cannot leave tangent to.
  if (arc.normal && arc.normal.z < 1 - 1e-9) return null
  return { x: -Math.sin(arc.endAngle), y: Math.cos(arc.endAngle) }
}
