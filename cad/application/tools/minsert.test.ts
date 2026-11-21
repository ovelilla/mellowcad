import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"
import {
  createAttributeDefinition,
  createBlockDefinition,
  createInsert,
  insertFlatGeometry,
  mirrorEntity,
  scaleEntity,
  type CircleEntity,
  type InsertEntity,
} from "../../domain/entities"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"

// AutoCAD 2027's MINSERT and what other commands do to its reference
// (probes scripts/research/probes/minsert/).

/** A circle of radius 2 at the base point, and a line along +X. */
const b1 = () =>
  createBlockDefinition("B1", p(0, 0), [
    circleOf(p(0, 0), 2, { id: "b1-circle" }),
    lineOf(p(0, 0), p(4, 0), { id: "b1-line" }),
  ])

/** B1 with an attribute T1, prompt P1, default D1. */
const tagged = () =>
  createBlockDefinition("TAGGED", p(0, 0), [
    circleOf(p(0, 0), 2, { id: "t-circle" }),
    createAttributeDefinition(p(3, 1), "T1", {
      prompt: "P1",
      value: "D1",
      id: "t-def",
    }),
  ])

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const minserts = (cad: CadHarness) =>
  cad.entities().filter((e): e is InsertEntity => e.type === "insert")

/** The centres of the circles a reference draws, rounded. */
function centres(cad: CadHarness, insert: InsertEntity): number[][] {
  return insertFlatGeometry(insert, cad.runtime.document.blockLookup())
    .filter((e): e is CircleEntity => e.type === "circle")
    .map((c) => [
      Math.round(c.center.x * 1e6) / 1e6,
      Math.round(c.center.y * 1e6) / 1e6,
    ])
}

describe("MINSERT", () => {
  // m01, m07: -INSERT's prompts, then the rows, the columns and the two
  // distances, each refusal in the console's words.
  it("asks the rows, the columns and their distances after the rotation", () => {
    const cad = createHarness({ blocks: [b1()] })
    const log = typed(
      cad,
      "MINSERT",
      "B1",
      "10,10",
      "",
      "",
      "",
      "0",
      "FOO",
      "2",
      "3",
      "FOO",
      "",
      "10",
      "",
      "FOO",
      "20"
    )
    expect(log).toEqual([
      "MINSERT",
      "Enter block name or [?] <B1>: B1",
      "Specify insertion point or [Scale/Rotate]: 10,10",
      "Enter X scale factor, specify opposite corner, or [Corner/XYZ] <1>:",
      "Enter Y scale factor <use X scale factor>:",
      "Specify rotation angle <0>:",
      "Enter number of rows (---) <1>: 0",
      "Requires an integer between 1 and 32767.",
      "Enter number of rows (---) <1>: FOO",
      "Requires an integer between 1 and 32767.",
      "Enter number of rows (---) <1>: 2",
      "Enter number of columns (|||) <1>: 3",
      "Enter distance between rows or specify unit cell (---): FOO",
      "Requires number or two 2D corner points.",
      "Enter distance between rows or specify unit cell (---):",
      "Requires number or two 2D corner points.",
      "Enter distance between rows or specify unit cell (---): 10",
      "Specify distance between columns (|||):",
      "Requires numeric distance or two points.",
      "Specify distance between columns (|||): FOO",
      "Requires numeric distance or two points.",
      "Specify distance between columns (|||): 20",
    ])
    const [made] = minserts(cad)
    expect(made.position).toEqual({ x: 10, y: 10 })
    expect(made.grid).toEqual({
      columns: 3,
      rows: 2,
      columnSpacing: 20,
      rowSpacing: 10,
    })
    expect(centres(cad, made)).toEqual([
      [10, 10],
      [30, 10],
      [50, 10],
      [10, 20],
      [30, 20],
      [50, 20],
    ])
  })

  // m02: one cell is a plain reference, no distance asked; a column asks
  // the rows' distance alone, a row the columns' alone.
  it("asks only the distances the counts call for", () => {
    const cad = createHarness({ blocks: [b1()] })
    expect(typed(cad, "MINSERT", "", "0,0", "", "", "", "", "")).toEqual([
      "MINSERT",
      "Enter block name or [?] <B1>:",
      "Specify insertion point or [Scale/Rotate]: 0,0",
      "Enter X scale factor, specify opposite corner, or [Corner/XYZ] <1>:",
      "Enter Y scale factor <use X scale factor>:",
      "Specify rotation angle <0>:",
      "Enter number of rows (---) <1>:",
      "Enter number of columns (|||) <1>:",
    ])
    expect(minserts(cad)[0].grid).toBeUndefined()

    const column = typed(cad, "MINSERT", "", "0,100", "", "", "", "3", "", "-7")
    expect(column.slice(-3)).toEqual([
      "Enter number of rows (---) <1>: 3",
      "Enter number of columns (|||) <1>:",
      "Enter distance between rows or specify unit cell (---): -7",
    ])
    expect(minserts(cad)[1].grid).toEqual({
      columns: 1,
      rows: 3,
      columnSpacing: 0,
      rowSpacing: -7,
    })

    const row = typed(cad, "MINSERT", "", "0,200", "", "", "", "", "3", "0")
    expect(row.slice(-2)).toEqual([
      "Enter number of columns (|||) <1>: 3",
      "Specify distance between columns (|||): 0",
    ])
    expect(minserts(cad)[2].grid).toEqual({
      columns: 3,
      rows: 1,
      columnSpacing: 0,
      rowSpacing: 0,
    })
  })

  // m03, m07: two corners give both spacings, signed, and the columns'
  // distance is not asked; a word at the other corner goes back to the
  // rows' distance.
  it("takes a unit cell for both spacings", () => {
    const cad = createHarness({ blocks: [b1()] })
    const log = typed(
      cad,
      "MINSERT",
      "",
      "100,0",
      "",
      "",
      "",
      "2",
      "3",
      "0,0",
      "FOO",
      "10,20",
      "3,4"
    )
    expect(log.slice(-5)).toEqual([
      "Enter distance between rows or specify unit cell (---): 0,0",
      "Specify opposite corner: FOO",
      "Requires number or two 2D corner points.",
      "Enter distance between rows or specify unit cell (---): 10,20",
      "Specify opposite corner: 3,4",
    ])
    expect(minserts(cad)[0].grid).toEqual({
      columns: 3,
      rows: 2,
      columnSpacing: -7,
      rowSpacing: -16,
    })
  })

  it("takes a unit cell picked with the mouse", () => {
    const cad = createHarness({ blocks: [b1()] })
    typed(cad, "MINSERT", "", "100,0", "", "", "", "2", "2")
    cad.click(p(0, 0)).click(p(7, -9))
    expect(minserts(cad)[0].grid).toMatchObject({
      columnSpacing: 7,
      rowSpacing: -9,
    })
  })

  // m03: the spacing is the drawing's, along the turned axes, whatever the
  // scale.
  it("lays the cells along the reference's rotation, unscaled", () => {
    const cad = createHarness({ blocks: [b1()] })
    typed(cad, "MINSERT", "", "300,0", "2", "", "90", "2", "2", "10", "20")
    const [made] = minserts(cad)
    expect(made).toMatchObject({ scaleX: 2, scaleY: 2 })
    expect(centres(cad, made)).toEqual([
      [300, 0],
      [300, 20],
      [290, 0],
      [290, 20],
    ])
  })

  // m05: the values asked after the distances; each cell shows them.
  it("asks the attribute values last", () => {
    const cad = createHarness({ blocks: [tagged()] })
    const log = typed(
      cad,
      "MINSERT",
      "TAGGED",
      "0,0",
      "",
      "",
      "",
      "1",
      "2",
      "10",
      "VAL"
    )
    expect(log.slice(-3)).toEqual([
      "Specify distance between columns (|||): 10",
      "Enter attribute values",
      "P1 <D1>: VAL",
    ])
    const [made] = minserts(cad)
    expect(made.attributes?.[0].value).toBe("VAL")
    const texts = insertFlatGeometry(
      made,
      cad.runtime.document.blockLookup()
    ).filter((e) => e.type === "text")
    expect(texts).toHaveLength(2)
  })

  it("is one undo step", () => {
    const cad = createHarness({ blocks: [b1()] })
    typed(cad, "MINSERT", "", "0,0", "", "", "", "2", "", "5")
    expect(minserts(cad)).toHaveLength(1)
    typed(cad, "U")
    expect(minserts(cad)).toHaveLength(0)
  })

  it("shares INSNAME with -INSERT", () => {
    const cad = createHarness({ blocks: [b1(), tagged()] })
    typed(cad, "-INSERT", "B1", "0,0", "", "", "")
    typed(cad, "MINSERT", "", "100,0", "", "", "", "2", "", "5")
    expect(minserts(cad).map((m) => m.blockId)).toEqual(["B1", "B1"])
    typed(cad, "MINSERT", "TAGGED", "0,50", "", "", "", "", "", "")
    // -INSERT offers the block MINSERT inserted last.
    expect(typed(cad, "-INSERT")).toEqual(["-INSERT"])
    expect(cad.state().commandLine.prompt).toContain("<TAGGED>")
  })

  it("runs as INSERTM in Spanish, in its console's words (m07)", () => {
    const cad = createHarness({ blocks: [b1()], locale: es })
    const log = typed(
      cad,
      "INSERTM",
      "",
      "0,0",
      "",
      "",
      "",
      "2",
      "",
      "FOO",
      "5"
    )
    expect(log.slice(-5)).toEqual([
      "Indique número de filas (---) <1>: 2",
      "Indique número de columnas (|||) <1>:",
      "Indique distancia entre filas o precise casilla de unidades (---): FOO",
      "Requiere un número o dos esquinas 2D.",
      "Indique distancia entre filas o precise casilla de unidades (---): 5",
    ])
    expect(minserts(cad)[0].grid?.rowSpacing).toBe(5)
  })
})

describe("a MINSERT's reference", () => {
  const grid = { columns: 3, rows: 2, columnSpacing: 20, rowSpacing: 10 }
  const minsert = (id = "M") =>
    createInsert("B1", p(10, 10), { id, rotation: Math.PI / 6, grid })

  // m04: SCALE scales the spacing; MIRROR negates the columns' with X.
  it("scales its spacing and mirrors its columns with X", () => {
    const scaled = scaleEntity(minsert(), p(0, 0), 2) as InsertEntity
    expect(scaled.grid).toEqual({ ...grid, columnSpacing: 40, rowSpacing: 20 })
    const mirrored = mirrorEntity(minsert(), p(0, 0), p(0, 10)) as InsertEntity
    expect(mirrored.scaleX).toBe(-1)
    expect(mirrored.grid).toEqual({ ...grid, columnSpacing: -20 })
  })

  it("draws each cell where the mirror puts it", () => {
    const cad = createHarness({ blocks: [b1()], entities: [minsert()] })
    const before = centres(cad, minsert())
    const mirrored = mirrorEntity(minsert(), p(0, 0), p(0, 10)) as InsertEntity
    const after = centres(cad, mirrored)
    expect(after.map(([x, y]) => [-x, y]).sort()).toEqual(
      before.map(([x, y]) => [Math.round(x * 1e6) / 1e6, y]).sort()
    )
  })

  // Inside a reference of unequal scales its spacing stretches with the
  // cells, and a reflected one runs its rows the other way.
  it("lays its cells where a reference to its block puts them", () => {
    const circle = createBlockDefinition("DOT", p(0, 0), [
      circleOf(p(0, 0), 1, { id: "dot" }),
    ])
    const outer = createBlockDefinition("OUT", p(0, 0), [
      createInsert("DOT", p(0, 0), {
        id: "inner",
        grid: { columns: 2, rows: 2, columnSpacing: 10, rowSpacing: 10 },
      }),
    ])
    const cad = createHarness({ blocks: [circle, outer] })
    const ellipseCentres = (scaleX: number, scaleY: number) =>
      insertFlatGeometry(
        createInsert("OUT", p(0, 0), { scaleX, scaleY }),
        cad.runtime.document.blockLookup()
      )
        .flatMap((e) =>
          e.type === "ellipse" || e.type === "circle" ? [e.center] : []
        )
        .map((c) => [Math.round(c.x * 1e6) / 1e6, Math.round(c.y * 1e6) / 1e6])
        .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    expect(ellipseCentres(2, 3)).toEqual([
      [0, 0],
      [0, 30],
      [20, 0],
      [20, 30],
    ])
    expect(ellipseCentres(2, -3)).toEqual([
      [0, -30],
      [0, 0],
      [20, -30],
      [20, 0],
    ])
  })

  // m04, m05: `1 was minserted.`, after the count, and it stays.
  it("is refused by EXPLODE", () => {
    const cad = createHarness({ blocks: [b1()], entities: [minsert()] })
    const log = typed(cad, "EXPLODE", "L", "")
    expect(log).toContain("1 was minserted.")
    expect(minserts(cad)).toHaveLength(1)
  })

  // m07, m08: its columns, then its rows, each only when several.
  it("is listed with its columns and rows", () => {
    const cad = createHarness({ blocks: [b1()], entities: [minsert()] })
    const report = typed(cad, "LIST", "L", "").at(-1)!.split("\n")
    // At the drawing's precision, 2 here; the console's, 4.
    expect(report.slice(-4)).toEqual([
      "         # columns 3",
      "    column spacing     20.00",
      "            # rows 2",
      "       row spacing     10.00",
    ])
  })

  // desktop d03: `MInsert Block`, its Insertion point, and its grid in Misc,
  // each typed.
  it("shows its grid in the Properties palette", () => {
    const cad = createHarness({ blocks: [b1()], entities: [minsert()] })
    cad.select("M")
    const info = cad.state().properties.info!
    expect(info.title).toBe("MInsert Block")
    const rows = info.groups.flatMap((group) => group.rows)
    const label = (id: string) => rows.find((r) => r.id === id)
    expect(label("insertionPointX")?.value).toBe("10.00")
    expect(
      rows.map((r) => r.id).filter((id) => id.startsWith("minsert"))
    ).toEqual([
      "minsertColumns",
      "minsertColumnSpacing",
      "minsertRows",
      "minsertRowSpacing",
    ])
    cad.runtime.setSelectionProperty("minsertColumns", "5")
    cad.runtime.setSelectionProperty("minsertRowSpacing", "-3")
    expect(minserts(cad)[0].grid).toEqual({
      ...grid,
      columns: 5,
      rowSpacing: -3,
    })
    cad.runtime.setSelectionProperty("minsertColumns", "0")
    expect(minserts(cad)[0].grid?.columns).toBe(5)
    // m10: at one cell it is still a MINSERT, which EXPLODE refuses.
    cad.runtime.setSelectionProperty("minsertColumns", "1")
    cad.runtime.setSelectionProperty("minsertRows", "1")
    expect(minserts(cad)[0].grid).toMatchObject({ columns: 1, rows: 1 })
    expect(cad.state().properties.info!.title).toBe("MInsert Block")
    cad.escape()
    expect(typed(cad, "EXPLODE", "L", "")).toContain("1 was minserted.")
  })

  // d01: one grip, at its insertion point.
  it("has one grip, at its insertion point", () => {
    const cad = createHarness({ blocks: [b1()], entities: [minsert()] })
    cad.select("M").moveTo(p(500, 500))
    const grips = cad.scene().primitives.flatMap((prim) =>
      prim.kind === "rect" && prim.fill === THEME.grip
        ? [
            cad.toWorld({
              x: prim.min.x + prim.width / 2,
              y: prim.min.y + prim.height / 2,
            }),
          ]
        : []
    )
    expect(grips).toHaveLength(1)
    expect(grips[0]).toBeCloseToPoint(p(10, 10), 6)
  })
})
