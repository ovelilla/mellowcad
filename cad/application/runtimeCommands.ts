import type { CadRuntime } from "./CadRuntime"
import { CommandDefinition, TOOL_COMMANDS } from "./CommandLine"
import type { CommandOptionUi, StylesPanelTab } from "./EngineState"
import { promptString, type EngineText, type PromptSegment } from "./EngineText"
import { type Keyword, offerKeywords } from "../i18n/keywords"
import { type CommandOption, Tool, type ToolQuestion } from "./tools/Tool"
import type { PromptId } from "../locales/types"
import { formatAngle, formatLength } from "../domain/units"
import type { DocumentSettings } from "../domain/units"
import { MTextTool } from "./tools/MTextTool"
import { AttEditTool } from "./tools/AttEditTool"

/**
 * The commands AutoCAD runs transparently that are built here. WHY only these:
 * the others it does ('DIST, 'ID, 'LTSCALE, '-OSNAP…) are not made
 * transparent yet (docs/autocad-coverage.md).
 */
const TRANSPARENT_COMMANDS: ReadonlySet<string> = new Set([
  "ZOOM",
  "PAN",
  "AUPREC",
])

/**
 * Builds the command table: one command per tool (using AutoCAD's names and
 * aliases) plus the editing/view commands that are not tools.
 *
 * Every command is a call into the runtime's own public API — that is what a
 * command line is — so the runtime is passed whole; `startTool` and `register`
 * are the two private entry points it cannot reach.
 */
export function registerCommands(
  runtime: CadRuntime,
  startTool: (id: string) => void,
  register: (definition: CommandDefinition) => void
): void {
  const tools = new Set(runtime.listTools().map((tool) => tool.id))

  for (const [toolId, command] of Object.entries(TOOL_COMMANDS)) {
    if (!tools.has(toolId)) continue
    register({
      id: command,
      tool: toolId,
      transparent: TRANSPARENT_COMMANDS.has(command),
      run: () => startTool(toolId),
    })
  }

  const say = (text: string) => runtime.commandLine.write("info", text)

  register({ id: "UNDO", run: () => runtime.undo() })
  // -MTEXT is MTEXT with the text typed at the command line, so it runs the
  // same tool and switches its entry.
  register({
    id: "-MTEXT",
    tool: "mtext",
    run: () => {
      startTool("mtext")
      const tool = runtime.listTools().find((t) => t.id === "mtext")
      if (tool instanceof MTextTool) tool.useCommandLine()
    },
  })
  register({ id: "REDO", run: () => runtime.redo() })
  // AutoCAD's ATTDEF opens a dialog; here it asks at the command line, so
  // -ATTDEF is the same tool under its own name.
  register({ id: "-ATTDEF", tool: "attdef", run: () => startTool("attdef") })
  // COLOR, LINETYPE and LWEIGHT open dialogs in AutoCAD (Select Color, the
  // Linetype Manager, Lineweight Settings); here they ask at the command line,
  // so their dash forms are the same tools under their own names.
  register({ id: "-COLOR", tool: "color", run: () => startTool("color") })
  register({
    id: "-LINETYPE",
    tool: "linetype",
    run: () => startTool("linetype"),
  })
  register({ id: "-LWEIGHT", tool: "lweight", run: () => startTool("lweight") })
  // VPOINT and VIEW open dialogs in AutoCAD; here they ask at the command
  // line, so their dash forms are the same tools under their own names.
  register({ id: "-VPOINT", tool: "vpoint", run: () => startTool("vpoint") })
  register({ id: "-VIEW", tool: "view", run: () => startTool("view") })
  // EATTEDIT and ATTEDIT differ only in their dialog, so one tool runs both.
  register({
    id: "EATTEDIT",
    tool: "attedit",
    run: () => {
      startTool("attedit")
      const tool = runtime.listTools().find((t) => t.id === "attedit")
      if (tool instanceof AttEditTool) tool.useEnhancedEditor()
    },
  })
  register({
    id: "SNAP",
    run: () => {
      runtime.toggleSnapMode()
      say(
        runtime.text.message("snapMode", {
          state: runtime.snapMode.isActive() ? "on" : "off",
        })
      )
    },
  })
  register({
    id: "FROM",
    run: () => {
      if (!runtime.startFrom()) {
        runtime.commandLine.write(
          "error",
          runtime.text.message("fromNeedsPoint")
        )
      }
    },
  })
  // With no templates here, NEW's Select Template dialog has nothing to offer:
  // both start the blank drawing QNEW starts from the default template.
  register({ id: "NEW", run: () => runtime.newDrawing() })
  register({ id: "QNEW", run: () => runtime.newDrawing() })
  // A browser download always names the file, so AutoCAD's QSAVE (save over
  // the current name) and SAVEAS (prompt for one) cannot be told apart here;
  // both run the one save we can offer.
  register({ id: "QSAVE", run: () => runtime.saveDrawingToFile() })
  register({ id: "SAVEAS", run: () => runtime.saveDrawingToFile() })
  register({
    id: "OPEN",
    run: () => {
      void runtime.openDrawingFromFile()
    },
  })
  // The other three clipboard commands are tools (they prompt for objects);
  // this one is not, because reading the clipboard is asynchronous and the
  // tool can only start once there is a fragment to place. Autodesk's
  // shortcut guide lists no alias for any of the four.
  register({
    id: "PASTECLIP",
    run: () => {
      void runtime.pasteFromClipboard()
    },
  })
  // Both open the same manager on their own table, as AutoCAD's Dimension
  // Style Manager and Text Style dialog do. D and ST are the aliases
  // Autodesk's own shortcut guide lists; DDIM / DIMSTY / DST are not on it,
  // so they stay unregistered rather than invented.
  const showStyles = (table: StylesPanelTab) => {
    runtime.setStylesTable(table)
    runtime.showPalette("styles")
  }
  register({ id: "DIMSTYLE", run: () => showStyles("dimension") })
  register({ id: "STYLE", run: () => showStyles("text") })
  // No alias: Autodesk's shortcut guide lists none for BLOCKSPALETTE, and B
  // and I are already BLOCK and INSERT.
  register({ id: "BLOCKSPALETTE", run: () => runtime.showPalette("blocks") })
  // PR, CH and MO, as Autodesk's shortcut guide lists them; Ctrl+1 toggles
  // it too (`keyDown`). The palettes share one panel, so a CLOSE command
  // folds it only while its palette is the one shown.
  register({ id: "LAYER", run: () => runtime.showPalette("layers") })
  register({ id: "LAYERCLOSE", run: () => runtime.closePalette("layers") })
  register({ id: "PROPERTIES", run: () => runtime.showPalette("properties") })
  register({
    id: "PROPERTIESCLOSE",
    run: () => runtime.closePalette("properties"),
  })
  // UNITS opens the Drawing Units dialog, which the host draws.
  register({ id: "UNITS", run: () => runtime.setUnitsDialog(true) })
  register({ id: "CLEANSCREENON", run: () => runtime.setCleanScreen(true) })
  register({ id: "CLEANSCREENOFF", run: () => runtime.setCleanScreen(false) })
  // Only block definitions so far: layers and styles are purged from their
  // own managers, which already refuse a base, current or in-use entry.
  register({
    id: "PURGE",
    run: () => {
      const purged = runtime.purgeBlocks()
      say(
        purged === 0
          ? runtime.text.message("noUnusedBlocks")
          : runtime.text.message("blocksPurged", { count: purged })
      )
    },
  })
}

/** The command a tool runs, whose keywords its options are. */
export function toolCommand(tool: Tool): string | null {
  return TOOL_COMMANDS[tool.id] ?? null
}

/**
 * The keywords the active tool offers right now, in the command language: the
 * word, its abbreviation, the one key that runs it (if any) and the chip text.
 */
export function offerOptions(tool: Tool, text: EngineText): CommandOptionUi[] {
  const options = (tool.commandOptions?.() ?? []).filter(
    (option) => !option.hidden
  )
  const command = toolCommand(tool)
  const offered = offerKeywords(optionKeywords(tool, text, options))
  return offered.map((keyword, index) => {
    const value = options[index].value
    return {
      id: keyword.id,
      keyword: keyword.word,
      abbreviation: keyword.abbreviation,
      label:
        value === undefined
          ? (text.keywordLabel(command, keyword.id) ?? keyword.word)
          : text.optionValue(keyword.word, text.keyword(command, value)),
    }
  })
}

/**
 * `options` as the running command spells them: at the asked prompt, or at
 * the one an option names (the selection modes, in `selectObjects`' words).
 */
export function optionKeywords(
  tool: Tool,
  text: EngineText,
  options: readonly CommandOption[]
): Keyword[] {
  const command = toolCommand(tool)
  const asked = askedPrompt(tool)
  return options.map((option) => ({
    id: option.id,
    word: text.keyword(command, option.id, option.prompt ?? asked),
    global: option.id,
  }))
}

/**
 * Whether AutoCAD asks `prompt` on the line a pick left bare — its string has
 * no new line before it: `Select objects: Specify opposite corner: 2 found`.
 */
export function continuesLine(prompt: PromptId | null): boolean {
  return prompt === "specifyOppositeCorner"
}

/** A prompt in its two forms: at the prompt line, and as the history writes it. */
export interface CommandPrompt {
  /** The running command's name; null at rest. */
  readonly command: string | null
  /** `LINE Specify next point or [Undo]:`, or `Command:` at rest. */
  readonly segments: PromptSegment[]
  /** `Specify next point or [Undo]:`, the line an answer is written after. */
  readonly echo: PromptSegment[] | null
  /**
   * The dynamic prompt, the question without the command's name: with its
   * colon when nothing follows it (`Specify first point:`), else without
   * the keywords and the `<default>` the tooltip offers below it (`Specify
   * next point or`). Null when the tool names no question.
   */
  readonly dynamic: string | null
}

/** The id of the question `tool` is asking, or null. */
export function askedPrompt(tool: Tool): PromptId | null {
  const asked = tool.question?.() ?? null
  return typeof asked === "string" ? asked : (asked?.id ?? null)
}

/** What Enter keeps, as the prompt shows it between its angle brackets. */
function enterValue(
  enter: NonNullable<ToolQuestion["enter"]>,
  text: EngineText,
  settings: DocumentSettings
): string {
  if (typeof enter === "number") return formatLength(enter, settings)
  if (typeof enter === "string") return text.prompt(enter)
  if ("angle" in enter) return formatAngle(enter.angle, settings)
  if ("count" in enter) return String(enter.count)
  if ("name" in enter) return enter.name
  return [enter.x, enter.y, enter.z]
    .map((value) => formatLength(value, settings))
    .join(", ")
}

/**
 * The text shown before the input, mirroring AutoCAD's prompt: `Command:` at
 * rest, and while a command runs its name and the question it asks with the
 * keywords on offer, e.g. `LINE Specify next point or [Close/Undo]:`. A tool
 * that names no question shows its command's name in its place. The name is
 * the command the tool was started as (`startedAs`: `-LINETYPE` heads
 * LINETYPE's prompts), its keywords always the tool's command's.
 */
export function commandPrompt(
  tool: Tool,
  text: EngineText,
  options: readonly CommandOptionUi[],
  settings: DocumentSettings,
  startedAs: string | null = null,
  transparent = false
): CommandPrompt {
  if (tool.id === "select") {
    return {
      command: null,
      segments: text.composePrompt(text.idleHead(), []),
      echo: null,
      dynamic: null,
    }
  }
  const command = tool.runningCommand?.() ?? toolCommand(tool)
  const heading = startedAs ?? command
  const named =
    heading !== null
      ? text.commandNames(heading)[0]
      : text.tool(tool.id).toUpperCase()
  const name = transparent ? text.transparentCommand(named) : named
  const fallback = tool.defaultOption?.() ?? null
  const labels = options.map((option) => option.label)
  const asked = tool.question?.() ?? null
  const id = askedPrompt(tool)
  const asking =
    id === null
      ? null
      : text.prompt(
          id,
          typeof asked === "object" && asked !== null ? asked.values : undefined
        )
  // A transparent command's prompts are headed `>>`, as AutoCAD writes them.
  const question =
    asking !== null && transparent ? text.transparentPrompt(asking) : asking
  const value =
    typeof asked === "object" && asked !== null && asked.enter !== undefined
      ? enterValue(asked.enter, text, settings)
      : fallback === null
        ? null
        : text.keyword(command, fallback, id)
  return {
    command: name,
    segments: text.composePrompt(
      question === null ? name : text.commandQuestion(name, question),
      labels,
      value
    ),
    echo:
      question === null ? null : text.composePrompt(question, labels, value),
    dynamic:
      question === null || labels.length > 0 || value !== null
        ? question
        : promptString(text.composePrompt(question, [])),
  }
}
