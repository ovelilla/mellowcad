import { commandCatalog } from "@mellowcad/engine"
import type { EngineState, KeyedInLine } from "@mellowcad/engine"

/**
 * A script of AutoCAD commands typed at the engine's command line, as an
 * agent sends it to the MCP server (`docs/next-mcp.md`) and as `/draw#run=`
 * types it again in the editor: the same typing in both, so the link opens
 * the drawing the agent was answered with.
 *
 * The engine's `keyIn` is AutoCAD's command window. What is added here is
 * the script's, never the engine's: an answer ends at a space, as in a
 * script file; `0, 0` is one point; a blank line at `Command:` is skipped,
 * where AutoCAD would repeat the last command; the run stops at the first
 * answer refused, and at a command that opens a dialog box here; the
 * drawing is framed between commands.
 */

/** The most a script holds: what one MCP call takes, and so what a link carries. */
export const MAX_SCRIPT_CHARACTERS = 10_000
export const MAX_SCRIPT_LINES = 1_000
/**
 * The objects a script may leave before it is stopped, unless the run says
 * otherwise: the bench's drawings hold tens. The link stops where the
 * server stopped.
 */
export const MAX_SCRIPT_OBJECTS = 5_000

/**
 * The view a script is typed in, in pixels, whatever the screen: a pick
 * typed at `Select objects:` takes what is within a few pixels of it, so on
 * a phone's canvas a wall 100 thick in a plan 8000 wide is too thin to pick
 * apart from its neighbour, and the link would draw another drawing.
 */
export const SCRIPT_VIEW = { width: 2000, height: 1500 } as const

/**
 * What runs a script: `CadEngine` in the editor, a `CadDriver` headless.
 * Neither has a pointer on the drawing (`CadDriver.leave()`): a length typed
 * alone at a point prompt runs towards the cursor, and the editor types a
 * link's script before any pointer reached its canvas.
 */
export interface ScriptTarget {
  keyIn(line: string): KeyedInLine
  getState(): EngineState
  zoomToFit(): void
  cancelCommand(): void
  withViewSize<T>(width: number, height: number, work: () => T): T
}

/**
 * Why a script stopped: an answer the engine refused, a command that opens
 * a dialog box (`DIALOG_COMMANDS`), or one of the run's limits reached.
 */
export type ScriptStopReason = "refused" | "dialog" | "time" | "objects"

/** Where a script stopped, and what it still held. */
export interface ScriptStop {
  readonly reason: ScriptStopReason
  /** 1-based line of the script. */
  readonly line: number
  /** The answer refused, the dialog's command, or the answer left untyped. */
  readonly typed: string
  /** The lines after `line`, none of them typed. */
  readonly linesNotRun: number
}

/**
 * What one run may take beyond its size, checked before each answer: a
 * deadline (in `now`'s milliseconds; none by default) and a count of
 * objects (`MAX_SCRIPT_OBJECTS` by default). An answer already typed is
 * never interrupted.
 */
export interface ScriptLimits {
  readonly deadline?: number
  readonly maxObjects?: number
  readonly now?: () => number
}

/**
 * The commands that open a dialog box or a palette here, which a script
 * cannot answer, and the form a script types instead (null: none here).
 * Typed on, a script's next lines would fall on `Command:`: the bench's
 * agents typed `LAYER` and then the layer's name (`docs/next-mcp.md`, §4.3).
 * `lib/command-script.test.ts` finds every command that opens one.
 */
export const DIALOG_COMMANDS: Readonly<Record<string, string | null>> = {
  LAYER: "-LAYER",
  INSERT: "-INSERT",
  BLOCKSPALETTE: "-INSERT",
  PROPERTIES: "CHPROP",
  DIMSTYLE: "-DIMSTYLE",
  STYLE: null,
  UNITS: null,
  PTYPE: null,
}

export interface ScriptRun {
  readonly stopped: ScriptStop | null
  /** The prompt a command was still asking when the script ended, then cancelled. */
  readonly cancelled: string | null
}

/** The script's lines, its line breaks however written. */
export function scriptLines(script: string): string[] {
  return script.replace(/\r\n?/g, "\n").split("\n")
}

/** Whether a script is within what one run takes. */
export function fitsScriptLimits(script: string): boolean {
  return (
    script.length <= MAX_SCRIPT_CHARACTERS &&
    scriptLines(script).length <= MAX_SCRIPT_LINES
  )
}

/**
 * Types `script` a line at a time from `Command:` (a command left open is
 * cancelled first, as a menu macro's `^C^C` does), stops at the first line
 * the engine refuses or that opens a dialog box, or once `limits` are
 * reached, and cancels what is still asking at its end: a derailed script
 * would otherwise answer the wrong prompts with the lines left. The drawing
 * is framed at the end.
 */
export function runScript(
  target: ScriptTarget,
  script: string,
  limits: ScriptLimits = {}
): ScriptRun {
  const run = target.withViewSize(SCRIPT_VIEW.width, SCRIPT_VIEW.height, () => {
    cancel(target)
    const lines = scriptLines(script)
    let stopped: ScriptStop | null = null
    target.zoomToFit()
    for (const [index, line] of lines.entries()) {
      const stop = typeLine(target, line, limits)
      if (stop !== null) {
        stopped = {
          ...stop,
          line: index + 1,
          linesNotRun: lines.length - index - 1,
        }
        break
      }
      // WHY: a typed pick takes what is within a few pixels, so the view
      // decides how near "on the object" is. Framing the drawing between
      // commands keeps that tolerance a constant fraction of its size.
      if (idle(target)) target.zoomToFit()
    }
    return { stopped, cancelled: cancel(target) }
  })
  target.zoomToFit()
  return run
}

/**
 * Types one line of the script, its words one by one: as AutoCAD's script
 * files end an answer at a space, except where the prompt takes text with
 * spaces. Where it stopped, or null.
 */
function typeLine(
  target: ScriptTarget,
  line: string,
  limits: ScriptLimits
): Pick<ScriptStop, "reason" | "typed"> | null {
  let rest = line.trim()
  do {
    const state = target.getState()
    const takesSpaces =
      state.commandLine.takesSpaces ||
      (state.dynamicInput?.fields ?? []).some(
        (field) => field.kind === "text" || field.kind === "paragraphs"
      )
    let answer = rest
    if (takesSpaces) {
      rest = ""
    } else {
      // `0, 0` is one point to whoever writes it; a space would end it.
      rest = rest.replace(/\s*,\s*/g, ",")
      const space = rest.search(/\s/)
      answer = space < 0 ? rest : rest.slice(0, space)
      rest = space < 0 ? "" : rest.slice(space).trimStart()
    }
    // WHY: Enter at `Command:` repeats the last command, which a script's
    // stray blank line never means.
    if (answer === "" && idle(target)) continue
    const limit = limitReached(target, limits)
    if (limit !== null) return { reason: limit, typed: answer }
    if (idle(target) && Object.hasOwn(DIALOG_COMMANDS, commandOf(answer))) {
      return { reason: "dialog", typed: answer }
    }
    const { refused } = target.keyIn(answer)
    if (refused !== null) return { reason: "refused", typed: refused.answer }
  } while (rest !== "")
  return null
}

function limitReached(
  target: ScriptTarget,
  {
    deadline,
    maxObjects = MAX_SCRIPT_OBJECTS,
    now = () => performance.now(),
  }: ScriptLimits
): "time" | "objects" | null {
  if (deadline !== undefined && now() > deadline) return "time"
  if (target.getState().entityCount > maxObjects) return "objects"
  return null
}

let commandIds: ReadonlyMap<string, string> | undefined

/**
 * The global name of the command `typed` starts at `Command:` in English
 * (`LA` is `LAYER`), or `""` for none.
 */
export function commandOf(typed: string): string {
  commandIds ??= new Map(
    commandCatalog().flatMap((command) =>
      [command.name, ...command.aliases].map((name) => [name, command.id])
    )
  )
  // `_` asks for the English name and `.` for the built-in one, both it
  // here; `'` asks for it transparently, which at `Command:` runs it.
  return commandIds.get(typed.toUpperCase().replace(/^['_.]+/, "")) ?? ""
}

function idle(target: ScriptTarget): boolean {
  return target.getState().activeToolId === "select"
}

/** `^C^C` to `Command:`; the prompt that was asking, if one was. */
function cancel(target: ScriptTarget): string | null {
  if (idle(target)) return null
  const { prompt } = target.getState().commandLine
  target.cancelCommand()
  return prompt
}
