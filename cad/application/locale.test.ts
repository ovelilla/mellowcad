import compile from "icu-minify/compile"
import { describe, expect, it } from "vitest"

import { createHarness } from "../../test/harness"
import { arcOf, lineOf, p, polylineOf } from "../../test/builders"
import { ar } from "../locales/ar"
import { es } from "../locales/es"
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
    prompts: {
      length: "Longitud",
      specifyNextPointOr: compile("Precise punto siguiente o"),
    },
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
    // Typed on the drawing, it goes to the box the prompt shows.
    expect(cad.state().dynamicInput?.fields[0].value).toBe("_C")
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
    expect(cad.commandLog().slice(1)).toEqual([
      "LINEA",
      "Specify first point: *Cancel*",
      "LINEA",
    ])
    expect(cad.state().commandLine.command).toBe("LINEA")
  })

  it("speaks its prompts and keywords, and English for whatever it lacks", () => {
    const cad = createHarness({ locale: partial })
    cad.command("L").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    const state = cad.state()
    expect(state.commandLine.prompt).toBe(
      "LINEA Precise punto siguiente o [Cerrar/desHacer]:"
    )
    expect(state.commandLine.promptSegments).toEqual([
      { text: "LINEA Precise punto siguiente o ", keywords: false },
      { text: "[Cerrar/desHacer]", keywords: true },
      { text: ":", keywords: false },
    ])
    expect(state.commandOptions.map((option) => option.abbreviation)).toEqual([
      "C",
      "H",
    ])
    expect(state.dynamicInput?.fields.map((field) => field.label)).toEqual([
      "Longitud",
      "Angle",
    ])
    expect(state.tools.find((tool) => tool.id === "line")?.label).toBe("Línea")
    expect(state.tools.find((tool) => tool.id === "circle")?.label).toBe(
      "Circle"
    )
  })

  it("takes a keyword typed and confirmed, and _ with the global one", () => {
    const cad = createHarness({ locale: partial })
    cad.command("L").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    // As at AutoCAD's prompt, a letter alone runs nothing until Enter.
    cad.press("h")
    expect(cad.entityCount).toBe(2)
    cad.press("Enter")
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
    cad.press("E")
    expect(cad.state().dynamicInput?.fields[0].value).toBe("E")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "ZOOM Enter a scale factor (nX or nXP):"
    )
    cad.escape().command("Z").option("Extents")
    expect(cad.activeToolId()).toBe("select")
  })

  it("formats its messages, with plurals of its own", () => {
    const cad = createHarness({
      locale: partial,
      entities: [lineOf(p(0, 0), p(1, 0), { id: "A" })],
    })
    // ERASE is not in its names, so it keeps its global name and no alias.
    cad.select("A").command("ERASE")
    expect(cad.commandLog().at(-1)).toBe("1 objeto borrado.")
  })

  it("rewords an open prompt when the language changes, and leaves the scrollback", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))
    cad.runtime.setLocale(partial)
    expect(cad.state().commandLine.prompt).toBe(
      "LINEA Precise punto siguiente o [desHacer]:"
    )
    expect(cad.state().dynamicInput?.fields[0].label).toBe("Longitud")
    expect(cad.commandLog()).toEqual([
      "LINE",
      "Specify first point:",
      "Specify next point or [Undo]:",
    ])
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
      prompt: "Precise punto siguiente o [desHacer]:",
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
    const info = cad.state().properties.info!
    expect(info.groups.map((group) => group.id)).toEqual([
      "geometry",
      "endpoints",
    ])
    expect(info.groups[0].rows.map((row) => row.id)).toEqual([
      "length",
      "angle",
      "deltaX",
      "deltaY",
      "deltaZ",
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

describe("Spanish AutoCAD's command language", () => {
  // Someone who works in Spanish AutoCAD types LINEA or L, DESFASE, _LINE and
  // H, and it works (docs/autocad-coverage.md, "Spanish command language").
  it("names the interface in Spanish and leaves the drawing's data alone", () => {
    const { names, tools } = createHarness({ locale: es }).state()
    expect(names.snaps.endpoint).toBe("Punto final")
    expect(names.byLayer).toBe("PorCapa")
    expect(names.linetypes.DashDot).toBe("Dash dot")
    expect(tools.find((tool) => tool.id === "line")?.label).toBe("Línea")
    expect(tools.find((tool) => tool.id === "line")?.shortcut).toBe("L")
  })

  it("asks DESPLAZA's and COPIA's questions in Spanish AutoCAD's words", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.command("d").click(p(50, 0)).press(" ")
    expect(cad.state().commandLine.prompt).toBe(
      "DESPLAZA Precise punto base o [Desplazamiento] <Desplazamiento>:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "DESPLAZA Precise segundo punto o <usar primer punto como desplazamiento>:"
    )
    cad.click(p(0, 10))
    cad.select("A").command("COPIA").click(p(0, 10)).click(p(0, 20))

    expect(cad.commandLog()).toEqual([
      "d DESPLAZA",
      "Designe objetos: 1 encontrados",
      "Designe objetos:",
      "Precise punto base o [Desplazamiento] <Desplazamiento>:",
      "Precise segundo punto o <usar primer punto como desplazamiento>:",
      "COPIA 1 encontrados",
      "Parámetros actuales:  modo de copia = Múltiple",
      "Precise punto base o [Desplazamiento] <Desplazamiento>:",
      "Precise el segundo punto o <usar primer punto como desplazamiento>:",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "COPIA Precise el segundo punto o [Salir/desHacer] <Salir>:"
    )
  })

  it("asks GIRA's and SIMETRIA's questions in Spanish AutoCAD's words", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.select("A").command("GIRA").click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "GIRA Precise ángulo de rotación o [Copiar/Referencia] <0.00>:"
    )
    cad.option("Copy")
    expect(cad.commandLog().at(-1)).toBe(
      "Girando una copia de los objetos seleccionados."
    )
    cad.escape().select("A").command("ESCALA").click(p(0, 0)).option("Copy")
    expect(cad.commandLog().at(-1)).toBe(
      "Escalando una copia de los objetos seleccionados."
    )
    cad.escape().select("A").command("SIMETRIA").click(p(0, 10))
    expect(cad.state().commandLine.prompt).toBe(
      "SIMETRIA Especifique segundo punto de línea de simetría:"
    )
    cad.click(p(100, 10))
    expect(cad.state().commandLine.prompt).toBe(
      "SIMETRIA ¿Borrar objetos de origen? [Sí/No] <No>:"
    )
    expect(cad.commandLog().slice(0, 4)).toEqual([
      "GIRA",
      "Ángulo actual positivo en SCP:  ANGDIR=en sentido horario inverso ANGBASE=0",
      "1 encontrados",
      "Precise punto base:",
    ])
  })

  it("counts a selection and stretches in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "B" }),
      ],
    })
    cad.command("DESPLAZA").click(p(50, 0)).click(p(50, 50))
    cad.click(p(50, 50), { shiftKey: true })
    expect(cad.commandLog().slice(1)).toEqual([
      "Designe objetos: 1 encontrados",
      "Designe objetos: 1 encontrados, 2 total",
      "Designe objetos: 1 encontrados, eliminados 1, 1 total",
    ])
    const stretch = createHarness({ locale: es }).command("ESTIRA")
    expect(stretch.commandLog().at(-1)).toBe(
      "Designe objetos que estirar mediante ventana o polígono..."
    )
  })

  it("draws with LINEA, L and _LINE, and undoes a segment with H", () => {
    const cad = createHarness({ locale: es })
    cad.command("LINEA").escape().command("_LINE").escape().command("l")
    expect(cad.commandLog()).toEqual([
      "LINEA",
      "Precise primer punto: *Cancelar*",
      "LINEA",
      "Precise primer punto: *Cancelar*",
      "l LINEA",
    ])
    cad.click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    const state = cad.state()
    expect(state.commandLine.prompt).toBe(
      "LINEA Precise punto siguiente o [Cerrar/desHacer]:"
    )
    expect(state.commandOptions.map((option) => option.abbreviation)).toEqual([
      "C",
      "H",
    ])
    cad.press("h")
    cad.press("Enter")
    expect(cad.entityCount).toBe(1)
    cad.click(p(100, 100)).press("c")
    cad.press("Enter")
    expect(cad.entityCount).toBe(3)
    expect(cad.activeToolId()).toBe("select")
  })

  it("asks LINEA's, POL's, RECTANG's and POLIGONO's questions in Autodesk's Spanish words", () => {
    const cad = createHarness({ locale: es })
    cad.command("LINEA").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "No hay línea o arco que se pueda continuar."
    )
    expect(cad.state().commandLine.prompt).toBe("LINEA Precise primer punto:")
    cad.escape()

    const arc = createHarness({
      locale: es,
      entities: [arcOf(p(0, 0), 50, 0, Math.PI / 2)],
    })
    arc.command("LINEA").enter()
    expect(arc.state().commandLine.prompt).toBe("LINEA Longitud de la línea:")

    cad.command("POL").click(p(0, 0))
    cad.press("A")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o [líNea]:"
    )
    cad.escape()

    cad.command("RECTANG").click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Precise esquina opuesta:"
    )
    cad.escape()

    cad.command("POLIGONO").type("2").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "Requiere un nº entero entre 3 y 1024."
    )
  })

  it("undoes with H at the Command prompt, and joins with U", () => {
    const cad = createHarness({ locale: es })
    cad.command("L").click(p(0, 0)).click(p(100, 0)).escape()
    expect(cad.entityCount).toBe(1)
    cad.command("H")
    expect(cad.entityCount).toBe(0)
    cad.command("U")
    expect(cad.commandLog().at(-1)).toBe("U UNIR")
  })

  it("offsets with DESFASE and answers its keywords by their capitals", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0))],
    })
    cad.command("DESFASE")
    expect(cad.state().commandLine.prompt).toBe(
      "DESFASE Precise distancia de desfase o [punto a Atravesar/Borrar/Capa] <punto a Atravesar>:"
    )
    expect(
      cad.state().commandOptions.map((option) => option.abbreviation)
    ).toEqual(["A", "B", "C"])
    expect(cad.state().dynamicInput?.fields[0].label).toBe(
      "Distancia de desfase"
    )
    cad.type("B").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DESFASE ¿Borrar objeto de origen tras desfase? [Sí/No] <No>:"
    )
    const answer = (keyword: string) => {
      for (const char of keyword) cad.press(char)
      cad.press("Enter")
    }
    answer("S")
    cad.type("C").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DESFASE Indique opción de capa para objetos desfasados [Actual/Origen] <Origen>:"
    )
    cad.enter().type("5").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DESFASE Designe objeto a desplazar o [Salir/Deshacer] <Salir>:"
    )
    cad.click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "DESFASE Precise punto en lado de desplazamiento o [Salir/Múltiple/Deshacer] <Salir>:"
    )
    answer("M")
    expect(cad.state().commandLine.prompt).toBe(
      "DESFASE Precise punto en lado de desplazamiento o [Salir/Deshacer] <siguiente objeto>:"
    )
    cad.click(p(50, 10)).enter().escape()
    cad.command("DESFASE").type("A").enter().click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "DESFASE Precise punto a atravesar o [Salir/Múltiple/Deshacer] <Salir>:"
    )
    expect(cad.commandLog().slice(0, 3)).toEqual([
      "DESFASE",
      "Parámetros actuales: Borrar origen=No  Capa=Origen  OFFSETGAPTYPE=0",
      "Precise distancia de desfase o [punto a Atravesar/Borrar/Capa] <punto a Atravesar>: B",
    ])
    expect(cad.commandLog()).toContain(
      "Parámetros actuales: Borrar origen=Sí  Capa=Origen  OFFSETGAPTYPE=0"
    )
  })

  it("asks RECORTA's and ALARGA's questions in Spanish AutoCAD's words", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(-200, 0), p(200, 0)), lineOf(p(0, -100), p(0, 100))],
    })
    cad.command("RECORTA")
    expect(cad.state().commandLine.prompt).toBe(
      "RECORTA Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar:"
    )
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "RECORTA Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [desHacer]:"
    )
    expect(cad.optionAnswer("Undo")).toBe("H")
    cad.escape().command("ALARGA")
    expect(cad.state().commandLine.prompt).toBe(
      "ALARGA Seleccione un objeto que alargar o use la tecla Mayús y seleccione para recortar:"
    )
    expect(cad.commandLog().slice(0, 2)).toEqual([
      "RECORTA",
      "Parámetros actuales: Proyección=SCP, Arista=Ninguno, Modo=Rápido",
    ])
  })

  it("asks EMPALME's questions in Spanish AutoCAD's words", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(-50, 0), p(200, 0)), lineOf(p(0, -50), p(0, 200))],
    })
    const answer = (keyword: string) => {
      for (const char of keyword) cad.press(char)
      cad.press("Enter")
    }
    cad.command("EMPALME")
    expect(cad.state().commandLine.prompt).toBe(
      "EMPALME Designe el primer objeto o [Deshacer/Polilínea/RAdio/múLtiple]:"
    )
    answer("RA")
    expect(cad.state().commandLine.prompt).toBe(
      "EMPALME Precise radio de empalme <0.00>:"
    )
    cad.type("10").enter().click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "EMPALME Designe el segundo objeto o use la tecla Mayús para aplicar esquina o [Radio]:"
    )
    expect(cad.commandLog()[1]).toBe(
      "Parámetros actuales: Modo = Recortar, Radio = 0.00"
    )
    cad.escape().command("EMPALME")
    answer("L")
    expect(cad.state().commandLine.prompt).toBe(
      "EMPALME Designe el primer objeto o [Deshacer/Polilínea/RAdio]:"
    )
    answer("P")
    // The sub-prompt spells it Radio, so R alone answers it there.
    expect(cad.state().commandLine.prompt).toBe(
      "EMPALME Designe una polilínea 2D o [Radio]:"
    )
    answer("R")
    expect(cad.state().commandLine.prompt).toBe(
      "EMPALME Precise radio de empalme <10.00>:"
    )
  })

  it("reports EMPALME's Polyline in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        polylineOf([p(0, 0), p(50, 0), p(100, 0), p(100, 100), p(105, 100)]),
      ],
    })
    cad.command("EMPALME")
    for (const char of "RA") cad.press(char)
    cad.press("Enter")
    cad.type("10").enter()
    cad.press("P")
    cad.press("Enter")
    cad.click(p(25, 0))
    expect(cad.commandLog().slice(-2)).toEqual([
      "1 línea resulta unida(s) con empalme",
      "1 resulta paralela(s)    1 resulta demasiado corta(s)",
    ])
  })

  it("asks CHAFLAN's questions in Spanish AutoCAD's words", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(-50, 0), p(200, 0)), lineOf(p(0, -50), p(0, 200))],
    })
    cad.command("CHAFLAN")
    expect(cad.state().commandLine.prompt).toBe(
      "CHAFLAN Designe la primera línea o [desHacer/Polilínea/Distancia/múLtiple]:"
    )
    cad.press("D")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "CHAFLAN Precise  primera distancia de chaflán <0.00>:"
    )
    cad.type("5").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "CHAFLAN Precise  segunda distancia de chaflán <5.00>:"
    )
    cad.enter().click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "CHAFLAN Designe la segunda línea o use la tecla Mayús para aplicar esquina o [Distancia]:"
    )
    cad.escape().command("CHAFLAN")
    cad.press("P")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "CHAFLAN Seleccione una polilínea 2D o [Distancia]:"
    )
    expect(cad.commandLog()[1]).toBe(
      "(Modo Recortar) Primera distancia de chaflán actual  = 0.00, Segunda distancia = 0.00"
    )
  })

  it("asks POLIGONO's questions in Spanish AutoCAD's words", () => {
    const cad = createHarness({ locale: es })
    cad.command("POLIGONO")
    expect(cad.state().commandLine.prompt).toBe(
      "POLIGONO Indique número de lados <4>:"
    )
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "POLIGONO Precise centro de polígono o [Lado]:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "POLIGONO Indique una opción [Inscrito en el círculo/Circunscrito alrededor del círculo] <I>:"
    )
    cad.press("C")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "POLIGONO Precise radio de círculo:"
    )
  })

  it("asks ELIPSE's questions in Spanish AutoCAD's words", () => {
    const cad = createHarness({ locale: es })
    cad.command("ELIPSE")
    expect(cad.state().commandLine.prompt).toBe(
      "ELIPSE Precise punto final de eje de elipse o [Arco/Centro]:"
    )
    cad.click(p(0, 0)).click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ELIPSE Precise distancia de otro eje o [Rotación]:"
    )
  })

  it("asks SPLINE's questions in Spanish AutoCAD's words", () => {
    const cad = createHarness({ locale: es })
    const answer = (keyword: string) => {
      for (const char of keyword) cad.press(char)
      cad.press("Enter")
    }
    cad.command("SPLINE")
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Precise primer punto o [Método/Nudos]:"
    )
    answer("N")
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Introduzca parametrización de nudos [Cuerda/raíz cuaDrada/Uniforme] <Cuerda>:"
    )
    answer("D")
    expect(cad.commandLog().at(-1)).toBe(
      "Parámetros actuales: Método=Ajustar Nudos=Raíz cuadrada"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Especifique punto siguiente o [iniciar Tangencia]:"
    )
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Precise el punto siguiente o [finalizar Tangencia/desHacer]:"
    )
  })

  it("answers CIRCULO's 3P typed whole and Diámetro by its D", () => {
    const cad = createHarness({ locale: es })
    cad.command("CIRCULO")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCULO Precise punto central para círculo o [3P/2P/Ttr (Tangente tangente radio)]:"
    )
    cad.type("3p").enter()
    expect(cad.state().dynamicInput?.prompt).toBe(
      "Precise primer punto del círculo:"
    )
    cad.click(p(100, 0)).click(p(0, 100)).click(p(-100, 0))
    cad.command("CIRCULO").click(p(300, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCULO Precise radio de círculo o [Diámetro] <100.00>:"
    )
    cad.type("D").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCULO Precise diámetro de círculo <200.00>:"
    )
    cad.type("200").enter()

    const radii = cad
      .entities()
      .map((e) => (e.type === "circle" ? e.radius : 0))
    expect(radii[0]).toBeCloseTo(100, 5)
    expect(radii[1]).toBeCloseTo(100)
  })

  it("takes ZOOM's EScala typed out, and Extensión as E and Enter", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0))],
    })
    cad.command("Z")
    expect(cad.state().commandLine.prompt).toBe(
      "ZOOM Precise esquina de ventana, indique un factor de escala (nX o nXP), o [Todo/Extensión/Previo/EScala/Ventana/Objeto]:"
    )
    for (const key of ["E", "S", "Enter"]) cad.press(key)
    expect(cad.state().commandLine.prompt).toBe(
      "ZOOM Indique factor de escala (nX o nXP):"
    )
  })

  it("justifies TEXTO by SIZ and the other two-letter codes", () => {
    const cad = createHarness({ locale: es })
    cad.command("TEXTO")
    expect(cad.commandLog().at(-1)).toBe(
      'Estilo de texto actual:  "Standard"  Altura de texto:  2.50  Anotativo:  No  Justificar:  Izquierda'
    )
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTO Precise punto inicial de texto o [jUstificar/Estilo]:"
    )
    cad.press("u")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTO Indique una opción [Izquierda/Centro/Derecha/Medio/SIZ/SC/SD/MI/MC/MD/II/IC/ID]:"
    )
    for (const char of "siz") cad.press(char)
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTO Precise punto superior izquierdo de texto:"
    )
    cad.click(p(0, 0)).type("5").enter().type("0").enter()
    expect(cad.state().commandLine.prompt).toBe("TEXTO Escriba el texto:")
    cad.type("A").enter()
    cad.escape()
    expect(cad.only("text")).toMatchObject({ justify: "tl" })
  })

  it("asks TEXTOM's corner in Spanish and justifies it by MC", () => {
    const cad = createHarness({ locale: es })
    cad.command("TEXTOM")
    expect(cad.commandLog().at(-1)).toBe(
      'Estilo de texto actual:  "Standard"  Altura del texto:  2.50  Anotativo:  No'
    )
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTOM Precise la primera esquina:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTOM Indique la esquina opuesta o [Altura/Justificar/Interlineado/Rotación/Estilo/aNchura]:"
    )
    for (const key of ["j", "Enter"]) cad.press(key)
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTOM Indique la justificación [SI/SC/SD/MI/MC/MD/II/IC/ID] <SI>:"
    )
    for (const key of ["M", "C", "Enter"]) cad.press(key)
    for (const key of ["i", "Enter"]) cad.press(key)
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTOM Indique el tipo de interlineado [Al menos/Exactamente] <Al menos>:"
    )
    cad.press("Enter")
    for (const key of ["n", "Enter"]) cad.press(key)
    expect(cad.state().commandLine.prompt).toBe("TEXTOM Indique la anchura:")
    cad.escape().command("TEXTOM").click(p(0, 0))
    for (const key of ["j", "Enter", "M", "C", "Enter"]) cad.press(key)
    cad.click(p(100, -50)).type("A").enter()
    expect(cad.only("mtext")).toMatchObject({ attachment: "mc" })
  })

  it("reports an unknown command in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("LINE")
    expect(cad.commandLog()).toEqual(['Comando "LINE" desconocido.'])
  })

  it("sets the SCP with SCP, Univ typed as U and gUArdado as UA", () => {
    const cad = createHarness({ locale: es })
    cad.command("SCP")
    expect(cad.commandLog()).toEqual([
      "SCP",
      "Nombre de scp actual:  *UNIVERSAL*",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "SCP Indique origen de SCP o [gUArdado/oBjeto/PRev/Vista/Univ/X/Y/Z/ejEZ] <Univ>:"
    )
    cad.click(p(10, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "SCP Precise punto en eje X o <Aceptar>:"
    )
    cad.enter()
    cad.command("SCP").type("ua").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "SCP Indique una opción [Rest/Guardar/Supr/?]:"
    )
    cad.escape().command("SCP")
    expect(cad.optionAbbreviations()).toEqual([
      "UA",
      "B",
      "PR",
      "V",
      "U",
      "X",
      "Y",
      "Z",
      "EZ",
    ])
    cad.type("u").enter()
    expect(cad.runtime.document.getSettings().ucs.origin).toBeCloseToPoint(
      p(0, 0)
    )
    cad.command("SIMBSCP")
    expect(cad.state().commandLine.prompt).toBe(
      "SIMBSCP Indique una opción [ACT/DES/Sin origen/Origen] <ACT>:"
    )
  })

  it("turns the view with PLANTA, scp Actual on its A", () => {
    const cad = createHarness({ locale: es })
    cad.command("SCP").option("Z").enter()
    cad.command("PLANTA")
    expect(cad.state().commandLine.prompt).toBe(
      "PLANTA Indique una opción [scp Actual/SCP/Universal] <Actual>:"
    )
    expect(cad.optionAbbreviations()).toEqual(["A", "SCP", "U"])
    cad.press("a")
    cad.press("Enter")
    expect(cad.runtime.viewport.right).toBeCloseToPoint(p(0, 1))
    cad.command("PLANTA")
    cad.runtime.setCommandLineText("scp")
    cad.runtime.submitCommandLine()
    expect(cad.state().commandLine.prompt).toBe(
      "PLANTA Indique nombre de SCP o [?]:"
    )
  })

  it("sets the elevation with ELEV, and RECTANG's Alt-objeto on its A", () => {
    const cad = createHarness({ locale: es })
    cad.command("ELEV").type("5").enter().type("2").enter()
    expect(cad.runtime.document.getSettings()).toMatchObject({
      elevation: 5,
      thickness: 2,
    })
    cad.command("RECTANG")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Precise primer punto de esquina o [Elevación/Alt-objeto]:"
    )
    expect(cad.optionAbbreviations()).toEqual(["E", "A"])
    cad.press("a")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Precise Alt-objeto para rectángulos <0.00>:"
    )
    cad.type("3").enter().escape()
    expect(cad.commandLog().slice(-3)).toEqual([
      "Precise primer punto de esquina o [Elevación/Alt-objeto]: a",
      "Precise Alt-objeto para rectángulos <0.00>: 3",
      "Precise primer punto de esquina o [Elevación/Alt-objeto]: *Cancelar*",
    ])
    cad.command("RECTANG")
    expect(cad.commandLog().at(-1)).toBe(
      "Modos de rectángulo actuales:  Alt-objeto=3.00"
    )
  })

  it("measures with DIST and identifies a point with ID, in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("DI").type("0,0").enter().type("3,4,12").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "Distancia = 13.00, Ángulo en el plano XY = 53.13, Ángulo a partir del plano XY = 67.38\n" +
        "Incremento X = 3.00, Incremento Y = 4.00,   Incremento Z = 12.00"
    )
    cad.escape()
    cad.command("ID")
    expect(cad.runtime.text.prompt("idPoint")).toBe("Precise punto")
    cad.type("1,2,3").enter()
    expect(cad.commandLog().at(-1)).toBe(" X = 1.00     Y = 2.00     Z = 3.00")
  })

  it("refuses a setting in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({ locale: es })
    const last = () => cad.commandLog().at(-1)

    cad.command("-COLOR").type("rosa").enter()
    expect(last()).toBe("Se necesita un número o nombre de color normalizado.")
    cad.type("r").enter()
    expect(cad.state().currentColor).toBe("#ff0000")

    cad.command("-GROSORLIN").type("fino").enter()
    expect(last()).toBe("Se precisa un grosor en unidades de grosor de línea.")
    cad.type("0.33").enter()
    expect(last()).toBe(
      "Grosor de línea redondeado al valor válido más cercano de 0.35 mm"
    )

    cad.command("-REFENT").type("XYZ").enter()
    expect(last()).toBe("Modos no válidos de referencia a objetos.")
    cad.escape()

    cad.command("ESCALATL").type("0").enter()
    expect(last()).toBe("El valor debe ser positivo y diferente de cero.")
  })

  it("sets the views as Spanish AutoCAD's captures show them", () => {
    const cad = createHarness({ locale: es })
    cad.command("-VISTA").press("o")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "VISTA Indique una opción [sUperior/Inferior/Frontal/Posterior/IZquierda/Derecha] <sUperior>:"
    )
    cad.type("u").enter()
    expect(cad.runtime.viewport.isPlan).toBe(true)
    cad.command("-VISTA")
    for (const char of "soiso") cad.press(char)
    cad.press("Enter")
    expect(cad.runtime.viewport.isPlan).toBe(false)
    cad.command("-VISTA")
    for (const char of "superior") cad.press(char)
    cad.press("Enter")
    expect(cad.runtime.viewport.isPlan).toBe(true)
    cad.command("-PV")
    expect(cad.commandLog().at(-1)).toBe(
      "Dirección de vista actual:  VIEWDIR=0.00,0.00,1.00"
    )
    expect(cad.state().commandLine.prompt).toBe("PTOVISTA [Rotación]:")
    cad.press("r")
    cad.press("Enter")
    expect(cad.runtime.text.prompt("viewAngleInPlane")).toBe(
      "Ángulo a partir del eje X en el plano XY"
    )
  })

  it("defines an attribute with AT, its modes line as the product prints it", () => {
    const cad = createHarness({ locale: es })
    cad.command("AT")
    expect(cad.commandLog().at(-1)).toBe(
      "Modos de atributo actuales:\nInvisible=N  Constante=N  Verificable=N  Predefinido=N  Bloquear posición=S  Anotativo=N  línea Múltiple=N"
    )
  })

  it("switches EDITARTEXTO to Simple, as Autodesk's table names the mode", () => {
    const cad = createHarness({ locale: es })
    cad.command("EDITARTEXTO").option("Mode")
    expect(cad.state().commandOptions.map((option) => option.label)).toEqual([
      "Modo: Simple",
    ])
  })

  it("names the palette's Z rows as Spanish AutoCAD does", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L" })],
    })
    cad.select("L")
    const info = cad.state().properties.info!
    expect(info.general.map((row) => row.label)).toEqual(["Altura de objeto"])
    expect(
      info.groups.flatMap((group) => group.rows).map((row) => row.label)
    ).toEqual(expect.arrayContaining(["Delta Z", "Inicio Z", "Fin Z"]))
  })

  it("lists the commands by their Spanish names, described in Spanish", () => {
    expect(
      commandCatalog(es).find((command) => command.id === "PURGE")
    ).toEqual(
      expect.objectContaining({
        name: "LIMPIA",
        aliases: ["LI"],
        description: "Eliminar las definiciones de bloque no utilizadas",
      })
    )
  })
})

describe("Arabic: its own interface, the global command language", () => {
  // There is no Arabic AutoCAD, and someone who drafts in Arabic works in the
  // English one: the palettes speak Arabic, the command line English.
  it("names the interface in Arabic and leaves the drawing's data alone", () => {
    const { names, tools } = createHarness({ locale: ar }).state()
    expect(names.snaps.endpoint).toBe("نقطة النهاية")
    expect(names.byLayer).toBe("بالطبقة")
    expect(names.linetypes.DashDot).toBe("Dash dot")
    expect(tools.find((tool) => tool.id === "line")?.label).toBe("خط")
    expect(tools.find((tool) => tool.id === "line")?.shortcut).toBe("L")
  })

  it("draws with LINE and L, and asks in English", () => {
    const cad = createHarness({ locale: ar })
    cad.command("LINE").escape().command("l")
    expect(cad.commandLog()).toEqual([
      "LINE",
      "Specify first point: *Cancel*",
      "l LINE",
    ])
    cad.click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Close/Undo]:"
    )
    expect(cad.scene().lang).toBe("en")
    expect(cad.state().commandLine.lang).toBe("en")
  })

  it("runs a command pasted from Arabic prose, its bidi isolates dropped", () => {
    const cad = createHarness({ locale: ar })
    const isolated = (name: string) =>
      String.fromCodePoint(0x2068) + name + String.fromCodePoint(0x2069)
    cad.runtime.setCommandLineText(isolated("L"))
    expect(cad.state().commandLine.buffer).toBe("L")
    cad.runtime.submitCommandLine()
    expect(cad.activeToolId()).toBe("line")
  })

  it("counts in all six of its plural forms, with latin digits", () => {
    const text = engineText(ar)
    expect(
      [0, 1, 2, 3, 11, 100].map((count) => text.propertyTitle("objects", count))
    ).toEqual([
      "لا عناصر",
      "عنصر واحد",
      "عنصران",
      "3 عناصر",
      "11 عنصرًا",
      "100 عنصر",
    ])
  })
})
