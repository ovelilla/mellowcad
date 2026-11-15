import { runInNewContext } from "node:vm"

import { CadDriver, commandCatalog } from "@mellowcad/engine"

import {
  DIALOG_COMMANDS,
  MAX_SCRIPT_CHARACTERS,
  MAX_SCRIPT_LINES,
  MAX_SCRIPT_OBJECTS,
  SCRIPT_VIEW,
  commandOf,
  fitsScriptLimits,
  runScript,
  type ScriptStop,
  type ScriptTarget,
} from "@/lib/command-script"
import { colorName, describeGeometry, extentsText } from "@/lib/mcp/describe"
import { runHref } from "@/lib/script-link"
import { EDITOR_PATH } from "@/lib/site"

/**
 * The MCP server's one tool (`docs/next-mcp.md`, §5): a script of AutoCAD
 * commands in, the command window, the objects drawn and a link that opens
 * them in the editor out. Stateless: every call draws on an empty drawing,
 * so nothing is kept, and nothing of the host's platform is known here.
 */

export const DRAW_TOOL_NAME = "draw"
export const DRAW_TOOL_TITLE = "Draw with AutoCAD commands"

/**
 * How long one call may type for, checked between answers, past which it
 * stops with what it drew. A bench drawing takes about 25 ms; a gear of
 * three solids and their UNION, 0.55 s on a laptop and 1.3–1.5 s on
 * Vercel's function, which stopped it once at 1.5 s.
 */
export const MAX_DRAW_MILLISECONDS = 3_000

/**
 * How long one call may run, its answer included, past which it is cut in
 * the middle of whatever it is doing: one answer can run long (a 1000 ×
 * 1000 ARRAYRECT made a million objects and 900 MB in 3.3 s), and no check
 * between answers stops it. Inside the route's `maxDuration` (5 s); what
 * one call can allocate before the cut stays under the function's 2 GB,
 * Vercel's CPU running some three times slower than a laptop's.
 */
export const MAX_CALL_MILLISECONDS = 4_000

/** The objects listed one by one; past that, a count. */
const MAX_LISTED = 200
/** The transcript's last lines kept; the earlier ones are counted. */
const MAX_TRANSCRIPT_LINES = 400

/**
 * What the description leaves out: commands that reach a file, the
 * clipboard or the screen, which a call that keeps nothing cannot use.
 */
const NOT_OFFERED: ReadonlySet<string> = new Set([
  "OPEN",
  "DXFIN",
  "QSAVE",
  "SAVE",
  "SAVEAS",
  "DXFOUT",
  "NEW",
  "QNEW",
  "COPYCLIP",
  "CUTCLIP",
  "COPYBASE",
  "PASTECLIP",
  "CLEANSCREENON",
  "CLEANSCREENOFF",
  "LAYERCLOSE",
  "PROPERTIESCLOSE",
  "NAVVCUBE",
  "3DORBIT",
  "REGEN",
  "REGENALL",
  "UCSICON",
  "VSCURRENT",
])

export interface DrawAnswer {
  readonly text: string
  /** The script stopped, or could not run: the agent has something to fix. */
  readonly isError: boolean
  readonly objects: number
}

export interface DrawOptions {
  /** The clock the deadline between answers reads, in milliseconds. */
  readonly now?: () => number
  /** When the call is cut (`MAX_CALL_MILLISECONDS`). */
  readonly cutAfter?: number
}

/**
 * Types `script` on an empty drawing and answers with what the command
 * window wrote, what was drawn and the editor's link, from `origin`.
 */
export function draw(
  script: string,
  origin: string,
  { now, cutAfter = MAX_CALL_MILLISECONDS }: DrawOptions = {}
): DrawAnswer {
  // WHY off the drawing: the editor types a link's script with no pointer
  // yet, and a length typed alone runs towards the cursor.
  const cad = new CadDriver(SCRIPT_VIEW).leave()
  try {
    // WHY a context: its timeout ends whatever JavaScript is running when it
    // fires, the engine's own in the middle of an answer, and the process
    // goes on. A worker could be killed too, but would load the engine per
    // call, ten times a call's cost.
    return runInNewContext(
      "run()",
      { run: () => drawOn(cad, script, origin, now) },
      { timeout: cutAfter }
    ) as DrawAnswer
  } catch (error) {
    if ((error as { code?: string }).code !== "ERR_SCRIPT_EXECUTION_TIMEOUT") {
      throw error
    }
    // The drawing is left half-way through an answer: nothing of it is read.
    return {
      text:
        `CUT: one call runs for ${MAX_CALL_MILLISECONDS / 1000} seconds at most, ` +
        "and this script was cut in the middle of an answer that ran long. " +
        "Nothing of it is returned. Draw less in one call (fewer or smaller arrays, fewer objects).",
      isError: true,
      objects: 0,
    }
  } finally {
    cad.dispose()
  }
}

/** `draw` on a driver of the caller's, left as the script left it. */
export function drawOn(
  cad: CadDriver,
  script: string,
  origin: string,
  now: () => number = () => performance.now()
): DrawAnswer {
  if (!fitsScriptLimits(script)) {
    return {
      text:
        `The script is longer than one call takes: ${MAX_SCRIPT_CHARACTERS} ` +
        `characters and ${MAX_SCRIPT_LINES} lines at most. Nothing was drawn.`,
      isError: true,
      objects: 0,
    }
  }
  const { stopped, cancelled } = runScript(target(cad), script, {
    deadline: now() + MAX_DRAW_MILLISECONDS,
    now,
  })
  const objects = cad.entityCount
  const parts = [transcript(cad.commandLog())]
  if (stopped !== null) parts.push(stopText(stopped))
  if (cancelled !== null) {
    parts.push(
      `A command was still asking "${cancelled}" when the script ended, ` +
        "and was cancelled; what it had drawn stays."
    )
  }
  if (objects === 0) {
    parts.push(
      stopped !== null
        ? "Nothing is drawn."
        : "Nothing is drawn. This server keeps nothing between calls: each " +
            "call starts from an empty drawing, so a call must send the " +
            "whole script of the drawing it wants."
    )
  } else {
    parts.push(listing(cad), `Drawing: ${extentsText(objects, cad.extents())}`)
    // WHY none after the time ran out: the editor has no deadline, and would
    // type the lines this call did not.
    parts.push(
      stopped?.reason === "time"
        ? "No link: the editor would type the lines this call did not run."
        : `Open it in MellowCAD: ${origin}${runHref(EDITOR_PATH, script)}`
    )
  }
  return { text: parts.join("\n\n"), isError: stopped !== null, objects }
}

function target(cad: CadDriver): ScriptTarget {
  return {
    keyIn: (line) => cad.keyIn(line),
    getState: () => cad.state(),
    zoomToFit: () => cad.zoomToFit(),
    cancelCommand: () => cad.cancelCommand(),
    withViewSize: (width, height, work) =>
      cad.withViewSize(width, height, work),
  }
}

function transcript(lines: readonly string[]): string {
  if (lines.length <= MAX_TRANSCRIPT_LINES) return lines.join("\n")
  const left = lines.length - MAX_TRANSCRIPT_LINES
  return [
    `(${left} earlier lines of the command window left out)`,
    ...lines.slice(left),
  ].join("\n")
}

export function stopText({
  reason,
  line,
  typed,
  linesNotRun,
}: ScriptStop): string {
  const notRun = `${linesNotRun} line(s) after it were not run.`
  switch (reason) {
    case "refused":
      return `STOPPED at script line ${line}: "${typed}" was refused (see the last lines above). ${notRun}`
    case "dialog": {
      const instead = DIALOG_COMMANDS[commandOf(typed)]
      return (
        `STOPPED at script line ${line}: ${typed} opens a dialog box, which a script cannot answer` +
        (instead
          ? `; type ${instead} instead. `
          : `, and has no command-line form here. `) +
        notRun
      )
    }
    case "time":
      return `STOPPED at script line ${line}, before "${typed}": one call types for ${MAX_DRAW_MILLISECONDS / 1000} seconds at most. ${notRun}`
    case "objects":
      return `STOPPED at script line ${line}, before "${typed}": the drawing holds more than ${MAX_SCRIPT_OBJECTS} objects, the most one call draws. ${notRun}`
  }
}

function listing(cad: CadDriver): string {
  const { layers } = cad.state()
  const names = new Map(layers.map((layer) => [layer.id, layer.name]))
  const entities = cad.entities()
  const lines = entities
    .slice(0, MAX_LISTED)
    .map(
      (entity) =>
        `${describeGeometry(entity)} layer=${names.get(entity.layerId) ?? entity.layerId}`
    )
  if (entities.length > MAX_LISTED) {
    lines.push(`... and ${entities.length - MAX_LISTED} more.`)
  }
  const current = cad.state().currentLayerId
  const layerList = layers
    .map(
      (layer) =>
        `${layer.name} (${colorName(layer.color)}${layer.id === current ? ", current" : ""})`
    )
    .join(", ")
  return `Objects:\n${lines.join("\n")}\n\nLayers: ${layerList}`
}

/**
 * What the tool tells the agent, the commands named from the engine's own
 * catalog. It says twice, in two ways, that a call keeps nothing: Haiku
 * "checked" a drawing with a second call that, by design, started empty
 * (`docs/next-mcp.md`, §4.2).
 */
export function drawDescription(): string {
  const commands = commandCatalog()
    .filter(
      (c) =>
        !NOT_OFFERED.has(c.id) &&
        !Object.hasOwn(DIALOG_COMMANDS, c.id) &&
        !c.name.includes(" ")
    )
    .map((c) => {
      const alias = c.aliases.reduce<string | undefined>(
        (shortest, a) =>
          shortest === undefined || a.length < shortest.length ? a : shortest,
        undefined
      )
      return alias === undefined ? c.name : `${c.name} (${alias})`
    })
  const dialogs = Object.entries(DIALOG_COMMANDS)
  const replaced = dialogs.filter(([, instead]) => instead !== null)
  const none = dialogs.filter(([, instead]) => instead === null)
  return `Draws a 2D drawing by typing a script at a CAD command line that works like AutoCAD's: the same command names and aliases, the same prompts in the same order, the same option keywords and defaults. Returns the command window's transcript, every object drawn with its exact geometry, and a link that opens the drawing in MellowCAD, a free CAD editor in the browser.

Every call starts from an empty drawing: this server keeps nothing between calls. To change or correct a drawing, send its whole script again, corrected. There is nothing to inspect afterwards; everything the drawing holds comes back in the answer.

The script: one answer per line, an empty line being Enter. As in an AutoCAD script file, a space also ends an answer, except where a prompt takes text (TEXT, MTEXT). Points are typed: absolute x,y, relative @dx,dy, polar @distance<angle (degrees, counter-clockwise from +X). An object snap (END, MID, CEN, INT, QUA, TAN, PER, NEA) is an answer of its own before the point it applies to. Objects are picked by typing a point on them, away from crossings and shared corners, or with the options at "Select objects:": L (last), ALL, P (previous), W or C and two corners (window, crossing), F (fence). End each command: the empty line that ends LINE or a selection. Layers: -LAYER (Make, New, Color, Set), and CLAYER to switch.

The script stops at the first answer a prompt refuses and says which; a command still asking when it ends is cancelled. A dialog box cannot be answered from a script, so ${replaced.map(([command]) => command).join(", ")} stop it: type ${replaced.map(([, instead]) => instead).join(", ")} instead. ${none.map(([command]) => command).join(", ")} have no command-line form here. One call takes ${MAX_SCRIPT_CHARACTERS} characters, ${MAX_SCRIPT_LINES} lines and ${MAX_SCRIPT_OBJECTS} objects at most.

Commands: ${commands.join(", ")}.`
}
