import { Vec2 } from "../geometry/Vec2"
import { Vec3, length3, sub3 } from "../geometry/Vec3"
import { closestPointOnSegment } from "../geometry/primitives"
import { Polyline3dEntity } from "./entityTypes"
import { polyline3dCurve, polyline3dFrame } from "./polylineFits"

const LEVEL_TOLERANCE = 1e-9

/**
 * Its straight segments, the closing one last; none for a single vertex. A
 * fitted one's are its curve's.
 */
export function polyline3dSegments(poly: Polyline3dEntity): [Vec3, Vec3][] {
  return frameSegments(polyline3dCurve(poly))
}

function frameSegments(poly: Polyline3dEntity): [Vec3, Vec3][] {
  const { vertices } = poly
  const segments: [Vec3, Vec3][] = []
  for (let i = 0; i < vertices.length - 1; i++) {
    segments.push([vertices[i], vertices[i + 1]])
  }
  if (poly.closed && vertices.length > 2) {
    segments.push([vertices[vertices.length - 1], vertices[0]])
  }
  return segments
}

/** Its length in space, the Properties palette's Length and LIST's (3dpoly/p08). */
export function polyline3dLength(poly: Polyline3dEntity): number {
  let total = 0
  for (const [a, b] of polyline3dSegments(poly)) total += length3(sub3(b, a))
  return total
}

/** Whether every vertex is at one Z: AREA measures only such a one (3dpoly/p15, p16). */
export function isLevelPolyline3d(poly: Polyline3dEntity): boolean {
  const z = poly.vertices[0]?.z ?? 0
  return poly.vertices.every((v) => Math.abs(v.z - z) <= LEVEL_TOLERANCE)
}

/**
 * The point of the polyline under `point` in plan: on the segment nearest it
 * there, at that segment's height (ID's Nearest, 3dpoly/p21).
 */
export function closestPointOnPolyline3d(
  poly: Polyline3dEntity,
  point: Vec2
): Vec3 {
  const segments = polyline3dSegments(poly)
  if (segments.length === 0) return poly.vertices[0]
  let best: Vec3 = poly.vertices[0]
  let bestDistance = Infinity
  for (const [a, b] of segments) {
    const hit = closestPointOnSegment(a, b, point)
    if (hit.distance >= bestDistance) continue
    bestDistance = hit.distance
    best = { ...hit.point, z: a.z + hit.t * (b.z - a.z) }
  }
  return best
}

export function replacePolyline3dVertex(
  poly: Polyline3dEntity,
  index: number,
  point: Vec3
): Polyline3dEntity {
  return {
    ...poly,
    vertices: poly.vertices.map((v, i) =>
      i === index ? { x: point.x, y: point.y, z: point.z } : v
    ),
  }
}

/**
 * Where `point` falls along the polyline as a parameter: the index of the
 * segment nearest it in plan plus how far along that segment, as
 * `polylineParamAt` reads a polyline.
 */
export function polyline3dParamAt(poly: Polyline3dEntity, point: Vec2): number {
  let best = 0
  let bestDistance = Infinity
  polyline3dSegments(poly).forEach(([a, b], i) => {
    const hit = closestPointOnSegment(a, b, point)
    if (hit.distance < bestDistance) {
      bestDistance = hit.distance
      best = i + hit.t
    }
  })
  return best
}

/**
 * The vertices of the run from parameter `from` to `to` (`to` may pass the
 * last segment of a closed one, round past its start), the cut ends at the Z
 * the polyline has there.
 */
export function polyline3dSpan(
  poly: Polyline3dEntity,
  from: number,
  to: number
): Vec3[] {
  return frameSpan(polyline3dCurve(poly), from, to)
}

function frameSpan(poly: Polyline3dEntity, from: number, to: number): Vec3[] {
  const segments = frameSegments(poly)
  const count = segments.length
  if (count === 0) return [...poly.vertices]
  // A closed one's run may go round past its start; an open one's ends at
  // the end of its last segment.
  const last = poly.closed ? count * 2 - 1 : count - 1
  const at = (t: number): Vec3 => {
    const index = Math.min(Math.floor(t), last)
    const [a, b] = segments[index % count]
    const f = t - index
    return {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
      z: a.z + (b.z - a.z) * f,
    }
  }
  const vertices: Vec3[] = [at(from)]
  for (let k = Math.floor(from) + 1; k < to; k++) {
    vertices.push(segments[k % count][0])
  }
  vertices.push(at(to))
  return vertices
}

/** PEDIT's Reverse of a 3D polyline: its vertices the other way, as a polyline's. */
export function polyline3dReversed(poly: Polyline3dEntity): Polyline3dEntity {
  return { ...poly, vertices: [...poly.vertices].reverse() }
}

/** Edit vertex's Insert: a vertex at `point` after vertex `index` (pedit/p30). */
export function polyline3dVertexInserted(
  poly: Polyline3dEntity,
  index: number,
  point: Vec3
): Polyline3dEntity {
  const vertices = poly.vertices.slice()
  vertices.splice(index + 1, 0, { x: point.x, y: point.y, z: point.z })
  return { ...poly, vertices }
}

/** Edit vertex's Straighten: the vertices between `from` and `to` dropped, as a polyline's. */
export function polyline3dStraightened(
  poly: Polyline3dEntity,
  from: number,
  to: number
): Polyline3dEntity {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  if (hi - lo < 2) return poly
  return {
    ...poly,
    vertices: poly.vertices.filter((_, i) => i <= lo || i >= hi),
  }
}

/**
 * Edit vertex's Break of a 3D polyline, by a polyline's rules (pedit/p111):
 * the runs before the lower vertex and after the higher, a closed one read
 * round to its first vertex again; null where it cuts nothing off.
 */
export function polyline3dBrokenAt(
  poly: Polyline3dEntity,
  from: number,
  to: number
): { first: Polyline3dEntity | null; second: Polyline3dEntity | null } | null {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const end = frameSegments(poly).length
  if (hi === lo ? lo === 0 || lo >= end : lo === 0 && hi >= end) return null
  const piece = (a: number, b: number): Polyline3dEntity | null =>
    b <= a ? null : { ...poly, closed: false, vertices: frameSpan(poly, a, b) }
  // The piece from the start is its frame, the other stays fitted (as a
  // polyline's, pedit/p158).
  const first = piece(0, lo)
  return { first: first && polyline3dFrame(first), second: piece(hi, end) }
}
