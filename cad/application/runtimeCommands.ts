import type { CadRuntime } from "./CadRuntime"
import { CommandDefinition, TOOL_COMMANDS } from "./CommandLine"
import type { CommandOptionUi } from "./EngineState"
import type { EngineText, PromptSegment } from "./EngineText"
import { offerKeywords } from "../i18n/keywords"
import { Tool } from "./tools/Tool"
import { MTextTool } from "./tools/MTextTool"
import { AttEditTool } from "./tools/AttEditTool"

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
    register({ id: command, tool: toolId, run: () => startTool(toolId) })
  }

  const say = (text: string) => runtime.commandLine.write("info", text)

  register({
    id: "ERASE",
    run: () => {
      if (runtime.selection.isEmpty()) {
        say(runtime.text.message("nothingSelected"))
        return
      }
      const count = runtime.selection.size
      runtime.deleteSelection()
      say(runtime.text.message("erased", { count }))
    },
  })
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
  // A browser download always names the file, so AutoCAD's QSAVE (save over
  // the current name) and SAVEAS (prompt for one) cannot be told apart here;
  // both spellings run the one command we can offer.
  register({ id: "QSAVE", run: () => runtime.saveDrawingToFile() })
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
  register({ id: "DIMSTYLE", run: () => runtime.setStylesPanel("dimension") })
  register({ id: "STYLE", run: () => runtime.setStylesPanel("text") })
  // No alias: Autodesk's shortcut guide lists none for BLOCKSPALETTE, and B
  // and I are already BLOCK and INSERT.
  register({ id: "BLOCKSPALETTE", run: () => runtime.setBlocksPanel(true) })
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
  const options = tool.commandOptions?.() ?? []
  const command = toolCommand(tool)
  const offered = offerKeywords(
    text.keywords(
      command,
      options.map((option) => option.id)
    )
  )
  return offered.map((keyword, index) => {
    const value = options[index].value
    return {
      id: keyword.id,
      keyword: keyword.word,
      abbreviation: keyword.abbreviation,
      key: keyword.key,
      label:
        value === undefined
          ? keyword.word
          : text.optionValue(keyword.word, text.keyword(command, value)),
    }
  })
}

/**
 * The text shown before the input, mirroring AutoCAD's prompt: `Command:` at
 * rest, and the running command with its current keywords while one is
 * active, e.g. `PLINE [Close/Undo]:`.
 */
export function commandPrompt(
  tool: Tool,
  text: EngineText,
  options: readonly CommandOptionUi[]
): { readonly command: string | null; readonly segments: PromptSegment[] } {
  if (tool.id === "select") {
    return { command: null, segments: text.composePrompt(text.idleHead(), []) }
  }
  const command = toolCommand(tool)
  const name =
    command !== null
      ? text.commandNames(command)[0]
      : text.tool(tool.id).toUpperCase()
  return {
    command: name,
    segments: text.composePrompt(
      name,
      options.map((option) => option.label)
    ),
  }
}
