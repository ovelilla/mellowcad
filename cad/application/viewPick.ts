import { V, Vec2 } from "../geometry/Vec2"
import { Axes3, axesToWorld } from "../geometry/ocs"
import { closestPointOnSegment } from "../geometry/primitives"
import {
  BlockLookup,
  Entity,
  closestOnEntity,
  entityElevation,
  entityPointToWorld,
  entityThickness,
  hasThickness,
  insertFlatGeometry,
  isLevel,
  isTilted,
  planeAxes,
  splinePolyline,
  SplineEntity,
} from "../domain/entities"
import { CameraTransform } from "../scene/types"
import { planeCamera, smallestStretch } from "./planeCamera"
import { extrusionEdges } from "./SceneBuilder"
import { entityScreenOutline } from "./viewOutline"

/** Below this share of its largest stretch a plane is taken as seen edge-on. */
const EDGE_ON = 1e-3

/**
 * A screen point as a point of the plane at `z` along the Z of `axes` (the
 * WCS when left out), for a 2D question asked in that plane (the closest point
 * on an object, a snap near the cursor). In a plan view every level plane
 * reads the same; otherwise it is where the line of sight through the point
 * meets the plane, or — seen edge-on — the plane's nearest point to it.
 */
export function cursorInPlane(
  camera: CameraTransform,
  z: number,
  screen: Vec2,
  axes?: Axes3
): Vec2 {
  return camera.isPlan && !axes
    ? camera.screenToWorld(screen)
    : planeCamera(camera, z, axes).screenToWorld(screen)
}

/**
 * {@link cursorInPlane} for the plane `entity` lies in. A spline in none is
 * read along its own image on screen, as a sloping line is: the point of its
 * plan under its point drawn nearest the cursor.
 */
export function cursorOnEntityPlane(
  camera: CameraTransform,
  entity: Entity,
  screen: Vec2
): Vec2 {
  if (entity.type === "spline" && !isLevel(entity)) {
    return splineUnderCursor(camera, entity, screen)
  }
  return cursorInPlane(
    camera,
    entityElevation(entity),
    screen,
    planeAxes(entity)
  )
}

function splineUnderCursor(
  camera: CameraTransform,
  spline: SplineEntity,
  screen: Vec2
): Vec2 {
  const axes = planeAxes(spline)
  const points = splinePolyline(spline)
  const drawn = points.map((p) =>
    camera.worldToScreen(axes ? axesToWorld(axes, p) : p)
  )
  let best: Vec2 = points[0]
  let nearest = Number.POSITIVE_INFINITY
  for (let i = 1; i < points.length; i++) {
    const hit = closestPointOnSegment(drawn[i - 1], drawn[i], screen)
    if (hit.distance < nearest) {
      nearest = hit.distance
      best = V.lerp(points[i - 1], points[i], hit.t)
    }
  }
  return { x: best.x, y: best.y }
}

/**
 * How far `world`, a point of a plan view, is from `entity` in world units:
 * in plan for what lies in a level plane, and on the screen for what does
 * not, whose plan is not its own outline.
 */
export function planDistanceToEntity(
  camera: CameraTransform,
  entity: Entity,
  world: Vec2,
  blocks: BlockLookup,
  isolines?: number
): number {
  // A solid is picked by what it draws, its isolines too (solid/d04).
  if (isTilted(entity) || entity.type === "solid3d") {
    return (
      screenDistanceToEntity(
        camera,
        entity,
        camera.worldToScreen(world),
        blocks,
        isolines
      ) / camera.worldToScreenDistance(1)
    )
  }
  if (entity.type !== "insert") {
    return closestOnEntity(entity, world, blocks).distance
  }
  let best = V.distance(entity.position, world)
  for (const nested of insertFlatGeometry(entity, blocks)) {
    best = Math.min(best, planDistanceToEntity(camera, nested, world, blocks))
  }
  return best
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
  blocks?: BlockLookup,
  isolines?: number
): number {
  if (entity.type === "insert") {
    const at = camera.worldToScreen(entityPointToWorld(entity, entity.position))
    let best = Math.hypot(at.x - screen.x, at.y - screen.y)
    if (!blocks) return best
    for (const nested of insertFlatGeometry(entity, blocks)) {
      best = Math.min(
        best,
        screenDistanceToEntity(camera, nested, screen, blocks)
      )
    }
    return best
  }
  const thickness = entityThickness(entity)
  const outlineDistance = () =>
    entityScreenOutline(camera, entity, blocks, isolines).reduce(
      (best, line) => Math.min(best, polylineDistance(line, screen)),
      Number.POSITIVE_INFINITY
    )
  // A line, its thickness included, is drawn as segments: measure them, and
  // a 3D polyline's and a solid's edges, each at its vertices' Z, and a
  // spline's through its own.
  if (
    entity.type === "line" ||
    entity.type === "polyline3d" ||
    entity.type === "solid3d" ||
    (entity.type === "spline" && !isLevel(entity))
  ) {
    return outlineDistance()
  }
  const elevation = entityElevation(entity)
  const axes = planeAxes(entity)
  const base = planeCamera(camera, elevation, axes)
  if (smallestStretch(base) < EDGE_ON * base.worldToScreenDistance(1)) {
    // Seen edge-on an object is a line on screen, and its plane cannot say
    // which of its points lies under the cursor: measure what is drawn.
    return outlineDistance()
  }
  const onPlane = (z: number) => {
    const plane = planeCamera(camera, z, axes)
    const closest = closestOnEntity(entity, plane.screenToWorld(screen), blocks)
    // Inside an area (a text's box, a SOLID hatch) the closest point is on
    // its edge; a pattern hatch is picked by its lines.
    if (closest.distance === 0) return 0
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
