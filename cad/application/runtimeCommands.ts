import type { CadRuntime } from "./CadRuntime"
import { CommandDefinition, TOOL_COMMANDS } from "./CommandLine"
import type { CommandOptionUi, StylesPanelTab } from "./EngineState"
import {
  promptString,
  type EngineText,
  type PromptForm,
  type PromptSegment,
} from "./EngineText"
import { type Keyword, offerKeywords } from "../i18n/keywords"
import { type CommandOption, Tool, type ToolQuestion } from "./tools/Tool"
import type { PromptId } from "../locales/types"
import {
  formatAngle,
  formatLength,
  withoutTrailingZeros,
} from "../domain/units"
import type { DocumentSettings } from "../domain/units"
import { MTextTool } from "./tools/MTextTool"
import { TextTool } from "./tools/TextTool"
import { AttEditTool } from "./tools/AttEditTool"
import { HatchTool } from "./tools/HatchTool"
import { UnitsTool } from "./tools/UnitsTool"

/**
 * The commands built here that AutoCAD's console runs transparently (2023's;
 * DIST and ID 2027's: `'DIST` at LINE's prompt asks `>>Specify first point:`,
 * probes inquiry/p320, p321; ELEV 2027's, ucs/p366; AUPREC and SETVAR
 * 2027's, workspace/p114, p115, p123). Left out: what it refuses (`** That
 * command may not be invoked transparently **`), what it does not know and so
 * cannot show (VIEW, PROPERTIES, MATCHPROP, BLOCKSPALETTE, EATTEDIT, LAYER,
 * whose dialog hangs it), and AREA and UCSICON, which typed so read the
 * system variables of their names (inquiry/p324, p325), as every variable
 * SETVAR knows (`systemVariables.ts`) is typed.
 */
const TRANSPARENT_COMMANDS: ReadonlySet<string> = new Set([
  "ZOOM",
  "PAN",
  "-PAN",
  "AUPREC",
  "SETVAR",
  "DIST",
  "ID",
  "LTSCALE",
  "ATTDISP",
  "FILL",
  "ELEV",
  "-OSNAP",
  "COLOR",
  "-COLOR",
  "LINETYPE",
  "-LINETYPE",
  "LWEIGHT",
  "-LWEIGHT",
  "-VIEW",
  "3DORBIT",
  "SNAP",
  "UNITS",
  "DIMSTYLE",
  "STYLE",
])

/**
 * Builds the command table: one command per tool (using AutoCAD's names and
 * aliases) plus the editing/view commands that are not tools.
 *
 * Every command is a call into the runtime's own public API — that is what a
 * command line is — so the runtime is passed whole; `startTool` and
 * `registerCommand` are the two private entry points it cannot reach.
 */
export function registerCommands(
  runtime: CadRuntime,
  startTool: (tool: string | Tool) => void,
  registerCommand: (definition: CommandDefinition) => void
): void {
  const tools = new Set(runtime.listTools().map((tool) => tool.id))
  const register = (definition: CommandDefinition) =>
    registerCommand({
      ...definition,
      transparent: TRANSPARENT_COMMANDS.has(definition.id),
    })

  for (const [toolId, command] of Object.entries(TOOL_COMMANDS)) {
    if (!tools.has(toolId)) continue
    register({ id: command, tool: toolId, run: () => startTool(toolId) })
  }

  register({ id: "U", run: () => runtime.undo(true) })
  // -TEXT is TEXT asking for one line at the command line (TEXT-D2), so it
  // runs the same tool and switches its entry, as -MTEXT does.
  register({
    id: "-TEXT",
    tool: "text",
    run: () => {
      startTool("text")
      const tool = runtime.listTools().find((t) => t.id === "text")
      if (tool instanceof TextTool) tool.singleLine()
    },
  })
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
  register({ id: "REDO", run: () => runtime.redo(true) })
  // AutoCAD's ATTDEF opens a dialog; here it asks at the command line, so
  // -ATTDEF is the same tool under its own name.
  register({ id: "-ATTDEF", tool: "attdef", run: () => startTool("attdef") })
  // AutoCAD's BLOCK opens the Block Definition dialog; here it asks -BLOCK's
  // prompts, so -BLOCK is the same tool under its own name (BLOCKS-D1).
  register({ id: "-BLOCK", tool: "block", run: () => startTool("block") })
  // PURGE asks -PURGE's prompts here, as AutoCAD's console runs it (no Purge
  // dialog, BLOCKS-D2), so -PURGE is the same tool under its own name.
  register({ id: "-PURGE", tool: "purge", run: () => startTool("purge") })
  // HATCH asks -HATCH's prompts here (no ribbon, HATCH-D31), so -HATCH is the
  // same tool under its own name; only its Escape differs (HATCH-D45).
  register({
    id: "-HATCH",
    tool: "hatch",
    run: () => {
      startTool("hatch")
      const tool = runtime.listTools().find((t) => t.id === "hatch")
      if (tool instanceof HatchTool) tool.dashForm()
    },
  })
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
  register({ id: "FROM", modifier: true, run: () => runtime.startFrom() })
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
  // Both open the Styles palette on their own table, standing in for AutoCAD's
  // Dimension Style Manager and Text Style dialog. WHY not the Text Style
  // dialog: the palette tab already hosts DIMSTYLE's table, and replacing it
  // is a change of the palette panel's own (TEXT-D58, dimensions.md Missing).
  const showStyles = (table: StylesPanelTab) => {
    runtime.setStylesTable(table)
    runtime.showPalette("styles")
  }
  register({ id: "DIMSTYLE", run: () => showStyles("dimension") })
  register({
    id: "STYLE",
    run: () => {
      // The Text Style dialog drops a preselection (text/p160, desktop d07).
      runtime.selection.clear()
      showStyles("text")
    },
  })
  // No alias: Autodesk's shortcut guide lists none for BLOCKSPALETTE, and B
  // and I are already BLOCK and INSERT.
  register({ id: "BLOCKSPALETTE", run: () => runtime.showPalette("blocks") })
  // 2027's INSERT opens the Blocks palette, writing nothing more on the
  // desktop (the console's `*Insert a block from the Blocks palette`, p05, is
  // the console's), and -INSERT asks at the command line (BLOCKS-D30, d06).
  // The insert tool is -INSERT's; INSERT, registered with it, is replaced here.
  register({ id: "INSERT", run: () => runtime.showPalette("blocks") })
  register({ id: "-INSERT", tool: "insert", run: () => startTool("insert") })
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
  // UNITS runs while the Drawing Units dialog, which the host draws, shows.
  const units = () => new UnitsTool((open) => runtime.setUnitsDialog(open))
  register({ id: "UNITS", makeTool: units, run: () => startTool(units()) })
  register({ id: "CLEANSCREENON", run: () => runtime.cleanScreenStep(true) })
  register({ id: "CLEANSCREENOFF", run: () => runtime.cleanScreenStep(false) })
}

/**
 * The command a tool runs, whose keywords its options are: a ribbon macro's
 * (CIRCLE for the rail's 2-Point), else `TOOL_COMMANDS`'.
 */
export function toolCommand(tool: Tool): string | null {
  return (
    tool.handedTo?.() ??
    tool.ribbonMacro?.()?.command ??
    TOOL_COMMANDS[tool.id] ??
    null
  )
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
 * no new line before it: `Select objects: Specify opposite corner: 2 found`,
 * and the second of two measuring points, whose own space follows the
 * picked one's: `Specify fillet radius <0.0000>:  Specify second point:`.
 */
export function continuesLine(prompt: PromptId | null): boolean {
  return (
    prompt === "specifyOppositeCorner" || prompt === "secondPointOfDistance"
  )
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
  settings: DocumentSettings,
  trimmed = false
): string {
  const trim = (value: string) =>
    trimmed ? withoutTrailingZeros(value) : value
  if (typeof enter === "number") return trim(formatLength(enter, settings))
  if (typeof enter === "string") return text.prompt(enter)
  if ("angle" in enter) return trim(formatAngle(enter.angle, settings))
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
  // A variable typed by its name heads its prompt; SETVAR's run, SETVAR.
  const named =
    (heading === "SETVAR" ? undefined : tool.systemVariable?.()) ??
    (heading !== null
      ? text.commandNames(heading)[0]
      : text.tool(tool.id).toUpperCase())
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
      ? enterValue(asked.enter, text, settings, asked.trimmed === true)
      : fallback === null
        ? null
        : (text.keywordLabel(command, fallback) ??
          text.keyword(command, fallback, id))
  // WHY only the history keeps a prompt's leading space (` Specify second
  // point:`, ` (ADD mode)…`): it is how AutoCAD lays the line out after the
  // last, not part of the question the prompt line and the tooltip show.
  const shown = question?.trimStart() ?? null
  const form: PromptForm =
    typeof asked !== "object" || asked === null
      ? "spaced"
      : asked.tight
        ? "tight"
        : asked.open
          ? "open"
          : "spaced"
  return {
    command: name,
    segments: text.composePrompt(
      shown === null ? name : text.commandQuestion(name, shown),
      labels,
      value,
      form
    ),
    echo:
      question === null
        ? null
        : text.composePrompt(question, labels, value, form),
    dynamic:
      shown === null || labels.length > 0 || value !== null
        ? shown
        : promptString(text.composePrompt(shown, [])),
  }
}

/**
 * `ids` in the order the tool's question declares its keywords, which AutoCAD
 * asks which was meant in; as they are where it declares none.
 */
export function inDeclaredOrder(
  tool: Tool,
  ids: readonly string[]
): readonly string[] {
  const asked = tool.question?.() ?? null
  const declared = typeof asked === "object" ? asked?.declared : undefined
  if (!declared) return ids
  const rank = (id: string) => {
    const at = declared.indexOf(id)
    return at < 0 ? declared.length : at
  }
  return [...ids].sort((a, b) => rank(a) - rank(b))
}

/**
 * `prompt` while AutoCAD asks which keyword was meant — what was typed starts
 * several on offer: `CEnter or CLose?`, under the command's name and with no
 * colon, as AutoCAD 2023's console asks it. The words are the declared ones
 * (`TLeft or TCenter or TRight?` at TEXT's `[…/TL/TC/TR/…]`), which the
 * keyword tables hold, the prompt listing their labels.
 */
export function keywordChoicePrompt(
  prompt: CommandPrompt,
  text: EngineText,
  words: readonly string[],
  transparent: boolean
): CommandPrompt {
  const asking = text.prompt("clarifyKeyword", {
    keywords: words.join(text.keywordOr()),
  })
  const question = transparent ? text.transparentPrompt(asking) : asking
  const line = (head: string) => [{ text: head, keywords: false }]
  return {
    command: prompt.command,
    segments: line(
      prompt.command === null
        ? question
        : text.commandQuestion(prompt.command, question)
    ),
    echo: line(question),
    dynamic: question,
  }
}
