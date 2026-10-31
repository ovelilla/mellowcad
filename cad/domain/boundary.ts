import { V, Vec2 } from "../geometry/Vec2"
import {
  angleWithinSweep,
  circleCircleIntersection,
  infiniteLineIntersection,
  normalizeAngle,
  polarPoint,
  segmentArcIntersection,
} from "../geometry/primitives"
import {
  Bounds,
  Entity,
  HatchLoop,
  measureTextInk,
  measureTextWidth,
  mtextLayout,
  polylineSegmentGeometries,
  textStartOffset,
} from "./entities"
import {
  TEXT_FONT_ASCENT,
  TEXT_FONT_CAP_HEIGHT,
  TEXT_FONT_DESCENT,
} from "./textFontMetrics"

/**
 * Tracing the boundary of the enclosed area around a point — what AutoCAD's
 * HATCH and BOUNDARY commands do from an internal pick: "Determines a boundary
 * from existing objects that form an enclosed area around the specified point."
 *
 * The objects themselves do not have to enclose anything on their own: the area
 * may be bounded by loose lines and arcs crossing each other, which is why this
 * cannot reuse {@link hatchLoopFromEntity}. Every object is cut at each of its
 * intersections, the pieces become a planar graph, and its faces are walked.
 *
 * Islands come out of the same walk. AutoCAD's initial island style is **Outer**
 * (HPISLANDDETECTION 1, "hatches only areas outside of islands"), so what is
 * returned is the enclosing face plus the areas *directly* inside it — anything
 * nested deeper stays part of the island and is left blank. A TEXT or MTEXT in
 * the face is an island too, by a box round it ({@link textIslandBox}).
 */

/** Two points closer than this are the same node of the boundary graph. */
const NODE_TOLERANCE = 1e-6

/**
 * How much geometry one trace will look at. Cutting every object against every
 * other is quadratic, and a boundary is a local question, so a drawing past
 * this size is declined rather than frozen over. AutoCAD's equivalent lever is
 * the boundary set (its Everything option, "everything visible in the current
 * viewport", is what the caller is expected to hand in).
 */
const MAX_BOUNDARY_CURVES = 2000

/** How finely a boundary arc is sampled when testing areas and containment. */
const FACET_ANGLE = Math.PI / 18

/** Below this a face is a sliver between overlapping objects, not an area. */
const AREA_EPSILON = 1e-9

/**
 * How far a TEXT's island box reaches past its ink and advance, as a share of
 * its height, on every side: 2.5853 at 10 and 5.1706 at 20 (probes hatch/p123,
 * p125). Measured, not documented: the rule behind it is **unverified**.
 */
const TEXT_BOX_MARGIN = 0.25853

/** An MTEXT's, past its lines' ascent and descent (p127: 0.625 at 2.5). */
const MTEXT_BOX_MARGIN = 0.25

/**
 * A piece of boundary geometry, parametrised over `t` in `[0, 1]`. Arcs always
 * sweep counter-clockwise, and never further than half a turn, so the bulge
 * they become stays well conditioned.
 */
type Curve =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly sweep: number
    }

interface Edge {
  readonly curve: Curve
  readonly from: number
  readonly to: number
}

/** One traversal of an edge, in one of its two directions. */
interface Directed {
  readonly edge: number
  readonly reversed: boolean
  readonly from: number
  readonly to: number
  /** Direction of travel where it leaves `from`, as an angle. */
  readonly outAngle: number
  /** Direction of travel where it arrives at `to`, as an angle. */
  readonly inAngle: number
}

interface Region {
  readonly cycle: readonly number[]
  readonly ring: readonly Vec2[]
  readonly area: number
  /** A point strictly inside, for deciding what is nested in what. */
  readonly inside: Vec2 | null
}

/**
 * The loops enclosing `point`, ready to hand to `createHatch`: the surrounding
 * boundary first, then its islands. `null` when the point is not enclosed by
 * the geometry given — AutoCAD's "Valid hatch boundary not found."
 *
 * `entities` is the boundary set the caller chose to consider. Lines, arcs,
 * circles and polylines bound the area; a TEXT or MTEXT lying in it becomes an
 * island box (AutoCAD's text-box loop, flagged `92 . 24`, probe hatch/p125);
 * anything else is ignored.
 */
export function traceBoundaryLoops(
  point: Vec2,
  entities: readonly Entity[]
): HatchLoop[] | null {
  const curves = collectCurves(entities)
  if (curves === null || curves.length === 0) return null

  const nodes = new NodeIndex()
  const built: Edge[] = []
  for (const curve of splitCurves(curves)) {
    const from = nodes.add(curveStart(curve))
    const to = nodes.add(curveEnd(curve))
    if (from !== to) built.push({ curve, from, to })
  }
  // A gap in the outline leaves a loose end, and AutoCAD's initial HPGAPTOL is
  // 0: "the objects must enclose the area with no gaps". Dropping the dangling
  // chains leaves only closed cycles, so the walk cannot wander into one.
  const edges = pruneOpenEnds(built, nodes.count)
  if (edges.length === 0) return null

  const directed = directedEdges(edges)
  const regions: Region[] = []
  for (const cycle of traceFaces(directed, nodes.count)) {
    const ring = cycleRing(cycle, directed, edges, nodes.points)
    const area = signedArea(ring)
    // A clockwise cycle is a face's *hole*, and the unbounded face's outline;
    // every bounded area shows up exactly once, counter-clockwise.
    if (area > AREA_EPSILON) {
      regions.push({ cycle, ring, area, inside: interiorPoint(ring) })
    }
  }

  const containing = regions.filter((region) => pointInRing(region.ring, point))
  if (containing.length === 0) return null
  const face = containing.reduce((best, r) => (r.area < best.area ? r : best))

  const inner = regions.filter(
    (region) =>
      region !== face &&
      region.area < face.area &&
      region.inside !== null &&
      pointInRing(face.ring, region.inside)
  )
  const islands = inner.filter(
    (region) =>
      !inner.some(
        (other) =>
          other !== region &&
          other.area > region.area &&
          region.inside !== null &&
          pointInRing(other.ring, region.inside)
      )
  )

  const loops = [face, ...islands].map((region) =>
    cycleLoop(region.cycle, directed, edges, nodes.points)
  )
  for (const entity of entities) {
    const box = textIslandBox(entity)
    if (!box || !box.every((corner) => pointInRing(face.ring, corner))) continue
    // Outer: a text inside an island stays part of it, blank already.
    const centre = V.lerp(box[0], box[2], 0.5)
    if (islands.some((island) => pointInRing(island.ring, centre))) continue
    loops.push({ vertices: box })
  }
  return loops
}

/**
 * The box a TEXT or MTEXT keeps clear of a hatch traced round it, in order
 * round it, or `null` for anything else. A TEXT's spans its ink across the
 * baseline and its advance along it (from the ink's start where a glyph
 * overhangs it, as `textStartOffset` sets it), plus {@link TEXT_BOX_MARGIN}:
 * ABC at 80,45, height 10, is 77.3943,42.2442–111.31,57.7558 (p125), its right
 * side 0.3138·h past the ink, 0.2585·h past the advance. An MTEXT's spans its
 * lines' advances by the font's ascent and descent, plus
 * {@link MTEXT_BOX_MARGIN} (p127, one line; several are **unverified**).
 */
export function textIslandBox(entity: Entity): Vec2[] | null {
  if (entity.type === "text") {
    const { value, height } = entity
    const start = textStartOffset(entity.justify, value, height)
    const ink = measureTextInk(value, height)
    const margin = TEXT_BOX_MARGIN * height
    return boxCorners(entity.position, entity.rotation, {
      x0: start.x + Math.min(0, ink.x0) - margin,
      x1: start.x + Math.max(measureTextWidth(value, height), ink.x1) + margin,
      y0: start.y + ink.y0 - margin,
      y1: start.y + ink.y1 + margin,
    })
  }
  if (entity.type !== "mtext") return null
  const h = entity.height
  const lines = mtextLayout(entity).lines.filter(
    (line) => line.value.trim().length > 0
  )
  if (lines.length === 0) return null
  const box = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }
  for (const line of lines) {
    const ink = measureTextInk(line.value, h)
    const width = measureTextWidth(line.value, h)
    box.x0 = Math.min(box.x0, line.start + Math.min(0, ink.x0))
    box.x1 = Math.max(box.x1, line.start + Math.max(width, ink.x1))
    box.y0 = Math.min(
      box.y0,
      line.y - (TEXT_FONT_DESCENT / TEXT_FONT_CAP_HEIGHT) * h
    )
    box.y1 = Math.max(
      box.y1,
      line.y + (TEXT_FONT_ASCENT / TEXT_FONT_CAP_HEIGHT) * h
    )
  }
  const margin = MTEXT_BOX_MARGIN * h
  return boxCorners(entity.position, entity.rotation, {
    x0: box.x0 - margin,
    x1: box.x1 + margin,
    y0: box.y0 - margin,
    y1: box.y1 + margin,
  })
}

/** A box of an object's own frame, its four corners in the plan, anticlockwise. */
function boxCorners(
  origin: Vec2,
  rotation: number,
  box: { x0: number; x1: number; y0: number; y1: number }
): Vec2[] {
  const along = { x: Math.cos(rotation), y: Math.sin(rotation) }
  const across = V.perpendicular(along)
  const at = (x: number, y: number) =>
    V.add(origin, V.add(V.scale(along, x), V.scale(across, y)))
  return [
    at(box.x0, box.y0),
    at(box.x1, box.y0),
    at(box.x1, box.y1),
    at(box.x0, box.y1),
  ]
}

function collectCurves(entities: readonly Entity[]): Curve[] | null {
  const curves: Curve[] = []
  for (const entity of entities) {
    switch (entity.type) {
      case "line":
        pushLine(curves, entity.start, entity.end)
        break
      case "circle":
        pushArc(curves, entity.center, entity.radius, 0, Math.PI * 2)
        break
      case "arc":
        pushArc(
          curves,
          entity.center,
          entity.radius,
          entity.startAngle,
          arcSweep(entity.startAngle, entity.endAngle)
        )
        break
      case "polyline":
        for (const seg of polylineSegmentGeometries(entity)) {
          if (seg.kind === "line") pushLine(curves, seg.a, seg.b)
          else {
            pushArc(
              curves,
              seg.center,
              seg.radius,
              seg.startAngle,
              arcSweep(seg.startAngle, seg.endAngle)
            )
          }
        }
        break
      case "ellipse":
      case "spline":
      case "polyline3d":
      case "text":
      case "mtext":
      case "attdef":
      case "dimension":
      case "hatch":
      case "insert":
      case "region":
      case "solid3d":
        break
      default: {
        const unhandled: never = entity
        void unhandled
      }
    }
    if (curves.length > MAX_BOUNDARY_CURVES) return null
  }
  return curves
}

function arcSweep(startAngle: number, endAngle: number): number {
  const sweep = normalizeAngle(endAngle - startAngle)
  return sweep < 1e-9 ? Math.PI * 2 : sweep
}

function pushLine(out: Curve[], a: Vec2, b: Vec2): void {
  if (V.distance(a, b) > NODE_TOLERANCE) out.push({ kind: "line", a, b })
}

/** Halves anything over a half turn, which caps the bulge a piece becomes at 1. */
function pushArc(
  out: Curve[],
  center: Vec2,
  radius: number,
  startAngle: number,
  sweep: number
): void {
  if (!(radius > NODE_TOLERANCE) || !(sweep > 1e-9)) return
  const parts = Math.ceil(sweep / Math.PI)
  for (let i = 0; i < parts; i++) {
    out.push({
      kind: "arc",
      center,
      radius,
      startAngle: startAngle + (sweep * i) / parts,
      sweep: sweep / parts,
    })
  }
}

function curvePoint(curve: Curve, t: number): Vec2 {
  if (curve.kind === "line") return V.lerp(curve.a, curve.b, t)
  return polarPoint(
    curve.center,
    curve.radius,
    curve.startAngle + curve.sweep * t
  )
}

function curveStart(curve: Curve): Vec2 {
  return curve.kind === "line" ? curve.a : curvePoint(curve, 0)
}

function curveEnd(curve: Curve): Vec2 {
  return curve.kind === "line" ? curve.b : curvePoint(curve, 1)
}

/** Unit direction of travel at `t`, in the direction of increasing `t`. */
function curveTangent(curve: Curve, t: number): Vec2 {
  if (curve.kind === "line") return V.normalize(V.sub(curve.b, curve.a))
  const angle = curve.startAngle + curve.sweep * t
  return { x: -Math.sin(angle), y: Math.cos(angle) }
}

function curveLength(curve: Curve): number {
  return curve.kind === "line"
    ? V.distance(curve.a, curve.b)
    : curve.radius * curve.sweep
}

function subCurve(curve: Curve, t0: number, t1: number): Curve {
  if (curve.kind === "line") {
    return { kind: "line", a: curvePoint(curve, t0), b: curvePoint(curve, t1) }
  }
  return {
    kind: "arc",
    center: curve.center,
    radius: curve.radius,
    startAngle: curve.startAngle + curve.sweep * t0,
    sweep: curve.sweep * (t1 - t0),
  }
}

function curveBounds(curve: Curve): Bounds {
  if (curve.kind === "line") {
    return {
      min: {
        x: Math.min(curve.a.x, curve.b.x),
        y: Math.min(curve.a.y, curve.b.y),
      },
      max: {
        x: Math.max(curve.a.x, curve.b.x),
        y: Math.max(curve.a.y, curve.b.y),
      },
    }
  }
  // The whole circle: conservative, and this only prefilters intersection work.
  const { center: c, radius: r } = curve
  return { min: { x: c.x - r, y: c.y - r }, max: { x: c.x + r, y: c.y + r } }
}

function boundsOverlap(a: Bounds, b: Bounds): boolean {
  return (
    a.min.x <= b.max.x + NODE_TOLERANCE &&
    b.min.x <= a.max.x + NODE_TOLERANCE &&
    a.min.y <= b.max.y + NODE_TOLERANCE &&
    b.min.y <= a.max.y + NODE_TOLERANCE
  )
}

/** Cuts every curve at its crossings with the others. */
function splitCurves(curves: readonly Curve[]): Curve[] {
  const bounds = curves.map(curveBounds)
  const cuts: number[][] = curves.map(() => [])
  for (let i = 0; i < curves.length; i++) {
    for (let j = i + 1; j < curves.length; j++) {
      if (!boundsOverlap(bounds[i], bounds[j])) continue
      for (const point of intersectCurves(curves[i], curves[j])) {
        cuts[i].push(paramAt(curves[i], point))
        cuts[j].push(paramAt(curves[j], point))
      }
    }
  }

  const out: Curve[] = []
  for (let i = 0; i < curves.length; i++) {
    const curve = curves[i]
    const length = curveLength(curve)
    const epsilon = length > 0 ? NODE_TOLERANCE / length : 0.5
    const stops = [0]
    for (const t of cuts[i].sort((a, b) => a - b)) {
      if (t > epsilon && t < 1 && t - stops[stops.length - 1] > epsilon) {
        stops.push(t)
      }
    }
    if (1 - stops[stops.length - 1] > epsilon) stops.push(1)
    else stops[stops.length - 1] = 1
    for (let k = 0; k + 1 < stops.length; k++) {
      out.push(subCurve(curve, stops[k], stops[k + 1]))
    }
  }
  return out
}

function intersectCurves(a: Curve, b: Curve): Vec2[] {
  if (a.kind === "line" && b.kind === "line") {
    const hit = infiniteLineIntersection(a.a, a.b, b.a, b.b)
    if (!hit) return []
    const within = (t: number) => t >= 0 && t <= 1
    return within(hit.t) && within(hit.u) ? [hit.point] : []
  }
  if (a.kind === "line")
    return intersectLineArc(a, b as Extract<Curve, { kind: "arc" }>)
  if (b.kind === "line") return intersectLineArc(b, a)
  return circleCircleIntersection(
    a.center,
    a.radius,
    b.center,
    b.radius
  ).filter((point) => onArc(a, point) && onArc(b, point))
}

function intersectLineArc(
  line: Extract<Curve, { kind: "line" }>,
  arc: Extract<Curve, { kind: "arc" }>
): Vec2[] {
  return segmentArcIntersection(
    line.a,
    line.b,
    arc.center,
    arc.radius,
    arc.startAngle,
    arc.startAngle + arc.sweep
  )
}

function onArc(arc: Extract<Curve, { kind: "arc" }>, point: Vec2): boolean {
  return angleWithinSweep(
    arc.startAngle,
    arc.startAngle + arc.sweep,
    Math.atan2(point.y - arc.center.y, point.x - arc.center.x)
  )
}

/** Where `point` falls along the curve, as its parameter. */
function paramAt(curve: Curve, point: Vec2): number {
  if (curve.kind === "line") {
    const dir = V.sub(curve.b, curve.a)
    return V.dot(V.sub(point, curve.a), dir) / V.lengthSq(dir)
  }
  const angle = Math.atan2(point.y - curve.center.y, point.x - curve.center.x)
  return normalizeAngle(angle - curve.startAngle) / curve.sweep
}

/** Merges coincident endpoints into shared nodes, so pieces actually connect. */
class NodeIndex {
  readonly points: Vec2[] = []
  private readonly cells = new Map<string, number[]>()

  get count(): number {
    return this.points.length
  }

  add(point: Vec2): number {
    const cx = Math.floor(point.x / NODE_TOLERANCE)
    const cy = Math.floor(point.y / NODE_TOLERANCE)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const i of this.cells.get(`${cx + dx},${cy + dy}`) ?? []) {
          if (V.distance(this.points[i], point) <= NODE_TOLERANCE) return i
        }
      }
    }
    const index = this.points.length
    this.points.push({ x: point.x, y: point.y })
    const key = `${cx},${cy}`
    const bucket = this.cells.get(key)
    if (bucket) bucket.push(index)
    else this.cells.set(key, [index])
    return index
  }
}

/** Drops every chain that ends in mid-air, leaving only closed cycles. */
function pruneOpenEnds(edges: readonly Edge[], nodeCount: number): Edge[] {
  const degree = new Array<number>(nodeCount).fill(0)
  const incident: number[][] = Array.from({ length: nodeCount }, () => [])
  edges.forEach((edge, i) => {
    degree[edge.from] += 1
    degree[edge.to] += 1
    incident[edge.from].push(i)
    incident[edge.to].push(i)
  })

  const alive = edges.map(() => true)
  const loose: number[] = []
  for (let node = 0; node < nodeCount; node++) {
    if (degree[node] === 1) loose.push(node)
  }
  while (loose.length > 0) {
    const node = loose.pop() as number
    if (degree[node] !== 1) continue
    const edge = incident[node].find((i) => alive[i])
    if (edge === undefined) {
      degree[node] = 0
      continue
    }
    alive[edge] = false
    for (const end of [edges[edge].from, edges[edge].to]) {
      degree[end] -= 1
      if (degree[end] === 1) loose.push(end)
    }
  }
  return edges.filter((_, i) => alive[i])
}

function directedEdges(edges: readonly Edge[]): Directed[] {
  const out: Directed[] = []
  for (let i = 0; i < edges.length; i++) {
    const { curve, from, to } = edges[i]
    const startTangent = curveTangent(curve, 0)
    const endTangent = curveTangent(curve, 1)
    out.push({
      edge: i,
      reversed: false,
      from,
      to,
      outAngle: Math.atan2(startTangent.y, startTangent.x),
      inAngle: Math.atan2(endTangent.y, endTangent.x),
    })
    out.push({
      edge: i,
      reversed: true,
      from: to,
      to: from,
      outAngle: Math.atan2(-endTangent.y, -endTangent.x),
      inAngle: Math.atan2(-startTangent.y, -startTangent.x),
    })
  }
  return out
}

/**
 * Every face of the planar graph, as a cycle of directed edges keeping the face
 * on its left. Each directed edge belongs to exactly one, so one pass over them
 * finds them all.
 */
function traceFaces(
  directed: readonly Directed[],
  nodeCount: number
): number[][] {
  const outgoing: number[][] = Array.from({ length: nodeCount }, () => [])
  directed.forEach((edge, i) => outgoing[edge.from].push(i))

  const visited = new Array<boolean>(directed.length).fill(false)
  const cycles: number[][] = []
  for (let start = 0; start < directed.length; start++) {
    if (visited[start]) continue
    const cycle: number[] = []
    let current = start
    while (!visited[current]) {
      visited[current] = true
      cycle.push(current)
      current = nextDirected(current, directed, outgoing)
    }
    if (current === start) cycles.push(cycle)
  }
  return cycles
}

/**
 * The edge continuing the face: the first one clockwise from the way we came
 * in. Turning as far clockwise as possible at every node is what keeps the same
 * face on the left all the way round.
 */
function nextDirected(
  current: number,
  directed: readonly Directed[],
  outgoing: readonly number[][]
): number {
  const arrived = directed[current]
  const back = arrived.inAngle + Math.PI
  let best = -1
  let bestTurn = -1
  for (const candidate of outgoing[arrived.to]) {
    if (candidate === (current ^ 1)) continue
    const turn = normalizeAngle(directed[candidate].outAngle - back)
    if (turn > bestTurn) {
      bestTurn = turn
      best = candidate
    }
  }
  // Only a dead end has nothing but the way back, and pruning removed those.
  return best >= 0 ? best : current ^ 1
}

function cycleRing(
  cycle: readonly number[],
  directed: readonly Directed[],
  edges: readonly Edge[],
  nodes: readonly Vec2[]
): Vec2[] {
  const ring: Vec2[] = []
  for (const index of cycle) {
    const step = directed[index]
    const curve = edges[step.edge].curve
    ring.push(nodes[step.from])
    if (curve.kind !== "arc") continue
    const steps = Math.max(2, Math.ceil(curve.sweep / FACET_ANGLE))
    for (let i = 1; i < steps; i++) {
      const t = step.reversed ? 1 - i / steps : i / steps
      ring.push(curvePoint(curve, t))
    }
  }
  return ring
}

function cycleLoop(
  cycle: readonly number[],
  directed: readonly Directed[],
  edges: readonly Edge[],
  nodes: readonly Vec2[]
): HatchLoop {
  const vertices: Vec2[] = []
  const bulges: number[] = []
  for (const index of cycle) {
    const step = directed[index]
    const curve = edges[step.edge].curve
    vertices.push(nodes[step.from])
    const bulge =
      curve.kind === "arc"
        ? Math.tan(curve.sweep / 4) * (step.reversed ? -1 : 1)
        : 0
    bulges.push(bulge)
  }
  return bulges.some((bulge) => bulge !== 0)
    ? { vertices, bulges }
    : { vertices }
}

function signedArea(ring: readonly Vec2[]): number {
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    sum += V.cross(ring[i], ring[(i + 1) % ring.length])
  }
  return sum / 2
}

function pointInRing(ring: readonly Vec2[], point: Vec2): boolean {
  let inside = false
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    if (a.y > point.y !== b.y > point.y) {
      const x = a.x + ((point.y - a.y) / (b.y - a.y)) * (b.x - a.x)
      if (x > point.x) inside = !inside
    }
  }
  return inside
}

/**
 * A point strictly inside the ring — the centroid will not do, since a ring may
 * be anything but convex. Scanning a horizontal line through one of its edges
 * and taking the middle of the first inside run always lands within it.
 */
function interiorPoint(ring: readonly Vec2[]): Vec2 | null {
  for (let i = 0; i < ring.length; i++) {
    const y = (ring[i].y + ring[(i + 1) % ring.length].y) / 2
    const crossings: number[] = []
    for (let j = 0; j < ring.length; j++) {
      const a = ring[j]
      const b = ring[(j + 1) % ring.length]
      if (a.y > y !== b.y > y) {
        crossings.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x))
      }
    }
    crossings.sort((left, right) => left - right)
    for (let k = 0; k + 1 < crossings.length; k += 2) {
      if (crossings[k + 1] - crossings[k] > NODE_TOLERANCE) {
        return { x: (crossings[k] + crossings[k + 1]) / 2, y }
      }
    }
  }
  return null
}
