import { Vec2, V } from "../geometry/Vec2"
import {
  bulgeToArc,
  closestPointOnArc,
  closestPointOnSegment,
  normalizeAngle,
  polarPoint,
} from "../geometry/primitives"
import { PolylineEntity } from "./entityTypes"
import { createPolyline } from "./entityFactories"

/** The bulge of the segment starting at vertex `index` (0 = straight). */
export function polylineBulge(poly: PolylineEntity, index: number): number {
  return poly.bulges?.[index] ?? 0
}

/**
 * The concrete geometry of each polyline segment: a straight `line`, or an
 * `arc` when the segment carries a bulge. Ordered like {@link polylineSegments}
 * (the closing segment last, when closed). This is the single source of truth
 * that rendering, bounds, hit-testing and explode all read, so arcs are handled
 * uniformly wherever a polyline is walked segment by segment.
 */
export type PolylineSegmentGeometry =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | {
      readonly kind: "arc"
      readonly a: Vec2
      readonly b: Vec2
      readonly bulge: number
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }

export function polylineSegmentGeometries(
  poly: PolylineEntity
): PolylineSegmentGeometry[] {
  return segmentGeometries(polylineSegments(poly), poly.bulges)
}

/**
 * The segment geometry of a chord list — shared by polylines and by hatch
 * boundary loops, which are the same shape without being the same entity.
 */
export function segmentGeometries(
  segments: readonly [Vec2, Vec2][],
  bulges: readonly number[] | undefined
): PolylineSegmentGeometry[] {
  const out: PolylineSegmentGeometry[] = []
  for (let i = 0; i < segments.length; i++) {
    const [a, b] = segments[i]
    const bulge = bulges?.[i] ?? 0
    if (bulge === 0 || V.equals(a, b)) {
      out.push({ kind: "line", a, b })
      continue
    }
    const arc = bulgeToArc(a, b, bulge)
    out.push({ kind: "arc", a, b, bulge, ...arc })
  }
  return out
}

/**
 * The polyline's segments as `[from, to]` chord pairs, including the closing
 * segment (last→first) when the polyline is closed. Note these are chords: a
 * segment with a bulge is an arc between the two points (see
 * {@link polylineSegmentGeometries}).
 */
export function polylineSegments(poly: PolylineEntity): [Vec2, Vec2][] {
  const segments: [Vec2, Vec2][] = []
  const { vertices } = poly
  for (let i = 0; i < vertices.length - 1; i++) {
    segments.push([vertices[i], vertices[i + 1]])
  }
  if (poly.closed && vertices.length > 2) {
    segments.push([vertices[vertices.length - 1], vertices[0]])
  }
  return segments
}

/** The index of the segment nearest `point`, the first of two as near. */
export function nearestPolylineSegment(
  poly: PolylineEntity,
  point: Vec2
): number {
  const segments = polylineSegmentGeometries(poly)
  let best = 0
  let bestDistance = Infinity
  segments.forEach((segment, i) => {
    const distance =
      segment.kind === "line"
        ? closestPointOnSegment(segment.a, segment.b, point).distance
        : closestPointOnArc(
            segment.center,
            segment.radius,
            segment.startAngle,
            segment.endAngle,
            point
          ).distance
    if (distance < bestDistance) {
      bestDistance = distance
      best = i
    }
  })
  return best
}

/**
 * How far along `segment` the point nearest `point` lies, from 0 at its
 * start to 1 at its end — an arc's by its sweep.
 */
export function fractionAlongSegment(
  segment: PolylineSegmentGeometry,
  point: Vec2
): number {
  if (segment.kind === "line") {
    const along = V.sub(segment.b, segment.a)
    const lengthSq = V.lengthSq(along)
    if (lengthSq === 0) return 0
    const t = V.dot(V.sub(point, segment.a), along) / lengthSq
    return Math.min(1, Math.max(0, t))
  }
  const phi = 4 * Math.atan(segment.bulge)
  const start = Math.atan2(
    segment.a.y - segment.center.y,
    segment.a.x - segment.center.x
  )
  const at = Math.atan2(point.y - segment.center.y, point.x - segment.center.x)
  const f = normalizeAngle((at - start) * Math.sign(phi)) / Math.abs(phi)
  if (f <= 1) return f
  // Past the sweep: the end of it the point lies nearer round the circle.
  return f - 1 < (2 * Math.PI) / Math.abs(phi) - f ? 1 : 0
}

/**
 * The polyline's parameter at the point of it nearest `point`: the nearest
 * segment's index plus how far along it, so a vertex's is its index.
 */
export function polylineParamAt(poly: PolylineEntity, point: Vec2): number {
  const i = nearestPolylineSegment(poly, point)
  return i + fractionAlongSegment(polylineSegmentGeometries(poly)[i], point)
}

const SPAN_EPS = 1e-9

/**
 * The run of `poly` between two of its parameters, `from` before `to`: the
 * points met on the way and the bulges between them, a cut arc segment
 * keeping its centre and radius. Round a closed polyline `to` may pass its
 * last segment and go on from the start. TRIM and BREAK cut polylines with
 * it.
 */
export function polylineSpan(
  poly: PolylineEntity,
  from: number,
  to: number
): { vertices: Vec2[]; bulges: number[] } {
  const segments = polylineSegmentGeometries(poly)
  const count = segments.length
  const segmentAt = (i: number) => segments[i % count]
  const first = Math.min(Math.floor(from + SPAN_EPS), count - 1)
  const vertices = [pointAlongSegment(segmentAt(first), from - first)]
  const bulges: number[] = []
  let t = from
  while (to - t > SPAN_EPS) {
    const i = Math.floor(t + SPAN_EPS)
    const next = Math.min(i + 1, to)
    const segment = segmentAt(i)
    const f0 = Math.max(0, t - i)
    const f1 = next - i
    // A whole segment keeps its own bulge, a part the bulge of its sweep.
    bulges.push(
      segment.kind === "line"
        ? 0
        : f1 - f0 > 1 - SPAN_EPS
          ? segment.bulge
          : Math.tan((f1 - f0) * Math.atan(segment.bulge))
    )
    vertices.push(pointAlongSegment(segment, f1))
    t = next
  }
  return { vertices, bulges }
}

/** The point a fraction `f` along `segment`, its own vertex at either end. */
function pointAlongSegment(segment: PolylineSegmentGeometry, f: number): Vec2 {
  if (f <= SPAN_EPS) return { x: segment.a.x, y: segment.a.y }
  if (f >= 1 - SPAN_EPS) return { x: segment.b.x, y: segment.b.y }
  if (segment.kind === "line") {
    return V.add(segment.a, V.scale(V.sub(segment.b, segment.a), f))
  }
  const start = Math.atan2(
    segment.a.y - segment.center.y,
    segment.a.x - segment.center.x
  )
  return polarPoint(
    segment.center,
    segment.radius,
    start + f * 4 * Math.atan(segment.bulge)
  )
}

/** Total length of a polyline's outline (world units), arcs included. */
export function polylineLength(poly: PolylineEntity): number {
  let total = 0
  for (const seg of polylineSegmentGeometries(poly)) {
    if (seg.kind === "line") {
      total += V.distance(seg.a, seg.b)
    } else {
      let sweep = normalizeAngle(seg.endAngle - seg.startAngle)
      if (sweep < 1e-9) sweep = Math.PI * 2
      total += seg.radius * sweep
    }
  }
  return total
}

/**
 * The enclosed area of a polyline, treated as implicitly closed: the signed
 * shoelace of the vertices plus each bulged segment's circular-segment area
 * (positive when the arc bows outward, negative when it bows in), then made
 * positive. Straight closed polylines reduce to the plain polygon area.
 */
export function polylineArea(poly: PolylineEntity): number {
  const v = poly.vertices
  const n = v.length
  if (n < 3) return 0
  let signed = 0
  for (let i = 0; i < n; i++) {
    const a = v[i]
    const b = v[(i + 1) % n]
    signed += a.x * b.y - b.x * a.y
  }
  signed /= 2
  const segments = polylineSegments(poly)
  for (let i = 0; i < segments.length; i++) {
    const bulge = polylineBulge(poly, i)
    if (bulge === 0) continue
    const [p0, p1] = segments[i]
    const chord = V.distance(p0, p1)
    if (chord < 1e-12) continue
    const theta = 4 * Math.atan(bulge)
    const halfSin = Math.sin(theta / 2)
    if (Math.abs(halfSin) < 1e-12) continue
    const radiusSq = (chord * chord) / (4 * halfSin * halfSin)
    signed += (radiusSq / 2) * (theta - Math.sin(theta))
  }
  return Math.abs(signed)
}

/**
 * Returns a copy of `poly` with the vertex at `index` moved to `point`
 * (preserves its id) — the building block of polyline vertex grip editing.
 */
export function replacePolylineVertex(
  poly: PolylineEntity,
  index: number,
  point: Vec2
): PolylineEntity {
  const vertices = poly.vertices.map((v, i) =>
    i === index ? { x: point.x, y: point.y } : v
  )
  return { ...poly, vertices }
}

/**
 * Returns a copy of `poly` with a new vertex inserted at `point`, splitting
 * segment `segmentIndex` in two (preserves its id) — the building block of the
 * "add vertex" midpoint grip. Both resulting sub-segments are straight, which
 * is why the grip only offers this on straight segments.
 */
export function insertPolylineVertex(
  poly: PolylineEntity,
  segmentIndex: number,
  point: Vec2
): PolylineEntity {
  const vertices = poly.vertices.slice()
  // For the closing segment of a closed polyline `segmentIndex` is the last
  // segment, so the new vertex is appended (splice at length); for any other
  // segment it lands between the segment's two vertices.
  vertices.splice(segmentIndex + 1, 0, { x: point.x, y: point.y })
  let bulges: number[] | undefined
  if (poly.bulges) {
    bulges = poly.bulges.slice()
    bulges.splice(segmentIndex, 1, 0, 0) // both halves are straight
  }
  return reshaped(poly, vertices, bulges)
}

/**
 * Returns a copy of `poly` with the vertex at `index` removed, merging its two
 * adjacent segments into one straight segment (preserves its id). Returns
 * `null` when the removal would leave too few vertices — an open polyline needs
 * at least two, a closed one at least three.
 */
export function removePolylineVertex(
  poly: PolylineEntity,
  index: number
): PolylineEntity | null {
  const n = poly.vertices.length
  if (n <= (poly.closed ? 3 : 2)) return null
  const vertices = poly.vertices.filter((_, i) => i !== index)
  const bulges = poly.bulges ? removeBulgeForVertex(poly, index) : undefined
  return reshaped(poly, vertices, bulges)
}

/** Rebuilds the bulge array after dropping vertex `index`, straightening the
 * segment that spans the gap. */
function removeBulgeForVertex(poly: PolylineEntity, index: number): number[] {
  const bulges = (poly.bulges ?? []).slice()
  const n = poly.vertices.length
  if (poly.closed) {
    // Closed: one segment per vertex; vertex `index` joins segment (index-1)
    // (incoming) and segment `index` (outgoing). Straighten the incoming one
    // and drop the outgoing one — their merger spans the removed vertex.
    const inSeg = (index - 1 + n) % n
    bulges[inSeg] = 0
    bulges.splice(index, 1)
    return bulges
  }
  // Open: n-1 segments. Removing an end vertex drops its single segment; an
  // interior vertex merges its two segments into one straight segment.
  if (index === 0) {
    bulges.splice(0, 1)
  } else if (index === n - 1) {
    bulges.splice(n - 2, 1)
  } else {
    bulges[index - 1] = 0
    bulges.splice(index, 1)
  }
  return bulges
}

/**
 * Returns a copy of `poly` with the bulge of segment `segmentIndex` set to
 * `bulge` (preserves its id) — the building block of the arc-segment curvature
 * grip. A negligible bulge is stored as straight.
 */
export function setPolylineBulge(
  poly: PolylineEntity,
  segmentIndex: number,
  bulge: number
): PolylineEntity {
  const segCount = polylineSegments(poly).length
  const bulges = new Array<number>(segCount).fill(0)
  if (poly.bulges) {
    for (let i = 0; i < segCount; i++) bulges[i] = poly.bulges[i] ?? 0
  }
  bulges[segmentIndex] = Math.abs(bulge) < 1e-9 ? 0 : bulge
  return reshaped(poly, poly.vertices, bulges)
}

/**
 * `poly` with other vertices and bulges and everything else kept — its
 * overrides, plane and thickness. The factory still normalises the bulges.
 */
function reshaped(
  poly: PolylineEntity,
  vertices: readonly Vec2[],
  bulges: readonly number[] | undefined
): PolylineEntity {
  const fresh = createPolyline(
    vertices,
    poly.closed,
    poly.layerId,
    bulges,
    poly.id
  )
  const copy: Record<string, unknown> = { ...poly, ...fresh }
  if (!fresh.bulges) delete copy.bulges
  return copy as unknown as PolylineEntity
}
