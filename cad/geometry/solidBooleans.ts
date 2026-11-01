import {
  Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "./Vec3"
import { arbitraryAxis } from "./ocs"
import { bsplineDomain, bsplineSegment } from "./nurbs"
import { normalizeAngle } from "./primitives"
import { EdgeTrace, edgeTrace, traceMeetings, traceNearest } from "./brepCurves"
import { surfaceFrame, surfacePoint } from "./faceDomains"
import {
  FaceRegion,
  UV,
  faceRegion,
  primitiveDomain,
  regionContains,
  regionLoopsArea,
  surfaceParams,
} from "./faceRegions"
import { MODEL_TOLERANCE } from "./planarCurves"
import { loopArea, pointInFaces } from "./planarRegions"
import {
  FacePlace,
  boxesOverlap,
  faceBox,
  faceNormal,
  facePlace,
  inBox,
  lineSurfaceHits,
  pointInSolid,
  solidBox,
} from "./brepQueries"
import { SpaceCurve, onBoth, spaceTrace, surfacesMeet } from "./intersections"
import { curveSurfaceHits, sameSurface, surfaceLevel } from "./surfaces"
import {
  Box3,
  Brep,
  BrepCurve,
  BrepEdge,
  BrepFace,
  BrepLoop,
  BrepSurface,
  FaceDomain,
  boxOfPoints,
  planarFace,
  unsigned0,
  unsignedDomain,
} from "./solids"
import type { Vec2 } from "./Vec2"

/**
 * UNION, SUBTRACT and INTERSECT of two solids' B-reps, as ACIS combines
 * them: every edge of each cut where it pierces the other's faces, every
 * pair of faces that meet cut along their meeting (`intersections.ts`), a
 * face lying on the other's surface imprinted with the other's edges; each
 * face split by its cuts into pieces, each piece sorted by a point of it —
 * inside the other solid, outside it, or on a face of it facing the same way
 * or the other — and kept by the operation; the pieces sewn on their shared
 * edges, and faces of one surface that meet merged again, edges of one curve
 * joined (union/k02: two boxes side by side unite into one box of six faces).
 */

export type SolidOperation = "union" | "intersect" | "subtract"

/** Why a boolean could not be made: a pair of surfaces with no closed form here, or a result that does not close. */
export class SolidBooleanError extends Error {
  constructor(readonly reason: "unsupported" | "failed") {
    super(reason)
    this.name = "SolidBooleanError"
  }
}

/** Points within the model's tolerance are one vertex; a grid finds them in constant time. */
class Points {
  readonly points: Vec3[] = []
  private readonly cells = new Map<string, number[]>()

  constructor(private readonly tolerance: number) {}

  private key(x: number, y: number, z: number) {
    return `${x},${y},${z}`
  }

  find(p: Vec3): number {
    const s = this.tolerance * 4
    const cx = Math.floor(p.x / s)
    const cy = Math.floor(p.y / s)
    const cz = Math.floor(p.z / s)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (const i of this.cells.get(this.key(cx + dx, cy + dy, cz + dz)) ??
            []) {
            if (length3(sub3(this.points[i], p)) <= this.tolerance) return i
          }
        }
      }
    }
    return -1
  }

  add(p: Vec3): number {
    const found = this.find(p)
    if (found >= 0) return found
    const s = this.tolerance * 4
    const index = this.points.length
    this.points.push(p)
    const key = this.key(
      Math.floor(p.x / s),
      Math.floor(p.y / s),
      Math.floor(p.z / s)
    )
    const bucket = this.cells.get(key)
    if (bucket) bucket.push(index)
    else this.cells.set(key, [index])
    return index
  }
}

/** A piece of an edge or of a meeting curve, between two vertices of the pool. */
interface Piece {
  readonly start: number
  readonly end: number
  readonly curve: BrepCurve
  readonly mid: Vec3
}

/** A face's use of a piece. */
interface Use {
  readonly piece: number
  readonly reversed: boolean
}

/** A face of one solid split into its pieces, or left whole. */
interface Patch {
  readonly solid: 0 | 1
  readonly face: BrepFace
  readonly surface: BrepSurface
  readonly domain: FaceDomain | undefined
  readonly loops: Use[][]
}

/** The tolerance a pair of solids is combined at: the model's, as large as their coordinates need. */
function toleranceOf(a: Brep, b: Brep): number {
  let size = 1
  for (const box of [solidBox(a), solidBox(b)]) {
    for (const p of [box.min, box.max]) {
      size = Math.max(size, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z))
    }
  }
  return MODEL_TOLERANCE * Math.max(1, size / 1000)
}

/** Pieces of one curve, cut where the points that lie on it are. */
function piecesOf(
  trace: EdgeTrace,
  from: number,
  to: number,
  cuts: number[],
  closed: boolean,
  tolerance: number
): [number, number][] {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const at = cuts.filter((t) => t > lo && t < hi).sort((x, y) => x - y)
  const stops: number[] = [lo]
  for (const t of at) {
    if (
      length3(sub3(trace.point(t), trace.point(stops[stops.length - 1]))) >
        tolerance &&
      length3(sub3(trace.point(t), trace.point(hi))) > tolerance
    ) {
      stops.push(t)
    }
  }
  stops.push(hi)
  void closed
  const out: [number, number][] = []
  for (let i = 1; i < stops.length; i++) out.push([stops[i - 1], stops[i]])
  return out
}

/** The curve of an edge's stretch from `a` to `b` of its own parameter. */
function stretchCurve(curve: BrepCurve, a: number, b: number): BrepCurve {
  if (curve.kind !== "spline") return curve
  const { start, end } = bsplineDomain(curve.curve)
  if (a <= start && b >= end) return curve
  return { kind: "spline", curve: bsplineSegment(curve.curve, a, b) }
}

/** A meeting curve's stretch as an edge's curve. */
function meetingCurve(c: SpaceCurve, a: number, b: number): BrepCurve {
  switch (c.kind) {
    case "line":
      return { kind: "line" }
    case "circle":
      return {
        kind: "circle",
        center: c.center,
        normal: c.normal,
        radius: c.radius,
      }
    case "ellipse":
      return {
        kind: "ellipse",
        center: c.center,
        normal: c.normal,
        majorAxis: c.majorAxis,
        ratio: c.ratio,
      }
    case "spline": {
      const { start, end } = bsplineDomain(c.curve)
      if (a <= start && b >= end) return { kind: "spline", curve: c.curve }
      return { kind: "spline", curve: bsplineSegment(c.curve, a, b) }
    }
  }
}

function isClosedCurve(c: SpaceCurve): boolean {
  return (
    c.kind === "circle" ||
    c.kind === "ellipse" ||
    (c.kind === "spline" && c.closed)
  )
}

/** The face's domain, a primitive's made explicit, run the other way when `flip`. */
function domainOf(
  brep: Brep,
  face: BrepFace,
  flip: boolean
): FaceDomain | undefined {
  if (face.surface.kind === "plane") return undefined
  const d = face.domain ?? primitiveDomain(brep, face) ?? undefined
  if (!d) return undefined
  return flip ? { u: [d.u[1], d.u[0]], v: [d.v[0], d.v[1]] } : d
}

/**
 * The boolean of `a` and `b`: their union, their intersection, or `a` less
 * `b`. Null when nothing is left (INTERSECT's empty result, a SUBTRACT that
 * takes all); a union of solids apart is one B-rep of several shells, as
 * ACIS's is of several lumps (union/k03). Throws {@link SolidBooleanError}.
 */
export function brepBoolean(op: SolidOperation, a: Brep, b: Brep): Brep | null {
  const tolerance = toleranceOf(a, b)
  const solids = [a, b] as const
  if (!boxesOverlap(solidBox(a), solidBox(b), tolerance)) {
    if (op === "union") return joined(a, b)
    if (op === "intersect") return null
    return a
  }
  const pool = new Points(tolerance)
  const pieces: Piece[] = []
  const pieceIndex = new Map<string, number[]>()
  const addPiece = (
    start: number,
    end: number,
    curve: BrepCurve,
    mid: Vec3
  ) => {
    const key = start < end ? `${start}:${end}` : `${end}:${start}`
    for (const i of pieceIndex.get(key) ?? []) {
      if (length3(sub3(pieces[i].mid, mid)) <= tolerance * 10) return i
    }
    const index = pieces.length
    pieces.push({ start, end, curve, mid })
    const list = pieceIndex.get(key)
    if (list) list.push(index)
    else pieceIndex.set(key, [index])
    return index
  }
  const vertexIds = solids.map((s) => s.vertices.map((p) => pool.add(p)))
  const boxes = solids.map((s) => s.faces.map((f) => faceBox(s, f)))

  // 1. Every edge cut where it pierces the other solid's faces, or crosses
  // the edges of a face it lies on, and where the other's vertices lie on it.
  const edgePieces: number[][][] = [[], []]
  for (const x of [0, 1] as const) {
    const brep = solids[x]
    const other = solids[1 - x]
    brep.edges.forEach((edge, e) => {
      if (edge.curve.kind === "point") {
        edgePieces[x][e] = [
          addPiece(
            vertexIds[x][edge.start],
            vertexIds[x][edge.start],
            edge.curve,
            brep.vertices[edge.start]
          ),
        ]
        return
      }
      const trace = edgeTrace(brep, edge)
      const box = traceBoxOf(trace)
      const cuts: number[] = []
      other.faces.forEach((g, gi) => {
        if (!boxesOverlap(box, boxes[1 - x][gi], tolerance)) return
        // A segment meets a plane or a quadric in closed form: two crossings
        // closer than the samples apart are not lost.
        const exact =
          edge.curve.kind === "line"
            ? lineSurfaceHits(
                trace.point(0),
                trace.derivative(0),
                0,
                1,
                g.surface,
                tolerance
              )
            : null
        const hits =
          exact ??
          curveSurfaceHits(trace, trace.t0, trace.t1, g.surface, tolerance)
        if (hits === "inside") {
          for (const loop of g.loops) {
            for (const c of loop) {
              const ge = other.edges[c.edge]
              if (ge.curve.kind === "point") continue
              cuts.push(
                ...traceMeetings(trace, edgeTrace(other, ge), tolerance)
              )
            }
          }
          return
        }
        for (const t of hits) {
          const p = trace.point(t)
          if (facePlace(other, g, p, tolerance) !== "outside") cuts.push(t)
        }
      })
      for (const q of other.vertices) {
        if (!inBox(q, box, tolerance)) continue
        const hit = traceNearest(trace, q)
        if (hit.distance <= tolerance) cuts.push(hit.t)
      }
      const closed = edge.start === edge.end
      const stretches = piecesOf(
        trace,
        trace.t0,
        trace.t1,
        cuts,
        closed,
        tolerance
      )
      edgePieces[x][e] = stretches.map(([s0, s1], i) => {
        const first = i === 0
        const last = i === stretches.length - 1
        const start = first
          ? vertexIds[x][edge.start]
          : pool.add(trace.point(s0))
        const end = last ? vertexIds[x][edge.end] : pool.add(trace.point(s1))
        return addPiece(
          start,
          end,
          stretchCurve(edge.curve, s0, s1),
          trace.point((s0 + s1) / 2)
        )
      })
    })
  }

  // 2. Each pair of faces that meet, cut along their meeting where it lies on both.
  const cuts: Set<number>[][] = solids.map((s) =>
    s.faces.map(() => new Set<number>())
  )
  const same: [number, number][] = []
  a.faces.forEach((f, fi) => {
    b.faces.forEach((g, gi) => {
      const box = overlapOf(boxes[0][fi], boxes[1][gi], tolerance)
      if (!box) return
      if (sameSurface(f.surface, g.surface, tolerance)) {
        same.push([fi, gi])
        return
      }
      const meeting = surfacesMeet(f.surface, g.surface, box, tolerance)
      if (meeting === "unsupported") {
        if (facesMayMeet(a, f, b, g, tolerance))
          throw new SolidBooleanError("unsupported")
        return
      }
      // Curves of one meeting cross where the surfaces touch (two cylinders
      // of one radius, union/k06): no edge marks it, so it is a vertex here.
      for (let i = 0; i < meeting.length; i++) {
        for (let j = i + 1; j < meeting.length; j++) {
          const ti = spaceTrace(meeting[i], box)
          const tj = spaceTrace(meeting[j], box)
          for (const t of traceMeetings(ti, tj, tolerance)) {
            const q = ti.point(t)
            if (inBox(q, box, tolerance)) pool.add(q)
          }
        }
      }
      for (const curve of meeting) {
        const trace = spaceTrace(curve, box)
        if (!(trace.t1 > trace.t0)) continue
        const at: number[] = []
        for (let i = 0; i < pool.points.length; i++) {
          const q = pool.points[i]
          if (!inBox(q, box, tolerance)) continue
          if (!onBoth(f.surface, g.surface, q, tolerance * 10)) continue
          const hit = traceNearest(trace, q)
          if (hit.distance <= tolerance) at.push(hit.t)
        }
        const closed = isClosedCurve(curve)
        let stretches: [number, number][]
        if (closed) {
          const sorted = at.sort((x, y) => x - y)
          if (sorted.length === 0) {
            stretches = [[trace.t0, trace.t1]]
          } else {
            stretches = []
            const period = trace.t1 - trace.t0
            const distinct: number[] = []
            for (const t of sorted) {
              if (
                distinct.length === 0 ||
                length3(
                  sub3(
                    trace.point(t),
                    trace.point(distinct[distinct.length - 1])
                  )
                ) > tolerance
              )
                distinct.push(t)
            }
            if (
              distinct.length > 1 &&
              length3(
                sub3(
                  trace.point(distinct[0]),
                  trace.point(distinct[distinct.length - 1])
                )
              ) <= tolerance
            )
              distinct.pop()
            for (let i = 0; i < distinct.length; i++) {
              const s0 = distinct[i]
              const s1 =
                i + 1 < distinct.length ? distinct[i + 1] : distinct[0] + period
              stretches.push([s0, s1])
            }
          }
        } else {
          const sorted = [...new Set(at)].sort((x, y) => x - y)
          stretches = []
          for (let i = 1; i < sorted.length; i++) {
            if (
              length3(
                sub3(trace.point(sorted[i]), trace.point(sorted[i - 1]))
              ) > tolerance
            ) {
              stretches.push([sorted[i - 1], sorted[i]])
            }
          }
        }
        for (const [s0, s1] of stretches) {
          const spline = curve.kind === "spline"
          // A closed spline cut across its seam is two stretches of it.
          const parts: [number, number][] =
            spline && closed && s1 > trace.t1
              ? [
                  [s0, trace.t1],
                  [trace.t0, s1 - (trace.t1 - trace.t0)],
                ]
              : [[s0, s1]]
          for (const [p0, p1] of parts) {
            const mid = trace.point((p0 + p1) / 2)
            if (!onBoth(f.surface, g.surface, mid, tolerance * 10)) continue
            const inF = facePlace(a, f, mid, tolerance)
            const inG = facePlace(b, g, mid, tolerance)
            if (inF === "outside" || inG === "outside") continue
            if (inF === "boundary" && inG === "boundary") continue
            const whole = closed && stretches.length === 1 && !spline
            const start = pool.add(trace.point(p0))
            const end = whole ? start : pool.add(trace.point(p1))
            const index = addPiece(start, end, meetingCurve(curve, p0, p1), mid)
            if (inF === "inside") cuts[0][fi].add(index)
            if (inG === "inside") cuts[1][gi].add(index)
          }
        }
      }
    })
  })

  // 3. A face on the other's surface takes the other's edges inside it.
  for (const [fi, gi] of same) {
    for (const [x, own, otherFace] of [
      [0, fi, b.faces[gi]],
      [1, gi, a.faces[fi]],
    ] as const) {
      const solid = solids[x]
      const face = solid.faces[own]
      const otherSolid = solids[1 - x]
      for (const loop of otherFace.loops) {
        for (const c of loop) {
          for (const index of edgePieces[1 - x][c.edge]) {
            const piece = pieces[index]
            if (facePlace(solid, face, piece.mid, tolerance) === "inside") {
              cuts[x][own].add(index)
            }
          }
        }
      }
      void otherSolid
    }
  }

  // 4. The working B-rep every piece is an edge of; each face split.
  const work: Brep = {
    vertices: pool.points,
    edges: pieces.map((p) => ({ start: p.start, end: p.end, curve: p.curve })),
    faces: [],
  }
  const patches: Patch[] = []
  for (const x of [0, 1] as const) {
    solids[x].faces.forEach((face, fi) => {
      patches.push(
        ...splitFace(
          work,
          solids[x],
          x,
          face,
          edgePieces[x],
          [...cuts[x][fi]],
          tolerance
        )
      )
    })
  }

  // 5. Each patch sorted against the other solid and kept by the operation.
  const kept: { patch: Patch; flip: boolean }[] = []
  for (const patch of patches) {
    const where = placeOf(work, patch, solids[1 - patch.solid], tolerance)
    const way = keeps(op, where, patch.solid === 0)
    if (way !== null) kept.push({ patch, flip: way === "reversed" })
  }
  if (kept.length === 0) return null
  return assembled(work, kept, tolerance)
}

/** The box where two boxes overlap, null when they do not. */
function overlapOf(a: Box3, b: Box3, margin: number): Box3 | null {
  if (!boxesOverlap(a, b, margin)) return null
  return {
    min: {
      x: Math.max(a.min.x, b.min.x) - margin,
      y: Math.max(a.min.y, b.min.y) - margin,
      z: Math.max(a.min.z, b.min.z) - margin,
    },
    max: {
      x: Math.min(a.max.x, b.max.x) + margin,
      y: Math.min(a.max.y, b.max.y) + margin,
      z: Math.min(a.max.z, b.max.z) + margin,
    },
  }
}

function traceBoxOf(trace: EdgeTrace): Box3 {
  const points = Array.from({ length: 33 }, (_, i) =>
    trace.point(trace.t0 + ((trace.t1 - trace.t0) * i) / 32)
  )
  const box = boxOfPoints(points)!
  const d = sub3(box.max, box.min)
  const pad = 0.01 * Math.max(d.x, d.y, d.z)
  const v = { x: pad, y: pad, z: pad }
  return { min: sub3(box.min, v), max: add3(box.max, v) }
}

/** Samples each way over a face that a pair of surfaces with no closed form is checked at. */
const MEET_GRID = 24

/** Points of a face: over its domain or its plane's box, those inside it, and along its edges. */
function facePoints(brep: Brep, face: BrepFace, tolerance: number): Vec3[] {
  const points: Vec3[] = []
  for (const loop of face.loops) {
    for (const c of loop) {
      const t = edgeTrace(brep, brep.edges[c.edge])
      for (let i = 0; i <= 32; i++)
        points.push(t.point(t.t0 + ((t.t1 - t.t0) * i) / 32))
    }
  }
  const s = face.surface
  const grid = (at: (i: number, j: number) => Vec3) => {
    for (let i = 0; i <= MEET_GRID; i++) {
      for (let j = 0; j <= MEET_GRID; j++) {
        const q = at(i / MEET_GRID, j / MEET_GRID)
        if (facePlace(brep, face, q, tolerance) !== "outside") points.push(q)
      }
    }
  }
  if (s.kind === "plane") {
    const box = faceBox(brep, face)
    const axes = arbitraryAxis(s.normal)!
    const corners = [box.min, box.max].flatMap((p) => [
      { x: p.x, y: box.min.y, z: box.min.z },
      { x: p.x, y: box.max.y, z: box.max.z },
      { x: p.x, y: box.min.y, z: box.max.z },
      { x: p.x, y: box.max.y, z: box.min.z },
    ])
    const us = corners.map((p) => dot3(sub3(p, s.origin), axes.x))
    const vs = corners.map((p) => dot3(sub3(p, s.origin), axes.y))
    const [u0, u1, v0, v1] = [
      Math.min(...us),
      Math.max(...us),
      Math.min(...vs),
      Math.max(...vs),
    ]
    grid((i, j) =>
      add3(
        s.origin,
        add3(
          scale3(axes.x, u0 + (u1 - u0) * i),
          scale3(axes.y, v0 + (v1 - v0) * j)
        )
      )
    )
  } else {
    const region = faceRegion(brep, face)
    if (region) {
      const { u, v } = region.domain
      grid((i, j) =>
        surfacePoint(
          region.surface,
          u[0] + (u[1] - u[0]) * i,
          v[0] + (v[1] - v[0]) * j
        )
      )
    }
  }
  return points
}

/**
 * Whether two faces whose surfaces this kernel cannot intersect may still
 * meet: one's points on both sides of the other's surface, or on it. Apart,
 * the pair needs no intersection.
 */
function facesMayMeet(
  a: Brep,
  f: BrepFace,
  b: Brep,
  g: BrepFace,
  tolerance: number
): boolean {
  for (const [solid, face, other, otherSolid] of [
    [a, f, g, b],
    [b, g, f, a],
  ] as const) {
    const box = faceBox(otherSolid, other)
    let sign = 0
    for (const q of facePoints(solid, face, tolerance)) {
      if (!inBox(q, box, tolerance)) continue
      const level = surfaceLevel(other.surface, q).value
      if (Math.abs(level) <= tolerance) return true
      const s = Math.sign(level)
      if (sign !== 0 && s !== sign) return true
      sign = s
    }
  }
  return false
}

/** Two solids apart as one of two shells: B's indices after A's. */
function joined(a: Brep, b: Brep): Brep {
  const v = a.vertices.length
  const e = a.edges.length
  return {
    vertices: [...a.vertices, ...b.vertices],
    edges: [
      ...a.edges,
      ...b.edges.map((edge) => ({
        ...edge,
        start: edge.start + v,
        end: edge.end + v,
      })),
    ],
    faces: [
      ...a.faces,
      ...b.faces.map((face) => ({
        ...face,
        loops: face.loops.map((loop) =>
          loop.map((c) => ({ ...c, edge: c.edge + e }))
        ),
      })),
    ],
  }
}

/** Where a patch lies against the other solid. */
type Place = "inside" | "outside" | "same" | "opposite"

/**
 * Which patches the result keeps, and which way round: a face both solids
 * share running the same way is kept once, the first's; running opposite it
 * is where they touch, kept by none but SUBTRACT's first.
 */
function keeps(
  op: SolidOperation,
  place: Place,
  first: boolean
): "forward" | "reversed" | null {
  switch (op) {
    case "union":
      if (place === "outside") return "forward"
      return place === "same" && first ? "forward" : null
    case "intersect":
      if (place === "inside") return "forward"
      return place === "same" && first ? "forward" : null
    case "subtract":
      if (first) {
        return place === "outside" || place === "opposite" ? "forward" : null
      }
      return place === "inside" ? "reversed" : null
  }
}

/**
 * A face's pieces: its own edges cut, in its sense, and the cuts across it
 * both ways, walked into loops — at each vertex the way turning furthest
 * left of the one it came in by, in the face's tangent plane — and the loops
 * gathered into regions of its surface (`gathered`). A face nothing cuts is
 * one patch.
 */
function splitFace(
  work: Brep,
  solid: Brep,
  x: 0 | 1,
  face: BrepFace,
  edgePieces: number[][],
  cuts: number[],
  tolerance: number
): Patch[] {
  const domain = domainOf(solid, face, false)
  const boundary: Use[][] = face.loops.map((loop) =>
    loop.flatMap((c): Use[] => {
      const list = edgePieces[c.edge]
      return c.reversed
        ? [...list].reverse().map((piece) => ({ piece, reversed: true }))
        : list.map((piece) => ({ piece, reversed: false }))
    })
  )
  const untouched =
    cuts.length === 0 &&
    face.loops.every((loop) =>
      loop.every((c) => edgePieces[c.edge].length === 1)
    )
  if (untouched) {
    return [{ solid: x, face, surface: face.surface, domain, loops: boundary }]
  }
  // Point loops (an apex) stand apart from the walk.
  const points: Use[][] = []
  const directed: Use[] = []
  for (const loop of boundary) {
    if (loop.length === 1 && work.edges[loop[0].piece].curve.kind === "point")
      points.push(loop)
    else directed.push(...loop)
  }
  const live = pruned(work, directed, cuts)
  for (const piece of live) {
    directed.push({ piece, reversed: false }, { piece, reversed: true })
  }
  const loops = walked(work, face, domain, directed)
  return gathered(work, x, face, domain, loops, points, tolerance)
}

/** The cuts left once those ending nowhere (a touch, a meeting clipped short) are dropped, end by end. */
function pruned(
  work: Brep,
  directed: readonly Use[],
  cuts: readonly number[]
): number[] {
  const degree = new Map<number, number>()
  const bump = (v: number, k: number) => degree.set(v, (degree.get(v) ?? 0) + k)
  for (const u of directed) {
    const e = work.edges[u.piece]
    bump(e.start, 1)
    bump(e.end, 1)
  }
  const alive = new Set(
    cuts.filter((c) => !directed.some((u) => u.piece === c))
  )
  for (const c of alive) {
    const e = work.edges[c]
    bump(e.start, 2)
    bump(e.end, 2)
  }
  let changed = true
  while (changed) {
    changed = false
    for (const c of [...alive]) {
      const e = work.edges[c]
      if (e.start === e.end) continue
      if ((degree.get(e.start) ?? 0) <= 2 || (degree.get(e.end) ?? 0) <= 2) {
        alive.delete(c)
        bump(e.start, -2)
        bump(e.end, -2)
        changed = true
      }
    }
  }
  return [...alive]
}

function startOfUse(work: Brep, u: Use): number {
  const e = work.edges[u.piece]
  return u.reversed ? e.end : e.start
}

function endOfUse(work: Brep, u: Use): number {
  const e = work.edges[u.piece]
  return u.reversed ? e.start : e.end
}

/** The way a use leaves its start, and a chord a little along it to break a tie. */
function leaving(work: Brep, u: Use): { tangent: Vec3; chord: Vec3 } {
  const trace = edgeTrace(work, work.edges[u.piece])
  const [from, to] = u.reversed ? [trace.t1, trace.t0] : [trace.t0, trace.t1]
  const sign = u.reversed ? -1 : 1
  return {
    tangent: scale3(trace.derivative(from), sign),
    chord: sub3(trace.point(from + (to - from) * 1e-3), trace.point(from)),
  }
}

function arriving(work: Brep, u: Use): Vec3 {
  const trace = edgeTrace(work, work.edges[u.piece])
  const to = u.reversed ? trace.t0 : trace.t1
  return scale3(trace.derivative(to), u.reversed ? -1 : 1)
}

/** The face's outward normal at a point of its surface, its sense taken from `domain`. */
function normalAt(
  surface: BrepSurface,
  domain: FaceDomain | undefined,
  p: Vec3
): Vec3 {
  if (surface.kind === "plane") return surface.normal
  const uv = surfaceParams(surface, p)
  const { du, dv } = surfaceFrame(surface, uv.u, uv.v)
  const sense =
    domain &&
    Math.sign(domain.u[1] - domain.u[0]) *
      Math.sign(domain.v[1] - domain.v[0]) <
      0
      ? -1
      : 1
  const n = normalize3(cross3(du, dv)) ?? surfaceLevel(surface, p).gradient
  return scale3(n, sense)
}

/** The directed pieces walked into closed loops. */
function walked(
  work: Brep,
  face: BrepFace,
  domain: FaceDomain | undefined,
  directed: readonly Use[]
): Use[][] {
  const out = new Map<number, number[]>()
  directed.forEach((u, i) => {
    const s = startOfUse(work, u)
    const list = out.get(s)
    if (list) list.push(i)
    else out.set(s, [i])
  })
  const used = directed.map(() => false)
  const angleIn = (n: Vec3, ref: Vec3, d: Vec3) => {
    const flat = sub3(d, scale3(n, dot3(d, n)))
    return Math.atan2(dot3(n, cross3(ref, flat)), dot3(ref, flat))
  }
  const loops: Use[][] = []
  for (let start = 0; start < directed.length; start++) {
    if (used[start]) continue
    const loop: Use[] = []
    let current = start
    let closed = false
    while (!used[current]) {
      used[current] = true
      loop.push(directed[current])
      const end = endOfUse(work, directed[current])
      if (end === startOfUse(work, directed[start])) {
        closed = true
        break
      }
      const p = work.vertices[end]
      const n = normalAt(face.surface, domain, p)
      const ref = arbitraryAxis(n)!.x
      const back = angleIn(
        n,
        ref,
        scale3(arriving(work, directed[current]), -1)
      )
      let best = -1
      let bestTurn: [number, number] = [-1, -1]
      for (const next of out.get(end) ?? []) {
        if (used[next]) continue
        const u = directed[next]
        if (
          u.piece === directed[current].piece &&
          (out.get(end)?.length ?? 0) > 1
        )
          continue
        const { tangent, chord } = leaving(work, u)
        const turn: [number, number] = [
          normalizeAngle(angleIn(n, ref, tangent) - back),
          normalizeAngle(angleIn(n, ref, chord) - back),
        ]
        const better =
          Math.abs(turn[0] - bestTurn[0]) > 1e-9
            ? turn[0] > bestTurn[0]
            : turn[1] > bestTurn[1]
        if (best < 0 || better) {
          best = next
          bestTurn = turn
        }
      }
      if (best < 0) break
      current = best
    }
    if (closed) loops.push(loop)
  }
  return loops
}

function toBrepLoop(loop: readonly Use[]): BrepLoop {
  return loop.map((u) => ({ edge: u.piece, reversed: u.reversed }))
}

/** A loop's face alone, to measure it and find points inside it. */
function loneFace(
  surface: BrepSurface,
  domain: FaceDomain | undefined,
  loops: readonly (readonly Use[])[]
): BrepFace {
  return {
    surface,
    loops: loops.map(toBrepLoop),
    ...(domain ? { domain } : {}),
  }
}

/**
 * A point just off the loop, on the side the face lies (its left): what a
 * hole is found inside an outline by, never on an edge both share.
 */
function loopProbe(
  work: Brep,
  surface: BrepSurface,
  domain: FaceDomain | undefined,
  loop: readonly Use[]
): Vec3 {
  const u = loop.reduce((best, x) =>
    pieceSize(work, x.piece) > pieceSize(work, best.piece) ? x : best
  )
  const trace = edgeTrace(work, work.edges[u.piece])
  const t = (trace.t0 + trace.t1) / 2
  const m = trace.point(t)
  const along = scale3(trace.derivative(t), u.reversed ? -1 : 1)
  const left = normalize3(cross3(normalAt(surface, domain, m), along))
  if (!left) return m
  return ontoSurface(
    surface,
    add3(m, scale3(left, 1e-4 * pieceSize(work, u.piece)))
  )
}

function pieceSize(work: Brep, piece: number): number {
  const t = edgeTrace(work, work.edges[piece])
  return (
    length3(sub3(t.point(t.t1), t.point(t.t0))) +
    length3(sub3(t.point((t.t0 + t.t1) / 2), t.point(t.t0)))
  )
}

/**
 * Loops gathered into the regions of the face's surface they bound. On a
 * plane, and on a surface open both ways, each counter-clockwise loop is an
 * outline and each clockwise one a hole of the smallest outline round it. On
 * a surface closed round its axis a loop may wind round it instead: between
 * one winding the region's way and the next back lies a band, and below the
 * first or above the last the face goes on to a pole it reaches; round a
 * doughnut bands run on either way. A hole in no outline and no band lies in
 * what is left of a closed surface.
 */
function gathered(
  work: Brep,
  x: 0 | 1,
  face: BrepFace,
  domain: FaceDomain | undefined,
  loops: Use[][],
  points: Use[][],
  tolerance: number
): Patch[] {
  const surface = face.surface
  const patch = (ls: Use[][]): Patch => ({
    solid: x,
    face,
    surface,
    domain,
    loops: ls,
  })
  if (surface.kind === "plane") {
    const flat = loops.map((loop) => {
      const pf = planarFace(work, loneFace(surface, undefined, [loop]))
      return { loop, area: loopArea(pf.face.loops[0]), pf }
    })
    const outlines = flat
      .filter((l) => l.area > 0)
      .sort((p, q) => p.area - q.area)
    const holes: Use[][][] = outlines.map(() => [])
    for (const l of flat) {
      if (l.area > 0) continue
      const probe = planarPoint(
        l.pf,
        loopProbe(work, surface, undefined, l.loop)
      )
      const pieces = new Set(l.loop.map((u) => u.piece))
      const i = outlines.findIndex(
        (o) =>
          !(
            o.loop.length === l.loop.length &&
            o.loop.every((u) => pieces.has(u.piece))
          ) && pointInFaces(probe, [{ loops: [o.pf.face.loops[0]] }])
      )
      if (i >= 0) holes[i].push(l.loop)
    }
    return outlines.map((o, i) => patch([o.loop, ...holes[i]]))
  }
  const figures = loops.map((loop) => {
    const region = faceRegion(work, loneFace(surface, domain, [loop]))!
    return {
      loop,
      region,
      area: regionLoopsArea(region),
      winding: region.loops[0].winding,
    }
  })
  const sense = figures[0]?.region.sense ?? 1
  const essential = figures.filter(
    (f) => f.winding.u !== 0 || f.winding.v !== 0
  )
  const outlines = figures
    .filter((f) => f.winding.u === 0 && f.winding.v === 0 && f.area > 0)
    .sort((p, q) => p.area - q.area)
  const holes = [
    ...figures
      .filter((f) => f.winding.u === 0 && f.winding.v === 0 && f.area <= 0)
      .map((f) => f.loop),
    ...points,
  ]
  const groups: Use[][][] = outlines.map((o) => [o.loop])
  // Bands between loops that wind round, ordered along the other way.
  const bands: Use[][][] = []
  if (essential.length > 0) {
    const roundU = essential.some((f) => f.winding.u !== 0)
    const parent = faceRegion(work, face)!
    const ref = parent.domain
    const at = (f: (typeof figures)[number]) =>
      crossingOf(f.region, roundU, roundU ? ref.u[0] + 1e-3 : ref.v[0] + 1e-3)
    // Going up the other way: a loop winding the region's way opens a band.
    const opens = (f: (typeof figures)[number]) =>
      sense * (roundU ? f.winding.u : -f.winding.v) > 0
    // One curve run both ways closes the band below it before it opens the next.
    const order = essential
      .map((f) => ({ f, at: at(f) }))
      .sort((p, q) =>
        Math.abs(p.at - q.at) > 1e-9
          ? p.at - q.at
          : Number(opens(p.f)) - Number(opens(q.f))
      )
    const periodic = roundU
      ? parent.periods.v !== null
      : parent.periods.u !== null
    if (periodic) {
      const start = order.findIndex((o) => opens(o.f))
      for (let k = 0; k < order.length && start >= 0; k++) {
        const o = order[(start + k) % order.length]
        if (!opens(o.f)) continue
        const next = order[(start + k + 1) % order.length]
        bands.push(
          next && !opens(next.f) ? [o.f.loop, next.f.loop] : [o.f.loop]
        )
      }
    } else {
      let open: Use[] | null = null
      let first = true
      for (const o of order) {
        if (opens(o.f)) {
          open = o.f.loop
        } else {
          bands.push(open ? [open, o.f.loop] : first ? [o.f.loop] : [o.f.loop])
          open = null
        }
        first = false
      }
      if (open) bands.push([open])
    }
  }
  const all: Use[][][] = [...groups, ...bands]
  let rest: Use[][] | null = null
  for (const hole of holes) {
    const probe = loopProbe(work, surface, domain, hole)
    let home = -1
    const pieces = new Set(hole.map((u) => u.piece))
    for (let i = 0; i < all.length; i++) {
      // A loop's own reverse bounds what lies on its other side.
      const own = all[i][0]
      if (own.length === hole.length && own.every((u) => pieces.has(u.piece)))
        continue
      const region = faceRegion(work, loneFace(surface, domain, all[i]))
      if (!region) continue
      if (regionContains(region, surfaceParams(surface, probe))) {
        home = i
        break
      }
    }
    if (home >= 0) all[home].push(hole)
    else (rest ??= []).push(hole)
  }
  if (rest) all.push(rest)
  void tolerance
  return all.map(patch)
}

/** Where a loop crosses the line `u = at` (or `v = at`), along the other parameter. */
function crossingOf(region: FaceRegion, roundU: boolean, at: number): number {
  const P = roundU ? region.periods.u : region.periods.v
  for (const run of region.loops[0].runs) {
    if (run.kind === "pole") continue
    const ss = run.samples
    for (let i = 1; i < ss.length; i++) {
      const a = roundU ? ss[i - 1].u : ss[i - 1].v
      const b = roundU ? ss[i].u : ss[i].v
      const x = P === null ? at : at - P * Math.round((at - (a + b) / 2) / P)
      if ((a <= x && x < b) || (b <= x && x < a)) {
        const k = (x - a) / (b - a)
        const pa = roundU ? ss[i - 1].v : ss[i - 1].u
        const pb = roundU ? ss[i].v : ss[i].u
        const other = roundU ? region.periods.v : region.periods.u
        const value = pa + (pb - pa) * k
        return other === null ? value : ((value % other) + other) % other
      }
    }
  }
  return 0
}

function planarPoint(pf: ReturnType<typeof planarFace>, p: Vec3): Vec2 {
  const q = sub3(p, { x: 0, y: 0, z: 0 })
  return { x: dot3(q, pf.axes.x), y: dot3(q, pf.axes.y) }
}

/**
 * A point well inside the patch: off the middle of one of its pieces, to
 * its left in the face's tangent plane (the face is on a loop's left), at a
 * step halved until the point lies inside and clear of every edge.
 */
function* insidePoints(
  work: Brep,
  patch: Patch,
  tolerance: number
): Generator<Vec3> {
  const face = loneFace(patch.surface, patch.domain, patch.loops)
  const uses = patch.loops
    .flat()
    .filter((u) => work.edges[u.piece].curve.kind !== "point")
  const lengths = uses.map((u) => {
    const t = edgeTrace(work, work.edges[u.piece])
    return (
      length3(sub3(t.point(t.t1), t.point(t.t0))) +
      length3(sub3(t.point((t.t0 + t.t1) / 2), t.point(t.t0)))
    )
  })
  const order = uses.map((_, i) => i).sort((p, q) => lengths[q] - lengths[p])
  const size = Math.max(...lengths, tolerance)
  for (const i of order.slice(0, 6)) {
    const u = uses[i]
    const trace = edgeTrace(work, work.edges[u.piece])
    for (const share of [0.5, 0.3, 0.7]) {
      const t = trace.t0 + (trace.t1 - trace.t0) * share
      const m = trace.point(t)
      const along = scale3(trace.derivative(t), u.reversed ? -1 : 1)
      const n = normalAt(patch.surface, patch.domain, m)
      const left = normalize3(cross3(n, along))
      if (!left) continue
      for (let step = size * 0.05; step > tolerance * 20; step /= 3) {
        const q = ontoSurface(patch.surface, add3(m, scale3(left, step)))
        if (facePlace(work, face, q, tolerance * 5) === "inside") {
          yield q
          break
        }
      }
    }
  }
  // No loop to start from (a whole sphere's face), or none that gave one:
  // a point of the surface over its domain that lies inside.
  const region = patch.surface.kind === "plane" ? null : faceRegion(work, face)
  if (region) {
    const { u, v } = region.domain
    for (const [i, j] of [
      [0.5, 0.5],
      [0.25, 0.5],
      [0.75, 0.5],
      [0.5, 0.25],
      [0.5, 0.75],
      [0.3, 0.3],
      [0.7, 0.7],
    ]) {
      const q = surfacePoint(
        region.surface,
        u[0] + (u[1] - u[0]) * i,
        v[0] + (v[1] - v[0]) * j
      )
      if (facePlace(work, face, q, tolerance * 5) === "inside") yield q
    }
  }
}

function ontoSurface(s: BrepSurface, p: Vec3): Vec3 {
  if (s.kind === "plane")
    return sub3(p, scale3(s.normal, dot3(sub3(p, s.origin), s.normal)))
  const uv: UV = surfaceParams(s, p)
  return surfacePoint(s, uv.u, uv.v)
}

/** Where a patch lies against the other solid, by a point inside it. */
function placeOf(
  work: Brep,
  patch: Patch,
  other: Brep,
  tolerance: number
): Place {
  // A point where the solids only touch (two spheres, solid/s04) is on the
  // other's boundary yet not on a face of its surface: another is tried.
  let tries = 0
  for (const q of insidePoints(work, patch, tolerance)) {
    if (++tries > INSIDE_TRIES) break
    let on: Place | null = null
    for (const g of other.faces) {
      if (!sameSurface(patch.surface, g.surface, tolerance)) continue
      const place: FacePlace = facePlace(other, g, q, tolerance)
      if (place === "outside") continue
      if (place === "boundary") break
      const n = normalAt(patch.surface, patch.domain, q)
      on = dot3(n, faceNormal(other, g, q)) > 0 ? "same" : "opposite"
      break
    }
    if (on) return on
    const where = pointInSolid(other, q, tolerance)
    if (where !== "boundary") return where
  }
  throw new SolidBooleanError("failed")
}

/** Points of a patch tried for one clear of the other solid's boundary. */
const INSIDE_TRIES = 12

/**
 * The kept patches sewn into one B-rep on the pieces they share, each used
 * once each way; faces of one surface that meet across a piece merged, and
 * pieces of one curve joined where nothing else meets them.
 */
function assembled(
  base: Brep,
  kept: readonly { patch: Patch; flip: boolean }[],
  tolerance: number
): Brep {
  let work = base
  let faces: {
    surface: BrepSurface
    domain: FaceDomain | undefined
    loops: Use[][]
  }[] = kept.map(({ patch, flip }) => {
    if (!flip)
      return {
        surface: patch.surface,
        domain: patch.domain,
        loops: patch.loops,
      }
    const surface: BrepSurface =
      patch.surface.kind === "plane"
        ? { ...patch.surface, normal: scale3(patch.surface.normal, -1) }
        : patch.surface
    const domain = patch.domain
      ? {
          u: [patch.domain.u[1], patch.domain.u[0]] as [number, number],
          v: patch.domain.v,
        }
      : undefined
    return {
      surface,
      domain,
      loops: patch.loops.map((loop) =>
        [...loop]
          .reverse()
          .map((u) => ({ piece: u.piece, reversed: !u.reversed }))
      ),
    }
  })
  faces = faces.map((face) => seamless(work, face))
  faces = merged(work, faces, tolerance)
  ;({ work, faces } = joinedPieces(work, faces, tolerance))
  // Each piece used once along and once against.
  const along = new Map<number, number>()
  const against = new Map<number, number>()
  for (const face of faces) {
    for (const loop of face.loops) {
      for (const u of loop) {
        const map = u.reversed ? against : along
        map.set(u.piece, (map.get(u.piece) ?? 0) + 1)
      }
    }
  }
  for (const [piece, n] of along) {
    const point = work.edges[piece].curve.kind === "point"
    if (
      point
        ? n + (against.get(piece) ?? 0) !== 1
        : n !== 1 || against.get(piece) !== 1
    ) {
      throw new SolidBooleanError("failed")
    }
  }
  for (const [piece, n] of against) {
    if (
      work.edges[piece].curve.kind !== "point" &&
      (n !== 1 || along.get(piece) !== 1)
    ) {
      throw new SolidBooleanError("failed")
    }
  }
  return compacted(work, faces)
}

type Built = {
  surface: BrepSurface
  domain: FaceDomain | undefined
  loops: Use[][]
}

/**
 * A face's pieces it runs both ways — where two solids only touch along a
 * line (a cylinder lying on a plane, union/s04), a seam of its own — taken
 * out and the rest walked again.
 */
function seamless(work: Brep, face: Built): Built {
  const along = new Set<number>()
  const against = new Set<number>()
  for (const loop of face.loops) {
    for (const u of loop) (u.reversed ? against : along).add(u.piece)
  }
  const seams = [...along].filter(
    (p) => against.has(p) && work.edges[p].curve.kind !== "point"
  )
  if (seams.length === 0) return face
  const drop = new Set(seams)
  const rest = face.loops.flat().filter((u) => !drop.has(u.piece))
  const loops = walked(
    work,
    loneFace(face.surface, face.domain, face.loops),
    face.domain,
    rest
  )
  return { ...face, loops }
}

/**
 * Faces of one surface, facing one way, that share a piece become one: the
 * shared pieces dropped and the rest walked into loops again (union/k02's
 * flush boxes, whose tops become one face).
 */
function merged(work: Brep, faces: Built[], tolerance: number): Built[] {
  const list = [...faces]
  let changed = true
  while (changed) {
    changed = false
    const owner = new Map<number, number[]>()
    list.forEach((face, i) => {
      for (const loop of face.loops) {
        for (const u of loop) {
          const l = owner.get(u.piece)
          if (l) l.push(i)
          else owner.set(u.piece, [i])
        }
      }
    })
    outer: for (const [, owners] of owner) {
      if (owners.length !== 2 || owners[0] === owners[1]) continue
      const [i, j] = owners
      const f = list[i]
      const g = list[j]
      if (!sameSurface(f.surface, g.surface, tolerance)) continue
      const p = work.vertices[work.edges[f.loops[0][0].piece].start]
      if (
        dot3(
          normalAt(f.surface, f.domain, p),
          normalAt(g.surface, g.domain, p)
        ) <= 0
      )
        continue
      const shared = new Set<number>()
      for (const loop of f.loops) for (const u of loop) shared.add(u.piece)
      const both = new Set<number>()
      for (const loop of g.loops)
        for (const u of loop) if (shared.has(u.piece)) both.add(u.piece)
      const rest = [...f.loops.flat(), ...g.loops.flat()].filter(
        (u) => !both.has(u.piece)
      )
      const loops = walked(
        work,
        loneFace(f.surface, f.domain, f.loops),
        f.domain,
        rest
      )
      const together: Built = { surface: f.surface, domain: f.domain, loops }
      list.splice(j, 1)
      list.splice(i, 1, together)
      changed = true
      break outer
    }
  }
  return list
}

/** Whether two edges lie on one curve: a line through both, one circle or ellipse either way round. */
function oneCurve(
  vertices: readonly Vec3[],
  p: BrepEdge,
  q: BrepEdge,
  tolerance: number
): boolean {
  const a = p.curve
  const b = q.curve
  const close = (x: Vec3, y: Vec3) => length3(sub3(x, y)) <= tolerance
  const along = (x: Vec3, y: Vec3) =>
    length3(cross3(normalize3(x)!, normalize3(y)!)) <= 1e-9
  if (a.kind === "line" && b.kind === "line") {
    const ends = [p.start, p.end, q.start, q.end].map((v) => vertices[v])
    const d = sub3(ends[1], ends[0])
    return [ends[2], ends[3]].every((x) => {
      const w = sub3(x, ends[0])
      return length3(cross3(w, normalize3(d)!)) <= tolerance
    })
  }
  if (a.kind === "circle" && b.kind === "circle") {
    return (
      close(a.center, b.center) &&
      Math.abs(a.radius - b.radius) <= tolerance &&
      along(a.normal, b.normal)
    )
  }
  if (a.kind === "ellipse" && b.kind === "ellipse") {
    return (
      close(a.center, b.center) &&
      along(a.normal, b.normal) &&
      along(a.majorAxis, b.majorAxis) &&
      Math.abs(length3(a.majorAxis) - length3(b.majorAxis)) <= tolerance &&
      Math.abs(a.ratio - b.ratio) <= 1e-9
    )
  }
  return false
}

/**
 * Pieces of one curve that meet at a vertex nothing else reaches joined
 * into one edge, as ACIS leaves none (union/k02: the flush boxes' edges run
 * whole across where they met).
 */
function joinedPieces(
  work: Brep,
  faces: Built[],
  tolerance: number
): { work: Brep; faces: Built[] } {
  const edges = [...work.edges]
  const list = faces.map((f) => ({ ...f, loops: f.loops.map((l) => [...l]) }))
  const startOf = (u: Use) =>
    u.reversed ? edges[u.piece].end : edges[u.piece].start
  const endOf = (u: Use) =>
    u.reversed ? edges[u.piece].start : edges[u.piece].end
  for (let guard = 0; guard < 10000; guard++) {
    const at = new Map<number, Set<number>>()
    for (const f of list) {
      for (const loop of f.loops) {
        for (const u of loop) {
          const e = edges[u.piece]
          if (e.curve.kind === "point") continue
          for (const v of [e.start, e.end]) {
            let set = at.get(v)
            if (!set) at.set(v, (set = new Set()))
            set.add(u.piece)
          }
        }
      }
    }
    let done = true
    for (const [v, set] of at) {
      if (set.size !== 2) continue
      const [p, q] = [...set]
      const ep = edges[p]
      const eq = edges[q]
      if (ep.start === ep.end || eq.start === eq.end) continue
      if (!oneCurve(work.vertices, ep, eq, tolerance)) continue
      // Where a face runs one into the other, the joined edge runs its way.
      let joined = -1
      let way: Use | null = null
      for (const f of list) {
        for (const loop of f.loops) {
          for (let i = 0; i < loop.length; i++) {
            const u1 = loop[i]
            const u2 = loop[(i + 1) % loop.length]
            if (
              (joined < 0 && u1.piece === p && u2.piece === q) ||
              (joined < 0 && u1.piece === q && u2.piece === p)
            ) {
              if (endOf(u1) !== v) continue
              const c = edges[u1.piece].curve
              const curve: BrepCurve =
                u1.reversed && (c.kind === "circle" || c.kind === "ellipse")
                  ? { ...c, normal: unsigned0(scale3(c.normal, -1)) }
                  : c
              joined = edges.length
              way = u1
              edges.push({ start: startOf(u1), end: endOf(u2), curve })
            }
          }
        }
      }
      if (joined < 0) continue
      for (const f of list) {
        f.loops = f.loops.map((loop) => {
          for (let i = 0; i < loop.length; i++) {
            const u1 = loop[i]
            const j = (i + 1) % loop.length
            const u2 = loop[j]
            const pair =
              (u1.piece === p && u2.piece === q) ||
              (u1.piece === q && u2.piece === p)
            if (!pair || endOf(u1) !== v) continue
            // Its way is the first face's: a loop closed on one vertex says none.
            const forward =
              u1.piece === way!.piece && u1.reversed === way!.reversed
            const use: Use = { piece: joined, reversed: !forward }
            const out = loop.filter((_, k) => k !== i && k !== j)
            out.splice(Math.min(i, out.length), 0, use)
            return j === 0 ? [use, ...loop.slice(1, i)] : out
          }
          return loop
        })
      }
      done = false
      break
    }
    if (done) break
  }
  return { work: { ...work, edges }, faces: list }
}

/** The used vertices and pieces numbered afresh. */
function compacted(work: Brep, faces: readonly Built[]): Brep {
  const edgeMap = new Map<number, number>()
  const vertexMap = new Map<number, number>()
  const vertices: Vec3[] = []
  const edges: BrepEdge[] = []
  const vertex = (v: number) => {
    let found = vertexMap.get(v)
    if (found === undefined) {
      found = vertices.length
      vertices.push(unsigned0(work.vertices[v]))
      vertexMap.set(v, found)
    }
    return found
  }
  const edge = (piece: number) => {
    let found = edgeMap.get(piece)
    if (found === undefined) {
      const e = work.edges[piece]
      found = edges.length
      edges.push({ start: vertex(e.start), end: vertex(e.end), curve: e.curve })
      edgeMap.set(piece, found)
    }
    return found
  }
  return {
    vertices,
    edges,
    faces: faces.map((face) => ({
      surface: face.surface,
      loops: face.loops.map((loop) =>
        loop.map((u) => ({ edge: edge(u.piece), reversed: u.reversed }))
      ),
      ...(face.domain ? { domain: unsignedDomain(face.domain) } : {}),
    })),
  }
}
