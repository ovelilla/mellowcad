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

/** The command an undo (`undone`) or a redo is replaying. */
export interface Replayed {
  readonly command: Command
  readonly undone: boolean
}

/**
 * Executes commands against the document and keeps linear undo/redo stacks.
 * Executing a new command clears the redo stack (standard editor semantics).
 */
export class CommandHistory extends Observable {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  /**
   * Where the open group starts on the undo stack, or null when none is open.
   * Inside a group each command stays its own entry, so a command's own Undo
   * option (LINE's U) still steps back one at a time.
   */
  private groupStart: number | null = null
  private replayingStep: Replayed | null = null

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
    if (this.undoStack.length > this.capacity) {
      this.undoStack.shift()
      if (this.groupStart !== null) {
        this.groupStart = Math.max(0, this.groupStart - 1)
      }
    }
    this.redoStack = []
    this.emit()
  }

  /**
   * Opens a group: what executes until {@link endGroup} becomes one undo step,
   * as AutoCAD's U undoes a whole command — "removing all 3 of the lines
   * created by it". A group already open stays the one.
   */
  beginGroup(): void {
    if (this.groupStart === null) this.groupStart = this.undoStack.length
  }

  /** Closes the open group, folding what it executed into one entry. */
  endGroup(): void {
    const start = this.groupStart
    this.groupStart = null
    if (start === null || this.undoStack.length - start < 2) return
    const steps = this.undoStack.splice(start)
    this.undoStack.push(new GroupCommand(steps))
  }

  /**
   * The undo or the redo putting the document back, `null` for a change
   * made: what follows one and not the other (LASTPOINT after a UCS).
   */
  get replaying(): Replayed | null {
    return this.replayingStep
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
    if (this.groupStart !== null) {
      this.groupStart = Math.min(this.groupStart, this.undoStack.length)
    }
    this.replayingStep = { command, undone: true }
    try {
      command.undo(this.document)
    } finally {
      this.replayingStep = null
    }
    this.redoStack.push(command)
    this.emit()
    return true
  }

  redo(): boolean {
    const command = this.redoStack.pop()
    if (!command) return false
    this.replayingStep = { command, undone: false }
    try {
      command.execute(this.document)
    } finally {
      this.replayingStep = null
    }
    this.undoStack.push(command)
    this.emit()
    return true
  }

  /** Drops all history, e.g. after loading a file (a fresh baseline). */
  clear(): void {
    if (this.groupStart !== null) this.groupStart = 0
    if (this.undoStack.length === 0 && this.redoStack.length === 0) return
    this.undoStack = []
    this.redoStack = []
    this.emit()
  }
}

/** The commands of one group, done in order and undone in reverse. */
class GroupCommand implements Command {
  readonly label: string

  constructor(private readonly steps: readonly Command[]) {
    this.label = steps[0].label
  }

  execute(doc: CadDocument): void {
    for (const step of this.steps) step.execute(doc)
  }

  undo(doc: CadDocument): void {
    for (let i = this.steps.length - 1; i >= 0; i--) this.steps[i].undo(doc)
  }

  mapEntities(map: (entity: Entity) => Entity): Command {
    return new GroupCommand(this.steps.map((step) => step.mapEntities(map)))
  }
}
