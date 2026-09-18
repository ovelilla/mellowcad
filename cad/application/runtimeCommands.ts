import type { CadRuntime } from "./CadRuntime"
import { CommandDefinition, TOOL_COMMANDS } from "./CommandLine"
import { Tool } from "./tools/Tool"

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
  const tools = new Map<string, Tool>(
    runtime.listTools().map((tool) => [tool.id, tool])
  )

  for (const [toolId, names] of Object.entries(TOOL_COMMANDS)) {
    const tool = tools.get(toolId)
    if (!tool) continue
    const [name, ...aliases] = names
    register({
      name,
      aliases,
      description: tool.label,
      run: () => startTool(toolId),
    })
  }

  register({
    name: "ERASE",
    aliases: ["E"],
    description: "Delete the selected objects",
    run: () => {
      if (runtime.selection.isEmpty()) {
        runtime.commandLine.write("info", "Nothing selected.")
        return
      }
      const count = runtime.selection.size
      runtime.deleteSelection()
      runtime.commandLine.write(
        "info",
        `${count} object${count === 1 ? "" : "s"} erased.`
      )
    },
  })
  register({
    name: "UNDO",
    aliases: ["U"],
    description: "Undo the last action",
    run: () => runtime.undo(),
  })
  register({
    name: "REDO",
    aliases: [],
    description: "Redo the last undone action",
    run: () => runtime.redo(),
  })
  register({
    name: "SNAP",
    aliases: ["SN"],
    description: "Force the cursor onto the snap increments",
    run: () => {
      runtime.toggleSnapMode()
      runtime.commandLine.write(
        "info",
        `Snap mode ${runtime.snapMode.isActive() ? "on" : "off"}.`
      )
    },
  })
  register({
    name: "FROM",
    aliases: ["FRO"],
    description: "Pick a point offset from a base point",
    run: () => {
      if (!runtime.startFrom()) {
        runtime.commandLine.write("error", "FROM needs a point prompt.")
      }
    },
  })
  // A browser download always names the file, so AutoCAD's QSAVE (save over
  // the current name) and SAVEAS (prompt for one) cannot be told apart here;
  // both spellings run the one command we can offer.
  register({
    name: "QSAVE",
    aliases: ["SAVE", "SAVEAS"],
    description: "Save the drawing to a file",
    run: () => runtime.saveDrawingToFile(),
  })
  register({
    name: "OPEN",
    aliases: [],
    description: "Open a drawing file",
    run: () => {
      void runtime.openDrawingFromFile()
    },
  })
  // The other three clipboard commands are tools (they prompt for objects);
  // this one is not, because reading the clipboard is asynchronous and the
  // tool can only start once there is a fragment to place. Autodesk's
  // shortcut guide lists no alias for any of the four.
  register({
    name: "PASTECLIP",
    aliases: [],
    description: "Paste the clipboard into the drawing",
    run: () => {
      void runtime.pasteFromClipboard()
    },
  })
  // Both open the same manager on their own table, as AutoCAD's Dimension
  // Style Manager and Text Style dialog do. D and ST are the aliases
  // Autodesk's own shortcut guide lists; DDIM / DIMSTY / DST are not on it,
  // so they stay unregistered rather than invented.
  register({
    name: "DIMSTYLE",
    aliases: ["D"],
    description: "Create and modify dimension styles",
    run: () => runtime.setStylesPanel("dimension"),
  })
  register({
    name: "STYLE",
    aliases: ["ST"],
    description: "Create and modify text styles",
    run: () => runtime.setStylesPanel("text"),
  })
  // No alias: Autodesk's shortcut guide lists none for BLOCKSPALETTE, and B
  // and I are already BLOCK and INSERT.
  register({
    name: "BLOCKSPALETTE",
    aliases: [],
    description: "Show the blocks palette",
    run: () => runtime.setBlocksPanel(true),
  })
  // Only block definitions so far: layers and styles are purged from their
  // own managers, which already refuse a base, current or in-use entry.
  register({
    name: "PURGE",
    aliases: ["PU"],
    description: "Remove unused block definitions",
    run: () => {
      const purged = runtime.purgeBlocks()
      runtime.commandLine.write(
        "info",
        purged === 0
          ? "No unused blocks."
          : `${purged} block${purged === 1 ? "" : "s"} purged.`
      )
    },
  })
}

/**
 * The text shown before the input, mirroring AutoCAD's prompt: `Command:` at
 * rest, and the running command with its current keywords while one is
 * active, e.g. `PLINE [Close/Undo]:`.
 */
export function commandPrompt(tool: Tool): string {
  if (tool.id === "select") return "Command:"
  const names = TOOL_COMMANDS[tool.id]
  const name = names?.[0] ?? tool.label.toUpperCase()
  const options = tool.commandOptions?.() ?? []
  if (options.length === 0) return `${name}:`
  return `${name} [${options.map((option) => option.label).join("/")}]:`
}
