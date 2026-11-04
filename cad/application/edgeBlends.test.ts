import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepIsClosed, brepVolume } from "../geometry/solids"
import type { Vec3 } from "../geometry/Vec3"
import type { Solid3dEntity } from "../domain/entities"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"
import { THEME } from "../scene/theme"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const solids = (cad: CadHarness) =>
  cad.entities().filter((e): e is Solid3dEntity => e.type === "solid3d")

const volumes = (cad: CadHarness) =>
  solids(cad).map((s) => Math.round(brepVolume(s.brep) * 1e4) / 1e4)

const screen = (cad: CadHarness, point: Vec3) =>
  cad.runtime.viewport.worldToScreen(point)

const settingsOf = (cad: CadHarness) => {
  const s = cad.runtime.document.getSettings()
  return [s.filletRadius3d, s.chamferDistance1, s.chamferDistance2]
}

/** Where the fillet's round lies: its cylinder's axis, as Y and Z (the probes' MPDUMP `Origin`). */
function filletAxis(cad: CadHarness): { y: number; z: number } | null {
  const face = solids(cad)[0].brep.faces.find(
    (f) => f.surface.kind === "cylinder"
  )
  if (face?.surface.kind !== "cylinder") return null
  const { origin } = face.surface
  return {
    y: Math.round(origin.y * 1e6) / 1e6,
    z: Math.round(origin.z * 1e6) / 1e6,
  }
}

/** A 10 box at the origin seen from (-1.3, -2.2, 1.6), as the probes look at it. */
function box(locale?: typeof es, height = "10"): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  answer(cad, "_BOX", "0,0,0", "10,10", height)
  answer(cad, "_-VPOINT", "-1.3,-2.2,1.6", "_ZOOM", "_E")
  return cad
}

describe("FILLETEDGE", () => {
  it("rounds the edge a typed point takes, at the radius given (filletedge/f01)", () => {
    const cad = box()
    expect(written(cad, "FILLETEDGE", "R", "2", "5,0,10", "", "")).toEqual([
      "FILLETEDGE",
      "Radius = 1.00",
      "Select an edge or [Chain/Loop/Radius]: R",
      "Enter fillet radius or [Expression] <1.00>: 2",
      "Select an edge or [Chain/Loop/Radius]: 5,0,10",
      "Select an edge or [Chain/Loop/Radius]:",
      "1 edge(s) selected for fillet.",
      "Press Enter to accept the fillet or [Radius]:",
    ])
    expect(volumes(cad)).toEqual([991.4159])
    expect(brepIsClosed(solids(cad)[0].brep)).toBe(true)
    expect(solids(cad)[0].primitive).toBeUndefined()
    // FILLETRAD3D keeps it, saved in the drawing.
    expect(cad.runtime.document.getSettings().filletRadius3d).toBe(2)
    expect(written(cad, "U")).toContain("FILLETEDGE")
    expect(volumes(cad)).toEqual([1000])
  })

  it("refuses what is no edge, a radius of 0 or less, and takes an expression (f01)", () => {
    const cad = box()
    expect(written(cad, "FILLETEDGE", "FOO")).toEqual([
      "FILLETEDGE",
      "Radius = 1.00",
      "Select an edge or [Chain/Loop/Radius]: FOO",
      "*Invalid selection*",
      "Expects a point or Chain/Loop",
    ])
    expect(written(cad, "R", "-1", "0")).toContain(
      "Radius too small. *Invalid*"
    )
    answer(cad, "E", "2*1.5", "10,5,10", "")
    expect(written(cad, "R", "1", "")).toEqual([
      "Press Enter to accept the fillet or [Radius]:R",
      "Specify Radius or [Expression] <3.00>: 1",
      "Press Enter to accept the fillet or [Radius]:",
    ])
    expect(cad.runtime.document.getSettings().filletRadius3d).toBe(1)
  })

  it("takes a box's top loop, the front's first and the top's Next (f03)", () => {
    const cad = box()
    expect(written(cad, "FILLETEDGE", "L", "5,0,10", "N", "A")).toEqual([
      "FILLETEDGE",
      "Radius = 1.00",
      "Select an edge or [Chain/Loop/Radius]: L",
      "Select edge of loop or [Edge/Chain/Radius]: 5,0,10",
      "Enter an option [Accept/Next] <Accept>: N",
      "Enter an option [Accept/Next] <Accept>: A",
    ])
    expect(written(cad, "", "")).toEqual([
      "Select edge of loop or [Edge/Chain/Radius]:",
      "4 edge(s) selected for fillet.",
      "Press Enter to accept the fillet or [Radius]:",
    ])
    expect(volumes(cad)).toEqual([991.7994])
  })

  it("runs a chain round a rounded block (f02)", () => {
    const cad = createHarness()
    answer(cad, "_RECTANG", "_F", "2", "0,0", "20,10")
    answer(cad, "_EXTRUDE", "_L", "", "5")
    answer(cad, "_-VPOINT", "-1.3,-2.2,1.6", "_ZOOM", "_E")
    expect(written(cad, "FILLETEDGE", "C", "10,0,5", "", "")).toContain(
      "8 edge(s) selected for fillet."
    )
    expect(volumes(cad)).toEqual([970.9938])
  })

  it("ends saying so on Enter with no edge (solid-edits/p200)", () => {
    const cad = box()
    expect(written(cad, "FILLETEDGE", "")).toEqual([
      "FILLETEDGE",
      "Radius = 1.00",
      "Select an edge or [Chain/Loop/Radius]:",
      "0 edge(s) selected for fillet.",
      "No fillet to be computed.",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("edits the solid in place, its layer and colour kept (f01: handle 2d9 before and after)", () => {
    const cad = createHarness()
    cad.runtime.createLayer("A")
    answer(cad, "_-COLOR", "1", "_BOX", "0,0,0", "10,10", "10")
    answer(cad, "_-VPOINT", "-1.3,-2.2,1.6", "_ZOOM", "_E")
    const [before] = solids(cad)
    answer(cad, "_FILLETEDGE", "5,0,10", "", "")
    const [after] = solids(cad)
    expect(volumes(cad)).toEqual([997.854])
    expect([after.id, after.layerId, after.color]).toEqual([
      before.id,
      before.layerId,
      before.color,
    ])
    expect(after.color).toBeDefined()
  })

  it("asks in Spanish and Portuguese", () => {
    const spanish = box(es)
    expect(
      written(spanish, "ARISTAEMPALME", "R", "2", "5,0,10", "", "")
    ).toEqual([
      "ARISTAEMPALME",
      "Radio = 1.00",
      "Designe una arista o [Cadena/Bucle/Radio]: R",
      "Indique radio de empalme o [Expresión] <1.00>: 2",
      "Designe una arista o [Cadena/Bucle/Radio]: 5,0,10",
      "Designe una arista o [Cadena/Bucle/Radio]:",
      "1 arista(s) seleccionadas para empalme.",
      "Pulse Intro para aceptar el empalme o [Radio]:",
    ])
    const portuguese = box(ptBR)
    expect(written(portuguese, "ARESTACONCORD", "L")).toContain(
      "Selecionar uma aresta ou [Cadeia/Loop/Raio]: L"
    )
    expect(written(portuguese, "5,0,10")).toContain(
      "Selecionar aresta de loop ou [arEsta/Cadeia/Raio]: 5,0,10"
    )
  })
})

describe("CHAMFEREDGE", () => {
  it("bevels edges of one face, its first distance along it (chamferedge/c01)", () => {
    const cad = box()
    expect(
      written(
        cad,
        "CHAMFEREDGE",
        "D",
        "1",
        "3",
        "5,0,10",
        "10,5,10",
        "0,5,10",
        "10,0,5",
        "",
        ""
      )
    ).toEqual([
      "CHAMFEREDGE",
      "Distance1 = 1.00, Distance2 = 1.00",
      "Select an edge or [Loop/Distance]: D",
      "Specify Distance1 or [Expression] <1.00>: 1",
      "Specify Distance2 or [Expression] <1.00>: 3",
      "Select an edge or [Loop/Distance]: 5,0,10",
      "Select another edge on the same face or [Loop/Distance]: 10,5,10",
      "Select another edge on the same face or [Loop/Distance]: 0,5,10",
      "Select another edge on the same face or [Loop/Distance]: 10,0,5",
      "Edges must belong to one face.",
      "Select another edge on the same face or [Loop/Distance]:",
      "Press Enter to accept the chamfer or [Distance]:",
    ])
    expect(volumes(cad)).toEqual([957])
    const settings = cad.runtime.document.getSettings()
    expect([settings.chamferDistance1, settings.chamferDistance2]).toEqual([
      1, 3,
    ])
    expect(written(cad, "CHAMFEREDGE")).toContain(
      "Distance1 = 1.00, Distance2 = 3.00"
    )
  })

  it("refuses distances past a face in ACIS's words (c04), the distances answered rolled back (solid-edits/p224)", () => {
    const cad = box(undefined, "2")
    const log = written(cad, "CHAMFEREDGE", "D", "3", "1", "5,0,2", "")
    expect(log.at(-1)).toBe(
      "Modeling Operation Error:\nError Code Number is 12069\nFailed to perform blend.\nFailure while chamfering."
    )
    expect(volumes(cad)).toEqual([200])
    const settings = cad.runtime.document.getSettings()
    expect([settings.chamferDistance1, settings.chamferDistance2]).toEqual([
      0, 0,
    ])
    expect(cad.activeToolId()).toBe("select")
    expect(written(cad, "CHAMFEREDGE")).toContain(
      "Distance1 = 1.00, Distance2 = 1.00"
    )
  })

  it("ends on Enter with no edge, and refuses a distance of 0 (c01, c02)", () => {
    const cad = box()
    expect(written(cad, "CHAMFEREDGE", "D", "0")).toContain(
      "Distance too small. *Invalid*"
    )
    const other = box()
    expect(written(other, "CHAMFEREDGE", "")).toEqual([
      "CHAMFEREDGE",
      "Distance1 = 1.00, Distance2 = 1.00",
      "Select an edge or [Loop/Distance]:",
      "No edges to chamfer.",
    ])
  })
})

describe("an edge picked with the mouse", () => {
  it("lights the edge under the cursor and takes it on a click (desktop)", () => {
    const cad = box()
    answer(cad, "FILLETEDGE")
    const front = { x: 5, y: 0, z: 10 }
    cad.moveTo({ x: 5, y: 5, z: 5 })
    const lit = () =>
      cad
        .scene()
        .primitives.filter(
          (p) => "stroke" in p && p.stroke?.color === THEME.entityHover
        )
    expect(lit()).toEqual([])
    cad.moveTo(front)
    // The top front edge alone, from (0,0,10) to (10,0,10).
    const [edge] = lit()
    expect(lit()).toHaveLength(1)
    expect(edge.kind === "segment" && [edge.a, edge.b]).toBeCloseToPoints([
      screen(cad, { x: 0, y: 0, z: 10 }),
      screen(cad, { x: 10, y: 0, z: 10 }),
    ])
    cad.click(front)
    answer(cad, "", "")
    expect(volumes(cad)).toEqual([997.854])
  })

  it("sets the radius by dragging the fillet's grip (desktop)", () => {
    const cad = box()
    answer(cad, "FILLETEDGE", "5,0,10", "")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLETEDGE Press Enter to accept the fillet or [Radius]:"
    )
    const grips = cad
      .scene()
      .primitives.filter((p) => p.kind === "path" && p.fill === THEME.grip)
    expect(grips).toHaveLength(1)
    // One arrow, at the middle of the fillet's face: 1 − √½ in from the
    // front and the top of the edge at a radius of 1.
    const [arrow] = grips
    const points = arrow.kind === "path" ? arrow.points : []
    const middle = {
      x: points.reduce((sum, q) => sum + q.x, 0) / points.length,
      y: points.reduce((sum, q) => sum + q.y, 0) / points.length,
    }
    const at = screen(cad, { x: 5, y: 1 - Math.SQRT1_2, z: 9 + Math.SQRT1_2 })
    expect(Math.hypot(middle.x - at.x, middle.y - at.y)).toBeLessThan(2)
  })
})

describe("the sizes, saved as answered (solid-edits/p208–p210, p222–p234)", () => {
  it("saves the radius by two points with no fillet made (p209)", () => {
    const cad = box()
    expect(written(cad, "_FILLETEDGE", "_R", "0,0", "3,4", "")).toEqual([
      "FILLETEDGE",
      "Radius = 1.00",
      "Select an edge or [Chain/Loop/Radius]: _R",
      "Enter fillet radius or [Expression] <1.00>: 0,0",
      " Specify second point: 3,4",
      "Select an edge or [Chain/Loop/Radius]:",
      "0 edge(s) selected for fillet.",
      "No fillet to be computed.",
    ])
    expect(settingsOf(cad)[0]).toBe(5)
    expect(written(cad, "_FILLETEDGE")).toContain("Radius = 5.00")
  })

  it("asks again silently at an expression of 0, saving the radius then given (p208)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "_R", "_E")
    expect(written(cad, "0", "3", "")).toEqual([
      "Enter expression: 0",
      "Enter fillet radius or [Expression] <1.00>: 3",
      "Select an edge or [Chain/Loop/Radius]:",
      "0 edge(s) selected for fillet.",
      "No fillet to be computed.",
    ])
    expect(settingsOf(cad)[0]).toBe(3)
  })

  it("saves the first distance by two points and the second's default (p210)", () => {
    const cad = box()
    expect(written(cad, "_CHAMFEREDGE", "_D", "0,0", "3,4", "", "")).toEqual([
      "CHAMFEREDGE",
      "Distance1 = 1.00, Distance2 = 1.00",
      "Select an edge or [Loop/Distance]: _D",
      "Specify Distance1 or [Expression] <1.00>: 0,0",
      " Specify second point: 3,4",
      "Specify Distance2 or [Expression] <1.00>:",
      "Select an edge or [Loop/Distance]:",
      "No edges to chamfer.",
    ])
    expect(settingsOf(cad).slice(1)).toEqual([5, 1])
    expect(written(cad, "_CHAMFEREDGE")).toContain(
      "Distance1 = 5.00, Distance2 = 1.00"
    )
  })

  it("asks a distance again silently at an expression of 0 or less (p233)", () => {
    const cad = box()
    answer(cad, "_CHAMFEREDGE", "_D", "_E")
    expect(written(cad, "0", "2", "_E", "-1", "3", "")).toEqual([
      "Enter expression: 0",
      "Specify Distance1 or [Expression] <1.00>: 2",
      "Specify Distance2 or [Expression] <1.00>: _E",
      "Enter expression: -1",
      "Specify Distance2 or [Expression] <1.00>: 3",
      "Select an edge or [Loop/Distance]:",
      "No edges to chamfer.",
    ])
    expect(settingsOf(cad).slice(1)).toEqual([2, 3])
  })

  it("asks the accept's distances of the base and the other surface, for this run only (p222, p234)", () => {
    const cad = box()
    answer(cad, "_CHAMFEREDGE", "5,0,10", "")
    expect(written(cad, "_D", "2", "3", "")).toEqual([
      "Press Enter to accept the chamfer or [Distance]:_D",
      "Specify base surface chamfer distance or [Expression] <1.00>: 2",
      "Specify other surface chamfer distance or [Expression] <1.00>: 3",
      "Press Enter to accept the chamfer or [Distance]:",
    ])
    expect(volumes(cad)).toEqual([970])
    // CHAMFERA and CHAMFERB as the run showed them, (1.0 1.0) from (0.0 0.0).
    expect(settingsOf(cad).slice(1)).toEqual([1, 1])
  })

  it("words the accept's distances in Spanish and Portuguese (p222)", () => {
    const spanish = box(es)
    answer(spanish, "ACHAFLANAARISTA", "5,0,10", "")
    expect(written(spanish, "D", "2", "3")).toEqual([
      "Pulse Intro para aceptar el chaflán o [Distancia]:D",
      "Precise superficie de base distancia de chaflán o [Expresión] <1.00>: 2",
      "Precise otra superficie distancia de chaflán o [Expresión] <1.00>: 3",
    ])
    const portuguese = box(ptBR)
    answer(portuguese, "CHANFRARARESTA", "5,0,10", "")
    expect(written(portuguese, "D", "2", "3")).toEqual([
      "Pressione Enter para aceitar o chanfro ou [Distância]:D",
      "Especifique a distância da superfície de base do chanfro ou [Expressão] <1.00>: 2",
      "Especifique a distância da outra superfície do chanfro ou [Expressão] <1.00>: 3",
    ])
  })

  it("keeps the defaults at Enter and refuses another prompt's keyword (p237, p238)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "_R")
    expect(written(cad, "_C", "")).toEqual([
      "Enter fillet radius or [Expression] <1.00>: _C",
      "Requires numeric distance, two points, or option keyword.",
      "Enter fillet radius or [Expression] <1.00>:",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "FILLETEDGE Select an edge or [Chain/Loop/Radius]:"
    )
    answer(cad, "_C", "", "_FILLETEDGE")
    // The mode is the run's: the next asks for an edge.
    expect(cad.state().commandLine.prompt).toBe(
      "FILLETEDGE Select an edge or [Chain/Loop/Radius]:"
    )
    answer(cad, "")
    const chamfer = box()
    answer(chamfer, "_CHAMFEREDGE", "_D")
    expect(written(chamfer, "_L", "", "", "5,0,10", "", "_D", "", "")).toEqual([
      "Specify Distance1 or [Expression] <1.00>: _L",
      "Requires numeric distance, two points, or option keyword.",
      "Specify Distance1 or [Expression] <1.00>:",
      "Specify Distance2 or [Expression] <1.00>:",
      "Select an edge or [Loop/Distance]: 5,0,10",
      "Select another edge on the same face or [Loop/Distance]:",
      "Press Enter to accept the chamfer or [Distance]:_D",
      "Specify base surface chamfer distance or [Expression] <1.00>:",
      "Specify other surface chamfer distance or [Expression] <1.00>:",
    ])
  })

  it("puts FILLETRAD3D back with the solid on U, and REDO both (p229)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "_R", "3", "5,0,10", "", "")
    expect(volumes(cad)).toEqual([980.6858])
    expect(written(cad, "_U")).toEqual(["U", "FILLETEDGE"])
    expect(settingsOf(cad)[0]).toBe(1)
    expect(volumes(cad)).toEqual([1000])
    answer(cad, "_REDO")
    expect(settingsOf(cad)[0]).toBe(3)
    expect(volumes(cad)).toEqual([980.6858])
  })

  it("puts the sizes of a run that made nothing back on U (p230)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "_R", "3", "")
    expect(settingsOf(cad)[0]).toBe(3)
    expect(written(cad, "_U")).toEqual(["U", "FILLETEDGE"])
    expect(settingsOf(cad)[0]).toBe(1)
    answer(cad, "_CHAMFEREDGE", "_D", "2", "4", "")
    expect(settingsOf(cad).slice(1)).toEqual([2, 4])
    expect(written(cad, "_U")).toEqual(["U", "CHAMFEREDGE"])
    expect(settingsOf(cad).slice(1)).toEqual([0, 0])
  })
})

describe("Enter expression: (solid-edits/p206, p212, p228, p232, p235, p266)", () => {
  it("ends the run at Enter from the pick's radius, the edges counted, nothing made (p206, p266)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "_R", "_E")
    expect(written(cad, "")).toEqual([
      "Enter expression:",
      "0 edge(s) selected for fillet.",
      "No fillet to be computed.",
    ])
    expect(cad.activeToolId()).toBe("select")
    const taken = box()
    answer(taken, "_FILLETEDGE", "5,0,10", "_R", "_E")
    expect(written(taken, "")).toEqual([
      "Enter expression:",
      "1 edge(s) selected for fillet.",
      "No fillet to be computed.",
    ])
    expect(volumes(taken)).toEqual([1000])
  })

  it("ends CHAMFEREDGE at Enter from the pick's distance (p232)", () => {
    const cad = box()
    answer(cad, "_CHAMFEREDGE", "_D", "_E")
    expect(written(cad, "")).toEqual([
      "Enter expression:",
      "No edges to chamfer.",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("goes back to the accept prompt at Enter from its size (p212, p235)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "5,0,10", "", "_R", "_E")
    expect(written(cad, "")).toEqual(["Enter expression:"])
    expect(cad.state().commandLine.prompt).toBe(
      "FILLETEDGE Press Enter to accept the fillet or [Radius]:"
    )
    const chamfer = box()
    answer(chamfer, "_CHAMFEREDGE", "5,0,10", "", "_D", "_E")
    expect(written(chamfer, "")).toEqual(["Enter expression:"])
    expect(chamfer.state().commandLine.prompt).toBe(
      "CHAMFEREDGE Press Enter to accept the chamfer or [Distance]:"
    )
  })

  it("takes 'ZOOM there as an expression, refused (p207, p228)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "_R", "_E")
    expect(written(cad, "'_ZOOM", "2")).toEqual([
      "Enter expression: '_ZOOM",
      "The syntax is incorrect or a variable is not defined.  Reenter the expression or value.",
      "Enter expression: 2",
    ])
    expect(settingsOf(cad)[0]).toBe(2)
  })
})

describe("the edge picks (solid-edits/p204, p205, p214–p223, p239, p265)", () => {
  it("offers each prompt's unlisted keywords: Edge at the first, Loop at the loop's and the chain's (p205)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE")
    expect(written(cad, "_E", "_L", "FOO", "_L", "_C", "FOO", "_L")).toEqual([
      "Select an edge or [Chain/Loop/Radius]: _E",
      "Select an edge or [Chain/Loop/Radius]: _L",
      "Select edge of loop or [Edge/Chain/Radius]: FOO",
      "*Invalid selection*",
      "Expects a point or Edge/Chain",
      "Select edge of loop or [Edge/Chain/Radius]: _L",
      "Select edge of loop or [Edge/Chain/Radius]: _C",
      "Select an edge chain or [Edge/Radius]: FOO",
      "*Invalid selection*",
      "Expects a point or Edge",
      "Select an edge chain or [Edge/Radius]: _L",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "FILLETEDGE Select edge of loop or [Edge/Chain/Radius]:"
    )
  })

  it("offers CHAMFEREDGE's unlisted Edge and Loop, and refuses U (p223, p231)", () => {
    const cad = box()
    answer(cad, "_CHAMFEREDGE")
    expect(
      written(cad, "_U", "_E", "0", "_L", "_L", "_E", "5,0,10", "FOO", "_E")
    ).toEqual([
      "Select an edge or [Loop/Distance]: _U",
      "*Invalid selection*",
      "Expects a point or Loop",
      "Select an edge or [Loop/Distance]: _E",
      "Select an edge or [Loop/Distance]: 0",
      "Select another edge on the same face or [Loop/Distance]: _L",
      "Select edge of loop or [Edge/Distance]: _L",
      "Select edge of loop or [Edge/Distance]: _E",
      "Select another edge on the same face or [Loop/Distance]: 5,0,10",
      "Edges must belong to one face.",
      "Select another edge on the same face or [Loop/Distance]: FOO",
      "*Invalid selection*",
      "Expects a point or Loop",
      "Select another edge on the same face or [Loop/Distance]: _E",
    ])
  })

  it("takes a number as its distance from LASTPOINT, refusing other prompts' keywords (p204)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE")
    expect(written(cad, "0", "_A", "_D", "_X")).toEqual([
      "Select an edge or [Chain/Loop/Radius]: 0",
      "Select an edge or [Chain/Loop/Radius]: _A",
      "*Invalid selection*",
      "Expects a point or Chain/Loop",
      "Select an edge or [Chain/Loop/Radius]: _D",
      "*Invalid selection*",
      "Expects a point or Chain/Loop",
      "Select an edge or [Chain/Loop/Radius]: _X",
      "*Invalid selection*",
      "Expects a point or Chain/Loop",
    ])
    // LASTPOINT is BOX's 10,10,0: an edge at that corner.
    expect(written(cad, "")).toContain("1 edge(s) selected for fillet.")
  })

  it("sets LASTPOINT at the edge typed, sizes by two points keeping it (p121, p122)", () => {
    // LASTPOINT read mid-command as the probes read it ('SETVAR LASTPOINT,
    // Enter), then `ID @`'s once the run is over; set from 7,7,7 first.
    const READ = "<LASTPOINT>"
    const readings = (cad: CadHarness, ...texts: string[]) => {
      const xyz = (line: string) =>
        (line.match(/-?\d+(\.\d+)?/g) ?? []).map((n) => Number(n) + 0).slice(-3)
      const out: number[][] = []
      answer(cad, "ID", "7,7,7")
      for (const text of texts) {
        if (text !== READ) {
          answer(cad, text)
          continue
        }
        const asked = written(cad, "'SETVAR", "LASTPOINT", "")
        out.push(xyz(asked.find((line) => line.includes("LASTPOINT <"))!))
      }
      out.push(xyz(written(cad, "ID", "@").join(" ")))
      return out
    }
    const R = READ
    expect(
      readings(
        box(),
        "_FILLETEDGE",
        "5,0,10",
        "_R",
        R,
        "0,0,0",
        "2,0,0",
        "",
        R,
        ""
      )
    ).toEqual([
      [5, 0, 10],
      [5, 0, 10],
      [5, 0, 10],
    ])
    expect(
      readings(
        box(),
        "_CHAMFEREDGE",
        "5,0,10",
        "_D",
        R,
        "0,0,0",
        "1,0,0",
        R,
        "0,0,0",
        "0,2,0",
        "",
        R,
        ""
      )
    ).toEqual([
      [5, 0, 10],
      [5, 0, 10],
      [5, 0, 10],
      [5, 0, 10],
    ])
  })

  it("passes over a point on no edge or on a line, silently (p214, p239)", () => {
    const cad = box()
    answer(cad, "_LINE", "12,0,0", "18,0,0", "", "_FILLETEDGE")
    expect(written(cad, "5,5,10", "15,0,0", "")).toEqual([
      "Select an edge or [Chain/Loop/Radius]: 5,5,10",
      "Select an edge or [Chain/Loop/Radius]: 15,0,0",
      "Select an edge or [Chain/Loop/Radius]:",
      "0 edge(s) selected for fillet.",
      "No fillet to be computed.",
    ])
    expect(written(cad, "_CHAMFEREDGE", "5,5,10", "15,0,0", "")).toEqual([
      "CHAMFEREDGE",
      "Distance1 = 1.00, Distance2 = 1.00",
      "Select an edge or [Loop/Distance]: 5,5,10",
      "Select an edge or [Loop/Distance]: 15,0,0",
      "Select an edge or [Loop/Distance]:",
      "No edges to chamfer.",
    ])
  })

  it("refuses a locked solid's edge in its words (p215)", () => {
    const cad = box()
    cad.runtime.updateLayer("0", { locked: true })
    answer(cad, "_FILLETEDGE")
    expect(written(cad, "5,0,10", "")).toEqual([
      "Select an edge or [Chain/Loop/Radius]: 5,0,10",
      "The object is on a locked layer.",
      "Select an edge or [Chain/Loop/Radius]:",
      "0 edge(s) selected for fillet.",
      "No fillet to be computed.",
    ])
    const chamfer = box(es)
    chamfer.runtime.updateLayer("0", { locked: true })
    answer(chamfer, "ACHAFLANAARISTA")
    expect(written(chamfer, "5,0,10")).toContain(
      "El objeto está en una capa bloqueada."
    )
  })

  it("refuses another solid's edge once one is taken (p216, p231)", () => {
    const cad = box()
    answer(cad, "_BOX", "20,0,0", "30,10", "10", "_ZOOM", "_E")
    answer(cad, "_FILLETEDGE")
    expect(written(cad, "5,0,10", "25,0,10", "")).toEqual([
      "Select an edge or [Chain/Loop/Radius]: 5,0,10",
      "Select an edge or [Chain/Loop/Radius]: 25,0,10",
      "Cannot fillet multiple bodies.",
      "Select an edge or [Chain/Loop/Radius]:",
      "1 edge(s) selected for fillet.",
    ])
    answer(cad, "")
    answer(cad, "_CHAMFEREDGE")
    // The same edge again is taken silently (p231).
    expect(written(cad, "5,10,10", "5,10,10", "25,0,10")).toEqual([
      "Select an edge or [Loop/Distance]: 5,10,10",
      "Select another edge on the same face or [Loop/Distance]: 5,10,10",
      "Select another edge on the same face or [Loop/Distance]: 25,0,10",
      "Chamfering multiple bodies not allowed.",
    ])
  })

  it("refuses FILLETEDGE's edge picked again (p217)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE")
    expect(written(cad, "5,0,10", "5,0,10", "")).toEqual([
      "Select an edge or [Chain/Loop/Radius]: 5,0,10",
      "Select an edge or [Chain/Loop/Radius]: 5,0,10",
      "Edge has already been picked.",
      "Select an edge or [Chain/Loop/Radius]:",
      "1 edge(s) selected for fillet.",
    ])
  })

  it("says a chain of one edge has no tangent neighbour, and takes it (p218, p236)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "_C")
    expect(written(cad, "5,0,10", "5,0,10", "_R", "_E", "-1", "2", "")).toEqual(
      [
        "Select an edge chain or [Edge/Radius]: 5,0,10",
        "No adjacent tangent edges found in chain.",
        "Select an edge chain or [Edge/Radius]: 5,0,10",
        "No adjacent tangent edges found in chain.",
        "Select an edge chain or [Edge/Radius]: _R",
        "Enter fillet radius or [Expression] <1.00>: _E",
        "Enter expression: -1",
        "Enter fillet radius or [Expression] <1.00>: 2",
        "Select an edge chain or [Edge/Radius]:",
        "1 edge(s) selected for fillet.",
      ]
    )
  })

  it("words the new refusals in Spanish and Portuguese (p216–p218, p231)", () => {
    const spanish = box(es)
    answer(spanish, "_BOX", "20,0,0", "30,10", "10", "_ZOOM", "_E")
    answer(spanish, "ARISTAEMPALME", "5,0,10")
    expect(written(spanish, "25,0,10", "5,0,10", "C", "5,0,10")).toEqual([
      "Designe una arista o [Cadena/Bucle/Radio]: 25,0,10",
      "No se pueden empalmar varios cuerpos.",
      "Designe una arista o [Cadena/Bucle/Radio]: 5,0,10",
      "Esta arista ya se ha designado.",
      "Designe una arista o [Cadena/Bucle/Radio]: C",
      "Designe una cadena de aristas o [Arista/Radio]: 5,0,10",
      "No se han encontrado aristas tangentes adyacentes en cadena.",
    ])
    answer(spanish, "", "", "ACHAFLANAARISTA", "5,10,10")
    expect(written(spanish, "25,0,10")).toContain(
      "No se pueden achaflanar varias entidades."
    )
    const portuguese = box(ptBR)
    answer(portuguese, "_BOX", "20,0,0", "30,10", "10", "_ZOOM", "_E")
    answer(portuguese, "ARESTACONCORD", "5,0,10")
    expect(written(portuguese, "25,0,10", "5,0,10", "C", "5,0,10")).toEqual([
      "Selecionar uma aresta ou [Cadeia/Loop/Raio]: 25,0,10",
      "Não é possível fazer a concordância de corpos múltiplos.",
      "Selecionar uma aresta ou [Cadeia/Loop/Raio]: 5,0,10",
      "A aresta já foi selecionada.",
      "Selecionar uma aresta ou [Cadeia/Loop/Raio]: C",
      "Selecionar uma cadeia de aresta ou [Aresta/Raio]: 5,0,10",
      "Nenhuma aresta de tangente adjacente encontrada na cadeia.",
    ])
    answer(portuguese, "", "", "CHANFRARARESTA", "5,10,10")
    expect(written(portuguese, "25,0,10")).toContain(
      "O chanframento de múltiplos corpos não é permitido."
    )
  })

  it("reads a typed point in the UCS, the edge drawn through it (p219, p220)", () => {
    const turned = box()
    answer(
      turned,
      "_UCS",
      "_Z",
      "30",
      "_FILLETEDGE",
      "4.330127,-2.5,10",
      "",
      ""
    )
    expect(volumes(turned)).toEqual([997.854])
    expect(filletAxis(turned)).toEqual({ y: 1, z: 9 })
    const front = box()
    answer(front, "_UCS", "_X", "90", "_FILLETEDGE", "5,10", "", "")
    expect(filletAxis(front)).toEqual({ y: 1, z: 9 })
  })

  it("takes the bottom edge in plan, and a back one in 2D Wireframe (p221, p265)", () => {
    const plan = createHarness()
    answer(plan, "_BOX", "0,0,0", "10,10", "10", "_ZOOM", "_E")
    answer(plan, "_FILLETEDGE", "5,0,10", "", "")
    expect(volumes(plan)).toEqual([997.854])
    expect(filletAxis(plan)).toEqual({ y: 1, z: 1 })
    const back = box()
    answer(back, "_FILLETEDGE", "5,10,0", "", "")
    expect(filletAxis(back)).toEqual({ y: 9, z: 1 })
  })

  it("refuses at Accept/Next and at the accept prompt what is no keyword there (p211, p213)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE", "_L", "5,0,10")
    expect(written(cad, "FOO", "0", "_R", "_A")).toEqual([
      "Enter an option [Accept/Next] <Accept>: FOO",
      "Invalid option keyword.",
      "Enter an option [Accept/Next] <Accept>: 0",
      "Invalid option keyword.",
      "Enter an option [Accept/Next] <Accept>: _R",
      "Invalid option keyword.",
      "Enter an option [Accept/Next] <Accept>: _A",
    ])
    answer(cad, "")
    expect(written(cad, "FOO", "0", "_C", "_R", "")).toEqual([
      "Press Enter to accept the fillet or [Radius]:FOO",
      "Invalid option keyword.",
      "Press Enter to accept the fillet or [Radius]:0",
      "Invalid option keyword.",
      "Press Enter to accept the fillet or [Radius]:_C",
      "Invalid option keyword.",
      "Press Enter to accept the fillet or [Radius]:_R",
      "Specify Radius or [Expression] <1.00>:",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "FILLETEDGE Press Enter to accept the fillet or [Radius]:"
    )
  })
})

describe("the run (solid-edits/p200, p201, p226, p227)", () => {
  it("repeats at Enter, echoed by its name (p200)", () => {
    const cad = box()
    expect(written(cad, "_FILLETEDGE", "", "")).toEqual([
      "FILLETEDGE",
      "Radius = 1.00",
      "Select an edge or [Chain/Loop/Radius]:",
      "0 edge(s) selected for fillet.",
      "No fillet to be computed.",
      "FILLETEDGE",
      "Radius = 1.00",
    ])
    const spanish = box(es)
    expect(written(spanish, "_CHAMFEREDGE", "", "")).toContain(
      "ACHAFLANAARISTA"
    )
  })

  it("is refused transparently (p201)", () => {
    const cad = box()
    answer(cad, "_LINE", "0,0")
    expect(written(cad, "'_FILLETEDGE", "'_CHAMFEREDGE")).toEqual([
      "Specify next point or [Undo]: 'FILLETEDGE",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
      "Specify next point or [Undo]: 'CHAMFEREDGE",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  it("zooms at 'ZOOM and resumes, at the pick, Accept/Next, the accept prompt and the radius (p226, p227)", () => {
    const cad = box()
    answer(cad, "_FILLETEDGE")
    const resumes = (prompt: string) => {
      expect(written(cad, "'_ZOOM", "_E")).toContain(
        "Resuming FILLETEDGE command."
      )
      expect(cad.state().commandLine.prompt).toBe(`FILLETEDGE ${prompt}`)
    }
    resumes("Select an edge or [Chain/Loop/Radius]:")
    answer(cad, "_L", "5,0,10")
    resumes("Enter an option [Accept/Next] <Accept>:")
    answer(cad, "_A", "")
    resumes("Press Enter to accept the fillet or [Radius]:")
    answer(cad, "_R")
    resumes("Specify Radius or [Expression] <1.00>:")
  })

  it("echoes the ribbon's macro as acad.cuix spells it (ID_FILLET_EDGE, ID_CHAMFER_EDGE)", () => {
    const cad = box()
    for (const [id, echo] of [
      ["filletedge", "_FILLETEDGE"],
      ["chamferedge", "_CHAMFEREDGE"],
    ]) {
      const from = cad.commandLog().length
      cad.tool(id)
      expect(cad.commandLog()[from]).toBe(echo)
      answer(cad, "")
    }
  })
})
