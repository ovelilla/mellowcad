import { Vec2, V } from "../geometry/Vec2"
import { normalizeAngle } from "../geometry/primitives"
import {
  Linetype,
  LinetypeText,
  centredPattern,
  linetypeDashes,
  loopPattern,
} from "./linetypes"
import { measureTextWidth } from "./text"
import { PolylineSegmentGeometry } from "./polylines"

/** A run an object's linetype is laid along: its length, and the point at a distance along it. */
export interface LinetypePath {
  readonly length: number
  pointAt(distance: number): Vec2
}

/** One text of a complex linetype as it is drawn: on its baseline's start, turned `angle`. */
export interface LinetypeTextPlacement {
  readonly text: string
  readonly at: Vec2
  readonly angle: number
  /** Its capitals' height, as a TEXT's. */
  readonly height: number
}

/**
 * More periods than this and no text is laid: a pattern that small cannot be
 * read, and laying it would be tens of thousands of texts.
 */
const MAX_TEXT_PERIODS = 2048

/**
 * Where a complex linetype's texts stand along `path` (GAS_LINE's `GAS`), as
 * AutoCAD 2027 plots them (probes ltype/p14, p15): in each whole period of
 * the pattern laid as the object lays its dashes — `centred` as a line's or an
 * arc's ({@link centredPattern}), a `loop` as a circle's ({@link loopPattern},
 * its positions stretched as its dashes are) — at the end of the dash or gap
 * the text follows, moved X along the path and Y across it, its capitals S
 * tall (times the style's height when it has one), turned R from the path's
 * direction or to A absolutely. U (upright) turns a text that would read
 * leftwards half round about the middle of its box, so it reads left to right
 * on the same stretch: a line drawn right to left shows its texts where one
 * drawn left to right does (p15); straight up or down it is left as it is
 * (p14). `factor` is LTSCALE times the object's own scale.
 */
export function linetypeTextPlacements(
  path: LinetypePath,
  laid: "centred" | "loop",
  linetype: Linetype,
  factor: number,
  styleHeight: (style: string) => number
): LinetypeTextPlacement[] {
  const texts = (linetype.elements ?? []).filter(
    (element): element is LinetypeText => element.kind === "text"
  )
  if (texts.length === 0 || !(factor > 0)) return []
  const pattern = linetype.pattern.map((length) => length * factor)
  const dashes = linetypeDashes(pattern)
  const period = dashes.reduce((sum, run) => sum + run, 0)
  if (!(period > 0)) return []
  let starts: number[]
  let stretch = 1
  if (laid === "loop") {
    const layout = loopPattern(dashes, path.length)
    if (!layout || layout.periods > MAX_TEXT_PERIODS) return []
    stretch = path.length / (layout.periods * period)
    starts = Array.from(
      { length: layout.periods },
      (_, k) => k * period * stretch
    )
  } else {
    const layout = centredPattern(dashes, path.length)
    const periods = Math.floor(path.length / period + 1e-9)
    if (!layout || periods > MAX_TEXT_PERIODS) return []
    const first = layout.lead - layout.offset
    starts = Array.from({ length: periods }, (_, k) => first + k * period)
  }
  // Where each length of the pattern ends, from its period's start.
  const ends: number[] = []
  let sum = 0
  for (const length of pattern) ends.push((sum += Math.abs(length)))
  const placements: LinetypeTextPlacement[] = []
  for (const start of starts) {
    for (const text of texts) {
      const distance = start + (ends[text.index] ?? 0) * stretch
      const placed = placeText(path, distance, text, factor, styleHeight)
      if (placed) placements.push(placed)
    }
  }
  return placements
}

/** A straight run from `a` to `b`. */
export function linePath(a: Vec2, b: Vec2): LinetypePath {
  const length = V.distance(a, b)
  return {
    length,
    pointAt: (distance) => (length > 0 ? V.lerp(a, b, distance / length) : a),
  }
}

/** A run round `center` from `start` through `sweep` (signed: positive counter-clockwise). */
export function arcPath(
  center: Vec2,
  radius: number,
  start: number,
  sweep: number
): LinetypePath {
  const turn = Math.sign(sweep) || 1
  return {
    length: radius * Math.abs(sweep),
    pointAt: (distance) => {
      const angle = start + (turn * distance) / radius
      return {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      }
    },
  }
}

/** A polyline's segments as one run, start to end (PEDIT's Ltype gen). */
export function segmentsPath(
  segments: readonly PolylineSegmentGeometry[]
): LinetypePath {
  const paths = segments.map((segment) =>
    segment.kind === "line"
      ? linePath(segment.a, segment.b)
      : arcPath(
          segment.center,
          segment.radius,
          Math.atan2(
            segment.a.y - segment.center.y,
            segment.a.x - segment.center.x
          ),
          4 * Math.atan(segment.bulge)
        )
  )
  const length = paths.reduce((sum, path) => sum + path.length, 0)
  return {
    length,
    pointAt: (distance) => {
      let left = distance
      for (const path of paths) {
        if (left <= path.length) return path.pointAt(left)
        left -= path.length
      }
      const last = paths.at(-1)
      return last ? last.pointAt(last.length) : { x: 0, y: 0 }
    },
  }
}

function placeText(
  path: LinetypePath,
  distance: number,
  text: LinetypeText,
  factor: number,
  styleHeight: (style: string) => number
): LinetypeTextPlacement | null {
  if (distance < -1e-9 || distance > path.length + 1e-9) return null
  const at = path.pointAt(distance)
  // The path's direction there, from either side of the point.
  const step = Math.max(path.length * 1e-6, 1e-9)
  const before = path.pointAt(Math.max(0, distance - step))
  const after = path.pointAt(Math.min(path.length, distance + step))
  const direction = Math.atan2(after.y - before.y, after.x - before.x)
  const along = { x: Math.cos(direction), y: Math.sin(direction) }
  const across = { x: -along.y, y: along.x }
  const fixed = styleHeight(text.style)
  const height = text.scale * factor * (fixed > 0 ? fixed : 1)
  if (!(height > 0)) return null
  const base = V.add(
    at,
    V.add(
      V.scale(along, text.offset.x * factor),
      V.scale(across, text.offset.y * factor)
    )
  )
  const angle =
    text.rotationMode === "absolute" ? text.rotation : direction + text.rotation
  if (text.rotationMode !== "upright" || Math.cos(angle) >= -1e-9) {
    return { text: text.text, at: base, angle, height }
  }
  // Half round about the middle of its box.
  const width = measureTextWidth(text.text, height)
  const middle = V.add(
    base,
    V.add(
      V.scale({ x: Math.cos(angle), y: Math.sin(angle) }, width / 2),
      V.scale({ x: -Math.sin(angle), y: Math.cos(angle) }, height / 2)
    )
  )
  return {
    text: text.text,
    at: V.sub(V.scale(middle, 2), base),
    angle: normalizeAngle(angle + Math.PI),
    height,
  }
}
