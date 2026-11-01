import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepIsClosed, brepVolume } from "../geometry/solids"
import type { Entity, Solid3dEntity } from "../domain/entities"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { snapshotOf } from "../../test/builders"
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
  it("makes the set one solid, the first's, and lists it with no history (union/k01, s07)", () => {
    const cad = boxes(console())
    const [first] = solids(cad)
    expect(written(cad, "UNION", "ALL", "")).toEqual([
      "UNION",
      "Select objects: ALL",
      "2 found",
      "Select objects:",
    ])
    const [one] = solids(cad)
    expect(solids(cad)).toHaveLength(1)
    expect(one.id).toBe(first.id)
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

  it("unites solids touching at a point or along a line, and apart, into one (union/s04)", () => {
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
    // s04's spheres and boxes (5636.2462 with its cylinder, 2 · 523.5988 + 3000 without), and
    // a box with a cylinder lying on it.
    expect(brepVolume(solids(cad)[0].brep)).toBeCloseTo(
      (8 / 3) * Math.PI * 125 + 3000 + 1000 + Math.PI * 90,
      6
    )
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
