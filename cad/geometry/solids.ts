import { Vec3, add3, dot3, normalize3, sub3 } from "./Vec3"
import { Axes3, arbitraryAxis, worldToAxes } from "./ocs"
import { MODEL_TOLERANCE, PlanarCurve } from "./planarCurves"
import { RegionFace, facesArea } from "./planarRegions"

/**
 * A solid's boundary, as ACIS keeps one (docs/next-solids.md §3): its
 * vertices, its edges between them, and its faces, each a piece of a surface
 * bounded by loops of those edges. Every edge is shared by two faces, which
 * run it in opposite senses, so the boundary is closed. Nothing here is a
 * mesh: what is drawn is derived.
 */
export interface Brep {
  readonly vertices: readonly Vec3[]
  readonly edges: readonly BrepEdge[]
  readonly faces: readonly BrepFace[]
}

/** An edge from one vertex to another (indices), along its curve. */
export interface BrepEdge {
  readonly start: number
  readonly end: number
  readonly curve: BrepCurve
}

/** The curve an edge lies on: so far the straight line through its ends. */
export type BrepCurve = { readonly kind: "line" }

/** A face's use of an edge: along it, or against it when `reversed`. */
export interface Coedge {
  readonly edge: number
  readonly reversed: boolean
}

/**
 * A run of coedges end to end, closed. Seen from outside the solid, a face's
 * first loop turns counter-clockwise about its outward normal and its holes
 * clockwise, so the face is on every coedge's left.
 */
export type BrepLoop = readonly Coedge[]

/** The surface a face lies on: a plane through `origin`, `normal` the unit outward one. */
export type BrepSurface = {
  readonly kind: "plane"
  readonly origin: Vec3
  readonly normal: Vec3
}

export interface BrepFace {
  readonly surface: BrepSurface
  readonly loops: readonly BrepLoop[]
}

/**
 * `v` with no -0, which a file cannot hold (it reads back 0): every point
 * and direction a solid stores passes here, so a round trip is exact.
 */
export function unsigned0(v: Vec3): Vec3 {
  return { x: v.x + 0, y: v.y + 0, z: v.z + 0 }
}

/**
 * The box with a corner at `corner` and sides `u`, `v` and `w`, which must
 * turn right-handed (`(u × v) · w > 0`). Its edges run as ACIS runs a box's
 * (solid/p01): the bottom's round the bottom face, the top's round the top,
 * the risers down; the bottom's come first, which in plan, where a top edge
 * hides one, is the edge AutoCAD finds (solid/s01, e07). The faces in ACIS's
 * order: top, bottom, then round from the side facing away from `v`.
 */
export function boxBrep(corner: Vec3, u: Vec3, v: Vec3, w: Vec3): Brep {
  const base = [
    corner,
    add3(corner, u),
    add3(add3(corner, u), v),
    add3(corner, v),
  ]
  const vertices = [...base, ...base.map((p) => add3(p, w))].map(unsigned0)
  const ends: [number, number][] = [
    [0, 3],
    [3, 2],
    [2, 1],
    [1, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [4, 0],
    [5, 1],
    [6, 2],
    [7, 3],
  ]
  const edges: BrepEdge[] = ends.map(([start, end]) => ({
    start,
    end,
    curve: { kind: "line" },
  }))
  // Each face's corners counter-clockwise seen from outside, its coedges
  // the edges between them, along or against.
  const face = (d: Vec3, k: number, cycle: number[]): BrepFace => ({
    surface: {
      kind: "plane",
      origin: vertices[cycle[0]],
      normal: unsigned0(
        normalize3({ x: d.x * k, y: d.y * k, z: d.z * k }) ?? d
      ),
    },
    loops: [
      cycle.map((a, n) => {
        const b = cycle[(n + 1) % cycle.length]
        const edge = ends.findIndex(([s, e]) => s === a && e === b)
        return edge >= 0
          ? { edge, reversed: false }
          : {
              edge: ends.findIndex(([s, e]) => s === b && e === a),
              reversed: true,
            }
      }),
    ],
  })
  return {
    vertices,
    edges,
    faces: [
      face(w, 1, [4, 5, 6, 7]),
      face(w, -1, [0, 3, 2, 1]),
      face(v, -1, [0, 1, 5, 4]),
      face(u, -1, [3, 0, 4, 7]),
      face(v, 1, [2, 3, 7, 6]),
      face(u, 1, [1, 2, 6, 5]),
    ],
  }
}

/** The vertex a coedge starts from, in its face's sense. */
export function coedgeStart(brep: Brep, coedge: Coedge): number {
  const { start, end } = brep.edges[coedge.edge]
  return coedge.reversed ? end : start
}

/** Each edge as the segment it is, from its start to its end. */
export function brepEdgeSegments(brep: Brep): [Vec3, Vec3][] {
  return brep.edges.map((edge) => [
    brep.vertices[edge.start],
    brep.vertices[edge.end],
  ])
}

/**
 * The solid carried through a similarity: `point` maps a point, `direction`
 * a direction (the linear part, the scale left out). A reflection would turn
 * every face inside out: its loops are run backwards so each face keeps its
 * outside on the normal's side.
 */
export function brepMapped(
  brep: Brep,
  point: (p: Vec3) => Vec3,
  direction: (d: Vec3) => Vec3,
  reflects: boolean
): Brep {
  return {
    vertices: brep.vertices.map((p) => unsigned0(point(p))),
    edges: brep.edges,
    faces: brep.faces.map((face) => ({
      surface: {
        kind: "plane",
        origin: unsigned0(point(face.surface.origin)),
        normal: unsigned0(
          normalize3(direction(face.surface.normal)) ?? face.surface.normal
        ),
      },
      loops: reflects
        ? face.loops.map((loop) =>
            [...loop].reverse().map((c) => ({ ...c, reversed: !c.reversed }))
          )
        : face.loops,
    })),
  }
}

/** A planar face as a region of its plane: the plane's frame and the face's loops in it. */
export interface PlanarFace {
  /** The object coordinate system of the outward normal, DXF's arbitrary axis. */
  readonly axes: Axes3
  /** How far the plane lies from the origin along that normal. */
  readonly elevation: number
  readonly face: RegionFace
}

/**
 * The face as the kernel's planar region in its plane: read in the OCS of its
 * outward normal, its outline is counter-clockwise and its holes clockwise,
 * as a region's are. What EXPLODE leaves of it (solid/p09), and how its area
 * is measured — then `about` a vertex of the solid: a shoelace far from the
 * origin loses a small face's area to rounding.
 */
export function planarFace(
  brep: Brep,
  face: BrepFace,
  about: Vec3 = ORIGIN
): PlanarFace {
  const axes = arbitraryAxis(face.surface.normal) ?? {
    x: { x: 1, y: 0, z: 0 },
    y: { x: 0, y: 1, z: 0 },
    z: { x: 0, y: 0, z: 1 },
  }
  const loops = face.loops.map((loop) =>
    loop.map((coedge): PlanarCurve => {
      const { start, end } = brep.edges[coedge.edge]
      const [from, to] = coedge.reversed ? [end, start] : [start, end]
      const a = worldToAxes(axes, sub3(brep.vertices[from], about))
      const b = worldToAxes(axes, sub3(brep.vertices[to], about))
      return {
        kind: "line",
        start: { x: a.x, y: a.y },
        end: { x: b.x, y: b.y },
      }
    })
  )
  return {
    axes,
    elevation: dot3(sub3(face.surface.origin, about), axes.z),
    face: { loops },
  }
}

const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 }

/** The area of its whole boundary: AREA's Object of a solid (solid/p01). */
export function brepArea(brep: Brep): number {
  const about = brep.vertices[0] ?? ORIGIN
  return brep.faces.reduce(
    (sum, face) => sum + facesArea([planarFace(brep, face, about).face]),
    0
  )
}

/**
 * The volume it encloses, by the divergence theorem: a third of the sum over
 * its faces of each face's area times its plane's distance along its outward
 * normal.
 */
export function brepVolume(brep: Brep): number {
  const about = brep.vertices[0] ?? ORIGIN
  let sum = 0
  for (const face of brep.faces) {
    const flat = planarFace(brep, face, about)
    sum += flat.elevation * facesArea([flat.face])
  }
  return sum / 3
}

/**
 * Whether the boundary closes: every index in range, every loop running end
 * to end, every vertex on the planes of the faces round it, and every edge
 * used twice, once each way. What a solid read from a file must be.
 */
export function brepIsClosed(brep: Brep): boolean {
  const { vertices, edges, faces } = brep
  const uses = edges.map(() => ({ along: 0, against: 0 }))
  const size = vertices.reduce(
    (m, p) => Math.max(m, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)),
    1
  )
  for (const edge of edges) {
    if (!vertices[edge.start] || !vertices[edge.end]) return false
    if (edge.start === edge.end || edge.curve.kind !== "line") return false
  }
  for (const face of faces) {
    const { origin, normal } = face.surface
    if (Math.abs(Math.hypot(normal.x, normal.y, normal.z) - 1) > 1e-9) {
      return false
    }
    for (const loop of face.loops) {
      if (loop.length < 2) return false
      for (let i = 0; i < loop.length; i++) {
        const coedge = loop[i]
        const use = uses[coedge.edge]
        if (!use) return false
        if (coedge.reversed) use.against++
        else use.along++
        const next = loop[(i + 1) % loop.length]
        if (!edges[next.edge]) return false
        const { start, end } = edges[coedge.edge]
        if ((coedge.reversed ? start : end) !== coedgeStart(brep, next)) {
          return false
        }
        const off = dot3(sub3(vertices[start], origin), normal)
        if (Math.abs(off) > MODEL_TOLERANCE * size) return false
      }
    }
  }
  return uses.every((use) => use.along === 1 && use.against === 1)
}
