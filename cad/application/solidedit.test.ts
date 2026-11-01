import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepIsClosed, brepVolume } from "../geometry/solids"
import { regionArea } from "../domain/regions"
import type { RegionEntity, Solid3dEntity } from "../domain/entities"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"

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

/** The probes' view: off plan, zoomed to what is drawn. */
function view(cad: CadHarness): CadHarness {
  return answer(cad, "_-VPOINT", "-1.3,-2.2,1.6", "_ZOOM", "_E")
}

function box(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  return view(answer(cad, "_BOX", "0,0,0", "10,10", "10"))
}

/** A 20 × 10 × 10 box drilled through by a radius 2 hole at 5,5 (e06–e12). */
function drilled(): CadHarness {
  const cad = createHarness()
  answer(cad, "_BOX", "0,0,0", "20,10", "10")
  answer(cad, "_CYLINDER", "5,5,-1", "2", "12")
  answer(cad, "_SUBTRACT", "20,5", "", "_L", "")
  return view(cad)
}

describe("SOLIDEDIT", () => {
  it("offsets a face, its neighbours carried on (solidedit/e01)", () => {
    const cad = box()
    expect(written(cad, "SOLIDEDIT", "F", "O", "5,5,10", "", "2")).toEqual([
      "SOLIDEDIT",
      "Solids editing automatic checking:  SOLIDCHECK=1",
      "Enter a solids editing option [Face/Edge/Body/Undo/eXit] <eXit>: F",
      "Enter a face editing option [Extrude/Move/Rotate/Offset/Taper/Delete/Copy/coLor/mAterial/Undo/eXit] <eXit>: O",
      "Select faces or [Undo/Remove]: 5,5,10",
      "1 face found.",
      "Select faces or [Undo/Remove/ALL]:",
      "Specify the offset distance: 2",
      "Solid validation started.",
      "Solid validation completed.",
    ])
    expect(volumes(cad)).toEqual([1200])
    expect(written(cad, "X", "X")).toEqual([
      "Enter a face editing option [Extrude/Move/Rotate/Offset/Taper/Delete/Copy/coLor/mAterial/Undo/eXit] <eXit>: X",
      "Solids editing automatic checking:  SOLIDCHECK=1",
      "Enter a solids editing option [Face/Edge/Body/Undo/eXit] <eXit>: X",
    ])
    expect(cad.activeToolId()).toBe("select")
    expect(written(cad, "U")).toContain("SOLIDEDIT")
    expect(volumes(cad)).toEqual([1000])
  })

  it("extrudes a face tapered and takes it back with Undo (e01, e08)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "E", "5,5,10", "", "3")
    expect(written(cad, "FOO")).toContain(
      "Requires valid numeric angle or two points."
    )
    answer(cad, "20")
    const top = 10 - 6 * Math.tan((20 * Math.PI) / 180)
    expect(volumes(cad)[0]).toBeCloseTo(1000 + (100 + top * top + 10 * top), 4)
    answer(cad, "U")
    expect(volumes(cad)).toEqual([1000])
    answer(cad, "E", "5,5,10", "", "2", "")
    expect(volumes(cad)).toEqual([1200])
  })

  it("rotates a face about two points, and tapers one (e07, e08)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "R", "5,5,10", "", "0,0,10", "10,0,10")
    expect(written(cad, "FOO")).toContain(
      "Requires valid numeric angle, second point, or option keyword."
    )
    answer(cad, "10")
    expect(volumes(cad)).toEqual([1088.1635])
    const other = box()
    answer(other, "SOLIDEDIT", "F", "T", "5,0,5", "", "0,0,0", "0,0,10", "10")
    expect(volumes(other)).toEqual([911.8365])
    // A top tapered along X, down its length (e12's way, at 30°).
    const top = box()
    answer(top, "SOLIDEDIT", "F", "T", "5,5,10", "", "0,0,10", "10,0,10", "30")
    expect(volumes(top)[0]).toBeCloseTo(1000 - 500 * Math.tan(Math.PI / 6), 4)
  })

  it("moves a face, and refuses one moved through the solid (e06, e12)", () => {
    const cad = drilled()
    answer(cad, "SOLIDEDIT", "F", "M", "10,5,10", "", "0,0,0", "0,0,3")
    expect(volumes(cad)).toEqual([2436.6372])
    expect(written(cad, "M", "10,5,13", "", "0,0,0", "0,0,-15")).toContain(
      "Modeling Operation Error:\nError Code Number is 103009"
    )
    expect(volumes(cad)).toEqual([2436.6372])
  })

  it("deletes a hole, refuses a box's side, and copies a face as a region (e09, e10)", () => {
    const cad = drilled()
    answer(cad, "SOLIDEDIT", "F", "D", "6,6.732,9", "")
    expect(volumes(cad)).toEqual([2000])
    expect(written(cad, "D", "10,5,10", "")).toContain(
      "Modeling Operation Error:\nError Code Number is 103013"
    )
    answer(cad, "C", "10,5,10", "", "0,0,0", "0,0,5")
    const region = cad
      .entities()
      .find((e): e is RegionEntity => e.type === "region")!
    expect(regionArea(region)).toBeCloseTo(200, 9)
    expect(solids(cad).every((s) => brepIsClosed(s.brep))).toBe(true)
  })

  it("selects with Remove, Add, ALL and Undo (e11)", () => {
    const cad = drilled()
    expect(
      written(cad, "SOLIDEDIT", "F", "O", "FOO", "10,5,10", "10,0,5", "R")
    ).toEqual([
      "SOLIDEDIT",
      "Solids editing automatic checking:  SOLIDCHECK=1",
      "Enter a solids editing option [Face/Edge/Body/Undo/eXit] <eXit>: F",
      "Enter a face editing option [Extrude/Move/Rotate/Offset/Taper/Delete/Copy/coLor/mAterial/Undo/eXit] <eXit>: O",
      "Select faces or [Undo/Remove]: FOO",
      "*Invalid selection*",
      "Expects a point or Crossing/Fence/CPolygon/Undo",
      "Select faces or [Undo/Remove]: 10,5,10",
      "1 face found.",
      "Select faces or [Undo/Remove/ALL]: 10,0,5",
      "1 face found.",
      "Select faces or [Undo/Remove/ALL]: R",
    ])
    expect(written(cad, "10,0,5", "A", "ALL")).toEqual([
      "Remove faces or [Undo/Add/ALL]: 10,0,5",
      "1 face found, 1 removed.",
      "Remove faces or [Undo/Add/ALL]: A",
      "Select faces or [Undo/Remove/ALL]: ALL",
      "6 faces found.",
    ])
  })

  it("asks in Spanish and Portuguese", () => {
    const spanish = box(es)
    expect(written(spanish, "EDITSOLIDO", "C", "E")).toEqual([
      "EDITSOLIDO",
      "Comprobación automática de edición de sólidos:  SOLIDCHECK=1",
      "Indique una opción de edición de sólidos [Cara/Arista/cUerpo/desHacer/Salir] <Salir>: C",
      "Indique opción de edición de caras [eXtruir/Desplazar/Girar/dEsfasar/Inclinar/sUprimir/Copiar/cOlor/mAterial/desHacer/Salir] <Salir>: E",
    ])
    const portuguese = box(ptBR)
    expect(written(portuguese, "EDITARSOLIDO", "F", "L")).toContain(
      "Inserir uma opção de edição de face [Extrusão/Mover/Rotacionar/desLocamento/Afilar/eXcluir/COpiar/Cor/maTerial/Desfazer/Sair] <Sair>: L"
    )
    expect(written(portuguese, "5,5,10", "", "2")).toContain(
      "Especificar a distância de deslocamento: 2"
    )
  })

  it("runs a face option from its rail button (acad.cuix ID_FaceExtru)", () => {
    const cad = box()
    cad.tool("solideditoffset")
    expect(cad.state().commandLine.prompt).toBe(
      "SOLIDEDIT Select faces or [Undo/Remove]:"
    )
  })
})
