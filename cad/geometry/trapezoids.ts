import { Vec2 } from "./Vec2"

/**
 * The area inside closed rings, by the even-odd rule (a ring inside another
 * is a hole), cut into strips between each two heights a vertex stands at
 * or two edges cross at:
 * one four-cornered piece per span inside, its corners left and right at the
 * strip's bottom, then left and right at its top. A triangle repeats a corner.
 */
export function evenOddTrapezoids(
  rings: readonly (readonly Vec2[])[]
): [Vec2, Vec2, Vec2, Vec2][] {
  const edges: [Vec2, Vec2][] = []
  const heights: number[] = []
  for (const ring of rings) {
    ring.forEach((a, i) => {
      const b = ring[(i + 1) % ring.length]
      heights.push(a.y)
      if (a.y !== b.y) edges.push(a.y < b.y ? [a, b] : [b, a])
    })
  }
  const levels = [...new Set(heights)].sort((p, q) => p - q)
  const xAt = ([a, b]: [Vec2, Vec2], y: number) =>
    a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y)
  const pieces: [Vec2, Vec2, Vec2, Vec2][] = []
  // A strip whose edges keep their order from bottom to top; two that cross
  // inside it (overlapping rings, a ring crossing itself) cut it where they
  // cross. WHY only then: pairing every edge with every other is quadratic.
  const strip = (y0: number, y1: number, active: [Vec2, Vec2][]) => {
    const mid = (y0 + y1) / 2
    const sorted = [...active].sort((e, f) => xAt(e, mid) - xAt(f, mid))
    const tolerance = 1e-9 * Math.max(1, Math.abs(y1 - y0))
    const crosses = sorted.some(
      (e, k) =>
        k > 0 &&
        (xAt(sorted[k - 1], y0) > xAt(e, y0) + tolerance ||
          xAt(sorted[k - 1], y1) > xAt(e, y1) + tolerance)
    )
    if (crosses) {
      const cuts = new Set<number>()
      for (let k = 0; k < sorted.length; k++) {
        for (let m = k + 1; m < sorted.length; m++) {
          const d0 = xAt(sorted[k], y0) - xAt(sorted[m], y0)
          const d1 = xAt(sorted[k], y1) - xAt(sorted[m], y1)
          if (d0 * d1 >= 0) continue
          const y = y0 + ((y1 - y0) * d0) / (d0 - d1)
          if (y > y0 && y < y1) cuts.add(y)
        }
      }
      if (cuts.size > 0) {
        const at = [y0, ...[...cuts].sort((p, q) => p - q), y1]
        for (let k = 0; k + 1 < at.length; k++) strip(at[k], at[k + 1], active)
        return
      }
    }
    for (let k = 0; k + 1 < sorted.length; k += 2) {
      const left = sorted[k]
      const right = sorted[k + 1]
      pieces.push([
        { x: xAt(left, y0), y: y0 },
        { x: xAt(right, y0), y: y0 },
        { x: xAt(left, y1), y: y1 },
        { x: xAt(right, y1), y: y1 },
      ])
    }
  }
  for (let i = 0; i + 1 < levels.length; i++) {
    const y0 = levels[i]
    const y1 = levels[i + 1]
    strip(
      y0,
      y1,
      edges.filter(([a, b]) => a.y <= y0 && b.y >= y1)
    )
  }
  return pieces
}
