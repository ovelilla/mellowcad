import { Vec2, V } from "../geometry/Vec2"
import {
  bulgeToArc,
  closestPointOnArc,
  closestPointOnSegment,
  normalizeAngle,
  polarPoint,
} from "../geometry/primitives"
import {
  arcThroughBulge,
  segmentExitTangent,
  tangentArcBulge,
} from "../geometry/bulgeArcs"
import { PolylineEntity, PolylineWidth } from "./entityTypes"
import { createPolyline } from "./entityFactories"
import {
  curveIndexOf,
  polylineCurve,
  polylineRefitted,
  withFitParts,
} from "./polylineFits"

/** The bulge of the segment starting at vertex `index` (0 = straight). */
export function polylineBulge(poly: PolylineEntity, index: number): number {
  return poly.bulges?.[index] ?? 0
}

const NO_WIDTH: PolylineWidth = [0, 0]

/** The starting and ending width of segment `index`. */
export function polylineWidth(
  poly: PolylineEntity,
  index: number
): PolylineWidth {
  return poly.widths?.[index] ?? NO_WIDTH
}

/** Whether any segment of `poly` has a width: AutoCAD's wide polyline. */
export function isWidePolyline(poly: PolylineEntity): boolean {
  return poly.widths?.some(([start, end]) => start > 0 || end > 0) ?? false
}

/**
 * The one width every segment starts and ends with — DXF 43, LIST's
 * `Constant width` —, or `null` when they differ.
 */
export function polylineConstantWidth(poly: PolylineEntity): number | null {
  const count = polylineSegments(poly).length
  const [width] = polylineWidth(poly, 0)
  for (let i = 0; i < count; i++) {
    const [start, end] = polylineWidth(poly, i)
    if (start !== width || end !== width) return null
  }
  return width
}

/** `poly` with `widths` (indexed like its segments), none when all are 0. */
export function withPolylineWidths(
  poly: PolylineEntity,
  widths: readonly PolylineWidth[] | undefined
): PolylineEntity {
  return reshaped(poly, poly.vertices, poly.bulges, widths)
}

/**
 * `poly` closed or opened, as the palette's Closed does: closing adds a
 * straight segment from the last vertex to the first and no vertex ("se crea
 * un segmento de línea", help GUID-94C065AB), opening drops it. The closing
 * segment takes the polyline's constant width, if it has one, else none
 * (**unverified**).
 */
export function withPolylineClosed(
  poly: PolylineEntity,
  closed: boolean
): PolylineEntity {
  if (poly.closed === closed) return poly
  const bulges = polylineSegments(poly).map((_, i) => polylineBulge(poly, i))
  const widths = padWidths(poly)
  if (closed) {
    const constant = polylineConstantWidth(poly) ?? 0
    bulges.push(0)
    widths.push([constant, constant])
  } else {
    bulges.pop()
    widths.pop()
  }
  return polylineRefitted(
    reshaped({ ...poly, closed }, poly.vertices, bulges, widths)
  )
}

/** The width segment `index` has a fraction `f` along it. */
export function polylineWidthAt(
  poly: PolylineEntity,
  index: number,
  f: number
): number {
  const [start, end] = polylineWidth(poly, index)
  return start + (end - start) * f
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
  return frameGeometries(polylineCurve(poly))
}

/** The segments of `poly`'s own vertices and bulges, fitted or not: its frame's. */
function frameGeometries(poly: PolylineEntity): PolylineSegmentGeometry[] {
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
  // Two vertices close too: there and back, or a whole circle (p04, p227).
  if (poly.closed && vertices.length > 1) {
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
  const i = nearestPolylineSegment(polylineCurve(poly), point)
  return i + fractionAlongSegment(polylineSegmentGeometries(poly)[i], point)
}

const SPAN_EPS = 1e-9

/**
 * The run of `poly` between two of its parameters, `from` before `to`: the
 * points met on the way and the bulges and widths between them, a cut arc
 * segment keeping its centre and radius and a cut segment its width where it
 * is cut (AutoCAD 2023's console: BREAK and TRIM of a 0→10 taper at a
 * quarter leave 0→2.5). Round a closed polyline `to` may pass its
 * last segment and go on from the start. TRIM and BREAK cut polylines with
 * it.
 */
export function polylineSpan(
  poly: PolylineEntity,
  from: number,
  to: number
): { vertices: Vec2[]; bulges: number[]; widths: PolylineWidth[] } {
  return frameSpan(polylineCurve(poly), from, to)
}

function frameSpan(
  poly: PolylineEntity,
  from: number,
  to: number
): { vertices: Vec2[]; bulges: number[]; widths: PolylineWidth[] } {
  const segments = frameGeometries(poly)
  const count = segments.length
  const segmentAt = (i: number) => segments[i % count]
  const first = Math.min(Math.floor(from + SPAN_EPS), count - 1)
  const vertices = [pointAlongSegment(segmentAt(first), from - first)]
  const bulges: number[] = []
  const widths: PolylineWidth[] = []
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
    const index = i % count
    widths.push([
      polylineWidthAt(poly, index, f0),
      polylineWidthAt(poly, index, f1),
    ])
    vertices.push(pointAlongSegment(segment, f1))
    t = next
  }
  return { vertices, bulges, widths }
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
export function polylineArea(fitted: PolylineEntity): number {
  const poly = polylineCurve(fitted)
  const v = poly.vertices
  const n = v.length
  if (n < 2) return 0
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
 * (preserves its id), every bulge kept: the palette's Vertex X and Y. A grip
 * stretches it with {@link stretchPolylineVertices}.
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
 * `poly` with some vertices moved (index → point), as its grips stretch it:
 * an arc segment with one end moved bends through its old midpoint, one with
 * both ends moved keeps its bulge (desktop pline/d09: a vertex beside a
 * quarter arc, or the straight segment before it stretched, re-bulge the arc
 * from 0.4142 to 0.1702, the arc through its old midpoint).
 */
export function stretchPolylineVertices(
  poly: PolylineEntity,
  moves: ReadonlyMap<number, Vec2>
): PolylineEntity {
  const n = poly.vertices.length
  const vertices = poly.vertices.map((v, i) => {
    const to = moves.get(i)
    return to ? { x: to.x, y: to.y } : v
  })
  const bulges = frameGeometries(poly).map((segment, i) => {
    if (segment.kind === "line") return 0
    const j = (i + 1) % n
    if (moves.has(i) === moves.has(j)) return segment.bulge
    const through = pointAlongSegment(segment, 0.5)
    return arcThroughBulge(vertices[i], through, vertices[j]) ?? 0
  })
  // A Fit is fitted again (STRETCH, pedit/p176); a Spline's curve follows.
  return polylineRefitted(reshaped(poly, vertices, bulges, poly.widths))
}

/**
 * Returns a copy of `poly` with a new vertex inserted at `point`, splitting
 * segment `segmentIndex` in two (preserves its id) — the building block of
 * the grip menus' Add Vertex (not built). Both resulting sub-segments are
 * straight.
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
  let widths: PolylineWidth[] | undefined
  if (poly.widths) {
    // The taper goes on through the new vertex (**unverified**: the console
    // has no grips).
    const [start, end] = polylineWidth(poly, segmentIndex)
    const [a, b] = polylineSegments(poly)[segmentIndex]
    const length = V.distance(a, b)
    const middle =
      length > 0
        ? start + ((end - start) * V.distance(a, point)) / length
        : start
    widths = padWidths(poly)
    widths.splice(segmentIndex, 1, [start, middle], [middle, end])
  }
  return reshaped(poly, vertices, bulges, widths)
}

/**
 * Returns a copy of `poly` with the vertex at `index` removed, merging its two
 * adjacent segments into one straight segment (preserves its id): the grip
 * menu's Remove Vertex (not built). Returns `null` when the removal would
 * leave too few vertices — an open polyline needs at least two, a closed one
 * at least three.
 */
export function removePolylineVertex(
  poly: PolylineEntity,
  index: number
): PolylineEntity | null {
  const n = poly.vertices.length
  if (n <= (poly.closed ? 3 : 2)) return null
  const vertices = poly.vertices.filter((_, i) => i !== index)
  const bulges = poly.bulges ? removeBulgeForVertex(poly, index) : undefined
  const widths = poly.widths ? removeWidthsForVertex(poly, index) : undefined
  return reshaped(poly, vertices, bulges, widths)
}

/**
 * The widths after dropping vertex `index`: the segment spanning the gap
 * keeps the widths of the vertex before it, as removing a vertex of an
 * AcDbPolyline keeps the others' (**unverified**: the console has no grips).
 */
function removeWidthsForVertex(
  poly: PolylineEntity,
  index: number
): PolylineWidth[] {
  const widths = padWidths(poly)
  const n = poly.vertices.length
  if (!poly.closed && index === n - 1) widths.splice(n - 2, 1)
  else widths.splice(index, 1)
  return widths
}

/** A copy of the widths with one entry per segment. */
function padWidths(poly: PolylineEntity): PolylineWidth[] {
  return polylineSegments(poly).map((_, i) => polylineWidth(poly, i))
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
  return reshaped(poly, poly.vertices, bulges, poly.widths)
}

/**
 * `poly` with other vertices, bulges and widths and everything else kept —
 * its overrides, plane and thickness. The factory still normalises them.
 */
function reshaped(
  poly: PolylineEntity,
  vertices: readonly Vec2[],
  bulges: readonly number[] | undefined,
  widths: readonly PolylineWidth[] | undefined
): PolylineEntity {
  const fresh = createPolyline(
    vertices,
    poly.closed,
    poly.layerId,
    bulges,
    poly.id,
    widths
  )
  const copy: Record<string, unknown> = { ...poly, ...fresh }
  if (!fresh.bulges) delete copy.bulges
  if (!fresh.widths) delete copy.widths
  return copy as unknown as PolylineEntity
}

/**
 * PEDIT's Reverse: the vertices the other way, each segment turned round —
 * its bulge negated, its widths swapped —, a closed one from its last vertex
 * round to its first (pedit/p33, p113).
 */
export function polylineReversed(poly: PolylineEntity): PolylineEntity {
  const n = poly.vertices.length
  const widths = padWidths(poly)
  // Segment k of the reversed run is segment n-2-k turned round; a closed
  // one's closing segment stays the closing segment.
  const from = (k: number) => (k <= n - 2 ? n - 2 - k : k)
  const reversed = reshaped(
    poly,
    [...poly.vertices].reverse(),
    widths.map((_, k) => -polylineBulge(poly, from(k))),
    widths.map((_, k) => {
      const [start, end] = widths[from(k)]
      return [end, start] as const
    })
  )
  const fit = poly.fit
  if (!fit) return reversed
  // A Fit's arcs run back the other way (pedit/p166), each tangent turned
  // round (**unverified**).
  const arcs =
    fit.kind === "curve"
      ? widths.map((_, k) => {
          const arc = fit.arcs[from(k)]
          return arc
            ? {
                joint: arc.joint,
                bulges: [-arc.bulges[1], -arc.bulges[0]] as const,
              }
            : null
        })
      : null
  const tangents = fit.tangents
    ?.map((t) => (t === null ? null : normalizeAngle(t + Math.PI)))
    .reverse()
  return withFitParts(reversed, arcs, tangents)
}

/**
 * PEDIT's Close and Open. Closing draws the segment from the last vertex to
 * the first an arc on from the last segment where that is an arc, tangent to
 * it, else straight (pedit/p02, p78, p130, p133), as wide as the last segment
 * ends (**unverified**: AutoCAD gives it the widths the last vertex holds,
 * which nothing stores here; PLINE's and Width's are that width, p34, p78).
 * Opening drops it.
 */
export function polylineClosedByPedit(
  poly: PolylineEntity,
  closed: boolean
): PolylineEntity {
  if (poly.closed === closed) return poly
  if (!closed) return withPolylineClosed(poly, false)
  const n = poly.vertices.length
  const last = n - 2
  const bulges = polylineSegments(poly).map((_, i) => polylineBulge(poly, i))
  const widths = padWidths(poly)
  const lastBulge = polylineBulge(poly, last)
  const exit =
    lastBulge === 0
      ? null
      : segmentExitTangent(poly.vertices[last], poly.vertices[n - 1], lastBulge)
  bulges.push(
    exit
      ? (tangentArcBulge(poly.vertices[n - 1], exit, poly.vertices[0]) ?? 0)
      : 0
  )
  const end = widths[last]?.[1] ?? 0
  widths.push([end, end])
  // A Fit is fitted again closed (pedit/p166).
  return polylineRefitted(
    reshaped({ ...poly, closed: true }, poly.vertices, bulges, widths)
  )
}

/**
 * Edit vertex's Insert: a vertex at `point` after vertex `index`, the
 * segment it splits keeping its bulge and widths up to it and the new one
 * straight, as wide as the split one ends (pedit/p23, p109, p118, p128); after
 * an open polyline's last vertex, a straight segment as wide as the last one
 * ends (p115).
 */
export function polylineVertexInserted(
  poly: PolylineEntity,
  index: number,
  point: Vec2
): PolylineEntity {
  const vertices = poly.vertices.slice()
  vertices.splice(index + 1, 0, { x: point.x, y: point.y })
  const bulges = polylineSegments(poly).map((_, i) => polylineBulge(poly, i))
  const widths = padWidths(poly)
  const end = (widths[index] ?? widths[widths.length - 1])?.[1] ?? 0
  bulges.splice(index + 1, 0, 0)
  widths.splice(index + 1, 0, [end, end])
  const inserted = reshaped(poly, vertices, bulges, widths)
  if (!poly.fit) return inserted
  // A Fit's segment split goes straight, both halves, the rest left as they
  // were (pedit/p153); a Spline's curve follows its frame (p157).
  const arcs = poly.fit.kind === "curve" ? poly.fit.arcs.slice() : null
  arcs?.splice(index, 1, null, null)
  const tangents = poly.fit.tangents?.slice()
  tangents?.splice(index + 1, 0, null)
  return withFitParts(inserted, arcs, tangents)
}

/**
 * Edit vertex's Straighten from vertex `from` to `to`, either way round: the
 * vertices between them dropped and the segment left between them straight,
 * with the widths it had at the lower one (pedit/p26, p27, p73, p129); at
 * one vertex, the arc segment after it straightened (p72, p131).
 */
export function polylineStraightened(
  poly: PolylineEntity,
  from: number,
  to: number
): PolylineEntity {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const segments = polylineSegments(poly).length
  if (lo >= segments) return poly
  const vertices = poly.vertices.filter((_, i) => i <= lo || i >= hi)
  const bulges = polylineSegments(poly).map((_, i) => polylineBulge(poly, i))
  const widths = padWidths(poly)
  const gap = Math.max(hi - lo - 1, 0)
  bulges.splice(lo, gap + 1, 0)
  widths.splice(lo + 1, gap)
  const straightened = reshaped(poly, vertices, bulges, widths)
  if (!poly.fit) return straightened
  // A Fit's arcs between go, the rest stay (pedit/p155).
  const arcs = poly.fit.kind === "curve" ? poly.fit.arcs.slice() : null
  arcs?.splice(lo, gap + 1, null)
  const tangents = poly.fit.tangents?.filter((_, i) => i <= lo || i >= hi)
  return withFitParts(straightened, arcs, tangents)
}

/**
 * Edit vertex's Break between vertices `from` and `to`, either way round: the
 * polyline cut there into the run before the lower one and the run after the
 * higher one, a closed one read from its first vertex round to it again
 * (pedit/p66, p67, p70, p71, p101, p102), each piece that has a segment kept;
 * at one vertex, cut in two there. Null where nothing would be left or the
 * cut is at an end — AutoCAD's `*Invalid*` (p68, p69, p100).
 */
export function polylineBrokenAt(
  poly: PolylineEntity,
  from: number,
  to: number
): { first: PolylineEntity | null; second: PolylineEntity | null } | null {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const end = polylineSegments(poly).length
  if (hi === lo ? lo === 0 || lo >= end : lo === 0 && hi >= end) return null
  const fit = poly.fit
  const piece = (a: number, b: number): PolylineEntity | null => {
    if (b <= a) return null
    const span = frameSpan(poly, a, b)
    const cut = reshaped(
      { ...poly, closed: false },
      span.vertices,
      span.bulges,
      span.widths
    )
    if (!fit) return cut
    const arcs = fit.kind === "curve" ? fit.arcs.slice(a, b) : null
    const tangents = fit.tangents?.slice(a, b + 1)
    return withFitParts(cut, arcs, tangents)
  }
  // The piece from the start is no longer fitted: a Fit's keeps its arcs as
  // vertices of its own, a Spline's is its frame (pedit/p154, p158); the
  // other stays fitted.
  const unfitted = (a: number, b: number): PolylineEntity | null => {
    if (b <= a) return null
    if (fit?.kind !== "curve") {
      const frame = piece(a, b)
      if (!frame) return null
      const copy: Record<string, unknown> = { ...frame }
      delete copy.fit
      return copy as unknown as PolylineEntity
    }
    const curve = polylineCurve(poly)
    const span = frameSpan(curve, curveIndexOf(poly, a), curveIndexOf(poly, b))
    return reshaped(
      { ...curve, closed: false },
      span.vertices,
      span.bulges,
      span.widths
    )
  }
  return { first: unfitted(0, lo), second: piece(hi, end) }
}

/** Edit vertex's Width: the segment after vertex `index` that wide; none after an open one's last. */
export function polylineSegmentWidened(
  poly: PolylineEntity,
  index: number,
  width: PolylineWidth
): PolylineEntity {
  const widths = padWidths(poly)
  if (index >= widths.length) return poly
  widths[index] = width
  return reshaped(poly, poly.vertices, poly.bulges, widths)
}
