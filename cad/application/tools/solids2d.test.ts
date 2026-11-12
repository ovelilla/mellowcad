import { describe, expect, it } from "vitest"

import { createHarness } from "../../../test/harness"
import { p, lineOf } from "../../../test/builders"
import {
  createSolid2d,
  pointInsideSolid2d,
  type Solid2dEntity,
} from "../../domain/entities"
import { es } from "../../locales/es"
import { fr } from "../../locales/fr"
import { it as italian } from "../../locales/it"
import { ptBR } from "../../locales/pt-BR"

const byId = (cad: ReturnType<typeof createHarness>, id: string) =>
  cad.entities().find((e) => e.id === id)

const answerLine = (cad: ReturnType<typeof createHarness>, text: string) => {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
}

const solids = (cad: ReturnType<typeof createHarness>) =>
  cad
    .entities()
    .filter((e): e is Solid2dEntity => e.type === "solid2d")
    .map((e) => e.corners.map((c) => [c.x, c.y]))

describe("SOLID (solid2d/p01–p03)", () => {
  it("asks AutoCAD's four points and makes a quadrilateral, then goes on from its third and fourth", () => {
    const cad = createHarness()
    cad.command("SOLID")
    expect(cad.state().commandLine.prompt).toBe("SOLID Specify first point:")
    cad.type("0,0").enter()
    expect(cad.state().commandLine.prompt).toBe("SOLID Specify second point:")
    cad.type("10,0").enter()
    expect(cad.state().commandLine.prompt).toBe("SOLID Specify third point:")
    cad.type("0,5").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "SOLID Specify fourth point or <exit>:"
    )
    cad.type("10,5").enter()
    expect(cad.state().commandLine.prompt).toBe("SOLID Specify third point:")
    cad.type("20,0").enter().type("20,5").enter()
    cad.enter()
    expect(cad.activeToolId()).toBe("select")
    // p01: 2D7 and 2D8, the second from the first's third and fourth.
    expect(solids(cad)).toEqual([
      [
        [0, 0],
        [10, 0],
        [0, 5],
        [10, 5],
      ],
      [
        [0, 5],
        [10, 5],
        [20, 0],
        [20, 5],
      ],
    ])
  })

  it("makes a triangle at Enter on the fourth point, and the next starts from its third (p03)", () => {
    const cad = createHarness()
    cad.command("SOLID").type("0,0").enter().type("10,0").enter()
    cad.type("20,20").enter().enter()
    expect(cad.state().commandLine.prompt).toBe("SOLID Specify third point:")
    cad.type("30,0").enter().type("40,0").enter().enter()
    expect(solids(cad)).toEqual([
      [
        [0, 0],
        [10, 0],
        [20, 20],
        [20, 20],
      ],
      [
        [20, 20],
        [20, 20],
        [30, 0],
        [40, 0],
      ],
    ])
  })

  it("ends at Enter on the first and third points, and refuses it at the second (p02)", () => {
    const cad = createHarness()
    cad.command("SOLID").enter()
    expect(cad.activeToolId()).toBe("select")
    cad.command("SOLID").type("0,0").enter().enter()
    expect(cad.commandLog().at(-1)).toBe("Invalid 2D point.")
    expect(cad.state().commandLine.prompt).toBe("SOLID Specify second point:")
    cad.type("10,0").enter().enter()
    expect(cad.activeToolId()).toBe("select")
    expect(solids(cad)).toEqual([])
  })

  it("lies in the plane of the first point's Z, refuses a Z after it and wears THICKNESS (p03, p07)", () => {
    const cad = createHarness()
    cad.command("THICKNESS").type("2").enter()
    cad.command("SOLID").type("0,0,7").enter()
    answerLine(cad, "10,0,9")
    expect(cad.commandLog().at(-1)).toBe("Invalid 2D point.")
    cad.type("0,5").enter().type("10,5").enter().enter()
    const made = cad.latest() as Solid2dEntity
    expect(made.elevation).toBe(7)
    expect(made.thickness).toBe(2)
  })

  it("is one undo step for the whole run", () => {
    const cad = createHarness()
    cad.command("SOLID").type("0,0").enter().type("10,0").enter()
    cad.type("0,5").enter().type("10,5").enter()
    cad.type("20,0").enter().enter().enter()
    expect(solids(cad)).toHaveLength(2)
    cad.command("U")
    expect(solids(cad)).toEqual([])
  })

  it("speaks each AutoCAD's words (solid2d/p09, tables 20607–20610)", () => {
    const cases = [
      [es, "SOLIDO", "SOLIDO Precise cuarto punto o <salir>:"],
      [ptBR, "SÓLIDO", "SÓLIDO Especificar quarto ponto ou <sair>:"],
      [fr, "SOLIDE", "SOLIDE Spécifiez un quatrième point ou <Quitter>:"],
      [italian, "POLIG", "POLIG Specificare quarto punto o <Esci>:"],
    ] as const
    for (const [locale, name, prompt] of cases) {
      const cad = createHarness({ locale })
      cad.command(name).type("0,0").enter().type("1,0").enter()
      cad.type("0,1").enter()
      expect(cad.state().commandLine.prompt).toBe(prompt)
    }
  })
})

describe("the 2D solid", () => {
  const square = createSolid2d([p(0, 0), p(100, 0), p(0, 60), p(100, 60)])
  const bowTie = createSolid2d([p(200, 0), p(300, 0), p(300, 60), p(200, 60)])

  it("fills its outline 1, 2, 4, 3: a bow tie is its two triangles (desktop d02, p10)", () => {
    expect(pointInsideSolid2d(square, p(50, 30))).toBe(true)
    expect(pointInsideSolid2d(bowTie, p(250, 10))).toBe(true)
    expect(pointInsideSolid2d(bowTie, p(210, 30))).toBe(false)
  })

  it("is picked inside with FILLMODE on, by its edges with it off (p10)", () => {
    const cad = createHarness({ entities: [square] })
    cad.click(p(50, 30))
    expect(cad.selectedIds()).toEqual([square.id])
    cad.escape()
    cad.command("FILLMODE").type("0").enter()
    cad.click(p(50, 30))
    expect(cad.selectedIds()).toEqual([])
    cad.escape()
    cad.click(p(50, 0))
    expect(cad.selectedIds()).toEqual([square.id])
  })

  it("snaps at its corners and the middles of its edges, no centre (p05, p06)", () => {
    const cad = createHarness({ entities: [square], snap: true })
    cad.command("LINE").click(p(2, 1)).type("MID").enter().click(p(50, 1))
    cad.escape()
    const line = cad.latest()
    expect(line.type).toBe("line")
    if (line.type !== "line") return
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(50, 0))
  })

  it("has a grip at each corner, which moves it (p08)", () => {
    const cad = createHarness({ entities: [square] })
    cad.click(p(50, 30))
    cad.click(p(100, 60)).click(p(120, 80))
    expect((byId(cad, square.id) as Solid2dEntity).corners[3]).toEqual(
      p(120, 80)
    )
  })

  it("moves a triangle's tip, its last two corners, by one grip", () => {
    const triangle = createSolid2d([p(0, 0), p(100, 0), p(50, 60), p(50, 60)])
    const cad = createHarness({ entities: [triangle] })
    cad.click(p(50, 20))
    cad.click(p(50, 60)).click(p(50, 80))
    expect((byId(cad, triangle.id) as Solid2dEntity).corners).toEqual([
      p(0, 0),
      p(100, 0),
      p(50, 80),
      p(50, 80),
    ])
  })

  it("reads Vertex X in the UCS, as the palette shows it", () => {
    const cad = createHarness({ entities: [square] })
    cad.command("UCS").type("100,0").enter().enter()
    cad.click(p(50, 30))
    cad.runtime.setSelectionProperty("vertexX", "20")
    expect((byId(cad, square.id) as Solid2dEntity).corners[0]).toEqual(
      p(120, 0)
    )
  })

  it("refuses EXPLODE, OFFSET, TRIM and BREAK as AutoCAD does (p06, p11)", () => {
    const cad = createHarness({
      entities: [square, lineOf(p(-50, 30), p(150, 30))],
    })
    cad.command("EXPLODE").click(p(50, 10)).enter()
    expect(cad.commandLog()).toContain("1 was not able to be exploded.")
    cad.command("OFFSET").type("1").enter().click(p(50, 10))
    expect(cad.commandLog().at(-1)).toBe("Cannot offset that object.")
    cad.escape()
    cad.command("BREAK").click(p(50, 0))
    expect(cad.commandLog().at(-1)).toBe("Object can't be broken")
    cad.escape()
    expect(byId(cad, square.id)).toEqual(square)
  })

  it("STRETCH moves the corners its window catches (p07)", () => {
    const cad = createHarness({ entities: [square] })
    cad.command("STRETCH")
    answerLine(cad, "C")
    cad.click(p(110, 70)).click(p(90, 50)).enter()
    cad.type("0,0").enter().type("5,5").enter()
    expect((byId(cad, square.id) as Solid2dEntity).corners).toEqual([
      p(0, 0),
      p(100, 0),
      p(0, 60),
      p(105, 65),
    ])
  })

  it("REGION makes a region of it and refuses a bow tie (p18)", () => {
    const cad = createHarness({ entities: [square, bowTie] })
    cad.command("REGION")
    answerLine(cad, "ALL")
    cad.enter()

    const types = cad.entities().map((e) => e.type)
    expect(types.filter((t) => t === "region")).toHaveLength(1)
    expect(byId(cad, square.id)).toBeUndefined()
    expect(byId(cad, bowTie.id)).toBeDefined()
  })

  it("shows its corners, Elevation and Thickness in the palette (desktop d01)", () => {
    const cad = createHarness({ entities: [square] })
    cad.click(p(50, 30))
    const info = cad.state().properties.info
    expect(info?.title).toBe("Solid")
    const rows = info?.groups.flatMap((g) => g.rows.map((r) => r.id))
    expect(rows).toEqual(["vertex", "vertexX", "vertexY", "elevation"])
    expect(info?.general.map((r) => r.id)).toContain("thickness")
  })
})

describe("LIST of a 2D solid (solid2d/p07, p21)", () => {
  const thick: Solid2dEntity = {
    ...createSolid2d([{ x: 0, y: 0, z: 4 }, p(10, 0), p(0, 6), p(10, 6)]),
    thickness: 2,
  }

  it("writes its corners as each AutoCAD's console does", () => {
    const cases = [
      [undefined, "SOLID     Layer", "               and point, X=    10.00"],
      [es, "SOLIDO    Capa", "                 y punto, X=    10.00"],
      [ptBR, "SÓLIDO    Camada", "              para ponto, X=     0.00"],
      [fr, "SOLIDE    Calque", "                 à point, X=     0.00"],
      [italian, "SOLIDO    Layer", "                 a punto, X=     0.00"],
    ] as const
    for (const [locale, header, line] of cases) {
      const cad = createHarness({
        entities: [thick],
        ...(locale ? { locale } : {}),
      })
      cad.command("_LIST")
      cad.click(p(5, 3)).enter()
      const report = cad.commandLog().join("\n")
      expect(report).toContain(header)
      expect(report).toContain(line)
    }
  })
})
