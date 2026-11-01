import { Vec3, add3, cross3, dot3, normalize3, scale3, sub3 } from "./Vec3"
import {
  BSplineCurve,
  bsplineDifferentials,
  bsplineDomain,
  bsplinePoint,
} from "./nurbs"
import type { Brep, BrepEdge } from "./solids"

/**
 * An edge of a B-rep as a curve in space, run from its start vertex to its
 * end: a segment on `[0, 1]`, a circle or an ellipse by its own angle (from
 * the start's, counter-clockwise about its normal, a whole turn when it
 * starts and ends at one vertex), a spline on its domain, a point on `[0, 0]`.
 */
export interface EdgeTrace {
  readonly t0: number
  readonly t1: number
  /** Whether `t` is an angle: a circle's or an ellipse's. */
  readonly angular: boolean
  point(t: number): Vec3
  derivative(t: number): Vec3
}

const differentials = new WeakMap<
  BSplineCurve,
  ReturnType<typeof bsplineDifferentials>
>()

/** A spline's first derivative, its differentials made once per curve. */
export function splineFirst(curve: BSplineCurve, t: number): Vec3 {
  let found = differentials.get(curve)
  if (!found) {
    found = bsplineDifferentials(curve)
    differentials.set(curve, found)
  }
  return found.first(t)
}

const TURN = 2 * Math.PI

/** The angle from `from` to `to` counter-clockwise, in `[0, 2π)`. */
export function ccwSweep(from: number, to: number): number {
  return (((to - from) % TURN) + TURN) % TURN
}

export function edgeTrace(brep: Brep, edge: BrepEdge): EdgeTrace {
  return curveTrace(brep.vertices[edge.start], brep.vertices[edge.end], edge)
}

/** The edge's curve run from `a` to `b`, which its start and end vertices are. */
export function curveTrace(
  a: Vec3,
  b: Vec3,
  edge: Pick<BrepEdge, "start" | "end" | "curve">
): EdgeTrace {
  const c = edge.curve
  const closed = edge.start === edge.end
  switch (c.kind) {
    case "line": {
      const d = sub3(b, a)
      return {
        t0: 0,
        t1: 1,
        angular: false,
        point: (t) => add3(a, scale3(d, t)),
        derivative: () => d,
      }
    }
    case "point":
      return {
        t0: 0,
        t1: 0,
        angular: false,
        point: () => a,
        derivative: () => ({ x: 0, y: 0, z: 0 }),
      }
    case "spline": {
      const { start, end } = bsplineDomain(c.curve)
      return {
        t0: start,
        t1: end,
        angular: false,
        point: (t) => bsplinePoint(c.curve, t),
        derivative: (t) => splineFirst(c.curve, t),
      }
    }
    case "circle":
    case "ellipse": {
      const major =
        c.kind === "circle"
          ? scale3(
              normalize3(
                sub3(
                  sub3(a, c.center),
                  scale3(c.normal, dot3(sub3(a, c.center), c.normal))
                )
              ) ?? { x: 1, y: 0, z: 0 },
              c.radius
            )
          : c.majorAxis
      const minor = scale3(
        cross3(c.normal, major),
        c.kind === "circle" ? 1 : c.ratio
      )
      const param = (p: Vec3) => {
        const d = sub3(p, c.center)
        return Math.atan2(
          dot3(d, minor) / dot3(minor, minor),
          dot3(d, major) / dot3(major, major)
        )
      }
      const t0 = c.kind === "circle" ? 0 : param(a)
      const sweep = closed ? TURN : ccwSweep(t0, param(b))
      return {
        t0,
        t1: t0 + sweep,
        angular: true,
        point: (t) =>
          add3(
            c.center,
            add3(scale3(major, Math.cos(t)), scale3(minor, Math.sin(t)))
          ),
        derivative: (t) =>
          add3(scale3(major, -Math.sin(t)), scale3(minor, Math.cos(t))),
      }
    }
  }
}
