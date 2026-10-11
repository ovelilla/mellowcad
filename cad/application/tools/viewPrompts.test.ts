import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const ZOOM =
  "Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]:"

const drawing = () => [lineOf(p(0, 0), p(100, 0), { id: "A" })]

// Each transcript is AutoCAD 2023's console answering the same input (Center,
// Dynamic and the real-time default are not offered here).
describe("ZOOM asks as AutoCAD 2026", () => {
  it("refuses what is neither a corner, a factor nor a keyword", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ZOOM")
    expect(cad.state().commandLine.prompt).toBe(`ZOOM ${ZOOM}`)
    answer(cad, "FOO")
    expect(cad.commandLog()).toEqual([
      "ZOOM",
      `${ZOOM} FOO`,
      "Requires a distance, numberX, or option keyword.",
    ])
  })

  it("asks Window's corners again after a wrong one, and a point's corner in place", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ZOOM")
    answer(cad, "W", "FOO", "0,0", "FOO", "-10,-10", "50,50")
    cad.command("ZOOM")
    answer(cad, "0,0", "FOO", "10,10")

    expect(cad.commandLog().slice(1)).toEqual([
      `${ZOOM} W`,
      "Specify first corner: FOO",
      "Invalid window specification.",
      "Specify first corner: 0,0",
      "Specify opposite corner: FOO",
      "Invalid window specification.",
      "Specify first corner: -10,-10",
      "Specify opposite corner: 50,50",
      "ZOOM",
      `${ZOOM} 0,0`,
      "Specify opposite corner: FOO",
      "Invalid window specification.",
      "Specify opposite corner: 10,10",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("writes picked corners on the first prompt's line", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ZOOM").click(p(-10, -10)).click(p(50, 50))
    expect(cad.commandLog()).toEqual([
      "ZOOM",
      `${ZOOM} Specify opposite corner:`,
    ])
  })

  it("takes a factor at its first prompt and at Scale's", () => {
    const cad = createHarness({ entities: drawing() })
    const scale = () => cad.runtime.viewport.scale
    const before = scale()
    cad.command("ZOOM")
    answer(cad, "2X")
    expect(scale()).toBeCloseTo(before * 2)
    cad.command("ZOOM")
    answer(cad, "S", "FOO", "0.5x")
    expect(scale()).toBeCloseTo(before)
    expect(cad.commandLog().slice(-4)).toEqual([
      `${ZOOM} S`,
      "Enter a scale factor (nX or nXP): FOO",
      "Requires a distance (or numberX).",
      "Enter a scale factor (nX or nXP): 0.5x",
    ])
  })

  it("says what Extents and Previous did", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ZOOM")
    answer(cad, "P")
    cad.command("ZOOM")
    answer(cad, "E")
    expect(cad.commandLog()).toEqual([
      "ZOOM",
      `${ZOOM} P`,
      "No previous view saved.",
      "ZOOM",
      `${ZOOM} E`,
      "Regenerating model.",
    ])
  })

  it("frames the objects Select objects closes", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ZOOM")
    answer(cad, "O", "FOO", "L")
    cad.enter()
    expect(cad.commandLog().slice(1)).toEqual([
      `${ZOOM} O`,
      "Select objects: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
      "Select objects: L",
      "1 found",
      "Select objects:",
      "Regenerating model.",
    ])
    expect(cad.runtime.viewport.worldCenter()).toBeCloseToPoint(p(50, 0))
  })

  it("asks and refuses in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("ZOOM")
    answer(cad, "FOO", "ES", "FOO")
    expect(cad.commandLog()).toEqual([
      "ZOOM",
      "Precise esquina de ventana, indique un factor de escala (nX o nXP), o [Todo/Extensión/Previo/EScala/Ventana/Objeto]: FOO",
      "Requiere una distancia, un factorX o una opción.",
      "Precise esquina de ventana, indique un factor de escala (nX o nXP), o [Todo/Extensión/Previo/EScala/Ventana/Objeto]: ES",
      "Indique factor de escala (nX o nXP): FOO",
      "Requiere una distancia (o un factor X).",
    ])
  })
})

describe("-VIEW asks as AutoCAD 2026", () => {
  it("offers Orthographic, then its six views with Top as the default", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("-VIEW")
    answer(cad, "FOO", "O", "FOO")
    cad.enter()
    expect(cad.commandLog()).toEqual([
      "-VIEW",
      "Enter an option [Orthographic]: FOO",
      "Invalid option keyword.",
      "Enter an option [Orthographic]: O",
      "Enter an option [Top/Bottom/Front/BAck/Left/Right] <Top>: FOO",
      "Invalid option keyword.",
      "Enter an option [Top/Bottom/Front/BAck/Left/Right] <Top>:",
      "Regenerating model.",
    ])
    expect(cad.runtime.viewport.isPlan).toBe(true)
  })

  it("answers a preset typed at the first prompt, spelled as AutoCAD spells it there", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("-VIEW")
    answer(cad, "SWI")
    expect(cad.state().view.preset).toBe("SWiso")
    cad.command("-VIEW")
    answer(cad, "RI")
    expect(cad.state().view.preset).toBe("Right")
    cad.command("-VIEW")
    answer(cad, "O", "R")
    expect(cad.state().view.preset).toBe("Right")
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("-VISTA")
    answer(cad, "O", "U")
    expect(cad.commandLog()).toEqual([
      "-VISTA",
      "Indique una opción [Ortogonal]: O",
      "Indique una opción [sUperior/Inferior/Frontal/Posterior/IZquierda/Derecha] <sUperior>: U",
      "Regenerando modelo.",
    ])
  })
})

// AutoCAD 2023's console answering the same input (the compass and tripod,
// Enter's default at the view point, is not offered).
describe("VPOINT asks as AutoCAD 2026", () => {
  it("asks as AutoCAD 2026, and refuses what it cannot take", () => {
    const cad = createHarness()

    cad.command("-VPOINT")
    answer(cad, "FOO", "R")
    expect(cad.state().commandLine.prompt).toBe(
      "-VPOINT Enter angle in XY plane from X axis <270.00>:"
    )
    answer(cad, "FOO", "315", "FOO", "")

    expect(cad.commandLog()).toEqual([
      "-VPOINT",
      "Current view direction:  VIEWDIR=0.00,0.00,1.00",
      "Specify a view point or [Rotate]: FOO",
      "Invalid input. Try again.",
      "Current view direction:  VIEWDIR=0.00,0.00,1.00",
      "Specify a view point or [Rotate]: R",
      "Enter angle in XY plane from X axis <270.00>: FOO",
      "Requires valid numeric angle or second point.",
      "Enter angle in XY plane from X axis <270.00>: 315",
      "Enter angle from XY plane <90.00>: FOO",
      "Requires valid numeric angle or second point.",
      "Enter angle from XY plane <90.00>:",
      "Regenerating model.",
    ])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })

    cad.command("PTOVISTA")
    expect(cad.state().commandLine.prompt).toBe(
      "PTOVISTA Precise un punto de vista o [Rotación]:"
    )
    answer(cad, "FOO", "R")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Precise un punto de vista o [Rotación]: FOO",
      "Entrada no válida. Vuelva a intentarlo.",
      "Dirección de vista actual:  VIEWDIR=0.00,0.00,1.00",
      "Precise un punto de vista o [Rotación]: R",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "PTOVISTA Ángulo a partir del eje X en el plano XY <270.00>:"
    )
  })
})
