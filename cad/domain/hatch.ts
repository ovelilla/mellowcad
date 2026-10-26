import { Vec2, V } from "../geometry/Vec2"
import { polarPoint } from "../geometry/primitives"
import { Linear2, applyLinear, inverseLinear } from "../geometry/linear"
import {
  HatchPatternLine,
  hatchPatternLines,
  isSolidHatchPattern,
} from "./hatchPatterns"
import { HatchLoop, HatchEntity, Entity } from "./entityTypes"
import { PolylineSegmentGeometry, segmentGeometries } from "./polylines"
import { rotatePoint } from "./entityTransforms"

/**
 * The boundary loop an object contributes to a hatch, or `null` when it does
 * not enclose an area on its own. AutoCAD's Select-objects boundary accepts
 * objects "that form an enclosed area"; chaining several open objects into one
 * loop is not done here yet, so only self-closing ones qualify.
 */
export function hatchLoopFromEntity(entity: Entity): HatchLoop | null {
  switch (entity.type) {
    case "circle":
      // Two semicircles: a bulge of 1 is a half turn, so the pair traces the
      // whole circle counter-clockwise.
      return {
        vertices: [
          { x: entity.center.x + entity.radius, y: entity.center.y },
          { x: entity.center.x - entity.radius, y: entity.center.y },
        ],
        bulges: [1, 1],
      }
    case "polyline":
      // Two vertices enclose an area only round their arcs (p227's circle).
      const curved = entity.bulges?.some((b) => b !== 0) ?? false
      if (!entity.closed || entity.vertices.length < (curved ? 2 : 3)) {
        return null
      }
      return {
        vertices: entity.vertices.map((v) => ({ x: v.x, y: v.y })),
        ...(entity.bulges ? { bulges: entity.bulges.slice() } : {}),
      }
    case "line":
    case "arc":
    case "ellipse":
    case "spline":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
      return null
    default: {
      const unhandled: never = entity
      return unhandled
    }
  }
}

/**
 * The concrete geometry of a boundary loop, segment by segment. A loop always
 * closes, including the two-vertex ring a circle becomes.
 */
export function hatchLoopSegments(loop: HatchLoop): PolylineSegmentGeometry[] {
  const v = loop.vertices
  if (v.length < 2) return []
  const segments: [Vec2, Vec2][] = []
  for (let i = 0; i < v.length; i++) {
    segments.push([v[i], v[(i + 1) % v.length]])
  }
  return segmentGeometries(segments, loop.bulges)
}

/**
 * The largest number of pattern segments one hatch generates before the fill is
 * abandoned: a safety cap, so a typo in the scale cannot hang the editor. It is
 * not HPMAXLINES, as AutoCAD refuses a hatch far below that and makes one
 * above it (probes hatch/p363, p364); AutoCAD refused ANSI31 over 0,0–100,50
 * between about 27 800 and 32 100 members (p365, p367), by a rule not found.
 */
export const MAX_HATCH_LINES = 100_000

/**
 * How finely a boundary arc is chopped into chords for pattern clipping: a 5°
 * facet, whose sagitta is under 0.1% of the radius. Clipping needs *one*
 * crossing convention to keep the even-odd parity honest, and mixing exact
 * circle roots with segment crossings is where that goes wrong — so every loop
 * becomes a polygon first.
 */
const HATCH_FACET_ANGLE = Math.PI / 36

/** Everything drawn for a hatch, derived from its loops and pattern. */
export interface HatchGeometry {
  /** Each boundary loop as a closed ring of points (arcs already chopped). */
  readonly rings: readonly (readonly Vec2[])[]
  /** Whether the area is a solid fill rather than a family of lines. */
  readonly solid: boolean
  /**
   * The pattern's line work, already clipped to the boundary; a dot (a `0`
   * dash) is a segment from a point to itself.
   */
  readonly lines: readonly [Vec2, Vec2][]
  /** True when generation stopped at {@link MAX_HATCH_LINES}. */
  readonly truncated: boolean
}

/**
 * The pattern line work of a hatch, clipped to its boundary, in **world**
 * coordinates.
 *
 * Clipping in world space rather than at paint time is what keeps this cheap:
 * a hatch's appearance does not depend on the zoom (HPSCALE is a drawing
 * scale, not a screen one), so the result is a pure function of the entity and
 * a caller may cache it per object. It is also what keeps the scene layer free
 * of any notion of clipping or patterned fill — everything downstream sees
 * ordinary segments.
 */
export function hatchGeometry(hatch: HatchEntity): HatchGeometry {
  const cached = geometryCache.get(hatch)
  if (cached) return cached
  const geometry = generateHatchGeometry(hatch)
  geometryCache.set(hatch, geometry)
  return geometry
}

/**
 * {@link hatchGeometry} per entity object. WHY a memo in a pure layer: the
 * pattern is what a hatch is drawn and picked by (HATCH-D64), asked of every
 * hatch at each pointer move, and an entity is immutable, so the answer for one
 * object never changes.
 */
const geometryCache = new WeakMap<HatchEntity, HatchGeometry>()

function generateHatchGeometry(hatch: HatchEntity): HatchGeometry {
  const rings = hatch.loops
    .map(hatchLoopRing)
    .filter((ring) => ring.length >= 3)
  const solid = isSolidHatchPattern(hatch.patternId)
  if (solid || rings.length === 0) {
    return { rings, solid, lines: [], truncated: false }
  }

  const frame = hatch.patternFrame
  const inverse = frame && inverseLinear(frame)
  if (frame && !inverse) return { rings, solid, lines: [], truncated: false }
  // WHY generated inside the frame: a pattern is a family of lines, which the
  // frame's linear map keeps lines, so clipping the unframed pattern to the
  // boundary taken back through it and mapping the runs out is exact.
  const about = (map: Linear2) => (point: Vec2) =>
    V.add(hatch.origin, applyLinear(map, V.sub(point, hatch.origin)))
  const clipped = inverse
    ? rings.map((ring) => ring.map(about(inverse)))
    : rings
  let lines: [Vec2, Vec2][] = []
  let truncated = false
  for (const line of hatchPatternLines(hatch.patternId)) {
    if (truncated) break
    truncated = pushPatternFamily(lines, hatch, line, clipped)
  }
  if (frame) {
    const out = about(frame)
    lines = lines.map(([a, b]) => [out(a), out(b)])
  }
  return { rings, solid, lines, truncated }
}

/** A boundary loop as a closed ring of points, arcs chopped into chords. */
export function hatchLoopRing(loop: HatchLoop): Vec2[] {
  const segments = hatchLoopSegments(loop)
  const ring: Vec2[] = []
  for (const seg of segments) {
    ring.push(seg.a)
    if (seg.kind === "line") continue
    const theta = 4 * Math.atan(seg.bulge)
    const startAngle = Math.atan2(
      seg.a.y - seg.center.y,
      seg.a.x - seg.center.x
    )
    const steps = Math.max(2, Math.ceil(Math.abs(theta) / HATCH_FACET_ANGLE))
    for (let i = 1; i < steps; i++) {
      ring.push(
        polarPoint(seg.center, seg.radius, startAngle + theta * (i / steps))
      )
    }
  }
  return ring
}

/**
 * Expands one descriptor line into its family, clips each member against the
 * rings and appends the surviving runs. Returns whether the line budget ran out.
 */
function pushPatternFamily(
  out: [Vec2, Vec2][],
  hatch: HatchEntity,
  line: HatchPatternLine,
  rings: readonly (readonly Vec2[])[]
): boolean {
  const scale = hatch.patternScale
  const deltaY = line.deltaY * scale
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 1e-9) return false

  const theta = line.angle + hatch.patternAngle
  const dir = { x: Math.cos(theta), y: Math.sin(theta) }
  const normal = { x: -dir.y, y: dir.x }
  const deltaX = line.deltaX * scale
  const dashes = line.dashes.map((d) => d * scale)
  const base = V.add(
    hatch.origin,
    rotatePoint(V.scale(line.origin, scale), { x: 0, y: 0 }, hatch.patternAngle)
  )

  // Which members of the infinite family can reach the boundary at all.
  let minU = Infinity
  let maxU = -Infinity
  for (const ring of rings) {
    for (const point of ring) {
      const u = V.dot(V.sub(point, base), normal)
      minU = Math.min(minU, u)
      maxU = Math.max(maxU, u)
    }
  }
  const lo = Math.floor(Math.min(minU, maxU) / Math.abs(deltaY)) - 1
  const hi = Math.ceil(Math.max(minU, maxU) / Math.abs(deltaY)) + 1
  const step = Math.sign(deltaY) || 1
  if (hi - lo > MAX_HATCH_LINES) return true

  for (let k = lo; k <= hi; k++) {
    const index = k * step
    const origin = V.add(
      V.add(base, V.scale(normal, index * deltaY)),
      V.scale(dir, index * deltaX)
    )
    for (const [from, to] of insideRuns(origin, dir, rings)) {
      pushDashedRun(out, origin, dir, from, to, dashes)
      if (out.length > MAX_HATCH_LINES) return true
    }
  }
  return false
}

/**
 * The parameter intervals along the infinite line `origin + t·dir` that lie
 * inside the boundary, under the even-odd rule (nested loops are holes).
 *
 * A crossing is counted with a half-open sign test, so a ring vertex sitting
 * exactly on the line is counted once when the outline crosses there and twice
 * when it merely touches — which is what keeps the parity right without any
 * special case.
 */
function insideRuns(
  origin: Vec2,
  dir: Vec2,
  rings: readonly (readonly Vec2[])[]
): [number, number][] {
  const crossings: number[] = []
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i]
      const b = ring[(i + 1) % ring.length]
      const fa = V.cross(dir, V.sub(a, origin))
      const fb = V.cross(dir, V.sub(b, origin))
      const crosses = fa <= 0 ? fb > 0 : fb <= 0
      if (!crosses) continue
      const t = fa / (fa - fb)
      const point = V.lerp(a, b, t)
      crossings.push(V.dot(V.sub(point, origin), dir))
    }
  }
  crossings.sort((x, y) => x - y)
  const runs: [number, number][] = []
  for (let i = 0; i + 1 < crossings.length; i += 2) {
    if (crossings[i + 1] > crossings[i]) {
      runs.push([crossings[i], crossings[i + 1]])
    }
  }
  return withoutEdges(runs, origin, dir, rings)
}

/**
 * `runs` less where the line runs along a loop's edge: AutoCAD leaves out a
 * pattern member lying on the boundary (probe hatch/p301, ANGLE's members on
 * y = 0 and x = 0 of a rectangle from the origin).
 */
function withoutEdges(
  runs: [number, number][],
  origin: Vec2,
  dir: Vec2,
  rings: readonly (readonly Vec2[])[]
): [number, number][] {
  let kept = runs
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i]
      const b = ring[(i + 1) % ring.length]
      const tolerance = ON_EDGE * Math.max(1, V.distance(a, b))
      if (
        Math.abs(V.cross(dir, V.sub(a, origin))) > tolerance ||
        Math.abs(V.cross(dir, V.sub(b, origin))) > tolerance
      ) {
        continue
      }
      const ta = V.dot(V.sub(a, origin), dir)
      const tb = V.dot(V.sub(b, origin), dir)
      const lo = Math.min(ta, tb)
      const hi = Math.max(ta, tb)
      kept = kept.flatMap(([from, to]): [number, number][] =>
        hi <= from || lo >= to
          ? [[from, to]]
          : [
              ...(lo > from ? [[from, lo] as [number, number]] : []),
              ...(hi < to ? [[hi, to] as [number, number]] : []),
            ]
      )
    }
  }
  return kept.filter(([from, to]) => to - from > ON_EDGE)
}

/**
 * How near a loop's edge, relative to its length, a member counts as lying on
 * it: the float error of a member placed by `k · delta-y`, far below anything
 * drawn.
 */
const ON_EDGE = 1e-9

/** Emits `[from, to]` broken by the dash cycle, or whole when continuous. */
function pushDashedRun(
  out: [Vec2, Vec2][],
  origin: Vec2,
  dir: Vec2,
  from: number,
  to: number,
  dashes: readonly number[]
): void {
  const at = (t: number): Vec2 => V.add(origin, V.scale(dir, t))
  const cycle = dashes.reduce((sum, run) => sum + Math.abs(run), 0)
  if (dashes.length === 0 || cycle < 1e-9) {
    out.push([at(from), at(to)])
    return
  }
  // The dash pattern is anchored at the line's own origin, which delta-x has
  // already slid along the direction — that is how a pattern's dashes stagger.
  let t = Math.floor(from / cycle) * cycle
  while (t < to && out.length <= MAX_HATCH_LINES) {
    for (const run of dashes) {
      const next = t + Math.abs(run)
      if (run > 0) {
        const start = Math.max(t, from)
        const end = Math.min(next, to)
        if (end > start) out.push([at(start), at(end)])
      } else if (run === 0 && t >= from && t <= to) {
        // A dot, drawn as a linetype's is (`drawnDash`).
        const dot = at(t)
        out.push([dot, dot])
      }
      t = next
      if (t >= to) break
    }
  }
}

/**
 * Whether a point lies inside the hatched area, under the same even-odd rule
 * the pattern is clipped with — so a SOLID hatch picks as the *area* it is
 * (desktop hatch/d06-5).
 */
export function pointInsideHatch(hatch: HatchEntity, point: Vec2): boolean {
  let inside = false
  for (const loop of hatch.loops) {
    const ring = hatchLoopRing(loop)
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i]
      const b = ring[(i + 1) % ring.length]
      if (a.y > point.y !== b.y > point.y) {
        const x = a.x + ((point.y - a.y) / (b.y - a.y)) * (b.x - a.x)
        if (x > point.x) inside = !inside
      }
    }
  }
  return inside
}
