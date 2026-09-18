import { Vec2, V } from "../geometry/Vec2"
import {
  normalizeAngle,
  polarPoint,
  normalizeDegrees,
} from "../geometry/primitives"
import { LineEntity, CircleEntity, ArcEntity } from "./entityTypes"

export function lineMidpoint(line: LineEntity): Vec2 {
  return V.midpoint(line.start, line.end)
}

export function lineLength(line: LineEntity): number {
  return V.distance(line.start, line.end)
}

/**
 * Direction angle of a line in degrees, measured counter-clockwise from the
 * positive X axis and normalised to the `[0, 360)` range (AutoCAD convention).
 */
export function lineAngleDegrees(line: LineEntity): number {
  return normalizeDegrees(
    (Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x) * 180) /
      Math.PI
  )
}

export function circleCircumference(circle: CircleEntity): number {
  return 2 * Math.PI * circle.radius
}

export function circleArea(circle: CircleEntity): number {
  return Math.PI * circle.radius * circle.radius
}

/** The arc's start point (at `startAngle`). */
export function arcStartPoint(arc: ArcEntity): Vec2 {
  return polarPoint(arc.center, arc.radius, arc.startAngle)
}

/** The arc's end point (at `endAngle`). */
export function arcEndPoint(arc: ArcEntity): Vec2 {
  return polarPoint(arc.center, arc.radius, arc.endAngle)
}

/** The arc's swept angle (radians), always positive in `(0, 2π]`. */
export function arcSweepAngle(arc: ArcEntity): number {
  const sweep = normalizeAngle(arc.endAngle - arc.startAngle)
  return sweep < 1e-9 ? Math.PI * 2 : sweep
}

/** The point at the middle of the arc's sweep. */
export function arcMidpoint(arc: ArcEntity): Vec2 {
  return polarPoint(
    arc.center,
    arc.radius,
    arc.startAngle + arcSweepAngle(arc) / 2
  )
}

/** The arc's length (world units): `radius × sweep`. */
export function arcLength(arc: ArcEntity): number {
  return arc.radius * arcSweepAngle(arc)
}
