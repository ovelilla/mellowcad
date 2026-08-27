import { CadDocument } from "../../domain/Document"
import { Entity, EntityId } from "../../domain/entities"
import { Command } from "./Command"

/**
 * The built-in reversible edits. Each command captures whatever it needs at
 * execution time so `undo` can restore the document exactly.
 */

/** Adds a single entity (line tool, future draw tools, paste, plugins...). */
export class AddEntityCommand implements Command {
  readonly label = "add-entity"

  constructor(private readonly entity: Entity) {}

  execute(doc: CadDocument): void {
    doc.add(this.entity)
  }

  undo(doc: CadDocument): void {
    doc.remove(this.entity.id)
  }
}

/**
 * Adds several new entities as one undoable step — the COPY command dropping a
 * set of duplicates, future array/paste-multiple edits...
 */
export class AddEntitiesCommand implements Command {
  readonly label = "add-entities"

  constructor(private readonly entities: readonly Entity[]) {}

  execute(doc: CadDocument): void {
    doc.addMany(this.entities)
  }

  undo(doc: CadDocument): void {
    doc.removeMany(this.entities.map((entity) => entity.id))
  }
}

/**
 * Replaces a single entity with a new version sharing the same id (grip
 * editing: stretching a line endpoint, moving, resizing...). Captures the
 * previous state so `undo` restores it exactly.
 */
export class UpdateEntityCommand implements Command {
  readonly label = "update-entity"
  private previous: Entity | undefined

  constructor(private readonly next: Entity) {}

  execute(doc: CadDocument): void {
    this.previous = doc.get(this.next.id)
    doc.update(this.next)
  }

  undo(doc: CadDocument): void {
    if (this.previous) doc.update(this.previous)
    else doc.remove(this.next.id)
  }
}

/**
 * Replaces several entities at once (moving a multi-object selection, future
 * array/mirror edits...). Captures each previous version so `undo` restores the
 * whole set exactly, as a single history step.
 */
export class UpdateEntitiesCommand implements Command {
  readonly label = "update-entities"
  private previous: Entity[] = []

  constructor(private readonly next: readonly Entity[]) {}

  execute(doc: CadDocument): void {
    this.previous = this.next
      .map((entity) => doc.get(entity.id))
      .filter((entity): entity is Entity => entity !== undefined)
    doc.updateMany(this.next)
  }

  undo(doc: CadDocument): void {
    doc.updateMany(this.previous)
  }
}

/**
 * Replaces a set of entities with a new set as one undoable step: removes the
 * entities identified by `removedIds` and adds the `added` ones. Underpins
 * TRIM when a cut falls in the *middle* of a line, splitting it into two
 * separate lines (the original is removed and two fresh-id lines take its
 * place). Captures the removed entities so `undo` restores them exactly.
 */
export class ReplaceEntitiesCommand implements Command {
  readonly label = "replace-entities"
  private removed: Entity[] = []

  constructor(
    private readonly removedIds: readonly EntityId[],
    private readonly added: readonly Entity[]
  ) {}

  execute(doc: CadDocument): void {
    this.removed = this.removedIds
      .map((id) => doc.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    doc.removeMany(this.removedIds)
    doc.addMany(this.added)
  }

  undo(doc: CadDocument): void {
    doc.removeMany(this.added.map((entity) => entity.id))
    doc.addMany(this.removed)
  }
}

/** Removes a set of entities (Delete key, erase tools...). */
export class RemoveEntitiesCommand implements Command {
  readonly label = "remove-entities"
  private removed: Entity[] = []

  constructor(private readonly ids: readonly EntityId[]) {}

  execute(doc: CadDocument): void {
    this.removed = this.ids
      .map((id) => doc.get(id))
      .filter((e): e is Entity => e !== undefined)
    doc.removeMany(this.ids)
  }

  undo(doc: CadDocument): void {
    for (const entity of this.removed) doc.add(entity)
  }
}

/** Clears the whole drawing (the toolbar's "Clear all"). */
export class ClearDocumentCommand implements Command {
  readonly label = "clear-document"
  private previous: Entity[] = []

  execute(doc: CadDocument): void {
    this.previous = doc.getEntities()
    doc.clear()
  }

  undo(doc: CadDocument): void {
    doc.load(this.previous)
  }
}
