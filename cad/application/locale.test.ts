import compile from "icu-minify/compile"
import { describe, expect, it } from "vitest"

import { createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import type { EngineLocale } from "../locales/types"
import { commandCatalog } from "./commandCatalog"
import { demo, recordDemo, transcript } from "./DemoScript"
import { engineText } from "./EngineText"

/**
 * A deliberately partial language — a handful of names, keywords and prompts —
 * to prove the mechanism before any real one exists: whatever it leaves out
 * is English, key by key, and `_` reaches the global vocabulary through it.
 */
const partial: EngineLocale = {
  tag: "es",
  interface: {
    tool: { line: "Línea" },
    entity: { line: compile("{count, plural, one {Línea} other {Líneas}}") },
  },
  commands: {
    names: { LINE: ["LINEA", "L"], ZOOM: ["ZOOM", "Z"] },
    keywords: {
      LINE: { Close: "Cerrar", Undo: "desHacer" },
      // Two keywords that share their first letter: neither runs on one key.
      ZOOM: { Scale: "Escala", Extents: "EXtensión" },
    },
    prompts: { length: "Longitud" },
    messages: {
      erased: compile(
        "{count, plural, one {# objeto borrado.} other {# objetos borrados.}}"
      ),
    },
  },
}

describe("English, the global command language", () => {
  it("runs a command by _ and its global name", () => {
    const cad = createHarness()
    cad.command("_line")
    expect(cad.activeToolId()).toBe("line")
    expect(cad.commandLog()).toEqual(["LINE"])
  })

  it("takes a keyword by its whole word, or by _ and the global one", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    cad.runtime.setCommandLineText("_u")
    cad.runtime.submitCommandLine()
    expect(cad.entityCount).toBe(1)
    cad.click(p(100, 100)).runtime.setCommandLineText("close")
    cad.runtime.submitCommandLine()
    expect(cad.entityCount).toBe(3)
    expect(cad.activeToolId()).toBe("select")
  })

  it("answers a keyword typed into a value box and confirmed", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    cad.type("c").enter()
    expect(cad.entityCount).toBe(3)
    expect(cad.activeToolId()).toBe("select")
  })

  it("lets a keyword's key through only on an empty prompt", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    cad.press("_")
    cad.press("C")
    expect(cad.state().commandLine.buffer).toBe("_C")
    cad.press("Enter")
    expect(cad.entityCount).toBe(3)
  })

  it("names options by id in scripts, and refuses an id the command lacks", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))
    expect(cad.optionIds()).toEqual(["Undo"])
    expect(() => cad.option("Nope")).toThrow(/not a keyword of LINE/)
  })
})

describe("a language laid over English", () => {
  it("names commands in it, keeps _ for the global names", () => {
    const cad = createHarness({ locale: partial })
    cad.command("LINE")
    expect(cad.commandLog()).toEqual(['Unknown command "LINE".'])
    cad.command("_LINE").escape().command("linea")
    expect(cad.commandLog().slice(1)).toEqual(["LINEA", "LINEA"])
    expect(cad.state().commandLine.command).toBe("LINEA")
  })

  it("speaks its prompts and keywords, and English for whatever it lacks", () => {
    const cad = createHarness({ locale: partial })
    cad.command("L").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    const state = cad.state()
    expect(state.commandLine.prompt).toBe("LINEA [Cerrar/desHacer]:")
    expect(state.commandLine.promptSegments).toEqual([
      { text: "LINEA ", keywords: false },
      { text: "[Cerrar/desHacer]", keywords: true },
      { text: ":", keywords: false },
    ])
    expect(state.commandOptions.map((option) => option.key)).toEqual(["C", "H"])
    expect(state.dynamicInput?.fields.map((field) => field.label)).toEqual([
      "Longitud",
      "Angle",
    ])
    expect(state.tools.find((tool) => tool.id === "line")?.label).toBe("Línea")
    expect(state.tools.find((tool) => tool.id === "circle")?.label).toBe(
      "Circle"
    )
  })

  it("runs a keyword on its own key, and on _ with the global one", () => {
    const cad = createHarness({ locale: partial })
    cad.command("L").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    cad.press("h")
    expect(cad.entityCount).toBe(1)
    cad.click(p(100, 100)).option("Undo")
    expect(cad.entityCount).toBe(1)
    cad.click(p(100, 100)).runtime.setCommandLineText("_C")
    cad.runtime.submitCommandLine()
    expect(cad.entityCount).toBe(3)
  })

  it("asks for a keyword that shares its letter to be typed and confirmed", () => {
    const cad = createHarness({
      locale: partial,
      entities: [lineOf(p(0, 0), p(100, 0))],
    })
    cad.command("Z")
    const zoom = cad.state().commandOptions
    expect(zoom.find((option) => option.id === "Scale")?.key).toBeNull()
    expect(zoom.find((option) => option.id === "Extents")?.key).toBeNull()
    cad.press("E")
    expect(cad.state().commandLine.buffer).toBe("E")
    cad.press("Enter")
    expect(cad.state().dynamicInput?.fields[0].label).toBe("Scale factor")
    cad.escape().command("Z").option("Extents")
    expect(cad.activeToolId()).toBe("select")
  })

  it("formats its messages, with plurals of its own", () => {
    const cad = createHarness({
      locale: partial,
      entities: [lineOf(p(0, 0), p(1, 0), { id: "A" })],
    })
    cad.select("A").command("E")
    expect(cad.commandLog().at(-1)).toBe("1 objeto borrado.")
  })

  it("rewords an open prompt when the language changes, and leaves the scrollback", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))
    cad.runtime.setLocale(partial)
    expect(cad.state().commandLine.prompt).toBe("LINEA [desHacer]:")
    expect(cad.state().dynamicInput?.fields[0].label).toBe("Longitud")
    expect(cad.commandLog()).toEqual(["LINE"])
  })

  it("lists its command names and describes in it", () => {
    const line = commandCatalog(partial).find((c) => c.id === "LINE")
    expect(line).toEqual({
      id: "LINE",
      name: "LINEA",
      aliases: ["L"],
      description: "Línea",
    })
  })

  it("is recorded in scripts with the keys its user would type", async () => {
    const recording = await recordDemo(
      demo().command("_LINE").click(0, 0).click(100, 0).option("Undo").escape(),
      { locale: partial }
    )
    const lines = transcript(recording)
    expect(lines.at(-1)).toMatchObject({
      kind: "input",
      prompt: "Longitud [desHacer]:",
      text: "H",
    })
  })

  it("keeps digits latin whatever the host's CLDR says", () => {
    const text = engineText({ tag: "ar-EG", interface: {} })
    expect(text.message("erased", { count: 12 })).toBe("12 objects erased.")
  })
})

describe("the palettes", () => {
  it("key their rows and groups by id, so a translation can never collide", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L" })],
    })
    cad.select("L")
    const info = cad.state().selectionInfo!
    expect(info.groups.map((group) => group.id)).toEqual([
      "geometry",
      "endpoints",
    ])
    expect(info.groups[0].rows.map((row) => row.id)).toEqual([
      "length",
      "angle",
      "deltaX",
      "deltaY",
    ])
  })

  it("read the engine's names, in the interface language", () => {
    const english = createHarness().state().names
    expect(english.snaps.endpoint).toBe("Endpoint")
    expect(english.colors.red).toBe("Red")
    expect(english.byLayer).toBe("ByLayer")
    expect(english.linetypes.DashDot).toBe("Dash dot")
    const other = createHarness({
      locale: { tag: "es", interface: { byLayer: "PorCapa" } },
    }).state().names
    expect(other.byLayer).toBe("PorCapa")
    expect(other.colors.red).toBe("Red")
  })
})
