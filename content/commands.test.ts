import { describe, expect, it } from "vitest"

import { commandCatalog, engineText } from "@mellowcad/engine"
import { loadEngineLocale } from "@/i18n/engine"
import { LIVE_LOCALES } from "@/i18n/routing"
import { autocadCommands, productFacts } from "@/lib/facts"

import { COMMAND_FILING, HERO_ALIASES, SOLID_COMMANDS } from "./commands"

describe("the landing's command catalogue", () => {
  it("files every command the engine registers — a new one fails until it is filed", () => {
    const registered = commandCatalog().map((command) => command.name)
    expect(Object.keys(COMMAND_FILING).sort()).toEqual([...registered].sort())
  })

  it("shows AutoCAD names only, keyed by their shortest alias", () => {
    const commands = autocadCommands()
    expect(commands.some((command) => command.name === "CIRCLE2P")).toBe(false)
    const line = commands.find((command) => command.name === "LINE")
    expect(line?.key).toBe("L")
    const copyclip = commands.find((command) => command.name === "COPYCLIP")
    expect(copyclip?.key).toBe("COPYCLIP")
  })

  it("derives every figure the page states", () => {
    const facts = productFacts()
    expect(facts.commands).toBe(autocadCommands().length)
    expect(facts.tests % 100).toBe(0)
    expect(facts.tests).toBeGreaterThan(0)
    expect(facts.lineweights).toBe(24)
  })

  it("lists as 3D only commands the engine registers and files", () => {
    for (const id of SOLID_COMMANDS) {
      expect(COMMAND_FILING[id], id).toBeDefined()
      expect(COMMAND_FILING[id].variant, id).toBeUndefined()
    }
  })

  // The hero's lead teaches each one's alias in the page's command language.
  it.each(LIVE_LOCALES)(
    "teaches in the hero only commands with an alias in %s",
    async (locale) => {
      const text = engineText(await loadEngineLocale(locale))
      for (const id of HERO_ALIASES) {
        expect(text.commandNames(id).length, id).toBeGreaterThan(1)
      }
    }
  )
})
