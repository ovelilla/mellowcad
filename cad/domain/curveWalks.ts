import { Vec2, V } from "../geometry/Vec2"
import { Vec3, add3, length3, scale3, sub3 } from "../geometry/Vec3"
import { axesToWorld } from "../geometry/ocs"
import { bsplinePoint } from "../geometry/nurbs"
import { polarPoint } from "../geometry/primitives"
import type { Entity } from "./entityTypes"
import {
  entityAxes,
  entityElevation,
  isTilted,
  lineEndZ,
  lineStartZ,
} from "./elevation"
import { ellipseLengthTable, ellipsePointAt, isFullEllipse } from "./ellipses"
import { polylineSegmentGeometries } from "./polylines"
import { polyline3dSegments } from "./polylines3d"
import { entityShape } from "./polylineFits"
import { splineLengthTable } from "./splines"

/** A stretch shorter than this has no length to walk. */
const WALK_EPS = 1e-9

/** How finely a curve is sampled to find how far along it a pick lies. */
const ALONG_SAMPLES = 512

/** A place on a curve: in the drawing's coordinates, and the plan direction the curve runs there. */
export interface CurveStation {
  readonly point: Vec3
  /** Radians CCW from X, of the curve's own way (start to end) seen in plan. */
  readonly direction: number
}

/**
 * A curve walked by length from its start, as DIVIDE and MEASURE walk it:
 * in space (a 3D polyline's, a rising line's length, divide/p08), each place
 * in the drawing's coordinates.
 */
export interface CurveWalk {
  readonly length: number
  readonly closed: boolean
  at(distance: number): CurveStation
  /** How far along the curve its place nearest `point`, in plan, lies. */
  along(point: Vec2): number
}

interface Piece {
  readonly length: number
  at(t: number): Vec3
  /** The way it runs at `t`, in its own coordinates. */
  tangent(t: number): Vec3
}

/**
 * The walk DIVIDE and MEASURE take along `entity`: a line, an arc, a circle
 * (from `circleStart`, counter-clockwise: SNAPANG's angle, divide/p04), an
 * ellipse or elliptical arc, a polyline (its curve if fitted), a 3D polyline
 * or a spline, each from its own start. Null for any other object (`Cannot
 * divide that object.`, divide/p07) or one of no length.
 */
export function curveWalk(drawn: Entity, circleStart = 0): CurveWalk | null {
  const entity = entityShape(drawn)
  const pieces = curvePieces(entity, circleStart)
  if (pieces === null) return null
  const length = pieces.reduce((sum, piece) => sum + piece.length, 0)
  if (length < WALK_EPS) return null
  const axes =
    isTilted(entity) && entity.type !== "line" ? entityAxes(entity) : null
  const toWorld = (p: Vec3): Vec3 => (axes ? axesToWorld(axes, p) : p)
  const direction = (v: Vec3): number => {
    const world = axes
      ? sub3(axesToWorld(axes, v), axesToWorld(axes, ORIGIN))
      : v
    return Math.atan2(world.y, world.x)
  }
  // Where each piece starts along the curve, searched by halves: DIVIDE's
  // 32767 points on a polyline of thousands of segments stay linear.
  const starts: number[] = []
  let sum = 0
  for (const piece of pieces) {
    starts.push(sum)
    sum += piece.length
  }
  const at = (distance: number): CurveStation => {
    const d = Math.min(Math.max(distance, 0), length)
    let lo = 0
    let hi = pieces.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] < d) lo = mid
      else hi = mid - 1
    }
    const piece = pieces[lo]
    const rest = d - starts[lo]
    const t = piece.length > 0 ? Math.min(rest / piece.length, 1) : 0
    return {
      point: toWorld(piece.at(t)),
      direction: direction(piece.tangent(t)),
    }
  }
  return {
    length,
    closed: isClosed(entity),
    at,
    along(point: Vec2): number {
      let best = 0
      let bestDistance = Infinity
      for (let i = 0; i <= ALONG_SAMPLES; i++) {
        const distance = (length * i) / ALONG_SAMPLES
        const d = V.distance(point, at(distance).point)
        if (d < bestDistance) {
          bestDistance = d
          best = distance
        }
      }
      return best
    },
  }
}

const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 }

function isClosed(entity: Entity): boolean {
  switch (entity.type) {
    case "circle":
      return true
    case "ellipse":
      return isFullEllipse(entity)
    case "polyline":
    case "polyline3d":
    case "spline":
      return entity.closed
    default:
      return false
  }
}

function curvePieces(entity: Entity, circleStart: number): Piece[] | null {
  const z = entityElevation(entity)
  const flat = (p: Vec2): Vec3 => ({ x: p.x, y: p.y, z })
  switch (entity.type) {
    case "line":
      return [
        segment(
          { ...entity.start, z: lineStartZ(entity) },
          { ...entity.end, z: lineEndZ(entity) }
        ),
      ]
    case "circle":
      return [
        arcPiece(entity.center, entity.radius, circleStart, 2 * Math.PI, z),
      ]
    case "arc": {
      let sweep = (entity.endAngle - entity.startAngle) % (2 * Math.PI)
      if (sweep <= WALK_EPS) sweep += 2 * Math.PI
      return [
        arcPiece(entity.center, entity.radius, entity.startAngle, sweep, z),
      ]
    }
    case "ellipse": {
      const table = ellipseLengthTable(entity)
      const minor = V.scale(V.perpendicular(entity.majorAxis), entity.ratio)
      return [
        {
          length: table.length,
          at: (t) =>
            flat(ellipsePointAt(entity, table.paramAt(t * table.length))),
          tangent: (t) => {
            const u = table.paramAt(t * table.length)
            const d = V.add(
              V.scale(entity.majorAxis, -Math.sin(u)),
              V.scale(minor, Math.cos(u))
            )
            return { x: d.x, y: d.y, z: 0 }
          },
        },
      ]
    }
    case "polyline":
      return polylineSegmentGeometries(entity).map((s) =>
        s.kind === "line"
          ? segment(flat(s.a), flat(s.b))
          : arcPiece(
              s.center,
              s.radius,
              Math.atan2(s.a.y - s.center.y, s.a.x - s.center.x),
              4 * Math.atan(s.bulge),
              z
            )
      )
    case "polyline3d":
      return polyline3dSegments(entity).map(([a, b]) => segment(a, b))
    case "spline": {
      const table = splineLengthTable(entity)
      const point = (t: number) =>
        bsplinePoint(table.curve, table.paramAt(t * table.length))
      // WHY a difference: the tangent only orients a block, and a spline's
      // derivative by length has no closed form.
      const h = 1e-6
      return [
        {
          length: table.length,
          at: point,
          tangent: (t) =>
            sub3(point(Math.min(t + h, 1)), point(Math.max(t - h, 0))),
        },
      ]
    }
    default:
      return null
  }
}

function segment(a: Vec3, b: Vec3): Piece {
  const run = sub3(b, a)
  return {
    length: length3(run),
    at: (t) => add3(a, scale3(run, t)),
    tangent: () => run,
  }
}

/** An arc of `sweep` radians from `start`, counter-clockwise when positive. */
function arcPiece(
  center: Vec2,
  radius: number,
  start: number,
  sweep: number,
  z: number
): Piece {
  return {
    length: radius * Math.abs(sweep),
    at: (t) => ({ ...polarPoint(center, radius, start + t * sweep), z }),
    tangent: (t) => {
      const angle = start + t * sweep + Math.sign(sweep) * (Math.PI / 2)
      return { x: Math.cos(angle), y: Math.sin(angle), z: 0 }
    },
  }
}

/** DIVIDE's limit on its count, and MEASURE's on the points it makes (divide/p06). */
export const MAX_DIVISIONS = 32767

/**
 * Where DIVIDE puts its `count - 1` points on an open curve, `count` on a
 * closed one, its start among them (divide/p01, p03, p04, p11): equal lengths
 * from its start.
 */
export function divideDistances(walk: CurveWalk, count: number): number[] {
  const step = walk.length / count
  const out: number[] = []
  for (let k = walk.closed ? 0 : 1; k < count; k++) out.push(k * step)
  return out
}

/**
 * Where MEASURE puts its points, `step` apart from where it starts, as far
 * along as one fits, the far end too when the length is a whole number of
 * steps (divide/p03, p08): from `start` (the end nearer the pick on an open
 * curve; a closed one's own start, run backwards when the pick is past its
 * middle, divide/p11), as distances from the curve's start. `"tooShort"` past
 * its length (`Object isn't that long.`), `"tooMany"` past
 * {@link MAX_DIVISIONS} (`Object is too long.`, divide/p06).
 */
export function measureDistances(
  walk: CurveWalk,
  step: number,
  backwards: boolean
): number[] | "tooShort" | "tooMany" {
  const tolerance = walk.length * 1e-10
  if (step > walk.length + tolerance) return "tooShort"
  const count = Math.floor((walk.length + tolerance) / step)
  if (count > MAX_DIVISIONS) return "tooMany"
  const out: number[] = []
  for (let k = 1; k <= count; k++) {
    const run = Math.min(k * step, walk.length)
    const from = backwards ? walk.length - run : run
    out.push(walk.closed && from >= walk.length ? 0 : from)
  }
  return out
}
