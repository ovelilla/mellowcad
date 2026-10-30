import { Vec2 } from "../geometry/Vec2"
import {
  Vec3,
  WORLD_Z,
  add3,
  cross3,
  dot3,
  scale3,
  sub3,
} from "../geometry/Vec3"
import {
  BlockLookup,
  Entity,
  entitiesBounds,
  entityElevation,
  entityThickness,
  lineEndZ,
} from "../domain/entities"
import { Viewport } from "./Viewport"

/** Radians the view turns per pixel dragged: half a turn across 400 px. */
const ORBIT_RADIANS_PER_PX = Math.PI / 400

/** How close to straight up or down an orbit may look: the plan itself has no "up" to keep. */
const MAX_ELEVATION = (89.9 * Math.PI) / 180

/**
 * The point 3DORBIT turns the view about: under the centre of the screen, at
 * the depth of the middle of the drawing (or of the plane facing the viewer
 * through the origin, for an empty one).
 */
export function orbitTarget(
  viewport: Viewport,
  entities: readonly Entity[],
  blocks?: BlockLookup
): Vec3 {
  const center = viewport.screenToFacing({
    x: viewport.width / 2,
    y: viewport.height / 2,
  })
  const middle = drawingMiddle(entities, blocks)
  if (!middle) return center
  const depth = dot3(sub3(middle, center), viewport.direction)
  return add3(center, scale3(viewport.direction, depth))
}

/**
 * AutoCAD's constrained orbit: dragging across turns the camera about the
 * world's Z axis, dragging up and down raises or lowers it, and the world's Z
 * stays upright on the screen. The target stays where it is drawn.
 */
export function orbitView(viewport: Viewport, drag: Vec2, target: Vec3): void {
  const { direction: d, right } = viewport
  // Read off the right axis, which a plan view also has: looking straight down
  // with X to the right is the camera to the south, as an orbit starts there.
  const azimuth = Math.atan2(-right.x, right.y) - drag.x * ORBIT_RADIANS_PER_PX
  const elevation = Math.max(
    -MAX_ELEVATION,
    Math.min(
      MAX_ELEVATION,
      Math.asin(Math.max(-1, Math.min(1, d.z))) + drag.y * ORBIT_RADIANS_PER_PX
    )
  )
  const direction: Vec3 = {
    x: Math.cos(elevation) * Math.cos(azimuth),
    y: Math.cos(elevation) * Math.sin(azimuth),
    z: Math.sin(elevation),
  }
  if (!viewport.setView(direction, cross3(WORLD_Z, direction))) return
  viewport.centerOn(target)
}

/** The middle of what the drawing holds, in space, or `null` for an empty one. */
export function drawingMiddle(
  entities: readonly Entity[],
  blocks?: BlockLookup
): Vec3 | null {
  const box = drawingBox(entities, blocks)
  return box && scale3(add3(box.min, box.max), 0.5)
}

/** The box round what the drawing holds, in space, or `null` for an empty one. */
export function drawingBox(
  entities: readonly Entity[],
  blocks?: BlockLookup
): { readonly min: Vec3; readonly max: Vec3 } | null {
  const bounds = entitiesBounds(entities, blocks)
  if (!bounds) return null
  let low = Number.POSITIVE_INFINITY
  let high = Number.NEGATIVE_INFINITY
  for (const entity of entities) {
    if (entity.type === "polyline3d") {
      for (const vertex of entity.vertices) {
        low = Math.min(low, vertex.z)
        high = Math.max(high, vertex.z)
      }
      continue
    }
    const z = entityElevation(entity)
    const thickness = entityThickness(entity)
    const top = entity.type === "line" ? lineEndZ(entity) : z
    for (const height of [z, top, z + thickness, top + thickness]) {
      low = Math.min(low, height)
      high = Math.max(high, height)
    }
  }
  return {
    min: { x: bounds.min.x, y: bounds.min.y, z: low },
    max: { x: bounds.max.x, y: bounds.max.y, z: high },
  }
}
