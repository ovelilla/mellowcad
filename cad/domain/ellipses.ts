import { Vec2, V } from "../geometry/Vec2"
import {
  closestPointOnEllipse,
  ellipsePoint,
  normalizeAngle,
} from "../geometry/primitives"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { EntityId, EllipseEntity, Bounds } from "./entityTypes"
import { nextEntityId } from "./entityFactories"

/** The optional settings of an ellipse; the two parameters travel together. */
export interface EllipseOptions {
  readonly startParam?: number
  readonly endParam?: number
  readonly layerId?: LayerId
  readonly id?: EntityId
}

/**
 * Builds an ellipse, or an elliptical arc when both parameters are given.
 *
 * `majorAxis` may be handed in as the *shorter* semi-axis (a `ratio` above 1):
 * the axis is then swapped for its perpendicular, as DXF requires the stored
 * vector to be the major one. The parameter frame turns with it, so the swap
 * shifts the swept range by a quarter turn rather than silently relocating the
 * ends of an arc.
 */
export function createEllipse(
  center: Vec2,
  majorAxis: Vec2,
  ratio: number,
  options: EllipseOptions = {}
): EllipseEntity {
  const axes = normalizeEllipseAxes(majorAxis, ratio)
  const span = ellipseSpan(options.startParam, options.endParam)
  return {
    id: options.id ?? nextEntityId(),
    type: "ellipse",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    center: { x: center.x, y: center.y },
    majorAxis: axes.majorAxis,
    ratio: axes.ratio,
    ...(span ? storedSpan(span, axes.paramShift) : {}),
  }
}

/**
 * Returns a copy of `ellipse` (id and overrides intact) reshaped to the given
 * axis and ratio — the path a retyped Properties row takes, and the one a grip
 * drag takes, so both get the major-axis normalisation for free.
 */
export function ellipseWithAxes(
  ellipse: EllipseEntity,
  majorAxis: Vec2,
  ratio: number
): EllipseEntity {
  const axes = normalizeEllipseAxes(majorAxis, ratio)
  const span = ellipseSpan(ellipse.startParam, ellipse.endParam)
  return {
    ...ellipse,
    majorAxis: axes.majorAxis,
    ratio: axes.ratio,
    ...(span ? storedSpan(span, axes.paramShift) : {}),
  }
}

/**
 * Returns a copy of `ellipse` (id and overrides intact) sweeping from
 * `startParam` to `endParam`, stored as the factory stores a range: a whole
 * turn, or no range, makes it a whole ellipse.
 */
export function ellipseWithSpan(
  ellipse: EllipseEntity,
  startParam: number | undefined,
  endParam: number | undefined
): EllipseEntity {
  const span = ellipseSpan(startParam, endParam)
  if (span) return { ...ellipse, ...storedSpan(span, 0) }
  const whole: Record<string, unknown> = { ...ellipse }
  delete whole.startParam
  delete whole.endParam
  return whole as unknown as EllipseEntity
}

/**
 * Below this a ratio above 1 is a tie, the two axes equal: the first one
 * given stays major (ellipse/p168), where a ratio computed a hair above 1
 * would turn it a quarter.
 */
const RATIO_TIE = 1e-9

/**
 * Puts a pair of axes into DXF's form, where the stored vector is the *major*
 * one: a ratio above 1 means the shorter axis was handed in, so it is swapped
 * for its perpendicular. The parameter frame turns with the swap, hence the
 * quarter-turn `paramShift` every caller must apply to a swept range.
 */
function normalizeEllipseAxes(
  majorAxis: Vec2,
  ratio: number
): {
  readonly majorAxis: Vec2
  readonly ratio: number
  readonly paramShift: number
} {
  const resolved = Number.isFinite(ratio) && ratio > 0 ? ratio : 1
  if (resolved <= 1 + RATIO_TIE) {
    return {
      majorAxis: { x: majorAxis.x, y: majorAxis.y },
      ratio: Math.min(resolved, 1),
      paramShift: 0,
    }
  }
  return {
    majorAxis: V.scale(V.perpendicular(majorAxis), resolved),
    ratio: 1 / resolved,
    paramShift: -Math.PI / 2,
  }
}

/** Within this of no sweep or of a whole turn, a range is a whole ellipse. */
const WHOLE_TURN = 1e-9

/**
 * The parameter range to store, or `null` for a full ellipse. A range that
 * sweeps no angle or a whole turn either way is a full ellipse and stores
 * nothing (ellipse/p152, p220, p224, p226, p235, p236: AutoCAD keeps such a
 * closed arc's start, which has no field here), which also keeps mirroring
 * one an identity instead of a range that has to be re-normalised.
 */
function ellipseSpan(
  start: number | undefined,
  end: number | undefined
): { readonly start: number; readonly end: number } | null {
  if (start === undefined || end === undefined) return null
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  const sweep = normalizeAngle(end - start)
  if (sweep < WHOLE_TURN || sweep > 2 * Math.PI - WHOLE_TURN) return null
  return { start, end }
}

/**
 * A range as AutoCAD stores it, turned by `shift`: the start in [0, 2π) and
 * the end after it (ellipse/p134, p148, p154, p179, p180). One already so is
 * kept to the bit, so a saved drawing loads and saves the same bytes.
 */
function storedSpan(
  span: { readonly start: number; readonly end: number },
  shift: number
): { readonly startParam: number; readonly endParam: number } {
  const start = span.start + shift
  const end = span.end + shift
  const turn = 2 * Math.PI
  if (start >= 0 && start < turn && end > start && end - start < turn) {
    return { startParam: start, endParam: end }
  }
  const from = normalizeAngle(start)
  return { startParam: from, endParam: from + normalizeAngle(end - start) }
}

export function isFullEllipse(ellipse: EllipseEntity): boolean {
  return ellipse.startParam === undefined || ellipse.endParam === undefined
}

export function ellipseSemiMajor(ellipse: EllipseEntity): number {
  return V.length(ellipse.majorAxis)
}

export function ellipseSemiMinor(ellipse: EllipseEntity): number {
  return V.length(ellipse.majorAxis) * ellipse.ratio
}

/** Centre → endpoint of the minor axis, a quarter turn CCW from the major. */
export function ellipseMinorAxis(ellipse: EllipseEntity): Vec2 {
  return V.scale(V.perpendicular(ellipse.majorAxis), ellipse.ratio)
}

/** Direction of the major axis, radians CCW from +X. */
export function ellipseRotation(ellipse: EllipseEntity): number {
  return Math.atan2(ellipse.majorAxis.y, ellipse.majorAxis.x)
}

export function ellipsePointAt(ellipse: EllipseEntity, t: number): Vec2 {
  return ellipsePoint(ellipse.center, ellipse.majorAxis, ellipse.ratio, t)
}

/**
 * The swept parameter range as a start plus a positive sweep, treating a
 * degenerate range as the whole ellipse — the convention `arcSweepAngle` uses.
 */
export function ellipseSweepParams(ellipse: EllipseEntity): {
  readonly start: number
  readonly sweep: number
} {
  if (ellipse.startParam === undefined || ellipse.endParam === undefined) {
    return { start: 0, sweep: Math.PI * 2 }
  }
  const sweep = normalizeAngle(ellipse.endParam - ellipse.startParam)
  return {
    start: ellipse.startParam,
    sweep: sweep < 1e-9 ? Math.PI * 2 : sweep,
  }
}

/** Whether the parameter `t` falls inside the swept range. */
export function ellipseParamWithinSweep(
  ellipse: EllipseEntity,
  t: number
): boolean {
  const { start, sweep } = ellipseSweepParams(ellipse)
  return normalizeAngle(t - start) <= sweep + 1e-9
}

export function ellipseStartPoint(ellipse: EllipseEntity): Vec2 {
  return ellipsePointAt(ellipse, ellipseSweepParams(ellipse).start)
}

/** Where the curve ends: a whole ellipse's is its start, to the bit. */
export function ellipseEndPoint(ellipse: EllipseEntity): Vec2 {
  if (isFullEllipse(ellipse)) return ellipseStartPoint(ellipse)
  const { start, sweep } = ellipseSweepParams(ellipse)
  return ellipsePointAt(ellipse, start + sweep)
}

/**
 * The point halfway along the curve's length, not at its middle parameter:
 * AutoCAD's Midpoint of an elliptical arc (ellipse/p303). A whole ellipse's
 * is half its length from its start; AutoCAD offers none there (p304).
 */
export function ellipseMidpoint(ellipse: EllipseEntity): Vec2 {
  const along = ellipseLengthTable(ellipse)
  return ellipsePointAt(ellipse, along.paramAt(along.length / 2))
}

/** How fast the parametrisation runs at `t`: `√(a² sin² t + b² cos² t)`. */
function ellipseSpeed(a: number, b: number, t: number): number {
  return Math.hypot(a * Math.sin(t), b * Math.cos(t))
}

/**
 * The length of the ellipse of semi-axes `a` and `b` from parameter `start`
 * through `sweep`, by Simpson's rule on its speed in `steps` (even) pieces:
 * an elliptic integral, with no closed form.
 */
export function ellipseArcLength(
  a: number,
  b: number,
  start: number,
  sweep: number,
  steps = 512
): number {
  const h = sweep / steps
  let sum = ellipseSpeed(a, b, start) + ellipseSpeed(a, b, start + sweep)
  for (let i = 1; i < steps; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * ellipseSpeed(a, b, start + i * h)
  }
  return (sum * h) / 3
}

/**
 * The pieces an ellipse's sweep is tabulated in to find the parameter at a
 * distance along it. The length has no closed form and neither has its
 * inverse, and stepping the parameter evenly is no answer: it bunches the
 * points at the ends of the major axis, where the curve is slow.
 */
const ELLIPSE_LENGTH_PIECES = 256

/** Newton's steps refining a parameter read off the table: it starts close. */
const ELLIPSE_LENGTH_ITERATIONS = 4

/** An ellipse's sweep measured along its length. */
export interface EllipseLength {
  /** The length of the swept curve. */
  readonly length: number
  /** The parameter at `distance` along the curve from its start, clamped to it. */
  paramAt(distance: number): number
}

/**
 * The curve's length, and the parameter at any distance along it: read off a
 * table of {@link ELLIPSE_LENGTH_PIECES} pieces, then refined by at most
 * {@link ELLIPSE_LENGTH_ITERATIONS} Newton steps on the length inside the
 * piece. Midpoint and the linetype's dashes are laid by length.
 */
export function ellipseLengthTable(ellipse: EllipseEntity): EllipseLength {
  const a = ellipseSemiMajor(ellipse)
  const b = ellipseSemiMinor(ellipse)
  const { start, sweep } = ellipseSweepParams(ellipse)
  const h = sweep / ELLIPSE_LENGTH_PIECES
  const lengths = [0]
  for (let i = 0; i < ELLIPSE_LENGTH_PIECES; i++) {
    lengths.push(lengths[i] + ellipseArcLength(a, b, start + i * h, h, 4))
  }
  const length = lengths[ELLIPSE_LENGTH_PIECES]
  return {
    length,
    paramAt(distance: number): number {
      if (!(distance > 0) || !(length > 0)) return start
      if (distance >= length) return start + sweep
      let low = 0
      let high = ELLIPSE_LENGTH_PIECES
      while (high - low > 1) {
        const mid = (low + high) >> 1
        if (lengths[mid] <= distance) low = mid
        else high = mid
      }
      const from = start + low * h
      const piece = lengths[low + 1] - lengths[low]
      let t = from + (piece > 0 ? (h * (distance - lengths[low])) / piece : 0)
      for (let i = 0; i < ELLIPSE_LENGTH_ITERATIONS; i++) {
        const speed = ellipseSpeed(a, b, t)
        if (speed < 1e-12) break
        const reached = lengths[low] + ellipseArcLength(a, b, from, t - from, 4)
        t = Math.min(Math.max(t - (reached - distance) / speed, from), from + h)
      }
      return t
    },
  }
}

/**
 * The four axis endpoints — AutoCAD's quadrants of an ellipse — restricted to
 * the ones an elliptical arc actually sweeps through.
 */
export function ellipseQuadrantPoints(ellipse: EllipseEntity): Vec2[] {
  const points: Vec2[] = []
  for (const t of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    if (ellipseParamWithinSweep(ellipse, t))
      points.push(ellipsePointAt(ellipse, t))
  }
  return points
}

/**
 * The exact extent. `dx/dt = 0` at `t = atan2(b.x, a.x)` (and half a turn
 * later), and likewise for y, so the box comes from the two ends plus whichever
 * of those four stationary parameters the sweep reaches — no sampling needed.
 */
export function ellipseBounds(ellipse: EllipseEntity): Bounds {
  const a = ellipse.majorAxis
  const b = ellipseMinorAxis(ellipse)
  const { start, sweep } = ellipseSweepParams(ellipse)
  const points = [
    ellipsePointAt(ellipse, start),
    ellipsePointAt(ellipse, start + sweep),
  ]
  for (const extreme of [Math.atan2(b.x, a.x), Math.atan2(b.y, a.y)]) {
    for (const t of [extreme, extreme + Math.PI]) {
      if (normalizeAngle(t - start) <= sweep + 1e-9) {
        points.push(ellipsePointAt(ellipse, t))
      }
    }
  }
  return {
    min: {
      x: Math.min(...points.map((p) => p.x)),
      y: Math.min(...points.map((p) => p.y)),
    },
    max: {
      x: Math.max(...points.map((p) => p.x)),
      y: Math.max(...points.map((p) => p.y)),
    },
  }
}

/**
 * How finely the curve is chopped for the crossing-window test. Rendering does
 * not use this — the scene draws a real ellipse — so it only has to be fine
 * enough that a selection box cannot slip between two chords.
 */
const ELLIPSE_SEGMENTS = 64

/** The curve as a chain of chords, for the box-selection crossing test. */
export function ellipseSegments(ellipse: EllipseEntity): [Vec2, Vec2][] {
  const { start, sweep } = ellipseSweepParams(ellipse)
  const runs: [Vec2, Vec2][] = []
  let previous = ellipsePointAt(ellipse, start)
  for (let i = 1; i <= ELLIPSE_SEGMENTS; i++) {
    const point = ellipsePointAt(
      ellipse,
      start + (sweep * i) / ELLIPSE_SEGMENTS
    )
    runs.push([previous, point])
    previous = point
  }
  return runs
}

/**
 * How far into `ellipse`'s sweep, in its parameter, the point of it nearest
 * `p` lies: a whole ellipse's own parameter, an elliptical arc's from its
 * start, a point off the arc read at its nearer end.
 */
export function ellipseParamAt(ellipse: EllipseEntity, p: Vec2): number {
  const { start, sweep } = ellipseSweepParams(ellipse)
  const { t } = closestPointOnEllipse(
    ellipse.center,
    ellipse.majorAxis,
    ellipse.ratio,
    p,
    ellipse.startParam,
    ellipse.endParam
  )
  return isFullEllipse(ellipse)
    ? normalizeAngle(t)
    : Math.min(Math.max(t - start, 0), sweep)
}

/** A piece of an ellipse, from one of its parameters to a later one. */
export interface EllipsePiece {
  readonly startParam: number
  readonly endParam: number
}

const CUT_EPS = 1e-9

/**
 * What is left of `ellipse` once the part between `from` and `to`, offsets
 * into its sweep (`ellipseParamAt`) with `from` first, is cut out, and that
 * part: a whole ellipse runs on from `to` round to `from`, its end past its
 * start (ellipse/p334); an elliptical arc keeps what
 * lies before and after, nothing at an end, and the same offset twice splits
 * it. TRIM and BREAK cut ellipses with it.
 */
export function ellipseCut(
  ellipse: EllipseEntity,
  from: number,
  to: number
): { readonly kept: EllipsePiece[]; readonly removed: EllipsePiece } {
  const { start, sweep } = ellipseSweepParams(ellipse)
  const removed = { startParam: start + from, endParam: start + to }
  if (isFullEllipse(ellipse)) {
    const startParam = normalizeAngle(start + to)
    return {
      kept: [{ startParam, endParam: startParam + sweep - (to - from) }],
      removed,
    }
  }
  const kept: EllipsePiece[] = []
  if (from > CUT_EPS) kept.push({ startParam: start, endParam: start + from })
  if (to < sweep - CUT_EPS) {
    kept.push({ startParam: start + to, endParam: start + sweep })
  }
  return { kept, removed }
}

/** Area enclosed by a full ellipse, `π·a·b`. */
export function ellipseArea(ellipse: EllipseEntity): number {
  return Math.PI * ellipseSemiMajor(ellipse) * ellipseSemiMinor(ellipse)
}
