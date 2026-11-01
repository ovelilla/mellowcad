import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepIsClosed, brepVolume } from "../geometry/solids"
import { brepMoments, solidInertia } from "../geometry/massProperties"
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

const regions = (cad: CadHarness) =>
  cad.entities().filter((e): e is RegionEntity => e.type === "region")

const volumes = (cad: CadHarness) =>
  solids(cad).map((s) => Math.round(brepVolume(s.brep) * 1e6) / 1e6)

const centroid = (s: Solid3dEntity) =>
  solidInertia(brepMoments(s.brep)).centroid

/** A 10 box at the origin, as the probes draw one. */
function box(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  return answer(cad, "_BOX", "0,0,0", "10,10", "10")
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

  it("takes a circle's plane (planar Object), and finds no surface (s06, t1)", () => {
    const cad = box()
    answer(cad, "CIRCLE", "5,5,4", "1")
    const circle = cad.latest()
    answer(cad, "SLICE", "ALL", "", "O")
    cad.click({ x: 6, y: 5, z: 4 })
    answer(cad, "0,0,0")
    expect(volumes(cad)).toEqual([400])
    void circle
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

  it("keeps each solid's properties, passes over the rest, counts what it misses (s09, s12)", () => {
    const cad = box()
    answer(cad, "CHPROP", "L", "", "C", "3", "")
    answer(cad, "BOX", "20,0,0", "30,10", "4", "LINE", "40,0", "50,0", "")
    answer(cad, "SLICE", "ALL", "", "XY", "0,0,5", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Slicing plane does not intersect 1 selected solid."
    )
    expect(volumes(cad)).toEqual([500, 400, 500])
    expect(solids(cad).filter((s) => s.color !== undefined)).toHaveLength(2)
    expect(cad.entities().filter((e) => e.type === "line")).toHaveLength(1)
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
