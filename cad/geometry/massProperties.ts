import { Vec2 } from "./Vec2"
import { Vec3, add3, cross3, dot3, scale3, sub3 } from "./Vec3"
import { Axes3, axesToWorld } from "./ocs"
import { bsplineIntegral } from "./nurbs"
import { PlanarCurve, curveDerivative, curvePoint } from "./planarCurves"
import { RegionFace } from "./planarRegions"
import {
  Brep,
  BrepFace,
  brepAnchor,
  loopHeights,
  planarFace,
  tubeHalfAngle,
} from "./solids"

/** A symmetric 3 × 3 matrix by its six entries. */
export interface Sym3 {
  readonly xx: number
  readonly yy: number
  readonly zz: number
  readonly xy: number
  readonly yz: number
  readonly zx: number
}

/**
 * A body's moments about `origin` — a solid's over its volume, a region's
 * over its area —, in the axes its points are given in: `measure` is ∫ 1,
 * `first` ∫ (p − origin), `second` ∫ (p − origin)(p − origin)ᵀ. They are
 * taken about a point of the body and moved only to report: about the
 * world's origin a body far from it loses its centroidal moments to the
 * cancellation of two large numbers.
 */
export interface Moments {
  readonly origin: Vec3
  readonly measure: number
  readonly first: Vec3
  readonly second: Sym3
}

const ZERO: Vec3 = { x: 0, y: 0, z: 0 }
const NONE: Sym3 = { xx: 0, yy: 0, zz: 0, xy: 0, yz: 0, zx: 0 }

/** `a bᵀ + b aᵀ`, halved when `a` is `b`: the symmetric part of the outer product, twice. */
function outer(a: Vec3, b: Vec3, k: number): Sym3 {
  return {
    xx: 2 * k * a.x * b.x,
    yy: 2 * k * a.y * b.y,
    zz: 2 * k * a.z * b.z,
    xy: k * (a.x * b.y + a.y * b.x),
    yz: k * (a.y * b.z + a.z * b.y),
    zx: k * (a.z * b.x + a.x * b.z),
  }
}

function plus(a: Sym3, b: Sym3): Sym3 {
  return {
    xx: a.xx + b.xx,
    yy: a.yy + b.yy,
    zz: a.zz + b.zz,
    xy: a.xy + b.xy,
    yz: a.yz + b.yz,
    zx: a.zx + b.zx,
  }
}

/** The same moments about another point (the parallel axis theorem). */
export function momentsAbout(m: Moments, origin: Vec3): Moments {
  const d = sub3(m.origin, origin)
  return {
    origin,
    measure: m.measure,
    first: add3(m.first, scale3(d, m.measure)),
    second: plus(
      plus(m.second, outer(m.first, d, 1)),
      outer(d, d, m.measure / 2)
    ),
  }
}

/** Several bodies' moments as one's, about the first's point. */
export function momentsSum(all: readonly Moments[]): Moments | null {
  if (all.length === 0) return null
  const origin = all[0].origin
  return all
    .map((m) => momentsAbout(m, origin))
    .reduce((sum, m) => ({
      origin,
      measure: sum.measure + m.measure,
      first: add3(sum.first, m.first),
      second: plus(sum.second, m.second),
    }))
}

/** A rule `∫ f ≈ Σ wᵢ f(tᵢ)`. */
type Rule = readonly { readonly t: number; readonly w: number }[]

/** Gauss–Legendre's five nodes on [−1, 1]: exact for a polynomial up to degree 9. */
const LEGENDRE_5 = [
  [0, 128 / 225],
  [Math.sqrt(5 - 2 * Math.sqrt(10 / 7)) / 3, (322 + 13 * Math.sqrt(70)) / 900],
  [Math.sqrt(5 + 2 * Math.sqrt(10 / 7)) / 3, (322 - 13 * Math.sqrt(70)) / 900],
] as const

/** Gauss–Legendre on `[a, b]`, exact for the polynomials here (degree ≤ 9). */
function polynomialRule(a: number, b: number): Rule {
  const half = (b - a) / 2
  const middle = (a + b) / 2
  return LEGENDRE_5.flatMap(([x, w]) =>
    x === 0
      ? [{ t: middle, w: w * half }]
      : [
          { t: middle - x * half, w: w * half },
          { t: middle + x * half, w: w * half },
        ]
  )
}

/**
 * Samples over a turn: a trigonometric polynomial of degree below half of
 * them is known exactly from its values there, the most any integrand here
 * has (5: a torus' tube; 4: an elliptical arc's Green's moments).
 */
const TRIG_SAMPLES = 18

/**
 * The rule exact on `[a, b]` for a trigonometric polynomial of degree up to
 * {@link TRIG_SAMPLES}/2 − 1: its Fourier coefficients from the samples, each
 * harmonic integrated in closed form, gathered as weights on the samples. No
 * Gauss rule is exact for a sine, which a tube or an arc's end cuts anywhere.
 */
function trigRule(a: number, b: number): Rule {
  const n = TRIG_SAMPLES
  return Array.from({ length: n }, (_, j) => {
    const t = (2 * Math.PI * j) / n
    let w = (b - a) / n
    for (let k = 1; k < n / 2; k++) {
      w +=
        (2 / n / k) *
        (Math.cos(k * t) * (Math.sin(k * b) - Math.sin(k * a)) +
          Math.sin(k * t) * (Math.cos(k * a) - Math.cos(k * b)))
    }
    return { t, w }
  })
}

/** Gathers `∫ φ dV` for φ 1, p and p pᵀ by the divergence theorem, a face's flux at a time. */
class Flux {
  measure = 0
  first: Vec3 = ZERO
  second: Sym3 = NONE

  /**
   * One sample of a face: the point `p` (from the body's point), its outward
   * normal times the area there, `n`, and the rule's weight: `div p = 3`,
   * `div (pᵢ p) = 4 pᵢ`, `div (pᵢ pⱼ p) = 5 pᵢ pⱼ`.
   */
  add(p: Vec3, n: Vec3, w: number): void {
    const flux = dot3(p, n) * w
    this.measure += flux / 3
    this.first = add3(this.first, scale3(p, flux / 4))
    this.second = plus(this.second, outer(p, p, flux / 10))
  }

  moments(origin: Vec3): Moments {
    return {
      origin,
      measure: this.measure,
      first: this.first,
      second: this.second,
    }
  }
}

/**
 * A solid's moments, exact: the divergence theorem turns each into its
 * flux through the faces, a plane's through its region's moments, a curved
 * face's over its parameters — round its axis a turn (a trigonometric rule),
 * along it a polynomial (Gauss), round a tube or a meridian an arc of a turn
 * (the trigonometric rule on the arc). Every integrand is a polynomial in
 * those, so no rule here approximates.
 */
export function brepMoments(brep: Brep): Moments {
  const origin = brepAnchor(brep)
  const flux = new Flux()
  for (const face of brep.faces) faceFlux(brep, face, origin, flux)
  return flux.moments(origin)
}

function faceFlux(brep: Brep, face: BrepFace, about: Vec3, flux: Flux): void {
  const s = face.surface
  const round = trigRule(0, 2 * Math.PI)
  const along = (o: Vec3, axis: Vec3, x: Vec3) => {
    const y = cross3(axis, x)
    return (u: number, v: number) =>
      add3(sub3(o, about), add3(scale3(x, u), scale3(y, v)))
  }
  switch (s.kind) {
    case "plane": {
      const flat = planarFace(brep, face, about)
      const m = planarMoments([flat.face], { x: 0, y: 0 })
      const e = flat.elevation
      const { x: ex, y: ey, z: ez } = flat.axes
      // Every point of it lies `e` out along its normal: the flux is `e` dA.
      flux.measure += (e * m.area) / 3
      flux.first = add3(
        flux.first,
        scale3(
          add3(add3(scale3(ex, m.u), scale3(ey, m.v)), scale3(ez, e * m.area)),
          e / 4
        )
      )
      flux.second = plus(
        flux.second,
        [
          outer(ex, ex, (e * m.uu) / 10),
          outer(ey, ey, (e * m.vv) / 10),
          outer(ez, ez, (e * e * e * m.area) / 10),
          outer(ex, ey, (e * m.uv) / 5),
          outer(ex, ez, (e * e * m.u) / 5),
          outer(ey, ez, (e * e * m.v) / 5),
        ].reduce(plus)
      )
      return
    }
    case "cylinder": {
      const [t0, t1] = loopHeights(brep, face, s.origin, s.axis)
      const a = s.radius
      const b = s.radius * s.ratio
      const at = along(s.origin, s.axis, s.xAxis)
      const y = cross3(s.axis, s.xAxis)
      for (const { t: theta, w } of round) {
        const c = Math.cos(theta)
        const sn = Math.sin(theta)
        // ∂θ × ∂t, outward: b cos θ X + a sin θ Y.
        const n = add3(scale3(s.xAxis, b * c), scale3(y, a * sn))
        for (const { t, w: v } of polynomialRule(t0, t1)) {
          const p = add3(at(a * c, b * sn), scale3(s.axis, t))
          flux.add(p, n, w * v)
        }
      }
      return
    }
    case "cone": {
      const heights = loopHeights(brep, face, s.apex, s.axis)
      const at = along(s.apex, s.axis, s.xAxis)
      const y = cross3(s.axis, s.xAxis)
      const k = s.slope
      const r = s.ratio
      for (const { t: theta, w } of round) {
        const c = Math.cos(theta)
        const sn = Math.sin(theta)
        for (const { t, w: v } of polynomialRule(
          Math.min(...heights),
          Math.max(...heights)
        )) {
          const p = add3(at(k * t * c, k * r * t * sn), scale3(s.axis, t))
          // ∂θ × ∂t = t k (r cos θ X + sin θ Y − k r Z), away from the axis.
          const n = scale3(
            add3(
              add3(scale3(s.xAxis, r * c), scale3(y, sn)),
              scale3(s.axis, -k * r)
            ),
            t * k
          )
          flux.add(p, n, w * v)
        }
      }
      return
    }
    case "sphere":
    case "torus": {
      // A sphere is the torus round no ring: its tube is the whole circle's
      // half outside the axis, from pole to pole.
      const R = s.kind === "sphere" ? 0 : s.majorRadius
      const r = s.kind === "sphere" ? s.radius : s.minorRadius
      const half = s.kind === "sphere" ? Math.PI / 2 : tubeHalfAngle(R, r)
      const at = along(s.center, s.axis, s.xAxis)
      const y = cross3(s.axis, s.xAxis)
      const tube = trigRule(-half, half)
      for (const { t: theta, w } of round) {
        const u = add3(
          scale3(s.xAxis, Math.cos(theta)),
          scale3(y, Math.sin(theta))
        )
        for (const { t: phi, w: v } of tube) {
          const rho = R + r * Math.cos(phi)
          const out = add3(
            scale3(u, Math.cos(phi)),
            scale3(s.axis, Math.sin(phi))
          )
          const p = add3(
            at(0, 0),
            add3(scale3(u, rho), scale3(s.axis, r * Math.sin(phi)))
          )
          flux.add(p, scale3(out, r * rho), w * v)
        }
      }
      return
    }
  }
}

/**
 * A planar region's moments in its own plane, about `about`: its area and
 * `∫ u`, `∫ v`, `∫ u²`, `∫ uv`, `∫ v²`, by Green's theorem round each loop,
 * `∬ uᵃ vᵇ = ∮ uᵃ⁺¹ vᵇ / (a + 1) dv` — exact on a line (Gauss), an arc
 * (the trigonometric rule) and a polynomial spline; a rational one's to the
 * double's precision.
 */
export interface PlanarMoments {
  readonly area: number
  readonly u: number
  readonly v: number
  readonly uu: number
  readonly uv: number
  readonly vv: number
}

export function planarMoments(
  faces: readonly RegionFace[],
  about: Vec2
): PlanarMoments {
  const sum = { area: 0, u: 0, v: 0, uu: 0, uv: 0, vv: 0 }
  const add = (p: Vec2, dv: number, w: number) => {
    const u = p.x - about.x
    const v = p.y - about.y
    sum.area += u * dv * w
    sum.u += ((u * u) / 2) * dv * w
    sum.v += u * v * dv * w
    sum.uu += ((u * u * u) / 3) * dv * w
    sum.uv += ((u * u * v) / 2) * dv * w
    sum.vv += u * v * v * dv * w
  }
  for (const face of faces) {
    for (const loop of face.loops) {
      for (const c of loop) curveMoments(c, add, sum, about)
    }
  }
  return sum
}

function curveMoments(
  c: PlanarCurve,
  add: (p: Vec2, dv: number, w: number) => void,
  sum: {
    area: number
    u: number
    v: number
    uu: number
    uv: number
    vv: number
  },
  about: Vec2
): void {
  switch (c.kind) {
    case "line":
      for (const { t, w } of polynomialRule(0, 1)) {
        add(curvePoint(c, t), c.end.y - c.start.y, w)
      }
      return
    case "arc":
    case "ellipse": {
      // By the angle, at which point and speed are of degree 1.
      const from = c.kind === "arc" ? c.startAngle : c.startParam
      for (const { t, w } of trigRule(from, from + c.sweep)) {
        const s = (t - from) / c.sweep
        add(curvePoint(c, s), curveDerivative(c, s).y / c.sweep, w)
      }
      return
    }
    case "spline": {
      const at = (f: (u: number, v: number) => number) =>
        bsplineIntegral(
          c.curve,
          c.from,
          c.to,
          (p, d) => f(p.x - about.x, p.y - about.y) * d.y,
          3
        )
      sum.area += at((u) => u)
      sum.u += at((u) => (u * u) / 2)
      sum.v += at((u, v) => u * v)
      sum.uu += at((u) => (u * u * u) / 3)
      sum.uv += at((u, v) => (u * u * v) / 2)
      sum.vv += at((u, v) => u * v * v)
    }
  }
}

/**
 * A planar region's moments in space: its plane's frame `axes` (its points
 * `u X + v Y + elevation Z`), about its own point `about` there.
 */
export function regionMoments(
  faces: readonly RegionFace[],
  axes: Axes3,
  elevation: number,
  about: Vec2
): Moments {
  const m = planarMoments(faces, about)
  return {
    origin: axesToWorld(axes, { x: about.x, y: about.y, z: elevation }),
    measure: m.area,
    first: add3(scale3(axes.x, m.u), scale3(axes.y, m.v)),
    second: [
      outer(axes.x, axes.x, m.uu / 2),
      outer(axes.y, axes.y, m.vv / 2),
      outer(axes.x, axes.y, m.uv),
    ].reduce(plus),
  }
}

/** An axis about which the body turns freest or stiffest, and its moment. */
export interface PrincipalMoment<V> {
  readonly moment: number
  readonly direction: V
}

/** What MASSPROP reports of a solid, about the origin of the axes its points are in. */
export interface SolidInertia {
  readonly centroid: Vec3
  /** About each axis: X is `∫ (y² + z²)`. */
  readonly moments: Vec3
  /** −∫ xy, −∫ yz, −∫ zx: the inertia tensor's, as AutoCAD prints them (solid/m01). */
  readonly products: {
    readonly xy: number
    readonly yz: number
    readonly zx: number
  }
  readonly radii: Vec3
  /** About the centroid, in the order Jacobi's sweeps leave them (m04). */
  readonly principal: readonly PrincipalMoment<Vec3>[]
}

export function solidInertia(m: Moments): SolidInertia {
  const o = momentsAbout(m, ZERO)
  const s = o.second
  const moments = { x: s.yy + s.zz, y: s.xx + s.zz, z: s.xx + s.yy }
  const c = centroidOf(m)
  const about = momentsAbout(m, c).second
  const tensor = [
    [about.yy + about.zz, -about.xy, -about.zx],
    [-about.xy, about.xx + about.zz, -about.yz],
    [-about.zx, -about.yz, about.xx + about.yy],
  ]
  const { values, vectors } = jacobiEigen(tensor)
  return {
    centroid: add3(m.origin, scale3(m.first, 1 / m.measure)),
    moments,
    products: { xy: -s.xy, yz: -s.yz, zx: -s.zx },
    radii: {
      x: Math.sqrt(moments.x / m.measure),
      y: Math.sqrt(moments.y / m.measure),
      z: Math.sqrt(moments.z / m.measure),
    },
    principal: values.map((moment, k) => ({
      moment,
      direction: { x: vectors[0][k], y: vectors[1][k], z: vectors[2][k] },
    })),
  }
}

/** What MASSPROP reports of a region in the XY plane, about its axes' origin. */
export interface RegionInertia {
  readonly centroid: Vec2
  /** About each axis: X is `∫ y²`. */
  readonly moments: Vec2
  /** −∫ xy (region/b02, `XY: -32146.0184`). */
  readonly product: number
  readonly radii: Vec2
  readonly principal: readonly PrincipalMoment<Vec2>[]
}

export function regionInertia(m: Moments): RegionInertia {
  const s = momentsAbout(m, ZERO).second
  const moments = { x: s.yy, y: s.xx }
  const c = centroidOf(m)
  const about = momentsAbout(m, c).second
  const { values, vectors } = jacobiEigen([
    [about.yy, -about.xy],
    [-about.xy, about.xx],
  ])
  return {
    centroid: { x: c.x, y: c.y },
    moments,
    product: -s.xy,
    radii: {
      x: Math.sqrt(moments.x / m.measure),
      y: Math.sqrt(moments.y / m.measure),
    },
    principal: values.map((moment, k) => ({
      moment,
      direction: { x: vectors[0][k], y: vectors[1][k] },
    })),
  }
}

/** Its centroid, in the axes its points are in. */
export function centroidOf(m: Moments): Vec3 {
  return add3(m.origin, scale3(m.first, 1 / m.measure))
}

/** Sweeps the cyclic Jacobi method makes before giving up; a few converge it. */
const JACOBI_SWEEPS = 50

/**
 * Below this part of the trace an entry off the diagonal is the rounding of
 * the centroid's shift, not the body's: kept, it would turn a symmetric
 * body's equal moments by an angle of noise.
 */
const NOISE = 1e-12

/**
 * The eigenvalues and eigenvectors (columns) of a symmetric matrix by the
 * cyclic Jacobi method as Numerical Recipes writes it (`jacobi`): AutoCAD's
 * order and signs, which its principal directions follow (solid/m01's wedge,
 * m04's tilted UCS, m05's regions: each axis keeps the column of the one it
 * was turned from, `[c, 0, −s]`). Two equal moments leave any pair in their
 * plane principal; AutoCAD prints whichever its rounding gave (m01's pyramid,
 * `[0.9963 0.0860 0.0000]`), here the axes.
 */
export function jacobiEigen(matrix: readonly (readonly number[])[]): {
  values: number[]
  vectors: number[][]
} {
  const n = matrix.length
  const a = matrix.map((row) => [...row])
  const noise = NOISE * a.reduce((sum, row, i) => sum + Math.abs(row[i]), 0)
  const v = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  )
  const d = a.map((row, i) => row[i])
  const b = [...d]
  const z = d.map(() => 0)
  const rotate = (
    m: number[][],
    i: number,
    j: number,
    k: number,
    l: number,
    s: number,
    tau: number
  ) => {
    const g = m[i][j]
    const h = m[k][l]
    m[i][j] = g - s * (h + g * tau)
    m[k][l] = h + s * (g - h * tau)
  }
  for (let sweep = 1; sweep <= JACOBI_SWEEPS; sweep++) {
    let off = 0
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        // Noise is dropped as it appears, a rotation's leftovers too: a
        // degenerate pair keeps the axes its first rotation gave (m05's
        // boxes, `[0.7071 -0.7071 0.0000]`).
        if (Math.abs(a[p][q]) <= noise) a[p][q] = 0
        off += Math.abs(a[p][q])
      }
    }
    if (off === 0) break
    const threshold = sweep < 4 ? (0.2 * off) / (n * n) : 0
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const g = 100 * Math.abs(a[p][q])
        if (Math.abs(a[p][q]) <= noise) {
          a[p][q] = 0
        } else if (
          sweep > 4 &&
          Math.abs(d[p]) + g === Math.abs(d[p]) &&
          Math.abs(d[q]) + g === Math.abs(d[q])
        ) {
          a[p][q] = 0
        } else if (Math.abs(a[p][q]) > threshold) {
          let h = d[q] - d[p]
          let t: number
          if (Math.abs(h) + g === Math.abs(h)) {
            t = a[p][q] / h
          } else {
            const theta = (0.5 * h) / a[p][q]
            t = 1 / (Math.abs(theta) + Math.sqrt(1 + theta * theta))
            if (theta < 0) t = -t
          }
          const c = 1 / Math.sqrt(1 + t * t)
          const s = t * c
          const tau = s / (1 + c)
          h = t * a[p][q]
          z[p] -= h
          z[q] += h
          d[p] -= h
          d[q] += h
          a[p][q] = 0
          for (let j = 0; j < p; j++) rotate(a, j, p, j, q, s, tau)
          for (let j = p + 1; j < q; j++) rotate(a, p, j, j, q, s, tau)
          for (let j = q + 1; j < n; j++) rotate(a, p, j, q, j, s, tau)
          for (let j = 0; j < n; j++) rotate(v, j, p, j, q, s, tau)
        }
      }
    }
    for (let p = 0; p < n; p++) {
      b[p] += z[p]
      d[p] = b[p]
      z[p] = 0
    }
  }
  return { values: d, vectors: v }
}
