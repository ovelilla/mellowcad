import { Observable } from "../../shared/Observable"
import { CadDocument } from "../../domain/Document"
import { Entity } from "../../domain/entities"
import { ViewChangeCommand } from "./viewCommands"

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
 * What an undo or a redo took back or did again, as U and REDO name it: a
 * command's step, a group UNDO BEgin and End made of several, or UNDO's mark.
 */
export interface Step {
  readonly kind: "command" | "group" | "mark"
  /** The command that made it (`LINE`), or null for an edit made outside one. */
  readonly name: string | null
  /** A group's commands, or consecutive ZOOMs', in the order they ran. */
  readonly names: readonly string[]
  /** Whether taking it back regenerates the drawing (LTSCALE, -VIEW). */
  readonly regenerates: boolean
  /** Whether doing it again does. */
  readonly regeneratesRedone: boolean
}

interface Entry extends Omit<Step, "kind" | "regeneratesRedone"> {
  /** `begin`: where an UNDO group still open starts, which no undo passes. */
  readonly kind: Step["kind"] | "begin"
  /** What it does and undoes; null for a mark, a group's start or an empty group. */
  readonly command: Command | null
  /**
   * A ZOOM's view change, which the next ZOOM joins (UNDO Combine). Whether
   * it regenerated is said only when taking it back moves the view, never
   * when doing it again (acc/z4, z29, z32–z38 of the MREDO session).
   */
  readonly combines?: true
  /** A layer-table edit made outside a command, which the next one joins (UNDO Layer). */
  readonly layer?: true
}

/** How a group closes: as a ZOOM's, joining the ZOOM before it or not. */
export interface ZoomStep {
  readonly withLast: boolean
}

/** UNDO Control: every step kept, only the last one, or none. */
export type UndoControl = "all" | "one" | "none"

/** UNDO's Auto, Control, Combine and Layer (UNDOCTL). */
export interface UndoSettings {
  readonly auto: boolean
  readonly control: UndoControl
  /** Whether consecutive ZOOMs are one step. */
  readonly combine: boolean
  /** Whether the layer dialog's operations are one step. */
  readonly layer: boolean
}

const DEFAULT_UNDO_SETTINGS: UndoSettings = {
  auto: true,
  control: "all",
  combine: true,
  layer: true,
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
  /** Whether the open group is a step even when it executes nothing. */
  private groupSteps = false
  /** The start of the group UNDO BEgin opened and End has not closed. */
  private undoGroup: Entry | null = null
  private replayingStep: Replayed | null = null
  /** Steps dropped off the bottom of the stack, which {@link depth} still counts. */
  private dropped = 0
  private undoSettings: UndoSettings = DEFAULT_UNDO_SETTINGS

  constructor(
    private readonly document: CadDocument,
    /** Bound so pathological interactions can't grow memory forever. */
    private readonly capacity = 200
  ) {
    super()
  }

  execute(command: Command): void {
    command.execute(this.document)
    this.push({
      kind: "command",
      command,
      name: this.commandName,
      names: [],
      regenerates: this.regenerated,
    })
  }

  /**
   * A layer-table edit made outside a command (the Layer Properties Manager),
   * a step named `name`. With UNDO's Layer on, it joins the step just below
   * when that is one too, U naming them all (`'.-LAYER '.-LAYER`: desktop
   * d04-3; consecutive -LAYER runs fold so too, p303, p306), unless Control
   * keeps fewer than all (as ZOOMs combine). Inside an open group it is that
   * group's, as a palette's change mid-command is.
   */
  executeLayerEdit(command: Command, name: string, regenerates: boolean): void {
    if (this.groupStart !== null) {
      this.execute(command)
      return
    }
    command.execute(this.document)
    const entry: Entry = {
      kind: "command",
      command,
      name,
      names: [],
      regenerates,
      layer: true,
    }
    const below = this.undoStack.at(-1)
    const { control, layer } = this.undoSettings
    if (layer && control === "all" && below?.layer && below.command) {
      this.undoStack[this.undoStack.length - 1] = {
        ...below,
        command: new GroupCommand([below.command, command]),
        name: null,
        names: [...namesOf(below), name],
        regenerates: below.regenerates || regenerates,
      }
      this.redoStack = []
      this.emit()
      return
    }
    this.push(entry)
  }

  private push(entry: Entry): void {
    // With UNDO Control None nothing is kept, so a command's own Undo (LINE's
    // U) steps its prompt back and leaves the segment drawn (acc/h40).
    if (this.undoSettings.control === "none") return
    this.undoStack.push(entry)
    if (this.undoStack.length > this.capacity) {
      this.dropped += 1
      if (this.undoStack.shift() === this.undoGroup) this.undoGroup = null
      if (this.groupStart !== null) {
        this.groupStart = Math.max(0, this.groupStart - 1)
      }
    }
    this.redoStack = []
    this.keepOne()
    this.emit()
  }

  /**
   * With UNDO Control One, only the last step stays once no command is
   * running: inside one, its own Undo still steps back (acc/h3, h41).
   */
  private keepOne(): void {
    if (
      this.undoSettings.control === "one" &&
      this.groupStart === null &&
      this.undoStack.length > 1
    ) {
      this.dropped += this.undoStack.length - 1
      this.undoStack = this.undoStack.slice(-1)
    }
  }

  get settings(): UndoSettings {
    return this.undoSettings
  }

  /** UNDOCTL as a drawing starts it: per drawing, not saved (rectang/p305). */
  resetSettings(): void {
    this.undoSettings = DEFAULT_UNDO_SETTINGS
  }

  /**
   * Sets UNDO's settings, as AutoCAD 2023's console does (acc/k1–k16,
   * h1–h44): None and One drop every step kept so far, an open group's
   * too, and turn Auto off; All turns it back on and keeps what One kept.
   */
  configure(changes: Partial<UndoSettings>): void {
    const { control } = changes
    this.undoSettings = {
      ...this.undoSettings,
      ...changes,
      ...(control === undefined ? {} : { auto: control === "all" }),
    }
    if (control === "none" || control === "one") this.clear()
  }

  /**
   * Opens a group: what executes until {@link endGroup} becomes one undo step,
   * as AutoCAD's U undoes a whole command — "removing all 3 of the lines
   * created by it". A group already open stays the one. `stepsEmpty`: one
   * that executes nothing is still a step, which U names (move/p07, p233).
   */
  beginGroup(stepsEmpty = false): void {
    if (this.groupStart !== null) return
    this.groupStart = this.undoStack.length
    this.groupSteps = stepsEmpty
  }

  /**
   * Closes the open group, folding what it executed into one entry, which
   * regenerates if anything in it did. UNDO's marks and group starts, which
   * execute nothing, stay as they are. A ZOOM's (`zoom`) joins the ZOOM's
   * just below when `withLast`, U naming them both (`ZOOM 'ZOOM`), unless
   * UNDO Combine is No or Control One (acc/k15, h33).
   */
  endGroup(zoom?: ZoomStep): void {
    const start = this.groupStart
    const regenerated = this.regenerated
    this.groupStart = null
    this.regenerated = false
    if (start === null) return
    if (this.undoStack.length === start) {
      if (this.groupSteps && this.commandName !== null) {
        this.push({
          kind: "command",
          command: null,
          name: this.commandName,
          names: [],
          regenerates: regenerated,
        })
      }
      return
    }
    const steps = this.undoStack.splice(start)
    if (steps.some((step) => step.kind !== "command")) {
      this.undoStack.push(...steps)
      return
    }
    this.fold(steps, regenerated, zoom)
    this.keepOne()
  }

  private fold(
    steps: readonly Entry[],
    regenerated: boolean,
    zoom: ZoomStep | undefined
  ): void {
    const command =
      steps.length === 1
        ? steps[0].command
        : new GroupCommand(steps.flatMap((step) => step.command ?? []))
    const entry: Entry = {
      kind: "command",
      command,
      name: steps[0].name,
      names: [],
      regenerates: regenerated || steps.some((step) => step.regenerates),
    }
    if (!zoom || !(command instanceof ViewChangeCommand)) {
      this.undoStack.push(entry)
      return
    }
    const below = this.undoStack.at(-1)
    const { control, combine } = this.undoSettings
    if (
      zoom.withLast &&
      control === "all" &&
      combine &&
      below?.combines &&
      below.command instanceof ViewChangeCommand
    ) {
      this.undoStack[this.undoStack.length - 1] = {
        ...below,
        command: below.command.then(command),
        name: null,
        names: [...namesOf(below), ...namesOf(entry)],
        regenerates: below.regenerates || entry.regenerates,
      }
      return
    }
    this.undoStack.push({ ...entry, combines: true })
  }

  /** UNDO Mark: a place Back, U and UNDO's number stop at. */
  mark(): void {
    this.push({
      kind: "mark",
      command: null,
      name: null,
      names: [],
      regenerates: false,
    })
  }

  /**
   * UNDO BEgin: what runs until {@link closeUndoGroup} becomes one step, which
   * U names `GROUP CIRCLE LINE`. One already open is closed first, followed
   * by a step U takes back without a word (acc/k13, k14, h26, h30).
   */
  openUndoGroup(): void {
    if (this.undoGroup !== null) {
      this.closeUndoGroup()
      this.push({
        kind: "command",
        command: null,
        name: null,
        names: [],
        regenerates: false,
      })
    }
    const start: Entry = {
      kind: "begin",
      command: null,
      name: null,
      names: [],
      regenerates: false,
    }
    this.push(start)
    this.undoGroup = start
  }

  /** UNDO End: folds the open group into one step, its marks dropped. */
  closeUndoGroup(): void {
    const start = this.undoGroup
    if (start === null) return
    this.undoGroup = null
    const at = this.undoStack.indexOf(start)
    const inner = this.undoStack
      .splice(at + 1)
      .filter((entry) => entry.kind !== "mark")
    const commands = inner.flatMap((entry) => entry.command ?? [])
    this.undoStack[at] = {
      kind: "group",
      command: commands.length > 0 ? new GroupCommand(commands) : null,
      name: null,
      names: inner.flatMap(namesOf),
      regenerates: inner.some((entry) => entry.regenerates),
    }
    if (this.groupStart !== null) {
      this.groupStart = Math.min(this.groupStart, this.undoStack.length)
    }
    this.emit()
  }

  /** Whether a group UNDO BEgin opened is still open. */
  undoGroupOpen(): boolean {
    return this.undoGroup !== null
  }

  /** Whether the next undo meets the start of the group UNDO BEgin opened. */
  atUndoGroupStart(): boolean {
    return this.undoGroup !== null && this.undoStack.at(-1) === this.undoGroup
  }

  /** Whether an undo going back meets a mark before an open group's start. */
  hasMark(): boolean {
    for (let i = this.undoStack.length - 1; i >= 0; i--) {
      const entry = this.undoStack[i]
      if (entry === this.undoGroup) return false
      if (entry.kind === "mark") return true
    }
    return false
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

  /**
   * How many steps have been kept: where a tool's own Undo takes back to
   * ({@link undoTo}). Steps dropped at the capacity still count.
   */
  get depth(): number {
    return this.dropped + this.undoStack.length
  }

  /**
   * Takes back every step kept since the history stood at `depth`, newest
   * first, stopping at an open UNDO group's start: what each took back.
   */
  undoTo(depth: number): Step[] {
    const steps: Step[] = []
    while (this.depth > depth) {
      const step = this.undo()
      if (step === null) break
      steps.push(step)
    }
    return steps
  }

  canUndo(): boolean {
    return this.undoStack.length > 0 && !this.atUndoGroupStart()
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /** Takes back the last step; null with none, or at an open group's start. */
  undo(): Step | null {
    if (this.atUndoGroupStart()) return null
    const entry = this.undoStack.pop()
    if (!entry) return null
    if (this.groupStart !== null) {
      this.groupStart = Math.min(this.groupStart, this.undoStack.length)
    }
    this.replay(entry, true)
    this.redoStack.push(entry)
    this.emit()
    return this.step(entry)
  }

  redo(): Step | null {
    const entry = this.redoStack.pop()
    if (!entry) return null
    this.replay(entry, false)
    // A step done again stays its own, below the group of the command
    // redoing it (MREDO), which would otherwise fold it into one.
    if (this.groupStart === null) this.undoStack.push(entry)
    else this.undoStack.splice(this.groupStart++, 0, entry)
    this.emit()
    return this.step(entry)
  }

  private replay(entry: Entry, undone: boolean): void {
    const { command } = entry
    if (command === null) return
    this.replayingStep = { command, undone }
    try {
      if (undone) command.undo(this.document)
      else command.execute(this.document)
    } finally {
      this.replayingStep = null
    }
  }

  private step(entry: Entry): Step {
    const view = entry.combines ? entry.command : null
    return {
      // Only an open group's start is a `begin`, and no undo passes it.
      kind: entry.kind === "begin" ? "group" : entry.kind,
      name: entry.name,
      names: entry.names,
      regenerates:
        entry.regenerates &&
        (!(view instanceof ViewChangeCommand) || view.moves()),
      regeneratesRedone: entry.regenerates && view === null,
    }
  }

  /** What the undos took back can no longer be done again. */
  dropRedo(): void {
    if (this.redoStack.length === 0) return
    this.redoStack = []
    this.emit()
  }

  /** Drops all history, e.g. after loading a file (a fresh baseline). */
  clear(): void {
    if (this.groupStart !== null) this.groupStart = 0
    // A run begun before the baseline leaves no empty step after it.
    this.groupSteps = false
    this.undoGroup = null
    if (this.undoStack.length === 0 && this.redoStack.length === 0) return
    this.dropped += this.undoStack.length
    this.undoStack = []
    this.redoStack = []
    this.emit()
  }
}

/** The commands an entry names: a group's or joined ZOOMs', or its one. */
function namesOf(entry: Entry): readonly string[] {
  if (entry.names.length > 0) return entry.names
  return entry.name === null ? [] : [entry.name]
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
