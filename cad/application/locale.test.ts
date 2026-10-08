import compile from "icu-minify/compile"
import { describe, expect, it } from "vitest"

import { createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
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
    // ERASE is not in its names, so it keeps its global name and no alias.
    cad.select("A").command("ERASE")
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

  it("draws with LINEA, L and _LINE, and undoes a segment with H", () => {
    const cad = createHarness({ locale: es })
    cad.command("LINEA").escape().command("_LINE").escape().command("l")
    expect(cad.commandLog()).toEqual(["LINEA", "LINEA", "LINEA"])
    cad.click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    const state = cad.state()
    expect(state.commandLine.prompt).toBe("LINEA [Cerrar/desHacer]:")
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

  it("undoes with H at the Command prompt, and joins with U", () => {
    const cad = createHarness({ locale: es })
    cad.command("L").click(p(0, 0)).click(p(100, 0)).escape()
    expect(cad.entityCount).toBe(1)
    cad.command("H")
    expect(cad.entityCount).toBe(0)
    cad.command("U")
    expect(cad.commandLog().at(-1)).toBe("UNIR")
  })

  it("offsets with DESFASE and answers its keywords by their capitals", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0))],
    })
    cad.command("DESFASE")
    expect(cad.state().commandLine.prompt).toBe(
      "DESFASE [punto a Atravesar/Borrar: No/Capa: Origen/Múltiple: DES] <punto a Atravesar>:"
    )
    expect(
      cad.state().commandOptions.map((option) => option.abbreviation)
    ).toEqual(["A", "B", "C", "M"])
    expect(cad.state().dynamicInput?.fields[0].label).toBe(
      "Distancia de desfase"
    )
  })

  it("answers CIRCULO's 3P typed whole and Diámetro by its D", () => {
    const cad = createHarness({ locale: es })
    cad.command("CIRCULO")
    expect(cad.state().commandLine.prompt).toBe("CIRCULO [3P/2P/Ttr]:")
    cad.type("3p").enter()
    cad.click(p(100, 0)).click(p(0, 100)).click(p(-100, 0))
    cad.command("CIRCULO").click(p(300, 0))
    expect(cad.state().commandLine.prompt).toBe("CIRCULO [Diámetro]:")
    cad.type("D").enter().type("200").enter()

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
      "ZOOM [Todo/Extensión/Previo/EScala/Ventana/Objeto]:"
    )
    for (const key of ["E", "S", "Enter"]) cad.press(key)
    expect(cad.state().dynamicInput?.fields[0].label).toBe("Factor de escala")
  })

  it("justifies TEXTO by SIZ and the other two-letter codes", () => {
    const cad = createHarness({ locale: es })
    cad.command("TEXTO").press("u")
    cad.press("Enter")
    expect(cad.commandLog().at(-1)).toBe(
      "Indique una opción [Izquierda/Centro/Derecha/Medio/SIZ/SC/SD/MI/MC/MD/II/IC/ID]:"
    )
    cad.type("siz").enter()
    cad.click(p(0, 0)).type("5").enter().type("0").enter().type("A").enter()
    cad.escape()
    expect(cad.only("text")).toMatchObject({ justify: "tl" })
  })

  it("asks TEXTOM's corner in Spanish and justifies it by MC", () => {
    const cad = createHarness({ locale: es })
    cad.command("TEXTOM").click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTOM [Altura/Justificar/Interlineado/Rotación/Estilo/aNchura]:"
    )
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
      "Nombre de scp actual: *UNIVERSAL*",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "SCP [gUArdado/oBjeto/PRev/Vista/Univ/X/Y/Z/ejEZ]:"
    )
    const asks = () => {
      const field = cad.runtime.dynamicInput.getSession()?.fields[0]
      return field?.prompt ? cad.runtime.text.prompt(field.prompt) : null
    }
    expect(asks()).toBe("Indique origen de SCP")
    cad.click(p(10, 0))
    expect(asks()).toBe("Precise punto en eje X o <Aceptar>")
    cad.enter()
    cad.command("SCP").type("ua").enter()
    expect(cad.state().commandLine.prompt).toBe("SCP [Rest/Guardar/Supr]:")
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
      "SIMBSCP [ACT/DES/Sin origen/Origen] <ACT>:"
    )
  })

  it("turns the view with PLANTA, scp Actual on its A", () => {
    const cad = createHarness({ locale: es })
    cad.command("SCP").option("Z").enter()
    cad.command("PLANTA")
    expect(cad.state().commandLine.prompt).toBe(
      "PLANTA [scp Actual/SCP/Universal]:"
    )
    expect(cad.optionAbbreviations()).toEqual(["A", "SCP", "U"])
    cad.press("a")
    cad.press("Enter")
    expect(cad.runtime.viewport.right).toBeCloseToPoint(p(0, 1))
    cad.command("PLANTA").type("scp").enter()
    expect(cad.runtime.text.prompt("planUcsName")).toBe(
      "Indique nombre de SCP o [?]"
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
      "RECTANG [Elevación/Alt-objeto]:"
    )
    expect(cad.optionAbbreviations()).toEqual(["E", "A"])
    cad.press("a")
    cad.press("Enter")
    cad.type("3").enter().escape()
    cad.command("RECTANG")
    expect(cad.commandLog().at(-1)).toBe(
      "Modos de rectángulo actuales: Alt-objeto=3.00"
    )
  })

  it("measures with DIST and identifies a point with ID, in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("DI").type("0,0").enter().type("3,4,12").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "Distancia = 13.00,  Ángulo en plano XY = 53.13,  Ángulo desde plano XY = 67.38\n" +
        "Delta X = 3.00,  Delta Y = 4.00,   Delta Z = 12.00"
    )
    cad.escape()
    cad.command("ID")
    expect(cad.runtime.text.prompt("idPoint")).toBe("Precise punto")
    cad.type("1,2,3").enter()
    expect(cad.commandLog().at(-1)).toBe("X = 1.00     Y = 2.00     Z = 3.00")
  })

  it("sets the views as Spanish AutoCAD's captures show them", () => {
    const cad = createHarness({ locale: es })
    cad.command("-VISTA").press("o")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "VISTA [SUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]:"
    )
    cad.type("su").enter()
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
      "Modos de atributo actuales:  Invisible=N  Constante=N  Verificable=N  Predefinido=N  Bloquear posición=S"
    )
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
    expect(cad.commandLog()).toEqual(["LINE", "LINE"])
    cad.click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
    expect(cad.state().commandLine.prompt).toBe("LINE [Close/Undo]:")
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
