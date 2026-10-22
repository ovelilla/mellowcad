import { V, Vec2 } from "../geometry/Vec2"
import {
  circleCircleIntersection,
  closestPointOnSegment,
  infiniteLineIntersection,
  lineCircleIntersectionParams,
  normalizeAngle,
  polarPoint,
} from "../geometry/primitives"
import type { PolylineEntity, PolylineWidth } from "./entityTypes"
import { polylineSegmentGeometries, polylineWidth } from "./polylines"

/**
 * OFFSET of a polyline, AutoCAD's with OFFSETGAPTYPE 0, in the polyline's own
 * plane (its stored points). The standard offset-curve clean-up:
 *
 * 1. each segment is offset (a line shifted, an arc made concentric), a
 *    zero-length one left out first (offset/p194) and an arc that collapses
 *    to its centre or past it dropped (p230, p231);
 * 2. neighbours are joined where they meet, the meeting nearest the source
 *    vertex; where they do not, by an arc on that vertex whose radius is the
 *    distance (p183);
 * 3. that raw offset is cut wherever it crosses itself, and only the pieces at
 *    the full distance from the source, crossing none of it, are kept: a
 *    segment that reversed goes (p187), a pinched outline falls apart (p188);
 * 4. the pieces are stitched back into polylines, in the source's order.
 *
 * Each segment carries its widths, a piece the width where it is cut and a
 * joining arc from the width before it to the width after (offset/p185, p186).
 */

/** The shape of one polyline an offset makes; the caller adds what it wears. */
export interface OffsetPolylineShape {
  readonly vertices: readonly Vec2[]
  readonly closed: boolean
  readonly bulges: readonly number[]
  readonly widths?: readonly PolylineWidth[]
}

/**
 * How many segments one offset will clean up. Cutting the raw offset against
 * itself and checking each piece against the source are both quadratic, and
 * the preview runs them on every move of the cursor; past this the offset is
 * declined rather than the editor frozen (as `traceBoundaryLoops` declines).
 */
const MAX_OFFSET_SEGMENTS = 2000

/**
 * A curve: a line from `a` to `b`, or an arc from `start` sweeping `sweep`
 * radians, counter-clockwise when positive.
 */
type Curve =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly start: number
      readonly sweep: number
    }

/** A curve and its ends as points, shared exactly where two curves meet. */
interface Span {
  readonly curve: Curve
  readonly from: Vec2
  readonly to: Vec2
}

/** A segment of the raw offset, with what its widths and joins need. */
interface Raw extends Span {
  readonly width: PolylineWidth
  /** The source vertices it was offset from (a joining arc's centre twice). */
  readonly sourceFrom: Vec2
  readonly sourceTo: Vec2
}

/** A run of one raw segment, between two of its cuts. */
interface Piece extends Span {
  readonly raw: number
  readonly t0: number
  readonly t1: number
  valid: boolean
}

interface Tolerances {
  /** Two points this close are one. */
  readonly point: number
  /** A cut this close to another or to a segment's end is none. */
  readonly cut: number
}

/**
 * The polylines OFFSET makes of `poly` at `distance` towards `side`, in the
 * order of the source; none when AutoCAD says `Cannot offset that object.`:
 * nothing is left at that distance, or a closed polyline lies on one straight
 * line (offset/p192; a bulged one offsets, p193).
 */
export function offsetPolyline(
  poly: PolylineEntity,
  distance: number,
  side: Vec2
): OffsetPolylineShape[] {
  const sources = sourceSegments(poly)
  if (sources.length === 0 || sources.length > MAX_OFFSET_SEGMENTS) return []
  if (poly.closed && flatOnOneLine(sources)) return []
  const tol = tolerances(poly, distance)
  const left = sideSign(sources, side) * distance
  const offset = offsetSegments(sources, left, tol)
  if (offset.length === 0) return []
  const path = joinSegments(offset, poly.closed, left, tol)

  const pieces = cutPieces(path, poly, distance, tol)
  for (const piece of pieces) {
    piece.valid = atFullDistance(piece, sources, distance, tol)
  }
  const runs = poly.closed
    ? stitchLoops(pieces, tol)
    : stitchChains(pieces, tol)
  return runs.map((run) =>
    shapeOf(run, pieces, path, poly.closed, poly.widths !== undefined)
  )
}

/**
 * How far `point` lies from `poly` with its open ends drawn on along their
 * tangents: OFFSET Through's distance (offset/p211; p212 at a corner).
 */
export function polylineThroughDistance(
  poly: PolylineEntity,
  point: Vec2
): number {
  const sources = sourceSegments(poly)
  let best = Infinity
  for (const source of sources) {
    best = Math.min(
      best,
      V.distance(closestOn(source.curve, point).point, point)
    )
  }
  if (!poly.closed && sources.length > 0) {
    const first = sources[0]
    const last = sources[sources.length - 1]
    const back = V.scale(tangentAt(first.curve, 0), -1)
    best = Math.min(best, rayDistance(first.from, back, point))
    best = Math.min(best, rayDistance(last.to, tangentAt(last.curve, 1), point))
  }
  return best
}

interface Source extends Span {
  readonly width: PolylineWidth
}

/** The polyline's segments as curves, a zero-length one left out. */
function sourceSegments(poly: PolylineEntity): Source[] {
  const out: Source[] = []
  polylineSegmentGeometries(poly).forEach((segment, i) => {
    if (V.distance(segment.a, segment.b) <= 1e-12) return
    const curve: Curve =
      segment.kind === "line"
        ? { kind: "line", a: segment.a, b: segment.b }
        : {
            kind: "arc",
            center: segment.center,
            radius: segment.radius,
            start: angleOf(segment.center, segment.a),
            sweep: 4 * Math.atan(segment.bulge),
          }
    out.push({
      curve,
      from: segment.a,
      to: segment.b,
      width: polylineWidth(poly, i),
    })
  })
  return out
}

function flatOnOneLine(sources: readonly Source[]): boolean {
  if (sources.some((s) => s.curve.kind === "arc")) return false
  const origin = sources[0].from
  const along = V.normalize(V.sub(sources[0].to, origin))
  const scale = Math.max(1, ...sources.map((s) => V.distance(s.to, origin)))
  return sources.every(
    (s) => Math.abs(V.cross(along, V.sub(s.to, origin))) <= 1e-9 * scale
  )
}

function tolerances(poly: PolylineEntity, distance: number): Tolerances {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const v of poly.vertices) {
    minX = Math.min(minX, v.x)
    minY = Math.min(minY, v.y)
    maxX = Math.max(maxX, v.x)
    maxY = Math.max(maxY, v.y)
  }
  const extent = Math.max(1, maxX - minX, maxY - minY, distance)
  // A crossing of two curves near tangency is only good to about the square
  // root of the machine epsilon, hence the looser tolerance for the cuts.
  return { point: 1e-9 * extent, cut: 1e-7 * extent }
}

/**
 * +1 when `side` lies on the left of the polyline where it is nearest, -1 on
 * its right; an arc judged as the arc, inside its circle towards its centre
 * (offset/p226), not as its chord.
 */
function sideSign(sources: readonly Source[], side: Vec2): number {
  let best = Infinity
  let sign = 1
  for (const source of sources) {
    const { point, t } = closestOn(source.curve, side)
    const d = V.distance(point, side)
    if (d < best) {
      best = d
      const across = V.cross(tangentAt(source.curve, t), V.sub(side, point))
      sign = across >= 0 ? 1 : -1
    }
  }
  return sign
}

/**
 * Each segment moved `left` to its left (a negative `left` to its right): a
 * line shifted, an arc concentric, dropped when that takes it to its centre
 * or past (offset/p230, p231).
 */
function offsetSegments(
  sources: readonly Source[],
  left: number,
  tol: Tolerances
): Raw[] {
  const out: Raw[] = []
  for (const source of sources) {
    const { curve } = source
    if (curve.kind === "line") {
      const shift = V.scale(
        V.perpendicular(V.normalize(V.sub(curve.b, curve.a))),
        left
      )
      const a = V.add(curve.a, shift)
      const b = V.add(curve.b, shift)
      out.push({
        curve: { kind: "line", a, b },
        from: a,
        to: b,
        width: source.width,
        sourceFrom: source.from,
        sourceTo: source.to,
      })
      continue
    }
    // An arc's centre is on its left when it runs counter-clockwise.
    const radius = curve.radius - Math.sign(curve.sweep) * left
    if (radius <= tol.point) continue
    const arc = { ...curve, radius }
    out.push({
      curve: arc,
      from: polarPoint(arc.center, radius, arc.start),
      to: polarPoint(arc.center, radius, arc.start + arc.sweep),
      width: source.width,
      sourceFrom: source.from,
      sourceTo: source.to,
    })
  }
  return out
}

/**
 * The raw offset: each segment trimmed or extended to meet the next, or a
 * joining arc between them where they do not meet (OFFSETGAPTYPE 0).
 */
function joinSegments(
  segments: readonly Raw[],
  closed: boolean,
  left: number,
  tol: Tolerances
): Raw[] {
  const raw = segments.slice()
  const n = raw.length
  const gaps: (Raw | null)[] = new Array<Raw | null>(n).fill(null)
  const joints = closed ? n : n - 1
  for (let j = 0; j < joints; j++) {
    const i = j
    const k = (j + 1) % n
    const prev = raw[i]
    const next = raw[k]
    const meet = meeting(prev, next, tol)
    if (meet) {
      raw[i] = withEnd(raw[i], meet)
      raw[k] = withStart(raw[k], meet)
    } else {
      gaps[i] = gapBetween(raw[i], raw[k], left, tol)
    }
  }
  const path: Raw[] = []
  for (let i = 0; i < n; i++) {
    path.push(raw[i])
    const gap = gaps[i]
    if (gap) path.push(gap)
  }
  return path
}

/**
 * Where two consecutive offset segments meet: their shared end, or the
 * meeting of the curves they lie on nearest the source vertex between them.
 */
function meeting(prev: Raw, next: Raw, tol: Tolerances): Vec2 | null {
  if (V.distance(prev.to, next.from) <= tol.cut) return prev.to
  const a = prev.curve
  const b = next.curve
  let points: Vec2[]
  if (a.kind === "line" && b.kind === "line") {
    const x = infiniteLineIntersection(a.a, a.b, b.a, b.b)
    points = x ? [x.point] : []
  } else if (a.kind === "line" && b.kind === "arc") {
    points = lineCirclePoints(a.a, a.b, b.center, b.radius)
  } else if (a.kind === "arc" && b.kind === "line") {
    points = lineCirclePoints(b.a, b.b, a.center, a.radius)
  } else if (a.kind === "arc" && b.kind === "arc") {
    points = circleCircleIntersection(a.center, a.radius, b.center, b.radius)
  } else {
    points = []
  }
  const near = V.midpoint(prev.sourceTo, next.sourceFrom)
  let best: Vec2 | null = null
  for (const p of points) {
    if (!best || V.distance(p, near) < V.distance(best, near)) best = p
  }
  return best
}

/**
 * The arc on the source vertex joining two offset segments that do not meet
 * (offset/p183), turning as the polyline turns there; a straight run where
 * no vertex is shared (an arc between them dropped).
 */
function gapBetween(prev: Raw, next: Raw, left: number, tol: Tolerances): Raw {
  const width: PolylineWidth = [prev.width[1], next.width[0]]
  const vertex = prev.sourceTo
  if (V.distance(vertex, next.sourceFrom) > tol.point) {
    return {
      curve: { kind: "line", a: prev.to, b: next.from },
      from: prev.to,
      to: next.from,
      width,
      sourceFrom: prev.sourceTo,
      sourceTo: next.sourceFrom,
    }
  }
  const start = angleOf(vertex, prev.to)
  let sweep = wrapPi(angleOf(vertex, next.from) - start)
  // Turning straight back, the arc goes round the front of the vertex: from
  // the right-hand side counter-clockwise, from the left clockwise.
  if (Math.abs(Math.abs(sweep) - Math.PI) < 1e-9) {
    sweep = left < 0 ? Math.PI : -Math.PI
  }
  return {
    curve: {
      kind: "arc",
      center: vertex,
      radius: V.distance(vertex, prev.to),
      start,
      sweep,
    },
    from: prev.to,
    to: next.from,
    width,
    sourceFrom: vertex,
    sourceTo: vertex,
  }
}

function withStart(raw: Raw, p: Vec2): Raw {
  const c = raw.curve
  if (c.kind === "line") return { ...raw, curve: { ...c, a: p }, from: p }
  const start = c.start + wrapPi(angleOf(c.center, p) - c.start)
  return {
    ...raw,
    curve: { ...c, start, sweep: c.start + c.sweep - start },
    from: p,
  }
}

function withEnd(raw: Raw, p: Vec2): Raw {
  const c = raw.curve
  if (c.kind === "line") return { ...raw, curve: { ...c, b: p }, to: p }
  const end = c.start + c.sweep
  const moved = end + wrapPi(angleOf(c.center, p) - end)
  return { ...raw, curve: { ...c, sweep: moved - c.start }, to: p }
}

/**
 * The raw offset cut wherever it crosses itself, and an open one where it
 * crosses the circles of the distance round the source's ends, into pieces in
 * its own order.
 */
function cutPieces(
  path: readonly Raw[],
  poly: PolylineEntity,
  distance: number,
  tol: Tolerances
): Piece[] {
  const cuts: { t: number; p: Vec2 }[][] = path.map(() => [])
  const boxes = path.map(boundsOf)
  for (let i = 0; i < path.length; i++) {
    for (let j = i + 1; j < path.length; j++) {
      if (!boxesMeet(boxes[i], boxes[j], tol.cut)) continue
      for (const hit of crossings(path[i], path[j], tol)) {
        cuts[i].push({ t: hit.t, p: hit.p })
        cuts[j].push({ t: hit.u, p: hit.p })
      }
    }
  }
  if (!poly.closed) {
    const ends = [poly.vertices[0], poly.vertices[poly.vertices.length - 1]]
    for (let i = 0; i < path.length; i++) {
      for (const end of ends) {
        for (const p of circleCrossings(path[i].curve, end, distance)) {
          cuts[i].push({ t: paramOf(path[i].curve, p, tol), p })
        }
      }
    }
  }

  const pieces: Piece[] = []
  path.forEach((raw, index) => {
    const length = curveLength(raw.curve)
    if (length <= tol.point) return
    const margin = tol.cut / length
    const inner = cuts[index]
      .filter((cut) => cut.t > margin && cut.t < 1 - margin)
      .sort((a, b) => a.t - b.t)
    let t0 = 0
    let from = raw.from
    for (const cut of inner) {
      if (cut.t - t0 <= margin) continue
      pieces.push(pieceOf(raw, index, t0, cut.t, from, cut.p))
      t0 = cut.t
      from = cut.p
    }
    pieces.push(pieceOf(raw, index, t0, 1, from, raw.to))
  })
  return pieces
}

function pieceOf(
  raw: Raw,
  index: number,
  t0: number,
  t1: number,
  from: Vec2,
  to: Vec2
): Piece {
  return {
    curve: subCurve(raw.curve, t0, t1, from, to),
    from,
    to,
    raw: index,
    t0,
    t1,
    valid: false,
  }
}

/**
 * Whether a piece belongs to the offset: its middle at the full distance
 * from the source and nothing of the source crossing it.
 */
function atFullDistance(
  piece: Piece,
  sources: readonly Source[],
  distance: number,
  tol: Tolerances
): boolean {
  const middle = pointAt(piece.curve, 0.5)
  const box = boundsOf(piece)
  for (const source of sources) {
    const sourceBox = boundsOf(source)
    if (pointNearBox(middle, sourceBox, distance)) {
      const d = V.distance(closestOn(source.curve, middle).point, middle)
      if (d < distance - tol.cut) return false
    }
    if (
      boxesMeet(box, sourceBox, tol.cut) &&
      crossings(piece, source, tol).length > 0
    ) {
      return false
    }
  }
  return true
}

/**
 * A closed offset's loops: each walked along the raw offset as far as it
 * goes on, then on from where it stands by another piece, until it comes
 * back to where it started; a walk that cannot is undone and the next piece
 * tried as a start. On p188 this keeps AutoCAD's vertices to the point: the
 * left loop from the source's start with the collinear (80,55), the right one
 * from (120,45).
 */
function stitchLoops(pieces: Piece[], tol: Tolerances): number[][] {
  const used = new Array<boolean>(pieces.length).fill(false)
  const loops: number[][] = []
  for (const closeFirst of [false, true]) {
    for (let s = 0; s < pieces.length; s++) {
      if (!pieces[s].valid || used[s]) continue
      const walk = walkFrom(s, pieces, used, tol, closeFirst)
      if (!walk) continue
      for (const i of walk) used[i] = true
      loops.push(walk)
    }
  }
  return loops
}

function walkFrom(
  s: number,
  pieces: readonly Piece[],
  used: readonly boolean[],
  tol: Tolerances,
  closeFirst: boolean
): number[] | null {
  const n = pieces.length
  const walk = [s]
  const inWalk = new Set(walk)
  const start = pieces[s].from
  let current = s
  for (;;) {
    const end = pieces[current].to
    const closes = V.distance(end, start) <= tol.cut
    if (closeFirst && closes) return walk
    const following = (current + 1) % n
    const next = free(following, pieces, used, inWalk, end, tol)
      ? following
      : closes
        ? null
        : nearestFree(current, pieces, used, inWalk, end, tol)
    if (next === null) return closes ? walk : null
    walk.push(next)
    inWalk.add(next)
    current = next
  }
}

/** An open offset's polylines: walked as loops are, each ending where it can go no further. */
function stitchChains(pieces: Piece[], tol: Tolerances): number[][] {
  dropDuplicates(pieces, tol)
  const used = new Array<boolean>(pieces.length).fill(false)
  const chains: number[][] = []
  for (let s = 0; s < pieces.length; s++) {
    if (!pieces[s].valid || used[s]) continue
    const chain = [s]
    used[s] = true
    let current = s
    for (;;) {
      const end = pieces[current].to
      const following = current + 1
      const next =
        following < pieces.length &&
        free(following, pieces, used, new Set(), end, tol)
          ? following
          : nearestFree(current, pieces, used, new Set(), end, tol)
      if (next === null) break
      chain.push(next)
      used[next] = true
      current = next
    }
    chains.push(chain)
  }
  return chains
}

/**
 * Leaves out a piece run twice, as two collinear offsets overlapping make one
 * (unprobed for an open polyline: the earlier is kept).
 */
function dropDuplicates(pieces: Piece[], tol: Tolerances): void {
  for (let j = 0; j < pieces.length; j++) {
    if (!pieces[j].valid) continue
    for (let i = 0; i < j; i++) {
      if (
        pieces[i].valid &&
        V.distance(pieces[i].from, pieces[j].from) <= tol.cut &&
        V.distance(pieces[i].to, pieces[j].to) <= tol.cut &&
        V.distance(
          pointAt(pieces[i].curve, 0.5),
          pointAt(pieces[j].curve, 0.5)
        ) <= tol.cut
      ) {
        pieces[j].valid = false
        break
      }
    }
  }
}

function free(
  i: number,
  pieces: readonly Piece[],
  used: readonly boolean[],
  inWalk: ReadonlySet<number>,
  at: Vec2,
  tol: Tolerances
): boolean {
  return (
    pieces[i].valid &&
    !used[i] &&
    !inWalk.has(i) &&
    V.distance(pieces[i].from, at) <= tol.cut
  )
}

/** The free piece starting at `at`, the first after `current` in the raw offset's order. */
function nearestFree(
  current: number,
  pieces: readonly Piece[],
  used: readonly boolean[],
  inWalk: ReadonlySet<number>,
  at: Vec2,
  tol: Tolerances
): number | null {
  const n = pieces.length
  for (let step = 1; step < n; step++) {
    const i = (current + step) % n
    if (free(i, pieces, used, inWalk, at, tol)) return i
  }
  return null
}

/**
 * A walk of pieces as a polyline: runs of one raw segment back in one
 * segment, a vertex wherever the walk passes from one raw segment to another.
 */
function shapeOf(
  run: readonly number[],
  pieces: readonly Piece[],
  path: readonly Raw[],
  closed: boolean,
  wide: boolean
): OffsetPolylineShape {
  interface Merged {
    raw: number
    last: number
    t0: number
    t1: number
    from: Vec2
    to: Vec2
  }
  const merged: Merged[] = []
  for (const i of run) {
    const piece = pieces[i]
    const prev = merged[merged.length - 1]
    if (prev && prev.raw === piece.raw && prev.last + 1 === i) {
      prev.last = i
      prev.t1 = piece.t1
      prev.to = piece.to
    } else {
      merged.push({
        raw: piece.raw,
        last: i,
        t0: piece.t0,
        t1: piece.t1,
        from: piece.from,
        to: piece.to,
      })
    }
  }
  if (closed && merged.length > 1) {
    const first = merged[0]
    const last = merged[merged.length - 1]
    if (last.raw === first.raw && last.last + 1 === run[0]) {
      // The loop closed inside one raw segment: it starts where that one does.
      merged.pop()
      merged[0] = { ...first, t0: last.t0, from: last.from }
    }
  }
  const vertices = merged.map((m) => m.from)
  if (!closed) vertices.push(merged[merged.length - 1].to)
  const bulges = merged.map((m) => {
    const c = path[m.raw].curve
    return c.kind === "line" ? 0 : Math.tan((c.sweep * (m.t1 - m.t0)) / 4)
  })
  if (!wide) return { vertices, closed, bulges }
  const widths = merged.map((m): PolylineWidth => {
    const [w0, w1] = path[m.raw].width
    return [w0 + (w1 - w0) * m.t0, w0 + (w1 - w0) * m.t1]
  })
  return { vertices, closed, bulges, widths }
}

interface Crossing {
  readonly p: Vec2
  readonly t: number
  readonly u: number
}

/**
 * Where two spans cross, with each one's parameter; where they overlap (two
 * collinear lines, two arcs of one circle) the ends of each inside the other.
 */
function crossings(a: Span, b: Span, tol: Tolerances): Crossing[] {
  const la = curveLength(a.curve)
  const lb = curveLength(b.curve)
  if (la <= tol.point || lb <= tol.point) return []
  const ea = tol.cut / la
  const eb = tol.cut / lb
  const inA = (t: number) => t >= -ea && t <= 1 + ea
  const inB = (u: number) => u >= -eb && u <= 1 + eb
  const ca = a.curve
  const cb = b.curve
  if (ca.kind === "line" && cb.kind === "line") {
    const x = infiniteLineIntersection(ca.a, ca.b, cb.a, cb.b)
    if (x) return inA(x.t) && inB(x.u) ? [{ p: x.point, t: x.t, u: x.u }] : []
    const across = V.cross(V.normalize(V.sub(ca.b, ca.a)), V.sub(cb.a, ca.a))
    return Math.abs(across) <= tol.cut ? overlapEnds(a, b, tol, ea, eb) : []
  }
  if (ca.kind === "arc" && cb.kind === "arc") {
    if (
      V.distance(ca.center, cb.center) <= tol.cut &&
      Math.abs(ca.radius - cb.radius) <= tol.cut
    ) {
      return overlapEnds(a, b, tol, ea, eb)
    }
    return circleCircleIntersection(ca.center, ca.radius, cb.center, cb.radius)
      .map((p) => ({ p, t: paramOf(ca, p, tol), u: paramOf(cb, p, tol) }))
      .filter((hit) => inA(hit.t) && inB(hit.u))
  }
  const hits: Crossing[] = []
  const line =
    ca.kind === "line" ? ca : (cb as Extract<Curve, { kind: "line" }>)
  const arc = ca.kind === "arc" ? ca : (cb as Extract<Curve, { kind: "arc" }>)
  for (const p of lineCirclePoints(line.a, line.b, arc.center, arc.radius)) {
    const t = paramOf(ca, p, tol)
    const u = paramOf(cb, p, tol)
    if (inA(t) && inB(u)) hits.push({ p, t, u })
  }
  return hits
}

function overlapEnds(
  a: Span,
  b: Span,
  tol: Tolerances,
  ea: number,
  eb: number
): Crossing[] {
  const hits: Crossing[] = []
  for (const [p, u] of [
    [b.from, 0],
    [b.to, 1],
  ] as const) {
    const t = paramOf(a.curve, p, tol)
    if (t > ea && t < 1 - ea && onCurve(a.curve, p, tol)) hits.push({ p, t, u })
  }
  for (const [p, t] of [
    [a.from, 0],
    [a.to, 1],
  ] as const) {
    const u = paramOf(b.curve, p, tol)
    if (u > eb && u < 1 - eb && onCurve(b.curve, p, tol)) hits.push({ p, t, u })
  }
  return hits
}

function onCurve(c: Curve, p: Vec2, tol: Tolerances): boolean {
  return V.distance(closestOn(c, p).point, p) <= tol.cut
}

/** Where a curve crosses the circle of `radius` round `center`. */
function circleCrossings(c: Curve, center: Vec2, radius: number): Vec2[] {
  return c.kind === "line"
    ? lineCirclePoints(c.a, c.b, center, radius)
    : circleCircleIntersection(c.center, c.radius, center, radius)
}

function lineCirclePoints(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number
): Vec2[] {
  const along = V.sub(b, a)
  return lineCircleIntersectionParams(a, b, center, radius).map((t) =>
    V.add(a, V.scale(along, t))
  )
}

function curveLength(c: Curve): number {
  return c.kind === "line" ? V.distance(c.a, c.b) : Math.abs(c.sweep) * c.radius
}

function pointAt(c: Curve, t: number): Vec2 {
  return c.kind === "line"
    ? V.lerp(c.a, c.b, t)
    : polarPoint(c.center, c.radius, c.start + c.sweep * t)
}

/** The unit direction of travel at `t`. */
function tangentAt(c: Curve, t: number): Vec2 {
  if (c.kind === "line") return V.normalize(V.sub(c.b, c.a))
  const angle = c.start + c.sweep * t
  const radial = { x: Math.cos(angle), y: Math.sin(angle) }
  return c.sweep >= 0
    ? V.perpendicular(radial)
    : V.scale(V.perpendicular(radial), -1)
}

/**
 * The parameter of a point on (or by) the curve: a line's unclamped, an
 * arc's by its angle from the start along the sweep, a little before the
 * start reading as a little below 0.
 */
function paramOf(c: Curve, p: Vec2, tol: Tolerances): number {
  if (c.kind === "line") {
    const along = V.sub(c.b, c.a)
    const lengthSq = V.lengthSq(along)
    return lengthSq === 0 ? 0 : V.dot(V.sub(p, c.a), along) / lengthSq
  }
  const sweep = Math.abs(c.sweep)
  if (sweep === 0) return 0
  let u = normalizeAngle(Math.sign(c.sweep) * (angleOf(c.center, p) - c.start))
  if (u > 2 * Math.PI - tol.cut / c.radius) u -= 2 * Math.PI
  return u / sweep
}

function subCurve(
  c: Curve,
  t0: number,
  t1: number,
  from: Vec2,
  to: Vec2
): Curve {
  if (c.kind === "line") return { kind: "line", a: from, b: to }
  return { ...c, start: c.start + c.sweep * t0, sweep: c.sweep * (t1 - t0) }
}

/** The point of the curve nearest `p`, and its parameter. */
function closestOn(c: Curve, p: Vec2): { point: Vec2; t: number } {
  if (c.kind === "line") {
    const hit = closestPointOnSegment(c.a, c.b, p)
    return { point: hit.point, t: hit.t }
  }
  const sweep = Math.abs(c.sweep)
  const u = normalizeAngle(
    Math.sign(c.sweep) * (angleOf(c.center, p) - c.start)
  )
  if (u <= sweep) {
    return { point: pointAt(c, u / sweep), t: u / sweep }
  }
  const start = pointAt(c, 0)
  const end = pointAt(c, 1)
  return V.distance(start, p) <= V.distance(end, p)
    ? { point: start, t: 0 }
    : { point: end, t: 1 }
}

function rayDistance(origin: Vec2, dir: Vec2, p: Vec2): number {
  const rel = V.sub(p, origin)
  return V.dot(rel, dir) <= 0 ? V.length(rel) : Math.abs(V.cross(dir, rel))
}

function angleOf(center: Vec2, p: Vec2): number {
  return Math.atan2(p.y - center.y, p.x - center.x)
}

/** `angle` brought into (-π, π]. */
function wrapPi(angle: number): number {
  const a = normalizeAngle(angle)
  return a > Math.PI ? a - 2 * Math.PI : a
}

interface Box {
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
}

function boundsOf(span: Span): Box {
  const c = span.curve
  if (c.kind === "arc") {
    return {
      minX: c.center.x - c.radius,
      minY: c.center.y - c.radius,
      maxX: c.center.x + c.radius,
      maxY: c.center.y + c.radius,
    }
  }
  return {
    minX: Math.min(c.a.x, c.b.x),
    minY: Math.min(c.a.y, c.b.y),
    maxX: Math.max(c.a.x, c.b.x),
    maxY: Math.max(c.a.y, c.b.y),
  }
}

function boxesMeet(a: Box, b: Box, margin: number): boolean {
  return (
    a.minX <= b.maxX + margin &&
    b.minX <= a.maxX + margin &&
    a.minY <= b.maxY + margin &&
    b.minY <= a.maxY + margin
  )
}

function pointNearBox(p: Vec2, box: Box, margin: number): boolean {
  return (
    p.x >= box.minX - margin &&
    p.x <= box.maxX + margin &&
    p.y >= box.minY - margin &&
    p.y <= box.maxY + margin
  )
}
