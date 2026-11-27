import {
  Vec3,
  add3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "../geometry/Vec3"
import { faceNormal } from "../geometry/brepQueries"
import { facesAlong } from "../geometry/hiddenLines"
import { MODEL_TOLERANCE } from "../geometry/planarCurves"
import { brepBox } from "../geometry/solids"
import { Entity, EntityId, Solid3dEntity } from "../domain/entityTypes"
import { DocumentReader } from "../domain/Document"

/** A solid's face the line of sight crosses, and where. */
export interface FaceUnder {
  readonly id: EntityId
  readonly face: number
  readonly point: Vec3
}

/**
 * The faces of `solids` the line of sight through `through` crosses, nearest
 * the viewer first, each once (a sphere's twice-crossed face once: p516).
 * Where that line meets the nearest face on an edge or a vertex, only the
 * faces meeting there, the one turned most towards the viewer first (UCS
 * Face's Next walks them: ucs/p511, p522, p523).
 */
export function facesUnder(
  solids: readonly Solid3dEntity[],
  through: Vec3,
  toViewer: Vec3
): FaceUnder[] {
  const w = normalize3(toViewer)
  if (!w) return []
  const hits: { hit: FaceUnder; depth: number; facing: number }[] = []
  let size = 0
  for (const solid of solids) {
    const { brep, id } = solid
    const box = brepBox(brep)
    if (box) size = Math.max(size, length3(sub3(box.max, box.min)))
    for (const { face, depth } of facesAlong(brep, through, w)) {
      const point = add3(through, scale3(w, depth))
      const normal = faceNormal(brep, brep.faces[face], point)
      hits.push({ hit: { id, face, point }, depth, facing: dot3(normal, w) })
    }
  }
  const tie = Math.max(1, size) * MODEL_TOLERANCE * 10
  hits.sort((a, b) =>
    Math.abs(a.depth - b.depth) <= tie ? b.facing - a.facing : b.depth - a.depth
  )
  if (hits.length > 1 && Math.abs(hits[0].depth - hits[1].depth) <= tie) {
    return hits
      .filter((h) => Math.abs(h.depth - hits[0].depth) <= tie)
      .map((h) => h.hit)
  }
  return hits.map((h) => h.hit)
}

/** The visible solids of the drawing, which a face is picked among. */
export function visibleSolids(document: DocumentReader): Solid3dEntity[] {
  return document
    .getEntities()
    .filter(
      (e: Entity): e is Solid3dEntity =>
        e.type === "solid3d" && document.isEntityVisible(e)
    )
}
