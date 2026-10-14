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

/** What an undo or a redo took back or did again, as U and REDO name it. */
export interface Step {
  /** The command that made it (`LINE`), or null for an edit made outside one. */
  readonly name: string | null
  /** Whether that command regenerated the drawing (LTSCALE, -VIEW). */
  readonly regenerates: boolean
}

interface Entry extends Step {
  readonly command: Command
}

/**
 * Executes commands against the document and keeps linear undo/redo stacks.
 * Executing a new command clears the redo stack (standard editor semantics).
 */
export class CommandHistory extends Observable {
  private undoStack: Entry[] = []
  private redoStack: Entry[] = []
  private commandName: string | null = null
  private regenerated = false
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
    this.undoStack.push({
      command,
      name: this.commandName,
      regenerates: this.regenerated,
    })
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

  /**
   * Closes the open group, folding what it executed into one entry, which
   * regenerates if anything in it did.
   */
  endGroup(): void {
    const start = this.groupStart
    const regenerated = this.regenerated
    this.groupStart = null
    this.regenerated = false
    if (start === null || this.undoStack.length === start) return
    const steps = this.undoStack.splice(start)
    this.undoStack.push({
      command:
        steps.length === 1
          ? steps[0].command
          : new GroupCommand(steps.map((step) => step.command)),
      name: steps[0].name,
      regenerates: regenerated || steps.some((step) => step.regenerates),
    })
  }

  /**
   * The command what executes from now on belongs to, which U and REDO
   * name; null once it has ended.
   */
  nameCommand(name: string | null): void {
    this.commandName = name
    if (name === null) this.regenerated = false
  }

  /** The running command regenerated the drawing, which U and REDO say again. */
  markRegenerated(): void {
    this.regenerated = true
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

  undo(): Step | null {
    const entry = this.undoStack.pop()
    if (!entry) return null
    if (this.groupStart !== null) {
      this.groupStart = Math.min(this.groupStart, this.undoStack.length)
    }
    this.replayingStep = { command: entry.command, undone: true }
    try {
      entry.command.undo(this.document)
    } finally {
      this.replayingStep = null
    }
    this.redoStack.push(entry)
    this.emit()
    return entry
  }

  redo(): Step | null {
    const entry = this.redoStack.pop()
    if (!entry) return null
    this.replayingStep = { command: entry.command, undone: false }
    try {
      entry.command.execute(this.document)
    } finally {
      this.replayingStep = null
    }
    this.undoStack.push(entry)
    this.emit()
    return entry
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
