import { Vec2, V } from "../geometry/Vec2"
import { bulgeToArc, normalizeAngle } from "../geometry/primitives"
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
  return createPolyline(vertices, poly.closed, poly.layerId, bulges, poly.id)
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
  return createPolyline(vertices, poly.closed, poly.layerId, bulges, poly.id)
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
  return createPolyline(
    poly.vertices,
    poly.closed,
    poly.layerId,
    bulges,
    poly.id
  )
}
