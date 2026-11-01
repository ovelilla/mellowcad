import { Vec3, add3, cross3, dot3, length3, scale3, sub3 } from "./Vec3"
import {
  BSplineCurve,
  bsplineBreakpoints,
  bsplineDifferentials,
  bsplinePoint,
} from "./nurbs"
import { Rule, gaussRule, polynomialRule, trigRule } from "./quadrature"
import type { BrepSurface, FaceDomain, SweptCurve } from "./solids"

/**
 * The faces a sweep makes, by their surface's own parameters: where a point
 * of one lies, its normal there, and the rules that integrate over it. A
 * cylinder, a cone, a sphere and a torus are read as their primitives are; a
 * revolution and an extrusion through the profile they carry.
 */

type Curved = Exclude<BrepSurface, { kind: "plane" }>

const differentials = new WeakMap<
  BSplineCurve,
  ReturnType<typeof bsplineDifferentials>
>()

function splineDerivative(curve: BSplineCurve, u: number): Vec3 {
  let found = differentials.get(curve)
  if (!found) {
    found = bsplineDifferentials(curve)
    differentials.set(curve, found)
  }
  return found.first(u)
}

export function sweptCurvePoint(c: SweptCurve, t: number): Vec3 {
  if (c.kind === "spline") return bsplinePoint(c.curve, t)
  return add3(
    c.center,
    add3(scale3(c.majorAxis, Math.cos(t)), scale3(c.minorAxis, Math.sin(t)))
  )
}

function sweptCurveDerivative(c: SweptCurve, t: number): Vec3 {
  if (c.kind === "spline") return splineDerivative(c.curve, t)
  return add3(
    scale3(c.majorAxis, -Math.sin(t)),
    scale3(c.minorAxis, Math.cos(t))
  )
}

/** `p` turned `angle` radians round the unit `axis` through `origin`, right-handed. */
export function turnedAbout(
  p: Vec3,
  origin: Vec3,
  axis: Vec3,
  angle: number
): Vec3 {
  const q = sub3(p, origin)
  const h = dot3(q, axis)
  const w = sub3(q, scale3(axis, h))
  return add3(
    origin,
    add3(
      scale3(axis, h),
      add3(scale3(w, Math.cos(angle)), scale3(cross3(axis, w), Math.sin(angle)))
    )
  )
}

/** The point at `(u, v)` of a curved surface and its derivatives there. */
function surfaceFrame(
  s: Curved,
  u: number,
  v: number
): { p: Vec3; du: Vec3; dv: Vec3 } {
  switch (s.kind) {
    case "cylinder":
    case "cone": {
      const y = cross3(s.axis, s.xAxis)
      const c = Math.cos(u)
      const sn = Math.sin(u)
      const k = s.kind === "cylinder" ? s.radius : s.slope * v
      const round = add3(scale3(s.xAxis, c), scale3(y, s.ratio * sn))
      const turn = add3(scale3(s.xAxis, -sn), scale3(y, s.ratio * c))
      const base = s.kind === "cylinder" ? s.origin : s.apex
      return {
        p: add3(base, add3(scale3(s.axis, v), scale3(round, k))),
        du: scale3(turn, k),
        dv:
          s.kind === "cylinder" ? s.axis : add3(s.axis, scale3(round, s.slope)),
      }
    }
    case "sphere":
    case "torus": {
      const R = s.kind === "sphere" ? 0 : s.majorRadius
      const r = s.kind === "sphere" ? s.radius : s.minorRadius
      const y = cross3(s.axis, s.xAxis)
      const out = add3(scale3(s.xAxis, Math.cos(u)), scale3(y, Math.sin(u)))
      const turn = add3(scale3(s.xAxis, -Math.sin(u)), scale3(y, Math.cos(u)))
      const rho = R + r * Math.cos(v)
      return {
        p: add3(
          s.center,
          add3(scale3(out, rho), scale3(s.axis, r * Math.sin(v)))
        ),
        du: scale3(turn, rho),
        dv: add3(
          scale3(out, -r * Math.sin(v)),
          scale3(s.axis, r * Math.cos(v))
        ),
      }
    }
    case "revolution": {
      const at = sweptCurvePoint(s.profile, v)
      const p = turnedAbout(at, s.origin, s.axis, u)
      const tangent = turnedAbout(
        add3(s.origin, sweptCurveDerivative(s.profile, v)),
        s.origin,
        s.axis,
        u
      )
      return {
        p,
        du: cross3(s.axis, sub3(p, s.origin)),
        dv: sub3(tangent, s.origin),
      }
    }
    case "extrusion":
      return {
        p: add3(sweptCurvePoint(s.profile, u), scale3(s.direction, v)),
        du: sweptCurveDerivative(s.profile, u),
        dv: s.direction,
      }
  }
}

export function surfacePoint(s: Curved, u: number, v: number): Vec3 {
  return surfaceFrame(s, u, v).p
}

/** How each parameter of a surface runs: round a turn, along a line, or along a profile. */
type Param = "angle" | "linear" | SweptCurve

function parameters(s: Curved): [Param, Param] {
  switch (s.kind) {
    case "cylinder":
    case "cone":
      return ["angle", "linear"]
    case "sphere":
    case "torus":
      return ["angle", "angle"]
    case "revolution":
      return ["angle", s.profile]
    case "extrusion":
      return [s.profile, "linear"]
  }
}

/**
 * Gauss on each polynomial piece of a spline from `from` to `to`, `parts` to
 * a piece: exact for a polynomial integrand of degree 31 or less, as a
 * profile's flux is (`bsplineIntegral`'s rule); a rational one's, past the
 * double's precision.
 */
function splineRule(
  curve: BSplineCurve,
  from: number,
  to: number,
  parts: number
): Rule {
  if (to < from) {
    return splineRule(curve, to, from, parts).map(({ t, w }) => ({
      t,
      w: -w,
    }))
  }
  const cuts = [
    from,
    ...bsplineBreakpoints(curve).filter((k) => k > from && k < to),
    to,
  ]
  return cuts.slice(1).flatMap((b, i) => gaussRule(cuts[i], b, parts))
}

/** A quarter turn's worth of Gauss pieces: an integrand no rule is exact for. */
const AREA_PIECE = Math.PI / 4

function ruleOf(param: Param, a: number, b: number, exact: boolean): Rule {
  if (param === "linear") return polynomialRule(a, b)
  if (param === "angle" || param.kind === "ellipse") {
    return exact
      ? trigRule(a, b)
      : gaussRule(a, b, Math.max(1, Math.ceil(Math.abs(b - a) / AREA_PIECE)))
  }
  const rational = !!param.curve.weights
  return splineRule(param.curve, a, b, exact && !rational ? 1 : 4)
}

/** A sample of a face: its point, `∂u × ∂v` there and the rule's weight. */
export interface FaceSample {
  readonly p: Vec3
  readonly n: Vec3
  readonly w: number
}

/**
 * The face's samples: `exact` for an integrand polynomial in its parameters
 * (the flux of 1, p and p pᵀ: every rule here integrates it exactly), else
 * fine enough for one that is not (the area's root).
 */
export function domainSamples(
  s: Curved,
  domain: FaceDomain,
  exact: boolean
): FaceSample[] {
  const [pu, pv] = parameters(s)
  const us = ruleOf(pu, domain.u[0], domain.u[1], exact)
  const vs = ruleOf(pv, domain.v[0], domain.v[1], exact)
  const out: FaceSample[] = []
  for (const a of us) {
    for (const b of vs) {
      const { p, du, dv } = surfaceFrame(s, a.t, b.t)
      out.push({ p, n: cross3(du, dv), w: a.w * b.w })
    }
  }
  return out
}

/** A swept face's area and its flux `∫ (x − about) · n dA`. */
export function domainFaceMeasures(
  s: Curved,
  domain: FaceDomain,
  about: Vec3
): { area: number; flux: number } {
  let flux = 0
  for (const { p, n, w } of domainSamples(s, domain, true)) {
    flux += dot3(sub3(p, about), n) * w
  }
  let area = 0
  for (const { n, w } of domainSamples(s, domain, false)) {
    area += length3(n) * Math.abs(w)
  }
  return { area, flux }
}

/**
 * Where ISOLINES' lines cross a range of a turn: every `2π / count` from the
 * range's start (r03's revolved faces, x09's arc extruded from the arc's
 * start, ACIS's seam), the ends left out where the range is short of a
 * turn, as an edge runs there; a whole turn's `count`, its start included.
 */
export function turnIsolines(
  range: readonly [number, number],
  count: number
): number[] {
  const [a, b] = range
  const span = Math.abs(b - a)
  const step = (2 * Math.PI) / count
  const whole = span >= 2 * Math.PI - 1e-12
  const out: number[] = []
  for (let k = whole ? 0 : 1; k < count && k * step < span - 1e-9; k++) {
    out.push(a + Math.sign(b - a) * k * step)
  }
  return out
}

/** The parameters spread evenly inside a range, `count` of them, its ends left out. */
export function spreadIsolines(
  range: readonly [number, number],
  count: number
): number[] {
  const [a, b] = range
  return Array.from(
    { length: count },
    (_, k) => a + ((b - a) * (k + 1)) / (count + 1)
  )
}
