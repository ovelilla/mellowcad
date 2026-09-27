import { describe, expect, it } from "vitest"
import { TOOL_COMMANDS, matchCommands } from "./CommandLine"
import { commandCatalog } from "./commandCatalog"
import { en } from "../locales/en"

describe("commandCatalog", () => {
  it("lists every tool under its AutoCAD name, with the rest as aliases", () => {
    const catalog = commandCatalog()
    const names: Record<string, readonly string[]> = en.commands.names
    for (const id of Object.values(TOOL_COMMANDS)) {
      const [name, ...aliases] = names[id]
      expect(catalog).toContainEqual(
        expect.objectContaining({ id, name, aliases })
      )
    }
  })

  it("includes the commands that are not tools", () => {
    const names = commandCatalog().map((command) => command.name)
    expect(names).toEqual(expect.arrayContaining(["ERASE", "UNDO", "QSAVE"]))
  })

  it("names each command once and describes every one", () => {
    const catalog = commandCatalog()
    const names = catalog.map((command) => command.name)
    expect(new Set(names).size).toBe(names.length)
    expect(catalog.every((command) => command.description.length > 0)).toBe(
      true
    )
  })

  it("is plain data — nothing in it can run a command", () => {
    for (const command of commandCatalog()) {
      expect(Object.keys(command).sort()).toEqual([
        "aliases",
        "description",
        "id",
        "name",
      ])
    }
  })

  it("feeds the same autocomplete the prompt uses", () => {
    const [best] = matchCommands(commandCatalog(), "o")
    expect(best.name).toBe("OFFSET")
  })
})
