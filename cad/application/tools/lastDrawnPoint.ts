import { Vec2 } from "../../geometry/Vec2"
import { DocumentReader } from "../../domain/Document"
import { arcEndPoint } from "../../domain/entities"

/**
 * The endpoint of the last line, arc or polyline drawn — what AutoCAD resumes
 * from when you press Enter at a draw command's "Specify first point" prompt
 * (its Continue behaviour). Objects with no endpoint, such as circles, are
 * skipped rather than ending the search.
 */
export function lastDrawnPoint(document: DocumentReader): Vec2 | null {
  const entities = document.getEntities()
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    switch (entity.type) {
      case "line":
        return entity.end
      case "arc":
        return arcEndPoint(entity)
      case "polyline":
        return entity.closed
          ? entity.vertices[0]
          : entity.vertices[entity.vertices.length - 1]
    }
  }
  return null
}
