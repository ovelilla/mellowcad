import type { Brep } from "../cad/geometry/solids"

/** How many shells the faces make: faces joined by the edges they share. */
export function shellCount(b: Brep): number {
  const parent = b.faces.map((_, i) => i)
  const find = (i: number): number =>
    parent[i] === i ? i : (parent[i] = find(parent[i]))
  const owner = new Map<number, number>()
  b.faces.forEach((f, i) => {
    for (const loop of f.loops) {
      for (const c of loop) {
        const j = owner.get(c.edge)
        if (j === undefined) owner.set(c.edge, i)
        else parent[find(i)] = find(j)
      }
    }
  })
  return new Set(b.faces.map((_, i) => find(i))).size
}

/**
 * Euler–Poincaré: V − E + F − (L − F) = 2 (S − G), an apex's edge of no
 * length counted with no edge: even, and no more than twice the shells.
 */
export function eulerHolds(b: Brep): boolean {
  const edges = b.edges.filter((e) => e.curve.kind !== "point").length
  const loops = b.faces.reduce((n, f) => n + f.loops.length, 0)
  const chi =
    b.vertices.length - edges + b.faces.length - (loops - b.faces.length)
  return chi % 2 === 0 && chi <= 2 * shellCount(b)
}
