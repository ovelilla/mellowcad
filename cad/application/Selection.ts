import { Observable } from "../shared/Observable"
import { EntityId } from "../domain/entities"
import { SubobjectRef, sameSubobject } from "../domain/solidSubobjects"

/**
 * Tracks which entities are currently selected. Selection is *transient
 * interaction state* (it is never persisted with the drawing), so it lives in
 * the application layer, apart from the domain document.
 *
 * The faces, edges and vertices a Ctrl+click picks are held apart from the
 * whole objects: `toArray`, `has` and `isEmpty` speak of whole objects only,
 * which every command reads its set from, and a set of subobjects alone is
 * none (desktop: ERASE asks `Select objects:` over a face so selected).
 */
export class Selection extends Observable {
  private ids = new Set<EntityId>()
  private subs: SubobjectRef[] = []

  get size(): number {
    return this.ids.size
  }

  isEmpty(): boolean {
    return this.ids.size === 0
  }

  has(id: EntityId): boolean {
    return this.ids.has(id)
  }

  toArray(): EntityId[] {
    return Array.from(this.ids)
  }

  set(ids: Iterable<EntityId>): void {
    this.ids = new Set(ids)
    this.emit()
  }

  add(id: EntityId): void {
    if (this.ids.has(id)) return
    this.ids.add(id)
    this.emit()
  }

  remove(id: EntityId): void {
    if (this.ids.delete(id)) this.emit()
  }

  /** The subobjects selected, in the order they were picked. */
  subobjects(): readonly SubobjectRef[] {
    return this.subs
  }

  hasSubobject(ref: SubobjectRef): boolean {
    return this.subs.some((s) => sameSubobject(s, ref))
  }

  addSubobject(ref: SubobjectRef): void {
    if (this.hasSubobject(ref)) return
    this.subs = [...this.subs, ref]
    this.emit()
  }

  removeSubobject(ref: SubobjectRef): void {
    const kept = this.subs.filter((s) => !sameSubobject(s, ref))
    if (kept.length === this.subs.length) return
    this.subs = kept
    this.emit()
  }

  /** Drops the subobjects of objects no longer in the drawing. */
  keepSubobjectsOf(exists: (id: EntityId) => boolean): void {
    const kept = this.subs.filter((s) => exists(s.id))
    if (kept.length === this.subs.length) return
    this.subs = kept
    this.emit()
  }

  clear(): void {
    if (this.ids.size === 0 && this.subs.length === 0) return
    this.ids.clear()
    this.subs = []
    this.emit()
  }
}
