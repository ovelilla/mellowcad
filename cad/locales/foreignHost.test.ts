import compile from "icu-minify/compile"
import { describe, expect, it, onTestFinished } from "vitest"

// A host outside the engine: only the public entry points, and the compiler
// its own build would run.
import {
  CadDriver,
  commandCatalog,
  extendLocale,
  type CadDriverOptions,
  type EngineLocale,
} from "@/cad"
import { es } from "@/cad/locales/es"

/**
 * A language the engine does not ship, as a host would write it: a few
 * interface names and a command language that names two commands and leaves
 * every other one out.
 */
const french: EngineLocale = {
  tag: "fr",
  interface: {
    tool: { line: "Ligne" },
    byLayer: "DuCalque",
    snap: { endpoint: "Extrémité" },
  },
  commands: {
    names: { LINE: ["LIGNE", "L"], CIRCLE: ["CERCLE", "C"] },
    keywords: { LINE: { Close: "Clore", Undo: "annUler" } },
    prompts: { length: "Longueur" },
    messages: { unknownCommand: compile('Commande "{name}" inconnue.') },
  },
}

function driver(options: CadDriverOptions): CadDriver {
  const cad = new CadDriver(options)
  onTestFinished(() => cad.dispose())
  return cad
}

describe("a host's own language", () => {
  it("falls back to English key by key, in the interface", () => {
    const { names, tools } = driver({ locale: french }).state()
    expect(tools.find((tool) => tool.id === "line")?.label).toBe("Ligne")
    expect(tools.find((tool) => tool.id === "circle")?.label).toBe("Circle")
    expect(names.byLayer).toBe("DuCalque")
    expect(names.snaps.endpoint).toBe("Extrémité")
    expect(names.snaps.midpoint).toBe("Midpoint")
    expect(names.colors.red).toBe("Red")
  })

  it("falls back to English key by key, in the command language", () => {
    const cad = driver({ locale: french })
    cad.command("L").click({ x: 0, y: 0 }).click({ x: 100, y: 0 })
    const state = cad.state()
    // The question it leaves out is English's.
    expect(state.commandLine.prompt).toBe(
      "LIGNE Specify next point or [annUler]:"
    )
    expect(state.dynamicInput?.fields.map((field) => field.label)).toEqual([
      "Longueur",
      "Angle",
    ])
    cad.press("u")
    cad.press("Enter")
    expect(cad.entityCount).toBe(0)
  })

  it("leaves a command it does not name with its global name alone", () => {
    const cad = driver({
      locale: french,
      entities: [
        {
          id: "A",
          type: "line",
          layerId: "0",
          start: { x: 0, y: 0 },
          end: { x: 100, y: 0 },
        },
      ],
    })
    cad.command("E")
    expect(cad.commandLog()).toEqual(['Commande "E" inconnue.'])
    cad.select("A").command("ERASE")
    expect(cad.commandLog().slice(1)).toEqual([
      "ERASE 1 found",
      "1 object erased.",
    ])
    const erase = commandCatalog(french).find((info) => info.id === "ERASE")
    expect(erase).toMatchObject({ name: "ERASE", aliases: [] })
  })

  it("reaches the global names and keywords through _", () => {
    const cad = driver({ locale: french })
    cad.command("_LINE")
    expect(cad.commandLog()).toEqual(["LIGNE"])
    cad.click({ x: 0, y: 0 }).click({ x: 100, y: 0 }).click({ x: 100, y: 100 })
    cad.runtime.setCommandLineText("_C")
    cad.runtime.submitCommandLine()
    expect(cad.entityCount).toBe(3)
    cad.command("_CIRCLE")
    expect(cad.commandLog().at(-1)).toBe("CERCLE")
  })
})

describe("a host's words over a shipped language", () => {
  const spanish = extendLocale(es, {
    interface: { tool: { line: "Línea recta" }, byLayer: "Por capa" },
    commands: {
      names: { LINE: ["LINEA", "LN"] },
      messages: { unknownCommand: compile('No existe el comando "{name}".') },
    },
  })

  it("wins where it says something, and leaves the rest as it was", () => {
    const cad = driver({ locale: spanish })
    const { names, tools } = cad.state()
    expect(tools.find((tool) => tool.id === "line")?.label).toBe("Línea recta")
    expect(tools.find((tool) => tool.id === "circle")?.label).toBe("Círculo")
    expect(names.byLayer).toBe("Por capa")
    expect(names.snaps.endpoint).toBe("Punto final")
    cad.command("L")
    expect(cad.commandLog()).toEqual(['No existe el comando "L".'])
    cad.command("LN").escape().command("DF")
    expect(cad.commandLog().slice(1)).toEqual([
      "LN LINEA",
      "Precise primer punto: *Cancelado*",
      "DF DESFASE",
      "Parámetros actuales: Borrar origen=No  Capa=Origen  OFFSETGAPTYPE=0",
    ])
  })

  it("leaves the language it extends untouched", () => {
    expect(spanish.tag).toBe("es")
    const { tools, names } = driver({ locale: es }).state()
    expect(tools.find((tool) => tool.id === "line")?.label).toBe("Línea")
    expect(names.byLayer).toBe("PorCapa")
  })
})
