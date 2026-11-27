import { Vec3, add3, cross3, dot3, length3, scale3, sub3 } from "./Vec3"
import { Brep, BrepFace, brepVolume, unsigned0 } from "./solids"
import { SolidBooleanError } from "./solidBooleans"
import { brepFaceOffset, sizeTolerance } from "./solidEdits"

/** A face, an edge or a vertex of a B-rep, by its index. */
export interface BrepSubobject {
  readonly kind: "face" | "edge" | "vertex"
  readonly index: number
}

/**
 * The solid with faces, edges and vertices of it carried by `map` (a move,
 * a turn or a scale), the faces round them laid in the planes their corners
 * now span: AutoCAD's default for a subobject moved, rotated or scaled,
 * "Extend adjacent faces" (About Moving, Rotating, and Scaling Faces on 3D
 * Solids). Its console: the top face of a box moved up, its sides follow
 * (solid-edits/p244); an edge moved, the two faces on it tilt to keep it
 * (p245, p262); a face scaled, its sides slope (p261). One planar face moved
 * along its normal goes through SOLIDEDIT's offset, which also carries
 * curved neighbours (`brepFaceOffset`).
 *
 * Throws `SolidBooleanError`: "unsupported" where a face whose corners move
 * is curved or bounded by a curve; "failed" where the corners of a face no
 * longer lie in one plane (AutoCAD splits such a face into triangles: a
 * vertex moved, p246; a face turned in its plane, p249) or one turns over.
 */
export function brepSubobjectsMapped(
  brep: Brep,
  subobjects: readonly BrepSubobject[],
  map: (point: Vec3) => Vec3
): Brep {
  const moved = new Set<number>()
  for (const sub of subobjects) {
    for (const v of subobjectVertices(brep, sub)) moved.add(v)
  }
  if (moved.size === 0) return brep
  const along = faceTranslation(brep, subobjects, map)
  if (along) return brepFaceOffset(brep, along.face, along.distance)
  const vertices = brep.vertices.map((p, i) =>
    moved.has(i) ? unsigned0(map(p)) : p
  )
  const tolerance = sizeTolerance(brep)
  const faces = brep.faces.map((face) => {
    const corners = faceVertices(brep, face)
    if (!corners.some((v) => moved.has(v))) return face
    return replanedFace(brep, face, corners, vertices, tolerance)
  })
  const result: Brep = { ...brep, vertices, faces }
  if (!(brepVolume(result) > 0)) throw new SolidBooleanError("failed")
  return result
}

/** The vertices a subobject carries: a face's corners, an edge's ends, the vertex. */
export function subobjectVertices(brep: Brep, sub: BrepSubobject): number[] {
  switch (sub.kind) {
    case "vertex":
      return sub.index < brep.vertices.length ? [sub.index] : []
    case "edge": {
      const edge = brep.edges[sub.index]
      return edge ? [edge.start, edge.end] : []
    }
    case "face": {
      const face = brep.faces[sub.index]
      return face ? faceVertices(brep, face) : []
    }
  }
}

/** The vertices round a face's loops, each once. */
function faceVertices(brep: Brep, face: BrepFace): number[] {
  const out = new Set<number>()
  for (const loop of face.loops) {
    for (const c of loop) {
      const edge = brep.edges[c.edge]
      out.add(edge.start)
      out.add(edge.end)
    }
  }
  return [...out]
}

/**
 * One planar face, alone, moved along its normal: how far, so the offset
 * that keeps every neighbour's surface takes it (a box's top raised, p244,
 * a cylinder's cap: its side stays a cylinder).
 */
function faceTranslation(
  brep: Brep,
  subobjects: readonly BrepSubobject[],
  map: (point: Vec3) => Vec3
): { face: number; distance: number } | null {
  if (subobjects.length !== 1 || subobjects[0].kind !== "face") return null
  const face = brep.faces[subobjects[0].index]
  if (face?.surface.kind !== "plane") return null
  const { normal } = face.surface
  const tolerance = sizeTolerance(brep)
  let shift: Vec3 | null = null
  for (const v of faceVertices(brep, face)) {
    const p = brep.vertices[v]
    const d = sub3(map(p), p)
    if (shift && length3(sub3(d, shift)) > tolerance) return null
    shift ??= d
  }
  if (!shift) return null
  const distance = dot3(shift, normal)
  if (length3(sub3(shift, scale3(normal, distance))) > tolerance) return null
  return { face: subobjects[0].index, distance }
}

/**
 * Whether a face's outline, carried, crosses itself: a face of a solid that
 * is not convex dragged through another part of it (an L's inner face moved
 * across its arm). Two sides that do not share a corner meet.
 */
function crossesItself(
  ring: readonly Vec3[],
  normal: Vec3,
  tolerance: number
): boolean {
  // The ring flattened in its plane.
  const u =
    Math.abs(normal.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 }
  const a = cross3(normal, u)
  const b = cross3(normal, a)
  const flat = ring.map((p) => ({ x: dot3(p, a), y: dot3(p, b) }))
  const n = flat.length
  const side = (
    p: { x: number; y: number },
    q: { x: number; y: number },
    r: { x: number; y: number }
  ) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
  for (let i = 0; i < n; i++) {
    const p1 = flat[i]
    const p2 = flat[(i + 1) % n]
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue
      const q1 = flat[j]
      const q2 = flat[(j + 1) % n]
      const d1 = side(q1, q2, p1)
      const d2 = side(q1, q2, p2)
      const d3 = side(p1, p2, q1)
      const d4 = side(p1, p2, q2)
      const eps = tolerance * tolerance
      if (
        ((d1 > eps && d2 < -eps) || (d1 < -eps && d2 > eps)) &&
        ((d3 > eps && d4 < -eps) || (d3 < -eps && d4 > eps))
      ) {
        return true
      }
    }
  }
  return false
}

/**
 * A planar face whose corners moved, laid in the plane they now span, its
 * outside kept: by Newell's normal, which runs with the loop.
 */
function replanedFace(
  brep: Brep,
  face: BrepFace,
  corners: readonly number[],
  vertices: readonly Vec3[],
  tolerance: number
): BrepFace {
  const s = face.surface
  if (s.kind !== "plane") throw new SolidBooleanError("unsupported")
  for (const loop of face.loops) {
    for (const c of loop) {
      if (brep.edges[c.edge].curve.kind !== "line") {
        throw new SolidBooleanError("unsupported")
      }
    }
  }
  const ring = face.loops[0].map((c) => {
    const edge = brep.edges[c.edge]
    return vertices[c.reversed ? edge.end : edge.start]
  })
  let n: Vec3 = { x: 0, y: 0, z: 0 }
  for (let i = 0; i < ring.length; i++) {
    n = add3(n, cross3(ring[i], ring[(i + 1) % ring.length]))
  }
  const size = length3(n)
  if (!(size > 0)) throw new SolidBooleanError("failed")
  const normal = scale3(n, 1 / size)
  if (dot3(normal, s.normal) <= 0) throw new SolidBooleanError("failed")
  const origin = vertices[corners[0]]
  for (const v of corners) {
    if (Math.abs(dot3(sub3(vertices[v], origin), normal)) > tolerance) {
      throw new SolidBooleanError("failed")
    }
  }
  if (crossesItself(ring, normal, tolerance)) {
    throw new SolidBooleanError("failed")
  }
  return {
    ...face,
    surface: { kind: "plane", origin, normal: unsigned0(normal) },
  }
}
