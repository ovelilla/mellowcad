import { Vec2, V } from "./Vec2"

/**
 * The two arcs PEDIT's Fit puts between two vertices: the first from the
 * segment's start to `joint`, the second on to its end, tangent there, each
 * as a bulge (`tan(θ/4)`).
 */
export interface Biarc {
  readonly joint: Vec2
  readonly bulges: readonly [first: number, second: number]
}

/** Below this sine a tangent runs along its chord: the segment stays straight (pedit/p186). */
const ALONG = 1e-9

/**
 * The tangent direction (radians) PEDIT's Fit gives each vertex of `points`,
 * read off AutoCAD 2027's arcs to the last digit (pedit/p51, p147–p149, p184):
 * at an inner vertex `a/|a|² · sin(turn after) + b/|b|² · sin(turn before)`,
 * `a` and `b` the chords into and out of it and each turn the angle between
 * the chords at the next vertex on — 1 where there is none —, so a straight
 * run on one side keeps the tangent along it; at an open end, the tangent of
 * the circle through it and the next two (one chord's, with two vertices). A
 * tangent given (Edit vertex's Tangent, DXF 50) is kept where it is given and
 * moves no other (p59, p150).
 */
export function fitTangents(
  points: readonly Vec2[],
  closed: boolean,
  given: readonly (number | null | undefined)[] = []
): number[] {
  const n = points.length
  const at = (i: number) => points[((i % n) + n) % n]
  const chord = (i: number) => V.sub(at(i + 1), at(i))
  const inner = (i: number, circle = false): Vec2 => {
    const a = chord(i - 1)
    const b = chord(i)
    const has = (j: number) => !circle && (closed || (j >= 0 && j < n))
    let after = has(i + 2) ? sine(b, chord(i + 1)) : 1
    let before = has(i - 2) ? sine(chord(i - 2), a) : 1
    // Straight on both sides: the circle's, as with no neighbours (**unverified**).
    if (after === 0 && before === 0) after = before = 1
    return V.add(
      V.scale(a, after / Math.max(V.lengthSq(a), Number.MIN_VALUE)),
      V.scale(b, before / Math.max(V.lengthSq(b), Number.MIN_VALUE))
    )
  }
  return points.map((_, i) => {
    const own = given[i]
    if (own !== null && own !== undefined) return own
    if (closed || (i > 0 && i < n - 1)) return heading(inner(i))
    if (n < 3) return heading(chord(0))
    // The circle through an end and the next two leaves the end at its
    // chord's mirror of the tangent at the middle one.
    return i === 0
      ? 2 * heading(chord(0)) - heading(inner(1, true))
      : 2 * heading(chord(n - 2)) - heading(inner(n - 2, true))
  })
}

/**
 * The biarc from `a` to `b` leaving at `ta` and arriving at `tb` (radians),
 * as PEDIT's Fit draws it, or null where it stays straight — either tangent
 * along the chord (pedit/p149, p186). Tangents on either side of the chord
 * (a C) meet at the incentre of the triangle their lines make with it, where
 * the curve runs parallel to the chord; on one side (an S), the arcs'
 * radii are in the ratio `r₁ sin α = r₂ sin β` — both fitted to every joint
 * of p184 and p185 to the last digit; no help states either.
 */
export function biarc(a: Vec2, b: Vec2, ta: number, tb: number): Biarc | null {
  const d = V.sub(b, a)
  const length = V.length(d)
  if (length === 0) return null
  const along = heading(d)
  const alpha = turn(ta - along)
  const beta = turn(tb - along)
  if (Math.abs(Math.sin(alpha)) < ALONG || Math.abs(Math.sin(beta)) < ALONG) {
    return null
  }
  const ux = V.scale(d, 1 / length)
  const uy = { x: -ux.y, y: ux.x }
  const world = (x: number, y: number) =>
    V.add(a, V.add(V.scale(ux, x), V.scale(uy, y)))
  let joint: Vec2
  if (alpha * beta < 0) {
    // The rays from each end at half its tangent's angle to the chord.
    const ta2 = Math.tan(alpha / 2)
    const tb2 = Math.tan(beta / 2)
    const x = (length * tb2) / (tb2 - ta2)
    joint = world(x, x * ta2)
  } else {
    const side = Math.sign(alpha)
    const p = Math.abs(alpha)
    const q = Math.abs(beta)
    const c = (2 * (Math.cos(p - q) - 1)) / (Math.sin(p) * Math.sin(q))
    const k = length / (2 + Math.sqrt(4 - c))
    const r1 = k / Math.sin(p)
    const c1 = { x: k, y: -k / Math.tan(p) }
    const c2 = { x: length - k, y: k / Math.tan(q) }
    const towards = V.sub(c2, c1)
    const j = V.add(c1, V.scale(towards, r1 / V.length(towards)))
    joint = world(j.x, side * j.y)
  }
  const first = 2 * turn(heading(V.sub(joint, a)) - ta)
  const second = 2 * turn(tb - heading(V.sub(b, joint)))
  return { joint, bulges: [Math.tan(first / 4), Math.tan(second / 4)] }
}

/**
 * PEDIT's Fit of `points`: per segment (the closing one last, when closed)
 * its biarc, or null where it stays straight.
 */
export function arcFit(
  points: readonly Vec2[],
  closed: boolean,
  given: readonly (number | null | undefined)[] = []
): (Biarc | null)[] {
  const n = points.length
  if (n < 2) return []
  const tangents = fitTangents(points, closed, given)
  const count = closed ? n : n - 1
  return Array.from({ length: count }, (_, i) =>
    biarc(points[i], points[(i + 1) % n], tangents[i], tangents[(i + 1) % n])
  )
}

function heading(v: Vec2): number {
  return Math.atan2(v.y, v.x)
}

/** An angle brought into (−π, π]. */
function turn(angle: number): number {
  let a = angle % (2 * Math.PI)
  if (a > Math.PI) a -= 2 * Math.PI
  if (a <= -Math.PI) a += 2 * Math.PI
  return a
}

function sine(u: Vec2, v: Vec2): number {
  const lu = V.length(u)
  const lv = V.length(v)
  return lu === 0 || lv === 0 ? 0 : Math.abs(V.cross(u, v)) / (lu * lv)
}
