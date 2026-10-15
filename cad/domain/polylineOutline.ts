import { Vec2, V } from "../geometry/Vec2"
import { infiniteLineIntersection, polarPoint } from "../geometry/primitives"
import { PolylineEntity } from "./entityTypes"
import {
  PolylineSegmentGeometry,
  polylineSegmentGeometries,
  polylineWidth,
} from "./polylines"

/**
 * The outline of a wide polyline, in its own plane: what FILLMODE fills and
 * what it outlines when off. Derived every time, never stored.
 */
export interface PolylineOutline {
  /** A closed ring per segment with a width, filled on its own. */
  readonly bands: readonly (readonly Vec2[])[]
  /**
   * The corners filled where a wide arc meets another band at an angle: the
   * vertex, then the outer corner from one band's edge to the other's.
   */
  readonly wedges: readonly (readonly Vec2[])[]
  /** The segments of no width, drawn as their centreline. */
  readonly bare: readonly PolylineSegmentGeometry[]
}

/**
 * How far a mitred corner may reach past its vertex, in half-widths. Two
 * segments folding back on themselves meet ever further away; past this the
 * corner is bevelled instead. A guard against a spike reaching across the
 * drawing, not a rule of AutoCAD's, which mitres every corner it draws.
 */
const MITRE_LIMIT = 50

/** One wide segment: its two edges, left and right of the way it runs. */
interface Band {
  readonly left: Vec2[]
  readonly right: Vec2[]
  readonly line: boolean
  /** Unit tangent where it starts and where it ends. */
  readonly entry: Vec2
  readonly exit: Vec2
  readonly startHalf: number
  readonly endHalf: number
}

/**
 * The outline of `poly`'s widths: each segment's band — the width running
 * from its starting to its ending one along it, an arc's along its sweep —,
 * two straight bands meeting at a mitre, as AutoCAD joins them (a rectangle
 * of width 2 has square outer corners), and an arc meeting another band at an
 * angle closing the outer corner with a wedge reaching where their edges'
 * tangents meet. `tolerance` is the furthest an arc's chords may stray from
 * it, in drawing units.
 */
export function polylineOutline(
  poly: PolylineEntity,
  tolerance: number
): PolylineOutline {
  const segments = polylineSegmentGeometries(poly)
  const bands = segments.map((segment, i) =>
    segmentBand(segment, polylineWidth(poly, i), tolerance)
  )
  const wedges: Vec2[][] = []
  const joints = poly.closed ? segments.length : segments.length - 1
  for (let i = 0; i < joints; i++) {
    const j = (i + 1) % segments.length
    const a = bands[i]
    const b = bands[j]
    if (!a || !b || a.endHalf === 0 || b.startHalf === 0) continue
    const wedge = join(segments[i].b, a, b)
    if (wedge) wedges.push(wedge)
  }
  const rings: Vec2[][] = []
  for (const band of bands) {
    if (band) rings.push([...band.left, ...[...band.right].reverse()])
  }
  return {
    bands: rings,
    wedges,
    bare: segments.filter((_, i) => bands[i] === null),
  }
}

/**
 * Joins two bands meeting at `vertex`. Two straight ones meet where their
 * edges do, both edges moved there; anything else that turns gets the wedge
 * it returns. Tangent bands (a line into its tangent arc) need neither.
 */
function join(vertex: Vec2, a: Band, b: Band): Vec2[] | null {
  const turn = V.cross(a.exit, b.entry)
  if (Math.abs(turn) < 1e-9 && V.dot(a.exit, b.entry) > 0) return null
  const reach = MITRE_LIMIT * Math.max(a.endHalf, b.startHalf)
  if (a.line && b.line) {
    const left = edgeMeeting(a.left, b.left)
    const right = edgeMeeting(a.right, b.right)
    if (
      left &&
      right &&
      V.distance(left, vertex) <= reach &&
      V.distance(right, vertex) <= reach
    ) {
      a.left[1] = b.left[0] = left
      a.right[1] = b.right[0] = right
      return null
    }
  }
  // Turning left opens the corner on the right.
  const [from, to] =
    turn > 0
      ? [a.right[a.right.length - 1], b.right[0]]
      : [a.left[a.left.length - 1], b.left[0]]
  const meet = infiniteLineIntersection(
    from,
    V.add(from, a.exit),
    to,
    V.add(to, b.entry)
  )
  const mitred =
    meet !== null &&
    meet.t > 0 &&
    meet.u < 0 &&
    V.distance(meet.point, vertex) <= reach
  return mitred ? [vertex, from, meet.point, to] : [vertex, from, to]
}

/** Where two straight edges meet, extended. */
function edgeMeeting(a: readonly Vec2[], b: readonly Vec2[]): Vec2 | null {
  return infiniteLineIntersection(a[0], a[1], b[0], b[1])?.point ?? null
}

function segmentBand(
  segment: PolylineSegmentGeometry,
  [start, end]: readonly [number, number],
  tolerance: number
): Band | null {
  if ((start === 0 && end === 0) || V.equals(segment.a, segment.b)) {
    return null
  }
  const startHalf = start / 2
  const endHalf = end / 2
  if (segment.kind === "line") {
    const along = V.normalize(V.sub(segment.b, segment.a))
    const normal = V.perpendicular(along)
    return {
      left: [
        V.add(segment.a, V.scale(normal, startHalf)),
        V.add(segment.b, V.scale(normal, endHalf)),
      ],
      right: [
        V.sub(segment.a, V.scale(normal, startHalf)),
        V.sub(segment.b, V.scale(normal, endHalf)),
      ],
      line: true,
      entry: along,
      exit: along,
      startHalf,
      endHalf,
    }
  }
  const sweep = 4 * Math.atan(segment.bulge)
  const turn = Math.sign(sweep)
  const from = Math.atan2(
    segment.a.y - segment.center.y,
    segment.a.x - segment.center.x
  )
  const outer = segment.radius + Math.max(startHalf, endHalf)
  const steps = arcSteps(outer, Math.abs(sweep), tolerance)
  const left: Vec2[] = []
  const right: Vec2[] = []
  for (let k = 0; k <= steps; k++) {
    const f = k / steps
    const angle = from + sweep * f
    const half = startHalf + (endHalf - startHalf) * f
    // Left of the way a counter-clockwise arc runs is towards its centre.
    const inward = segment.radius - turn * half
    const outward = segment.radius + turn * half
    left.push(polarPoint(segment.center, inward, angle))
    right.push(polarPoint(segment.center, outward, angle))
  }
  const tangent = (angle: number) =>
    V.scale({ x: -Math.sin(angle), y: Math.cos(angle) }, turn)
  return {
    left,
    right,
    line: false,
    entry: tangent(from),
    exit: tangent(from + sweep),
    startHalf,
    endHalf,
  }
}

/** Chords enough for an arc of `radius` to stray at most `tolerance`. */
function arcSteps(radius: number, sweep: number, tolerance: number): number {
  const ratio = tolerance > 0 && radius > 0 ? tolerance / radius : 1
  const step = ratio >= 1 ? Math.PI / 4 : 2 * Math.acos(1 - ratio)
  return Math.min(Math.max(2, Math.ceil(sweep / Math.max(step, 1e-3))), 4096)
}
