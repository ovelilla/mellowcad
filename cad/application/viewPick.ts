import { Vec2 } from "../geometry/Vec2"
import { closestPointOnSegment } from "../geometry/primitives"
import {
  BlockLookup,
  Entity,
  closestOnEntity,
  entityElevation,
  entityThickness,
  hasThickness,
  insertFlatGeometry,
  lineEndZ,
  lineStartZ,
} from "../domain/entities"
import { CameraTransform } from "../scene/types"
import { planeCamera, smallestStretch } from "./planeCamera"
import { extrusionEdges } from "./SceneBuilder"
import { entityScreenOutline } from "./viewOutline"

/** Below this share of its largest stretch a plane is taken as seen edge-on. */
const EDGE_ON = 1e-3

/**
 * A screen point as a point of the horizontal plane at `z`, for a 2D question
 * asked in that plane (the closest point on an object, a snap near the
 * cursor). In a plan view every plane reads the same; off the plan it is where
 * the line of sight through the point meets the plane, or — seen edge-on — the
 * plane's nearest point to it.
 */
export function cursorInPlane(
  camera: CameraTransform,
  z: number,
  screen: Vec2
): Vec2 {
  return camera.isPlan
    ? camera.screenToWorld(screen)
    : planeCamera(camera, z).screenToWorld(screen)
}

/**
 * How far `screen` is, in pixels, from what the view draws of `entity`: its
 * outline in its plane, the top face and the edges of its thickness, a line
 * from end to end at their heights, and a block reference's objects. It is how
 * a view off the plan picks, since there a click is on the screen, not on the
 * plane an object lies in.
 */
export function screenDistanceToEntity(
  camera: CameraTransform,
  entity: Entity,
  screen: Vec2,
  blocks?: BlockLookup
): number {
  if (entity.type === "insert") {
    if (!blocks)
      return distanceTo(
        camera,
        entity.position,
        entityElevation(entity),
        screen
      )
    let best = Number.POSITIVE_INFINITY
    for (const nested of insertFlatGeometry(entity, blocks)) {
      best = Math.min(
        best,
        screenDistanceToEntity(camera, nested, screen, blocks)
      )
    }
    return best
  }
  const thickness = entityThickness(entity)
  if (entity.type === "line") {
    const at = (point: Vec2, z: number) =>
      camera.worldToScreen({ x: point.x, y: point.y, z })
    const startZ = lineStartZ(entity)
    const endZ = lineEndZ(entity)
    const segments: [Vec2, Vec2][] = [
      [at(entity.start, startZ), at(entity.end, endZ)],
    ]
    if (thickness !== 0) {
      segments.push(
        [
          at(entity.start, startZ + thickness),
          at(entity.end, endZ + thickness),
        ],
        [at(entity.start, startZ), at(entity.start, startZ + thickness)],
        [at(entity.end, endZ), at(entity.end, endZ + thickness)]
      )
    }
    return segmentsDistance(segments, screen)
  }
  const elevation = entityElevation(entity)
  const base = planeCamera(camera, elevation)
  if (smallestStretch(base) < EDGE_ON * base.worldToScreenDistance(1)) {
    // Seen edge-on an object is a line on screen, and its plane cannot say
    // which of its points lies under the cursor: measure what is drawn.
    return entityScreenOutline(camera, entity, blocks).reduce(
      (best, line) => Math.min(best, polylineDistance(line, screen)),
      Number.POSITIVE_INFINITY
    )
  }
  const onPlane = (z: number) => {
    const plane = planeCamera(camera, z)
    const closest = closestOnEntity(entity, plane.screenToWorld(screen), blocks)
    const at = plane.worldToScreen(closest.point)
    return Math.hypot(at.x - screen.x, at.y - screen.y)
  }
  let best = onPlane(elevation)
  if (thickness !== 0 && hasThickness(entity)) {
    best = Math.min(
      best,
      onPlane(elevation + thickness),
      segmentsDistance(
        extrusionEdges(camera, entity, elevation, thickness),
        screen
      )
    )
  }
  return best
}

function distanceTo(
  camera: CameraTransform,
  point: Vec2,
  z: number,
  screen: Vec2
): number {
  const at = camera.worldToScreen({ x: point.x, y: point.y, z })
  return Math.hypot(at.x - screen.x, at.y - screen.y)
}

function segmentsDistance(
  segments: readonly [Vec2, Vec2][],
  screen: Vec2
): number {
  let best = Number.POSITIVE_INFINITY
  for (const [a, b] of segments) {
    best = Math.min(best, closestPointOnSegment(a, b, screen).distance)
  }
  return best
}

function polylineDistance(points: readonly Vec2[], screen: Vec2): number {
  if (points.length === 1) {
    return Math.hypot(points[0].x - screen.x, points[0].y - screen.y)
  }
  let best = Number.POSITIVE_INFINITY
  for (let i = 1; i < points.length; i++) {
    best = Math.min(
      best,
      closestPointOnSegment(points[i - 1], points[i], screen).distance
    )
  }
  return best
}
