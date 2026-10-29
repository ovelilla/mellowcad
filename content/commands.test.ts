import { describe, expect, it } from "vitest"

import { commandCatalog } from "@mellowcad/engine"
import { autocadCommands, productFacts } from "@/lib/facts"

import { COMMAND_FILING } from "./commands"

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
})
