import { Vec2 } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { closestPointOnSegment } from "../geometry/primitives"
import { Face3dEntity } from "./entityTypes"

/**
 * Whether the edge from corner `i` to the next is drawn: DXF 70's bit `i`
 * clear (1 the first edge, 2 the second, 4 the third, 8 the fourth).
 */
export function isFace3dEdgeVisible(face: Face3dEntity, i: number): boolean {
  return ((face.invisibleEdges ?? 0) & (1 << i)) === 0
}

/**
 * Its visible edges, corner to corner round the face, as AutoCAD draws,
 * picks and snaps to it (face3d/f04: an invisible edge has no Midpoint or
 * Nearest and selects nothing); a triangle's edge from its third corner to
 * its repeated fourth, which has no length, left out.
 */
export function face3dEdges(face: Face3dEntity): [Vec3, Vec3][] {
  const edges: [Vec3, Vec3][] = []
  face.corners.forEach((a, i) => {
    const b = face.corners[(i + 1) % 4]
    if (!isFace3dEdgeVisible(face, i)) return
    if (a.x === b.x && a.y === b.y && a.z === b.z) return
    edges.push([a, b])
  })
  return edges
}

/** The point of its visible edges nearest `point` in plan, at that edge's height. */
export function closestPointOnFace3d(face: Face3dEntity, point: Vec2): Vec3 {
  let best: Vec3 = face.corners[0]
  let bestDistance = Infinity
  for (const [a, b] of face3dEdges(face)) {
    const hit = closestPointOnSegment(a, b, point)
    if (hit.distance >= bestDistance) continue
    bestDistance = hit.distance
    best = { ...hit.point, z: a.z + hit.t * (b.z - a.z) }
  }
  return best
}

/**
 * A reflected 3D face as AutoCAD's MIRROR leaves it (face3d/f10, f11): its
 * corners in the reverse order, the fourth first, so its first edge is the
 * third it had and its third the first (70 1 becomes 4).
 */
export function face3dReflected(face: Face3dEntity): Face3dEntity {
  const [a, b, c, d] = face.corners
  const bits = face.invisibleEdges ?? 0
  const swapped = (bits & 0b1010) | ((bits & 1) << 2) | ((bits & 4) >> 2)
  const { invisibleEdges, ...rest } = face
  void invisibleEdges
  return {
    ...rest,
    corners: [d, c, b, a],
    ...(swapped ? { invisibleEdges: swapped } : {}),
  }
}
