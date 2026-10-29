import { Vec2 } from "../geometry/Vec2"
import {
  Vec3,
  WORLD_X,
  WORLD_Y,
  WORLD_Z,
  add3,
  cross3,
  dot3,
  normalize3,
  scale3,
} from "../geometry/Vec3"
import { Axes3, arbitraryAxis, worldToAxes } from "../geometry/ocs"
import { Ucs, ucsZAxis } from "../domain/ucs"

/**
 * AutoCAD's ViewCube as a model: its 26 parts, the view each one shows, and
 * what the cube looks like from the current camera, already projected, so a
 * host draws it without a line of geometry. Everything is in the frame of the
 * current UCS, which the cube is oriented to (NAVVCUBEORIENT 1).
 */

export type ViewCubeFace =
  "top" | "bottom" | "front" | "back" | "left" | "right"

/**
 * A face, an edge or a corner, named by the faces it touches: the top or the
 * bottom first, then the left or the right, then the front or the back
 * (`top`, `top-front`, `left-front`, `top-left-front`).
 */
export type ViewCubePart = string

/** The neighbour a face view's triangles turn to, by where it is on the screen. */
export type ViewCubeSide = "up" | "down" | "left" | "right"

/** Which way the roll arrows turn the scene on the screen. */
export type ViewCubeRoll = "clockwise" | "counterclockwise"

export type CompassLetter = "N" | "E" | "S" | "W"

/**
 * What a press on the ViewCube landed on: a part, a compass letter (a drag
 * from it turns the ring), or the ring itself.
 */
export type ViewCubeTarget =
  | { readonly part: ViewCubePart }
  | { readonly letter: CompassLetter }
  | { readonly ring: true }

/**
 * Whether a press on the cube has moved far enough to be a drag: out of
 * Windows' drag rectangle, 4 px either way (SM_CXDRAG), as AutoCAD's cube
 * reads it — 5 px across or down orbits, 4 across and 4 down do not (desktop
 * view/d10).
 */
export function leavesCubeClick(from: Vec2, to: Vec2): boolean {
  return (
    Math.abs(to.x - from.x) > DRAG_RECTANGLE_PX ||
    Math.abs(to.y - from.y) > DRAG_RECTANGLE_PX
  )
}

const DRAG_RECTANGLE_PX = 4

/** A view in the cube's frame: towards the viewer, and the direction drawn right. */
export interface CubeView {
  readonly direction: Vec3
  readonly right: Vec3
}

/** The camera's axes read in the cube's frame. */
export interface CubeCamera extends CubeView {
  readonly up: Vec3
}

/** One of the nine zones a face shows, in the 0–1 box the cube is drawn in (Y down). */
export interface ViewCubeZone {
  readonly part: ViewCubePart
  readonly points: readonly Vec2[]
}

export interface ViewCubeFaceUi {
  readonly face: ViewCubeFace
  /** The face itself, its four edges and four corners, as the screen shows them. */
  readonly zones: readonly ViewCubeZone[]
  /**
   * The affine `[a, b, c, d, e, f]` (an SVG `matrix`) taking the face's own
   * square, `(0, 0)` its top-left as read from outside and `(1, 1)` its
   * bottom-right, into the box: where its name is written.
   */
  readonly label: readonly [number, number, number, number, number, number]
}

export interface ViewCubeCompassUi {
  /** The ring round the cube's foot: an ellipse, its rotation in degrees. */
  readonly center: Vec2
  readonly rx: number
  readonly ry: number
  readonly rotation: number
  readonly letters: readonly { letter: CompassLetter; at: Vec2 }[]
}

/** What `EngineState` gives a host to draw the ViewCube with. */
export interface ViewCubeUi {
  /** NAVVCUBE. */
  readonly visible: boolean
  /** The faces turned to the viewer, farthest first. */
  readonly faces: readonly ViewCubeFaceUi[]
  readonly compass: ViewCubeCompassUi
  /** The part the view looks along (a solid outline), or `null` (dashed). */
  readonly current: ViewCubePart | null
  /** A face view: the roll arrows and the four triangles are on offer. */
  readonly faceView: boolean
}

const FACE_AXES: Readonly<
  Record<ViewCubeFace, { normal: Vec3; u: Vec3; v: Vec3 }>
> = {
  top: { normal: WORLD_Z, u: WORLD_X, v: WORLD_Y },
  bottom: {
    normal: { x: 0, y: 0, z: -1 },
    u: WORLD_X,
    v: { x: 0, y: -1, z: 0 },
  },
  front: { normal: { x: 0, y: -1, z: 0 }, u: WORLD_X, v: WORLD_Z },
  back: { normal: WORLD_Y, u: { x: -1, y: 0, z: 0 }, v: WORLD_Z },
  right: { normal: WORLD_X, u: WORLD_Y, v: WORLD_Z },
  left: { normal: { x: -1, y: 0, z: 0 }, u: { x: 0, y: -1, z: 0 }, v: WORLD_Z },
}

const FACES = Object.keys(FACE_AXES) as ViewCubeFace[]

/** The share of a face, at each side, its edge and corner zones take. */
const BAND = 0.3

/** Half the box the cube and its compass are drawn in, in cube units (the cube's half side is 1). */
const BOX_HALF = 2

/** The compass ring's radius, round the cube's foot. */
const COMPASS_RADIUS = 1.55

/** Below this a camera direction is taken as a part's. */
const SAME_DIRECTION = 1e-6

/** The integer direction a part's name stands for, e.g. `top-left-front` → (-1, -1, 1). */
function partVector(part: ViewCubePart): Vec3 | null {
  let x = 0
  let y = 0
  let z = 0
  for (const name of part.split("-")) {
    switch (name) {
      case "top":
        z = 1
        break
      case "bottom":
        z = -1
        break
      case "left":
        x = -1
        break
      case "right":
        x = 1
        break
      case "front":
        y = -1
        break
      case "back":
        y = 1
        break
      default:
        return null
    }
  }
  return x === 0 && y === 0 && z === 0 ? null : { x, y, z }
}

function partName(vector: Vec3): ViewCubePart {
  const names: string[] = []
  if (vector.z > 0) names.push("top")
  if (vector.z < 0) names.push("bottom")
  if (vector.x < 0) names.push("left")
  if (vector.x > 0) names.push("right")
  if (vector.y < 0) names.push("front")
  if (vector.y > 0) names.push("back")
  return names.join("-")
}

/** All 26: the six faces, the twelve edges, the eight corners. */
export const VIEW_CUBE_PARTS: readonly ViewCubePart[] = (() => {
  const parts: ViewCubePart[] = []
  for (const z of [1, 0, -1]) {
    for (const x of [-1, 0, 1]) {
      for (const y of [-1, 0, 1]) {
        if (x !== 0 || y !== 0 || z !== 0) parts.push(partName({ x, y, z }))
      }
    }
  }
  return parts
})()

export function isViewCubePart(part: string): part is ViewCubePart {
  return partVector(part) !== null
}

export function isFace(part: ViewCubePart): part is ViewCubeFace {
  return (FACES as readonly string[]).includes(part)
}

/**
 * The view a part shows: from its direction, the frame's Z drawn up, as -VIEW
 * shows a preset (Top with the X to the right, Bottom to the left).
 */
export function partView(part: ViewCubePart): CubeView | null {
  const vector = partVector(part)
  const direction = vector && normalize3(vector)
  if (!direction) return null
  return { direction, right: uprightRight(direction) }
}

/** The direction drawn right when the frame's Z is kept up, as -VIEW's presets. */
function uprightRight(direction: Vec3): Vec3 {
  return arbitraryAxis(direction)?.x ?? WORLD_X
}

/** The part a camera direction looks along, if it is one of the 26. */
export function partAt(direction: Vec3): ViewCubePart | null {
  for (const part of VIEW_CUBE_PARTS) {
    const view = partView(part)!
    if (
      Math.abs(view.direction.x - direction.x) < SAME_DIRECTION &&
      Math.abs(view.direction.y - direction.y) < SAME_DIRECTION &&
      Math.abs(view.direction.z - direction.z) < SAME_DIRECTION
    ) {
      return part
    }
  }
  return null
}

/** The part whose view lies within `degrees` of `direction`, nearest first. */
function nearestPart(direction: Vec3, degrees: number): ViewCubePart | null {
  let best: ViewCubePart | null = null
  let bestCos = Math.cos((degrees * Math.PI) / 180)
  for (const part of VIEW_CUBE_PARTS) {
    const cos = dot3(partView(part)!.direction, direction)
    if (cos >= bestCos) {
      best = part
      bestCos = cos
    }
  }
  return best
}

/** The face view turned a quarter about the line of sight, as the roll arrows turn it. */
export function rolledView(camera: CubeCamera, turn: ViewCubeRoll): CubeView {
  return {
    direction: camera.direction,
    right: turn === "clockwise" ? camera.up : scale3(camera.up, -1),
  }
}

/**
 * The face next to the one viewed, on the side of the screen a triangle
 * points to. A side face comes upright ("keep scene upright"); the top or
 * the bottom keeps the way it was rolled over to.
 */
export function adjacentView(camera: CubeCamera, side: ViewCubeSide): CubeView {
  const { direction, right, up } = camera
  const next: CubeView =
    side === "up"
      ? { direction: up, right }
      : side === "down"
        ? { direction: scale3(up, -1), right }
        : side === "right"
          ? { direction: right, right: scale3(direction, -1) }
          : { direction: scale3(right, -1), right: direction }
  const part = partNearest(next.direction)
  const exact = partView(part)!
  if (Math.abs(exact.direction.z) < 0.5) return exact
  return { direction: exact.direction, right: snapAxis(next.right) }
}

/** The part a direction is nearest, however far. */
function partNearest(direction: Vec3): ViewCubePart {
  return nearestPart(direction, 180)!
}

/** A direction rounded onto the nearest axis of the frame. */
function snapAxis(v: Vec3): Vec3 {
  const ax = Math.abs(v.x)
  const ay = Math.abs(v.y)
  const az = Math.abs(v.z)
  if (ax >= ay && ax >= az) return { x: Math.sign(v.x), y: 0, z: 0 }
  if (ay >= az) return { x: 0, y: Math.sign(v.y), z: 0 }
  return { x: 0, y: 0, z: Math.sign(v.z) }
}

/** North on the compass: the WCS's Y (NORTHDIRECTION 0) laid in the frame's XY plane. */
export function compassNorth(axes: Axes3): Vec3 {
  const y = worldToAxes(axes, WORLD_Y)
  return normalize3({ x: y.x, y: y.y, z: 0 }) ?? WORLD_Y
}

function compassDirection(letter: CompassLetter, north: Vec3): Vec3 {
  const east = { x: north.y, y: -north.x, z: 0 }
  switch (letter) {
    case "N":
      return north
    case "S":
      return scale3(north, -1)
    case "E":
      return east
    case "W":
      return scale3(east, -1)
  }
}

/**
 * Looking level from a point of the compass, upright: the viewer stands at
 * that letter, whatever the view was — S from the plan and from SW Isometric
 * alike look along VIEWDIR 0,-1,0 (desktop view/d05).
 */
export function compassView(letter: CompassLetter, north: Vec3): CubeView {
  const toward = compassDirection(letter, north)
  return { direction: toward, right: normalize3(cross3(WORLD_Z, toward))! }
}

/** The axes of the cube's frame: the current UCS's. */
export function cubeAxes(ucs: Ucs): Axes3 {
  return { x: ucs.xAxis, y: ucs.yAxis, z: ucsZAxis(ucs) }
}

/** The ViewCube as `camera` sees it, projected into its 0–1 box. */
export function buildViewCubeUi(
  camera: CubeCamera,
  north: Vec3,
  visible: boolean
): ViewCubeUi {
  const { direction, right, up } = camera
  const box = (p: Vec3): Vec2 => ({
    x: (dot3(p, right) + BOX_HALF) / (2 * BOX_HALF),
    y: (BOX_HALF - dot3(p, up)) / (2 * BOX_HALF),
  })

  const faces: (ViewCubeFaceUi & { depth: number })[] = []
  for (const face of FACES) {
    const { normal, u, v } = FACE_AXES[face]
    const depth = dot3(normal, direction)
    if (depth <= SAME_DIRECTION) continue
    const at = (s: number, t: number) =>
      box(add3(normal, add3(scale3(u, s), scale3(v, t))))
    const cuts = [-1, -1 + 2 * BAND, 1 - 2 * BAND, 1]
    const zones: ViewCubeZone[] = []
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const vector = add3(normal, add3(scale3(u, i - 1), scale3(v, j - 1)))
        zones.push({
          part: partName(vector),
          points: [
            at(cuts[i], cuts[j]),
            at(cuts[i + 1], cuts[j]),
            at(cuts[i + 1], cuts[j + 1]),
            at(cuts[i], cuts[j + 1]),
          ],
        })
      }
    }
    const topLeft = at(-1, 1)
    const topRight = at(1, 1)
    const bottomLeft = at(-1, -1)
    faces.push({
      face,
      zones,
      label: [
        topRight.x - topLeft.x,
        topRight.y - topLeft.y,
        bottomLeft.x - topLeft.x,
        bottomLeft.y - topLeft.y,
        topLeft.x,
        topLeft.y,
      ],
      depth,
    })
  }
  faces.sort((a, b) => a.depth - b.depth)

  const current = partAt(direction)
  return {
    visible,
    faces: faces.map(({ face, zones, label }) => ({ face, zones, label })),
    compass: compassUi(camera, north, box),
    current,
    faceView: current !== null && isFace(current),
  }
}

function compassUi(
  camera: CubeCamera,
  north: Vec3,
  box: (p: Vec3) => Vec2
): ViewCubeCompassUi {
  const foot: Vec3 = { x: 0, y: 0, z: -1 }
  const center = box(foot)
  // The ring is the circle's image: an ellipse whose axes are the principal
  // ones of the two projected radii.
  const scale = COMPASS_RADIUS / (2 * BOX_HALF)
  const a = { x: camera.right.x * scale, y: -camera.up.x * scale }
  const b = { x: camera.right.y * scale, y: -camera.up.y * scale }
  const xx = a.x * a.x + b.x * b.x
  const yy = a.y * a.y + b.y * b.y
  const xy = a.x * a.y + b.x * b.y
  const half = Math.hypot((xx - yy) / 2, xy)
  const mean = (xx + yy) / 2
  const letters = (["N", "E", "S", "W"] as const).map((letter) => ({
    letter,
    at: box(
      add3(foot, scale3(compassDirection(letter, north), COMPASS_RADIUS))
    ),
  }))
  return {
    center,
    rx: Math.sqrt(mean + half),
    ry: Math.sqrt(Math.max(0, mean - half)),
    rotation: (Math.atan2(2 * xy, xx - yy) * 90) / Math.PI,
    letters,
  }
}
