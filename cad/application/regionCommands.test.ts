import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { circleOf, lineOf, p, polylineOf, rectOf } from "../../test/builders"
import type { Entity, RegionEntity } from "../domain/entities"
import { regionArea, regionPerimeter } from "../domain/regions"
import { es } from "../locales/es"
import { THEME } from "../scene/theme"
import { ptBR } from "../locales/pt-BR"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `texts` add to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

function regions(cad: CadHarness): RegionEntity[] {
  return cad.entities().filter((e): e is RegionEntity => e.type === "region")
}

const areas = (cad: CadHarness) =>
  regions(cad)
    .map((r) => Number(regionArea(r).toFixed(4)))
    .sort((a, b) => a - b)

/** The square of four lines and the circle of region/p01. */
const P01: Entity[] = [
  lineOf(p(0, 0), p(10, 0)),
  lineOf(p(10, 0), p(10, 10)),
  lineOf(p(10, 10), p(0, 10)),
  lineOf(p(0, 10), p(0, 0)),
  circleOf(p(30, 5), 5),
]

const square = (x0: number, y0: number, x1: number, y1: number) =>
  rectOf(p(x0, y0), p(x1, y1))

/** REGION of everything given, its answers as the console's. */
function regionOf(entities: Entity[], locale?: typeof es): CadHarness {
  const cad = createHarness({ entities, ...(locale ? { locale } : {}) })
  answer(cad, "REGION", "ALL", "")
  return cad
}

describe("REGION", () => {
  it("makes a region of each loop and erases what went into one (region/p01)", () => {
    const cad = createHarness({ entities: P01 })
    expect(written(cad, "REGION", "ALL", "").slice(-2)).toEqual([
      "2 loops extracted.",
      "2 Regions created.",
    ])
    expect(cad.entities().map((e) => e.type)).toEqual(["region", "region"])
    expect(areas(cad)).toEqual([78.5398, 100])
    const circle = regions(cad).find((r) => r.faces[0].loops[0].length === 1)
    expect(regionPerimeter(circle!)).toBeCloseTo(31.4159, 4)
  })

  it("chains by ends, never by crossings, and leaves what no loop used (p04)", () => {
    const cad = regionOf([
      lineOf(p(0, 0), p(20, 0)),
      lineOf(p(20, 0), p(20, 10)),
      lineOf(p(20, 10), p(0, 10)),
      lineOf(p(0, 10), p(0, 0)),
      lineOf(p(10, 0), p(10, 10)),
      lineOf(p(20, 10), p(30, 20)),
    ])
    expect(areas(cad)).toEqual([200])
    expect(cad.typeCounts()).toEqual({ line: 2, region: 1 })
  })

  it("makes each face and the outline round them (p10, p13)", () => {
    const cad = regionOf([
      lineOf(p(0, 0), p(10, 0)),
      lineOf(p(10, 0), p(10, 10)),
      lineOf(p(10, 10), p(0, 10)),
      lineOf(p(0, 10), p(0, 0)),
      lineOf(p(10, 0), p(20, 0)),
      lineOf(p(20, 0), p(20, 10)),
      lineOf(p(20, 10), p(10, 10)),
    ])
    expect(cad.commandLog().slice(-2)).toEqual([
      "3 loops extracted.",
      "3 Regions created.",
    ])
    expect(areas(cad)).toEqual([100, 100, 200])
    expect(cad.typeCounts()).toEqual({ region: 3 })
  })

  it("rejects a loop crossing itself, and passes open objects by (p03)", () => {
    const cad = regionOf([
      lineOf(p(0, 0), p(10, 0)),
      polylineOf([p(20, 0), p(30, 0), p(30, 10)]),
      polylineOf([p(40, 0), p(50, 10), p(50, 0), p(40, 10)], { closed: true }),
    ])
    expect(cad.commandLog().slice(-4)).toEqual([
      "1 loop extracted.",
      "1 loop rejected.",
      "    Self intersections                     : 1 loop.",
      "0 Regions created.",
    ])
    expect(cad.typeCounts()).toEqual({ line: 1, polyline: 2 })
  })

  it("rejects a region and counts it first (p14)", () => {
    const cad = regionOf([circleOf(p(0, 0), 5), circleOf(p(20, 0), 5)])
    answer(cad, "CIRCLE", "80,0", "5")
    expect(written(cad, "REGION", "ALL", "").slice(-3)).toEqual([
      "2 closed, degenerate or unsupported objects rejected.",
      "1 loop extracted.",
      "1 Region created.",
    ])
  })

  it("uses no open object that leaves the plane, the closed ones still (p15)", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    answer(
      cad,
      "LINE",
      "20,0,0",
      "30,0,0",
      "30,10,3",
      "20,10,0",
      "C",
      "REGION",
      "ALL",
      ""
    )
    expect(cad.commandLog().slice(-2)).toEqual([
      "Open objects must be coplanar.",
      "1 Region created.",
    ])
    expect(cad.typeCounts()).toEqual({ line: 4, region: 1 })
  })

  it("makes a tilted region of a closed 3D polyline in one plane (p12)", () => {
    const cad = createHarness()
    answer(
      cad,
      "3DPOLY",
      "60,0,0",
      "70,0,0",
      "70,10,5",
      "C",
      "REGION",
      "ALL",
      ""
    )
    const [region] = regions(cad)
    expect(regionArea(region)).toBeCloseTo(55.901699, 6)
    expect(region.normal?.y).toBeCloseTo(-0.447214, 6)
    expect(region.normal?.z).toBeCloseTo(0.894427, 6)
  })

  it("rejects a closed 3D polyline in no plane (p16)", () => {
    const cad = createHarness()
    answer(cad, "3DPOLY", "0,0,0", "10,0,0", "10,10,5", "0,10,0", "C")
    expect(written(cad, "REGION", "ALL", "").slice(-3)).toEqual([
      "1 closed, degenerate or unsupported object rejected.",
      "0 loops extracted.",
      "0 Regions created.",
    ])
  })

  it("says None found. to an empty set (p05)", () => {
    const cad = createHarness()
    expect(written(cad, "REGION", "").at(-1)).toBe("None found.")
  })

  it("wears the current layer and properties, not the objects' (p07, p10)", () => {
    const cad = createHarness({
      entities: [{ ...circleOf(p(0, 0), 5), color: "#ff0000" }],
    })
    answer(cad, "CECOLOR", "3", "REGION", "ALL", "")
    const [region] = regions(cad)
    expect(region.color).toBe("#00ff00")
    expect(region.layerId).toBe(cad.runtime.document.getCurrentLayerId())
  })

  it("is one undo step", () => {
    const cad = regionOf(P01)
    answer(cad, "U")
    expect(cad.typeCounts()).toEqual({ line: 4, circle: 1 })
  })

  it("speaks Spanish AutoCAD's words (p01, p03 in es-ES)", () => {
    const cad = createHarness({ entities: P01, locale: es })
    expect(written(cad, "REGION", "TODO", "").slice(-2)).toEqual([
      "2 bucles extraído(s).",
      "2 regiones creada(s).",
    ])
  })

  it("and Brazilian Portuguese AutoCAD's, a 0 as its plural (p15 in pt-BR)", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(10, 0)], { closed: true })],
      locale: ptBR,
    })
    expect(written(cad, "REGIAO", "TUDO", "").slice(-4)).toEqual([
      "1 loop extraído(s).",
      "1 loop rejeitado(s).",
      "    Autointersecções                     : 1 loop.",
      "0 Regiões criada(s).",
    ])
  })
})

describe("UNION, SUBTRACT and INTERSECT of regions", () => {
  it("unites two squares into the first (region/b01), one undo step", () => {
    const cad = regionOf([square(0, 0, 10, 10), square(5, 5, 15, 15)])
    answer(cad, "UNION", "ALL", "")
    expect(areas(cad)).toEqual([175])
    expect(regionPerimeter(regions(cad)[0])).toBeCloseTo(60, 9)
    answer(cad, "U")
    expect(areas(cad)).toEqual([100, 100])
  })

  it("subtracts a circle inside a square as its hole (b02)", () => {
    const cad = regionOf([square(0, 0, 20, 20), circleOf(p(10, 10), 5)])
    expect(
      written(cad, "SUBTRACT", "20,10", "", "15,10", "").filter(
        (line) => !line.startsWith("Select objects")
      )
    ).toEqual([
      "SUBTRACT",
      "Select solids, surfaces, and regions to subtract from ..",
      "1 found",
      "Select solids, surfaces, and regions to subtract ..",
      "1 found",
    ])
    expect(areas(cad)).toEqual([321.4602])
    expect(regionPerimeter(regions(cad)[0])).toBeCloseTo(111.4159, 4)
    expect(regions(cad)[0].faces[0].loops).toHaveLength(2)
  })

  it("intersects two circles into a lens (b03)", () => {
    const cad = regionOf([circleOf(p(0, 0), 10), circleOf(p(10, 0), 10)])
    answer(cad, "INTERSECT", "ALL", "")
    expect(areas(cad)).toEqual([122.837])
  })

  it("leaves a null region nothing (b05, b06)", () => {
    const apart = regionOf([square(0, 0, 10, 10), square(20, 0, 30, 10)])
    expect(written(apart, "INTERSECT", "ALL", "").at(-1)).toBe(
      "Null region created - deleted"
    )
    expect(apart.entities()).toEqual([])
    const covered = regionOf([square(0, 0, 10, 10), square(-5, -5, 15, 15)])
    answer(covered, "SUBTRACT", "5,0", "", "-5,0", "")
    expect(covered.commandLog().at(-1)).toBe("Null region created - deleted")
    expect(covered.entities()).toEqual([])
  })

  it("erases what it subtracts even where it misses (b05)", () => {
    const cad = regionOf([square(0, 0, 10, 10), square(20, 0, 30, 10)])
    answer(cad, "SUBTRACT", "5,0", "", "25,0", "")
    expect(areas(cad)).toEqual([100])
  })

  it("keeps the pieces a cut leaves as faces of one region; EXPLODE parts them (b06, b04)", () => {
    const cad = regionOf([square(20, 0, 40, 10), square(28, -5, 32, 15)])
    answer(cad, "SUBTRACT", "20,5", "", "28,0", "")
    expect(regions(cad)).toHaveLength(1)
    expect(regions(cad)[0].faces).toHaveLength(2)
    expect(areas(cad)).toEqual([160])
    answer(cad, "EXPLODE", "ALL", "")
    expect(areas(cad)).toEqual([80, 80])
  })

  it("needs two regions in one plane (b07)", () => {
    const cad = regionOf([circleOf(p(0, 0), 5)])
    answer(cad, "LINE", "20,0", "30,0", "")
    expect(written(cad, "UNION", "ALL", "").slice(-3)).toEqual([
      "2 found",
      "Select objects:",
      "At least 2 solids, surfaces, or coplanar regions must be selected.",
    ])
    expect(cad.typeCounts()).toEqual({ region: 1, line: 1 })
  })

  it("combines plane by plane (b08)", () => {
    const cad = createHarness()
    answer(
      cad,
      "CIRCLE",
      "0,0,0",
      "5",
      "CIRCLE",
      "3,0,0",
      "5",
      "CIRCLE",
      "0,0,10",
      "5",
      "CIRCLE",
      "3,0,10",
      "5",
      "REGION",
      "ALL",
      "",
      "UNION",
      "ALL",
      ""
    )
    expect(areas(cad)).toEqual([108.0835, 108.0835])
    expect(
      regions(cad)
        .map((r) => r.elevation ?? 0)
        .sort()
    ).toEqual([0, 10])
  })
})

describe("a region in the other commands", () => {
  it("reports its area as AREA's Object does (region/p01)", () => {
    const cad = regionOf([circleOf(p(30, 5), 5)])
    answer(cad, "LUPREC", "4")
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 78.5398, Trimmed area = 0.0000 , Perimeter = 31.4159"
    )
  })

  it("is listed by LIST (p01)", () => {
    const cad = regionOf([circleOf(p(30, 5), 5)])
    answer(cad, "LUPREC", "4")
    const listed = written(cad, "LIST", "L", "").join("\n")
    expect(listed).toContain("REGION    Layer:")
    expect(listed).toContain("                             Area: 78.5398")
    expect(listed).toContain("                        Perimeter: 31.4159")
    expect(listed).toContain(
      "   Bounding Box: Lower Bound X = 25.0000  , Y = 0.0000   , Z = 0.0000\n" +
        "                 Upper Bound X = 35.0000  , Y = 10.0000  , Z = 0.0000"
    )
  })

  it("explodes one face into its edges (b02, p09)", () => {
    const cad = regionOf([square(0, 0, 20, 20), circleOf(p(10, 10), 5)])
    answer(cad, "SUBTRACT", "20,10", "", "15,10", "", "EXPLODE", "ALL", "")
    expect(cad.typeCounts()).toEqual({ line: 4, circle: 1 })
  })

  it("cannot be broken, offset, trimmed or extended (e01, e09, e10)", () => {
    const cad = regionOf([square(0, 0, 10, 10)])
    expect(written(cad, "BREAK", "10,5").at(-1)).toBe("Object can't be broken")
    answer(cad, "")
    expect(written(cad, "OFFSET", "1", "10,5").at(-1)).toBe(
      "Cannot offset that object."
    )
  })

  it("shows grips at its corners and a circle's centre (s01, s02)", () => {
    const cad = regionOf([square(0, 0, 20, 20), circleOf(p(40, 10), 5)])
    cad.selectAll()
    const grips = cad
      .scene()
      .primitives.filter((q) => q.kind === "rect" && q.fill === THEME.grip)
    expect(grips).toHaveLength(5)
  })

  it("moves, turns and mirrors whole, its area kept", () => {
    const cad = regionOf([square(0, 0, 10, 10)])
    answer(cad, "MOVE", "L", "", "0,0", "3,4")
    answer(cad, "ROTATE", "L", "", "0,0", "90")
    answer(cad, "MIRROR", "L", "", "0,0", "0,10", "Y")
    expect(areas(cad)).toEqual([100])
    expect(regions(cad)[0].faces[0].loops[0].length).toBe(4)
  })
})
