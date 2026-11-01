import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepIsClosed, brepVolume } from "../geometry/solids"
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

  it("ends saying so on Enter with no edge (filletedge/e09)", () => {
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

  it("refuses distances past a face, saving nothing (c04)", () => {
    const cad = box(undefined, "2")
    const log = written(cad, "CHAMFEREDGE", "D", "3", "1", "5,0,2", "")
    expect(log.at(-1)).toBe(
      "Modeling Operation Error:\nError Code Number is 12069\nFailed to perform blend.\nFailure while chamfering."
    )
    expect(volumes(cad)).toEqual([200])
    expect(cad.runtime.document.getSettings().chamferDistance1).toBe(0)
    expect(cad.activeToolId()).toBe("select")
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
        ).length
    expect(lit()).toBe(0)
    cad.moveTo(front)
    expect(lit()).toBeGreaterThan(0)
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
    expect(
      cad
        .scene()
        .primitives.some((p) => p.kind === "path" && p.fill === THEME.grip)
    ).toBe(true)
  })
})
