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
    ...(span
      ? {
          startParam: span.start + axes.paramShift,
          endParam: span.end + axes.paramShift,
        }
      : {}),
  }
}

/**
 * Returns a copy of `ellipse` (id and overrides intact) reshaped to the given
 * axis and ratio — the path a retyped Properties row takes, and the one a grip
 * drag will take, so both get the major-axis normalisation for free.
 */
export function ellipseWithAxes(
  ellipse: EllipseEntity,
  majorAxis: Vec2,
  ratio: number
): EllipseEntity {
  const axes = normalizeEllipseAxes(majorAxis, ratio)
  return {
    ...ellipse,
    majorAxis: axes.majorAxis,
    ratio: axes.ratio,
    ...(ellipse.startParam !== undefined && ellipse.endParam !== undefined
      ? {
          startParam: ellipse.startParam + axes.paramShift,
          endParam: ellipse.endParam + axes.paramShift,
        }
      : {}),
  }
}

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
  if (resolved <= 1) {
    return {
      majorAxis: { x: majorAxis.x, y: majorAxis.y },
      ratio: resolved,
      paramShift: 0,
    }
  }
  return {
    majorAxis: V.scale(V.perpendicular(majorAxis), resolved),
    ratio: 1 / resolved,
    paramShift: -Math.PI / 2,
  }
}

/**
 * The parameter range to store, or `null` for a full ellipse. A range that
 * sweeps a whole turn is a full ellipse and stores nothing, which is what keeps
 * mirroring one an identity instead of a range that has to be re-normalised.
 */
function ellipseSpan(
  start: number | undefined,
  end: number | undefined
): { readonly start: number; readonly end: number } | null {
  if (start === undefined || end === undefined) return null
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  if (normalizeAngle(end - start) < 1e-9) return null
  return { start, end }
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

export function ellipseEndPoint(ellipse: EllipseEntity): Vec2 {
  const { start, sweep } = ellipseSweepParams(ellipse)
  return ellipsePointAt(ellipse, start + sweep)
}

export function ellipseMidpoint(ellipse: EllipseEntity): Vec2 {
  const { start, sweep } = ellipseSweepParams(ellipse)
  return ellipsePointAt(ellipse, start + sweep / 2)
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
 * start (AutoCAD 2023's console, acc/be1–be3); an elliptical arc keeps what
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
