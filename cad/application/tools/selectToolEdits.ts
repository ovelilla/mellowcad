import { Vec2, V } from "../../geometry/Vec2"
import {
  createArc,
  createCircle,
  DimensionEntity,
  Entity,
} from "../../domain/entities"
import { DimensionPoint } from "./selectToolState"

/**
 * The dimension with one definition point dragged to `point`. Moving an
 * extension-line origin restates what is measured; moving the dimension line
 * slides the whole assembly, which is what its midpoint grip is for.
 */
export function movedDimension(
  dim: DimensionEntity,
  state: { readonly point: DimensionPoint; readonly origin: Vec2 },
  point: Vec2
): DimensionEntity {
  switch (state.point) {
    case "first":
      return { ...dim, first: point }
    case "second":
      return { ...dim, second: point }
    case "vertex":
      return { ...dim, vertex: point }
    case "line":
      // An angular dimension's arc passes through its location, so the grip
      // sets it outright — which is also how dragging across a ray gives the
      // reflex angle. Every other kind slides its line by the drag instead,
      // because only the location's projection is drawn.
      return dim.kind === "angular"
        ? { ...dim, linePoint: point }
        : {
            ...dim,
            linePoint: V.add(dim.linePoint, V.sub(point, state.origin)),
          }
  }
}

/** The point on a circle of `radius` about `center` in the direction of `p`. */
export function radiusHandle(center: Vec2, p: Vec2, radius: number): Vec2 {
  const dir = V.sub(p, center)
  const len = V.length(dir)
  if (len < 1e-9) return { x: center.x + radius, y: center.y }
  return V.add(center, V.scale(dir, radius / len))
}

/** A copy of a circle or arc with a new radius (preserving id); else `null`. */
export function withRadius(entity: Entity, radius: number): Entity | null {
  if (entity.type === "circle") {
    return createCircle(entity.center, radius, entity.layerId, entity.id)
  }
  if (entity.type === "arc") {
    return createArc(
      entity.center,
      radius,
      entity.startAngle,
      entity.endAngle,
      entity.layerId,
      entity.id
    )
  }
  return null
}

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}
