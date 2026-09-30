import { Vec3, withZ } from "../../geometry/Vec3"
import { DocumentReader } from "../../domain/Document"
import { arcEndPoint, entityElevation, lineEndZ } from "../../domain/entities"

/**
 * The endpoint of the last line, arc or polyline drawn — what AutoCAD resumes
 * from when you press Enter at a draw command's "Specify first point" prompt
 * (its Continue behaviour). Objects with no endpoint, such as circles, are
 * skipped rather than ending the search.
 */
export function lastDrawnPoint(document: DocumentReader): Vec3 | null {
  const entities = document.getEntities()
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    switch (entity.type) {
      case "line":
        return withZ(entity.end, lineEndZ(entity))
      case "arc":
        return withZ(arcEndPoint(entity), entityElevation(entity))
      case "polyline":
        return withZ(
          entity.closed
            ? entity.vertices[0]
            : entity.vertices[entity.vertices.length - 1],
          entityElevation(entity)
        )
    }
  }
  return null
}
