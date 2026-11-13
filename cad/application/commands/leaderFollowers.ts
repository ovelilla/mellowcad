import { CadDocument } from "../../domain/Document"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import {
  Entity,
  EntityId,
  LeaderEntity,
  detachLeader,
  followAnnotation,
  leaderLook,
  leaderOffsetRead,
  samePlane,
} from "../../domain/entities"
import { V } from "../../geometry/Vec2"

/**
 * What an edit makes of the leaders it reaches, AutoCAD's leader reactor
 * (leader/p08, p09, p14, p18). `touched` holds each object the edit changed,
 * added or removed, with what it was before (absent for one added):
 *
 * - its annotation edited, the leader alone not: the leader follows it
 *   (`followAnnotation`), and a text that crossed the leader turns side;
 * - its annotation gone, or no more the kind it was: the leader keeps no
 *   annotation and no hook (`detachLeader`);
 * - the leader edited, with its annotation or alone: its end stays, and its
 *   offset from the annotation is read afresh (`leaderOffsetRead`) — but a
 *   leader moved whole on its own keeps the offset it had, as MOVE leaves DXF
 *   213 (p08).
 *
 * The objects to update, each as it should become; none that stays as it is.
 */
export function leaderFollowers(
  doc: CadDocument,
  touched: ReadonlyMap<EntityId, Entity | undefined>
): Entity[] {
  if (touched.size === 0) return []
  // WHY first: a scan of the drawing per edit is wasted on the lines and arcs
  // most edits touch, which no leader follows.
  const reaches = [...touched].some(([id, before]) => {
    const type = (doc.get(id) ?? before)?.type
    return type === "leader" || type === "mtext" || type === "insert"
  })
  if (!reaches) return []
  const out: Entity[] = []
  for (const entity of doc.getEntities()) {
    if (entity.type !== "leader" || !entity.annotation) continue
    const leaderTouched = touched.has(entity.id)
    const annotationTouched = touched.has(entity.annotation.id)
    if (!leaderTouched && !annotationTouched) continue
    const annotation = doc.get(entity.annotation.id)
    const wanted = entity.annotation.kind === "mtext" ? "mtext" : "insert"
    if (!annotation || annotation.type !== wanted) {
      out.push(detachLeader(entity))
      continue
    }
    if (annotation.type !== "mtext" && annotation.type !== "insert") continue
    if (!samePlane(entity, annotation)) continue
    const look = leaderLook(
      entity,
      doc.getDimStyle(entity.styleId) ?? DEFAULT_DIM_STYLE
    )
    if (!leaderTouched) {
      const { leader, text } = followAnnotation(
        entity,
        annotation,
        look,
        touched.get(annotation.id)
      )
      out.push(leader)
      if (text) out.push(text)
      continue
    }
    const before = touched.get(entity.id)
    if (
      !annotationTouched &&
      before?.type === "leader" &&
      movedWhole(before, entity)
    ) {
      continue
    }
    // An added leader whose annotation was there already is a copy that kept
    // the original's: `withCopiedAssociations` saw to that, so it is read as
    // it stands, as any pair just made.
    out.push(leaderOffsetRead(entity, annotation, look))
  }
  return out.filter((entity) => doc.get(entity.id) !== entity)
}

/** Whether every vertex moved by one same delta: MOVE, or a window round it all. */
function movedWhole(before: LeaderEntity, after: LeaderEntity): boolean {
  if (before.vertices.length !== after.vertices.length) return false
  const delta = V.sub(after.vertices[0], before.vertices[0])
  return after.vertices.every((p, i) =>
    V.equals(V.sub(p, before.vertices[i]), delta, 1e-9)
  )
}

/**
 * The followers one command's run brought along: applied right after its
 * edit, undone right before it, so the edit and what it moved are one step.
 */
export class LeaderFollowers {
  private previous: Entity[] = []

  apply(doc: CadDocument, touched: ReadonlyMap<EntityId, Entity | undefined>) {
    const next = leaderFollowers(doc, touched)
    this.previous = next
      .map((entity) => doc.get(entity.id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (next.length > 0) doc.updateMany(next)
  }

  undo(doc: CadDocument): void {
    if (this.previous.length > 0) doc.updateMany(this.previous)
    this.previous = []
  }
}
