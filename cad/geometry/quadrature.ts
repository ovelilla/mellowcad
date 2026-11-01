/**
 * Rules of quadrature the kernel integrates with: each exact for the
 * integrands it is used on, so nothing measured here approximates.
 */

/** A rule `∫ f ≈ Σ wᵢ f(tᵢ)`. */
export type Rule = readonly { readonly t: number; readonly w: number }[]

/** Gauss–Legendre's five nodes on [−1, 1]: exact for a polynomial up to degree 9. */
const LEGENDRE_5 = [
  [0, 128 / 225],
  [Math.sqrt(5 - 2 * Math.sqrt(10 / 7)) / 3, (322 + 13 * Math.sqrt(70)) / 900],
  [Math.sqrt(5 + 2 * Math.sqrt(10 / 7)) / 3, (322 - 13 * Math.sqrt(70)) / 900],
] as const

/** Gauss–Legendre on `[a, b]`, exact for the polynomials here (degree ≤ 9). */
export function polynomialRule(a: number, b: number): Rule {
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
export const TRIG_SAMPLES = 18

/**
 * The rule exact on `[a, b]` for a trigonometric polynomial of degree up to
 * {@link TRIG_SAMPLES}/2 − 1: its Fourier coefficients from the samples, each
 * harmonic integrated in closed form, gathered as weights on the samples. No
 * Gauss rule is exact for a sine, which a tube or an arc's end cuts anywhere.
 */
export function trigRule(a: number, b: number): Rule {
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

/**
 * The 16-point Gauss–Legendre rule on [−1, 1]: exact for a polynomial up to
 * degree 31, so for the area swept by a polynomial piece of any degree
 * SPLINE takes (2 × 10 − 1). Nodes by Newton on P₁₆ from Chebyshev's guesses.
 */
export const GAUSS = ((n: number) => {
  const nodes: number[] = []
  const weights: number[] = []
  for (let i = 0; i < n; i++) {
    let x = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let slope = 1
    for (let step = 0; step < 100; step++) {
      let p0 = 1
      let p1 = x
      for (let k = 2; k <= n; k++) {
        const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k
        p0 = p1
        p1 = p2
      }
      slope = (n * (x * p1 - p0)) / (x * x - 1)
      const next = x - p1 / slope
      const done = Math.abs(next - x) < 1e-16
      x = next
      if (done) break
    }
    nodes.push(x)
    weights.push(2 / ((1 - x * x) * slope * slope))
  }
  return { nodes, weights }
})(16)

/** {@link GAUSS} on `[a, b]` cut into `parts` equal pieces: for an integrand no rule is exact for (a root's), past the double's precision on a smooth one. */
export function gaussRule(a: number, b: number, parts = 1): Rule {
  const rule: { t: number; w: number }[] = []
  const step = (b - a) / parts
  for (let k = 0; k < parts; k++) {
    const half = step / 2
    const middle = a + step * k + half
    for (let i = 0; i < GAUSS.nodes.length; i++) {
      rule.push({
        t: middle + half * GAUSS.nodes[i],
        w: GAUSS.weights[i] * half,
      })
    }
  }
  return rule
}
