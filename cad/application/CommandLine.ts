import { Observable } from "../shared/Observable"

/**
 * AutoCAD's command line: the keyboard-first way to run commands by name or
 * alias, with a scrollback of what happened and recall of what was typed.
 *
 * This controller owns only the *text* side of it (buffer, log, history). What
 * a command name means is decided by the runtime, which registers a
 * {@link CommandDefinition} per command.
 */
export type CommandLineEntryKind = "command" | "info" | "error"

/** One line of the command-line scrollback. */
export interface CommandLineEntry {
  readonly kind: CommandLineEntryKind
  readonly text: string
}

/** A runnable command: a canonical name, its typed aliases and its action. */
export interface CommandDefinition {
  /** Canonical uppercase name, e.g. `"LINE"`. */
  readonly name: string
  /** Extra uppercase forms that run it, e.g. `["L"]`. */
  readonly aliases: readonly string[]
  /** One-line description shown in the autocomplete list. */
  readonly description: string
  readonly run: () => void
}

/** A command offered by autocomplete while typing. */
export interface CommandSuggestion {
  readonly name: string
  readonly description: string
}

const MAX_LINES = 200
const MAX_HISTORY = 50

export class CommandLineController extends Observable {
  private buffer = ""
  private lines: CommandLineEntry[] = []
  private history: string[] = []
  /** Position within {@link history} while walking it, or null when editing. */
  private recallIndex: number | null = null

  getBuffer(): string {
    return this.buffer
  }

  setBuffer(text: string): void {
    if (text === this.buffer) return
    this.buffer = text
    this.recallIndex = null
    this.emit()
  }

  appendChar(char: string): void {
    this.setBuffer(this.buffer + char)
  }

  backspace(): void {
    if (this.buffer === "") return
    this.setBuffer(this.buffer.slice(0, -1))
  }

  getLines(): ReadonlyArray<CommandLineEntry> {
    return this.lines
  }

  write(kind: CommandLineEntryKind, text: string): void {
    this.lines = [...this.lines, { kind, text }].slice(-MAX_LINES)
    this.emit()
  }

  /** Records a successfully run command, so Enter can repeat it. */
  pushHistory(name: string): void {
    this.history = [
      ...this.history.filter((entry) => entry !== name),
      name,
    ].slice(-MAX_HISTORY)
    this.recallIndex = null
  }

  /** The command Enter repeats at the neutral prompt. */
  getLastCommand(): string | null {
    return this.history.length > 0
      ? this.history[this.history.length - 1]
      : null
  }

  /**
   * Walks previously run commands into the buffer: `-1` steps to older entries
   * (Arrow Up), `1` back towards the newest. Stepping past the newest clears
   * the buffer, so you can always get back to an empty prompt.
   */
  recall(direction: -1 | 1): void {
    if (this.history.length === 0) return
    const newest = this.history.length - 1
    const index =
      this.recallIndex === null
        ? direction === -1
          ? newest
          : newest + 1
        : this.recallIndex + (direction === -1 ? -1 : 1)

    if (index > newest) {
      this.recallIndex = null
      this.buffer = ""
    } else {
      this.recallIndex = Math.max(0, index)
      this.buffer = this.history[this.recallIndex]
    }
    this.emit()
  }
}

/**
 * Command names and aliases per tool id, following AutoCAD's own vocabulary.
 * Multi-character aliases are what make the classic pairs possible: `A` is Arc
 * while `AR` is the rectangular array, `C` is Circle while `CO` is Copy.
 *
 * Variants that AutoCAD exposes as ribbon options rather than commands (the
 * circle/arc construction modes) get descriptive names of our own so every tool
 * is reachable by typing.
 */
export const TOOL_COMMANDS: Readonly<Record<string, readonly string[]>> = {
  line: ["LINE", "L"],
  polyline: ["PLINE", "PL"],
  circle: ["CIRCLE", "C"],
  circlediameter: ["CIRCLED"],
  circle2p: ["CIRCLE2P"],
  circle3p: ["CIRCLE3P"],
  arc: ["ARC", "A"],
  arcsce: ["ARCSCE"],
  arccse: ["ARCCSE"],
  rectangle: ["RECTANG", "REC"],
  polygon: ["POLYGON", "POL"],
  hatch: ["HATCH", "H", "BH"],
  block: ["BLOCK", "B"],
  insert: ["INSERT", "I"],
  text: ["TEXT", "DT", "DTEXT"],
  textedit: ["TEXTEDIT", "DDEDIT", "ED"],
  dimlinear: ["DIMLINEAR", "DIMLIN", "DLI"],
  dimaligned: ["DIMALIGNED", "DIMALI", "DAL"],
  dimradius: ["DIMRADIUS", "DIMRAD", "DRA"],
  dimdiameter: ["DIMDIAMETER", "DIMDIA", "DDI"],
  dimangular: ["DIMANGULAR", "DIMANG", "DAN"],
  dimbaseline: ["DIMBASELINE", "DBA"],
  dimcontinue: ["DIMCONTINUE", "DCO"],
  dimspace: ["DIMSPACE"],
  offset: ["OFFSET", "O"],
  move: ["MOVE", "M"],
  copy: ["COPY", "CO", "CP"],
  stretch: ["STRETCH", "S"],
  rotate: ["ROTATE", "RO"],
  scale: ["SCALE", "SC"],
  mirror: ["MIRROR", "MI"],
  array: ["ARRAYRECT", "AR", "ARRAY"],
  arraypolar: ["ARRAYPOLAR", "ARPOLAR"],
  arraypath: ["ARRAYPATH", "ARPATH"],
  trim: ["TRIM", "TR"],
  extend: ["EXTEND", "EX"],
  fillet: ["FILLET", "F"],
  chamfer: ["CHAMFER", "CHA"],
  explode: ["EXPLODE", "X"],
  join: ["JOIN", "J"],
  break: ["BREAK", "BR"],
  breakatpoint: ["BREAKATPOINT"],
  matchprop: ["MATCHPROP", "MA", "PAINTER"],
  measure: ["DIST", "DI"],
  measurearea: ["AREA", "AA"],
  zoom: ["ZOOM", "Z"],
  pan: ["PAN", "P"],
}

/** The shortest way to type a tool's command, e.g. `"L"` — shown in tooltips. */
export function toolCommandAlias(toolId: string): string | undefined {
  const names = TOOL_COMMANDS[toolId]
  if (!names || names.length === 0) return undefined
  return names.reduce((shortest, name) =>
    name.length < shortest.length ? name : shortest
  )
}

/**
 * Autocomplete: commands whose name or any alias starts with what has been
 * typed, best match first (an exact alias beats a name prefix), like AutoCAD's
 * suggestion list.
 */
export function matchCommands(
  commands: readonly CommandDefinition[],
  text: string,
  limit = 8
): CommandSuggestion[] {
  const prefix = text.trim().toUpperCase()
  if (prefix === "") return []

  const rank = (command: CommandDefinition): number => {
    if (command.name === prefix || command.aliases.includes(prefix)) return 0
    if (command.aliases.some((alias) => alias.startsWith(prefix))) return 1
    return 2
  }

  return commands
    .filter(
      (command) =>
        command.name.startsWith(prefix) ||
        command.aliases.some((alias) => alias.startsWith(prefix))
    )
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((command) => ({
      name: command.name,
      description: command.description,
    }))
}
