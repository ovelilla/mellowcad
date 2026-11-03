import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import {
  circleOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
  rectOf,
} from "../../test/builders"
import type { Entity, RegionEntity } from "../domain/entities"
import { regionArea, regionPerimeter } from "../domain/regions"
import { curvePoint, curveStart } from "../geometry/planarCurves"
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

  it("says None found. to an empty set (p05; regions/p127, p135 in es-ES, pt-BR)", () => {
    const none = (locale?: typeof es) =>
      written(createHarness(locale ? { locale } : {}), "_REGION", "").at(-1)
    expect(none()).toBe("None found.")
    expect(none(es)).toBe("No se ha encontrado ninguno.")
    expect(none(ptBR)).toBe("Não foi encontrado nada.")
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

  it("is one undo step, which U and REDO name (regions/p103, p128)", () => {
    const cad = regionOf(P01)
    expect(written(cad, "U").at(-1)).toBe("REGION")
    expect(cad.typeCounts()).toEqual({ line: 4, circle: 1 })
    expect(written(cad, "REDO").slice(-2)).toEqual([
      "REGION",
      "Everything has been redone",
    ])
    expect(cad.typeCounts()).toEqual({ region: 2 })
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

describe("REGION against AutoCAD 2027 (the Regions review)", () => {
  it("drops a preselection and asks Select objects: (regions/p129)", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 5), circleOf(p(20, 0), 5)],
    })
    cad.selectAll()
    expect(written(cad, "REGION")).toEqual(["REGION"])
    expect(cad.selectedIds()).toEqual([])
    expect(cad.state().commandLine.prompt).toBe("REGION Select objects:")
    expect(written(cad, "").at(-1)).toBe("None found.")
    expect(cad.typeCounts()).toEqual({ circle: 2 })
  })

  it("says the open edges cannot be colinear: a line, two apart (regions/p135, p133)", () => {
    for (const entities of [
      [lineOf(p(0, 0), p(10, 0))],
      [lineOf(p(0, 0), p(10, 0)), lineOf(p(20, 0), p(30, 0))],
    ]) {
      expect(regionOf(entities).commandLog().slice(-3)).toEqual([
        "All open edges cannot be colinear.",
        "0 loops extracted.",
        "0 Regions created.",
      ])
    }
  })

  it("says it after the rejected objects, before the loops (regions/p150, p107)", () => {
    const cad = regionOf([circleOf(p(0, 0), 5)])
    answer(cad, "LINE", "20,0", "30,0", "")
    expect(written(cad, "REGION", "ALL", "").slice(-4)).toEqual([
      "1 closed, degenerate or unsupported object rejected.",
      "All open edges cannot be colinear.",
      "0 loops extracted.",
      "0 Regions created.",
    ])
    const among = regionOf([
      circleOf(p(0, 0), 5),
      lineOf(p(20, 0), p(30, 0)),
      circleOf(p(50, 0), 5),
    ])
    expect(among.commandLog().slice(-3)).toEqual([
      "All open edges cannot be colinear.",
      "2 loops extracted.",
      "2 Regions created.",
    ])
  })

  it("says nothing of it for a lone arc (regions/p134)", () => {
    const cad = createHarness()
    answer(cad, "ARC", "0,0", "5,5", "10,0")
    expect(written(cad, "REGION", "ALL", "").slice(-2)).toEqual([
      "0 loops extracted.",
      "0 Regions created.",
    ])
  })

  it("says it in es-ES and pt-BR (regions/p105, p135)", () => {
    const said = (locale: typeof es) =>
      written(
        createHarness({ entities: [lineOf(p(0, 0), p(10, 0))], locale }),
        "_REGION",
        "_ALL",
        ""
      ).slice(-3)
    expect(said(es)).toEqual([
      "Todas las aristas abiertas no pueden ser colineales.",
      "0 bucles extraído(s).",
      "0 regiones creada(s).",
    ])
    expect(said(ptBR)).toEqual([
      "Todas as arestas abertas não podem ser colineares.",
      "0 loops extraído(s).",
      "0 Regiões criada(s).",
    ])
  })

  it("makes a Spline-fit polyline's region of its B-spline, one edge (regions/p132)", () => {
    const cad = createHarness()
    answer(cad, "PLINE", "80,0", "100,0", "100,10", "80,10", "C")
    answer(cad, "PEDIT", "L", "S", "", "REGION", "ALL", "")
    const [region] = regions(cad)
    expect(regionArea(region)).toBeCloseTo(135.555556, 6)
    expect(regionPerimeter(region)).toBeCloseTo(44.910132, 6)
    const [edge, ...rest] = region.faces[0].loops[0]
    expect(rest).toEqual([])
    expect(edge.kind).toBe("spline")
    expect(curveStart(edge)).toBeCloseToPoint(p(96.666667, 1.666667), 6)
  })

  it("makes the open chains' regions first, then the closed objects' (regions/p125)", () => {
    const cad = createHarness()
    answer(cad, "CIRCLE", "50,0", "5")
    answer(cad, "LINE", "0,0", "10,0", "10,10", "0,10", "C")
    answer(cad, "CIRCLE", "30,0", "5", "RECTANG", "60,0", "70,10")
    answer(cad, "REGION", "ALL", "")
    const leftmost = (r: RegionEntity) =>
      Math.round(
        Math.min(
          ...r.faces[0].loops[0].flatMap((c) =>
            [0, 0.25, 0.5, 0.75].map((s) => curvePoint(c, s).x)
          )
        )
      )
    expect(regions(cad).map(leftmost)).toEqual([0, 45, 25, 60])
  })

  it("rejects no outline round loops meeting at a vertex (regions/p120, p137)", () => {
    const triangles = createHarness()
    answer(triangles, "LINE", "0,0", "10,0", "5,8", "C")
    answer(triangles, "LINE", "10,0", "20,0", "15,8", "C")
    const eight = createHarness()
    answer(eight, "LINE", "0,0", "10,5", "0,10", "C")
    answer(eight, "LINE", "10,5", "20,0", "20,10", "C")
    for (const cad of [triangles, eight]) {
      expect(written(cad, "REGION", "ALL", "").slice(-3)).toEqual([
        "Select objects:",
        "2 loops extracted.",
        "2 Regions created.",
      ])
      expect(cad.typeCounts()).toEqual({ region: 2 })
    }
  })

  it("counts a coincident circle but makes one region; keeps the first of two lines (regions/p123)", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "10,0", "10,10", "0,10", "C")
    answer(cad, "LINE", "0,0", "10,0", "")
    answer(cad, "CIRCLE", "30,0", "5", "CIRCLE", "30,0", "5")
    const first = cad.entities()[0].id
    expect(written(cad, "REGION", "ALL", "").slice(-2)).toEqual([
      "3 loops extracted.",
      "3 Regions created.",
    ])
    expect(cad.typeCounts()).toEqual({ line: 1, region: 2 })
    expect(cad.entities().find((e) => e.type === "line")?.id).toBe(first)
  })
})

describe("REGION: the cells the Regions review settled", () => {
  /** What `ID @` reads LASTPOINT as. */
  const lastPoint = (cad: CadHarness) => written(cad, "ID", "@").at(-1)

  it("sets LASTPOINT at a typed pick, never at ALL (regions/p130, p131)", () => {
    const picked = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    answer(picked, "LASTPOINT", "100,100,0", "REGION", "5,0", "")
    expect(regions(picked)).toHaveLength(1)
    expect(lastPoint(picked)).toMatch(/X = 5\.0+ +Y = 0\.0+ /)
    const all = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    answer(all, "LASTPOINT", "100,100,0", "REGION", "ALL", "")
    expect(lastPoint(all)).toMatch(/X = 100\.0+ +Y = 100\.0+ /)
  })

  it("is refused transparently (regions/p102)", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    expect(written(cad, "LINE", "20,0", "'_REGION").slice(-2)).toEqual([
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  it("takes a command typed at its prompt as an invalid selection (region/p05)", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    expect(written(cad, "REGION", "_REGION").at(-2)).toBe("*Invalid selection*")
  })

  it("is a step named REGION when it makes nothing; UNDO 2 names two (regions/p105, p104)", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    answer(cad, "REGION", "")
    expect(written(cad, "U").at(-1)).toBe("REGION")
    answer(cad, "LINE", "20,0", "30,0", "", "REGION", "L", "")
    expect(written(cad, "U").at(-1)).toBe("REGION")
    expect(cad.typeCounts()).toEqual({ circle: 1, line: 1 })
    answer(cad, "REGION", "ALL", "", "CIRCLE", "50,0", "5", "REGION", "L", "")
    expect(written(cad, "UNDO", "2").at(-1)).toBe("REGION CIRCLE")
    expect(cad.typeCounts()).toEqual({ line: 1, region: 1 })
  })

  it("leaves nothing selected and the unused objects as Previous (regions/p107)", () => {
    const cad = regionOf([
      circleOf(p(0, 0), 5),
      lineOf(p(20, 0), p(30, 0)),
      circleOf(p(50, 0), 5),
    ])
    expect(cad.selectedIds()).toEqual([])
    expect(written(cad, "ERASE", "P").at(-1)).toBe("1 found")
  })

  it("counts and leaves the objects on a locked layer (regions/p126)", () => {
    const cad = createHarness()
    const locked = (entity: Entity) => ({ ...entity, layerId: "LK" })
    cad.runtime.document.load(
      [
        locked(circleOf(p(0, 0), 5)),
        ...square(20, 0, 30, 10).vertices.map((v, i, all) =>
          locked(lineOf(v, all[(i + 1) % all.length]))
        ),
        circleOf(p(50, 0), 5),
      ],
      { layers: [layerOf("0"), layerOf("LK", { locked: true })] }
    )
    const lines = written(cad, "REGION", "ALL", "")
    expect(lines).toContain("5 were on a locked layer.")
    expect(lines.slice(-2)).toEqual(["1 loop extracted.", "1 Region created."])
    expect(cad.typeCounts()).toEqual({ circle: 1, line: 4, region: 1 })
  })

  /** A square of lines and a circle drawn after `setup`, made regions. */
  function squareAndCircle(...setup: string[]): CadHarness {
    const cad = createHarness()
    answer(cad, ...setup, "LINE", "0,0", "10,0", "10,10", "0,10", "C")
    answer(cad, "CIRCLE", "30,0", "5", "THICKNESS", "0", "REGION", "ALL", "")
    expect(regions(cad).map((r) => Number(regionArea(r).toFixed(6)))).toEqual([
      100, 78.539816,
    ])
    return cad
  }

  it("lies in the UCS's plane: turned about Z, tilted about X (regions/p116, p117)", () => {
    for (const r of regions(squareAndCircle("UCS", "Z", "30"))) {
      expect(r.normal).toBeUndefined()
    }
    for (const r of regions(squareAndCircle("UCS", "X", "90"))) {
      expect(r.normal?.x).toBeCloseTo(0, 9)
      expect(r.normal?.y).toBeCloseTo(-1, 9)
      expect(r.normal?.z).toBeCloseTo(0, 9)
    }
  })

  it("lies at their ELEVATION and takes no THICKNESS (regions/p118, p119)", () => {
    const raised = squareAndCircle("ELEVATION", "5")
    expect(regions(raised).map((r) => r.elevation)).toEqual([5, 5])
    const thick = squareAndCircle("THICKNESS", "2")
    for (const r of regions(thick)) expect("thickness" in r).toBe(false)
  })

  it("closes a gap of 1e-7, not one of 1e-5 (regions/p122)", () => {
    const cad = createHarness()
    for (const [x, gap] of [
      [0, "0.0000001"],
      [20, "0.00001"],
      [40, "0.001"],
    ] as const) {
      answer(cad, "LINE", `${x},0`, `${x + 10},0`, `${x + 10},10`, `${x},10`)
      answer(cad, `${x},${gap}`, "")
    }
    expect(written(cad, "REGION", "ALL", "").slice(-2)).toEqual([
      "1 loop extracted.",
      "1 Region created.",
    ])
    expect(cad.typeCounts()).toEqual({ line: 8, region: 1 })
  })

  it("chains lines and an arc, elliptical arcs, splines (regions/p121, p114, p115)", () => {
    const arc = createHarness()
    answer(arc, "LINE", "0,0", "10,0", "10,10", "")
    answer(arc, "ARC", "10,10", "2.9289321881345,7.0710678118655", "0,0")
    answer(arc, "REGION", "ALL", "")
    expect(regionArea(regions(arc)[0])).toBeCloseTo(78.539816, 6)
    expect(regionPerimeter(regions(arc)[0])).toBeCloseTo(35.707963, 6)
    const curves = createHarness()
    answer(curves, "ELLIPSE", "A", "40,0", "60,0", "5", "0", "180")
    answer(curves, "ELLIPSE", "A", "40,0", "60,0", "5", "180", "360")
    answer(curves, "SPLINE", "0,0", "5,5", "10,0", "")
    answer(curves, "SPLINE", "10,0", "5,-5", "0,0", "")
    answer(curves, "REGION", "ALL", "")
    expect(regions(curves).map((r) => regionArea(r))).toEqual([
      expect.closeTo(157.079633, 6),
      expect.closeTo(62.5, 6),
    ])
    expect(regionPerimeter(regions(curves)[0])).toBeCloseTo(48.442241, 6)
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

  it("set LASTPOINT at their last typed pick (regions/p109–p111)", () => {
    for (const run of [
      ["UNION", "-5,0", "11,0", ""],
      ["INTERSECT", "-5,0", "11,0", ""],
      ["SUBTRACT", "-5,0", "", "11,0", ""],
    ]) {
      const cad = regionOf([circleOf(p(0, 0), 5), circleOf(p(6, 0), 5)])
      answer(cad, "LASTPOINT", "100,100,0", ...run)
      expect(regions(cad)).toHaveLength(1)
      expect(written(cad, "ID", "@").at(-1)).toMatch(/X = 11\.0+ +Y = 0\.0+ /)
    }
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

describe("UNION, SUBTRACT and INTERSECT against AutoCAD 2027 (the Regions review)", () => {
  const NONE = "No solids, surfaces, or regions selected."
  const TWO =
    "At least two solids, surfaces, or coplanar regions must be selected."
  const TWO_DIGIT =
    "At least 2 solids, surfaces, or coplanar regions must be selected."
  const ZW = ["ZOOM", "W", "-10,-10", "40,30"]

  /** Two overlapping circles' regions and a small one apart (regions/p305, p306, p331–p333). */
  function lens(locale?: typeof es): CadHarness {
    const cad = createHarness(locale ? { locale } : {})
    const all = locale ? "_ALL" : "ALL"
    return answer(
      cad,
      ...ZW,
      "_CIRCLE",
      "0,0",
      "5",
      "_CIRCLE",
      "3,0",
      "5",
      "_CIRCLE",
      "20,0",
      "3",
      "_REGION",
      all,
      ""
    )
  }

  /** p320's regions, apart in plan so a point picks one: a (0,0,0), b (20,0,0), c (0,20,10), d (3,20,10), e (23,0,0). */
  function planes(): CadHarness {
    const cad = answer(createHarness(), ...ZW)
    for (const centre of ["0,0,0", "20,0,0", "0,20,10", "3,20,10", "23,0,0"]) {
      answer(cad, "CIRCLE", centre, "5")
    }
    return answer(cad, "REGION", "ALL", "")
  }

  /** A circle's region and a line apart (regions/p304, p336). */
  function regionAndLine(locale?: typeof es): CadHarness {
    const cad = createHarness(locale ? { locale } : {})
    return answer(
      cad,
      ...ZW,
      "_CIRCLE",
      "0,0",
      "5",
      "_REGION",
      "_L",
      "",
      "_LINE",
      "20,0",
      "30,0",
      ""
    )
  }

  /** Three regions on layers A, B and C, made in that order (regions/p314, p315). */
  function threeLayers(): { cad: CadHarness; layers: string[] } {
    const cad = answer(createHarness(), ...ZW)
    const layers = ["A", "B", "C"].map((name, i) => {
      const layer = cad.runtime.createLayer(name)
      cad.runtime.setCurrentLayer(layer)
      answer(cad, "CIRCLE", `${6 * i},0`, "5", "REGION", "L", "")
      return layer
    })
    return { cad, layers }
  }

  it("UNION and INTERSECT drop a preselection and ask (regions/p331, p332, p335)", () => {
    for (const name of ["UNION", "INTERSECT"]) {
      const cad = lens()
      cad.select(...regions(cad).map((r) => r.id))
      expect(written(cad, name)).toEqual([name])
      expect(cad.selectedIds()).toEqual([])
      expect(cad.state().commandLine.prompt).toBe(`${name} Select objects:`)
      answer(cad, "")
      expect(regions(cad)).toHaveLength(3)
    }
  })

  it("SUBTRACT drops a preselection and asks its first set (regions/p333, p335)", () => {
    const cad = lens()
    cad.select(...regions(cad).map((r) => r.id))
    expect(written(cad, "SUBTRACT")).toEqual([
      "SUBTRACT",
      "Select solids, surfaces, and regions to subtract from ..",
    ])
    expect(cad.selectedIds()).toEqual([])
    expect(cad.state().commandLine.prompt).toBe("SUBTRACT Select objects:")
    answer(cad, "-5,0", "", "8,0", "")
    expect(areas(cad)).toEqual([28.2743, 29.5437])
  })

  it("leaves nothing selected, the survivor as Previous after UNION (regions/p331, p334)", () => {
    const cad = lens()
    answer(cad, "UNION", "-5,0", "8,0", "")
    expect(cad.selectedIds()).toEqual([])
    expect(written(cad, "LIST", "P", "").at(2)).toBe("1 found")
  })

  it("keeps the newest under a window: its id and layer (regions/p315)", () => {
    const { cad, layers } = threeLayers()
    const newest = regions(cad).at(-1)!
    answer(cad, "UNION", "W", "-6,-6", "18,6", "")
    expect(regions(cad).map((r) => [r.id, r.layerId])).toEqual([
      [newest.id, layers[2]],
    ])
  })

  it("keeps the newest under a crossing and ALL (regions/p315, region/b01)", () => {
    for (const mode of [["C", "-6,-6", "18,6"], ["ALL"]]) {
      const { cad, layers } = threeLayers()
      const newest = regions(cad).at(-1)!
      answer(cad, "UNION", ...mode, "")
      expect(regions(cad).map((r) => [r.id, r.layerId])).toEqual([
        [newest.id, layers[2]],
      ])
    }
  })

  it("keeps the first picked, newest or not (regions/p314, region/b10)", () => {
    const newestFirst = threeLayers()
    answer(newestFirst.cad, "UNION", "17,0", "-5,0", "6,5", "")
    expect(regions(newestFirst.cad).map((r) => r.layerId)).toEqual([
      newestFirst.layers[2],
    ])
    expect(areas(newestFirst.cad)).toEqual([190.8899])
    const oldestFirst = threeLayers()
    answer(oldestFirst.cad, "UNION", "6,5", "17,0", "-5,0", "")
    expect(regions(oldestFirst.cad).map((r) => r.layerId)).toEqual([
      oldestFirst.layers[1],
    ])
  })

  it("SUBTRACT joins the first set's squares, takes the bar, leaves the circle at Z 5 (region/b10)", () => {
    const cad = answer(
      createHarness(),
      "ZOOM",
      "W",
      "-10,-10",
      "60,30",
      "RECTANG",
      "0,0",
      "10,10",
      "RECTANG",
      "20,0",
      "30,10",
      "RECTANG",
      "5,2",
      "25,8",
      "CIRCLE",
      "0,0,5",
      "3",
      "REGION",
      "ALL",
      ""
    )
    const first = regions(cad)[0]
    answer(cad, "SUBTRACT", "0,5", "30,5", "", "25,2", "0,3", "")
    expect(areas(cad)).toEqual([28.2743, 140])
    const kept = regions(cad).find((r) => r.id === first.id)!
    expect(Number(regionArea(kept).toFixed(4))).toBe(140)
    expect(regionPerimeter(kept)).toBeCloseTo(100, 9)
    expect(
      regions(cad)
        .map((r) => r.elevation ?? 0)
        .sort()
    ).toEqual([0, 5])
  })

  it("SUBTRACT says two are needed when the first plane has nothing to take: nothing changes (regions/p317, p320)", () => {
    const parallel = planes()
    expect(written(parallel, "SUBTRACT", "-5,0", "", "8,20", "").at(-1)).toBe(
      TWO
    )
    expect(regions(parallel)).toHaveLength(5)
    const cad = planes()
    expect(
      written(cad, "SUBTRACT", "-5,0", "15,0", "-5,20", "", "8,20", "").at(-1)
    ).toBe(TWO)
    expect(areas(cad)).toEqual([78.5398, 78.5398, 78.5398, 78.5398, 78.5398])
  })

  it("SUBTRACT joins another plane of the first set, nothing taken from it (regions/p338)", () => {
    const cad = planes()
    answer(cad, "SUBTRACT", "-5,20", "-5,0", "15,0", "", "8,20", "")
    expect(areas(cad)).toEqual([29.5437, 78.5398, 157.0796])
  })

  it("SUBTRACT takes from every plane of the first set (regions/p339)", () => {
    const cad = planes()
    answer(cad, "SUBTRACT", "-5,0", "15,0", "-5,20", "", "8,20", "28,0", "")
    expect(areas(cad)).toEqual([29.5437, 108.0835])
  })

  it("SUBTRACT ends on a first set with no region, saying so, before the second prompt (regions/p304)", () => {
    const cad = regionAndLine()
    expect(written(cad, "SUBTRACT", "25,0", "")).toEqual([
      "SUBTRACT",
      "Select solids, surfaces, and regions to subtract from ..",
      "Select objects: 25,0",
      "1 found",
      "Select objects:",
      NONE,
    ])
    expect(cad.activeToolId()).not.toBe("subtract")
    expect(cad.typeCounts()).toEqual({ region: 1, line: 1 })
  })

  it("SUBTRACT says none was selected of a second set holding the first's object, its Previous, a line (regions/p305, p306, p336)", () => {
    const same = lens()
    expect(written(same, "SUBTRACT", "-5,0", "", "-5,0", "").at(-1)).toBe(NONE)
    expect(regions(same)).toHaveLength(3)
    const previous = lens()
    expect(
      written(previous, "SUBTRACT", "-5,0", "", "P", "").slice(-3)
    ).toEqual(["1 found", "Select objects:", NONE])
    expect(regions(previous)).toHaveLength(3)
    const line = regionAndLine()
    expect(written(line, "SUBTRACT", "-5,0", "", "25,0", "").at(-1)).toBe(NONE)
    expect(line.typeCounts()).toEqual({ region: 1, line: 1 })
  })

  it("SUBTRACT ends silently on an empty set, the first (region/b07) or the second (regions/p312)", () => {
    const first = lens()
    expect(written(first, "SUBTRACT", "")).toEqual([
      "SUBTRACT",
      "Select solids, surfaces, and regions to subtract from ..",
      "Select objects:",
    ])
    expect(first.activeToolId()).not.toBe("subtract")
    const second = lens()
    expect(written(second, "SUBTRACT", "-5,0", "", "").at(-1)).toBe(
      "Select objects:"
    )
    expect(regions(second)).toHaveLength(3)
  })

  it("UNION counts a locked region and leaves it out (regions/p321)", () => {
    const cad = createHarness()
    const locked = cad.runtime.createLayer("L", undefined, false)
    answer(cad, ...ZW, "CIRCLE", "0,0", "5", "REGION", "L", "")
    cad.runtime.setCurrentLayer(locked)
    answer(cad, "CIRCLE", "3,0", "5", "REGION", "L", "")
    cad.runtime.setCurrentLayer(cad.runtime.document.getLayers()[0].id)
    cad.runtime.updateLayer(locked, { locked: true })
    expect(written(cad, "UNION", "ALL", "").slice(-4)).toEqual([
      "2 found",
      "1 was on a locked layer.",
      "Select objects:",
      TWO_DIGIT,
    ])
    expect(regions(cad)).toHaveLength(2)
  })

  it("unites coplanar regions of opposite normals (regions/p316)", () => {
    const cad = answer(
      createHarness(),
      ...ZW,
      "CIRCLE",
      "0,0",
      "5",
      "REGION",
      "L",
      "",
      "UCS",
      "X",
      "180",
      "CIRCLE",
      "3,0",
      "5",
      "REGION",
      "L",
      "",
      "UCS",
      "W"
    )
    answer(cad, "UNION", "ALL", "")
    expect(areas(cad)).toEqual([108.0835])
  })

  it("UNION and INTERSECT of one region in each of two planes: At least 2 (regions/p317)", () => {
    const cad = answer(
      createHarness(),
      ...ZW,
      "CIRCLE",
      "0,0,0",
      "5",
      "REGION",
      "L",
      "",
      "CIRCLE",
      "3,0,10",
      "5",
      "REGION",
      "L",
      ""
    )
    expect(written(cad, "UNION", "ALL", "").at(-1)).toBe(TWO_DIGIT)
    expect(written(cad, "INTERSECT", "ALL", "").at(-1)).toBe(TWO_DIGIT)
  })

  it("INTERSECT of three meeting only in pairs: one null region (regions/p318)", () => {
    const cad = createHarness({
      entities: [
        circleOf(p(0, 0), 5.5),
        circleOf(p(10, 0), 5.5),
        circleOf(p(5, 8.660254), 5.5),
      ],
    })
    answer(cad, "REGION", "ALL", "")
    expect(written(cad, "INTERSECT", "ALL", "").at(-1)).toBe(
      "Null region created - deleted"
    )
    expect(cad.entities()).toEqual([])
  })

  it("INTERSECT leaves a plane's lone region (regions/p319)", () => {
    const cad = answer(
      createHarness(),
      "CIRCLE",
      "0,0,0",
      "5",
      "CIRCLE",
      "3,0,0",
      "5",
      "CIRCLE",
      "0,0,10",
      "5",
      "REGION",
      "ALL",
      ""
    )
    answer(cad, "INTERSECT", "ALL", "")
    expect(areas(cad)).toEqual([48.9961, 78.5398])
  })

  it("is named UNI, SU and IN, and Enter repeats it (regions/p300)", () => {
    const cad = createHarness()
    expect(
      written(cad, "UNI", "", "SU", "", "IN", "", "UNION", "", "", "")
    ).toEqual([
      "UNI UNION",
      "Select objects:",
      "SU SUBTRACT",
      "Select solids, surfaces, and regions to subtract from ..",
      "Select objects:",
      "IN INTERSECT",
      "Select objects:",
      "UNION",
      "Select objects:",
      "UNION",
      "Select objects:",
    ])
  })

  it("is refused transparently (regions/p303)", () => {
    const cad = createHarness()
    expect(written(cad, "LINE", "0,0", "'_UNION").slice(-2)).toEqual([
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  it("takes a command typed at either set as an invalid selection (regions/p311)", () => {
    const cad = lens()
    expect(written(cad, "SUBTRACT", "LINE").at(-2)).toBe("*Invalid selection*")
    expect(written(cad, "-5,0", "", "LINE").at(-2)).toBe("*Invalid selection*")
    expect(written(cad, "8,0", "").at(-1)).toBe("Select objects:")
    expect(regions(cad)).toHaveLength(2)
  })

  it("is one step U names, even one that made nothing (regions/p307, p308, p312, p313)", () => {
    const nulled = answer(
      createHarness({
        entities: [circleOf(p(0, 0), 5), circleOf(p(20, 0), 5)],
      }),
      "REGION",
      "ALL",
      "",
      "INTERSECT",
      "ALL",
      ""
    )
    expect(nulled.entities()).toEqual([])
    expect(written(nulled, "U")).toEqual(["U", "INTERSECT"])
    expect(regions(nulled)).toHaveLength(2)
    const refused = regionOf([circleOf(p(0, 0), 5)])
    answer(refused, "UNION", "ALL", "")
    expect(written(refused, "U")).toEqual(["U", "UNION"])
    const empty = lens()
    answer(empty, "UNION", "")
    expect(written(empty, "U")).toEqual(["U", "UNION"])
    answer(empty, "SUBTRACT", "-5,0", "", "")
    expect(written(empty, "U")).toEqual(["U", "SUBTRACT"])
    expect(regions(empty)).toHaveLength(3)
  })

  it("U, REDO and UNDO 2 after SUBTRACT (regions/p337, p309)", () => {
    const cad = answer(createHarness(), ...ZW)
    answer(cad, "CIRCLE", "0,0", "5", "CIRCLE", "3,0", "5", "REGION", "ALL", "")
    answer(cad, "SUBTRACT", "-5,0", "", "8,0", "")
    expect(regions(cad)).toHaveLength(1)
    expect(written(cad, "U")).toEqual(["U", "SUBTRACT"])
    expect(regions(cad)).toHaveLength(2)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "SUBTRACT",
      "Everything has been redone",
    ])
    expect(regions(cad)).toHaveLength(1)
    answer(cad, "U")
    expect(written(cad, "UNDO", "2").at(-1)).toBe("REGION CIRCLE")
    expect(cad.typeCounts()).toEqual({ circle: 1 })
  })

  it("speaks Spanish and Brazilian Portuguese AutoCAD's words (regions/p301, p302, p304, p308, p317, p318)", () => {
    for (const [locale, words] of [
      [
        es,
        {
          names: ["DIF", "DIFERENCIA", "INT", "INTERSEC"],
          from: "Designe sólidos, superficies y regiones de las que sustraer...",
          what: "Designe sólidos, superficies y regiones de las que sustraer...",
          none: "No se ha designado sólido, superficie o región.",
          two: "Hay que designar al menos dos sólidos, superficies o regiones coplanares.",
          twoDigit:
            "Hay que designar al menos 2 sólidos, superficies o regiones coplanares.",
          nullRegion: "Región nula creada - eliminada.",
        },
      ],
      [
        ptBR,
        {
          names: ["SU", "SUBTRAIR", "INT", "INTERSEC"],
          from: "Selecionar sólidos, superfícies e regiões a subtrair de ..",
          what: "Selecionar sólidos, superfícies e regiões a subtrair ..",
          none: "Não há sólidos, superfícies ou regiões selecionados.",
          two: "Pelo menos dois sólidos, superfícies ou regiões coplanares precisam estar selecionados.",
          twoDigit:
            "Pelo menos 2 sólidos, superfícies ou regiões coplanares precisam estar selecionados.",
          nullRegion: "Foi criada uma região nula - excluída",
        },
      ],
    ] as const) {
      const [sub, subName, int, intName] = words.names
      const names = createHarness({ locale })
      const echoed = written(names, sub, "", int, "")
      expect(echoed).toContain(`${sub} ${subName}`)
      expect(echoed).toContain(`${int} ${intName}`)
      const line = regionAndLine(locale)
      const said = written(line, "_SUBTRACT", "25,0", "")
      expect(said.filter((l) => l === words.from)).toHaveLength(1)
      expect(said.at(-1)).toBe(words.none)
      const second = lens(locale)
      expect(written(second, "_SUBTRACT", "-5,0", "", "25,0", "")).toContain(
        words.what
      )
      const parallel = createHarness({ locale })
      answer(
        parallel,
        "_ZOOM",
        "_W",
        "-10,-10",
        "40,30",
        "_CIRCLE",
        "0,0,0",
        "5",
        "_REGION",
        "_L",
        "",
        "_CIRCLE",
        "3,0,10",
        "5",
        "_REGION",
        "_L",
        ""
      )
      expect(written(parallel, "_UNION", "_ALL", "").at(-1)).toBe(
        words.twoDigit
      )
      expect(written(parallel, "_SUBTRACT", "_L", "", "-5,0", "").at(-1)).toBe(
        words.two
      )
      const apart = createHarness({
        locale,
        entities: [circleOf(p(0, 0), 5), circleOf(p(20, 0), 5)],
      })
      answer(apart, "_REGION", "_ALL", "")
      expect(written(apart, "_INTERSECT", "_ALL", "").at(-1)).toBe(
        words.nullRegion
      )
    }
  })

  it("pt-BR U is UNIAO's alias; Ctrl+Z still undoes (regions/p400, pt-BR acad.pgp)", () => {
    const cad = createHarness({
      locale: ptBR,
      entities: [circleOf(p(0, 0), 5), circleOf(p(3, 0), 5)],
    })
    answer(cad, "REGIAO", "TUDO", "")
    expect(written(cad, "U", "_ALL", "").slice(0, 3)).toEqual([
      "U UNIAO",
      "Selecionar objetos: _ALL",
      "2 encontrado(s)",
    ])
    expect(cad.typeCounts()).toEqual({ region: 1 })
    cad.press("z", { ctrlKey: true })
    expect(cad.commandLog().at(-1)).toBe("UNIAO")
    expect(cad.typeCounts()).toEqual({ region: 2 })
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
