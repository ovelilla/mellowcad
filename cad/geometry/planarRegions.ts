import { V, Vec2 } from "./Vec2"
import { normalizeAngle } from "./primitives"
import {
  MODEL_TOLERANCE,
  PlanarCurve,
  curveClosest,
  curveEnd,
  curveLength,
  curveMeetings,
  curvePiece,
  curvePoint,
  curveReversed,
  curveStart,
  curveSweptArea,
  curveTangent,
  rayCrossings,
} from "./planarCurves"

/**
 * The topology of a planar region, the kernel's first: a region is faces, a
 * face is loops, a loop is edges run end to end. A face's first loop is its
 * outline, counter-clockwise; the others are its holes, clockwise, so the
 * face is always on an edge's left. Faces never overlap.
 */
export type RegionLoop = readonly PlanarCurve[]

export interface RegionFace {
  readonly loops: readonly RegionLoop[]
}

export type RegionOperation = "union" | "intersect" | "subtract"

/** The signed area a loop encloses, positive counter-clockwise. */
export function loopArea(loop: RegionLoop): number {
  let sum = 0
  for (const edge of loop) sum += curveSweptArea(edge)
  return sum
}

export function loopLength(loop: RegionLoop): number {
  let sum = 0
  for (const edge of loop) sum += curveLength(edge)
  return sum
}

export function loopReversed(loop: RegionLoop): RegionLoop {
  return [...loop].reverse().map(curveReversed)
}

/** The faces' area: each outline's less its holes'. */
export function facesArea(faces: readonly RegionFace[]): number {
  let sum = 0
  for (const face of faces) for (const loop of face.loops) sum += loopArea(loop)
  return sum
}

/** Every loop's length, holes included, as AutoCAD's Perimeter counts them (region/b02). */
export function facesPerimeter(faces: readonly RegionFace[]): number {
  let sum = 0
  for (const face of faces)
    for (const loop of face.loops) sum += loopLength(loop)
  return sum
}

function allEdges(faces: readonly RegionFace[]): PlanarCurve[] {
  return faces.flatMap((face) => face.loops.flat())
}

/** Directions a ray is cast in, tried in turn until one passes cleanly. */
const RAY_TRIES = 16

/**
 * Whether `point` lies inside the faces, by the parity of the crossings of a
 * ray cast from it: the faces never overlap and a hole lies in its outline,
 * so an odd count is inside. A ray through an edge's end or grazing an edge
 * is cast again at another angle. A point on an edge is not asked here.
 */
export function pointInFaces(
  point: Vec2,
  faces: readonly RegionFace[]
): boolean {
  const edges = allEdges(faces)
  for (let k = 0; k < RAY_TRIES; k++) {
    // The golden angle never brings a direction back near an earlier one.
    const angle = 0.3 + k * 2.399963229728653
    const direction = { x: Math.cos(angle), y: Math.sin(angle) }
    let count = 0
    let clean = true
    for (const edge of edges) {
      const hits = rayCrossings(edge, point, direction)
      if (hits === null) {
        clean = false
        break
      }
      count += hits.length
    }
    if (clean) return count % 2 === 1
  }
  return false
}

/** Where a piece of one region's edge lies against the other region. */
type Placement = "inside" | "outside" | "same" | "opposite"

interface Piece {
  readonly curve: PlanarCurve
  readonly placement: Placement
}

/**
 * Every edge of `faces` cut where the other region's edges meet it, and each
 * piece placed by its middle: inside or outside the other, or along one of
 * its edges, running the same way or the opposite.
 */
function placedPieces(
  faces: readonly RegionFace[],
  others: readonly RegionFace[]
): Piece[] {
  const edges = allEdges(faces)
  const otherEdges = allEdges(others)
  const out: Piece[] = []
  for (const edge of edges) {
    const cuts = [0, 1]
    for (const other of otherEdges) {
      const { meetings, overlaps } = curveMeetings(edge, other)
      for (const m of meetings) cuts.push(m.s)
      for (const o of overlaps) cuts.push(o.s0, o.s1)
    }
    cuts.sort((a, b) => a - b)
    const length = curveLength(edge)
    const minStep = length > 0 ? MODEL_TOLERANCE / length : 1
    const stops = [0]
    for (const s of cuts) {
      if (s - stops[stops.length - 1] > minStep && 1 - s > minStep)
        stops.push(s)
    }
    stops.push(1)
    for (let i = 0; i + 1 < stops.length; i++) {
      const curve =
        stops.length === 2 ? edge : curvePiece(edge, stops[i], stops[i + 1])
      out.push({ curve, placement: placement(curve, otherEdges, others) })
    }
  }
  return out
}

function placement(
  curve: PlanarCurve,
  otherEdges: readonly PlanarCurve[],
  others: readonly RegionFace[]
): Placement {
  const mid = curvePoint(curve, 0.5)
  for (const edge of otherEdges) {
    const hit = curveClosest(edge, mid)
    if (hit.distance > MODEL_TOLERANCE) continue
    const along = V.dot(curveTangent(curve, 0.5), curveTangent(edge, hit.s))
    return along >= 0 ? "same" : "opposite"
  }
  return pointInFaces(mid, others) ? "inside" : "outside"
}

/**
 * Which pieces of each region the result keeps, and which way they run. An
 * edge both share is kept once, from the first region: running the same way
 * it bounds both on one side (kept by a union or an intersection), running
 * opposite it is where they touch (kept by a subtraction only).
 */
function keeps(
  op: RegionOperation,
  placement: Placement,
  first: boolean
): "forward" | "reversed" | null {
  switch (op) {
    case "union":
      if (placement === "outside") return "forward"
      return placement === "same" && first ? "forward" : null
    case "intersect":
      if (placement === "inside") return "forward"
      return placement === "same" && first ? "forward" : null
    case "subtract":
      if (first) {
        return placement === "outside" || placement === "opposite"
          ? "forward"
          : null
      }
      return placement === "inside" ? "reversed" : null
  }
}

/**
 * `a` combined with `b`: their union, their intersection, or `a` less `b`.
 * Both are faces of one plane in the same coordinates. Empty when nothing is
 * left: AutoCAD's null region (region/b05, b06).
 */
export function regionBoolean(
  op: RegionOperation,
  a: readonly RegionFace[],
  b: readonly RegionFace[]
): RegionFace[] {
  const kept: PlanarCurve[] = []
  for (const [faces, others, first] of [
    [a, b, true],
    [b, a, false],
  ] as const) {
    for (const piece of placedPieces(faces, others)) {
      const way = keeps(op, piece.placement, first)
      if (way === "forward") kept.push(piece.curve)
      else if (way === "reversed") kept.push(curveReversed(piece.curve))
    }
  }
  return facesFromLoops(chainLoops(kept))
}

/** Points closer than the tolerance are one node; a grid finds them in constant time. */
class Nodes {
  readonly points: Vec2[] = []
  private readonly cells = new Map<string, number[]>()

  constructor(private readonly size: number) {}

  add(point: Vec2): number {
    const cx = Math.floor(point.x / this.size)
    const cy = Math.floor(point.y / this.size)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const i of this.cells.get(`${cx + dx},${cy + dy}`) ?? []) {
          if (V.distance(this.points[i], point) <= this.size) return i
        }
      }
    }
    const index = this.points.length
    this.points.push(point)
    const key = `${cx},${cy}`
    const bucket = this.cells.get(key)
    if (bucket) bucket.push(index)
    else this.cells.set(key, [index])
    return index
  }
}

/** The direction a curve leaves its start in, as an angle, its chord's breaking a tie. */
function leavingAngle(curve: PlanarCurve): readonly [number, number] {
  const t = curveTangent(curve, 0)
  const ahead = V.sub(curvePoint(curve, 1e-3), curveStart(curve))
  return [Math.atan2(t.y, t.x), Math.atan2(ahead.y, ahead.x)]
}

function arrivingAngle(curve: PlanarCurve): number {
  const t = curveTangent(curve, 1)
  return Math.atan2(t.y, t.x)
}

/**
 * Directed edges joined end to end into closed loops. Where several leave one
 * node, the walk takes the one turning furthest left of the way it came in,
 * which keeps the loops smallest: two faces touching at a corner stay two.
 */
export function chainLoops(curves: readonly PlanarCurve[]): RegionLoop[] {
  const nodes = new Nodes(MODEL_TOLERANCE * 10)
  const from = curves.map((c) => nodes.add(curveStart(c)))
  const to = curves.map((c) => nodes.add(curveEnd(c)))
  const leaving = new Map<number, number[]>()
  curves.forEach((_, i) => {
    const list = leaving.get(from[i])
    if (list) list.push(i)
    else leaving.set(from[i], [i])
  })
  const used = curves.map(() => false)
  const loops: RegionLoop[] = []
  for (let start = 0; start < curves.length; start++) {
    if (used[start]) continue
    const loop: PlanarCurve[] = []
    let current = start
    let closed = false
    while (!used[current]) {
      used[current] = true
      loop.push(curves[current])
      if (to[current] === from[start]) {
        closed = true
        break
      }
      const back = arrivingAngle(curves[current]) + Math.PI
      let best = -1
      let bestTurn: readonly [number, number] = [-1, -1]
      for (const next of leaving.get(to[current]) ?? []) {
        if (used[next]) continue
        const [tangent, chord] = leavingAngle(curves[next])
        const turn = [
          normalizeAngle(tangent - back),
          normalizeAngle(chord - back),
        ] as const
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
    if (
      closed &&
      Math.abs(loopArea(loop)) > MODEL_TOLERANCE * MODEL_TOLERANCE
    ) {
      loops.push(loop)
    }
  }
  return loops
}

/** A point of the loop's own: an edge's middle, which no corner shared with another loop reaches. */
function loopProbe(loop: RegionLoop): Vec2 {
  const longest = loop.reduce((best, edge) =>
    curveLength(edge) > curveLength(best) ? edge : best
  )
  return curvePoint(longest, 0.5)
}

/**
 * Loops sorted into faces: each counter-clockwise loop an outline, each
 * clockwise one a hole of the smallest outline round it.
 */
export function facesFromLoops(loops: readonly RegionLoop[]): RegionFace[] {
  const outlines = loops
    .map((loop) => ({ loop, area: loopArea(loop) }))
    .filter((o) => o.area > 0)
    .sort((x, y) => x.area - y.area)
  const holes: RegionLoop[][] = outlines.map(() => [])
  for (const loop of loops) {
    if (loopArea(loop) > 0) continue
    const probe = loopProbe(loop)
    const index = outlines.findIndex((o) =>
      pointInFaces(probe, [{ loops: [o.loop] }])
    )
    if (index >= 0) holes[index].push(loop)
  }
  return outlines.map((o, i) => ({ loops: [o.loop, ...holes[i]] }))
}

/**
 * Whether the loop crosses or touches itself anywhere but where one edge
 * runs into the next: what REGION rejects as "Self intersections" (region/p03,
 * p15, a closed polyline of two vertices among them).
 */
export function loopSelfIntersects(loop: RegionLoop): boolean {
  const n = loop.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const { meetings, overlaps } = curveMeetings(loop[i], loop[j])
      if (overlaps.some((o) => o.s1 - o.s0 > 1e-9)) return true
      const nextOf = j === i + 1
      const wraps = i === 0 && j === n - 1
      for (const m of meetings) {
        // Neighbours share their joint: that one meeting is no crossing.
        if (nextOf && m.s > 1 - 1e-7 && m.t < 1e-7) continue
        if (wraps && m.s < 1e-7 && m.t > 1 - 1e-7) continue
        if (n === 1) continue
        return true
      }
    }
  }
  return (
    n === 0 || Math.abs(loopArea(loop)) <= MODEL_TOLERANCE * MODEL_TOLERANCE
  )
}

/** How much open geometry one REGION will chain: the faces' walk is quadratic in it. */
export const MAX_REGION_EDGES = 4000

/**
 * The loops REGION finds in open curves joined end to end — never where they
 * cross, which is BOUNDARY's work (region/p04). Loose chains are dropped;
 * each connected piece gives each face its walk closes and, round more than
 * one face, its outline too: three lines making two squares give the two
 * squares and the rectangle round both (region/p10), a grid of four the four
 * and the outline (p13). Every loop runs counter-clockwise, and `sources`
 * says which of `curves` each of its edges is. `null` past
 * {@link MAX_REGION_EDGES}.
 */
export function loopsFromCurves(
  curves: readonly PlanarCurve[]
): { loops: RegionLoop[]; sources: number[][] } | null {
  if (curves.length > MAX_REGION_EDGES) return null
  const nodes = new Nodes(MODEL_TOLERANCE * 10)
  const edges = curves
    .map((curve, source) => ({
      curve,
      source,
      from: nodes.add(curveStart(curve)),
      to: nodes.add(curveEnd(curve)),
    }))
    .filter((e) => e.from !== e.to || curveLength(e.curve) > MODEL_TOLERANCE)
  const alive = pruneLoose(edges, nodes.points.length)
  const live = edges.filter((_, i) => alive[i])
  // Both ways along each edge; the walk keeps the face on its left.
  const directed = live.flatMap((e) => [
    { curve: e.curve, source: e.source, from: e.from, to: e.to },
    {
      curve: curveReversed(e.curve),
      source: e.source,
      from: e.to,
      to: e.from,
    },
  ])
  const leaving = new Map<number, number[]>()
  directed.forEach((d, i) => {
    const list = leaving.get(d.from)
    if (list) list.push(i)
    else leaving.set(d.from, [i])
  })
  const visited = directed.map(() => false)
  const component = componentsOf(live, nodes.points.length)
  type Found = { loop: RegionLoop; sources: number[] }
  const faces = new Map<number, Found[]>()
  const outlines = new Map<number, Found>()
  for (let start = 0; start < directed.length; start++) {
    if (visited[start]) continue
    const cycle: PlanarCurve[] = []
    const sources: number[] = []
    let current = start
    while (!visited[current]) {
      visited[current] = true
      cycle.push(directed[current].curve)
      sources.push(directed[current].source)
      const back = arrivingAngle(directed[current].curve) + Math.PI
      let best = -1
      let bestTurn: readonly [number, number] = [-1, -1]
      for (const next of leaving.get(directed[current].to) ?? []) {
        if (
          next === (current ^ 1) &&
          (leaving.get(directed[current].to)?.length ?? 0) > 1
        )
          continue
        const [tangent, chord] = leavingAngle(directed[next].curve)
        const turn = [
          normalizeAngle(tangent - back),
          normalizeAngle(chord - back),
        ] as const
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
    if (current !== start) continue
    const key = component[directed[start].from]
    if (loopArea(cycle) > 0) {
      const list = faces.get(key)
      if (list) list.push({ loop: cycle, sources })
      else faces.set(key, [{ loop: cycle, sources }])
    } else {
      outlines.set(key, {
        loop: loopReversed(cycle),
        sources: [...sources].reverse(),
      })
    }
  }
  const found: Found[] = []
  for (const [key, list] of faces) {
    found.push(...list)
    const outline = outlines.get(key)
    if (list.length > 1 && outline) found.push(outline)
  }
  return {
    loops: found.map((f) => f.loop),
    sources: found.map((f) => f.sources),
  }
}

function pruneLoose(
  edges: readonly { from: number; to: number }[],
  nodeCount: number
): boolean[] {
  const degree = new Array<number>(nodeCount).fill(0)
  const incident: number[][] = Array.from({ length: nodeCount }, () => [])
  edges.forEach((e, i) => {
    degree[e.from] += 1
    degree[e.to] += 1
    incident[e.from].push(i)
    incident[e.to].push(i)
  })
  const alive = edges.map(() => true)
  const loose: number[] = []
  for (let node = 0; node < nodeCount; node++)
    if (degree[node] === 1) loose.push(node)
  while (loose.length > 0) {
    const node = loose.pop() as number
    if (degree[node] !== 1) continue
    const edge = incident[node].find((i) => alive[i])
    if (edge === undefined) continue
    alive[edge] = false
    for (const end of [edges[edge].from, edges[edge].to]) {
      degree[end] -= 1
      if (degree[end] === 1) loose.push(end)
    }
  }
  return alive
}

/** Each node's connected piece, as the smallest node in it. */
function componentsOf(
  edges: readonly { from: number; to: number }[],
  nodeCount: number
): number[] {
  const parent = Array.from({ length: nodeCount }, (_, i) => i)
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]]
      i = parent[i]
    }
    return i
  }
  for (const e of edges) {
    const a = find(e.from)
    const b = find(e.to)
    if (a !== b) parent[Math.max(a, b)] = Math.min(a, b)
  }
  return parent.map((_, i) => find(i))
}
