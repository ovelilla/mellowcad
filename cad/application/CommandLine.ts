import { Observable } from "../shared/Observable"

/**
 * AutoCAD's command line: the keyboard-first way to run commands by name or
 * alias, with a scrollback of what happened and recall of what was typed.
 *
 * This controller owns only the *text* side of it (buffer, log, history). What
 * a command name means is decided by the runtime, which registers a
 * {@link CommandDefinition} per command.
 */
export type CommandLineEntryKind = "command" | "prompt" | "info" | "error"

/**
 * One line of the command-line scrollback: a command started (`command`), a
 * prompt with its answer (`prompt`), or what a command reported.
 */
export interface CommandLineEntry {
  readonly kind: CommandLineEntryKind
  readonly text: string
}

/** A command as it is listed: the name, what else can be typed, what it does. */
export interface CommandInfo {
  /** The global name, the same in every language, e.g. `"LINE"`. */
  readonly id: string
  /** The name in the command language, e.g. `"LINE"`. */
  readonly name: string
  /** Extra uppercase forms that run it, e.g. `["L"]`. */
  readonly aliases: readonly string[]
  /** One-line description shown in the autocomplete list. */
  readonly description: string
}

/**
 * A runnable command, registered under its global name. What it is called in
 * the command language, and what the autocomplete says it does, come from the
 * catalog.
 */
export interface CommandDefinition {
  readonly id: string
  /** The tool it starts, whose label then describes it. */
  readonly tool?: string
  /**
   * Typed with an apostrophe (`'ZOOM`) mid-command, it runs inside the
   * running one, which resumes once it is done: its {@link tool} asks its own
   * questions, or with none it runs in place.
   */
  readonly transparent?: boolean
  /**
   * A point modifier (FROM), no command: it answers a point prompt, and at
   * `Command:` it is an unknown command, as 2027's console says (probe
   * line/p211).
   */
  readonly modifier?: boolean
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
  /** Lines ever written, which {@link mark} counts by: the log drops its oldest. */
  private written = 0

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
    this.writeAt(this.mark(), kind, text)
  }

  /**
   * Rewrites the last line when it is of one of `kinds` and was written at
   * `since` or after, returning whether it was: an answer known only after
   * its prompt was written goes on its line.
   */
  amendLast(
    kinds: readonly CommandLineEntryKind[],
    since: number,
    amend: (text: string) => string
  ): boolean {
    const last = this.lines.at(-1)
    if (!last || !kinds.includes(last.kind) || this.written - 1 < since) {
      return false
    }
    this.lines = [
      ...this.lines.slice(0, -1),
      { kind: last.kind, text: amend(last.text) },
    ]
    this.emit()
    return true
  }

  /**
   * Rewrites the line that was the last one at `mark`, ahead of the lines
   * written since: a prompt asked on the line a pick left bare.
   */
  amendBefore(mark: number, amend: (text: string) => string): void {
    const at = this.lines.length - (this.written - mark) - 1
    if (at < 0) return
    this.lines = this.lines.map((line, index) =>
      index === at ? { kind: line.kind, text: amend(line.text) } : line
    )
    this.emit()
  }

  /** A place in the log, for {@link writeAt}. */
  mark(): number {
    return this.written
  }

  /**
   * Writes a line where the log stood at `mark`, ahead of the lines written
   * since: a prompt's answer goes before what answering it reported.
   */
  writeAt(mark: number, kind: CommandLineEntryKind, text: string): void {
    const at = Math.max(0, this.lines.length - (this.written - mark))
    this.lines = [
      ...this.lines.slice(0, at),
      { kind, text },
      ...this.lines.slice(at),
    ].slice(-MAX_LINES)
    this.written++
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
 * CLIPROMPTLINES' default: how many temporary prompt lines of a command show
 * above the one-line command window.
 */
export const CLIPROMPTLINES = 3

/**
 * AutoCAD's temporary prompt history: the last lines of the most recent
 * command — its echo, its answered prompts and what it reported — at most
 * {@link CLIPROMPTLINES}.
 */
export function temporaryPromptLines(
  lines: ReadonlyArray<CommandLineEntry>
): ReadonlyArray<CommandLineEntry> {
  let start = lines.length
  while (start > 0 && lines.length - start < CLIPROMPTLINES) {
    start--
    if (lines[start].kind === "command") break
  }
  return lines.slice(start)
}

/**
 * The command each tool runs, by its global name. What it is typed as — AutoCAD's
 * names and aliases in the command language, `L` for LINE, `AR` for ARRAYRECT —
 * is in the catalog (`commands.names`), so a language can rename it and keep
 * its keywords.
 *
 * Variants that AutoCAD exposes as ribbon options rather than commands (the
 * circle/arc construction modes) get descriptive names of our own so every tool
 * is reachable by typing. WHY CIRCLED, CIRCLE2P and CIRCLE3P stay, though
 * AutoCAD knows none of them (probe circle/p21) and their rail entries run
 * CIRCLE as the ribbon's macros do (`CircleTool.ribbonMacro`): removing a
 * name is a major version, and typing one runs the same macro. The clipboard
 * copies have no alias in Autodesk's shortcut guide, and PASTECLIP is
 * registered separately — it is not a tool.
 */
export const TOOL_COMMANDS: Readonly<Record<string, string>> = {
  line: "LINE",
  polyline: "PLINE",
  circle: "CIRCLE",
  circlediameter: "CIRCLED",
  circle2p: "CIRCLE2P",
  circle3p: "CIRCLE3P",
  arc: "ARC",
  arcsce: "ARCSCE",
  arccse: "ARCCSE",
  ellipse: "ELLIPSE",
  ellipsecenter: "ELLIPSEC",
  ellipsearc: "ELLIPSEARC",
  spline: "SPLINE",
  rectangle: "RECTANG",
  polygon: "POLYGON",
  hatch: "HATCH",
  block: "BLOCK",
  insert: "INSERT",
  attedit: "ATTEDIT",
  attdef: "ATTDEF",
  attdisp: "ATTDISP",
  text: "TEXT",
  mtext: "MTEXT",
  textedit: "TEXTEDIT",
  dimlinear: "DIMLINEAR",
  dimaligned: "DIMALIGNED",
  dimradius: "DIMRADIUS",
  dimdiameter: "DIMDIAMETER",
  dimangular: "DIMANGULAR",
  dimbaseline: "DIMBASELINE",
  dimcontinue: "DIMCONTINUE",
  dimspace: "DIMSPACE",
  offset: "OFFSET",
  move: "MOVE",
  copy: "COPY",
  stretch: "STRETCH",
  rotate: "ROTATE",
  scale: "SCALE",
  mirror: "MIRROR",
  array: "ARRAYRECT",
  arraypolar: "ARRAYPOLAR",
  arraypath: "ARRAYPATH",
  trim: "TRIM",
  extend: "EXTEND",
  fillet: "FILLET",
  chamfer: "CHAMFER",
  erase: "ERASE",
  explode: "EXPLODE",
  join: "JOIN",
  break: "BREAK",
  breakatpoint: "BREAKATPOINT",
  matchprop: "MATCHPROP",
  copyclip: "COPYCLIP",
  cutclip: "CUTCLIP",
  copybase: "COPYBASE",
  measure: "DIST",
  measurearea: "AREA",
  id: "ID",
  zoom: "ZOOM",
  pan: "PAN",
  dashpan: "-PAN",
  ucs: "UCS",
  ucsicon: "UCSICON",
  plan: "PLAN",
  elev: "ELEV",
  vpoint: "VPOINT",
  view: "VIEW",
  orbit: "3DORBIT",
  navvcube: "NAVVCUBE",
  fill: "FILL",
  ltscale: "LTSCALE",
  auprec: "AUPREC",
  undo: "UNDO",
  mredo: "MREDO",
  osnap: "-OSNAP",
  snap: "SNAP",
  color: "COLOR",
  linetype: "LINETYPE",
  lweight: "LWEIGHT",
}

/** The shortest way to type a command, e.g. `"L"` — shown in tooltips. */
export function shortestName(names: readonly string[]): string | undefined {
  if (names.length === 0) return undefined
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
  commands: readonly Pick<CommandInfo, "name" | "aliases" | "description">[],
  text: string,
  limit = 8
): CommandSuggestion[] {
  const prefix = text.trim().toUpperCase()
  if (prefix === "") return []

  const rank = (command: Pick<CommandInfo, "name" | "aliases">): number => {
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
