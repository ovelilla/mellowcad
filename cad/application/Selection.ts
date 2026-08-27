import { Observable } from "../shared/Observable"
import { EntityId } from "../domain/entities"

/**
 * Tracks which entities are currently selected. Selection is *transient
 * interaction state* (it is never persisted with the drawing), so it lives in
 * the application layer, apart from the domain document.
 */
export class Selection extends Observable {
  private ids = new Set<EntityId>()

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

  toggle(id: EntityId): void {
    if (this.ids.has(id)) this.ids.delete(id)
    else this.ids.add(id)
    this.emit()
  }

  remove(id: EntityId): void {
    if (this.ids.delete(id)) this.emit()
  }

  clear(): void {
    if (this.ids.size === 0) return
    this.ids.clear()
    this.emit()
  }
}
