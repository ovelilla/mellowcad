import { CadDocument, DocumentTables } from "../../domain/Document"
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

  mapEntities(map: (entity: Entity) => Entity): Command {
    return new AddEntityCommand(map(this.entity))
  }

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

  mapEntities(map: (entity: Entity) => Entity): Command {
    return new AddEntitiesCommand(this.entities.map(map))
  }

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

  mapEntities(map: (entity: Entity) => Entity): Command {
    return new UpdateEntityCommand(map(this.next))
  }

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

  mapEntities(map: (entity: Entity) => Entity): Command {
    return new UpdateEntitiesCommand(this.next.map(map))
  }

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
 * entities identified by `removedIds` and adds the `added` ones. An added
 * entity under a removed one's id is that object changed, kept in its place
 * in the drawing, and the others come after it: TRIM or BREAK splitting a
 * line keeps the line as its first piece and adds the second, as AutoCAD
 * keeps the handle. Captures the removed entities so `undo` restores them
 * exactly.
 */
export class ReplaceEntitiesCommand implements Command {
  readonly label = "replace-entities"
  private removed: Entity[] = []

  constructor(
    private readonly removedIds: readonly EntityId[],
    private readonly added: readonly Entity[]
  ) {}

  mapEntities(map: (entity: Entity) => Entity): Command {
    return new ReplaceEntitiesCommand(this.removedIds, this.added.map(map))
  }

  execute(doc: CadDocument): void {
    this.removed = this.removedIds
      .map((id) => doc.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    const kept = new Set(this.added.map((entity) => entity.id))
    doc.removeMany(this.removedIds.filter((id) => !kept.has(id)))
    doc.addMany(this.added)
  }

  undo(doc: CadDocument): void {
    const removed = new Set(this.removedIds)
    doc.removeMany(
      this.added.map((entity) => entity.id).filter((id) => !removed.has(id))
    )
    doc.addMany(this.removed)
  }
}

/** Removes a set of entities (Delete key, erase tools...). */
export class RemoveEntitiesCommand implements Command {
  readonly label = "remove-entities"
  private removed: Entity[] = []

  constructor(private readonly ids: readonly EntityId[]) {}

  mapEntities(): Command {
    return this
  }

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

/** Clears every object of the drawing, as one undo step. */
export class ClearDocumentCommand implements Command {
  readonly label = "clear-document"
  private previous: Entity[] = []

  mapEntities(): Command {
    return this
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getEntities()
    doc.clear()
  }

  undo(doc: CadDocument): void {
    doc.load(this.previous)
  }
}

/**
 * NEW: replaces the whole drawing — its objects, tables and settings — with a
 * blank one, as one undo step. WHY undoable: AutoCAD opens the new drawing in
 * a tab of its own and the old one stays open there; with a single drawing
 * here, U is the way back to it.
 */
export class NewDrawingCommand implements Command {
  readonly label = "new-drawing"
  private previous: { entities: Entity[]; tables: DocumentTables } | null = null

  mapEntities(): Command {
    return this
  }

  execute(doc: CadDocument): void {
    this.previous = { entities: doc.getEntities(), tables: tablesOf(doc) }
    doc.load([], tablesOf(new CadDocument()))
  }

  undo(doc: CadDocument): void {
    if (this.previous) doc.load(this.previous.entities, this.previous.tables)
  }
}

function tablesOf(doc: CadDocument): DocumentTables {
  return {
    settings: doc.getSettings(),
    layers: doc.getLayers(),
    currentLayerId: doc.getCurrentLayerId(),
    textStyles: doc.getTextStyles(),
    currentTextStyleId: doc.getCurrentTextStyleId(),
    dimStyles: doc.getDimStyles(),
    currentDimStyleId: doc.getCurrentDimStyleId(),
    blocks: doc.getBlocks(),
  }
}
