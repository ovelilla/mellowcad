import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepBox, brepIsClosed, brepVolume } from "../geometry/solids"
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

const extents = (cad: CadHarness) => brepBox(solids(cad)[0].brep)!

const prompt = (cad: CadHarness) => cad.state().commandLine.prompt

const FACE_OPTION =
  "Enter a face editing option [Extrude/Move/Rotate/Offset/Taper/Delete/Copy/coLor/mAterial/Undo/eXit] <eXit>:"
const SOLIDS_OPTION =
  "Enter a solids editing option [Face/Edge/Body/Undo/eXit] <eXit>:"
const CHECKING = "Solids editing automatic checking:  SOLIDCHECK=1"

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

describe("SOLIDEDIT's Enter (SOE-01, EDITS-D80)", () => {
  const refused: [string, string[], string, string][] = [
    [
      "Move's base point (solid-edits/p328)",
      ["M", "5,5,10", ""],
      "Specify a base point or displacement:",
      "Invalid point.",
    ],
    [
      "the first axis point (p330)",
      ["R", "5,5,10", "", ""],
      "Specify the first point on the rotation axis:",
      "Invalid point.",
    ],
    [
      "the second axis point (p400)",
      ["R", "5,5,10", "", "0,0,10"],
      "Specify the second point on the rotation axis:",
      "Invalid point.",
    ],
    [
      "the rotation angle (p400)",
      ["R", "5,5,10", "", "0,0,10", "10,0,10"],
      "Specify a rotation angle or [Reference]:",
      "Requires valid numeric angle, second point, or option keyword.",
    ],
    [
      "the offset distance (p324)",
      ["O", "5,5,10", ""],
      "Specify the offset distance:",
      "Requires numeric distance or two points.",
    ],
    [
      "Taper's base point (p333)",
      ["T", "10,5,5", ""],
      "Specify the base point:",
      "Invalid point.",
    ],
    [
      "Taper's axis point (p401)",
      ["T", "10,5,5", "", "0,0,0"],
      "Specify another point along the axis of tapering:",
      "Invalid point.",
    ],
    [
      "the taper angle (p401)",
      ["T", "10,5,5", "", "0,0,0", "0,0,10"],
      "Specify the taper angle:",
      "Requires valid numeric angle or two points.",
    ],
  ]
  for (const [name, setup, question, refusal] of refused) {
    it(`is refused at ${name}, which asks again`, () => {
      const cad = box()
      answer(cad, "SOLIDEDIT", "F", ...setup)
      expect(written(cad, "")).toEqual([question, refusal])
      expect(prompt(cad)).toBe(`SOLIDEDIT ${question}`)
    })
  }

  it("takes the base as the displacement at Move's second point (p329, p402)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "M", "5,5,10", "", "0,0,2", "")
    expect(volumes(cad)).toEqual([1200])
    expect(written(cad, "M", "5,5,12", "", "0,0,0", "")).toEqual([
      `${FACE_OPTION} M`,
      "Select faces or [Undo/Remove]: 5,5,12",
      "1 face found.",
      "Select faces or [Undo/Remove/ALL]:",
      "Specify a base point or displacement: 0,0,0",
      "Specify a second point of displacement:",
      "No change due to a zero displacement vector.",
    ])
    expect(prompt(cad)).toBe(`SOLIDEDIT ${FACE_OPTION}`)
  })

  it("goes back to the options at Select faces with none taken (p301)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O")
    expect(written(cad, "")).toEqual(["Select faces or [Undo/Remove]:"])
    expect(prompt(cad)).toBe(`SOLIDEDIT ${FACE_OPTION}`)
  })
})

describe("SOLIDEDIT's face pick (SOE-04, SOE-05, SOE-09)", () => {
  it("takes both faces of an edge (solid-edits/p313)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O")
    expect(written(cad, "5,0,10")).toEqual([
      "Select faces or [Undo/Remove]: 5,0,10",
      "2 faces found.",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1210])
  })

  it("takes both faces of a face seen edge on in plan (p361)", () => {
    const cad = createHarness()
    answer(cad, "_BOX", "0,0,0", "10,10", "10", "_ZOOM", "_E")
    answer(cad, "SOLIDEDIT", "F", "R")
    expect(written(cad, "5,0,5")).toEqual([
      "Select faces or [Undo/Remove]: 5,0,5",
      "2 faces found.",
    ])
    answer(cad, "", "V", "5,0,5", "10")
    expect(extents(cad).min.y).toBeCloseTo(-0.8816349, 6)
    expect(volumes(cad)).toEqual([1000])
  })

  it("takes the next face behind one already taken (p316)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10")
    expect(written(cad, "5,5,10")).toEqual([
      "Select faces or [Undo/Remove/ALL]: 5,5,10",
      "1 face found.",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1210])
    expect(extents(cad).max.y).toBeCloseTo(11, 9)
  })

  it("takes an edge's faces, then the face behind the top (p314)", () => {
    const cad = box()
    answer(cad, "_ZOOM", "0.5X", "SOLIDEDIT", "F", "O")
    expect(written(cad, "14,14,0", "5,5,10")).toEqual([
      "Select faces or [Undo/Remove]: 14,14,0",
      "2 faces found.",
      "Select faces or [Undo/Remove/ALL]: 5,5,10",
      "1 face found.",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1320])
  })

  it("says no solid is found on nothing (p336)", () => {
    const cad = box()
    answer(cad, "ZOOM", "0.5X", "SOLIDEDIT", "F", "O")
    expect(written(cad, "10,-3,0")).toEqual([
      "Select faces or [Undo/Remove]: 10,-3,0",
      "No solids detected.",
    ])
    expect(prompt(cad)).toBe("SOLIDEDIT Select faces or [Undo/Remove]:")
    const spanish = box(es)
    answer(spanish, "ZOOM", "0.5X", "EDITSOLIDO", "C", "D")
    expect(written(spanish, "10,-3,0")).toContain("Ningún sólido detectado.")
    const portuguese = box(ptBR)
    answer(portuguese, "ZOOM", "0.5X", "EDITARSOLIDO", "F", "L")
    expect(written(portuguese, "10,-3,0")).toContain("Sólidos não detectados.")
  })

  it("says a locked solid's layer, then that no solid is found (p321)", () => {
    const cad = createHarness()
    const layer = cad.runtime.createLayer("L1")
    cad.runtime.setCurrentLayer(layer)
    answer(cad, "_BOX", "0,0,0", "10,10", "10")
    cad.runtime.updateLayer(layer, { locked: true })
    view(cad)
    answer(cad, "SOLIDEDIT", "F", "O")
    expect(written(cad, "5,5,10", "")).toEqual([
      "Select faces or [Undo/Remove]: 5,5,10",
      "The object is on a locked layer.",
      "No solids detected.",
      "Select faces or [Undo/Remove]:",
    ])
    expect(prompt(cad)).toBe(`SOLIDEDIT ${FACE_OPTION}`)
  })

  it("takes the face in front of a hidden one typed (p311), in plan the top (p312)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,0", "", "2")
    expect(extents(cad).min.y).toBeCloseTo(-2, 9)
    const plan = createHarness()
    answer(plan, "_BOX", "0,0,0", "10,10", "10", "_ZOOM", "_E")
    answer(plan, "SOLIDEDIT", "F", "O", "5,5,0", "", "2")
    expect(extents(plan).max.z).toBeCloseTo(12, 9)
  })

  it("passes over a second solid's face in silence (p315)", () => {
    const cad = createHarness()
    answer(cad, "_BOX", "0,0,0", "10,10", "10", "_BOX", "20,0,0", "30,10", "10")
    view(cad)
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10")
    expect(written(cad, "25,5,10")).toEqual([
      "Select faces or [Undo/Remove/ALL]: 25,5,10",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1100, 1000])
  })
})

describe("SOLIDEDIT's Remove and ALL (SOE-08)", () => {
  it("says nothing removing a face not taken, nor at ALL there (p322)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10", "R")
    expect(written(cad, "5,0,5", "ALL", "A")).toEqual([
      "Remove faces or [Undo/Add/ALL]: 5,0,5",
      "Remove faces or [Undo/Add/ALL]: ALL",
      "Remove faces or [Undo/Add/ALL]: A",
    ])
    expect(prompt(cad)).toBe("SOLIDEDIT Select faces or [Undo/Remove/ALL]:")
    answer(cad, "")
    expect(prompt(cad)).toBe(`SOLIDEDIT ${FACE_OPTION}`)
  })

  it("keeps ALL once a pick has started, taking every face (p323)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10", "R")
    expect(written(cad, "5,5,10", "A", "ALL")).toEqual([
      "Remove faces or [Undo/Add/ALL]: 5,5,10",
      "1 face found, 1 removed.",
      "Remove faces or [Undo/Add/ALL]: A",
      "Select faces or [Undo/Remove/ALL]: ALL",
      "6 faces found.",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1728])
  })

  it("refuses ALL before a pick, then counts the faces it adds (p317)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O")
    expect(written(cad, "ALL", "5,5,10", "ALL")).toEqual([
      "Select faces or [Undo/Remove]: ALL",
      "*Invalid selection*",
      "Expects a point or Crossing/Fence/CPolygon/Undo",
      "Select faces or [Undo/Remove]: 5,5,10",
      "1 face found.",
      "Select faces or [Undo/Remove/ALL]: ALL",
      "5 faces found.",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1728])
  })
})

describe("SOLIDEDIT's Undo (SOE-06, SOE-07, EDITS-D83, EDITS-D84)", () => {
  it("says the command is undone at the solids option with nothing done (solid-edits/p300)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT")
    expect(written(cad, "U")).toEqual([
      `${SOLIDS_OPTION} U`,
      "Command has been completely undone.",
      CHECKING,
    ])
    const spanish = box(es)
    answer(spanish, "EDITSOLIDO")
    expect(written(spanish, "H")[1]).toBe(
      "Todos los efectos del comando han sido deshechos."
    )
    const portuguese = box(ptBR)
    answer(portuguese, "EDITARSOLIDO")
    expect(written(portuguese, "D")[1]).toBe(
      "O comando foi desfeito completamente."
    )
  })

  it("says it at the face option with nothing done (p301)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F")
    expect(written(cad, "U")).toEqual([
      `${FACE_OPTION} U`,
      "Command has been completely undone.",
    ])
  })

  it("says it once the last edit is taken back, and after (p302)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10", "", "1")
    answer(cad, "O", "5,5,11", "", "1")
    expect(written(cad, "U")).toEqual([`${FACE_OPTION} U`])
    expect(volumes(cad)).toEqual([1100])
    expect(written(cad, "U")).toEqual([
      `${FACE_OPTION} U`,
      "Command has been completely undone.",
    ])
    expect(volumes(cad)).toEqual([1000])
    expect(written(cad, "U")).toEqual([
      `${FACE_OPTION} U`,
      "Command has been completely undone.",
    ])
  })

  it("takes no face edit back at the solids option (p303)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10", "", "2", "X")
    expect(written(cad, "U")).toEqual([`${SOLIDS_OPTION} U`, CHECKING])
    expect(volumes(cad)).toEqual([1200])
  })

  it("takes the last face added back at Select faces (p304)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O")
    expect(written(cad, "U", "5,5,10", "5,0,5", "U")).toEqual([
      "Select faces or [Undo/Remove]: U",
      "Face selection has been completely undone.",
      "Select faces or [Undo/Remove]: 5,5,10",
      "1 face found.",
      "Select faces or [Undo/Remove/ALL]: 5,0,5",
      "1 face found.",
      "Select faces or [Undo/Remove/ALL]: U",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1100])
  })

  it("puts the last face removed back at Remove faces (p305, p368)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10", "5,0,5", "R", "5,0,5")
    expect(written(cad, "U")).toEqual([
      "Remove faces or [Undo/Add/ALL]: U",
      "Face selection has been completely undone.",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1210])
    const edge = box()
    answer(edge, "SOLIDEDIT", "F", "O", "5,0,10", "R")
    expect(written(edge, "5,0,10", "U")).toEqual([
      "Remove faces or [Undo/Add/ALL]: 5,0,10",
      "2 faces found, 2 removed.",
      "Remove faces or [Undo/Add/ALL]: U",
      "Face selection has been completely undone.",
    ])
    const spanish = box(es)
    answer(spanish, "EDITSOLIDO", "C", "D")
    expect(written(spanish, "H")).toContain(
      "La selección de cara se ha deshecho completamente."
    )
    const portuguese = box(ptBR)
    answer(portuguese, "EDITARSOLIDO", "F", "L")
    expect(written(portuguese, "D")).toContain(
      "A seleção de face foi completamente desfeita."
    )
  })

  it("keeps the set at Remove faces with none removed (p374)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10", "5,0,5", "R")
    expect(written(cad, "U")).toEqual([
      "Remove faces or [Undo/Add/ALL]: U",
      "Face selection has been completely undone.",
    ])
    answer(cad, "", "1")
    expect(volumes(cad)).toEqual([1210])
  })
})

describe("SOLIDEDIT's zero and out-of-range values (SOE-10, EDITS-D88)", () => {
  const again: [string, string[], string, string][] = [
    [
      "an offset of 0 (solid-edits/p324)",
      ["O", "5,5,10", ""],
      "0",
      "Value must be nonzero.",
    ],
    [
      "a height of 0 (p325)",
      ["E", "5,5,10", ""],
      "0",
      "Value must be nonzero.",
    ],
    [
      "an extrusion's taper of 90 (p327)",
      ["E", "5,5,10", "", "1"],
      "90",
      "Angle must be greater than -90 degrees and less than 90 degrees.",
    ],
    [
      "an extrusion's taper of -90",
      ["E", "5,5,10", "", "1"],
      "-90",
      "Angle must be greater than -90 degrees and less than 90 degrees.",
    ],
    [
      "a taper angle of 0 (p333)",
      ["T", "10,5,5", "", "0,0,0", "0,0,10"],
      "0",
      "The taper angle must be non-zero and between -90 and 90.",
    ],
    [
      "a taper angle of 90",
      ["T", "10,5,5", "", "0,0,0", "0,0,10"],
      "90",
      "The taper angle must be non-zero and between -90 and 90.",
    ],
  ]
  for (const [name, setup, value, refusal] of again) {
    it(`refuses ${name} and asks again`, () => {
      const cad = box()
      answer(cad, "SOLIDEDIT", "F", ...setup)
      const asked = prompt(cad)
      expect(written(cad, value).slice(1)).toEqual([refusal])
      expect(prompt(cad)).toBe(asked)
      expect(volumes(cad)).toEqual([1000])
    })
  }

  it("says a Move by zero and a Rotate by 0 change nothing, no Undo step (p328, p330)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "M", "5,5,10", "", "0,0,0")
    expect(written(cad, "0,0,0")).toEqual([
      "Specify a second point of displacement: 0,0,0",
      "No change due to a zero displacement vector.",
    ])
    answer(cad, "R", "5,5,10", "", "0,0,10", "10,0,10")
    expect(written(cad, "0")).toEqual([
      "Specify a rotation angle or [Reference]: 0",
      "No change due to a zero rotation angle.",
    ])
    expect(prompt(cad)).toBe(`SOLIDEDIT ${FACE_OPTION}`)
    expect(written(cad, "U")).toEqual([
      `${FACE_OPTION} U`,
      "Command has been completely undone.",
    ])
    expect(volumes(cad)).toEqual([1000])
  })

  it("refuses FOO, 0, another prompt's keyword and Enter at the offset (p324)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10", "")
    expect(written(cad, "FOO", "0", "P", "", "1")).toEqual([
      "Specify the offset distance: FOO",
      "Requires numeric distance or two points.",
      "Specify the offset distance: 0",
      "Value must be nonzero.",
      "Specify the offset distance: P",
      "Requires numeric distance or two points.",
      "Specify the offset distance:",
      "Requires numeric distance or two points.",
      "Specify the offset distance: 1",
      "Solid validation started.",
      "Solid validation completed.",
    ])
    expect(volumes(cad)).toEqual([1100])
  })

  it("extrudes inwards by a negative height and taper (p325)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "E", "5,5,10", "")
    expect(written(cad, "R", "-2", "-5").slice(0, 3)).toEqual([
      "Specify height of extrusion or [Path]: R",
      "Requires numeric distance, two points, or option keyword.",
      "Specify height of extrusion or [Path]: -2",
    ])
    expect(volumes(cad)).toEqual([800])
  })
})

describe("SOLIDEDIT's rotation angle (SOE-16, SOE-21)", () => {
  it("measures a point from the second axis point (solid-edits/p125)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "R", "5,5,10", "", "0,0,10", "10,0,10")
    expect(written(cad, "20,1.7633,10")).toEqual([
      "Specify a rotation angle or [Reference]: 20,1.7633,10",
      "Solid validation started.",
      "Solid validation completed.",
    ])
    expect(volumes(cad)[0]).toBeCloseTo(1088.1635, 2)
  })

  it("takes an axis of no length, a point then turning by 0 (p362)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "R", "5,5,10", "", "0,0,10")
    expect(written(cad, "0,0,10", "10,0,10")).toEqual([
      "Specify the second point on the rotation axis: 0,0,10",
      "Specify a rotation angle or [Reference]: 10,0,10",
      "No change due to a zero rotation angle.",
    ])
    answer(cad, "C", "5,5,10", "", "0,0,0", "0,0,0", "X", "X")
    expect(cad.entities().map((e) => e.type)).toEqual(["solid3d", "region"])
  })

  it("keeps <2points> and <0,0,0> after a run with Xaxis (p309, p310)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "R", "5,5,10", "", "X", "0,0,10", "10")
    answer(cad, "R", "5,5,10", "")
    expect(prompt(cad)).toBe(
      "SOLIDEDIT Specify an axis point or [Axis by object/View/Xaxis/Yaxis/Zaxis] <2points>:"
    )
    answer(cad, "X")
    expect(prompt(cad)).toBe(
      "SOLIDEDIT Specify the origin of the rotation <0,0,0>:"
    )
  })
})

describe("SOLIDEDIT's LASTPOINT (ELP-03)", () => {
  // LASTPOINT read mid-command as the probes read it ('SETVAR LASTPOINT,
  // Enter), then `ID @`'s once the run is over; set from 7,7,7 first.
  const R = "<LASTPOINT>"
  const readings = (cad: CadHarness, ...texts: string[]) => {
    const xyz = (line: string) =>
      (line.match(/-?\d+(\.\d+)?/g) ?? []).map((n) => Number(n) + 0).slice(-3)
    const out: number[][] = []
    answer(cad, "ID", "7,7,7")
    for (const text of texts) {
      if (text !== R) {
        answer(cad, text)
        continue
      }
      const asked = written(cad, "'SETVAR", "LASTPOINT", "")
      out.push(xyz(asked.find((line) => line.includes("LASTPOINT <"))!))
    }
    out.push(xyz(written(cad, "ID", "@").join(" ")))
    return out
  }

  it("sets it at the face typed, Move's base and second point (solid-edits/p123)", () => {
    expect(
      readings(
        box(),
        "_SOLIDEDIT",
        "_F",
        "_M",
        "5,5,10",
        "",
        R,
        "0,0,0",
        R,
        "0,0,1",
        R,
        "_X",
        "_X"
      )
    ).toEqual([
      [5, 5, 10],
      [0, 0, 0],
      [0, 0, 1],
      [0, 0, 1],
    ])
  })

  it("keeps Move's base when Enter takes it as the displacement (p124)", () => {
    expect(
      readings(
        box(),
        "_SOLIDEDIT",
        "_F",
        "_M",
        "5,5,10",
        "",
        "0,0,1",
        "",
        R,
        "_X",
        "_X"
      )
    ).toEqual([
      [0, 0, 1],
      [0, 0, 1],
    ])
  })

  it("sets it at both axis points, not at an angle by a point (p125)", () => {
    expect(
      readings(
        box(),
        "_SOLIDEDIT",
        "_F",
        "_R",
        "5,5,10",
        "",
        "0,0,10",
        R,
        "10,0,10",
        R,
        "20,1.7633,10",
        R,
        "_X",
        "_X"
      )
    ).toEqual([
      [0, 0, 10],
      [10, 0, 10],
      [10, 0, 10],
      [10, 0, 10],
    ])
  })

  it("sets it at a typed origin, Enter's keeping it (p136)", () => {
    expect(
      readings(
        box(),
        "_SOLIDEDIT",
        "_F",
        "_R",
        "5,0,5",
        "",
        "_Z",
        "5,0,4",
        R,
        "-15",
        R,
        "_R",
        "5,0,5",
        "",
        "_Z",
        "",
        R,
        "5",
        "_X",
        "_X"
      )
    ).toEqual([
      [5, 0, 4],
      [5, 0, 4],
      [5, 0, 5],
      [5, 0, 5],
    ])
  })
})

describe("SOLIDEDIT's run (solid-edits/p306, p307, p334, p337, p338, p350–p357, p360)", () => {
  it("is one step to U and REDO, two to UNDO 2 (p306, p307)", () => {
    const cad = box()
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,10", "", "1")
    answer(cad, "O", "5,5,11", "", "1", "X", "X")
    expect(written(cad, "U")).toContain("SOLIDEDIT")
    expect(volumes(cad)).toEqual([1000])
    expect(written(cad, "REDO")).toContain("SOLIDEDIT")
    expect(volumes(cad)).toEqual([1200])
    answer(cad, "SOLIDEDIT", "F", "O", "5,5,12", "", "1", "X", "X")
    expect(written(cad, "UNDO", "2")).toContain("SOLIDEDIT SOLIDEDIT")
    expect(volumes(cad)).toEqual([1000])
  })

  it("is a step U names after a run that changed nothing (p360)", () => {
    // p360 runs it as `_.SOLIDEDIT`: the `.` prefix is the command line's Missing.
    const cad = box()
    answer(cad, "_SOLIDEDIT", "F", "X", "X")
    expect(written(cad, "U")).toContain("SOLIDEDIT")
    expect(solids(cad)).toHaveLength(1)
  })

  it("gives Copy's region the current layer, colour and lineweight (p334)", () => {
    const cad = box()
    const layer = cad.runtime.createLayer("L1")
    cad.runtime.setCurrentLayer(layer)
    cad.runtime.setCurrentColor("#ff0000")
    cad.runtime.setCurrentLineweight(0.5)
    answer(cad, "SOLIDEDIT", "F", "C", "5,5,10", "", "0,0,0", "0,0,5")
    const region = cad
      .entities()
      .find((e): e is RegionEntity => e.type === "region")!
    expect(region.layerId).toBe(layer)
    expect(region.color).toBeDefined()
    expect(region.lineweight).toBe(0.5)
  })

  it("repeats from the solids option at Enter, after a rail run too (p337)", () => {
    const cad = box()
    cad.tool("solideditextrude")
    answer(cad, "5,5,10", "", "1", "", "X", "X")
    expect(written(cad, "")).toEqual(["SOLIDEDIT", CHECKING])
    expect(prompt(cad)).toBe(`SOLIDEDIT ${SOLIDS_OPTION}`)
  })

  it("may not be run transparently (p338)", () => {
    const cad = box()
    answer(cad, "LINE", "0,0")
    expect(written(cad, "'SOLIDEDIT")).toEqual([
      "Specify next point or [Undo]: 'SOLIDEDIT",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  it("zooms transparently at each of its prompts (p350–p357)", () => {
    const prompts: string[][] = [
      [],
      ["F"],
      ["F", "O"],
      ["F", "O", "5,5,10"],
      ["F", "E", "5,5,10", ""],
      ["F", "E", "5,5,10", "", "1"],
      ["F", "M", "5,5,10", ""],
      ["F", "M", "5,5,10", "", "0,0,0"],
      ["F", "R", "5,5,10", ""],
      ["F", "R", "5,5,10", "", "X"],
      ["F", "R", "5,5,10", "", "X", "0,0,10"],
      ["F", "O", "5,5,10", ""],
      ["F", "T", "10,5,5", ""],
      ["F", "T", "10,5,5", "", "0,0,0"],
      ["F", "T", "10,5,5", "", "0,0,0", "0,0,10"],
    ]
    for (const setup of prompts) {
      const cad = box()
      answer(cad, "SOLIDEDIT", ...setup)
      const asked = prompt(cad)
      expect(written(cad, "'ZOOM", "E")).toContain(
        "Resuming SOLIDEDIT command."
      )
      expect(prompt(cad)).toBe(asked)
    }
  })
})
