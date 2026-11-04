import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepIsClosed, brepVolume } from "../geometry/solids"
import {
  brepMoments,
  regionMoments,
  solidInertia,
} from "../geometry/massProperties"
import { arbitraryAxis } from "../geometry/ocs"
import type { Vec3 } from "../geometry/Vec3"
import { regionArea } from "../domain/regions"
import type { Entity, RegionEntity, Solid3dEntity } from "../domain/entities"
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

const regions = (cad: CadHarness) =>
  cad.entities().filter((e): e is RegionEntity => e.type === "region")

const volumes = (cad: CadHarness) =>
  solids(cad).map((s) => Math.round(brepVolume(s.brep) * 1e6) / 1e6)

const centroid = (s: Solid3dEntity) =>
  solidInertia(brepMoments(s.brep)).centroid

const Z: Vec3 = { x: 0, y: 0, z: 1 }

/** A coordinate to six places, as the console prints it. */
const near = (n: number) => Math.round(n * 1e6) / 1e6 + 0

/** Where a region lies in space: its area's centroid. */
const regionCentroid = (r: RegionEntity) =>
  solidInertia(
    regionMoments(r.faces, arbitraryAxis(r.normal ?? Z)!, r.elevation ?? 0, {
      x: 0,
      y: 0,
    })
  ).centroid

function expectPoint(actual: Vec3, expected: Vec3, digits = 9) {
  expect(actual).toBeCloseToPoint(expected, digits)
  expect(actual.z).toBeCloseTo(expected.z, digits)
}

/** What a run of SLICE leaves: each solid's volume, and whether it is the one given. */
const kept = (cad: CadHarness, id: string) => {
  const each = volumes(cad)
  return solids(cad).map((s, i) => [s.id === id, each[i]])
}

/** A 10 box at the origin, as the probes draw one. */
function box(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  return answer(cad, "_BOX", "0,0,0", "10,10", "10")
}

/** Two 10 boxes, at the origin and at 20,0,0, in that order. */
function twoBoxes(): CadHarness {
  return answer(
    createHarness(),
    "_BOX",
    "0,0,0",
    "10,10",
    "10",
    "_BOX",
    "20,0,0",
    "30,10",
    "10"
  )
}

/** The box with a circle on its plane at Z 4 (radius 1 about 5,5), zoomed to it. */
function boxAndCircle(locale?: typeof es): CadHarness {
  return answer(box(locale), "_CIRCLE", "5,5,4", "1", "_ZOOM", "_E")
}

/** The box seen as the desktop probes saw it (solid-edits/d05, d06). */
function viewed(): CadHarness {
  return answer(box(), "_-VPOINT", "-1.3,-2.2,1.6", "_ZOOM", "_E")
}

/** A layer made locked, `entity` moved onto it. */
function lockedLayer(cad: CadHarness, entity: Entity): void {
  const layer = cad.runtime.createLayer("LK", undefined, false)
  cad.select(entity.id)
  answer(cad, "CHPROP", "LA", "LK", "")
  cad.runtime.updateLayer(layer, { locked: true })
}

describe("SLICE", () => {
  it("cuts by two points square to the XY, keeping both sides (slice/s01)", () => {
    const cad = box()
    const id = solids(cad)[0].id
    expect(written(cad, "SLICE", "L", "", "5,0", "5,10", "")).toEqual([
      "SLICE",
      "Select objects to slice: L",
      "1 found",
      "Select objects to slice:",
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: 5,0",
      "Specify second point on plane: 5,10",
      "Specify a point on desired side or [keep Both sides] <Both>:",
    ])
    expect(volumes(cad)).toEqual([500, 500])
    // The object keeps the side the plane's normal points to, (p2 − p1) × Z.
    const kept = solids(cad).find((s) => s.id === id)!
    expect(centroid(kept).x).toBeCloseTo(7.5, 9)
    expect(solids(cad).every((s) => brepIsClosed(s.brep))).toBe(true)
    // What made it is gone: History = None, no Solid type.
    expect(kept.primitive).toBeUndefined()
  })

  it("keeps the side a point is on, as the object it was (s02)", () => {
    const cad = box()
    const id = solids(cad)[0].id
    answer(cad, "SLICE", "L", "", "XY", "0,0,3", "0,0,8")
    expect(volumes(cad)).toEqual([700])
    expect(solids(cad)[0].id).toBe(id)
  })

  it("takes YZ and ZX at <0,0,0>, Zaxis, View and 3points (s03–s06)", () => {
    const yz = box()
    answer(yz, "SLICE", "L", "", "YZ", "2,0,0", "B")
    expect(volumes(yz)).toEqual([800, 200])
    const zx = box()
    answer(zx, "SLICE", "L", "", "ZX", "0,4,0", "")
    expect(volumes(zx)).toEqual([600, 400])
    const z = box()
    expect(
      written(z, "SLICE", "L", "", "Z", "0,0,4", "0,0,4", "0,0,5", "0,0,0")
    ).toEqual([
      "SLICE",
      "Select objects to slice: L",
      "1 found",
      "Select objects to slice:",
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: Z",
      "Specify a point on the section plane: 0,0,4",
      "Specify a point on the Z-axis (normal) of the plane: 0,0,4",
      "Point on plane and point on Z-axis cannot be identical.",
      "Specify a point on the Z-axis (normal) of the plane: 0,0,5",
      "Specify a point on desired side or [keep Both sides] <Both>: 0,0,0",
    ])
    expect(volumes(z)).toEqual([400])
    const view = box()
    answer(view, "SLICE", "L", "", "V", "0,0,2", "0,0,3")
    expect(volumes(view)).toEqual([800])
    const three = box()
    answer(three, "SLICE", "L", "", "", "0,0,2", "10,0,8", "0,10,2", "")
    expect(volumes(three)).toEqual([500, 500])
    expect(centroid(solids(three)[0]).z).toBeCloseTo(7.2, 9)
  })

  it("takes a circle's plane (planar Object), and finds no surface (s06, solid-edits/p174)", () => {
    const cad = box()
    answer(cad, "CIRCLE", "5,5,4", "1")
    const circle = cad.latest()
    answer(cad, "SLICE", "ALL", "", "O")
    cad.click({ x: 6, y: 5, z: 4 })
    answer(cad, "0,0,0")
    expect(volumes(cad)).toEqual([400])
    // The circle only gives the plane: it stays as it was.
    expect(cad.byId(circle.id)).toBe(circle)
    expect(written(cad, "SLICE", "ALL", "", "S")).toEqual([
      "SLICE",
      "Select objects to slice: ALL",
      "2 found",
      "Select objects to slice:",
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: S",
    ])
    cad.click({ x: 6, y: 5, z: 4 })
    expect(cad.commandLog().at(-1)).toBe("No surfaces selected.")
    answer(cad, "")
    expect(cad.activeToolId()).toBe("select")
  })

  it("says what it cannot cut, and refuses what it cannot take (s07, s08)", () => {
    const cad = box()
    expect(written(cad, "SLICE", "L", "", "XY", "0,0,10", "0,0,0")).toEqual([
      "SLICE",
      "Select objects to slice: L",
      "1 found",
      "Select objects to slice:",
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: XY",
      "Specify a point on the XY-plane <0,0,0>: 0,0,10",
      "Specify a point on desired side or [keep Both sides] <Both>: 0,0,0",
      "Slicing plane does not intersect the selected solid.",
    ])
    expect(volumes(cad)).toEqual([1000])
    expect(
      written(
        cad,
        "SLICE",
        "L",
        "",
        "FOO",
        "5,5,0",
        "5,5,8",
        "5,0",
        "5,10",
        "5,3,3",
        "0,0,0"
      )
    ).toEqual([
      "SLICE",
      "Select objects to slice: L",
      "1 found",
      "Select objects to slice:",
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: FOO",
      "Point or option keyword required.",
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: 5,5,0",
      "Specify second point on plane: 5,5,8",
      "First and second points must have distinct X,Y coordinates. *Invalid*",
      "Specify second point on plane: 5,0",
      "Specify a point on desired side or [keep Both sides] <Both>: 5,10",
      "The point should not be on the slicing plane.",
      "Specify a point on desired side or [keep Both sides] <Both>: 5,3,3",
      "The point should not be on the slicing plane.",
      "Specify a point on desired side or [keep Both sides] <Both>: 0,0,0",
    ])
    expect(volumes(cad)).toEqual([500])
  })

  it("passes over what is no solid, counts what it misses (s09, s12, solid-edits/p140)", () => {
    const cad = box()
    answer(cad, "BOX", "20,0,0", "30,10", "4", "LINE", "40,0", "50,0", "")
    answer(cad, "SLICE", "ALL", "", "XY", "0,0,5", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Slicing plane does not intersect 1 selected solid."
    )
    expect(volumes(cad)).toEqual([500, 400, 500])
    expect(cad.entities().filter((e) => e.type === "line")).toHaveLength(1)
  })

  it("makes the half in the solid's layer, colour, linetype and lineweight, not the current ones (solid-edits/p158)", () => {
    const cad = box()
    const source = solids(cad)[0]
    const l1 = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.createLayer("L2")
    answer(cad, "CHPROP", "L", "", "LA", "L1", "C", "3", "LT", "HIDDEN")
    answer(cad, "LW", "0.3", "")
    cad.runtime.setCurrentColor("#0000ff")
    cad.runtime.setCurrentLinetype("Dashed")
    cad.runtime.setCurrentLineweight(0.5)
    answer(cad, "SLICE", "L", "", "XY", "0,0,5", "")
    const wears = (s: Solid3dEntity) => [
      s.layerId,
      s.color,
      s.linetype,
      s.lineweight,
    ]
    const [half, added] = solids(cad)
    expect(half.id).toBe(source.id)
    expect(wears(half)[0]).toBe(l1)
    expect(wears(half).every((v) => v !== undefined)).toBe(true)
    expect(wears(added)).toEqual(wears(half))
    expect(centroid(half).z).toBeCloseTo(7.5, 9)
  })

  it("is one step U takes back (s13)", () => {
    const cad = box()
    answer(cad, "SLICE", "L", "", "XY", "0,0,5", "")
    expect(solids(cad)).toHaveLength(2)
    expect(written(cad, "U")).toEqual(["U", "SLICE"])
    expect(volumes(cad)).toEqual([1000])
    expect(solids(cad)[0].primitive?.kind).toBe("box")
  })

  it("asks in Spanish and Portuguese as their AutoCAD does (s01, s04)", () => {
    const spanish = box(es)
    expect(written(spanish, "CORTE", "LT", "", "5,0", "5,10", "A")).toEqual([
      "CORTE",
      "Designe objetos para cortar: LT",
      "1 encontrados",
      "Designe objetos para cortar:",
      "Precise punto inicial de plano cortante u [Objeto plano/Superficie/ejeZ/Vista/XY/YZ/ZX/3puntos] <3puntos>: 5,0",
      "Precise segundo punto en plano: 5,10",
      "Precise un punto en el lado deseado o [mantener Ambos lados] <Ambos>: A",
    ])
    expect(volumes(spanish)).toEqual([500, 500])
    const portuguese = box(ptBR)
    expect(written(portuguese, "FATIAR", "_L", "", "XY", "0,0,4", "")).toEqual([
      "FATIAR",
      "Selecionar objetos a serem fatiados: _L",
      "1 encontrado(s)",
      "Selecionar objetos a serem fatiados:",
      "Especificar ponto inicial de plano de fatiamento ou [Objeto plano/Superfície/eixoZ/Vista/XY/YZ/ZX/3pontos] <3pontos> XY",
      "Especificar um ponto no plano XY <0,0,0>: 0,0,4",
      "Especificar um ponto no lado desejado ou [manter Ambos os lados] <Ambos>:",
    ])
  })
})

describe("SECTION", () => {
  it("adds the region the plane cuts, on the current layer (section/c01, c09)", () => {
    const cad = box()
    answer(cad, "CHPROP", "L", "", "C", "3", "")
    answer(cad, "-COLOR", "5")
    expect(written(cad, "SECTION", "L", "", "XY", "0,0,5")).toEqual([
      "SECTION",
      "Select objects: L",
      "1 found",
      "Select objects:",
      "Specify first point on Section plane by [Object/Zaxis/View/XY/YZ/ZX/3points] <3points>: XY",
      "Specify a point on the XY-plane <0,0,0>: 0,0,5",
    ])
    const [region] = regions(cad)
    answer(cad, "LINE", "20,0", "30,0", "")
    const current = cad.latest().color
    expect(regionArea(region)).toBeCloseTo(100, 9)
    expect(region.elevation).toBeCloseTo(5, 12)
    expect(region.color).toBe(current)
    // The solid stays as it was.
    expect(volumes(cad)).toEqual([1000])
  })

  it("cuts a cylinder along its axis and askew (c03)", () => {
    const cad = createHarness()
    answer(cad, "CYLINDER", "0,0,0", "5", "10", "SECTION", "L", "", "ZX", "")
    expect(regionArea(regions(cad)[0])).toBeCloseTo(100, 9)
    answer(cad, "SECTION", "ALL", "", "0,-10,3", "0,10,3", "10,0,7")
    expect(regionArea(regions(cad)[1])).toBeCloseTo(84.58997098232028, 9)
  })

  it("takes a face the plane holds, and says what it misses (c04, c06)", () => {
    const cad = box()
    answer(cad, "BOX", "20,0,0", "30,10", "4")
    expect(written(cad, "SECTION", "ALL", "", "XY", "0,0,20")).toContain(
      "Sectioning plane does not intersect 2 selected solids."
    )
    expect(written(cad, "SECTION", "ALL", "", "XY", "0,0,8")).toContain(
      "Sectioning plane does not intersect 1 selected solid."
    )
    answer(cad, "SECTION", "ALL", "", "XY", "0,0,10")
    expect(regions(cad).map((r) => Math.round(regionArea(r)))).toEqual([
      100, 100,
    ])
    expect(written(cad, "SECTION", "L", "")).toEqual([
      "SECTION",
      "Select objects: L",
      "1 found",
      "Select objects:",
      "No Solids, Surfaces or Meshes selected.",
    ])
  })

  it("is one step U takes back (c07), and asks in Spanish and Portuguese", () => {
    const cad = box()
    answer(cad, "SECTION", "L", "", "XY", "0,0,5")
    expect(written(cad, "U")).toEqual(["U", "SECTION"])
    expect(regions(cad)).toHaveLength(0)
    expect(written(box(es), "SECCION", "LT", "", "XY", "0,0,5")).toContain(
      "Precise primer punto en plano de sección mediante [Objeto/ejeZ/Vista/XY/YZ/ZX/3puntos] <3puntos>: XY"
    )
    expect(written(box(ptBR), "CORTE", "_L", "", "XY", "0,0,5")).toContain(
      "Especificar o primeiro ponto no Plano de corte por [Objeto/eixoZ/Vista/XY/YZ/ZX/3pontos] <3pontos>: XY"
    )
  })
})

describe("the plane in a turned or moved UCS (EDITS-D9)", () => {
  it("YZ and ZX are the UCS's, turned about Z (solid-edits/p147, p173)", () => {
    const yz = box()
    const id = solids(yz)[0].id
    answer(yz, "_UCS", "_Z", "30", "_SLICE", "_L", "", "_YZ", "2,0,0", "")
    expect(kept(yz, id)[0]).toEqual([true, 953.811978])
    expectPoint(
      centroid(solids(yz)[0]),
      { x: 5.20484598278454, y: 5.177557089642416, z: 5 },
      6
    )
    const zx = box()
    answer(zx, "_UCS", "_Z", "30", "_SLICE", "_L", "", "_ZX", "0,2,0", "")
    expect(volumes(zx)).toEqual([480.384758, 519.615242])
    expectPoint(
      centroid(solids(zx)[0]),
      { x: 3.9984585968154955, y: 7.3089561119867525, z: 5 },
      6
    )
  })

  it("YZ and ZX are the UCS's, turned about Y (solid-edits/p172)", () => {
    const cad = box()
    const id = solids(cad)[0].id
    answer(cad, "_UCS", "_Y", "90", "_SLICE", "_L", "", "_YZ", "-3,0,0", "")
    expect(kept(cad, id)).toEqual([
      [true, 300],
      [false, 700],
    ])
    answer(cad, "_SLICE", "_L", "", "_ZX", "0,4,0", "")
    expect(volumes(cad)).toEqual([300, 420, 280])
    expectPoint(centroid(solids(cad)[1]), { x: 5, y: 7, z: 6.5 })
  })

  it("Enter's <0,0,0> is the UCS's origin (solid-edits/p177)", () => {
    const cad = box()
    const id = solids(cad)[0].id
    answer(cad, "_UCS", "_O", "0,0,3", "_SLICE", "_L", "", "_XY", "", "")
    expect(kept(cad, id)).toEqual([
      [true, 700],
      [false, 300],
    ])
    answer(cad, "_SECTION", "_ALL", "", "_V", "")
    expect(regions(cad).map((r) => near(regionCentroid(r).z))).toEqual([3, 3])
  })

  it("takes two points, XY and View in a UCS turned about Z or X (solid-edits/p146, p148–p150)", () => {
    const turned = box()
    const id = solids(turned)[0].id
    answer(turned, "_UCS", "_Z", "30", "_SLICE", "_L", "", "0,0", "10,0", "")
    expect(kept(turned, id)).toEqual([
      [true, 288.675135],
      [false, 711.324865],
    ])
    expectPoint(
      centroid(solids(turned)[0]),
      { x: 6.666666666666668, y: 1.9245008972987516, z: 5 },
      6
    )
    const tilted = box()
    answer(tilted, "_UCS", "_X", "90", "_SLICE", "_L", "", "0,0", "10,10", "")
    expectPoint(
      centroid(solids(tilted)[0]),
      { x: 6.666666666666667, y: 5, z: 3.3333333333333335 },
      6
    )
    const xy = box()
    answer(xy, "_UCS", "_X", "90", "_SLICE", "_L", "", "_XY", "0,0,-4")
    answer(xy, "0,0,0")
    expect(volumes(xy)).toEqual([400])
    expectPoint(centroid(solids(xy)[0]), { x: 5, y: 2, z: 5 })
    const view = box()
    answer(view, "_UCS", "_X", "90", "_SLICE", "_L", "", "_V", "0,3,0", "")
    expect(volumes(view)).toEqual([700, 300])
    expectPoint(centroid(solids(view)[0]), { x: 5, y: 5, z: 6.5 })
  })

  it("SECTION in a tilted UCS: the current layer, the UCS's Z (solid-edits/p151)", () => {
    const cad = twoBoxes()
    const l1 = cad.runtime.createLayer("L1", undefined, false)
    answer(cad, "CHPROP", "ALL", "", "LA", "L1", "")
    const l2 = cad.runtime.createLayer("L2")
    answer(cad, "_UCS", "_X", "90", "_SECTION", "_ALL", "", "_XY", "0,0,-5")
    expect(solids(cad).every((s) => s.layerId === l1)).toBe(true)
    expect(regions(cad).map((r) => r.layerId)).toEqual([l2, l2])
    for (const region of regions(cad)) {
      expectPoint(region.normal!, { x: 0, y: -1, z: 0 })
      expect(regionArea(region)).toBeCloseTo(100, 9)
    }
  })
})

describe("the set", () => {
  it("drops a preselection and asks; Enter on none says so (solid-edits/p130, p131)", () => {
    const slice = box()
    slice.selectAll()
    expect(written(slice, "SLICE")).toEqual(["SLICE"])
    expect(slice.selectedIds()).toEqual([])
    expect(written(slice, "")).toEqual([
      "Select objects to slice:",
      "No objects selected.",
    ])
    expect(slice.activeToolId()).toBe("select")
    const section = box()
    section.selectAll()
    expect(written(section, "SECTION", "")).toEqual([
      "SECTION",
      "Select objects:",
      "No objects selected.No Solids, Surfaces or Meshes selected.",
    ])
    expect(regions(section)).toHaveLength(0)
  })

  it("says the empty set in Spanish and Portuguese (solid-edits/p130, p131)", () => {
    expect(written(box(es), "CORTE", "")).toEqual([
      "CORTE",
      "Designe objetos para cortar:",
      "No hay ningún objeto seleccionado.",
    ])
    expect(written(box(es), "SECCION", "")).toEqual([
      "SECCION",
      "Designe objetos:",
      "No hay ningún objeto seleccionado.No se ha seleccionado ningún sólido, superficie o malla.",
    ])
    expect(written(box(ptBR), "FATIAR", "")).toEqual([
      "FATIAR",
      "Selecionar objetos a serem fatiados:",
      "Nenhum objeto selecionado.",
    ])
    expect(written(box(ptBR), "CORTE", "")).toEqual([
      "CORTE",
      "Selecionar objetos:",
      "Nenhum objeto selecionado.Nenhum sólido, superfície ou malha selecionado.",
    ])
  })

  it("leaves a locked solid out, said (solid-edits/p159, p162)", () => {
    for (const command of ["SLICE", "SECTION"]) {
      const cad = twoBoxes()
      lockedLayer(cad, solids(cad)[0])
      const lines = written(cad, command, "ALL", "", "XY", "0,0,5", "")
      expect(lines.slice(2, 4)).toEqual(["2 found", "1 was on a locked layer."])
      if (command === "SLICE") expect(volumes(cad)).toEqual([1000, 500, 500])
      else expect(regions(cad)).toHaveLength(1)
    }
  })

  it("passes over a block reference, a region and a line (solid-edits/p157, p160, p161)", () => {
    const cad = box()
    answer(cad, "-BLOCK", "B1", "0,0,0", "L", "", "-INSERT", "B1", "0,0,0")
    answer(cad, "1", "1", "0")
    expect(written(cad, "SLICE", "L", "")).toEqual([
      "SLICE",
      "Select objects to slice: L",
      "1 found",
      "Select objects to slice:",
    ])
    expect(written(cad, "SECTION", "L", "")).toEqual([
      "SECTION",
      "Select objects: L",
      "1 found",
      "Select objects:",
      "No Solids, Surfaces or Meshes selected.",
    ])
    const other = createHarness()
    answer(other, "CIRCLE", "0,0", "5", "REGION", "L", "")
    answer(other, "LINE", "20,0", "30,0", "")
    expect(written(other, "SLICE", "ALL", "")).toEqual([
      "SLICE",
      "Select objects to slice: ALL",
      "2 found",
      "Select objects to slice:",
    ])
    expect(other.activeToolId()).toBe("select")
  })

  it("cuts ALL's newest first, a set picked as picked (solid-edits/p151, p175, p176)", () => {
    const slice = twoBoxes()
    answer(slice, "SLICE", "ALL", "", "XY", "0,0,5", "")
    expect(solids(slice).map((s) => near(centroid(s).x))).toEqual([
      5, 25, 25, 5,
    ])
    expect(solids(slice).map((s) => near(centroid(s).z))).toEqual([
      7.5, 7.5, 2.5, 2.5,
    ])
    const all = twoBoxes()
    answer(all, "SECTION", "ALL", "", "XY", "0,0,5")
    expect(regions(all).map((r) => near(regionCentroid(r).x))).toEqual([25, 5])
    const picked = answer(twoBoxes(), "ZOOM", "E", "SECTION")
    picked.click({ x: 0, y: 5 }).click({ x: 20, y: 5 })
    answer(picked, "", "XY", "0,0,5")
    expect(regions(picked).map((r) => near(regionCentroid(r).x))).toEqual([
      5, 25,
    ])
  })

  // p104 runs them as `_.SLICE`: the `.` prefix is the command line's Missing.
  it("runs again by Enter (solid-edits/p104)", () => {
    const cad = box()
    answer(cad, "_SLICE", "_L", "", "_XY", "0,0,5", "")
    answer(cad, "", "_L", "", "_XY", "0,0,2", "")
    expect(volumes(cad)).toEqual([500, 300, 200])
    answer(cad, "_SECTION", "_L", "", "_XY", "0,0,1")
    expect(written(cad, "", "_ALL", "", "_XY", "0,0,3")).toContain(
      "Sectioning plane does not intersect 2 selected solids."
    )
    expect(cad.entities()).toHaveLength(5)
  })

  it("is refused inside another command (solid-edits/p105)", () => {
    const cad = box()
    expect(
      written(cad, "_LINE", "20,0", "'_SLICE", "30,0", "'_SECTION").slice(2)
    ).toEqual([
      "Specify next point or [Undo]: 'SLICE",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
      "Specify next point or [Undo]: 30,0",
      "Specify next point or [Undo]: 'SECTION",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })
})

describe("planar Object and Surface", () => {
  const OBJECT_PROMPT =
    "Select a circle, ellipse, arc, 2D-spline, 2D-polyline to define the slicing plane:"

  it("asks again on nothing, silently (solid-edits/p163)", () => {
    const cad = boxAndCircle()
    answer(cad, "SLICE", "ALL", "")
    expect(written(cad, "O", "3,7")).toEqual([
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: O",
      `${OBJECT_PROMPT} 3,7`,
    ])
    answer(cad, "6,5,4", "0,0,0")
    expect(volumes(cad)).toEqual([400])
  })

  it("refuses a line and the solid itself, which give no plane (solid-edits/p164, p178)", () => {
    const cad = boxAndCircle()
    answer(cad, "LINE", "0,0,4", "10,10,4", "")
    answer(cad, "SLICE", "ALL", "", "O")
    const from = cad.commandLog().length
    cad.click({ x: 2, y: 2, z: 4 })
    expect(written(cad, "0,0,0")).toEqual([
      `${OBJECT_PROMPT} 0,0,0`,
      "Unable to extract the plane of the selected object.",
    ])
    expect(cad.commandLog().slice(from, from + 2)).toEqual([
      OBJECT_PROMPT,
      "Unable to extract the plane of the selected object.",
    ])
    answer(cad, "6,5,4", "0,0,0")
    expect(volumes(cad)).toEqual([400])
  })

  it("refuses a circle on a locked layer, said (solid-edits/p178)", () => {
    const cad = box()
    answer(cad, "CIRCLE", "5,5,4", "1")
    lockedLayer(cad, cad.latest())
    answer(cad, "ZOOM", "E", "SLICE")
    cad.click({ x: 0, y: 5 })
    answer(cad, "", "O")
    expect(written(cad, "6,5,4")).toEqual([
      `${OBJECT_PROMPT} 6,5,4`,
      "The object is on a locked layer.",
    ])
    const from = cad.commandLog().length
    cad.click({ x: 6, y: 5, z: 4 })
    expect(cad.commandLog().slice(from)).toEqual([
      OBJECT_PROMPT,
      "The object is on a locked layer.",
    ])
    expect(cad.activeToolId()).toBe("slice")
  })

  it("takes no selection mode; Enter ends (solid-edits/p171)", () => {
    const cad = boxAndCircle()
    answer(cad, "SLICE", "ALL", "", "O")
    expect(written(cad, "_L", "FOO", "")).toEqual([
      `${OBJECT_PROMPT} _L`,
      "*Invalid selection*",
      "Expects a point or Group",
      `${OBJECT_PROMPT} FOO`,
      "*Invalid selection*",
      "Expects a point or Group",
      OBJECT_PROMPT,
    ])
    expect(cad.activeToolId()).toBe("select")
    expect(volumes(cad)).toEqual([1000])
  })

  it("finds no surface where it picks or what it is typed; Enter ends (solid-edits/p174)", () => {
    const cad = boxAndCircle()
    answer(cad, "SLICE", "ALL", "", "S")
    cad.click({ x: 6, y: 5, z: 4 })
    expect(written(cad, "FOO", "3,7", "")).toEqual([
      "Select a surface: FOO",
      "*Invalid selection*",
      "Expects a point or Group",
      "Select a surface: 3,7",
      "No surfaces selected.",
      "Select a surface:",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("words its refusals as Spanish's and Portuguese's AutoCAD (solid-edits/p164, p171, p174)", () => {
    const spanish = boxAndCircle(es)
    answer(spanish, "_LINE", "0,0,4", "10,10,4", "")
    answer(spanish, "CORTE", "_ALL", "", "O")
    expect(written(spanish, "0,0,0", "_L").slice(1)).toEqual([
      "Imposible extraer el plano del objeto designado.",
      "Seleccione un círculo, elipse, arco, spline 2D o polilínea 2D para definir el plano de corte: _L",
      "*Designación no válida*",
      "Requiere un punto o Grupo",
    ])
    const portuguese = boxAndCircle(ptBR)
    answer(portuguese, "FATIAR", "TUDO", "", "S")
    expect(written(portuguese, "FOO", "3,7")).toEqual([
      "Selecionar uma superfície: FOO",
      "*Seleção inválida*",
      "Espera um ponto ou Grupo",
      "Selecionar uma superfície: 3,7",
      "Nenhuma superfície selecionada.",
    ])
  })

  it("takes a tilted circle's plane, SECTION's region in it (solid-edits/p166, p167)", () => {
    const slice = box()
    answer(slice, "_UCS", "_X", "90", "CIRCLE", "5,5,-5", "1", "_UCS", "_W")
    answer(slice, "ZOOM", "E", "SLICE")
    slice.click({ x: 0, y: 5 })
    answer(slice, "", "O")
    slice.click({ x: 4.5, y: 5, z: 5 })
    answer(slice, "0,0,0")
    expect(volumes(slice)).toEqual([500])
    expectPoint(centroid(solids(slice)[0]), { x: 5, y: 2.5, z: 5 })
    const section = box()
    answer(section, "_UCS", "_X", "90", "CIRCLE", "5,5,-5", "1", "_UCS", "_W")
    answer(section, "ZOOM", "E", "SECTION")
    section.click({ x: 0, y: 5 })
    answer(section, "", "O")
    section.click({ x: 4.5, y: 5, z: 5 })
    const [region] = regions(section)
    expect(regionArea(region)).toBeCloseTo(100, 9)
    expectPoint(region.normal!, { x: 0, y: -1, z: 0 })
    expectPoint(regionCentroid(region), { x: 5, y: 5, z: 5 })
  })
})

describe("refusals and Enter (solid-edits/p106–p113)", () => {
  it("at the second point, Zaxis's and View's (p106–p108)", () => {
    const second = box()
    expect(
      written(
        second,
        "SLICE",
        "L",
        "",
        "5,0",
        "FOO",
        "",
        "5,10",
        "0,0,0"
      ).slice(4)
    ).toEqual([
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: 5,0",
      "Specify second point on plane: FOO",
      "Invalid point.",
      "Specify second point on plane:",
      "Invalid point.",
      "Specify second point on plane: 5,10",
      "Specify a point on desired side or [keep Both sides] <Both>: 0,0,0",
    ])
    const z = box()
    expect(
      written(
        z,
        "SLICE",
        "L",
        "",
        "Z",
        "FOO",
        "",
        "0,0,4",
        "FOO",
        "",
        "0,0,5"
      ).slice(5)
    ).toEqual([
      "Specify a point on the section plane: FOO",
      "Invalid point.",
      "Specify a point on the section plane:",
      "Invalid point.",
      "Specify a point on the section plane: 0,0,4",
      "Specify a point on the Z-axis (normal) of the plane: FOO",
      "Invalid point.",
      "Specify a point on the Z-axis (normal) of the plane:",
      "Invalid point.",
      "Specify a point on the Z-axis (normal) of the plane: 0,0,5",
    ])
    const view = createHarness()
    answer(view, "BOX", "-5,-5,-5", "5,5", "10")
    expect(
      written(view, "SLICE", "L", "", "V", "FOO", "", "0,0,1").slice(5)
    ).toEqual([
      "Specify a point on the current view plane <0,0,0>: FOO",
      "Invalid point.",
      "Specify a point on the current view plane <0,0,0>:",
      "Specify a point on desired side or [keep Both sides] <Both>: 0,0,1",
    ])
    expect(volumes(view)).toEqual([500])
  })

  it("at 3points' three, in SLICE and SECTION (p110, p112)", () => {
    for (const command of ["SLICE", "SECTION"]) {
      const cad = box()
      const lines = written(cad, command, "L", "", "", "FOO", "", "0,0,2")
      expect(lines.slice(5)).toEqual([
        "Specify first point on plane: FOO",
        "Invalid point.",
        "Specify first point on plane:",
        "Invalid point.",
        "Specify first point on plane: 0,0,2",
      ])
      expect(
        written(cad, "FOO", "", "0,0,2", "10,0,8", "FOO", "", "5,0,5", "0,10,2")
      ).toEqual([
        "Specify second point on plane: FOO",
        "Invalid point.",
        "Specify second point on plane:",
        "Invalid point.",
        "Specify second point on plane: 0,0,2",
        "1st and 2nd points cannot be identical.",
        "Specify second point on plane: 10,0,8",
        "Specify third point on plane: FOO",
        "Invalid point.",
        "Specify third point on plane:",
        "Invalid point.",
        "Specify third point on plane: 5,0,5",
        "Need a point distinct from and not collinear with 1st and 2nd points.",
        "Specify third point on plane: 0,10,2",
      ])
    }
  })

  it("another prompt's keyword (p111, p113)", () => {
    const cad = box()
    expect(
      written(
        cad,
        "SLICE",
        "L",
        "",
        "_B",
        "5,0",
        "_B",
        "5,10",
        "_XY",
        "0,0,0"
      ).slice(4)
    ).toEqual([
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: _B",
      "Point or option keyword required.",
      "Specify start point of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>: 5,0",
      "Specify second point on plane: _B",
      "Invalid point.",
      "Specify second point on plane: 5,10",
      "Specify a point on desired side or [keep Both sides] <Both>: _XY",
      "Point or option keyword required.",
      "Specify a point on desired side or [keep Both sides] <Both>: 0,0,0",
    ])
    expect(written(box(), "SECTION", "L", "", "_S").slice(4)).toEqual([
      "Specify first point on Section plane by [Object/Zaxis/View/XY/YZ/ZX/3points] <3points>: _S",
      "Point or option keyword required.",
    ])
  })
})

describe("transparency and undo", () => {
  it("zooms at its prompts, and takes Ortho turned on (solid-edits/p168, p169)", () => {
    const cad = box()
    answer(cad, "SLICE", "L", "", "'ZOOM", "E", "5,0", "'ZOOM", "E", "5,10")
    answer(cad, "'ZOOM", "E", "0,0,0")
    expect(volumes(cad)).toEqual([500])
    const view = box()
    answer(view, "SLICE", "L", "", "V", "'ZOOM", "E", "0,0,5", "B")
    expect(volumes(view)).toEqual([500, 500])
    answer(view, "SLICE", "L", "", "5,0", "'ORTHOMODE", "1", "5,10", "B")
    expect(volumes(view)).toEqual([500, 250, 250])
  })

  it("is one step, as U, REDO and UNDO 2 name it (solid-edits/p170)", () => {
    const cad = box()
    answer(cad, "SLICE", "L", "", "XY", "0,0,5", "")
    expect(written(cad, "U")).toEqual(["U", "SLICE"])
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "SLICE",
      "Everything has been redone",
    ])
    answer(cad, "SECTION", "ALL", "", "XY", "0,0,2")
    expect(written(cad, "UNDO", "2").at(-1)).toBe("SECTION SLICE")
    expect(volumes(cad)).toEqual([1000])
    expect(cad.entities()).toHaveLength(1)
  })
})

describe("LASTPOINT (ELP-01, EDITS-D3)", () => {
  const READ = "<LASTPOINT>"

  /**
   * LASTPOINT at each READ, read mid-command as `'SETVAR LASTPOINT` and Enter
   * (EDITS-D1), and `ID @`'s once the run is over; the box's set from 7,7,7.
   */
  function readings(cad: CadHarness, ...texts: string[]): number[][] {
    // `+ 0`: a `-0.0000` read is 0.
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

  it("sets it at two points and the side (solid-edits/p100, p114, p115)", () => {
    expect(
      readings(
        box(),
        "SLICE",
        "L",
        "",
        READ,
        "5,0",
        READ,
        "5,10",
        READ,
        "0,0,0"
      )
    ).toEqual([
      [7, 7, 7],
      [5, 0, 0],
      [5, 10, 0],
      [0, 0, 0],
    ])
    expect(readings(box(), "SLICE", "L", "", "5,0", "5,10", "B")).toEqual([
      [5, 10, 0],
    ])
    expect(readings(box(), "SLICE", "L", "", "5,0", "5,20", "")).toEqual([
      [5, 20, 0],
    ])
  })

  it("sets it at Zaxis's two points (solid-edits/p116)", () => {
    expect(
      readings(
        box(),
        "SLICE",
        "L",
        "",
        "Z",
        READ,
        "0,0,4",
        READ,
        "0,0,5",
        READ,
        "B"
      )
    ).toEqual([
      [7, 7, 7],
      [0, 0, 4],
      [0, 0, 5],
      [0, 0, 5],
    ])
  })

  it("keeps it at Enter's <0,0,0>, sets it at a typed point (solid-edits/p117, p135)", () => {
    const centred = () =>
      answer(createHarness(), "BOX", "-5,-5,-5", "5,5", "10")
    expect(readings(centred(), "SLICE", "L", "", "V", "", READ, "B")).toEqual([
      [7, 7, 7],
      [7, 7, 7],
    ])
    expect(
      readings(centred(), "SLICE", "L", "", "XY", "0,0,2", READ, "B")
    ).toEqual([
      [0, 0, 2],
      [0, 0, 2],
    ])
    expect(readings(centred(), "SECTION", "L", "", "XY", "")).toEqual([
      [7, 7, 7],
    ])
    expect(readings(centred(), "SECTION", "L", "", "V", "0,0,1")).toEqual([
      [0, 0, 1],
    ])
  })

  it("puts it on the first point as the third is asked (solid-edits/p118, p120)", () => {
    expect(
      readings(
        box(),
        "SLICE",
        "L",
        "",
        "",
        READ,
        "0,0,2",
        READ,
        "10,0,8",
        READ,
        "0,10,2",
        READ,
        "0,0,0"
      )
    ).toEqual([
      [7, 7, 7],
      [0, 0, 2],
      [0, 0, 2],
      [0, 10, 2],
      [0, 0, 0],
    ])
    expect(
      readings(
        box(),
        "SECTION",
        "L",
        "",
        READ,
        "0,0,2",
        READ,
        "10,0,8",
        READ,
        "0,10,2"
      )
    ).toEqual([
      [7, 7, 7],
      [0, 0, 2],
      [0, 0, 2],
      [0, 10, 2],
    ])
  })

  it("sets it at planar Object's typed pick and the side (solid-edits/p119)", () => {
    expect(
      readings(boxAndCircle(), "SLICE", "ALL", "", "O", "6,5,4", READ, "0,0,0")
    ).toEqual([
      [6, 5, 4],
      [0, 0, 0],
    ])
  })

  it("sets it at a side point on the plane, refused and asked again (solid-edits/d05-b)", () => {
    const cad = box()
    answer(cad, "ID", "7,7,7", "SLICE", "_ALL", "", "0,0,0", "10,0,0")
    expect(written(cad, "0,0,10")).toEqual([
      "Specify a point on desired side or [keep Both sides] <Both>: 0,0,10",
      "The point should not be on the slicing plane.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "SLICE Specify a point on desired side or [keep Both sides] <Both>:"
    )
    const said = written(cad, "'SETVAR", "LASTPOINT", "").join(" ")
    expect(said).toContain("LASTPOINT <0.00,0.00,10.00>")
  })

  it("sets it at a click that takes planar Object's plane, the cursor's point on the work plane (solid-edits/d06)", () => {
    // The line of sight through 8,5,5 meets Z 0 at 8,5,5 + 3.125 × (1.3,
    // 2.2, −1.6); AutoCAD read 12.0971,11.9228,0 at its pixel.
    for (const command of ["SLICE", "SECTION"]) {
      const cad = viewed()
      answer(cad, "CIRCLE", "5,5,5", "3", "ID", "7,7,7")
      answer(cad, command, "_ALL", "", "_O")
      cad.click({ x: 8, y: 5, z: 5 })
      cad.escape()
      answer(cad, "LUPREC", "4")
      expect(written(cad, "ID", "@")).toContain(
        " X = 12.0625     Y = 11.8750     Z = 0.0000"
      )
    }
  })
})

describe("SECTION's region of a face (SEC-01)", () => {
  it("faces out of the solid, as the face (solid-edits/p177)", () => {
    const cad = box()
    answer(cad, "SLICE", "L", "", "XY", "0,0,3", "")
    answer(cad, "SECTION", "ALL", "", "V", "0,0,3")
    // ALL's newest first: the lower half's top, then the upper half's bottom.
    const [top, bottom] = regions(cad)
    expectPoint(top.normal ?? Z, Z)
    expectPoint(bottom.normal!, { x: 0, y: 0, z: -1 })
    for (const region of [top, bottom]) {
      expect(regionArea(region)).toBeCloseTo(100, 9)
      expectPoint(regionCentroid(region), { x: 5, y: 5, z: 3 })
    }
  })
})

describe("on the desktop (SED-05, SED-11)", () => {
  const bands = (cad: CadHarness) =>
    cad
      .scene()
      .primitives.flatMap((p) =>
        p.kind === "segment" && p.stroke.color === THEME.dashedRubberBand
          ? [p]
          : []
      )
  /** The one dashed band drawn, from `base`. */
  const bandFrom = (cad: CadHarness, base: Vec3) => {
    const drawn = bands(cad)
    expect(drawn).toHaveLength(1)
    expect(drawn[0].a).toBeCloseToPoint(cad.toScreen(base), 6)
    expect(drawn[0].stroke).toMatchObject({ width: 1, dash: [2, 3] })
  }
  const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 }

  it("draws a dashed band from the start point at the second, none at the side (solid-edits/d05-b)", () => {
    for (const command of ["SLICE", "SECTION"]) {
      const cad = viewed()
      answer(cad, command, "_ALL", "")
      cad.moveTo({ x: 8, y: 5, z: 0 })
      expect(bands(cad)).toEqual([])
      answer(cad, "0,0,0")
      cad.moveTo({ x: 8, y: 5, z: 0 })
      bandFrom(cad, ORIGIN)
    }
    const cad = viewed()
    answer(cad, "SLICE", "_ALL", "", "0,0,0", "10,0,0")
    cad.moveTo({ x: 3, y: 3, z: 0 })
    expect(bands(cad)).toEqual([])
  })

  it("draws it from 3points' first at the second and the third, from Zaxis' plane point (solid-edits/d05-c)", () => {
    const cad = viewed()
    answer(cad, "SLICE", "_ALL", "", "", "0,0,0")
    cad.moveTo({ x: 8, y: 5, z: 0 })
    bandFrom(cad, ORIGIN)
    answer(cad, "10,0,0")
    cad.moveTo({ x: 3, y: 3, z: 0 })
    bandFrom(cad, ORIGIN)
    const z = viewed()
    answer(z, "SLICE", "_ALL", "", "_Z")
    z.moveTo({ x: 3, y: 3, z: 0 })
    expect(bands(z)).toEqual([])
    answer(z, "0,0,5")
    z.moveTo({ x: 3, y: 3, z: 0 })
    bandFrom(z, { x: 0, y: 0, z: 5 })
  })

  it("lights the object under the cursor at Surface's pick, as at planar Object's (solid-edits/d05-d)", () => {
    const hover = (cad: CadHarness) =>
      cad
        .scene()
        .primitives.filter(
          (p) => "stroke" in p && p.stroke?.color === THEME.entityHover
        ).length
    for (const option of ["_O", "_S"]) {
      const cad = viewed()
      answer(cad, "CIRCLE", "5,5,5", "3", "SLICE", "_ALL", "", option)
      cad.moveTo({ x: 30, y: 30, z: 0 })
      expect(hover(cad)).toBe(0)
      cad.moveTo({ x: 8, y: 5, z: 5 })
      expect(hover(cad)).toBeGreaterThan(0)
      cad.moveTo({ x: 5, y: 0, z: 10 })
      expect(hover(cad)).toBe(12)
    }
  })
})
