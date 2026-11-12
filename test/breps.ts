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
 * Euler–Poincaré: V − E + F − (L − F) = 2 (S − G), even and no more than
 * twice the shells, V counted as if the boundary were pulled apart into a
 * manifold: a vertex once per umbrella, the fan of faces round it joined
 * across its edges. Where solids touch, the kernel makes one vertex of two
 * (the slanted box's corner on the box's face, solidBooleans.test.ts), or of
 * two points within its tolerance (a box's face reaching a cylinder's rim,
 * seed 6079 of booleans of any solids), and a face's loop may run through it
 * twice: counted once, it read a sound solid as broken. An apex's point loop
 * is an umbrella of its own, its edge of no length none.
 */
export function eulerHolds(b: Brep): boolean {
  // The ends of edges at a vertex, joined where a loop turns from one to
  // the next: each set left is an umbrella.
  const parent = new Map<string, string>()
  const find = (k: string): string => {
    const p = parent.get(k) ?? k
    if (p === k) return k
    const root = find(p)
    parent.set(k, root)
    return root
  }
  let loops = 0
  for (const face of b.faces) {
    for (const loop of face.loops) {
      loops++
      loop.forEach((c, i) => {
        const next = loop[(i + 1) % loop.length]
        const arrive = `${c.edge}:${c.reversed ? "start" : "end"}`
        const leave = `${next.edge}:${next.reversed ? "end" : "start"}`
        parent.set(find(arrive), find(leave))
      })
    }
  }
  const umbrellas = new Set([...parent.keys()].map(find)).size
  const edges = b.edges.filter((e) => e.curve.kind !== "point").length
  const chi = umbrellas - edges + b.faces.length - (loops - b.faces.length)
  return chi % 2 === 0 && chi <= 2 * shellCount(b)
}
