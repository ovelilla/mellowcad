import {
  Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "./Vec3"
import { edgeTrace } from "./brepCurves"
import { faceNormal } from "./brepQueries"
import { surfaceFrame } from "./faceDomains"
import { surfaceParams } from "./faceRegions"
import { loopArea } from "./planarRegions"
import { SolidBooleanError } from "./solidBooleans"
import { sizeTolerance } from "./solidEdits"
import {
  Brep,
  BrepCurve,
  BrepEdge,
  BrepFace,
  BrepSurface,
  Coedge,
  FaceDomain,
  brepAnchor,
  brepIsClosed,
  planarFace,
  unsigned0,
  unsignedDomain,
} from "./solids"

/**
 * FILLETEDGE's and CHAMFEREDGE's edits of a solid's edges, in the cases with
 * a closed form, as ACIS makes them (filletedge/f01–f06, chamferedge/c01–c06):
 * each edge taken gives way to a face of its own — a cylinder or a plane
 * along a straight edge between two planes, a torus or a cone round a
 * circle between a plane and a cylinder about it —, the faces either side
 * trimmed back to where it touches them, and its ends closed where they meet
 * a face across (an arc or a line in it), the next edge's face (the cross
 * section where a chain of tangent edges runs on, an ellipse where two
 * corners' fillets meet, f03) or, three fillets at a corner, a sphere (f06).
 * A face the edit wears down to nothing goes (f05: a radius as long as the
 * face is wide). Nothing here is a boolean: the topology is rebuilt round
 * the edges, so a face tangent to the next never needs a meeting found.
 */

/** A fillet of `radius`, or a chamfer `distance1` along the `base` face and `distance2` along the other. */
export type EdgeBlend =
  | { readonly kind: "fillet"; readonly radius: number }
  | {
      readonly kind: "chamfer"
      readonly base: number
      readonly distance1: number
      readonly distance2: number
    }

/** Where a face uses an edge: the face, the loop, the coedge's place in it. */
interface Use {
  readonly face: number
  readonly loop: number
  readonly index: number
}

/** The two faces of each edge, the one running it from start to end first. */
function edgeUses(brep: Brep): { along: Use | null; against: Use | null }[] {
  const uses = brep.edges.map(() => ({
    along: null as Use | null,
    against: null as Use | null,
  }))
  brep.faces.forEach((f, face) =>
    f.loops.forEach((l, loop) =>
      l.forEach((c, index) => {
        const u = uses[c.edge]
        if (c.reversed) u.against = { face, loop, index }
        else u.along = { face, loop, index }
      })
    )
  )
  return uses
}

/** An edge's axis when it is a circle: its centre and the normal it turns about. */
interface Round {
  readonly center: Vec3
  readonly normal: Vec3
}

/** Where a blend meets the faces either side in a cross-section, and the fillet's centre there. */
interface Cut {
  readonly at: Vec3
  readonly tangent: Vec3
  readonly onA: Vec3
  readonly onB: Vec3
  readonly center: Vec3
}

/** An edge taken, the face it becomes and how it meets its neighbours. */
interface Strip {
  readonly edge: number
  /** The face running the edge from its start to its end. */
  readonly a: number
  readonly b: number
  readonly round: Round | null
  readonly convex: boolean
  /** How far from the edge it touches A and B, across it. */
  readonly reachA: number
  readonly reachB: number
  cut(at: Vec3): Cut
}

const key = (p: number, q: number) => (p < q ? `${p}:${q}` : `${q}:${p}`)

/**
 * The solid with `edges` filleted or chamfered (FILLETEDGE, CHAMFEREDGE).
 * Throws `SolidBooleanError`: "unsupported" for an edge or a corner with no
 * closed form here (a curved face across an end, a spline, fillets of two
 * radii meeting), "failed" where the blend does not fit (a radius wider than
 * a face beside it, an edge whose faces are tangent).
 */
export function brepEdgesBlended(
  brep: Brep,
  edges: readonly number[],
  blend: EdgeBlend
): Brep {
  const size = blend.kind === "fillet" ? blend.radius : blend.distance1
  if (
    !(size > 0) ||
    (blend.kind === "chamfer" && !(blend.distance2 > 0)) ||
    edges.length === 0
  ) {
    throw new SolidBooleanError("failed")
  }
  const tolerance = sizeTolerance(brep)
  const uses = edgeUses(brep)
  const taken = [...new Set(edges)]
  const strips = taken.map((e) => stripOf(brep, uses, e, blend))
  const vertices: Vec3[] = [...brep.vertices]
  const work: BrepEdge[] = brep.edges.map((e) => ({ ...e }))
  const bridges = new Map<string, number>()
  // The vertex each strip ends at on each side, at its start and its end.
  const contact = new Map<string, number>()
  const contactKey = (s: number, side: "a" | "b", end: "start" | "end") =>
    `${s}:${side}:${end}`
  const addVertex = (p: Vec3) => vertices.push(p) - 1
  const addEdge = (start: number, end: number, curve: BrepCurve) =>
    work.push({ start, end, curve }) - 1
  const bridge = (p: number, q: number, curve: BrepCurve) => {
    bridges.set(key(p, q), addEdge(p, q, curve))
  }
  // Each edge left whose end moves: where it was going, so it cannot turn.
  const moved = new Map<number, Vec3>()
  const moveEnd = (edge: number, from: number, to: number) => {
    const e = work[edge]
    if (!moved.has(edge)) {
      moved.set(edge, sub3(vertices[e.end], vertices[e.start]))
    }
    work[edge] = {
      ...e,
      start: e.start === from ? to : e.start,
      end: e.end === from ? to : e.end,
    }
  }
  const spheres: { center: Vec3; corner: Vec3; arcs: number[] }[] = []

  const byVertex = new Map<number, { strip: number; end: "start" | "end" }[]>()
  strips.forEach((s, i) => {
    const e = brep.edges[s.edge]
    if (e.start === e.end) {
      // A whole circle: a ring between two circles, each from the seam.
      const cut = s.cut(brep.vertices[e.start])
      const qa = addVertex(cut.onA)
      const qb = addVertex(cut.onB)
      for (const end of ["start", "end"] as const) {
        contact.set(contactKey(i, "a", end), qa)
        contact.set(contactKey(i, "b", end), qb)
      }
      return
    }
    for (const end of ["start", "end"] as const) {
      const v = end === "start" ? e.start : e.end
      byVertex.set(v, [...(byVertex.get(v) ?? []), { strip: i, end }])
    }
  })

  for (const [v, ends] of byVertex) {
    const around = vertexStar(brep, v)
    if (!around) throw new SolidBooleanError("unsupported")
    const p = brep.vertices[v]
    if (ends.length === 1) {
      // One edge ends here: its faces cut back along the edges beside it,
      // an arc or a line across the face over the end.
      const { strip: i, end } = ends[0]
      const s = strips[i]
      const sideEdge = (face: number) =>
        around.edges.find(
          (x) => x !== s.edge && facesOf(uses, x).includes(face)
        )
      const ea = sideEdge(s.a)
      const eb = sideEdge(s.b)
      if (ea === undefined || eb === undefined) {
        throw new SolidBooleanError("unsupported")
      }
      const g = facesOf(uses, ea).find((f) => f !== s.a)
      if (g === undefined || !facesOf(uses, eb).includes(g)) {
        throw new SolidBooleanError("unsupported")
      }
      const across = brep.faces[g].surface
      if (across.kind !== "plane") throw new SolidBooleanError("unsupported")
      const cut = s.cut(p)
      let qa: Vec3
      let qb: Vec3
      let curve: (from: Vec3, to: Vec3) => BrepCurve
      if (s.round) {
        // A circle's end lies on a plane through its axis: the cross-section.
        const off = dot3(sub3(s.round.center, across.origin), across.normal)
        if (
          Math.abs(dot3(across.normal, s.round.normal)) > 1e-9 ||
          Math.abs(off) > tolerance ||
          Math.abs(dot3(sub3(p, across.origin), across.normal)) > tolerance
        ) {
          throw new SolidBooleanError("unsupported")
        }
        qa = cut.onA
        qb = cut.onB
        curve = (from, to) => sectionCurve(blend, cut, from, to)
      } else {
        const t = cut.tangent
        const n = across.normal
        const run = dot3(n, t)
        if (Math.abs(run) < 1e-9) throw new SolidBooleanError("unsupported")
        const level = dot3(across.origin, n)
        const onPlane = (q: Vec3) =>
          add3(q, scale3(t, (level - dot3(n, q)) / run))
        qa = onPlane(cut.onA)
        qb = onPlane(cut.onB)
        const axis = onPlane(cut.center)
        curve = (from, to) =>
          blend.kind === "chamfer"
            ? { kind: "line" }
            : planeCylinderArc(axis, t, n, blend.radius, from, to)
      }
      const va = addVertex(onEdge(vertices, work[ea], v, qa, tolerance))
      const vb = addVertex(onEdge(vertices, work[eb], v, qb, tolerance))
      moveEnd(ea, v, va)
      moveEnd(eb, v, vb)
      contact.set(contactKey(i, "a", end), va)
      contact.set(contactKey(i, "b", end), vb)
      bridge(va, vb, curve(vertices[va], vertices[vb]))
      continue
    }
    if (ends.length === 2) {
      const [one, two] = ends.map((x) => ({ ...x, s: strips[x.strip] }))
      const shared = [one.s.a, one.s.b].filter((f) =>
        [two.s.a, two.s.b].includes(f)
      )
      if (shared.length !== 1) throw new SolidBooleanError("unsupported")
      const f = shared[0]
      const g1 = one.s.a === f ? one.s.b : one.s.a
      const g2 = two.s.a === f ? two.s.b : two.s.a
      const seam = around.edges.find(
        (x) => x !== one.s.edge && x !== two.s.edge
      )
      if (seam === undefined) throw new SolidBooleanError("unsupported")
      const seamFaces = facesOf(uses, seam)
      if (!seamFaces.includes(g1) || !seamFaces.includes(g2)) {
        throw new SolidBooleanError("unsupported")
      }
      const c1 = one.s.cut(p)
      const c2 = two.s.cut(p)
      const onF = (s: Strip, c: Cut) => (s.a === f ? c.onA : c.onB)
      const onG = (s: Strip, c: Cut) => (s.a === f ? c.onB : c.onA)
      const near = (x: Vec3, y: Vec3) => length3(sub3(x, y)) <= tolerance * 10
      let qf: Vec3
      let qs: Vec3
      let curve: BrepCurve
      const tangent =
        length3(cross3(c1.tangent, c2.tangent)) <= 1e-9 &&
        length3(
          cross3(
            faceNormal(brep, brep.faces[g1], p),
            faceNormal(brep, brep.faces[g2], p)
          )
        ) <= 1e-9
      if (tangent) {
        // A chain runs on: both cross-sections are one.
        if (!near(onF(one.s, c1), onF(two.s, c2))) {
          throw new SolidBooleanError("unsupported")
        }
        if (!near(onG(one.s, c1), onG(two.s, c2))) {
          throw new SolidBooleanError("unsupported")
        }
        qf = onF(one.s, c1)
        qs = onG(one.s, c1)
        curve = sectionCurve(blend, c1, qs, qf)
      } else {
        // Two corners meet (f03, c01): along each face's contact line to
        // where they cross, and down the edge between the others.
        if (one.s.round || two.s.round || !one.s.convex || !two.s.convex) {
          throw new SolidBooleanError("unsupported")
        }
        const plane = brep.faces[f].surface
        if (plane.kind !== "plane") throw new SolidBooleanError("unsupported")
        const met = linesMeet(
          onF(one.s, c1),
          c1.tangent,
          onF(two.s, c2),
          c2.tangent
        )
        const along = work[seam]
        const w = along.start === v ? along.end : along.start
        const sDir = sub3(brep.vertices[w], p)
        const down1 = linesMeet(onG(one.s, c1), c1.tangent, p, sDir)
        const down2 = linesMeet(onG(two.s, c2), c2.tangent, p, sDir)
        if (!met || !down1 || !down2 || !near(down1, down2)) {
          throw new SolidBooleanError("unsupported")
        }
        qf = met
        qs = down1
        if (blend.kind === "chamfer") {
          curve = { kind: "line" }
        } else {
          const x = linesMeet(c1.center, c1.tangent, c2.center, c2.tangent)
          if (!x) throw new SolidBooleanError("unsupported")
          curve = miterArc(x, c1.tangent, c2.tangent, blend.radius, qs, qf)
        }
      }
      const vf = addVertex(qf)
      const vs = addVertex(onEdge(vertices, work[seam], v, qs, tolerance))
      moveEnd(seam, v, vs)
      for (const x of [one, two]) {
        contact.set(contactKey(x.strip, x.s.a === f ? "a" : "b", x.end), vf)
        contact.set(contactKey(x.strip, x.s.a === f ? "b" : "a", x.end), vs)
      }
      bridge(vs, vf, curve)
      continue
    }
    // Three fillets at a corner of three planes: a sphere through the
    // corner's ball (f06).
    if (blend.kind !== "fillet" || ends.length !== 3) {
      throw new SolidBooleanError("unsupported")
    }
    const faces = around.faces
    const planes = faces.map((fi) => brep.faces[fi].surface)
    if (
      planes.some((s) => s.kind !== "plane") ||
      ends.some((x) => strips[x.strip].round || !strips[x.strip].convex)
    ) {
      throw new SolidBooleanError("unsupported")
    }
    const r = blend.radius
    const center = planesMeet(
      planes.map((s) => {
        const n = (s as Extract<BrepSurface, { kind: "plane" }>).normal
        const o = (s as Extract<BrepSurface, { kind: "plane" }>).origin
        return { normal: n, level: dot3(o, n) - r }
      })
    )
    if (!center) throw new SolidBooleanError("unsupported")
    const touch = new Map<number, number>()
    faces.forEach((fi, k) => {
      const n = (planes[k] as Extract<BrepSurface, { kind: "plane" }>).normal
      touch.set(fi, addVertex(add3(center, scale3(n, r))))
    })
    for (const { strip: i, end } of ends) {
      const s = strips[i]
      const va = touch.get(s.a)
      const vb = touch.get(s.b)
      if (va === undefined || vb === undefined) {
        throw new SolidBooleanError("unsupported")
      }
      // The ball's centre lies on each fillet's axis.
      const c = s.cut(p)
      if (length3(cross3(sub3(center, c.center), c.tangent)) > tolerance * 10) {
        throw new SolidBooleanError("unsupported")
      }
      contact.set(contactKey(i, "a", end), va)
      contact.set(contactKey(i, "b", end), vb)
      bridge(
        va,
        vb,
        circleArc(center, vertices[va], vertices[vb], c.tangent, r)
      )
    }
    spheres.push({
      center,
      corner: p,
      arcs: ends.map((x) => {
        const s = strips[x.strip]
        return bridges.get(key(touch.get(s.a)!, touch.get(s.b)!))!
      }),
    })
  }

  // Each strip's contact edges: along its faces, as the edge ran.
  const contactEdges = strips.map((s, i) => {
    const e = brep.edges[s.edge]
    const make = (side: "a" | "b") => {
      const from = contact.get(contactKey(i, side, "start"))!
      const to = contact.get(contactKey(i, side, "end"))!
      if (!s.round) {
        const run = dot3(
          sub3(vertices[to], vertices[from]),
          sub3(brep.vertices[e.end], brep.vertices[e.start])
        )
        if (!(run > tolerance)) throw new SolidBooleanError("failed")
        return addEdge(from, to, { kind: "line" })
      }
      const p = vertices[from]
      const h = dot3(sub3(p, s.round.center), s.round.normal)
      const center = add3(s.round.center, scale3(s.round.normal, h))
      const radius = length3(sub3(p, center))
      if (!(radius > tolerance)) throw new SolidBooleanError("failed")
      return addEdge(from, to, {
        kind: "circle",
        center,
        normal: s.round.normal,
        radius,
      })
    }
    return { a: make("a"), b: make("b") }
  })

  const replaced = new Map<number, { a: number; b: number }>()
  strips.forEach((s, i) => replaced.set(s.edge, contactEdges[i]))
  const startOf = (c: Coedge) =>
    c.reversed ? work[c.edge].end : work[c.edge].start
  const endOf = (c: Coedge) =>
    c.reversed ? work[c.edge].start : work[c.edge].end
  const bridged = (loop: readonly Coedge[]): Coedge[] => {
    const out: Coedge[] = []
    loop.forEach((c, i) => {
      out.push(c)
      const next = loop[(i + 1) % loop.length]
      const from = endOf(c)
      const to = startOf(next)
      if (from === to) return
      const b = bridges.get(key(from, to))
      if (b === undefined) throw new SolidBooleanError("unsupported")
      out.push({ edge: b, reversed: work[b].start !== from })
    })
    return out
  }

  const stripFaces: BrepFace[] = strips.map((s, i) => {
    const { a, b } = contactEdges[i]
    const closed = brep.edges[s.edge].start === brep.edges[s.edge].end
    const loops = closed
      ? [[{ edge: a, reversed: true }], [{ edge: b, reversed: false }]]
      : [
          bridged([
            { edge: a, reversed: true },
            { edge: b, reversed: false },
          ]),
        ]
    return stripFace(brep, s, blend, vertices, work, loops)
  })

  // Each arc as the strips do not run it.
  const runs = new Map<number, boolean>()
  for (const face of stripFaces) {
    for (const c of face.loops[0] ?? []) runs.set(c.edge, c.reversed)
  }
  const sphereFaces: BrepFace[] = spheres.map((corner) =>
    sphereFace(
      corner.center,
      corner.corner,
      (blend as Extract<EdgeBlend, { kind: "fillet" }>).radius,
      chained(
        corner.arcs.map((edge) => ({ edge, reversed: !runs.get(edge) })),
        work
      ),
      vertices,
      work
    )
  )

  const kept: BrepFace[] = brep.faces.map((f, fi) => ({
    ...f,
    loops: f.loops.map((l) =>
      bridged(
        l.map((c) => {
          const r = replaced.get(c.edge)
          if (!r) return c
          const s = strips.find((x) => x.edge === c.edge)!
          return { edge: s.a === fi ? r.a : r.b, reversed: c.reversed }
        })
      )
    ),
  }))

  for (const [edge, was] of moved) {
    const e = work[edge]
    if (e.curve.kind !== "line") continue
    if (dot3(sub3(vertices[e.end], vertices[e.start]), was) < -tolerance) {
      throw new SolidBooleanError("failed")
    }
  }

  let result: Brep = {
    vertices,
    edges: work,
    faces: [...stripFaces, ...sphereFaces, ...kept],
  }
  result = collapsed(result, tolerance)
  result = compacted(result)
  if (!brepIsClosed(result)) throw new SolidBooleanError("failed")
  keepsItsFaces(brep, result, tolerance)
  return result
}

/** The faces of an edge: the one running it along, then against. */
function facesOf(uses: ReturnType<typeof edgeUses>, edge: number): number[] {
  const u = uses[edge]
  return [u.along?.face, u.against?.face].filter(
    (f): f is number => f !== undefined
  )
}

/** The edges and faces at a vertex, when three of each meet there. */
function vertexStar(
  brep: Brep,
  v: number
): { edges: number[]; faces: number[] } | null {
  const edges: number[] = []
  brep.edges.forEach((e, i) => {
    if (e.curve.kind === "point") return
    if (e.start === v || e.end === v) edges.push(i)
  })
  const faces = new Set<number>()
  brep.faces.forEach((f, fi) => {
    for (const l of f.loops) {
      for (const c of l) {
        const e = brep.edges[c.edge]
        if (e.start === v || e.end === v) faces.add(fi)
      }
    }
  })
  if (edges.length !== 3 || faces.size !== 3) return null
  return { edges, faces: [...faces] }
}

/**
 * How an edge is blended: its faces, whether its corner is convex, how far
 * across each face the blend reaches. A straight edge between two planes,
 * or a circle between a plane and a cylinder about its axis.
 */
function stripOf(
  brep: Brep,
  uses: ReturnType<typeof edgeUses>,
  edge: number,
  blend: EdgeBlend
): Strip {
  const e = brep.edges[edge]
  const u = uses[edge]
  if (!e || !u?.along || !u.against || u.along.face === u.against.face) {
    throw new SolidBooleanError("unsupported")
  }
  const a = u.along.face
  const b = u.against.face
  const fa = brep.faces[a]
  const fb = brep.faces[b]
  let round: Round | null = null
  let tangentAt: (p: Vec3) => Vec3
  if (e.curve.kind === "line") {
    if (fa.surface.kind !== "plane" || fb.surface.kind !== "plane") {
      throw new SolidBooleanError("unsupported")
    }
    const t = normalize3(sub3(brep.vertices[e.end], brep.vertices[e.start]))
    if (!t) throw new SolidBooleanError("failed")
    tangentAt = () => t
  } else if (e.curve.kind === "circle") {
    const c = e.curve
    const kinds = [fa.surface.kind, fb.surface.kind].sort().join()
    if (kinds !== "cylinder,plane") throw new SolidBooleanError("unsupported")
    const plane = (fa.surface.kind === "plane" ? fa : fb).surface as Extract<
      BrepSurface,
      { kind: "plane" }
    >
    const cyl = (fa.surface.kind === "cylinder" ? fa : fb).surface as Extract<
      BrepSurface,
      { kind: "cylinder" }
    >
    const off = sub3(c.center, cyl.origin)
    if (
      length3(cross3(plane.normal, c.normal)) > 1e-9 ||
      length3(cross3(cyl.axis, c.normal)) > 1e-9 ||
      length3(cross3(off, cyl.axis)) > MODEL_SLACK * Math.max(1, cyl.radius) ||
      Math.abs(cyl.ratio - 1) > 1e-12 ||
      Math.abs(cyl.radius - c.radius) > MODEL_SLACK * Math.max(1, c.radius)
    ) {
      throw new SolidBooleanError("unsupported")
    }
    round = { center: c.center, normal: c.normal }
    tangentAt = (p) =>
      normalize3(cross3(c.normal, sub3(p, c.center))) ?? c.normal
  } else {
    throw new SolidBooleanError("unsupported")
  }
  const directions = (p: Vec3) => {
    const t = tangentAt(p)
    const na = faceNormal(brep, fa, p)
    const nb = faceNormal(brep, fb, p)
    return {
      t,
      na,
      nb,
      da: normalize3(cross3(na, t))!,
      db: normalize3(cross3(nb, scale3(t, -1)))!,
    }
  }
  const p0 = brep.vertices[e.start]
  const d0 = directions(p0)
  const bend = dot3(d0.da, d0.nb)
  // Faces tangent across the edge: nothing to round.
  if (Math.abs(bend) <= 1e-9) throw new SolidBooleanError("failed")
  const convex = bend < 0
  const theta = Math.acos(Math.max(-1, Math.min(1, dot3(d0.da, d0.db))))
  let reachA: number
  let reachB: number
  let offset = 0
  if (blend.kind === "fillet") {
    reachA = reachB = blend.radius / Math.tan(theta / 2)
    offset = blend.radius / Math.sin(theta / 2)
  } else if (blend.base === a) {
    reachA = blend.distance1
    reachB = blend.distance2
  } else if (blend.base === b) {
    reachA = blend.distance2
    reachB = blend.distance1
  } else {
    throw new SolidBooleanError("unsupported")
  }
  return {
    edge,
    a,
    b,
    round,
    convex,
    reachA,
    reachB,
    cut(at) {
      const d = directions(at)
      const mid = normalize3(add3(d.da, d.db)) ?? d.da
      return {
        at,
        tangent: d.t,
        onA: add3(at, scale3(d.da, reachA)),
        onB: add3(at, scale3(d.db, reachB)),
        center: add3(at, scale3(mid, offset)),
      }
    },
  }
}

/** How far a stored point may stray from a curve or a surface it lies on, as the kernel stores them. */
const MODEL_SLACK = 1e-6

/**
 * Where `q` lies on an edge from the vertex `v`: the edge's far vertex
 * itself where it falls there (the face beside worn away, f05), else `q`.
 * Throws "failed" past the edge's far end or off its line.
 */
function onEdge(
  vertices: readonly Vec3[],
  e: BrepEdge,
  v: number,
  q: Vec3,
  tolerance: number
): Vec3 {
  if (e.curve.kind !== "line") throw new SolidBooleanError("unsupported")
  const far = e.start === v ? e.end : e.start
  const p = vertices[v]
  const w = vertices[far]
  const d = sub3(w, p)
  const len = length3(d)
  const along = dot3(sub3(q, p), d) / (len * len)
  if (length3(cross3(sub3(q, p), d)) / len > tolerance * 10) {
    throw new SolidBooleanError("unsupported")
  }
  if (along * len <= tolerance) throw new SolidBooleanError("failed")
  if ((along - 1) * len > tolerance) throw new SolidBooleanError("failed")
  return Math.abs(along - 1) * len <= tolerance ? w : q
}

/** Where two lines meet, or the point between them where they pass nearest; null when parallel. */
function linesMeet(p: Vec3, d: Vec3, q: Vec3, e: Vec3): Vec3 | null {
  const n = cross3(d, e)
  const nn = dot3(n, n)
  if (nn < 1e-18 * dot3(d, d) * dot3(e, e)) return null
  const w = sub3(q, p)
  const s = dot3(cross3(w, e), n) / nn
  const t = dot3(cross3(w, d), n) / nn
  const x = add3(p, scale3(d, s))
  const y = add3(q, scale3(e, t))
  return scale3(add3(x, y), 0.5)
}

/** The point on three planes `normal · x = level`, or null where they do not meet in one. */
function planesMeet(
  planes: readonly { normal: Vec3; level: number }[]
): Vec3 | null {
  const [p, q, r] = planes
  const det = dot3(cross3(p.normal, q.normal), r.normal)
  if (Math.abs(det) < 1e-9) return null
  const x = add3(
    add3(
      scale3(cross3(q.normal, r.normal), p.level),
      scale3(cross3(r.normal, p.normal), q.level)
    ),
    scale3(cross3(p.normal, q.normal), r.level)
  )
  return scale3(x, 1 / det)
}

/** The arc of the circle round `center` in the plane square to `normal` from `from` to `to`, the short way. */
function circleArc(
  center: Vec3,
  from: Vec3,
  to: Vec3,
  normal: Vec3,
  radius: number
): BrepCurve {
  const n = normalize3(cross3(sub3(from, center), sub3(to, center)))
  const unit = normalize3(normal)!
  return {
    kind: "circle",
    center: unsigned0(center),
    normal: unsigned0(n ?? unit),
    radius,
  }
}

/** The arc of an ellipse from `from` to `to`, the short way about its plane's normal. */
function ellipseArc(
  center: Vec3,
  majorAxis: Vec3,
  ratio: number,
  normal: Vec3,
  from: Vec3,
  to: Vec3
): BrepCurve {
  if (ratio > 1 - 1e-12) {
    return circleArc(center, from, to, normal, length3(majorAxis))
  }
  const x = normalize3(majorAxis)!
  const angle = (p: Vec3, n: Vec3) => {
    const y = cross3(n, x)
    const d = sub3(p, center)
    return Math.atan2(dot3(d, y) / ratio, dot3(d, x))
  }
  const sweep = (n: Vec3) => {
    const s = angle(to, n) - angle(from, n)
    return ((s % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  }
  const n = sweep(normal) <= Math.PI ? normal : scale3(normal, -1)
  return {
    kind: "ellipse",
    center: unsigned0(center),
    normal: unsigned0(n),
    majorAxis: unsigned0(majorAxis),
    ratio,
  }
}

/** Where a fillet's cylinder (axis through `axis` along `t`) meets a plane across it, from `from` to `to`. */
function planeCylinderArc(
  axis: Vec3,
  t: Vec3,
  n: Vec3,
  radius: number,
  from: Vec3,
  to: Vec3
): BrepCurve {
  const run = Math.abs(dot3(n, t))
  const minor = normalize3(cross3(t, n))
  if (run > 1 - 1e-12 || !minor) return circleArc(axis, from, to, n, radius)
  const major = normalize3(cross3(n, minor))!
  return ellipseArc(axis, scale3(major, radius / run), run, n, from, to)
}

/**
 * The cross-section where a blend ends square to its edge or runs on into
 * the next: the fillet's arc round its centre there, or the chamfer's line.
 */
function sectionCurve(
  blend: EdgeBlend,
  cut: Cut,
  from: Vec3,
  to: Vec3
): BrepCurve {
  if (blend.kind === "chamfer") return { kind: "line" }
  return circleArc(cut.center, from, to, cut.tangent, blend.radius)
}

/**
 * Where two fillets of one radius meet at a corner (f03): their cylinders,
 * whose axes cross at `x`, meet in an ellipse in the plane through `x`
 * halfway between the axes that holds the edge between the other faces.
 */
function miterArc(
  x: Vec3,
  t1: Vec3,
  t2: Vec3,
  radius: number,
  from: Vec3,
  to: Vec3
): BrepCurve {
  const planes = [sub3(t1, t2), add3(t1, t2)]
    .map((m) => normalize3(m))
    .filter((m): m is Vec3 => m !== null)
  const m = planes.reduce((best, q) =>
    Math.abs(dot3(q, sub3(from, x))) < Math.abs(dot3(best, sub3(from, x)))
      ? q
      : best
  )
  const run = Math.abs(dot3(m, t1))
  if (run < 1e-9) throw new SolidBooleanError("unsupported")
  const major = normalize3(sub3(t1, scale3(m, dot3(t1, m))))!
  return ellipseArc(x, scale3(major, radius / run), run, m, from, to)
}

/** Coedges put end to start. */
function chained(
  loop: readonly Coedge[],
  edges: readonly BrepEdge[]
): Coedge[] {
  if (loop.length === 0) return []
  const start = (c: Coedge) =>
    c.reversed ? edges[c.edge].end : edges[c.edge].start
  const end = (c: Coedge) =>
    c.reversed ? edges[c.edge].start : edges[c.edge].end
  const out = [loop[0]]
  const left = loop.slice(1)
  while (left.length > 0) {
    const at = end(out[out.length - 1])
    const i = left.findIndex((c) => start(c) === at)
    if (i < 0) throw new SolidBooleanError("failed")
    out.push(left.splice(i, 1)[0])
  }
  return out
}

/**
 * A strip's face: its surface where the blend lies, and the domain it spans
 * there, run so its outside faces out of the solid — towards the edge it
 * replaced on a convex corner, away from it on a concave one.
 */
function stripFace(
  brep: Brep,
  s: Strip,
  blend: EdgeBlend,
  vertices: readonly Vec3[],
  edges: readonly BrepEdge[],
  loops: Coedge[][]
): BrepFace {
  const e = brep.edges[s.edge]
  const trace = edgeTrace(brep, e)
  const mid = trace.point((trace.t0 + trace.t1) / 2)
  const cut = s.cut(mid)
  const outwards = (n: Vec3, at: Vec3) =>
    dot3(n, sub3(cut.at, at)) * (s.convex ? 1 : -1) > 0
  const p0 = brep.vertices[e.start]
  const c0 = s.cut(p0)
  if (blend.kind === "chamfer" && !s.round) {
    const n = normalize3(cross3(c0.tangent, sub3(c0.onB, c0.onA)))!
    const at = scale3(add3(cut.onA, cut.onB), 0.5)
    return {
      surface: {
        kind: "plane",
        origin: unsigned0(c0.onA),
        normal: unsigned0(outwards(n, at) ? n : scale3(n, -1)),
      },
      loops,
    }
  }
  let surface: BrepSurface
  if (!s.round) {
    surface = {
      kind: "cylinder",
      origin: unsigned0(c0.center),
      axis: unsigned0(c0.tangent),
      xAxis: unsigned0(normalize3(sub3(p0, c0.center))!),
      radius: (blend as Extract<EdgeBlend, { kind: "fillet" }>).radius,
      ratio: 1,
    }
  } else {
    const { center, normal } = s.round
    const level = (p: Vec3) => dot3(sub3(p, center), normal)
    const out = (p: Vec3) => sub3(sub3(p, center), scale3(normal, level(p)))
    const xAxis = normalize3(out(p0))!
    if (blend.kind === "fillet") {
      const h = level(c0.center)
      const major = length3(out(c0.center))
      if (!(major > MODEL_SLACK)) throw new SolidBooleanError("failed")
      surface = {
        kind: "torus",
        center: unsigned0(add3(center, scale3(normal, h))),
        axis: unsigned0(normal),
        xAxis: unsigned0(xAxis),
        majorRadius: major,
        minorRadius: blend.radius,
      }
    } else {
      const ra = length3(out(c0.onA))
      const rb = length3(out(c0.onB))
      const ha = level(c0.onA)
      const hb = level(c0.onB)
      if (
        Math.abs(ha - hb) <= MODEL_SLACK ||
        Math.abs(ra - rb) <= MODEL_SLACK
      ) {
        throw new SolidBooleanError("unsupported")
      }
      const h0 = ha - (ra * (hb - ha)) / (rb - ra)
      const wide = ra > rb ? ha : hb
      const axis = scale3(normal, wide > h0 ? 1 : -1)
      surface = {
        kind: "cone",
        apex: unsigned0(add3(center, scale3(normal, h0))),
        axis: unsigned0(axis),
        xAxis: unsigned0(xAxis),
        slope: Math.abs((rb - ra) / (hb - ha)),
        ratio: 1,
      }
    }
  }
  const domain = spanned(surface, s, brep, loops, vertices, edges)
  // Run so the outside is where the face faces out.
  const um = (domain.u[0] + domain.u[1]) / 2
  const vm = (domain.v[0] + domain.v[1]) / 2
  const { p, du, dv } = surfaceFrame(surface, um, vm)
  const n = cross3(du, dv)
  const sense =
    Math.sign(domain.u[1] - domain.u[0]) * Math.sign(domain.v[1] - domain.v[0])
  const outside = outwardsAt(s, brep, p, scale3(n, sense))
  return {
    surface,
    loops,
    domain: unsignedDomain(
      outside ? domain : { u: [domain.u[1], domain.u[0]], v: domain.v }
    ),
  }
}

/** Whether `n` at `p` of a strip's face points out of the solid, judged in the cross-section through `p`. */
function outwardsAt(s: Strip, brep: Brep, p: Vec3, n: Vec3): boolean {
  const e = brep.edges[s.edge]
  let at: Vec3
  if (s.round) {
    const { center, normal } = s.round
    const d = sub3(p, center)
    const radial = normalize3(sub3(d, scale3(normal, dot3(d, normal))))!
    const r = length3(sub3(brep.vertices[e.start], center))
    at = add3(center, scale3(radial, r))
  } else {
    const p0 = brep.vertices[e.start]
    const t = normalize3(sub3(brep.vertices[e.end], p0))!
    at = add3(p0, scale3(t, dot3(sub3(p, p0), t)))
  }
  return dot3(n, sub3(at, p)) * (s.convex ? 1 : -1) > 0
}

/** The parameters a strip's face spans on its surface, sampled along its loops. */
function spanned(
  surface: Exclude<BrepSurface, { kind: "plane" }>,
  s: Strip,
  brep: Brep,
  loops: readonly Coedge[][],
  vertices: readonly Vec3[],
  edges: readonly BrepEdge[]
): FaceDomain {
  const e = brep.edges[s.edge]
  const shape: Brep = { vertices, edges, faces: [] }
  const points: Vec3[] = []
  for (const loop of loops) {
    for (const c of loop) {
      const trace = edgeTrace(shape, edges[c.edge])
      for (let k = 0; k <= 16; k++) {
        points.push(trace.point(trace.t0 + ((trace.t1 - trace.t0) * k) / 16))
      }
    }
  }
  const p0 = brep.vertices[e.start]
  let near = surfaceParams(surface, s.cut(p0).onA)
  const us: number[] = []
  const vs: number[] = []
  for (const p of points) {
    const uv = surfaceParams(surface, p, near)
    us.push(uv.u)
    vs.push(uv.v)
    near = uv
  }
  let u: [number, number] = [Math.min(...us), Math.max(...us)]
  if (s.round) {
    // Round its axis as the edge runs, a whole turn for a whole circle.
    const trace = edgeTrace(brep, e)
    const sweep = e.start === e.end ? 2 * Math.PI : trace.t1 - trace.t0
    const turn = dot3(
      surface.kind === "cone" || surface.kind === "torus"
        ? surface.axis
        : s.round.normal,
      s.round.normal
    )
    u = turn > 0 ? [0, sweep] : [-sweep, 0]
  }
  return { u, v: [Math.min(...vs), Math.max(...vs)] }
}

/** The sphere where three fillets meet at a corner, its X towards the corner, outwards. */
function sphereFace(
  center: Vec3,
  corner: Vec3,
  radius: number,
  loop: Coedge[],
  vertices: readonly Vec3[],
  edges: readonly BrepEdge[]
): BrepFace {
  const xAxis = normalize3(sub3(corner, center))!
  const helper =
    Math.abs(xAxis.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
  const axis = normalize3(cross3(xAxis, helper))!
  const surface: BrepSurface = {
    kind: "sphere",
    center: unsigned0(center),
    axis: unsigned0(axis),
    xAxis: unsigned0(xAxis),
    radius,
  }
  const shape: Brep = { vertices, edges, faces: [] }
  const us: number[] = []
  const vs: number[] = []
  for (const c of loop) {
    const trace = edgeTrace(shape, edges[c.edge])
    for (let k = 0; k <= 16; k++) {
      const uv = surfaceParams(
        surface,
        trace.point(trace.t0 + ((trace.t1 - trace.t0) * k) / 16),
        { u: 0, v: 0 }
      )
      us.push(uv.u)
      vs.push(uv.v)
    }
  }
  return {
    surface,
    loops: [loop],
    domain: unsignedDomain({
      u: [Math.min(...us), Math.max(...us)],
      v: [Math.min(...vs), Math.max(...vs)],
    }),
  }
}

/**
 * The B-rep with every edge worn down to nothing merged away, and a face
 * left between two edges along one line (f05: the side a fillet as wide as
 * it takes) dropped, its edges made one.
 */
function collapsed(brep: Brep, tolerance: number): Brep {
  const vertices = [...brep.vertices]
  let edges: BrepEdge[] = brep.edges.map((e) => ({ ...e }))
  let faces: BrepFace[] = brep.faces.map((f) => ({ ...f }))
  const gone = new Set<number>()
  const merge = (from: number, to: number) => {
    edges = edges.map((e) => ({
      ...e,
      start: e.start === from ? to : e.start,
      end: e.end === from ? to : e.end,
    }))
  }
  edges.forEach((e, i) => {
    if (e.curve.kind !== "line" || e.start === e.end) return
    const now = edges[i]
    if (length3(sub3(vertices[now.end], vertices[now.start])) <= tolerance) {
      gone.add(i)
      merge(now.end, now.start)
    }
  })
  if (gone.size === 0) return brep
  faces = faces.map((f) => ({
    ...f,
    loops: f.loops.map((l) => l.filter((c) => !gone.has(c.edge))),
  }))
  // A face of two coedges along the same line is no face.
  const swap = new Map<number, { edge: number; flip: boolean }>()
  faces = faces.filter((f) => {
    if (f.loops.length !== 1 || f.loops[0].length !== 2) return true
    const [c, d] = f.loops[0]
    const x = edges[c.edge]
    const y = edges[d.edge]
    if (x.curve.kind !== "line" || y.curve.kind !== "line") return true
    const same =
      (x.start === y.start && x.end === y.end) ||
      (x.start === y.end && x.end === y.start)
    if (!same) return true
    // The other face of `d` takes `c`'s edge, run the way `d` was.
    swap.set(d.edge, { edge: c.edge, flip: x.start !== y.start })
    gone.add(d.edge)
    return false
  })
  faces = faces.map((f) => ({
    ...f,
    loops: f.loops.map((l) =>
      l.map((c) => {
        const s = swap.get(c.edge)
        return s ? { edge: s.edge, reversed: c.reversed !== s.flip } : c
      })
    ),
  }))
  void tolerance
  return { vertices, edges, faces }
}

/** The B-rep with only the vertices and edges its faces use, renumbered. */
function compacted(brep: Brep): Brep {
  const usedEdges = new Set<number>()
  for (const f of brep.faces) {
    for (const l of f.loops) for (const c of l) usedEdges.add(c.edge)
  }
  const edgeIndex = new Map<number, number>()
  const edges: BrepEdge[] = []
  const vertexIndex = new Map<number, number>()
  const vertices: Vec3[] = []
  const vertex = (v: number) => {
    let i = vertexIndex.get(v)
    if (i === undefined) {
      i = vertices.push(unsigned0(brep.vertices[v])) - 1
      vertexIndex.set(v, i)
    }
    return i
  }
  brep.edges.forEach((e, i) => {
    if (!usedEdges.has(i)) return
    edgeIndex.set(i, edges.length)
    edges.push({ ...e, start: vertex(e.start), end: vertex(e.end) })
  })
  return {
    vertices,
    edges,
    faces: brep.faces.map((f) => ({
      ...f,
      loops: f.loops.map((l) =>
        l.map((c) => ({ edge: edgeIndex.get(c.edge)!, reversed: c.reversed }))
      ),
    })),
  }
}

/**
 * Every planar face of the solid still turns its loops as it did, none
 * shrunk to nothing or turned over: what a blend too wide for a face does.
 */
function keepsItsFaces(before: Brep, after: Brep, tolerance: number): void {
  const about = brepAnchor(before)
  for (const face of after.faces) {
    if (face.surface.kind !== "plane") continue
    for (const loop of planarFace(after, face, about).face.loops) {
      if (Math.abs(loopArea(loop)) <= tolerance * tolerance) {
        throw new SolidBooleanError("failed")
      }
    }
  }
}

/** The faces either side of an edge, the one running it from start to end first. */
export function edgeFaces(brep: Brep, edge: number): number[] {
  return facesOf(edgeUses(brep), edge)
}

/**
 * The edges tangent to one another through `edge` (FILLETEDGE's Chain,
 * f02: the eight round a rounded block's top), in order along them: at each
 * end, the edge there that runs on along it.
 */
export function tangentChain(brep: Brep, edge: number): number[] {
  const tangentAt = (e: number, v: number) => {
    const ed = brep.edges[e]
    const t = edgeTrace(brep, ed)
    const d = t.derivative(ed.start === v ? t.t0 : t.t1)
    return normalize3(d)
  }
  const chain = [edge]
  const seen = new Set(chain)
  const walk = (from: number, v: number, push: (e: number) => void) => {
    let current = from
    let at = v
    for (;;) {
      const here = tangentAt(current, at)
      const next = brep.edges.findIndex(
        (e, i) =>
          !seen.has(i) &&
          e.curve.kind !== "point" &&
          (e.start === at || e.end === at) &&
          here !== null &&
          length3(cross3(here, tangentAt(i, at) ?? here)) <= 1e-9 &&
          tangentAt(i, at) !== null
      )
      if (next < 0) return
      seen.add(next)
      push(next)
      const e = brep.edges[next]
      at = e.start === at ? e.end : e.start
      current = next
    }
  }
  const e = brep.edges[edge]
  if (!e || e.curve.kind === "point") return []
  if (e.start === e.end) return chain
  walk(edge, e.end, (x) => chain.push(x))
  walk(edge, e.start, (x) => chain.unshift(x))
  return chain
}

/**
 * The edges of the two loops an edge lies in, the loop of its later face
 * first (FILLETEDGE's and CHAMFEREDGE's Loop: a box's top front edge offers
 * the front's, then with Next the top's, f03, c02).
 */
export function edgeLoops(brep: Brep, edge: number): number[][] {
  const out: { face: number; edges: number[] }[] = []
  brep.faces.forEach((f, face) => {
    for (const l of f.loops) {
      if (l.some((c) => c.edge === edge)) {
        out.push({ face, edges: l.map((c) => c.edge) })
      }
    }
  })
  return out.sort((a, b) => b.face - a.face).map((x) => x.edges)
}

/**
 * The face a chamfer's first distance runs across (CHAMFEREDGE's base): the
 * one face every edge lies on, of a lone edge its later face (chamferedge/
 * c01, c06: of a box's top front edge the front, of a cylinder's rim the
 * top). Null where the edges share no face (`Edges must belong to one
 * face.`).
 */
export function chamferBase(
  brep: Brep,
  edges: readonly number[]
): number | null {
  const uses = edgeUses(brep)
  let shared: number[] | null = null
  for (const e of edges) {
    const faces = facesOf(uses, e)
    shared = shared ? shared.filter((f) => faces.includes(f)) : faces
  }
  if (!shared || shared.length === 0) return null
  return Math.max(...shared)
}
