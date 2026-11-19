import { describe, expect, it } from "vitest"
import type { TableEntity } from "../../domain/entities"
import { parseDxf } from "./readDxf"
import { writeDxf } from "./writeDxf"

// ACAD_TABLE as files other than AutoCAD 2027's own write it, and as they
// break: the groups of table/t00 and t09, written by hand.

/** One group per pair: `[code, value]`. */
type Group = readonly [number, string | number]

function file(entities: Group[][], objects: Group[][] = []): string {
  const groups: Group[] = [
    [0, "SECTION"],
    [2, "ENTITIES"],
    ...entities.flat(),
    [0, "ENDSEC"],
    [0, "SECTION"],
    [2, "OBJECTS"],
    ...objects.flat(),
    [0, "ENDSEC"],
    [0, "EOF"],
  ]
  return groups.map(([c, v]) => `${c}\n${v}`).join("\n")
}

/** A table of `rows` × `columns`, its cells' groups given (from 171), or empty ones. */
function table(
  rows: number,
  columns: number,
  cells: Group[] = [],
  extra: { head?: Group[]; overrides?: Group[]; style?: string } = {}
): Group[] {
  const empty: Group[] = []
  if (cells.length === 0) {
    for (let i = 0; i < rows * columns; i++) {
      empty.push([171, 1], [173, 0], [175, 1], [176, 1], [91, 0], [1, ""])
    }
  }
  return [
    [0, "ACAD_TABLE"],
    [5, "100"],
    [8, "0"],
    [100, "AcDbBlockReference"],
    [2, "*T1"],
    [10, 10],
    [20, 20],
    [30, 0],
    ...(extra.head ?? []),
    [100, "AcDbTable"],
    ...(extra.style ? ([[342, extra.style]] as Group[]) : []),
    [11, 1],
    [21, 0],
    [31, 0],
    [90, 22],
    [91, rows],
    [92, columns],
    ...(extra.overrides ?? [[93, 0]]),
    ...Array.from({ length: rows }, () => [141, 9] as Group),
    ...Array.from({ length: columns }, () => [142, 40] as Group),
    ...(cells.length > 0 ? cells : empty),
  ]
}

const tablesOf = (text: string): TableEntity[] =>
  parseDxf(text).drawing.entities.filter(
    (e): e is TableEntity => e.type === "table"
  )

describe("parseDxf: a table as others write it", () => {
  it("opens one with no style as AutoCAD's Standard", () => {
    const [t] = tablesOf(file([table(2, 2)]))
    expect(t.style.name).toBe("Standard")
    expect(t.style.title.textHeight).toBe(6)
    expect(t.cells).toHaveLength(4)
    expect(t.position).toEqual({ x: 10, y: 20 })
  })

  it("leaves out one whose size its rows and columns contradict", () => {
    const bad = table(2, 2).filter(([code]) => code !== 141)
    const parsed = parseDxf(file([bad, table(0, 2)]))
    expect(parsed.drawing.entities).toHaveLength(0)
    expect(parsed.report.unreadable).toBe(2)
  })

  it("fills the cells a file leaves out, and reads a 2000 file's text", () => {
    const [t] = tablesOf(
      file([
        table(1, 3, [
          [171, 1],
          [173, 0],
          [175, 1],
          [176, 1],
          [177, 0],
          [2, "a".repeat(250)],
          [1, "b"],
        ]),
      ])
    )
    expect(t.cells).toHaveLength(3)
    expect(t.cells[0].text).toBe(`${"a".repeat(250)}b`)
    expect(t.cells[1]).toEqual({})
  })

  it("reads a cell's value up to its end, not what follows the table", () => {
    const [t] = tablesOf(
      file([
        [
          ...table(1, 1, [
            [171, 1],
            [91, 0],
            [92, 0],
            [301, "CELL_VALUE"],
            [93, 7],
            [90, 0],
            [304, "ACVALUE_END"],
            [1, "after"],
          ]),
        ],
      ])
    )
    expect(t.cells[0].text).toBeUndefined()
  })

  it("reads a cell's overrides and a block cell whose block is missing", () => {
    const [t] = tablesOf(
      file([
        table(1, 2, [
          [171, 1],
          [91, 0x40031],
          [145, 0.5],
          [170, 9],
          [7, "Standard"],
          [140, 2.5],
          [92, 0],
          [301, "CELL_VALUE"],
          [1, "x"],
          [304, "ACVALUE_END"],
          [171, 2],
          [174, 1],
          [91, 0],
          [340, "FFFF"],
          [144, 2],
          [92, 0],
          [301, "CELL_VALUE"],
          [304, "ACVALUE_END"],
        ]),
      ])
    )
    expect(t.cells[0]).toMatchObject({
      text: "x",
      alignment: "br",
      textHeight: 2.5,
      rotation: 0.5,
      flags: 0x40000,
    })
    expect(t.cells[1]).toEqual({})
  })

  it("reads its overrides only when all three heights are set", () => {
    const own = (flags: number): Group[] => [
      [93, flags],
      [40, 3],
      [41, 2],
      [140, 9],
      [140, 12],
      [140, 9],
    ]
    const [all] = tablesOf(file([table(1, 1, [], { overrides: own(7340056) })]))
    expect(all.overrides).toEqual({
      horizontalMargin: 3,
      verticalMargin: 2,
      textHeights: { data: 9, title: 12, header: 9 },
    })
    const [margins] = tablesOf(
      file([table(1, 1, [], { overrides: own(0x18) })])
    )
    expect(margins.overrides).toEqual({
      horizontalMargin: 3,
      verticalMargin: 2,
    })
  })

  it("reads its TABLESTYLE by its name, flowing up, title and header off", () => {
    const style: Group[] = [
      [0, "TABLESTYLE"],
      [5, "70"],
      [100, "AcDbTableStyle"],
      [3, "Described"],
      [70, 1],
      [71, 0],
      [40, 2],
      [41, 1],
      [280, 1],
      [281, 1],
      [7, "Standard"],
      [140, 3],
      [170, 4],
      [7, "Standard"],
      [140, 5],
      [170, 0],
      [7, ""],
      [170, 8],
    ]
    const dictionary: Group[] = [
      [0, "DICTIONARY"],
      [5, "C"],
      [3, "ACAD_TABLESTYLE"],
      [350, "6F"],
      [0, "DICTIONARY"],
      [5, "6F"],
      [3, "Parts"],
      [350, "70"],
    ]
    const [t] = tablesOf(
      file([table(1, 1, [], { style: "70" })], [dictionary, style])
    )
    expect(t.style).toMatchObject({
      name: "Parts",
      horizontalMargin: 2,
      verticalMargin: 1,
      flowsUp: true,
      titleSuppressed: true,
      headerSuppressed: true,
      data: { textHeight: 3, alignment: "ml" },
      title: { textHeight: 5, alignment: "mc" },
      header: { textHeight: 4.5, alignment: "bc" },
    })
    // Without the dictionary, by its description.
    const [described] = tablesOf(
      file([table(1, 1, [], { style: "70" })], [style])
    )
    expect(described.style.name).toBe("Described")
  })

  it("draws a table flowing up from its corner, titled at the bottom", () => {
    const [t] = tablesOf(
      file([
        table(2, 1, [
          [171, 1],
          [91, 0],
          [1, "T"],
          [171, 1],
          [91, 0],
          [1, "d"],
        ]),
      ])
    )
    const up = { ...t, style: { ...t.style, flowsUp: true as const } }
    const back = parseDxf(
      writeDxf(
        { ...parseDxf(file([])).drawing, entities: [up] },
        { version: "2018", binary: false, precision: 16 }
      ).bytes
    ).drawing.entities[0] as TableEntity
    expect(back.style.flowsUp).toBe(true)
  })
})

describe("writeDxf: tables", () => {
  const base = parseDxf(file([table(1, 2)])).drawing
  const [made] = base.entities as TableEntity[]

  it("keeps a tilted table where it was", () => {
    const tilted: TableEntity = {
      ...made,
      position: { x: 10, y: 20 },
      elevation: 5,
      normal: { x: 1, y: 0, z: 0 },
    }
    for (const version of ["2000", "2018"] as const) {
      const [back] = parseDxf(
        writeDxf(
          { ...base, entities: [tilted] },
          { version, binary: false, precision: 16 }
        ).bytes
      ).drawing.entities as TableEntity[]
      expect(back.position.x).toBeCloseTo(10, 9)
      expect(back.position.y).toBeCloseTo(20, 9)
      expect(back.elevation).toBeCloseTo(5, 9)
      expect(back.direction.x).toBeCloseTo(made.direction.x, 9)
    }
  })

  it("keeps two styles of one name apart, the second numbered", () => {
    const other: TableEntity = {
      ...made,
      id: "t2",
      style: { ...made.style, horizontalMargin: 0.06 },
    }
    const back = parseDxf(
      writeDxf(
        { ...base, entities: [made, other] },
        { version: "2018", binary: false, precision: 16 }
      ).bytes
    ).drawing.entities as TableEntity[]
    expect(back.map((t) => t.style.name)).toEqual(["Standard", "Standard2"])
    expect(back[1].style.horizontalMargin).toBe(0.06)
  })

  it("writes a long text in a 2000 file in chunks, and a cell's overrides", () => {
    const long: TableEntity = {
      ...made,
      cells: [
        {
          text: "x".repeat(600),
          alignment: "mr",
          textStyleId: made.style.data.textStyleId,
          textHeight: 3,
        },
        {},
      ],
    }
    for (const version of ["2000", "2018"] as const) {
      const [back] = parseDxf(
        writeDxf(
          { ...base, entities: [long] },
          { version, binary: false, precision: 16 }
        ).bytes
      ).drawing.entities as TableEntity[]
      expect(back.cells[0]).toEqual(long.cells[0])
    }
  })
})
