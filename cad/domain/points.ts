import { Vec2 } from "../geometry/Vec2"
import { normalizeAngle } from "../geometry/primitives"
import type { PointEntity } from "./entityTypes"

/**
 * PDMODE's values: a figure through the point (0 a dot, 1 nothing, 2 a plus,
 * 3 a cross, 4 a tick up) plus 32 for a circle and 64 for a square round it.
 * SETVAR refuses the rest (`Cannot set PDMODE to that value.`, point/p03).
 */
export function isPointMode(mode: number): boolean {
  return Number.isInteger(mode) && (mode & ~96) >= 0 && (mode & ~96) <= 4
}

/** `point` with its DXF 50 at `angle`, 0 not stored. */
export function withXAxisAngle(point: PointEntity, angle: number): PointEntity {
  const normal = normalizeAngle(angle)
  if (normal !== 0) return { ...point, xAxisAngle: normal }
  if (!("xAxisAngle" in point)) return point
  const copy: Record<string, unknown> = { ...point }
  delete copy.xAxisAngle
  return copy as unknown as PointEntity
}

/** What a point shows, in its object coordinates: AutoCAD's figure for PDMODE. */
export interface PointFigure {
  /** A dot of one pixel at the point (PDMODE 0). */
  readonly dot: boolean
  readonly lines: readonly (readonly [Vec2, Vec2])[]
  /** The circle round it (+32), as its radius. */
  readonly circle: number | null
}

/**
 * The figure of `point` for PDMODE `mode` at the size `size` worked out by
 * `pointSize`, measured on AutoCAD 2027's screen with an absolute PDSIZE of 2
 * (desktop, point/d01): the plus's and the cross's arms are `size` long, the
 * tick `size / 2` up, the circle's radius and the square's half side
 * `size / 2`. It turns by the negative of DXF 50 (point/p07).
 */
export function pointFigure(
  point: PointEntity,
  mode: number,
  size: number
): PointFigure {
  const c = point.position
  const turn = -(point.xAxisAngle ?? 0)
  const cos = Math.cos(turn)
  const sin = Math.sin(turn)
  const at = (x: number, y: number): Vec2 => ({
    x: c.x + x * cos - y * sin,
    y: c.y + x * sin + y * cos,
  })
  const figure = mode & 7
  const half = size / 2
  const lines: (readonly [Vec2, Vec2])[] = []
  if (figure === 2) {
    lines.push([at(-size, 0), at(size, 0)], [at(0, -size), at(0, size)])
  } else if (figure === 3) {
    const d = size / Math.SQRT2
    lines.push([at(-d, -d), at(d, d)], [at(-d, d), at(d, -d)])
  } else if (figure === 4) {
    lines.push([at(0, 0), at(0, half)])
  }
  if (mode & 64) {
    const corners = [
      at(-half, -half),
      at(half, -half),
      at(half, half),
      at(-half, half),
    ]
    corners.forEach((corner, i) => lines.push([corner, corners[(i + 1) % 4]]))
  }
  return {
    dot: figure === 0,
    lines,
    circle: mode & 32 ? half : null,
  }
}

/**
 * The size PDSIZE gives the figures, measured as AutoCAD draws them (desktop,
 * point/d01): an absolute one is the drawing units it says; 0 and a negative
 * one a percentage of the view's height (0 is 5), halved — PDSIZE 0 and -5
 * draw alike, a plus 5 % of the view tall.
 */
export function pointSize(pdsize: number, viewHeight: number): number {
  if (pdsize > 0) return pdsize
  const percent = pdsize === 0 ? 5 : -pdsize
  return (percent / 100) * viewHeight * 0.5
}
