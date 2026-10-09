import { Vec2, V } from "../../geometry/Vec2"
import {
  infiniteLineIntersection,
  normalizeAngle,
} from "../../geometry/primitives"
import {
  PolylineEntity,
  PolylineSegmentGeometry,
  carryOverrides,
  createPolyline,
  polylineSegmentGeometries,
} from "../../domain/entities"
import { ToolContext } from "./Tool"

/**
 * A corner of a polyline as FILLET and CHAMFER cut it: two straight segments
 * meeting at `corner` — their shared vertex, or where they cross when an arc
 * segment between them is to go — whose far ends are `from` and `to`.
 */
export interface PolylineCorner {
  readonly from: Vec2
  readonly corner: Vec2
  readonly to: Vec2
}

/**
 * A vertex where an arc segment meets another segment: `incoming` ends at
 * `corner` and `outgoing` starts there.
 */
export interface ArcCorner {
  readonly incoming: PolylineSegmentGeometry
  readonly corner: Vec2
  readonly outgoing: PolylineSegmentGeometry
}

/**
 * Where a corner's incoming segment is cut (`entry`) and its outgoing one
 * (`exit`), and the bulge of the segment that joins them (0 for a bevel).
 */
export interface CornerCut {
  readonly entry: Vec2
  readonly exit: Vec2
  readonly bulge: number
}

export interface PolylineCuts {
  /** Two line segments: `null` when they are parallel. */
  readonly lines: (corner: PolylineCorner) => CornerCut | null
  /**
   * An arc segment between two line segments that converge towards it, which
   * the cut replaces (and a cut collapsing to the crossing removes): FILLET's.
   */
  readonly acrossArcs?: boolean
  /** A vertex an arc segment meets, or `null` to leave it: FILLETPOLYARC 1. */
  readonly arcs?: (corner: ArcCorner) => CornerCut | null
}

export interface PolylineCornersResult {
  /** The polyline with its corners cut, or `null` when none was. */
  readonly polyline: PolylineEntity | null
  readonly cut: number
  /** Corners left alone, as AutoCAD counts them after the cut ones. */
  readonly parallel: number
  readonly tooShort: number
  readonly divergent: number
}

/**
 * The line after `N lines were filleted` counting the corners left alone, in
 * AutoCAD's columns (`2 were too short    `); none when every one was cut.
 */
export function reportSkipped(
  { parallel, tooShort, divergent }: PolylineCornersResult,
  ctx: ToolContext
): void {
  if (parallel + tooShort + divergent === 0) return
  ctx.report(
    ctx.text
      .message("cornersSkipped", { parallel, tooShort, divergent })
      .trimEnd()
  )
}

/** Why two segments picked within one polyline make no corner. */
export type SegmentsRefusal = "parallel" | "diverge" | "tooLarge"

interface Candidate {
  readonly inSeg: number
  readonly outSeg: number
  /** Whether the cut moves anything: one already sharp at radius 0 counts too. */
  readonly changes: boolean
  /** The segment between the two lines, which the cut replaces. */
  readonly arc: number | null
  readonly corner: Vec2
  readonly cut: CornerCut
}

const EPS = 1e-9

/**
 * Cuts every corner of `poly` — FILLET's and CHAMFER's Polyline option. A
 * corner whose cut does not fit on its segments is left as it is ("too short to
 * accommodate"); one whose cut changes nothing is counted all the same, as
 * AutoCAD's `4 lines were filleted` at radius 0 on a square.
 */
export function cutPolylineCorners(
  poly: PolylineEntity,
  cuts: PolylineCuts
): PolylineCornersResult {
  const v = poly.vertices
  const segments = polylineSegmentGeometries(poly)
  const count = segments.length
  let parallel = 0
  let divergent = 0
  const none = { polyline: null, cut: 0, parallel, tooShort: 0, divergent }
  if (count < 2) return none
  const wrap = (s: number) => (s + count) % count
  const isLine = (s: number) => segments[s].kind === "line"
  const start = (s: number) => segments[s].a
  const end = (s: number) => segments[s].b

  const candidates: Candidate[] = []
  const consider = (
    inSeg: number,
    outSeg: number,
    arc: number | null,
    corner: Vec2,
    cut: CornerCut | null
  ) => {
    if (!cut) {
      // Only two lines can be parallel: an arc corner that cannot be cut is
      // left without a word.
      if (arc !== null || (isLine(inSeg) && isLine(outSeg))) parallel += 1
      return
    }
    const changes =
      arc !== null ||
      !V.equals(cut.entry, corner) ||
      !V.equals(cut.exit, corner)
    candidates.push({ inSeg, outSeg, changes, arc, corner, cut })
  }

  if (cuts.acrossArcs && count >= 3) {
    for (let j = 0; j < count; j++) {
      if (isLine(j) || (!poly.closed && (j === 0 || j === count - 1))) continue
      const inSeg = wrap(j - 1)
      const outSeg = wrap(j + 1)
      if (!isLine(inSeg) || !isLine(outSeg)) continue
      const crossing = infiniteLineIntersection(
        start(inSeg),
        end(inSeg),
        start(outSeg),
        end(outSeg)
      )
      if (!crossing) {
        parallel += 1
        continue
      }
      // Converging as they approach the arc: they cross past the end of the
      // incoming line and before the start of the outgoing one.
      if (crossing.t < 1 - EPS || crossing.u > EPS) {
        divergent += 1
        continue
      }
      const corner = crossing.point
      const cut = cuts.lines({ from: start(inSeg), corner, to: end(outSeg) })
      consider(inSeg, outSeg, j, corner, cut)
    }
  }
  const replacing = new Set(candidates.map((c) => c.arc))
  for (let k = 0; k < v.length; k++) {
    if (!poly.closed && (k === 0 || k === v.length - 1)) continue
    const inSeg = wrap(k - 1)
    const outSeg = k
    if (replacing.has(inSeg) || replacing.has(outSeg)) continue
    const corner = v[k]
    if (isLine(inSeg) && isLine(outSeg)) {
      const cut = cuts.lines({ from: start(inSeg), corner, to: end(outSeg) })
      consider(inSeg, outSeg, null, corner, cut)
    } else if (cuts.arcs) {
      const incoming = segments[inSeg]
      const outgoing = segments[outSeg]
      consider(
        inSeg,
        outSeg,
        null,
        corner,
        cuts.arcs({ incoming, corner, outgoing })
      )
    }
  }

  // Each segment keeps what is left between the cuts at its two ends; two
  // corners that eat the same segment past each other are both dropped, which
  // can free the arc a dropped corner was to replace — so settle it.
  const kept = new Set(candidates)
  let tooShort = 0
  const drop = (corner: Candidate) => {
    if (kept.delete(corner)) tooShort += 1
  }
  for (let settled = false; !settled;) {
    settled = true
    for (let s = 0; s < count; s++) {
      const atStart = [...kept].find((c) => c.outSeg === s) ?? null
      const atEnd = [...kept].find((c) => c.inSeg === s) ?? null
      // An arc's own cut is held to its sweep by `arcs`; the chords only
      // tell two cuts on it apart.
      if (isLine(s) ? !atStart && !atEnd : !atStart || !atEnd) continue
      const from = atStart ? atStart.corner : start(s)
      const to = atEnd ? atEnd.corner : end(s)
      const used =
        (atStart ? V.distance(atStart.corner, atStart.cut.exit) : 0) +
        (atEnd ? V.distance(atEnd.corner, atEnd.cut.entry) : 0)
      if (used > V.distance(from, to) + EPS) {
        if (atStart) drop(atStart)
        if (atEnd) drop(atEnd)
        settled = false
      }
    }
  }
  const changed = [...kept].filter((corner) => corner.changes)
  return {
    polyline: changed.length === 0 ? null : rebuild(poly, segments, changed),
    cut: kept.size,
    parallel,
    tooShort,
    divergent,
  }
}

/**
 * The corner FILLET and CHAMFER make between two straight segments of one
 * polyline picked as their two objects: "adjacent to each other or separated
 * by one other segment", which is removed and replaced with the cut; the first
 * and last segments of an open polyline close it — which `pickCornerObject`
 * alone offers. A refusal says why there is no corner.
 */
export function cutBetweenSegments(
  poly: PolylineEntity,
  first: number,
  second: number,
  lines: (corner: PolylineCorner) => CornerCut | null
): PolylineEntity | SegmentsRefusal {
  const segments = polylineSegmentGeometries(poly)
  const count = segments.length
  const [inSeg, outSeg, between] = segmentPair(poly, count, first, second) ?? [
    first,
    second,
    null,
  ]
  const incoming = segments[inSeg]
  const outgoing = segments[outSeg]
  let corner = incoming.b
  if (between !== null || inSeg > outSeg) {
    const crossing = infiniteLineIntersection(
      incoming.a,
      incoming.b,
      outgoing.a,
      outgoing.b
    )
    if (!crossing) return "parallel"
    if (crossing.t < EPS || crossing.u > 1 - EPS) return "diverge"
    corner = crossing.point
  }
  // Measured from the segment picked first, as CHAMFER's first distance is.
  const forward = inSeg === first
  const asked = forward
    ? lines({ from: incoming.a, corner, to: outgoing.b })
    : lines({ from: outgoing.b, corner, to: incoming.a })
  if (!asked) return "parallel"
  const cut = forward
    ? asked
    : { entry: asked.exit, exit: asked.entry, bulge: -asked.bulge }
  if (
    V.distance(corner, cut.entry) > V.distance(corner, incoming.a) - EPS ||
    V.distance(corner, cut.exit) > V.distance(corner, outgoing.b) - EPS
  ) {
    return "tooLarge"
  }
  return rebuild(poly, segments, [
    { inSeg, outSeg, changes: true, arc: between, corner, cut },
  ])
}

/** Whether two segments of `poly` can be picked as FILLET's two objects. */
export function segmentsPair(
  poly: PolylineEntity,
  first: number,
  second: number
): boolean {
  const count = polylineSegmentGeometries(poly).length
  return segmentPair(poly, count, first, second) !== null
}

/**
 * The two segments in the order the polyline runs through their corner, and
 * the one between them; adjacency wins over one segment apart.
 */
function segmentPair(
  poly: PolylineEntity,
  count: number,
  first: number,
  second: number
): [number, number, number | null] | null {
  if (first === second) return null
  const step = (from: number, by: number) =>
    poly.closed ? (from + by) % count : from + by
  for (const by of [1, 2]) {
    for (const [a, b] of [
      [first, second],
      [second, first],
    ]) {
      if (step(a, by) === b) return [a, b, by === 2 ? step(a, 1) : null]
    }
  }
  const ends = [first, second].sort((a, b) => a - b)
  return !poly.closed && ends[0] === 0 && ends[1] === count - 1
    ? [count - 1, 0, null]
    : null
}

/**
 * `poly` with each corner's segments cut back to it and joined by its cut;
 * the segment a corner replaces goes. A corner from the last segment of an open
 * polyline round to its first closes it.
 */
function rebuild(
  poly: PolylineEntity,
  segments: readonly PolylineSegmentGeometry[],
  corners: readonly Candidate[]
): PolylineEntity {
  const count = segments.length
  const closed =
    poly.closed || corners.some((c) => c.inSeg === count - 1 && c.outSeg === 0)
  const byIn = new Map(corners.map((c) => [c.inSeg, c]))
  const byOut = new Map(corners.map((c) => [c.outSeg, c]))
  const replaced = new Set(corners.map((c) => c.arc))
  const points: Vec2[] = []
  const bulges: number[] = []
  for (let s = 0; s < count; s++) {
    if (replaced.has(s)) continue
    const segment = segments[s]
    const corner = byIn.get(s)
    const from = byOut.get(s)?.cut.exit ?? segment.a
    const to = corner?.cut.entry ?? segment.b
    points.push(from)
    bulges.push(segment.kind === "line" ? 0 : bulgeBetween(segment, from, to))
    if (corner && !V.equals(corner.cut.entry, corner.cut.exit)) {
      points.push(corner.cut.entry)
      bulges.push(corner.cut.bulge)
    }
  }
  if (!closed) {
    points.push(segments[count - 1].b)
    bulges.push(0)
  }
  return carryOverrides(
    poly,
    createPolyline(points, closed, poly.layerId, bulges, poly.id)
  )
}

/**
 * The bulge of what is left of an arc segment between `start` and `end`, on
 * its own circle and turning its own way.
 */
function bulgeBetween(
  arc: Extract<PolylineSegmentGeometry, { kind: "arc" }>,
  start: Vec2,
  end: Vec2
): number {
  const { center, bulge } = arc
  const angStart = Math.atan2(start.y - center.y, start.x - center.x)
  const angEnd = Math.atan2(end.y - center.y, end.x - center.x)
  const included =
    bulge >= 0
      ? normalizeAngle(angEnd - angStart)
      : normalizeAngle(angStart - angEnd)
  const magnitude = Math.tan(included / 4)
  return bulge >= 0 ? magnitude : -magnitude
}
