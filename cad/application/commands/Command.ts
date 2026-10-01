import { Observable } from "../../shared/Observable"
import { CadDocument } from "../../domain/Document"
import { Entity } from "../../domain/entities"

/**
 * Command pattern: every mutation of the persistent document is expressed as a
 * reversible command. Tools and the engine never call document mutators
 * directly — they submit commands to the {@link CommandHistory}, which executes
 * them and records them for undo/redo.
 *
 * This is the single controlled write-path to the drawing, and the foundation
 * for future features: transactions/macro commands, collaboration (commands
 * are serialisable intents) and plugins (new commands compose freely).
 */
export interface Command {
  /** Stable identifier, useful for logging, telemetry and coalescing. */
  readonly label: string
  execute(doc: CadDocument): void
  undo(doc: CadDocument): void
  /**
   * The same command with every object it brings into the drawing passed
   * through `map`: how a command a tool built in the frame of a tilted UCS
   * reaches the WCS. One that brings in none returns itself.
   */
  mapEntities(map: (entity: Entity) => Entity): Command
}

/**
 * Executes commands against the document and keeps linear undo/redo stacks.
 * Executing a new command clears the redo stack (standard editor semantics).
 */
export class CommandHistory extends Observable {
  private undoStack: Command[] = []
  private redoStack: Command[] = []

  constructor(
    private readonly document: CadDocument,
    /** Bound so pathological interactions can't grow memory forever. */
    private readonly capacity = 200
  ) {
    super()
  }

  execute(command: Command): void {
    command.execute(this.document)
    this.undoStack.push(command)
    if (this.undoStack.length > this.capacity) this.undoStack.shift()
    this.redoStack = []
    this.emit()
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  undo(): boolean {
    const command = this.undoStack.pop()
    if (!command) return false
    command.undo(this.document)
    this.redoStack.push(command)
    this.emit()
    return true
  }

  redo(): boolean {
    const command = this.redoStack.pop()
    if (!command) return false
    command.execute(this.document)
    this.undoStack.push(command)
    this.emit()
    return true
  }

  /** Drops all history, e.g. after loading a file (a fresh baseline). */
  clear(): void {
    if (this.undoStack.length === 0 && this.redoStack.length === 0) return
    this.undoStack = []
    this.redoStack = []
    this.emit()
  }
}
