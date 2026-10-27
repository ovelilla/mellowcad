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

// Each transcript is AutoCAD 2027's console answering the same input (Center,
// Dynamic and the real-time default are not offered here).
describe("ZOOM asks as AutoCAD 2027", () => {
  // probe view/p104
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

  // probes view/p117–p119
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

  // probe view/p113
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

  // probes view/p141; p100 and p108 (Extents and All on what is drawn say
  // nothing), p136 and p137 (with nothing drawn they regenerate).
  it("says what Extents and Previous did", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ZOOM")
    answer(cad, "P")
    cad.command("ZOOM")
    answer(cad, "E")
    cad.command("ZOOM")
    answer(cad, "A")
    expect(cad.commandLog()).toEqual([
      "ZOOM",
      `${ZOOM} P`,
      "No previous view saved.",
      "ZOOM",
      `${ZOOM} E`,
      "ZOOM",
      `${ZOOM} A`,
    ])
    for (const option of ["E", "A"]) {
      const empty = createHarness()
      empty.command("ZOOM")
      answer(empty, option)
      expect(empty.commandLog().at(-1)).toBe("Regenerating model.")
    }
  })

  // probes view/p105, p106 (the first prompt), p114, p116 (Scale's)
  it("refuses a factor of zero or less, and asks again", () => {
    for (const [locale, message] of [
      [undefined, "Value must be positive and nonzero."],
      [es, "El valor debe ser positivo y diferente de cero."],
    ] as const) {
      for (const typed of ["0", "-2"]) {
        const cad = createHarness({ locale, entities: drawing() })
        const scale = cad.runtime.viewport.scale
        cad.command("ZOOM")
        answer(cad, typed)
        expect(cad.commandLog().at(-1)).toBe(message)
        expect(cad.activeToolId()).toBe("zoom")
        answer(cad, locale ? "ES" : "S", typed)
        expect(cad.commandLog().at(-1)).toBe(message)
        expect(cad.activeToolId()).toBe("zoom")
        expect(cad.runtime.viewport.scale).toBe(scale)
      }
    }
    const cad = createHarness({ entities: drawing() })
    cad.command("ZOOM")
    answer(cad, "S", "-2", "2X")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Enter a scale factor (nX or nXP): -2",
      "Value must be positive and nonzero.",
      "Enter a scale factor (nX or nXP): 2X",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  // probe view/p110: model space takes nXP as nX.
  it("takes nXP as nX at its first prompt and at Scale's", () => {
    const cad = createHarness({ entities: drawing() })
    const scale = () => cad.runtime.viewport.scale
    const before = scale()
    cad.command("ZOOM")
    answer(cad, "2XP")
    expect(scale()).toBeCloseTo(before * 2)
    cad.command("ZOOM")
    answer(cad, "S", "0.5xp")
    expect(scale()).toBeCloseTo(before)
    expect(cad.activeToolId()).toBe("select")
  })

  // probe view/p151
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

  // probes view/p104, p113 (es-ES)
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
      "Enter an option [Top/Bottom/Front/BAck/Left/Right]<Top>: FOO",
      "Invalid option keyword.",
      "Enter an option [Top/Bottom/Front/BAck/Left/Right]<Top>:",
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
      "Indique una opción [sUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]<sUperior>: U",
      "Regenerando modelo.",
    ])
  })
})

// AutoCAD 2027's console answering the same input, view/p244, p248, p250 (the
// compass and tripod, Enter's default at the view point, is not offered).
describe("VPOINT asks as AutoCAD 2026", () => {
  it("asks as AutoCAD 2026, and refuses what it cannot take", () => {
    const cad = createHarness()

    cad.command("-VPOINT")
    answer(cad, "FOO", "R")
    expect(cad.state().commandLine.prompt).toBe(
      "-VPOINT Enter angle in XY plane from X axis <270>:"
    )
    answer(cad, "FOO", "315", "FOO", "")

    expect(cad.commandLog()).toEqual([
      "-VPOINT",
      "Current view direction:  VIEWDIR=0.00,0.00,1.00",
      "Specify a view point or [Rotate]: FOO",
      "Invalid input. Try again.",
      "Current view direction:  VIEWDIR=0.00,0.00,1.00",
      "Specify a view point or [Rotate]: R",
      "Enter angle in XY plane from X axis <270>: FOO",
      "Requires valid numeric angle or second point.",
      "Enter angle in XY plane from X axis <270>: 315",
      "Enter angle from XY plane <90>: FOO",
      "Requires valid numeric angle or second point.",
      "Enter angle from XY plane <90>:",
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
      "PTOVISTA Ángulo a partir del eje X en el plano XY <270>:"
    )
  })

  // probe view/p253 (en-US, es-ES): VPOINT, UCS Z 30, then -VPOINT. From 1,0,0,
  // as VIEWDIR keeps the length typed there (p254), which is not built.
  it("switches to the WCS in another UCS, reporting VIEWDIR there", () => {
    const cad = createHarness({ entities: drawing() })
    cad.runtime.setDocumentPrecision(4)
    answer(cad, "-VPOINT", "1,0,0", "UCS", "Z", "30")
    const from = cad.commandLog().length
    answer(cad, "-VPOINT", "0,0,1")
    expect(cad.commandLog().slice(from)).toEqual([
      "-VPOINT",
      "*** Switching to the WCS ***",
      "Current view direction:  VIEWDIR=1.0000,0.0000,0.0000",
      "Specify a view point or [Rotate]: 0,0,1",
      "*** Returning to the UCS ***",
      "Regenerating model.",
    ])
    answer(cad, "-VPOINT", "R", "0", "0")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Enter angle from XY plane <90>: 0",
      "*** Returning to the UCS ***",
      "Regenerating model.",
    ])

    const spanish = createHarness({ locale: es, entities: drawing() })
    spanish.runtime.setDocumentPrecision(4)
    answer(spanish, "-PTOVISTA", "1,0,0", "SCP", "Z", "30")
    const start = spanish.commandLog().length
    answer(spanish, "-PTOVISTA", "0,0,1")
    expect(spanish.commandLog().slice(start)).toEqual([
      "-PTOVISTA",
      "*** Cambiando al SCU ***",
      "Dirección de vista actual:  VIEWDIR=1.0000,0.0000,0.0000",
      "Precise un punto de vista o [Rotación]: 0,0,1",
      "*** Volviendo al SCP ***",
      "Regenerando modelo.",
    ])
  })

  // probe view/p252: neither program writes `-0.0000` (b/negzero's sweep).
  it("writes no negative zero in VIEWDIR", () => {
    const cad = createHarness()
    cad.runtime.setDocumentPrecision(4)
    answer(cad, "-VPOINT", "0,0,-1", "-VPOINT")
    expect(cad.commandLog().at(-1)).toBe(
      "Current view direction:  VIEWDIR=0.0000,0.0000,-1.0000"
    )
    answer(cad, "", "-VPOINT", "-1,0,0", "UCS", "X", "90", "-VPOINT")
    expect(cad.commandLog().at(-1)).toBe(
      "Current view direction:  VIEWDIR=-1.0000,0.0000,0.0000"
    )
  })

  // WHY: the prompt declares Tripod unlisted (table 32848, es `trípode`),
  // and the console opens the compass and tripod with it (acc/vp1, vp2,
  // vp5 of 2026-10-14; view/p256), which is not built: it is refused as any
  // answer.
  it("refuses Tripod, which opens the compass and tripod", () => {
    const cad = createHarness()
    cad.command("VPOINT")
    answer(cad, "T", "TRIPOD")
    expect(cad.commandLog().slice(-6)).toEqual([
      "Specify a view point or [Rotate]: T",
      "Invalid input. Try again.",
      "Current view direction:  VIEWDIR=0.00,0.00,1.00",
      "Specify a view point or [Rotate]: TRIPOD",
      "Invalid input. Try again.",
      "Current view direction:  VIEWDIR=0.00,0.00,1.00",
    ])

    const spanish = createHarness({ locale: es })
    spanish.command("PTOVISTA")
    answer(spanish, "TRÍPODE")
    expect(spanish.commandLog().slice(-3, -1)).toEqual([
      "Precise un punto de vista o [Rotación]: TRÍPODE",
      "Entrada no válida. Vuelva a intentarlo.",
    ])
  })
})

// AutoCAD 2027's desktop (research/probes/view d09, VWD-14).
describe("-VPOINT's Escape in a turned UCS", () => {
  it("says it returns to the UCS after *Cancel*", () => {
    const cad = answer(
      createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] }),
      "_LINE",
      "200,200",
      "210,200",
      "",
      "UCS",
      "Z",
      "30",
      "-VPOINT"
    )
    const from = cad.commandLog().length
    cad.escape()
    expect(cad.commandLog().slice(from)).toEqual([
      "Specify a view point or [Rotate]: *Cancel*",
      "*** Returning to the UCS ***",
    ])
  })
})
