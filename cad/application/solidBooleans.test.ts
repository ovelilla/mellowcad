import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepIsClosed, brepVolume } from "../geometry/solids"
import type { Entity, Solid3dEntity } from "../domain/entities"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { snapshotOf } from "../../test/builders"
import { shellCount } from "../../test/breps"
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

const kinds = (cad: CadHarness) =>
  cad
    .entities()
    .map((e: Entity) => e.type)
    .sort()

function console(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  answer(cad, "LUPREC", "4")
  return cad
}

/** Two boxes overlapping at a corner (union/k01). */
function boxes(cad: CadHarness): CadHarness {
  return answer(
    cad,
    "BOX",
    "0,0,0",
    "10,10",
    "10",
    "BOX",
    "5,5,5",
    "15,15",
    "15"
  )
}

describe("UNION of solids", () => {
  it("makes the set one solid, ALL's newest, and lists it with no history (union/k01, s07)", () => {
    const cad = boxes(console())
    const [, newest] = solids(cad)
    expect(written(cad, "UNION", "ALL", "")).toEqual([
      "UNION",
      "Select objects: ALL",
      "2 found",
      "Select objects:",
    ])
    const [one] = solids(cad)
    expect(solids(cad)).toHaveLength(1)
    expect(one.id).toBe(newest.id)
    expect(one.primitive).toBeUndefined()
    expect(brepIsClosed(one.brep)).toBe(true)
    expect(brepVolume(one.brep)).toBeCloseTo(2375, 9)
    const list = written(cad, "LIST", "L", "")
      .flatMap((line) => line.split("\n"))
      .slice(-4)
    expect(list).toEqual([
      "         History = None",
      "    Show History = No",
      "   Bounding Box: Lower Bound X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                 Upper Bound X = 15.0000  , Y = 15.0000  , Z = 20.0000",
    ])
  })

  it("takes U back in one step (union/s06)", () => {
    const cad = boxes(console())
    answer(cad, "UNION", "ALL", "")
    expect(solids(cad)).toHaveLength(1)
    answer(cad, "U")
    expect(solids(cad)).toHaveLength(2)
    expect(solids(cad).every((s) => s.primitive?.kind === "box")).toBe(true)
  })

  it("combines solids into one and regions plane by plane, apart (union/s01, s09, s10)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "SPHERE", "10,10,10", "5")
    answer(cad, "CIRCLE", "40,0", "5", "CIRCLE", "45,0", "5")
    answer(cad, "REGION", "C", "34,-6", "51,6", "")
    answer(cad, "UNION", "ALL", "")
    expect(kinds(cad)).toEqual(["region", "solid3d"])
    expect(brepVolume(solids(cad)[0].brep)).toBeCloseTo(1458.1489286485116, 9)
    // One solid with two coplanar regions: the regions alone (s10).
    const lone = console()
    answer(lone, "BOX", "0,0,0", "10,10", "10")
    answer(lone, "CIRCLE", "40,0", "5", "CIRCLE", "45,0", "5")
    answer(lone, "REGION", "C", "34,-6", "51,6", "")
    answer(lone, "UNION", "ALL", "")
    expect(kinds(lone)).toEqual(["region", "solid3d"])
    expect(solids(lone)[0].primitive?.kind).toBe("box")
  })

  it("asks for two (union/s05)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10")
    const two =
      "At least 2 solids, surfaces, or coplanar regions must be selected."
    expect(written(cad, "UNION", "L", "").at(-1)).toBe(two)
    answer(cad, "CIRCLE", "30,0", "5", "REGION", "L", "")
    expect(written(cad, "UNION", "ALL", "").at(-1)).toBe(two)
    expect(written(cad, "INTERSECT", "ALL", "").at(-1)).toBe(two)
  })

  it("unites solids touching at a point or along a line, and apart, into one (union/s04, regions/p348)", () => {
    const cad = console()
    answer(cad, "SPHERE", "30,0,0", "5", "SPHERE", "40,0,0", "5")
    answer(cad, "BOX", "50,0,0", "60,10", "10", "BOX", "55,5,10", "65,15", "20")
    answer(
      cad,
      "BOX",
      "0,0,0",
      "10,10",
      "10",
      "CYLINDER",
      "0,5,13",
      "3",
      "_A",
      "10,5,13"
    )
    expect(written(cad, "UNION", "ALL", "").at(-1)).toBe("Select objects:")
    expect(solids(cad)).toHaveLength(1)
    // s04's spheres and boxes (5636.2462 with s04's own cylinder, 2 · 523.5988 + 3000 without),
    // and in place of s04's box and cylinder p348's: a cylinder lying on a box, 1000 + 90π.
    expect(brepVolume(solids(cad)[0].brep)).toBeCloseTo(
      (8 / 3) * Math.PI * 125 + 3000 + 1000 + Math.PI * 90,
      6
    )
  })

  it("unites a cylinder lying along a box's top into one solid of 1282.7433 (regions/p348)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10")
    answer(cad, "CYLINDER", "0,5,13", "3", "_A", "10,5,13", "UNION", "ALL", "")
    const [one] = solids(cad)
    expect(solids(cad)).toHaveLength(1)
    // WHY not AutoCAD's V10 E17 F10, one shell: ACIS keeps the line the
    // cylinder touches the top along as an edge, the top two faces of 50
    // (p348's MPDUMP); here that line is no edge and the top one face,
    // V10 E16 F9, the cylinder sharing only the line's end vertices with it
    // (modify.md, UNION's Missing).
    expect(brepVolume(one.brep).toFixed(4)).toBe("1282.7433")
  })

  it("saves and reads a composite back", () => {
    const cad = boxes(console())
    answer(cad, "UNION", "ALL", "")
    const document = cad.runtime.document
    const read = parseDrawingFile(
      serializeDrawing(
        snapshotOf(document.getEntities(), { settings: document.getSettings() })
      )
    )
    const back = read.entities.find(
      (e) => e.type === "solid3d"
    ) as Solid3dEntity
    expect(brepVolume(back.brep)).toBeCloseTo(2375, 9)
  })

  it("saves and reads back a composite of curved faces, of NURBS edges and of two shells (union/k03, k05, k07; regions/p343, p345, p328)", () => {
    const cad = console()
    answer(cad, "CYLINDER", "0,0,-10", "5", "20")
    answer(cad, "CYLINDER", "-10,0,0", "3", "_A", "10,0,0", "UNION", "ALL", "")
    answer(cad, "SPHERE", "100,0,0", "10", "BOX", "80,-20,0", "120,20", "20")
    answer(cad, "SUBTRACT", "C", "89,-1", "91,1", "", "L", "")
    answer(cad, "BOX", "200,0,0", "210,10", "10", "BOX", "220,0,0", "230,10")
    answer(cad, "10", "UNION", "C", "199,-1", "231,11", "")
    const measure = (s: Solid3dEntity) => ({
      v: s.brep.vertices.length,
      e: s.brep.edges.length,
      f: s.brep.faces.length,
      shells: shellCount(s.brep),
      volume: brepVolume(s.brep).toFixed(9),
    })
    expect(solids(cad).map(measure)).toEqual([
      { v: 6, e: 6, f: 7, shells: 1, volume: "1866.912676913" },
      { v: 1, e: 1, f: 2, shells: 1, volume: "2094.395102393" },
      { v: 16, e: 24, f: 12, shells: 2, volume: "2000.000000000" },
    ])
    const document = cad.runtime.document
    const file = serializeDrawing(
      snapshotOf(document.getEntities(), { settings: document.getSettings() })
    )
    const read = parseDrawingFile(file)
    const back = read.entities.filter(
      (e): e is Solid3dEntity => e.type === "solid3d"
    )
    expect(back.map(measure)).toEqual(solids(cad).map(measure))
    expect(
      back.some((s) => s.brep.edges.some((e) => e.curve.kind === "spline"))
    ).toBe(true)
    // -0 is written 0: the file read back writes the same file.
    expect(
      serializeDrawing(snapshotOf(read.entities, { settings: read.settings }))
    ).toBe(file)
  })
})

describe("UNION and SUBTRACT of solids against AutoCAD 2027 (the Regions review)", () => {
  const NONE = "No solids, surfaces, or regions selected."
  const TWO =
    "At least two solids, surfaces, or coplanar regions must be selected."

  /** A red box on layer B, then a green one on layer A (union/s07, regions/p322). */
  function coloured(): { cad: CadHarness; a: string; b: string } {
    const cad = console()
    const [a, b] = ["A", "B"].map((name) => cad.runtime.createLayer(name))
    cad.runtime.setCurrentLayer(b)
    answer(cad, "COLOR", "1", "BOX", "0,0,0", "10,10", "10")
    cad.runtime.setCurrentLayer(a)
    answer(cad, "COLOR", "3", "BOX", "5,5,5", "15,15", "15")
    return { cad, a, b }
  }

  it("ALL keeps the newest: its id, layer A and green (union/s07)", () => {
    const { cad, a } = coloured()
    const [, newest] = solids(cad)
    answer(cad, "UNION", "ALL", "")
    expect(solids(cad).map((s) => [s.id, s.layerId, s.color])).toEqual([
      [newest.id, a, newest.color],
    ])
  })

  it("picks keep their order: the first picked kept (regions/p322; region/b10 picks the oldest first)", () => {
    const { cad, a } = coloured()
    answer(cad, "ZOOM", "W", "-10,-10", "40,30")
    const [, newest] = solids(cad)
    answer(cad, "UNION", "L", "2,0", "")
    expect(solids(cad).map((s) => [s.id, s.layerId])).toEqual([[newest.id, a]])
    const again = coloured()
    answer(again.cad, "ZOOM", "W", "-10,-10", "40,30")
    const [first] = solids(again.cad)
    answer(again.cad, "UNION", "2,0", "L", "")
    expect(solids(again.cad).map((s) => [s.id, s.layerId])).toEqual([
      [first.id, again.b],
    ])
  })

  it("SUBTRACT says none was selected of a solid in both sets, both kept (regions/p325)", () => {
    const cad = boxes(console())
    answer(cad, "ZOOM", "W", "-10,-10", "40,30")
    expect(written(cad, "SUBTRACT", "2,0", "", "2,0", "").at(-1)).toBe(NONE)
    expect(solids(cad)).toHaveLength(2)
  })

  it("SUBTRACT of a solid by a region, or a region by a solid: two are needed (regions/p341, p342)", () => {
    for (const [from, to] of [
      ["25,0", "0,5"],
      ["0,5", "25,0"],
    ]) {
      const cad = console()
      answer(cad, "ZOOM", "W", "-10,-10", "40,20", "BOX", "0,0,0", "10,10")
      answer(cad, "10", "CIRCLE", "30,0", "5", "REGION", "L", "")
      expect(written(cad, "SUBTRACT", from, "", to, "").at(-1)).toBe(TWO)
      expect(kinds(cad)).toEqual(["region", "solid3d"])
      expect(solids(cad)[0].primitive?.kind).toBe("box")
    }
  })

  it("SUBTRACT takes from the solids, a region of the first set left (regions/p340)", () => {
    const cad = console()
    answer(cad, "ZOOM", "W", "-10,-10", "40,20", "BOX", "0,0,0", "10,10", "10")
    answer(cad, "CIRCLE", "30,0", "5", "REGION", "L", "")
    answer(cad, "SPHERE", "10,10,10", "3")
    answer(cad, "SUBTRACT", "0,5", "25,0", "", "L", "")
    expect(kinds(cad)).toEqual(["region", "solid3d"])
    expect(brepVolume(solids(cad)[0].brep)).toBeCloseTo(985.8628, 4)
  })

  it("UNION of three, two apart: one solid of two shells (regions/p323)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "BOX", "5,5,5", "15,15", "15")
    answer(cad, "BOX", "30,0,0", "40,10", "10")
    const newest = solids(cad).at(-1)!
    answer(cad, "UNION", "ALL", "")
    const [one] = solids(cad)
    expect(solids(cad)).toHaveLength(1)
    expect(one.id).toBe(newest.id)
    expect(brepVolume(one.brep)).toBeCloseTo(3375, 9)
  })
})

describe("INTERSECT and SUBTRACT of solids", () => {
  it("erases solids apart, their intersection null (union/s02)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "BOX", "20,0,0", "30,10", "10")
    expect(written(cad, "INTERSECT", "ALL", "").at(-1)).toBe(
      "Null solid created - deleted"
    )
    expect(cad.entities()).toHaveLength(0)
  })

  it("joins the first set and takes the second out of it, a region left alone (union/s03)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "BOX", "20,0,0", "30,10", "10")
    answer(
      cad,
      "SPHERE",
      "5,5,10",
      "3",
      "CIRCLE",
      "5,5,10",
      "2",
      "REGION",
      "L",
      ""
    )
    answer(cad, "ZOOM", "W", "-2,-2", "32,12")
    expect(
      written(cad, "SUBTRACT", "5,0", "25,0", "", "8,5", "7,5", "").filter(
        (line) => !line.startsWith("Select objects")
      )
    ).toEqual([
      "SUBTRACT",
      "Select solids, surfaces, and regions to subtract from ..",
      "1 found",
      "1 found, 2 total",
      "Select solids, surfaces, and regions to subtract ..",
      "1 found",
      "1 found, 2 total",
    ])
    expect(kinds(cad)).toEqual(["region", "solid3d"])
    expect(brepVolume(solids(cad)[0].brep)).toBeCloseTo(1943.4513322353837, 9)
  })

  it("erases what it takes all of (union/s08)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "BOX", "-5,-5,-5", "20,20", "20")
    answer(cad, "SUBTRACT", "5,0", "", "5,-5", "")
    expect(cad.commandLog().at(-1)).toBe("Null solid created - deleted")
    expect(cad.entities()).toHaveLength(0)
  })

  it("says so in Spanish and Brazilian Portuguese", () => {
    for (const [locale, words] of [
      [es, "Sólido nulo creado - eliminado"],
      [ptBR, "Foi criado um sólido nulo - excluído"],
    ] as const) {
      const cad = console(locale)
      answer(
        cad,
        "_BOX",
        "0,0,0",
        "10,10",
        "10",
        "_BOX",
        "20,0,0",
        "30,10",
        "10"
      )
      answer(cad, "_INTERSECT", "_ALL", "")
      expect(cad.commandLog().at(-1)).toBe(words)
    }
  })

  it("leaves the solids when it cannot combine them", () => {
    const cad = console()
    answer(cad, "SPHERE", "0,0,0", "5", "CYLINDER", "3,0,-10", "3", "20")
    expect(written(cad, "UNION", "ALL", "").at(-1)).toBe(
      "1 boolean operation(s) failed."
    )
    expect(solids(cad)).toHaveLength(2)
  })
})
