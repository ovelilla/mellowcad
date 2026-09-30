import { Vec2 } from "../geometry/Vec2"
import { BlockLookup, Entity, measureTextWidth } from "../domain/entities"
import { CameraTransform, ScenePrimitive } from "../scene/types"
import { entityScenePrimitive } from "./SceneBuilder"

/** Chords per full turn when a curve on screen is read as a polyline. */
const CURVE_STEPS = 64
const OUTLINE_STROKE = { color: "", width: 0 }

/**
 * What an entity looks like on screen, as polylines in screen pixels: the very
 * primitives the scene draws, with curves cut into chords and a text as its
 * box. Off the plan this is the one shape a screen rectangle (window and
 * crossing selection, ZOOM Extents) is tested against, since a circle there is
 * an ellipse and a text leans with its plane.
 */
export function entityScreenOutline(
  camera: CameraTransform,
  entity: Entity,
  blocks?: BlockLookup
): Vec2[][] {
  return entityScenePrimitive(camera, entity, OUTLINE_STROKE, {
    blocks,
  }).flatMap(primitiveOutline)
}

export function primitiveOutline(p: ScenePrimitive): Vec2[][] {
  switch (p.kind) {
    case "segment":
      return [[p.a, p.b]]
    case "path":
      return [
        p.closed && p.points.length > 0
          ? [...p.points, p.points[0]]
          : [...p.points],
        ...(p.subpaths ?? []).map((ring) =>
          ring.length > 0 ? [...ring, ring[0]] : []
        ),
      ]
    case "circle":
      return [
        ellipsePoints(p.center, p.radius, p.radius, 0, 0, Math.PI * 2, false),
      ]
    case "arc":
      return [
        ellipsePoints(
          p.center,
          p.radius,
          p.radius,
          0,
          p.startAngle,
          p.endAngle,
          p.counterclockwise
        ),
      ]
    case "ellipse":
      return [
        ellipsePoints(
          p.center,
          p.radiusX,
          p.radiusY,
          p.rotation,
          p.startAngle,
          p.endAngle,
          p.counterclockwise
        ),
      ]
    case "rect":
      return [
        [
          p.min,
          { x: p.min.x + p.width, y: p.min.y },
          { x: p.min.x + p.width, y: p.min.y + p.height },
          { x: p.min.x, y: p.min.y + p.height },
          p.min,
        ],
      ]
    case "text":
      return [textBox(p)]
    case "label":
      return []
  }
}

/** Canvas's `ellipse()` as points, sweeping the way it does. */
function ellipsePoints(
  center: Vec2,
  rx: number,
  ry: number,
  rotation: number,
  start: number,
  end: number,
  counterclockwise: boolean
): Vec2[] {
  const turn = Math.PI * 2
  const raw = counterclockwise ? start - end : end - start
  const sweep = raw >= turn ? turn : ((raw % turn) + turn) % turn
  const steps = Math.max(2, Math.ceil((sweep / turn) * CURVE_STEPS))
  const direction = counterclockwise ? -1 : 1
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const points: Vec2[] = []
  for (let i = 0; i <= steps; i++) {
    const t = start + direction * sweep * (i / steps)
    const x = rx * Math.cos(t)
    const y = ry * Math.sin(t)
    points.push({
      x: center.x + x * cos - y * sin,
      y: center.y + x * sin + y * cos,
    })
  }
  return points
}

/** The box a text primitive paints: its width from the drawing font's metrics. */
function textBox(p: Extract<ScenePrimitive, { kind: "text" }>): Vec2[] {
  const width = measureTextWidth(p.text, p.height)
  const [x0, x1] =
    p.align === "left"
      ? [0, width]
      : p.align === "right"
        ? [-width, 0]
        : [-width / 2, width / 2]
  const [y0, y1] =
    p.baseline === "top"
      ? [0, p.height]
      : p.baseline === "middle" || p.baseline === "capMiddle"
        ? [-p.height / 2, p.height / 2]
        : [-p.height, 0]
  const [a, b, c, d] = p.matrix ?? [
    Math.cos(p.rotation),
    Math.sin(p.rotation),
    -Math.sin(p.rotation),
    Math.cos(p.rotation),
  ]
  const at = (x: number, y: number): Vec2 => ({
    x: p.at.x + a * x + c * y,
    y: p.at.y + b * x + d * y,
  })
  return [at(x0, y0), at(x1, y0), at(x1, y1), at(x0, y1), at(x0, y0)]
}
