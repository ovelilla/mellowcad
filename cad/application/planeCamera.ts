import { Vec2 } from "../geometry/Vec2"
import { Axes3, axesToWorld } from "../geometry/ocs"
import { CameraTransform, ScenePrimitive, StrokeStyle } from "../scene/types"

/**
 * A 2×2 linear map as the canvas writes one: `(x, y)` goes to
 * `(a·x + c·y, b·x + d·y)`, so `a, b` is the image of X and `c, d` of Y.
 */
export type Linear2 = readonly [a: number, b: number, c: number, d: number]

/**
 * The camera as one plane sees it. A parallel projection takes every plane to
 * the screen by an affine map, so a planar object is drawn with its own 2D
 * coordinates through this camera: `worldToScreen` reads a point of the plane,
 * whatever Z it carries.
 */
export interface PlaneCamera extends CameraTransform {
  /** Screen pixels per unit of the plane along its X and Y axes. */
  readonly linear: Linear2
}

export function isPlaneCamera(camera: CameraTransform): camera is PlaneCamera {
  return "linear" in camera
}

/**
 * The plane at `elevation` along the Z of `axes` (an object's coordinate
 * system; the WCS when left out), seen through `camera`: a point of it is
 * given by its X and Y on those axes.
 */
export function planeCamera(
  camera: CameraTransform,
  elevation: number,
  axes?: Axes3
): PlaneCamera {
  const at = (x: number, y: number) =>
    camera.worldToScreen(
      axes ? axesToWorld(axes, { x, y, z: elevation }) : { x, y, z: elevation }
    )
  const origin = at(0, 0)
  const onX = at(1, 0)
  const onY = at(0, 1)
  const a = onX.x - origin.x
  const b = onX.y - origin.y
  const c = onY.x - origin.x
  const d = onY.y - origin.y
  const stretch = largestStretch(a, b, c, d)
  const det = a * d - b * c
  return {
    width: camera.width,
    height: camera.height,
    scale: camera.scale,
    twist: camera.twist,
    isPlan: false,
    linear: [a, b, c, d],
    worldToScreen: (p) => ({
      x: origin.x + a * p.x + c * p.y,
      y: origin.y + b * p.x + d * p.y,
    }),
    screenToWorld: (p) => {
      const x = p.x - origin.x
      const y = p.y - origin.y
      if (Math.abs(det) < 1e-12 * stretch * stretch) {
        // Seen edge-on the map has rank one: its pseudo-inverse gives the
        // plane's point nearest the origin among those drawn at `p`.
        const frobenius = a * a + b * b + c * c + d * d
        if (!(frobenius > 0)) return { x: 0, y: 0 }
        return {
          x: (a * x + b * y) / frobenius,
          y: (c * x + d * y) / frobenius,
        }
      }
      return { x: (d * x - c * y) / det, y: (a * y - b * x) / det }
    },
    worldToScreenDistance: (distance) => distance * stretch,
  }
}

/** How far the map stretches a unit vector at most: its largest singular value. */
function largestStretch(a: number, b: number, c: number, d: number): number {
  const sum = a * a + b * b + c * c + d * d
  const det = a * d - b * c
  return Math.sqrt(
    (sum + Math.sqrt(Math.max(sum * sum - 4 * det * det, 0))) / 2
  )
}

/** How far the plane's map shrinks a unit vector at most: 0 when it is seen edge-on. */
export function smallestStretch(camera: PlaneCamera): number {
  const [a, b, c, d] = camera.linear
  const largest = largestStretch(a, b, c, d)
  return largest > 0 ? Math.abs(a * d - b * c) / largest : 0
}

/**
 * The image of a curve `center + u·cos t + v·sin t` (t from `start` to `end`,
 * increasing; `null` for the whole curve) as a canvas `ellipse()`. An affine
 * map turns a circle or an ellipse into an ellipse, whose conjugate
 * semi-diameters are the images of `u` and `v`; the principal ones and the
 * phase between the two parametrisations follow from them.
 */
export function affineEllipse(
  camera: PlaneCamera,
  center: Vec2,
  u: Vec2,
  v: Vec2,
  range: { readonly start: number; readonly end: number } | null,
  stroke: StrokeStyle
): ScenePrimitive {
  const [a, b, c, d] = camera.linear
  const U = { x: a * u.x + c * u.y, y: b * u.x + d * u.y }
  const V = { x: a * v.x + c * v.y, y: b * v.x + d * v.y }
  const uu = U.x * U.x + U.y * U.y
  const vv = V.x * V.x + V.y * V.y
  const uv = U.x * V.x + U.y * V.y
  const t0 = Math.atan2(2 * uv, uu - vv) / 2
  const cos = Math.cos(t0)
  const sin = Math.sin(t0)
  const major = { x: U.x * cos + V.x * sin, y: U.y * cos + V.y * sin }
  const minor = { x: -U.x * sin + V.x * cos, y: -U.y * sin + V.y * cos }
  const radiusX = Math.hypot(major.x, major.y)
  const radiusY = Math.hypot(minor.x, minor.y)
  // Canvas runs its parameter from the major axis a quarter turn clockwise on
  // screen; the image runs the other way when the map reverses orientation.
  const sign = major.x * minor.y - major.y * minor.x >= 0 ? 1 : -1
  const full = range === null
  return {
    kind: "ellipse",
    center: camera.worldToScreen(center),
    radiusX: Math.max(radiusX, 0.01),
    radiusY: Math.max(radiusY, 0.01),
    rotation: Math.atan2(major.y, major.x),
    startAngle: full ? 0 : sign * (range.start - t0),
    endAngle: full ? Math.PI * 2 : sign * (range.end - t0),
    counterclockwise: !full && sign < 0,
    stroke,
  }
}
